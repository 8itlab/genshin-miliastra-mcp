"""Kingdom v5: the v4 structure (many small graphs, each on the thing it is about, started by events) taken to the
point where somebody can sit down and play it without being told anything.

What v5 adds to v4 (examples/kingdom4):
  feedback   every action plays a sound and a one-off effect; night and day have their own music. The ids are in
             kg5_feel.json, picked from sound_catalog, music_catalog and effect_catalog.
  guidance   a station glows while the monarch can afford it and has what it needs; its option says what it does and
             what it costs; a horn and a red warning at the portal come a few seconds before dusk; the build site
             flashes red at that moment if there is no wall.
  pressure   five nights, each with more Greed in several bursts, big ones from the third night. The numbers are in
             kg5_rules.json and were tried in balance.py: doing nothing loses, a wall alone loses, walls with archers
             and a farm or two win.
  choices    coins are both money and life: a Greed that reaches the monarch takes coins, and from an empty purse it
             grabs the crown. Farmers pay back over the days, archers and walls keep the purse safe tonight.
  losing     the crown (a star above the monarch's head) is grabbed over a few seconds: running away breaks the grab.

The lane, along x (the monarch walks along z = 0):
  -7 farm   0 keep   5 camp   10 smith   14.4 bow shop (archers stand at 17..19)   20 build site   23 wall   36 portal

Graphs (the last argument picks one):
  stage    (关卡实体)        puts the stations and the first coins down, keeps the clock: warning, dusk, bursts, dawn,
                            income, victory; switches sky and music
  coin     (KV_coin)        wide trigger: fly to the monarch; narrow trigger: into the purse, unless it is full
  camp     (KV_camp)        option: a vagrant joins as a citizen
  farm     (KV_farm)        option: a citizen becomes a farmer: more coins every morning, they appear on the field
  smith    (KV_smith)       option: a citizen becomes the builder: walls can be built and are mended every morning
  range    (KV_range)       option: a citizen becomes an archer
  site     (KV_site)        options: the wooden wall, then the stone one (needs the keep at level 1)
  keep     (KV_keep)        options: level 1, then level 2: more income, level 1 unlocks stone
  archer   (KV_archer)      its trigger for creatures: shoots one Greed that comes in range, then reloads; after the
                            reload it looks for the next one inside the trigger
  arrow    (KV_arrow)       flies at its target with a follow device and hits half a second later
  wall     (KV_wall_wood, KV_wall_stone)  each Greed that reaches it costs hp and is gone; at 0 it falls; mended at dawn
  greed    (KV_greed, KV_brute)  goes for the wall, or for the monarch if there is none; near the monarch it takes
                            coins, or starts grabbing the crown; leaves at dawn
  player   (player)         tells the stations whenever the purse changes

State: the player's variables coins, citizens, farmers, builders, archers, keep, night, wall (percent, for the bar);
a wall's hp and full; the site's level; a station's lit; an archer's loaded; a Greed's marks, hits, tough, dmg.
Signals: KG_state (the purse or the people changed), KG_warn, KG_dusk, KG_dawn, KG_wall_down.

Usage: python gen_kingdom5.py <guids.json> <out.ts> <day seconds> <night seconds> <starting coins> [nights] <graph>
Prints: KG_READY, KG_DAY, KG_COINS n, KG_CITIZEN, KG_FARMER, KG_BUILDER, KG_ARCHER, KG_KEEP n, KG_WALL n, KG_POOR,
KG_NEED, KG_WARN, KG_DUSK n, KG_GREED, KG_ARROW, KG_SHOT, KG_KILL, KG_WALL_HIT, KG_WALL_DOWN, KG_STOLEN, KG_GRAB,
KG_ESCAPED, KG_CROWN_LOST, KG_DAWN, KG_MENDED, KG_INCOME n, KG_VICTORY."""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
DAY, NIGHT, COINS = int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
RULES = json.load(open(os.path.join(HERE, 'kg5_rules.json'), encoding='utf-8'))
FEEL = json.load(open(os.path.join(HERE, 'kg5_feel.json'), encoding='utf-8'))
NIGHTS = int(sys.argv[6]) if len(sys.argv) > 7 else RULES['nights']
PRICE, CAP = RULES['price'], RULES['cap']
P = {n: guids['prefab:KV_' + n] for n in ('coin', 'tag', 'tag_site', 'tag_keep', 'keep', 'camp', 'smith', 'range', 'farm', 'site', 'wall_wood', 'wall_stone', 'greed',
                                          'brute', 'vagrant', 'builder', 'archer', 'farmer', 'arrow', 'crown')}
NOON = f"f.modifyEnvironmentSettings({guids['environment:KV_day']}n,players,false,0n);"
MIDNIGHT = f"f.modifyEnvironmentSettings({guids['environment:KV_night']}n,players,false,0n);"
STAND = 0.4                      # the height at which creatures are put down
NO_TAGS = '[] as bigint[]'
# Where things stand along the lane (x, z).
FARM, KEEP, CAMP, SMITH, RANGE, SITE, WALL, PORTAL = (-7, 4.6), (0, 3.6), (5, 7.2), (10, 5.6), (14.4, 5.0), (20, 4.6), (23, 0.3), (36, 0)
WARN_BEFORE = 8                  # seconds before dusk at which the horn sounds

HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus }} from 'genshin-ts/definitions/enum'

// Kingdom v5, graph "{which}": see examples/kingdom5/gen_kingdom5.py.
"""
SERVER = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})"
ONE_PLAYER = """const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;"""


# ---- feedback: what the player hears and sees. Every helper returns '' when kg5_feel.json has no id for the key. ----
def sound(key, player='player'):
    s = FEEL['sound'].get(key) or {}
    return f"f.playerPlaysOneShot2dSoundEffect({player},{s['id']}n,{s.get('volume', 100)}n,{s.get('speed', 1)});" if s.get('id') else ''


def burst(key, entity):
    e = FEEL['burst'].get(key) or {}
    if not e.get('id'):
        return ''
    x, y, z = e.get('offset', [0, 0, 0])
    return (f"f.playTimedEffects({e['id']},{entity},'GI_RootNode',true,false,[{x},{y},{z}],[0,0,0],{e.get('scale', 1)},"
            f"{'true' if e.get('sound', True) else 'false'});")


def music(key, player='player'):
    m = FEEL['music'].get(key) or {}
    return f"f.modifyPlayerBackgroundMusic({player},{m['id']}n,0,{m['seconds']},{m.get('volume', 80)}n,true,0,1,true);" if m.get('id') else ''


def loop_on(key, entity):
    e = FEEL['loop'].get(key) or {}
    if not e.get('id'):
        return ''
    x, y, z = e.get('offset', [0, 0, 0])
    return f"f.mountLoopingSpecialEffect({e['id']},{entity},'GI_RootNode',true,true,[{x},{y},{z}],[0,0,0],{e.get('scale', 1)},false);"


def loop_off(key, entity):
    e = FEEL['loop'].get(key) or {}
    return f"f.clearSpecialEffectsBasedOnSpecialEffectAssets({entity},{e['id']});" if e.get('id') else ''


GLOW_ON, GLOW_OFF = loop_on('usable', 'self'), loop_off('usable', 'self')


# ---- small pieces of graph code ----
def create(prefab, x, y, z, turn='[0,0,0]', owner='stage'):
    return f"f.createPrefab({P[prefab]},[{x},{y},{z}],{turn},{owner},false,1,{NO_TAGS});"


def read(entity, name, kind='int'):
    return f"f.getCustomVariable({entity},'{name}').asType('{kind}')"


def write(entity, name, value):
    return f"f.setCustomVariable({entity},'{name}',{value},true);"


def tags(count, at, owner='stage', prefab='tag'):
    """The price of a station, shown without text: that many small coins in a row above it. (On an account of 奇匠
    level 1 the text of an option does not show, only its icon.)"""
    return ''.join(create(prefab, round(at[0] + (i - (count - 1) / 2) * 0.45, 2), 3.4, at[1], owner=owner) for i in range(count))


def retag(prefab, count, at):
    """The price changed: the old row goes, a new one is put up (none when there is nothing more to buy)."""
    return f"for(const old of f.getEntitiesWithSpecifiedPrefabOnTheField({P[prefab]}))f.removeEntity(old);" + tags(count, at, 'self', prefab)


# Every station starts the same way: who chose the option, and what is in the purse.
BUYER = f"""  const self=evt.eventSourceEntity;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const coins={read('player', 'coins')};
"""
PEOPLE = f"{read('player', 'citizens')}+{read('player', 'farmers')}+{read('player', 'builders')}+{read('player', 'archers')}"


def refuse(word):
    """The station says no: KG_POOR for too few coins, KG_NEED for something else that is missing. A question mark
    stands over it for a moment."""
    return (f"{{f.printString('{word}');{sound('deny')}{burst('deny', 'self')}{loop_off('ask', 'self')}{loop_on('ask', 'self')}"
            f"f.startTimer(self,'KG_ASK',false,[1.5]);return;}}")


ASKED = f""".on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName!=='KG_ASK')return;
  {loop_off('ask', 'evt.eventSourceEntity')}
}})
"""


def paid(cost, what):
    """The last thing a purchase does: the purse changes when everything else is already written, because the player's
    graph answers the change by telling every station to look at the state again."""
    return f"{sound(what)}{burst('buy', 'self')}{write('player', 'coins', f'coins-{cost}n')}"


def join(prefab, x, z, count):
    """A villager appears on the monarch's side: the next one stands a little further along."""
    return (f"const unit=f.createPrefab({P[prefab]},f.create3dVector({x}+Number({count})*0.9,{STAND},{z}),[0,0,0],self,false,1,{NO_TAGS});\n"
            f"  f.modifyEntityFaction(unit,f.queryEntityFaction(player));{burst('appear', 'unit')}")


# A citizen takes up a trade: one vagrant leaves the camp and the tradesman appears at the shop.
LEAVE_CAMP = f"""{write('player', 'citizens', 'citizens-1n')}
  const folk=f.getEntitiesWithSpecifiedPrefabOnTheField({P['vagrant']});
  if(folk.length>0)f.removeEntity(folk[0]);"""


def lit(conditions):
    """The station hears that the purse or the people changed and shows whether it can be used now: it glows while
    every condition holds. conditions are the tests that switch the glow off, in order."""
    off = f"{{if(on){{{write('self', 'lit', 'false')}{GLOW_OFF}}}return;}}"
    tests = '\n  '.join(f"if({c}){off}" for c in conditions)
    return f""".onSignal('KG_state',(evt,f)=>{{
  {ONE_PLAYER}
  const player=players[0],self=f.getSelfEntity();
  const coins={read('player', 'coins')},on={read('self', 'lit', 'bool')};
  {tests}
  if(on)return;
  {write('self', 'lit', 'true')}{GLOW_ON}
}})
"""


def trade(station, prefab, counter, limit, x, z, word):
    """A station that turns a citizen into a tradesman."""
    return SERVER + f"""
.on('whenTabIsSelected',(evt,f)=>{{
{BUYER}  const citizens={read('player', 'citizens')},have={read('player', counter)};
  if(have>={limit}n){refuse('KG_NEED')}
  if(citizens<1n){refuse('KG_NEED')}
  if(coins<{PRICE[station]}n){refuse('KG_POOR')}
  {LEAVE_CAMP}
  {write('player', counter, 'have+1n')}
  {join(prefab, x, z, 'have')}
  f.printString('{word}');
  {paid(PRICE[station], station)}
}})
""" + ASKED + lit([f"{read('player', 'citizens')}<1n", f"{read('player', counter)}>={limit}n", f"coins<{PRICE[station]}n"])


NOT_FOE = lambda entity: f"f.getEntityListBySpecifiedPrefabId([{entity}],{P['greed']}).length!==1&&f.getEntityListBySpecifiedPrefabId([{entity}],{P['brute']}).length!==1"
HUNT = "for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0]))f.setTheAggroValueOfSpecifiedEntity(hero,self,100000n);"
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


def wave_start():
    """Dusk: the bursts of this night, as one timer whose sequence is the moments of the bursts."""
    return '\n    '.join(f"if(night==={n}n)f.startTimer(stage,'KG_WAVE',false,[{','.join(str(round(frac * NIGHT, 1)) for frac in RULES['waveAt'][n - 1])}]);"
                         for n in range(1, len(RULES['waves']) + 1))


def wave_burst():
    """One burst is due: which night it is and the place in the timer's sequence (numbered from 0) say who comes out."""
    out = []
    for n, bursts in enumerate(RULES['waves'], 1):
        for i, (small, big) in enumerate(bursts):
            who = ['greed'] * small + ['brute'] * big
            body = ''.join(create(kind, round(PORTAL[0] + 0.8 * j, 1), STAND, round(PORTAL[1] + (j % 3 - 1) * 0.9, 1), '[0,-90,0]') for j, kind in enumerate(who))
            out.append(f"if(tonight==={n}n&&evt.timerSequenceId==={i}n){{{body}}}")
    return '\n    '.join(out)


def income():
    """The morning's coins: the base by the keep, two more for each level of the keep, two on the field for each farmer."""
    base = RULES['income']['base']
    by_keep = ''.join(create('coin', round(-1.5 + i * 0.8, 2), 0.8, 0) for i in range(base))
    per = RULES['income']['keep']
    for level in (1, 2):
        row = ''.join(create('coin', round(-1.5 + (base + (level - 1) * per + i) * 0.8, 2), 0.8, 0) for i in range(per))
        by_keep += f"\n    if(keep>={level}n){{{row}}}"
    per = RULES['income']['farmer']
    field = ''
    for k in range(RULES['farmers']):
        row = ''.join(create('coin', round(FARM[0] - 1.6 + (k * per + i) * 0.6, 2), 0.8, 0) for i in range(per))
        field += f"\n    if(farmers>={k + 1}n){{{row}}}"
    return by_keep + field


SHOOT = f"""{write('target', 'marks', read('target', 'marks') + '+1n')}
    {write('self', 'loaded', 'false')}
    f.startTimer(self,'KG_RELOAD',false,[{RULES['reloadSeconds']}]);
    const from=f.split3dVector(f.getEntityLocationAndRotation(self).location);
    const arrow=f.createPrefab({P['arrow']},f.create3dVector(from.xComponent,from.yComponent+1.6,from.zComponent),[0,0,0],self,false,1,{NO_TAGS});
    f.switchFollowMotionDeviceTargetByEntity(arrow,target,'',[0,1,0],[0,0,0],FollowCoordinateSystem.WorldCoordinateSystem,FollowLocationType.FollowLocation);
    f.activateDisableFollowMotionDevice(arrow,true);
    {burst('shoot', 'self')}
    f.printString('KG_ARROW');"""

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
    {create('farm', FARM[0], 0, FARM[1])}{tags(PRICE['farmer'], FARM)}
    {create('keep', KEEP[0], 0, KEEP[1])}{tags(PRICE['keep1'], KEEP, prefab='tag_keep')}
    {create('camp', CAMP[0], 0, CAMP[1])}{tags(PRICE['citizen'], CAMP)}
    {create('smith', SMITH[0], 0, SMITH[1])}{tags(PRICE['builder'], SMITH)}
    {create('range', RANGE[0], 0, RANGE[1])}{tags(PRICE['archer'], RANGE)}
    {create('site', SITE[0], 0, SITE[1])}{tags(PRICE['wood'], SITE, prefab='tag_site')}
    // The first coins lie on the way to the camp: picking them up is the first thing the game teaches.
    {''.join(create('coin', round(3.2 + i * 0.7, 2), 0.8, 0) for i in range(COINS))}
    // The crown is a star that follows the monarch above the head.
    for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(player)){{
      const crown={create('crown', 2, 2.6, 0)[:-1]};
      f.switchFollowMotionDeviceTargetByEntity(crown,hero,'',[0,2.3,0],[0,0,0],FollowCoordinateSystem.WorldCoordinateSystem,FollowLocationType.FollowLocation);
      f.activateDisableFollowMotionDevice(crown,true);
    }}
    {music('day')}
    f.startTimer(stage,'KG_TO_WARN',false,[{DAY - WARN_BEFORE}]);
    f.startTimer(stage,'KG_TO_DUSK',false,[{DAY}]);
    f.startGlobalTimer(stage,'KG_clock');
    f.printString('KG_DAY');
    return;
  }}
  if(evt.timerName==='KG_TO_WARN'){{
    {sound('horn')}
    f.sendSignal('KG_warn');
    f.printString('KG_WARN');
    return;
  }}
  if(evt.timerName==='KG_TO_DUSK'){{
    const night={read('player', 'night')}+1n;
    {write('player', 'night', 'night')}
    {MIDNIGHT}
    {music('night')}{sound('dusk')}
    f.sendSignal('KG_dusk');
    {wave_start()}
    f.startTimer(stage,'KG_TO_DAWN',false,[{NIGHT}]);
    f.startGlobalTimer(stage,'KG_clock');
    f.modifyGlobalTimer(stage,'KG_clock',{NIGHT - DAY});
    f.printString('KG_DUSK');f.printString(f.dataTypeConversion(night,'str'));
    return;
  }}
  if(evt.timerName==='KG_WAVE'){{
    const tonight={read('player', 'night')};
    {sound('greed')}
    {wave_burst()}
    f.printString('KG_GREED');
    return;
  }}
  if(evt.timerName==='KG_TO_DAWN'){{
    f.stopTimer(stage,'KG_WAVE');
    {NOON}
    f.sendSignal('KG_dawn');
    f.printString('KG_DAWN');
    if({read('player', 'night')}>={NIGHTS}n){{
      // The last night is over: fireworks over the keep, then the level is won.
      {music('victory')}{sound('victory')}
      for(const hall of f.getEntitiesWithSpecifiedPrefabOnTheField({P['keep']})){{{burst('victory', 'hall')}}}
      f.startTimer(stage,'KG_WIN',false,[4]);
      return;
    }}
    {music('day')}{sound('dawn')}
    const keep={read('player', 'keep')},farmers={read('player', 'farmers')};
    f.printString('KG_INCOME');f.printString(f.dataTypeConversion({RULES['income']['base']}n+keep*{RULES['income']['keep']}n+farmers*{RULES['income']['farmer']}n,'str'));
    {income()}
    f.startTimer(stage,'KG_TO_WARN',false,[{DAY - WARN_BEFORE}]);
    f.startTimer(stage,'KG_TO_DUSK',false,[{DAY}]);
    f.startGlobalTimer(stage,'KG_clock');
    return;
  }}
  if(evt.timerName==='KG_WIN'){{
    f.printString('KG_VICTORY');
    f.setPlayerSettlementSuccessStatus(player,SettlementStatus.Victory);
    f.settleStage();
  }}
}})
""",
    'coin': SERVER + f"""
.on('whenEnteringCollisionTrigger',(evt,f)=>{{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.enteringEntity as any);
  if(evt.triggerId===1n){{
    // A full purse takes nothing: the coin stays where it lies.
    if({read('player', 'coins')}>={CAP}n)return;
    // A character has no GUID: the device follows it through the GUID of its player.
    f.switchFollowMotionDeviceTargetByGuid(evt.triggerEntity,f.queryGuidByEntity(player),'',[0,1,0],[0,0,0],FollowCoordinateSystem.WorldCoordinateSystem,FollowLocationType.FollowLocation);
    f.activateDisableFollowMotionDevice(evt.triggerEntity,true);
    return;
  }}
  const coins={read('player', 'coins')};
  if(coins>={CAP}n){{f.activateDisableFollowMotionDevice(evt.triggerEntity,false);return;}}
  {sound('coin')}{burst('coin', 'evt.enteringEntity')}
  {write('player', 'coins', 'coins+1n')}
  f.destroyEntity(evt.triggerEntity);
}})
""",
    'camp': SERVER + f"""
.on('whenTabIsSelected',(evt,f)=>{{
{BUYER}  const citizens={read('player', 'citizens')};
  if({PEOPLE}>={RULES['people']}n){refuse('KG_NEED')}
  if(coins<{PRICE['citizen']}n){refuse('KG_POOR')}
  {write('player', 'citizens', 'citizens+1n')}
  {join('vagrant', 4.2, 2.6, 'citizens')}
  f.printString('KG_CITIZEN');
  {paid(PRICE['citizen'], 'citizen')}
}})
""" + ASKED + lit([f"{PEOPLE}>={RULES['people']}n", f"coins<{PRICE['citizen']}n"]),
    'farm': trade('farmer', 'farmer', 'farmers', RULES['farmers'], FARM[0] - 1.4, 2.4, 'KG_FARMER'),
    'smith': trade('builder', 'builder', 'builders', 1, 10.4, 2.8, 'KG_BUILDER'),
    'range': trade('archer', 'archer', 'archers', RULES['archers'], 17.0, 2.6, 'KG_ARCHER'),
    'site': SERVER + f"""
.on('whenTabIsSelected',(evt,f)=>{{
{BUYER}  const level={read('self', 'level')};
  if({read('player', 'builders')}<1n){refuse('KG_NEED')}
  if(level===0n){{
    if(coins<{PRICE['wood']}n){refuse('KG_POOR')}
    // The wall joins the monarch's side: creatures are hostile to players only, and an order to go for something that
    // is not an enemy moved nobody (seen in play).
    const wood=f.createPrefab({P['wall_wood']},[{WALL[0]},0,{WALL[1]}],[0,90,0],self,false,1,{NO_TAGS});
    f.modifyEntityFaction(wood,f.queryEntityFaction(player));
    {burst('built', 'wood')}
    {write('self', 'level', '1n')}
    f.activateDisableTab(self,1n,false);f.activateDisableTab(self,2n,true);
    {retag('tag_site', PRICE['stone'], SITE)}
    {write('player', 'wall', '100n')}
    f.printString('KG_WALL');f.printString('1');
    {paid(PRICE['wood'], 'build')}
    return;
  }}
  if(level===1n){{
    // Stone needs a keep of level 1. The wooden wall is taken away without falling: nobody is told it is down.
    if({read('player', 'keep')}<1n){refuse('KG_NEED')}
    if(coins<{PRICE['stone']}n){refuse('KG_POOR')}
    for(const piece of f.getEntitiesWithSpecifiedPrefabOnTheField({P['wall_wood']}))f.removeEntity(piece);
    const stone=f.createPrefab({P['wall_stone']},[{WALL[0]},0,{WALL[1]}],[0,90,0],self,false,1,{NO_TAGS});
    f.modifyEntityFaction(stone,f.queryEntityFaction(player));
    {burst('built', 'stone')}
    {write('self', 'level', '2n')}
    f.activateDisableTab(self,2n,false);
    {retag('tag_site', 0, SITE)}
    {write('player', 'wall', '100n')}
    f.printString('KG_WALL');f.printString('2');
    {paid(PRICE['stone'], 'build')}
    return;
  }}
  if(level>=2n){refuse('KG_NEED')}
}})
.onSignal('KG_wall_down',(evt,f)=>{{
  const self=f.getSelfEntity();
  {write('self', 'level', '0n')}
  f.activateDisableTab(self,1n,true);f.activateDisableTab(self,2n,false);
  {retag('tag_site', PRICE['wood'], SITE)}
  f.sendSignal('KG_state');
}})
.onSignal('KG_warn',(evt,f)=>{{
  // The horn has sounded and there is no wall: the site flashes red.
  const self=f.getSelfEntity();
  if({read('self', 'level')}!==0n)return;
  {burst('alarm', 'self')}
}})
""" + ASKED + lit([f"{read('player', 'builders')}<1n", f"{read('self', 'level')}===0n&&coins<{PRICE['wood']}n", f"{read('self', 'level')}===1n&&{read('player', 'keep')}<1n",
           f"{read('self', 'level')}===1n&&coins<{PRICE['stone']}n", f"{read('self', 'level')}>=2n"]),
    'keep': SERVER + f"""
.on('whenTabIsSelected',(evt,f)=>{{
{BUYER}  const level={read('player', 'keep')};
  if(level>=2n){refuse('KG_NEED')}
  if(level===0n&&coins<{PRICE['keep1']}n){refuse('KG_POOR')}
  if(level===1n&&coins<{PRICE['keep2']}n){refuse('KG_POOR')}
  {write('player', 'keep', 'level+1n')}
  f.activateDisableTab(self,level+1n,false);
  if(level===0n)f.activateDisableTab(self,2n,true);
  f.printString('KG_KEEP');f.printString(f.dataTypeConversion(level+1n,'str'));
  {sound('keep')}{burst('buy', 'self')}
  if(level===0n){{
    {retag('tag_keep', PRICE['keep2'], KEEP)}
    {write('player', 'coins', f"coins-{PRICE['keep1']}n")}
    return;
  }}
  {retag('tag_keep', 0, KEEP)}
  {write('player', 'coins', f"coins-{PRICE['keep2']}n")}
}})
""" + ASKED + lit([f"{read('player', 'keep')}===0n&&coins<{PRICE['keep1']}n", f"{read('player', 'keep')}===1n&&coins<{PRICE['keep2']}n", f"{read('player', 'keep')}>=2n"]),
    'archer': SERVER + f"""
.on('whenEnteringCollisionTrigger',(evt,f)=>{{
  // The reach of the bow is the archer's own trigger for creatures. One arrow, then three seconds to reload. A Greed
  // that already has as many arrows on the way as it can take is left to the next archer.
  const self=evt.triggerEntity,target=evt.enteringEntity;
  if({NOT_FOE('target')})return;
  if(!{read('self', 'loaded', 'bool')})return;
  if({read('target', 'marks')}>={read('target', 'tough')})return;
  {SHOOT}
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName!=='KG_RELOAD')return;
  const self=evt.eventSourceEntity;
  {write('self', 'loaded', 'true')}
  // Whoever walked in while the bow was not ready raised no event that was heard: look at who is inside now.
  for(const target of f.getAllEntitiesWithinTheCollisionTrigger(self,1n)){{
    if(!{read('self', 'loaded', 'bool')})continue;
    if({NOT_FOE('target')})continue;
    if({read('target', 'marks')}>={read('target', 'tough')})continue;
    {SHOOT}
  }}
}})
""",
    'arrow': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'KG_HIT',false,[{RULES['arrowSeconds']}]);
  {loop_on('arrow', 'evt.eventSourceEntity')}
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  // Half a second after it was let fly the arrow has arrived, wherever the follow device has brought it: the target is
  // whoever the device follows. A Greed that reached the wall meanwhile is gone, and the arrow with it.
  const self=evt.eventSourceEntity;
  const target=f.getFollowMotionDeviceTarget(self).followTargetEntity;
  {ONE_PLAYER}
  const player=players[0];
  // The arrow itself goes last: its follow device is where the target is read from.
  if(!f.queryIfEntityIsOnTheField(target)){{f.removeEntity(self);return;}}
  {burst('hit', 'target')}{sound('hit')}
  const hits={read('target', 'hits')}+1n;
  {write('target', 'hits', 'hits')}
  f.printString('KG_SHOT');
  if(hits<{read('target', 'tough')}){{f.removeEntity(self);return;}}
  f.printString('KG_KILL');
  f.hpLoss(target,f.getCreationAttribute(target).maxHp,true,false,false,DamagePopUpType.NormalPopUp);
  f.removeEntity(self);
}})
""",
    'wall': SERVER + f"""
.on('whenEnteringCollisionTrigger',(evt,f)=>{{
  const self=evt.triggerEntity,foe=evt.enteringEntity;
  if({NOT_FOE('foe')})return;
  // The wall's hp is written while the Greed still exists: a value read from an entity is fetched when the node that
  // uses it runs, not where the line stands, and a removed Greed has no dmg any more (in the first full run every
  // wall stayed at 100 for that reason).
  const hp={read('self', 'hp')}-{read('foe', 'dmg')};
  {burst('wallHit', 'self')}
  f.printString('KG_WALL_HIT');
  {write('self', 'hp', 'hp')}
  f.removeEntity(foe);
}})
.on('whenCustomVariableChanges',(evt,f)=>{{
  if(evt.variableName!=='hp')return;
  {ONE_PLAYER}
  const player=players[0],self=evt.eventSourceEntity;
  // The event is typed: read the value as the variable's own type.
  const hp=evt.postChangeValue.asType('int');
  if(hp>0n){{
    {write('player', 'wall', f"hp*100n/{read('self', 'full')}")}
    {sound('wallHit')}
    return;
  }}
  {write('player', 'wall', '0n')}
  {sound('wallDown')}
  for(const site of f.getEntitiesWithSpecifiedPrefabOnTheField({P['site']})){{{burst('wallDown', 'site')}}}
  f.sendSignal('KG_wall_down');
  f.printString('KG_WALL_DOWN');
  f.destroyEntity(self);
}})
.onSignal('KG_dawn',(evt,f)=>{{
  {ONE_PLAYER}
  const player=players[0];
  if({read('player', 'builders')}<1n)return;
  const self=f.getSelfEntity();
  if({read('self', 'hp')}>={read('self', 'full')})return;
  {write('self', 'hp', read('self', 'full'))}
  {burst('mended', 'self')}{sound('mended')}
  f.printString('KG_MENDED');
}})
""",
    'greed': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  // An order given the moment a creature appears is not taken (seen in play): the first one comes a second later, and
  // then one every three seconds, in case a wall was built or fell meanwhile.
  f.startTimer(evt.eventSourceEntity,'KG_AIM',false,[1]);
  f.startTimer(evt.eventSourceEntity,'KG_HUNT',true,[3]);
  {burst('portal', 'evt.eventSourceEntity')}
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  const self=evt.eventSourceEntity;
  {ONE_PLAYER}
  const player=players[0];
  if(evt.timerName==='KG_GRAB'){{
    // The grab ends: the crown is gone unless the monarch ran out of reach, or found a coin to throw meanwhile.
    if(f.getAllEntitiesWithinTheCollisionTrigger(self,1n).length<1){{f.printString('KG_ESCAPED');return;}}
    const coins={read('player', 'coins')};
    if(coins>0n){{
      {write('player', 'coins', 'coins-1n')}
      {sound('stolen')}
      f.printString('KG_STOLEN');
      f.removeEntity(self);
      return;
    }}
    f.printString('KG_CROWN_LOST');
    for(const crown of f.getEntitiesWithSpecifiedPrefabOnTheField({P['crown']}))f.switchFollowMotionDeviceTargetByEntity(crown,self,'',[0,2.6,0],[0,0,0],FollowCoordinateSystem.WorldCoordinateSystem,FollowLocationType.FollowLocation);
    {sound('crown')}{music('defeat')}
    f.startTimer(self,'KG_LOST',false,[2]);
    return;
  }}
  if(evt.timerName==='KG_LOST'){{
    f.setPlayerSettlementSuccessStatus(player,SettlementStatus.Defeat);
    f.settleStage();
    return;
  }}
  {AIM}
}})
.onSignal('KG_wall_down',(evt,f)=>{{
  const self=f.getSelfEntity();
  {ONE_PLAYER}
  {HUNT}
}})
.on('whenEnteringCollisionTrigger',(evt,f)=>{{
  // A Greed never lands a blow: it stops three or four metres from the monarch and swings at the air (seen in play), so
  // "it reached the monarch" is its own trigger for characters, 4.5 m around it. It takes what it can carry and
  // vanishes; at an empty purse it starts to grab the crown, which takes a few seconds.
  const self=evt.triggerEntity,hero=evt.enteringEntity;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(hero as any);
  const coins={read('player', 'coins')};
  if(coins>0n){{
    // The purse is written before the Greed goes (see the wall graph: what is read from it must be used first).
    const take={read('self', 'dmg')};
    {burst('stolen', 'hero')}{sound('stolen')}
    f.printString('KG_STOLEN');
    if(coins<take){{{write('player', 'coins', '0n')}f.removeEntity(self);return;}}
    {write('player', 'coins', 'coins-take')}
    f.removeEntity(self);
    return;
  }}
  {burst('grab', 'hero')}{sound('grab')}
  f.startTimer(self,'KG_GRAB',false,[{RULES['grabSeconds']}]);
  f.printString('KG_GRAB');
}})
.onSignal('KG_dawn',(evt,f)=>{{
  f.removeEntity(f.getSelfEntity());
}})
""",
    'player': SERVER + f"""
.on('whenCustomVariableChanges',(evt,f)=>{{
  if(evt.variableName!=='coins')return;
  f.printString('KG_COINS');
  f.printString(f.dataTypeConversion(evt.postChangeValue.asType('int'),'str'));
  f.sendSignal('KG_state');
}})
""",
}
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(HEAD + BODY[which])
print('written', sys.argv[2], which)
