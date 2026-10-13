# 样例 brain：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。

## 这个样例是什么

Complex creatures (复杂造物) run by graphs, a first try in the game: scene_add_creature_skill, scene_set_creature_logic and the three kinds of creature graph. A scout is ordered about through custom variables (walk to x 12, work, walk back to x 0, stroll); an archer is given an enemy as its target and shoots. What to look for in the prints: BR_AT shows the scout's x going from 2 to 12 after BR_ORDER 0 and back to 0 after BR_ORDER 2; BR_SIGNAL work after BR_ORDER 1; BR_SIGNAL shoot after BR_FOE. BR_CALL shows that a creature's own server graph hears its skill (whenSkillNodeIsCalled). The level's navigation mesh is baked before the playtest (bakeNavigation): without it the scout does not stroll.

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":14,"yawRange":[0,0]}`
3. `editor_open_map` `{}`
4. `scene_build_blocks` `{"name":"Brain_Probe","blocks":[{"template":"石质墙体（灰）","name":"BR_post_a","position":[0,0,5.5],"size":[0.4,2,0.4]},{"template":"石质墙体（灰）","name":"BR_post_b","position":[12,0,5.5],"size":[0.4,3,0.4]},{"template":30006009,"name":"BR_scout_src","position":[5,0,14],"createAtStart":false},"… 2 more pieces of the same form"]}` → `{"name":"Brain_Probe"}`
5. `scene_import_assets` `{"packs":["Brain_Probe"]}`
6. `scene_list_entities` `{"namePrefix":"BR_"}` → `{"total":5}`
7. `scene_add_prefab` `{"fromEntity":"BR_archer_src","name":"BR_archer"}` → `{"name":"BR_archer","prefabId":1082130436}`
8. `scene_add_prefab` `{"fromEntity":"BR_scout_src","name":"BR_scout"}` → `{"name":"BR_scout","prefabId":1082130437}`
9. `scene_add_prefab` `{"fromEntity":"BR_foe_src","name":"BR_foe"}` → `{"name":"BR_foe","prefabId":1082130438}`
10. `scene_set_faction_hostility` `{"hostilePairs":[[1,3]]}`
11. `scene_set_level_settings` `{"aggroMode":"custom"}`
12. `scene_set_spawn` `{"position":[6,0.4,0],"rotation":[0,0,0]}` → `{"pointId":1073741825}`
13. `scene_add_signal` `{"name":"BR_work"}` → `{"name":"BR_work"}`
14. `scene_add_signal` `{"name":"BR_shoot"}` → `{"name":"BR_shoot"}`
15. `scene_add_graph` `{"name":"BrStage"}` → `{"graphId":1073741825,"name":"_GSTS_BrStage"}`
16. `scene_add_graph` `{"name":"BrUnit","attachToPrefab":["BR_scout","BR_archer"]}` → `{"graphId":1073741826,"name":"_GSTS_BrUnit"}`
17. `scene_add_graph` `{"name":"BrScoutMind","kind":"creatureDecision"}` → `{"graphId":1082130433,"name":"_GSTS_BrScoutMind"}`
18. `scene_add_graph` `{"name":"BrArcherMind","kind":"creatureDecision"}` → `{"graphId":1082130434,"name":"_GSTS_BrArcherMind"}`
19. `scene_add_graph` `{"name":"BrGo","kind":"creatureStatus"}` → `{"graphId":1082130435,"name":"_GSTS_BrGo"}`
20. `scene_add_graph` `{"name":"BrWork","kind":"creatureStatus"}` → `{"graphId":1082130436,"name":"_GSTS_BrWork"}`
21. `scene_add_graph` `{"name":"BrStroll","kind":"creatureStatus"}` → `{"graphId":1082130437,"name":"_GSTS_BrStroll"}`
22. `scene_add_graph` `{"name":"BrShoot","kind":"creatureStatus"}` → `{"graphId":1082130438,"name":"_GSTS_BrShoot"}`
23. `scene_add_graph` `{"name":"BrStand","kind":"creatureStatus"}` → `{"graphId":1082130439,"name":"_GSTS_BrStand"}`
24. `scene_add_graph` `{"name":"BrWorkSkill","kind":"creatureSkill"}` → `{"graphId":1082130440,"name":"_GSTS_BrWorkSkill"}`
25. `scene_add_graph` `{"name":"BrShootSkill","kind":"creatureSkill"}` → `{"graphId":1082130441,"name":"_GSTS_BrShootSkill"}`
26. `scene_add_creature_skill` `{"name":"BR_work","creature":30006009,"animation":6009001,"graphId":1082130440}` → `{"graphId":1082130440,"name":"BR_work","skillId":1191182337}`
27. `scene_add_creature_skill` `{"name":"BR_shoot","creature":30006001,"animation":6001001,"graphId":1082130441}` → `{"graphId":1082130441,"name":"BR_shoot","skillId":1191182338}`
28. `scene_set_creature_logic` `{"prefab":"BR_archer","skills":[{"skill":"BR_shoot"}],"decisionGraphId":1082130434}`
29. `scene_set_creature_logic` `{"prefab":"BR_scout","skills":[{"skill":"BR_work"}],"decisionGraphId":1082130433}`
30. `scene_add_components` `{"prefab":"BR_scout","variables":[{"name":"duty","type":"integer","value":0},{"name":"px","type":"float","value":2},{"name":"pz","type":"float","value":3}]}`
31. `scene_list_prefabs` `{}`
32. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, … 共 11 张]}`：对每张图依次编译并写进存档，返回全部写好、可以试玩的存档。
   一张图一张图调的时候，是对每张图做这五步：`create_project` `{projectId, mapPath, targetGraphId}` → `update_logic` `{projectId, code}` → `build_project` `{projectId}` → `preview_changes` `{projectId, buildId, destination:"copy"}` → `apply_build` `{projectId, buildId, destination:"copy", expectedSha256}`。
33. `playtest_start` `{"graphNames":["_GSTS_BrStage","_GSTS_BrUnit"],"durationSeconds":56,"screenshotsAt":[5,7,10,12,14,16,19,21,23,27,30,33,36,38,40,42,44,46,50],"inputs":[],"readTextAt":[],"recordAudio":false,"bakeNavigation":true}`

## 二、各张节点图的源码

一共 11 张，合计 153 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_BrStage（112 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Brain, graph "stage": see examples/brain/gen_brain.py.
g.server({id:1073741825,name:'_GSTS_BrStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'BR_GO',false,[3]);
  f.printString('BR_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const stage=evt.eventSourceEntity,side=f.queryEntityFaction(players[0]);
  if(evt.timerName==='BR_GO'){
    // The two units stand on the player's side, or they would go for the player.
    const scout=f.createPrefab(1082130437,[2,0.4,3],[0,0,0],stage,false,1,[] as bigint[]);
    const archer=f.createPrefab(1082130436,[9,0.4,6],[0,0,0],stage,false,1,[] as bigint[]);
    f.modifyEntityFaction(scout,side);f.modifyEntityFaction(archer,side);
    f.startTimer(stage,'BR_TICK',true,[2]);
    f.startTimer(stage,'BR_PLAN',false,[8,16,24,32,42]);
    f.printString('BR_GO');
    return;
  }
  const scouts=f.getEntitiesWithSpecifiedPrefabOnTheField(1082130437),archers=f.getEntitiesWithSpecifiedPrefabOnTheField(1082130436);
  if(evt.timerName==='BR_TICK'){
    f.printString('BR_AT');
    for(const scout of scouts){f.printString(f.dataTypeConversion(f.split3dVector(f.getEntityLocationAndRotation(scout).location).xComponent,'str'));f.printString(f.dataTypeConversion(f.split3dVector(f.getEntityLocationAndRotation(scout).location).zComponent,'str'));}
    for(const archer of archers){f.printString(f.dataTypeConversion(f.split3dVector(f.getEntityLocationAndRotation(archer).location).xComponent,'str'));f.printString(f.dataTypeConversion(f.split3dVector(f.getEntityLocationAndRotation(archer).location).zComponent,'str'));}
    return;
  }
  if(evt.timerName!=='BR_PLAN')return;
  // Orders are custom variables on the unit: its decision graph reads them.
  if(evt.timerSequenceId===0n){for(const scout of scouts){f.setCustomVariable(scout,'px',12,true);f.setCustomVariable(scout,'pz',3,true);f.setCustomVariable(scout,'duty',1n,true);}f.printString('BR_ORDER');f.printString('0');return;}
  if(evt.timerSequenceId===1n){for(const scout of scouts)f.setCustomVariable(scout,'duty',2n,true);f.printString('BR_ORDER');f.printString('1');return;}
  if(evt.timerSequenceId===2n){for(const scout of scouts){f.setCustomVariable(scout,'px',0,true);f.setCustomVariable(scout,'pz',3,true);f.setCustomVariable(scout,'duty',1n,true);}f.printString('BR_ORDER');f.printString('2');return;}
  if(evt.timerSequenceId===3n){
    // A creature of the other side appears twelve metres from the archer, which is given it as its target.
    for(const scout of scouts)f.setCustomVariable(scout,'duty',0n,true);
    const foe=f.createPrefab(1082130438,[17,0.4,2],[0,-90,0],stage,false,1,[] as bigint[]);
    for(const archer of archers)f.setTheAggroValueOfSpecifiedEntity(foe,archer,1000n);
    f.printString('BR_FOE');f.printString('BR_ORDER');f.printString('3');
    return;
  }
  for(const foe of f.getEntitiesWithSpecifiedPrefabOnTheField(1082130438))f.removeEntity(foe);
  f.printString('BR_FOE_GONE');
})
.onSignal('BR_work',(evt,f)=>{f.printString('BR_SIGNAL');f.printString('work');})
.onSignal('BR_shoot',(evt,f)=>{f.printString('BR_SIGNAL');f.printString('shoot');})
```

### _GSTS_BrUnit（3 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Brain, graph "unit": see examples/brain/gen_brain.py.
g.server({id:1073741826,name:'_GSTS_BrUnit'})
.on('whenSkillNodeIsCalled',(evt,f)=>{
  f.printString('BR_CALL');f.printString(evt.parameter1);
})
```

### _GSTS_BrScoutMind（9 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Brain, graph "scoutMind": see examples/brain/gen_brain.py.
g.creationStatusDecision({id:1082130433,name:'_GSTS_BrScoutMind',prefix:false}).on('start1',(evt,f)=>{
  const duty=f.getCustomVariable(TargetEntity.Self,'duty').asType('int');
  if(duty===1n){f.switchToSelfExecutionStatus(true,1082130435,1n);}
  else{
    if(duty===2n){f.switchToSelfExecutionStatus(true,1082130436,1n);}
    else{f.switchToSelfExecutionStatus(true,1082130437,1n);}
  }
})
```

### _GSTS_BrArcherMind（5 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Brain, graph "archerMind": see examples/brain/gen_brain.py.
g.creationStatusDecision({id:1082130434,name:'_GSTS_BrArcherMind',prefix:false}).on('start1',(evt,f)=>{
  if(f.queryIfEntityIsOnTheField(TargetEntity.AggroTarget)){f.switchToSelfExecutionStatus(true,1082130438,1n);}
  else{f.switchToSelfExecutionStatus(true,1082130439,1n);}
})
```

### _GSTS_BrGo（6 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Brain, graph "go": see examples/brain/gen_brain.py.
g.creationStatus({id:1082130435,name:'_GSTS_BrGo',prefix:false}).on('start1',(evt,f)=>{
  // A statement runs only if the one before it could not: standing still is what is left once the place is reached.
  const to=f.create3dVector(f.getCustomVariable(TargetEntity.Self,'px').asType('float'),0,f.getCustomVariable(TargetEntity.Self,'pz').asType('float'));
  f.tacticMoveToTheTargetPosition(true,to,1,TacticSpeed.Walk,360,'go',false);
  f.tacticStandStill(true,'there',false);
})
```

### _GSTS_BrWork（3 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Brain, graph "work": see examples/brain/gen_brain.py.
g.creationStatus({id:1082130436,name:'_GSTS_BrWork',prefix:false}).on('start1',(evt,f)=>{
  f.executeSkill(true,1n);
  f.tacticStandStill(true,'between',false);
})
```

### _GSTS_BrStroll（3 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Brain, graph "stroll": see examples/brain/gen_brain.py.
g.creationStatus({id:1082130437,name:'_GSTS_BrStroll',prefix:false}).on('start1',(evt,f)=>{
  f.tacticGroundIdleRoaming(true,TacticSpeed.Walk,4,1,3,1,3,'stroll',false);
  f.tacticStandStill(true,'pause',false);
})
```

### _GSTS_BrShoot（4 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Brain, graph "shoot": see examples/brain/gen_brain.py.
g.creationStatus({id:1082130438,name:'_GSTS_BrShoot',prefix:false}).on('start1',(evt,f)=>{
  f.executeSkill(true,1n);
  f.tacticRotateToTheTargetEntity(true,f.getTargetEntity(),360,false,'aim',false);
})
```

### _GSTS_BrStand（2 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Brain, graph "stand": see examples/brain/gen_brain.py.
g.creationStatus({id:1082130439,name:'_GSTS_BrStand',prefix:false}).on('start1',(evt,f)=>{
  f.tacticStandStill(true,'stand',false);
})
```

### _GSTS_BrWorkSkill（3 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Brain, graph "workSkill": see examples/brain/gen_brain.py.
g.creationSkill({id:1082130440,name:'_GSTS_BrWorkSkill',prefix:false}).on('start',(evt,f)=>{
  f.sendSignalToServerNodeGraph('BR_work');
  f.notifyServerNodeGraph('work','','');
})
```

### _GSTS_BrShootSkill（3 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Brain, graph "shootSkill": see examples/brain/gen_brain.py.
g.creationSkill({id:1082130441,name:'_GSTS_BrShootSkill',prefix:false}).on('start',(evt,f)=>{
  f.sendSignalToServerNodeGraph('BR_shoot');
  f.notifyServerNodeGraph('shoot','','');
})
```
