# 样例 hop：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

A second kind of game built with the same tools: a platform course, side on. Walk up a low ledge; walk onto a wooden platform as far as the barrier at its front and press F: the barrier lifts and the platform carries you ten metres across; pull a lever (F) and a stone gate rises; a strip of lava sends you back to the door unless you blink over it with the E skill; open the chest (F) to win before the clock runs out. Four coins on the way fill a bar. Nine graphs: stage, coin, ferry, lever, chest, lava, hero (character template: the blink), player, and the client skill graph. Prints: HP_READY, HP_GO, HP_COIN and HP_SCORE n, HP_FERRY, HP_LEVER, HP_BURN when the lava is touched (the script walks into it once, is sent back, then blinks over), HP_BLINK, HP_CHEST, HP_VICTORY (or HP_TIME_UP), and HP_AT with the character's x and y every two seconds. Climbing is switched off in the class: with it on, a character pushed against the barrier climbs over it (seen twice). The script does not walk by the clock alone, which passed once and failed once: the barrier stops the character at a known place on the platform, and the lava puts it at a known place before the blink.

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":14,"yawRange":[0,0]}`
3. [UI] `editor_open_map` `{mapPath}`：在编辑器里打开底图的副本（演练时跳过）
4. `scene_build_blocks` `{"name":"Hop_Demo","blocks":[{"template":20002056,"name":"HP_floor_0","position":[-8,-0.2,0]},{"template":20002056,"name":"HP_floor_1","position":[-4,-0.2,0]},{"template":20002056,"name":"HP_floor_2","position":[0,-0.2,0]},"… 19 more pieces of the same form"]}` → `{"name":"Hop_Demo"}`
5. [UI] `scene_import_assets` `{"packs":["Hop_Demo"]}`：把上面的场景包导入并保存（演练时跳过）
6. `scene_list_entities` `{"namePrefix":"HP_"}` → `{"total":0}`
7. `scene_add_prefab` `{"asset":10005009,"name":"HP_coin","scale":0.6}` → `{"name":"HP_coin","prefabId":1077936129}`
8. `scene_add_prefab` `{"asset":10005015,"name":"HP_ferry","scale":1}` → `{"name":"HP_ferry","prefabId":1077936130}`
9. `scene_add_prefab` `{"asset":10005030,"name":"HP_lever","scale":1.5}` → `{"name":"HP_lever","prefabId":1077936131}`
10. `scene_add_prefab` `{"asset":10005006,"name":"HP_chest","scale":1.5}` → `{"name":"HP_chest","prefabId":1077936132}`
11. `scene_add_prefab` `{"asset":10005018,"name":"HP_burn","scale":1}` → `{"name":"HP_burn","prefabId":1077936133}`
12. `scene_add_prefab` `{"asset":20001872,"name":"HP_gate","scale":[0.15,1.2,1.4]}` → `{"name":"HP_gate","prefabId":1077936134}`
13. `scene_add_prefab` `{"asset":20001872,"name":"HP_stop","scale":[0.1,0.8,1.4]}` → `{"name":"HP_stop","prefabId":1077936135}`
14. `scene_set_spawn` `{"position":[0,0.4,0],"rotation":[0,0,0]}` → `{"pointId":1073741825}`
15. `scene_set_class` `{"allowClimb":false}`
16. `scene_add_graph` `{"name":"HpStage"}` → `{"graphId":1073741825,"name":"_GSTS_HpStage"}`
17. `scene_add_graph` `{"name":"HpCoin","attachToPrefab":"HP_coin"}` → `{"graphId":1073741826,"name":"_GSTS_HpCoin"}`
18. `scene_add_graph` `{"name":"HpFerry","attachToPrefab":"HP_ferry"}` → `{"graphId":1073741827,"name":"_GSTS_HpFerry"}`
19. `scene_add_graph` `{"name":"HpLever","attachToPrefab":"HP_lever"}` → `{"graphId":1073741828,"name":"_GSTS_HpLever"}`
20. `scene_add_graph` `{"name":"HpChest","attachToPrefab":"HP_chest"}` → `{"graphId":1073741829,"name":"_GSTS_HpChest"}`
21. `scene_add_graph` `{"name":"HpBurn","attachToPrefab":"HP_burn"}` → `{"graphId":1073741830,"name":"_GSTS_HpBurn"}`
22. `scene_add_graph` `{"name":"HpHero","attachToPrefab":"character"}` → `{"graphId":1073741831,"name":"_GSTS_HpHero"}`
23. `scene_add_graph` `{"name":"HpPlayer","attachToPrefab":"player"}` → `{"graphId":1073741832,"name":"_GSTS_HpPlayer"}`
24. `scene_add_graph` `{"name":"HpBlink","kind":"characterSkill"}` → `{"graphId":1082130433,"name":"_GSTS_HpBlink"}`
25. `scene_add_skill` `{"name":"HP_blink","graphId":1082130433}` → `{"graphId":1082130433,"name":"HP_blink","skillId":1098907649}`
26. `scene_add_components` `{"prefab":"HP_coin","solid":false,"follow":"chase","collisionTriggers":[{"areas":[{"radius":4}],"targets":["character"]},{"areas":[{"size":[1.6,2,1.6]}],"targets":["character"]}]}`
27. `scene_add_components` `{"prefab":"HP_lever","optionTab":{"areas":[{"size":[5,4,8]}],"options":[{"text":"扳动","icon":3}]}}`
28. `scene_add_components` `{"prefab":"HP_burn","solid":false,"collisionTriggers":[{"areas":[{"size":[3,3,4]}],"targets":["character"]}]}`
29. `scene_add_components` `{"prefab":"player","variables":[{"name":"score","type":"integer","value":0}]}`
30. `scene_add_components` `{"prefab":"HP_gate","motions":[{"name":"open","move":[0,4,0],"seconds":1.5}]}`
31. `scene_add_components` `{"prefab":"HP_chest","optionTab":{"areas":[{"size":[5,4,8]}],"options":[{"text":"打开","icon":2}]}}`
32. `scene_add_components` `{"prefab":"HP_ferry","motions":[{"name":"go","move":[10,0,0],"seconds":4}],"optionTab":{"areas":[{"size":[7,3,5],"offset":[0,1.5,0]}],"options":[{"text":"出发","icon":10}]},"variables":[{"name":"gone","type":"boolean","value":false}]}`
33. `scene_add_components` `{"prefab":"HP_stop","motions":[{"name":"lift","move":[0,5,0],"seconds":0.3}]}`
34. `scene_add_global_timer` `{"name":"HP_time","seconds":60,"holder":"stage"}` → `{"name":"HP_time"}`
35. `scene_add_timer_display` `{"name":"HP_clock","timer":"HP_time","position":[0,330]}` → `{"name":"HP_clock","controlId":1073741847}`
36. `scene_add_progress_bar` `{"name":"HP_coins","variable":"score","max":4,"position":[0,380],"size":[260,40]}` → `{"name":"HP_coins","controlId":1073741850}`
37. `scene_list_prefabs` `{}`
38. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, …]}`：把每张图的源码编译并写进存档，返回可以试玩的存档。
39. `scene_list_components` `{"prefab":"HP_coin"}`
40. `inspect_map` `{}`
41. [UI] `playtest_start` `{"graphNames":["_GSTS_HpStage","_GSTS_HpCoin","_GSTS_HpFerry","_GSTS_HpLever","_GSTS_HpChest","_GSTS_HpBurn","_GSTS_HpHero","_GSTS_HpPlayer","_GSTS_HpBlink"],"durationSeconds":35,"screenshotsAt":[5,7.5,9.5,11,12.5,14,16,17.8,19,21,22.5,24,25.5,27,29,32],"inputs":[{"at":6,"key":"d","holdMs":4500},{"at":11.5,"key":"f"},{"at":17,"key":"d","holdMs":600},{"at":18.5,"key":"f"},{"at":20,"key":"d","holdMs":2400},{"at":23,"key":"e"},{"at":24.5,"key":"d","holdMs":400},{"at":26,"key":"f"}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 9 张，合计 157 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_HpStage（78 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, FollowCoordinateSystem, FollowLocationType, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Hop, graph "stage": see examples/hop/gen_hop.py.
g.server({id:1073741825,name:'_GSTS_HpStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'HP_SETUP',false,[2]);
  f.startTimer(evt.eventSourceEntity,'HP_WHERE',true,[2]);
  f.printString('HP_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const stage=evt.eventSourceEntity;
  const heroes=f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0]);
  if(evt.timerName==='HP_WHERE'){
    for(const hero of heroes){
      const at=f.split3dVector(f.getEntityLocationAndRotation(hero).location);
      f.printString('HP_AT');f.printString(f.dataTypeConversion(at.xComponent,'str'));f.printString(f.dataTypeConversion(at.yComponent,'str'));
    }
    return;
  }
  if(evt.timerName!=='HP_SETUP')return;
  f.createPrefab(1077936129,[3,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936129,[9,1.4,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936129,[30,1.4,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936129,[46,1.4,0],[0,0,0],stage,false,1,[] as bigint[]);
  f.createPrefab(1077936130,[15,0.19,0],[0,0,0],stage,false,1,[] as bigint[]);
  f.createPrefab(1077936135,[18.15,0.6,0],[0,0,0],stage,false,1,[] as bigint[]);
  f.createPrefab(1077936131,[31,0.6,2],[0,0,0],stage,false,1,[] as bigint[]);
  f.createPrefab(1077936134,[36,0.6,0],[0,0,0],stage,false,1,[] as bigint[]);
  f.createPrefab(1077936133,[41.5,1.6,0],[0,0,0],stage,false,1,[] as bigint[]);
  f.createPrefab(1077936132,[48.5,0.6,1.5],[0,0,0],stage,false,1,[] as bigint[]);
  // The blink goes on the E key of every character.
  for(const hero of heroes)f.addCharacterSkill(hero as any,1098907649,CharacterSkillSlot.Skill1E,TopOfStackSkillDestructionType.Destroy);
  f.printString('HP_GO');
})
.on('whenGlobalTimerIsTriggered',(evt,f)=>{
  // The clock ran out before the chest was opened.
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  f.printString('HP_TIME_UP');
  f.setPlayerSettlementSuccessStatus(players[0],SettlementStatus.Defeat);
  f.settleStage();
})
```

### _GSTS_HpCoin（16 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, FollowCoordinateSystem, FollowLocationType, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Hop, graph "coin": see examples/hop/gen_hop.py.
g.server({id:1073741826,name:'_GSTS_HpCoin'})
.on('whenEnteringCollisionTrigger',(evt,f)=>{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.enteringEntity as any);
  if(evt.triggerId===1n){
    f.switchFollowMotionDeviceTargetByGuid(evt.triggerEntity,f.queryGuidByEntity(player),'',[0,1,0],[0,0,0],FollowCoordinateSystem.WorldCoordinateSystem,FollowLocationType.FollowLocation);
    f.activateDisableFollowMotionDevice(evt.triggerEntity,true);
    return;
  }
  f.setCustomVariable(player,'score',f.getCustomVariable(player,'score').asType('int')+1n,true);
  f.printString('HP_COIN');
  f.destroyEntity(evt.triggerEntity);
})
```

### _GSTS_HpFerry（11 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, FollowCoordinateSystem, FollowLocationType, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Hop, graph "ferry": see examples/hop/gen_hop.py.
g.server({id:1073741827,name:'_GSTS_HpFerry'})
.on('whenTabIsSelected',(evt,f)=>{
  // It leaves once. The barrier at its front, which stops a walking character at the edge, lifts out of the way.
  if(f.getCustomVariable(evt.eventSourceEntity,'gone').asType('bool'))return;
  f.setCustomVariable(evt.eventSourceEntity,'gone',true,true);
  for(const stop of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936135))f.activateBasicMotionDevice(stop,'lift');
  f.activateBasicMotionDevice(evt.eventSourceEntity,'go');
  f.printString('HP_FERRY');
})
```

### _GSTS_HpLever（6 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, FollowCoordinateSystem, FollowLocationType, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Hop, graph "lever": see examples/hop/gen_hop.py.
g.server({id:1073741828,name:'_GSTS_HpLever'})
.on('whenTabIsSelected',(evt,f)=>{
  f.setPresetStatus(evt.eventSourceEntity,100010300n,1n);
  for(const gate of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936134))f.activateBasicMotionDevice(gate,'open');
  f.printString('HP_LEVER');
})
```

### _GSTS_HpChest（17 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, FollowCoordinateSystem, FollowLocationType, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Hop, graph "chest": see examples/hop/gen_hop.py.
g.server({id:1073741829,name:'_GSTS_HpChest'})
.on('whenTabIsSelected',(evt,f)=>{
  f.setPresetStatus(evt.eventSourceEntity,100010060n,1n);
  f.startTimer(evt.eventSourceEntity,'HP_WIN',false,[1.5]);
  f.printString('HP_CHEST');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  f.printString('HP_VICTORY');
  f.setPlayerSettlementSuccessStatus(players[0],SettlementStatus.Victory);
  f.settleStage();
})
```

### _GSTS_HpBurn（4 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, FollowCoordinateSystem, FollowLocationType, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Hop, graph "burn": see examples/hop/gen_hop.py.
g.server({id:1073741830,name:'_GSTS_HpBurn'})
.on('whenEnteringCollisionTrigger',(evt,f)=>{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.enteringEntity as any);
  f.teleportPlayer(player,[38,1.0,0],[0,0,0]);
  f.printString('HP_BURN');
})
```

### _GSTS_HpHero（14 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, FollowCoordinateSystem, FollowLocationType, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Hop, graph "hero": see examples/hop/gen_hop.py.
g.server({id:1073741831,name:'_GSTS_HpHero'})
.on('whenSkillNodeIsCalled',(evt,f)=>{
  if(evt.parameter1!=='HP_blink')return;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.callerEntity as any);
  const at=f.split3dVector(f.getEntityLocationAndRotation(evt.callerEntity).location);
  f.teleportPlayer(player,f.create3dVector(at.xComponent+7,at.yComponent+0.2,at.zComponent),[0,0,0]);
  f.printString('HP_BLINK');
})
```

### _GSTS_HpPlayer（9 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, FollowCoordinateSystem, FollowLocationType, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Hop, graph "player": see examples/hop/gen_hop.py.
g.server({id:1073741832,name:'_GSTS_HpPlayer'})
.on('whenCustomVariableChanges',(evt,f)=>{
  if(evt.variableName!=='score')return;
  f.printString('HP_SCORE');
  f.printString(f.dataTypeConversion(evt.postChangeValue.asType('int'),'str'));
})
```

### _GSTS_HpBlink（2 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, FollowCoordinateSystem, FollowLocationType, SettlementStatus, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Hop, graph "blink": see examples/hop/gen_hop.py.
g.characterSkill({id:1082130433,name:'_GSTS_HpBlink',prefix:false})
.on('start',(evt,f)=>{
  f.notifyServerNodeGraph('HP_blink','','');
})
```
