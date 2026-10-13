/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import type { entity } from 'genshin-ts/runtime/value'

// BUILD112 player-distance ladder. Same scout, ground and path as BUILD111;
// patrol template 1 is requested two seconds after creation. The player is
// teleported closer in steps so one run brackets the activation distance.
// Phase 0: player x=0 (65m from spawn), 1: x=20 (45m), 2: x=35 (30m),
// 3: x=45 (20m), 4: x=58 (7m, held 40s so the scout can be photographed).
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
    f.teleportPlayer(players[0],[0,8,0],[0,90,0]);
    f.set('arrived',true);f.set('arrivalAt',now+3n);return;
  }
  if(now<f.get('arrivalAt'))return;
  if(f.get('ready')&&f.get('phase')>=4n&&now-f.get('phaseAt')>=40n){
    f.printString('PATROL_DIAG_CASE_END');
    for(const actor of f.get('actors'))if(f.queryIfEntityIsOnTheField(actor))f.destroyEntity(actor);
    f.set('actors',[] as entity[]);
    f.printString('PATROL_DIAG_FINISHED');f.stopTimer(evt.eventSourceEntity,'PATROL_DIAG_CLOCK');return;
  }
  if(!f.get('ready')){
    f.printString('PATROL_DIAG_CASE_BEGIN');f.printString('0');
    const enemy=f.createPrefab(1082130441,[65,8,0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
    f.set('actors',[enemy]);f.set('patrolRequested',false);
    f.set('phaseAt',now);f.set('sampleAt',now);f.set('ready',true);f.set('reached',false);
  }
  if(f.get('phase')<4n&&now-f.get('phaseAt')>=20n){
    const next=f.get('phase')+1n;
    f.set('phase',next);f.set('phaseAt',now);
    if(next===1n)f.teleportPlayer(players[0],[20,8,0],[0,90,0]);
    if(next===2n)f.teleportPlayer(players[0],[35,8,0],[0,90,0]);
    if(next===3n)f.teleportPlayer(players[0],[45,8,0],[0,90,0]);
    if(next===4n)f.teleportPlayer(players[0],[58,8,0],[0,90,0]);
    f.printString('PATROL_DIAG_CASE_BEGIN');f.printString(f.dataTypeConversion(next,'str'));
  }
  const owned=f.getListOfEntitiesOwnedByTheEntity(evt.eventSourceEntity);
  const enemies=f.getEntityListBySpecifiedPrefabId(owned,1082130441);
  if(!f.get('patrolRequested')&&f.get('phase')===0n&&now-f.get('phaseAt')>=2n&&enemies.length===1){
    f.switchCreationPatrolTemplate(enemies[0],1n);f.set('patrolRequested',true);
    f.printString('PATROL_DIAG_DELAYED_SWITCH');
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
    f.printString('PATROL_DIAG_ENEMY_BEGIN');
    f.printString(f.dataTypeConversion(f.get('phase'),'str'));
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
