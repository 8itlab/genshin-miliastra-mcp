import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { WorkspaceLease } from '../host/workspace-lease.js';
import { CoreError } from './errors.js';
import { canonicalJson, sha256 } from './canonical.js';
import { Hash, id, ProjectIdentity, ProjectRevision, SourceRegistration } from './schemas.js';

type Identity=z.infer<typeof ProjectIdentity>;
type Source=z.infer<typeof SourceRegistration>;

// Internal storage primitives only: not an MCP command service or a revision editor.
// W-09 must add journal/idempotency before exposing mutable project commands.
export class ProjectStore {
  readonly root: string;
  constructor(private readonly lease: WorkspaceLease) {
    lease.assertOwned();this.root=path.join(lease.workspace,'v1');
    for(const directory of ['objects','projects','staging'])fs.mkdirSync(this.checked(directory),{recursive:true});
  }

  checked(...parts: string[]): string {
    this.lease.assertOwned();
    let current=this.root;
    for(const part of ['',...parts]) {
      if(part && (part==='.' || part==='..' || /[\\/:]/.test(part)))throw new CoreError('PATH_OUTSIDE_PROJECT','Expected a single path component');
      current=path.join(current,part);
      try {if(fs.lstatSync(current).isSymbolicLink())throw new CoreError('PATH_OUTSIDE_PROJECT','Managed storage cannot contain links');}
      catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
    }
    return current;
  }

  writeNew(file: string, bytes: Uint8Array|string): void {
    const fd=fs.openSync(file,'wx',0o600);
    try {fs.writeFileSync(fd,bytes);fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
  }

  putBlob(bytes: Uint8Array): string {
    // Copy caller memory before hashing/writing so later mutation cannot change a blob.
    const frozen=Buffer.from(bytes),hash=sha256(frozen),file=this.checked('objects',hash);
    try {this.writeNew(file,frozen);}
    catch(error){if((error as NodeJS.ErrnoException).code!=='EEXIST')throw error;this.readBlob(hash);}
    return hash;
  }

  readBlob(hash: string): Buffer {
    Hash.parse(hash);const bytes=fs.readFileSync(this.checked('objects',hash));
    if(sha256(bytes)!==hash)throw new CoreError('ARTIFACT_CHANGED','Immutable blob digest mismatch',{hash});
    return bytes;
  }

  validateReferences(revision: ProjectRevision,sources: Source[]): void {
    const sourceMap=new Map(sources.map(s=>[s.sourceId,s]));
    const requireSource=(sourceId:string,hash:string)=>{
      const source=sourceMap.get(sourceId);
      if(!source || source.blobHash!==hash)throw new CoreError('DEPENDENCY_UNRESOLVED','Source provenance does not match registered bytes',{sourceId});
    };
    for(const s of sources)this.readBlob(s.blobHash);
    for(const c of revision.contents){this.readBlob(c.backend.versionLockRef);for(const hash of c.sourceRefs)this.readBlob(hash);}
    for(const o of revision.objects){
      requireSource(o.provenance.sourceId,o.provenance.artifactHash);
      for(const hash of o.componentRefs)this.readBlob(hash);
      if(o.sourceRef)this.readBlob(o.sourceRef);
    }
    for(const r of revision.resourceRefs)requireSource(r.source.sourceId,r.source.artifactHash);
    if(revision.bindingMapRef)this.readBlob(revision.bindingMapRef);
  }

  createProject(identityInput: unknown, revisionInput: unknown, sourcesInput: unknown[], receipt?: unknown): {identity:Identity,revision:ProjectRevision,sources:Source[]} {
    const identity=ProjectIdentity.parse(identityInput),revision=ProjectRevision.parse(revisionInput),sources=sourcesInput.map(s=>SourceRegistration.parse(s));
    if(identity.projectId!==revision.projectId || revision.parentRevisionId!==null)throw new CoreError('INVALID_ARGUMENT','Initial revision must belong to this new project and have no parent');
    if(sources.some(s=>s.projectId!==identity.projectId) || new Set(sources.map(s=>s.sourceId)).size!==sources.length || new Set(identity.initialSourceIds).size!==identity.initialSourceIds.length || identity.initialSourceIds.length!==sources.length || identity.initialSourceIds.some(s=>!sources.some(v=>v.sourceId===s)))throw new CoreError('DEPENDENCY_UNRESOLVED','Initial source registrations do not match project identity');
    this.validateReferences(revision,sources);
    const target=this.checked('projects',identity.projectId);
    if(fs.existsSync(target))throw new CoreError('PROJECT_EXISTS','Project identity already registered');
    const staging=this.checked('staging',randomUUID());fs.mkdirSync(staging);
    // A crash leaves an unpublished staging directory; no partial project is visible.
    fs.mkdirSync(path.join(staging,'sources'));
    fs.mkdirSync(path.join(staging,'revisions',revision.revisionId),{recursive:true});
    this.writeNew(path.join(staging,'PROJECT.json'),canonicalJson(identity));
    if(receipt)this.writeNew(path.join(staging,'open-receipt.json'),canonicalJson(receipt));
    for(const s of sources)this.writeNew(path.join(staging,'sources',s.sourceId+'.json'),canonicalJson(s));
    this.writeNew(path.join(staging,'revisions',revision.revisionId,'manifest.json'),canonicalJson(revision));
    this.writeNew(path.join(staging,'CURRENT'),revision.revisionId+'\n');
    this.lease.assertOwned();fs.renameSync(staging,target);
    return this.readProject(identity.projectId);
  }

  listProjects(): string[] {
    return fs.readdirSync(this.checked('projects')).filter(name=>id('prj').safeParse(name).success);
  }

  writeRecord(parts:string[],value:unknown):void {
    const file=this.checked(...parts);
    fs.mkdirSync(path.dirname(file),{recursive:true});
    this.writeNew(file,canonicalJson(value));
  }

  readRecord(parts:string[]):unknown { return JSON.parse(fs.readFileSync(this.checked(...parts),'utf8')); }

  hasRecord(parts:string[]):boolean { return fs.existsSync(this.checked(...parts)); }

  replaceRecord(parts:string[],value:unknown,raw=false):void {
    const file=this.checked(...parts),temp=this.checked(...parts.slice(0,-1),parts.at(-1)+'.'+randomUUID()+'.tmp');
    fs.mkdirSync(path.dirname(file),{recursive:true});
    this.writeNew(temp,raw?String(value):canonicalJson(value));
    this.lease.assertOwned();fs.renameSync(temp,file);
  }

  stageRevision(revisionInput:unknown):ProjectRevision {
    const r=ProjectRevision.parse(revisionInput),{sources}=this.readProject(r.projectId);
    this.validateReferences(r,sources);
    this.writeRecord(['projects',r.projectId,'revisions',r.revisionId,'manifest.json'],r);
    return r;
  }

  switchRevision(projectId:string,expectedRevision:string,revisionId:string):void {
    const current=this.readProject(projectId).revision;
    if(current.revisionId!==expectedRevision)throw new CoreError('PROJECT_REVISION_CHANGED','Project has changed');
    const target=this.readProject(projectId,revisionId).revision;
    if(target.parentRevisionId!==expectedRevision)throw new CoreError('RECOVERY_REQUIRED','Invalid revision parent');
    this.replaceRecord(['projects',projectId,'CURRENT'],revisionId+'\n',true);
  }

  readProject(projectId: string, revisionId?: string): {identity:Identity,revision:ProjectRevision,sources:Source[]} {
    id('prj').parse(projectId);
    const identity=ProjectIdentity.parse(JSON.parse(fs.readFileSync(this.checked('projects',projectId,'PROJECT.json'),'utf8')));
    if(identity.projectId!==projectId)throw new CoreError('ARTIFACT_CHANGED','Project identity mismatch');
    const selected=revisionId??fs.readFileSync(this.checked('projects',projectId,'CURRENT'),'utf8').trim();id('rev').parse(selected);
    const revision=ProjectRevision.parse(JSON.parse(fs.readFileSync(this.checked('projects',projectId,'revisions',selected,'manifest.json'),'utf8')));
    if(revision.projectId!==projectId || revision.revisionId!==selected)throw new CoreError('ARTIFACT_CHANGED','Revision identity mismatch');
    const sourceDir=this.checked('projects',projectId,'sources');
    const sources=fs.readdirSync(sourceDir).sort().map(name=>{
      if(!name.endsWith('.json'))throw new CoreError('ARTIFACT_CHANGED','Unexpected source record');
      id('src').parse(name.slice(0,-5));
      const source=SourceRegistration.parse(JSON.parse(fs.readFileSync(this.checked('projects',projectId,'sources',name),'utf8')));
      if(source.projectId!==projectId || name!==source.sourceId+'.json')throw new CoreError('ARTIFACT_CHANGED','Source identity mismatch');
      return source;
    });
    if(identity.initialSourceIds.some(s=>!sources.some(v=>v.sourceId===s)))throw new CoreError('ARTIFACT_CHANGED','Initial source registration missing');
    this.validateReferences(revision,sources);
    return {identity,revision,sources};
  }
}
