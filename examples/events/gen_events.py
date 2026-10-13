"""Events demo: the same small pick-up-and-pay loop as the first samples, built the way the platform intends.

Four small graphs, each on the entity it is about, all driven by events; no timer polls positions:
  stage   (关卡实体)      sets the scene two seconds in, and hears every coin being destroyed
  coin    (prefab EV_coin, collision trigger)  walk in: the walker's player gets score + 1, the coin destroys itself
  stall   (prefab EV_stall, option tab)        option 1 付一枚币: takes one coin if the player has one
  player  (player template, variable score)    hears score change and prints it

Usage: python gen_events.py <guids.json> <out.ts> <ignored x3> <stage | coin | stall | player>
Prints: EV_READY, EV_GO, EV_GONE, EV_COIN, EV_TAB, EV_PAID, EV_POOR, EV_SCORE."""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
COIN, STALL = guids['prefab:EV_coin'], guids['prefab:EV_stall']
NO_TAGS = '[] as bigint[]'
HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'

// Events demo, graph "{which}": see examples/events/gen_events.py.
"""
OPEN = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'"

BODY = {
    'stage': OPEN + f""",variables:{{gone:0n}}}})
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'EV_START',false,[2]);
  f.printString('EV_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName!=='EV_START')return;
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  f.teleportPlayer(players[0],[0,0.4,0],[0,0,0]);
  for(const i of [1n,2n,3n,4n,5n])f.createPrefab({COIN},f.create3dVector(Number(i)*3+1,0.8,0),[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
  f.createPrefab({STALL},[22,0,0],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
  f.printString('EV_GO');
}})
.on('whenEntityIsDestroyed',(evt,f)=>{{
  f.set('gone',f.get('gone')+1n);
  f.printString('EV_GONE');
}})
""",
    'coin': OPEN + f"""}})
.on('whenEnteringCollisionTrigger',(evt,f)=>{{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.enteringEntity as any);
  const score=f.getCustomVariable(player,'score').asType('int');
  f.setCustomVariable(player,'score',score+1n,true);
  f.printString('EV_COIN');
  f.destroyEntity(evt.triggerEntity);
}})
""",
    'stall': OPEN + f"""}})
.on('whenTabIsSelected',(evt,f)=>{{
  f.printString('EV_TAB');
  f.printString(f.dataTypeConversion(evt.tabId,'str'));
  if(evt.tabId!==1n)return;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const score=f.getCustomVariable(player,'score').asType('int');
  if(score<1n){{f.printString('EV_POOR');return;}}
  f.setCustomVariable(player,'score',score-1n,true);
  f.printString('EV_PAID');
}})
""",
    'player': OPEN + f"""}})
.on('whenCustomVariableChanges',(evt,f)=>{{
  if(evt.variableName!=='score')return;
  // The event is typed: it fires only for variables of the type its values are read as, here an integer.
  f.printString('EV_SCORE');
  f.printString(f.dataTypeConversion(evt.postChangeValue.asType('int'),'str'));
}})
""",
}
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(HEAD + BODY[which])
print('written', sys.argv[2], which)
