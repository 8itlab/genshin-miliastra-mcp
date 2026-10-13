/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { SettlementStatus, UIControlGroupStatus } from 'genshin-ts/definitions/enum'
import { guid } from 'genshin-ts/runtime/value'

// Kingdom v2: a compact take on Kingdom Two Crowns.
// Layout along x: keep 0, vagrant camp 5, hammer shop 10, bow shop 15, wall site 20 (wall at 23), portal 30.
// Everything stays within about 33 m, because creatures far from every player stop acting.
// Spend coins by standing at a station for two seconds. Nights release hilichurls from the
// portal; they were imported dormant and are created by GUID, and walk the saved patrol paths toward the keep. Each hit on the monarch costs a
// coin, and a hit with an empty purse loses the crown. Surviving four nights wins.
// The purse is shown as a row of gold cubes in front of the keep, since custom text is unavailable.
g.server({id:1073741908,name:'_GSTS_KingdomEconomy',variables:{
  day:1n,night:false,deadline:0n,coins:8n,keepLevel:0n,wall:false,wallHp:0n,
  station:0n,enteredAt:0n,spent:false,lastTick:-1n,state:1n,settled:false,
  placed:false,ready:false,rosterDone:false,lastHp:0,cursor:0n,waveEnd:0n,nextSpawn:0n,
  route0:0n,route1:0n,route2:0n,route3:0n,route4:0n,route5:0n,route6:0n,route7:0n,route8:0n,route9:0n,route10:0n,route11:0n
}})
.on('whenEntityIsCreated',(evt,f)=>{
  f.set('day',1n);f.set('night',false);f.set('coins',8n);f.set('keepLevel',0n);
  f.set('wall',false);f.set('wallHp',0n);f.set('station',0n);f.set('spent',false);
  f.set('lastTick',-1n);f.set('state',1n);f.set('settled',false);
  f.set('placed',false);f.set('ready',false);f.set('rosterDone',false);f.set('lastHp',0);
  f.set('cursor',0n);f.set('waveEnd',0n);
  f.set('route0',0n);f.set('route1',0n);f.set('route2',0n);f.set('route3',0n);f.set('route4',0n);f.set('route5',0n);f.set('route6',0n);f.set('route7',0n);f.set('route8',0n);f.set('route9',0n);f.set('route10',0n);f.set('route11',0n);
  f.startTimer(evt.eventSourceEntity,'KINGDOM_CLOCK',true,[1]);
  f.printString('KV_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='KINGDOM_CLOCK')return;
  const now=f.queryGameTimeElapsed();
  if(now===f.get('lastTick'))return;
  f.set('lastTick',now);
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const characters=f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0]);
  if(characters.length!==1)return;
  const monarch=characters[0];
  // The run is over: hand the result to the official settlement screen once.
  if(f.get('state')!==1n){
    if(f.get('settled'))return;
    f.set('settled',true);
    if(f.get('state')===2n)f.setPlayerSettlementSuccessStatus(players[0],SettlementStatus.Defeat);
    if(f.get('state')===3n)f.setPlayerSettlementSuccessStatus(players[0],SettlementStatus.Victory);
    f.settleStage();return;
  }
  if(!f.get('placed')){
    f.teleportPlayer(players[0],[2,8,0],[0,90,0]);
    f.set('placed',true);return;
  }
  if(!f.get('ready')){
    f.switchMainCameraTemplate(players,'自定义镜头');
    f.setPlayerCameraToFollowEntity(players[0],monarch,'自定义镜头');
    f.switchCurrentInterfaceLayout(players[0],1073741825n);
    // The saved text panel renders as a blank white box on this account; hide it.
    f.modifyUiControlStatusWithinTheInterfaceLayout(players[0],1073741843n,UIControlGroupStatus.Hidden);
    f.setCurrentEnvironmentTime(10);f.setEnvironmentTimePassageSpeed(0);
    f.set('ready',true);f.set('deadline',now+45n);
    f.set('lastHp',f.getCharacterAttribute(monarch).currentHp);
    f.printString('KV_DAY');return;
  }
  const owned=f.getListOfEntitiesOwnedByTheEntity(evt.eventSourceEntity);
  const idleUnits=f.getEntityListBySpecifiedPrefabId(owned,1082130439);
  const workerUnits=f.getEntityListBySpecifiedPrefabId(owned,1082130440);
  const archerUnits=f.getEntityListBySpecifiedPrefabId(owned,1082130442);
  let idle=0n;let workers=0n;let archers=0n;
  for(const unit of idleUnits){if(f.queryIfEntityIsOnTheField(unit)&&f.getCreationAttribute(unit).currentHp>0)idle+=1n;else f.destroyEntity(unit);}
  for(const unit of workerUnits){if(f.queryIfEntityIsOnTheField(unit)&&f.getCreationAttribute(unit).currentHp>0)workers+=1n;else f.destroyEntity(unit);}
  for(const unit of archerUnits){if(f.queryIfEntityIsOnTheField(unit)&&f.getCreationAttribute(unit).currentHp>0)archers+=1n;else f.destroyEntity(unit);}
  if(!f.get('rosterDone')){
    // Two vagrants by the camp and one archer near the wall site to start with.
    for(const slot of [0n,1n]){
      const unit=f.createPrefab(1082130439,f.create3dVector(5,8,Number(slot)*0.9+2.6),[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
      if(f.queryIfEntityIsOnTheField(unit))f.modifyEntityFaction(unit,f.queryEntityFaction(players[0]));
    }
    const first=f.createPrefab(1082130442,[20.5,8,1.6],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
    if(f.queryIfEntityIsOnTheField(first))f.modifyEntityFaction(first,f.queryEntityFaction(players[0]));
    f.set('rosterDone',true);f.printString('KV_ROSTER');return;
  }
  // Purse display: one gold cube per coin, up to twelve.
  const coin0=f.queryEntityByGuid(new guid(1077940224));
  const shown0=f.queryIfEntityIsOnTheField(coin0);
  if(f.get('coins')>0n&&!shown0)f.createEntity(new guid(1077940224),[] as bigint[]);
  if(f.get('coins')<=0n&&shown0)f.removeEntity(coin0);
  const coin1=f.queryEntityByGuid(new guid(1077940225));
  const shown1=f.queryIfEntityIsOnTheField(coin1);
  if(f.get('coins')>1n&&!shown1)f.createEntity(new guid(1077940225),[] as bigint[]);
  if(f.get('coins')<=1n&&shown1)f.removeEntity(coin1);
  const coin2=f.queryEntityByGuid(new guid(1077940226));
  const shown2=f.queryIfEntityIsOnTheField(coin2);
  if(f.get('coins')>2n&&!shown2)f.createEntity(new guid(1077940226),[] as bigint[]);
  if(f.get('coins')<=2n&&shown2)f.removeEntity(coin2);
  const coin3=f.queryEntityByGuid(new guid(1077940227));
  const shown3=f.queryIfEntityIsOnTheField(coin3);
  if(f.get('coins')>3n&&!shown3)f.createEntity(new guid(1077940227),[] as bigint[]);
  if(f.get('coins')<=3n&&shown3)f.removeEntity(coin3);
  const coin4=f.queryEntityByGuid(new guid(1077940228));
  const shown4=f.queryIfEntityIsOnTheField(coin4);
  if(f.get('coins')>4n&&!shown4)f.createEntity(new guid(1077940228),[] as bigint[]);
  if(f.get('coins')<=4n&&shown4)f.removeEntity(coin4);
  const coin5=f.queryEntityByGuid(new guid(1077940229));
  const shown5=f.queryIfEntityIsOnTheField(coin5);
  if(f.get('coins')>5n&&!shown5)f.createEntity(new guid(1077940229),[] as bigint[]);
  if(f.get('coins')<=5n&&shown5)f.removeEntity(coin5);
  const coin6=f.queryEntityByGuid(new guid(1077940230));
  const shown6=f.queryIfEntityIsOnTheField(coin6);
  if(f.get('coins')>6n&&!shown6)f.createEntity(new guid(1077940230),[] as bigint[]);
  if(f.get('coins')<=6n&&shown6)f.removeEntity(coin6);
  const coin7=f.queryEntityByGuid(new guid(1077940231));
  const shown7=f.queryIfEntityIsOnTheField(coin7);
  if(f.get('coins')>7n&&!shown7)f.createEntity(new guid(1077940231),[] as bigint[]);
  if(f.get('coins')<=7n&&shown7)f.removeEntity(coin7);
  const coin8=f.queryEntityByGuid(new guid(1077940232));
  const shown8=f.queryIfEntityIsOnTheField(coin8);
  if(f.get('coins')>8n&&!shown8)f.createEntity(new guid(1077940232),[] as bigint[]);
  if(f.get('coins')<=8n&&shown8)f.removeEntity(coin8);
  const coin9=f.queryEntityByGuid(new guid(1077940233));
  const shown9=f.queryIfEntityIsOnTheField(coin9);
  if(f.get('coins')>9n&&!shown9)f.createEntity(new guid(1077940233),[] as bigint[]);
  if(f.get('coins')<=9n&&shown9)f.removeEntity(coin9);
  const coin10=f.queryEntityByGuid(new guid(1077940234));
  const shown10=f.queryIfEntityIsOnTheField(coin10);
  if(f.get('coins')>10n&&!shown10)f.createEntity(new guid(1077940234),[] as bigint[]);
  if(f.get('coins')<=10n&&shown10)f.removeEntity(coin10);
  const coin11=f.queryEntityByGuid(new guid(1077940235));
  const shown11=f.queryIfEntityIsOnTheField(coin11);
  if(f.get('coins')>11n&&!shown11)f.createEntity(new guid(1077940235),[] as bigint[]);
  if(f.get('coins')<=11n&&shown11)f.removeEntity(coin11);
  // A hit on the monarch costs one coin; with an empty purse it costs the crown.
  const hp=f.getCharacterAttribute(monarch).currentHp;
  if(hp<f.get('lastHp')-0.5){
    if(f.get('coins')>0n){f.set('coins',f.get('coins')-1n);f.printString('KV_COIN_STOLEN');}
    else{
      const crown=f.queryEntityByGuid(new guid(1077940236));
      if(f.queryIfEntityIsOnTheField(crown))f.removeEntity(crown);
      f.set('state',2n);f.printString('KV_CROWN_LOST');return;
    }
  }
  f.set('lastHp',hp);
  if(f.get('night')){
    const cursor=f.get('cursor');
    if(cursor<f.get('waveEnd')&&now>=f.get('nextSpawn')){
      if(cursor===0n)f.createEntity(new guid(1082130440),[] as bigint[]);
      if(cursor===1n)f.createEntity(new guid(1082130441),[] as bigint[]);
      if(cursor===2n)f.createEntity(new guid(1082130442),[] as bigint[]);
      if(cursor===3n)f.createEntity(new guid(1082130443),[] as bigint[]);
      if(cursor===4n)f.createEntity(new guid(1082130444),[] as bigint[]);
      if(cursor===5n)f.createEntity(new guid(1082130445),[] as bigint[]);
      if(cursor===6n)f.createEntity(new guid(1082130446),[] as bigint[]);
      if(cursor===7n)f.createEntity(new guid(1082130447),[] as bigint[]);
      if(cursor===8n)f.createEntity(new guid(1082130448),[] as bigint[]);
      if(cursor===9n)f.createEntity(new guid(1082130449),[] as bigint[]);
      if(cursor===10n)f.createEntity(new guid(1082130450),[] as bigint[]);
      if(cursor===11n)f.createEntity(new guid(1082130451),[] as bigint[]);
      f.set('cursor',cursor+1n);f.set('nextSpawn',now+3n);f.printString('KV_ENEMY_OUT');
    }
    let enemiesAlive=0n;let atWall=0n;
    const enemy0=f.queryEntityByGuid(new guid(1082130440));
    if(f.queryIfEntityIsOnTheField(enemy0)){
      enemiesAlive+=1n;
      const at0=f.split3dVector(f.getEntityLocationAndRotation(enemy0).location);
      if(at0.xComponent<=26.5&&at0.xComponent>=19.5)atWall+=1n;
      // Patrol 1 stops in front of the wall site; with no wall standing the enemy takes patrol 2 on to the keep.
      // The order is given once per change: repeating it every second keeps restarting the walk.
      const want0=f.get('wall')?1n:2n;
      if(f.get('route0')<want0){f.switchCreationPatrolTemplate(enemy0,want0);f.set('route0',want0);}
    }
    const enemy1=f.queryEntityByGuid(new guid(1082130441));
    if(f.queryIfEntityIsOnTheField(enemy1)){
      enemiesAlive+=1n;
      const at1=f.split3dVector(f.getEntityLocationAndRotation(enemy1).location);
      if(at1.xComponent<=26.5&&at1.xComponent>=19.5)atWall+=1n;
      // Patrol 1 stops in front of the wall site; with no wall standing the enemy takes patrol 2 on to the keep.
      // The order is given once per change: repeating it every second keeps restarting the walk.
      const want1=f.get('wall')?1n:2n;
      if(f.get('route1')<want1){f.switchCreationPatrolTemplate(enemy1,want1);f.set('route1',want1);}
    }
    const enemy2=f.queryEntityByGuid(new guid(1082130442));
    if(f.queryIfEntityIsOnTheField(enemy2)){
      enemiesAlive+=1n;
      const at2=f.split3dVector(f.getEntityLocationAndRotation(enemy2).location);
      if(at2.xComponent<=26.5&&at2.xComponent>=19.5)atWall+=1n;
      // Patrol 1 stops in front of the wall site; with no wall standing the enemy takes patrol 2 on to the keep.
      // The order is given once per change: repeating it every second keeps restarting the walk.
      const want2=f.get('wall')?1n:2n;
      if(f.get('route2')<want2){f.switchCreationPatrolTemplate(enemy2,want2);f.set('route2',want2);}
    }
    const enemy3=f.queryEntityByGuid(new guid(1082130443));
    if(f.queryIfEntityIsOnTheField(enemy3)){
      enemiesAlive+=1n;
      const at3=f.split3dVector(f.getEntityLocationAndRotation(enemy3).location);
      if(at3.xComponent<=26.5&&at3.xComponent>=19.5)atWall+=1n;
      // Patrol 1 stops in front of the wall site; with no wall standing the enemy takes patrol 2 on to the keep.
      // The order is given once per change: repeating it every second keeps restarting the walk.
      const want3=f.get('wall')?1n:2n;
      if(f.get('route3')<want3){f.switchCreationPatrolTemplate(enemy3,want3);f.set('route3',want3);}
    }
    const enemy4=f.queryEntityByGuid(new guid(1082130444));
    if(f.queryIfEntityIsOnTheField(enemy4)){
      enemiesAlive+=1n;
      const at4=f.split3dVector(f.getEntityLocationAndRotation(enemy4).location);
      if(at4.xComponent<=26.5&&at4.xComponent>=19.5)atWall+=1n;
      // Patrol 1 stops in front of the wall site; with no wall standing the enemy takes patrol 2 on to the keep.
      // The order is given once per change: repeating it every second keeps restarting the walk.
      const want4=f.get('wall')?1n:2n;
      if(f.get('route4')<want4){f.switchCreationPatrolTemplate(enemy4,want4);f.set('route4',want4);}
    }
    const enemy5=f.queryEntityByGuid(new guid(1082130445));
    if(f.queryIfEntityIsOnTheField(enemy5)){
      enemiesAlive+=1n;
      const at5=f.split3dVector(f.getEntityLocationAndRotation(enemy5).location);
      if(at5.xComponent<=26.5&&at5.xComponent>=19.5)atWall+=1n;
      // Patrol 1 stops in front of the wall site; with no wall standing the enemy takes patrol 2 on to the keep.
      // The order is given once per change: repeating it every second keeps restarting the walk.
      const want5=f.get('wall')?1n:2n;
      if(f.get('route5')<want5){f.switchCreationPatrolTemplate(enemy5,want5);f.set('route5',want5);}
    }
    const enemy6=f.queryEntityByGuid(new guid(1082130446));
    if(f.queryIfEntityIsOnTheField(enemy6)){
      enemiesAlive+=1n;
      const at6=f.split3dVector(f.getEntityLocationAndRotation(enemy6).location);
      if(at6.xComponent<=26.5&&at6.xComponent>=19.5)atWall+=1n;
      // Patrol 1 stops in front of the wall site; with no wall standing the enemy takes patrol 2 on to the keep.
      // The order is given once per change: repeating it every second keeps restarting the walk.
      const want6=f.get('wall')?1n:2n;
      if(f.get('route6')<want6){f.switchCreationPatrolTemplate(enemy6,want6);f.set('route6',want6);}
    }
    const enemy7=f.queryEntityByGuid(new guid(1082130447));
    if(f.queryIfEntityIsOnTheField(enemy7)){
      enemiesAlive+=1n;
      const at7=f.split3dVector(f.getEntityLocationAndRotation(enemy7).location);
      if(at7.xComponent<=26.5&&at7.xComponent>=19.5)atWall+=1n;
      // Patrol 1 stops in front of the wall site; with no wall standing the enemy takes patrol 2 on to the keep.
      // The order is given once per change: repeating it every second keeps restarting the walk.
      const want7=f.get('wall')?1n:2n;
      if(f.get('route7')<want7){f.switchCreationPatrolTemplate(enemy7,want7);f.set('route7',want7);}
    }
    const enemy8=f.queryEntityByGuid(new guid(1082130448));
    if(f.queryIfEntityIsOnTheField(enemy8)){
      enemiesAlive+=1n;
      const at8=f.split3dVector(f.getEntityLocationAndRotation(enemy8).location);
      if(at8.xComponent<=26.5&&at8.xComponent>=19.5)atWall+=1n;
      // Patrol 1 stops in front of the wall site; with no wall standing the enemy takes patrol 2 on to the keep.
      // The order is given once per change: repeating it every second keeps restarting the walk.
      const want8=f.get('wall')?1n:2n;
      if(f.get('route8')<want8){f.switchCreationPatrolTemplate(enemy8,want8);f.set('route8',want8);}
    }
    const enemy9=f.queryEntityByGuid(new guid(1082130449));
    if(f.queryIfEntityIsOnTheField(enemy9)){
      enemiesAlive+=1n;
      const at9=f.split3dVector(f.getEntityLocationAndRotation(enemy9).location);
      if(at9.xComponent<=26.5&&at9.xComponent>=19.5)atWall+=1n;
      // Patrol 1 stops in front of the wall site; with no wall standing the enemy takes patrol 2 on to the keep.
      // The order is given once per change: repeating it every second keeps restarting the walk.
      const want9=f.get('wall')?1n:2n;
      if(f.get('route9')<want9){f.switchCreationPatrolTemplate(enemy9,want9);f.set('route9',want9);}
    }
    const enemy10=f.queryEntityByGuid(new guid(1082130450));
    if(f.queryIfEntityIsOnTheField(enemy10)){
      enemiesAlive+=1n;
      const at10=f.split3dVector(f.getEntityLocationAndRotation(enemy10).location);
      if(at10.xComponent<=26.5&&at10.xComponent>=19.5)atWall+=1n;
      // Patrol 1 stops in front of the wall site; with no wall standing the enemy takes patrol 2 on to the keep.
      // The order is given once per change: repeating it every second keeps restarting the walk.
      const want10=f.get('wall')?1n:2n;
      if(f.get('route10')<want10){f.switchCreationPatrolTemplate(enemy10,want10);f.set('route10',want10);}
    }
    const enemy11=f.queryEntityByGuid(new guid(1082130451));
    if(f.queryIfEntityIsOnTheField(enemy11)){
      enemiesAlive+=1n;
      const at11=f.split3dVector(f.getEntityLocationAndRotation(enemy11).location);
      if(at11.xComponent<=26.5&&at11.xComponent>=19.5)atWall+=1n;
      // Patrol 1 stops in front of the wall site; with no wall standing the enemy takes patrol 2 on to the keep.
      // The order is given once per change: repeating it every second keeps restarting the walk.
      const want11=f.get('wall')?1n:2n;
      if(f.get('route11')<want11){f.switchCreationPatrolTemplate(enemy11,want11);f.set('route11',want11);}
    }
    if(f.get('wall')&&atWall>0n){
      f.set('wallHp',f.get('wallHp')-atWall);
      if(f.get('wallHp')<=0n){
        const wall=f.queryEntityByGuid(new guid(1077940219));
        if(f.queryIfEntityIsOnTheField(wall))f.removeEntity(wall);
        f.set('wall',false);f.set('wallHp',0n);f.printString('KV_WALL_BROKEN');
      }
    }
    if(now>=f.get('deadline')){
      // Dawn: the Greed retreat, workers pay out, and the fourth dawn wins the game.
      if(f.queryIfEntityIsOnTheField(enemy0))f.removeEntity(enemy0);
      if(f.queryIfEntityIsOnTheField(enemy1))f.removeEntity(enemy1);
      if(f.queryIfEntityIsOnTheField(enemy2))f.removeEntity(enemy2);
      if(f.queryIfEntityIsOnTheField(enemy3))f.removeEntity(enemy3);
      if(f.queryIfEntityIsOnTheField(enemy4))f.removeEntity(enemy4);
      if(f.queryIfEntityIsOnTheField(enemy5))f.removeEntity(enemy5);
      if(f.queryIfEntityIsOnTheField(enemy6))f.removeEntity(enemy6);
      if(f.queryIfEntityIsOnTheField(enemy7))f.removeEntity(enemy7);
      if(f.queryIfEntityIsOnTheField(enemy8))f.removeEntity(enemy8);
      if(f.queryIfEntityIsOnTheField(enemy9))f.removeEntity(enemy9);
      if(f.queryIfEntityIsOnTheField(enemy10))f.removeEntity(enemy10);
      if(f.queryIfEntityIsOnTheField(enemy11))f.removeEntity(enemy11);
      f.set('night',false);f.set('coins',f.get('coins')+1n+workers*2n);
      f.setCurrentEnvironmentTime(10);
      f.printString('KV_DAWN');
      if(f.get('day')>=4n){f.set('state',3n);f.printString('KV_VICTORY');return;}
      f.set('day',f.get('day')+1n);f.set('deadline',now+45n);
    }
  }else if(now>=f.get('deadline')){
    f.set('night',true);f.set('deadline',now+60n);f.set('nextSpawn',now);
    if(f.get('day')===1n){f.set('cursor',0n);f.set('waveEnd',2n);}
    if(f.get('day')===2n){f.set('cursor',2n);f.set('waveEnd',5n);}
    if(f.get('day')===3n){f.set('cursor',5n);f.set('waveEnd',8n);}
    if(f.get('day')===4n){f.set('cursor',8n);f.set('waveEnd',12n);}
    f.setCurrentEnvironmentTime(22);
    f.printString('KV_NIGHT');
  }
  // Stations: stand inside one for two seconds to pay; step out to re-arm it.
  const pos=f.split3dVector(f.getEntityLocationAndRotation(monarch).location);
  const x=pos.xComponent;const z=pos.zComponent;
  let station=0n;
  if(z>=-2.5&&z<=2.5){
    if(x>=-1.5&&x<=1.5)station=1n;
    if(x>=3.5&&x<=6.5)station=2n;
    if(x>=8.5&&x<=11.5)station=3n;
    if(x>=13.5&&x<=16.5)station=4n;
    if(x>=18.5&&x<=21.5)station=5n;
  }
  if(station!==f.get('station')){f.set('station',station);f.set('enteredAt',now);f.set('spent',false);}
  if(station!==0n&&!f.get('spent')&&now>=f.get('enteredAt')+2n){
    f.set('spent',true);
    const purse=f.get('coins');
    if(station===1n&&f.get('keepLevel')<2n&&purse>=3n+f.get('keepLevel')*2n){
      f.set('coins',purse-3n-f.get('keepLevel')*2n);f.set('keepLevel',f.get('keepLevel')+1n);f.printString('KV_KEEP_UP');
    }
    if(station===2n&&purse>=2n&&idle+workers+archers<10n){
      const recruit=f.createPrefab(1082130439,f.create3dVector(5,8,Number(idle)*0.9+2.6),[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
      if(f.queryIfEntityIsOnTheField(recruit)){f.modifyEntityFaction(recruit,f.queryEntityFaction(players[0]));f.set('coins',purse-2n);f.printString('KV_RECRUIT');}
    }
    if(station===3n&&f.get('keepLevel')>=1n&&purse>=2n&&idle>0n){
      for(const unit of idleUnits){if(f.queryIfEntityIsOnTheField(unit)&&f.getCreationAttribute(unit).currentHp>0){
        const worker=f.createPrefab(1082130440,f.create3dVector(10,8,Number(workers)*0.9+2.6),[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
        if(f.queryIfEntityIsOnTheField(worker)){f.modifyEntityFaction(worker,f.queryEntityFaction(players[0]));f.destroyEntity(unit);f.set('coins',purse-2n);f.printString('KV_WORKER');}break;
      }}
    }
    if(station===4n&&f.get('keepLevel')>=2n&&purse>=3n&&idle>0n){
      for(const unit of idleUnits){if(f.queryIfEntityIsOnTheField(unit)&&f.getCreationAttribute(unit).currentHp>0){
        const archer=f.createPrefab(1082130442,f.create3dVector(20.5,8,Number(archers)*0.9-1.6),[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
        if(f.queryIfEntityIsOnTheField(archer)){f.modifyEntityFaction(archer,f.queryEntityFaction(players[0]));f.destroyEntity(unit);f.set('coins',purse-3n);f.printString('KV_ARCHER');}break;
      }}
    }
    if(station===5n&&!f.get('wall')&&workers>0n&&purse>=4n){
      f.createEntity(new guid(1077940219),[] as bigint[]);
      f.set('wall',true);f.set('wallHp',30n);f.set('coins',purse-4n);f.printString('KV_WALL_BUILT');
    }
  }
})
