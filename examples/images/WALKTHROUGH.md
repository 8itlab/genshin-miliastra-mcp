# 样例 images：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

A row of lives without words: three discs on a dark panel, each an image control; a graph switches them off and on (f.modifyUiControlStatusWithinTheInterfaceLayout with the control id scene_add_image returned). The level clock starts five or six seconds before the play: the first disc goes at level second 9, the second at 12, the first comes back at 15. Beside them four bars on one variable (6 of 10 from second 9): a red one that shows the value, a blue ring that says nothing, an upright one that shows the ratio on blue, and one as it comes; and a picture that starts hidden and is switched on at 12. Screenshots at play seconds 2, 5, 8 and 11. The places of a timer sequence count from 0 (IM_STEP 0, 1, 2).

## 一、工具调用顺序

1. `list_maps` `{}`
2. [UI] `scene_import_assets` `{"packs":[]}`：把上面的场景包导入并保存（演练时跳过）
3. `scene_list_entities` `{"namePrefix":"IM_"}` → `{"total":0}`
4. `scene_add_graph` `{"name":"ImLives"}` → `{"graphId":1073741825,"name":"_GSTS_ImLives"}`
5. `scene_add_image` `{"name":"IM_back","colour":"#000000","opacity":0.5,"position":[-400,360],"size":[480,80]}` → `{"name":"IM_back","controlId":1073741847}`
6. `scene_add_image` `{"name":"IM_life1","image":106025,"colour":"#e03030","position":[-380,360],"size":[56,56]}` → `{"name":"IM_life1","controlId":1073741850}`
7. `scene_add_image` `{"name":"IM_life2","image":106025,"colour":"#e03030","position":[-300,360],"size":[56,56]}` → `{"name":"IM_life2","controlId":1073741853}`
8. `scene_add_image` `{"name":"IM_life3","image":106025,"colour":"#e03030","position":[-220,360],"size":[56,56]}` → `{"name":"IM_life3","controlId":1073741856}`
9. `scene_add_image` `{"name":"IM_late","image":109069,"position":[320,340],"size":[80,80],"hidden":true}` → `{"name":"IM_late","controlId":1073741859}`
10. `scene_add_progress_bar` `{"name":"IM_bar","variable":"IM_hp","min":0,"max":10,"position":[-540,360],"size":[160,40],"shows":"value","colour":"#e03030"}` → `{"name":"IM_bar","controlId":1073741862}`
11. `scene_add_progress_bar` `{"name":"IM_ring","variable":"IM_hp","min":0,"max":10,"position":[-100,360],"size":[70,70],"shape":"ring","shows":"nothing","colour":"#40a0ff"}` → `{"name":"IM_ring","controlId":1073741865}`
12. `scene_add_progress_bar` `{"name":"IM_tall","variable":"IM_hp","min":0,"max":10,"position":[0,340],"size":[40,110],"shape":"vertical","shows":"ratio","backColour":"#2040c0"}` → `{"name":"IM_tall","controlId":1073741868}`
13. `scene_add_progress_bar` `{"name":"IM_plain","variable":"IM_hp","min":0,"max":10,"position":[160,360],"size":[160,40]}` → `{"name":"IM_plain","controlId":1073741871}`
14. `scene_list_prefabs` `{}`
15. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, …]}`：把每张图的源码编译并写进存档，返回可以试玩的存档。
16. `scene_list_components` `{"prefab":"player"}`
17. `inspect_map` `{}`
18. [UI] `playtest_start` `{"graphNames":["_GSTS_ImLives"],"durationSeconds":13,"screenshotsAt":[2,5,8,11],"inputs":[]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 1 张，合计 28 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_ImLives（28 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { UIControlGroupStatus } from 'genshin-ts/definitions/enum'

// Images, graph "lives": see examples/images/gen_images.py.
g.server({id:1073741825,name:'_GSTS_ImLives'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'IM_STEP',false,[9,12,15]);
  f.printString('IM_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='IM_STEP')return;
  const players=f.getListOfPlayerEntitiesOnTheField();
  f.printString('IM_STEP');f.printString(f.dataTypeConversion(evt.timerSequenceId,'str'));
  for(const player of players){
    f.setCustomVariable(player,'IM_hp',6n,true);
    if(evt.timerSequenceId===0n)f.modifyUiControlStatusWithinTheInterfaceLayout(player,1073741850n,UIControlGroupStatus.Off);
    if(evt.timerSequenceId===1n)f.modifyUiControlStatusWithinTheInterfaceLayout(player,1073741853n,UIControlGroupStatus.Off);
    if(evt.timerSequenceId===1n)f.modifyUiControlStatusWithinTheInterfaceLayout(player,1073741859n,UIControlGroupStatus.On);
    if(evt.timerSequenceId===2n)f.modifyUiControlStatusWithinTheInterfaceLayout(player,1073741850n,UIControlGroupStatus.On);
  }
})
```
