"""Strike: a sword attack that really hits. The skill graph triggers a hit box in front of the character; a crate with
a hurt box and a creature take the damage; each leaves loot behind when it is destroyed.

The hit box is the official one (the attack of the sample 命中与受击): a sector 3 m long, 120 degrees wide and 2 m high in
front of the character, 50 damage a hit, once per target, the slash hit effect. It only hits things that have a hurt
box: creatures have one of their own, an object gets one from scene_add_components {hurtBox}.

Graphs (the last argument picks one):
  stage   (关卡实体)             puts the crate and the creature in front of the start, hands out the skill (E), prints
                                 what is destroyed (ST_DEAD) and what the character holds (ST_HOLD apples); after the
                                 fight it puts the character beside each of the two things left behind
  crate   (ST_crate)             prints every hit it takes (ST_HIT crate damage)
  slime   (ST_slime, creature)   prints every hit it takes (ST_HIT slime damage)
  swing   (client skill graph)   the hit box, then a word to the server
  hero    (character template)   prints the word (ST_SWING)

Usage: python gen_strike.py <guids.json> <out.ts> <ignored x3> <graph>"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
CRATE, SLIME, APPLE, SWING = guids['prefab:ST_crate'], guids['prefab:ST_slime'], guids['item:ST_apple'], guids['skill:ST_swing']
HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ CharacterSkillSlot, TopOfStackSkillDestructionType }} from 'genshin-ts/definitions/enum'

// Strike, graph "{which}": see examples/strike/gen_strike.py.
"""
CLIENT_HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ AttackType, ElementalType, EntityType, HitType, TargetType, TriggerRestriction }} from 'genshin-ts/definitions/enum'
import {{ AttackLayerConfig, HitLevel, KnockbackDirectionType, SectorDetectionDirection }} from 'genshin-ts/definitions/client_enums'

// Strike, graph "{which}": see examples/strike/gen_strike.py.
"""
SERVER = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})"
STR = lambda v: f"f.dataTypeConversion({v},'str')"
NO_TAGS = '[] as bigint[]'


def hit(word):
    return SERVER + f"""
.on('whenAttacked',(evt,f)=>{{
  f.printString('ST_HIT');f.printString('{word}');f.printString({STR('evt.damage')});
}})
"""


BODY = {
    'stage': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  const stage=evt.eventSourceEntity;
  // Both stand within the three metres of the hit box in front of the start (the character faces +z).
  f.createPrefab({CRATE},[-1,0,2],[0,0,0],stage,false,1,{NO_TAGS});
  f.createPrefab({SLIME},[1.2,0.3,2.2],[0,180,0],stage,false,1,{NO_TAGS});
  f.startTimer(stage,'ST_GIVE',false,[2]);
  f.startTimer(stage,'ST_HOLD',true,[3]);
  f.startTimer(stage,'ST_PICK',false,[22,26]);
  f.printString('ST_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  if(evt.timerName==='ST_PICK'){{
    // After the fight the character is put 0.6 m beside each thing that was left behind (the prompt to pick up shows
    // at about that distance), where the script presses F. The places were kept on the player when the things fell.
    const p=players[0];
    if(evt.timerSequenceId===0n)f.teleportPlayer(p,f.create3dVector(f.getCustomVariable(p,'ax').asType('float')-0.6,0.4,f.getCustomVariable(p,'az').asType('float')),[0,0,0]);
    else f.teleportPlayer(p,f.create3dVector(f.getCustomVariable(p,'bx').asType('float')-0.6,0.4,f.getCustomVariable(p,'bz').asType('float')),[0,0,0]);
    return;
  }}
  for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0])){{
    if(evt.timerName==='ST_GIVE'){{f.addCharacterSkill(hero as any,{SWING},CharacterSkillSlot.Skill1E,TopOfStackSkillDestructionType.Destroy);continue;}}
    f.printString('ST_HOLD');f.printString({STR(f'f.getInventoryItemQuantity(hero,{APPLE})')});
  }}
}})
.on('whenEntityIsDestroyed',(evt,f)=>{{
  f.printString('ST_DEAD');f.printString({STR('evt.location')});
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const p=players[0],at=f.split3dVector(evt.location),fallen=f.getCustomVariable(p,'dead').asType('int');
  if(fallen===0n){{f.setCustomVariable(p,'ax',at.xComponent,true);f.setCustomVariable(p,'az',at.zComponent,true);}}
  else{{f.setCustomVariable(p,'bx',at.xComponent,true);f.setCustomVariable(p,'bz',at.zComponent,true);}}
  f.setCustomVariable(p,'dead',fallen+1n,true);
}})
""",
    'crate': hit('crate'),
    'slime': hit('slime'),
    'hero': SERVER + """
.on('whenSkillNodeIsCalled',(evt,f)=>{
  f.printString('ST_SWING');
})
""",
    'swing': f"""g.characterSkill({{id:{guids['graph:id']},name:'{guids['graph:name']}',prefix:false}})
.on('start',(evt,f)=>{{
  const self=f.getSelfEntity();
  // (The official graph leaves the list of entity types empty; the compiler cannot write an empty list of an
  // enumeration, so the two kinds this level has are named.)
  // The values of the official attack: everything but the character itself, 1 x attack + 50, once per target, a sector
  // 2 m high, 120 degrees wide and 3 m long, only things with a hurt box, a slash, absolute damage, a light hit.
  f.triggerSectorHitboxAtSpecificLocation(TargetType.AllExceptSelf,f.getEntityLocation(self),f.getEntityRotation(self),1,50,[EntityType.Object,EntityType.Creation],
    TriggerRestriction.TriggerOnlyOncePerEntity,10006060,2,120,3,0,SectorDetectionDirection.FromInsideOut,AttackLayerConfig.OnlyOnHitHurtbox,[] as string[],
    ElementalType.None,0,HitType.Slash,AttackType.MeleeAttack,0,true,10006060,KnockbackDirectionType.LineConnectingAttackerAndHitPoint,false,
    [0,0,0],[0,0,0],1,[0,0,0],[0,0,0],1.5,1,1,HitLevel.LightHit,1000,1000);
  f.notifyServerNodeGraph('swing','','');
}})
""",
}
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write((CLIENT_HEAD if which == 'swing' else HEAD) + BODY[which])
print('written', sys.argv[2], which)
