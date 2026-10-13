# 样例 kingdom5：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

Kingdom v5, the short run a script can check: two nights of 26 seconds, days of 34. The script picks up the ten starting coins, recruits two citizens, makes one the builder and one an archer, builds the wooden wall, waits through the first night (two single Greed: the archer's arrows), collects the morning's four coins, recruits again and puts a farmer on the field, waits through the second night (bursts of 2, 2 and 1) and wins at the second dawn. Prints to expect, in order: KG_READY, KG_DAY, KG_COINS 1..10, KG_CITIZEN x2, KG_BUILDER, KG_ARCHER, KG_WALL 1, KG_WARN, KG_DUSK 1, KG_GREED x2, KG_ARROW/KG_SHOT/KG_KILL, KG_DAWN, KG_INCOME 4, KG_COINS, KG_CITIZEN, KG_FARMER, KG_WARN, KG_DUSK 2, KG_GREED x3, KG_ARROW..., KG_WALL_HIT, KG_DAWN, KG_VICTORY. KG_POOR / KG_NEED mean a station refused. Whether it is fun is for a person to say; this run only shows that every part works. The full game is kg5_play.json: day 60, night 45, five nights. An option shows no text on an account of 奇匠 level 1, only its icon, so prices are rows of small coins above the stations.

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":17,"yawRange":[0,0]}`
3. [UI] `editor_open_map` `{mapPath}`：在编辑器里打开底图的副本（演练时跳过）
4. `scene_build_blocks` `{"name":"Kingdom_V5","blocks":[{"template":20002088,"name":"KV_flag","position":[-2.6,7.6,5.2]},{"template":20002409,"name":"KV_hammer_sign","position":[8.4,7.6,4.2]},{"template":20002764,"name":"KV_bow_target_b","position":[16,7.6,5.6],"rotation":[0,25,0]},"… 16 more pieces of the same form"],"offset":[0,-7.6,0]}` → `{"name":"Kingdom_V5"}`
5. `scene_build_blocks` `{"name":"Kingdom_V3_Scenery","blocks":[{"template":20002056,"name":"KS_001","position":[-42,7.6,-10.25],"scale":[1.21,0.2,1.15]},{"template":10005106,"name":"KS_002","position":[-42,7.85,-10.25],"scale":[12.05,0.4,11.5]},{"template":20002056,"name":"KS_003","position":[-30,7.6,-10.25],"scale":[1.21,0.2,1.15]},"… 128 more pieces of the same form"],"offset":[0,-7.6,0]}` → `{"name":"Kingdom_V3_Scenery"}`
6. `scene_build_blocks` `{"name":"Kingdom_V3_Units","blocks":[{"template":30003003,"name":"KV_unit_vagrant","position":[5,7.6,14],"createAtStart":false},{"template":30004001,"name":"KV_unit_builder","position":[7,7.6,14],"scale":1.3,"createAtStart":false},{"template":30003002,"name":"KV_unit_archer","position":[9,7.6,14],"scale":1.2,"createAtStart":false}],"offset":[0,-7.6,0]}` → `{"name":"Kingdom_V3_Units"}`
7. [UI] `scene_import_assets` `{"packs":["Kingdom_V5","Kingdom_V3_Scenery","Kingdom_V3_Units"]}`：把上面的场景包导入并保存（演练时跳过）
8. `scene_list_entities` `{"namePrefix":"KV_"}` → `{"total":0}`
9. `scene_add_prefab` `{"asset":10005009,"name":"KV_coin","scale":0.5}` → `{"name":"KV_coin","prefabId":1077936129}`
10. `scene_add_prefab` `{"asset":10005009,"name":"KV_tag_keep","scale":0.3}` → `{"name":"KV_tag_keep","prefabId":1077936130}`
11. `scene_add_prefab` `{"asset":10005009,"name":"KV_tag_site","scale":0.3}` → `{"name":"KV_tag_site","prefabId":1077936131}`
12. `scene_add_prefab` `{"asset":10005009,"name":"KV_tag","scale":0.3}` → `{"name":"KV_tag","prefabId":1077936132}`
13. `scene_add_prefab` `{"asset":20002336,"name":"KV_keep","scale":1}` → `{"name":"KV_keep","prefabId":1077936133}`
14. `scene_add_prefab` `{"asset":20002087,"name":"KV_camp","scale":0.55}` → `{"name":"KV_camp","prefabId":1077936134}`
15. `scene_add_prefab` `{"asset":20001613,"name":"KV_smith","scale":0.8}` → `{"name":"KV_smith","prefabId":1077936135}`
16. `scene_add_prefab` `{"asset":20002764,"name":"KV_range","scale":1}` → `{"name":"KV_range","prefabId":1077936136}`
17. `scene_add_prefab` `{"asset":20001965,"name":"KV_farm","scale":0.8}` → `{"name":"KV_farm","prefabId":1077936137}`
18. `scene_add_prefab` `{"asset":20002275,"name":"KV_site","scale":1}` → `{"name":"KV_site","prefabId":1077936138}`
19. `scene_add_prefab` `{"asset":20003092,"name":"KV_wall_wood","scale":[0.55,1.2,1]}` → `{"name":"KV_wall_wood","prefabId":1077936139}`
20. `scene_add_prefab` `{"asset":20002893,"name":"KV_wall_stone","scale":[1,0.6,1]}` → `{"name":"KV_wall_stone","prefabId":1077936140}`
21. `scene_add_prefab` `{"asset":20001929,"name":"KV_arrow","scale":0.2}` → `{"name":"KV_arrow","prefabId":1077936141}`
22. `scene_add_prefab` `{"asset":20002863,"name":"KV_crown","scale":0.45}` → `{"name":"KV_crown","prefabId":1077936142}`
23. `scene_add_prefab` `{"asset":10005009,"name":"KV_greed"}` → `{"name":"KV_greed","prefabId":1077936143}`
24. `scene_add_prefab` `{"asset":10005009,"name":"KV_brute"}` → `{"name":"KV_brute","prefabId":1077936144}`
25. `scene_add_prefab` `{"asset":10005009,"name":"KV_vagrant"}` → `{"name":"KV_vagrant","prefabId":1077936145}`
26. `scene_add_prefab` `{"asset":10005009,"name":"KV_builder"}` → `{"name":"KV_builder","prefabId":1077936146}`
27. `scene_add_prefab` `{"asset":10005009,"name":"KV_archer"}` → `{"name":"KV_archer","prefabId":1077936147}`
28. `scene_add_prefab` `{"asset":10005009,"name":"KV_farmer"}` → `{"name":"KV_farmer","prefabId":1077936148}`
29. `scene_set_faction_hostility` `{"hostilePairs":[[1,3]]}`
30. `scene_set_level_settings` `{"aggroMode":"custom"}`
31. `scene_add_environment` `{"name":"KV_night","hour":0}` → `{"name":"KV_night","environmentId":1186988034,"defaultEnvironmentId":1186988033}`
32. `scene_add_environment` `{"name":"KV_day","hour":11,"stars":false,"milkyWay":false}` → `{"name":"KV_day","environmentId":1186988035,"defaultEnvironmentId":1186988033}`
33. `scene_set_spawn` `{"position":[2,0.4,0],"rotation":[0,0,0]}` → `{"pointId":1073741825}`
34. `scene_add_signal` `{"name":"KG_state"}` → `{"name":"KG_state"}`
35. `scene_add_signal` `{"name":"KG_warn"}` → `{"name":"KG_warn"}`
36. `scene_add_signal` `{"name":"KG_dusk"}` → `{"name":"KG_dusk"}`
37. `scene_add_signal` `{"name":"KG_dawn"}` → `{"name":"KG_dawn"}`
38. `scene_add_signal` `{"name":"KG_wall_down"}` → `{"name":"KG_wall_down"}`
39. `scene_set_class` `{"allowJump":false}`
40. `scene_add_light` `{"name":"KV_lamp_0","environment":"KV_night","position":[-3.9,2.2,4.3],"radius":9,"intensity":3}` → `{"name":"KV_lamp_0","environmentId":1186988034}`
41. `scene_add_light` `{"name":"KV_lamp_1","environment":"KV_night","position":[7.3,2.2,4.3],"radius":9,"intensity":3}` → `{"name":"KV_lamp_1","environmentId":1186988034}`
42. `scene_add_light` `{"name":"KV_lamp_2","environment":"KV_night","position":[19.4,2.2,4.3],"radius":9,"intensity":3}` → `{"name":"KV_lamp_2","environmentId":1186988034}`
43. `scene_add_light` `{"name":"KV_lamp_3","environment":"KV_night","position":[30.5,2.2,4.3],"radius":9,"intensity":3}` → `{"name":"KV_lamp_3","environmentId":1186988034}`
44. `scene_add_light` `{"name":"KV_lamp_4","environment":"KV_night","position":[-11.5,2.2,4.3],"radius":9,"intensity":3}` → `{"name":"KV_lamp_4","environmentId":1186988034}`
45. `scene_add_graph` `{"name":"KgStage"}` → `{"graphId":1073741825,"name":"_GSTS_KgStage"}`
46. `scene_add_graph` `{"name":"KgCoin","attachToPrefab":"KV_coin"}` → `{"graphId":1073741826,"name":"_GSTS_KgCoin"}`
47. `scene_add_graph` `{"name":"KgCamp","attachToPrefab":"KV_camp"}` → `{"graphId":1073741827,"name":"_GSTS_KgCamp"}`
48. `scene_add_graph` `{"name":"KgFarm","attachToPrefab":"KV_farm"}` → `{"graphId":1073741828,"name":"_GSTS_KgFarm"}`
49. `scene_add_graph` `{"name":"KgSmith","attachToPrefab":"KV_smith"}` → `{"graphId":1073741829,"name":"_GSTS_KgSmith"}`
50. `scene_add_graph` `{"name":"KgRange","attachToPrefab":"KV_range"}` → `{"graphId":1073741830,"name":"_GSTS_KgRange"}`
51. `scene_add_graph` `{"name":"KgSite","attachToPrefab":"KV_site"}` → `{"graphId":1073741831,"name":"_GSTS_KgSite"}`
52. `scene_add_graph` `{"name":"KgKeep","attachToPrefab":"KV_keep"}` → `{"graphId":1073741832,"name":"_GSTS_KgKeep"}`
53. `scene_add_graph` `{"name":"KgArcher","attachToPrefab":"KV_archer"}` → `{"graphId":1073741833,"name":"_GSTS_KgArcher"}`
54. `scene_add_graph` `{"name":"KgArrow","attachToPrefab":"KV_arrow"}` → `{"graphId":1073741834,"name":"_GSTS_KgArrow"}`
55. `scene_add_graph` `{"name":"KgWall","attachToPrefab":["KV_wall_wood","KV_wall_stone"]}` → `{"graphId":1073741835,"name":"_GSTS_KgWall"}`
56. `scene_add_graph` `{"name":"KgGreed","attachToPrefab":["KV_greed","KV_brute"]}` → `{"graphId":1073741836,"name":"_GSTS_KgGreed"}`
57. `scene_add_graph` `{"name":"KgPlayer","attachToPrefab":"player"}` → `{"graphId":1073741837,"name":"_GSTS_KgPlayer"}`
58. `scene_add_components` `{"prefab":"KV_coin","solid":false,"follow":"chase","collisionTriggers":[{"areas":[{"radius":5}],"targets":["character"]},{"areas":[{"size":[1.6,2,1.6]}],"targets":["character"]}]}`
59. `scene_add_components` `{"prefab":"KV_tag_keep","solid":false}`
60. `scene_add_components` `{"prefab":"KV_tag_site","solid":false}`
61. `scene_add_components` `{"prefab":"KV_tag","solid":false}`
62. `scene_add_components` `{"prefab":"KV_arrow","solid":false,"follow":"chase"}`
63. `scene_add_components` `{"prefab":"KV_crown","solid":false,"follow":"attach"}`
64. `scene_add_components` `{"prefab":"KV_keep","optionTab":{"areas":[{"size":[5,5,14]}],"options":[{"text":"升级主堡 5金币 · 每早多2金币","icon":20},{"text":"再升主堡 8金币 · 每早多2金币","icon":20,"active":false}]},"variables":[{"name":"lit","type":"boolean","value":false}]}`
65. `scene_add_components` `{"prefab":"KV_camp","optionTab":{"areas":[{"size":[8,6,30]}],"options":[{"text":"招募村民 1金币","icon":1}]},"variables":[{"name":"lit","type":"boolean","value":false}]}`
66. `scene_add_components` `{"prefab":"KV_farm","optionTab":{"areas":[{"size":[5,5,16]}],"options":[{"text":"农夫 2金币 · 每早多2金币","icon":5}]},"variables":[{"name":"lit","type":"boolean","value":false}]}`
67. `scene_add_components` `{"prefab":"KV_smith","optionTab":{"areas":[{"size":[5,5,16]}],"options":[{"text":"工匠 3金币 · 筑墙修墙","icon":3}]},"variables":[{"name":"lit","type":"boolean","value":false}]}`
68. `scene_add_components` `{"prefab":"KV_range","optionTab":{"areas":[{"size":[5,5,14]}],"options":[{"text":"弓手 2金币 · 夜里射怪","icon":10}]},"variables":[{"name":"lit","type":"boolean","value":false}]}`
69. `scene_add_components` `{"prefab":"KV_site","optionTab":{"areas":[{"size":[5,5,14]}],"options":[{"text":"筑木墙 3金币","icon":15},{"text":"升石墙 6金币 · 要主堡1级","icon":15,"active":false}]},"variables":[{"name":"lit","type":"boolean","value":false},{"name":"level","type":"integer","value":0}]}`
70. `scene_add_components` `{"prefab":"KV_wall_wood","collisionTriggers":[{"areas":[{"radius":2.5}],"targets":["creature"]}],"variables":[{"name":"hp","type":"integer","value":4},{"name":"full","type":"integer","value":4}]}`
71. `scene_add_components` `{"prefab":"KV_wall_stone","collisionTriggers":[{"areas":[{"radius":4}],"targets":["creature"]}],"variables":[{"name":"hp","type":"integer","value":9},{"name":"full","type":"integer","value":9}]}`
72. `scene_add_components` `{"prefab":"KV_archer","collisionTriggers":[{"areas":[{"radius":12}],"targets":["creature"]}],"variables":[{"name":"loaded","type":"boolean","value":true}]}`
73. `scene_add_components` `{"prefab":"KV_greed","collisionTriggers":[{"areas":[{"radius":4.5}],"targets":["character"]}],"variables":[{"name":"marks","type":"integer","value":0},{"name":"hits","type":"integer","value":0},{"name":"tough","type":"integer","value":1},{"name":"dmg","type":"integer","value":1}]}`
74. `scene_add_components` `{"prefab":"KV_brute","collisionTriggers":[{"areas":[{"radius":4.5}],"targets":["character"]}],"variables":[{"name":"marks","type":"integer","value":0},{"name":"hits","type":"integer","value":0},{"name":"tough","type":"integer","value":2},{"name":"dmg","type":"integer","value":2}]}`
75. `scene_add_components` `{"prefab":"player","variables":[{"name":"coins","type":"integer","value":0},{"name":"citizens","type":"integer","value":0},{"name":"farmers","type":"integer","value":0},{"name":"builders","type":"integer","value":0},{"name":"archers","type":"integer","value":0},{"name":"keep","type":"integer","value":0},{"name":"night","type":"integer","value":0},{"name":"wall","type":"integer","value":0}]}`
76. `scene_add_global_timer` `{"name":"KG_clock","seconds":34,"holder":"stage"}` → `{"name":"KG_clock"}`
77. `scene_add_timer_display` `{"name":"KG_clock","timer":"KG_clock","position":[0,380]}` → `{"name":"KG_clock","controlId":1073741847}`
78. `scene_add_progress_bar` `{"name":"KG_purse","variable":"coins","max":10,"position":[-300,384],"size":[260,34]}` → `{"name":"KG_purse","controlId":1073741850}`
79. `scene_add_progress_bar` `{"name":"KG_wall","variable":"wall","max":100,"position":[-300,348],"size":[260,22]}` → `{"name":"KG_wall","controlId":1073741853}`
80. `scene_add_progress_bar` `{"name":"KG_nights","variable":"night","max":2,"position":[300,384],"size":[260,34]}` → `{"name":"KG_nights","controlId":1073741856}`
81. `scene_list_prefabs` `{}`
82. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, … 共 13 张]}`：对每张图依次编译并写进存档，返回全部写好、可以试玩的存档。
   一张图一张图调的时候，是对每张图做这五步：`create_project` `{projectId, mapPath, targetGraphId}` → `update_logic` `{projectId, code}` → `build_project` `{projectId}` → `preview_changes` `{projectId, buildId, destination:"copy"}` → `apply_build` `{projectId, buildId, destination:"copy", expectedSha256}`。
83. `scene_list_components` `{"prefab":"KV_coin"}`
84. `inspect_map` `{}`
85. [UI] `playtest_start` `{"graphNames":["_GSTS_KgStage","_GSTS_KgCoin","_GSTS_KgCamp","_GSTS_KgFarm","_GSTS_KgSmith","_GSTS_KgRange","_GSTS_KgSite","_GSTS_KgKeep","_GSTS_KgArcher","_GSTS_KgArrow","_GSTS_KgWall","_GSTS_KgGreed","_GSTS_KgPlayer"],"durationSeconds":132,"screenshotsAt":[4,6.5,8,9.5,11,13,17,21,25,29,31,33,34.5,36,43,45,57,60,65,71,78,92,94,96,101,108,118,122,126],"inputs":[{"at":5,"key":"d","holdMs":600},{"at":7,"key":"f"},{"at":8.5,"key":"f"},{"at":10,"key":"d","holdMs":950},{"at":12,"key":"f"},{"at":14,"key":"d","holdMs":950},{"at":16,"key":"f"},{"at":18,"key":"d","holdMs":950},{"at":20,"key":"f"},{"at":22,"key":"a","holdMs":1900},{"at":58.5,"key":"a","holdMs":1700},{"at":62,"key":"d","holdMs":750},{"at":64,"key":"f"},{"at":66,"key":"a","holdMs":2400},{"at":70,"key":"f"},{"at":73,"key":"d","holdMs":1500}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 13 张，合计 1740 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_KgStage（496 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v5, graph "stage": see examples/kingdom5/gen_kingdom5.py.
g.server({id:1073741825,name:'_GSTS_KgStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'KG_SETUP',false,[2]);
  f.printString('KG_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0];
  const stage=evt.eventSourceEntity;
  if(evt.timerName==='KG_SETUP'){
    f.createPrefab(1077936137,[-7,0,4.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936132,[-7.22,3.4,4.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936132,[-6.78,3.4,4.6],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936133,[0,0,3.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936130,[-0.9,3.4,3.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936130,[-0.45,3.4,3.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936130,[0.0,3.4,3.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936130,[0.45,3.4,3.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936130,[0.9,3.4,3.6],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936134,[5,0,7.2],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936132,[5.0,3.4,7.2],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936135,[10,0,5.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936132,[9.55,3.4,5.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936132,[10.0,3.4,5.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936132,[10.45,3.4,5.6],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936136,[14.4,0,5.0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936132,[14.18,3.4,5.0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936132,[14.62,3.4,5.0],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936138,[20,0,4.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936131,[19.55,3.4,4.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936131,[20.0,3.4,4.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936131,[20.45,3.4,4.6],[0,0,0],stage,false,1,[] as bigint[]);
    // The first coins lie on the way to the camp: picking them up is the first thing the game teaches.
    f.createPrefab(1077936129,[3.2,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936129,[3.9,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936129,[4.6,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936129,[5.3,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936129,[6.0,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936129,[6.7,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936129,[7.4,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936129,[8.1,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936129,[8.8,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936129,[9.5,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);
    // The crown is a star that follows the monarch above the head.
    for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(player)){
      const crown=f.createPrefab(1077936142,[2,2.6,0],[0,0,0],stage,false,1,[] as bigint[]);
      f.switchFollowMotionDeviceTargetByEntity(crown,hero,'',[0,2.3,0],[0,0,0],FollowCoordinateSystem.WorldCoordinateSystem,FollowLocationType.FollowLocation);
      f.activateDisableFollowMotionDevice(crown,true);
    }
    f.modifyPlayerBackgroundMusic(player,10006n,0,86,60n,true,0,1,true);
    f.startTimer(stage,'KG_TO_WARN',false,[26]);
    f.startTimer(stage,'KG_TO_DUSK',false,[34]);
    f.startGlobalTimer(stage,'KG_clock');
    f.printString('KG_DAY');
    return;
  }
  if(evt.timerName==='KG_TO_WARN'){
    f.playerPlaysOneShot2dSoundEffect(player,51063n,100n,1);
    f.sendSignal('KG_warn');
    f.printString('KG_WARN');
    return;
  }
  if(evt.timerName==='KG_TO_DUSK'){
    const night=f.getCustomVariable(player,'night').asType('int')+1n;
    f.setCustomVariable(player,'night',night,true);
    f.modifyEnvironmentSettings(1186988034n,players,false,0n);
    f.modifyPlayerBackgroundMusic(player,10162n,0,134,70n,true,0,1,true);f.playerPlaysOneShot2dSoundEffect(player,10071n,100n,1);
    f.sendSignal('KG_dusk');
    if(night===1n)f.startTimer(stage,'KG_WAVE',false,[3.1,11.7]);
    if(night===2n)f.startTimer(stage,'KG_WAVE',false,[2.6,9.1,15.6]);
    if(night===3n)f.startTimer(stage,'KG_WAVE',false,[2.6,9.1,15.6]);
    if(night===4n)f.startTimer(stage,'KG_WAVE',false,[2.1,7.3,12.5,17.7]);
    if(night===5n)f.startTimer(stage,'KG_WAVE',false,[2.1,7.3,12.5,17.7]);
    f.startTimer(stage,'KG_TO_DAWN',false,[26]);
    f.startGlobalTimer(stage,'KG_clock');
    f.modifyGlobalTimer(stage,'KG_clock',-8);
    f.printString('KG_DUSK');f.printString(f.dataTypeConversion(night,'str'));
    return;
  }
  if(evt.timerName==='KG_WAVE'){
    const tonight=f.getCustomVariable(player,'night').asType('int');
    f.playerPlaysOneShot2dSoundEffect(player,20176n,80n,1);
    if(tonight===1n&&evt.timerSequenceId===0n){f.createPrefab(1077936143,[36.0,0.4,-0.9],[0,-90,0],stage,false,1,[] as bigint[]);}
    if(tonight===1n&&evt.timerSequenceId===1n){f.createPrefab(1077936143,[36.0,0.4,-0.9],[0,-90,0],stage,false,1,[] as bigint[]);}
    if(tonight===2n&&evt.timerSequenceId===0n){f.createPrefab(1077936143,[36.0,0.4,-0.9],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[36.8,0.4,0.0],[0,-90,0],stage,false,1,[] as bigint[]);}
    if(tonight===2n&&evt.timerSequenceId===1n){f.createPrefab(1077936143,[36.0,0.4,-0.9],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[36.8,0.4,0.0],[0,-90,0],stage,false,1,[] as bigint[]);}
    if(tonight===2n&&evt.timerSequenceId===2n){f.createPrefab(1077936143,[36.0,0.4,-0.9],[0,-90,0],stage,false,1,[] as bigint[]);}
    if(tonight===3n&&evt.timerSequenceId===0n){f.createPrefab(1077936143,[36.0,0.4,-0.9],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[36.8,0.4,0.0],[0,-90,0],stage,false,1,[] as bigint[]);}
    if(tonight===3n&&evt.timerSequenceId===1n){f.createPrefab(1077936143,[36.0,0.4,-0.9],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[36.8,0.4,0.0],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936144,[37.6,0.4,0.9],[0,-90,0],stage,false,1,[] as bigint[]);}
    if(tonight===3n&&evt.timerSequenceId===2n){f.createPrefab(1077936143,[36.0,0.4,-0.9],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[36.8,0.4,0.0],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[37.6,0.4,0.9],[0,-90,0],stage,false,1,[] as bigint[]);}
    if(tonight===4n&&evt.timerSequenceId===0n){f.createPrefab(1077936143,[36.0,0.4,-0.9],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[36.8,0.4,0.0],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[37.6,0.4,0.9],[0,-90,0],stage,false,1,[] as bigint[]);}
    if(tonight===4n&&evt.timerSequenceId===1n){f.createPrefab(1077936143,[36.0,0.4,-0.9],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[36.8,0.4,0.0],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[37.6,0.4,0.9],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936144,[38.4,0.4,-0.9],[0,-90,0],stage,false,1,[] as bigint[]);}
    if(tonight===4n&&evt.timerSequenceId===2n){f.createPrefab(1077936143,[36.0,0.4,-0.9],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[36.8,0.4,0.0],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[37.6,0.4,0.9],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936144,[38.4,0.4,-0.9],[0,-90,0],stage,false,1,[] as bigint[]);}
    if(tonight===4n&&evt.timerSequenceId===3n){f.createPrefab(1077936143,[36.0,0.4,-0.9],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[36.8,0.4,0.0],[0,-90,0],stage,false,1,[] as bigint[]);}
    if(tonight===5n&&evt.timerSequenceId===0n){f.createPrefab(1077936143,[36.0,0.4,-0.9],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[36.8,0.4,0.0],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[37.6,0.4,0.9],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[38.4,0.4,-0.9],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936144,[39.2,0.4,0.0],[0,-90,0],stage,false,1,[] as bigint[]);}
    if(tonight===5n&&evt.timerSequenceId===1n){f.createPrefab(1077936143,[36.0,0.4,-0.9],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[36.8,0.4,0.0],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[37.6,0.4,0.9],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[38.4,0.4,-0.9],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936144,[39.2,0.4,0.0],[0,-90,0],stage,false,1,[] as bigint[]);}
    if(tonight===5n&&evt.timerSequenceId===2n){f.createPrefab(1077936143,[36.0,0.4,-0.9],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[36.8,0.4,0.0],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[37.6,0.4,0.9],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[38.4,0.4,-0.9],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936144,[39.2,0.4,0.0],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936144,[40.0,0.4,0.9],[0,-90,0],stage,false,1,[] as bigint[]);}
    if(tonight===5n&&evt.timerSequenceId===3n){f.createPrefab(1077936143,[36.0,0.4,-0.9],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[36.8,0.4,0.0],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936143,[37.6,0.4,0.9],[0,-90,0],stage,false,1,[] as bigint[]);}
    f.printString('KG_GREED');
    return;
  }
  if(evt.timerName==='KG_TO_DAWN'){
    f.stopTimer(stage,'KG_WAVE');
    f.modifyEnvironmentSettings(1186988035n,players,false,0n);
    f.sendSignal('KG_dawn');
    f.printString('KG_DAWN');
    if(f.getCustomVariable(player,'night').asType('int')>=2n){
      // The last night is over: fireworks over the keep, then the level is won.
      f.modifyPlayerBackgroundMusic(player,10152n,0,111,80n,true,0,1,true);f.playerPlaysOneShot2dSoundEffect(player,50921n,100n,1);
      for(const hall of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936133)){f.playTimedEffects(10001116,hall,'GI_RootNode',true,false,[0,3,0],[0,0,0],1,true);}
      f.startTimer(stage,'KG_WIN',false,[4]);
      return;
    }
    f.modifyPlayerBackgroundMusic(player,10006n,0,86,60n,true,0,1,true);f.playerPlaysOneShot2dSoundEffect(player,20024n,100n,1);
    const keep=f.getCustomVariable(player,'keep').asType('int'),farmers=f.getCustomVariable(player,'farmers').asType('int');
    f.printString('KG_INCOME');f.printString(f.dataTypeConversion(4n+keep*2n+farmers*2n,'str'));
    f.createPrefab(1077936129,[-1.5,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936129,[-0.7,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936129,[0.1,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936129,[0.9,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);
    if(keep>=1n){f.createPrefab(1077936129,[1.7,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936129,[2.5,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);}
    if(keep>=2n){f.createPrefab(1077936129,[3.3,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936129,[4.1,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);}
    if(farmers>=1n){f.createPrefab(1077936129,[-8.6,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936129,[-8.0,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);}
    if(farmers>=2n){f.createPrefab(1077936129,[-7.4,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936129,[-6.8,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);}
    if(farmers>=3n){f.createPrefab(1077936129,[-6.2,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936129,[-5.6,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);}
    if(farmers>=4n){f.createPrefab(1077936129,[-5.0,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936129,[-4.4,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);}
    f.startTimer(stage,'KG_TO_WARN',false,[26]);
    f.startTimer(stage,'KG_TO_DUSK',false,[34]);
    f.startGlobalTimer(stage,'KG_clock');
    return;
  }
  if(evt.timerName==='KG_WIN'){
    f.printString('KG_VICTORY');
    f.setPlayerSettlementSuccessStatus(player,SettlementStatus.Victory);
    f.settleStage();
  }
})
```

### _GSTS_KgCoin（27 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v5, graph "coin": see examples/kingdom5/gen_kingdom5.py.
g.server({id:1073741826,name:'_GSTS_KgCoin'})
.on('whenEnteringCollisionTrigger',(evt,f)=>{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.enteringEntity as any);
  if(evt.triggerId===1n){
    // A full purse takes nothing: the coin stays where it lies.
    if(f.getCustomVariable(player,'coins').asType('int')>=10n)return;
    // A character has no GUID: the device follows it through the GUID of its player.
    f.switchFollowMotionDeviceTargetByGuid(evt.triggerEntity,f.queryGuidByEntity(player),'',[0,1,0],[0,0,0],FollowCoordinateSystem.WorldCoordinateSystem,FollowLocationType.FollowLocation);
    f.activateDisableFollowMotionDevice(evt.triggerEntity,true);
    return;
  }
  const coins=f.getCustomVariable(player,'coins').asType('int');
  if(coins>=10n){f.activateDisableFollowMotionDevice(evt.triggerEntity,false);return;}
  f.playerPlaysOneShot2dSoundEffect(player,50927n,70n,1);f.playTimedEffects(10002057,evt.enteringEntity,'GI_RootNode',true,false,[0,0,0],[0,0,0],1,true);
  f.setCustomVariable(player,'coins',coins+1n,true);
  f.destroyEntity(evt.triggerEntity);
})
```

### _GSTS_KgCamp（107 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v5, graph "camp": see examples/kingdom5/gen_kingdom5.py.
g.server({id:1073741827,name:'_GSTS_KgCamp'})
.on('whenTabIsSelected',(evt,f)=>{
  const self=evt.eventSourceEntity;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const coins=f.getCustomVariable(player,'coins').asType('int');
  const citizens=f.getCustomVariable(player,'citizens').asType('int');
  if(f.getCustomVariable(player,'citizens').asType('int')+f.getCustomVariable(player,'farmers').asType('int')+f.getCustomVariable(player,'builders').asType('int')+f.getCustomVariable(player,'archers').asType('int')>=8n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  if(coins<1n){f.printString('KG_POOR');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  f.setCustomVariable(player,'citizens',citizens+1n,true);
  const unit=f.createPrefab(1077936145,f.create3dVector(4.2+Number(citizens)*0.9,0.4,2.6),[0,0,0],self,false,1,[] as bigint[]);
  f.modifyEntityFaction(unit,f.queryEntityFaction(player));f.playTimedEffects(21,unit,'GI_RootNode',true,false,[0,0,0],[0,0,0],1,true);
  f.printString('KG_CITIZEN');
  f.playerPlaysOneShot2dSoundEffect(player,50917n,100n,1);f.playTimedEffects(7,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.setCustomVariable(player,'coins',coins-1n,true);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='KG_ASK')return;
  f.clearSpecialEffectsBasedOnSpecialEffectAssets(evt.eventSourceEntity,10004184);
})
.onSignal('KG_state',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0],self=f.getSelfEntity();
  const coins=f.getCustomVariable(player,'coins').asType('int'),on=f.getCustomVariable(self,'lit').asType('bool');
  if(f.getCustomVariable(player,'citizens').asType('int')+f.getCustomVariable(player,'farmers').asType('int')+f.getCustomVariable(player,'builders').asType('int')+f.getCustomVariable(player,'archers').asType('int')>=8n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(coins<1n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(on)return;
  f.setCustomVariable(self,'lit',true,true);f.mountLoopingSpecialEffect(10001085,self,'GI_RootNode',true,true,[0,4,0],[0,0,0],1.5,false);
})
```

### _GSTS_KgFarm（122 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v5, graph "farm": see examples/kingdom5/gen_kingdom5.py.
g.server({id:1073741828,name:'_GSTS_KgFarm'})
.on('whenTabIsSelected',(evt,f)=>{
  const self=evt.eventSourceEntity;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const coins=f.getCustomVariable(player,'coins').asType('int');
  const citizens=f.getCustomVariable(player,'citizens').asType('int'),have=f.getCustomVariable(player,'farmers').asType('int');
  if(have>=4n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  if(citizens<1n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  if(coins<2n){f.printString('KG_POOR');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  f.setCustomVariable(player,'citizens',citizens-1n,true);
  const folk=f.getEntitiesWithSpecifiedPrefabOnTheField(1077936145);
  if(folk.length>0)f.removeEntity(folk[0]);
  f.setCustomVariable(player,'farmers',have+1n,true);
  const unit=f.createPrefab(1077936148,f.create3dVector(-8.4+Number(have)*0.9,0.4,2.4),[0,0,0],self,false,1,[] as bigint[]);
  f.modifyEntityFaction(unit,f.queryEntityFaction(player));f.playTimedEffects(21,unit,'GI_RootNode',true,false,[0,0,0],[0,0,0],1,true);
  f.printString('KG_FARMER');
  f.playerPlaysOneShot2dSoundEffect(player,50917n,100n,1);f.playTimedEffects(7,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.setCustomVariable(player,'coins',coins-2n,true);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='KG_ASK')return;
  f.clearSpecialEffectsBasedOnSpecialEffectAssets(evt.eventSourceEntity,10004184);
})
.onSignal('KG_state',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0],self=f.getSelfEntity();
  const coins=f.getCustomVariable(player,'coins').asType('int'),on=f.getCustomVariable(self,'lit').asType('bool');
  if(f.getCustomVariable(player,'citizens').asType('int')<1n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(f.getCustomVariable(player,'farmers').asType('int')>=4n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(coins<2n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(on)return;
  f.setCustomVariable(self,'lit',true,true);f.mountLoopingSpecialEffect(10001085,self,'GI_RootNode',true,true,[0,4,0],[0,0,0],1.5,false);
})
```

### _GSTS_KgSmith（122 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v5, graph "smith": see examples/kingdom5/gen_kingdom5.py.
g.server({id:1073741829,name:'_GSTS_KgSmith'})
.on('whenTabIsSelected',(evt,f)=>{
  const self=evt.eventSourceEntity;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const coins=f.getCustomVariable(player,'coins').asType('int');
  const citizens=f.getCustomVariable(player,'citizens').asType('int'),have=f.getCustomVariable(player,'builders').asType('int');
  if(have>=1n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  if(citizens<1n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  if(coins<3n){f.printString('KG_POOR');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  f.setCustomVariable(player,'citizens',citizens-1n,true);
  const folk=f.getEntitiesWithSpecifiedPrefabOnTheField(1077936145);
  if(folk.length>0)f.removeEntity(folk[0]);
  f.setCustomVariable(player,'builders',have+1n,true);
  const unit=f.createPrefab(1077936146,f.create3dVector(10.4+Number(have)*0.9,0.4,2.8),[0,0,0],self,false,1,[] as bigint[]);
  f.modifyEntityFaction(unit,f.queryEntityFaction(player));f.playTimedEffects(21,unit,'GI_RootNode',true,false,[0,0,0],[0,0,0],1,true);
  f.printString('KG_BUILDER');
  f.playerPlaysOneShot2dSoundEffect(player,50917n,100n,1);f.playTimedEffects(7,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.setCustomVariable(player,'coins',coins-3n,true);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='KG_ASK')return;
  f.clearSpecialEffectsBasedOnSpecialEffectAssets(evt.eventSourceEntity,10004184);
})
.onSignal('KG_state',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0],self=f.getSelfEntity();
  const coins=f.getCustomVariable(player,'coins').asType('int'),on=f.getCustomVariable(self,'lit').asType('bool');
  if(f.getCustomVariable(player,'citizens').asType('int')<1n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(f.getCustomVariable(player,'builders').asType('int')>=1n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(coins<3n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(on)return;
  f.setCustomVariable(self,'lit',true,true);f.mountLoopingSpecialEffect(10001085,self,'GI_RootNode',true,true,[0,4,0],[0,0,0],1.5,false);
})
```

### _GSTS_KgRange（122 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v5, graph "range": see examples/kingdom5/gen_kingdom5.py.
g.server({id:1073741830,name:'_GSTS_KgRange'})
.on('whenTabIsSelected',(evt,f)=>{
  const self=evt.eventSourceEntity;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const coins=f.getCustomVariable(player,'coins').asType('int');
  const citizens=f.getCustomVariable(player,'citizens').asType('int'),have=f.getCustomVariable(player,'archers').asType('int');
  if(have>=3n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  if(citizens<1n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  if(coins<2n){f.printString('KG_POOR');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  f.setCustomVariable(player,'citizens',citizens-1n,true);
  const folk=f.getEntitiesWithSpecifiedPrefabOnTheField(1077936145);
  if(folk.length>0)f.removeEntity(folk[0]);
  f.setCustomVariable(player,'archers',have+1n,true);
  const unit=f.createPrefab(1077936147,f.create3dVector(17.0+Number(have)*0.9,0.4,2.6),[0,0,0],self,false,1,[] as bigint[]);
  f.modifyEntityFaction(unit,f.queryEntityFaction(player));f.playTimedEffects(21,unit,'GI_RootNode',true,false,[0,0,0],[0,0,0],1,true);
  f.printString('KG_ARCHER');
  f.playerPlaysOneShot2dSoundEffect(player,50917n,100n,1);f.playTimedEffects(7,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.setCustomVariable(player,'coins',coins-2n,true);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='KG_ASK')return;
  f.clearSpecialEffectsBasedOnSpecialEffectAssets(evt.eventSourceEntity,10004184);
})
.onSignal('KG_state',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0],self=f.getSelfEntity();
  const coins=f.getCustomVariable(player,'coins').asType('int'),on=f.getCustomVariable(self,'lit').asType('bool');
  if(f.getCustomVariable(player,'citizens').asType('int')<1n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(f.getCustomVariable(player,'archers').asType('int')>=3n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(coins<2n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(on)return;
  f.setCustomVariable(self,'lit',true,true);f.mountLoopingSpecialEffect(10001085,self,'GI_RootNode',true,true,[0,4,0],[0,0,0],1.5,false);
})
```

### _GSTS_KgSite（237 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v5, graph "site": see examples/kingdom5/gen_kingdom5.py.
g.server({id:1073741831,name:'_GSTS_KgSite'})
.on('whenTabIsSelected',(evt,f)=>{
  const self=evt.eventSourceEntity;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const coins=f.getCustomVariable(player,'coins').asType('int');
  const level=f.getCustomVariable(self,'level').asType('int');
  if(f.getCustomVariable(player,'builders').asType('int')<1n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  if(level===0n){
    if(coins<3n){f.printString('KG_POOR');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
    // The wall joins the monarch's side: creatures are hostile to players only, and an order to go for something that
    // is not an enemy moved nobody (seen in play).
    const wood=f.createPrefab(1077936139,[23,0,0.3],[0,90,0],self,false,1,[] as bigint[]);
    f.modifyEntityFaction(wood,f.queryEntityFaction(player));
    f.playTimedEffects(47,wood,'GI_RootNode',true,false,[0,0,0],[0,0,0],1,true);
    f.setCustomVariable(self,'level',1n,true);
    f.activateDisableTab(self,1n,false);f.activateDisableTab(self,2n,true);
    for(const old of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936131))f.removeEntity(old);f.createPrefab(1077936131,[18.88,3.4,4.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936131,[19.32,3.4,4.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936131,[19.77,3.4,4.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936131,[20.23,3.4,4.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936131,[20.68,3.4,4.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936131,[21.12,3.4,4.6],[0,0,0],self,false,1,[] as bigint[]);
    f.setCustomVariable(player,'wall',100n,true);
    f.printString('KG_WALL');f.printString('1');
    f.playerPlaysOneShot2dSoundEffect(player,50918n,100n,1);f.playTimedEffects(7,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.setCustomVariable(player,'coins',coins-3n,true);
    return;
  }
  if(level===1n){
    // Stone needs a keep of level 1. The wooden wall is taken away without falling: nobody is told it is down.
    if(f.getCustomVariable(player,'keep').asType('int')<1n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
    if(coins<6n){f.printString('KG_POOR');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
    for(const piece of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936139))f.removeEntity(piece);
    const stone=f.createPrefab(1077936140,[23,0,0.3],[0,90,0],self,false,1,[] as bigint[]);
    f.modifyEntityFaction(stone,f.queryEntityFaction(player));
    f.playTimedEffects(47,stone,'GI_RootNode',true,false,[0,0,0],[0,0,0],1,true);
    f.setCustomVariable(self,'level',2n,true);
    f.activateDisableTab(self,2n,false);
    for(const old of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936131))f.removeEntity(old);
    f.setCustomVariable(player,'wall',100n,true);
    f.printString('KG_WALL');f.printString('2');
    f.playerPlaysOneShot2dSoundEffect(player,50918n,100n,1);f.playTimedEffects(7,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.setCustomVariable(player,'coins',coins-6n,true);
    return;
  }
  if(level>=2n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
})
.onSignal('KG_wall_down',(evt,f)=>{
  const self=f.getSelfEntity();
  f.setCustomVariable(self,'level',0n,true);
  f.activateDisableTab(self,1n,true);f.activateDisableTab(self,2n,false);
  for(const old of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936131))f.removeEntity(old);f.createPrefab(1077936131,[19.55,3.4,4.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936131,[20.0,3.4,4.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936131,[20.45,3.4,4.6],[0,0,0],self,false,1,[] as bigint[]);
  f.sendSignal('KG_state');
})
.onSignal('KG_warn',(evt,f)=>{
  // The horn has sounded and there is no wall: the site flashes red.
  const self=f.getSelfEntity();
  if(f.getCustomVariable(self,'level').asType('int')!==0n)return;
  f.playTimedEffects(10004188,self,'GI_RootNode',true,false,[0,0.5,0],[0,0,0],1,true);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='KG_ASK')return;
  f.clearSpecialEffectsBasedOnSpecialEffectAssets(evt.eventSourceEntity,10004184);
})
.onSignal('KG_state',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0],self=f.getSelfEntity();
  const coins=f.getCustomVariable(player,'coins').asType('int'),on=f.getCustomVariable(self,'lit').asType('bool');
  if(f.getCustomVariable(player,'builders').asType('int')<1n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(f.getCustomVariable(self,'level').asType('int')===0n&&coins<3n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(f.getCustomVariable(self,'level').asType('int')===1n&&f.getCustomVariable(player,'keep').asType('int')<1n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(f.getCustomVariable(self,'level').asType('int')===1n&&coins<6n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(f.getCustomVariable(self,'level').asType('int')>=2n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(on)return;
  f.setCustomVariable(self,'lit',true,true);f.mountLoopingSpecialEffect(10001085,self,'GI_RootNode',true,true,[0,4,0],[0,0,0],1.5,false);
})
```

### _GSTS_KgKeep（153 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v5, graph "keep": see examples/kingdom5/gen_kingdom5.py.
g.server({id:1073741832,name:'_GSTS_KgKeep'})
.on('whenTabIsSelected',(evt,f)=>{
  const self=evt.eventSourceEntity;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const coins=f.getCustomVariable(player,'coins').asType('int');
  const level=f.getCustomVariable(player,'keep').asType('int');
  if(level>=2n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  if(level===0n&&coins<5n){f.printString('KG_POOR');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  if(level===1n&&coins<8n){f.printString('KG_POOR');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  f.setCustomVariable(player,'keep',level+1n,true);
  f.activateDisableTab(self,level+1n,false);
  if(level===0n)f.activateDisableTab(self,2n,true);
  f.printString('KG_KEEP');f.printString(f.dataTypeConversion(level+1n,'str'));
  f.playerPlaysOneShot2dSoundEffect(player,50935n,100n,1);f.playTimedEffects(7,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);
  if(level===0n){
    for(const old of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936130))f.removeEntity(old);f.createPrefab(1077936130,[-1.57,3.4,3.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936130,[-1.12,3.4,3.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936130,[-0.68,3.4,3.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936130,[-0.23,3.4,3.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936130,[0.23,3.4,3.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936130,[0.68,3.4,3.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936130,[1.12,3.4,3.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936130,[1.57,3.4,3.6],[0,0,0],self,false,1,[] as bigint[]);
    f.setCustomVariable(player,'coins',coins-5n,true);
    return;
  }
  for(const old of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936130))f.removeEntity(old);
  f.setCustomVariable(player,'coins',coins-8n,true);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='KG_ASK')return;
  f.clearSpecialEffectsBasedOnSpecialEffectAssets(evt.eventSourceEntity,10004184);
})
.onSignal('KG_state',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0],self=f.getSelfEntity();
  const coins=f.getCustomVariable(player,'coins').asType('int'),on=f.getCustomVariable(self,'lit').asType('bool');
  if(f.getCustomVariable(player,'keep').asType('int')===0n&&coins<5n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(f.getCustomVariable(player,'keep').asType('int')===1n&&coins<8n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(f.getCustomVariable(player,'keep').asType('int')>=2n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(on)return;
  f.setCustomVariable(self,'lit',true,true);f.mountLoopingSpecialEffect(10001085,self,'GI_RootNode',true,true,[0,4,0],[0,0,0],1.5,false);
})
```

### _GSTS_KgArcher（94 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v5, graph "archer": see examples/kingdom5/gen_kingdom5.py.
g.server({id:1073741833,name:'_GSTS_KgArcher'})
.on('whenEnteringCollisionTrigger',(evt,f)=>{
  // The reach of the bow is the archer's own trigger for creatures. One arrow, then three seconds to reload. A Greed
  // that already has as many arrows on the way as it can take is left to the next archer.
  const self=evt.triggerEntity,target=evt.enteringEntity;
  if(f.getEntityListBySpecifiedPrefabId([target],1077936143).length!==1&&f.getEntityListBySpecifiedPrefabId([target],1077936144).length!==1)return;
  if(!f.getCustomVariable(self,'loaded').asType('bool'))return;
  if(f.getCustomVariable(target,'marks').asType('int')>=f.getCustomVariable(target,'tough').asType('int'))return;
  f.setCustomVariable(target,'marks',f.getCustomVariable(target,'marks').asType('int')+1n,true);
    f.setCustomVariable(self,'loaded',false,true);
    f.startTimer(self,'KG_RELOAD',false,[3]);
    const from=f.split3dVector(f.getEntityLocationAndRotation(self).location);
    const arrow=f.createPrefab(1077936141,f.create3dVector(from.xComponent,from.yComponent+1.6,from.zComponent),[0,0,0],self,false,1,[] as bigint[]);
    f.switchFollowMotionDeviceTargetByEntity(arrow,target,'',[0,1,0],[0,0,0],FollowCoordinateSystem.WorldCoordinateSystem,FollowLocationType.FollowLocation);
    f.activateDisableFollowMotionDevice(arrow,true);
    
    f.printString('KG_ARROW');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='KG_RELOAD')return;
  const self=evt.eventSourceEntity;
  f.setCustomVariable(self,'loaded',true,true);
  // Whoever walked in while the bow was not ready raised no event that was heard: look at who is inside now.
  for(const target of f.getAllEntitiesWithinTheCollisionTrigger(self,1n)){
    if(!f.getCustomVariable(self,'loaded').asType('bool'))continue;
    if(f.getEntityListBySpecifiedPrefabId([target],1077936143).length!==1&&f.getEntityListBySpecifiedPrefabId([target],1077936144).length!==1)continue;
    if(f.getCustomVariable(target,'marks').asType('int')>=f.getCustomVariable(target,'tough').asType('int'))continue;
    f.setCustomVariable(target,'marks',f.getCustomVariable(target,'marks').asType('int')+1n,true);
    f.setCustomVariable(self,'loaded',false,true);
    f.startTimer(self,'KG_RELOAD',false,[3]);
    const from=f.split3dVector(f.getEntityLocationAndRotation(self).location);
    const arrow=f.createPrefab(1077936141,f.create3dVector(from.xComponent,from.yComponent+1.6,from.zComponent),[0,0,0],self,false,1,[] as bigint[]);
    f.switchFollowMotionDeviceTargetByEntity(arrow,target,'',[0,1,0],[0,0,0],FollowCoordinateSystem.WorldCoordinateSystem,FollowLocationType.FollowLocation);
    f.activateDisableFollowMotionDevice(arrow,true);
    
    f.printString('KG_ARROW');
  }
})
```

### _GSTS_KgArrow（40 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v5, graph "arrow": see examples/kingdom5/gen_kingdom5.py.
g.server({id:1073741834,name:'_GSTS_KgArrow'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'KG_HIT',false,[0.5]);
  f.mountLoopingSpecialEffect(10002001,evt.eventSourceEntity,'GI_RootNode',true,true,[0,0,0],[0,0,0],1,false);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  // Half a second after it was let fly the arrow has arrived, wherever the follow device has brought it: the target is
  // whoever the device follows. A Greed that reached the wall meanwhile is gone, and the arrow with it.
  const self=evt.eventSourceEntity;
  const target=f.getFollowMotionDeviceTarget(self).followTargetEntity;
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0];
  // The arrow itself goes last: its follow device is where the target is read from.
  if(!f.queryIfEntityIsOnTheField(target)){f.removeEntity(self);return;}
  f.playTimedEffects(10002077,target,'GI_RootNode',true,false,[0,1,0],[0,0,0],1,true);f.playerPlaysOneShot2dSoundEffect(player,40203n,80n,1);
  const hits=f.getCustomVariable(target,'hits').asType('int')+1n;
  f.setCustomVariable(target,'hits',hits,true);
  f.printString('KG_SHOT');
  if(hits<f.getCustomVariable(target,'tough').asType('int')){f.removeEntity(self);return;}
  f.printString('KG_KILL');
  f.hpLoss(target,f.getCreationAttribute(target).maxHp,true,false,false,DamagePopUpType.NormalPopUp);
  f.removeEntity(self);
})
```

### _GSTS_KgWall（89 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v5, graph "wall": see examples/kingdom5/gen_kingdom5.py.
g.server({id:1073741835,name:'_GSTS_KgWall'})
.on('whenEnteringCollisionTrigger',(evt,f)=>{
  const self=evt.triggerEntity,foe=evt.enteringEntity;
  if(f.getEntityListBySpecifiedPrefabId([foe],1077936143).length!==1&&f.getEntityListBySpecifiedPrefabId([foe],1077936144).length!==1)return;
  // The wall's hp is written while the Greed still exists: a value read from an entity is fetched when the node that
  // uses it runs, not where the line stands, and a removed Greed has no dmg any more (in the first full run every
  // wall stayed at 100 for that reason).
  const hp=f.getCustomVariable(self,'hp').asType('int')-f.getCustomVariable(foe,'dmg').asType('int');
  f.playTimedEffects(123,self,'GI_RootNode',true,false,[0,1,0],[0,0,0],1,true);
  f.printString('KG_WALL_HIT');
  f.setCustomVariable(self,'hp',hp,true);
  f.removeEntity(foe);
})
.on('whenCustomVariableChanges',(evt,f)=>{
  if(evt.variableName!=='hp')return;
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0],self=evt.eventSourceEntity;
  // The event is typed: read the value as the variable's own type.
  const hp=evt.postChangeValue.asType('int');
  if(hp>0n){
    f.setCustomVariable(player,'wall',hp*100n/f.getCustomVariable(self,'full').asType('int'),true);
    f.playerPlaysOneShot2dSoundEffect(player,50425n,90n,1);
    return;
  }
  f.setCustomVariable(player,'wall',0n,true);
  f.playerPlaysOneShot2dSoundEffect(player,50146n,100n,1);
  for(const site of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936138)){f.playTimedEffects(10001031,site,'GI_RootNode',true,false,[3,0,-4.3],[0,0,0],1,true);}
  f.sendSignal('KG_wall_down');
  f.printString('KG_WALL_DOWN');
  f.destroyEntity(self);
})
.onSignal('KG_dawn',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0];
  if(f.getCustomVariable(player,'builders').asType('int')<1n)return;
  const self=f.getSelfEntity();
  if(f.getCustomVariable(self,'hp').asType('int')>=f.getCustomVariable(self,'full').asType('int'))return;
  f.setCustomVariable(self,'hp',f.getCustomVariable(self,'full').asType('int'),true);
  f.playTimedEffects(141,self,'GI_RootNode',true,false,[0,0,0],[0,0,0],1,true);f.playerPlaysOneShot2dSoundEffect(player,50918n,70n,1);
  f.printString('KG_MENDED');
})
```

### _GSTS_KgGreed（121 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v5, graph "greed": see examples/kingdom5/gen_kingdom5.py.
g.server({id:1073741836,name:'_GSTS_KgGreed'})
.on('whenEntityIsCreated',(evt,f)=>{
  // An order given the moment a creature appears is not taken (seen in play): the first one comes a second later, and
  // then one every three seconds, in case a wall was built or fell meanwhile.
  f.startTimer(evt.eventSourceEntity,'KG_AIM',false,[1]);
  f.startTimer(evt.eventSourceEntity,'KG_HUNT',true,[3]);
  f.playTimedEffects(33,evt.eventSourceEntity,'GI_RootNode',true,false,[0,0,0],[0,0,0],1,true);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  const self=evt.eventSourceEntity;
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0];
  if(evt.timerName==='KG_GRAB'){
    // The grab ends: the crown is gone unless the monarch ran out of reach, or found a coin to throw meanwhile.
    if(f.getAllEntitiesWithinTheCollisionTrigger(self,1n).length<1){f.printString('KG_ESCAPED');return;}
    const coins=f.getCustomVariable(player,'coins').asType('int');
    if(coins>0n){
      f.setCustomVariable(player,'coins',coins-1n,true);
      f.playerPlaysOneShot2dSoundEffect(player,50936n,100n,1);
      f.printString('KG_STOLEN');
      f.removeEntity(self);
      return;
    }
    f.printString('KG_CROWN_LOST');
    for(const crown of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936142))f.switchFollowMotionDeviceTargetByEntity(crown,self,'',[0,2.6,0],[0,0,0],FollowCoordinateSystem.WorldCoordinateSystem,FollowLocationType.FollowLocation);
    f.playerPlaysOneShot2dSoundEffect(player,50919n,100n,1);
    f.startTimer(self,'KG_LOST',false,[2]);
    return;
  }
  if(evt.timerName==='KG_LOST'){
    f.setPlayerSettlementSuccessStatus(player,SettlementStatus.Defeat);
    f.settleStage();
    return;
  }
  const wood=f.getEntitiesWithSpecifiedPrefabOnTheField(1077936139);
  const stone=f.getEntitiesWithSpecifiedPrefabOnTheField(1077936140);
  for(const piece of wood)f.setTheAggroValueOfSpecifiedEntity(piece,self,100000n);
  for(const piece of stone)f.setTheAggroValueOfSpecifiedEntity(piece,self,100000n);
  if(wood.length>0)return;
  if(stone.length>0)return;
  for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0]))f.setTheAggroValueOfSpecifiedEntity(hero,self,100000n);
})
.onSignal('KG_wall_down',(evt,f)=>{
  const self=f.getSelfEntity();
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0]))f.setTheAggroValueOfSpecifiedEntity(hero,self,100000n);
})
.on('whenEnteringCollisionTrigger',(evt,f)=>{
  // A Greed never lands a blow: it stops three or four metres from the monarch and swings at the air (seen in play), so
  // "it reached the monarch" is its own trigger for characters, 4.5 m around it. It takes what it can carry and
  // vanishes; at an empty purse it starts to grab the crown, which takes a few seconds.
  const self=evt.triggerEntity,hero=evt.enteringEntity;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(hero as any);
  const coins=f.getCustomVariable(player,'coins').asType('int');
  if(coins>0n){
    // The purse is written before the Greed goes (see the wall graph: what is read from it must be used first).
    const take=f.getCustomVariable(self,'dmg').asType('int');
    f.playTimedEffects(10001041,hero,'GI_RootNode',true,false,[0,1,0],[0,0,0],1,true);f.playerPlaysOneShot2dSoundEffect(player,50936n,100n,1);
    f.printString('KG_STOLEN');
    if(coins<take){f.setCustomVariable(player,'coins',0n,true);f.removeEntity(self);return;}
    f.setCustomVariable(player,'coins',coins-take,true);
    f.removeEntity(self);
    return;
  }
  f.playTimedEffects(10001247,hero,'GI_RootNode',true,false,[0,0,0],[0,0,0],1,true);f.playerPlaysOneShot2dSoundEffect(player,50937n,100n,1);
  f.startTimer(self,'KG_GRAB',false,[2.5]);
  f.printString('KG_GRAB');
})
.onSignal('KG_dawn',(evt,f)=>{
  f.removeEntity(f.getSelfEntity());
})
```

### _GSTS_KgPlayer（10 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v5, graph "player": see examples/kingdom5/gen_kingdom5.py.
g.server({id:1073741837,name:'_GSTS_KgPlayer'})
.on('whenCustomVariableChanges',(evt,f)=>{
  if(evt.variableName!=='coins')return;
  f.printString('KG_COINS');
  f.printString(f.dataTypeConversion(evt.postChangeValue.asType('int'),'str'));
  f.sendSignal('KG_state');
})
```
