import {fields} from './wire.mjs';
const messages=(b,id)=>fields(b).filter(f=>f.id===id&&f.wire===2).map(f=>f.data);
const bytes=(b,id)=>messages(b,id)[0];
const integer=(b,id)=>{const f=fields(b).find(f=>f.id===id&&f.wire===0);return f?Number(f.value):undefined;};

// Observed in official CN 7.0 saves. Read only; unknown components are not decoded.
export function inspectEntities(payload) {
  return messages(payload,5).flatMap(group=>messages(group,1)).map(entity=>{
    const id=integer(entity,1), components=messages(entity,6);
    const nameComponent=messages(entity,5).find(c=>integer(c,1)===1);
    const nameData=nameComponent&&bytes(nameComponent,11);
    const name=nameData&&bytes(nameData,1);
    const mounts=[];
    const transformComponent=components.find(c=>integer(c,1)===1);
    const transformData=transformComponent&&bytes(transformComponent,11);
    const vec=id=>{const v=transformData&&bytes(transformData,id);if(!v)return null;const items=fields(v);return [1,2,3].map(axis=>{const f=items.find(f=>f.id===axis&&f.wire===5);return f?f.data.readFloatLE():0;});};
    for(const component of components.filter(c=>integer(c,1)===3)) {
      for(const registry of messages(component,13)) for(const entry of messages(registry,1)) {
        for(const locator of messages(entry,1)) {
          mounts.push({graphId:integer(locator,2),category:integer(locator,501),enabled:integer(locator,1)});
        }
      }
    }
    return {id,name:name?name.toString('utf8'):'',templateId:integer(entity,8),graphMounts:mounts,transform:transformData?{position:vec(1),rotation:vec(2),scale:vec(3)}:null};
  });
}
