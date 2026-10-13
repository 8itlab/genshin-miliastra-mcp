# 样例 drops：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

Drops and loot: scene_add_prefab {drop} makes the thing that lies on the ground and gives an item when picked up with F; scene_add_components {loot} makes a chest leave such a drop behind when it is destroyed, holding the items the loot lists. The stage puts the character 0.6 m beside the apple on the right (F: one apple), destroys the chest on the left, puts the character beside what it left (F: two more). Played as written on 2026-10-11: the apples held go 0, 1, 3. Prints: DR_READY, DR_HOLD apples x (every two seconds), DR_BROKEN; the graphs on the character and on the player also listen for the item events (DR_ITEM, DR_ADDED, DR_P_ITEM, DR_P_ADDED), which never arrive there: those events go to the item's own item graph (see examples/potion).

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":9,"yawRange":[0,0]}`
3. [UI] `editor_open_map` `{mapPath}`：在编辑器里打开底图的副本（演练时跳过）
4. `scene_build_blocks` `{"name":"Drops_Probe","blocks":[{"template":"石质墙体（灰）","name":"DR_post_a","position":[-8,0,4],"size":[0.4,2,0.4]},{"template":"石质墙体（灰）","name":"DR_post_b","position":[8,0,4],"size":[0.4,2,0.4]}]}` → `{"name":"Drops_Probe"}`
5. [UI] `scene_import_assets` `{"packs":["Drops_Probe"]}`：把上面的场景包导入并保存（演练时跳过）
6. `scene_list_entities` `{"namePrefix":"DR_"}` → `{"total":0}`
7. `scene_add_prefab` `{"asset":10005008,"name":"DR_chest","scale":1.5}` → `{"name":"DR_chest","prefabId":1077936129}`
8. `scene_add_currency` `{"name":"DR_coin","startAmount":0}` → `{"name":"DR_coin","currencyId":1115684865,"backpackTemplateId":1119879169}`
9. `scene_set_spawn` `{"position":[0,0.4,0],"rotation":[0,0,0]}` → `{"pointId":1073741825}`
10. `scene_set_class` `{"allowClimb":false}`
11. `scene_add_graph` `{"name":"DrStage"}` → `{"graphId":1073741825,"name":"_GSTS_DrStage"}`
12. `scene_add_graph` `{"name":"DrHero","attachToPrefab":"character"}` → `{"graphId":1073741826,"name":"_GSTS_DrHero"}`
13. `scene_add_graph` `{"name":"DrPlayer","attachToPrefab":"player"}` → `{"graphId":1073741827,"name":"_GSTS_DrPlayer"}`
14. `scene_add_item` `{"name":"DR_apple","icon":90001}` → `{"name":"DR_apple","itemId":1107296257}`
15. `scene_add_prefab` `{"asset":20001554,"name":"DR_fallen","drop":{"item":"DR_apple","amount":1}}` → `{"name":"DR_fallen","prefabId":1077936130}`
16. `scene_add_components` `{"prefab":"DR_chest","loot":{"dropPrefab":"DR_fallen","items":[{"item":"DR_apple","amount":2}]}}`
17. `scene_list_prefabs` `{}`
18. 每张节点图各做一遍这五步（上一张 `apply_build` 返回的存档给下一张的 `create_project`）：
   - `create_project` `{"projectId":"stage","targetGraphId":"<scene_add_graph 返回的 graphId>"}`
   - `update_logic` `{projectId, code: <源码，见第二节>}`
   - `build_project` `{projectId}`：返回 buildId 和节点数、编辑器计数
   - `preview_changes` `{projectId, buildId, destination:"copy"}`：返回 expectedSha256
   - `apply_build` `{projectId, buildId, destination:"copy", expectedSha256}`：返回可以试玩的存档
   源码都写好以后，这五步可以换成一次 `write_graphs` `{mapPath, graphs:[{graphId, code}, ...]}`：它对每张图依次做同样的事，返回全部写好的存档。
19. `scene_list_components` `{"prefab":"DR_chest"}`
20. `inspect_map` `{}`
21. [UI] `playtest_start` `{"graphNames":["_GSTS_DrStage","_GSTS_DrHero","_GSTS_DrPlayer"],"durationSeconds":17,"screenshotsAt":[1,3.5,5.5,8,10.8,13,15],"inputs":[{"at":4.5,"key":"f"},{"at":12,"key":"f"}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 3 张，合计 67 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_DrStage（51 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Drops, graph "stage": see examples/drops/gen_drops.py.
g.server({id:1073741825,name:'_GSTS_DrStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  const stage=evt.eventSourceEntity;
  f.createPrefab(1077936130,[4,0.3,0],[0,0,0],stage,false,1,[] as bigint[]);
  f.createPrefab(1077936129,[-4,0,0],[0,0,0],stage,false,1,[] as bigint[]);
  f.startTimer(stage,'DR_BREAK',false,[9]);
  f.startTimer(stage,'DR_NEAR',false,[7,14]);
  f.startTimer(stage,'DR_HOLD',true,[2]);
  f.printString('DR_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName==='DR_BREAK'){
    for(const chest of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936129))f.destroyEntity(chest);
    f.printString('DR_BROKEN');
    return;
  }
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  // The character is put 0.6 m beside each drop. Walking for a set time ended anywhere within a metre of the mark, and
  // the prompt to pick up showed at 0.6 to 0.7 m, not at 1.06 m and not at 0.04 or 0.27 m (standing on the drop).
  if(evt.timerName==='DR_NEAR'){
    if(evt.timerSequenceId===0n)f.teleportPlayer(players[0],[3.4,0.4,0],[0,0,0]);
    else f.teleportPlayer(players[0],[-3.4,0.4,0],[0,0,0]);
    return;
  }
  for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0])){
    f.printString('DR_HOLD');f.printString(f.dataTypeConversion(f.getInventoryItemQuantity(hero,1107296257),'str'));
    f.printString(f.dataTypeConversion(f.split3dVector(f.getEntityLocationAndRotation(hero).location).xComponent,'str'));
  }
})
```

### _GSTS_DrHero（8 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Drops, graph "hero": see examples/drops/gen_drops.py.
g.server({id:1073741826,name:'_GSTS_DrHero'})
.on('whenTheQuantityOfInventoryItemChanges',(evt,f)=>{
  f.printString('DR_ITEM');f.printString(f.dataTypeConversion(evt.postChangeQuantity,'str'));
})
.on('whenItemIsAddedToInventory',(evt,f)=>{
  f.printString('DR_ADDED');f.printString(f.dataTypeConversion(evt.quantityObtained,'str'));
})
```

### _GSTS_DrPlayer（8 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Drops, graph "player": see examples/drops/gen_drops.py.
g.server({id:1073741827,name:'_GSTS_DrPlayer'})
.on('whenTheQuantityOfInventoryItemChanges',(evt,f)=>{
  f.printString('DR_P_ITEM');f.printString(f.dataTypeConversion(evt.postChangeQuantity,'str'));
})
.on('whenItemIsAddedToInventory',(evt,f)=>{
  f.printString('DR_P_ADDED');f.printString(f.dataTypeConversion(evt.quantityObtained,'str'));
})
```
