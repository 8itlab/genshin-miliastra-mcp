# 样例 fitting：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。

## 这个样例是什么

The fitting room: complex creatures stand in front of the camera, as their models come and with tools in the hand, and play one animation each, booth after booth (fit_spec.py says which). It is how an attack is made to match its animation before it goes into a game: what the model holds, what a mounted weapon looks like in the hand, at which millisecond the stroke lands, how far it carries the creature. The whole play is photographed eight times a second (bursts): playtest_frames {runId, fromSeconds, toSeconds, crop} puts a booth's frames side by side, each labelled with its play second to a hundredth. Prints: FT <booth> when a booth opens (the log's clock runs five to six seconds ahead of the play seconds of the frames), FT_S every time a skill's graph runs: at the moment given as graphAtMs, and once for every moment when a list was given (a triple stroke with three moments prints three times each time it plays). To look at other creatures or animations, change SHOWS and MOMENTS in fit_spec.py and run make_fit.py; creature_animations lists the animations of a creature and what was already seen of them.

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":3.5}`
3. `editor_open_map` `{}`
4. `scene_build_blocks` `{"name":"Fitting","blocks":[{"template":30007001,"name":"FT_hili_src","position":[-12,0,-31],"createAtStart":false}]}` → `{"name":"Fitting"}`
5. `scene_import_assets` `{"packs":["Fitting"]}`
6. `scene_list_entities` `{"namePrefix":"FT_"}` → `{"total":1}`
7. `scene_add_prefab` `{"fromEntity":"FT_hili_src","name":"FT_hili"}` → `{"name":"FT_hili","prefabId":1082130434}`
8. `scene_set_spawn` `{"position":[-25,0.4,-26],"rotation":[0,0,0]}` → `{"pointId":1073741825}`
9. `scene_add_graph` `{"name":"FtStage"}` → `{"graphId":1073741825,"name":"_GSTS_FtStage"}`
10. `scene_add_graph` `{"name":"FtUnit","attachToPrefab":["FT_hili"]}` → `{"graphId":1073741826,"name":"_GSTS_FtUnit"}`
11. `scene_add_graph` `{"name":"FtSkill","kind":"creatureSkill"}` → `{"graphId":1082130433,"name":"_GSTS_FtSkill"}`
12. `scene_add_graph` `{"name":"FtMind","kind":"creatureDecision"}` → `{"graphId":1082130434,"name":"_GSTS_FtMind"}`
13. `scene_add_graph` `{"name":"FtShow","kind":"creatureStatus"}` → `{"graphId":1082130435,"name":"_GSTS_FtShow"}`
14. `scene_add_creature_skill` `{"name":"FT_hili_1","creature":30007001,"animation":"攻击","graphAtMs":1050,"graphId":1082130433}` → `{"graphId":1082130433,"name":"FT_hili_1","skillId":1191182337}`
15. `scene_add_creature_skill` `{"name":"FT_hili_2","creature":30007001,"animation":"单手武器_三连击","graphAtMs":[350,900,1700],"graphId":1082130433}` → `{"graphId":1082130433,"name":"FT_hili_2","skillId":1191182338}`
16. `scene_set_creature_logic` `{"prefab":"FT_hili","skills":[{"skill":"FT_hili_1","cooldownSeconds":[0.6,0.6]},{"skill":"FT_hili_2","cooldownSeconds":[0.6,0.6]}],"decisionGraphId":1082130434}`
17. `scene_add_components` `{"entity":"关卡实体","variables":[{"name":"booth","type":"integer","value":-1},{"name":"t","type":"integer","value":0}]}`
18. `scene_add_components` `{"prefab":"FT_hili","variables":[{"name":"k","type":"integer","value":-2},{"name":"s","type":"integer","value":0}]}`
19. `scene_list_prefabs` `{}`
20. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, … 共 5 张]}`：对每张图依次编译并写进存档，返回全部写好、可以试玩的存档。
   一张图一张图调的时候，是对每张图做这五步：`create_project` `{projectId, mapPath, targetGraphId}` → `update_logic` `{projectId, code}` → `build_project` `{projectId}` → `preview_changes` `{projectId, buildId, destination:"copy"}` → `apply_build` `{projectId, buildId, destination:"copy", expectedSha256}`。
21. `playtest_start` `{"graphNames":["_GSTS_FtStage","_GSTS_FtUnit"],"durationSeconds":32,"screenshotsAt":[4,30],"bursts":[{"from":1,"to":31,"everyMs":125}],"burstWidth":1600,"inputs":[],"readTextAt":[],"recordAudio":false,"bakeNavigation":false}`

## 二、各张节点图的源码

一共 5 张，合计 129 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_FtStage（107 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

g.server({id:1073741825,name:'_GSTS_FtStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'FT_TICK',true,[1]);
  f.printString('FT_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const stage=evt.eventSourceEntity,side=f.queryEntityFaction(players[0]);
  const t=f.getCustomVariable(stage,'t').asType('int')+1n;
  f.setCustomVariable(stage,'t',t,true);
  if(t===1n){const c0_0=f.createPrefab(1082130434,[-26.5,0.4,-22],[0,155,0],stage,false,1,[] as bigint[]);f.modifyEntityFaction(c0_0,side);f.setCustomVariable(c0_0,'k',0n,true);f.setCustomVariable(c0_0,'s',1n,true);const c0_1=f.createPrefab(1082130434,[-23.5,0.4,-22],[0,155,0],stage,false,1,[] as bigint[]);f.modifyEntityFaction(c0_1,side);f.setCustomVariable(c0_1,'k',0n,true);f.setCustomVariable(c0_1,'s',1n,true);f.mountLoopingSpecialEffect(10002151,c0_1,'GI_WeaponR',true,true,[0,0,0],[0,0,0],0.55,false);return;}
  if(t===8n){f.teleportPlayer(players[0],[-25,0.6,-26],[0,0,0]);f.setCustomVariable(stage,'booth',0n,true);f.printString('FT');f.printString('0');const c1_0=f.createPrefab(1082130434,[-18.5,0.4,-22],[0,105,0],stage,false,1,[] as bigint[]);f.modifyEntityFaction(c1_0,side);f.setCustomVariable(c1_0,'k',1n,true);f.setCustomVariable(c1_0,'s',1n,true);f.mountLoopingSpecialEffect(10002151,c1_0,'GI_WeaponR',true,true,[0,0,0],[0,0,0],0.55,false);const c1_1=f.createPrefab(1082130434,[-11.5,0.4,-19.5],[0,255,0],stage,false,1,[] as bigint[]);f.modifyEntityFaction(c1_1,side);f.setCustomVariable(c1_1,'k',1n,true);f.setCustomVariable(c1_1,'s',1n,true);f.mountLoopingSpecialEffect(10002151,c1_1,'GI_WeaponR',true,true,[0,0,0],[0,0,0],0.55,false);return;}
  if(t===14n){f.teleportPlayer(players[0],[-15,0.6,-26],[0,0,0]);f.setCustomVariable(stage,'booth',1n,true);f.printString('FT');f.printString('1');const c2_0=f.createPrefab(1082130434,[-8.5,0.4,-22],[0,105,0],stage,false,1,[] as bigint[]);f.modifyEntityFaction(c2_0,side);f.setCustomVariable(c2_0,'k',2n,true);f.setCustomVariable(c2_0,'s',2n,true);f.mountLoopingSpecialEffect(10002151,c2_0,'GI_WeaponR',true,true,[0,0,0],[0,0,0],0.55,false);const c2_1=f.createPrefab(1082130434,[-1.5,0.4,-19.5],[0,255,0],stage,false,1,[] as bigint[]);f.modifyEntityFaction(c2_1,side);f.setCustomVariable(c2_1,'k',2n,true);f.setCustomVariable(c2_1,'s',2n,true);f.mountLoopingSpecialEffect(10002151,c2_1,'GI_WeaponR',true,true,[0,0,0],[0,0,0],0.55,false);return;}
  if(t===20n){f.teleportPlayer(players[0],[-5,0.6,-26],[0,0,0]);f.setCustomVariable(stage,'booth',2n,true);f.printString('FT');f.printString('2');return;}
  if(t===27n){f.setCustomVariable(stage,'booth',-1n,true);f.printString('FT_END');}
})
```

### _GSTS_FtUnit（2 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

g.server({id:1073741826,name:'_GSTS_FtUnit'})
.on('whenSkillNodeIsCalled',(evt,f)=>{
  f.printString('FT_S');
})
```

### _GSTS_FtSkill（2 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

g.creationSkill({id:1082130433,name:'_GSTS_FtSkill',prefix:false}).on('start',(evt,f)=>{
  f.notifyServerNodeGraph('s','','');
})
```

### _GSTS_FtMind（2 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

g.creationStatusDecision({id:1082130434,name:'_GSTS_FtMind',prefix:false}).on('start1',(evt,f)=>{
  f.switchToSelfExecutionStatus(true,1082130435,1n);
})
```

### _GSTS_FtShow（16 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

g.creationStatus({id:1082130435,name:'_GSTS_FtShow',prefix:false}).on('start1',(evt,f)=>{
  f.executeSkill(f.getCustomVariable(TargetEntity.StageEntity,'booth').asType('int')===f.getCustomVariable(TargetEntity.Self,'k').asType('int')&&f.getCustomVariable(TargetEntity.Self,'s').asType('int')===1n,1n);
  f.executeSkill(f.getCustomVariable(TargetEntity.StageEntity,'booth').asType('int')===f.getCustomVariable(TargetEntity.Self,'k').asType('int')&&f.getCustomVariable(TargetEntity.Self,'s').asType('int')===2n,2n);
  f.tacticStandStill(true,'still',false);
})
```
