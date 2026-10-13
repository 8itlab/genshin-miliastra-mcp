import {createHash} from 'node:crypto';
import {container,fields,field,one,replace,wrap} from './wire.mjs';

const hash=b=>createHash('sha256').update(b).digest('hex');
const scope='Observed CN 7.0 path records from BUILD 101. Only existing waypoint positions are editable. IDs, order, rotations, flags, other path fields and all other save sections are retained. Does not create paths, configure patrols or certify movement.';
const messages=(b,id)=>fields(b).filter(f=>f.id===id&&f.wire===2).map(f=>f.data);
const identity=n=>Number.isInteger(n)&&n>0&&n<=0xffffffff;
function int(b,id){const n=Number(one(b,id,0));if(!identity(n))throw new Error('Invalid path or waypoint identity');return n;}
function position(b){
 const rows=fields(b);
 return [1,2,3].map(id=>{
  const matches=rows.filter(f=>f.id===id);
  if(matches.length>1||matches.some(f=>f.wire!==5))throw new Error('Ambiguous waypoint position component');
  // Protobuf scalar zeros may be omitted by official serialization.
  const value=matches.length?matches[0].data.readFloatLE():0;
  if(!Number.isFinite(value))throw new Error('Nonfinite waypoint position');return value;
 });
}
function parseRecord(record){
 const pathId=int(record,1),components=messages(record,4);
 const matches=components.filter(c=>int(c,1)===54);
 if(matches.length!==1)throw new Error('Expected one observed path component (54)');
 const component=matches[0],body=one(one(component,64),1);
 if(int(body,1)!==pathId)throw new Error('Path component self-reference mismatch');
 const points=messages(body,3),ids=new Set();
 if(!points.length)throw new Error('Path has no observed waypoints');
 const waypoints=points.map((point,orderIndex)=>{
  const waypointId=int(point,1);if(ids.has(waypointId))throw new Error('Duplicate waypoint identity');ids.add(waypointId);
  const rotation=one(point,3);
  return {waypointId,orderIndex,position:position(one(point,2)),rotationRawHash:hash(rotation),rotationObservation:rotation.length?'opaque-preserved':'empty-message; UI sample showed zero rotation'};
 });
 const names=components.filter(c=>int(c,1)===1).flatMap(c=>messages(c,11)).flatMap(c=>messages(c,1));
 const name=names.length===1?new TextDecoder('utf-8',{fatal:true}).decode(names[0]):null;
 return {record,component,body,descriptor:{pathId,name,recordHash:hash(record),waypoints,fieldPath:'32.1',waypointFieldPath:'4[kind=54].64.1.3',positionFieldPath:'2.{1,2,3}'}};
}
function read(bytes){
 const root=container(bytes),sections=fields(root).filter(f=>f.id===32);
 if(sections.length!==1||sections[0].wire!==2)throw new Error('Expected one saved level-path section (32)');
 const section=sections[0].data,records=messages(section,1).map(parseRecord),ids=new Set();
 for(const r of records){if(ids.has(r.descriptor.pathId))throw new Error('Duplicate path identity');ids.add(r.descriptor.pathId);}
 return {root,section,records};
}
export function inspectLevelPaths(bytes){
 return {sourceHash:hash(bytes),paths:read(bytes).records.map(r=>r.descriptor),scope,officialLoad:'not_run',gameplay:'not_run'};
}
export function prepareLevelPathPatch(bytes,{expectedSourceHash,pathId,expectedRecordHash,waypointEdits}){
 if(hash(bytes)!==expectedSourceHash)throw new Error('Source snapshot hash mismatch');
 if(!identity(pathId))throw new Error('Invalid path ID');
 const {root,section,records}=read(bytes),selected=records.find(r=>r.descriptor.pathId===pathId);
 if(!selected)throw new Error('Saved path not found');
 if(selected.descriptor.recordHash!==expectedRecordHash)throw new Error('Path record changed since inspection');
 if(!Array.isArray(waypointEdits)||!waypointEdits.length||waypointEdits.length>100)throw new Error('Provide 1..100 existing waypoint edits');
 const edits=new Map();
 for(const edit of waypointEdits){
  if(!identity(edit.waypointId)||edits.has(edit.waypointId)||!selected.descriptor.waypoints.some(p=>p.waypointId===edit.waypointId))throw new Error('Waypoint target is missing or duplicated');
  if(!Array.isArray(edit.position)||edit.position.length!==3||!edit.position.every(n=>Number.isFinite(n)&&Math.abs(n)<=10000))throw new Error('Waypoint position requires three finite coordinates within +/-10000');
  edits.set(edit.waypointId,edit.position);
 }
 const body=Buffer.concat(fields(selected.body).map(f=>{
  if(f.id!==3||f.wire!==2)return f.raw;
  const next=edits.get(int(f.data,1));if(!next)return f.raw;
  const vector=one(f.data,2);let patched=Buffer.from(vector);
  for(let axis=1;axis<=3;axis++){
   const value=Buffer.alloc(4);value.writeFloatLE(next[axis-1]);
   const matches=fields(patched).filter(v=>v.id===axis);
   // Retain omitted zero defaults, including byte-exact no-op edits.
   if(matches.length)patched=replace(patched,axis,5,value);
   else if(next[axis-1]!==0)patched=Buffer.concat([patched,field(axis,5,value)]);
  }
  return field(3,2,replace(f.data,2,2,patched));
 }));
 const component=replace(selected.component,64,2,replace(one(selected.component,64),1,2,body));
 const record=Buffer.concat(fields(selected.record).map(f=>f.id===4&&f.wire===2&&f.data.equals(selected.component)?field(4,2,component):f.raw));
 const changed=Buffer.concat(fields(section).map(f=>f.id===1&&f.wire===2&&int(f.data,1)===pathId?field(1,2,record):f.raw));
 const output=wrap(bytes,replace(root,32,2,changed)),after=inspectLevelPaths(output).paths.find(p=>p.pathId===pathId);
 return {bytes:output,before:selected.descriptor,after,editedWaypointIds:[...edits.keys()],scope,officialLoad:'not_run',gameplay:'not_run'};
}
