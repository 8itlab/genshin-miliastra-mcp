# 样例 doors：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

One piece that opens, closes and opens again. A wall piece is a prefab with two motion devices, open (4 m up in a second) and close (4 m down). Its own graph starts them in turn 3, 6, 9 and 12 seconds after it appears and prints how high the piece stands before each start (DR_STEP n y) and once more at 15. If a motion can be started again after it has run, the heights read 0, 4, 0, 4, 0 and the screenshots show the gate up at play seconds 3.5 and 9.5 and down at 6.5 and 12.5 (the level clock runs five or six seconds ahead of the play).

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":16}`
3. [UI] `editor_open_map` `{mapPath}`：在编辑器里打开底图的副本（演练时跳过）
4. `scene_build_blocks` `{"name":"Doors_Check","blocks":[{"template":20002056,"name":"DR_floor_0","position":[-6,-0.2,0]},{"template":20002056,"name":"DR_floor_1","position":[4,-0.2,0]}]}` → `{"name":"Doors_Check"}`
5. [UI] `scene_import_assets` `{"packs":["Doors_Check"]}`：把上面的场景包导入并保存（演练时跳过）
6. `scene_list_entities` `{"namePrefix":"DR_"}` → `{"total":0}`
7. `scene_add_prefab` `{"asset":20002067,"name":"DR_gate","scale":1}` → `{"name":"DR_gate","prefabId":1077936129}`
8. `scene_add_graph` `{"name":"DrStage"}` → `{"graphId":1073741825,"name":"_GSTS_DrStage"}`
9. `scene_add_graph` `{"name":"DrGate","attachToPrefab":"DR_gate"}` → `{"graphId":1073741826,"name":"_GSTS_DrGate"}`
10. `scene_add_components` `{"prefab":"DR_gate","motions":[{"name":"open","move":[0,4,0],"seconds":1},{"name":"close","move":[0,-4,0],"seconds":1}]}`
11. `scene_list_prefabs` `{}`
12. 每张节点图各做一遍这五步（上一张 `apply_build` 返回的存档给下一张的 `create_project`）：
   - `create_project` `{"projectId":"stage","targetGraphId":"<scene_add_graph 返回的 graphId>"}`
   - `update_logic` `{projectId, code: <源码，见第二节>}`
   - `build_project` `{projectId}`：返回 buildId 和节点数、编辑器计数
   - `preview_changes` `{projectId, buildId, destination:"copy"}`：返回 expectedSha256
   - `apply_build` `{projectId, buildId, destination:"copy", expectedSha256}`：返回可以试玩的存档
   源码都写好以后，这五步可以换成一次 `write_graphs` `{mapPath, graphs:[{graphId, code}, ...]}`：它对每张图依次做同样的事，返回全部写好的存档。
13. `scene_list_components` `{"prefab":"DR_gate"}`
14. `inspect_map` `{}`
15. [UI] `playtest_start` `{"graphNames":["_GSTS_DrStage","_GSTS_DrGate"],"durationSeconds":14,"screenshotsAt":[1,3.5,6.5,9.5,12.5],"inputs":[]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 2 张，合计 42 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_DrStage（14 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Doors, graph "stage": see examples/doors/gen_doors.py.
g.server({id:1073741825,name:'_GSTS_DrStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'DR_START',false,[2]);
  f.printString('DR_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='DR_START')return;
  f.createPrefab(1077936129,[5,0,0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
  f.printString('DR_GATE');
})
```

### _GSTS_DrGate（28 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Doors, graph "gate": see examples/doors/gen_doors.py.
g.server({id:1073741826,name:'_GSTS_DrGate'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'DR_STEP',false,[3,6,9,12,15]);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='DR_STEP')return;
  const at=f.split3dVector(f.getEntityLocationAndRotation(evt.eventSourceEntity).location);
  f.printString('DR_STEP');f.printString(f.dataTypeConversion(evt.timerSequenceId,'str'));f.printString(f.dataTypeConversion(at.yComponent,'str'));
  if(evt.timerSequenceId===0n)f.activateBasicMotionDevice(evt.eventSourceEntity,'open');
  if(evt.timerSequenceId===1n)f.activateBasicMotionDevice(evt.eventSourceEntity,'close');
  if(evt.timerSequenceId===2n)f.activateBasicMotionDevice(evt.eventSourceEntity,'open');
  if(evt.timerSequenceId===3n)f.activateBasicMotionDevice(evt.eventSourceEntity,'close');
})
```
