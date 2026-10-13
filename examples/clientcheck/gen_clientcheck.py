"""Client check: the level's side of examples/clientcheck (what a faulty Lua script leaves in the log, a container a
graph switches on, a signal with a parameter).

Graph "stage" (关卡实体): switches the hidden container CC_late on at level second 16 and prints CC_SHOW; hears the
signal CC_say the Lua sends with a string and prints it.

Usage: python gen_clientcheck.py <guids.json> <out.ts> <ignored x3> stage"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(f"""/// <reference types="genshin-ts" />
import {{ g, defineSignal }} from 'genshin-ts/runtime/core'
import {{ UIControlGroupStatus }} from 'genshin-ts/definitions/enum'

// The signal CC_say carries one string.
const say=defineSignal('CC_say',[['word','str']] as const)

// Client check, graph "stage": see examples/clientcheck/gen_clientcheck.py.
g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'CC_SHOW',false,[16]);
  f.printString('CC_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName!=='CC_SHOW')return;
  f.printString('CC_SHOW');
  for(const player of f.getListOfPlayerEntitiesOnTheField())f.modifyUiControlStatusWithinTheInterfaceLayout(player,{guids['clientui:CC_late']}n,UIControlGroupStatus.On);
}})
.onSignal(say,(evt,f)=>{{
  f.printString('CC_SAY');f.printString(evt.params.word);
}})
""")
print('written', sys.argv[2])
