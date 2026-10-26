"""Paimon: a companion made of shapes. The prefab PM_paimon is 39 white-box shapes (decorations of one empty model,
written by scene_add_shape_prefab from paimon_parts.json), so it is one entity that moves as a whole:

  level second 6   the stage creates Paimon 3.5 m ahead of the player and a little to the right, turned to face the
                   player (createPrefab rotation [0,180,0]; the camera behind the player sees her face); her text
                   bubble talks
  4 s later        she flies to the player's character and stays beside it, 1.2 m to the right and 0.5 m ahead: a follow
                   motion device that follows the position, the offset in world coordinates, so she keeps facing the
                   camera; the player walks forward and then left and she goes along

What did not work in the probes of 2026-10-26 (examples/paimon is the result of four rounds):
  - a basic motion device on the prefab (a path that only turns, for a spin) made the creation rotation and the follow
    offset of no effect: she showed her back and ended up behind the character, between it and the camera;
  - rotation motion devices added by a graph at run time (addTargetOrientedRotationBasedMotionDevice,
    addUniformBasicRotationBasedMotionDevice) did not turn her at all.

Graphs (the last argument picks one):
  stage   (关卡实体)        creates Paimon
  paimon  (the prefab)      the follow, by a timer from the moment she is created

Usage: python gen_paimon.py <guids.json> <out.ts> <ignored x3> <graph>"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ FollowCoordinateSystem, FollowLocationType }} from 'genshin-ts/definitions/enum'

// Paimon, graph "{which}": see examples/paimon/gen_paimon.py.
"""
SERVER = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})"
NO_TAGS = '[] as bigint[]'
BODY = {
    'stage': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'PM_COME',false,[6]);
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName==='PM_COME'){{
    f.createPrefab({guids['prefab:PM_paimon']},[1.6,0.4,3.5],[0,180,0],evt.eventSourceEntity,false,1,{NO_TAGS});
    f.printString('PM_HELLO');
  }}
}})
""",
    'paimon': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'PM_GO',false,[4]);
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName!=='PM_GO')return;
  const self=evt.eventSourceEntity;
  const players=f.getListOfPlayerEntitiesOnTheField();
  const hero=f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0])[0];
  f.switchFollowMotionDeviceTargetByEntity(self,hero,'',[1.2,0,0.5],[0,0,0],FollowCoordinateSystem.WorldCoordinateSystem,FollowLocationType.FollowLocation);
  f.activateDisableFollowMotionDevice(self,true);
  f.printString('PM_FOLLOW');
}})
""",
}
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(HEAD + BODY[which])
print('written', sys.argv[2])
