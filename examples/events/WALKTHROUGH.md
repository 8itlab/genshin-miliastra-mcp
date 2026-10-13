# 样例 events：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

The platform's own way of building, checked end to end on a blank map: five coins are a prefab with a collision trigger and their own graph (walk in: the player's custom variable score goes up, the coin destroys itself); the stall is a prefab with an option tab and its own graph (choose 付一枚币: one coin is taken); the player template holds the variable score and a graph that hears it change; the stage entity only sets the scene and hears things being destroyed. A bar at the top of the screen follows score (the purse). Nothing polls positions. Expect EV_READY, EV_GO, EV_COIN x5, EV_SCORE after each change, EV_GONE x5 on the stage graph, then EV_TAB 1 and EV_PAID at the stall.

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":12}`
3. [UI] `editor_open_map` `{mapPath}`：在编辑器里打开底图的副本（演练时跳过）
4. `scene_build_blocks` `{"name":"Events_Demo","blocks":[{"template":20002056,"name":"EV_floor_-1","position":[-4,-0.2,0]},{"template":20002056,"name":"EV_floor_0","position":[0,-0.2,0]},{"template":20002056,"name":"EV_floor_1","position":[4,-0.2,0]},"… 6 more pieces of the same form"]}` → `{"name":"Events_Demo"}`
5. [UI] `scene_import_assets` `{"packs":["Events_Demo"]}`：把上面的场景包导入并保存（演练时跳过）
6. `scene_list_entities` `{"namePrefix":"EV_"}` → `{"total":0}`
7. `scene_add_prefab` `{"asset":10005009,"name":"EV_coin","scale":1}` → `{"name":"EV_coin","prefabId":1077936129}`
8. `scene_add_prefab` `{"asset":20001125,"name":"EV_stall","scale":1}` → `{"name":"EV_stall","prefabId":1077936130}`
9. `scene_set_faction_hostility` `{"hostilePairs":[[1,3]]}`
10. `scene_add_graph` `{"name":"EvStage"}` → `{"graphId":1073741825,"name":"_GSTS_EvStage"}`
11. `scene_add_graph` `{"name":"EvCoin","attachToPrefab":"EV_coin"}` → `{"graphId":1073741826,"name":"_GSTS_EvCoin"}`
12. `scene_add_graph` `{"name":"EvStall","attachToPrefab":"EV_stall"}` → `{"graphId":1073741827,"name":"_GSTS_EvStall"}`
13. `scene_add_graph` `{"name":"EvPlayer","attachToPrefab":"player"}` → `{"graphId":1073741828,"name":"_GSTS_EvPlayer"}`
14. `scene_add_components` `{"prefab":"EV_coin","collisionTriggers":[{"areas":[{"size":[2,2,2]}],"targets":["character"]}],"solid":false}`
15. `scene_add_components` `{"prefab":"EV_stall","optionTab":{"areas":[{"size":[6,4,6]}],"options":[{"text":"付一枚币"},{"text":"看看"}]}}`
16. `scene_add_components` `{"prefab":"player","variables":[{"name":"score","type":"integer","value":0}]}`
17. `scene_add_progress_bar` `{"name":"purse","variable":"score","max":5,"position":[0,380],"size":[260,40]}` → `{"name":"purse","controlId":1073741847}`
18. `scene_list_prefabs` `{}`
19. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, …]}`：把每张图的源码编译并写进存档，返回可以试玩的存档。
20. `scene_list_components` `{"prefab":"EV_coin"}`
21. `inspect_map` `{}`
22. [UI] `playtest_start` `{"graphNames":["_GSTS_EvStage","_GSTS_EvCoin","_GSTS_EvStall","_GSTS_EvPlayer"],"durationSeconds":34,"screenshotsAt":[5,8,10,12,15,17,20,24,28],"inputs":[{"at":7,"key":"d","holdMs":4300},{"at":14,"key":"f"},{"at":19,"key":"f"}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 4 张，合计 76 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_EvStage（36 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Events demo, graph "stage": see examples/events/gen_events.py.
g.server({id:1073741825,name:'_GSTS_EvStage',variables:{gone:0n}})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'EV_START',false,[2]);
  f.printString('EV_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='EV_START')return;
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  f.teleportPlayer(players[0],[0,0.4,0],[0,0,0]);
  for(const i of [1n,2n,3n,4n,5n])f.createPrefab(1077936129,f.create3dVector(Number(i)*3+1,0.8,0),[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
  f.createPrefab(1077936130,[22,0,0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
  f.printString('EV_GO');
})
.on('whenEntityIsDestroyed',(evt,f)=>{
  f.set('gone',f.get('gone')+1n);
  f.printString('EV_GONE');
})
```

### _GSTS_EvCoin（9 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Events demo, graph "coin": see examples/events/gen_events.py.
g.server({id:1073741826,name:'_GSTS_EvCoin'})
.on('whenEnteringCollisionTrigger',(evt,f)=>{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.enteringEntity as any);
  const score=f.getCustomVariable(player,'score').asType('int');
  f.setCustomVariable(player,'score',score+1n,true);
  f.printString('EV_COIN');
  f.destroyEntity(evt.triggerEntity);
})
```

### _GSTS_EvStall（22 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Events demo, graph "stall": see examples/events/gen_events.py.
g.server({id:1073741827,name:'_GSTS_EvStall'})
.on('whenTabIsSelected',(evt,f)=>{
  f.printString('EV_TAB');
  f.printString(f.dataTypeConversion(evt.tabId,'str'));
  if(evt.tabId!==1n)return;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const score=f.getCustomVariable(player,'score').asType('int');
  if(score<1n){f.printString('EV_POOR');return;}
  f.setCustomVariable(player,'score',score-1n,true);
  f.printString('EV_PAID');
})
```

### _GSTS_EvPlayer（9 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Events demo, graph "player": see examples/events/gen_events.py.
g.server({id:1073741828,name:'_GSTS_EvPlayer'})
.on('whenCustomVariableChanges',(evt,f)=>{
  if(evt.variableName!=='score')return;
  // The event is typed: it fires only for variables of the type its values are read as, here an integer.
  f.printString('EV_SCORE');
  f.printString(f.dataTypeConversion(evt.postChangeValue.asType('int'),'str'));
})
```
