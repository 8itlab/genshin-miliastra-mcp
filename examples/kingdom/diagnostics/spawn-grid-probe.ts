/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import type { entity } from 'genshin-ts/runtime/value'

// Sequential 2x2 position experiment. One creation attempt per case; remove
// each surviving actor before the next case to avoid overlapping test actors.
// Case markers associate the following immediate and three later observations.
g.server({id:1073741900,name:'_GSTS_KingdomSpawnGrid',variables:{
  sample:0n,checks:0n,waiting:false,created:list('entity',[])
}})
.on('whenEntityIsCreated',(evt,f)=>{
  f.set('sample',0n);f.set('checks',0n);f.set('waiting',false);f.set('created',[] as entity[]);
  f.startTimer(evt.eventSourceEntity,'KINGDOM_SPAWN_GRID',true,[1]);
  f.printString('SPAWN_GRID_STARTED');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='KINGDOM_SPAWN_GRID'||f.get('sample')>=4n)return;
  if(!f.get('waiting')){
    const players=f.getListOfPlayerEntitiesOnTheField();
    if(players.length!==1)return;
    if(f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0]).length!==1)return;
    const sample=f.get('sample');
    if(sample===0n){
      f.printString('SPAWN_GRID_CASE_NEAR_HIGH');
      const actor=f.createPrefab(1082130433,[10,8,0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
      f.set('created',[actor]);
    }
    if(sample===1n){
      f.printString('SPAWN_GRID_CASE_NEAR_LOW');
      const actor=f.createPrefab(1082130433,[10,6,0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
      f.set('created',[actor]);
    }
    if(sample===2n){
      f.printString('SPAWN_GRID_CASE_FAR_HIGH');
      const actor=f.createPrefab(1082130433,[65,8,0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
      f.set('created',[actor]);
    }
    if(sample===3n){
      f.printString('SPAWN_GRID_CASE_FAR_LOW');
      const actor=f.createPrefab(1082130433,[65,6,0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
      f.set('created',[actor]);
    }
    const created=f.get('created');
    if(created.length===1 && f.queryIfEntityIsOnTheField(created[0]))f.printString('SPAWN_GRID_IMMEDIATE_PRESENT');
    else f.printString('SPAWN_GRID_IMMEDIATE_ABSENT');
    f.set('waiting',true);f.set('checks',0n);return;
  }
  const created=f.get('created');
  if(created.length===1 && f.queryIfEntityIsOnTheField(created[0]))f.printString('SPAWN_GRID_LATER_PRESENT');
  else f.printString('SPAWN_GRID_LATER_ABSENT');
  f.set('checks',f.get('checks')+1n);
  if(f.get('checks')>=3n){
    for(const actor of created){if(f.queryIfEntityIsOnTheField(actor))f.destroyEntity(actor);}
    f.set('created',[] as entity[]);f.set('sample',f.get('sample')+1n);f.set('waiting',false);
    if(f.get('sample')===4n){f.stopTimer(evt.eventSourceEntity,'KINGDOM_SPAWN_GRID');f.printString('SPAWN_GRID_FINISHED');}
  }
})
