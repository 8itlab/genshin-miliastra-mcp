# 样例 kingdom4：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

Kingdom rebuilt the way the platform builds games: ten small graphs, each on the thing it is about and started by events; nothing compares positions on a timer. State is in custom variables of the player (coins, citizens, builders, archers, keep, night) and of the things themselves (a wall's hp, the site's level, whether the bow shop is loaded). Stations are prefabs with an option tab: walk up, press F. Coins are prefabs with a follow device and two collision triggers. The stage graph only keeps the clock: dusk, the wave, dawn, income, victory. Walls count the Greed that reach them through a collision trigger for creatures; the bow shop shoots one Greed that enters its range and reloads; a Greed that gets near the monarch takes a coin through its own collision trigger for characters, or the crown from an empty purse. Signals: KG_dawn (walls are mended, the Greed leave, the bow shop reloads), KG_wall_down (the Greed turn to the monarch, the site can be built on again). Prints, in the order the script below should produce them: KG_READY, KG_DAY, KG_COINS 10, KG_CITIZEN x2, KG_BUILDER, KG_ARCHER, KG_WALL 1, KG_DUSK, KG_GREED x2, KG_SHOT, KG_WALL_HIT, KG_DAWN, KG_MENDED, KG_GREED_GONE if any is left, KG_INCOME 3, KG_COINS up to 3, KG_DUSK, KG_GREED x3, KG_DAWN, KG_VICTORY. KG_POOR / KG_NEED mean a station refused. Screenshots: price tags (small coins) above the stations, the purse bar, the clock, villagers appearing, the wall, the dark sky with lamps, Greed running at the wall. Played to the official victory screen on 2026-10-10 and 11: each night the Greed run at the wall, the bow shop shoots one that comes in range (KG_SHOT) and reloads, the next one reaches the wall (KG_WALL_HIT). Night and day are two skies made with scene_add_environment; three lamps belong to the night one. The level's graphs start about five seconds before the scripted inputs do, so dusk falls about 26 seconds into the script and dawn about 52.

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":14,"yawRange":[0,0]}`
3. [UI] `editor_open_map` `{mapPath}`：在编辑器里打开底图的副本（演练时跳过）
4. `scene_build_blocks` `{"name":"Kingdom_V4","blocks":[{"template":20002088,"name":"KV_flag","position":[-2.6,7.6,5.2]},{"template":20002409,"name":"KV_hammer_sign","position":[8.4,7.6,4.2]},{"template":20002764,"name":"KV_bow_target_b","position":[16,7.6,5.6],"rotation":[0,25,0]},"… 8 more pieces of the same form"],"offset":[0,-7.6,0]}` → `{"name":"Kingdom_V4"}`
5. `scene_build_blocks` `{"name":"Kingdom_V3_Scenery","blocks":[{"template":20002056,"name":"KS_001","position":[-42,7.6,-10.25],"scale":[1.21,0.2,1.15]},{"template":10005106,"name":"KS_002","position":[-42,7.85,-10.25],"scale":[12.05,0.4,11.5]},{"template":20002056,"name":"KS_003","position":[-30,7.6,-10.25],"scale":[1.21,0.2,1.15]},"… 128 more pieces of the same form"],"offset":[0,-7.6,0]}` → `{"name":"Kingdom_V3_Scenery"}`
6. `scene_build_blocks` `{"name":"Kingdom_V3_Units","blocks":[{"template":30003003,"name":"KV_unit_vagrant","position":[5,7.6,14],"createAtStart":false},{"template":30004001,"name":"KV_unit_builder","position":[7,7.6,14],"scale":1.3,"createAtStart":false},{"template":30003002,"name":"KV_unit_archer","position":[9,7.6,14],"scale":1.2,"createAtStart":false}],"offset":[0,-7.6,0]}` → `{"name":"Kingdom_V3_Units"}`
7. [UI] `scene_import_assets` `{"packs":["Kingdom_V4","Kingdom_V3_Scenery","Kingdom_V3_Units"]}`：把上面的场景包导入并保存（演练时跳过）
8. `scene_list_entities` `{"namePrefix":"KV_"}` → `{"total":0}`
9. `scene_add_prefab` `{"asset":10005009,"name":"KV_coin","scale":0.5}` → `{"name":"KV_coin","prefabId":1077936129}`
10. `scene_add_prefab` `{"asset":10005009,"name":"KV_tag","scale":0.3}` → `{"name":"KV_tag","prefabId":1077936130}`
11. `scene_add_prefab` `{"asset":20002336,"name":"KV_keep","scale":1}` → `{"name":"KV_keep","prefabId":1077936131}`
12. `scene_add_prefab` `{"asset":20002087,"name":"KV_camp","scale":0.55}` → `{"name":"KV_camp","prefabId":1077936132}`
13. `scene_add_prefab` `{"asset":20001613,"name":"KV_smith","scale":0.8}` → `{"name":"KV_smith","prefabId":1077936133}`
14. `scene_add_prefab` `{"asset":20002764,"name":"KV_range","scale":1}` → `{"name":"KV_range","prefabId":1077936134}`
15. `scene_add_prefab` `{"asset":20002275,"name":"KV_site","scale":1}` → `{"name":"KV_site","prefabId":1077936135}`
16. `scene_add_prefab` `{"asset":20003092,"name":"KV_wall_wood","scale":[0.55,1.2,1]}` → `{"name":"KV_wall_wood","prefabId":1077936136}`
17. `scene_add_prefab` `{"asset":20002893,"name":"KV_wall_stone","scale":[1,0.6,1]}` → `{"name":"KV_wall_stone","prefabId":1077936137}`
18. `scene_add_prefab` `{"fromEntity":"KV_enemy_00","name":"KV_greed"}` → `{"name":"KV_greed","prefabId":1077936138}`（从摆在场景里的造物做元件；演练时场景没导入，这一步用一个物件顶替）
19. `scene_add_prefab` `{"fromEntity":"KV_unit_vagrant","name":"KV_vagrant"}` → `{"name":"KV_vagrant","prefabId":1077936139}`（从摆在场景里的造物做元件；演练时场景没导入，这一步用一个物件顶替）
20. `scene_add_prefab` `{"fromEntity":"KV_unit_builder","name":"KV_builder"}` → `{"name":"KV_builder","prefabId":1077936140}`（从摆在场景里的造物做元件；演练时场景没导入，这一步用一个物件顶替）
21. `scene_add_prefab` `{"fromEntity":"KV_unit_archer","name":"KV_archer"}` → `{"name":"KV_archer","prefabId":1077936141}`（从摆在场景里的造物做元件；演练时场景没导入，这一步用一个物件顶替）
22. `scene_set_faction_hostility` `{"hostilePairs":[[1,3]]}`
23. `scene_set_level_settings` `{"aggroMode":"custom"}`
24. `scene_add_environment` `{"name":"KV_night","hour":0}` → `{"name":"KV_night","environmentId":1186988034,"defaultEnvironmentId":1186988033}`
25. `scene_add_environment` `{"name":"KV_day","hour":11,"stars":false,"milkyWay":false}` → `{"name":"KV_day","environmentId":1186988035,"defaultEnvironmentId":1186988033}`
26. `scene_set_spawn` `{"position":[2,0.4,0],"rotation":[0,0,0]}` → `{"pointId":1073741825}`
27. `scene_add_signal` `{"name":"KG_dawn"}` → `{"name":"KG_dawn"}`
28. `scene_add_signal` `{"name":"KG_wall_down"}` → `{"name":"KG_wall_down"}`
29. `scene_set_class` `{"allowJump":false}`
30. `scene_add_light` `{"name":"KV_lamp_0","environment":"KV_night","position":[-3.9,2.2,4.3],"radius":9,"intensity":3}` → `{"name":"KV_lamp_0","environmentId":1186988034}`
31. `scene_add_light` `{"name":"KV_lamp_1","environment":"KV_night","position":[7.3,2.2,4.3],"radius":9,"intensity":3}` → `{"name":"KV_lamp_1","environmentId":1186988034}`
32. `scene_add_light` `{"name":"KV_lamp_2","environment":"KV_night","position":[19.4,2.2,4.3],"radius":9,"intensity":3}` → `{"name":"KV_lamp_2","environmentId":1186988034}`
33. `scene_add_graph` `{"name":"KgStage"}` → `{"graphId":1073741825,"name":"_GSTS_KgStage"}`
34. `scene_add_graph` `{"name":"KgCoin","attachToPrefab":"KV_coin"}` → `{"graphId":1073741826,"name":"_GSTS_KgCoin"}`
35. `scene_add_graph` `{"name":"KgKeep","attachToPrefab":"KV_keep"}` → `{"graphId":1073741827,"name":"_GSTS_KgKeep"}`
36. `scene_add_graph` `{"name":"KgCamp","attachToPrefab":"KV_camp"}` → `{"graphId":1073741828,"name":"_GSTS_KgCamp"}`
37. `scene_add_graph` `{"name":"KgSmith","attachToPrefab":"KV_smith"}` → `{"graphId":1073741829,"name":"_GSTS_KgSmith"}`
38. `scene_add_graph` `{"name":"KgRange","attachToPrefab":"KV_range"}` → `{"graphId":1073741830,"name":"_GSTS_KgRange"}`
39. `scene_add_graph` `{"name":"KgSite","attachToPrefab":"KV_site"}` → `{"graphId":1073741831,"name":"_GSTS_KgSite"}`
40. `scene_add_graph` `{"name":"KgWall","attachToPrefab":["KV_wall_wood","KV_wall_stone"]}` → `{"graphId":1073741832,"name":"_GSTS_KgWall"}`
41. `scene_add_graph` `{"name":"KgGreed","attachToPrefab":"KV_greed"}` → `{"graphId":1073741833,"name":"_GSTS_KgGreed"}`
42. `scene_add_graph` `{"name":"KgPlayer","attachToPrefab":"player"}` → `{"graphId":1073741834,"name":"_GSTS_KgPlayer"}`
43. `scene_add_components` `{"prefab":"KV_coin","solid":false,"follow":"chase","collisionTriggers":[{"areas":[{"radius":5}],"targets":["character"]},{"areas":[{"size":[1.6,2,1.6]}],"targets":["character"]}]}`
44. `scene_add_components` `{"prefab":"KV_tag","solid":false}`
45. `scene_add_components` `{"prefab":"KV_keep","optionTab":{"areas":[{"size":[5,5,14]}],"options":[{"text":"升级","icon":20}]}}`
46. `scene_add_components` `{"prefab":"KV_camp","optionTab":{"areas":[{"size":[8,6,30]}],"options":[{"text":"招募","icon":1}]}}`
47. `scene_add_components` `{"prefab":"KV_smith","optionTab":{"areas":[{"size":[5,5,16]}],"options":[{"text":"工匠","icon":3}]}}`
48. `scene_add_components` `{"prefab":"KV_range","optionTab":{"areas":[{"size":[5,5,14]}],"options":[{"text":"弓手","icon":10}]},"collisionTriggers":[{"areas":[{"radius":13}],"targets":["creature"]}],"variables":[{"name":"loaded","type":"boolean","value":true}]}`
49. `scene_add_components` `{"prefab":"KV_site","optionTab":{"areas":[{"size":[5,5,14]}],"options":[{"text":"筑墙","icon":15}]},"variables":[{"name":"level","type":"integer","value":0}]}`
50. `scene_add_components` `{"prefab":"KV_wall_wood","collisionTriggers":[{"areas":[{"radius":2.5}],"targets":["creature"]}],"variables":[{"name":"hp","type":"integer","value":3},{"name":"full","type":"integer","value":3}]}`
51. `scene_add_components` `{"prefab":"KV_wall_stone","collisionTriggers":[{"areas":[{"radius":4}],"targets":["creature"]}],"variables":[{"name":"hp","type":"integer","value":6},{"name":"full","type":"integer","value":6}]}`
52. `scene_add_components` `{"prefab":"player","variables":[{"name":"coins","type":"integer","value":0},{"name":"citizens","type":"integer","value":0},{"name":"builders","type":"integer","value":0},{"name":"archers","type":"integer","value":0},{"name":"keep","type":"integer","value":0},{"name":"night","type":"integer","value":0}]}`
53. `scene_add_components` `{"prefab":"KV_greed","collisionTriggers":[{"areas":[{"radius":4.5}],"targets":["character"]}]}`
54. `scene_add_global_timer` `{"name":"KG_day","seconds":30,"holder":"stage"}` → `{"name":"KG_day"}`
55. `scene_add_timer_display` `{"name":"KG_clock","timer":"KG_day","position":[0,330]}` → `{"name":"KG_clock","controlId":1073741847}`
56. `scene_add_progress_bar` `{"name":"KG_purse","variable":"coins","max":10,"position":[0,380],"size":[260,40]}` → `{"name":"KG_purse","controlId":1073741850}`
57. `scene_list_prefabs` `{}`
58. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, …]}`：把每张图的源码编译并写进存档，返回可以试玩的存档。
59. `scene_list_components` `{"prefab":"KV_coin"}`
60. `inspect_map` `{}`
61. [UI] `playtest_start` `{"graphNames":["_GSTS_KgStage","_GSTS_KgCoin","_GSTS_KgKeep","_GSTS_KgCamp","_GSTS_KgSmith","_GSTS_KgRange","_GSTS_KgSite","_GSTS_KgWall","_GSTS_KgGreed","_GSTS_KgPlayer"],"durationSeconds":122,"screenshotsAt":[4,8,13,17,21,25,28,30,32,34,37,40,50,53,59,63,85,90,96,108],"inputs":[{"at":5,"key":"d","holdMs":600},{"at":7,"key":"f"},{"at":8.5,"key":"f"},{"at":10,"key":"d","holdMs":950},{"at":12,"key":"f"},{"at":14,"key":"d","holdMs":950},{"at":16,"key":"f"},{"at":18,"key":"d","holdMs":950},{"at":20,"key":"f"},{"at":22,"key":"a","holdMs":1900},{"at":60,"key":"a","holdMs":1500}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 10 张，合计 570 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_KgStage（160 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v4, graph "stage": see examples/kingdom4/gen_kingdom4.py.
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
    f.createPrefab(1077936131,[0,0,3.6],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);f.createPrefab(1077936130,[-0.68,3.4,3.6],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);f.createPrefab(1077936130,[-0.23,3.4,3.6],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);f.createPrefab(1077936130,[0.23,3.4,3.6],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);f.createPrefab(1077936130,[0.68,3.4,3.6],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
    f.createPrefab(1077936132,[5,0,7.2],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);f.createPrefab(1077936130,[5.0,3.4,7.2],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
    f.createPrefab(1077936133,[10,0,5.6],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);f.createPrefab(1077936130,[9.55,3.4,5.6],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);f.createPrefab(1077936130,[10.0,3.4,5.6],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);f.createPrefab(1077936130,[10.45,3.4,5.6],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
    f.createPrefab(1077936134,[14.4,0,5.0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);f.createPrefab(1077936130,[14.18,3.4,5.0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);f.createPrefab(1077936130,[14.62,3.4,5.0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
    f.createPrefab(1077936135,[20,0,4.6],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);f.createPrefab(1077936130,[19.55,3.4,4.6],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);f.createPrefab(1077936130,[20.0,3.4,4.6],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);f.createPrefab(1077936130,[20.45,3.4,4.6],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
    f.setCustomVariable(player,'coins',10n,true);
    f.startTimer(stage,'KG_TO_DUSK',false,[30]);
    f.startGlobalTimer(stage,'KG_day');
    f.printString('KG_DAY');
    return;
  }
  if(evt.timerName==='KG_TO_DUSK'){
    f.setCustomVariable(player,'night',f.getCustomVariable(player,'night').asType('int')+1n,true);
    f.modifyEnvironmentSettings(1186988034n,players,false,0n);
    // One Greed every two seconds; how many of the six come out is decided when each is due. The places in a timer's
    // sequence are numbered from 0 (measured), so night 1 lets places 0 and 1 through: two Greed.
    f.startTimer(stage,'KG_WAVE',false,[2,4,6,8,10,12]);
    f.startTimer(stage,'KG_TO_DAWN',false,[25]);
    f.printString('KG_DUSK');
    return;
  }
  if(evt.timerName==='KG_WAVE'){
    if(evt.timerSequenceId>f.getCustomVariable(player,'night').asType('int'))return;
    f.createPrefab(1077936138,[29,0.4,0],[0,-90,0],stage,false,1,[] as bigint[]);
    f.printString('KG_GREED');
    return;
  }
  if(evt.timerName==='KG_TO_DAWN'){
    f.stopTimer(stage,'KG_WAVE');
    f.modifyEnvironmentSettings(1186988035n,players,false,0n);
    f.sendSignal('KG_dawn');
    f.printString('KG_DAWN');
    if(f.getCustomVariable(player,'night').asType('int')>=2n){
      f.printString('KG_VICTORY');
      f.setPlayerSettlementSuccessStatus(player,SettlementStatus.Victory);
      f.settleStage();
      return;
    }
    // The morning's income lies by the keep: two coins, one more for each level of the keep and for each archer.
    const income=2n+f.getCustomVariable(player,'keep').asType('int')+f.getCustomVariable(player,'archers').asType('int');
    f.printString('KG_INCOME');f.printString(f.dataTypeConversion(income,'str'));
    if(income>=1n)f.createPrefab(1077936129,[-1.5,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);
    if(income>=2n)f.createPrefab(1077936129,[-0.6,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);
    if(income>=3n)f.createPrefab(1077936129,[0.3,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);
    if(income>=4n)f.createPrefab(1077936129,[1.2,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);
    if(income>=5n)f.createPrefab(1077936129,[2.1,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);
    if(income>=6n)f.createPrefab(1077936129,[3.0,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);
    f.startTimer(stage,'KG_TO_DUSK',false,[30]);
    f.startGlobalTimer(stage,'KG_day');
  }
})
```

### _GSTS_KgCoin（20 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v4, graph "coin": see examples/kingdom4/gen_kingdom4.py.
g.server({id:1073741826,name:'_GSTS_KgCoin'})
.on('whenEnteringCollisionTrigger',(evt,f)=>{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.enteringEntity as any);
  if(evt.triggerId===1n){
    // A character has no GUID: the device follows it through the GUID of its player.
    f.switchFollowMotionDeviceTargetByGuid(evt.triggerEntity,f.queryGuidByEntity(player),'',[0,1,0],[0,0,0],FollowCoordinateSystem.WorldCoordinateSystem,FollowLocationType.FollowLocation);
    f.activateDisableFollowMotionDevice(evt.triggerEntity,true);
    return;
  }
  const coins=f.getCustomVariable(player,'coins').asType('int');
  if(coins>=10n)return;
  f.setCustomVariable(player,'coins',coins+1n,true);
  f.destroyEntity(evt.triggerEntity);
})
```

### _GSTS_KgKeep（37 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v4, graph "keep": see examples/kingdom4/gen_kingdom4.py.
g.server({id:1073741827,name:'_GSTS_KgKeep'})
.on('whenTabIsSelected',(evt,f)=>{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const coins=f.getCustomVariable(player,'coins').asType('int');
  const level=f.getCustomVariable(player,'keep').asType('int');
  if(level>=2n){f.printString('KG_NEED');return;}
  if(level===0n){if(coins<4n){f.printString('KG_POOR');return;}
  f.setCustomVariable(player,'coins',coins-4n,true);}
  if(level===1n){if(coins<6n){f.printString('KG_POOR');return;}
  f.setCustomVariable(player,'coins',coins-6n,true);}
  f.setCustomVariable(player,'keep',level+1n,true);
  f.printString('KG_KEEP');f.printString(f.dataTypeConversion(level+1n,'str'));
})
```

### _GSTS_KgCamp（37 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v4, graph "camp": see examples/kingdom4/gen_kingdom4.py.
g.server({id:1073741828,name:'_GSTS_KgCamp'})
.on('whenTabIsSelected',(evt,f)=>{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const coins=f.getCustomVariable(player,'coins').asType('int');
  const citizens=f.getCustomVariable(player,'citizens').asType('int');
  if(citizens+f.getCustomVariable(player,'builders').asType('int')+f.getCustomVariable(player,'archers').asType('int')>=6n){f.printString('KG_NEED');return;}
  if(coins<1n){f.printString('KG_POOR');return;}
  f.setCustomVariable(player,'coins',coins-1n,true);
  f.setCustomVariable(player,'citizens',citizens+1n,true);
  const unit=f.createPrefab(1077936139,f.create3dVector(4.2+Number(citizens)*0.9,0.4,2.6),[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
  f.modifyEntityFaction(unit,f.queryEntityFaction(player));
  f.printString('KG_CITIZEN');
})
```

### _GSTS_KgSmith（44 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v4, graph "smith": see examples/kingdom4/gen_kingdom4.py.
g.server({id:1073741829,name:'_GSTS_KgSmith'})
.on('whenTabIsSelected',(evt,f)=>{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const coins=f.getCustomVariable(player,'coins').asType('int');
  const citizens=f.getCustomVariable(player,'citizens').asType('int');
  if(citizens<1n){f.printString('KG_NEED');return;}
  if(coins<3n){f.printString('KG_POOR');return;}
  f.setCustomVariable(player,'coins',coins-3n,true);
  f.setCustomVariable(player,'citizens',citizens-1n,true);
  const folk=f.getEntitiesWithSpecifiedPrefabOnTheField(1077936139);
  if(folk.length>0)f.removeEntity(folk[0]);
  const builders=f.getCustomVariable(player,'builders').asType('int');
  f.setCustomVariable(player,'builders',builders+1n,true);
  const unit=f.createPrefab(1077936140,f.create3dVector(10.4+Number(builders)*0.9,0.4,2.8),[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
  f.modifyEntityFaction(unit,f.queryEntityFaction(player));
  f.printString('KG_BUILDER');
})
```

### _GSTS_KgRange（84 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v4, graph "range": see examples/kingdom4/gen_kingdom4.py.
g.server({id:1073741830,name:'_GSTS_KgRange'})
.on('whenTabIsSelected',(evt,f)=>{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const coins=f.getCustomVariable(player,'coins').asType('int');
  const citizens=f.getCustomVariable(player,'citizens').asType('int');
  if(citizens<1n){f.printString('KG_NEED');return;}
  if(coins<2n){f.printString('KG_POOR');return;}
  f.setCustomVariable(player,'coins',coins-2n,true);
  f.setCustomVariable(player,'citizens',citizens-1n,true);
  const folk=f.getEntitiesWithSpecifiedPrefabOnTheField(1077936139);
  if(folk.length>0)f.removeEntity(folk[0]);
  const archers=f.getCustomVariable(player,'archers').asType('int');
  f.setCustomVariable(player,'archers',archers+1n,true);
  const unit=f.createPrefab(1077936141,f.create3dVector(17.0+Number(archers)*0.9,0.4,2.6),[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
  f.modifyEntityFaction(unit,f.queryEntityFaction(player));
  f.printString('KG_ARCHER');
})
.on('whenEnteringCollisionTrigger',(evt,f)=>{
  // The range of the bows is the shop's trigger for creatures: one Greed that comes in is shot, then the bows reload.
  if(f.getEntityListBySpecifiedPrefabId([evt.enteringEntity],1077936138).length!==1)return;
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  if(f.getCustomVariable(players[0],'archers').asType('int')<1n)return;
  if(!f.getCustomVariable(evt.triggerEntity,'loaded').asType('bool'))return;
  f.setCustomVariable(evt.triggerEntity,'loaded',false,true);
  f.startTimer(evt.triggerEntity,'KG_RELOAD',false,[4]);
  f.hpLoss(evt.enteringEntity,f.getCreationAttribute(evt.enteringEntity).maxHp,true,false,false,DamagePopUpType.NormalPopUp);
  f.printString('KG_SHOT');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='KG_RELOAD')return;
  f.setCustomVariable(evt.eventSourceEntity,'loaded',true,true);
})
.onSignal('KG_dawn',(evt,f)=>{
  f.setCustomVariable(f.getSelfEntity(),'loaded',true,true);
})
```

### _GSTS_KgSite（64 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v4, graph "site": see examples/kingdom4/gen_kingdom4.py.
g.server({id:1073741831,name:'_GSTS_KgSite'})
.on('whenTabIsSelected',(evt,f)=>{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const coins=f.getCustomVariable(player,'coins').asType('int');
  const site=evt.eventSourceEntity;
  const level=f.getCustomVariable(site,'level').asType('int');
  if(f.getCustomVariable(player,'builders').asType('int')<1n){f.printString('KG_NEED');return;}
  if(level===0n){
    if(coins<3n){f.printString('KG_POOR');return;}
  f.setCustomVariable(player,'coins',coins-3n,true);
    // The wall joins the monarch's side: creatures are hostile to players only, and an order to go for something that
    // is not an enemy moved nobody (seen in play).
    const wood=f.createPrefab(1077936136,[23,0,0.3],[0,90,0],site,false,1,[] as bigint[]);
    f.modifyEntityFaction(wood,f.queryEntityFaction(player));
    f.setCustomVariable(site,'level',1n,true);
    f.printString('KG_WALL');f.printString('1');
    return;
  }
  if(level===1n){
    // Stone needs a keep of level 1. The wooden wall is taken away without falling: nobody is told it is down.
    if(f.getCustomVariable(player,'keep').asType('int')<1n){f.printString('KG_NEED');return;}
    if(coins<5n){f.printString('KG_POOR');return;}
  f.setCustomVariable(player,'coins',coins-5n,true);
    for(const piece of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936136))f.removeEntity(piece);
    const stone=f.createPrefab(1077936137,[23,0,0.3],[0,90,0],site,false,1,[] as bigint[]);
    f.modifyEntityFaction(stone,f.queryEntityFaction(player));
    f.setCustomVariable(site,'level',2n,true);
    f.printString('KG_WALL');f.printString('2');
    return;
  }
  f.printString('KG_NEED');
})
.onSignal('KG_wall_down',(evt,f)=>{
  f.setCustomVariable(f.getSelfEntity(),'level',0n,true);
})
```

### _GSTS_KgWall（45 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v4, graph "wall": see examples/kingdom4/gen_kingdom4.py.
g.server({id:1073741832,name:'_GSTS_KgWall'})
.on('whenEnteringCollisionTrigger',(evt,f)=>{
  if(f.getEntityListBySpecifiedPrefabId([evt.enteringEntity],1077936138).length!==1)return;
  const hp=f.getCustomVariable(evt.triggerEntity,'hp').asType('int');
  f.removeEntity(evt.enteringEntity);
  f.setCustomVariable(evt.triggerEntity,'hp',hp-1n,true);
  f.printString('KG_WALL_HIT');
})
.on('whenCustomVariableChanges',(evt,f)=>{
  if(evt.variableName!=='hp')return;
  // The event is typed: read the value as the variable's own type.
  if(evt.postChangeValue.asType('int')>0n)return;
  f.sendSignal('KG_wall_down');
  f.printString('KG_WALL_DOWN');
  f.destroyEntity(evt.eventSourceEntity);
})
.onSignal('KG_dawn',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  if(f.getCustomVariable(players[0],'builders').asType('int')<1n)return;
  const self=f.getSelfEntity();
  f.setCustomVariable(self,'hp',f.getCustomVariable(self,'full').asType('int'),true);
  f.printString('KG_MENDED');
})
```

### _GSTS_KgGreed（70 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v4, graph "greed": see examples/kingdom4/gen_kingdom4.py.
g.server({id:1073741833,name:'_GSTS_KgGreed'})
.on('whenEntityIsCreated',(evt,f)=>{
  // An order given the moment a creature appears is not taken (seen in play): the first one comes a second later, and
  // then one every three seconds, in case a wall was built or fell meanwhile.
  f.startTimer(evt.eventSourceEntity,'KG_AIM',false,[1]);
  f.startTimer(evt.eventSourceEntity,'KG_HUNT',true,[3]);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  const self=evt.eventSourceEntity;
  const wood=f.getEntitiesWithSpecifiedPrefabOnTheField(1077936136);
  const stone=f.getEntitiesWithSpecifiedPrefabOnTheField(1077936137);
  for(const piece of wood)f.setTheAggroValueOfSpecifiedEntity(piece,self,100000n);
  for(const piece of stone)f.setTheAggroValueOfSpecifiedEntity(piece,self,100000n);
  if(wood.length>0)return;
  if(stone.length>0)return;
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
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
  // "it reached the monarch" is its own trigger for characters, 4.5 m around it. It takes a coin and vanishes; from an
  // empty purse it takes the crown.
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.enteringEntity as any);
  const coins=f.getCustomVariable(player,'coins').asType('int');
  if(coins>0n){
    f.setCustomVariable(player,'coins',coins-1n,true);
    f.printString('KG_STOLEN');
    f.removeEntity(evt.triggerEntity);
    return;
  }
  f.printString('KG_CROWN_LOST');
  f.setPlayerSettlementSuccessStatus(player,SettlementStatus.Defeat);
  f.settleStage();
})
.onSignal('KG_dawn',(evt,f)=>{
  f.printString('KG_GREED_GONE');
  f.removeEntity(f.getSelfEntity());
})
```

### _GSTS_KgPlayer（9 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DamagePopUpType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v4, graph "player": see examples/kingdom4/gen_kingdom4.py.
g.server({id:1073741834,name:'_GSTS_KgPlayer'})
.on('whenCustomVariableChanges',(evt,f)=>{
  if(evt.variableName!=='coins')return;
  f.printString('KG_COINS');
  f.printString(f.dataTypeConversion(evt.postChangeValue.asType('int'),'str'));
})
```
