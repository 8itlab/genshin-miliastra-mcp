"""Skirmish: complex creatures (复杂造物) that work by day, take their posts at night and fight what comes, tried in the game.

What examples/brain showed for one unit at a time (walk where a variable says, use a skill), put together the way a
game needs it: a farmer, a knife thrower and a soldier on the player's side, a wall, and foes that come out of the dark.
Nobody is moved by a server graph: each creature's decision graph looks at three things, whether it is night (a
variable of the stage entity), whether it has a target (an enemy it noticed by itself: scene_set_creature_logic
{logic:{noticeRadius}}) and its own variables, and picks one of a few status graphs.

The fighting is the platform's own, and every attack is the one the creature's animation was made for. The models of
complex creatures come with empty hands (looked at one by one in play, scripts/dev/fitting): what a creature holds is a
looping effect that is a model (effect_catalog), either mounted for good by a server graph (the soldier's sword) or shown
by the skill itself for as long as the animation needs it (the farmer's pickaxe, the knife in the thrower's hand until
it leaves it: scene_add_creature_skill {effect}). The hand follows in the animations made for that weapon: 野伏 swings a
blade, 盗宝团·斥候 throws a knife and digs with a pickaxe, 打手丘丘人 hits with bare hands (no bow, crossbow, gun, shield
or club exists as a model). A stroke is a hit box that the skill's graph triggers at the moment the animation strikes:
it takes health off every enemy with a hurt box in front of the creature (creatures have one; the wall is given one).
The thrown knife is a projectile: a prefab with a projectile motion device that follows its target and hit detection
that only enemies set off, launched by the thrower's server graph at the moment the hand opens; what it touches is
attacked by its ability unit. Health, the bars over the heads, the numbers that pop up and the falling down are the
platform's.

  day     the farmer walks to its plot and digs; thrower and soldier stroll
  night   the farmer runs home; the thrower stands behind the wall, the soldier in front of it
  foes    walk at the wall; whoever of them notices the soldier fights it; one that reaches the wall hammers at it
  dawn    the foes that are left run back to where they came from

Graphs (the last argument picks one):
  stage     (关卡实体, server)   makes the wall and the three units, puts the sword in the soldier's hand, calls night and
                               day, lets the foes out, prints who falls (whenEntityIsDestroyed)
  unit      (SK_farmer, SK_thrower, SK_soldier; server)  hears its creature's skill: the thrower's lets a knife fly;
                               prints what its strokes hit
  foe       (SK_foe, server)    is given the wall as its target when it stands before it; prints what its blows hit
  wall      (SK_wall, server)   prints its health when it is hit
  knife     (SK_knife, server)  shows the knife and its trail, prints what it hits and is gone
  dig, throw, slash, punch (creatureSkill)  the moment of each skill that counts: the two strokes trigger a hit box
  farmerMind, throwerMind, soldierMind, foeMind (creatureDecision)
  home, post, stroll, work, shoot, fight, advance, bash, retreat (creatureStatus)

Usage: python gen_skirmish.py <guids.json> <out.ts> <ignored x3> <graph>
Prints: SK_READY, SK_GO, SK_HP soldier|foe|wall n (full health), SK_NIGHT, SK_FOES n, SK_DAY, SK_AT (x of farmer,
thrower, soldier, every two seconds), SK_DIG, SK_THROW, SK_KNIFE_HIT, SK_SLASH, SK_PUNCH, SK_HIT soldier|foe n (a stroke
took n health off somebody), SK_HURT n (a foe's health after it was hit), SK_WALL n (health left), SK_DOWN
farmer|thrower|soldier|foe|wall, SK_AT_WALL (a foe was given the wall), SK_TARGET thrower|soldier|farmer [on],
SK_FOE_TARGET [wall|soldier|thrower|farmer], SK_LEFT n."""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
G = lambda key: guids['graph:' + key]
P = {n: guids['prefab:SK_' + n] for n in ('farmer', 'thrower', 'soldier', 'foe', 'wall', 'knife')}
STAND = 0.4                       # the height at which creatures are put down
WALL_X, GATE_X = 12, 27           # the wall; where the foes come from (the ground of the practice save ends near x=32)
HOME, PLOT = (3, 3.5), (7, 4)     # the farmer's house and field
THROWER_POST, SOLDIER_POST = (9.5, 1.5), (15, 1)
SWORD, FIST = 40, 25              # the health one stroke of the soldier and one blow of a foe take (the knife's 40 is its ability unit's)
KIND = {'farmer': 1, 'thrower': 2, 'soldier': 3, 'foe': 4, 'wall': 5}
# What is mounted for good: a looping effect that is a model, the hand it goes in and its scale. (The pickaxe and the
# knife are shown by their skills.)
TOOL = {'soldier': (10002152, 'GI_WeaponR', 1.4)}   # 单手剑01, a little larger than it comes: the soldier is a big man
KNIFE, TRAIL, SLASH_ARC, KNIFE_HIT = 10006069, 10006071, 10016139, 10006059   # 盗宝团_飞刀_刀, 盗宝团_飞刀_尾迹, 野伏众_近战攻击02_刀光, 弩箭_命中_敌人
NIGHT_AT, DAY_AT, END_AT = 14, 78, 92
FOES_AT = [(22, 2), (44, 3)]      # seconds, how many
SERVER_HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'

// Skirmish, graph "{which}": see examples/skirmish/gen_skirmish.py.
"""
CLIENT_HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ TacticSpeed, TargetEntity }} from 'genshin-ts/definitions/client_enums'

// Skirmish, graph "{which}": see examples/skirmish/gen_skirmish.py.
"""
SKILL_HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ AttackType, ElementalType, EntityType, HitType, TargetType, TriggerRestriction }} from 'genshin-ts/definitions/enum'
import {{ AttackLayerConfig, HitLevel, KnockbackDirectionType, SectorDetectionDirection }} from 'genshin-ts/definitions/client_enums'

// Skirmish, graph "{which}": see examples/skirmish/gen_skirmish.py.
"""
SERVER = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})"
ME = f"{{id:{guids['graph:id']},name:'{guids['graph:name']}',prefix:false}}"
STR = lambda v: f"f.dataTypeConversion({v},'str')"
NO_TAGS = '[] as bigint[]'
ONE_PLAYER = """const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;"""
X = lambda e: f"f.printString({STR(f'f.split3dVector(f.getEntityLocationAndRotation({e}).location).xComponent')});"
IS = lambda entity, prefab: f"f.getEntityListBySpecifiedPrefabId([{entity}],{P[prefab]}).length===1"
read = lambda entity, name, kind='int': f"f.getCustomVariable({entity},'{name}').asType('{kind}')"
write = lambda entity, name, value: f"f.setCustomVariable({entity},'{name}',{value},true);"


def unit(name, kind, at, work):
    """A unit of the player's side at its place, told where its work (or its post) is."""
    made = (f"const {name}=f.createPrefab({P[kind]},[{at[0]},{STAND},{at[1]}],[0,90,0],stage,false,1,{NO_TAGS});"
            f"f.modifyEntityFaction({name},side);{write(name, 'wx', work[0])}{write(name, 'wz', work[1])}")
    if kind in TOOL:
        made += f"f.mountLoopingSpecialEffect({TOOL[kind][0]},{name},'{TOOL[kind][1]}',true,true,[0,0,0],[0,0,0],{TOOL[kind][2]},false);"
    return made


def foes(count):
    return ''.join(f"f.createPrefab({P['foe']},[{GATE_X + 1.2 * i},{STAND},{(i % 3 - 1) * 1.2}],[0,-90,0],stage,false,1,{NO_TAGS});" for i in range(count))


# ---- what the three kinds of creature graph read: itself, its target, the stage entity ----
NIGHT = "f.getCustomVariable(TargetEntity.StageEntity,'night').asType('int')===1n"
HAS_TARGET = 'f.queryIfEntityIsOnTheField(TargetEntity.AggroTarget)'
OWN = lambda a, b: f"f.create3dVector(f.getCustomVariable(TargetEntity.Self,'{a}').asType('float'),0,f.getCustomVariable(TargetEntity.Self,'{b}').asType('float'))"


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


STILL = "f.tacticStandStill(true,'still',false);"
FACE = "f.tacticRotateToTheTargetEntity(true,f.getTargetEntity(),360,false,'face',false);"
NAMED = lambda entity, kinds: ''.join(f"if({IS(entity, k)})f.printString('{k}');" for k in kinds)


def hitbox(damage, kinds, hit_type):
    """A skill's stroke: a sector in front of the creature, 2 m high, 120 degrees wide and 3 m long, that takes damage
    off every enemy of the kinds named that has a hurt box, once each. (The values of the official attack, examples/
    strike, with the damage given outright: 0 x the creature's attack + damage.)"""
    return f"""const self=f.getSelfEntity();
  f.triggerSectorHitboxAtSpecificLocation(TargetType.HostileFaction,f.getEntityLocation(self),f.getEntityRotation(self),0,{damage},[{','.join('EntityType.' + k for k in kinds)}],
    TriggerRestriction.TriggerOnlyOncePerEntity,10006012,2,120,3,0,SectorDetectionDirection.FromInsideOut,AttackLayerConfig.OnlyOnHitHurtbox,[] as string[],
    ElementalType.None,0,HitType.{hit_type},AttackType.MeleeAttack,0,true,10006012,KnockbackDirectionType.LineConnectingAttackerAndHitPoint,false,
    [0,0,0],[0,0,0],1,[0,0,0],[0,0,0],1.5,1,1,HitLevel.LightHit,1000,1000);
  f.notifyServerNodeGraph('act','','');"""


BODY = {
    'stage': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'SK_PLAN',false,[3,{NIGHT_AT},{','.join(str(t) for t, _ in FOES_AT)},{DAY_AT},{END_AT}]);
  f.printString('SK_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  {ONE_PLAYER}
  const stage=evt.eventSourceEntity,side=f.queryEntityFaction(players[0]);
  if(evt.timerName==='SK_TICK'){{
    f.printString('SK_AT');
    for(const one of f.getEntitiesWithSpecifiedPrefabOnTheField({P['farmer']})){{{X('one')}}}
    for(const one of f.getEntitiesWithSpecifiedPrefabOnTheField({P['thrower']})){{{X('one')}}}
    for(const one of f.getEntitiesWithSpecifiedPrefabOnTheField({P['soldier']})){{{X('one')}}}
    return;
  }}
  if(evt.timerName!=='SK_PLAN')return;
  if(evt.timerSequenceId===0n){{
    // The wall stands on the player's side, or the foes would have no reason to go for it.
    const wall=f.createPrefab({P['wall']},[{WALL_X},0,0.3],[0,90,0],stage,false,1,{NO_TAGS});
    f.modifyEntityFaction(wall,side);
    // The soldier gets its sword: a looping effect that is a model, mounted on its weapon attachment point.
    {unit('farmer', 'farmer', HOME, PLOT)}
    {unit('thrower', 'thrower', (6, 1), THROWER_POST)}
    {unit('soldier', 'soldier', (8, 2), SOLDIER_POST)}
    f.printString('SK_HP');f.printString('soldier');f.printString({STR('f.getCreationAttribute(soldier as any).maxHp')});
    f.printString('SK_HP');f.printString('wall');f.printString({STR('f.getObjectAttribute(wall as any).maxHp')});
    f.startTimer(stage,'SK_TICK',true,[2]);
    f.printString('SK_GO');
    return;
  }}
  if(evt.timerSequenceId===1n){{
    // Night is one variable of the stage entity: every creature's decision graph reads it.
    {write('stage', 'night', '1n')}
    f.printString('SK_NIGHT');
    return;
  }}
  {''.join(f"if(evt.timerSequenceId==={i + 2}n){{{foes(n)}f.printString('SK_FOES');f.printString('{n}');return;}}" for i, (_, n) in enumerate(FOES_AT))}
  if(evt.timerSequenceId==={len(FOES_AT) + 2}n){{
    {write('stage', 'night', '0n')}
    f.printString('SK_DAY');
    return;
  }}
  f.printString('SK_LEFT');f.printString({STR(f"f.getEntitiesWithSpecifiedPrefabOnTheField({P['foe']}).length")});
}})
.on('whenEntityIsDestroyed',(evt,f)=>{{
  // Whoever ran out of health. The entity is gone: what it was is read from the copy of its variables the event carries.
  const kind=f.queryCustomVariableSnapshot(evt.customVariableComponentSnapshot,'kind').asType('int');
  f.printString('SK_DOWN');
  {''.join(f"if(kind==={n}n)f.printString('{k}');" for k, n in KIND.items())}
}})
""",
    'unit': SERVER + f"""
.on('whenSkillNodeIsCalled',(evt,f)=>{{
  // The skill's graph called at the moment of the animation that counts. Which unit this is, its prefab says.
  const self=f.getSelfEntity();
  if({IS('self', 'farmer')}){{f.printString('SK_DIG');return;}}
  if({IS('self', 'soldier')}){{f.printString('SK_SLASH');return;}}
  // The thrower's hand opens: a knife is launched from where the hand is, pointed at the target, and told to follow
  // it (the projectile motion device of SK_knife is a tracking one). It is on the thrower's side: its hit detection
  // answers to enemies only.
  const target=f.getTheAggroTargetOfTheSpecifiedEntity(self);
  if(!f.queryIfEntityIsOnTheField(target))return;
  const here=f.split3dVector(f.getEntityLocationAndRotation(self).location),there=f.split3dVector(f.getEntityLocationAndRotation(target).location);
  const from=f.create3dVector(here.xComponent,here.yComponent+1.3,here.zComponent);
  const way=f.create3dVector(there.xComponent-here.xComponent,there.yComponent-here.yComponent-0.3,there.zComponent-here.zComponent);
  const knife=f.createProjectile({P['knife']},from,f.directionVectorToRotation(way,[0,1,0]),self,target,false,1n,{NO_TAGS});
  f.modifyEntityFaction(knife,f.queryEntityFaction(self));
  f.printString('SK_THROW');
}})
.on('whenAttackHits',(evt,f)=>{{
  // A stroke of this unit took health off somebody.
  f.printString('SK_HIT');f.printString('soldier');f.printString({STR('evt.damage')});
}})
.on('whenAggroTargetChanges',(evt,f)=>{{
  // A unit noticed an enemy, or lost it (only raised in custom aggro mode).
  const self=evt.eventSourceEntity;
  f.printString('SK_TARGET');
  {NAMED('self', ('thrower', 'soldier', 'farmer'))}
  if(f.queryIfEntityIsOnTheField(evt.postChangeAggroTarget))f.printString('on');
}})
""",
    'foe': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'SK_LOOK',true,[1.5]);
  f.printString('SK_HP');f.printString('foe');f.printString({STR('f.getCreationAttribute(evt.eventSourceEntity as any).maxHp')});
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  // A foe that has come up to the wall is given the wall, far above anything else it may hate: an object is not
  // noticed the way a creature is, it has to be named, and the foe is to stay at the wall whoever shoots at it from
  // behind. (The level is in custom aggro mode: the foe goes for whatever has the highest value.)
  const self=evt.eventSourceEntity;
  if(f.split3dVector(f.getEntityLocationAndRotation(self).location).xComponent>{WALL_X + 4.5})return;
  for(const wall of f.getEntitiesWithSpecifiedPrefabOnTheField({P['wall']})){{
    if(f.queryTheAggroValueOfTheSpecifiedEntity(wall,self)>1000n)continue;
    f.setTheAggroValueOfSpecifiedEntity(wall,self,100000n);
    f.printString('SK_AT_WALL');
  }}
}})
.on('whenSkillNodeIsCalled',(evt,f)=>{{
  f.printString('SK_PUNCH');
}})
.on('whenAttackHits',(evt,f)=>{{
  f.printString('SK_HIT');f.printString('foe');f.printString({STR('evt.damage')});
}})
.on('whenAttacked',(evt,f)=>{{
  // Something of the player's side reached this foe: a stroke of the soldier's or a knife.
  f.printString('SK_HURT');f.printString({STR('f.getCreationAttribute(evt.eventSourceEntity as any).currentHp')});
}})
.on('whenAggroTargetChanges',(evt,f)=>{{
  f.printString('SK_FOE_TARGET');
  const now=evt.postChangeAggroTarget;
  if(!f.queryIfEntityIsOnTheField(now))return;
  {NAMED('now', ('wall', 'soldier', 'thrower', 'farmer'))}
}})
""",
    'wall': SERVER + f"""
.on('whenAttacked',(evt,f)=>{{
  f.printString('SK_WALL');f.printString({STR('f.getObjectAttribute(evt.eventSourceEntity as any).currentHp')});
}})
""",
    'knife': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  // What is seen flying: the knife (a looping effect that is a model) and its trail. A knife that meets nobody is gone
  // after three seconds.
  f.mountLoopingSpecialEffect({KNIFE},evt.eventSourceEntity,'GI_RootNode',true,true,[0,0,0],[0,0,0],1,false);
  f.mountLoopingSpecialEffect({TRAIL},evt.eventSourceEntity,'GI_RootNode',true,true,[0,0,0],[0,0,0],1,false);
  f.startTimer(evt.eventSourceEntity,'SK_GONE',false,[3]);
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  f.removeEntity(evt.eventSourceEntity);
}})
.on('whenOnHitDetectionIsTriggered',(evt,f)=>{{
  // It touched an enemy's hurt box (its hit detection does not answer to friends): the ability unit named in the hit
  // detection has attacked it. The knife is gone a moment later (removed in this same moment, it did no damage:
  // examples/shoot).
  f.playTimedEffects({KNIFE_HIT},evt.onHitEntity,'GI_RootNode',true,false,[0,1,0],[0,0,0],1,true);
  f.printString('SK_KNIFE_HIT');
  f.startTimer(evt.eventSourceEntity,'SK_DONE',false,[0.3]);
}})
""",
    # ---- the moment of each skill that counts (graphAtMs of the skill) ----
    'dig': f"g.creationSkill({ME}).on('start',(evt,f)=>{{\n  f.notifyServerNodeGraph('act','','');\n}})\n",
    'throw': f"g.creationSkill({ME}).on('start',(evt,f)=>{{\n  // The creature's own server graph hears this (whenSkillNodeIsCalled) and lets the knife fly.\n  f.notifyServerNodeGraph('act','','');\n}})\n",
    'slash': f"g.creationSkill({ME}).on('start',(evt,f)=>{{\n  {hitbox(SWORD, ('Creation',), 'Slash')}\n  // The arc the blade draws: the effect made for this animation, where the creature stands, turned as it is.\n  f.playTimedEffects({SLASH_ARC},f.getEntityLocation(self),f.getEntityRotation(self),1,true);\n}})\n",
    'punch': f"g.creationSkill({ME}).on('start',(evt,f)=>{{\n  {hitbox(FIST, ('Object', 'Creation'), 'Smash')}\n}})\n",
    # ---- who does what when ----
    'farmerMind': mind((NIGHT, 'home'), (None, 'work')),
    'throwerMind': mind((HAS_TARGET, 'shoot'), (NIGHT, 'post'), (None, 'stroll')),
    'soldierMind': mind((HAS_TARGET, 'fight'), (NIGHT, 'post'), (None, 'stroll')),
    'foeMind': mind((f"!({NIGHT})", 'retreat'), (HAS_TARGET, 'bash'), (None, 'advance')),
    # ---- the behaviours ----
    'home': status(f"f.tacticMoveToTheTargetPosition(true,[{HOME[0]},0,{HOME[1]}],1,TacticSpeed.Run,360,'home',false);", STILL),
    'post': status(f"f.tacticMoveToTheTargetPosition(true,{OWN('wx', 'wz')},1,TacticSpeed.Walk,360,'post',false);", STILL),
    'stroll': status("f.tacticGroundIdleRoaming(true,TacticSpeed.Walk,4,1,3,1,3,'stroll',false);", STILL),
    'work': status(f"f.tacticMoveToTheTargetPosition(true,{OWN('wx', 'wz')},1,TacticSpeed.Walk,360,'field',false);", 'f.executeSkill(true,1n);', STILL),
    'shoot': status('f.executeSkill(true,1n);', FACE),
    # Run at the target from up to 30 m and stop 3.4 m from it: the stroke (近战攻击_02) is a leap of about three metres
    # that lands the blade. Between strokes keep facing the target.
    'fight': status("f.tacticGroundPursuit(true,3.8,30,3.4,TacticSpeed.Run,4,TacticSpeed.Run,6,0,'chase',false);", 'f.executeSkill(true,1n);', FACE),
    'advance': status(f"f.tacticMoveToTheTargetPosition(true,[{WALL_X + 2.5},0,0.3],1.5,TacticSpeed.Walk,360,'march',false);", STILL),
    'bash': status("f.tacticMoveToTheTargetEntity(true,f.getTargetEntity(),2.2,TacticSpeed.Run,360,'close',false);", 'f.executeSkill(true,1n);', FACE),
    'retreat': status(f"f.tacticMoveToTheTargetPosition(true,[{GATE_X},0,0],1.5,TacticSpeed.Run,360,'flee',false);", STILL),
}
SERVER_GRAPHS, SKILL_GRAPHS = ('stage', 'unit', 'foe', 'wall', 'knife'), ('dig', 'throw', 'slash', 'punch')
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write((SERVER_HEAD if which in SERVER_GRAPHS else SKILL_HEAD if which in SKILL_GRAPHS else CLIENT_HEAD) + BODY[which])
print('written', sys.argv[2], which)
