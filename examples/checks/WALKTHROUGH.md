# 样例 checks：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

One round that checks, in the game, the tools that were written offline against the official samples. Walking right along the strip: (1) a coin with a follow device flies to the player once inside its wide trigger and is picked up by its narrow one: CK_PULL then CK_COIN; (2) a post gets a green outline while the player is near it and loses it when the player leaves: CK_GLOW_ON, CK_GLOW_OFF, and it has a minimap marker; (3) a stall has two options, 开门 behind a boolean filter (shown only once the player holds the key the coin gives) and 没有钥匙 always shown: choosing 开门 prints CK_OPEN and starts the gate's motion, the gate should rise 4 m in 2 s; (4) twelve seconds in the stage switches every player to the night sky (CK_NIGHT) and at twenty-two back (CK_DAY); a lamp above the post belongs to the night sky and should be lit only then. (6) when night falls the stage also sends the signal CK_dusk and the post, which only listens, prints CK_HEARD and the string the signal carries (night); (9) nobody is teleported: the spawn point puts the player at x = -3 facing +z, and CK_AT prints that x two seconds in; the gate is created at a preset point read by the graph, so it should stand right of the stall as before; (8) the post owns an attack ability unit and stings whoever walks up to it (CK_STING): the health bar at the bottom should drop from 10000 by about 3000; (7) a thirty-second countdown held by the stage starts at CK_GO, shows as a clock at the top of the screen and prints CK_TIME_UP when it ends; (5) the class has jumping switched off: space is pressed at second 4 and the character should stay on the ground in the shots of seconds 4 and 5; if it jumps, the order of the four class switches is not the one assumed. (10) money: the currency CK_gold is defined and every character starts with 7 of it in a backpack; two seconds in the stage prints CK_PURSE and the amount (7), then adds 5, and the character graph, which hears the amount change, prints CK_MONEY and the new amount (12). (11) preset status: a chest (asset 10005006) stands left of the post, closed; when night falls at second 12 the stage sets its preset status to 1 and prints CK_CHEST and the value read back (1): the chest should be shut in the shot of second 11 and open in the shot of second 13. (12) path motion: a wooden platform (asset 10005015) behind the lane goes up three metres and down again for ever, two seconds each way, from the moment it appears; at second 12 the stage prints CK_LIFT and its height, which should be near 3 (0 means it never moved), and the shots should show it at different heights. (13) skill: an instant skill CK_ping is given to the character on the E key two seconds in; E is pressed at second 8.5, its client graph notifies the server and the character graph prints CK_SKILL and the word CK_ping. (14) a filter that is false: a second stall stands at the start, where the player has no key; F there at second 2 should print CK_LOCKED (the filtered option hidden, the other one picked), not CK_OPEN. (15) no jumping: CK_Y prints the character's height eleven times around the press of space; it should not rise. Look at the screenshots for: the coin moving, the outline, the marker on the minimap, which options show, the gate up, the dark sky.

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":13}`
3. [UI] `editor_open_map` `{mapPath}`：在编辑器里打开底图的副本（演练时跳过）
4. `scene_build_blocks` `{"name":"Checks_Demo","blocks":[{"template":20002056,"name":"CK_floor_-1","position":[-4,-0.2,0]},{"template":20002056,"name":"CK_floor_0","position":[0,-0.2,0]},{"template":20002056,"name":"CK_floor_1","position":[4,-0.2,0]},"… 7 more pieces of the same form"]}` → `{"name":"Checks_Demo"}`
5. [UI] `scene_import_assets` `{"packs":["Checks_Demo"]}`：把上面的场景包导入并保存（演练时跳过）
6. `scene_list_entities` `{"namePrefix":"CK_"}` → `{"total":0}`
7. `scene_add_prefab` `{"asset":10005009,"name":"CK_coin","scale":1}` → `{"name":"CK_coin","prefabId":1077936129}`
8. `scene_add_prefab` `{"asset":20001454,"name":"CK_post","scale":1.5}` → `{"name":"CK_post","prefabId":1077936130}`
9. `scene_add_prefab` `{"asset":20001125,"name":"CK_stall","scale":1}` → `{"name":"CK_stall","prefabId":1077936131}`
10. `scene_add_prefab` `{"asset":20001310,"name":"CK_gate","scale":[0.6,2,2]}` → `{"name":"CK_gate","prefabId":1077936132}`
11. `scene_add_prefab` `{"asset":10005006,"name":"CK_chest","scale":1}` → `{"name":"CK_chest","prefabId":1077936133}`
12. `scene_add_prefab` `{"asset":10005015,"name":"CK_lift","scale":1}` → `{"name":"CK_lift","prefabId":1077936134}`
13. `scene_set_faction_hostility` `{"hostilePairs":[[1,3]]}`
14. `scene_add_unit_status` `{"name":"CK_glow","outline":"green"}` → `{"name":"CK_glow","statusId":1077936129}`
15. `scene_add_unit_status` `{"name":"CK_glow2","outline":"white"}` → `{"name":"CK_glow2","statusId":1077936130}`
16. `scene_add_environment` `{"name":"CK_night","hour":0}` → `{"name":"CK_night","environmentId":1186988034,"defaultEnvironmentId":1186988033}`
17. `scene_add_environment` `{"name":"CK_env21","hour":21,"clouds":false}` → `{"name":"CK_env21","environmentId":1186988035,"defaultEnvironmentId":1186988033}`
18. `scene_add_environment` `{"name":"CK_env3","hour":3,"stars":false,"milkyWay":false}` → `{"name":"CK_env3","environmentId":1186988036,"defaultEnvironmentId":1186988033}`
19. `scene_add_currency` `{"name":"CK_gold","startAmount":7}` → `{"name":"CK_gold","currencyId":1115684865,"backpackTemplateId":1119879169}`
20. `scene_set_spawn` `{"position":[-3,0.4,0],"rotation":[0,0,0]}` → `{"pointId":1073741825}`
21. `scene_add_preset_point` `{"name":"CK_gate_at","position":[28,1,2]}` → `{"name":"CK_gate_at","pointId":1073741826}`
22. `scene_add_signal` `{"name":"CK_dusk","parameter":"phase"}` → `{"name":"CK_dusk"}`
23. `scene_set_class` `{"allowJump":false}`
24. `scene_add_light` `{"name":"CK_lamp","environment":"CK_night","position":[14,3,2.5],"radius":8,"intensity":3}` → `{"name":"CK_lamp","environmentId":1186988034}`
25. `scene_add_graph` `{"name":"CkStage"}` → `{"graphId":1073741825,"name":"_GSTS_CkStage"}`
26. `scene_add_graph` `{"name":"CkCoin","attachToPrefab":"CK_coin"}` → `{"graphId":1073741826,"name":"_GSTS_CkCoin"}`
27. `scene_add_graph` `{"name":"CkPost","attachToPrefab":"CK_post"}` → `{"graphId":1073741827,"name":"_GSTS_CkPost"}`
28. `scene_add_graph` `{"name":"CkStall","attachToPrefab":"CK_stall"}` → `{"graphId":1073741828,"name":"_GSTS_CkStall"}`
29. `scene_add_graph` `{"name":"CkHasKey","kind":"boolFilter"}` → `{"graphId":1082130433,"name":"_GSTS_CkHasKey"}`
30. `scene_add_graph` `{"name":"CkHero","attachToPrefab":"character"}` → `{"graphId":1073741829,"name":"_GSTS_CkHero"}`
31. `scene_add_graph` `{"name":"CkPing","kind":"characterSkill"}` → `{"graphId":1082130434,"name":"_GSTS_CkPing"}`
32. `scene_add_skill` `{"name":"CK_ping","graphId":1082130434}` → `{"graphId":1082130434,"name":"CK_ping","skillId":1098907649}`
33. `scene_add_components` `{"prefab":"CK_coin","solid":false,"follow":"chase","collisionTriggers":[{"areas":[{"radius":6}],"targets":["character"]},{"areas":[{"size":[1.6,2,1.6]}],"targets":["character"]}]}`
34. `scene_add_components` `{"prefab":"CK_post","collisionTriggers":[{"areas":[{"size":[5,4,5]}],"targets":["character"]}],"minimapMarker":{"name":"post","description":"check"},"abilityUnits":[{"name":"CK_sting","attack":{"coefficient":1,"added":3000}}]}`
35. `scene_add_components` `{"prefab":"CK_stall","optionTab":{"areas":[{"size":[6,4,6]}],"options":[{"text":"开门","icon":2,"filterGraphId":1082130433},{"text":"没有钥匙","icon":12}]}}`
36. `scene_add_components` `{"prefab":"CK_gate","motions":[{"name":"rise","move":[0,4,0],"seconds":2}]}`
37. `scene_add_components` `{"prefab":"player","variables":[{"name":"hasKey","type":"boolean","value":false}]}`
38. `scene_add_components` `{"prefab":"CK_lift","motions":[{"name":"updown","path":[{"position":[0,3,0],"seconds":2}],"loop":"backAndForth","active":true}]}`
39. `scene_add_global_timer` `{"name":"CK_round","seconds":30,"holder":"stage"}` → `{"name":"CK_round"}`
40. `scene_add_timer_display` `{"name":"CK_clock","timer":"CK_round","position":[0,380]}` → `{"name":"CK_clock","controlId":1073741847}`
41. `scene_list_prefabs` `{}`
42. 每张节点图各做一遍这五步（上一张 `apply_build` 返回的存档给下一张的 `create_project`）：
   - `create_project` `{"projectId":"stage","targetGraphId":"<scene_add_graph 返回的 graphId>"}`
   - `update_logic` `{projectId, code: <源码，见第二节>}`
   - `build_project` `{projectId}`：返回 buildId 和节点数、编辑器计数
   - `preview_changes` `{projectId, buildId, destination:"copy"}`：返回 expectedSha256
   - `apply_build` `{projectId, buildId, destination:"copy", expectedSha256}`：返回可以试玩的存档
   源码都写好以后，这五步可以换成一次 `write_graphs` `{mapPath, graphs:[{graphId, code}, ...]}`：它对每张图依次做同样的事，返回全部写好的存档。
43. `scene_list_components` `{"prefab":"CK_coin"}`
44. `inspect_map` `{}`
45. [UI] `playtest_start` `{"graphNames":["_GSTS_CkStage","_GSTS_CkCoin","_GSTS_CkPost","_GSTS_CkStall","_GSTS_CkHasKey","_GSTS_CkHero","_GSTS_CkPing"],"durationSeconds":45,"screenshotsAt":[5,8,10,11,13,15,17,19,21,24,26,28,30,32,34,37,40,43],"inputs":[{"at":2,"key":"f"},{"at":6,"key":"d","holdMs":1500},{"at":8.5,"key":"e"},{"at":9.6,"key":"space"},{"at":10,"key":"d","holdMs":1700},{"at":15,"key":"d","holdMs":1900},{"at":19,"key":"f"},{"at":25,"key":"a","holdMs":1500}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 7 张，合计 230 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_CkStage（141 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, FollowCoordinateSystem, FollowLocationType, TopOfStackSkillDestructionType, UnitStatusRemovalStrategy } from 'genshin-ts/definitions/enum'

// Checks, graph "stage": see examples/checks/gen_checks.py.
import { defineSignal } from 'genshin-ts/runtime/core'
const dusk=defineSignal('CK_dusk',[['phase','str']] as const)
g.server({id:1073741825,name:'_GSTS_CkStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'CK_CLOCK',false,[2,12,22]);
  // The class has jumping switched off and space is pressed about fifteen seconds in: the character's height is printed
  // every fifth of a second around that moment. It should stay where it is; a jump would show as a rise of a metre or so.
  f.startTimer(evt.eventSourceEntity,'CK_JUMP',false,[14.6,14.8,15.0,15.2,15.4,15.6,15.8,16.0,16.2,16.4,16.6]);
  f.printString('CK_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  // Every trigger is printed with the timer's name and the place in its sequence, before anything can return.
  if(evt.timerName!=='CK_JUMP'){f.printString('CK_T');f.printString(evt.timerName);f.printString(f.dataTypeConversion(evt.timerSequenceId,'str'));}
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1){f.printString('CK_NO_PLAYER');return;}
  const stage=evt.eventSourceEntity;
  // Three more skies after the first night, four seconds each, to compare how they look: a clear evening, a late night
  // without stars, the map's own sky again, and last the map's own sky with the clock set to 22:00 and stopped.
  if(evt.timerName==='CK_JUMP'){
    for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0])){f.printString('CK_Y');f.printString(f.dataTypeConversion(f.split3dVector(f.getEntityLocationAndRotation(hero).location).yComponent,'str'));}
    return;
  }
  if(evt.timerName==='CK_E1'){f.modifyEnvironmentSettings(1186988035n,players,false,0n);f.printString('CK_ENV21');f.startTimer(stage,'CK_E2',false,[4]);return;}
  if(evt.timerName==='CK_E2'){f.modifyEnvironmentSettings(1186988036n,players,false,0n);f.printString('CK_ENV3');f.startTimer(stage,'CK_E3',false,[4]);return;}
  if(evt.timerName==='CK_E3'){f.modifyEnvironmentSettings(1186988033n,players,false,0n);f.printString('CK_DAY');f.startTimer(stage,'CK_E4',false,[4]);return;}
  if(evt.timerName==='CK_E4'){f.setCurrentEnvironmentTime(22);f.setEnvironmentTimePassageSpeed(0);f.printString('CK_HOUR22');return;}
  if(evt.timerName!=='CK_CLOCK')return;
  // The places in a timer's sequence are numbered from 0 (measured 2026-10-10).
  if(evt.timerSequenceId===0n){
    // Nobody is teleported: the spawn point decides where the player stands. Print it to check.
    const hero=f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0]);
    if(hero.length===1){
      f.printString('CK_AT');f.printString(f.dataTypeConversion(f.split3dVector(f.getEntityLocationAndRotation(hero[0]).location).xComponent,'str'));
      // Money is held by the character (the backpack component is on the character template), not by the player entity.
      f.printString('CK_PURSE');f.printString(f.dataTypeConversion(f.getInventoryCurrencyQuantity(hero[0],1115684865),'str'));
      f.modifyInventoryCurrencyQuantity(hero[0],1115684865,5n);
      // The skill goes on the E key; pressing it runs the client graph "ping", which notifies the server.
      f.addCharacterSkill(hero[0] as any,1098907649,CharacterSkillSlot.Skill1E,TopOfStackSkillDestructionType.Destroy);
    }
    f.createPrefab(1077936129,[8,0.8,0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
    f.createPrefab(1077936130,[14,0,2.5],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
    f.createPrefab(1077936131,[24,0,0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
    // A second stall right at the start, where the player has no key yet: the filtered option 开门 should be hidden
    // there, so F picks the other one and prints CK_LOCKED.
    f.createPrefab(1077936131,[-5,0,1.5],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
    f.createPrefab(1077936133,[11,0,3.5],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
    f.createPrefab(1077936134,[5,0,6],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
    f.createPrefab(1077936132,f.queryPresetPointPositionRotation(1073741826n).location,[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
    f.startGlobalTimer(evt.eventSourceEntity,'CK_round');
    f.printString('CK_GO');
  }
  if(evt.timerSequenceId===1n){
    f.modifyEnvironmentSettings(1186988034n,players,false,0n);f.printString('CK_NIGHT');f.sendSignal(dusk,'night');
    f.startTimer(stage,'CK_E1',false,[4]);
    // The chest's built-in animation: preset status 1 opens it.
    for(const chest of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936133)){
      f.setPresetStatus(chest,100010060n,1n);
      f.printString('CK_CHEST');f.printString(f.dataTypeConversion(f.getPresetStatus(chest,100010060n),'str'));
    }
    // The platform has been going up and down since it appeared, two seconds each way: ten seconds on it is at the top.
    for(const lift of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936134)){
      f.printString('CK_LIFT');f.printString(f.dataTypeConversion(f.split3dVector(f.getEntityLocationAndRotation(lift).location).yComponent,'str'));
    }
  }
  if(evt.timerSequenceId===2n)f.printString('CK_THIRD');
})
.on('whenGlobalTimerIsTriggered',(evt,f)=>{
  f.printString('CK_TIME_UP');
})
```

### _GSTS_CkCoin（15 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, FollowCoordinateSystem, FollowLocationType, TopOfStackSkillDestructionType, UnitStatusRemovalStrategy } from 'genshin-ts/definitions/enum'

// Checks, graph "coin": see examples/checks/gen_checks.py.
g.server({id:1073741826,name:'_GSTS_CkCoin'})
.on('whenEnteringCollisionTrigger',(evt,f)=>{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.enteringEntity as any);
  if(evt.triggerId===1n){
    // A character has no GUID: the device follows it through the GUID of its player.
    f.switchFollowMotionDeviceTargetByGuid(evt.triggerEntity,f.queryGuidByEntity(player),'',[0,1,0],[0,0,0],FollowCoordinateSystem.WorldCoordinateSystem,FollowLocationType.FollowLocation);
    f.activateDisableFollowMotionDevice(evt.triggerEntity,true);
    f.printString('CK_PULL');
  }
  if(evt.triggerId===2n){
    f.setCustomVariable(player,'hasKey',true,true);
    f.printString('CK_COIN');
    f.destroyEntity(evt.triggerEntity);
  }
})
```

### _GSTS_CkPost（29 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, FollowCoordinateSystem, FollowLocationType, TopOfStackSkillDestructionType, UnitStatusRemovalStrategy } from 'genshin-ts/definitions/enum'

// Checks, graph "post": see examples/checks/gen_checks.py.
import { defineSignal } from 'genshin-ts/runtime/core'
const dusk=defineSignal('CK_dusk',[['phase','str']] as const)
g.server({id:1073741827,name:'_GSTS_CkPost'})
.on('whenEnteringCollisionTrigger',(evt,f)=>{
  // Who applies the status matters: the official sample 描边与透视 names the character that walked in as the applier and
  // the piece as the target. With the piece as its own applier the status was not there afterwards (2026-10-10).
  f.addUnitStatus(evt.enteringEntity,evt.triggerEntity,1077936129,1n,f.createDictionary([] as string[],[] as number[]));
  f.printString('CK_GLOW_ON');
  // Does the status really sit on the post, and does an outline show on a character? The same kind of status in white
  // goes on whoever walked in.
  if(f.queryIfEntityHasUnitStatus(evt.triggerEntity,1077936129))f.printString('CK_POST_HAS');
  f.addUnitStatus(evt.enteringEntity,evt.enteringEntity,1077936130,1n,f.createDictionary([] as string[],[] as number[]));
  if(f.queryIfEntityHasUnitStatus(evt.enteringEntity,1077936130))f.printString('CK_HERO_HAS');
  f.initiateAttack(evt.enteringEntity,1,3000,[0,0,0],[0,0,0],'CK_sting',false,evt.triggerEntity);
  f.printString('CK_STING');
})
.on('whenExitingCollisionTrigger',(evt,f)=>{
  f.removeUnitStatus(evt.triggerEntity,1077936129,UnitStatusRemovalStrategy.AllCoexistingStatusesWithTheSameName,evt.exitingEntity);
  f.removeUnitStatus(evt.exitingEntity,1077936130,UnitStatusRemovalStrategy.AllCoexistingStatusesWithTheSameName,evt.exitingEntity);
  f.printString('CK_GLOW_OFF');
})
.onSignal(dusk,(evt,f)=>{
  f.printString('CK_HEARD');
  f.printString(evt.params.phase);
})
```

### _GSTS_CkStall（31 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, FollowCoordinateSystem, FollowLocationType, TopOfStackSkillDestructionType, UnitStatusRemovalStrategy } from 'genshin-ts/definitions/enum'

// Checks, graph "stall": see examples/checks/gen_checks.py.
g.server({id:1073741828,name:'_GSTS_CkStall'})
.on('whenTabIsSelected',(evt,f)=>{
  if(evt.tabId!==1n){f.printString('CK_LOCKED');return;}
  // The gate's height before its motion starts and three seconds after: it should be four metres more.
  for(const gate of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936132)){
    f.printString('CK_GATE_BEFORE');f.printString(f.dataTypeConversion(f.split3dVector(f.getEntityLocationAndRotation(gate).location).yComponent,'str'));
    f.activateBasicMotionDevice(gate,'rise');
  }
  f.startTimer(evt.eventSourceEntity,'CK_GATE',false,[3]);
  f.printString('CK_OPEN');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='CK_GATE')return;
  for(const gate of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936132)){f.printString('CK_GATE_AFTER');f.printString(f.dataTypeConversion(f.split3dVector(f.getEntityLocationAndRotation(gate).location).yComponent,'str'));}
})
```

### _GSTS_CkHasKey（4 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, FollowCoordinateSystem, FollowLocationType, TopOfStackSkillDestructionType, UnitStatusRemovalStrategy } from 'genshin-ts/definitions/enum'

// Checks, graph "haskey": see examples/checks/gen_checks.py.
g.boolFilter({id:1082130433,name:'_GSTS_CkHasKey',prefix:false})
.on('start',(evt,f)=>{
  return f.getCustomVariable(f.getPlayerEntityToWhichTheCharacterBelongs(f.getTargetEntity()),'hasKey').asType('bool');
})
```

### _GSTS_CkHero（8 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, FollowCoordinateSystem, FollowLocationType, TopOfStackSkillDestructionType, UnitStatusRemovalStrategy } from 'genshin-ts/definitions/enum'

// Checks, graph "hero": see examples/checks/gen_checks.py.
g.server({id:1073741829,name:'_GSTS_CkHero'})
.on('whenSkillNodeIsCalled',(evt,f)=>{
  f.printString('CK_SKILL');
  f.printString(evt.parameter1);
})
.on('whenTheQuantityOfInventoryCurrencyChanges',(evt,f)=>{
  f.printString('CK_MONEY');
  f.printString(f.dataTypeConversion(f.getInventoryCurrencyQuantity(evt.currencyOwnerEntity,evt.currencyConfigId),'str'));
})
```

### _GSTS_CkPing（2 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, FollowCoordinateSystem, FollowLocationType, TopOfStackSkillDestructionType, UnitStatusRemovalStrategy } from 'genshin-ts/definitions/enum'

// Checks, graph "ping": see examples/checks/gen_checks.py.
g.characterSkill({id:1082130434,name:'_GSTS_CkPing',prefix:false})
.on('start',(evt,f)=>{
  f.notifyServerNodeGraph('CK_ping','','');
})
```
