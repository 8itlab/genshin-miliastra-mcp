"""Drops: things that lie on the ground and go into the backpack, and loot left behind by something destroyed.

  x  4   an apple on the ground (a drop prefab that gives one apple), there from the start
  x -4   a chest with the loot component: four seconds in, the stage destroys it, and it leaves a drop with two apples

The stage puts the character 0.6 m beside the first one, F picks it up; then beside where the chest stood, and F again.

Graphs (the last argument picks one):
  stage  (关卡实体)            puts the two things down, destroys the chest, prints what the character holds (DR_HOLD)
  hero   (character template)  prints what the two item events report (DR_ITEM amount, DR_ADDED amount)
  player (player template)     the same two events, to see on which of the two they arrive (DR_P_ITEM, DR_P_ADDED)

Usage: python gen_drops.py <guids.json> <out.ts> <ignored x3> <graph>"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
APPLE, FALLEN, CHEST = guids['item:DR_apple'], guids['prefab:DR_fallen'], guids['prefab:DR_chest']
HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'

// Drops, graph "{which}": see examples/drops/gen_drops.py.
"""
SERVER = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})"
STR = lambda v: f"f.dataTypeConversion({v},'str')"
NO_TAGS = '[] as bigint[]'
BODY = {
    'stage': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  const stage=evt.eventSourceEntity;
  f.createPrefab({FALLEN},[4,0.3,0],[0,0,0],stage,false,1,{NO_TAGS});
  f.createPrefab({CHEST},[-4,0,0],[0,0,0],stage,false,1,{NO_TAGS});
  f.startTimer(stage,'DR_BREAK',false,[9]);
  f.startTimer(stage,'DR_NEAR',false,[7,14]);
  f.startTimer(stage,'DR_HOLD',true,[2]);
  f.printString('DR_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName==='DR_BREAK'){{
    for(const chest of f.getEntitiesWithSpecifiedPrefabOnTheField({CHEST}))f.destroyEntity(chest);
    f.printString('DR_BROKEN');
    return;
  }}
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  // The character is put 0.6 m beside each drop. Walking for a set time ended anywhere within a metre of the mark, and
  // the prompt to pick up showed at 0.6 to 0.7 m, not at 1.06 m and not at 0.04 or 0.27 m (standing on the drop).
  if(evt.timerName==='DR_NEAR'){{
    if(evt.timerSequenceId===0n)f.teleportPlayer(players[0],[3.4,0.4,0],[0,0,0]);
    else f.teleportPlayer(players[0],[-3.4,0.4,0],[0,0,0]);
    return;
  }}
  for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0])){{
    f.printString('DR_HOLD');f.printString({STR(f'f.getInventoryItemQuantity(hero,{APPLE})')});
    f.printString({STR('f.split3dVector(f.getEntityLocationAndRotation(hero).location).xComponent')});
  }}
}})
""",
    'hero': SERVER + f"""
.on('whenTheQuantityOfInventoryItemChanges',(evt,f)=>{{
  f.printString('DR_ITEM');f.printString({STR('evt.postChangeQuantity')});
}})
.on('whenItemIsAddedToInventory',(evt,f)=>{{
  f.printString('DR_ADDED');f.printString({STR('evt.quantityObtained')});
}})
""",
    'player': SERVER + f"""
.on('whenTheQuantityOfInventoryItemChanges',(evt,f)=>{{
  f.printString('DR_P_ITEM');f.printString({STR('evt.postChangeQuantity')});
}})
.on('whenItemIsAddedToInventory',(evt,f)=>{{
  f.printString('DR_P_ADDED');f.printString({STR('evt.quantityObtained')});
}})
""",
}
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(HEAD + BODY[which])
print('written', sys.argv[2], which)
