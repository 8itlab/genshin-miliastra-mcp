# 样例 cards：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

The card selector (卡牌选择器), the platform's own window to choose one of a few cards; seen in play on 2026-10-14. scene_add_card_selector makes the selector CD_pick with a library of four cards (three known, one that hides what it is). The player cannot give up choosing (canGiveUp: false: the window has no 放弃选择). The stage graph opens it for the player at level second 14 with f.invokeDeckSelector: three of the cards are shown, one is to be picked, twenty seconds to do it. The script clicks the label of the second card (拿敏捷) and then 确认选择, and the graph on the player template hears whenDeckSelectorIsComplete and prints the value the graph gave that card: CD_PICKED 20. Left alone, the window closes when the time is up and the graph gets the default (10). Opened at level second 3 the window did not show at all, though the event came twenty seconds later with the default: the level clock runs some seconds before the player sees anything, so a selector is opened some seconds in, or on something the player did.

## 一、工具调用顺序

1. `list_maps` `{}`
2. [UI] `scene_import_assets` `{"packs":[]}`：把上面的场景包导入并保存（演练时跳过）
3. `scene_list_entities` `{"namePrefix":"CD_"}` → `{"total":0}`
4. `scene_add_graph` `{"name":"CdStage"}` → `{"graphId":1073741825,"name":"_GSTS_CdStage"}`
5. `scene_add_graph` `{"name":"CdPlayer","attachToPrefab":"player"}` → `{"graphId":1073741826,"name":"_GSTS_CdPlayer"}`
6. `scene_add_card_selector` `{"name":"CD_pick","title":"选一项升级","seconds":20,"cards":[{"title":"力量","description":"攻击提高十点","label":"拿力量","icon":91001},{"title":"敏捷","description":"跑得更快","label":"拿敏捷","icon":91011},{"title":"体魄","description":"生命上限提高","label":"拿体魄","icon":91016},{"unknown":true,"label":"碰运气"}],"canGiveUp":false}` → `{"name":"CD_pick"}`
7. `scene_list_prefabs` `{}`
8. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, … 共 2 张]}`：对每张图依次编译并写进存档，返回全部写好、可以试玩的存档。
9. `scene_list_components` `{"prefab":"player"}`
10. `inspect_map` `{}`
11. [UI] `playtest_start` `{"graphNames":["_GSTS_CdStage","_GSTS_CdPlayer"],"durationSeconds":24,"screenshotsAt":[6,12,14.5,18],"inputs":[{"at":13,"clickText":"拿敏捷"},{"at":15.5,"clickText":"确认选择"}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 2 张，合计 26 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_CdStage（17 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DecisionRefreshMode } from 'genshin-ts/definitions/enum'

// Cards, graph "stage": see examples/cards/gen_cards.py.
g.server({id:1073741825,name:'_GSTS_CdStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'CD_OPEN',false,[14]);
  f.printString('CD_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='CD_OPEN')return;
  for(const player of f.getListOfPlayerEntitiesOnTheField())f.invokeDeckSelector(player,1073741845n,20,[10n,20n,30n],[1n,2n,3n],1n,1n,DecisionRefreshMode.CannotRefresh,0n,0n,[10n]);
  f.printString('CD_OPENED');
})
```

### _GSTS_CdPlayer（9 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { DecisionRefreshMode } from 'genshin-ts/definitions/enum'

// Cards, graph "player": see examples/cards/gen_cards.py.
g.server({id:1073741826,name:'_GSTS_CdPlayer'})
.on('whenDeckSelectorIsComplete',(evt,f)=>{
  f.printString('CD_DONE count');f.printString(f.dataTypeConversion(f.getListLength(evt.selectionResultList),'str'));
  for(const value of evt.selectionResultList){f.printString('CD_PICKED');f.printString(f.dataTypeConversion(value,'str'));}
})
```
