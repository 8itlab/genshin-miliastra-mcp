"""Hop: a platform course, the second kind of game built with these tools (the first is examples/kingdom4).

Side on, walking along x. Climbing is switched off in the class (scene_set_class): with it on, a character pushed
against a wall two and a half metres high climbs over it. The course, left to right:
  x 0        start, on the ground
  x 6..12    a ledge 0.6 m high, which a character walks up (one metre needs a jump)
  x 12..18   a wooden platform at the height of the ledge, a barrier (HP_stop) at its front edge; F on the platform
             lifts the barrier and starts the motion, ten metres to the right (a platform that left as soon as it was
             stepped on worked too, but left a character that had only just reached its back edge behind)
  x 28..58   the far bank, as high as the ledge: a lever at 31 raises the stone gate at 36; lava from 40 to 43 sends whoever
             touches it back to 38; the E skill blinks seven metres ahead, over the lava; the chest at 48.5 ends the level
Four coins on the way; a clock counts down from the moment the level loads.

Graphs (the last argument picks one), each on the thing it is about:
  stage   (关卡实体)             puts everything down, hands out the blink, reports where the character is, loses on time
  coin    (HP_coin)             wide trigger: fly to the character; narrow trigger: one more on the score
  ferry   (HP_ferry)            option: lifts the barrier and starts its own motion, once
  lever   (HP_lever)            option: its own preset status (the handle goes down) and the gate's motion (it rises).
                                A wooden door opened by its preset status did not clear the way in play, so the gate moves
  chest   (HP_chest)            option: its preset status (the lid opens), a second and a half later the level is won
  burn    (HP_burn, no model)   the lava's trigger: back to the door
  hero    (character template)  hears the blink skill: seven metres further along x
  player  (player template)     prints the score when it changes
  blink   (client skill graph)  tells the server the key was pressed

Usage: python gen_hop.py <guids.json> <out.ts> <ignored x3> <graph>
Prints: HP_READY, HP_GO, HP_AT x y (every two seconds), HP_COIN, HP_SCORE n, HP_FERRY, HP_LEVER, HP_BURN, HP_BLINK,
HP_CHEST, HP_VICTORY, HP_TIME_UP."""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
P = {n: guids['prefab:HP_' + n] for n in ('coin', 'ferry', 'stop', 'lever', 'gate', 'chest', 'burn')}
STATUS = {n: guids['presetStatus:HP_' + n] for n in ('lever', 'chest')}
BLINK = guids['skill:HP_blink']
TOP = 0.6                     # the height of the ledge and of the far bank: low enough to walk up
NO_TAGS = '[] as bigint[]'
HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ CharacterSkillSlot, FollowCoordinateSystem, FollowLocationType, SettlementStatus, TopOfStackSkillDestructionType }} from 'genshin-ts/definitions/enum'

// Hop, graph "{which}": see examples/hop/gen_hop.py.
"""
SERVER = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})"
STR = lambda v: f"f.dataTypeConversion({v},'str')"


def create(prefab, x, y, z, turn='[0,0,0]'):
    return f"f.createPrefab({P[prefab]},[{x},{y},{z}],{turn},stage,false,1,{NO_TAGS});"


COINS = ''.join(create('coin', x, y, 0) for x, y in ((3, 0.8), (9, TOP + 0.8), (30, TOP + 0.8), (46, TOP + 0.8)))
ONE_PLAYER = """const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;"""

BODY = {
    'stage': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'HP_SETUP',false,[2]);
  f.startTimer(evt.eventSourceEntity,'HP_WHERE',true,[2]);
  f.printString('HP_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  {ONE_PLAYER}
  const stage=evt.eventSourceEntity;
  const heroes=f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0]);
  if(evt.timerName==='HP_WHERE'){{
    for(const hero of heroes){{
      const at=f.split3dVector(f.getEntityLocationAndRotation(hero).location);
      f.printString('HP_AT');f.printString({STR('at.xComponent')});f.printString({STR('at.yComponent')});
    }}
    return;
  }}
  if(evt.timerName!=='HP_SETUP')return;
  {COINS}
  {create('ferry', 15, round(TOP - 0.41, 2), 0)}
  {create('stop', 18.15, TOP, 0)}
  {create('lever', 31, TOP, 2)}
  {create('gate', 36, TOP, 0)}
  {create('burn', 41.5, TOP + 1, 0)}
  {create('chest', 48.5, TOP, 1.5)}
  // The blink goes on the E key of every character.
  for(const hero of heroes)f.addCharacterSkill(hero as any,{BLINK},CharacterSkillSlot.Skill1E,TopOfStackSkillDestructionType.Destroy);
  f.printString('HP_GO');
}})
.on('whenGlobalTimerIsTriggered',(evt,f)=>{{
  // The clock ran out before the chest was opened.
  {ONE_PLAYER}
  f.printString('HP_TIME_UP');
  f.setPlayerSettlementSuccessStatus(players[0],SettlementStatus.Defeat);
  f.settleStage();
}})
""",
    'coin': SERVER + f"""
.on('whenEnteringCollisionTrigger',(evt,f)=>{{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.enteringEntity as any);
  if(evt.triggerId===1n){{
    f.switchFollowMotionDeviceTargetByGuid(evt.triggerEntity,f.queryGuidByEntity(player),'',[0,1,0],[0,0,0],FollowCoordinateSystem.WorldCoordinateSystem,FollowLocationType.FollowLocation);
    f.activateDisableFollowMotionDevice(evt.triggerEntity,true);
    return;
  }}
  f.setCustomVariable(player,'score',f.getCustomVariable(player,'score').asType('int')+1n,true);
  f.printString('HP_COIN');
  f.destroyEntity(evt.triggerEntity);
}})
""",
    'ferry': SERVER + f"""
.on('whenTabIsSelected',(evt,f)=>{{
  // It leaves once. The barrier at its front, which stops a walking character at the edge, lifts out of the way.
  if(f.getCustomVariable(evt.eventSourceEntity,'gone').asType('bool'))return;
  f.setCustomVariable(evt.eventSourceEntity,'gone',true,true);
  for(const stop of f.getEntitiesWithSpecifiedPrefabOnTheField({P['stop']}))f.activateBasicMotionDevice(stop,'lift');
  f.activateBasicMotionDevice(evt.eventSourceEntity,'go');
  f.printString('HP_FERRY');
}})
""",
    'lever': SERVER + f"""
.on('whenTabIsSelected',(evt,f)=>{{
  f.setPresetStatus(evt.eventSourceEntity,{STATUS['lever']}n,1n);
  for(const gate of f.getEntitiesWithSpecifiedPrefabOnTheField({P['gate']}))f.activateBasicMotionDevice(gate,'open');
  f.printString('HP_LEVER');
}})
""",
    'chest': SERVER + f"""
.on('whenTabIsSelected',(evt,f)=>{{
  f.setPresetStatus(evt.eventSourceEntity,{STATUS['chest']}n,1n);
  f.startTimer(evt.eventSourceEntity,'HP_WIN',false,[1.5]);
  f.printString('HP_CHEST');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  {ONE_PLAYER}
  f.printString('HP_VICTORY');
  f.setPlayerSettlementSuccessStatus(players[0],SettlementStatus.Victory);
  f.settleStage();
}})
""",
    'burn': SERVER + f"""
.on('whenEnteringCollisionTrigger',(evt,f)=>{{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.enteringEntity as any);
  f.teleportPlayer(player,[38,{TOP + 0.4},0],[0,0,0]);
  f.printString('HP_BURN');
}})
""",
    'hero': SERVER + f"""
.on('whenSkillNodeIsCalled',(evt,f)=>{{
  if(evt.parameter1!=='HP_blink')return;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.callerEntity as any);
  const at=f.split3dVector(f.getEntityLocationAndRotation(evt.callerEntity).location);
  f.teleportPlayer(player,f.create3dVector(at.xComponent+7,at.yComponent+0.2,at.zComponent),[0,0,0]);
  f.printString('HP_BLINK');
}})
""",
    'player': SERVER + f"""
.on('whenCustomVariableChanges',(evt,f)=>{{
  if(evt.variableName!=='score')return;
  f.printString('HP_SCORE');
  f.printString({STR("evt.postChangeValue.asType('int')")});
}})
""",
    'blink': f"""g.characterSkill({{id:{guids['graph:id']},name:'{guids['graph:name']}',prefix:false}})
.on('start',(evt,f)=>{{
  f.notifyServerNodeGraph('HP_blink','','');
}})
""",
}
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(HEAD + BODY[which])
print('written', sys.argv[2], which)
