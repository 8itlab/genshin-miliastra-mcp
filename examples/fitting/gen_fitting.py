"""The fitting room's graphs: see fit_spec.py for what is shown.

  stage  (关卡实体, server)  counts seconds; at each second of the plan it opens the next booth: teleports the player
                           there, puts the copies of the creature in front of the camera (each with its tools mounted
                           and told which booth and which skill is theirs) and prints FT <booth>
  unit   (every creature prefab, server)  prints FT_S when a skill of its creature starts
  skill  (creatureSkill)   tells the unit's server graph that the skill started
  mind, show (creatureDecision, creatureStatus)  while the booth is open, play the skill, over and over

Usage: python gen_fitting.py <guids.json> <out.ts> <ignored x3> <graph>"""
import json
import sys

from fit_spec import MAX_SKILLS, SLOTS, place, plan, skills

guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
ME = f"{{id:{guids['graph:id']},name:'{guids['graph:name']}',prefix:false}}"
HEAD = """/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
"""
CLIENT = HEAD + "import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'\n"
OWN = lambda name: f"f.getCustomVariable(TargetEntity.Self,'{name}').asType('int')"
OPEN = f"f.getCustomVariable(TargetEntity.StageEntity,'booth').asType('int')==={OWN('k')}"


def copies(b, key, name, tools, layout):
    """The copies of booth b, each told which booth and which skill is theirs."""
    (x0, z0), out = place(b), ''
    for i, ((x, ahead, heading), kit) in enumerate(zip(SLOTS[layout][len(tools)], tools)):
        c = f"c{b}_{i}"
        out += (f"const {c}=f.createPrefab({guids['prefab:FT_' + key]},[{x0 + x},0.4,{z0 + ahead}],[0,{heading},0],stage,false,1,[] as bigint[]);f.modifyEntityFaction({c},side);"
                f"f.setCustomVariable({c},'k',{b}n,true);f.setCustomVariable({c},'s',{skills(key).index(name) + 1}n,true);")
        for effect, point, *scale in kit or []:
            out += f"f.mountLoopingSpecialEffect({effect},{c},'{point}',true,true,[0,0,0],[0,0,0],{scale[0] if scale else 1},false);"
    return out


def stage():
    steps, end = plan()
    body = f"  if(t===1n){{{copies(*steps[0][1:])}return;}}\n"
    for n, (at, b, key, name, tools, layout) in enumerate(steps):
        body += (f"  if(t==={at}n){{f.teleportPlayer(players[0],[{place(b)[0]},0.6,{place(b)[1]}],[0,0,0]);f.setCustomVariable(stage,'booth',{b}n,true);"
                 f"f.printString('FT');f.printString('{b}');{copies(*steps[n + 1][1:]) if n + 1 < len(steps) else ''}return;}}\n")
    return HEAD + f"""
g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'FT_TICK',true,[1]);
  f.printString('FT_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const stage=evt.eventSourceEntity,side=f.queryEntityFaction(players[0]);
  const t=f.getCustomVariable(stage,'t').asType('int')+1n;
  f.setCustomVariable(stage,'t',t,true);
{body}  if(t==={end}n){{f.setCustomVariable(stage,'booth',-1n,true);f.printString('FT_END');}}
}})
"""


BODY = {
    'stage': stage,
    'unit': lambda: HEAD + f"\ng.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})\n.on('whenSkillNodeIsCalled',(evt,f)=>{{\n  f.printString('FT_S');\n}})\n",
    'skill': lambda: HEAD + f"\ng.creationSkill({ME}).on('start',(evt,f)=>{{\n  f.notifyServerNodeGraph('s','','');\n}})\n",
    'mind': lambda: CLIENT + f"\ng.creationStatusDecision({ME}).on('start1',(evt,f)=>{{\n  f.switchToSelfExecutionStatus(true,{guids['graph:show']},1n);\n}})\n",
    'show': lambda: CLIENT + f"\ng.creationStatus({ME}).on('start1',(evt,f)=>{{\n  " + '\n  '.join(f"f.executeSkill({OPEN}&&{OWN('s')}==={j}n,{j}n);" for j in range(1, MAX_SKILLS + 1))
            + "\n  f.tacticStandStill(true,'still',false);\n})\n",
}
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(BODY[which]())
print('written', sys.argv[2], which)
