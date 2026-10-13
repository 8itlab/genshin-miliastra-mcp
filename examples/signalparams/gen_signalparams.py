"""Signal parameters: the level's side of examples/signalparams (signals that carry several values of several types,
between graphs, from a client script to a graph and from a graph to a client script).

Graph "stage" (关卡实体):
  - at level second 3 sends SP_note (an integer and an entity) and hears it itself: graph to graph;
  - hears SP_report from the client script (an integer, a float, a string, a vector, a boolean, a list of integers),
    prints each value, and answers every player's client scripts with SP_reply (an integer, a vector, a boolean, a
    list of strings, an entity).
A signal with typed parameters is declared once with defineSignal and that declaration is what f.sendSignal and
.onSignal take; the one that goes to client scripts has the name client:NAME and the player as its first parameter.

Usage: python gen_signalparams.py <guids.json> <out.ts> <ignored x3> stage"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
STR = lambda v: f"f.dataTypeConversion({v},'str')"
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(f"""/// <reference types="genshin-ts" />
import {{ g, defineSignal }} from 'genshin-ts/runtime/core'

// Signal parameters, graph "stage": see examples/signalparams/gen_signalparams.py.
const NOTE=defineSignal('SP_note',[['n','int'],['who','entity']] as const)
const REPORT=defineSignal('SP_report',[['points','int'],['ratio','float'],['label','str'],['at','vec3'],['ok','bool'],['picks','int_list']] as const)
const REPLY=defineSignal('client:SP_reply',[['player','entity'],['points','int'],['at','vec3'],['ok','bool'],['names','str_list'],['who','entity']] as const)
g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'SP_T',false,[3]);
  f.printString('SP_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName==='SP_T'){{
    f.sendSignal(NOTE,7n,evt.eventSourceEntity);
    f.printString('SP_SENT note');
  }}
}})
.onSignal(NOTE,(evt,f)=>{{
  f.printString('SP_NOTE n');f.printString({STR('evt.params.n')});
}})
.onSignal(REPORT,(evt,f)=>{{
  f.printString('SP_REPORT points');f.printString({STR('evt.params.points')});
  f.printString('SP_REPORT ratio');f.printString({STR('evt.params.ratio')});
  f.printString('SP_REPORT label');f.printString(evt.params.label);
  f.printString('SP_REPORT at');f.printString({STR('evt.params.at')});
  f.printString('SP_REPORT ok');f.printString({STR('evt.params.ok')});
  f.printString('SP_REPORT picks');f.printString({STR('f.getListLength(evt.params.picks)')});
  for(const player of f.getListOfPlayerEntitiesOnTheField())f.sendSignal(REPLY,player,evt.params.points,evt.params.at,true,f.assemblyList(['red','blue']),player);
  f.printString('SP_SENT reply');
}})
""")
print('written', sys.argv[2])
