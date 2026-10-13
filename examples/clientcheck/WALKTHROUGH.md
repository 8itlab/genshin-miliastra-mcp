# 样例 clientcheck：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

What a faulty Lua client script leaves behind, and four things that were not known. Seen in play on 2026-10-13: (1) A fault while the script runs comes into the log as a print with the place and a traceback: the click at play second 3 runs a handler that indexes nil, and the log has "CC_main:13: attempt to index a nil value (local 'nothing')" with "stack traceback: CC_main: 13: in function <CC_main:10>"; the 2 key at second 6 gives the same for line 24. What the handler printed before the fault is there, what came after is not. printerr lines are in the log like prints. (2) A script that does not compile never reaches the play: with cc_syntax_error.lua added as a third script (it is left out of this test), playtest_start fails at once with 试玩校验失败：脚本编译报错：CC_bad.lua:2: ')' expected. (3) OnUpdate is not called unless the script asked for it with script:EnableUpdate(true): this one never asks, and neither its fault at frame 120 nor its print at frame 240 shows. (4) A signal carries a parameter: the 1 key at second 5 makes the Lua send CC_say with AddString("hello"), and the graph prints CC_SAY hello. (5) A container that starts hidden is switched on by the graph at level second 16 (f.modifyUiControlStatusWithinTheInterfaceLayout with the id scene_add_client_ui returned): the red star appears and its script starts only then (CC_LUA late started). (6) A teleport inside the level (the playtest input at second 8) leaves the client controls as they are: the green disc stays and the script does not start again.

## 一、工具调用顺序

1. `list_maps` `{}`
2. [UI] `scene_import_assets` `{"packs":[]}`：把上面的场景包导入并保存（演练时跳过）
3. `scene_list_entities` `{"namePrefix":"CC_"}` → `{"total":0}`
4. `scene_add_signal` `{"name":"CC_say","parameter":"word"}` → `{"name":"CC_say"}`
5. `scene_add_graph` `{"name":"CcStage"}` → `{"graphId":1073741825,"name":"_GSTS_CcStage"}`
6. `scene_set_client_script` `{"name":"CC_main","source":"<Lua，见第三节>"}` → `{"name":"CC_main"}`
7. `scene_set_client_script` `{"name":"CC_late","source":"<Lua，见第三节>"}` → `{"name":"CC_late"}`
8. `scene_add_client_ui` `{"name":"CC_ui","script":"CC_main","controls":[{"name":"mark","kind":"image","image":106025,"colour":"#40c060","position":[-300,300],"size":[60,60]},{"name":"hit","kind":"cursorArea","position":[0,0],"size":[200,200]},{"name":"words","kind":"textWindow","position":[300,300]},{"name":"fx","kind":"animation","position":[300,0]}]}` → `{"name":"CC_ui"}`
9. `scene_add_client_ui` `{"name":"CC_late","script":"CC_late","hidden":true,"controls":[{"name":"late","kind":"image","image":100138,"colour":"#ff4040","position":[0,300],"size":[80,80]}]}` → `{"name":"CC_late"}`
10. `scene_list_prefabs` `{}`
11. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, … 共 1 张]}`：对每张图依次编译并写进存档，返回全部写好、可以试玩的存档。
12. `scene_list_components` `{"prefab":"player"}`
13. `inspect_map` `{}`
14. [UI] `playtest_start` `{"graphNames":["_GSTS_CcStage"],"durationSeconds":16,"screenshotsAt":[2,7,10,14],"inputs":[{"at":3,"click":[0.5,0.5]},{"at":5,"key":"1"},{"at":6,"key":"2"},{"at":8,"teleport":[3,1,3]}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 1 张，合计 17 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_CcStage（17 个节点）

```ts
/// <reference types="genshin-ts" />
import { g, defineSignal } from 'genshin-ts/runtime/core'
import { UIControlGroupStatus } from 'genshin-ts/definitions/enum'

// The signal CC_say carries one string.
const say=defineSignal('CC_say',[['word','str']] as const)

// Client check, graph "stage": see examples/clientcheck/gen_clientcheck.py.
g.server({id:1073741825,name:'_GSTS_CcStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'CC_SHOW',false,[16]);
  f.printString('CC_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='CC_SHOW')return;
  f.printString('CC_SHOW');
  for(const player of f.getListOfPlayerEntitiesOnTheField())f.modifyUiControlStatusWithinTheInterfaceLayout(player,1073741851n,UIControlGroupStatus.On);
})
.onSignal(say,(evt,f)=>{
  f.printString('CC_SAY');f.printString(evt.params.word);
})
```

## 三、客户端脚本（Lua）

挂在哪棵控件树上见第一节里的 `scene_add_client_ui`。怎么写见 `read_knowledge {id:"client-lua.zh-CN"}`。

### CC_main

```lua
-- 验证用：故意出几种错，看试玩日志里能看到什么；发一个带参数的信号；被传送后会不会重新启动。
local root = script.object
local hit = root:GetChild("hit")
local frames = 0

function OnStart()
    root.showCursor = true
    print("CC_LUA main started")
    printerr("CC_LUA printerr line")
    hit:AddCursorEventListener(Enum.CursorEventType.CursorClick, function()
        print("CC_LUA click before fault")
        local nothing = nil
        nothing.field = 1 -- 回调里的运行时错误
        print("CC_LUA click after fault")
    end)
    root:AddKeyEventListener(Enum.KeyEventType.KeyboardCraftspersonKey1Down, function()
        local signal = game.ServerSignal("CC_say")
        signal:AddString("hello")
        signal:SendSignal()
        print("CC_LUA sent")
        return true
    end)
    root:AddKeyEventListener(Enum.KeyEventType.KeyboardCraftspersonKey2Down, function()
        root:GetChild("no such control"):SetVisible(true) -- 找不到控件：对 nil 调方法
        return true
    end)
end

function OnUpdate(dt)
    frames = frames + 1
    if frames == 120 then
        error("CC_LUA fault in update")
    end
    if frames == 240 then
        print("CC_LUA still updating after the fault")
    end
end
```

### CC_late

```lua
-- 挂在一开始隐藏的容器上：节点图把容器打开时才启动。
function OnStart()
    print("CC_LUA late started")
end
```
