"""Potion: an item the player uses from the backpack.

The character starts with two potions. Using one runs the item graph, which puts seven coins into the purse of the
character that used it (a coin change is something a graph on the character hears, so it can be printed).

Graphs (the last argument picks one):
  stage  (关卡实体)            gives the two potions a second in; prints what the character holds (PT_HOLD coins potions)
  drink  (item graph)          whenItemsInTheInventoryAreUsed: seven coins for every potion used; the two other events
                               of an item, each shown as coins: 100 when it first comes into the backpack, 1000 when
                               its number changes
  hero   (character template)  prints the purse when it changes (PT_COIN change)

Usage: python gen_potion.py <guids.json> <out.ts> <ignored x3> <graph>"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
COIN, POTION = guids['currency:PT_coin'], guids['item:PT_potion']
HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'

// Potion, graph "{which}": see examples/potion/gen_potion.py.
"""
SERVER = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})"
STR = lambda v: f"f.dataTypeConversion({v},'str')"
BODY = {
    'stage': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'PT_GIVE',false,[1]);
  f.startTimer(evt.eventSourceEntity,'PT_HOLD',true,[2]);
  f.printString('PT_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0])){{
    if(evt.timerName==='PT_GIVE'){{f.modifyInventoryItemQuantity(hero,{POTION},2n);continue;}}
    f.printString('PT_HOLD');
    f.printString({STR(f'f.getInventoryCurrencyQuantity(hero,{COIN})')});
    f.printString({STR(f'f.getInventoryItemQuantity(hero,{POTION})')});
  }}
}})
""",
    'drink': f"""g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}',type:'item'}})
.on('whenItemsInTheInventoryAreUsed',(evt,f)=>{{
  // Several can be used at once: seven coins each, to whoever holds the backpack.
  f.modifyInventoryCurrencyQuantity(evt.itemOwnerEntity,{COIN},evt.amountToUse*7n);
}})
.on('whenItemIsAddedToInventory',(evt,f)=>{{
  // The three events about an item arrive in the item's own graph, not in a graph on the holder. Each is made
  // visible here as an amount of coins of its own: 100 when the item first comes into the backpack,
  f.modifyInventoryCurrencyQuantity(evt.itemOwnerEntity,{COIN},100n);
}})
.on('whenTheQuantityOfInventoryItemChanges',(evt,f)=>{{
  // 1000 whenever its number changes.
  f.modifyInventoryCurrencyQuantity(evt.itemOwnerEntity,{COIN},1000n);
}})
""",
    'hero': SERVER + f"""
.on('whenTheQuantityOfInventoryCurrencyChanges',(evt,f)=>{{
  f.printString('PT_COIN');f.printString({STR('evt.currencyChangeValue')});
}})
""",
}
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(HEAD + BODY[which])
print('written', sys.argv[2], which)
