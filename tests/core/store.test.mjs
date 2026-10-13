import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {canonicalJson,canonicalQuaternion,inputDigest} from '../../dist/core/canonical.js';
import {ProjectRevision,revisionInput,Transform,ResourceRecord} from '../../dist/core/schemas.js';
import {ProjectStore} from '../../dist/core/project-store.js';
import {WorkspaceLease} from '../../dist/host/workspace-lease.js';
const key=p=>p+'_'+randomUUID();
function fixture(){
  const workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-core-'));
  const lease=new WorkspaceLease(workspace),store=new ProjectStore(lease);
  const projectId=key('prj'),revisionId=key('rev'),sourceId=key('src');
  const blobHash=store.putBlob(Buffer.from('synthetic fixture; not a game asset'));
  const identity={schemaVersion:'1.0',projectId,displayName:'测试工程',createdAt:new Date().toISOString(),initialSourceIds:[sourceId]};
  const source={schemaVersion:'1.0',sourceId,projectId,localPath:path.join(workspace,'sample.gil'),format:'gil',blobHash,registeredAt:new Date().toISOString(),purpose:'reference',provenance:{origin:'synthetic-binary',licenseNote:'test-only',gameBuild:null,gameBuildSource:'unknown'}};
  const revision={schemaVersion:'1.0',projectId,revisionId,parentRevisionId:null,transactionId:key('txn'),createdAt:new Date().toISOString(),targetProfile:{gameBuild:null,editorBuild:null,mode:null,locale:null,coordinateProfile:null,gameBuildSource:'unknown'},contents:[],objects:[],resourceRefs:[],inputDigestVersion:'1',inputManifestHash:''};
  revision.inputManifestHash=inputDigest(revisionInput(revision));
  return {workspace,lease,store,identity,revision,source,close(){lease.close();}};
}
function populated(f){
  const r=structuredClone(f.revision),contentId=key('cnt'),objectId=key('obj');
  const lock=f.store.putBlob(Buffer.from('{"backend":"test-only"}'));
  r.resourceRefs=[{resourceRef:'res_fixture',namespace:'test-only',gameId:'9007199254740993',name:'Synthetic model',resourceType:'platform',entityClass:'test',targetProfile:r.targetProfile,source:{sourceId:f.source.sourceId,artifactHash:f.source.blobHash},collisionEvidenceRefs:[],supportedComponents:[],verifiedEvidenceRefs:[]}];
  r.objects=[{objectId,contentId,roleKey:'start',objectKind:'platform',templateRef:'res_fixture',componentRefs:[],ownership:'generated',provenance:{sourceId:f.source.sourceId,artifactHash:f.source.blobHash,notes:'synthetic test only'}}];
  r.contents=[{schemaVersion:'1.0',contentId,displayName:'Example',kind:'test-only',authoringMode:'recipe',recipe:{id:'test-only',version:'1'},parameters:{},backend:{adapterId:'test-only',versionLockRef:lock},managedObjectIds:[objectId],lockedFields:[],sourceRefs:[],dependencies:[],requiredCapabilities:[],externalBindings:[],ownership:{mode:'generated',originRevisionId:r.revisionId}}];
  r.inputManifestHash=inputDigest(revisionInput(r));return r;
}

test('canonical JSON rejects lossy values and produces stable object hashes',()=>{
  assert.equal(inputDigest({b:2,a:1}),inputDigest({a:1,b:2}));
  assert.notEqual(inputDigest([1,2]),inputDigest([2,1]));
  for(const v of [undefined,NaN,Infinity,1n,new Date(),{a:undefined},Array(2)])assert.throws(()=>canonicalJson(v));
  const cycle={};cycle.self=cycle;assert.throws(()=>canonicalJson(cycle));
  assert.equal(canonicalJson(JSON.parse('{"__proto__":{"a":1}}')),'{"__proto__":{"a":1}}');
  assert.deepEqual(canonicalQuaternion([0,0,0,-2]),[0,0,0,1]);
  assert.throws(()=>Transform.parse({position:[0,0,0],rotationQuaternion:[0,0,0,-1],scale:[1,1,1]}));
});

test('project persists exact immutable source bytes across store reopen',()=>{
  const f=fixture();
  try{
    f.store.createProject(f.identity,f.revision,[f.source]);
    const before=fs.readFileSync(path.join(f.workspace,'v1','objects',f.source.blobHash));
    const loaded=f.store.readProject(f.identity.projectId);
    loaded.revision.targetProfile.mode='mutated in caller';
    assert.equal(f.store.readProject(f.identity.projectId).revision.targetProfile.mode,null);
    assert.throws(()=>f.store.createProject(f.identity,f.revision,[f.source]),e=>e.code==='PROJECT_EXISTS');
    f.close();const nextLease=new WorkspaceLease(f.workspace);
    try{const next=new ProjectStore(nextLease);assert.deepEqual(next.readBlob(f.source.blobHash),before);assert.deepEqual(next.readProject(f.identity.projectId).revision,f.revision);}finally{nextLease.close();}
  }finally{f.close();}
});

test('blob tampering and unsafe stored CURRENT fail closed',()=>{
  const f=fixture();try{
    f.store.createProject(f.identity,f.revision,[f.source]);
    fs.writeFileSync(path.join(f.workspace,'v1','objects',f.source.blobHash),'corrupt');
    assert.throws(()=>f.store.readProject(f.identity.projectId),e=>e.code==='ARTIFACT_CHANGED');
    assert.throws(()=>f.store.putBlob(Buffer.from('synthetic fixture; not a game asset')),e=>e.code==='ARTIFACT_CHANGED');
    fs.writeFileSync(path.join(f.workspace,'v1','projects',f.identity.projectId,'CURRENT'),'../../escape');
    assert.throws(()=>f.store.readProject(f.identity.projectId));
  }finally{f.close();}
});

test('missing object/resource references and untracked schema fields are rejected',()=>{
  const f=fixture();try{
    assert.throws(()=>ProjectRevision.parse({...f.revision,unexpected:true}));
    const r=structuredClone(f.revision);
    r.objects=[{objectId:key('obj'),contentId:key('cnt'),roleKey:'start',objectKind:'platform',templateRef:'invented',componentRefs:[],ownership:'generated',provenance:{sourceId:f.source.sourceId,artifactHash:f.source.blobHash,notes:'test'}}];
    r.inputManifestHash=inputDigest(revisionInput(r));
    assert.throws(()=>f.store.createProject(f.identity,r,[f.source]));
    assert.throws(()=>ResourceRecord.parse({gameId:9007199254740993}));
    assert.throws(()=>f.store.createProject(f.identity,f.revision,[]));
    assert.equal(fs.existsSync(path.join(f.workspace,'v1','projects',f.identity.projectId)),false);
  }finally{f.close();}
});

test('separate process cannot take active workspace lease',()=>{
  const f=fixture();try{
    const module=pathToFileURL(path.resolve('dist/host/workspace-lease.js')).href;
    const child=spawnSync(process.execPath,['--input-type=module','-e',`import {WorkspaceLease} from ${JSON.stringify(module)};try {new WorkspaceLease(process.argv[1]);process.exit(2)}catch(e){if(e.code!=='WORKSPACE_IN_USE')throw e}`,f.workspace],{encoding:'utf8',windowsHide:true});
    assert.equal(child.status,0,child.stderr);f.lease.assertOwned();
  }finally{f.close();}
});

test('populated content preserves large game IDs and validates source provenance',()=>{
  const f=fixture();try{
    const r=populated(f);f.store.createProject(f.identity,r,[f.source]);
    assert.equal(f.store.readProject(f.identity.projectId).revision.resourceRefs[0].gameId,'9007199254740993');
    const invalid=populated(f);invalid.resourceRefs[0].source.artifactHash='0'.repeat(64);invalid.inputManifestHash=inputDigest(revisionInput(invalid));
    assert.throws(()=>f.store.createProject(f.identity,invalid,[f.source]),e=>e.code==='DEPENDENCY_UNRESOLVED');
  }finally{f.close();}
});

test('containment cycles are rejected while explicit reference cycles remain representable',()=>{
  const f=fixture();try{
    const r=populated(f),c=r.contents[0],o=r.objects[0];
    c.dependencies=[{fromId:c.contentId,toId:o.objectId,relation:'contains',required:true,scope:'test',resolution:'resolved'},{fromId:o.objectId,toId:c.contentId,relation:'contains',required:true,scope:'test',resolution:'resolved'}];
    r.inputManifestHash=inputDigest(revisionInput(r));assert.throws(()=>ProjectRevision.parse(r));
    c.dependencies.forEach(e=>e.relation='references');r.inputManifestHash=inputDigest(revisionInput(r));ProjectRevision.parse(r);
    c.dependencies[0].toId='not-registered';r.inputManifestHash=inputDigest(revisionInput(r));assert.throws(()=>ProjectRevision.parse(r));
  }finally{f.close();}
});

test('managed junction cannot redirect writes outside workspace',()=>{
  const f=fixture();try{
    const external=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-outside-'));
    const linked=path.join(f.workspace,'v1','objects');fs.renameSync(linked,linked+'-original');
    fs.symlinkSync(external,linked,process.platform==='win32'?'junction':'dir');
    assert.throws(()=>f.store.putBlob(Buffer.from('must not escape')),e=>e.code==='PATH_OUTSIDE_PROJECT');
    assert.equal(fs.readdirSync(external).length,0);
  }finally{f.close();}
});
