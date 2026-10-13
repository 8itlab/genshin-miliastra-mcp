# 样例 shoot：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

A ranged attack: a bolt prefab with projectile motion, hit detection (hurt boxes only) and an ability unit (scene_add_components {projectile, hitDetection, abilityUnits}), launched by the character's graph with f.createProjectile when E is pressed. A crate with 50 health and a hurt box stands seven metres ahead. Three shots: the first takes 30.65 off the crate (the unit's 1 x attack + 60, less the crate's defence), the second breaks it, the third meets nothing and is removed after three seconds. Played as written on its third run, 2026-10-11 (first the bolt was removed on touching the crate's own collision, then in the very moment it hit, before its attack counted). Prints: SH_READY, SH_FIRE, SH_TOUCH, SH_HURT damage, SH_DEAD.

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":10,"yawRange":[0,0]}`
3. [UI] `editor_open_map` `{mapPath}`：在编辑器里打开底图的副本（演练时跳过）
4. `scene_build_blocks` `{"name":"Shoot_Probe","blocks":[{"template":"石质墙体（灰）","name":"SH_post_a","position":[-5,0,9],"size":[0.4,2,0.4]},{"template":"石质墙体（灰）","name":"SH_post_b","position":[5,0,9],"size":[0.4,2,0.4]}]}` → `{"name":"Shoot_Probe"}`
5. [UI] `scene_import_assets` `{"packs":["Shoot_Probe"]}`：把上面的场景包导入并保存（演练时跳过）
6. `scene_list_entities` `{"namePrefix":"SH_"}` → `{"total":0}`
7. `scene_add_prefab` `{"asset":10005009,"name":"SH_bolt","scale":0.6}` → `{"name":"SH_bolt","prefabId":1077936129}`
8. `scene_add_prefab` `{"asset":10005008,"name":"SH_crate","scale":1.5,"health":50}` → `{"name":"SH_crate","prefabId":1077936130}`
9. `scene_set_spawn` `{"position":[0,0.4,0],"rotation":[0,0,0]}` → `{"pointId":1073741825}`
10. `scene_add_graph` `{"name":"ShtStage"}` → `{"graphId":1073741825,"name":"_GSTS_ShtStage"}`
11. `scene_add_graph` `{"name":"ShtHero","attachToPrefab":"character"}` → `{"graphId":1073741826,"name":"_GSTS_ShtHero"}`
12. `scene_add_graph` `{"name":"ShtBolt","attachToPrefab":"SH_bolt"}` → `{"graphId":1073741827,"name":"_GSTS_ShtBolt"}`
13. `scene_add_graph` `{"name":"ShtCrate","attachToPrefab":"SH_crate"}` → `{"graphId":1073741828,"name":"_GSTS_ShtCrate"}`
14. `scene_add_graph` `{"name":"ShtFire","kind":"characterSkill"}` → `{"graphId":1082130433,"name":"_GSTS_ShtFire"}`
15. `scene_add_skill` `{"name":"SH_fire","graphId":1082130433}` → `{"graphId":1082130433,"name":"SH_fire","skillId":1098907649}`
16. `scene_add_components` `{"prefab":"SH_bolt","solid":false,"projectile":{"type":"straight","velocity":[0,0,12]},"hitDetection":{"areas":[{"radius":0.5}],"trigger":"oncePerEntity","delaySeconds":0.15,"abilityUnit":"SH_strike","layers":["hurtBox"]},"abilityUnits":[{"name":"SH_strike","attack":{"coefficient":1,"added":60}}]}`
17. `scene_add_components` `{"prefab":"SH_crate","hurtBox":{"areas":[{"size":[1.6,1.2,1.4],"offset":[0,0.6,0]}]}}`
18. `scene_list_prefabs` `{}`
19. 每张节点图各做一遍这五步（上一张 `apply_build` 返回的存档给下一张的 `create_project`）：
   - `create_project` `{"projectId":"stage","targetGraphId":"<scene_add_graph 返回的 graphId>"}`
   - `update_logic` `{projectId, code: <源码，见第二节>}`
   - `build_project` `{projectId}`：返回 buildId 和节点数、编辑器计数
   - `preview_changes` `{projectId, buildId, destination:"copy"}`：返回 expectedSha256
   - `apply_build` `{projectId, buildId, destination:"copy", expectedSha256}`：返回可以试玩的存档
   源码都写好以后，这五步可以换成一次 `write_graphs` `{mapPath, graphs:[{graphId, code}, ...]}`：它对每张图依次做同样的事，返回全部写好的存档。
20. `scene_list_components` `{"prefab":"SH_bolt"}`
21. `inspect_map` `{}`
22. [UI] `playtest_start` `{"graphNames":["_GSTS_ShtStage","_GSTS_ShtHero","_GSTS_ShtBolt","_GSTS_ShtCrate","_GSTS_ShtFire"],"durationSeconds":14,"screenshotsAt":[2.5,4.2,4.4,4.6,5,6.2,6.4,6.6,8.3,10,12],"inputs":[{"at":4,"key":"e"},{"at":6,"key":"e"},{"at":8,"key":"e"}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 5 张，合计 50 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_ShtStage（23 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Shoot, graph "stage": see examples/shoot/gen_shoot.py.
g.server({id:1073741825,name:'_GSTS_ShtStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  const stage=evt.eventSourceEntity;
  f.createPrefab(1077936130,[1.5,0,7],[0,0,0],stage,false,1,[] as bigint[]);
  f.startTimer(stage,'SH_GIVE',false,[2]);
  f.printString('SH_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0]))f.addCharacterSkill(hero as any,1098907649,CharacterSkillSlot.Skill1E,TopOfStackSkillDestructionType.Destroy);
})
.on('whenEntityIsDestroyed',(evt,f)=>{
  f.printString('SH_DEAD');
})
```

### _GSTS_ShtHero（12 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Shoot, graph "hero": see examples/shoot/gen_shoot.py.
g.server({id:1073741826,name:'_GSTS_ShtHero'})
.on('whenSkillNodeIsCalled',(evt,f)=>{
  // The bolt starts a metre above the ground, a metre and a half to the character's right (so that the camera behind
  // the character sees it), and flies the way the character faces.
  const hero=evt.callerEntity,where=f.getEntityLocationAndRotation(hero),at=f.split3dVector(where.location);
  f.createProjectile(1077936129,f.create3dVector(at.xComponent+1.5,at.yComponent+1,at.zComponent),where.rotate,hero,hero,false,1n,[] as bigint[]);
  f.printString('SH_FIRE');
})
```

### _GSTS_ShtBolt（9 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Shoot, graph "bolt": see examples/shoot/gen_shoot.py.
g.server({id:1073741827,name:'_GSTS_ShtBolt'})
.on('whenEntityIsCreated',(evt,f)=>{
  // A bolt that meets nothing is taken away after three seconds.
  f.startTimer(evt.eventSourceEntity,'SH_GONE',false,[3]);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  f.removeEntity(evt.eventSourceEntity);
})
.on('whenOnHitDetectionIsTriggered',(evt,f)=>{
  // Its hit detection only notices hurt boxes, and launches the ability unit at what it touched. The bolt has to
  // outlive that attack: removed in this same moment, it did no damage. So it goes a third of a second later.
  f.printString('SH_TOUCH');
  f.startTimer(evt.eventSourceEntity,'SH_DONE',false,[0.3]);
})
```

### _GSTS_ShtCrate（4 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Shoot, graph "crate": see examples/shoot/gen_shoot.py.
g.server({id:1073741828,name:'_GSTS_ShtCrate'})
.on('whenAttacked',(evt,f)=>{
  f.printString('SH_HURT');f.printString(f.dataTypeConversion(evt.damage,'str'));
})
```

### _GSTS_ShtFire（2 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Shoot, graph "fire": see examples/shoot/gen_shoot.py.
g.characterSkill({id:1082130433,name:'_GSTS_ShtFire',prefix:false})
.on('start',(evt,f)=>{
  f.notifyServerNodeGraph('fire','','');
})
```
