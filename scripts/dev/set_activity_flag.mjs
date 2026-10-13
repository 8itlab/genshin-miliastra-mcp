// Experiment helper: write the raw activity flag (property kind 20, body field 30, flag 1) of one prefab.
// Usage: node set_activity_flag.mjs <source.gil> <output.gil> <prefabId> <0|1>
import fs from 'node:fs';
import {container,fields,field,one,replace,wrap} from '../../src/scene/wire.mjs';
import {inspectCreatureActivity} from '../../src/scene/creature-activity.mjs';
const [source,output,prefabText,valueText]=process.argv.slice(2),prefab=Number(prefabText),value=Number(valueText);
const bytes=fs.readFileSync(source),root=container(bytes),section=one(root,4);
const integer=(b,id)=>Number(one(b,id,0));
const withFlag=(record,fieldId)=>Buffer.concat(fields(record).map(f=>{
  if(f.id!==fieldId||f.wire!==2||integer(f.data,1)!==20)return f.raw;
  const body=one(f.data,30);
  const next=fields(body).some(x=>x.id===1)?replace(body,1,0,value):Buffer.concat([body,field(1,0,value)]);
  return field(fieldId,2,replace(f.data,30,2,next));
}));
let next=replace(root,4,2,Buffer.concat(fields(section).map(f=>f.id===1&&f.wire===2&&integer(f.data,1)===prefab?field(1,2,withFlag(f.data,7)):f.raw)));
const caches=fields(root).filter(f=>f.id===8);
if(caches.length===1)next=replace(next,8,2,Buffer.concat(fields(caches[0].data).map(f=>{
  if(f.id!==1||f.wire!==2)return f.raw;
  let owner;try{owner=integer(one(f.data,2),1);}catch{return f.raw;}
  return owner===prefab?field(1,2,withFlag(f.data,6)):f.raw;
})));
const result=wrap(bytes,next);
fs.writeFileSync(output,result,{flag:'wx'});
const before=inspectCreatureActivity(bytes,prefab),after=inspectCreatureActivity(result,prefab);
console.log(JSON.stringify({before:before.rawDisabledFlag,after:after.rawDisabledFlag,editorMirrors:after.editorMirrors.length,bytes:[bytes.length,result.length]}));
