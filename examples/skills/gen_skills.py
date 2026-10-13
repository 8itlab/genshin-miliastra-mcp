"""Skills: tries the normal (animated) skills of scene_add_skill in the game.

Three skills are put on the keys two seconds into the level:
  E  SK_swing  animation 1001 (sword attack), its graph 250 ms in, a sword shown in the hand for 1833 ms
  Q  SK_rake   animation 1006 (raking), the portion the farming sample stores for it (0.167), graph at the start
  R  SK_reach  animation 1025 (reaching out a hand), whole, graph at the start
Each skill graph tells the server its own word; the character's graph prints SK_CALL and the word. The stage prints the
character's x four times a second (SK_AT), so that a key pressed while walking shows whether, and for how long, a skill
holds the character in place.

Graphs (the last argument picks one):
  stage  (关卡实体)            hands out the skills, prints the position
  hero   (character template)  prints what the skill graphs send
  swing, rake, reach (client skill graphs)

Usage: python gen_skills.py <guids.json> <out.ts> <ignored x3> <graph>"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ CharacterSkillSlot, TopOfStackSkillDestructionType }} from 'genshin-ts/definitions/enum'

// Skills, graph "{which}": see examples/skills/gen_skills.py.
"""
SERVER = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})"
STR = lambda v: f"f.dataTypeConversion({v},'str')"
SLOTS = (('swing', 'Skill1E'), ('rake', 'Skill2Q'), ('reach', 'Skill3R'))
# With the argument cd the character's graph puts a skill on cooldown when it has been used (skills_cd_test.json):
# the sword four seconds whatever the skill's own longest cooldown is, the rake four seconds but no longer than that.
COOLDOWN = ('''
  if(evt.parameter1==='swing'){f.setCharacterSkillCd(evt.callerEntity as any,CharacterSkillSlot.Skill1E,4,false);}
  if(evt.parameter1==='rake'){f.setCharacterSkillCd(evt.callerEntity as any,CharacterSkillSlot.Skill2Q,4,true);}''' if 'cd' in sys.argv else '')
GIVE = '\n    '.join(f"f.addCharacterSkill(hero as any,{guids['skill:SK_' + n]},CharacterSkillSlot.{slot},TopOfStackSkillDestructionType.Destroy);" for n, slot in SLOTS)


def client(word):
    return f"""g.characterSkill({{id:{guids['graph:id']},name:'{guids['graph:name']}',prefix:false}})
.on('start',(evt,f)=>{{
  f.notifyServerNodeGraph('{word}','','');
}})
"""


BODY = {
    'stage': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'SK_SETUP',false,[2]);
  f.startTimer(evt.eventSourceEntity,'SK_WHERE',true,[0.25]);
  f.printString('SK_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const heroes=f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0]);
  if(evt.timerName==='SK_WHERE'){{
    for(const hero of heroes){{f.printString('SK_AT');f.printString({STR('f.split3dVector(f.getEntityLocationAndRotation(hero).location).xComponent')});}}
    return;
  }}
  if(evt.timerName!=='SK_SETUP')return;
  for(const hero of heroes){{
    {GIVE}
  }}
  f.printString('SK_GO');
}})
""",
    'hero': SERVER + f"""
.on('whenSkillNodeIsCalled',(evt,f)=>{{
  f.printString('SK_CALL');f.printString(evt.parameter1);{COOLDOWN}
}})
""",
    'swing': client('swing'), 'rake': client('rake'), 'reach': client('reach'),
}
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(HEAD + BODY[which])
print('written', sys.argv[2], which)
