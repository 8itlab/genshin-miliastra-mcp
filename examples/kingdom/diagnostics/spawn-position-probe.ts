/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import type { entity } from 'genshin-ts/runtime/value'

// Isolated diagnostic variant, not a replacement for the Kingdom game.
// Create at most one enemy and one prop, then compare immediate and later
// availability. Do not retry creation, charge money or advance waves.
g.server({id:1073741900,name:'_GSTS_KingdomSpawnProbe',variables:{
  phase:0n,checks:0n,created:list('entity',[])
}})
.on('whenEntityIsCreated',(evt,f)=>{
  f.set('phase',0n);f.set('checks',0n);f.set('created',[] as entity[]);
  f.startTimer(evt.eventSourceEntity,'KINGDOM_SPAWN_PROBE',true,[1]);
  f.printString('SPAWN_PROBE_STARTED');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='KINGDOM_SPAWN_PROBE')return;
  if(f.get('phase')===0n){
    const players=f.getListOfPlayerEntitiesOnTheField();
    if(players.length!==1)return;
    if(f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0]).length!==1)return;
    f.set('phase',1n);
    const enemy=f.createPrefab(1082130433,[65,6,0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
    const prop=f.createPrefab(1077936136,[15,8,0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
    f.set('created',[enemy,prop]);
    if(f.queryIfEntityIsOnTheField(enemy))f.printString('SPAWN_PROBE_ENEMY_IMMEDIATE_PRESENT');
    else f.printString('SPAWN_PROBE_ENEMY_IMMEDIATE_ABSENT');
    if(f.queryIfEntityIsOnTheField(prop))f.printString('SPAWN_PROBE_PROP_IMMEDIATE_PRESENT');
    else f.printString('SPAWN_PROBE_PROP_IMMEDIATE_ABSENT');
    return;
  }
  if(f.get('checks')>=3n)return;
  f.set('checks',f.get('checks')+1n);
  const created=f.get('created');
  if(created.length===2){
    if(f.queryIfEntityIsOnTheField(created[0]))f.printString('SPAWN_PROBE_ENEMY_LATER_PRESENT');
    else f.printString('SPAWN_PROBE_ENEMY_LATER_ABSENT');
    if(f.queryIfEntityIsOnTheField(created[1]))f.printString('SPAWN_PROBE_PROP_LATER_PRESENT');
    else f.printString('SPAWN_PROBE_PROP_LATER_ABSENT');
  }else f.printString('SPAWN_PROBE_OUTPUT_LIST_INVALID');
  const owned=f.getListOfEntitiesOwnedByTheEntity(evt.eventSourceEntity);
  if(f.getEntityListBySpecifiedPrefabId(owned,1082130433).length>0)f.printString('SPAWN_PROBE_OWNED_ENEMY_PRESENT');
  else f.printString('SPAWN_PROBE_OWNED_ENEMY_ABSENT');
  if(f.getEntityListBySpecifiedPrefabId(owned,1077936136).length>0)f.printString('SPAWN_PROBE_OWNED_PROP_PRESENT');
  else f.printString('SPAWN_PROBE_OWNED_PROP_ABSENT');
})
