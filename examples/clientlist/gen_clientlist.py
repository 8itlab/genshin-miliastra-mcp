"""Client list: the level's side of examples/clientlist/clientlist_test.json (the screen is the Lua client script).

Graph "stage" (关卡实体): hears the signal CL_more the Lua sends when its preset button is clicked or the 1 key is
pressed, and prints CL_MORE.

Usage: python gen_clientlist.py <guids.json> <out.ts> <ignored x3> stage"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'

// Client list, graph "stage": see examples/clientlist/gen_clientlist.py.
g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})
.on('whenEntityIsCreated',(evt,f)=>{{
  f.printString('CL_READY');
}})
.onSignal('CL_more',(evt,f)=>{{
  f.printString('CL_MORE');
}})
""")
print('written', sys.argv[2])
