import {fields,one,field,replace} from './wire.mjs';
const messages=(b,id)=>fields(b).filter(f=>f.id===id&&f.wire===2).map(f=>f.data);
const optionalInt=(b,id)=>{const a=fields(b).filter(f=>f.id===id);if(!a.length)return 0;if(a.length!==1||a[0].wire!==0)throw new Error('Ambiguous UI integer');return Number(a[0].value);};
const float=(b,id)=>{const a=fields(b).filter(f=>f.id===id);if(!a.length)return 0;if(a.length!==1||a[0].wire!==5)throw new Error('Unsupported UI float');const v=a[0].data.readFloatLE();if(!Number.isFinite(v))throw new Error('Nonfinite UI float');return v;};
const vector=b=>[float(b,501),float(b,502)];
function rectComponent(record){
 const a=messages(record,505).filter(c=>optionalInt(c,502)===12);
 if(a.length!==1)throw new Error('Expected one UI rect component');
 const c=a[0],inner=one(c,503);
 if(one(inner,502,0)!==12n||one(one(inner,504),4,0)!==one(record,501,0))throw new Error('UI rect reference mismatch');
 return {c,inner,config:one(one(inner,13),12)};
}
function states(config){
 const result=messages(config,501).map(raw=>{
  const stateIndex=optionalInt(raw,501),transform=one(raw,502);
  return {raw,stateIndex,transform,anchorMin:vector(one(transform,502)),anchorMax:vector(one(transform,503)),anchoredPosition:vector(one(transform,504)),size:vector(one(transform,505)),pivot:vector(one(transform,506))};
 });
 if(new Set(result.map(s=>s.stateIndex)).size!==result.length)throw new Error('Duplicate UI rect state');
 return result;
}
export function inspectUIRect(record){
 try{return {rectStates:states(rectComponent(record).config).map(({raw,transform,...state})=>state),rectInspection:'saved-fields-not-rendering'};}
 catch{return {rectStates:[],rectInspection:'unsupported-or-ambiguous'};}
}
export function inspectUIVisibility(record){
 try{
 const nodes=messages(record,505).flatMap(c=>messages(c,503)).flatMap(c=>messages(c,14)).filter(n=>optionalInt(n,501)===5);
 if(nodes.length!==1)return {initialHidden:null,visibilityInspection:'unsupported-or-ambiguous'};
 const v=optionalInt(nodes[0],502);
 return {initialHidden:[0,1].includes(v)?v===1:null,visibilityInspection:'research-field-interpretation-not-runtime'};
 }catch{return {initialHidden:null,visibilityInspection:'unsupported-or-ambiguous'};}
}
function writeVector(b,values){
 let out=b;
 for(let i=0;i<2;i++){
  const id=501+i,value=values[i];
  if(!Number.isFinite(value)||Math.abs(value)>10000)throw new Error('UI coordinates must be finite and within 10000');
  if(float(out,id)===Math.fround(value))continue;
  const bytes=Buffer.alloc(4);bytes.writeFloatLE(value);
  out=fields(out).some(f=>f.id===id)?replace(out,id,5,bytes):Buffer.concat([out,field(id,5,bytes)]);
 }
 return out;
}
export function patchUIRect(record,edits){
 const {c,inner,config}=rectComponent(record),known=states(config),updates=new Map();
 for(const edit of edits){
  const state=known.find(s=>s.stateIndex===edit.stateIndex);
  if(!state||updates.has(edit.stateIndex))throw new Error('UI rect state missing or repeated');
  if(state.anchorMin.some((v,i)=>v!==state.anchorMax[i]))throw new Error('Stretch anchors are not supported');
  if(!Array.isArray(edit.size)||edit.size.length!==2||edit.size.some(v=>!Number.isFinite(v)||v<=0||v>10000))throw new Error('UI size must be positive and within 10000');
  if(!Array.isArray(edit.anchoredPosition)||edit.anchoredPosition.length!==2)throw new Error('UI position must have two coordinates');
  let t=replace(state.transform,504,2,writeVector(one(state.transform,504),edit.anchoredPosition));
  t=replace(t,505,2,writeVector(one(t,505),edit.size));
  updates.set(edit.stateIndex,replace(state.raw,502,2,t));
 }
 const changed=Buffer.concat(fields(config).map(f=>f.id===501&&f.wire===2&&updates.has(optionalInt(f.data,501))?field(501,2,updates.get(optionalInt(f.data,501))):f.raw));
 const component=replace(c,503,2,replace(inner,13,2,replace(one(inner,13),12,2,changed)));
 return Buffer.concat(fields(record).map(f=>f.id===505&&f.wire===2&&f.data.equals(c)?field(505,2,component):f.raw));
}
