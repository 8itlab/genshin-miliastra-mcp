"""Shop: the platform's own shop screen on a stall, tried in the game.

The character starts with twelve coins (a currency). The stall sells apples for five and pears for eight, and buys
apples back for three. F at the stall opens the shop; buying and selling are done with the mouse on the shop screen and
need no graph: the graphs here only open the shop and print what happens.

Graphs (the last argument picks one):
  stage  (关卡实体)            puts the stall down; prints what the character holds every three seconds: SH_HOLD coins apples pears
  stall  (SH_stall)            option 开店: opens the shop for the player; prints what the shop sold and bought
  hero   (character template)  prints every change of an item (SH_ITEM id amount) and of the purse (SH_COIN change)

Usage: python gen_shop.py <guids.json> <out.ts> <ignored x3> <graph>"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
COIN, APPLE, PEAR = guids['currency:SH_coin'], guids['item:SH_apple'], guids['item:SH_pear']
HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'

// Shop, graph "{which}": see examples/shop/gen_shop.py.
"""
SERVER = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})"
STR = lambda v: f"f.dataTypeConversion({v},'str')"
BODY = {
    'stage': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'SH_HOLD',true,[3]);
  f.startTimer(evt.eventSourceEntity,'SH_GIFT',false,[1]);
  // The stall stands three and a half metres behind the start.
  f.createPrefab({guids['prefab:SH_stall']},[0,0,3.5],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
  f.printString('SH_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0])){{
    // The character starts with two apples, so that there is something to sell to the shop.
    if(evt.timerName==='SH_GIFT'){{f.modifyInventoryItemQuantity(hero,{APPLE},2n);continue;}}
    f.printString('SH_HOLD');
    f.printString({STR(f'f.getInventoryCurrencyQuantity(hero,{COIN})')});
    f.printString({STR(f'f.getInventoryItemQuantity(hero,{APPLE})')});
    f.printString({STR(f'f.getInventoryItemQuantity(hero,{PEAR})')});
  }}
}})
""",
    'stall': SERVER + f"""
.on('whenTabIsSelected',(evt,f)=>{{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  f.openShop(player,evt.eventSourceEntity,1n);
  f.printString('SH_OPEN');
}})
.on('whenCustomShopItemIsSold',(evt,f)=>{{
  // The shop sold something from its list to the player.
  f.printString('SH_SOLD');f.printString({STR('evt.purchaseQuantity')});
}})
.on('whenSellingItemsToTheShop',(evt,f)=>{{
  // The player sold something to the shop.
  f.printString('SH_BOUGHT');
}})
""",
    'hero': SERVER + f"""
.on('whenTheQuantityOfInventoryItemChanges',(evt,f)=>{{
  f.printString('SH_ITEM');f.printString({STR('evt.postChangeQuantity')});
}})
.on('whenTheQuantityOfInventoryCurrencyChanges',(evt,f)=>{{
  f.printString('SH_COIN');f.printString({STR('evt.currencyChangeValue')});
}})
""",
}
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(HEAD + BODY[which])
print('written', sys.argv[2], which)
