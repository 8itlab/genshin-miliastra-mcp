import {fields} from './wire.mjs';
const messages=(b,id)=>fields(b).filter(f=>f.id===id&&f.wire===2).map(f=>f.data);
const integer=(b,id)=>{const f=fields(b).find(f=>f.id===id&&f.wire===0);return f?Number(f.value):null;};
const descend=(b,...ids)=>ids.reduce((items,id)=>items.flatMap(v=>messages(v,id)),[b]);

// Read-only paths observed in official CN 7.0 skill/profession save snapshots.
// These references prove saved configuration, never execution or complete schema coverage.
export function inspectBattleConfigurations(payload){
 return descend(payload,15,1).flatMap(record=>{
  const gameId=integer(record,1),kind=integer(record,2);
  if(![4,6].includes(kind))return [];
  const components=messages(record,4);
  const name=components.filter(c=>integer(c,1)===1).flatMap(c=>descend(c,11,1))[0]?.toString('utf8')??'';
  const common={gameId,name,recordKind:kind,inspection:'observed-cn-7.0-config-paths',gameplay:'not_run'};
  if(kind===6){
   const graphReferences=components.filter(c=>integer(c,1)===21).flatMap(c=>descend(c,30,1,5)).map(v=>({graphId:integer(v,1),secondaryId:integer(v,2)})).filter(v=>v.graphId!==null);
   return [{...common,resourceType:'character-skill',graphReferences}];
  }
  const configs=components.filter(c=>integer(c,1)===25).flatMap(c=>descend(c,34,1));
  return [{...common,resourceType:'profession',activeSkillConfigurations:configs.map(c=>({activeSkillCount:integer(c,3),slots:messages(c,4).map(v=>({slotCode:integer(v,1),skillId:integer(v,2)}))}))}];
 });
}
