# 样例 strike：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

A sword attack that really hits: a normal skill (animation 1001, a sword in the hand) whose graph triggers the official sector hit box 250 ms into the swing. In front of the start stand a crate (an object with a hurt box and loot) and a creature (with loot). The script swings five times: the crate breaks at the first hit, the creature falls at the second or third (50 damage a hit, shown as numbers over the target); each leaves a drop, and the stage then puts the character beside the two drops to pick them up with F (two apples, then three more). Played as written on 2026-10-11: the apples held go 0, 2, 5. Prints: ST_READY, ST_SWING, ST_HIT slime damage, ST_DEAD place, ST_HOLD apples.

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":8,"yawRange":[0,0]}`
3. [UI] `editor_open_map` `{mapPath}`：在编辑器里打开底图的副本（演练时跳过）
4. `scene_build_blocks` `{"name":"Strike_Probe","blocks":[{"template":"石质墙体（灰）","name":"ST_post_a","position":[-6,0,5],"size":[0.4,2,0.4]},{"template":"石质墙体（灰）","name":"ST_post_b","position":[6,0,5],"size":[0.4,2,0.4]},{"template":30002003,"name":"ST_enemy","position":[20,0.3,20],"rotation":[0,180,0],"createAtStart":false}]}` → `{"name":"Strike_Probe"}`
5. [UI] `scene_import_assets` `{"packs":["Strike_Probe"]}`：把上面的场景包导入并保存（演练时跳过）
6. `scene_list_entities` `{"namePrefix":"ST_"}` → `{"total":0}`
7. `scene_add_prefab` `{"asset":10005008,"name":"ST_crate","scale":1.5}` → `{"name":"ST_crate","prefabId":1077936129}`
8. `scene_add_prefab` `{"asset":10005009,"name":"ST_slime"}` → `{"name":"ST_slime","prefabId":1077936130}`
9. `scene_set_faction_hostility` `{"hostilePairs":[[1,3]]}`
10. `scene_add_currency` `{"name":"ST_coin","startAmount":0}` → `{"name":"ST_coin","currencyId":1115684865,"backpackTemplateId":1119879169}`
11. `scene_set_spawn` `{"position":[0,0.4,0],"rotation":[0,0,0]}` → `{"pointId":1073741825}`
12. `scene_set_class` `{"allowClimb":false}`
13. `scene_add_graph` `{"name":"StStage"}` → `{"graphId":1073741825,"name":"_GSTS_StStage"}`
14. `scene_add_graph` `{"name":"StCrate","attachToPrefab":"ST_crate"}` → `{"graphId":1073741826,"name":"_GSTS_StCrate"}`
15. `scene_add_graph` `{"name":"StSlime","attachToPrefab":"ST_slime"}` → `{"graphId":1073741827,"name":"_GSTS_StSlime"}`
16. `scene_add_graph` `{"name":"StHero","attachToPrefab":"character"}` → `{"graphId":1073741828,"name":"_GSTS_StHero"}`
17. `scene_add_graph` `{"name":"StSwing","kind":"characterSkill"}` → `{"graphId":1082130433,"name":"_GSTS_StSwing"}`
18. `scene_add_item` `{"name":"ST_apple","icon":90001}` → `{"name":"ST_apple","itemId":1107296257}`
19. `scene_add_prefab` `{"asset":20001554,"name":"ST_fallen","drop":{"item":"ST_apple","amount":1}}` → `{"name":"ST_fallen","prefabId":1077936131}`
20. `scene_add_skill` `{"name":"ST_swing","type":"normal","animation":1001,"graphAtMs":250,"effect":{"asset":10002152,"attachPoint":"GI_WeaponR","ms":1833.333},"graphId":1082130433}` → `{"graphId":1082130433,"name":"ST_swing","skillId":1098907649}`
21. `scene_add_components` `{"prefab":"ST_crate","hurtBox":{"areas":[{"size":[1.6,1.2,1.4],"offset":[0,0.6,0]}]},"loot":{"dropPrefab":"ST_fallen","items":[{"item":"ST_apple","amount":2}]}}`
22. `scene_add_components` `{"prefab":"ST_slime","loot":{"dropPrefab":"ST_fallen","items":[{"item":"ST_apple","amount":3}]}}`
23. `scene_add_components` `{"prefab":"player","variables":[{"name":"dead","type":"integer","value":0},{"name":"ax","type":"float","value":0},{"name":"az","type":"float","value":0},{"name":"bx","type":"float","value":0},{"name":"bz","type":"float","value":0}]}`
24. `scene_list_prefabs` `{}`
25. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, …]}`：把每张图的源码编译并写进存档，返回可以试玩的存档。
26. `scene_list_components` `{"prefab":"ST_crate"}`
27. `inspect_map` `{}`
28. [UI] `playtest_start` `{"graphNames":["_GSTS_StStage","_GSTS_StCrate","_GSTS_StSlime","_GSTS_StHero","_GSTS_StSwing"],"durationSeconds":27,"screenshotsAt":[2.5,4.4,4.8,7,9.4,9.8,12,16,17.8,20,21.8,25],"inputs":[{"at":4,"key":"e"},{"at":6.5,"key":"e"},{"at":9,"key":"e"},{"at":11.5,"key":"e"},{"at":14,"key":"e"},{"at":18.6,"key":"f"},{"at":22.6,"key":"f"}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 5 张，合计 97 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_StStage（78 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Strike, graph "stage": see examples/strike/gen_strike.py.
g.server({id:1073741825,name:'_GSTS_StStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  const stage=evt.eventSourceEntity;
  // Both stand within the three metres of the hit box in front of the start (the character faces +z).
  f.createPrefab(1077936129,[-1,0,2],[0,0,0],stage,false,1,[] as bigint[]);
  f.createPrefab(1077936130,[1.2,0.3,2.2],[0,180,0],stage,false,1,[] as bigint[]);
  f.startTimer(stage,'ST_GIVE',false,[2]);
  f.startTimer(stage,'ST_HOLD',true,[3]);
  f.startTimer(stage,'ST_PICK',false,[22,26]);
  f.printString('ST_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  if(evt.timerName==='ST_PICK'){
    // After the fight the character is put 0.6 m beside each thing that was left behind (the prompt to pick up shows
    // at about that distance), where the script presses F. The places were kept on the player when the things fell.
    const p=players[0];
    if(evt.timerSequenceId===0n)f.teleportPlayer(p,f.create3dVector(f.getCustomVariable(p,'ax').asType('float')-0.6,0.4,f.getCustomVariable(p,'az').asType('float')),[0,0,0]);
    else f.teleportPlayer(p,f.create3dVector(f.getCustomVariable(p,'bx').asType('float')-0.6,0.4,f.getCustomVariable(p,'bz').asType('float')),[0,0,0]);
    return;
  }
  for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0])){
    if(evt.timerName==='ST_GIVE'){f.addCharacterSkill(hero as any,1098907649,CharacterSkillSlot.Skill1E,TopOfStackSkillDestructionType.Destroy);continue;}
    f.printString('ST_HOLD');f.printString(f.dataTypeConversion(f.getInventoryItemQuantity(hero,1107296257),'str'));
  }
})
.on('whenEntityIsDestroyed',(evt,f)=>{
  f.printString('ST_DEAD');f.printString(f.dataTypeConversion(evt.location,'str'));
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const p=players[0],at=f.split3dVector(evt.location),fallen=f.getCustomVariable(p,'dead').asType('int');
  if(fallen===0n){f.setCustomVariable(p,'ax',at.xComponent,true);f.setCustomVariable(p,'az',at.zComponent,true);}
  else{f.setCustomVariable(p,'bx',at.xComponent,true);f.setCustomVariable(p,'bz',at.zComponent,true);}
  f.setCustomVariable(p,'dead',fallen+1n,true);
})
```

### _GSTS_StCrate（5 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Strike, graph "crate": see examples/strike/gen_strike.py.
g.server({id:1073741826,name:'_GSTS_StCrate'})
.on('whenAttacked',(evt,f)=>{
  f.printString('ST_HIT');f.printString('crate');f.printString(f.dataTypeConversion(evt.damage,'str'));
})
```

### _GSTS_StSlime（5 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Strike, graph "slime": see examples/strike/gen_strike.py.
g.server({id:1073741827,name:'_GSTS_StSlime'})
.on('whenAttacked',(evt,f)=>{
  f.printString('ST_HIT');f.printString('slime');f.printString(f.dataTypeConversion(evt.damage,'str'));
})
```

### _GSTS_StHero（2 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Strike, graph "hero": see examples/strike/gen_strike.py.
g.server({id:1073741828,name:'_GSTS_StHero'})
.on('whenSkillNodeIsCalled',(evt,f)=>{
  f.printString('ST_SWING');
})
```

### _GSTS_StSwing（7 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { AttackType, ElementalType, EntityType, HitType, TargetType, TriggerRestriction } from 'genshin-ts/definitions/enum'
import { AttackLayerConfig, HitLevel, KnockbackDirectionType, SectorDetectionDirection } from 'genshin-ts/definitions/client_enums'

// Strike, graph "swing": see examples/strike/gen_strike.py.
g.characterSkill({id:1082130433,name:'_GSTS_StSwing',prefix:false})
.on('start',(evt,f)=>{
  const self=f.getSelfEntity();
  // (The official graph leaves the list of entity types empty; the compiler cannot write an empty list of an
  // enumeration, so the two kinds this level has are named.)
  // The values of the official attack: everything but the character itself, 1 x attack + 50, once per target, a sector
  // 2 m high, 120 degrees wide and 3 m long, only things with a hurt box, a slash, absolute damage, a light hit.
  f.triggerSectorHitboxAtSpecificLocation(TargetType.AllExceptSelf,f.getEntityLocation(self),f.getEntityRotation(self),1,50,[EntityType.Object,EntityType.Creation],
    TriggerRestriction.TriggerOnlyOncePerEntity,10006060,2,120,3,0,SectorDetectionDirection.FromInsideOut,AttackLayerConfig.OnlyOnHitHurtbox,[] as string[],
    ElementalType.None,0,HitType.Slash,AttackType.MeleeAttack,0,true,10006060,KnockbackDirectionType.LineConnectingAttackerAndHitPoint,false,
    [0,0,0],[0,0,0],1,[0,0,0],[0,0,0],1.5,1,1,HitLevel.LightHit,1000,1000);
  f.notifyServerNodeGraph('swing','','');
})
```
