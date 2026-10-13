"""Generate the Kingdom v3 graph source from the GUIDs the editor assigned on import.

Usage: python gen_kingdom_v3.py <guids.json> <out.ts> [day_seconds] [night_seconds] [starting_coins] [trace [wave_size]]
guids.json maps piece names (KV_crown, KV_portal_veil, KV_enemy_00..11) to GUIDs and 'prefab:<name>' to prefab ids.

Rules, after Kingdom: Two Crowns / New Lands:
  - Coins are paid one at a time: stand still at a station and one coin a second goes in; when the price is met the
    thing happens. Walking off before that gives the coins back (the boat keeps them). A station sells once a visit
    (step away and come back to buy again); only the vagrant camp keeps taking coins.
  - Vagrant camp (1): a vagrant joins as a citizen. Hammer shop (3): a citizen becomes a builder. Bow shop (2): a citizen
    becomes an archer. Wall site (3, then 5): needs a builder; wood wall, then stone. Keep (4, then 6): each level adds a
    coin to the morning's income and the first unlocks the stone wall. Boat (8): needs a builder; board it to win.
  - Night: the portal lights up and the Greed come out, more each night. They run at the wall and wear it down (wood
    holds 40 Greed-seconds, stone 90); with no wall they run at the monarch. One that reaches the monarch takes a coin and
    vanishes with it; with an empty purse it takes the crown and the game is lost. Archers wound the Greed nearest the
    wall once a second.
  The level has to be in custom aggro mode (scene_set_level_settings aggroMode "custom") for the Greed to obey, and only
  players and creatures should be hostile (scene_set_faction_hostility [[1,3]]) so that nobody attacks coins and walls.
  - Dawn: the Greed leave, builders mend the wall, each archer hands in a coin, two vagrants are back at the camp.
Effects (ids from the effect_catalog tool): a gold emblem circles the monarch while coins go in (24), a gold ring bursts when
something is bought (87), a light pillar when the boat is ready (103), a fire burst when a coin is stolen (83), a rainbow at
dawn (88); every Greed carries a dark purple swirl (147).
Shown without text: coins being paid appear over the monarch's head one by one (big spinning coins); the purse is a row of
small coins on the ground in front of the monarch whenever the monarch stands still; hits show damage numbers."""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
# Where the level stands and which graph this is come with the GUIDs: 'ground' is the height of the ground (0 on a new
# map; the first Kingdom map had it at 7.6), 'graph:id' and 'graph:name' the node graph to fill (scene_add_graph returns
# them), and 'ui:hide' the id of a control group of the HUD to hide, if the map has one.
G = float(guids.get('ground', 7.6))
STAND = f'{G + 0.4:.2f}'   # the height at which characters and creatures are put down
GRAPH_ID = guids.get('graph:id', 1073741908)
GRAPH_NAME = guids.get('graph:name', '_GSTS_KingdomEconomy')
UI_HIDE = guids.get('ui:hide', 1073741843)
DAY = int(sys.argv[3]) if len(sys.argv) > 3 else 60
NIGHT = int(sys.argv[4]) if len(sys.argv) > 4 else 60
COINS = int(sys.argv[5]) if len(sys.argv) > 5 else 10
# For looking into what the Greed do: 'trace' prints, every four seconds of a night and for each Greed on the field, nine
# lines: KV_AT, its number, its x and z, fighting or calm, the x and z of what it is aiming at (or none twice), and the
# monarch's x and z. A number after 'trace' makes every night's wave that size.
TRACE = len(sys.argv) > 6 and sys.argv[6] == 'trace'
WAVE = int(sys.argv[7]) if len(sys.argv) > 7 else int(guids.get('wave', 0))
# For measuring how much room the rules leave under the server's load limit (docs/PLATFORM_RULES.zh-CN.md): 'burn' in
# guids.json adds that many idle sums (six nodes each) to every tick. The level survives until rules plus burn pass the limit.
BURN = int(guids.get('burn', 0))
enemies = [guids[f'KV_enemy_{i:02d}'] for i in range(12)]
CROWN, VEIL = guids['KV_crown'], guids['KV_portal_veil']
WAVES = [WAVE] * 7 if WAVE else [2, 3, 4, 6, 8, 10, 12]
# Things the graph creates while the game runs are prefabs made with scene_add_prefab (kv3_prefabs.json): an asset at a
# chosen scale. guids.json carries their ids as 'prefab:<name>'. Created by its bare asset id a thing always comes out at
# its natural size, which is what the numbers after 'or' give when a prefab is missing.
prefab = lambda name, fallback: guids.get('prefab:' + name, fallback)
COIN = prefab('KV_coin', 10005009)              # 冒险币, a spinning glowing coin (0.9 m natural): a coin being paid
TOKEN = prefab('KV_purse_coin', 20001285)       # the same coin, smaller: one per coin in the purse
WOOD_WALL = prefab('KV_wall_wood', 20003092)    # 木质围栏 (9.8 m long natural), turned to cross the lane
STONE_WALL = prefab('KV_wall_stone', 20002893)  # 石质墙壁 (5 m square natural)
SMALL = 'prefab:KV_coin' in guids
COIN_STEP = 0.6 if SMALL else 1.0               # metres between paid coins
COIN_Y = G + (2.5 if SMALL else 3.0)
TOKEN_TURN = '[0,0,0]' if 'prefab:KV_purse_coin' in guids else '[90,0,0]'   # the emblem lies flat unless turned
TOKEN_Y = G + (0.3 if 'prefab:KV_purse_coin' in guids else 0.32)
# The three kinds of villager are creature prefabs: made from placed creatures with scene_add_prefab fromEntity on a new
# map (KV_vagrant, KV_builder, KV_archer), or the ones the first Kingdom map had been given by hand.
VAGRANT = prefab('KV_vagrant', prefab('盗宝团·斥候', 1082130439))
BUILDER = prefab('KV_builder', prefab('盗宝团·海上男儿', 1082130440))
ARCHER = prefab('KV_archer', prefab('火箭丘丘人', 1082130442))
CAP = 10
NO_TAGS = '[] as bigint[]'
FX_ARGS = "'GI_RootNode',true,true,[0,0,0],[0,0,0],1,false"


def flash(effect, seconds):
    """One short effect on the monarch: replaces the one still showing and is cleared by the timer."""
    return (f"if(f.get('flashFx')!==0n)f.clearLoopingSpecialEffect(f.get('flashFx'),monarch);"
            f"f.set('flashFx',f.mountLoopingSpecialEffect({effect},monarch,{FX_ARGS}));f.set('flashUntil',now+{seconds}n);")


def each(items, body):
    return '\n'.join(body(i, g) for i, g in enumerate(items))


greed = ','.join(f'new guid({g})' for g in enemies)
waves = '\n'.join(f"    if(f.get('day')==={n + 1}n)f.set('waveEnd',{size}n);" for n, size in enumerate(WAVES))
# Coin i of the purse stands at anchorX + PURSE_LEFT + i * PURSE_STEP; paid coin i hangs at anchorX + (i - (cost - 1) / 2) * COIN_STEP.
PURSE_STEP = 0.34 if 'prefab:KV_purse_coin' in guids else 0.42
PURSE_LEFT = -PURSE_STEP * (CAP - 1) / 2
COUNT8 = ','.join(f'{i}n' for i in range(8))
COUNT10 = ','.join(f'{i}n' for i in range(CAP))

TRACE_LINE = ("if(sinceDusk%4n===0n){f.printString('KV_AT');f.printString(f.dataTypeConversion(index,'str'));"
              "f.printString(f.dataTypeConversion(at.xComponent,'str'));f.printString(f.dataTypeConversion(at.zComponent,'str'));"
              "if(f.queryIfSpecifiedEntityIsInCombat(enemy))f.printString('fighting');else f.printString('calm');"
              "const aim=f.getCreationSCurrentTarget(enemy);"
              "if(f.queryIfEntityIsOnTheField(aim)){const to=f.split3dVector(f.getEntityLocationAndRotation(aim).location);"
              "f.printString(f.dataTypeConversion(to.xComponent,'str'));f.printString(f.dataTypeConversion(to.zComponent,'str'));}"
              "else{f.printString('none');f.printString('none');}"
              "f.printString(f.dataTypeConversion(x,'str'));f.printString(f.dataTypeConversion(z,'str'));}") if TRACE else ''

BURN_LINES = ('let burn=0;' + ''.join(f'burn=burn+Number(now+{i}n)*0.5+1;' for i in range(BURN)) + "f.set('burnSum',burn);") if BURN else ''

HIDE_UI = (f"f.switchCurrentInterfaceLayout(players[0],1073741825n);f.modifyUiControlStatusWithinTheInterfaceLayout(players[0],{UI_HIDE}n,UIControlGroupStatus.Hidden);"
           if UI_HIDE else '')

source = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ DamagePopUpType, RoundingMode, SettlementStatus, UIControlGroupStatus }} from 'genshin-ts/definitions/enum'
import {{ guid }} from 'genshin-ts/runtime/value'

// Kingdom v3: see examples/kingdom/gen_kingdom_v3.py for the rules.
// Layout along x: boat -4, keep 0, vagrant camp 5, hammer shop 10, bow shop 15, wall site 20 (wall at 23), portal 30.
g.server({{id:{GRAPH_ID},name:'{GRAPH_NAME}',variables:{{
  day:1n,night:false,deadline:0n,coins:{COINS}n,keep:0n,wallLevel:0n,wallHp:0n,
  station:0n,paid:0n,boatPaid:0n,boatDone:false,boatAt:0n,lastTick:-1n,state:1n,settled:false,
  placed:false,ready:false,rosterDone:false,cursor:0n,waveEnd:0n,nextSpawn:0n,
  purseShown:0n,slotsShown:0n,anchorX:0,slotsLeft:0,duskAt:0n,flashFx:0n,flashUntil:0n,payFx:0n,route:0n,fresh:-1n,served:false,citizens:0n,greedStanding:0n,burnSum:0
}}}})
.on('whenEntityIsCreated',(evt,f)=>{{
  f.set('day',1n);f.set('night',false);f.set('coins',{COINS}n);f.set('keep',0n);
  f.set('wallLevel',0n);f.set('wallHp',0n);f.set('station',0n);f.set('paid',0n);f.set('boatPaid',0n);f.set('boatDone',false);
  f.set('lastTick',-1n);f.set('state',1n);f.set('settled',false);
  f.set('placed',false);f.set('ready',false);f.set('rosterDone',false);
  f.set('cursor',0n);f.set('waveEnd',0n);f.set('purseShown',0n);f.set('slotsShown',0n);f.set('flashFx',0n);f.set('payFx',0n);f.set('route',0n);f.set('fresh',-1n);f.set('served',false);f.set('citizens',0n);f.set('greedStanding',0n);
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
    f.teleportPlayer(players[0],[2,{STAND},0],[0,0,0]);
    f.set('placed',true);return;
  }}
  if(!f.get('ready')){{
    f.switchMainCameraTemplate(players,'自定义镜头');
    f.setPlayerCameraToFollowEntity(players[0],monarch,'自定义镜头');
    {HIDE_UI}
    f.setCurrentEnvironmentTime(10);f.setEnvironmentTimePassageSpeed(0);
    f.set('ready',true);f.set('deadline',now+{DAY}n);
    f.printString('KV_DAY');return;
  }}
  {BURN_LINES}
  if(f.get('flashFx')!==0n&&now>=f.get('flashUntil')){{f.clearLoopingSpecialEffect(f.get('flashFx'),monarch);f.set('flashFx',0n);}}
  const pos=f.split3dVector(f.getEntityLocationAndRotation(monarch).location);
  const x=pos.xComponent;const z=pos.zComponent;
  const still=f.queryCharacterSCurrentMovementSpd(monarch).currentSpeed<0.5;
  const owned=f.getListOfEntitiesOwnedByTheEntity(evt.eventSourceEntity);
  const folk=f.getEntityListBySpecifiedPrefabId(owned,{VAGRANT});
  const builderUnits=f.getEntityListBySpecifiedPrefabId(owned,{BUILDER});
  const archerUnits=f.getEntityListBySpecifiedPrefabId(owned,{ARCHER});
  // Coins and emblems are looked up on the whole field: the owner's list misses some of them.
  const coinUnits=f.getEntitiesWithSpecifiedPrefabOnTheField({COIN});
  const tokenUnits=f.getEntitiesWithSpecifiedPrefabOnTheField({TOKEN});
  // Vagrants and citizens are the same prefab, and they wander, so they cannot be told apart by where they stand: how
  // many have been recruited is kept as a number. The one furthest east (by the camp) is the next to be recruited, the one
  // furthest west (by the keep) the next to be given a tool.
  let alive=0n;let builders=0n;let archers=0n;let count=-1n;let east=-1n;let eastX=-999;let west=-1n;let westX=999;
  for(const unit of folk){{
    count+=1n;
    if(f.queryIfEntityIsOnTheField(unit)&&f.getCreationAttribute(unit).currentHp>0){{
      alive+=1n;
      const ux=f.split3dVector(f.getEntityLocationAndRotation(unit).location).xComponent;
      if(ux>eastX){{eastX=ux;east=count;}}
      if(ux<westX){{westX=ux;west=count;}}
    }}else f.destroyEntity(unit);
  }}
  let citizens=f.get('citizens');
  if(citizens>alive)citizens=alive;
  const vagrants=alive-citizens;
  for(const unit of builderUnits){{if(f.queryIfEntityIsOnTheField(unit)&&f.getCreationAttribute(unit).currentHp>0)builders+=1n;else f.destroyEntity(unit);}}
  for(const unit of archerUnits){{if(f.queryIfEntityIsOnTheField(unit)&&f.getCreationAttribute(unit).currentHp>0)archers+=1n;else f.destroyEntity(unit);}}
  if(!f.get('rosterDone')){{
    for(const slot of [0n,1n]){{
      const unit=f.createPrefab({VAGRANT},f.create3dVector(5,{STAND},Number(slot)*0.9+2.6),[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
      if(f.queryIfEntityIsOnTheField(unit))f.modifyEntityFaction(unit,f.queryEntityFaction(players[0]));
    }}
    f.set('rosterDone',true);f.printString('KV_ROSTER');return;
  }}
  // ---- night and day ----
  if(f.get('night')){{
    // The twelve Greed are scene pieces that wait off the field; one loop handles them all, by GUID.
    const greed=[{greed}];
    const cursor=f.get('cursor');
    if(cursor<f.get('waveEnd')&&now>=f.get('nextSpawn')){{
      f.createEntity(f.getCorrespondingValueFromList(greed,cursor),{NO_TAGS});
      f.set('fresh',cursor);f.set('cursor',cursor+1n);f.set('nextSpawn',now+3n);f.printString('KV_GREED_OUT');
    }}
    let atWall=0n;let crownLost=false;let stolen=false;let nearest=28.2;let target=-1n;let index=-1n;
    let standing=0n;let arrived=0n;let taken=0n;
    const sinceDusk=now-f.get('duskAt');
    // Whom the Greed go for is the graph's decision (the level is set to 自定义仇恨, see kv3_test_*.json): the wall while
    // one stands, the monarch otherwise. The order goes out when a Greed appears, when the wall goes up or comes down,
    // and again every four seconds in case a target was lost.
    let want=2n;
    if(f.get('wallLevel')>0n)want=1n;
    const again=want!==f.get('route')||sinceDusk%4n===0n;
    const woodWalls=f.getEntitiesWithSpecifiedPrefabOnTheField({WOOD_WALL});
    const stoneWalls=f.getEntitiesWithSpecifiedPrefabOnTheField({STONE_WALL});
    for(const id of greed){{
      index+=1n;
      const enemy=f.queryEntityByGuid(id);
      if(f.queryIfEntityIsOnTheField(enemy)){{
        const at=f.split3dVector(f.getEntityLocationAndRotation(enemy).location);
        const ex=at.xComponent-x;const ez=at.zComponent-z;
        if(ex*ex+ez*ez<20.25){{
          // Within 4.5 m of the monarch: grab a coin and vanish with it, or take the crown if the purse is empty.
          // A Greed sent at the monarch stops and swings from as far as 4.2 m (measured), so 3 m was not always reached.
          if(f.get('coins')>0n){{f.set('coins',f.get('coins')-1n);f.removeEntity(enemy);stolen=true;taken+=1n;f.printString('KV_COIN_STOLEN');}}
          else crownLost=true;
        }}else{{
          {TRACE_LINE}
          let order=again;
          // The one that came out last tick gets its dark swirl and its first order.
          if(index===f.get('fresh')){{f.mountLoopingSpecialEffect(147,enemy,{FX_ARGS});f.set('fresh',-1n);order=true;arrived+=1n;}}
          if(order){{
            if(want===1n){{
              f.removeTargetEntityFromAggroList(monarch,enemy);
              for(const piece of woodWalls)f.setTheAggroValueOfSpecifiedEntity(piece,enemy,100000n);
              for(const piece of stoneWalls)f.setTheAggroValueOfSpecifiedEntity(piece,enemy,100000n);
            }}else f.setTheAggroValueOfSpecifiedEntity(monarch,enemy,100000n);
          }}
          // A Greed that has been shot down lies on the field for a few seconds: it no longer counts.
          if(f.getCreationAttribute(enemy).currentHp>0){{
            standing+=1n;
            // A Greed sent at the wall (x = 23) stops and swings from up to 4.2 m away, so anything this side of 27.8 is at it.
            if(at.xComponent<=27.8&&at.xComponent>=19.5)atWall+=1n;
            if(at.xComponent<nearest){{nearest=at.xComponent;target=index;}}
          }}
        }}
      }}
    }}
    f.set('route',want);
    // A Greed has fallen when one that stood last second neither stands now nor ran off with a coin, whoever felled it:
    // the rule below, an archer's real arrow or a blow from someone in its way.
    // (One that has reached the monarch and is taking the crown is not counted as standing: no count on that tick.)
    let fell=f.get('greedStanding')+arrived-taken-standing;
    if(crownLost)fell=0n;
    if(fell>=1n)f.printString('KV_GREED_DOWN');
    if(fell>=2n)f.printString('KV_GREED_DOWN');
    if(fell>=3n)f.printString('KV_GREED_DOWN');
    f.set('greedStanding',standing);
    if(stolen){{{flash(83, 2)}}}
    if(crownLost){{
      const crown=f.queryEntityByGuid(new guid({CROWN}));
      if(f.queryIfEntityIsOnTheField(crown))f.removeEntity(crown);
      f.set('state',2n);f.printString('KV_CROWN_LOST');return;
    }}
    if(archers>0n&&target>=0n){{
      const victim=f.queryEntityByGuid(f.getCorrespondingValueFromList(greed,target));
      // The archers are told whom to shoot; what the arrows do is still decided by the rule below.
      for(const unit of archerUnits)f.setTheAggroValueOfSpecifiedEntity(victim,unit,1000n);
      const hit=f.getCreationAttribute(victim);
      f.hpLoss(victim,hit.maxHp*0.12*Number(archers),true,false,false,DamagePopUpType.NormalPopUp);
    }}
    // Villagers do not fight, and an archer with nothing to shoot stands down. In custom aggro mode creatures near a
    // fight pick up its targets: left alone, the builder and the archer went on hitting the wall after the Greed were gone.
    for(const unit of builderUnits)f.clearSpecifiedTargetSAggroList(unit);
    for(const unit of folk)f.clearSpecifiedTargetSAggroList(unit);
    if(target<0n){{for(const unit of archerUnits)f.clearSpecifiedTargetSAggroList(unit);}}
    if(f.get('wallLevel')>0n&&atWall>0n){{
      f.set('wallHp',f.get('wallHp')-atWall);
      if(f.get('wallHp')<=0n){{
        for(const piece of f.getEntitiesWithSpecifiedPrefabOnTheField({WOOD_WALL}))f.removeEntity(piece);
        for(const piece of f.getEntitiesWithSpecifiedPrefabOnTheField({STONE_WALL}))f.removeEntity(piece);
        f.set('wallLevel',0n);f.set('wallHp',0n);f.printString('KV_WALL_BROKEN');
      }}
    }}
    if(now>=f.get('deadline')){{
      // Dawn: the Greed leave, the portal goes dark, builders mend the wall, archers hand in their catch.
      for(const id of greed){{const leaving=f.queryEntityByGuid(id);if(f.queryIfEntityIsOnTheField(leaving))f.removeEntity(leaving);}}
      const veil=f.queryEntityByGuid(new guid({VEIL}));
      if(f.queryIfEntityIsOnTheField(veil))f.removeEntity(veil);
      for(const unit of archerUnits)f.clearSpecifiedTargetSAggroList(unit);
      f.set('night',false);f.set('greedStanding',0n);
      let purseAtDawn=f.get('coins')+1n+archers+f.get('keep');
      if(purseAtDawn>{CAP}n)purseAtDawn={CAP}n;
      f.set('coins',purseAtDawn);
      if(builders>0n&&f.get('wallLevel')===1n)f.set('wallHp',40n);
      if(builders>0n&&f.get('wallLevel')===2n)f.set('wallHp',90n);
      if(vagrants<1n){{
        const back1=f.createPrefab({VAGRANT},[5,{STAND},2.6],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
        if(f.queryIfEntityIsOnTheField(back1))f.modifyEntityFaction(back1,f.queryEntityFaction(players[0]));
      }}
      if(vagrants<2n){{
        const back2=f.createPrefab({VAGRANT},[5,{STAND},3.5],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
        if(f.queryIfEntityIsOnTheField(back2))f.modifyEntityFaction(back2,f.queryEntityFaction(players[0]));
      }}
      f.set('day',f.get('day')+1n);f.set('deadline',now+{DAY}n);
      f.printString('KV_DAWN');{flash(88, 3)}
    }}
  }}else if(now>=f.get('deadline')){{
    f.set('night',true);f.set('duskAt',now);f.set('deadline',now+{NIGHT}n);f.set('nextSpawn',now+2n);f.set('cursor',0n);
    f.set('waveEnd',{WAVES[-1]}n);
{waves}
    f.set('route',0n);f.set('fresh',-1n);f.set('greedStanding',0n);
    f.createEntity(new guid({VEIL}),{NO_TAGS});
    f.printString('KV_NIGHT');
  }}
  // ---- stations: stand still to pay, one coin a second ----
  let station=0n;let sx=0;
  if(z>=-2.5&&z<=2.5){{
    if(x>=-5.5&&x<=-2.5){{station=6n;sx=-4;}}
    if(x>=-1.5&&x<=1.5){{station=1n;sx=0;}}
    if(x>=3.5&&x<=6.5){{station=2n;sx=5;}}
    if(x>=8.5&&x<=11.5){{station=3n;sx=10;}}
    if(x>=13.5&&x<=16.5){{station=4n;sx=15;}}
    if(x>=18.5&&x<=21.5){{station=5n;sx=20;}}
  }}
  let cost=0n;
  if(station===1n&&f.get('keep')===0n)cost=4n;
  if(station===1n&&f.get('keep')===1n)cost=6n;
  if(station===2n&&vagrants>0n)cost=1n;
  if(station===3n&&citizens>0n)cost=3n;
  if(station===4n&&citizens>0n)cost=2n;
  if(station===5n&&builders>0n&&f.get('wallLevel')===0n)cost=3n;
  if(station===5n&&builders>0n&&f.get('wallLevel')===1n&&f.get('keep')>=1n)cost=5n;
  if(station===6n&&builders>0n&&!f.get('boatDone'))cost=8n;
  // One purchase a visit: to buy again the monarch has to step away and come back. The camp is the exception, so that
  // both vagrants can be taken on in one stop.
  if(f.get('served')&&station!==2n)cost=0n;
  if(station!==f.get('station')){{
    // Walked off: coins not yet spent come back (the boat keeps what was put into it).
    if(f.get('paid')>0n){{f.set('coins',f.get('coins')+f.get('paid'));f.set('paid',0n);f.printString('KV_REFUND');}}
    f.set('station',station);f.set('served',false);
  }}else if(station!==0n&&still&&cost>0n&&f.get('coins')>0n){{
    f.set('coins',f.get('coins')-1n);f.printString('KV_PAY');
    if(station===6n)f.set('boatPaid',f.get('boatPaid')+1n);else f.set('paid',f.get('paid')+1n);
    let reached=f.get('paid')>=cost;
    if(station===6n)reached=f.get('boatPaid')>=cost;
    if(reached){{
      f.set('paid',0n);f.set('served',true);{flash(87, 2)}
      if(station===1n){{
        if(f.get('keep')===0n)f.createPrefab(20001754,[-1.6,{G},8.8],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
        if(f.get('keep')===1n)f.createPrefab(20001755,[2.0,{G},9.4],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
        f.set('keep',f.get('keep')+1n);f.printString('KV_KEEP_UP');
      }}
      if(station===2n){{
        f.removeEntity(f.getCorrespondingValueFromList(folk,east));
        const citizen=f.createPrefab({VAGRANT},f.create3dVector(1.2+Number(citizens)*0.8,{STAND},2.8),[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
        if(f.queryIfEntityIsOnTheField(citizen))f.modifyEntityFaction(citizen,f.queryEntityFaction(players[0]));
        f.set('citizens',citizens+1n);f.printString('KV_RECRUIT');
      }}
      if(station===3n){{
        f.removeEntity(f.getCorrespondingValueFromList(folk,west));
        const builder=f.createPrefab({BUILDER},f.create3dVector(10.4+Number(builders)*0.8,{STAND},2.8),[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
        if(f.queryIfEntityIsOnTheField(builder))f.modifyEntityFaction(builder,f.queryEntityFaction(players[0]));
        f.set('citizens',citizens-1n);f.printString('KV_BUILDER');
      }}
      if(station===4n){{
        f.removeEntity(f.getCorrespondingValueFromList(folk,west));
        const archer=f.createPrefab({ARCHER},f.create3dVector(21.3-Number(archers)*0.9,{STAND},2.6),[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
        if(f.queryIfEntityIsOnTheField(archer))f.modifyEntityFaction(archer,f.queryEntityFaction(players[0]));
        f.set('citizens',citizens-1n);f.printString('KV_ARCHER');
      }}
      if(station===5n){{
        if(f.get('wallLevel')===0n){{
          f.createPrefab({WOOD_WALL},[23,{G},0.3],[0,90,0],evt.eventSourceEntity,false,1,{NO_TAGS});f.set('wallLevel',1n);f.set('wallHp',40n);f.printString('KV_WALL_BUILT');
        }}else{{
          for(const piece of f.getEntitiesWithSpecifiedPrefabOnTheField({WOOD_WALL}))f.removeEntity(piece);
          f.createPrefab({STONE_WALL},[23,{G},0.3],[0,90,0],evt.eventSourceEntity,false,1,{NO_TAGS});f.set('wallLevel',2n);f.set('wallHp',90n);f.printString('KV_WALL_STONE');
        }}
      }}
      if(station===6n){{
        // A low raft, off to the side: anything tall between the camera and the monarch makes the camera jump in close.
        f.createPrefab(20003062,[-8.5,{G + 0.3},-7],[0,90,0],evt.eventSourceEntity,false,1,{NO_TAGS});
        f.set('boatDone',true);f.set('boatAt',now);f.printString('KV_BOAT_READY');{flash(103, 3)}
      }}
    }}
  }}
  // The boat is ready: stay on the dock a few seconds and sail away.
  if(f.get('boatDone')&&station===6n&&still&&now>=f.get('boatAt')+3n){{f.set('state',3n);f.printString('KV_SAIL');return;}}
  // ---- what the player sees ----
  // Over the monarch's head: the coins paid so far, one more each second. On the ground in front: the purse, one emblem
  // per coin, while the monarch stands still.
  // Both rows are kept up to date by rule rather than rebuilt: every tick anything that does not stand exactly on a place
  // that should be filled right now is removed, and only the missing places are created. A thing created this tick is not
  // in the lists until a later tick, so "remove everything, then create" leaves the previous row behind; a rule that is
  // applied again every tick removes such leftovers a tick later.
  const coins=f.get('coins');
  let put=f.get('paid');
  if(station===6n&&!f.get('boatDone'))put=f.get('boatPaid');
  if(station===0n||!still)put=0n;
  if(put>0n&&f.get('payFx')===0n)f.set('payFx',f.mountLoopingSpecialEffect(24,monarch,{FX_ARGS}));
  if(put===0n&&f.get('payFx')!==0n){{f.clearLoopingSpecialEffect(f.get('payFx'),monarch);f.set('payFx',0n);}}
  const shift=x-f.get('anchorX');
  if(!still||shift>0.3||shift<-0.3){{f.set('purseShown',0n);f.set('slotsShown',0n);}}
  if(still&&(shift>0.3||shift<-0.3))f.set('anchorX',x);
  const anchor=f.get('anchorX');
  // The row of paid coins is centred for the current price, so a new price starts a new row.
  const left=anchor-(Number(cost)-1)*{COIN_STEP / 2};
  const drift=left-f.get('slotsLeft');
  if(drift>0.05||drift<-0.05){{f.set('slotsShown',0n);f.set('slotsLeft',left);}}
  for(const coin of coinUnits){{
    const place=(f.split3dVector(f.getEntityLocationAndRotation(coin).location).xComponent-left)/{COIN_STEP};
    const slot=f.roundToIntegerOperation(place,RoundingMode.RoundToNearest);
    const off=place-Number(slot);
    let keepCoin=false;
    if(slot>=0n&&slot<put&&off>-0.1&&off<0.1)keepCoin=true;
    if(!keepCoin)f.removeEntity(coin);
  }}
  for(const token of tokenUnits){{
    const spot=(f.split3dVector(f.getEntityLocationAndRotation(token).location).xComponent-anchor-({PURSE_LEFT:.3f}))/{PURSE_STEP};
    const seat=f.roundToIntegerOperation(spot,RoundingMode.RoundToNearest);
    const miss=spot-Number(seat);
    let keepToken=false;
    if(still&&seat>=0n&&seat<coins&&miss>-0.14&&miss<0.14)keepToken=true;
    if(!keepToken)f.removeEntity(token);
  }}
  if(put<f.get('slotsShown'))f.set('slotsShown',put);
  if(put>f.get('slotsShown')){{
    for(const i of [{COUNT8}]){{
      if(i>=f.get('slotsShown')&&i<put)f.createPrefab({COIN},f.create3dVector(left+Number(i)*{COIN_STEP},{COIN_Y:.2f},0.6),[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
    }}
    f.set('slotsShown',put);
  }}
  if(coins<f.get('purseShown'))f.set('purseShown',coins);
  if(still&&coins>f.get('purseShown')){{
    for(const i of [{COUNT10}]){{
      if(i>=f.get('purseShown')&&i<coins)f.createPrefab({TOKEN},f.create3dVector(anchor+({PURSE_LEFT:.3f})+Number(i)*{PURSE_STEP},{TOKEN_Y:.2f},-2.6),{TOKEN_TURN},evt.eventSourceEntity,false,1,{NO_TAGS});
    }}
    f.set('purseShown',coins);
  }}
}})
"""
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(source)
print('written', sys.argv[2], len(source), 'chars; day', DAY, 'night', NIGHT, 'coins', COINS)
