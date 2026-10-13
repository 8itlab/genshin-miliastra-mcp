"""Shoot: a ranged attack. The E skill makes the character's graph launch a bolt, a prefab with projectile motion and
hit detection, which flies straight ahead and attacks what it touches with its own ability unit.

  z 7   a crate ahead and a little to the right (50 health, a hurt box): each bolt takes about 30 off it, the second
        breaks it

Graphs (the last argument picks one):
  stage  (关卡实体)            puts the crate down, hands out the skill, prints what is destroyed (SH_DEAD)
  hero   (character template)  hears the skill: f.createProjectile at chest height, facing where the character faces
  bolt   (SH_bolt)             whenOnHitDetectionIsTriggered: prints SH_TOUCH and removes itself; gone after three
                               seconds if it met nothing
  crate  (SH_crate)            prints every hit it takes (SH_HURT damage)
  fire   (client skill graph)  tells the server the key was pressed

Usage: python gen_shoot.py <guids.json> <out.ts> <ignored x3> <graph>"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
BOLT, CRATE, FIRE = guids['prefab:SH_bolt'], guids['prefab:SH_crate'], guids['skill:SH_fire']
HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ CharacterSkillSlot, TopOfStackSkillDestructionType }} from 'genshin-ts/definitions/enum'

// Shoot, graph "{which}": see examples/shoot/gen_shoot.py.
"""
SERVER = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})"
STR = lambda v: f"f.dataTypeConversion({v},'str')"
NO_TAGS = '[] as bigint[]'
BODY = {
    'stage': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  const stage=evt.eventSourceEntity;
  f.createPrefab({CRATE},[1.5,0,7],[0,0,0],stage,false,1,{NO_TAGS});
  f.startTimer(stage,'SH_GIVE',false,[2]);
  f.printString('SH_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0]))f.addCharacterSkill(hero as any,{FIRE},CharacterSkillSlot.Skill1E,TopOfStackSkillDestructionType.Destroy);
}})
.on('whenEntityIsDestroyed',(evt,f)=>{{
  f.printString('SH_DEAD');
}})
""",
    'hero': SERVER + f"""
.on('whenSkillNodeIsCalled',(evt,f)=>{{
  // The bolt starts a metre above the ground, a metre and a half to the character's right (so that the camera behind
  // the character sees it), and flies the way the character faces.
  const hero=evt.callerEntity,where=f.getEntityLocationAndRotation(hero),at=f.split3dVector(where.location);
  f.createProjectile({BOLT},f.create3dVector(at.xComponent+1.5,at.yComponent+1,at.zComponent),where.rotate,hero,hero,false,1n,{NO_TAGS});
  f.printString('SH_FIRE');
}})
""",
    'bolt': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  // A bolt that meets nothing is taken away after three seconds.
  f.startTimer(evt.eventSourceEntity,'SH_GONE',false,[3]);
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  f.removeEntity(evt.eventSourceEntity);
}})
.on('whenOnHitDetectionIsTriggered',(evt,f)=>{{
  // Its hit detection only notices hurt boxes, and launches the ability unit at what it touched. The bolt has to
  // outlive that attack: removed in this same moment, it did no damage. So it goes a third of a second later.
  f.printString('SH_TOUCH');
  f.startTimer(evt.eventSourceEntity,'SH_DONE',false,[0.3]);
}})
""",
    'crate': SERVER + f"""
.on('whenAttacked',(evt,f)=>{{
  f.printString('SH_HURT');f.printString({STR('evt.damage')});
}})
""",
    'fire': f"""g.characterSkill({{id:{guids['graph:id']},name:'{guids['graph:name']}',prefix:false}})
.on('start',(evt,f)=>{{
  f.notifyServerNodeGraph('fire','','');
}})
""",
}
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(HEAD + BODY[which])
print('written', sys.argv[2], which)
