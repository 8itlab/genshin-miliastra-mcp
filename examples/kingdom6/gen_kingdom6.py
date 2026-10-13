"""Kingdom v6: the people of v5 stood where they were put; these walk, work and fight, and the fighting is real.

Every villager and every Greed is a complex creature (复杂造物): its decision graph looks at whether it is dark (a
variable of the stage entity), whether it has a target (an enemy it noticed by itself) and its own variables, and picks
one of a few status graphs. No server graph moves anybody, and no server graph counts blows: health, hits and deaths
are the platform's (examples/skirmish is the same in small; examples/kingdom5 has the rest of the game: the feedback
layer, the guidance without text, the five nights). Every attack is the one its animation shows, with the thing in the
hand that belongs to it (creature_animations says which: inItsHands, what, atMs).

  citizens   (盗宝团·斥候) stroll around the camp by day and run to the keep when the horn sounds
  farmers    walk to the field and dig, a pickaxe in the hand while they do; they run home with the horn. The morning's
             coins still come with the dawn
  builder    walks to the wall in the morning and hammers it whole again: every blow gives the wall health back
  throwers   stand behind the wall at night and throw knives at the Greed they notice: the knife is in the hand until
             it leaves it, then it is a projectile that follows its target and that only enemies set off
  soldiers   (野伏·阵刀番, the barracks) carry a sword, stand in front of the wall at night, run at the Greed they
             notice and leap at it: the stroke is a hit box. A soldier has health and can fall
  Greed      (打手丘丘人 with a crude cleaver: 双手剑01, small, in the right hand; from the third night also a brute, a
             火斧丘丘暴徒 with the same blade at full size) walk to the wall and hack at it: each blow is a hit box that
             takes health off the wall (and off any villager in front of it). They fight a soldier that comes at
             them. With no wall they go for the monarch: a blow takes coins and the Greed runs off with them; from an
             empty purse it grabs the crown. At dawn those left run back
  the wall   has health and a hurt box, and lets everybody through (it is not solid). While it stands, a Greed that
             comes near it keeps to a line before it and hacks, whatever it is after: left to its targets and to
             the step every stroke takes it walked through the wall to the monarch behind it (seen in play). A Greed
             hacks and hops back, a brute sweeps once without leaving its place

The lane, along x (the monarch walks along z = 0), 9 m to the left of where v5 had it, so that the portal stands on
the ground of a new map (which ends near x = 32):
  -16 farm   -9 keep   -4 camp   1 smith   4.6 knife range   8.8 barracks   13 build site   17.2 wall   30 portal
Between the site and the wall nothing offers anything: the monarch can stand there and watch the night with no prompt
over the picture (a station's option shows while the monarch is within 2 m of it along the lane).

Graphs (the last argument picks one):
  stage     (关卡实体)       stations and first coins, the clock: horn, dusk, bursts, dawn, income, victory; the two
                            variables everybody's decision graph reads: dark, mend; who fell (whenEntityIsDestroyed)
  coin, camp, farm, smith, range, barracks, site, keep, player    as in v5 (a station also tells its new unit where its
                            home and its work are)
  unit      (KV_vagrant, KV_farmer, KV_builder, KV_thrower, KV_soldier)  puts the sword in a soldier's hand; hears the
                            creature's skill: the builder's blow mends, the thrower's hand lets a knife fly
  knife     (KV_knife)      shows the knife and its trail, and is gone after it hit
  wall      (KV_wall_wood, KV_wall_stone)  shows its health on the bar when it is hit, asks for the builder at dawn
  greed     (KV_greed, KV_brute)  is given the wall when it stands before it, the monarch when there is no wall; hears
                            its blow when the monarch is what it is after: coins, then the crown; runs off at dawn or
                            with its loot
  dig, hammer, throw (creatureSkill)   tell the creature's server graph that the moment has come
  slash, punch, smash (creatureSkill)  trigger the hit box of the stroke
  citizenMind, farmerMind, builderMind, throwerMind, soldierMind, greedMind (creatureDecision)
  home, post, stroll, toil, mend, shoot, fight, advance, bash, siege, retreat (creatureStatus)

State: the player's variables coins, citizens, farmers, builders, throwers, soldiers, keep, night, wall (percent, for
the bar); the stage's dark and mend; a unit's kind, hx, hz (home) and wx, wz (work or post); the site's level; a
station's lit; a Greed's kind, dmg (coins a blow takes), sated, grabbing, siege (a wall stands), near (metres from its
target at which it strikes), stand (metres before the wall at which it hacks at it), hack (the skill it does so with),
lane (the z it walks along).
Signals: KG_state, KG_warn, KG_dusk, KG_dawn, KG_wall_down, KG_mend (the wall wants mending), KG_mended.

Usage: python gen_kingdom6.py <guids.json> <out.ts> <day seconds> <night seconds> <starting coins> [nights] <graph>
Prints: KG_READY, KG_DAY, KG_COINS n, KG_CITIZEN, KG_FARMER, KG_BUILDER, KG_THROWER, KG_SOLDIER, KG_KEEP n, KG_WALL n,
KG_POOR, KG_NEED, KG_WARN, KG_DUSK n, KG_GREED, KG_THROW, KG_KNIFE, KG_SLASH n, KG_PUNCH n, KG_KILL, KG_WALL_HP n,
KG_WALL_DOWN, KG_DOWN soldier|thrower|farmer|builder|citizen, KG_AT_WALL, KG_STOLEN, KG_GRAB, KG_ESCAPED,
KG_CROWN_LOST, KG_DAWN, KG_MEND, KG_MENDED, KG_INCOME n, KG_VICTORY."""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
DAY, NIGHT, COINS = int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
# The numbers: kg6_rules.json, or the file the round names (generatorData {rules: "kg6_rules_play.json"}).
RULES = json.load(open(os.path.join(HERE, guids.get('rules', 'kg6_rules.json')), encoding='utf-8'))
FEEL = json.load(open(os.path.join(HERE, 'kg6_feel.json'), encoding='utf-8'))
NIGHTS = int(sys.argv[6]) if len(sys.argv) > 7 else RULES['nights']
PRICE, CAP = RULES['price'], RULES['cap']
G = lambda key: guids['graph:' + key]
FIGHT = RULES['fight']
P = {n: guids['prefab:KV_' + n] for n in ('coin', 'tag', 'tag_site', 'tag_keep', 'keep', 'camp', 'smith', 'range', 'barracks', 'farm', 'site', 'wall_wood', 'wall_stone',
                                          'greed', 'brute', 'vagrant', 'builder', 'thrower', 'farmer', 'soldier', 'knife', 'crown')}
SERVER_GRAPHS = ('stage', 'coin', 'camp', 'farm', 'smith', 'range', 'barracks', 'site', 'keep', 'unit', 'knife', 'wall', 'greed', 'player')
SKILL_GRAPHS = ('dig', 'hammer', 'throw', 'slash', 'punch', 'smash')
NOON = f"f.modifyEnvironmentSettings({guids['environment:KV_day']}n,players,false,0n);" if which in SERVER_GRAPHS else ''
MIDNIGHT = f"f.modifyEnvironmentSettings({guids['environment:KV_night']}n,players,false,0n);" if which in SERVER_GRAPHS else ''
STAND = 0.4                      # the height at which creatures are put down
NO_TAGS = '[] as bigint[]'
# What everything is: the variable "kind" of its prefab, read from the snapshot when it is destroyed.
KIND = {'vagrant': 1, 'farmer': 2, 'builder': 3, 'thrower': 4, 'soldier': 5, 'greed': 6, 'brute': 7, 'wall_wood': 8, 'wall_stone': 9}
# Where things stand along the lane (x, z). X0 moves the lane v5 laid out from x=-7 to x=39 onto the ground of a new map.
X0 = -9
at = lambda x, z: (round(x + X0, 2), z)
FARM, KEEP, CAMP, SMITH, RANGE, BARRACKS, SITE, WALL, PORTAL = at(-7, 4.6), at(0, 3.6), at(5, 7.2), at(10, 5.6), at(13.6, 5.0), at(17.8, 5.2), at(22, 4.6), at(26.2, 0.3), at(39, 0)
WARN_BEFORE = 8                  # seconds before dusk at which the horn sounds and everybody takes their place
FLEE_SECONDS = 7                 # how long a Greed that runs off is still seen
SWORD = (10002152, 'GI_WeaponR', 1.4)   # 单手剑01 in the soldier's right hand, a little larger than it comes
# What the Greed carry. There is no club among the models, and 双手剑01, a dark slab of a blade, is the nearest thing:
# small in a Greed's hand it is a crude cleaver, at its own size in a brute's a weapon to fear.
LANE = 0.9        # metres between the four lanes the Greed come in (the wall is four metres wide)
ROWS, ROW = {'greed': 2.8, 'brute': 3.6}, 0.7   # metres before the wall at which the first row stands, and the second row behind it
WALL_ZONE = 6.5   # a Greed this near a standing wall (metres before it) has the wall and nothing else to do
CLEAVER = {'greed': (10002151, 'GI_WeaponR', 0.55), 'brute': (10002151, 'GI_WeaponR', 1.2)}
KNIFE, TRAIL, SLASH_ARC, KNIFE_HIT = 10006069, 10006071, 10016139, 10006059   # 盗宝团_飞刀_刀, 盗宝团_飞刀_尾迹, 野伏众_近战攻击02_刀光, 弩箭_命中_敌人

SERVER_HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ EntityType, FollowCoordinateSystem, FollowLocationType, SettlementStatus }} from 'genshin-ts/definitions/enum'

// Kingdom v6, graph "{which}": see examples/kingdom6/gen_kingdom6.py.
"""
CLIENT_HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ TacticSpeed, TargetEntity }} from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "{which}": see examples/kingdom6/gen_kingdom6.py.
"""
SKILL_HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ AttackType, ElementalType, EntityType, HitType, TargetType, TriggerRestriction }} from 'genshin-ts/definitions/enum'
import {{ AttackLayerConfig, HitLevel, KnockbackDirectionType, SectorDetectionDirection }} from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "{which}": see examples/kingdom6/gen_kingdom6.py.
"""
SERVER = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})"
ME = f"{{id:{guids['graph:id']},name:'{guids['graph:name']}',prefix:false}}"
STR = lambda v: f"f.dataTypeConversion({v},'str')"
ONE_PLAYER = """const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;"""


# ---- feedback: what the player hears and sees. Every helper returns '' when kg6_feel.json has no id for the key. ----
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


IS = lambda entity, prefab: f"f.getEntityListBySpecifiedPrefabId([{entity}],{P[prefab]}).length===1"
PLACE = lambda e: f"f.getEntityLocationAndRotation({e}).location"
FAR = lambda a, b, metres: f"f.distanceBetweenTwoCoordinatePoints({PLACE(a)},{PLACE(b)})>{metres}"


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
PEOPLE = '+'.join(read('player', n) for n in ('citizens', 'farmers', 'builders', 'throwers', 'soldiers'))


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


def join(prefab, x, z, count, orders=''):
    """A villager appears on the monarch's side, the next one a little further along, and is told where its home and
    its work are: orders writes the unit's variables (count is how many of its kind there were before it)."""
    return (f"const unit=f.createPrefab({P[prefab]},f.create3dVector({x}+Number({count})*0.9,{STAND},{z}),[0,0,0],self,false,1,{NO_TAGS});\n"
            f"  f.modifyEntityFaction(unit,f.queryEntityFaction(player));{burst('appear', 'unit')}{orders}")


def spot(a, b, x, step, z, count='have'):
    """Two variables of the new unit: a place in a row that starts at x and goes on by step for each one before it."""
    return write('unit', a, f'{x}+Number({count})*{step}') + write('unit', b, z)


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


def trade(station, prefab, counter, limit, x, z, word, orders):
    """A station that turns a citizen into a tradesman."""
    return SERVER + f"""
.on('whenTabIsSelected',(evt,f)=>{{
{BUYER}  const citizens={read('player', 'citizens')},have={read('player', counter)};
  if(have>={limit}n){refuse('KG_NEED')}
  if(citizens<1n){refuse('KG_NEED')}
  if(coins<{PRICE[station]}n){refuse('KG_POOR')}
  {LEAVE_CAMP}
  {write('player', counter, 'have+1n')}
  {join(prefab, x, z, 'have', orders)}
  f.printString('{word}');
  {paid(PRICE[station], station)}
}})
""" + ASKED + lit([f"{read('player', 'citizens')}<1n", f"{read('player', counter)}>={limit}n", f"coins<{PRICE[station]}n"])


def wave_start():
    """Dusk: the bursts of this night, as one timer whose sequence is the moments of the bursts."""
    return '\n    '.join(f"if(night==={n}n)f.startTimer(stage,'KG_WAVE',false,[{','.join(str(round(frac * NIGHT, 1)) for frac in RULES['waveAt'][n - 1])}]);"
                         for n in range(1, len(RULES['waves']) + 1))


def arrive(kind, x, z, stand):
    """A Greed comes out of the portal and is told its lane (the z it walks along) and how far before the wall it stands."""
    made = create(kind, x, STAND, z, '[0,-90,0]')[:-1]
    return f"f.setCustomVariable({made},'stand',{round(stand, 2)},true);"


def wave_burst():
    """One burst is due: which night it is and the place in the timer's sequence (numbered from 0) say who comes out."""
    out = []
    for n, bursts in enumerate(RULES['waves'], 1):
        for i, (small, big) in enumerate(bursts):
            who = ['greed'] * small + ['brute'] * big
            # Each comes out in one of four lanes across the lane, a burst one lane on from the one before it, and keeps
            # to its lane all the way to the wall; every other burst stands a row farther back there. Given one point
            # to walk to, a night's Greed stood in each other at the wall (seen in play).
            body = ''.join(arrive(kind, round(PORTAL[0] + 1.1 * j, 1), round(WALL[1] + ((j + i) % 4 - 1.5) * LANE, 2), ROWS[kind] + (i % 2) * ROW) for j, kind in enumerate(who))
            out.append(f"if(tonight==={n}n&&evt.timerSequenceId==={i}n){{{body}}}")
    return '\n    '.join(out)


def income():
    """The morning's coins: the base by the keep, two more for each level of the keep, two on the field for each farmer."""
    base = RULES['income']['base']
    by_keep = ''.join(create('coin', round(X0 - 1.5 + i * 0.8, 2), 0.8, 0) for i in range(base))
    per = RULES['income']['keep']
    for level in (1, 2):
        row = ''.join(create('coin', round(X0 - 1.5 + (base + (level - 1) * per + i) * 0.8, 2), 0.8, 0) for i in range(per))
        by_keep += f"\n    if(keep>={level}n){{{row}}}"
    per = RULES['income']['farmer']
    field = ''
    for k in range(RULES['farmers']):
        row = ''.join(create('coin', round(FARM[0] - 1.6 + (k * per + i) * 0.6, 2), 0.8, 0) for i in range(per))
        field += f"\n    if(farmers>={k + 1}n){{{row}}}"
    return by_keep + field


# ---- what the creature graphs read: itself, its target, the stage entity ----
DARK = "f.getCustomVariable(TargetEntity.StageEntity,'dark').asType('int')===1n"
MENDING = "f.getCustomVariable(TargetEntity.StageEntity,'mend').asType('int')===1n"
SATED = "f.getCustomVariable(TargetEntity.Self,'sated').asType('int')===1n"
SIEGE = "f.getCustomVariable(TargetEntity.Self,'siege').asType('int')===1n"
NEAR = "f.getCustomVariable(TargetEntity.Self,'near').asType('float')"
# Where a Greed stands to hack at the wall: in its own lane, its own 'stand' metres before it (2.8 or 3.5, a brute 3.6 or 4.3), and with which
# of its skills (its own 'hack'). Every stroke carries a creature forward, a Greed's 1.3 m, the second cut of a brute's
# nearly three, and a creature sent back to a point behind it first runs on in a wide turn: that took the Greed
# through the wall (seen in play). So the strokes used at the wall end where they began: a Greed's is followed by its
# hop back (闪避, 2.5 m), a brute's is only the first sweep of its two cuts, which hardly moves it.
LINE = f"f.create3dVector({WALL[0]}+f.getCustomVariable(TargetEntity.Self,'stand').asType('float'),0,f.getCustomVariable(TargetEntity.Self,'lane').asType('float'))"
HACK = "f.getCustomVariable(TargetEntity.Self,'hack').asType('int')"
AT_WALL = f"{SIEGE}&&f.split3dVector(f.getEntityLocation(TargetEntity.Self)).xComponent<={round(WALL[0] + WALL_ZONE, 2)}"
HAS_TARGET = 'f.queryIfEntityIsOnTheField(TargetEntity.AggroTarget)'
OWN = lambda a, b: f"f.create3dVector(f.getCustomVariable(TargetEntity.Self,'{a}').asType('float'),0,f.getCustomVariable(TargetEntity.Self,'{b}').asType('float'))"
STILL = "f.tacticStandStill(true,'still',false);"
FACE = "f.tacticRotateToTheTargetEntity(true,f.getTargetEntity(),360,false,'face',false);"


def mind(*choices):
    """A decision graph: the first condition that holds picks the status graph; the last entry needs none."""
    def nest(rest):
        (cond, status), more = rest[0], rest[1:]
        go = f"f.switchToSelfExecutionStatus(true,{G(status)},1n);"
        return go if not more else f"if({cond}){{{go}}}\n  else{{{nest(more)}}}"
    return f"g.creationStatusDecision({ME}).on('start1',(evt,f)=>{{\n  {nest(choices)}\n}})\n"


def status(*lines):
    """A status graph: each line runs only if the one before it could not (it is done, not allowed, or cooling down)."""
    return f"g.creationStatus({ME}).on('start1',(evt,f)=>{{\n  " + '\n  '.join(lines) + "\n})\n"


# The Greed carry their weapon from the first moment: a looping effect that is a model, on the right hand.
ARM = ''.join(f"\n  if({IS('evt.eventSourceEntity', kind)})f.mountLoopingSpecialEffect({CLEAVER[kind][0]},evt.eventSourceEntity,'{CLEAVER[kind][1]}',true,true,[0,0,0],[0,0,0],{CLEAVER[kind][2]},false);"
              for kind in ('greed', 'brute')) if which in SERVER_GRAPHS else ''


def hitbox(damage, kinds, hit_type, reach=3):
    """A skill's stroke: a sector in front of the creature, 2 m high, 120 degrees wide and reach metres long, that takes
    damage off every enemy of the kinds named that has a hurt box, once each (examples/skirmish). The server graph of
    the creature hears of it too."""
    return f"""const self=f.getSelfEntity();
  f.triggerSectorHitboxAtSpecificLocation(TargetType.HostileFaction,f.getEntityLocation(self),f.getEntityRotation(self),0,{damage},[{','.join('EntityType.' + k for k in kinds)}],
    TriggerRestriction.TriggerOnlyOncePerEntity,10006012,2,120,{reach},0,SectorDetectionDirection.FromInsideOut,AttackLayerConfig.OnlyOnHitHurtbox,[] as string[],
    ElementalType.None,0,HitType.{hit_type},AttackType.MeleeAttack,0,true,10006012,KnockbackDirectionType.LineConnectingAttackerAndHitPoint,false,
    [0,0,0],[0,0,0],1,[0,0,0],[0,0,0],1.5,1,1,HitLevel.LightHit,1000,1000);
  f.notifyServerNodeGraph('act','','');"""


# Whom a Greed is given, looked at twice a second. Without a wall: the monarch, wherever the monarch is. With
# one: the wall, once the Greed stands before it (an object is not noticed the way a creature is: it has to be named,
# and the wall is on the monarch's side so that it is an enemy). The value is far above anything the Greed comes to
# hate by itself: a Greed that a knife had hit went for the thrower behind the wall instead (seen in play), and the
# wall is not solid. The level is in custom aggro mode: a creature goes for whatever has the highest value.
# That is not enough to keep a Greed on its side of the wall: before it is given the wall it notices the monarch who
# watches from behind it, a knife makes it hate the thrower, and a stroke carries it forward; in play a Greed ended at
# the monarch's feet (2026-10-12). So a Greed is also told that a wall stands ('siege'), and its decision graph goes by
# where it is: within WALL_ZONE of a standing wall it keeps to its line and hacks, whatever it is after.
def give_wall(kind):
    return f"""for(const piece of f.getEntitiesWithSpecifiedPrefabOnTheField({P[kind]})){{
    if(f.queryTheAggroValueOfTheSpecifiedEntity(piece,self)>1000n)continue;
    f.setTheAggroValueOfSpecifiedEntity(piece,self,100000n);
    f.printString('KG_AT_WALL');
  }}"""


LOOK = f"""if(f.getEntitiesWithSpecifiedPrefabOnTheField({P['wall_wood']}).length+f.getEntitiesWithSpecifiedPrefabOnTheField({P['wall_stone']}).length<1){{
    for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(player))f.setTheAggroValueOfSpecifiedEntity(hero,self,100000n);
    if({read('self', 'siege')}===1n){{{write('self', 'siege', '0n')}}}
    return;
  }}
  if({read('self', 'siege')}===0n){{{write('self', 'siege', '1n')}}}
  if(f.split3dVector({PLACE('self')}).xComponent>{round(WALL[0] + WALL_ZONE, 2)})return;
  {give_wall('wall_wood')}
  {give_wall('wall_stone')}"""

# The thrower's hand opens: a knife is launched from where the hand is, pointed at the target and told to follow it (the
# projectile motion device of KV_knife is a tracking one). It is on the thrower's side: its hit detection answers to
# enemies only, and the ability unit named there does the damage.
THROW = f"""const here=f.split3dVector({PLACE('self')}),there=f.split3dVector({PLACE('target')});
  const from=f.create3dVector(here.xComponent,here.yComponent+1.3,here.zComponent);
  const way=f.create3dVector(there.xComponent-here.xComponent,there.yComponent-here.yComponent-0.3,there.zComponent-here.zComponent);
  const knife=f.createProjectile({P['knife']},from,f.directionVectorToRotation(way,[0,1,0]),self,target,false,1n,{NO_TAGS});
  f.modifyEntityFaction(knife,f.queryEntityFaction(self));
  {sound('throw')}
  f.printString('KG_THROW');"""


def mend(kind):
    """One blow of the builder: the wall gets health back, the bar follows, and a whole wall says so."""
    return f"""for(const wall of f.getEntitiesWithSpecifiedPrefabOnTheField({P[kind]})){{
    const state=f.getObjectAttribute(wall as any);
    if(state.currentHp>=state.maxHp)continue;
    {burst('mendTick', 'wall')}{sound('mendTick')}
    f.recoverHpDirectly(self,wall,{FIGHT['mend']},true,0,0,[] as string[]);
    const now=f.getObjectAttribute(wall as any).currentHp;
    f.printString('KG_WALL_HP');f.printString({STR('now')});
    {write('player', 'wall', "f.dataTypeConversion(now*100/state.maxHp,'int')")}
    if(now>=state.maxHp)f.sendSignal('KG_mended');
  }}"""


def fallen(kind, counter, word):
    """Somebody of the kingdom fell: one less of its trade, and the stations look at the state again."""
    return f"""if(kind==={KIND[kind]}n){{
    {sound('down')}
    f.printString('KG_DOWN');f.printString('{word}');
    {write('player', counter, read('player', counter) + '-1n')}
    f.sendSignal('KG_state');
    return;
  }}"""


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
    {create('range', RANGE[0], 0, RANGE[1])}{tags(PRICE['thrower'], RANGE)}
    {create('barracks', BARRACKS[0], 0, BARRACKS[1])}{tags(PRICE['soldier'], BARRACKS)}
    {create('site', SITE[0], 0, SITE[1])}{tags(PRICE['wood'], SITE, prefab='tag_site')}
    // The first coins lie on the way to the camp: picking them up is the first thing the game teaches.
    {''.join(create('coin', round(X0 + 3.2 + i * 0.7, 2), 0.8, 0) for i in range(COINS))}
    // The crown is a star that follows the monarch above the head.
    for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(player)){{
      const crown={create('crown', X0 + 2, 2.6, 0)[:-1]};
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
    // The horn: every decision graph reads "dark" and its creature runs to its place for the night.
    {write('stage', 'dark', '1n')}
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
    {write('stage', 'dark', '0n')}
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
.onSignal('KG_mend',(evt,f)=>{{
  // A wall is damaged and there is a builder: the builder's decision graph reads this.
  {write('f.getSelfEntity()', 'mend', '1n')}
  f.printString('KG_MEND');
}})
.onSignal('KG_mended',(evt,f)=>{{
  {write('f.getSelfEntity()', 'mend', '0n')}
  f.printString('KG_MENDED');
}})
.on('whenEntityIsDestroyed',(evt,f)=>{{
  // Somebody ran out of health. The entity is gone: what it was is read from the copy of its variables the event
  // carries. (An entity taken away with removeEntity does not come here.)
  {ONE_PLAYER}
  const player=players[0],stage=f.getSelfEntity();
  const kind=f.queryCustomVariableSnapshot(evt.customVariableComponentSnapshot,'kind').asType('int');
  if(kind==={KIND['greed']}n||kind==={KIND['brute']}n){{{sound('kill')}f.printString('KG_KILL');return;}}
  {fallen('soldier', 'soldiers', 'soldier')}
  {fallen('thrower', 'throwers', 'thrower')}
  {fallen('farmer', 'farmers', 'farmer')}
  {fallen('vagrant', 'citizens', 'citizen')}
  if(kind==={KIND['builder']}n){{
    {sound('down')}
    f.printString('KG_DOWN');f.printString('builder');
    {write('stage', 'mend', '0n')}
    {write('player', 'builders', read('player', 'builders') + '-1n')}
    f.sendSignal('KG_state');
    return;
  }}
  if(kind!=={KIND['wall_wood']}n&&kind!=={KIND['wall_stone']}n)return;
  // The wall is down: the site offers a new one, the builder has nothing to mend, the Greed look for the monarch.
  {write('player', 'wall', '0n')}
  {write('stage', 'mend', '0n')}
  {sound('wallDown')}
  for(const site of f.getEntitiesWithSpecifiedPrefabOnTheField({P['site']})){{{burst('wallDown', 'site')}}}
  f.sendSignal('KG_wall_down');
  f.printString('KG_WALL_DOWN');
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
  {join('vagrant', X0 + 4.2, 2.6, 'citizens', spot('hx', 'hz', X0 + 0.8, 0.7, 2.2, 'citizens'))}
  f.printString('KG_CITIZEN');
  {paid(PRICE['citizen'], 'citizen')}
}})
""" + ASKED + lit([f"{PEOPLE}>={RULES['people']}n", f"coins<{PRICE['citizen']}n"]),
    # A farmer's home is by the keep and its work a plot of the field; a builder works at the inner face of the wall;
    # a thrower's post is behind the wall and a soldier's in front of it.
    'farm': trade('farmer', 'farmer', 'farmers', RULES['farmers'], FARM[0] - 1.4, 2.4, 'KG_FARMER',
                  spot('hx', 'hz', X0 - 3.4, 0.7, 2.2) + spot('wx', 'wz', FARM[0] - 1.8, 1.2, 6.2)),
    'smith': trade('builder', 'builder', 'builders', 1, SMITH[0] + 0.4, 2.8, 'KG_BUILDER',
                   spot('hx', 'hz', X0 - 4.4, 0, 2.2) + spot('wx', 'wz', WALL[0] - 1.9, 0, 1.6)),
    'range': trade('thrower', 'thrower', 'throwers', RULES['throwers'], RANGE[0] + 0.6, 2.6, 'KG_THROWER',
                   spot('wx', 'wz', WALL[0] - 2.6, -1.3, 2.2)),
    'barracks': trade('soldier', 'soldier', 'soldiers', RULES['soldiers'], BARRACKS[0] - 0.4, 2.8, 'KG_SOLDIER',
                      spot('wx', 'wz', WALL[0] + 2.4, 1.2, 1.4)),
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
    f.sendSignal('KG_mended');
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
    'unit': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  // A soldier carries its sword from the first moment: a looping effect that is a model, on the right hand.
  const self=evt.eventSourceEntity;
  if({IS('self', 'soldier')})f.mountLoopingSpecialEffect({SWORD[0]},self,'{SWORD[1]}',true,true,[0,0,0],[0,0,0],{SWORD[2]},false);
}})
.on('whenSkillNodeIsCalled',(evt,f)=>{{
  // The creature's skill has come to the moment that counts (graphAtMs of the skill). Which unit this is, its prefab says.
  const self=f.getSelfEntity();
  {ONE_PLAYER}
  const player=players[0];
  if({IS('self', 'farmer')}){{{burst('dig', 'self')}return;}}
  if({IS('self', 'soldier')})return;
  if({IS('self', 'builder')}){{
    {mend('wall_wood')}
    {mend('wall_stone')}
    return;
  }}
  const target=f.getTheAggroTargetOfTheSpecifiedEntity(self);
  if(!f.queryIfEntityIsOnTheField(target))return;
  {THROW}
}})
.on('whenAttackHits',(evt,f)=>{{
  // The soldier's stroke took health off somebody.
  {ONE_PLAYER}
  const player=players[0];
  {sound('slash')}
  f.printString('KG_SLASH');f.printString({STR('evt.damage')});
}})
""",
    'knife': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  // What is seen flying: the knife (a looping effect that is a model) and its trail. A knife that meets nobody is gone
  // after three seconds.
  f.mountLoopingSpecialEffect({KNIFE},evt.eventSourceEntity,'GI_RootNode',true,true,[0,0,0],[0,0,0],1,false);
  f.mountLoopingSpecialEffect({TRAIL},evt.eventSourceEntity,'GI_RootNode',true,true,[0,0,0],[0,0,0],1,false);
  f.startTimer(evt.eventSourceEntity,'KG_GONE',false,[3]);
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  f.removeEntity(evt.eventSourceEntity);
}})
.on('whenOnHitDetectionIsTriggered',(evt,f)=>{{
  // It touched an enemy's hurt box (its hit detection does not answer to friends): the ability unit named in the hit
  // detection has attacked it. The knife is gone a moment later (removed in this same moment, it did no damage).
  {ONE_PLAYER}
  const player=players[0];
  f.playTimedEffects({KNIFE_HIT},evt.onHitEntity,'GI_RootNode',true,false,[0,1,0],[0,0,0],1,true);
  {sound('hit')}
  f.printString('KG_KNIFE');
  f.startTimer(evt.eventSourceEntity,'KG_DONE',false,[0.3]);
}})
""",
    'wall': SERVER + f"""
.on('whenAttacked',(evt,f)=>{{
  // A blow landed: the bar on the screen follows the wall's health. (When it runs out the wall is destroyed, and the
  // stage's graph hears of that.)
  {ONE_PLAYER}
  const player=players[0],self=evt.eventSourceEntity;
  const state=f.getObjectAttribute(self as any);
  {sound('wallHit')}
  f.printString('KG_WALL_HP');f.printString({STR('state.currentHp')});
  {write('player', 'wall', "f.dataTypeConversion(state.currentHp*100/state.maxHp,'int')")}
}})
.onSignal('KG_dawn',(evt,f)=>{{
  // A damaged wall asks for the builder, who walks over and hammers it whole.
  {ONE_PLAYER}
  const player=players[0];
  if({read('player', 'builders')}<1n)return;
  const state=f.getObjectAttribute(f.getSelfEntity() as any);
  if(state.currentHp>=state.maxHp)return;
  f.sendSignal('KG_mend');
}})
""",
    'greed': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'KG_LOOK',true,[0.5]);
  // Its lane is where it appeared.
  f.setCustomVariable(evt.eventSourceEntity,'lane',f.split3dVector({PLACE('evt.eventSourceEntity')}).zComponent,true);
  {burst('portal', 'evt.eventSourceEntity')}{ARM}
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  const self=evt.eventSourceEntity;
  {ONE_PLAYER}
  const player=players[0];
  if(evt.timerName==='KG_GONE'){{f.removeEntity(self);return;}}
  if(evt.timerName==='KG_LOST'){{
    f.setPlayerSettlementSuccessStatus(player,SettlementStatus.Defeat);
    f.settleStage();
    return;
  }}
  if(evt.timerName==='KG_GRAB'){{
    // The grab ends: the crown is gone unless the monarch ran out of reach, or found a coin to throw meanwhile.
    {write('self', 'grabbing', '0n')}
    const hero=f.getAllCharacterEntitiesOfSpecifiedPlayer(player)[0];
    if({FAR('self', 'hero', 5.5)}){{f.printString('KG_ESCAPED');return;}}
    const coins={read('player', 'coins')};
    if(coins>0n){{
      {sound('stolen')}
      f.printString('KG_STOLEN');
      {write('self', 'sated', '1n')}
      f.startTimer(self,'KG_GONE',false,[{FLEE_SECONDS}]);
      {write('player', 'coins', 'coins-1n')}
      return;
    }}
    f.printString('KG_CROWN_LOST');
    for(const crown of f.getEntitiesWithSpecifiedPrefabOnTheField({P['crown']}))f.switchFollowMotionDeviceTargetByEntity(crown,self,'',[0,2.6,0],[0,0,0],FollowCoordinateSystem.WorldCoordinateSystem,FollowLocationType.FollowLocation);
    {sound('crown')}{music('defeat')}
    f.startTimer(self,'KG_LOST',false,[2]);
    return;
  }}
  if(evt.timerName!=='KG_LOOK')return;
  if({read('self', 'sated')}===1n)return;
  {LOOK}
}})
.on('whenSkillNodeIsCalled',(evt,f)=>{{
  // The blow lands (graphAtMs of the skill). What it does to walls and villagers is the hit box's business; here it is
  // only about the monarch, whom no blow hurts: a Greed takes coins, and from an empty purse the crown.
  const self=f.getSelfEntity();
  {ONE_PLAYER}
  const player=players[0];
  if({read('self', 'sated')}===1n)return;
  const target=f.getTheAggroTargetOfTheSpecifiedEntity(self);
  if(!f.queryIfEntityIsOnTheField(target))return;
  if(f.getEntityListBySpecifiedType([target],EntityType.Character).length<1)return;
  if({FAR('self', 'target', 4.5)})return;
  const coins={read('player', 'coins')},dmg={read('self', 'dmg')};
  if(coins>0n){{
    // It takes what it can carry and runs off with it (its decision graph reads "sated").
    {burst('stolen', 'target')}{sound('stolen')}
    f.printString('KG_STOLEN');
    {write('self', 'sated', '1n')}
    f.startTimer(self,'KG_GONE',false,[{FLEE_SECONDS}]);
    if(coins<dmg){{{write('player', 'coins', '0n')}return;}}
    {write('player', 'coins', 'coins-dmg')}
    return;
  }}
  // An empty purse: it starts to grab the crown, which takes a few seconds. Running away breaks the grab.
  if({read('self', 'grabbing')}===1n)return;
  {write('self', 'grabbing', '1n')}
  {burst('grab', 'target')}{sound('grab')}
  f.startTimer(self,'KG_GRAB',false,[{RULES['grabSeconds']}]);
  f.printString('KG_GRAB');
}})
.on('whenAttackHits',(evt,f)=>{{
  // Its blow took health off the wall or off a villager.
  {ONE_PLAYER}
  const player=players[0];
  {sound('punch')}
  f.printString('KG_PUNCH');f.printString({STR('evt.damage')});
}})
.onSignal('KG_dawn',(evt,f)=>{{
  // Morning: its decision graph makes it run back to the portal; a few seconds later it is gone.
  f.startTimer(f.getSelfEntity(),'KG_GONE',false,[{FLEE_SECONDS}]);
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
    # ---- the moment of each skill that counts (graphAtMs of the skill) ----
    'dig': f"g.creationSkill({ME}).on('start',(evt,f)=>{{\n  f.notifyServerNodeGraph('act','','');\n}})\n",
    'hammer': f"g.creationSkill({ME}).on('start',(evt,f)=>{{\n  // The builder's server graph hears this (whenSkillNodeIsCalled) and mends.\n  f.notifyServerNodeGraph('act','','');\n}})\n",
    'throw': f"g.creationSkill({ME}).on('start',(evt,f)=>{{\n  // The thrower's server graph hears this and lets the knife fly.\n  f.notifyServerNodeGraph('act','','');\n}})\n",
    'slash': f"g.creationSkill({ME}).on('start',(evt,f)=>{{\n  {hitbox(FIGHT['slash'], ('Creation',), 'Slash')}\n  // The arc the blade draws: the effect made for this animation, where the creature stands, turned as it is.\n  f.playTimedEffects({SLASH_ARC},f.getEntityLocation(self),f.getEntityRotation(self),1,true);\n}})\n",
    'punch': f"g.creationSkill({ME}).on('start',(evt,f)=>{{\n  {hitbox(FIGHT['punch'], ('Object', 'Creation'), 'Slash')}\n}})\n",
    'smash': f"g.creationSkill({ME}).on('start',(evt,f)=>{{\n  {hitbox(FIGHT['smash'], ('Object', 'Creation'), 'Slash', 4)}\n}})\n",
    # ---- who does what when ----
    'citizenMind': mind((DARK, 'home'), (None, 'stroll')),
    'farmerMind': mind((DARK, 'home'), (None, 'toil')),
    'builderMind': mind((DARK, 'home'), (MENDING, 'mend'), (None, 'stroll')),
    'throwerMind': mind((HAS_TARGET, 'shoot'), (DARK, 'post'), (None, 'stroll')),
    'soldierMind': mind((HAS_TARGET, 'fight'), (DARK, 'post'), (None, 'stroll')),
    'greedMind': mind((f"!({DARK})", 'retreat'), (SATED, 'retreat'), (AT_WALL, 'siege'), (HAS_TARGET, 'bash'), (None, 'advance')),
    # ---- the behaviours ----
    'home': status(f"f.tacticMoveToTheTargetPosition(true,{OWN('hx', 'hz')},1,TacticSpeed.Run,360,'home',false);", STILL),
    # Walking: 野伏 sent running to a point runs past it and back.
    'post': status(f"f.tacticMoveToTheTargetPosition(true,{OWN('wx', 'wz')},1,TacticSpeed.Walk,360,'post',false);", STILL),
    'stroll': status("f.tacticGroundIdleRoaming(true,TacticSpeed.Walk,3.5,1,4,1,3,'stroll',false);", STILL),
    'toil': status(f"f.tacticMoveToTheTargetPosition(true,{OWN('wx', 'wz')},1,TacticSpeed.Walk,360,'field',false);", 'f.executeSkill(true,1n);', STILL),
    'mend': status(f"f.tacticMoveToTheTargetPosition(true,{OWN('wx', 'wz')},1.2,TacticSpeed.Run,360,'wall',false);", 'f.executeSkill(true,1n);', STILL),
    'shoot': status('f.executeSkill(true,1n);', FACE),
    # Run at the target from up to 30 m and stop 3.4 m from it: the stroke (近战攻击_02) is a leap of about three metres
    # that lands the blade. Between strokes keep facing the target.
    'fight': status("f.tacticGroundPursuit(true,3.8,30,3.4,TacticSpeed.Run,4,TacticSpeed.Run,6,0,'chase',false);", 'f.executeSkill(true,1n);', FACE),
    'advance': status(f"f.tacticMoveToTheTargetPosition(true,{LINE},1.5,TacticSpeed.Walk,360,'march',false);", STILL),
    # Up to the target, as near as its own variable says: a Greed strikes from 2.4 m, a brute from 3.6 (its blade is
    # longer and its body wider: from 2.4 m its stroke ended inside the soldier it fought, seen in play).
    'bash': status(f"f.tacticMoveToTheTargetEntity(true,f.getTargetEntity(),{NEAR},TacticSpeed.Run,360,'close',false);", 'f.executeSkill(true,1n);', FACE),
    # At the wall: up to its line (it comes from farther out: the hop back took it there), then the blow that belongs here.
    'siege': status(f"f.tacticMoveToTheTargetPosition(true,{LINE},0.6,TacticSpeed.Walk,360,'line',false);", f"f.executeSkill(true,{HACK});", FACE),
    'retreat': status(f"f.tacticMoveToTheTargetPosition(true,[{PORTAL[0]},0,{PORTAL[1]}],1.5,TacticSpeed.Run,360,'flee',false);", STILL),
}
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write((SERVER_HEAD if which in SERVER_GRAPHS else SKILL_HEAD if which in SKILL_GRAPHS else CLIENT_HEAD) + BODY[which])
print('written', sys.argv[2], which)
