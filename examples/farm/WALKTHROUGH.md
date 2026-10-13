# 样例 farm：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

A third kind of game built with the same tools, after the structure of the official farming sample: take the rake from the rack (F), walk to a plot and use it (E) to till; fetch seeds from the basket (F), use them on the tilled plot (E); the crop grows in two steps on the plot's own timer; harvest the ripe pumpkin (F) and sell it at the stall (F) for a point. What is new here next to the other two games: a signal that carries a string (the tool in hand) from the character to whichever plot the character stands on; state on each plot (its stage, whether somebody stands on it) so that two plots do not get in each other's way; the crop's looks are prefabs owned by the plot and swapped; fruit is a currency in the character's backpack; the skill is handed out when the first tool is taken. Climbing is off and a wall stands at each end, so that the script can walk into a wall to be at a known place. Played through as designed on its first run in the game, 2026-10-11. Prints: FM_READY, FM_GO, FM_TOOL 1, FM_TILL, FM_TOOL 2, FM_PLANT, FM_SPROUT, FM_RIPE, FM_HARVEST, FM_FRUIT n, FM_SOLD, FM_SCORE n, FM_VICTORY (or FM_TIME_UP), FM_AT x every two seconds.

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":14,"yawRange":[0,0]}`
3. [UI] `editor_open_map` `{mapPath}`：在编辑器里打开底图的副本（演练时跳过）
4. `scene_build_blocks` `{"name":"Farm_Demo","blocks":[{"template":20002056,"name":"FM_floor_0","position":[-8,-0.2,0]},{"template":20002056,"name":"FM_floor_1","position":[-4,-0.2,0]},{"template":20002056,"name":"FM_floor_2","position":[0,-0.2,0]},"… 12 more pieces of the same form"]}` → `{"name":"Farm_Demo"}`
5. [UI] `scene_import_assets` `{"packs":["Farm_Demo"]}`：把上面的场景包导入并保存（演练时跳过）
6. `scene_list_entities` `{"namePrefix":"FM_"}` → `{"total":0}`
7. `scene_add_prefab` `{"asset":20001939,"name":"FM_rake","scale":1}` → `{"name":"FM_rake","prefabId":1077936129}`
8. `scene_add_prefab` `{"asset":20001483,"name":"FM_seeds","scale":1}` → `{"name":"FM_seeds","prefabId":1077936130}`
9. `scene_add_prefab` `{"asset":20001966,"name":"FM_plot","scale":1}` → `{"name":"FM_plot","prefabId":1077936131}`
10. `scene_add_prefab` `{"asset":20001952,"name":"FM_seedling","scale":0.8}` → `{"name":"FM_seedling","prefabId":1077936132}`
11. `scene_add_prefab` `{"asset":20001954,"name":"FM_sprout","scale":0.6}` → `{"name":"FM_sprout","prefabId":1077936133}`
12. `scene_add_prefab` `{"asset":20003094,"name":"FM_ripe","scale":0.8}` → `{"name":"FM_ripe","prefabId":1077936134}`
13. `scene_add_prefab` `{"asset":20001809,"name":"FM_stall","scale":1}` → `{"name":"FM_stall","prefabId":1077936135}`
14. `scene_add_currency` `{"name":"FM_fruit","startAmount":0}` → `{"name":"FM_fruit","currencyId":1115684865,"backpackTemplateId":1119879169}`
15. `scene_set_spawn` `{"position":[2,0.4,0],"rotation":[0,0,0]}` → `{"pointId":1073741825}`
16. `scene_add_signal` `{"name":"FM_use","parameter":"tool"}` → `{"name":"FM_use"}`
17. `scene_set_class` `{"allowClimb":false}`
18. `scene_add_graph` `{"name":"FmStage"}` → `{"graphId":1073741825,"name":"_GSTS_FmStage"}`
19. `scene_add_graph` `{"name":"FmRake","attachToPrefab":"FM_rake"}` → `{"graphId":1073741826,"name":"_GSTS_FmRake"}`
20. `scene_add_graph` `{"name":"FmSeeds","attachToPrefab":"FM_seeds"}` → `{"graphId":1073741827,"name":"_GSTS_FmSeeds"}`
21. `scene_add_graph` `{"name":"FmPlot","attachToPrefab":"FM_plot"}` → `{"graphId":1073741828,"name":"_GSTS_FmPlot"}`
22. `scene_add_graph` `{"name":"FmRipe","attachToPrefab":"FM_ripe"}` → `{"graphId":1073741829,"name":"_GSTS_FmRipe"}`
23. `scene_add_graph` `{"name":"FmStall","attachToPrefab":"FM_stall"}` → `{"graphId":1073741830,"name":"_GSTS_FmStall"}`
24. `scene_add_graph` `{"name":"FmHero","attachToPrefab":"character"}` → `{"graphId":1073741831,"name":"_GSTS_FmHero"}`
25. `scene_add_graph` `{"name":"FmPlayer","attachToPrefab":"player"}` → `{"graphId":1073741832,"name":"_GSTS_FmPlayer"}`
26. `scene_add_graph` `{"name":"FmUse","kind":"characterSkill"}` → `{"graphId":1082130433,"name":"_GSTS_FmUse"}`
27. `scene_add_skill` `{"name":"FM_use","graphId":1082130433}` → `{"graphId":1082130433,"name":"FM_use","skillId":1098907649}`
28. `scene_add_components` `{"prefab":"FM_rake","optionTab":{"areas":[{"size":[5,4,8]}],"options":[{"text":"拿耙子","icon":3}]}}`
29. `scene_add_components` `{"prefab":"FM_seeds","optionTab":{"areas":[{"size":[3,4,8]}],"options":[{"text":"拿种子","icon":1}]}}`
30. `scene_add_components` `{"prefab":"FM_plot","collisionTriggers":[{"areas":[{"size":[4,4,8]}],"targets":["character"]}],"variables":[{"name":"stage","type":"integer","value":0},{"name":"here","type":"boolean","value":false}]}`
31. `scene_add_components` `{"prefab":"FM_seedling","solid":false}`
32. `scene_add_components` `{"prefab":"FM_sprout","solid":false}`
33. `scene_add_components` `{"prefab":"FM_ripe","solid":false,"optionTab":{"areas":[{"size":[6,4,10]}],"options":[{"text":"收获","icon":2}]}}`
34. `scene_add_components` `{"prefab":"FM_stall","optionTab":{"areas":[{"size":[8,4,8]}],"options":[{"text":"交货","icon":20}]}}`
35. `scene_add_components` `{"prefab":"player","variables":[{"name":"tool","type":"integer","value":0},{"name":"score","type":"integer","value":0}]}`
36. `scene_add_global_timer` `{"name":"FM_round","seconds":70,"holder":"stage"}` → `{"name":"FM_round"}`
37. `scene_add_timer_display` `{"name":"FM_clock","timer":"FM_round","position":[0,330]}` → `{"name":"FM_clock","controlId":1073741847}`
38. `scene_add_progress_bar` `{"name":"FM_points","variable":"score","max":3,"position":[0,380],"size":[260,40]}` → `{"name":"FM_points","controlId":1073741850}`
39. `scene_list_prefabs` `{}`
40. 每张节点图各做一遍这五步（上一张 `apply_build` 返回的存档给下一张的 `create_project`）：
   - `create_project` `{"projectId":"stage","targetGraphId":"<scene_add_graph 返回的 graphId>"}`
   - `update_logic` `{projectId, code: <源码，见第二节>}`
   - `build_project` `{projectId}`：返回 buildId 和节点数、编辑器计数
   - `preview_changes` `{projectId, buildId, destination:"copy"}`：返回 expectedSha256
   - `apply_build` `{projectId, buildId, destination:"copy", expectedSha256}`：返回可以试玩的存档
   源码都写好以后，这五步可以换成一次 `write_graphs` `{mapPath, graphs:[{graphId, code}, ...]}`：它对每张图依次做同样的事，返回全部写好的存档。
41. `scene_list_components` `{"prefab":"FM_rake"}`
42. `inspect_map` `{}`
43. [UI] `playtest_start` `{"graphNames":["_GSTS_FmStage","_GSTS_FmRake","_GSTS_FmSeeds","_GSTS_FmPlot","_GSTS_FmRipe","_GSTS_FmStall","_GSTS_FmHero","_GSTS_FmPlayer","_GSTS_FmUse"],"durationSeconds":38,"screenshotsAt":[4,6,8,10.5,13,15,18,21,23,24.5,27,29,31,34],"inputs":[{"at":2,"key":"f"},{"at":3,"key":"d","holdMs":1550},{"at":5.5,"key":"e"},{"at":6.5,"key":"a","holdMs":3000},{"at":10,"key":"f"},{"at":11,"key":"d","holdMs":2380},{"at":14,"key":"e"},{"at":23.5,"key":"f"},{"at":24.5,"key":"d","holdMs":3200},{"at":28.5,"key":"f"}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 9 张，合计 202 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_FmStage（59 个节点）

```ts
/// <reference types="genshin-ts" />
import { g, defineSignal } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Farm, graph "stage": see examples/farm/gen_farm.py.
// The signal FM_use carries the tool in hand as a string.
const use=defineSignal('FM_use',[['tool','str']] as const)
g.server({id:1073741825,name:'_GSTS_FmStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'FM_SETUP',false,[2]);
  f.startTimer(evt.eventSourceEntity,'FM_WHERE',true,[2]);
  f.printString('FM_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const stage=evt.eventSourceEntity;
  if(evt.timerName==='FM_WHERE'){
    for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0])){f.printString('FM_AT');f.printString(f.dataTypeConversion(f.split3dVector(f.getEntityLocationAndRotation(hero).location).xComponent,'str'));}
    return;
  }
  if(evt.timerName!=='FM_SETUP')return;
  f.createPrefab(1077936130,[-1,0,2.5],[0,0,0],stage,false,1,[] as bigint[]);
  f.createPrefab(1077936129,[3,0,2.5],[0,0,0],stage,false,1,[] as bigint[]);
  f.createPrefab(1077936131,[10,0,2.5],[0,0,0],stage,false,1,[] as bigint[]);
  f.createPrefab(1077936131,[15,0,2.5],[0,0,0],stage,false,1,[] as bigint[]);
  f.createPrefab(1077936135,[21,0,3.5],[0,0,0],stage,false,1,[] as bigint[]);
  f.printString('FM_GO');
})
.on('whenGlobalTimerIsTriggered',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  f.printString('FM_TIME_UP');
  f.setPlayerSettlementSuccessStatus(players[0],SettlementStatus.Defeat);
  f.settleStage();
})
```

### _GSTS_FmRake（6 个节点）

```ts
/// <reference types="genshin-ts" />
import { g, defineSignal } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Farm, graph "rake": see examples/farm/gen_farm.py.
// The signal FM_use carries the tool in hand as a string.
const use=defineSignal('FM_use',[['tool','str']] as const)
g.server({id:1073741826,name:'_GSTS_FmRake'})
.on('whenTabIsSelected',(evt,f)=>{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  f.setCustomVariable(player,'tool',1n,true);
  f.addCharacterSkill(evt.selectorEntity as any,1098907649,CharacterSkillSlot.Skill1E,TopOfStackSkillDestructionType.Destroy);
  f.printString('FM_TOOL');f.printString('1');
})
```

### _GSTS_FmSeeds（6 个节点）

```ts
/// <reference types="genshin-ts" />
import { g, defineSignal } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Farm, graph "seeds": see examples/farm/gen_farm.py.
// The signal FM_use carries the tool in hand as a string.
const use=defineSignal('FM_use',[['tool','str']] as const)
g.server({id:1073741827,name:'_GSTS_FmSeeds'})
.on('whenTabIsSelected',(evt,f)=>{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  f.setCustomVariable(player,'tool',2n,true);
  f.addCharacterSkill(evt.selectorEntity as any,1098907649,CharacterSkillSlot.Skill1E,TopOfStackSkillDestructionType.Destroy);
  f.printString('FM_TOOL');f.printString('2');
})
```

### _GSTS_FmPlot（74 个节点）

```ts
/// <reference types="genshin-ts" />
import { g, defineSignal } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Farm, graph "plot": see examples/farm/gen_farm.py.
// The signal FM_use carries the tool in hand as a string.
const use=defineSignal('FM_use',[['tool','str']] as const)
g.server({id:1073741828,name:'_GSTS_FmPlot'})
.on('whenEnteringCollisionTrigger',(evt,f)=>{
  f.setCustomVariable(evt.triggerEntity,'here',true,true);
})
.on('whenExitingCollisionTrigger',(evt,f)=>{
  f.setCustomVariable(evt.triggerEntity,'here',false,true);
})
.onSignal(use,(evt,f)=>{
  // Every plot hears the signal; only the one somebody stands on acts.
  const self=f.getSelfEntity();
  if(!f.getCustomVariable(self,'here').asType('bool'))return;
  const stage=f.getCustomVariable(self,'stage').asType('int');
  if(stage===0n&&evt.params.tool==='1'){
    f.setCustomVariable(self,'stage',1n,true);
    f.printString('FM_TILL');
    return;
  }
  if(stage===1n&&evt.params.tool==='2'){
    const at=f.split3dVector(f.getEntityLocationAndRotation(self).location);
    for(const old of f.getListOfEntitiesOwnedByTheEntity(self))f.removeEntity(old);
    f.createPrefab(1077936132,f.create3dVector(at.xComponent,at.yComponent+0.5,at.zComponent),[0,0,0],self,false,1,[] as bigint[]);
    f.setCustomVariable(self,'stage',2n,true);
    f.startTimer(self,'FM_GROW',false,[4,8]);
    f.printString('FM_PLANT');
  }
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='FM_GROW')return;
  const self=evt.eventSourceEntity;
  const at=f.split3dVector(f.getEntityLocationAndRotation(self).location);
  // The places in a timer's sequence are numbered from 0.
  if(evt.timerSequenceId===0n){
    for(const old of f.getListOfEntitiesOwnedByTheEntity(self))f.removeEntity(old);
    f.createPrefab(1077936133,f.create3dVector(at.xComponent,at.yComponent+0.5,at.zComponent),[0,0,0],self,false,1,[] as bigint[]);
    f.setCustomVariable(self,'stage',3n,true);
    f.printString('FM_SPROUT');
    return;
  }
  for(const old of f.getListOfEntitiesOwnedByTheEntity(self))f.removeEntity(old);
    f.createPrefab(1077936134,f.create3dVector(at.xComponent,at.yComponent+0.5,at.zComponent),[0,0,0],self,false,1,[] as bigint[]);
  f.setCustomVariable(self,'stage',4n,true);
  f.printString('FM_RIPE');
})
```

### _GSTS_FmRipe（10 个节点）

```ts
/// <reference types="genshin-ts" />
import { g, defineSignal } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Farm, graph "ripe": see examples/farm/gen_farm.py.
// The signal FM_use carries the tool in hand as a string.
const use=defineSignal('FM_use',[['tool','str']] as const)
g.server({id:1073741829,name:'_GSTS_FmRipe'})
.on('whenTabIsSelected',(evt,f)=>{
  // The fruit goes into the backpack of the character that picked it (currency is held by the character).
  f.modifyInventoryCurrencyQuantity(evt.selectorEntity,1115684865,1n);
  f.printString('FM_HARVEST');
  f.printString('FM_FRUIT');f.printString(f.dataTypeConversion(f.getInventoryCurrencyQuantity(evt.selectorEntity,1115684865),'str'));
  // The crop belongs to its plot, which is tilled again.
  f.setCustomVariable(f.getOwnerEntity(evt.eventSourceEntity),'stage',1n,true);
  f.removeEntity(evt.eventSourceEntity);
})
```

### _GSTS_FmStall（26 个节点）

```ts
/// <reference types="genshin-ts" />
import { g, defineSignal } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Farm, graph "stall": see examples/farm/gen_farm.py.
// The signal FM_use carries the tool in hand as a string.
const use=defineSignal('FM_use',[['tool','str']] as const)
g.server({id:1073741830,name:'_GSTS_FmStall'})
.on('whenTabIsSelected',(evt,f)=>{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const fruit=f.getInventoryCurrencyQuantity(evt.selectorEntity,1115684865);
  if(fruit<1n){f.printString('FM_EMPTY');return;}
  f.modifyInventoryCurrencyQuantity(evt.selectorEntity,1115684865,0n-fruit);
  const score=f.getCustomVariable(player,'score').asType('int')+fruit;
  f.setCustomVariable(player,'score',score,true);
  f.printString('FM_SOLD');
  if(score<1n)return;
  f.printString('FM_VICTORY');
  f.setPlayerSettlementSuccessStatus(player,SettlementStatus.Victory);
  f.settleStage();
})
```

### _GSTS_FmHero（10 个节点）

```ts
/// <reference types="genshin-ts" />
import { g, defineSignal } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Farm, graph "hero": see examples/farm/gen_farm.py.
// The signal FM_use carries the tool in hand as a string.
const use=defineSignal('FM_use',[['tool','str']] as const)
g.server({id:1073741831,name:'_GSTS_FmHero'})
.on('whenSkillNodeIsCalled',(evt,f)=>{
  if(evt.parameter1!=='FM_use')return;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.callerEntity as any);
  f.sendSignal(use,f.dataTypeConversion(f.getCustomVariable(player,'tool').asType('int'),'str'));
})
```

### _GSTS_FmPlayer（9 个节点）

```ts
/// <reference types="genshin-ts" />
import { g, defineSignal } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Farm, graph "player": see examples/farm/gen_farm.py.
// The signal FM_use carries the tool in hand as a string.
const use=defineSignal('FM_use',[['tool','str']] as const)
g.server({id:1073741832,name:'_GSTS_FmPlayer'})
.on('whenCustomVariableChanges',(evt,f)=>{
  if(evt.variableName!=='score')return;
  f.printString('FM_SCORE');
  f.printString(f.dataTypeConversion(evt.postChangeValue.asType('int'),'str'));
})
```

### _GSTS_FmUse（2 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

g.characterSkill({id:1082130433,name:'_GSTS_FmUse',prefix:false})
.on('start',(evt,f)=>{
  f.notifyServerNodeGraph('FM_use','','');
})
```
