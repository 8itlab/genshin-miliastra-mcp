import { z } from 'zod';
import { canonicalQuaternion, inputDigest } from './canonical.js';

export const id = (prefix: string) => z.string().regex(new RegExp(`^${prefix}_[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`));
export const Hash = z.string().regex(/^[a-f0-9]{64}$/);
const Time = z.string().datetime();
const Text = z.string().min(1).max(4096);
type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export const JsonValue: z.ZodType<Json> = z.lazy(() => z.union([z.null(),z.boolean(),z.number().finite(),z.string(),z.array(JsonValue),z.record(JsonValue)]));
const Vector3 = z.tuple([z.number().finite(),z.number().finite(),z.number().finite()]);
const Quaternion = z.tuple([z.number().finite(),z.number().finite(),z.number().finite(),z.number().finite()]).superRefine((q,ctx)=>{
  if (Math.abs(Math.hypot(...q)-1)>1e-9) ctx.addIssue({code:'custom',message:'Quaternion must be normalized'});
  else if (canonicalQuaternion(q).some((v,i)=>Math.abs(v-q[i])>1e-9)) ctx.addIssue({code:'custom',message:'Quaternion sign is not canonical'});
});
export const Transform = z.object({position:Vector3,rotationQuaternion:Quaternion,scale:Vector3}).strict();
export const TargetProfile = z.object({gameBuild:Text.nullable(),editorBuild:Text.nullable(),mode:Text.nullable(),locale:Text.nullable(),coordinateProfile:Text.nullable(),gameBuildSource:z.enum(['observed','user_reported','unknown'])}).strict().superRefine((v,ctx)=>{
  if ((v.gameBuild === null) !== (v.gameBuildSource === 'unknown')) ctx.addIssue({code:'custom',message:'Game build and detection source must agree'});
});
export const SourceRegistration = z.object({schemaVersion:z.literal('1.0'),sourceId:id('src'),projectId:id('prj'),localPath:Text,format:z.enum(['gil','gia']),blobHash:Hash,registeredAt:Time,purpose:z.enum(['reference','import-observation']),provenance:z.object({origin:z.enum(['real-editor-save','real-editor-export','synthetic-binary']),licenseNote:Text,gameBuild:Text.nullable(),gameBuildSource:z.enum(['observed','user_reported','unknown'])}).strict()}).strict();
export const Dependency = z.object({fromId:Text,toId:Text,relation:z.enum(['contains','references','mounts_graph','requires_component','binds_variable','binds_signal','binds_ui']),required:z.boolean(),scope:Text,resolution:z.enum(['resolved','external_required','unknown','unsupported'])}).strict();
export const Binding = z.object({internalObjectId:id('obj'),namespace:Text,sourceGameId:z.string().regex(/^\d+$/).optional(),importedGameId:z.string().regex(/^\d+$/).optional(),importSessionId:id('imp').optional(),observedArtifactHash:Hash.optional(),matchMethod:Text,status:z.enum(['unresolved','candidate','confirmed','conflict'])}).strict();
export const Content = z.object({schemaVersion:z.literal('1.0'),contentId:id('cnt'),displayName:Text,kind:Text,authoringMode:z.enum(['recipe','custom-source']),recipe:z.object({id:Text,version:Text}).strict().nullable(),parameters:z.record(JsonValue),backend:z.object({adapterId:Text,versionLockRef:Hash}).strict(),managedObjectIds:z.array(id('obj')),lockedFields:z.array(z.object({objectId:id('obj'),paths:z.array(Text).min(1)}).strict()),sourceRefs:z.array(Hash),dependencies:z.array(Dependency),requiredCapabilities:z.array(Text),externalBindings:z.array(Binding),ownership:z.object({mode:z.enum(['generated','adopted']),originRevisionId:id('rev')}).strict()}).strict().superRefine((c,ctx)=>{
  if(c.authoringMode==='recipe' && !c.recipe)ctx.addIssue({code:'custom',message:'Recipe mode requires a versioned recipe'});
  if(c.authoringMode==='custom-source' && !c.sourceRefs.length)ctx.addIssue({code:'custom',message:'Custom source mode requires authoritative source blobs'});
  if(new Set(c.managedObjectIds).size!==c.managedObjectIds.length)ctx.addIssue({code:'custom',message:'Duplicate managed object ID'});
});
export const ObjectRecord = z.object({objectId:id('obj'),contentId:id('cnt'),roleKey:Text,objectKind:Text,templateRef:Text,transform:Transform.optional(),componentRefs:z.array(Hash),sourceRef:Hash.optional(),ownership:z.enum(['generated','adopted','external']),provenance:z.object({sourceId:id('src'),artifactHash:Hash,notes:Text}).strict()}).strict();
export const ResourceRecord = z.object({resourceRef:Text,namespace:Text,gameId:z.string().regex(/^\d+$/),name:Text,resourceType:Text,entityClass:Text,targetProfile:TargetProfile,source:z.object({sourceId:id('src'),artifactHash:Hash}).strict(),dimensions:z.object({unit:z.literal('meter'),bounds:z.object({min:Vector3,max:Vector3}).strict(),source:Text,confidence:z.enum(['measured','declared','unknown'])}).strict().optional(),collisionEvidenceRefs:z.array(id('evd')),supportedComponents:z.array(Text),licenseNote:Text.optional(),verifiedEvidenceRefs:z.array(id('evd'))}).strict();
export const ProjectIdentity = z.object({schemaVersion:z.literal('1.0'),projectId:id('prj'),displayName:Text,createdAt:Time,initialSourceIds:z.array(id('src')),legacyRef:z.object({relativePath:Text,migrationReportHash:Hash}).strict().optional()}).strict();
export const ProjectRevisionShape = z.object({schemaVersion:z.literal('1.0'),projectId:id('prj'),revisionId:id('rev'),parentRevisionId:id('rev').nullable(),transactionId:id('txn'),createdAt:Time,targetProfile:TargetProfile,contents:z.array(Content),objects:z.array(ObjectRecord),resourceRefs:z.array(ResourceRecord),bindingMapRef:Hash.optional(),inputDigestVersion:z.literal('1'),inputManifestHash:Hash}).strict();
export type ProjectRevision = z.infer<typeof ProjectRevisionShape>;
export function revisionInput(rev: ProjectRevision) {
  return {targetProfile:rev.targetProfile,contents:rev.contents,objects:rev.objects,resourceRefs:rev.resourceRefs,bindingMapRef:rev.bindingMapRef??null};
}
export const ProjectRevision = ProjectRevisionShape.superRefine((r,ctx)=>{
  const error=(message:string)=>ctx.addIssue({code:'custom',message});
  if(r.parentRevisionId===r.revisionId)error('Revision cannot parent itself');
  const contents=new Map(r.contents.map(c=>[c.contentId,c]));
  const objects=new Map(r.objects.map(o=>[o.objectId,o]));
  const resources=new Set(r.resourceRefs.map(v=>v.resourceRef));
  if(contents.size!==r.contents.length || objects.size!==r.objects.length || resources.size!==r.resourceRefs.length)error('Duplicate project identity');
  const roles=new Set<string>();
  for(const o of r.objects){
    const c=contents.get(o.contentId);if(!c)error('Object references missing content');
    const key=o.contentId+'\0'+o.roleKey;if(roles.has(key))error('Role keys must be unique within content');roles.add(key);
    if(!resources.has(o.templateRef))error('Object references missing resource');
    if(o.ownership!=='external' && !c?.managedObjectIds.includes(o.objectId))error('Owned object is absent from managedObjectIds');
  }
  for(const c of r.contents){
    for(const objId of c.managedObjectIds){const o=objects.get(objId);if(!o || o.contentId!==c.contentId || o.ownership==='external')error('Invalid managed object reference');}
    for(const lock of c.lockedFields)if(!c.managedObjectIds.includes(lock.objectId))error('Cannot lock an unmanaged object');
    for(const binding of c.externalBindings){if(!objects.has(binding.internalObjectId))error('Binding references missing object');if(binding.status==='confirmed' && (!binding.observedArtifactHash || !binding.importedGameId))error('Confirmed binding requires observed identity');}
  }
  const known=new Set([...contents.keys(),...objects.keys(),...resources]);
  const containment=new Map<string,string[]>();
  for(const c of r.contents)for(const edge of c.dependencies){
    if(edge.resolution==='resolved' && (!known.has(edge.fromId) || !known.has(edge.toId)))error('Resolved dependency references missing content/object/resource');
    if(edge.relation==='contains' && edge.resolution==='resolved')containment.set(edge.fromId,[...(containment.get(edge.fromId)??[]),edge.toId]);
  }
  const visited=new Set<string>(),active=new Set<string>();
  const visit=(node:string):void=>{
    if(active.has(node)){error('Containment dependency cycle');return;}
    if(visited.has(node))return;
    active.add(node);for(const next of containment.get(node)??[])visit(next);active.delete(node);visited.add(node);
  };
  for(const node of containment.keys())visit(node);
  if(inputDigest(revisionInput(r))!==r.inputManifestHash)error('Input manifest digest mismatch');
});
export const CapabilityRecord = z.object({capabilityId:Text,adapterId:Text,versionLockRef:Hash,targetProfile:TargetProfile,scope:JsonValue,implementationStatus:z.enum(['unavailable','experimental','supported','disabled']),evidenceRefs:z.array(id('evd')),limitations:z.array(Text),prerequisites:z.array(Text)}).strict();

export const schemaRegistry={ProjectIdentity,ProjectRevision,SourceRegistration,Content,ObjectRecord,ResourceRecord,Dependency,Binding,Transform,TargetProfile,CapabilityRecord};
