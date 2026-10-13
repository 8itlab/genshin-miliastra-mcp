# 样例 talk：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

Text bubbles (文本气泡) and nameplates (铭牌): the platform's own way to put words, icons and bars over a thing; seen in play on 2026-10-14 on an account of 奇匠 level 2. Three dolls. TK_a says two lines once and its graph is told when it has (TK_SAID 1 in the log: endEvent); over it a label that shows its custom variable ({1:s.mood}, counting up) and under the label its health bar in red with the numbers. TK_b says its line again and again; over it an icon and a bar that follows the variable mood between zero and top (70 %, then 100 %). TK_c is silent and bare until its graph switches its first bubble on and shows its nameplate (level second 16), and switches to its second bubble (second 24). A fourth doll, TK_d, stands twenty metres off: its nameplate is too far to show, and its navigation indicator points to it with the distance ({2:PDist} 米). The player's own character carries one too (prefab "character": 旅行者 10000 / 10000 over its head, {2:HpCur} / {2:HpMax}). Everything hangs above: metres over the foot, which makes a custom attach point; a bubble hung at the foot is inside the model and is not seen. The offsets of the items of a nameplate are in screen units. All of it is scene_add_components {textBubbles, nameplates}; the graph uses f.switchActiveTextBubble, f.setEntityActiveNameplate and whenTextBubbleIsCompleted.

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":7,"yawRange":[0,0]}`
3. [UI] `editor_open_map` `{mapPath}`：在编辑器里打开底图的副本（演练时跳过）
4. `scene_build_blocks` `{"name":"Talk","blocks":[{"template":"石质墙体（灰）","name":"TK_floor","position":[0,-0.4,3],"size":[24,0.4,18]}]}` → `{"name":"Talk"}`
5. [UI] `scene_import_assets` `{"packs":["Talk"]}`：把上面的场景包导入并保存（演练时跳过）
6. `scene_list_entities` `{"namePrefix":"TK_"}` → `{"total":0}`
7. `scene_add_prefab` `{"asset":10005071,"name":"TK_a","scale":1.5}` → `{"name":"TK_a","prefabId":1077936129}`
8. `scene_add_prefab` `{"asset":10005071,"name":"TK_b","scale":1.5}` → `{"name":"TK_b","prefabId":1077936130}`
9. `scene_add_prefab` `{"asset":10005071,"name":"TK_c","scale":1.5}` → `{"name":"TK_c","prefabId":1077936131}`
10. `scene_add_prefab` `{"asset":10005071,"name":"TK_d","scale":1.5}` → `{"name":"TK_d","prefabId":1077936132}`
11. `scene_set_spawn` `{"position":[0,0.4,0],"rotation":[0,0,0]}` → `{"pointId":1073741825}`
12. `scene_set_class` `{"allowClimb":false}`
13. `scene_add_graph` `{"name":"TkStage"}` → `{"graphId":1073741825,"name":"_GSTS_TkStage"}`
14. `scene_add_graph` `{"name":"TkNpc","attachToPrefab":["TK_a","TK_b","TK_c"]}` → `{"graphId":1073741826,"name":"_GSTS_TkNpc"}`
15. `scene_add_components` `{"prefab":"TK_a","variables":[{"name":"mood","type":"integer","value":0},{"name":"zero","type":"integer","value":0},{"name":"top","type":"integer","value":10},{"name":"late","type":"integer","value":0}],"textBubbles":[{"active":true,"above":1.5,"radius":20,"loop":false,"endEvent":true,"lines":[{"text":"你好，我是甲","seconds":2},{"text":"今天天气不错","seconds":2}]}],"nameplates":[{"above":1.3,"radius":20,"items":[{"text":"甲 心情 {1:s.mood}","fontSize":24,"size":[240,40]},{"health":{"numbers":true,"colour":"red"},"size":[120,10],"offset":[0,-36]}]}]}`
16. `scene_add_components` `{"prefab":"TK_b","variables":[{"name":"mood","type":"integer","value":0},{"name":"zero","type":"integer","value":0},{"name":"top","type":"integer","value":10},{"name":"late","type":"integer","value":0}],"textBubbles":[{"active":true,"above":1.5,"radius":20,"lines":[{"text":"我是乙，头顶有图标和条","seconds":3}]}],"nameplates":[{"above":1.3,"radius":20,"items":[{"icon":11044,"size":[40,40],"offset":[-90,0]},{"bar":{"current":"mood","min":"zero","max":"top"},"size":[120,14]}]}]}`
17. `scene_add_components` `{"prefab":"TK_c","variables":[{"name":"mood","type":"integer","value":0},{"name":"zero","type":"integer","value":0},{"name":"top","type":"integer","value":10},{"name":"late","type":"integer","value":1}],"textBubbles":[{"above":1.5,"radius":20,"lines":[{"text":"我是丙，来晚了","seconds":2}]},{"above":1.5,"radius":20,"lines":[{"text":"现在说第二句","seconds":2}]}],"nameplates":[{"active":false,"above":1.3,"radius":20,"items":[{"text":"丙","fontSize":30,"size":[120,40]}]}]}`
18. `scene_add_components` `{"prefab":"TK_d","nameplates":[{"above":1.3,"radius":6,"items":[{"text":"丁"}],"indicator":{"text":"{2:PDist} 米","icon":11044,"min":6,"max":80}}]}`
19. `scene_add_components` `{"prefab":"character","nameplates":[{"above":1.9,"radius":20,"items":[{"text":"旅行者 {2:HpCur} / {2:HpMax}","fontSize":22,"size":[300,34]}]}]}`
20. `scene_list_prefabs` `{}`
21. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, … 共 2 张]}`：对每张图依次编译并写进存档，返回全部写好、可以试玩的存档。
22. `scene_list_components` `{"prefab":"TK_a"}`
23. `inspect_map` `{}`
24. [UI] `playtest_start` `{"graphNames":["_GSTS_TkStage","_GSTS_TkNpc"],"durationSeconds":26,"screenshotsAt":[3,6,14,22],"inputs":[]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 2 张，合计 50 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_TkStage（16 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Talk, graph "stage": see examples/talk/gen_talk.py.
g.server({id:1073741825,name:'_GSTS_TkStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  const stage=evt.eventSourceEntity;
  f.createPrefab(1077936129,[-3,0,4],[0,180,0],stage,false,1,[] as bigint[]);
  f.createPrefab(1077936130,[0,0,4],[0,180,0],stage,false,1,[] as bigint[]);
  f.createPrefab(1077936131,[3,0,4],[0,180,0],stage,false,1,[] as bigint[]);
  f.createPrefab(1077936132,[7,0,20],[0,180,0],stage,false,1,[] as bigint[]);
  f.printString('TK_READY');
})
```

### _GSTS_TkNpc（34 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Talk, graph "npc": see examples/talk/gen_talk.py.
g.server({id:1073741826,name:'_GSTS_TkNpc'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'TK_MOOD',true,[1]);
  f.startTimer(evt.eventSourceEntity,'TK_LATE',false,[16,24]);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  const self=evt.eventSourceEntity;
  if(evt.timerName==='TK_MOOD'){
    const mood=f.getCustomVariable(self,'mood').asType('int');
    if(mood<10n)f.setCustomVariable(self,'mood',mood+1n,true);
  }
  if(evt.timerName==='TK_LATE'){
    if(f.getCustomVariable(self,'late').asType('int')===1n){
      if(evt.timerSequenceId===0n){
        f.switchActiveTextBubble(self,1n);
        f.setEntityActiveNameplate(self,f.assemblyList([1n],'config_id'));
        f.printString('TK_SWITCHED 1');
      }else{
        f.switchActiveTextBubble(self,2n);
        f.printString('TK_SWITCHED 2');
      }
    }
  }
})
.on('whenTextBubbleIsCompleted',(evt,f)=>{
  f.printString('TK_SAID');f.printString(f.dataTypeConversion(evt.textBubbleCompletionCount,'str'));
})
```
