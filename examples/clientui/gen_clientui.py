"""Client interface: the level's side of examples/clientui/clientui_test.json.

Graph "stage" (关卡实体): takes a life away at level seconds 12 and 16 (the Lua on the screen hears the variable change
and hides a disc), and hears the signal CU_click the Lua sends when its button is clicked: every click adds one to
CU_score, which the Lua shows as a bar that grows.

Usage: python gen_clientui.py <guids.json> <out.ts> <ignored x3> stage"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'

// Client interface, graph "stage": see examples/clientui/gen_clientui.py.
g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'CU_STEP',false,[12,16]);
  f.printString('CU_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName!=='CU_STEP')return;
  f.printString('CU_STEP');f.printString(f.dataTypeConversion(evt.timerSequenceId,'str'));
  for(const player of f.getListOfPlayerEntitiesOnTheField()){{
    f.setCustomVariable(player,'CU_lives',evt.timerSequenceId===0n?2n:1n,true);
  }}
}})
.onSignal('CU_click',(evt,f)=>{{
  f.printString('CU_CLICK');
  for(const player of f.getListOfPlayerEntitiesOnTheField()){{
    f.setCustomVariable(player,'CU_score',f.getCustomVariable(player,'CU_score').asType('int')+1n,true);
  }}
}})
""")
print('written', sys.argv[2])
