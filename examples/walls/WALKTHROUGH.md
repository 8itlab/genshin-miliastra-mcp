# 样例 walls：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

What stops a character, and a pad that flings one. Four walls of building blocks stand across a lane at x = 5, 9, 13 and 17, 1.3, 1.6, 2.0 and 2.4 m high, and a fifth of 3 m at x = 25 whose model the stage graph switches off (f.activateDisableModelDisplay): an invisible wall. The class may neither jump nor climb. The player walks into the first wall from second 3 (measured 2026-10-12: it stops at x = 4.6, in front of the 1.3 m wall, for as long as the key is held); at 7 it is put at x = 21 and walks on: it stops at x = 24.65 with nothing to be seen there. At 12 it is put at x = -13 and walks over a flat pad at x = -8 that flings 14 m/s straight up (launcher). Expect WL_GO, and read playerTrack.

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":16}`
3. [UI] `editor_open_map` `{mapPath}`：在编辑器里打开底图的副本（演练时跳过）
4. `scene_build_blocks` `{"name":"Walls_Check","blocks":[{"template":20002056,"name":"WL_floor_m12","position":[-12,-0.2,0]},{"template":20002056,"name":"WL_floor_m8","position":[-8,-0.2,0]},{"template":20002056,"name":"WL_floor_0","position":[-4,-0.2,0]},"… 13 more pieces of the same form"]}` → `{"name":"Walls_Check"}`
5. [UI] `scene_import_assets` `{"packs":["Walls_Check"]}`：把上面的场景包导入并保存（演练时跳过）
6. `scene_list_entities` `{"namePrefix":"WL_"}` → `{"total":0}`
7. `scene_add_prefab` `{"asset":20002056,"name":"WL_pad","scale":[0.2,0.4,0.2]}` → `{"name":"WL_pad","prefabId":1077936129}`
8. `scene_set_class` `{"allowJump":false,"allowClimb":false}`
9. `scene_add_graph` `{"name":"WlStage"}` → `{"graphId":1073741825,"name":"_GSTS_WlStage"}`
10. `scene_add_components` `{"prefab":"WL_pad","launcher":{"areas":[{"radius":1.2,"offset":[0,0.5,0]}],"speed":14}}`
11. `scene_list_prefabs` `{}`
12. 每张节点图各做一遍这五步（上一张 `apply_build` 返回的存档给下一张的 `create_project`）：
   - `create_project` `{"projectId":"stage","targetGraphId":"<scene_add_graph 返回的 graphId>"}`
   - `update_logic` `{projectId, code: <源码，见第二节>}`
   - `build_project` `{projectId}`：返回 buildId 和节点数、编辑器计数
   - `preview_changes` `{projectId, buildId, destination:"copy"}`：返回 expectedSha256
   - `apply_build` `{projectId, buildId, destination:"copy", expectedSha256}`：返回可以试玩的存档
   源码都写好以后，这五步可以换成一次 `write_graphs` `{mapPath, graphs:[{graphId, code}, ...]}`：它对每张图依次做同样的事，返回全部写好的存档。
13. `scene_list_components` `{"prefab":"WL_pad"}`
14. `inspect_map` `{}`
15. [UI] `playtest_start` `{"graphNames":["_GSTS_WlStage"],"durationSeconds":19,"screenshotsAt":[2.5,5,10,10.5,13.6,14,14.4,14.8,15.5,17],"inputs":[{"at":3,"key":"d","holdMs":3000},{"at":7,"teleport":[21,0.4,0]},{"at":8,"key":"d","holdMs":2500},{"at":12,"teleport":[-13,0.4,0]},{"at":13,"key":"d","holdMs":1300}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 1 张，合计 24 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_WlStage（24 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { guid } from 'genshin-ts/runtime/value'

// Walls, the stage graph: see examples/walls/gen_walls.py.
g.server({id:1073741825,name:'_GSTS_WlStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'WL_START',false,[2]);
  f.printString('WL_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='WL_START')return;
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  f.teleportPlayer(players[0],[0,0.4,0],[0,0,0]);
  f.activateDisableModelDisplay(f.queryEntityByGuid(new guid(1078000000)),false);
  f.createPrefab(1077936129,[-8,0,0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
  f.printString('WL_GO');
})
```
