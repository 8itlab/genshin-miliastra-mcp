# 样例 skills：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

Tries the normal (animated) skills of scene_add_skill in the game: a sword attack on E whose graph runs 250 ms into the swing and which shows a sword in the hand, the raking of the farming sample on Q, a reach of the hand on R. First each is pressed standing still, with screenshots during the animation; then E and Q are pressed while walking, and the position printed four times a second shows whether the skill holds the character in place and for how long. Played on 2026-10-11: all three animations play, the sword shows, every graph reaches the server; standing still, the sword attack carries the character 0.65 m forward and the raking 0.55 m. The walking part of the script taught something else: with the spawn turned 90 degrees the camera turns with it, D no longer walks along x, and the character walked off the edge of the terrain. Prints: SK_READY, SK_GO, SK_CALL <word>, SK_AT x.

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":7,"yawRange":[0,0]}`
3. [UI] `editor_open_map` `{mapPath}`：在编辑器里打开底图的副本（演练时跳过）
4. `scene_build_blocks` `{"name":"Skills_Probe","blocks":[{"template":"石质墙体（灰）","name":"SK_floor","position":[14,-0.4,0],"size":[60,0.4,10]},{"template":"石质墙体（灰）","name":"SK_post","position":[-4,0,3],"size":[0.4,2,0.4]}]}` → `{"name":"Skills_Probe"}`
5. [UI] `scene_import_assets` `{"packs":["Skills_Probe"]}`：把上面的场景包导入并保存（演练时跳过）
6. `scene_list_entities` `{"namePrefix":"SK_"}` → `{"total":0}`
7. `scene_set_spawn` `{"position":[0,0.4,0],"rotation":[0,90,0]}` → `{"pointId":1073741825}`
8. `scene_set_class` `{"allowClimb":false}`
9. `scene_add_graph` `{"name":"SkStage"}` → `{"graphId":1073741825,"name":"_GSTS_SkStage"}`
10. `scene_add_graph` `{"name":"SkHero","attachToPrefab":"character"}` → `{"graphId":1073741826,"name":"_GSTS_SkHero"}`
11. `scene_add_graph` `{"name":"SkSwing","kind":"characterSkill"}` → `{"graphId":1082130433,"name":"_GSTS_SkSwing"}`
12. `scene_add_graph` `{"name":"SkRake","kind":"characterSkill"}` → `{"graphId":1082130434,"name":"_GSTS_SkRake"}`
13. `scene_add_graph` `{"name":"SkReach","kind":"characterSkill"}` → `{"graphId":1082130435,"name":"_GSTS_SkReach"}`
14. `scene_add_skill` `{"name":"SK_swing","type":"normal","animation":1001,"graphAtMs":250,"effect":{"asset":10002152,"attachPoint":"GI_WeaponR","ms":1833.333},"graphId":1082130433}` → `{"graphId":1082130433,"name":"SK_swing","skillId":1098907649}`
15. `scene_add_skill` `{"name":"SK_rake","type":"normal","animation":1006,"animationPortion":0.167,"graphId":1082130434}` → `{"graphId":1082130434,"name":"SK_rake","skillId":1098907650}`
16. `scene_add_skill` `{"name":"SK_reach","type":"normal","animation":1025,"graphId":1082130435}` → `{"graphId":1082130435,"name":"SK_reach","skillId":1098907651}`
17. `scene_list_prefabs` `{}`
18. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, …]}`：把每张图的源码编译并写进存档，返回可以试玩的存档。
19. `scene_list_components` `{"prefab":"player"}`
20. `inspect_map` `{}`
21. [UI] `playtest_start` `{"graphNames":["_GSTS_SkStage","_GSTS_SkHero","_GSTS_SkSwing","_GSTS_SkRake","_GSTS_SkReach"],"durationSeconds":30,"screenshotsAt":[2.5,3.25,3.5,3.8,4.2,4.8,7.25,7.6,8.2,11.25,11.6,12.2,15.3,15.8,21.3],"inputs":[{"at":3,"key":"e"},{"at":7,"key":"q"},{"at":11,"key":"r"},{"at":14,"key":"d","holdMs":4000},{"at":15,"key":"e"},{"at":20,"key":"d","holdMs":4000},{"at":21,"key":"q"},{"at":25,"key":"d","holdMs":3000},{"at":26,"key":"r"}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 5 张，合计 43 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_SkStage（34 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Skills, graph "stage": see examples/skills/gen_skills.py.
g.server({id:1073741825,name:'_GSTS_SkStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'SK_SETUP',false,[2]);
  f.startTimer(evt.eventSourceEntity,'SK_WHERE',true,[0.25]);
  f.printString('SK_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const heroes=f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0]);
  if(evt.timerName==='SK_WHERE'){
    for(const hero of heroes){f.printString('SK_AT');f.printString(f.dataTypeConversion(f.split3dVector(f.getEntityLocationAndRotation(hero).location).xComponent,'str'));}
    return;
  }
  if(evt.timerName!=='SK_SETUP')return;
  for(const hero of heroes){
    f.addCharacterSkill(hero as any,1098907649,CharacterSkillSlot.Skill1E,TopOfStackSkillDestructionType.Destroy);
    f.addCharacterSkill(hero as any,1098907650,CharacterSkillSlot.Skill2Q,TopOfStackSkillDestructionType.Destroy);
    f.addCharacterSkill(hero as any,1098907651,CharacterSkillSlot.Skill3R,TopOfStackSkillDestructionType.Destroy);
  }
  f.printString('SK_GO');
})
```

### _GSTS_SkHero（3 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Skills, graph "hero": see examples/skills/gen_skills.py.
g.server({id:1073741826,name:'_GSTS_SkHero'})
.on('whenSkillNodeIsCalled',(evt,f)=>{
  f.printString('SK_CALL');f.printString(evt.parameter1);
})
```

### _GSTS_SkSwing（2 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Skills, graph "swing": see examples/skills/gen_skills.py.
g.characterSkill({id:1082130433,name:'_GSTS_SkSwing',prefix:false})
.on('start',(evt,f)=>{
  f.notifyServerNodeGraph('swing','','');
})
```

### _GSTS_SkRake（2 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Skills, graph "rake": see examples/skills/gen_skills.py.
g.characterSkill({id:1082130434,name:'_GSTS_SkRake',prefix:false})
.on('start',(evt,f)=>{
  f.notifyServerNodeGraph('rake','','');
})
```

### _GSTS_SkReach（2 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'

// Skills, graph "reach": see examples/skills/gen_skills.py.
g.characterSkill({id:1082130435,name:'_GSTS_SkReach',prefix:false})
.on('start',(evt,f)=>{
  f.notifyServerNodeGraph('reach','','');
})
```
