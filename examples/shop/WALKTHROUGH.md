# 样例 shop：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

The platform's own shop on a stall, the whole resource loop without a graph doing the trade: scene_add_currency, scene_add_item (twice) and scene_add_shop; F at the stall opens the shop screen (the stall's graph calls f.openShop). The stall has four apples at five coins and one pear at eight, and buys apples for three; the character starts with twelve coins and two apples. The script clicks the apple on the shelf and 购买 (coins 12 to 7, apples 2 to 3, SH_SOLD 1), closes the 获得 notice, then 批量出售, the apple in the backpack and 出售 (coins 7 to 10, apples 3 to 2, SH_BOUGHT). Played as written on 2026-10-11. Prints: SH_READY, SH_HOLD coins apples pears (every three seconds), SH_OPEN, SH_COIN change, SH_ITEM amount, SH_SOLD n, SH_BOUGHT.

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":8,"yawRange":[0,0]}`
3. [UI] `editor_open_map` `{mapPath}`：在编辑器里打开底图的副本（演练时跳过）
4. `scene_build_blocks` `{"name":"Shop_Probe","blocks":[{"template":"石质墙体（灰）","name":"SH_post_a","position":[-5,0,4],"size":[0.4,2,0.4]},{"template":"石质墙体（灰）","name":"SH_post_b","position":[5,0,4],"size":[0.4,2,0.4]}]}` → `{"name":"Shop_Probe"}`
5. [UI] `scene_import_assets` `{"packs":["Shop_Probe"]}`：把上面的场景包导入并保存（演练时跳过）
6. `scene_list_entities` `{"namePrefix":"SH_"}` → `{"total":0}`
7. `scene_add_prefab` `{"asset":20001809,"name":"SH_stall","scale":1}` → `{"name":"SH_stall","prefabId":1077936129}`
8. `scene_add_currency` `{"name":"SH_coin","icon":100007,"startAmount":12}` → `{"name":"SH_coin","currencyId":1115684865,"backpackTemplateId":1119879169}`
9. `scene_set_spawn` `{"position":[0,0.4,0],"rotation":[0,0,0]}` → `{"pointId":1073741825}`
10. `scene_set_class` `{"allowClimb":false}`
11. `scene_add_graph` `{"name":"ShStage"}` → `{"graphId":1073741825,"name":"_GSTS_ShStage"}`
12. `scene_add_graph` `{"name":"ShStall","attachToPrefab":"SH_stall"}` → `{"graphId":1073741826,"name":"_GSTS_ShStall"}`
13. `scene_add_graph` `{"name":"ShHero","attachToPrefab":"character"}` → `{"graphId":1073741827,"name":"_GSTS_ShHero"}`
14. `scene_add_item` `{"name":"SH_apple","icon":90001,"value":{"currency":"SH_coin","amount":5}}` → `{"name":"SH_apple","itemId":1107296257}`
15. `scene_add_item` `{"name":"SH_pear","icon":90015,"value":{"currency":"SH_coin","amount":8}}` → `{"name":"SH_pear","itemId":1107296258}`
16. `scene_add_shop` `{"name":"SH_fruit","prefab":"SH_stall","sell":[{"item":"SH_apple","currency":"SH_coin","price":5,"stock":4},{"item":"SH_pear","currency":"SH_coin","price":8}],"buy":[{"item":"SH_apple","currency":"SH_coin","price":3}]}` → `{"name":"SH_fruit","shopTemplateId":1136656385}`
17. `scene_add_components` `{"prefab":"SH_stall","optionTab":{"areas":[{"size":[8,4,8]}],"options":[{"text":"开店","icon":20}]}}`
18. `scene_list_prefabs` `{}`
19. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, …]}`：把每张图的源码编译并写进存档，返回可以试玩的存档。
20. `scene_list_components` `{"prefab":"SH_stall"}`
21. `inspect_map` `{}`
22. [UI] `playtest_start` `{"graphNames":["_GSTS_ShStage","_GSTS_ShStall","_GSTS_ShHero"],"durationSeconds":28,"screenshotsAt":[4.5,7.5,10,12,14.2,16.5,19.5,22.5,25.5],"inputs":[{"at":3,"key":"f"},{"at":6,"click":[0.198,0.26]},{"at":9,"clickText":"购买"},{"at":11,"click":[0.5,0.92]},{"at":13,"clickText":"批量出售"},{"at":15.5,"click":[0.567,0.333]},{"at":18.5,"click":[0.91,0.953]},{"at":21,"clickText":"确认"},{"at":24,"click":[0.5,0.92]}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 3 张，合计 51 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_ShStage（33 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Shop, graph "stage": see examples/shop/gen_shop.py.
g.server({id:1073741825,name:'_GSTS_ShStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'SH_HOLD',true,[3]);
  f.startTimer(evt.eventSourceEntity,'SH_GIFT',false,[1]);
  // The stall stands three and a half metres behind the start.
  f.createPrefab(1077936129,[0,0,3.5],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
  f.printString('SH_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0])){
    // The character starts with two apples, so that there is something to sell to the shop.
    if(evt.timerName==='SH_GIFT'){f.modifyInventoryItemQuantity(hero,1107296257,2n);continue;}
    f.printString('SH_HOLD');
    f.printString(f.dataTypeConversion(f.getInventoryCurrencyQuantity(hero,1115684865),'str'));
    f.printString(f.dataTypeConversion(f.getInventoryItemQuantity(hero,1107296257),'str'));
    f.printString(f.dataTypeConversion(f.getInventoryItemQuantity(hero,1107296258),'str'));
  }
})
```

### _GSTS_ShStall（10 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Shop, graph "stall": see examples/shop/gen_shop.py.
g.server({id:1073741826,name:'_GSTS_ShStall'})
.on('whenTabIsSelected',(evt,f)=>{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  f.openShop(player,evt.eventSourceEntity,1n);
  f.printString('SH_OPEN');
})
.on('whenCustomShopItemIsSold',(evt,f)=>{
  // The shop sold something from its list to the player.
  f.printString('SH_SOLD');f.printString(f.dataTypeConversion(evt.purchaseQuantity,'str'));
})
.on('whenSellingItemsToTheShop',(evt,f)=>{
  // The player sold something to the shop.
  f.printString('SH_BOUGHT');
})
```

### _GSTS_ShHero（8 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Shop, graph "hero": see examples/shop/gen_shop.py.
g.server({id:1073741827,name:'_GSTS_ShHero'})
.on('whenTheQuantityOfInventoryItemChanges',(evt,f)=>{
  f.printString('SH_ITEM');f.printString(f.dataTypeConversion(evt.postChangeQuantity,'str'));
})
.on('whenTheQuantityOfInventoryCurrencyChanges',(evt,f)=>{
  f.printString('SH_COIN');f.printString(f.dataTypeConversion(evt.currencyChangeValue,'str'));
})
```
