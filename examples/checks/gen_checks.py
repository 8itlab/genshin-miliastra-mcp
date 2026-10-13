"""Checks: one small level that tries, in the game, the tools written offline against the official samples.

Five graphs, each on the thing it is about:
  stage   (关卡实体)       sets the scene, switches to the night sky at 12 s and back at 22 s
  coin    (prefab CK_coin, two triggers, follow device)  wide trigger: fly to the player; narrow one: give the key, vanish
  post    (prefab CK_post, trigger, minimap marker)      outline on while a character is near, off when it leaves;
                                                        hears the signal CK_dusk the stage sends at nightfall
  stall   (prefab CK_stall, option tab)                  option 1 开门 starts the gate's motion; option 2 says it is locked
  hero    (character template)                           hears its money change: CK_MONEY and the new amount
  haskey  (boolean filter, client graph)                 true once the player's variable hasKey is true: shows option 1

Usage: python gen_checks.py <guids.json> <out.ts> <ignored x3> <stage | coin | post | stall | hero | ping | haskey>
Prints: CK_READY, CK_AT (and the player's x), CK_PURSE 7, CK_MONEY 12, CK_GO, CK_SKILL CK_ping (after E at second 8.5), CK_PULL, CK_COIN, CK_GLOW_ON, CK_STING, CK_GLOW_OFF, CK_OPEN, CK_LOCKED, CK_NIGHT, CK_HEARD night, CK_CHEST 1, CK_LIFT (and its height, near 3), CK_HEARD, CK_DAY, CK_TIME_UP."""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
COIN, POST, STALL, GATE = (guids['prefab:' + n] for n in ('CK_coin', 'CK_post', 'CK_stall', 'CK_gate'))
GLOW, NIGHT, DAY = guids['status:CK_glow'], guids['environment:CK_night'], guids['environment:default']
GLOW2, ENV21, ENV3 = guids['status:CK_glow2'], guids['environment:CK_env21'], guids['environment:CK_env3']
STR = lambda v: f"f.dataTypeConversion({v},'str')"
HEIGHT = lambda e: STR(f"f.split3dVector(f.getEntityLocationAndRotation({e}).location).yComponent")
GATE_AT = guids['point:CK_gate_at']
GOLD = guids['currency:CK_gold']
CHEST, CHEST_STATUS = guids['prefab:CK_chest'], guids['presetStatus:CK_chest']
LIFT = guids['prefab:CK_lift']
PING = guids['skill:CK_ping']
NO_TAGS = '[] as bigint[]'
HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ CharacterSkillSlot, FollowCoordinateSystem, FollowLocationType, TopOfStackSkillDestructionType, UnitStatusRemovalStrategy }} from 'genshin-ts/definitions/enum'

// Checks, graph "{which}": see examples/checks/gen_checks.py.
"""
# The signal CK_dusk carries one string, phase: the sender passes it, the listeners read evt.params.phase.
DUSK = "import { defineSignal } from 'genshin-ts/runtime/core'\nconst dusk=defineSignal('CK_dusk',[['phase','str']] as const)\n"
SERVER = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})"

BODY = {
    'stage': DUSK + SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'CK_CLOCK',false,[2,12,22]);
  // The class has jumping switched off and space is pressed about fifteen seconds in: the character's height is printed
  // every fifth of a second around that moment. It should stay where it is; a jump would show as a rise of a metre or so.
  f.startTimer(evt.eventSourceEntity,'CK_JUMP',false,[{','.join(f'{14.6 + 0.2 * i:.1f}' for i in range(11))}]);
  f.printString('CK_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  // Every trigger is printed with the timer's name and the place in its sequence, before anything can return.
  if(evt.timerName!=='CK_JUMP'){{f.printString('CK_T');f.printString(evt.timerName);f.printString({STR('evt.timerSequenceId')});}}
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1){{f.printString('CK_NO_PLAYER');return;}}
  const stage=evt.eventSourceEntity;
  // Three more skies after the first night, four seconds each, to compare how they look: a clear evening, a late night
  // without stars, the map's own sky again, and last the map's own sky with the clock set to 22:00 and stopped.
  if(evt.timerName==='CK_JUMP'){{
    for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0])){{f.printString('CK_Y');f.printString({HEIGHT('hero')});}}
    return;
  }}
  if(evt.timerName==='CK_E1'){{f.modifyEnvironmentSettings({ENV21}n,players,false,0n);f.printString('CK_ENV21');f.startTimer(stage,'CK_E2',false,[4]);return;}}
  if(evt.timerName==='CK_E2'){{f.modifyEnvironmentSettings({ENV3}n,players,false,0n);f.printString('CK_ENV3');f.startTimer(stage,'CK_E3',false,[4]);return;}}
  if(evt.timerName==='CK_E3'){{f.modifyEnvironmentSettings({DAY}n,players,false,0n);f.printString('CK_DAY');f.startTimer(stage,'CK_E4',false,[4]);return;}}
  if(evt.timerName==='CK_E4'){{f.setCurrentEnvironmentTime(22);f.setEnvironmentTimePassageSpeed(0);f.printString('CK_HOUR22');return;}}
  if(evt.timerName!=='CK_CLOCK')return;
  // The places in a timer's sequence are numbered from 0 (measured 2026-10-10).
  if(evt.timerSequenceId===0n){{
    // Nobody is teleported: the spawn point decides where the player stands. Print it to check.
    const hero=f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0]);
    if(hero.length===1){{
      f.printString('CK_AT');f.printString(f.dataTypeConversion(f.split3dVector(f.getEntityLocationAndRotation(hero[0]).location).xComponent,'str'));
      // Money is held by the character (the backpack component is on the character template), not by the player entity.
      f.printString('CK_PURSE');f.printString(f.dataTypeConversion(f.getInventoryCurrencyQuantity(hero[0],{GOLD}),'str'));
      f.modifyInventoryCurrencyQuantity(hero[0],{GOLD},5n);
      // The skill goes on the E key; pressing it runs the client graph "ping", which notifies the server.
      f.addCharacterSkill(hero[0] as any,{PING},CharacterSkillSlot.Skill1E,TopOfStackSkillDestructionType.Destroy);
    }}
    f.createPrefab({COIN},[8,0.8,0],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
    f.createPrefab({POST},[14,0,2.5],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
    f.createPrefab({STALL},[24,0,0],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
    // A second stall right at the start, where the player has no key yet: the filtered option 开门 should be hidden
    // there, so F picks the other one and prints CK_LOCKED.
    f.createPrefab({STALL},[-5,0,1.5],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
    f.createPrefab({CHEST},[11,0,3.5],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
    f.createPrefab({LIFT},[5,0,6],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
    f.createPrefab({GATE},f.queryPresetPointPositionRotation({GATE_AT}n).location,[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
    f.startGlobalTimer(evt.eventSourceEntity,'CK_round');
    f.printString('CK_GO');
  }}
  if(evt.timerSequenceId===1n){{
    f.modifyEnvironmentSettings({NIGHT}n,players,false,0n);f.printString('CK_NIGHT');f.sendSignal(dusk,'night');
    f.startTimer(stage,'CK_E1',false,[4]);
    // The chest's built-in animation: preset status 1 opens it.
    for(const chest of f.getEntitiesWithSpecifiedPrefabOnTheField({CHEST})){{
      f.setPresetStatus(chest,{CHEST_STATUS}n,1n);
      f.printString('CK_CHEST');f.printString(f.dataTypeConversion(f.getPresetStatus(chest,{CHEST_STATUS}n),'str'));
    }}
    // The platform has been going up and down since it appeared, two seconds each way: ten seconds on it is at the top.
    for(const lift of f.getEntitiesWithSpecifiedPrefabOnTheField({LIFT})){{
      f.printString('CK_LIFT');f.printString(f.dataTypeConversion(f.split3dVector(f.getEntityLocationAndRotation(lift).location).yComponent,'str'));
    }}
  }}
  if(evt.timerSequenceId===2n)f.printString('CK_THIRD');
}})
.on('whenGlobalTimerIsTriggered',(evt,f)=>{{
  f.printString('CK_TIME_UP');
}})
""",
    'coin': SERVER + f"""
.on('whenEnteringCollisionTrigger',(evt,f)=>{{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.enteringEntity as any);
  if(evt.triggerId===1n){{
    // A character has no GUID: the device follows it through the GUID of its player.
    f.switchFollowMotionDeviceTargetByGuid(evt.triggerEntity,f.queryGuidByEntity(player),'',[0,1,0],[0,0,0],FollowCoordinateSystem.WorldCoordinateSystem,FollowLocationType.FollowLocation);
    f.activateDisableFollowMotionDevice(evt.triggerEntity,true);
    f.printString('CK_PULL');
  }}
  if(evt.triggerId===2n){{
    f.setCustomVariable(player,'hasKey',true,true);
    f.printString('CK_COIN');
    f.destroyEntity(evt.triggerEntity);
  }}
}})
""",
    'post': DUSK + SERVER + f"""
.on('whenEnteringCollisionTrigger',(evt,f)=>{{
  // Who applies the status matters: the official sample 描边与透视 names the character that walked in as the applier and
  // the piece as the target. With the piece as its own applier the status was not there afterwards (2026-10-10).
  f.addUnitStatus(evt.enteringEntity,evt.triggerEntity,{GLOW},1n,f.createDictionary([] as string[],[] as number[]));
  f.printString('CK_GLOW_ON');
  // Does the status really sit on the post, and does an outline show on a character? The same kind of status in white
  // goes on whoever walked in.
  if(f.queryIfEntityHasUnitStatus(evt.triggerEntity,{GLOW}))f.printString('CK_POST_HAS');
  f.addUnitStatus(evt.enteringEntity,evt.enteringEntity,{GLOW2},1n,f.createDictionary([] as string[],[] as number[]));
  if(f.queryIfEntityHasUnitStatus(evt.enteringEntity,{GLOW2}))f.printString('CK_HERO_HAS');
  f.initiateAttack(evt.enteringEntity,1,3000,[0,0,0],[0,0,0],'CK_sting',false,evt.triggerEntity);
  f.printString('CK_STING');
}})
.on('whenExitingCollisionTrigger',(evt,f)=>{{
  f.removeUnitStatus(evt.triggerEntity,{GLOW},UnitStatusRemovalStrategy.AllCoexistingStatusesWithTheSameName,evt.exitingEntity);
  f.removeUnitStatus(evt.exitingEntity,{GLOW2},UnitStatusRemovalStrategy.AllCoexistingStatusesWithTheSameName,evt.exitingEntity);
  f.printString('CK_GLOW_OFF');
}})
.onSignal(dusk,(evt,f)=>{{
  f.printString('CK_HEARD');
  f.printString(evt.params.phase);
}})
""",
    'stall': SERVER + f"""
.on('whenTabIsSelected',(evt,f)=>{{
  if(evt.tabId!==1n){{f.printString('CK_LOCKED');return;}}
  // The gate's height before its motion starts and three seconds after: it should be four metres more.
  for(const gate of f.getEntitiesWithSpecifiedPrefabOnTheField({GATE})){{
    f.printString('CK_GATE_BEFORE');f.printString({HEIGHT('gate')});
    f.activateBasicMotionDevice(gate,'rise');
  }}
  f.startTimer(evt.eventSourceEntity,'CK_GATE',false,[3]);
  f.printString('CK_OPEN');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName!=='CK_GATE')return;
  for(const gate of f.getEntitiesWithSpecifiedPrefabOnTheField({GATE})){{f.printString('CK_GATE_AFTER');f.printString({HEIGHT('gate')});}}
}})
""",
    'hero': SERVER + f"""
.on('whenSkillNodeIsCalled',(evt,f)=>{{
  f.printString('CK_SKILL');
  f.printString(evt.parameter1);
}})
.on('whenTheQuantityOfInventoryCurrencyChanges',(evt,f)=>{{
  f.printString('CK_MONEY');
  f.printString(f.dataTypeConversion(f.getInventoryCurrencyQuantity(evt.currencyOwnerEntity,evt.currencyConfigId),'str'));
}})
""",
    'ping': f"""g.characterSkill({{id:{guids['graph:id']},name:'{guids['graph:name']}',prefix:false}})
.on('start',(evt,f)=>{{
  f.notifyServerNodeGraph('CK_ping','','');
}})
""",
    # The entity a filter of an option looks at is the character in front of the option (the official sample 过滤节点图
    # reads the same chain: target entity, its player, the player's variable).
    'haskey': f"""g.boolFilter({{id:{guids['graph:id']},name:'{guids['graph:name']}',prefix:false}})
.on('start',(evt,f)=>{{
  return f.getCustomVariable(f.getPlayerEntityToWhichTheCharacterBelongs(f.getTargetEntity()),'hasKey').asType('bool');
}})
""",
}
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(HEAD + BODY[which])
print('written', sys.argv[2], which)
