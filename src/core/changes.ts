import {z} from 'zod';
import {createHash,randomUUID} from 'node:crypto';
import {ProjectStore} from './project-store.js';
import {Transactions,nextRevision,sealRevision} from './transactions.js';
import {CoreError} from './errors.js';
import {canonicalJson,inputDigest} from './canonical.js';
import {id,Hash,Transform,JsonValue,ProjectRevision,Content,Binding} from './schemas.js';
const objectId=id('obj'),contentId=id('cnt');
const Fields=z.enum(['transform','templateRef','componentRefs','sourceRef']);
export const Operation=z.discriminatedUnion('type',[
 z.object({type:z.literal('create_source_graph'),graphId:z.number().int().positive().max(0xffffffff),graphKind:z.enum(['server','client']),code:z.string().min(1).max(200000),displayName:z.string().min(1).max(200)}).strict(),
 z.object({type:z.literal('restore_revision'),revisionId:id('rev')}).strict(),
 z.object({type:z.literal('set_transform'),objectId,transform:Transform}).strict(),
 z.object({type:z.literal('lock_fields'),objectId,paths:z.array(Fields).min(1)}).strict(),
 z.object({type:z.literal('unlock_fields'),objectId,paths:z.array(Fields).min(1)}).strict(),
 z.object({type:z.literal('detach_from_recipe'),contentId,sourceRefs:z.array(Hash).min(1)}).strict(),
 z.object({type:z.literal('set_source'),contentId,sourceRefs:z.array(Hash).min(1)}).strict(),
 z.object({type:z.literal('set_source_text'),contentId,code:z.string().min(1).max(200000)}).strict(),
 z.object({type:z.literal('set_content_dependencies'),contentId,requiredContentIds:z.array(contentId).max(200)}).strict(),
 z.object({type:z.literal('set_parameters'),contentId,parameters:z.record(JsonValue)}).strict(),
 z.object({type:z.literal('remove_managed_content'),contentId}).strict(),
 z.object({type:z.literal('set_binding'),contentId,binding:Binding}).strict(),
 z.object({type:z.literal('create_from_recipe'),recipeId:z.string().min(1),parameters:z.record(JsonValue),displayName:z.string().min(1).max(4096)}).strict()
]);
export const Scope=z.object({contentIds:z.array(contentId),objectIds:z.array(objectId),allowCreate:z.boolean().default(false)}).strict();
export const PlanInput=z.object({projectId:id('prj'),expectedRevision:id('rev'),scope:Scope,operations:z.array(Operation).min(1).max(200),intent:z.string().max(4096).optional(),mutationId:z.string().uuid()}).strict();
export const ApplyInput=z.object({projectId:id('prj'),changeId:id('chg'),expectedRevision:id('rev'),mutationId:z.string().uuid()}).strict();
type Generator=(recipeId:string,parameters:Record<string,any>,displayName:string,revision:ProjectRevision,existing?:z.infer<typeof Content>)=>void;
type TransformEditor=(revision:ProjectRevision,objectId:string,transform:z.infer<typeof Transform>)=>void;
const Plan=z.object({schemaVersion:z.literal('1.0'),changeId:id('chg'),projectId:id('prj'),baseRevision:id('rev'),createdAt:z.string().datetime(),expiresAt:z.string().datetime(),requestDigest:Hash,planDigest:Hash,request:PlanInput,target:ProjectRevision,diff:JsonValue}).strict();
export function deterministicId(prefix:string,value:unknown):string {
 const hex=createHash('sha256').update(canonicalJson(value)).digest('hex');return prefix+'_'+hex.slice(0,8)+'-'+hex.slice(8,12)+'-4'+hex.slice(13,16)+'-8'+hex.slice(17,20)+'-'+hex.slice(20,32);
}
export class ChangeService {
 constructor(readonly store:ProjectStore,readonly transactions:Transactions,private readonly generate?:Generator,private readonly editTransform?:TransformEditor){}
 plan(raw:unknown){
  const input=PlanInput.parse(raw),changeId=deterministicId('chg',{projectId:input.projectId,command:'plan_change',mutationId:input.mutationId});
  const parts=['projects',input.projectId,'plans',changeId+'.json'];
  if(this.store.hasRecord(parts)){const old=this.readPlan(parts);if(old.requestDigest!==inputDigest(input))throw new CoreError('IDEMPOTENCY_KEY_REUSED','Plan key reused');return this.publicPlan(old);}
  const base=this.store.readProject(input.projectId).revision;
  if(base.revisionId!==input.expectedRevision)throw new CoreError('PROJECT_REVISION_CHANGED','Fetch the current revision before planning');
  const target=nextRevision(base);
  const content=(cid:string)=>{if(!input.scope.contentIds.includes(cid))throw new CoreError('SCOPE_VIOLATION','Content outside plan scope');const c=target.contents.find(c=>c.contentId===cid);if(!c)throw new CoreError('INVALID_ARGUMENT','Unknown content');return c;};
  const object=(oid:string)=>{const o=target.objects.find(o=>o.objectId===oid);if(!o||o.ownership==='external'||(!input.scope.objectIds.includes(oid)&&!input.scope.contentIds.includes(o.contentId)))throw new CoreError('SCOPE_VIOLATION','Object outside owned scope');return o;};
  const unlocked=(oid:string,field?:string)=>{const o=target.objects.find(o=>o.objectId===oid),c=target.contents.find(c=>c.contentId===o?.contentId);if(c?.lockedFields.some(l=>l.objectId===oid&&(!field||l.paths.includes(field))))throw new CoreError('LOCKED_CONTENT','Unlock the field explicitly in this plan first',{objectId:oid,field:field??null});};
  for(const op of input.operations){
   switch(op.type){
    case 'restore_revision': {
      const previous=this.store.readProject(input.projectId,op.revisionId).revision;
      for(const c of target.contents){content(c.contentId);for(const oid of c.managedObjectIds)unlocked(oid);}
      for(const c of previous.contents)if(!input.scope.contentIds.includes(c.contentId))throw new CoreError('SCOPE_VIOLATION','Restore content outside scope');
      if(target.objects.some(o=>o.ownership==='external')||previous.objects.some(o=>o.ownership==='external'))throw new CoreError('EXTERNAL_EDIT_CONFLICT','Whole-revision restoration cannot change external objects');
      target.contents=structuredClone(previous.contents);target.objects=structuredClone(previous.objects);target.resourceRefs=structuredClone(previous.resourceRefs);target.targetProfile=structuredClone(previous.targetProfile);
      if(previous.bindingMapRef)target.bindingMapRef=previous.bindingMapRef;else delete target.bindingMapRef;
      break;
    }
    case 'set_transform': {const o=object(op.objectId);unlocked(o.objectId,'transform');if(!target.targetProfile.coordinateProfile)throw new CoreError('TARGET_PROFILE_UNKNOWN','Coordinate profile has not been registered');if(this.editTransform)this.editTransform(target,o.objectId,op.transform);else o.transform=op.transform;break;}
    case 'lock_fields':case 'unlock_fields': {const o=object(op.objectId),c=target.contents.find(c=>c.contentId===o.contentId)!;const old=c.lockedFields.find(l=>l.objectId===o.objectId);const paths=new Set(old?.paths??[]);for(const p of op.paths)op.type==='lock_fields'?paths.add(p):paths.delete(p);c.lockedFields=c.lockedFields.filter(l=>l.objectId!==o.objectId);if(paths.size)c.lockedFields.push({objectId:o.objectId,paths:[...paths].sort()});break;}
    case 'detach_from_recipe':case 'set_source': {const c=content(op.contentId);if(['observed-platform','challenge-kit'].includes(c.backend.adapterId))throw new CoreError('CAPABILITY_UNSUPPORTED','Scene backends require a recipe; create a separate custom graph instead');for(const oid of c.managedObjectIds)unlocked(oid,'sourceRef');if(op.type==='set_source'&&c.authoringMode!=='custom-source')throw new CoreError('AUTHORING_MODE_CONFLICT','Detach from recipe before replacing source');for(const hash of op.sourceRefs)this.store.readBlob(hash);c.authoringMode='custom-source';c.recipe=null;c.sourceRefs=op.sourceRefs;for(const o of target.objects.filter(o=>o.contentId===c.contentId&&['server-node-graph','client-node-graph'].includes(o.objectKind)))o.sourceRef=c.sourceRefs[0];break;}
    case 'set_source_text': {const c=content(op.contentId);if(c.authoringMode!=='custom-source')throw new CoreError('AUTHORING_MODE_CONFLICT','Detach from recipe before editing source');for(const oid of c.managedObjectIds)unlocked(oid,'sourceRef');c.sourceRefs=[this.store.putBlob(Buffer.from(op.code,'utf8'))];for(const o of target.objects.filter(o=>o.contentId===c.contentId&&['server-node-graph','client-node-graph'].includes(o.objectKind)))o.sourceRef=c.sourceRefs[0];break;}
    case 'set_content_dependencies': {
      const c=content(op.contentId);
      if(c.authoringMode!=='custom-source'||c.backend.adapterId!=='gsts')throw new CoreError('AUTHORING_MODE_CONFLICT','Explicit content dependencies currently require a custom source graph');
      for(const oid of c.managedObjectIds)unlocked(oid,'sourceRef');
      if(new Set(op.requiredContentIds).size!==op.requiredContentIds.length||op.requiredContentIds.includes(c.contentId))throw new CoreError('INVALID_ARGUMENT','Dependencies must be unique other content IDs');
      for(const cid of op.requiredContentIds){const dependency=target.contents.find(v=>v.contentId===cid);if(!dependency)throw new CoreError('DEPENDENCY_UNRESOLVED','Required content is missing',{requiredContentId:cid});if(dependency.backend.adapterId!=='gsts')throw new CoreError('CAPABILITY_UNSUPPORTED','Graph dependencies currently require standalone graph content');}
      c.dependencies=c.dependencies.filter(d=>d.scope!=='managed-content-selection');
      for(const cid of [...op.requiredContentIds].sort())c.dependencies.push({fromId:c.contentId,toId:cid,relation:'references',required:true,scope:'managed-content-selection',resolution:'resolved'});
      break;
    }
    case 'set_parameters': {const c=content(op.contentId);if(c.authoringMode!=='recipe'||!c.recipe)throw new CoreError('AUTHORING_MODE_CONFLICT','Custom source does not accept recipe parameters');for(const oid of c.managedObjectIds)unlocked(oid);if(!this.generate)throw new CoreError('CAPABILITY_UNSUPPORTED','No recipe generator installed');this.generate(c.recipe.id,op.parameters,c.displayName,target,c);break;}
    case 'create_source_graph': {if(!input.scope.allowCreate)throw new CoreError('SCOPE_VIOLATION','Creation not in scope');if(!this.generate)throw new CoreError('CAPABILITY_UNSUPPORTED','No graph authoring backend installed');this.generate('__source_graph__',{graphId:op.graphId,graphKind:op.graphKind,code:op.code},op.displayName,target);break;}
    case 'create_from_recipe': {if(!input.scope.allowCreate)throw new CoreError('SCOPE_VIOLATION','Creation not in scope');if(!this.generate)throw new CoreError('CAPABILITY_UNSUPPORTED','No recipe generator installed');this.generate(op.recipeId,op.parameters,op.displayName,target);break;}
    case 'remove_managed_content': {const c=content(op.contentId);for(const oid of c.managedObjectIds)unlocked(oid);if(target.objects.some(o=>o.contentId===c.contentId&&o.ownership==='external'))throw new CoreError('EXTERNAL_EDIT_CONFLICT','External objects must not be deleted with content');target.objects=target.objects.filter(o=>!c.managedObjectIds.includes(o.objectId));target.contents=target.contents.filter(v=>v.contentId!==c.contentId);break;}
    case 'set_binding': {const c=content(op.contentId);if(!c.managedObjectIds.includes(op.binding.internalObjectId))throw new CoreError('SCOPE_VIOLATION','Binding outside owned content');if(op.binding.status==='confirmed')throw new CoreError('MAPPING_UNRESOLVED','Confirmed mappings require an import observation reconciler');c.externalBindings=c.externalBindings.filter(b=>b.internalObjectId!==op.binding.internalObjectId||b.namespace!==op.binding.namespace);c.externalBindings.push(op.binding);break;}
   }
  }
  for(const c of target.contents)for(const d of c.dependencies)if(d.scope==='managed-content-selection'&&!target.contents.some(v=>v.contentId===d.toId))throw new CoreError('DEPENDENCY_UNRESOLVED','Remove the dependent reference before deleting required content',{contentId:c.contentId,requiredContentId:d.toId});
  sealRevision(target);this.store.validateReferences(target,this.store.readProject(input.projectId).sources);
  if(target.contents.some(c=>c.dependencies.some(d=>d.required&&d.resolution!=='resolved')))throw new CoreError('DEPENDENCY_UNRESOLVED','Required dependencies are unresolved');
  const compare=(before:any[],after:any[],key:string)=>({added:after.filter(a=>!before.some(b=>b[key]===a[key])),removed:before.filter(b=>!after.some(a=>a[key]===b[key])),updated:after.flatMap(a=>{const b=before.find(b=>b[key]===a[key]);return b&&canonicalJson(a)!==canonicalJson(b)?[{id:a[key],before:b,after:a}]:[];})});
  const createdAt=new Date().toISOString();
  const draft={schemaVersion:'1.0' as const,changeId,projectId:input.projectId,baseRevision:base.revisionId,createdAt,expiresAt:new Date(Date.now()+15*60*1000).toISOString(),requestDigest:inputDigest(input),request:input,target,diff:{contents:compare(base.contents,target.contents,'contentId'),objects:compare(base.objects,target.objects,'objectId')}};
  const plan=Plan.parse({...draft,planDigest:inputDigest(draft)});this.store.writeRecord(parts,plan);return this.publicPlan(plan);
 }
 private readPlan(parts:string[]){const p=Plan.parse(this.store.readRecord(parts));const {planDigest,...rest}=p;if(inputDigest(rest)!==planDigest)throw new CoreError('ARTIFACT_CHANGED','Plan digest mismatch');return p;}
 private publicPlan(p:z.infer<typeof Plan>){return {changeId:p.changeId,projectId:p.projectId,baseRevision:p.baseRevision,createdAt:p.createdAt,expiresAt:p.expiresAt,planDigest:p.planDigest,inputDigest:p.requestDigest,scope:p.request.scope,normalizedOperations:p.request.operations,diff:p.diff};}
 apply(raw:unknown){
  const input=ApplyInput.parse(raw),cached=this.transactions.lookup('apply_change',input.projectId,input.mutationId,input);if(cached)return cached;
  const p=this.readPlan(['projects',input.projectId,'plans',input.changeId+'.json']);
  if(p.projectId!==input.projectId||p.changeId!==input.changeId||p.baseRevision!==input.expectedRevision)throw new CoreError('PROJECT_REVISION_CHANGED','Plan identity/base mismatch');
  if(Date.now()>Date.parse(p.expiresAt))throw new CoreError('PLAN_EXPIRED','Plan has expired; create a new plan');
  return this.transactions.commit('apply_change',input.projectId,input.mutationId,input,p.target,{projectId:input.projectId,revisionId:p.target.revisionId,previousRevisionId:p.baseRevision,changeId:p.changeId,inputManifestHash:p.target.inputManifestHash});
 }
}
