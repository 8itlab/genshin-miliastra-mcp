# 样例 paimon：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

Paimon made of 39 white-box shapes (examples/paimon/gen_paimon_parts.py, written by scene_add_shape_prefab as decorations of one prefab). At level second 6 the stage creates her ahead of the player and a little to the right, turned to face the player, and her text bubble talks; four seconds later she flies to the character and stays 1.2 m to its right and 0.5 m ahead (follow motion device, position only, world offset), facing the camera, while the player walks forward and then left. Prints PM_HELLO, PM_FOLLOW. The level clock runs about four seconds ahead of the play seconds of the screenshots. What to look at: her face and colours against scene_preview_shapes, and her staying beside the character as it walks.

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":5}`
3. [UI] `scene_import_assets` `{"packs":[]}`：把上面的场景包导入并保存（演练时跳过）
4. `scene_list_entities` `{"namePrefix":"PM_"}` → `{"total":0}`
5. `scene_add_shape_prefab` `{"name":"PM_paimon","parts":[{"shape":"球体","position":[0,1.3,0],"size":[0.62,0.6,0.58],"color":"#F2D2C0","solid":false,"name":"头"},{"shape":"球体","position":[-0.115,1.29,0.265],"size":[0.1,0.14,0.05],"color":"#2B3F99","solid":false,"name":"左眼"},{"shape":"球体","position":[0.115,1.29,0.265],"size":[0.1,0.14,0.05],"color":"#2B3F99","solid":false,"name":"右眼"},{"shape":"球体","position":[-0.1,1.32,0.29],"size":[0.035,0.035,0.02],"color":"#DCDFE7","solid":false,"name":"左眼高光"},{"shape":"球体","position":[0.13,1.32,0.29],"size":[0.035,0.035,0.02],"color":"#DCDFE7","solid":false,"name":"右眼高光"},{"shape":"球体","position":[-0.19,1.2,0.23],"size":[0.08,0.04,0.03],"color":"#F6B3B8","solid":false,"name":"左腮红"},{"shape":"球体","position":[0.19,1.2,0.23],"size":[0.08,0.04,0.03],"color":"#F6B3B8","solid":false,"name":"右腮红"},{"shape":"球体","position":[0,1.17,0.28],"size":[0.05,0.025,0.02],"color":"#C8566B","solid":false,"name":"嘴"},{"shape":"球体","position":[0,1.36,-0.05],"size":[0.68,0.66,0.6],"color":"#B8BFCF","solid":false,"name":"后脑头发"},{"shape":"球体","position":[0,1.52,0.06],"size":[0.62,0.3,0.5],"color":"#B8BFCF","solid":false,"name":"头顶头发"},{"shape":"圆锥","position":[-0.18,1.47,0.24],"size":[0.16,0.2,0.08],"color":"#B8BFCF","solid":false,"rotation":[180,0,-12],"name":"刘海1"},{"shape":"圆锥","position":[-0.06,1.47,0.24],"size":[0.16,0.2,0.08],"color":"#B8BFCF","solid":false,"rotation":[180,0,-4],"name":"刘海2"},{"shape":"圆锥","position":[0.06,1.47,0.24],"size":[0.16,0.2,0.08],"color":"#B8BFCF","solid":false,"rotation":[180,0,4],"name":"刘海3"},{"shape":"圆锥","position":[0.18,1.47,0.24],"size":[0.16,0.2,0.08],"color":"#B8BFCF","solid":false,"rotation":[180,0,12],"name":"刘海4"},{"shape":"圆锥","position":[-0.3,1.05,0.1],"size":[0.14,0.55,0.12],"color":"#B8BFCF","solid":false,"rotation":[180,0,-6],"name":"左鬓发"},{"shape":"圆锥","position":[0.3,1.05,0.1],"size":[0.14,0.55,0.12],"color":"#B8BFCF","solid":false,"rotation":[180,0,6],"name":"右鬓发"},{"shape":"圆柱","position":[0.04,1.66,0.02],"size":[0.22,0.06,0.2],"color":"#2E2550","solid":false,"rotation":[0,0,-12],"name":"发冠底座"},{"shape":"三棱锥","position":[-0.02,1.745,0.02],"size":[0.07,0.13,0.06],"color":"#2E2550","solid":false,"rotation":[0,0,-12],"name":"发冠尖1"},{"shape":"三棱锥","position":[0.06,1.785,0.02],"size":[0.07,0.17,0.06],"color":"#2E2550","solid":false,"rotation":[0,0,-12],"name":"发冠尖2"},{"shape":"三棱锥","position":[0.14,1.745,0.02],"size":[0.07,0.13,0.06],"color":"#2E2550","solid":false,"rotation":[0,0,-12],"name":"发冠尖3"},{"shape":"球体","position":[0.045,1.67,0.12],"size":[0.05,0.05,0.03],"color":"#E9B949","solid":false,"name":"发冠宝石"},{"shape":"圆柱","position":[0,0.98,0],"size":[0.26,0.22,0.22],"color":"#DCDFE7","solid":false,"name":"上身"},{"shape":"圆锥","position":[0,0.82,0],"size":[0.46,0.32,0.4],"color":"#DCDFE7","solid":false,"name":"裙子"},{"shape":"圆柱","position":[0,1.07,0.02],"size":[0.27,0.04,0.23],"color":"#E9B949","solid":false,"name":"领口金边"},{"shape":"长方体","position":[0,0.8,-0.19],"size":[0.64,0.78,0.04],"color":"#1F2B5E","solid":false,"rotation":[-14,0,0],"name":"斗篷"},{"shape":"长方体","position":[0,0.81,-0.165],"size":[0.58,0.72,0.02],"color":"#5B4BA6","solid":false,"rotation":[-14,0,0],"name":"斗篷内衬"},{"shape":"球体","position":[-0.15,0.95,-0.141],"size":[0.03,0.03,0.01],"color":"#F5E9A8","solid":false,"rotation":[-14,0,0],"name":"斗篷星1"},{"shape":"球体","position":[0.12,0.78,-0.151],"size":[0.03,0.03,0.01],"color":"#F5E9A8","solid":false,"rotation":[-14,0,0],"name":"斗篷星2"},{"shape":"球体","position":[-0.05,0.62,-0.161],"size":[0.03,0.03,0.01],"color":"#F5E9A8","solid":false,"rotation":[-14,0,0],"name":"斗篷星3"},{"shape":"球体","position":[0.18,1,-0.138],"size":[0.03,0.03,0.01],"color":"#F5E9A8","solid":false,"rotation":[-14,0,0],"name":"斗篷星4"},{"shape":"圆柱","position":[0,1.12,-0.08],"size":[0.34,0.05,0.1],"color":"#E9B949","solid":false,"name":"斗篷扣"},{"shape":"圆柱","position":[-0.19,0.95,0.02],"size":[0.07,0.24,0.07],"color":"#DCDFE7","solid":false,"rotation":[0,0,-25],"name":"左臂"},{"shape":"圆柱","position":[0.19,0.95,0.02],"size":[0.07,0.24,0.07],"color":"#DCDFE7","solid":false,"rotation":[0,0,25],"name":"右臂"},{"shape":"球体","position":[-0.24,0.84,0.03],"size":[0.07,0.07,0.07],"color":"#F2D2C0","solid":false,"name":"左手"},{"shape":"球体","position":[0.24,0.84,0.03],"size":[0.07,0.07,0.07],"color":"#F2D2C0","solid":false,"name":"右手"},{"shape":"圆柱","position":[-0.065,0.6,0],"size":[0.08,0.18,0.08],"color":"#DCDFE7","solid":false,"name":"左腿"},{"shape":"圆柱","position":[0.065,0.6,0],"size":[0.08,0.18,0.08],"color":"#DCDFE7","solid":false,"name":"右腿"},{"shape":"球体","position":[-0.065,0.5,0.02],"size":[0.09,0.06,0.12],"color":"#2C2C3A","solid":false,"name":"左鞋"},{"shape":"球体","position":[0.065,0.5,0.02],"size":[0.09,0.06,0.12],"color":"#2C2C3A","solid":false,"name":"右鞋"}]}` → `{"name":"PM_paimon","prefabId":1077936129}`
6. `scene_set_spawn` `{"position":[0,0.4,0],"rotation":[0,0,0]}` → `{"pointId":1073741825}`
7. `scene_add_graph` `{"name":"PmStage"}` → `{"graphId":1073741825,"name":"_GSTS_PmStage"}`
8. `scene_add_graph` `{"name":"PmPaimon","attachToPrefab":["PM_paimon"]}` → `{"graphId":1073741826,"name":"_GSTS_PmPaimon"}`
9. `scene_add_components` `{"prefab":"PM_paimon","follow":"attach","textBubbles":[{"active":true,"above":2.1,"radius":20,"lines":[{"text":"我是派蒙！","seconds":3},{"text":"前面好像有宝箱，我们一起走吧～","seconds":4}]}]}`
10. `scene_list_prefabs` `{}`
11. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, … 共 2 张]}`：对每张图依次编译并写进存档，返回全部写好、可以试玩的存档。
12. `scene_list_components` `{"prefab":"PM_paimon"}`
13. `inspect_map` `{}`
14. [UI] `playtest_start` `{"graphNames":["_GSTS_PmStage","_GSTS_PmPaimon"],"durationSeconds":22,"screenshotsAt":[4,9,13.5,18,21],"inputs":[{"at":10.5,"key":"W","holdMs":2500},{"at":14.5,"key":"A","holdMs":2000}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 2 张，合计 28 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_PmStage（10 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { FollowCoordinateSystem, FollowLocationType } from 'genshin-ts/definitions/enum'

// Paimon, graph "stage": see examples/paimon/gen_paimon.py.
g.server({id:1073741825,name:'_GSTS_PmStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'PM_COME',false,[6]);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName==='PM_COME'){
    f.createPrefab(1077936129,[1.6,0.4,3.5],[0,180,0],evt.eventSourceEntity,false,1,[] as bigint[]);
    f.printString('PM_HELLO');
  }
})
```

### _GSTS_PmPaimon（18 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { FollowCoordinateSystem, FollowLocationType } from 'genshin-ts/definitions/enum'

// Paimon, graph "paimon": see examples/paimon/gen_paimon.py.
g.server({id:1073741826,name:'_GSTS_PmPaimon'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'PM_GO',false,[4]);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='PM_GO')return;
  const self=evt.eventSourceEntity;
  const players=f.getListOfPlayerEntitiesOnTheField();
  const hero=f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0])[0];
  f.switchFollowMotionDeviceTargetByEntity(self,hero,'',[1.2,0,0.5],[0,0,0],FollowCoordinateSystem.WorldCoordinateSystem,FollowLocationType.FollowLocation);
  f.activateDisableFollowMotionDevice(self,true);
  f.printString('PM_FOLLOW');
})
```
