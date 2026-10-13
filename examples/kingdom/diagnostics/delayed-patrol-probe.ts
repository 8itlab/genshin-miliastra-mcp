/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import type { entity } from 'genshin-ts/runtime/value'

// BUILD109 A contrast: same scout, ground, path and player position.
// Request patrol two seconds after creation instead of immediately. One 60s
// case only; no combat target, forced motion, damage or stage settlement.
g.server({id:1073741910,name:'_GSTS_DelayedPatrolProbe',variables:{
  phase:0n,phaseAt:0n,sampleAt:0n,lastTick:-1n,ready:false,arrivalAt:0n,
  arrived:false,reached:false,patrolRequested:false,actors:list('entity',[])
}})
.on('whenEntityIsCreated',(evt,f)=>{
  f.set('phase',0n);f.set('ready',false);f.set('arrived',false);
  f.set('lastTick',-1n);f.set('actors',[] as entity[]);
  f.startTimer(evt.eventSourceEntity,'PATROL_DIAG_CLOCK',true,[1]);
  f.printString('PATROL_DIAG_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='PATROL_DIAG_CLOCK')return;
  const now=f.queryGameTimeElapsed();
  if(now===f.get('lastTick'))return;
  f.set('lastTick',now);
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  if(f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0]).length!==1)return;
  if(!f.get('arrived')){
    f.teleportPlayer(players[0],[50,8,0],[0,90,0]);
    f.set('arrived',true);f.set('arrivalAt',now+3n);return;
  }
  if(now<f.get('arrivalAt'))return;
  if(f.get('ready')&&now-f.get('phaseAt')>=60n){
    f.printString('PATROL_DIAG_CASE_END');
    for(const actor of f.get('actors'))if(f.queryIfEntityIsOnTheField(actor))f.destroyEntity(actor);
    f.set('actors',[] as entity[]);f.set('phase',1n);
    f.printString('PATROL_DIAG_FINISHED');f.stopTimer(evt.eventSourceEntity,'PATROL_DIAG_CLOCK');return;
  }
  if(!f.get('ready')){
    f.printString('PATROL_DIAG_CASE_BEGIN');f.printString('0');
    const enemy=f.createPrefab(1082130441,[65,8,0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
    f.set('actors',[enemy]);f.set('patrolRequested',false);
    f.set('phaseAt',now);f.set('sampleAt',now);f.set('ready',true);f.set('reached',false);
  }
  const owned=f.getListOfEntitiesOwnedByTheEntity(evt.eventSourceEntity);
  const enemies=f.getEntityListBySpecifiedPrefabId(owned,1082130441);
  if(!f.get('patrolRequested')&&now-f.get('phaseAt')>=2n&&enemies.length===1){
    f.switchCreationPatrolTemplate(enemies[0],1n);f.set('patrolRequested',true);
    f.printString('PATROL_DIAG_DELAYED_SWITCH');
  }
  for(const enemy of enemies){
    if(!f.queryIfEntityIsOnTheField(enemy))continue;
    const pos=f.split3dVector(f.getEntityLocationAndRotation(enemy).location);
    const patrol=f.getCurrentCreationSPatrolTemplate(enemy);
    if(pos.xComponent<=56&&patrol.patrolTemplateId===1n){
      f.switchCreationPatrolTemplate(enemy,2n);f.printString('PATROL_DIAG_SWITCH_TO_CROWN');
    }
    if(pos.xComponent<=10&&!f.get('reached')){
      f.set('reached',true);f.printString('PATROL_DIAG_REACHED_CROWN');
    }
  }
  if(now<f.get('sampleAt'))return;
  f.set('sampleAt',now+2n);
  if(enemies.length===0)f.printString('PATROL_DIAG_ENEMY_ABSENT');
  for(const enemy of enemies){
    if(!f.queryIfEntityIsOnTheField(enemy))continue;
    const pos=f.split3dVector(f.getEntityLocationAndRotation(enemy).location);
    const patrol=f.getCurrentCreationSPatrolTemplate(enemy);
    const target=f.getCreationSCurrentTarget(enemy);
    const present=f.queryIfEntityIsOnTheField(target);
    f.printString('PATROL_DIAG_ENEMY_BEGIN');f.printString('0');
    f.printString(f.dataTypeConversion(f.queryGuidByEntity(enemy),'str'));
    f.printString(f.dataTypeConversion(pos.xComponent,'str'));
    f.printString(f.dataTypeConversion(pos.yComponent,'str'));
    f.printString(f.dataTypeConversion(pos.zComponent,'str'));
    f.printString(f.dataTypeConversion(f.getCreationAttribute(enemy).currentHp,'str'));
    f.printString(f.dataTypeConversion(patrol.patrolTemplateId,'str'));
    f.printString(f.dataTypeConversion(patrol.pathIndex,'str'));
    f.printString(f.dataTypeConversion(patrol.targetWaypointIndex,'str'));
    if(present){
      const targetPos=f.split3dVector(f.getEntityLocationAndRotation(target).location);
      f.printString('1');f.printString(f.dataTypeConversion(f.queryGuidByEntity(target),'str'));
      f.printString(f.dataTypeConversion(targetPos.xComponent,'str'));
      f.printString(f.dataTypeConversion(targetPos.yComponent,'str'));
      f.printString(f.dataTypeConversion(targetPos.zComponent,'str'));
    }else{
      f.printString('0');f.printString('none');f.printString('0');f.printString('0');f.printString('0');
    }
    f.printString('PATROL_DIAG_ENEMY_END');
  }
})
