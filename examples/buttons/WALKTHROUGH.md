# 样例 buttons：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

Interaction buttons on the screen (scene_add_button): two buttons at the lower right with the keys 1 and 2, a graph on the player template that hears whenUiControlGroupIsTriggered, a progress bar that counts the presses. The script presses 1, 2, 1, 1: the bar ends at four of five. Played as written on 2026-10-11 (a first run showed that mouse clicks do not reach the buttons during play: the cursor belongs to the camera). Prints: BT_READY, BT_PRESS index compositeIndex (both are the control id scene_add_button returned).

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":8,"yawRange":[0,0]}`
3. [UI] `editor_open_map` `{mapPath}`：在编辑器里打开底图的副本（演练时跳过）
4. `scene_build_blocks` `{"name":"Buttons_Probe","blocks":[{"template":"石质墙体（灰）","name":"BT_post_a","position":[-5,0,4],"size":[0.4,2,0.4]},{"template":"石质墙体（灰）","name":"BT_post_b","position":[5,0,4],"size":[0.4,2,0.4]}]}` → `{"name":"Buttons_Probe"}`
5. [UI] `scene_import_assets` `{"packs":["Buttons_Probe"]}`：把上面的场景包导入并保存（演练时跳过）
6. `scene_list_entities` `{"namePrefix":"BT_"}` → `{"total":0}`
7. `scene_set_spawn` `{"position":[0,0.4,0],"rotation":[0,0,0]}` → `{"pointId":1073741825}`
8. `scene_add_graph` `{"name":"BtStage"}` → `{"graphId":1073741825,"name":"_GSTS_BtStage"}`
9. `scene_add_graph` `{"name":"BtPlayer","attachToPrefab":"player"}` → `{"graphId":1073741826,"name":"_GSTS_BtPlayer"}`
10. `scene_add_components` `{"prefab":"player","variables":[{"name":"score","type":"integer","value":0}]}`
11. `scene_add_progress_bar` `{"name":"BT_score","variable":"score","max":5,"position":[0,330],"size":[260,40]}` → `{"name":"BT_score","controlId":1073741847}`
12. `scene_add_button` `{"name":"BT_one","position":[450,-250]}` → `{"name":"BT_one","controlId":1073741850,"controlGroupIndex":1073741850}`
13. `scene_add_button` `{"name":"BT_two","position":[620,-250],"key":2}` → `{"name":"BT_two","controlId":1073741853,"controlGroupIndex":1073741853}`
14. `scene_list_prefabs` `{}`
15. 每张节点图各做一遍这五步（上一张 `apply_build` 返回的存档给下一张的 `create_project`）：
   - `create_project` `{"projectId":"stage","targetGraphId":"<scene_add_graph 返回的 graphId>"}`
   - `update_logic` `{projectId, code: <源码，见第二节>}`
   - `build_project` `{projectId}`：返回 buildId 和节点数、编辑器计数
   - `preview_changes` `{projectId, buildId, destination:"copy"}`：返回 expectedSha256
   - `apply_build` `{projectId, buildId, destination:"copy", expectedSha256}`：返回可以试玩的存档
   源码都写好以后，这五步可以换成一次 `write_graphs` `{mapPath, graphs:[{graphId, code}, ...]}`：它对每张图依次做同样的事，返回全部写好的存档。
16. `scene_list_components` `{"prefab":"player"}`
17. `inspect_map` `{}`
18. [UI] `playtest_start` `{"graphNames":["_GSTS_BtStage","_GSTS_BtPlayer"],"durationSeconds":14,"screenshotsAt":[2,4.5,7,9.5,12.5],"inputs":[{"at":3.5,"key":"1"},{"at":6,"key":"2"},{"at":8.5,"key":"1"},{"at":10.5,"key":"1"}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 2 张，合计 13 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_BtStage（2 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Buttons, graph "stage": see examples/buttons/gen_buttons.py.
g.server({id:1073741825,name:'_GSTS_BtStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.printString('BT_READY');
})
```

### _GSTS_BtPlayer（11 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Buttons, graph "player": see examples/buttons/gen_buttons.py.
g.server({id:1073741826,name:'_GSTS_BtPlayer'})
.on('whenUiControlGroupIsTriggered',(evt,f)=>{
  f.printString('BT_PRESS');f.printString(f.dataTypeConversion(evt.uiControlGroupIndex,'str'));f.printString(f.dataTypeConversion(evt.uiControlGroupCompositeIndex,'str'));
  const player=evt.eventSourceEntity;
  f.setCustomVariable(player,'score',f.getCustomVariable(player,'score').asType('int')+1n,true);
})
```
