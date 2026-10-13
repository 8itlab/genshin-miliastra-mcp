"""Cards: the card selector (卡牌选择器), the platform's own window to choose one of a few cards.

  stage   (关卡实体)        at level second 14 opens the selector CD_pick for every player: three cards of its library
                            are shown, the player picks one, twenty seconds to do it; whoever lets the time run out
                            gets the first
  player  (the player template)  hears the choice (whenDeckSelectorIsComplete) and prints the value of the card

Usage: python gen_cards.py <guids.json> <out.ts> <ignored x3> <graph>"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
PICK = guids['cards:CD_pick']
HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ DecisionRefreshMode }} from 'genshin-ts/definitions/enum'

// Cards, graph "{which}": see examples/cards/gen_cards.py.
"""
SERVER = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})"
STR = lambda v: f"f.dataTypeConversion({v},'str')"
BODY = {
    'stage': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'CD_OPEN',false,[14]);
  f.printString('CD_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName!=='CD_OPEN')return;
  for(const player of f.getListOfPlayerEntitiesOnTheField())f.invokeDeckSelector(player,{PICK}n,20,[10n,20n,30n],[1n,2n,3n],1n,1n,DecisionRefreshMode.CannotRefresh,0n,0n,[10n]);
  f.printString('CD_OPENED');
}})
""",
    'player': SERVER + f"""
.on('whenDeckSelectorIsComplete',(evt,f)=>{{
  f.printString('CD_DONE count');f.printString({STR('f.getListLength(evt.selectionResultList)')});
  for(const value of evt.selectionResultList){{f.printString('CD_PICKED');f.printString({STR('value')});}}
}})
""",
}
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(HEAD + BODY[which])
print('written', sys.argv[2])
