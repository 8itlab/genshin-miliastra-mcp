"""Client signal: the level's side of examples/clientsignal (a node graph sends a signal to the client scripts of a
player, with the node 发送客户端脚本信号 of game 7.1).

Graph "stage" (关卡实体): at level second 9 sends CS_ping to every player's client scripts, at second 13 CS_tell with
the string "hello". A signal to client scripts is written f.sendSignal('client:NAME', player, ...parameters).

Usage: python gen_clientsignal.py <guids.json> <out.ts> <ignored x3> stage"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'

// Client signal, graph "stage": see examples/clientsignal/gen_clientsignal.py.
g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'CS_A',false,[9]);
  f.startTimer(evt.eventSourceEntity,'CS_B',false,[13]);
  f.printString('CS_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName==='CS_A'){{
    for(const player of f.getListOfPlayerEntitiesOnTheField())f.sendSignal('client:CS_ping',player);
    f.printString('CS_SENT ping');
  }}
  if(evt.timerName==='CS_B'){{
    for(const player of f.getListOfPlayerEntitiesOnTheField())f.sendSignal('client:CS_tell',player,'hello');
    f.printString('CS_SENT tell');
  }}
}})
""")
print('written', sys.argv[2])
