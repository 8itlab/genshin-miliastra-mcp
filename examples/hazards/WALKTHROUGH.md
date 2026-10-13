# 样例 hazards：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

What pickups and hazards do to a character, tried on one lane. The player starts at x = -15 and is held on D from second 3 to 15: a coin at x = -11 gives the status boots (speed +40 % for six seconds: the track should show about 7 m/s instead of 5.2), one at x = -3 gives snare (rooted for two seconds: the track stands still, then goes on), a big coin at x = 4 is a bumper (launcher, direction away, 10 m/s: the walk is thrown back). At 16 the player is put at x = 6 and walks into an unseen wall at x = 10 (a prefab of the empty model with extra collision): it should stop near x = 9.7. At level second 26 the stage graph knocks the player down; with revive set to two seconds, by itself, without the screen, the track should jump back to the respawn point at x = -15. Expect HZ_GO, HZ_BOOTS, HZ_SNARE, HZ_DOWN, and read playerTrack.

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":16}`
3. [UI] `editor_open_map` `{mapPath}`：在编辑器里打开底图的副本（演练时跳过）
4. `scene_build_blocks` `{"name":"Hazards_Check","blocks":[{"template":20002056,"name":"HZ_floor_0","position":[-16,-0.2,0]},{"template":20002056,"name":"HZ_floor_1","position":[-6,-0.2,0]},{"template":20002056,"name":"HZ_floor_2","position":[4,-0.2,0]},{"template":20002056,"name":"HZ_floor_3","position":[14,-0.2,0]}]}` → `{"name":"Hazards_Check"}`
5. [UI] `scene_import_assets` `{"packs":["Hazards_Check"]}`：把上面的场景包导入并保存（演练时跳过）
6. `scene_list_entities` `{"namePrefix":"HZ_"}` → `{"total":0}`
7. `scene_add_prefab` `{"asset":10005018,"name":"HZ_pane"}` → `{"name":"HZ_pane","prefabId":1077936129}`
8. `scene_add_prefab` `{"asset":10005009,"name":"HZ_bumper","scale":2.5}` → `{"name":"HZ_bumper","prefabId":1077936130}`
9. `scene_add_prefab` `{"asset":10005009,"name":"HZ_boots","scale":1}` → `{"name":"HZ_boots","prefabId":1077936131}`
10. `scene_add_prefab` `{"asset":10005009,"name":"HZ_snare","scale":1}` → `{"name":"HZ_snare","prefabId":1077936132}`
11. `scene_add_unit_status` `{"name":"HZ_fast","speedPercent":40,"seconds":6}` → `{"name":"HZ_fast","statusId":1077936129}`
12. `scene_add_unit_status` `{"name":"HZ_held","rooted":true,"seconds":2}` → `{"name":"HZ_held","statusId":1077936130}`
13. `scene_add_graph` `{"name":"HzStage"}` → `{"graphId":1073741825,"name":"_GSTS_HzStage"}`
14. `scene_add_graph` `{"name":"HzBoots","attachToPrefab":"HZ_boots"}` → `{"graphId":1073741826,"name":"_GSTS_HzBoots"}`
15. `scene_add_graph` `{"name":"HzSnare","attachToPrefab":"HZ_snare"}` → `{"graphId":1073741827,"name":"_GSTS_HzSnare"}`
16. `scene_add_components` `{"prefab":"HZ_pane","extraCollision":{"areas":[{"size":[0.5,4,8],"offset":[0,2,0]}]}}`
17. `scene_add_components` `{"prefab":"HZ_bumper","launcher":{"areas":[{"radius":1.6,"offset":[0,0.5,0]}],"speed":10,"direction":"away","holdSeconds":0.3}}`
18. `scene_add_components` `{"prefab":"HZ_boots","solid":false,"collisionTriggers":[{"areas":[{"radius":1.5}]}]}`
19. `scene_add_components` `{"prefab":"HZ_snare","solid":false,"collisionTriggers":[{"areas":[{"radius":1.5}]}]}`
20. `scene_add_respawn_point` `{"position":[-15,0.4,0]}` → `{"name":"复苏点1","pointId":1073741826}`
21. `scene_set_player_count` `{"max":1}`
22. `scene_set_revive` `{"seconds":2,"auto":true,"showScreen":false}`
23. `scene_list_prefabs` `{}`
24. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, …]}`：把每张图的源码编译并写进存档，返回可以试玩的存档。
25. `scene_list_components` `{"prefab":"HZ_pane"}`
26. `inspect_map` `{}`
27. [UI] `playtest_start` `{"graphNames":["_GSTS_HzStage","_GSTS_HzBoots","_GSTS_HzSnare"],"durationSeconds":28,"screenshotsAt":[2.5,5,8,11,14,18,21,23,26],"inputs":[{"at":3,"key":"d","holdMs":12000},{"at":16,"teleport":[6,0.4,0]},{"at":17,"key":"d","holdMs":2000}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 3 张，合计 55 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_HzStage（39 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Hazards, graph "stage": see examples/hazards/gen_hazards.py.
g.server({id:1073741825,name:'_GSTS_HzStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'HZ_START',false,[2]);
  f.startTimer(evt.eventSourceEntity,'HZ_KILL',false,[26]);
  f.printString('HZ_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  if(evt.timerName==='HZ_KILL'){f.defeatAllPlayerSCharacters(players[0]);f.printString('HZ_DOWN');return;}
  if(evt.timerName!=='HZ_START')return;
  f.teleportPlayer(players[0],[-15,0.4,0],[0,0,0]);
  f.createPrefab(1077936131,[-11,0.8,0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
  f.createPrefab(1077936132,[-3,0.8,0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
  f.createPrefab(1077936130,[4,1.2,0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
  f.createPrefab(1077936129,[10,0,0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
  f.printString('HZ_GO');
})
```

### _GSTS_HzBoots（8 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Hazards, graph "boots": see examples/hazards/gen_hazards.py.
g.server({id:1073741826,name:'_GSTS_HzBoots'})
.on('whenEnteringCollisionTrigger',(evt,f)=>{
  f.addUnitStatus(evt.enteringEntity,evt.enteringEntity,1077936129,1n,f.createDictionary([] as string[],[] as number[]));
  f.printString('HZ_BOOTS');
})
```

### _GSTS_HzSnare（8 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Hazards, graph "snare": see examples/hazards/gen_hazards.py.
g.server({id:1073741827,name:'_GSTS_HzSnare'})
.on('whenEnteringCollisionTrigger',(evt,f)=>{
  f.addUnitStatus(evt.enteringEntity,evt.enteringEntity,1077936130,1n,f.createDictionary([] as string[],[] as number[]));
  f.printString('HZ_SNARE');
})
```
