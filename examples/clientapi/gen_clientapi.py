"""Client API: the level's side of examples/clientapi (things of the Lua API that are easy to miss: the fill of an
image, the pause of the level, a sound, the size of the canvas).

Graph "stage" (关卡实体): prints CA_TICK every second, so that the log shows the seconds the level stood still while
the script had it paused.

Usage: python gen_clientapi.py <guids.json> <out.ts> <ignored x3> stage"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'

// Client API, graph "stage": see examples/clientapi/gen_clientapi.py.
g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'CA_T',true,[1]);
  f.printString('CA_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  f.printString('CA_TICK');
}})
""")
print('written', sys.argv[2])
