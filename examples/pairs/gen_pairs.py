"""Pairs: the level's side of examples/pairs (a whole game of matching pairs written in Lua on client controls).

Graph "stage" (关卡实体): the script sends PR_win when all six pairs are found and PR_lose when the time is up; the graph
settles the level with a victory or a defeat.

Usage: python gen_pairs.py <guids.json> <out.ts> <ignored x3> stage"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ SettlementStatus }} from 'genshin-ts/definitions/enum'

// Pairs, graph "stage": see examples/pairs/gen_pairs.py.
g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})
.on('whenEntityIsCreated',(evt,f)=>{{
  f.printString('PR_READY');
}})
.onSignal('PR_win',(evt,f)=>{{
  f.printString('PR_VICTORY');
  for(const player of f.getListOfPlayerEntitiesOnTheField())f.setPlayerSettlementSuccessStatus(player,SettlementStatus.Victory);
  f.settleStage();
}})
.onSignal('PR_lose',(evt,f)=>{{
  f.printString('PR_DEFEAT');
  for(const player of f.getListOfPlayerEntitiesOnTheField())f.setPlayerSettlementSuccessStatus(player,SettlementStatus.Defeat);
  f.settleStage();
}})
""")
print('written', sys.argv[2])
