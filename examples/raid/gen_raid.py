"""Raid: a fourth kind of game built with these tools, a small fight-loot-trade loop.

Side on, walking along x. The character has a sword (the E key). A crate stands in the way and breaks after two hits;
when it breaks a hilichurl appears further on and comes at the character. Both leave apples behind. The stall buys
apples for two coins each and sells one key for eight. The gate opens for a key; behind it the chest ends the level. A
clock counts down from the moment the level loads.

  x  4.5   the crate (100 health, a hurt box, loot: two apples)
  +2.5     in front of the character: where the hilichurl appears once the crate is broken (loot: three apples)
  x 12.5   the stall (F: the shop)
  x 19     the gate (F: opens if the character holds a key, which it takes)
  x 23.5   the chest (F: the lid opens, a second and a half later the level is won)

Graphs (the last argument picks one), each on the thing it is about:
  stage   (关卡实体)             puts everything down, hands out the sword, brings the hilichurl when the crate breaks,
                                 reports what the character holds and where it is, loses when the clock runs out
  crate   (RD_crate)             prints every hit it takes
  brute   (RD_brute, creature)   prints every hit it takes
  stall   (RD_stall)             option: opens the shop; prints what the shop sold and bought
  gate    (RD_gate)              option: takes a key and starts its own motion, or says it is locked
  chest   (RD_chest)             option: its preset status (the lid), then the level is won
  hero    (character template)   prints every swing and the purse when it changes
  swing   (client skill graph)   the official sector hit box in front of the character

Usage: python gen_raid.py <guids.json> <out.ts> <ignored x3> <graph>
Prints: RD_READY, RD_SWING, RD_HIT crate|brute damage, RD_DEAD, RD_HOLD coins apples keys x (every two seconds), RD_SHOP,
RD_SOLD, RD_BOUGHT, RD_COIN change, RD_LOCKED, RD_GATE, RD_CHEST, RD_VICTORY, RD_TIME_UP."""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
P = {n: guids['prefab:RD_' + n] for n in ('crate', 'brute', 'stall', 'gate', 'chest')}
COIN, APPLE, KEY, SWING = guids['currency:RD_coin'], guids['item:RD_apple'], guids['item:RD_key'], guids['skill:RD_swing']
CHEST_STATUS = guids['presetStatus:RD_chest']
HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ CharacterSkillSlot, SettlementStatus, TopOfStackSkillDestructionType }} from 'genshin-ts/definitions/enum'

// Raid, graph "{which}": see examples/raid/gen_raid.py.
"""
CLIENT_HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ AttackType, ElementalType, EntityType, HitType, TargetType, TriggerRestriction }} from 'genshin-ts/definitions/enum'
import {{ AttackLayerConfig, HitLevel, KnockbackDirectionType, SectorDetectionDirection }} from 'genshin-ts/definitions/client_enums'

// Raid, graph "{which}": see examples/raid/gen_raid.py.
"""
SERVER = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})"
STR = lambda v: f"f.dataTypeConversion({v},'str')"
NO_TAGS = '[] as bigint[]'
ONE_PLAYER = """const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;"""


def create(prefab, x, y, z, turn='[0,0,0]'):
    return f"f.createPrefab({P[prefab]},[{x},{y},{z}],{turn},stage,false,1,{NO_TAGS});"


def hit(word):
    return SERVER + f"""
.on('whenAttacked',(evt,f)=>{{
  f.printString('RD_HIT');f.printString('{word}');f.printString({STR('evt.damage')});
}})
"""


BODY = {
    'stage': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  const stage=evt.eventSourceEntity;
  {create('crate', 4.5, 0, 0)}
  {create('stall', 12.5, 0, 3.5)}
  {create('gate', 19, 0, 0)}
  {create('chest', 23.5, 0, 1.5)}
  f.startTimer(stage,'RD_GIVE',false,[2]);
  f.startTimer(stage,'RD_HOLD',true,[2]);
  f.printString('RD_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  {ONE_PLAYER}
  for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0])){{
    if(evt.timerName==='RD_GIVE'){{f.addCharacterSkill(hero as any,{SWING},CharacterSkillSlot.Skill1E,TopOfStackSkillDestructionType.Destroy);continue;}}
    f.printString('RD_HOLD');
    f.printString({STR(f'f.getInventoryCurrencyQuantity(hero,{COIN})')});
    f.printString({STR(f'f.getInventoryItemQuantity(hero,{APPLE})')});
    f.printString({STR(f'f.getInventoryItemQuantity(hero,{KEY})')});
    f.printString({STR('f.split3dVector(f.getEntityLocationAndRotation(hero).location).xComponent')});
  }}
}})
.on('whenEntityIsDestroyed',(evt,f)=>{{
  f.printString('RD_DEAD');
  {ONE_PLAYER}
  // The first thing to fall is the crate: the hilichurl appears then, two and a half metres in front of the character
  // and facing it (from five metres away it stood where it was and the sword met nothing).
  const p=players[0],fallen=f.getCustomVariable(p,'fallen').asType('int');
  f.setCustomVariable(p,'fallen',fallen+1n,true);
  if(fallen!==0n)return;
  const stage=f.getSelfEntity();
  for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(p)){{
    const at=f.split3dVector(f.getEntityLocationAndRotation(hero).location);
    f.createPrefab({P['brute']},f.create3dVector(at.xComponent+2.5,0.3,0),[0,-90,0],stage,false,1,{NO_TAGS});
  }}
}})
.on('whenGlobalTimerIsTriggered',(evt,f)=>{{
  {ONE_PLAYER}
  f.printString('RD_TIME_UP');
  f.setPlayerSettlementSuccessStatus(players[0],SettlementStatus.Defeat);
  f.settleStage();
}})
""",
    'crate': hit('crate'),
    'brute': hit('brute'),
    'stall': SERVER + """
.on('whenTabIsSelected',(evt,f)=>{
  f.openShop(f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any),evt.eventSourceEntity,1n);
  f.printString('RD_SHOP');
})
.on('whenCustomShopItemIsSold',(evt,f)=>{
  f.printString('RD_SOLD');
})
.on('whenSellingItemsToTheShop',(evt,f)=>{
  f.printString('RD_BOUGHT');
})
""",
    'gate': SERVER + f"""
.on('whenTabIsSelected',(evt,f)=>{{
  // The gate wants a key from the backpack of the character that asks, and keeps it.
  if(f.getInventoryItemQuantity(evt.selectorEntity,{KEY})<1n){{f.printString('RD_LOCKED');return;}}
  f.modifyInventoryItemQuantity(evt.selectorEntity,{KEY},-1n);
  f.activateBasicMotionDevice(evt.eventSourceEntity,'open');
  f.activateDisableTab(evt.eventSourceEntity,1n,false);
  f.printString('RD_GATE');
}})
""",
    'chest': SERVER + f"""
.on('whenTabIsSelected',(evt,f)=>{{
  f.setPresetStatus(evt.eventSourceEntity,{CHEST_STATUS}n,1n);
  f.startTimer(evt.eventSourceEntity,'RD_WIN',false,[1.5]);
  f.printString('RD_CHEST');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  {ONE_PLAYER}
  f.printString('RD_VICTORY');
  f.setPlayerSettlementSuccessStatus(players[0],SettlementStatus.Victory);
  f.settleStage();
}})
""",
    'hero': SERVER + f"""
.on('whenSkillNodeIsCalled',(evt,f)=>{{
  f.printString('RD_SWING');
}})
.on('whenTheQuantityOfInventoryCurrencyChanges',(evt,f)=>{{
  f.printString('RD_COIN');f.printString({STR('evt.currencyChangeValue')});
}})
""",
    'swing': f"""g.characterSkill({{id:{guids['graph:id']},name:'{guids['graph:name']}',prefix:false}})
.on('start',(evt,f)=>{{
  const self=f.getSelfEntity();
  // The official attack (see examples/strike): a sector 3 m long, 120 degrees wide and 2 m high in front of the
  // character, 1 x attack + 50, once per target, only things with a hurt box.
  f.triggerSectorHitboxAtSpecificLocation(TargetType.AllExceptSelf,f.getEntityLocation(self),f.getEntityRotation(self),1,50,[EntityType.Object,EntityType.Creation],
    TriggerRestriction.TriggerOnlyOncePerEntity,10006060,2,120,3,0,SectorDetectionDirection.FromInsideOut,AttackLayerConfig.OnlyOnHitHurtbox,[] as string[],
    ElementalType.None,0,HitType.Slash,AttackType.MeleeAttack,0,true,10006060,KnockbackDirectionType.LineConnectingAttackerAndHitPoint,false,
    [0,0,0],[0,0,0],1,[0,0,0],[0,0,0],1.5,1,1,HitLevel.LightHit,1000,1000);
  f.notifyServerNodeGraph('swing','','');
}})
""",
}
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write((CLIENT_HEAD if which == 'swing' else HEAD) + BODY[which])
print('written', sys.argv[2], which)
