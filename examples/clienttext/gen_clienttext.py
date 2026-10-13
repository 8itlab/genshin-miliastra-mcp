"""Client text: the level's side of examples/clienttext (text boxes and a text window, which an account of 奇匠 level 2
and up shows).

Graph "stage" (关卡实体): counts a custom variable of the player up every two seconds, for the text box of the ordinary
interface that shows it ("金币：{1:ps.CT_coins}").

Usage: python gen_clienttext.py <guids.json> <out.ts> <ignored x3> stage"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'

// Client text, graph "stage": see examples/clienttext/gen_clienttext.py.
g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'CT_T',true,[2]);
  f.printString('CT_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  for(const player of f.getListOfPlayerEntitiesOnTheField())f.setCustomVariable(player,'CT_coins',f.getCustomVariable(player,'CT_coins').asType('int')+5n,true);
}})
""")
print('written', sys.argv[2])
