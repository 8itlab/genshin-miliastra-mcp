import {createHash} from 'node:crypto';
import {container,fields,field,one,replace,wrap} from './wire.mjs';
import {inspectLevelPaths} from './level-paths.mjs';

const hash=b=>createHash('sha256').update(b).digest('hex');
const messages=(b,id)=>fields(b).filter(f=>f.id===id&&f.wire===2).map(f=>f.data);
const validId=n=>Number.isInteger(n)&&n>0&&n<=0xffffffff;
const integer=(b,id)=>{const n=Number(one(b,id,0));if(!validId(n))throw new Error('Invalid patrol identity');return n;};
const scope='Observed BUILD 101 scout patrol configuration. Only path and existing waypoint references of an already saved template and the separately observed territory=None switch may change. Does not create templates or infer mode, activation, speed, radius, delay or notification fields. Matching editor-cache configuration blocks are updated together; unrelated bytes are retained. Official import and movement remain unverified.';
function component(record,fieldId,kind){
 const matches=messages(record,fieldId).filter(c=>integer(c,1)===kind);
 if(matches.length!==1)throw new Error('Expected one patrol configuration component '+kind);
 return matches[0];
}
function template(record){
 const templateIndex=integer(record,1),name=new TextDecoder('utf-8',{fatal:true}).decode(one(record,2));
 const path=one(record,4),pathId=integer(path,1),points=messages(path,2),ids=new Set();
 const waypointIds=points.map(p=>{const id=integer(p,1);if(ids.has(id))throw new Error('Duplicate patrol waypoint reference');ids.add(id);return id;});
 if(!waypointIds.length)throw new Error('Patrol template has no observed waypoint references');
 return {record,path,descriptor:{templateIndex,name,recordHash:hash(record),pathId,waypointIds,settingsRawHex:one(record,3).toString('hex'),waypointSettings:'opaque-preserved'}};
}
function territoryConfig(record,fieldId){
 const value=component(record,fieldId,34),body=one(one(value,44),1),shapeFields=fields(body).filter(f=>f.id===1);
 if(shapeFields.length>1||shapeFields.some(f=>f.wire!==0))throw new Error('Ambiguous territory shape');
 const shapeCode=shapeFields.length?Number(shapeFields[0].value):0;
 if(!Number.isSafeInteger(shapeCode))throw new Error('Invalid territory shape');
 return {component:value,body,descriptor:{shapeCode,observedMeaning:shapeCode===0?'none':shapeCode===1?'sphere':'unknown',fieldPath:'6[kind=34].44.1.1',otherFields:'preserved, including the saved radius when disabled'}};
}
function read(bytes,prefabId){
 if(!validId(prefabId))throw new Error('Invalid prefab ID');
 const root=container(bytes),section=one(root,4),matches=messages(section,1).filter(r=>integer(r,1)===prefabId);
 if(matches.length!==1)throw new Error('Expected one saved prefab');
 const record=matches[0],baseTemplateId=integer(record,2),patrol=component(record,6,65),list=one(one(patrol,70),1);
 const templates=messages(list,2).map(template),ids=new Set();
 for(const t of templates){if(ids.has(t.descriptor.templateIndex))throw new Error('Duplicate patrol template identity');ids.add(t.descriptor.templateIndex);}
 const behavior=one(one(component(record,6,30),40),1),territory=territoryConfig(record,6);
 const mirrors=[],cacheFields=fields(root).filter(f=>f.id===8);
 if(cacheFields.length>1||cacheFields.some(f=>f.wire!==2))throw new Error('Ambiguous editor cache section');
 const cache=cacheFields[0]?.data;
 if(cache)for(const cached of messages(cache,1)){
  // In the official sample the cache's own field 1 is not the prefab ID.
  // Its field 2.1 explicitly references the prefab being edited.
  if(integer(one(cached,2),1)!==prefabId)continue;
  const cachedPatrol=component(cached,5,65);
  const cachedTerritory=territoryConfig(cached,5);
  if(!cachedPatrol.equals(patrol)||!component(cached,5,30).equals(component(record,6,30))||!cachedTerritory.component.equals(territory.component))throw new Error('Editor cache disagrees with saved patrol configuration');
  mirrors.push({record:cached,component:cachedPatrol,territory:cachedTerritory.component,editorRecordId:integer(cached,1),recordHash:hash(cached)});
 }
 return {root,section,record,patrol,list,templates,territory,cache,mirrors,descriptor:{prefabId,baseTemplateId,recordHash:hash(record),behaviorModeRaw:integer(behavior,1),outOfCombatBehaviorRaw:integer(behavior,2),territory:territory.descriptor,templates:templates.map(t=>t.descriptor),editorMirrors:mirrors.map(m=>({editorRecordId:m.editorRecordId,recordHash:m.recordHash})),fieldPath:'4.1.6[kind=65].70.1.2',pathReferenceField:'template.4.1',waypointReferenceField:'template.4.2[].1'}};
}
export function inspectCreaturePatrol(bytes,prefabId){
 return {sourceHash:hash(bytes),...read(bytes,prefabId).descriptor,scope,officialLoad:'not_run',gameplay:'not_run'};
}
function changeComponent(record,fieldId,oldComponent,newComponent){
 return Buffer.concat(fields(record).map(f=>f.id===fieldId&&f.wire===2&&f.data.equals(oldComponent)?field(fieldId,2,newComponent):f.raw));
}
export function prepareCreaturePatrolPatch(bytes,{expectedSourceHash,prefabId,expectedRecordHash,templateIndex,pathId,waypointRemaps=[],territory}){
 if(hash(bytes)!==expectedSourceHash)throw new Error('Source snapshot hash mismatch');
 const state=read(bytes,prefabId),before=state.descriptor;
 if(before.recordHash!==expectedRecordHash)throw new Error('Prefab record changed since inspection');
 if(before.baseTemplateId!==30003003||before.outOfCombatBehaviorRaw!==5)throw new Error('Only the observed scout with patrol behavior is supported');
 if(territory!==undefined&&territory!=='none')throw new Error('Only the observed territory=None edit is supported');
 if(territory==='none'&&![0,1].includes(before.territory.shapeCode))throw new Error('Unsupported source territory shape');
 if(!validId(templateIndex)||!validId(pathId))throw new Error('Invalid patrol template or path ID');
 const selected=state.templates.find(t=>t.descriptor.templateIndex===templateIndex);
 if(!selected)throw new Error('Saved patrol template not found');
 const destination=inspectLevelPaths(bytes).paths.find(p=>p.pathId===pathId);
 if(!destination)throw new Error('Referenced level path is missing');
 if(!Array.isArray(waypointRemaps)||waypointRemaps.length>100)throw new Error('Provide at most 100 existing waypoint remaps');
 const remaps=new Map();
 for(const edit of waypointRemaps){
  if(!validId(edit.waypointId)||!validId(edit.targetWaypointId)||remaps.has(edit.waypointId)||!selected.descriptor.waypointIds.includes(edit.waypointId))throw new Error('Patrol waypoint remap target is missing or duplicated');
  remaps.set(edit.waypointId,edit.targetWaypointId);
 }
 const finalIds=selected.descriptor.waypointIds.map(id=>remaps.get(id)??id),destinationIds=destination.waypoints.map(p=>p.waypointId);
 if(JSON.stringify(finalIds)!==JSON.stringify(destinationIds))throw new Error('Patrol waypoint references must match the complete destination path in order');
 let path=replace(selected.path,1,0,pathId);
 path=Buffer.concat(fields(path).map(f=>{
  if(f.id!==2||f.wire!==2)return f.raw;
  const next=remaps.get(integer(f.data,1));return next===undefined?f.raw:field(2,2,replace(f.data,1,0,next));
 }));
 const changedTemplate=replace(selected.record,4,2,path);
 const list=Buffer.concat(fields(state.list).map(f=>f.id===2&&f.wire===2&&integer(f.data,1)===templateIndex?field(2,2,changedTemplate):f.raw));
 const patrol=replace(state.patrol,70,2,replace(one(state.patrol,70),1,2,list));
 let record=changeComponent(state.record,6,state.patrol,patrol),changedTerritory;
 if(territory==='none'){
  const body=Buffer.concat(fields(state.territory.body).filter(f=>f.id!==1).map(f=>f.raw));
  changedTerritory=replace(state.territory.component,44,2,replace(one(state.territory.component,44),1,2,body));
  record=changeComponent(record,6,state.territory.component,changedTerritory);
 }
 const section=Buffer.concat(fields(state.section).map(f=>f.id===1&&f.wire===2&&integer(f.data,1)===prefabId?field(1,2,record):f.raw));
 let root=replace(state.root,4,2,section);
 if(state.mirrors.length){
  const cache=Buffer.concat(fields(state.cache).map(f=>{
   if(f.id!==1||f.wire!==2)return f.raw;
   const mirror=state.mirrors.find(m=>m.record.equals(f.data));
   if(!mirror)return f.raw;
   let patched=changeComponent(f.data,5,mirror.component,patrol);
   if(changedTerritory)patched=changeComponent(patched,5,mirror.territory,changedTerritory);
   return field(1,2,patched);
  }));
  root=replace(root,8,2,cache);
 }
 const output=wrap(bytes,root);
 return {bytes:output,before,after:read(output,prefabId).descriptor,updatedEditorRecordIds:state.mirrors.map(m=>m.editorRecordId),scope,officialLoad:'not_run',gameplay:'not_run'};
}
