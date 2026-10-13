# 样例 presets：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

Finds out in the game whether mechanism assets the official samples never touch have a preset status under the id the others follow, (asset id - 4000) x 10, and what values 1 and 2 do. scene_add_prefab registers the guessed id (presetStatusId); an id the asset does not have makes the editor's playtest check fail and name the prefab, so the wrong guesses were taken out one playtest at a time. As it stands (2026-10-11): five of the thirty-two have no such id and carry none here (10005023, 10005093, 10005142, 10006001, 10006002); the other twenty-seven take value 1, two of them also value 2 (knowledge/notes/preset-status.zh-CN.md). Four things at a time in front of the camera, six seconds each group: value 0, then 1, then 2, read back each time. One graph is shared by all thirty-two prefabs. Prints: PS_READY, PS_GROUP n, PS_V <asset> <value> (twice per thing: after setting 1, after setting 2), PS_CHANGED <asset>.

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":15,"yawRange":[0,0]}`
3. [UI] `editor_open_map` `{mapPath}`：在编辑器里打开底图的副本（演练时跳过）
4. `scene_build_blocks` `{"name":"Presets_Probe","blocks":[{"template":"石质墙体（灰）","name":"PS_floor","position":[0,-0.4,3],"size":[34,0.4,18]}]}` → `{"name":"Presets_Probe"}`
5. [UI] `scene_import_assets` `{"packs":["Presets_Probe"]}`：把上面的场景包导入并保存（演练时跳过）
6. `scene_list_entities` `{"namePrefix":"PS_"}` → `{"total":0}`
7. `scene_add_prefab` `{"asset":10005002,"name":"PS_00_10005002","scale":1,"presetStatusId":100010020}` → `{"name":"PS_00_10005002","prefabId":1077936129}`
8. `scene_add_prefab` `{"asset":10005004,"name":"PS_01_10005004","scale":1,"presetStatusId":100010040}` → `{"name":"PS_01_10005004","prefabId":1077936130}`
9. `scene_add_prefab` `{"asset":10005016,"name":"PS_02_10005016","scale":1,"presetStatusId":100010160}` → `{"name":"PS_02_10005016","prefabId":1077936131}`
10. `scene_add_prefab` `{"asset":10005084,"name":"PS_03_10005084","scale":4,"presetStatusId":100010840}` → `{"name":"PS_03_10005084","prefabId":1077936132}`
11. `scene_add_prefab` `{"asset":10005035,"name":"PS_04_10005035","scale":1.5,"presetStatusId":100010350}` → `{"name":"PS_04_10005035","prefabId":1077936133}`
12. `scene_add_prefab` `{"asset":10005063,"name":"PS_05_10005063","scale":1,"presetStatusId":100010630}` → `{"name":"PS_05_10005063","prefabId":1077936134}`
13. `scene_add_prefab` `{"asset":10005013,"name":"PS_06_10005013","scale":1,"presetStatusId":100010130}` → `{"name":"PS_06_10005013","prefabId":1077936135}`
14. `scene_add_prefab` `{"asset":10006001,"name":"PS_07_10006001","scale":1}` → `{"name":"PS_07_10006001","prefabId":1077936136}`
15. `scene_add_prefab` `{"asset":10005083,"name":"PS_08_10005083","scale":1.5,"presetStatusId":100010830}` → `{"name":"PS_08_10005083","prefabId":1077936137}`
16. `scene_add_prefab` `{"asset":10005142,"name":"PS_09_10005142","scale":3}` → `{"name":"PS_09_10005142","prefabId":1077936138}`
17. `scene_add_prefab` `{"asset":10005096,"name":"PS_10_10005096","scale":2,"presetStatusId":100010960}` → `{"name":"PS_10_10005096","prefabId":1077936139}`
18. `scene_add_prefab` `{"asset":10006002,"name":"PS_11_10006002","scale":2.5}` → `{"name":"PS_11_10006002","prefabId":1077936140}`
19. `scene_add_prefab` `{"asset":10005093,"name":"PS_12_10005093","scale":1}` → `{"name":"PS_12_10005093","prefabId":1077936141}`
20. `scene_add_prefab` `{"asset":10005091,"name":"PS_13_10005091","scale":0.4,"presetStatusId":100010910}` → `{"name":"PS_13_10005091","prefabId":1077936142}`
21. `scene_add_prefab` `{"asset":10005079,"name":"PS_14_10005079","scale":2,"presetStatusId":100010790}` → `{"name":"PS_14_10005079","prefabId":1077936143}`
22. `scene_add_prefab` `{"asset":10005080,"name":"PS_15_10005080","scale":2,"presetStatusId":100010800}` → `{"name":"PS_15_10005080","prefabId":1077936144}`
23. `scene_add_prefab` `{"asset":10005086,"name":"PS_16_10005086","scale":1,"presetStatusId":100010860}` → `{"name":"PS_16_10005086","prefabId":1077936145}`
24. `scene_add_prefab` `{"asset":10005017,"name":"PS_17_10005017","scale":2,"presetStatusId":100010170}` → `{"name":"PS_17_10005017","prefabId":1077936146}`
25. `scene_add_prefab` `{"asset":10005029,"name":"PS_18_10005029","scale":1,"presetStatusId":100010290}` → `{"name":"PS_18_10005029","prefabId":1077936147}`
26. `scene_add_prefab` `{"asset":10005032,"name":"PS_19_10005032","scale":1,"presetStatusId":100010320}` → `{"name":"PS_19_10005032","prefabId":1077936148}`
27. `scene_add_prefab` `{"asset":10005021,"name":"PS_20_10005021","scale":1.5,"presetStatusId":100010210}` → `{"name":"PS_20_10005021","prefabId":1077936149}`
28. `scene_add_prefab` `{"asset":10005023,"name":"PS_21_10005023","scale":1}` → `{"name":"PS_21_10005023","prefabId":1077936150}`
29. `scene_add_prefab` `{"asset":10005037,"name":"PS_22_10005037","scale":1.5,"presetStatusId":100010370}` → `{"name":"PS_22_10005037","prefabId":1077936151}`
30. `scene_add_prefab` `{"asset":10005058,"name":"PS_23_10005058","scale":3,"presetStatusId":100010580}` → `{"name":"PS_23_10005058","prefabId":1077936152}`
31. `scene_add_prefab` `{"asset":10005010,"name":"PS_24_10005010","scale":2,"presetStatusId":100010100}` → `{"name":"PS_24_10005010","prefabId":1077936153}`
32. `scene_add_prefab` `{"asset":10005094,"name":"PS_25_10005094","scale":1,"presetStatusId":100010940}` → `{"name":"PS_25_10005094","prefabId":1077936154}`
33. `scene_add_prefab` `{"asset":10005052,"name":"PS_26_10005052","scale":2,"presetStatusId":100010520}` → `{"name":"PS_26_10005052","prefabId":1077936155}`
34. `scene_add_prefab` `{"asset":10005053,"name":"PS_27_10005053","scale":1.5,"presetStatusId":100010530}` → `{"name":"PS_27_10005053","prefabId":1077936156}`
35. `scene_add_prefab` `{"asset":10005012,"name":"PS_28_10005012","scale":3,"presetStatusId":100010120}` → `{"name":"PS_28_10005012","prefabId":1077936157}`
36. `scene_add_prefab` `{"asset":10005087,"name":"PS_29_10005087","scale":1,"presetStatusId":100010870}` → `{"name":"PS_29_10005087","prefabId":1077936158}`
37. `scene_add_prefab` `{"asset":10005057,"name":"PS_30_10005057","scale":0.5,"presetStatusId":100010570}` → `{"name":"PS_30_10005057","prefabId":1077936159}`
38. `scene_add_prefab` `{"asset":10005014,"name":"PS_31_10005014","scale":0.5,"presetStatusId":100010140}` → `{"name":"PS_31_10005014","prefabId":1077936160}`
39. `scene_set_spawn` `{"position":[0,0.4,0],"rotation":[0,0,0]}` → `{"pointId":1073741825}`
40. `scene_set_class` `{"allowClimb":false}`
41. `scene_add_graph` `{"name":"PsStage"}` → `{"graphId":1073741825,"name":"_GSTS_PsStage"}`
42. `scene_add_graph` `{"name":"PsThing","attachToPrefab":["PS_00_10005002","PS_01_10005004","PS_02_10005016","PS_03_10005084","PS_04_10005035","PS_05_10005063","PS_06_10005013","PS_07_10006001","PS_08_10005083","PS_09_10005142","PS_10_10005096","PS_11_10006002","PS_12_10005093","PS_13_10005091","PS_14_10005079","PS_15_10005080","PS_16_10005086","PS_17_10005017","PS_18_10005029","PS_19_10005032","PS_20_10005021","PS_21_10005023","PS_22_10005037","PS_23_10005058","PS_24_10005010","PS_25_10005094","PS_26_10005052","PS_27_10005053","PS_28_10005012","PS_29_10005087","PS_30_10005057","PS_31_10005014"]}` → `{"graphId":1073741826,"name":"_GSTS_PsThing"}`
43. `scene_add_components` `{"prefab":"PS_00_10005002","variables":[{"name":"sid","type":"integer","value":100010020},{"name":"aid","type":"integer","value":10005002}]}`
44. `scene_add_components` `{"prefab":"PS_01_10005004","variables":[{"name":"sid","type":"integer","value":100010040},{"name":"aid","type":"integer","value":10005004}]}`
45. `scene_add_components` `{"prefab":"PS_02_10005016","variables":[{"name":"sid","type":"integer","value":100010160},{"name":"aid","type":"integer","value":10005016}]}`
46. `scene_add_components` `{"prefab":"PS_03_10005084","variables":[{"name":"sid","type":"integer","value":100010840},{"name":"aid","type":"integer","value":10005084}]}`
47. `scene_add_components` `{"prefab":"PS_04_10005035","variables":[{"name":"sid","type":"integer","value":100010350},{"name":"aid","type":"integer","value":10005035}]}`
48. `scene_add_components` `{"prefab":"PS_05_10005063","variables":[{"name":"sid","type":"integer","value":100010630},{"name":"aid","type":"integer","value":10005063}]}`
49. `scene_add_components` `{"prefab":"PS_06_10005013","variables":[{"name":"sid","type":"integer","value":100010130},{"name":"aid","type":"integer","value":10005013}]}`
50. `scene_add_components` `{"prefab":"PS_07_10006001","variables":[{"name":"sid","type":"integer","value":100020010},{"name":"aid","type":"integer","value":10006001}]}`
51. `scene_add_components` `{"prefab":"PS_08_10005083","variables":[{"name":"sid","type":"integer","value":100010830},{"name":"aid","type":"integer","value":10005083}]}`
52. `scene_add_components` `{"prefab":"PS_09_10005142","variables":[{"name":"sid","type":"integer","value":100011420},{"name":"aid","type":"integer","value":10005142}]}`
53. `scene_add_components` `{"prefab":"PS_10_10005096","variables":[{"name":"sid","type":"integer","value":100010960},{"name":"aid","type":"integer","value":10005096}]}`
54. `scene_add_components` `{"prefab":"PS_11_10006002","variables":[{"name":"sid","type":"integer","value":100020020},{"name":"aid","type":"integer","value":10006002}]}`
55. `scene_add_components` `{"prefab":"PS_12_10005093","variables":[{"name":"sid","type":"integer","value":100010930},{"name":"aid","type":"integer","value":10005093}]}`
56. `scene_add_components` `{"prefab":"PS_13_10005091","variables":[{"name":"sid","type":"integer","value":100010910},{"name":"aid","type":"integer","value":10005091}]}`
57. `scene_add_components` `{"prefab":"PS_14_10005079","variables":[{"name":"sid","type":"integer","value":100010790},{"name":"aid","type":"integer","value":10005079}]}`
58. `scene_add_components` `{"prefab":"PS_15_10005080","variables":[{"name":"sid","type":"integer","value":100010800},{"name":"aid","type":"integer","value":10005080}]}`
59. `scene_add_components` `{"prefab":"PS_16_10005086","variables":[{"name":"sid","type":"integer","value":100010860},{"name":"aid","type":"integer","value":10005086}]}`
60. `scene_add_components` `{"prefab":"PS_17_10005017","variables":[{"name":"sid","type":"integer","value":100010170},{"name":"aid","type":"integer","value":10005017}]}`
61. `scene_add_components` `{"prefab":"PS_18_10005029","variables":[{"name":"sid","type":"integer","value":100010290},{"name":"aid","type":"integer","value":10005029}]}`
62. `scene_add_components` `{"prefab":"PS_19_10005032","variables":[{"name":"sid","type":"integer","value":100010320},{"name":"aid","type":"integer","value":10005032}]}`
63. `scene_add_components` `{"prefab":"PS_20_10005021","variables":[{"name":"sid","type":"integer","value":100010210},{"name":"aid","type":"integer","value":10005021}]}`
64. `scene_add_components` `{"prefab":"PS_21_10005023","variables":[{"name":"sid","type":"integer","value":100010230},{"name":"aid","type":"integer","value":10005023}]}`
65. `scene_add_components` `{"prefab":"PS_22_10005037","variables":[{"name":"sid","type":"integer","value":100010370},{"name":"aid","type":"integer","value":10005037}]}`
66. `scene_add_components` `{"prefab":"PS_23_10005058","variables":[{"name":"sid","type":"integer","value":100010580},{"name":"aid","type":"integer","value":10005058}]}`
67. `scene_add_components` `{"prefab":"PS_24_10005010","variables":[{"name":"sid","type":"integer","value":100010100},{"name":"aid","type":"integer","value":10005010}]}`
68. `scene_add_components` `{"prefab":"PS_25_10005094","variables":[{"name":"sid","type":"integer","value":100010940},{"name":"aid","type":"integer","value":10005094}]}`
69. `scene_add_components` `{"prefab":"PS_26_10005052","variables":[{"name":"sid","type":"integer","value":100010520},{"name":"aid","type":"integer","value":10005052}]}`
70. `scene_add_components` `{"prefab":"PS_27_10005053","variables":[{"name":"sid","type":"integer","value":100010530},{"name":"aid","type":"integer","value":10005053}]}`
71. `scene_add_components` `{"prefab":"PS_28_10005012","variables":[{"name":"sid","type":"integer","value":100010120},{"name":"aid","type":"integer","value":10005012}]}`
72. `scene_add_components` `{"prefab":"PS_29_10005087","variables":[{"name":"sid","type":"integer","value":100010870},{"name":"aid","type":"integer","value":10005087}]}`
73. `scene_add_components` `{"prefab":"PS_30_10005057","variables":[{"name":"sid","type":"integer","value":100010570},{"name":"aid","type":"integer","value":10005057}]}`
74. `scene_add_components` `{"prefab":"PS_31_10005014","variables":[{"name":"sid","type":"integer","value":100010140},{"name":"aid","type":"integer","value":10005014}]}`
75. `scene_list_prefabs` `{}`
76. 每张节点图各做一遍这五步（上一张 `apply_build` 返回的存档给下一张的 `create_project`）：
   - `create_project` `{"projectId":"stage","targetGraphId":"<scene_add_graph 返回的 graphId>"}`
   - `update_logic` `{projectId, code: <源码，见第二节>}`
   - `build_project` `{projectId}`：返回 buildId 和节点数、编辑器计数
   - `preview_changes` `{projectId, buildId, destination:"copy"}`：返回 expectedSha256
   - `apply_build` `{projectId, buildId, destination:"copy", expectedSha256}`：返回可以试玩的存档
   源码都写好以后，这五步可以换成一次 `write_graphs` `{mapPath, graphs:[{graphId, code}, ...]}`：它对每张图依次做同样的事，返回全部写好的存档。
77. `scene_list_components` `{"prefab":"PS_00_10005002"}`
78. `inspect_map` `{}`
79. [UI] `playtest_start` `{"graphNames":["_GSTS_PsStage","_GSTS_PsThing"],"durationSeconds":52,"screenshotsAt":[2.7,4.4,6.2,8.7,10.4,12.2,14.7,16.4,18.2,20.7,22.4,24.2,26.7,28.4,30.2,32.7,34.4,36.2,38.7,40.4,42.2,44.7,46.4,48.2],"inputs":[]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 2 张，合计 183 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_PsStage（148 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Presets, graph "stage": see examples/presets/gen_presets.py.
g.server({id:1073741825,name:'_GSTS_PsStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'PS_NEXT',false,[6,12,18,24,30,36,42,48]);
  f.printString('PS_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='PS_NEXT')return;
  const stage=evt.eventSourceEntity;
  if(evt.timerSequenceId===0n){
    f.createPrefab(1077936129,[-7.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936130,[-2.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936131,[2.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936132,[7.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.printString('PS_GROUP');f.printString('0');
    return;
  }
  if(evt.timerSequenceId===1n){
    f.createPrefab(1077936133,[-7.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936134,[-2.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936135,[2.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936136,[7.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.printString('PS_GROUP');f.printString('1');
    return;
  }
  if(evt.timerSequenceId===2n){
    f.createPrefab(1077936137,[-7.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936138,[-2.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936139,[2.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936140,[7.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.printString('PS_GROUP');f.printString('2');
    return;
  }
  if(evt.timerSequenceId===3n){
    f.createPrefab(1077936141,[-7.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936142,[-2.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936143,[2.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936144,[7.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.printString('PS_GROUP');f.printString('3');
    return;
  }
  if(evt.timerSequenceId===4n){
    f.createPrefab(1077936145,[-7.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936146,[-2.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936147,[2.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936148,[7.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.printString('PS_GROUP');f.printString('4');
    return;
  }
  if(evt.timerSequenceId===5n){
    f.createPrefab(1077936149,[-7.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936150,[-2.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936151,[2.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936152,[7.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.printString('PS_GROUP');f.printString('5');
    return;
  }
  if(evt.timerSequenceId===6n){
    f.createPrefab(1077936153,[-7.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936154,[-2.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936155,[2.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936156,[7.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.printString('PS_GROUP');f.printString('6');
    return;
  }
  if(evt.timerSequenceId===7n){
    f.createPrefab(1077936157,[-7.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936158,[-2.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936159,[2.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936160,[7.5,0,5],[0,0,0],stage,false,1,[] as bigint[]);
    f.printString('PS_GROUP');f.printString('7');
    return;
  }
})
```

### _GSTS_PsThing（35 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Presets, graph "thing": see examples/presets/gen_presets.py.
g.server({id:1073741826,name:'_GSTS_PsThing'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'PS_STEP',false,[2.5,4,5.5]);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='PS_STEP')return;
  const self=evt.eventSourceEntity;
  const sid=f.getCustomVariable(self,'sid').asType('int');
  // The places in a timer's sequence are numbered from 0.
  if(evt.timerSequenceId===0n){f.setPresetStatus(self,sid,1n);return;}
  f.printString('PS_V');f.printString(f.dataTypeConversion(f.getCustomVariable(self,'aid').asType('int'),'str'));f.printString(f.dataTypeConversion(f.getPresetStatus(self,sid),'str'));
  if(evt.timerSequenceId===1n){f.setPresetStatus(self,sid,2n);return;}
  f.removeEntity(self);
})
.on('whenPresetStatusChanges',(evt,f)=>{
  f.printString('PS_CHANGED');f.printString(f.dataTypeConversion(f.getCustomVariable(evt.eventSourceEntity,'aid').asType('int'),'str'));
})
```
