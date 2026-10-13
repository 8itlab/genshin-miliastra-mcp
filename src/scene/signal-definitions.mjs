import {createHash} from 'node:crypto';
import {fields,one} from './wire.mjs';
import {loadGiaProto} from 'genshin-ts/injector/proto';

function describeDefinition(raw){
 try{
  const type=loadGiaProto().root.lookupType('CompositeDef');
  const decoded=type.toObject(type.decode(raw),{longs:String,enums:String});
  return {status:'partial',displayName:decoded.name??'',inputs:decoded.inputs??[],outputs:decoded.outputs??[],inflows:decoded.inflows??[],outflows:decoded.outflows??[],
   opaqueFieldNumbers:[...new Set(fields(raw).filter(f=>![4,100,101,102,103,200,201,203].includes(f.id)).map(f=>f.id))],
   source:'pinned genshin-ts 0.2.2 CompositeDef protocol',limitations:['Fields are saved pin descriptors, not inferred user parameters.','Listener outputs include engine event metadata.','Signal metadata and nested unknown fields remain opaque; generation and runtime are not certified.']};
 }catch{return {status:'unreadable',limitations:['Pinned protocol cannot decode this definition; raw fingerprint remains available.']};}
}

// Same composite-definition containers indexed by the pinned backend. Keep
// opaque bytes in the fingerprint; do not infer a parameter schema from IDs.
export function signalDefinitionFingerprints(payload,parsed,signals){
 const result=new Map(signals.map(s=>[s.name,{}]));
 for(const item of parsed){
  const length=item.dataEnd-item.dataStart;if(length<=0||length>4096)continue;
  const raw=payload.subarray(item.dataStart,item.dataEnd);
  let name,nodeId;
  try{
   const parts=fields(raw);if(!parts.some(f=>f.id===107)||!parts.some(f=>f.id===4))continue;
   const definition=one(raw,107),definitionFields=fields(definition);
   name=one(one(definition,definitionFields.some(f=>f.id===101)?101:102),1).toString('utf8');
   const ids=one(raw,4),idsFields=fields(ids),generic=one(ids,idsFields.some(f=>f.id===1)?1:2);
   nodeId={class:Number(one(generic,1,0)),type:Number(one(generic,2,0)),kind:Number(one(generic,3,0)),nodeId:Number(one(generic,5,0))};
  }catch{continue;}
  const signal=signals.find(s=>s.name===name);if(!signal)continue;
  for(const [role,expected] of Object.entries(signal.nodeIds)){
   if(!['class','type','kind','nodeId'].every(k=>nodeId[k]===expected[k]))continue;
   const hash=createHash('sha256').update(raw).digest('hex'),roles=result.get(name);
   const old=roles[role];
   if(old&&old.sha256!==hash){roles[role]={status:'ambiguous',sha256:null,scope:'opaque composite definition bytes'};continue;}
   roles[role]={status:'observed',sha256:hash,bytes:raw.length,scope:'opaque composite definition bytes; full parameter schema not decoded',descriptor:describeDefinition(raw)};
  }
 }
 return result;
}
