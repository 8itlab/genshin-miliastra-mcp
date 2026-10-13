# 样例 raid：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

A fourth kind of game built with the same tools: fight, loot, trade. Break the crate with the sword (E; it has 100 health, two hits), kill the hilichurl that appears in front of the character, pick up the apples both leave (F, twice: two and three apples), sell the five at the stall for ten coins and buy the key for eight, open the gate with it, open the chest. Everything new since the third game is in it: an animated skill with a hit box, health and a hurt box on an object, loot and drops with a wide pick-up area, items and a shop, a script that clicks on the shop screen. Won on its second run in the game, 2026-10-11 (in the first the hilichurl appeared five metres away and never came: it now appears two and a half metres in front of the character). Prints: RD_READY, RD_SWING, RD_HIT crate|brute damage, RD_DEAD, RD_HOLD coins apples keys x (every two seconds), RD_SHOP, RD_BOUGHT, RD_SOLD, RD_COIN change, RD_GATE (or RD_LOCKED), RD_CHEST, RD_VICTORY (or RD_TIME_UP).

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":11,"yawRange":[0,0]}`
3. [UI] `editor_open_map` `{mapPath}`：在编辑器里打开底图的副本（演练时跳过）
4. `scene_build_blocks` `{"name":"Raid_Demo","blocks":[{"template":"石质墙体（灰）","name":"RD_wall_left","position":[-2.8,0,0],"size":[0.3,3,6]},{"template":"石质墙体（灰）","name":"RD_wall_a","position":[19,0,5.5],"size":[0.4,3,7]},{"template":"石质墙体（灰）","name":"RD_wall_b","position":[19,0,-5.5],"size":[0.4,3,7]},"… 2 more pieces of the same form"]}` → `{"name":"Raid_Demo"}`
5. [UI] `scene_import_assets` `{"packs":["Raid_Demo"]}`：把上面的场景包导入并保存（演练时跳过）
6. `scene_list_entities` `{"namePrefix":"RD_"}` → `{"total":0}`
7. `scene_add_prefab` `{"asset":10005008,"name":"RD_crate","scale":1.5,"health":100}` → `{"name":"RD_crate","prefabId":1077936129}`
8. `scene_add_prefab` `{"asset":10005009,"name":"RD_brute"}` → `{"name":"RD_brute","prefabId":1077936130}`
9. `scene_add_prefab` `{"asset":20001809,"name":"RD_stall","scale":1}` → `{"name":"RD_stall","prefabId":1077936131}`
10. `scene_add_prefab` `{"asset":20001872,"name":"RD_gate","scale":[0.15,1.2,1.4]}` → `{"name":"RD_gate","prefabId":1077936132}`
11. `scene_add_prefab` `{"asset":10005006,"name":"RD_chest","scale":1.5}` → `{"name":"RD_chest","prefabId":1077936133}`
12. `scene_set_faction_hostility` `{"hostilePairs":[[1,3]]}`
13. `scene_add_currency` `{"name":"RD_coin","icon":100007,"startAmount":0}` → `{"name":"RD_coin","currencyId":1115684865,"backpackTemplateId":1119879169}`
14. `scene_set_spawn` `{"position":[0,0.4,0],"rotation":[0,0,0]}` → `{"pointId":1073741825}`
15. `scene_set_class` `{"allowClimb":false}`
16. `scene_add_graph` `{"name":"RdStage"}` → `{"graphId":1073741825,"name":"_GSTS_RdStage"}`
17. `scene_add_graph` `{"name":"RdCrate","attachToPrefab":"RD_crate"}` → `{"graphId":1073741826,"name":"_GSTS_RdCrate"}`
18. `scene_add_graph` `{"name":"RdBrute","attachToPrefab":"RD_brute"}` → `{"graphId":1073741827,"name":"_GSTS_RdBrute"}`
19. `scene_add_graph` `{"name":"RdStall","attachToPrefab":"RD_stall"}` → `{"graphId":1073741828,"name":"_GSTS_RdStall"}`
20. `scene_add_graph` `{"name":"RdGate","attachToPrefab":"RD_gate"}` → `{"graphId":1073741829,"name":"_GSTS_RdGate"}`
21. `scene_add_graph` `{"name":"RdChest","attachToPrefab":"RD_chest"}` → `{"graphId":1073741830,"name":"_GSTS_RdChest"}`
22. `scene_add_graph` `{"name":"RdHero","attachToPrefab":"character"}` → `{"graphId":1073741831,"name":"_GSTS_RdHero"}`
23. `scene_add_graph` `{"name":"RdSwing","kind":"characterSkill"}` → `{"graphId":1082130433,"name":"_GSTS_RdSwing"}`
24. `scene_add_item` `{"name":"RD_apple","icon":90001,"value":{"currency":"RD_coin","amount":2}}` → `{"name":"RD_apple","itemId":1107296257}`
25. `scene_add_item` `{"name":"RD_key","icon":90015,"value":{"currency":"RD_coin","amount":8}}` → `{"name":"RD_key","itemId":1107296258}`
26. `scene_add_prefab` `{"asset":20001554,"name":"RD_fallen","drop":{"item":"RD_apple","amount":1,"pickupSize":6}}` → `{"name":"RD_fallen","prefabId":1077936134}`
27. `scene_add_shop` `{"name":"RD_trade","prefab":"RD_stall","sell":[{"item":"RD_key","currency":"RD_coin","price":8}],"buy":[{"item":"RD_apple","currency":"RD_coin","price":2}]}` → `{"name":"RD_trade","shopTemplateId":1136656385}`
28. `scene_add_skill` `{"name":"RD_swing","type":"normal","animation":1001,"graphAtMs":250,"effect":{"asset":10002152,"attachPoint":"GI_WeaponR","ms":1833.333},"graphId":1082130433}` → `{"graphId":1082130433,"name":"RD_swing","skillId":1098907649}`
29. `scene_add_components` `{"prefab":"RD_crate","hurtBox":{"areas":[{"size":[1.6,1.2,1.4],"offset":[0,0.6,0]}]},"loot":{"dropPrefab":"RD_fallen","items":[{"item":"RD_apple","amount":2}]}}`
30. `scene_add_components` `{"prefab":"RD_brute","loot":{"dropPrefab":"RD_fallen","items":[{"item":"RD_apple","amount":3}]}}`
31. `scene_add_components` `{"prefab":"RD_stall","optionTab":{"areas":[{"size":[8,4,8]}],"options":[{"text":"交易","icon":20}]}}`
32. `scene_add_components` `{"prefab":"RD_gate","motions":[{"name":"open","move":[0,4,0],"seconds":1.5}],"optionTab":{"areas":[{"size":[30,4,8]}],"options":[{"text":"开门","icon":3}]}}`
33. `scene_add_components` `{"prefab":"RD_chest","optionTab":{"areas":[{"size":[5,4,8]}],"options":[{"text":"打开","icon":2}]}}`
34. `scene_add_components` `{"prefab":"player","variables":[{"name":"fallen","type":"integer","value":0}]}`
35. `scene_add_global_timer` `{"name":"RD_time","seconds":90,"holder":"stage"}` → `{"name":"RD_time"}`
36. `scene_add_timer_display` `{"name":"RD_clock","timer":"RD_time","position":[0,330]}` → `{"name":"RD_clock","controlId":1073741847}`
37. `scene_list_prefabs` `{}`
38. 每张节点图各做一遍这五步（上一张 `apply_build` 返回的存档给下一张的 `create_project`）：
   - `create_project` `{"projectId":"stage","targetGraphId":"<scene_add_graph 返回的 graphId>"}`
   - `update_logic` `{projectId, code: <源码，见第二节>}`
   - `build_project` `{projectId}`：返回 buildId 和节点数、编辑器计数
   - `preview_changes` `{projectId, buildId, destination:"copy"}`：返回 expectedSha256
   - `apply_build` `{projectId, buildId, destination:"copy", expectedSha256}`：返回可以试玩的存档
   源码都写好以后，这五步可以换成一次 `write_graphs` `{mapPath, graphs:[{graphId, code}, ...]}`：它对每张图依次做同样的事，返回全部写好的存档。
39. `scene_list_components` `{"prefab":"RD_crate"}`
40. `inspect_map` `{}`
41. [UI] `playtest_start` `{"graphNames":["_GSTS_RdStage","_GSTS_RdCrate","_GSTS_RdBrute","_GSTS_RdStall","_GSTS_RdGate","_GSTS_RdChest","_GSTS_RdHero","_GSTS_RdSwing"],"durationSeconds":57,"screenshotsAt":[1.5,4,6.5,9,11.5,14,16.5,19,22.8,26.5,29.4,32.2,34.3,36.3,37.8,39.3,43.5,45.5,48.5,51,54],"inputs":[{"at":2,"key":"d","holdMs":500},{"at":3.5,"key":"e"},{"at":6,"key":"e"},{"at":8.5,"key":"e"},{"at":11,"key":"e"},{"at":13.5,"key":"e"},{"at":16,"key":"e"},{"at":18.5,"key":"e"},{"at":21,"key":"f"},{"at":22,"key":"f"},{"at":23.5,"key":"d","holdMs":1300},{"at":25.7,"key":"f"},{"at":27.5,"clickText":"批量出售"},{"at":28.8,"click":[0.567,0.333]},{"at":30.1,"clickText":"最大"},{"at":31.3,"click":[0.91,0.953]},{"at":33.5,"click":[0.198,0.26]},{"at":34.9,"clickText":"购买"},{"at":36.9,"click":[0.5,0.92]},{"at":38.3,"key":"esc"},{"at":40,"key":"d","holdMs":3000},{"at":44,"key":"f"},{"at":46.5,"key":"d","holdMs":1300},{"at":49,"key":"f"}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 8 张，合计 152 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_RdStage（93 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Raid, graph "stage": see examples/raid/gen_raid.py.
g.server({id:1073741825,name:'_GSTS_RdStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  const stage=evt.eventSourceEntity;
  f.createPrefab(1077936129,[4.5,0,0],[0,0,0],stage,false,1,[] as bigint[]);
  f.createPrefab(1077936131,[12.5,0,3.5],[0,0,0],stage,false,1,[] as bigint[]);
  f.createPrefab(1077936132,[19,0,0],[0,0,0],stage,false,1,[] as bigint[]);
  f.createPrefab(1077936133,[23.5,0,1.5],[0,0,0],stage,false,1,[] as bigint[]);
  f.startTimer(stage,'RD_GIVE',false,[2]);
  f.startTimer(stage,'RD_HOLD',true,[2]);
  f.printString('RD_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0])){
    if(evt.timerName==='RD_GIVE'){f.addCharacterSkill(hero as any,1098907649,CharacterSkillSlot.Skill1E,TopOfStackSkillDestructionType.Destroy);continue;}
    f.printString('RD_HOLD');
    f.printString(f.dataTypeConversion(f.getInventoryCurrencyQuantity(hero,1115684865),'str'));
    f.printString(f.dataTypeConversion(f.getInventoryItemQuantity(hero,1107296257),'str'));
    f.printString(f.dataTypeConversion(f.getInventoryItemQuantity(hero,1107296258),'str'));
    f.printString(f.dataTypeConversion(f.split3dVector(f.getEntityLocationAndRotation(hero).location).xComponent,'str'));
  }
})
.on('whenEntityIsDestroyed',(evt,f)=>{
  f.printString('RD_DEAD');
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  // The first thing to fall is the crate: the hilichurl appears then, two and a half metres in front of the character
  // and facing it (from five metres away it stood where it was and the sword met nothing).
  const p=players[0],fallen=f.getCustomVariable(p,'fallen').asType('int');
  f.setCustomVariable(p,'fallen',fallen+1n,true);
  if(fallen!==0n)return;
  const stage=f.getSelfEntity();
  for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(p)){
    const at=f.split3dVector(f.getEntityLocationAndRotation(hero).location);
    f.createPrefab(1077936130,f.create3dVector(at.xComponent+2.5,0.3,0),[0,-90,0],stage,false,1,[] as bigint[]);
  }
})
.on('whenGlobalTimerIsTriggered',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  f.printString('RD_TIME_UP');
  f.setPlayerSettlementSuccessStatus(players[0],SettlementStatus.Defeat);
  f.settleStage();
})
```

### _GSTS_RdCrate（5 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Raid, graph "crate": see examples/raid/gen_raid.py.
g.server({id:1073741826,name:'_GSTS_RdCrate'})
.on('whenAttacked',(evt,f)=>{
  f.printString('RD_HIT');f.printString('crate');f.printString(f.dataTypeConversion(evt.damage,'str'));
})
```

### _GSTS_RdBrute（5 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Raid, graph "brute": see examples/raid/gen_raid.py.
g.server({id:1073741827,name:'_GSTS_RdBrute'})
.on('whenAttacked',(evt,f)=>{
  f.printString('RD_HIT');f.printString('brute');f.printString(f.dataTypeConversion(evt.damage,'str'));
})
```

### _GSTS_RdStall（8 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Raid, graph "stall": see examples/raid/gen_raid.py.
g.server({id:1073741828,name:'_GSTS_RdStall'})
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
```

### _GSTS_RdGate（11 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Raid, graph "gate": see examples/raid/gen_raid.py.
g.server({id:1073741829,name:'_GSTS_RdGate'})
.on('whenTabIsSelected',(evt,f)=>{
  // The gate wants a key from the backpack of the character that asks, and keeps it.
  if(f.getInventoryItemQuantity(evt.selectorEntity,1107296258)<1n){f.printString('RD_LOCKED');return;}
  f.modifyInventoryItemQuantity(evt.selectorEntity,1107296258,-1n);
  f.activateBasicMotionDevice(evt.eventSourceEntity,'open');
  f.activateDisableTab(evt.eventSourceEntity,1n,false);
  f.printString('RD_GATE');
})
```

### _GSTS_RdChest（17 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Raid, graph "chest": see examples/raid/gen_raid.py.
g.server({id:1073741830,name:'_GSTS_RdChest'})
.on('whenTabIsSelected',(evt,f)=>{
  f.setPresetStatus(evt.eventSourceEntity,100010060n,1n);
  f.startTimer(evt.eventSourceEntity,'RD_WIN',false,[1.5]);
  f.printString('RD_CHEST');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  f.printString('RD_VICTORY');
  f.setPlayerSettlementSuccessStatus(players[0],SettlementStatus.Victory);
  f.settleStage();
})
```

### _GSTS_RdHero（6 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Raid, graph "hero": see examples/raid/gen_raid.py.
g.server({id:1073741831,name:'_GSTS_RdHero'})
.on('whenSkillNodeIsCalled',(evt,f)=>{
  f.printString('RD_SWING');
})
.on('whenTheQuantityOfInventoryCurrencyChanges',(evt,f)=>{
  f.printString('RD_COIN');f.printString(f.dataTypeConversion(evt.currencyChangeValue,'str'));
})
```

### _GSTS_RdSwing（7 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { AttackType, ElementalType, EntityType, HitType, TargetType, TriggerRestriction } from 'genshin-ts/definitions/enum'
import { AttackLayerConfig, HitLevel, KnockbackDirectionType, SectorDetectionDirection } from 'genshin-ts/definitions/client_enums'

// Raid, graph "swing": see examples/raid/gen_raid.py.
g.characterSkill({id:1082130433,name:'_GSTS_RdSwing',prefix:false})
.on('start',(evt,f)=>{
  const self=f.getSelfEntity();
  // The official attack (see examples/strike): a sector 3 m long, 120 degrees wide and 2 m high in front of the
  // character, 1 x attack + 50, once per target, only things with a hurt box.
  f.triggerSectorHitboxAtSpecificLocation(TargetType.AllExceptSelf,f.getEntityLocation(self),f.getEntityRotation(self),1,50,[EntityType.Object,EntityType.Creation],
    TriggerRestriction.TriggerOnlyOncePerEntity,10006060,2,120,3,0,SectorDetectionDirection.FromInsideOut,AttackLayerConfig.OnlyOnHitHurtbox,[] as string[],
    ElementalType.None,0,HitType.Slash,AttackType.MeleeAttack,0,true,10006060,KnockbackDirectionType.LineConnectingAttackerAndHitPoint,false,
    [0,0,0],[0,0,0],1,[0,0,0],[0,0,0],1.5,1,1,HitLevel.LightHit,1000,1000);
  f.notifyServerNodeGraph('swing','','');
})
```
