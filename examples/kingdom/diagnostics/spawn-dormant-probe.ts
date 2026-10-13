/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { guid } from 'genshin-ts/runtime/value'

// Spawn probe: two pieces were imported with createAtStart:false (a hilichurl and a wall).
// The graph creates them by GUID at 10 s and 18 s to prove that pre-placed, dormant
// pieces can be brought in later by logic. GUIDs were read from the save after import.
g.server({id:1073741908,name:'_GSTS_KingdomEconomy',variables:{lastTick:-1n,stage:0n,arrived:false}})
.on('whenEntityIsCreated',(evt,f)=>{
  f.set('lastTick',-1n);f.set('stage',0n);f.set('arrived',false);
  f.startTimer(evt.eventSourceEntity,'PROBE_CLOCK',true,[1]);
  f.printString('SPAWN_PROBE_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='PROBE_CLOCK')return;
  const now=f.queryGameTimeElapsed();
  if(now===f.get('lastTick'))return;
  f.set('lastTick',now);
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  if(!f.get('arrived')){
    f.teleportPlayer(players[0],[3,8,0],[0,90,0]);
    f.set('arrived',true);f.printString('SPAWN_PROBE_PLAYER_PLACED');return;
  }
  if(f.get('stage')===0n&&now>=10n){
    f.createEntity(new guid(1082130440),[] as bigint[]);
    f.set('stage',1n);f.printString('SPAWN_PROBE_HILI_REQUESTED');
  }
  if(f.get('stage')===1n&&now>=18n){
    f.createEntity(new guid(1077940209),[] as bigint[]);
    f.set('stage',2n);f.printString('SPAWN_PROBE_WALL_REQUESTED');
  }
})
