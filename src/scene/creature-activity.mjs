import {createHash} from 'node:crypto';
import {container,fields,field,one,replace,wrap} from './wire.mjs';

const hash=b=>createHash('sha256').update(b).digest('hex');
const messages=(b,id)=>fields(b).filter(f=>f.id===id&&f.wire===2).map(f=>f.data);
const identity=n=>Number.isInteger(n)&&n>0&&n<=0xffffffff;
const scope='Observed BUILD 102 scout activity property. Only distanceThrottling=false is writable: property kind 20, body field 30, flag 1 becomes 1. This flag has inverse UI semantics. Matching editor-cache properties are updated together. Other activity flags, properties, entities and save sections are preserved. Does not import or certify runtime behavior.';
function integer(b,id){const n=Number(one(b,id,0));if(!identity(n))throw new Error('Invalid activity identity');return n;}
function activity(record,fieldId){
 const matches=messages(record,fieldId).filter(p=>integer(p,1)===20);
 if(matches.length!==1)throw new Error('Expected one observed activity property (20)');
 const property=matches[0],body=one(property,30),flags=fields(body).filter(f=>f.id===1);
 if(flags.length>1||flags.some(f=>f.wire!==0||![0n,1n].includes(f.value)))throw new Error('Ambiguous or unknown activity flag');
 const rawDisabledFlag=Number(flags[0]?.value??0n);
 return {property,body,rawDisabledFlag,distanceThrottling:rawDisabledFlag===0};
}
function read(bytes,prefabId){
 if(!identity(prefabId))throw new Error('Invalid prefab ID');
 const root=container(bytes),section=one(root,4),matches=messages(section,1).filter(r=>integer(r,1)===prefabId);
 if(matches.length!==1)throw new Error('Expected one saved prefab');
 const record=matches[0],baseTemplateId=integer(record,2);
 if(baseTemplateId!==30003003)throw new Error('Only the observed scout activity property is supported');
 const current=activity(record,7),mirrors=[],cacheFields=fields(root).filter(f=>f.id===8);
 if(cacheFields.length>1||cacheFields.some(f=>f.wire!==2))throw new Error('Ambiguous editor cache section');
 const cache=cacheFields[0]?.data;
 if(cache)for(const cached of messages(cache,1)){
  if(integer(one(cached,2),1)!==prefabId)continue;
  const mirrored=activity(cached,6);
  if(!mirrored.property.equals(current.property))throw new Error('Editor cache disagrees with saved activity property');
  mirrors.push({record:cached,property:mirrored.property,editorRecordId:integer(cached,1),recordHash:hash(cached)});
 }
 return {root,section,record,current,cache,mirrors,descriptor:{prefabId,baseTemplateId,recordHash:hash(record),distanceThrottling:current.distanceThrottling,rawDisabledFlag:current.rawDisabledFlag,fieldPath:'4.1.7[kind=20].30.1',editorMirrors:mirrors.map(({editorRecordId,recordHash})=>({editorRecordId,recordHash})),scope,officialLoad:'not_run',gameplay:'not_run'}};
}
export function inspectCreatureActivity(bytes,prefabId){return {sourceHash:hash(bytes),...read(bytes,prefabId).descriptor};}
export function prepareCreatureActivityPatch(bytes,{expectedSourceHash,prefabId,expectedRecordHash,distanceThrottling}){
 if(hash(bytes)!==expectedSourceHash)throw new Error('Source snapshot hash mismatch');
 if(distanceThrottling!==false)throw new Error('Only observed distanceThrottling=false is writable');
 const state=read(bytes,prefabId),before=state.descriptor;
 if(before.recordHash!==expectedRecordHash)throw new Error('Prefab record changed since inspection');
 const body=fields(state.current.body).some(f=>f.id===1)?replace(state.current.body,1,0,1):Buffer.concat([state.current.body,field(1,0,1)]);
 const property=replace(state.current.property,30,2,body);
 const update=(record,fieldId,original)=>Buffer.concat(fields(record).map(f=>f.id===fieldId&&f.wire===2&&f.data.equals(original)?field(fieldId,2,property):f.raw));
 const record=update(state.record,7,state.current.property);
 const section=Buffer.concat(fields(state.section).map(f=>f.id===1&&f.wire===2&&integer(f.data,1)===prefabId?field(1,2,record):f.raw));
 let root=replace(state.root,4,2,section);
 if(state.mirrors.length){
  const cache=Buffer.concat(fields(state.cache).map(f=>{
   if(f.id!==1||f.wire!==2)return f.raw;
   const mirror=state.mirrors.find(m=>m.record.equals(f.data));
   return mirror?field(1,2,update(f.data,6,mirror.property)):f.raw;
  }));
  root=replace(root,8,2,cache);
 }
 const output=wrap(bytes,root);
 return {bytes:output,before,after:read(output,prefabId).descriptor,updatedEditorRecordIds:state.mirrors.map(m=>m.editorRecordId),scope,officialLoad:'not_run',gameplay:'not_run'};
}
