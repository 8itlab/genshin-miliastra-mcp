# 样例 clientmenu：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

A menu that uses the rest of what a client interface can be given, seen in play on 2026-10-13. Three scripts: CM_menu on the root with two script variables (title, a string, and rows, an integer: it prints "title Shop rows 2" from script:GetParam); CM_cell on the template CM_cell, which starts once on every item the grid makes (eight prints of CM_LUA cell); CM_spin on the child control spin, which turns that control a quarter turn a second (script.object is the control the script is on; it has to call script:EnableUpdate(true) for OnUpdate to run). The grid has four columns of 90 x 90 items; spin is drawn turned by 20 degrees and 1.4 times its size; the key hint shows the key 8; the effect 火能量满值1 plays where the control fx stands, from the start. The button is a preset button whose looks are two images it holds: blue while idle and under the cursor, yellow while pressed (states normal, hover, pressed). With no hover state given the button showed nothing from the moment the cursor was on it. The script clicks it at play seconds 4 and 7: two CM_BUY prints from the graph, and the green disc that started inactive is there from the first click on (SetActive(true)). The cursor is there without the script asking (showCursor on the interface) and the interface keeps key presses from the level under it (blockKeys). The title is a text box with its text set here: it shows on an account of 奇匠 level 2 and up.

## 一、工具调用顺序

1. `list_maps` `{}`
2. [UI] `scene_import_assets` `{"packs":[]}`：把上面的场景包导入并保存（演练时跳过）
3. `scene_list_entities` `{"namePrefix":"CM_"}` → `{"total":0}`
4. `scene_add_signal` `{"name":"CM_buy"}` → `{"name":"CM_buy"}`
5. `scene_add_graph` `{"name":"CmStage"}` → `{"graphId":1073741825,"name":"_GSTS_CmStage"}`
6. `scene_set_client_script` `{"name":"CM_menu","source":"<Lua，见第三节>"}` → `{"name":"CM_menu"}`
7. `scene_set_client_script` `{"name":"CM_cell","source":"<Lua，见第三节>"}` → `{"name":"CM_cell"}`
8. `scene_set_client_script` `{"name":"CM_spin","source":"<Lua，见第三节>"}` → `{"name":"CM_spin"}`
9. `scene_add_client_template` `{"template":{"name":"CM_cell","kind":"container","size":[90,90],"script":"CM_cell","children":[{"name":"tile","kind":"image","image":100001,"colour":"#203050","opacity":0.9,"size":[84,84]},{"name":"icon","kind":"image","image":100138,"size":[52,52]}]}}` → `{"name":"CM_cell"}`
10. `scene_add_client_ui` `{"name":"CM_ui","script":"CM_menu","showCursor":true,"blockKeys":true,"controls":[{"name":"panel","kind":"image","image":100001,"colour":"#000000","opacity":0.55,"position":[0,-20],"size":[640,520]},{"name":"title","kind":"text","position":[0,200],"size":[400,60],"text":{"content":"Shop","fontSize":40,"colour":"#ffd040"}},{"name":"list","kind":"grid","position":[0,0],"size":[420,220],"itemTemplate":"CM_cell","grid":{"columns":4,"itemSize":[90,90],"spacing":[10,10],"padding":[10,10,10,10],"scrollbar":false}},{"name":"buy","kind":"presetButton","position":[0,-270],"size":[180,64],"states":{"normal":"up","hover":"up","pressed":"down"},"children":[{"name":"up","kind":"image","image":100001,"colour":"#40a0ff","size":[180,64]},{"name":"down","kind":"image","image":100001,"colour":"#ffd040","size":[180,64]}]},{"name":"spin","kind":"container","position":[-420,0],"rotation":20,"scale":[1.4,1.4],"script":"CM_spin","children":[{"name":"star","kind":"image","image":100138,"colour":"#ff6060"}]},{"name":"sleeper","kind":"image","image":106025,"colour":"#40c060","position":[420,160],"size":[60,60],"active":false},{"name":"key","kind":"keyHint","position":[420,0],"key":8},{"name":"fx","kind":"animation","position":[420,-160],"effect":10001002}]}` → `{"name":"CM_ui"}`
11. `scene_list_prefabs` `{}`
12. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, … 共 1 张]}`：对每张图依次编译并写进存档，返回全部写好、可以试玩的存档。
13. `scene_list_components` `{"prefab":"player"}`
14. `inspect_map` `{}`
15. [UI] `playtest_start` `{"graphNames":["_GSTS_CmStage"],"durationSeconds":12,"screenshotsAt":[2,4.3,6,9],"inputs":[{"at":4,"click":[0.5,0.8],"holdMs":600},{"at":7,"click":[0.5,0.8]}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 1 张，合计 4 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_CmStage（4 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Client menu, graph "stage": see examples/clientmenu/gen_clientmenu.py.
g.server({id:1073741825,name:'_GSTS_CmStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.printString('CM_READY');
})
.onSignal('CM_buy',(evt,f)=>{
  f.printString('CM_BUY');
})
```

## 三、客户端脚本（Lua）

挂在哪棵控件树上见第一节里的 `scene_add_client_ui`。怎么写见 `read_knowledge {id:"client-lua.zh-CN"}`。

### CM_menu

```lua
-- 一个“商店”样子的界面：读脚本变量、填网格、按钮有按下的样子、点了通知节点图。
-- 鼠标是界面自己开的（scene_add_client_ui 的 showCursor），脚本里不用再设。
local root = script.object
local list = root:GetChild("list")
local buy = root:GetChild("buy")
local sleeper = root:GetChild("sleeper")
local fx = root:GetChild("fx")
local bought = 0

function OnStart()
    -- 脚本变量：在 scene_set_client_script 的 variables 里定，这里按名字读。
    print("CM_LUA title " .. tostring(script:GetParam("title")) .. " rows " .. tostring(script:GetParam("rows")))
    list:RefreshItems(8, function(control, index)
        local icon = control:GetChild("icon")
        if icon ~= nil then
            icon.imageColor = (index % 2 == 0) and Color(255, 208, 64) or Color(120, 200, 255)
        end
    end)
    buy:AddCursorEventListener(Enum.CursorEventType.CursorClick, function()
        bought = bought + 1
        game.ServerSignal("CM_buy"):SendSignal()
        sleeper:SetActive(true) -- 一开始不激活的控件，第一次买了才出现
        fx:PlayAnimation()
        print("CM_LUA bought " .. tostring(bought) .. " sleeper " .. tostring(sleeper.active))
    end)
    print("CM_LUA started sleeper " .. tostring(sleeper.active))
end
```

### CM_cell

```lua
-- 挂在模板 CM_cell 上：网格每造出一个列表项，这个脚本就在那一项上启动一次。
function OnStart()
    print("CM_LUA cell " .. tostring(script.object.name))
end
```

### CM_spin

```lua
-- 挂在子控件 spin 上：script.object 就是 spin。
-- OnUpdate 默认不跑（上机验过：不调 EnableUpdate(true) 一帧都不会进来），要逐帧动就得先打开。
local frames = 0
function OnStart()
    script:EnableUpdate(true)
    print("CM_LUA spin started on " .. tostring(script.object.name))
end
function OnUpdate(dt)
    frames = frames + 1
    script.object.localRotationZ = script.object.localRotationZ + 90 * dt
    if frames == 60 then
        print("CM_LUA spin turning")
    end
end
```
