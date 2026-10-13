# 样例 potion：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

An item the player uses from the backpack: an item graph (scene_add_graph {kind: item}) and a consumable that names it (scene_add_item {category: consumable, useGraph}). The character starts with two potions; the script presses B (the backpack), clicks the potion, clicks 使用 and 确认: the item graph runs and puts seven coins into the purse, one potion is left, and the item shows the seconds until it can be used again. The item graph also hears the item's other events, each shown as coins of its own (100: it came into the backpack; 1000: its number changed). Played as written on 2026-10-11: PT_COIN 100 and 1000 when the potions are handed out, 1000 and 7 when one is used, 2107 coins in the end. Prints: PT_READY, PT_HOLD coins potions (every two seconds), PT_COIN change.

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":8,"yawRange":[0,0]}`
3. [UI] `editor_open_map` `{mapPath}`：在编辑器里打开底图的副本（演练时跳过）
4. `scene_build_blocks` `{"name":"Potion_Probe","blocks":[{"template":"石质墙体（灰）","name":"PT_post_a","position":[-5,0,4],"size":[0.4,2,0.4]},{"template":"石质墙体（灰）","name":"PT_post_b","position":[5,0,4],"size":[0.4,2,0.4]}]}` → `{"name":"Potion_Probe"}`
5. [UI] `scene_import_assets` `{"packs":["Potion_Probe"]}`：把上面的场景包导入并保存（演练时跳过）
6. `scene_list_entities` `{"namePrefix":"PT_"}` → `{"total":0}`
7. `scene_add_currency` `{"name":"PT_coin","icon":100007,"startAmount":0}` → `{"name":"PT_coin","currencyId":1115684865,"backpackTemplateId":1119879169}`
8. `scene_set_spawn` `{"position":[0,0.4,0],"rotation":[0,0,0]}` → `{"pointId":1073741825}`
9. `scene_add_graph` `{"name":"PtStage"}` → `{"graphId":1073741825,"name":"_GSTS_PtStage"}`
10. `scene_add_graph` `{"name":"PtHero","attachToPrefab":"character"}` → `{"graphId":1073741826,"name":"_GSTS_PtHero"}`
11. `scene_add_graph` `{"name":"PtDrink","kind":"item"}` → `{"graphId":1073741827,"name":"_GSTS_PtDrink"}`
12. `scene_add_item` `{"name":"PT_potion","icon":90015,"category":"consumable","description":"喝下去得七枚币","useGraphId":1073741827}` → `{"name":"PT_potion","itemId":1107296257}`
13. `scene_list_prefabs` `{}`
14. 每张节点图各做一遍这五步（上一张 `apply_build` 返回的存档给下一张的 `create_project`）：
   - `create_project` `{"projectId":"stage","targetGraphId":"<scene_add_graph 返回的 graphId>"}`
   - `update_logic` `{projectId, code: <源码，见第二节>}`
   - `build_project` `{projectId}`：返回 buildId 和节点数、编辑器计数
   - `preview_changes` `{projectId, buildId, destination:"copy"}`：返回 expectedSha256
   - `apply_build` `{projectId, buildId, destination:"copy", expectedSha256}`：返回可以试玩的存档
   源码都写好以后，这五步可以换成一次 `write_graphs` `{mapPath, graphs:[{graphId, code}, ...]}`：它对每张图依次做同样的事，返回全部写好的存档。
15. `scene_list_components` `{"prefab":"player"}`
16. `inspect_map` `{}`
17. [UI] `playtest_start` `{"graphNames":["_GSTS_PtStage","_GSTS_PtHero","_GSTS_PtDrink"],"durationSeconds":16,"screenshotsAt":[2,4.5,7,9.5,12,14.5],"inputs":[{"at":3.5,"key":"b"},{"at":6,"click":[0.72,0.355]},{"at":8.5,"clickText":"使用"},{"at":11,"clickText":"确认"}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 3 张，合计 38 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_PtStage（27 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Potion, graph "stage": see examples/potion/gen_potion.py.
g.server({id:1073741825,name:'_GSTS_PtStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'PT_GIVE',false,[1]);
  f.startTimer(evt.eventSourceEntity,'PT_HOLD',true,[2]);
  f.printString('PT_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0])){
    if(evt.timerName==='PT_GIVE'){f.modifyInventoryItemQuantity(hero,1107296257,2n);continue;}
    f.printString('PT_HOLD');
    f.printString(f.dataTypeConversion(f.getInventoryCurrencyQuantity(hero,1115684865),'str'));
    f.printString(f.dataTypeConversion(f.getInventoryItemQuantity(hero,1107296257),'str'));
  }
})
```

### _GSTS_PtHero（4 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Potion, graph "hero": see examples/potion/gen_potion.py.
g.server({id:1073741826,name:'_GSTS_PtHero'})
.on('whenTheQuantityOfInventoryCurrencyChanges',(evt,f)=>{
  f.printString('PT_COIN');f.printString(f.dataTypeConversion(evt.currencyChangeValue,'str'));
})
```

### _GSTS_PtDrink（7 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Potion, graph "drink": see examples/potion/gen_potion.py.
g.server({id:1073741827,name:'_GSTS_PtDrink',type:'item'})
.on('whenItemsInTheInventoryAreUsed',(evt,f)=>{
  // Several can be used at once: seven coins each, to whoever holds the backpack.
  f.modifyInventoryCurrencyQuantity(evt.itemOwnerEntity,1115684865,evt.amountToUse*7n);
})
.on('whenItemIsAddedToInventory',(evt,f)=>{
  // The three events about an item arrive in the item's own graph, not in a graph on the holder. Each is made
  // visible here as an amount of coins of its own: 100 when the item first comes into the backpack,
  f.modifyInventoryCurrencyQuantity(evt.itemOwnerEntity,1115684865,100n);
})
.on('whenTheQuantityOfInventoryItemChanges',(evt,f)=>{
  // 1000 whenever its number changes.
  f.modifyInventoryCurrencyQuantity(evt.itemOwnerEntity,1115684865,1000n);
})
```
