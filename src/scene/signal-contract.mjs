const canonical=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);

// A read-only contract across saved descriptors, not a schema writer. Unknown
// protocol fields remain covered by the independent raw definition hashes.
export function inspectSignalContract(signal){
 const roles=['send','monitor','sendServer'],definitions=signal.definitionFingerprints??{},issues=[];
 const unavailable=roles.filter(role=>definitions[role]?.status!=='observed'||definitions[role]?.descriptor?.status!=='partial');
 const base={version:1,scope:'Saved parameter descriptors cross-checked across all three roles; unknown fields and runtime semantics are not certified',generation:'not_verified',gameplay:'not_run'};
 if(unavailable.length)return {...base,status:'unavailable',issues:unavailable.map(role=>({code:'DEFINITION_UNAVAILABLE',role}))};
 const [send,monitor,client]=roles.map(role=>definitions[role].descriptor);
 const indexed=(pins,kind,role)=>{
  if(!Array.isArray(pins)){issues.push({code:'INVALID_PIN_LIST',role});return [];}
  const sorted=[...pins].sort((a,b)=>(a.index?.index??0)-(b.index?.index??0));
  const names=new Set(),ids=new Set();
  sorted.forEach((p,index)=>{
   if(p.index?.kind!==kind||(p.index.index??0)!==index||typeof p.name!=='string'||!p.name||!p.type?.type1||!Number.isSafeInteger(p.pinIndex)||p.pinIndex<=0||ids.has(p.pinIndex)||names.has(p.name))issues.push({code:'INVALID_PARAMETER_DESCRIPTOR',role,index});
   ids.add(p.pinIndex);names.add(p.name);
  });
  return sorted;
 };
 const inputs=indexed(send.inputs,'InParam','send'),clientInputs=indexed(client.inputs,'InParam','sendServer'),outputs=indexed(monitor.outputs,'OutParam','monitor');
 const builtins=[['事件源实体','Entity'],['事件源GUID','GUID'],['信号来源实体','Entity']];
 for(const [index,[name,type]] of builtins.entries())if(outputs[index]?.name!==name||outputs[index]?.type?.type1!==type||outputs[index]?.type?.type2!==type)issues.push({code:'UNKNOWN_EVENT_METADATA',role:'monitor',index});
 if(send.outputs.length||client.outputs.length||monitor.inputs.length)issues.push({code:'UNEXPECTED_PARAMETER_DIRECTION'});
 const userOutputs=outputs.slice(3);
 for(const [role,pins] of [['sendServer',clientInputs],['monitor',userOutputs]]){
  if(pins.length!==inputs.length)issues.push({code:'PARAMETER_COUNT_MISMATCH',role,expected:inputs.length,actual:pins.length});
  inputs.forEach((p,index)=>{if(pins[index]?.name!==p.name||canonical(pins[index]?.type)!==canonical(p.type))issues.push({code:'PARAMETER_TYPE_OR_NAME_MISMATCH',role,index});});
 }
 if(issues.length)return {...base,status:'inconsistent',issues};
 return {...base,status:'observed-consistent',parameters:inputs.map((p,index)=>({name:p.name,type:p.type,ordinal:index,pins:{send:{index,pinIndex:p.pinIndex},sendServer:{index,pinIndex:clientInputs[index].pinIndex},monitor:{index:index+3,pinIndex:userOutputs[index].pinIndex}}})),eventMetadata:outputs.slice(0,3),definitionHashes:Object.fromEntries(roles.map(role=>[role,definitions[role].sha256])),issues:[]};
}
