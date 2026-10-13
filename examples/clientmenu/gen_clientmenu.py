"""Client menu: the level's side of examples/clientmenu (the screen is three Lua client scripts).

Graph "stage" (关卡实体): hears the signal CM_buy the Lua sends when its button is clicked and prints CM_BUY.

Usage: python gen_clientmenu.py <guids.json> <out.ts> <ignored x3> stage"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'

// Client menu, graph "stage": see examples/clientmenu/gen_clientmenu.py.
g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})
.on('whenEntityIsCreated',(evt,f)=>{{
  f.printString('CM_READY');
}})
.onSignal('CM_buy',(evt,f)=>{{
  f.printString('CM_BUY');
}})
""")
print('written', sys.argv[2])
