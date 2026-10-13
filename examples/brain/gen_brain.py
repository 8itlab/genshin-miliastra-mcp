"""Brain: complex creatures (复杂造物) that do what their graphs say, tried in the game.

A scout walks to a place when it is told to, works there (a skill with an animation), comes back and strolls; an archer
shoots at a creature it is given as its target. Nothing in the server graph moves them: it only writes custom variables
on them and sets aggro, and each creature's decision graph picks the status graph that fits.

  stage      (关卡实体, server)          makes the two units, then tells them what to do, one order every eight seconds;
                                         prints where they are every two seconds and what their skills report
  unit       (BR_scout, BR_archer, server) prints when a skill of its creature calls the server
  scoutMind  (creatureDecision)          duty 1: go, duty 2: work, otherwise: stroll
  archerMind (creatureDecision)          with a target on the field: shoot, otherwise: stand
  go         (creatureStatus)            walk to (px, pz) of its own variables, then stand
  work       (creatureStatus)            skill 1 again and again
  stroll     (creatureStatus)            wander within four metres of where it appeared
  shoot      (creatureStatus)            turn to the target and use skill 1
  stand      (creatureStatus)            stand still
  workSkill, shootSkill (creatureSkill)  tell the server: a signal and a call

Usage: python gen_brain.py <guids.json> <out.ts> <ignored x3> <graph>
Prints: BR_READY, BR_GO, BR_AT scout x z archer x z (every two seconds), BR_ORDER n, BR_SIGNAL work|shoot,
BR_CALL work|shoot (if a creature's own server graph hears its skill), BR_FOE, BR_FOE_GONE."""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
G = lambda key: guids['graph:' + key]
P = {n: guids['prefab:BR_' + n] for n in ('scout', 'archer', 'foe')}
SERVER_HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'

// Brain, graph "{which}": see examples/brain/gen_brain.py.
"""
CLIENT_HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ TacticSpeed, TargetEntity }} from 'genshin-ts/definitions/client_enums'

// Brain, graph "{which}": see examples/brain/gen_brain.py.
"""
SERVER = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})"
ME = f"{{id:{guids['graph:id']},name:'{guids['graph:name']}',prefix:false}}"
STR = lambda v: f"f.dataTypeConversion({v},'str')"
NO_TAGS = '[] as bigint[]'
ONE_PLAYER = """const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;"""
XZ = lambda e: (f"f.printString({STR(f'f.split3dVector(f.getEntityLocationAndRotation({e}).location).xComponent')});"
                f"f.printString({STR(f'f.split3dVector(f.getEntityLocationAndRotation({e}).location).zComponent')});")


def order(n, body):
    return f"if(evt.timerSequenceId==={n}n){{{body}f.printString('BR_ORDER');f.printString('{n}');return;}}"


BODY = {
    'stage': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'BR_GO',false,[3]);
  f.printString('BR_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  {ONE_PLAYER}
  const stage=evt.eventSourceEntity,side=f.queryEntityFaction(players[0]);
  if(evt.timerName==='BR_GO'){{
    // The two units stand on the player's side, or they would go for the player.
    const scout=f.createPrefab({P['scout']},[2,0.4,3],[0,0,0],stage,false,1,{NO_TAGS});
    const archer=f.createPrefab({P['archer']},[9,0.4,6],[0,0,0],stage,false,1,{NO_TAGS});
    f.modifyEntityFaction(scout,side);f.modifyEntityFaction(archer,side);
    f.startTimer(stage,'BR_TICK',true,[2]);
    f.startTimer(stage,'BR_PLAN',false,[8,16,24,32,42]);
    f.printString('BR_GO');
    return;
  }}
  const scouts=f.getEntitiesWithSpecifiedPrefabOnTheField({P['scout']}),archers=f.getEntitiesWithSpecifiedPrefabOnTheField({P['archer']});
  if(evt.timerName==='BR_TICK'){{
    f.printString('BR_AT');
    for(const scout of scouts){{{XZ('scout')}}}
    for(const archer of archers){{{XZ('archer')}}}
    return;
  }}
  if(evt.timerName!=='BR_PLAN')return;
  // Orders are custom variables on the unit: its decision graph reads them.
  {order(0, "for(const scout of scouts){f.setCustomVariable(scout,'px',12,true);f.setCustomVariable(scout,'pz',3,true);f.setCustomVariable(scout,'duty',1n,true);}")}
  {order(1, "for(const scout of scouts)f.setCustomVariable(scout,'duty',2n,true);")}
  {order(2, "for(const scout of scouts){f.setCustomVariable(scout,'px',0,true);f.setCustomVariable(scout,'pz',3,true);f.setCustomVariable(scout,'duty',1n,true);}")}
  if(evt.timerSequenceId===3n){{
    // A creature of the other side appears twelve metres from the archer, which is given it as its target.
    for(const scout of scouts)f.setCustomVariable(scout,'duty',0n,true);
    const foe=f.createPrefab({P['foe']},[17,0.4,2],[0,-90,0],stage,false,1,{NO_TAGS});
    for(const archer of archers)f.setTheAggroValueOfSpecifiedEntity(foe,archer,1000n);
    f.printString('BR_FOE');f.printString('BR_ORDER');f.printString('3');
    return;
  }}
  for(const foe of f.getEntitiesWithSpecifiedPrefabOnTheField({P['foe']}))f.removeEntity(foe);
  f.printString('BR_FOE_GONE');
}})
.onSignal('BR_work',(evt,f)=>{{f.printString('BR_SIGNAL');f.printString('work');}})
.onSignal('BR_shoot',(evt,f)=>{{f.printString('BR_SIGNAL');f.printString('shoot');}})
""",
    'unit': SERVER + """
.on('whenSkillNodeIsCalled',(evt,f)=>{
  f.printString('BR_CALL');f.printString(evt.parameter1);
})
""",
    'scoutMind': f"""g.creationStatusDecision({ME}).on('start1',(evt,f)=>{{
  const duty=f.getCustomVariable(TargetEntity.Self,'duty').asType('int');
  if(duty===1n){{f.switchToSelfExecutionStatus(true,{G('go')},1n);}}
  else{{
    if(duty===2n){{f.switchToSelfExecutionStatus(true,{G('work')},1n);}}
    else{{f.switchToSelfExecutionStatus(true,{G('stroll')},1n);}}
  }}
}})
""",
    'archerMind': f"""g.creationStatusDecision({ME}).on('start1',(evt,f)=>{{
  if(f.queryIfEntityIsOnTheField(TargetEntity.AggroTarget)){{f.switchToSelfExecutionStatus(true,{G('shoot')},1n);}}
  else{{f.switchToSelfExecutionStatus(true,{G('stand')},1n);}}
}})
""",
    'go': f"""g.creationStatus({ME}).on('start1',(evt,f)=>{{
  // A statement runs only if the one before it could not: standing still is what is left once the place is reached.
  const to=f.create3dVector(f.getCustomVariable(TargetEntity.Self,'px').asType('float'),0,f.getCustomVariable(TargetEntity.Self,'pz').asType('float'));
  f.tacticMoveToTheTargetPosition(true,to,1,TacticSpeed.Walk,360,'go',false);
  f.tacticStandStill(true,'there',false);
}})
""",
    'work': f"""g.creationStatus({ME}).on('start1',(evt,f)=>{{
  f.executeSkill(true,1n);
  f.tacticStandStill(true,'between',false);
}})
""",
    'stroll': f"""g.creationStatus({ME}).on('start1',(evt,f)=>{{
  f.tacticGroundIdleRoaming(true,TacticSpeed.Walk,4,1,3,1,3,'stroll',false);
  f.tacticStandStill(true,'pause',false);
}})
""",
    'shoot': f"""g.creationStatus({ME}).on('start1',(evt,f)=>{{
  f.executeSkill(true,1n);
  f.tacticRotateToTheTargetEntity(true,f.getTargetEntity(),360,false,'aim',false);
}})
""",
    'stand': f"""g.creationStatus({ME}).on('start1',(evt,f)=>{{
  f.tacticStandStill(true,'stand',false);
}})
""",
    'workSkill': f"""g.creationSkill({ME}).on('start',(evt,f)=>{{
  f.sendSignalToServerNodeGraph('BR_work');
  f.notifyServerNodeGraph('work','','');
}})
""",
    'shootSkill': f"""g.creationSkill({ME}).on('start',(evt,f)=>{{
  f.sendSignalToServerNodeGraph('BR_shoot');
  f.notifyServerNodeGraph('shoot','','');
}})
""",
}
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write((SERVER_HEAD if which in ('stage', 'unit') else CLIENT_HEAD) + BODY[which])
print('written', sys.argv[2], which)
