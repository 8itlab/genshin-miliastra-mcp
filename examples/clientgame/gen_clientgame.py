"""Catch the coins: the level's side of examples/clientgame (the game itself is the Lua client script cg_game.lua).

Graph "stage" (关卡实体): the Lua sends CG_win when five coins are caught and CG_lose when three are missed; the level
is settled here, which only a node graph can do.

Usage: python gen_clientgame.py <guids.json> <out.ts> <ignored x3> stage"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ SettlementStatus }} from 'genshin-ts/definitions/enum'

// Catch the coins, graph "stage": see examples/clientgame/gen_clientgame.py.
g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})
.on('whenEntityIsCreated',(evt,f)=>{{
  f.printString('CG_READY');
}})
.onSignal('CG_win',(evt,f)=>{{
  f.printString('CG_VICTORY');
  for(const player of f.getListOfPlayerEntitiesOnTheField())f.setPlayerSettlementSuccessStatus(player,SettlementStatus.Victory);
  f.settleStage();
}})
.onSignal('CG_lose',(evt,f)=>{{
  f.printString('CG_DEFEAT');
  for(const player of f.getListOfPlayerEntitiesOnTheField())f.setPlayerSettlementSuccessStatus(player,SettlementStatus.Defeat);
  f.settleStage();
}})
""")
print('written', sys.argv[2])
