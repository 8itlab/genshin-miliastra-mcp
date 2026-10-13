"""Client variables: the level's side of examples/clientvars (the variables of a client script, of every type, and the
values a control gives them).

Graph "stage" (关卡实体): prints CV_READY, nothing more; everything this example shows is printed by the Lua.

Usage: python gen_clientvars.py <guids.json> <out.ts> <ignored x3> stage"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'

// Client variables, graph "stage": see examples/clientvars/gen_clientvars.py.
g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})
.on('whenEntityIsCreated',(evt,f)=>{{
  f.printString('CV_READY');
}})
""")
print('written', sys.argv[2])
