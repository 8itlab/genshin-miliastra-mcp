import {createHash} from 'node:crypto';
import {fields,field,container,wrap,one} from './wire.mjs';
const messages=(b,id)=>fields(b).filter(f=>f.id===id&&f.wire===2).map(f=>f.data);
const integer=(b,id)=>{const found=fields(b).filter(f=>f.id===id&&f.wire===0);return found.length===1?Number(found[0].value):null;};
// Read-only locator checked against the pinned upstream template scanner and
// package exporter. No upstream code or sample bytes are distributed here.
export function inspectPrefabs(payload){
 return messages(payload,4).flatMap(section=>messages(section,1)).flatMap(entry=>{
  const gameId=integer(entry,1),baseTemplateId=integer(entry,2);
  if(!gameId||baseTemplateId===null||[1000000,1000001].includes(baseTemplateId))return [];
  const names=messages(entry,6).filter(m=>integer(m,1)===1).flatMap(m=>messages(m,11)).flatMap(m=>messages(m,1));
  const name=names.length===1?new TextDecoder('utf-8',{fatal:true}).decode(names[0]):'';
  return [{resourceType:'prefab-template',gameId:String(gameId),name,baseTemplateId,
   rawEntryHash:createHash('sha256').update(entry).digest('hex'),
   componentTypeCodes:messages(entry,7).map(m=>integer(m,1)),
   duplicateIdentity:false,definition:'saved-template',spawnability:'not_verified',
   scope:'Saved prefab entry ID and base template ID are distinct namespaces; component codes are partial, not creation or behavior certification',gameplay:'not_run'}];
 }).map((entry,_,all)=>({...entry,duplicateIdentity:all.filter(e=>e.gameId===entry.gameId).length>1}));
}

export function extractPrefabAsset(gil,headerSeed,prefabId){
 const payload=container(gil),matches=messages(payload,4).flatMap(s=>messages(s,1)).filter(e=>integer(e,1)===prefabId);
 if(matches.length!==1)throw new Error('Expected exactly one saved prefab entry');
 const entry=matches[0],descriptor=inspectPrefabs(payload).find(e=>e.gameId===String(prefabId));
 if(!descriptor)throw new Error('Player and profession templates are not supported prefab assets');
 // Observed GIA template envelope: GraphUnit identifier class 1/type 1,
 // which 1, field 11 wraps the original GIL template entry in field 1.
 // The saved entry itself is copied byte-for-byte, without remapping references.
 const identifier=Buffer.concat([field(2,0,1),field(3,0,1),field(4,0,prefabId)]);
 const unit=Buffer.concat([field(1,2,identifier),field(3,2,Buffer.from(descriptor.name)),field(5,0,1),field(11,2,field(1,2,entry))]);
 const root=Buffer.concat([field(1,2,unit),field(3,2,Buffer.from('MCP/LocalPrefab/'+prefabId))]);
 return {bytes:wrap(headerSeed,root),descriptor,scope:'Saved template entry preserved; GIA envelope based on pinned upstream schema. External graphs, components and other resources are not bundled or remapped; official import and spawning remain unverified'};
}

export function inspectPrefabAsset(bytes){
 const root=container(bytes),unit=one(root,1),id=one(unit,1);
 if(messages(root,2).length||integer(id,2)!==1||integer(id,3)!==1||integer(unit,5)!==1)throw new Error('Expected one standalone prefab asset without accessories');
 const entry=one(one(unit,11),1),items=inspectPrefabs(field(4,2,field(1,2,entry)));
 if(items.length!==1||items[0].gameId!==String(integer(id,4)))throw new Error('Prefab asset identifier differs from its template entry');
 return items[0];
}
