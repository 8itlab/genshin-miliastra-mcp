"""Kingdom, rebuilt the way the platform builds games: many small graphs, each on the thing it is about, started by events.

Compare examples/kingdom/gen_kingdom_v3.py, one graph of some 1500 nodes on the stage entity that looks at every position
once a second. Here nothing compares positions: walking up to a station is its option tab, picking up a coin is the coin's
collision trigger, a Greed reaching the wall is the wall's collision trigger, a Greed reaching the monarch is the
Greed's own collision trigger, and night and day are timers of the stage that switch between two skies.

Graphs (the last argument picks one):
  stage    (关卡实体)        puts the stations down, keeps the clock: dusk, the wave of Greed, dawn, income, victory
  coin     (KV_coin)        wide trigger: fly to the monarch; narrow trigger: into the purse, unless it is full
  keep     (KV_keep)        option: 4 coins, then 6: each level adds a coin to the morning's income; level 1 unlocks stone
  camp     (KV_camp)        option: 1 coin, a vagrant joins as a citizen
  smith    (KV_smith)       option: 3 coins, a citizen becomes a builder
  range    (KV_range)       option: 2 coins, a citizen becomes an archer; its trigger for creatures shoots one Greed that
                            comes in range, then reloads for four seconds
  site     (KV_site)        option: 3 coins for the wooden wall, then 5 for the stone one; needs a builder
  wall     (KV_wall_wood and KV_wall_stone, one graph on both)  each Greed that reaches it costs one hp and is gone; at 0 it
                            falls and sends KG_wall_down; at dawn, if there is a builder, it is mended
  greed    (KV_greed)       a second after it appears, and every three seconds, it is sent at the wall, or at the
                            monarch if there is none; turns to the monarch when the wall falls; its own trigger for characters takes a coin when it gets near the
                            monarch, or the crown from an empty purse; leaves at dawn
  player   (player)         prints the purse whenever it changes

State: the player's variables coins, citizens, builders, archers, keep, night; the wall's hp and full; the site's level;
the bow shop's loaded. Signals: KG_dawn, KG_wall_down.

Usage: python gen_kingdom4.py <guids.json> <out.ts> <day seconds> <night seconds> <starting coins> [nights to win] <graph>
Prints: KG_READY, KG_DAY, KG_COINS n, KG_CITIZEN, KG_BUILDER, KG_ARCHER, KG_KEEP n, KG_WALL n, KG_POOR, KG_NEED, KG_DUSK,
KG_GREED, KG_SHOT, KG_WALL_HIT, KG_WALL_DOWN, KG_STOLEN, KG_CROWN_LOST, KG_DAWN, KG_MENDED, KG_GREED_GONE, KG_INCOME n,
KG_VICTORY."""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
DAY, NIGHT, COINS = int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
NIGHTS = int(sys.argv[6]) if len(sys.argv) > 7 else 3
P = {n: guids['prefab:KV_' + n] for n in ('coin', 'tag', 'keep', 'camp', 'smith', 'range', 'site', 'wall_wood', 'wall_stone',
                                          'greed', 'vagrant', 'builder', 'archer')}
# Night and day are two environment configurations made with scene_add_environment, a midnight one and a late-morning
# one; the lamps belong to the night one. (The map's own sky follows a clock that f.setCurrentEnvironmentTime did not
# visibly move in play, and after a fixed sky it stays at that sky's hour, so dawn switches to a fixed morning.)
NOON = f"f.modifyEnvironmentSettings({guids['environment:KV_day']}n,players,false,0n);"
MIDNIGHT = f"f.modifyEnvironmentSettings({guids['environment:KV_night']}n,players,false,0n);"
CAP = 10
STAND = 0.4                      # the height at which creatures are put down
NO_TAGS = '[] as bigint[]'
# Where things stand along the lane (x, z); the monarch walks along z = 0.
KEEP, CAMP, SMITH, RANGE, SITE, WALL, PORTAL = (0, 3.6), (5, 7.2), (10, 5.6), (14.4, 5.0), (20, 4.6), (23, 0.3), (29, 0)
PRICE = {'keep': 4, 'camp': 1, 'smith': 3, 'range': 2, 'site': 3}

HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus }} from 'genshin-ts/definitions/enum'

// Kingdom v4, graph "{which}": see examples/kingdom4/gen_kingdom4.py.
"""
SERVER = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})"


def create(prefab, x, y, z, turn='[0,0,0]', owner='evt.eventSourceEntity'):
    return f"f.createPrefab({P[prefab]},[{x},{y},{z}],{turn},{owner},false,1,{NO_TAGS});"


def tags(station, at):
    """The price of a station, shown without text: that many small coins in a row above it."""
    count = PRICE[station]
    return ''.join(create('tag', round(at[0] + (i - (count - 1) / 2) * 0.45, 2), 3.4, at[1]) for i in range(count))


def read(entity, name, kind='int'):
    return f"f.getCustomVariable({entity},'{name}').asType('{kind}')"


def write(entity, name, value):
    return f"f.setCustomVariable({entity},'{name}',{value},true);"


# Every station starts the same way: who chose the option, and what is in the purse.
BUYER = f"""  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const coins={read('player', 'coins')};
"""


def pay(cost):
    return f"if(coins<{cost}n){{f.printString('KG_POOR');return;}}\n  {write('player', 'coins', f'coins-{cost}n')}"


def join(prefab, x, z, count):
    """A villager appears, on the monarch's side: the next one stands a little further along."""
    return (f"const unit=f.createPrefab({P[prefab]},f.create3dVector({x}+Number({count})*0.9,{STAND},{z}),[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});\n"
            f"  f.modifyEntityFaction(unit,f.queryEntityFaction(player));")


# A citizen takes up a trade: one vagrant leaves the camp and the tradesman appears at the shop.
TRADE = f"""  const citizens={read('player', 'citizens')};
  if(citizens<1n){{f.printString('KG_NEED');return;}}
"""
LEAVE_CAMP = f"""{write('player', 'citizens', 'citizens-1n')}
  const folk=f.getEntitiesWithSpecifiedPrefabOnTheField({P['vagrant']});
  if(folk.length>0)f.removeEntity(folk[0]);"""
IS_GREED = lambda entity: f"f.getEntityListBySpecifiedPrefabId([{entity}],{P['greed']}).length!==1"
ONE_PLAYER = """const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;"""
HUNT = f"""{ONE_PLAYER}
  for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0]))f.setTheAggroValueOfSpecifiedEntity(hero,self,100000n);"""
# What a Greed goes for: the wall while one stands, the monarch otherwise. The level is in custom aggro mode, where a
# creature goes for whatever it is given the highest aggro value on, but only if that thing is its enemy: the wall is put
# on the monarch's side when it is built (see the site graph), or the order would do nothing.
AIM = f"""const wood=f.getEntitiesWithSpecifiedPrefabOnTheField({P['wall_wood']});
  const stone=f.getEntitiesWithSpecifiedPrefabOnTheField({P['wall_stone']});
  for(const piece of wood)f.setTheAggroValueOfSpecifiedEntity(piece,self,100000n);
  for(const piece of stone)f.setTheAggroValueOfSpecifiedEntity(piece,self,100000n);
  if(wood.length>0)return;
  if(stone.length>0)return;
  {HUNT}"""
INCOME = '\n    '.join(f"if(income>={i + 1}n){create('coin', round(-1.5 + i * 0.9, 2), 0.8, 0, owner='stage')}" for i in range(6))

BODY = {
    'stage': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'KG_SETUP',false,[2]);
  f.printString('KG_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  {ONE_PLAYER}
  const player=players[0];
  const stage=evt.eventSourceEntity;
  if(evt.timerName==='KG_SETUP'){{
    {create('keep', KEEP[0], 0, KEEP[1])}{tags('keep', KEEP)}
    {create('camp', CAMP[0], 0, CAMP[1])}{tags('camp', CAMP)}
    {create('smith', SMITH[0], 0, SMITH[1])}{tags('smith', SMITH)}
    {create('range', RANGE[0], 0, RANGE[1])}{tags('range', RANGE)}
    {create('site', SITE[0], 0, SITE[1])}{tags('site', SITE)}
    {write('player', 'coins', f'{COINS}n')}
    f.startTimer(stage,'KG_TO_DUSK',false,[{DAY}]);
    f.startGlobalTimer(stage,'KG_day');
    f.printString('KG_DAY');
    return;
  }}
  if(evt.timerName==='KG_TO_DUSK'){{
    {write('player', 'night', read('player', 'night') + '+1n')}
    {MIDNIGHT}
    // One Greed every two seconds; how many of the six come out is decided when each is due. The places in a timer's
    // sequence are numbered from 0 (measured), so night 1 lets places 0 and 1 through: two Greed.
    f.startTimer(stage,'KG_WAVE',false,[2,4,6,8,10,12]);
    f.startTimer(stage,'KG_TO_DAWN',false,[{NIGHT}]);
    f.printString('KG_DUSK');
    return;
  }}
  if(evt.timerName==='KG_WAVE'){{
    if(evt.timerSequenceId>{read('player', 'night')})return;
    {create('greed', PORTAL[0], STAND, PORTAL[1], '[0,-90,0]', 'stage')}
    f.printString('KG_GREED');
    return;
  }}
  if(evt.timerName==='KG_TO_DAWN'){{
    f.stopTimer(stage,'KG_WAVE');
    {NOON}
    f.sendSignal('KG_dawn');
    f.printString('KG_DAWN');
    if({read('player', 'night')}>={NIGHTS}n){{
      f.printString('KG_VICTORY');
      f.setPlayerSettlementSuccessStatus(player,SettlementStatus.Victory);
      f.settleStage();
      return;
    }}
    // The morning's income lies by the keep: two coins, one more for each level of the keep and for each archer.
    const income=2n+{read('player', 'keep')}+{read('player', 'archers')};
    f.printString('KG_INCOME');f.printString(f.dataTypeConversion(income,'str'));
    {INCOME}
    f.startTimer(stage,'KG_TO_DUSK',false,[{DAY}]);
    f.startGlobalTimer(stage,'KG_day');
  }}
}})
""",
    'coin': SERVER + f"""
.on('whenEnteringCollisionTrigger',(evt,f)=>{{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.enteringEntity as any);
  if(evt.triggerId===1n){{
    // A character has no GUID: the device follows it through the GUID of its player.
    f.switchFollowMotionDeviceTargetByGuid(evt.triggerEntity,f.queryGuidByEntity(player),'',[0,1,0],[0,0,0],FollowCoordinateSystem.WorldCoordinateSystem,FollowLocationType.FollowLocation);
    f.activateDisableFollowMotionDevice(evt.triggerEntity,true);
    return;
  }}
  const coins={read('player', 'coins')};
  if(coins>={CAP}n)return;
  {write('player', 'coins', 'coins+1n')}
  f.destroyEntity(evt.triggerEntity);
}})
""",
    'keep': SERVER + f"""
.on('whenTabIsSelected',(evt,f)=>{{
{BUYER}  const level={read('player', 'keep')};
  if(level>=2n){{f.printString('KG_NEED');return;}}
  if(level===0n){{{pay(4)}}}
  if(level===1n){{{pay(6)}}}
  {write('player', 'keep', 'level+1n')}
  f.printString('KG_KEEP');f.printString(f.dataTypeConversion(level+1n,'str'));
}})
""",
    'camp': SERVER + f"""
.on('whenTabIsSelected',(evt,f)=>{{
{BUYER}  const citizens={read('player', 'citizens')};
  if(citizens+{read('player', 'builders')}+{read('player', 'archers')}>=6n){{f.printString('KG_NEED');return;}}
  {pay(PRICE['camp'])}
  {write('player', 'citizens', 'citizens+1n')}
  {join('vagrant', 4.2, 2.6, 'citizens')}
  f.printString('KG_CITIZEN');
}})
""",
    'smith': SERVER + f"""
.on('whenTabIsSelected',(evt,f)=>{{
{BUYER}{TRADE}  {pay(PRICE['smith'])}
  {LEAVE_CAMP}
  const builders={read('player', 'builders')};
  {write('player', 'builders', 'builders+1n')}
  {join('builder', 10.4, 2.8, 'builders')}
  f.printString('KG_BUILDER');
}})
""",
    'range': SERVER + f"""
.on('whenTabIsSelected',(evt,f)=>{{
{BUYER}{TRADE}  {pay(PRICE['range'])}
  {LEAVE_CAMP}
  const archers={read('player', 'archers')};
  {write('player', 'archers', 'archers+1n')}
  {join('archer', 17.0, 2.6, 'archers')}
  f.printString('KG_ARCHER');
}})
.on('whenEnteringCollisionTrigger',(evt,f)=>{{
  // The range of the bows is the shop's trigger for creatures: one Greed that comes in is shot, then the bows reload.
  if({IS_GREED('evt.enteringEntity')})return;
  {ONE_PLAYER}
  if({read('players[0]', 'archers')}<1n)return;
  if(!{read('evt.triggerEntity', 'loaded', 'bool')})return;
  {write('evt.triggerEntity', 'loaded', 'false')}
  f.startTimer(evt.triggerEntity,'KG_RELOAD',false,[4]);
  f.hpLoss(evt.enteringEntity,f.getCreationAttribute(evt.enteringEntity).maxHp,true,false,false,DamagePopUpType.NormalPopUp);
  f.printString('KG_SHOT');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName!=='KG_RELOAD')return;
  {write('evt.eventSourceEntity', 'loaded', 'true')}
}})
.onSignal('KG_dawn',(evt,f)=>{{
  {write('f.getSelfEntity()', 'loaded', 'true')}
}})
""",
    'site': SERVER + f"""
.on('whenTabIsSelected',(evt,f)=>{{
{BUYER}  const site=evt.eventSourceEntity;
  const level={read('site', 'level')};
  if({read('player', 'builders')}<1n){{f.printString('KG_NEED');return;}}
  if(level===0n){{
    {pay(3)}
    // The wall joins the monarch's side: creatures are hostile to players only, and an order to go for something that
    // is not an enemy moved nobody (seen in play).
    const wood=f.createPrefab({P['wall_wood']},[{WALL[0]},0,{WALL[1]}],[0,90,0],site,false,1,{NO_TAGS});
    f.modifyEntityFaction(wood,f.queryEntityFaction(player));
    {write('site', 'level', '1n')}
    f.printString('KG_WALL');f.printString('1');
    return;
  }}
  if(level===1n){{
    // Stone needs a keep of level 1. The wooden wall is taken away without falling: nobody is told it is down.
    if({read('player', 'keep')}<1n){{f.printString('KG_NEED');return;}}
    {pay(5)}
    for(const piece of f.getEntitiesWithSpecifiedPrefabOnTheField({P['wall_wood']}))f.removeEntity(piece);
    const stone=f.createPrefab({P['wall_stone']},[{WALL[0]},0,{WALL[1]}],[0,90,0],site,false,1,{NO_TAGS});
    f.modifyEntityFaction(stone,f.queryEntityFaction(player));
    {write('site', 'level', '2n')}
    f.printString('KG_WALL');f.printString('2');
    return;
  }}
  f.printString('KG_NEED');
}})
.onSignal('KG_wall_down',(evt,f)=>{{
  {write('f.getSelfEntity()', 'level', '0n')}
}})
""",
    'wall': SERVER + f"""
.on('whenEnteringCollisionTrigger',(evt,f)=>{{
  if({IS_GREED('evt.enteringEntity')})return;
  const hp={read('evt.triggerEntity', 'hp')};
  f.removeEntity(evt.enteringEntity);
  {write('evt.triggerEntity', 'hp', 'hp-1n')}
  f.printString('KG_WALL_HIT');
}})
.on('whenCustomVariableChanges',(evt,f)=>{{
  if(evt.variableName!=='hp')return;
  // The event is typed: read the value as the variable's own type.
  if(evt.postChangeValue.asType('int')>0n)return;
  f.sendSignal('KG_wall_down');
  f.printString('KG_WALL_DOWN');
  f.destroyEntity(evt.eventSourceEntity);
}})
.onSignal('KG_dawn',(evt,f)=>{{
  {ONE_PLAYER}
  if({read('players[0]', 'builders')}<1n)return;
  const self=f.getSelfEntity();
  {write('self', 'hp', read('self', 'full'))}
  f.printString('KG_MENDED');
}})
""",
    'greed': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  // An order given the moment a creature appears is not taken (seen in play): the first one comes a second later, and
  // then one every three seconds, in case a wall was built or fell meanwhile.
  f.startTimer(evt.eventSourceEntity,'KG_AIM',false,[1]);
  f.startTimer(evt.eventSourceEntity,'KG_HUNT',true,[3]);
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  const self=evt.eventSourceEntity;
  {AIM}
}})
.onSignal('KG_wall_down',(evt,f)=>{{
  const self=f.getSelfEntity();
  {HUNT}
}})
.on('whenEnteringCollisionTrigger',(evt,f)=>{{
  // A Greed never lands a blow: it stops three or four metres from the monarch and swings at the air (seen in play), so
  // "it reached the monarch" is its own trigger for characters, 4.5 m around it. It takes a coin and vanishes; from an
  // empty purse it takes the crown.
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.enteringEntity as any);
  const coins={read('player', 'coins')};
  if(coins>0n){{
    {write('player', 'coins', 'coins-1n')}
    f.printString('KG_STOLEN');
    f.removeEntity(evt.triggerEntity);
    return;
  }}
  f.printString('KG_CROWN_LOST');
  f.setPlayerSettlementSuccessStatus(player,SettlementStatus.Defeat);
  f.settleStage();
}})
.onSignal('KG_dawn',(evt,f)=>{{
  f.printString('KG_GREED_GONE');
  f.removeEntity(f.getSelfEntity());
}})
""",
    'player': SERVER + f"""
.on('whenCustomVariableChanges',(evt,f)=>{{
  if(evt.variableName!=='coins')return;
  f.printString('KG_COINS');
  f.printString(f.dataTypeConversion(evt.postChangeValue.asType('int'),'str'));
}})
""",
}
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(HEAD + BODY[which])
print('written', sys.argv[2], which)
