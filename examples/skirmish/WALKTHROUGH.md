# 样例 skirmish：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。

## 这个样例是什么

Complex creatures that work by day, take their posts at night and fight, with the platform's own fighting and every attack the one its animation was made for: a farmer who digs with a pickaxe, a knife thrower and a soldier with a sword on the player's side, a wall with a hurt box, and five foes in two groups who hit with bare hands. The models come with empty hands: the sword is a looping effect that is a model, mounted on the soldier's weapon attachment point; the pickaxe and the knife are shown by their skills while the animation holds them (scene_add_creature_skill {effect}). A stroke is a hit box triggered by the skill's graph at the moment the animation strikes; the thrown knife is a projectile that follows its target (scene_add_components {projectile:{type:"tracking"}}) and whose hit detection answers to enemies only and attacks with its ability unit. What to look for in the prints: SK_HP soldier / foe / wall (their full health); SK_DIG by day and none after SK_NIGHT; SK_AT shows the farmer's x going back to 3 and the thrower's and soldier's to 9.5 and 15 after SK_NIGHT; after SK_FOES: SK_TARGET soldier on / thrower on, SK_THROW then SK_KNIFE_HIT and SK_HURT, SK_SLASH then SK_HIT soldier 40, SK_PUNCH then SK_HIT foe 25, SK_DOWN foe; a foe that gets as far as the wall: SK_AT_WALL, SK_WALL n going down; after SK_DAY the foes that are left run back. Every run goes differently, the cooldowns are random: in the run written up in WALKTHROUGH.md (2026-10-11, the fourth) the soldier cut down all five and the wall was never reached; in the one before, the second group brought the soldier down (SK_DOWN soldier), two of them hammered the wall from 200 to 100 and fell to the thrower's knives. The knife's ability unit asks for 0 x attack + 40 and takes 18 (SK_HURT): what an ability unit deals is reduced, what a hit box deals is not. The screenshots and the recording show the pickaxe, the knife in the hand and in the air, the sword and the health bars.

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":6}`
3. `editor_open_map` `{}`
4. `scene_build_blocks` `{"name":"Skirmish","blocks":[{"template":"石质墙体（灰）","name":"SK_house","position":[1.5,0,5.5],"size":[2.2,2.2,2.2]},{"template":20001954,"name":"SK_wheat_0","position":[7.6,0,5.6]},{"template":20001954,"name":"SK_wheat_1","position":[6.2,0,6]},"… 5 more pieces of the same form"]}` → `{"name":"Skirmish"}`
5. `scene_import_assets` `{"packs":["Skirmish"]}`
6. `scene_list_entities` `{"namePrefix":"SK_"}` → `{"total":8}`
7. `scene_add_prefab` `{"fromEntity":"SK_farmer_src","name":"SK_farmer"}` → `{"name":"SK_farmer","prefabId":1082130437}`
8. `scene_add_prefab` `{"fromEntity":"SK_thrower_src","name":"SK_thrower"}` → `{"name":"SK_thrower","prefabId":1082130438}`
9. `scene_add_prefab` `{"fromEntity":"SK_soldier_src","name":"SK_soldier","health":30}` → `{"name":"SK_soldier","prefabId":1082130439}`
10. `scene_add_prefab` `{"fromEntity":"SK_foe_src","name":"SK_foe","health":12}` → `{"name":"SK_foe","prefabId":1082130440}`
11. `scene_add_prefab` `{"asset":20003092,"name":"SK_wall","scale":[0.55,1.2,1],"health":200}` → `{"name":"SK_wall","prefabId":1077936133}`
12. `scene_add_prefab` `{"asset":20001929,"name":"SK_knife","scale":0.2}` → `{"name":"SK_knife","prefabId":1077936134}`
13. `scene_set_faction_hostility` `{"hostilePairs":[[1,3]]}`
14. `scene_set_level_settings` `{"aggroMode":"custom"}`
15. `scene_set_spawn` `{"position":[14,0.4,-6.5],"rotation":[0,0,0]}` → `{"pointId":1073741825}`
16. `scene_add_graph` `{"name":"SkStage"}` → `{"graphId":1073741825,"name":"_GSTS_SkStage"}`
17. `scene_add_graph` `{"name":"SkUnit","attachToPrefab":["SK_farmer","SK_thrower","SK_soldier"]}` → `{"graphId":1073741826,"name":"_GSTS_SkUnit"}`
18. `scene_add_graph` `{"name":"SkFoe","attachToPrefab":"SK_foe"}` → `{"graphId":1073741827,"name":"_GSTS_SkFoe"}`
19. `scene_add_graph` `{"name":"SkWall","attachToPrefab":"SK_wall"}` → `{"graphId":1073741828,"name":"_GSTS_SkWall"}`
20. `scene_add_graph` `{"name":"SkKnife","attachToPrefab":"SK_knife"}` → `{"graphId":1073741829,"name":"_GSTS_SkKnife"}`
21. `scene_add_graph` `{"name":"SkDig","kind":"creatureSkill"}` → `{"graphId":1082130433,"name":"_GSTS_SkDig"}`
22. `scene_add_graph` `{"name":"SkThrow","kind":"creatureSkill"}` → `{"graphId":1082130434,"name":"_GSTS_SkThrow"}`
23. `scene_add_graph` `{"name":"SkSlash","kind":"creatureSkill"}` → `{"graphId":1082130435,"name":"_GSTS_SkSlash"}`
24. `scene_add_graph` `{"name":"SkPunch","kind":"creatureSkill"}` → `{"graphId":1082130436,"name":"_GSTS_SkPunch"}`
25. `scene_add_graph` `{"name":"SkFarmerMind","kind":"creatureDecision"}` → `{"graphId":1082130437,"name":"_GSTS_SkFarmerMind"}`
26. `scene_add_graph` `{"name":"SkThrowerMind","kind":"creatureDecision"}` → `{"graphId":1082130438,"name":"_GSTS_SkThrowerMind"}`
27. `scene_add_graph` `{"name":"SkSoldierMind","kind":"creatureDecision"}` → `{"graphId":1082130439,"name":"_GSTS_SkSoldierMind"}`
28. `scene_add_graph` `{"name":"SkFoeMind","kind":"creatureDecision"}` → `{"graphId":1082130440,"name":"_GSTS_SkFoeMind"}`
29. `scene_add_graph` `{"name":"SkHome","kind":"creatureStatus"}` → `{"graphId":1082130441,"name":"_GSTS_SkHome"}`
30. `scene_add_graph` `{"name":"SkPost","kind":"creatureStatus"}` → `{"graphId":1082130442,"name":"_GSTS_SkPost"}`
31. `scene_add_graph` `{"name":"SkStroll","kind":"creatureStatus"}` → `{"graphId":1082130443,"name":"_GSTS_SkStroll"}`
32. `scene_add_graph` `{"name":"SkWork","kind":"creatureStatus"}` → `{"graphId":1082130444,"name":"_GSTS_SkWork"}`
33. `scene_add_graph` `{"name":"SkShoot","kind":"creatureStatus"}` → `{"graphId":1082130445,"name":"_GSTS_SkShoot"}`
34. `scene_add_graph` `{"name":"SkFight","kind":"creatureStatus"}` → `{"graphId":1082130446,"name":"_GSTS_SkFight"}`
35. `scene_add_graph` `{"name":"SkAdvance","kind":"creatureStatus"}` → `{"graphId":1082130447,"name":"_GSTS_SkAdvance"}`
36. `scene_add_graph` `{"name":"SkBash","kind":"creatureStatus"}` → `{"graphId":1082130448,"name":"_GSTS_SkBash"}`
37. `scene_add_graph` `{"name":"SkRetreat","kind":"creatureStatus"}` → `{"graphId":1082130449,"name":"_GSTS_SkRetreat"}`
38. `scene_add_creature_skill` `{"name":"SK_dig","creature":30006009,"animation":"挖矿01","graphAtMs":700,"effect":{"asset":10006070,"attachPoint":"GI_WeaponR","ms":4400},"graphId":1082130433}` → `{"graphId":1082130433,"name":"SK_dig","skillId":1191182337}`
39. `scene_add_creature_skill` `{"name":"SK_throw","creature":30006009,"animation":"远程攻击_01","animationPortion":0.62,"graphAtMs":2050,"faceTarget":true,"effect":{"asset":10006069,"attachPoint":"GI_WeaponR","ms":2000},"graphId":1082130434}` → `{"graphId":1082130434,"name":"SK_throw","skillId":1191182338}`
40. `scene_add_creature_skill` `{"name":"SK_slash","creature":30008001,"animation":"近战攻击_02","graphAtMs":750,"faceTarget":true,"graphId":1082130435}` → `{"graphId":1082130435,"name":"SK_slash","skillId":1191182339}`
41. `scene_add_creature_skill` `{"name":"SK_punch","creature":30007001,"animation":"无武器攻击","graphAtMs":900,"faceTarget":true,"graphId":1082130436}` → `{"graphId":1082130436,"name":"SK_punch","skillId":1191182340}`
42. `scene_set_creature_logic` `{"prefab":"SK_farmer","skills":[{"skill":"SK_dig","cooldownSeconds":[0.3,0.8]}],"decisionGraphId":1082130437}`
43. `scene_set_creature_logic` `{"prefab":"SK_thrower","skills":[{"skill":"SK_throw","cooldownSeconds":[0.4,0.9]}],"logic":{"noticeRadius":13,"leaveCombatDistance":20},"decisionGraphId":1082130438}`
44. `scene_set_creature_logic` `{"prefab":"SK_soldier","skills":[{"skill":"SK_slash","cooldownSeconds":[0.5,1]}],"logic":{"noticeRadius":8,"leaveCombatDistance":14},"decisionGraphId":1082130439}`
45. `scene_set_creature_logic` `{"prefab":"SK_foe","skills":[{"skill":"SK_punch","cooldownSeconds":[1,2]}],"logic":{"noticeRadius":4,"leaveCombatDistance":12,"territoryRadius":80},"decisionGraphId":1082130440}`
46. `scene_add_components` `{"entity":"关卡实体","variables":[{"name":"night","type":"integer","value":0}]}`
47. `scene_add_components` `{"prefab":"SK_farmer","variables":[{"name":"kind","type":"integer","value":1},{"name":"wx","type":"float","value":0},{"name":"wz","type":"float","value":0}]}`
48. `scene_add_components` `{"prefab":"SK_thrower","variables":[{"name":"kind","type":"integer","value":2},{"name":"wx","type":"float","value":0},{"name":"wz","type":"float","value":0}]}`
49. `scene_add_components` `{"prefab":"SK_soldier","variables":[{"name":"kind","type":"integer","value":3},{"name":"wx","type":"float","value":0},{"name":"wz","type":"float","value":0}]}`
50. `scene_add_components` `{"prefab":"SK_foe","variables":[{"name":"kind","type":"integer","value":4}]}`
51. `scene_add_components` `{"prefab":"SK_wall","solid":false,"variables":[{"name":"kind","type":"integer","value":5}],"hurtBox":{"areas":[{"size":[4,1.1,1.6],"offset":[0,0.55,0]}]}}`
52. `scene_add_components` `{"prefab":"SK_knife","solid":false,"projectile":{"type":"tracking","velocity":[0,0,16],"turnDegreesPerSecond":720},"hitDetection":{"areas":[{"radius":0.5}],"trigger":"oncePerEntity","delaySeconds":0.05,"abilityUnit":"SK_pierce","layers":["hurtBox"],"factions":"hostile","continuous":{"speedAbove":5,"radius":0.5}},"abilityUnits":[{"name":"SK_pierce","attack":{"coefficient":0,"added":40}}]}`
53. `scene_list_prefabs` `{}`
54. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, … 共 22 张]}`：对每张图依次编译并写进存档，返回全部写好、可以试玩的存档。
55. `playtest_start` `{"graphNames":["_GSTS_SkStage","_GSTS_SkUnit","_GSTS_SkFoe","_GSTS_SkWall","_GSTS_SkKnife"],"durationSeconds":96,"screenshotsAt":[6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,62,64,66,68,70,72,74,76,78,80,82,84,86,88,90,92],"inputs":[],"readTextAt":[],"recordAudio":false,"bakeNavigation":true}`

## 二、各张节点图的源码

一共 22 张，合计 406 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_SkStage（151 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Skirmish, graph "stage": see examples/skirmish/gen_skirmish.py.
g.server({id:1073741825,name:'_GSTS_SkStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'SK_PLAN',false,[3,14,22,44,78,92]);
  f.printString('SK_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const stage=evt.eventSourceEntity,side=f.queryEntityFaction(players[0]);
  if(evt.timerName==='SK_TICK'){
    f.printString('SK_AT');
    for(const one of f.getEntitiesWithSpecifiedPrefabOnTheField(1082130437)){f.printString(f.dataTypeConversion(f.split3dVector(f.getEntityLocationAndRotation(one).location).xComponent,'str'));}
    for(const one of f.getEntitiesWithSpecifiedPrefabOnTheField(1082130438)){f.printString(f.dataTypeConversion(f.split3dVector(f.getEntityLocationAndRotation(one).location).xComponent,'str'));}
    for(const one of f.getEntitiesWithSpecifiedPrefabOnTheField(1082130439)){f.printString(f.dataTypeConversion(f.split3dVector(f.getEntityLocationAndRotation(one).location).xComponent,'str'));}
    return;
  }
  if(evt.timerName!=='SK_PLAN')return;
  if(evt.timerSequenceId===0n){
    // The wall stands on the player's side, or the foes would have no reason to go for it.
    const wall=f.createPrefab(1077936133,[12,0,0.3],[0,90,0],stage,false,1,[] as bigint[]);
    f.modifyEntityFaction(wall,side);
    // The soldier gets its sword: a looping effect that is a model, mounted on its weapon attachment point.
    const farmer=f.createPrefab(1082130437,[3,0.4,3.5],[0,90,0],stage,false,1,[] as bigint[]);f.modifyEntityFaction(farmer,side);f.setCustomVariable(farmer,'wx',7,true);f.setCustomVariable(farmer,'wz',4,true);
    const thrower=f.createPrefab(1082130438,[6,0.4,1],[0,90,0],stage,false,1,[] as bigint[]);f.modifyEntityFaction(thrower,side);f.setCustomVariable(thrower,'wx',9.5,true);f.setCustomVariable(thrower,'wz',1.5,true);
    const soldier=f.createPrefab(1082130439,[8,0.4,2],[0,90,0],stage,false,1,[] as bigint[]);f.modifyEntityFaction(soldier,side);f.setCustomVariable(soldier,'wx',15,true);f.setCustomVariable(soldier,'wz',1,true);f.mountLoopingSpecialEffect(10002152,soldier,'GI_WeaponR',true,true,[0,0,0],[0,0,0],1.4,false);
    f.printString('SK_HP');f.printString('soldier');f.printString(f.dataTypeConversion(f.getCreationAttribute(soldier as any).maxHp,'str'));
    f.printString('SK_HP');f.printString('wall');f.printString(f.dataTypeConversion(f.getObjectAttribute(wall as any).maxHp,'str'));
    f.startTimer(stage,'SK_TICK',true,[2]);
    f.printString('SK_GO');
    return;
  }
  if(evt.timerSequenceId===1n){
    // Night is one variable of the stage entity: every creature's decision graph reads it.
    f.setCustomVariable(stage,'night',1n,true);
    f.printString('SK_NIGHT');
    return;
  }
  if(evt.timerSequenceId===2n){f.createPrefab(1082130440,[27.0,0.4,-1.2],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1082130440,[28.2,0.4,0.0],[0,-90,0],stage,false,1,[] as bigint[]);f.printString('SK_FOES');f.printString('2');return;}if(evt.timerSequenceId===3n){f.createPrefab(1082130440,[27.0,0.4,-1.2],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1082130440,[28.2,0.4,0.0],[0,-90,0],stage,false,1,[] as bigint[]);f.createPrefab(1082130440,[29.4,0.4,1.2],[0,-90,0],stage,false,1,[] as bigint[]);f.printString('SK_FOES');f.printString('3');return;}
  if(evt.timerSequenceId===4n){
    f.setCustomVariable(stage,'night',0n,true);
    f.printString('SK_DAY');
    return;
  }
  f.printString('SK_LEFT');f.printString(f.dataTypeConversion(f.getEntitiesWithSpecifiedPrefabOnTheField(1082130440).length,'str'));
})
.on('whenEntityIsDestroyed',(evt,f)=>{
  // Whoever ran out of health. The entity is gone: what it was is read from the copy of its variables the event carries.
  const kind=f.queryCustomVariableSnapshot(evt.customVariableComponentSnapshot,'kind').asType('int');
  f.printString('SK_DOWN');
  if(kind===1n)f.printString('farmer');if(kind===2n)f.printString('thrower');if(kind===3n)f.printString('soldier');if(kind===4n)f.printString('foe');if(kind===5n)f.printString('wall');
})
```

### _GSTS_SkUnit（74 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Skirmish, graph "unit": see examples/skirmish/gen_skirmish.py.
g.server({id:1073741826,name:'_GSTS_SkUnit'})
.on('whenSkillNodeIsCalled',(evt,f)=>{
  // The skill's graph called at the moment of the animation that counts. Which unit this is, its prefab says.
  const self=f.getSelfEntity();
  if(f.getEntityListBySpecifiedPrefabId([self],1082130437).length===1){f.printString('SK_DIG');return;}
  if(f.getEntityListBySpecifiedPrefabId([self],1082130439).length===1){f.printString('SK_SLASH');return;}
  // The thrower's hand opens: a knife is launched from where the hand is, pointed at the target, and told to follow
  // it (the projectile motion device of SK_knife is a tracking one). It is on the thrower's side: its hit detection
  // answers to enemies only.
  const target=f.getTheAggroTargetOfTheSpecifiedEntity(self);
  if(!f.queryIfEntityIsOnTheField(target))return;
  const here=f.split3dVector(f.getEntityLocationAndRotation(self).location),there=f.split3dVector(f.getEntityLocationAndRotation(target).location);
  const from=f.create3dVector(here.xComponent,here.yComponent+1.3,here.zComponent);
  const way=f.create3dVector(there.xComponent-here.xComponent,there.yComponent-here.yComponent-0.3,there.zComponent-here.zComponent);
  const knife=f.createProjectile(1077936134,from,f.directionVectorToRotation(way,[0,1,0]),self,target,false,1n,[] as bigint[]);
  f.modifyEntityFaction(knife,f.queryEntityFaction(self));
  f.printString('SK_THROW');
})
.on('whenAttackHits',(evt,f)=>{
  // A stroke of this unit took health off somebody.
  f.printString('SK_HIT');f.printString('soldier');f.printString(f.dataTypeConversion(evt.damage,'str'));
})
.on('whenAggroTargetChanges',(evt,f)=>{
  // A unit noticed an enemy, or lost it (only raised in custom aggro mode).
  const self=evt.eventSourceEntity;
  f.printString('SK_TARGET');
  if(f.getEntityListBySpecifiedPrefabId([self],1082130438).length===1)f.printString('thrower');if(f.getEntityListBySpecifiedPrefabId([self],1082130439).length===1)f.printString('soldier');if(f.getEntityListBySpecifiedPrefabId([self],1082130437).length===1)f.printString('farmer');
  if(f.queryIfEntityIsOnTheField(evt.postChangeAggroTarget))f.printString('on');
})
```

### _GSTS_SkFoe（69 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Skirmish, graph "foe": see examples/skirmish/gen_skirmish.py.
g.server({id:1073741827,name:'_GSTS_SkFoe'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'SK_LOOK',true,[1.5]);
  f.printString('SK_HP');f.printString('foe');f.printString(f.dataTypeConversion(f.getCreationAttribute(evt.eventSourceEntity as any).maxHp,'str'));
})
.on('whenTimerIsTriggered',(evt,f)=>{
  // A foe that has come up to the wall is given the wall, far above anything else it may hate: an object is not
  // noticed the way a creature is, it has to be named, and the foe is to stay at the wall whoever shoots at it from
  // behind. (The level is in custom aggro mode: the foe goes for whatever has the highest value.)
  const self=evt.eventSourceEntity;
  if(f.split3dVector(f.getEntityLocationAndRotation(self).location).xComponent>16.5)return;
  for(const wall of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936133)){
    if(f.queryTheAggroValueOfTheSpecifiedEntity(wall,self)>1000n)continue;
    f.setTheAggroValueOfSpecifiedEntity(wall,self,100000n);
    f.printString('SK_AT_WALL');
  }
})
.on('whenSkillNodeIsCalled',(evt,f)=>{
  f.printString('SK_PUNCH');
})
.on('whenAttackHits',(evt,f)=>{
  f.printString('SK_HIT');f.printString('foe');f.printString(f.dataTypeConversion(evt.damage,'str'));
})
.on('whenAttacked',(evt,f)=>{
  // Something of the player's side reached this foe: a stroke of the soldier's or a knife.
  f.printString('SK_HURT');f.printString(f.dataTypeConversion(f.getCreationAttribute(evt.eventSourceEntity as any).currentHp,'str'));
})
.on('whenAggroTargetChanges',(evt,f)=>{
  f.printString('SK_FOE_TARGET');
  const now=evt.postChangeAggroTarget;
  if(!f.queryIfEntityIsOnTheField(now))return;
  if(f.getEntityListBySpecifiedPrefabId([now],1077936133).length===1)f.printString('wall');if(f.getEntityListBySpecifiedPrefabId([now],1082130439).length===1)f.printString('soldier');if(f.getEntityListBySpecifiedPrefabId([now],1082130438).length===1)f.printString('thrower');if(f.getEntityListBySpecifiedPrefabId([now],1082130437).length===1)f.printString('farmer');
})
```

### _GSTS_SkWall（5 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Skirmish, graph "wall": see examples/skirmish/gen_skirmish.py.
g.server({id:1073741828,name:'_GSTS_SkWall'})
.on('whenAttacked',(evt,f)=>{
  f.printString('SK_WALL');f.printString(f.dataTypeConversion(f.getObjectAttribute(evt.eventSourceEntity as any).currentHp,'str'));
})
```

### _GSTS_SkKnife（12 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Skirmish, graph "knife": see examples/skirmish/gen_skirmish.py.
g.server({id:1073741829,name:'_GSTS_SkKnife'})
.on('whenEntityIsCreated',(evt,f)=>{
  // What is seen flying: the knife (a looping effect that is a model) and its trail. A knife that meets nobody is gone
  // after three seconds.
  f.mountLoopingSpecialEffect(10006069,evt.eventSourceEntity,'GI_RootNode',true,true,[0,0,0],[0,0,0],1,false);
  f.mountLoopingSpecialEffect(10006071,evt.eventSourceEntity,'GI_RootNode',true,true,[0,0,0],[0,0,0],1,false);
  f.startTimer(evt.eventSourceEntity,'SK_GONE',false,[3]);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  f.removeEntity(evt.eventSourceEntity);
})
.on('whenOnHitDetectionIsTriggered',(evt,f)=>{
  // It touched an enemy's hurt box (its hit detection does not answer to friends): the ability unit named in the hit
  // detection has attacked it. The knife is gone a moment later (removed in this same moment, it did no damage:
  // examples/shoot).
  f.playTimedEffects(10006059,evt.onHitEntity,'GI_RootNode',true,false,[0,1,0],[0,0,0],1,true);
  f.printString('SK_KNIFE_HIT');
  f.startTimer(evt.eventSourceEntity,'SK_DONE',false,[0.3]);
})
```

### _GSTS_SkDig（2 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { AttackType, ElementalType, EntityType, HitType, TargetType, TriggerRestriction } from 'genshin-ts/definitions/enum'
import { AttackLayerConfig, HitLevel, KnockbackDirectionType, SectorDetectionDirection } from 'genshin-ts/definitions/client_enums'

// Skirmish, graph "dig": see examples/skirmish/gen_skirmish.py.
g.creationSkill({id:1082130433,name:'_GSTS_SkDig',prefix:false}).on('start',(evt,f)=>{
  f.notifyServerNodeGraph('act','','');
})
```

### _GSTS_SkThrow（2 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { AttackType, ElementalType, EntityType, HitType, TargetType, TriggerRestriction } from 'genshin-ts/definitions/enum'
import { AttackLayerConfig, HitLevel, KnockbackDirectionType, SectorDetectionDirection } from 'genshin-ts/definitions/client_enums'

// Skirmish, graph "throw": see examples/skirmish/gen_skirmish.py.
g.creationSkill({id:1082130434,name:'_GSTS_SkThrow',prefix:false}).on('start',(evt,f)=>{
  // The creature's own server graph hears this (whenSkillNodeIsCalled) and lets the knife fly.
  f.notifyServerNodeGraph('act','','');
})
```

### _GSTS_SkSlash（10 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { AttackType, ElementalType, EntityType, HitType, TargetType, TriggerRestriction } from 'genshin-ts/definitions/enum'
import { AttackLayerConfig, HitLevel, KnockbackDirectionType, SectorDetectionDirection } from 'genshin-ts/definitions/client_enums'

// Skirmish, graph "slash": see examples/skirmish/gen_skirmish.py.
g.creationSkill({id:1082130435,name:'_GSTS_SkSlash',prefix:false}).on('start',(evt,f)=>{
  const self=f.getSelfEntity();
  f.triggerSectorHitboxAtSpecificLocation(TargetType.HostileFaction,f.getEntityLocation(self),f.getEntityRotation(self),0,40,[EntityType.Creation],
    TriggerRestriction.TriggerOnlyOncePerEntity,10006012,2,120,3,0,SectorDetectionDirection.FromInsideOut,AttackLayerConfig.OnlyOnHitHurtbox,[] as string[],
    ElementalType.None,0,HitType.Slash,AttackType.MeleeAttack,0,true,10006012,KnockbackDirectionType.LineConnectingAttackerAndHitPoint,false,
    [0,0,0],[0,0,0],1,[0,0,0],[0,0,0],1.5,1,1,HitLevel.LightHit,1000,1000);
  f.notifyServerNodeGraph('act','','');
  // The arc the blade draws: the effect made for this animation, where the creature stands, turned as it is.
  f.playTimedEffects(10016139,f.getEntityLocation(self),f.getEntityRotation(self),1,true);
})
```

### _GSTS_SkPunch（7 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { AttackType, ElementalType, EntityType, HitType, TargetType, TriggerRestriction } from 'genshin-ts/definitions/enum'
import { AttackLayerConfig, HitLevel, KnockbackDirectionType, SectorDetectionDirection } from 'genshin-ts/definitions/client_enums'

// Skirmish, graph "punch": see examples/skirmish/gen_skirmish.py.
g.creationSkill({id:1082130436,name:'_GSTS_SkPunch',prefix:false}).on('start',(evt,f)=>{
  const self=f.getSelfEntity();
  f.triggerSectorHitboxAtSpecificLocation(TargetType.HostileFaction,f.getEntityLocation(self),f.getEntityRotation(self),0,25,[EntityType.Object,EntityType.Creation],
    TriggerRestriction.TriggerOnlyOncePerEntity,10006012,2,120,3,0,SectorDetectionDirection.FromInsideOut,AttackLayerConfig.OnlyOnHitHurtbox,[] as string[],
    ElementalType.None,0,HitType.Smash,AttackType.MeleeAttack,0,true,10006012,KnockbackDirectionType.LineConnectingAttackerAndHitPoint,false,
    [0,0,0],[0,0,0],1,[0,0,0],[0,0,0],1.5,1,1,HitLevel.LightHit,1000,1000);
  f.notifyServerNodeGraph('act','','');
})
```

### _GSTS_SkFarmerMind（6 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Skirmish, graph "farmerMind": see examples/skirmish/gen_skirmish.py.
g.creationStatusDecision({id:1082130437,name:'_GSTS_SkFarmerMind',prefix:false}).on('start1',(evt,f)=>{
  if(f.getCustomVariable(TargetEntity.StageEntity,'night').asType('int')===1n){f.switchToSelfExecutionStatus(true,1082130441,1n);}
  else{f.switchToSelfExecutionStatus(true,1082130444,1n);}
})
```

### _GSTS_SkThrowerMind（9 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Skirmish, graph "throwerMind": see examples/skirmish/gen_skirmish.py.
g.creationStatusDecision({id:1082130438,name:'_GSTS_SkThrowerMind',prefix:false}).on('start1',(evt,f)=>{
  if(f.queryIfEntityIsOnTheField(TargetEntity.AggroTarget)){f.switchToSelfExecutionStatus(true,1082130445,1n);}
  else{if(f.getCustomVariable(TargetEntity.StageEntity,'night').asType('int')===1n){f.switchToSelfExecutionStatus(true,1082130442,1n);}
  else{f.switchToSelfExecutionStatus(true,1082130443,1n);}}
})
```

### _GSTS_SkSoldierMind（9 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Skirmish, graph "soldierMind": see examples/skirmish/gen_skirmish.py.
g.creationStatusDecision({id:1082130439,name:'_GSTS_SkSoldierMind',prefix:false}).on('start1',(evt,f)=>{
  if(f.queryIfEntityIsOnTheField(TargetEntity.AggroTarget)){f.switchToSelfExecutionStatus(true,1082130446,1n);}
  else{if(f.getCustomVariable(TargetEntity.StageEntity,'night').asType('int')===1n){f.switchToSelfExecutionStatus(true,1082130442,1n);}
  else{f.switchToSelfExecutionStatus(true,1082130443,1n);}}
})
```

### _GSTS_SkFoeMind（10 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Skirmish, graph "foeMind": see examples/skirmish/gen_skirmish.py.
g.creationStatusDecision({id:1082130440,name:'_GSTS_SkFoeMind',prefix:false}).on('start1',(evt,f)=>{
  if(!(f.getCustomVariable(TargetEntity.StageEntity,'night').asType('int')===1n)){f.switchToSelfExecutionStatus(true,1082130449,1n);}
  else{if(f.queryIfEntityIsOnTheField(TargetEntity.AggroTarget)){f.switchToSelfExecutionStatus(true,1082130448,1n);}
  else{f.switchToSelfExecutionStatus(true,1082130447,1n);}}
})
```

### _GSTS_SkHome（3 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Skirmish, graph "home": see examples/skirmish/gen_skirmish.py.
g.creationStatus({id:1082130441,name:'_GSTS_SkHome',prefix:false}).on('start1',(evt,f)=>{
  f.tacticMoveToTheTargetPosition(true,[3,0,3.5],1,TacticSpeed.Run,360,'home',false);
  f.tacticStandStill(true,'still',false);
})
```

### _GSTS_SkPost（6 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Skirmish, graph "post": see examples/skirmish/gen_skirmish.py.
g.creationStatus({id:1082130442,name:'_GSTS_SkPost',prefix:false}).on('start1',(evt,f)=>{
  f.tacticMoveToTheTargetPosition(true,f.create3dVector(f.getCustomVariable(TargetEntity.Self,'wx').asType('float'),0,f.getCustomVariable(TargetEntity.Self,'wz').asType('float')),1,TacticSpeed.Walk,360,'post',false);
  f.tacticStandStill(true,'still',false);
})
```

### _GSTS_SkStroll（3 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Skirmish, graph "stroll": see examples/skirmish/gen_skirmish.py.
g.creationStatus({id:1082130443,name:'_GSTS_SkStroll',prefix:false}).on('start1',(evt,f)=>{
  f.tacticGroundIdleRoaming(true,TacticSpeed.Walk,4,1,3,1,3,'stroll',false);
  f.tacticStandStill(true,'still',false);
})
```

### _GSTS_SkWork（7 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Skirmish, graph "work": see examples/skirmish/gen_skirmish.py.
g.creationStatus({id:1082130444,name:'_GSTS_SkWork',prefix:false}).on('start1',(evt,f)=>{
  f.tacticMoveToTheTargetPosition(true,f.create3dVector(f.getCustomVariable(TargetEntity.Self,'wx').asType('float'),0,f.getCustomVariable(TargetEntity.Self,'wz').asType('float')),1,TacticSpeed.Walk,360,'field',false);
  f.executeSkill(true,1n);
  f.tacticStandStill(true,'still',false);
})
```

### _GSTS_SkShoot（4 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Skirmish, graph "shoot": see examples/skirmish/gen_skirmish.py.
g.creationStatus({id:1082130445,name:'_GSTS_SkShoot',prefix:false}).on('start1',(evt,f)=>{
  f.executeSkill(true,1n);
  f.tacticRotateToTheTargetEntity(true,f.getTargetEntity(),360,false,'face',false);
})
```

### _GSTS_SkFight（5 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Skirmish, graph "fight": see examples/skirmish/gen_skirmish.py.
g.creationStatus({id:1082130446,name:'_GSTS_SkFight',prefix:false}).on('start1',(evt,f)=>{
  f.tacticGroundPursuit(true,3.8,30,3.4,TacticSpeed.Run,4,TacticSpeed.Run,6,0,'chase',false);
  f.executeSkill(true,1n);
  f.tacticRotateToTheTargetEntity(true,f.getTargetEntity(),360,false,'face',false);
})
```

### _GSTS_SkAdvance（3 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Skirmish, graph "advance": see examples/skirmish/gen_skirmish.py.
g.creationStatus({id:1082130447,name:'_GSTS_SkAdvance',prefix:false}).on('start1',(evt,f)=>{
  f.tacticMoveToTheTargetPosition(true,[14.5,0,0.3],1.5,TacticSpeed.Walk,360,'march',false);
  f.tacticStandStill(true,'still',false);
})
```

### _GSTS_SkBash（6 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Skirmish, graph "bash": see examples/skirmish/gen_skirmish.py.
g.creationStatus({id:1082130448,name:'_GSTS_SkBash',prefix:false}).on('start1',(evt,f)=>{
  f.tacticMoveToTheTargetEntity(true,f.getTargetEntity(),2.2,TacticSpeed.Run,360,'close',false);
  f.executeSkill(true,1n);
  f.tacticRotateToTheTargetEntity(true,f.getTargetEntity(),360,false,'face',false);
})
```

### _GSTS_SkRetreat（3 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Skirmish, graph "retreat": see examples/skirmish/gen_skirmish.py.
g.creationStatus({id:1082130449,name:'_GSTS_SkRetreat',prefix:false}).on('start1',(evt,f)=>{
  f.tacticMoveToTheTargetPosition(true,[27,0,0],1.5,TacticSpeed.Run,360,'flee',false);
  f.tacticStandStill(true,'still',false);
})
```
