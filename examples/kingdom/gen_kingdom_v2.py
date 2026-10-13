"""Generate the Kingdom v2 graph source from the GUIDs the editor assigned on import.

Usage: python gen_kingdom_v2.py <guids.json> <out.ts> [day_seconds] [night_seconds] [starting_coins]
guids.json maps piece names (KV_wall, KV_crown, KV_enemy_00.., KV_coin_00..) to GUIDs.
Per-piece statements are written out one by one: every piece has its own GUID literal.
"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
DAY = int(sys.argv[3]) if len(sys.argv) > 3 else 45
NIGHT = int(sys.argv[4]) if len(sys.argv) > 4 else 60
COINS = int(sys.argv[5]) if len(sys.argv) > 5 else 8
enemies = [guids[f'KV_enemy_{i:02d}'] for i in range(12)]
coins = [guids[f'KV_coin_{i:02d}'] for i in range(12)]
WALL, CROWN = guids['KV_wall'], guids['KV_crown']
# Night n releases enemies [start, end): 2, 3, 3 and 4 of the twelve.
WAVES = [(0, 2), (2, 5), (5, 8), (8, 12)]


def each(items, body):
    return '\n'.join(body(i, g) for i, g in enumerate(items))


spawn = each(enemies, lambda i, g: f"      if(cursor==={i}n)f.createEntity(new guid({g}),[] as bigint[]);")
count = each(enemies, lambda i, g: f"""    const enemy{i}=f.queryEntityByGuid(new guid({g}));
    if(f.queryIfEntityIsOnTheField(enemy{i})){{
      enemiesAlive+=1n;
      const at{i}=f.split3dVector(f.getEntityLocationAndRotation(enemy{i}).location);
      if(at{i}.xComponent<=26.5&&at{i}.xComponent>=19.5)atWall+=1n;
      // Patrol 1 stops in front of the wall site; with no wall standing the enemy takes patrol 2 on to the keep.
      // The order is given once per change: repeating it every second keeps restarting the walk.
      const want{i}=f.get('wall')?1n:2n;
      if(f.get('route{i}')<want{i}){{f.switchCreationPatrolTemplate(enemy{i},want{i});f.set('route{i}',want{i});}}
    }}""")
# The compiler rejects bare blocks, so every piece gets its own numbered names instead.
retreat = each(enemies, lambda i, g: f"      if(f.queryIfEntityIsOnTheField(enemy{i}))f.removeEntity(enemy{i});")
purse = each(coins, lambda i, g: f"""  const coin{i}=f.queryEntityByGuid(new guid({g}));
  const shown{i}=f.queryIfEntityIsOnTheField(coin{i});
  if(f.get('coins')>{i}n&&!shown{i})f.createEntity(new guid({g}),[] as bigint[]);
  if(f.get('coins')<={i}n&&shown{i})f.removeEntity(coin{i});""")
routes = ','.join(f'route{i}:0n' for i in range(12))
routes_reset = '  ' + ''.join(f"f.set('route{i}',0n);" for i in range(12))
waves = '\n'.join(f"    if(f.get('day')==={n + 1}n){{f.set('cursor',{a}n);f.set('waveEnd',{b}n);}}" for n, (a, b) in enumerate(WAVES))

source = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ SettlementStatus, UIControlGroupStatus }} from 'genshin-ts/definitions/enum'
import {{ guid }} from 'genshin-ts/runtime/value'

// Kingdom v2: a compact take on Kingdom Two Crowns.
// Layout along x: keep 0, vagrant camp 5, hammer shop 10, bow shop 15, wall site 20 (wall at 23), portal 30.
// Everything stays within about 33 m, because creatures far from every player stop acting.
// Spend coins by standing at a station for two seconds. Nights release hilichurls from the
// portal; they were imported dormant and are created by GUID, and walk the saved patrol paths toward the keep. Each hit on the monarch costs a
// coin, and a hit with an empty purse loses the crown. Surviving four nights wins.
// The purse is shown as a row of gold cubes in front of the keep, since custom text is unavailable.
g.server({{id:1073741908,name:'_GSTS_KingdomEconomy',variables:{{
  day:1n,night:false,deadline:0n,coins:{COINS}n,keepLevel:0n,wall:false,wallHp:0n,
  station:0n,enteredAt:0n,spent:false,lastTick:-1n,state:1n,settled:false,
  placed:false,ready:false,rosterDone:false,lastHp:0,cursor:0n,waveEnd:0n,nextSpawn:0n,
  {routes}
}}}})
.on('whenEntityIsCreated',(evt,f)=>{{
  f.set('day',1n);f.set('night',false);f.set('coins',{COINS}n);f.set('keepLevel',0n);
  f.set('wall',false);f.set('wallHp',0n);f.set('station',0n);f.set('spent',false);
  f.set('lastTick',-1n);f.set('state',1n);f.set('settled',false);
  f.set('placed',false);f.set('ready',false);f.set('rosterDone',false);f.set('lastHp',0);
  f.set('cursor',0n);f.set('waveEnd',0n);
{routes_reset}
  f.startTimer(evt.eventSourceEntity,'KINGDOM_CLOCK',true,[1]);
  f.printString('KV_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
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
  if(f.get('state')!==1n){{
    if(f.get('settled'))return;
    f.set('settled',true);
    if(f.get('state')===2n)f.setPlayerSettlementSuccessStatus(players[0],SettlementStatus.Defeat);
    if(f.get('state')===3n)f.setPlayerSettlementSuccessStatus(players[0],SettlementStatus.Victory);
    f.settleStage();return;
  }}
  if(!f.get('placed')){{
    f.teleportPlayer(players[0],[2,8,0],[0,90,0]);
    f.set('placed',true);return;
  }}
  if(!f.get('ready')){{
    f.switchMainCameraTemplate(players,'自定义镜头');
    f.setPlayerCameraToFollowEntity(players[0],monarch,'自定义镜头');
    f.switchCurrentInterfaceLayout(players[0],1073741825n);
    // The saved text panel renders as a blank white box on this account; hide it.
    f.modifyUiControlStatusWithinTheInterfaceLayout(players[0],1073741843n,UIControlGroupStatus.Hidden);
    f.setCurrentEnvironmentTime(10);f.setEnvironmentTimePassageSpeed(0);
    f.set('ready',true);f.set('deadline',now+{DAY}n);
    f.set('lastHp',f.getCharacterAttribute(monarch).currentHp);
    f.printString('KV_DAY');return;
  }}
  const owned=f.getListOfEntitiesOwnedByTheEntity(evt.eventSourceEntity);
  const idleUnits=f.getEntityListBySpecifiedPrefabId(owned,1082130439);
  const workerUnits=f.getEntityListBySpecifiedPrefabId(owned,1082130440);
  const archerUnits=f.getEntityListBySpecifiedPrefabId(owned,1082130442);
  let idle=0n;let workers=0n;let archers=0n;
  for(const unit of idleUnits){{if(f.queryIfEntityIsOnTheField(unit)&&f.getCreationAttribute(unit).currentHp>0)idle+=1n;else f.destroyEntity(unit);}}
  for(const unit of workerUnits){{if(f.queryIfEntityIsOnTheField(unit)&&f.getCreationAttribute(unit).currentHp>0)workers+=1n;else f.destroyEntity(unit);}}
  for(const unit of archerUnits){{if(f.queryIfEntityIsOnTheField(unit)&&f.getCreationAttribute(unit).currentHp>0)archers+=1n;else f.destroyEntity(unit);}}
  if(!f.get('rosterDone')){{
    // Two vagrants by the camp and one archer near the wall site to start with.
    for(const slot of [0n,1n]){{
      const unit=f.createPrefab(1082130439,f.create3dVector(5,8,Number(slot)*0.9+2.6),[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
      if(f.queryIfEntityIsOnTheField(unit))f.modifyEntityFaction(unit,f.queryEntityFaction(players[0]));
    }}
    const first=f.createPrefab(1082130442,[20.5,8,1.6],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
    if(f.queryIfEntityIsOnTheField(first))f.modifyEntityFaction(first,f.queryEntityFaction(players[0]));
    f.set('rosterDone',true);f.printString('KV_ROSTER');return;
  }}
  // Purse display: one gold cube per coin, up to twelve.
{purse}
  // A hit on the monarch costs one coin; with an empty purse it costs the crown.
  const hp=f.getCharacterAttribute(monarch).currentHp;
  if(hp<f.get('lastHp')-0.5){{
    if(f.get('coins')>0n){{f.set('coins',f.get('coins')-1n);f.printString('KV_COIN_STOLEN');}}
    else{{
      const crown=f.queryEntityByGuid(new guid({CROWN}));
      if(f.queryIfEntityIsOnTheField(crown))f.removeEntity(crown);
      f.set('state',2n);f.printString('KV_CROWN_LOST');return;
    }}
  }}
  f.set('lastHp',hp);
  if(f.get('night')){{
    const cursor=f.get('cursor');
    if(cursor<f.get('waveEnd')&&now>=f.get('nextSpawn')){{
{spawn}
      f.set('cursor',cursor+1n);f.set('nextSpawn',now+3n);f.printString('KV_ENEMY_OUT');
    }}
    let enemiesAlive=0n;let atWall=0n;
{count}
    if(f.get('wall')&&atWall>0n){{
      f.set('wallHp',f.get('wallHp')-atWall);
      if(f.get('wallHp')<=0n){{
        const wall=f.queryEntityByGuid(new guid({WALL}));
        if(f.queryIfEntityIsOnTheField(wall))f.removeEntity(wall);
        f.set('wall',false);f.set('wallHp',0n);f.printString('KV_WALL_BROKEN');
      }}
    }}
    if(now>=f.get('deadline')){{
      // Dawn: the Greed retreat, workers pay out, and the fourth dawn wins the game.
{retreat}
      f.set('night',false);f.set('coins',f.get('coins')+1n+workers*2n);
      f.setCurrentEnvironmentTime(10);
      f.printString('KV_DAWN');
      if(f.get('day')>=4n){{f.set('state',3n);f.printString('KV_VICTORY');return;}}
      f.set('day',f.get('day')+1n);f.set('deadline',now+{DAY}n);
    }}
  }}else if(now>=f.get('deadline')){{
    f.set('night',true);f.set('deadline',now+{NIGHT}n);f.set('nextSpawn',now);
{waves}
    f.setCurrentEnvironmentTime(22);
    f.printString('KV_NIGHT');
  }}
  // Stations: stand inside one for two seconds to pay; step out to re-arm it.
  const pos=f.split3dVector(f.getEntityLocationAndRotation(monarch).location);
  const x=pos.xComponent;const z=pos.zComponent;
  let station=0n;
  if(z>=-2.5&&z<=2.5){{
    if(x>=-1.5&&x<=1.5)station=1n;
    if(x>=3.5&&x<=6.5)station=2n;
    if(x>=8.5&&x<=11.5)station=3n;
    if(x>=13.5&&x<=16.5)station=4n;
    if(x>=18.5&&x<=21.5)station=5n;
  }}
  if(station!==f.get('station')){{f.set('station',station);f.set('enteredAt',now);f.set('spent',false);}}
  if(station!==0n&&!f.get('spent')&&now>=f.get('enteredAt')+2n){{
    f.set('spent',true);
    const purse=f.get('coins');
    if(station===1n&&f.get('keepLevel')<2n&&purse>=3n+f.get('keepLevel')*2n){{
      f.set('coins',purse-3n-f.get('keepLevel')*2n);f.set('keepLevel',f.get('keepLevel')+1n);f.printString('KV_KEEP_UP');
    }}
    if(station===2n&&purse>=2n&&idle+workers+archers<10n){{
      const recruit=f.createPrefab(1082130439,f.create3dVector(5,8,Number(idle)*0.9+2.6),[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
      if(f.queryIfEntityIsOnTheField(recruit)){{f.modifyEntityFaction(recruit,f.queryEntityFaction(players[0]));f.set('coins',purse-2n);f.printString('KV_RECRUIT');}}
    }}
    if(station===3n&&f.get('keepLevel')>=1n&&purse>=2n&&idle>0n){{
      for(const unit of idleUnits){{if(f.queryIfEntityIsOnTheField(unit)&&f.getCreationAttribute(unit).currentHp>0){{
        const worker=f.createPrefab(1082130440,f.create3dVector(10,8,Number(workers)*0.9+2.6),[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
        if(f.queryIfEntityIsOnTheField(worker)){{f.modifyEntityFaction(worker,f.queryEntityFaction(players[0]));f.destroyEntity(unit);f.set('coins',purse-2n);f.printString('KV_WORKER');}}break;
      }}}}
    }}
    if(station===4n&&f.get('keepLevel')>=2n&&purse>=3n&&idle>0n){{
      for(const unit of idleUnits){{if(f.queryIfEntityIsOnTheField(unit)&&f.getCreationAttribute(unit).currentHp>0){{
        const archer=f.createPrefab(1082130442,f.create3dVector(20.5,8,Number(archers)*0.9-1.6),[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
        if(f.queryIfEntityIsOnTheField(archer)){{f.modifyEntityFaction(archer,f.queryEntityFaction(players[0]));f.destroyEntity(unit);f.set('coins',purse-3n);f.printString('KV_ARCHER');}}break;
      }}}}
    }}
    if(station===5n&&!f.get('wall')&&workers>0n&&purse>=4n){{
      f.createEntity(new guid({WALL}),[] as bigint[]);
      f.set('wall',true);f.set('wallHp',30n);f.set('coins',purse-4n);f.printString('KV_WALL_BUILT');
    }}
  }}
}})
"""
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(source)
print('written', sys.argv[2], len(source), 'chars; day', DAY, 'night', NIGHT, 'coins', COINS)
