import { g } from 'genshin-ts/runtime/core'
import { EntityType, SettlementStatus, UIControlGroupStatus } from 'genshin-ts/definitions/enum'
import { configId } from 'genshin-ts/runtime/value'

// Kingdom prototype. Attach once to a persistent level entity.
// Layout is 0.6x the first prototype: keep 0, stations 6/12/18/24/30, wall 33, enemy spawn 39.
// Creatures far from every player stop acting and report stale positions (docs/PLATFORM_RULES),
// so the whole battlefield stays within about 40 m of a player standing anywhere in camp.
// Prototype role models; BUILD105 verified native archery and construction.
g.server({id:1073741908,name:'_GSTS_KingdomEconomy',variables:{
  day:1n,night:false,deadline:0n,coins:12n,workers:0n,archers:0n,
  wall:0n,crown:3n,state:1n,lastTick:-1n,idle:0n,bank:0n,
  station:0n,enteredAt:0n,spent:false,waveLeft:0n,nextSpawn:0n,wallHp:0n,playerReady:false,settlementRequested:false,
  arrivalRequested:false,arrivalRetryAt:0n,arrivalAttempts:0n,enemySampleAt:0n,
  recoveryAt:0n,groveFound:false,ruinsFound:false,hudLayoutStatus:0n,
  keepLevel:0n,rosterReady:false,rosterAttempts:0n,rosterRetryAt:0n
}})
.on('whenEntityIsCreated',(evt,f)=>{
  f.set('day',1n);f.set('night',false);f.set('coins',12n);
  f.set('workers',0n);f.set('archers',0n);f.set('wall',0n);
  f.set('crown',3n);f.set('state',1n);f.set('lastTick',-1n);
  f.set('idle',0n);f.set('bank',0n);f.set('station',0n);
  f.set('enteredAt',0n);f.set('spent',false);
  f.set('waveLeft',0n);f.set('nextSpawn',0n);f.set('wallHp',0n);
  f.set('playerReady',false);f.set('settlementRequested',false);
  f.set('arrivalRequested',false);f.set('arrivalRetryAt',0n);f.set('arrivalAttempts',0n);
  f.set('enemySampleAt',0n);
  f.set('recoveryAt',0n);f.set('groveFound',false);f.set('ruinsFound',false);
  f.set('hudLayoutStatus',0n);
  f.set('keepLevel',0n);f.set('rosterReady',false);f.set('rosterAttempts',0n);f.set('rosterRetryAt',0n);
  f.set('deadline',f.queryGameTimeElapsed()+60n);
  f.startTimer(evt.eventSourceEntity,'KINGDOM_CLOCK',true,[1]);
  f.printString('KINGDOM_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='KINGDOM_CLOCK')return;
  const now=f.queryGameTimeElapsed();
  if(now===f.get('lastTick'))return;
  f.set('lastTick',now);
  // The official settlement screen owns restart. If the player temporarily
  // disappears at defeat, wait for one player without advancing the lost run.
  if(f.get('state')===2n){
    if(f.get('settlementRequested'))return;
    const settlementPlayers=f.getListOfPlayerEntitiesOnTheField();
    if(settlementPlayers.length!==1)return;
    f.set('settlementRequested',true);
    f.setPlayerSettlementSuccessStatus(settlementPlayers[0],SettlementStatus.Defeat);
    f.settleStage();return;
  }
  // The controller can be created before the player. Start the playable day
  // only after observing a single character near the requested starting point.
  // Landing height and camera clearance still require official collision QA.
  if(!f.get('playerReady')){
    const startingPlayers=f.getListOfPlayerEntitiesOnTheField();
    if(startingPlayers.length!==1)return;
    const startingCharacters=f.getAllCharacterEntitiesOfSpecifiedPlayer(startingPlayers[0]);
    if(startingCharacters.length!==1)return;
    const arrival=f.split3dVector(f.getEntityLocationAndRotation(startingCharacters[0]).location);
    if(f.get('arrivalRequested') && arrival.xComponent>=1 && arrival.xComponent<=5 && arrival.yComponent>=5 && arrival.yComponent<=9 && arrival.zComponent>=-2 && arrival.zComponent<=2){
      // This name is present in the registered base save; the project pins its
      // record hash. Template parameters and side-view behavior remain unverified.
      f.switchMainCameraTemplate(startingPlayers,'自定义镜头');
      f.setPlayerCameraToFollowEntity(startingPlayers[0],startingCharacters[0],'自定义镜头');
      // Saved default layout index observed in the official editor (BUILD 020).
      // Request once; verify on later ticks without blocking the world clock.
      f.switchCurrentInterfaceLayout(startingPlayers[0],1073741825n);
      f.set('playerReady',true);f.set('deadline',now+60n);
      f.printString('KINGDOM_PLAYER_READY');return;
    }
    if(f.get('arrivalRequested') && now<f.get('arrivalRetryAt'))return;
    if(f.get('arrivalAttempts')>=3n)return;
    f.teleportPlayer(startingPlayers[0],[3,8,0],[0,90,0]);
    f.set('arrivalRequested',true);f.set('arrivalRetryAt',now+5n);
    f.set('arrivalAttempts',f.get('arrivalAttempts')+1n);
    if(f.get('arrivalAttempts')===3n)f.printString('KINGDOM_ARRIVAL_RETRY_LIMIT');
    return;
  }
  // Keep the world clock and defense running during a fall. Only request a
  // return for one unambiguous character; never reset progress to rescue it.
  const rescuePlayers=f.getListOfPlayerEntitiesOnTheField();
  if(rescuePlayers.length===1){
    const activeLayout=f.getPlayerSCurrentUiLayout(rescuePlayers[0]);
    if(activeLayout===1073741825n){
      if(f.get('hudLayoutStatus')!==1n){
        // The observed text control renders as an opaque white panel in this
        // editor account. Hide it once so it cannot obscure the defense line.
        // This removes the obstruction; a readable information HUD is still due.
        f.modifyUiControlStatusWithinTheInterfaceLayout(rescuePlayers[0],1073741843n,UIControlGroupStatus.Hidden);
        f.printString('KINGDOM_HUD_LAYOUT_ACTIVE');f.set('hudLayoutStatus',1n);
      }
    }else{
      if(f.get('hudLayoutStatus')!==2n){f.printString('KINGDOM_HUD_LAYOUT_MISMATCH');f.set('hudLayoutStatus',2n);}
    }
    const rescueCharacters=f.getAllCharacterEntitiesOfSpecifiedPlayer(rescuePlayers[0]);
    if(rescueCharacters.length===1){
      const rescuePos=f.split3dVector(f.getEntityLocationAndRotation(rescueCharacters[0]).location);
      if(rescuePos.yComponent<0 || rescuePos.xComponent< -30 || rescuePos.xComponent>45 || rescuePos.zComponent< -12 || rescuePos.zComponent>12){
        f.set('station',0n);f.set('spent',false);
        if(now>=f.get('recoveryAt')){
          f.teleportPlayer(rescuePlayers[0],[3,8,0],[0,90,0]);
          f.set('recoveryAt',now+5n);f.printString('KINGDOM_RETURN_REQUESTED');
        }
      }
    }
  }
  // Requires the stage custom-variable definitions in hud-bindings.json.
  // The saved MCP_HUD string alone does not cover the new integer variables.
  // Publishes the previous completed tick; normal feedback latency is <= 1 s.
  const stages=f.getSpecifiedTypeOfEntitiesOnTheField(EntityType.Stage);
  if(stages.length===1){
    let phase='白天';if(f.get('night'))phase='夜晚';
    let remaining=f.get('deadline')-now;if(remaining<0n)remaining=0n;
    let status=phase;
    // Static alternatives avoid the compiler's numeric-only string + lowering.
    if(f.get('keepLevel')===0n){
      status='白天 | 主建筑 Lv0：升级4金币解锁工人台';
      if(f.get('night'))status='夜晚 | 主建筑 Lv0：升级4金币解锁工人台';
    }
    if(f.get('keepLevel')===1n){
      status='白天 | 主建筑 Lv1：工人台已解锁；升级6金币解锁弓手台';
      if(f.get('night'))status='夜晚 | 主建筑 Lv1：工人台已解锁；升级6金币解锁弓手台';
    }
    if(f.get('keepLevel')===2n){
      status='白天 | 主建筑 Lv2：工人台、弓手台已解锁';
      if(f.get('night'))status='夜晚 | 主建筑 Lv2：工人台、弓手台已解锁';
    }
    if(!f.get('rosterReady')){
      status='正在安置居民与守军';
      if(f.get('rosterAttempts')>=3n)status='初始人口生成失败，请重新开始试玩';
    }
    f.setCustomVariable(stages[0],'MCP_HUD',status,false);
    f.setCustomVariable(stages[0],'KINGDOM_DAY',f.get('day'),false);
    f.setCustomVariable(stages[0],'KINGDOM_REMAINING',remaining,false);
    f.setCustomVariable(stages[0],'KINGDOM_COINS',f.get('coins'),false);
    f.setCustomVariable(stages[0],'KINGDOM_BANK',f.get('bank'),false);
    f.setCustomVariable(stages[0],'KINGDOM_CROWN',f.get('crown'),false);
    f.setCustomVariable(stages[0],'KINGDOM_IDLE',f.get('idle'),false);
    f.setCustomVariable(stages[0],'KINGDOM_WORKERS',f.get('workers'),false);
    f.setCustomVariable(stages[0],'KINGDOM_ARCHERS',f.get('archers'),false);
    f.setCustomVariable(stages[0],'KINGDOM_WALL',f.get('wall'),false);
    f.setCustomVariable(stages[0],'KINGDOM_WALL_HP',f.get('wallHp'),false);
  }
  // Scout prefab has two saved native patrol templates: spawn -> wall, wall -> crown.
  // Ownership confines cleanup to this controller's spawned wave.
  const owned=f.getListOfEntitiesOwnedByTheEntity(evt.eventSourceEntity);
  const enemies=f.getEntityListBySpecifiedPrefabId(owned,1082130441);
  const idleUnits=f.getEntityListBySpecifiedPrefabId(owned,1082130439);
  const workerUnits=f.getEntityListBySpecifiedPrefabId(owned,1082130440);
  const archerUnits=f.getEntityListBySpecifiedPrefabId(owned,1082130442);
  const wallUnits=f.getEntityListBySpecifiedPrefabId(owned,1077936136);
  let idleAlive=0n;let workerAlive=0n;let archerAlive=0n;
  for(const unit of idleUnits){if(f.queryIfEntityIsOnTheField(unit)&&f.getCreationAttribute(unit).currentHp>0)idleAlive+=1n;else f.destroyEntity(unit);}
  for(const unit of workerUnits){if(f.queryIfEntityIsOnTheField(unit)&&f.getCreationAttribute(unit).currentHp>0)workerAlive+=1n;else f.destroyEntity(unit);}
  for(const unit of archerUnits){if(f.queryIfEntityIsOnTheField(unit)&&f.getCreationAttribute(unit).currentHp>0)archerAlive+=1n;else f.destroyEntity(unit);}
  f.set('idle',idleAlive);f.set('workers',workerAlive);f.set('archers',archerAlive);
  // Initial population belongs to this controller, just like recruited units.
  // Retry only missing living units, at most three rounds per run. The first day
  // starts only after real entities exist; failed creation never invents counts.
  if(!f.get('rosterReady')){
    const rosterPlayers=f.getListOfPlayerEntitiesOnTheField();
    if(rosterPlayers.length!==1)return;
    if(now<f.get('rosterRetryAt') || f.get('rosterAttempts')>=3n)return;
    f.set('rosterAttempts',f.get('rosterAttempts')+1n);f.set('rosterRetryAt',now+5n);
    for(const slot of [0n,1n,2n,3n]){
      if(slot>=idleAlive){
        const unit=f.createPrefab(1082130439,f.create3dVector(6,8,Number(idleAlive)*0.8+3),[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
        if(f.queryIfEntityIsOnTheField(unit)&&f.getCreationAttribute(unit).currentHp>0){f.modifyEntityFaction(unit,f.queryEntityFaction(rosterPlayers[0]));idleAlive+=1n;}
      }
    }
    for(const slot of [0n,1n,2n,3n]){
      if(slot>=archerAlive){
        const unit=f.createPrefab(1082130442,f.create3dVector(30,8,Number(archerAlive)*0.8+3),[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
        if(f.queryIfEntityIsOnTheField(unit)&&f.getCreationAttribute(unit).currentHp>0){f.modifyEntityFaction(unit,f.queryEntityFaction(rosterPlayers[0]));archerAlive+=1n;}
      }
    }
    for(const slot of [0n,1n]){
      if(slot>=workerAlive){
        const unit=f.createPrefab(1082130440,f.create3dVector(12,8,Number(workerAlive)*0.8+3),[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
        if(f.queryIfEntityIsOnTheField(unit)&&f.getCreationAttribute(unit).currentHp>0){f.modifyEntityFaction(unit,f.queryEntityFaction(rosterPlayers[0]));workerAlive+=1n;}
      }
    }
    f.set('idle',idleAlive);f.set('workers',workerAlive);f.set('archers',archerAlive);
    if(idleAlive===4n && workerAlive===2n && archerAlive===4n){
      // Station signs keep their default faction: with the player's faction the scouts
      // treat them as targets and circle the unreachable sign instead of advancing.
      // Static native nameplate selections label stations once per completed roster.
      // Official stage restart discards these markers with the old population.
      const keepSign=f.createPrefab(1077936137,[0,9,8],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
      if(f.queryIfEntityIsOnTheField(keepSign)){
        f.setEntityActiveNameplate(keepSign,[new configId(1)]);
      }
      const recruitSign=f.createPrefab(1077936137,[6,9,8],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
      if(f.queryIfEntityIsOnTheField(recruitSign)){
        f.setEntityActiveNameplate(recruitSign,[new configId(2)]);
      }
      const workerSign=f.createPrefab(1077936137,[12,9,8],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
      if(f.queryIfEntityIsOnTheField(workerSign)){
        f.setEntityActiveNameplate(workerSign,[new configId(3)]);
      }
      const archerSign=f.createPrefab(1077936137,[18,9,8],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
      if(f.queryIfEntityIsOnTheField(archerSign)){
        f.setEntityActiveNameplate(archerSign,[new configId(4)]);
      }
      const wallSign=f.createPrefab(1077936137,[24,9,8],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
      if(f.queryIfEntityIsOnTheField(wallSign)){
        f.setEntityActiveNameplate(wallSign,[new configId(5)]);
      }
      const bankSign=f.createPrefab(1077936137,[30,9,8],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
      if(f.queryIfEntityIsOnTheField(bankSign)){
        f.setEntityActiveNameplate(bankSign,[new configId(6)]);
      }
      f.set('rosterReady',true);f.set('deadline',now+60n);f.printString('KINGDOM_ROSTER_READY');
    }else if(f.get('rosterAttempts')>=3n)f.printString('KINGDOM_ROSTER_FAILED');
    return;
  }
  // The deadline stops reinforcements; surviving enemies keep their native
  // combat and patrol until the wave is actually resolved.
  let enemiesAlive=0n;
  if(f.get('night')){
    if(now>=f.get('deadline'))f.set('waveLeft',0n);
    // Sample one owned enemy every five seconds, before cleanup or movement.
    // These observations diagnose engine behavior; a motion request proves no movement.
    if(now>=f.get('enemySampleAt')){
      f.set('enemySampleAt',now+5n);
      f.printString('KINGDOM_DEFENDERS');
      f.printString(f.dataTypeConversion(f.get('archers'),'str'));
      if(enemies.length===0)f.printString('KINGDOM_ENEMY_SAMPLE_NONE');
      else{
        const sampled=enemies[0];
        if(!f.queryIfEntityIsOnTheField(sampled))f.printString('KINGDOM_ENEMY_SAMPLE_MISSING');
        else{
          const sampledPos=f.split3dVector(f.getEntityLocationAndRotation(sampled).location);
          const sampledHp=f.getCreationAttribute(sampled).currentHp;
          // Explicit conversion nodes: JS template interpolation serializes runtime
          // handles as [object Object] in the pinned compiler, not their values.
          f.printString('KINGDOM_ENEMY_SAMPLE_BEGIN');
          f.printString(f.dataTypeConversion(sampledPos.xComponent,'str'));
          f.printString(f.dataTypeConversion(sampledPos.yComponent,'str'));
          f.printString(f.dataTypeConversion(sampledPos.zComponent,'str'));
          f.printString(f.dataTypeConversion(sampledHp,'str'));
          f.printString('KINGDOM_ENEMY_SAMPLE_END');
        }
      }
      // Observe target identity and actual faction relations without driving AI.
      if(f.get('archers')>0n && f.get('wall')>0n){
        for(const archer of archerUnits){
          if(f.queryIfEntityIsOnTheField(archer)&&f.getCreationAttribute(archer).currentHp>0){
            const target=f.getCreationSCurrentTarget(archer);
            let hasWall=false;let targetIsWall=false;let hostileToWall=false;
            for(const part of wallUnits){
              if(f.queryIfEntityIsOnTheField(part)&&f.split3dVector(f.getEntityLocationAndRotation(part).location).xComponent>=31){
                hasWall=true;
                if(target===part)targetIsWall=true;
                if(f.queryIfFactionIsHostile(f.queryEntityFaction(archer),f.queryEntityFaction(part)))hostileToWall=true;
              }
            }
            if(hasWall){
              if(targetIsWall)f.printString('KINGDOM_ARCHER_TARGET_WALL');
              else f.printString('KINGDOM_ARCHER_TARGET_NOT_WALL');
              if(hostileToWall)f.printString('KINGDOM_ARCHER_WALL_HOSTILE_TRUE');
              else f.printString('KINGDOM_ARCHER_WALL_HOSTILE_FALSE');
            }
            break;
          }
        }
      }
    }
    for(const enemy of enemies){
      if(!f.queryIfEntityIsOnTheField(enemy))continue;
      if(f.getCreationAttribute(enemy).currentHp<=0){f.destroyEntity(enemy);f.printString('KINGDOM_ENEMY_DEFEATED');continue;}
      const location=f.split3dVector(f.getEntityLocationAndRotation(enemy).location);
      const patrol=f.getCurrentCreationSPatrolTemplate(enemy);
      if(location.xComponent<=34 && patrol.patrolTemplateId===1n && f.get('wall')>0n){
        // Template 1 ends at the wall. Native patrol holds there until the wall
        // breaks; creatures must not be driven by an object motion component.
        f.set('wallHp',f.get('wallHp')-1n);
        f.printString('KINGDOM_WALL_HIT');
        if(f.get('wallHp')<=0n){
          f.set('wall',0n);f.set('wallHp',0n);
          // The keep also uses timber pillars; only remove the eastern wall.
          for(const part of wallUnits){if(f.split3dVector(f.getEntityLocationAndRotation(part).location).xComponent>=31)f.destroyEntity(part);}
          f.printString('KINGDOM_WALL_BROKEN');
        }
      }else if(location.xComponent<=34 && patrol.patrolTemplateId===1n){
        // Switch once: repeating a switch would restart the route each tick.
        f.switchCreationPatrolTemplate(enemy,2n);
        f.printString('KINGDOM_ENEMY_BREACH');
      }
      if(location.xComponent<=6){
        f.destroyEntity(enemy);f.set('crown',f.get('crown')-1n);f.printString('KINGDOM_CROWN_HIT');
      }else enemiesAlive+=1n;
    }
    if(f.get('crown')<=0n){
      f.set('crown',0n);f.set('state',2n);f.set('waveLeft',0n);f.printString('KINGDOM_DEFEAT');
      const defeatPlayers=f.getListOfPlayerEntitiesOnTheField();
      if(defeatPlayers.length===1){
        // Latch before requesting settlement so later timer events cannot
        // resubmit it or silently restart while the official page is open.
        f.set('settlementRequested',true);
        f.setPlayerSettlementSuccessStatus(defeatPlayers[0],SettlementStatus.Defeat);
        f.settleStage();
      }
      return;
    }
    if(f.get('waveLeft')>0n && now>=f.get('nextSpawn') && now<f.get('deadline')){
      const spawned=f.createPrefab(1082130441,[39,8,0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
      f.set('nextSpawn',now+5n);
      if(f.queryIfEntityIsOnTheField(spawned)){f.set('waveLeft',f.get('waveLeft')-1n);f.printString('KINGDOM_ENEMY_SPAWN');}
      else f.printString('KINGDOM_ENEMY_SPAWN_FAILED');
    }
  }
  // Temporary spatial interaction adapter: one purchase after two seconds,
  // rearmed only by leaving. Final scene must visibly label these stations.
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length===1){
    const characters=f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0]);
    if(characters.length===1){
    const character=characters[0];
    const pos=f.split3dVector(f.getEntityLocationAndRotation(character).location);
    const x=pos.xComponent;const y=pos.yComponent;const z=pos.zComponent;
    let station=0n;
    if(y>=3 && y<=9 && z>=-2 && z<=2){
      if(x>=-2 && x<=2)station=8n;
      if(x>=4 && x<=8)station=1n;
      if(x>=10 && x<=14)station=2n;
      if(x>=16 && x<=20)station=3n;
      if(x>=22 && x<=26)station=4n;
      if(x>=28 && x<=32)station=5n;
      if(x>=-14 && x<=-10)station=6n;
      if(x>=-26 && x<=-22)station=7n;
    }
    if(station!==f.get('station')){
      f.set('station',station);f.set('enteredAt',now);f.set('spent',false);
    }
    if(station!==0n && !f.get('spent') && now>=f.get('enteredAt')+2n){
      f.set('spent',true);
      const coins=f.get('coins');const idle=f.get('idle');
      const keepCost=4n+f.get('keepLevel')*2n;
      if(station===8n && f.get('keepLevel')<2n && coins>=keepCost){
        const left=f.createPrefab(1077936136,f.create3dVector(-2,8+Number(f.get('keepLevel'))*2,-3),[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
        const right=f.createPrefab(1077936136,f.create3dVector(2,8+Number(f.get('keepLevel'))*2,-3),[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
        if(f.queryIfEntityIsOnTheField(left)&&f.queryIfEntityIsOnTheField(right)){
          f.modifyEntityFaction(left,f.queryEntityFaction(players[0]));
          f.modifyEntityFaction(right,f.queryEntityFaction(players[0]));
          f.set('coins',coins-keepCost);f.set('keepLevel',f.get('keepLevel')+1n);f.printString('KINGDOM_KEEP_UPGRADED');
        }else{
          if(f.queryIfEntityIsOnTheField(left))f.destroyEntity(left);
          if(f.queryIfEntityIsOnTheField(right))f.destroyEntity(right);
          f.printString('KINGDOM_KEEP_BUILD_FAILED');
        }
      }
      // Each expedition cache rewards once per run. Time spent exploring
      // still advances the night; returning does not replenish the cache.
      if(station===6n && !f.get('groveFound')){
        f.set('groveFound',true);f.set('coins',coins+6n);f.printString('KINGDOM_GROVE_FOUND');
      }
      if(station===7n && !f.get('ruinsFound')){
        f.set('ruinsFound',true);f.set('coins',coins+10n);f.printString('KINGDOM_RUINS_FOUND');
      }
      if(station===1n && coins>=2n && idle+f.get('workers')+f.get('archers')<12n){
        const recruit=f.createPrefab(1082130439,f.create3dVector(6,8,Number(idle)*0.8+3),[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
        if(f.queryIfEntityIsOnTheField(recruit)){f.modifyEntityFaction(recruit,f.queryEntityFaction(players[0]));f.set('coins',coins-2n);f.set('idle',idle+1n);f.printString('KINGDOM_RECRUIT');}
      }
      if(station===2n && f.get('keepLevel')>=1n && coins>=3n && idle>0n){
        for(const unit of idleUnits){if(f.queryIfEntityIsOnTheField(unit)&&f.getCreationAttribute(unit).currentHp>0){
          const worker=f.createPrefab(1082130440,f.create3dVector(12,8,Number(f.get('workers'))*0.8+3),[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
          if(f.queryIfEntityIsOnTheField(worker)){f.modifyEntityFaction(worker,f.queryEntityFaction(players[0]));f.destroyEntity(unit);f.set('coins',coins-3n);f.set('idle',idle-1n);f.set('workers',f.get('workers')+1n);f.printString('KINGDOM_WORKER');}break;
        }}
      }
      if(station===3n && f.get('keepLevel')>=2n && coins>=4n && idle>0n){
        for(const unit of idleUnits){if(f.queryIfEntityIsOnTheField(unit)&&f.getCreationAttribute(unit).currentHp>0){
          const archer=f.createPrefab(1082130442,f.create3dVector(30,8,Number(f.get('archers'))*0.8+3),[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
          if(f.queryIfEntityIsOnTheField(archer)){f.modifyEntityFaction(archer,f.queryEntityFaction(players[0]));f.destroyEntity(unit);f.set('coins',coins-4n);f.set('idle',idle-1n);f.set('archers',f.get('archers')+1n);f.printString('KINGDOM_ARCHER');}break;
        }}
      }
      const cost=(f.get('wall')+1n)*4n;
      if(station===4n && f.get('wall')<3n && f.get('workers')>0n && coins>=cost){
        const left=f.createPrefab(1077936136,f.create3dVector(33+Number(f.get('wall'))*0.35,7.75,-4),[90,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
        const right=f.createPrefab(1077936136,f.create3dVector(33+Number(f.get('wall'))*0.35,7.75,0),[90,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
        if(f.queryIfEntityIsOnTheField(left)&&f.queryIfEntityIsOnTheField(right)){
          f.modifyEntityFaction(left,f.queryEntityFaction(players[0]));
          f.modifyEntityFaction(right,f.queryEntityFaction(players[0]));
          f.set('coins',coins-cost);f.set('wall',f.get('wall')+1n);f.set('wallHp',cost/4n*15n);f.printString('KINGDOM_BUILD');
        }
        else{if(f.queryIfEntityIsOnTheField(left))f.destroyEntity(left);if(f.queryIfEntityIsOnTheField(right))f.destroyEntity(right);}
      }
      if(station===5n && f.get('bank')>0n){
        f.set('coins',coins+f.get('bank'));f.set('bank',0n);f.printString('KINGDOM_COLLECT');
      }
    }
    }else{f.set('station',0n);f.set('spent',false);}
  }else{f.set('station',0n);f.set('spent',false);}
  if(now<f.get('deadline'))return;
  if(!f.get('night')){
    // Reinforcements have a 45-second window. Native combat may extend the night.
    f.set('night',true);f.set('deadline',now+45n);
    let count=f.get('day')+2n;if(count>6n)count=6n;
    f.set('waveLeft',count);f.set('nextSpawn',now);
    f.printString('KINGDOM_NIGHT');
    return;
  }
  if(enemiesAlive>0n)return;
  f.set('waveLeft',0n);
  f.printString('KINGDOM_WAVE_CLEARED');
  f.set('night',false);f.set('day',f.get('day')+1n);
  f.set('bank',f.get('bank')+f.get('workers')*2n);
  f.set('deadline',now+60n);
  f.printString('KINGDOM_DAWN');
})

