# 样例 clientlist：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

The other kinds of client control and the templates (scene_add_client_template), in one screen. A dark panel and a yellow star above it are image controls given their picture and colour in scene_add_client_ui: they show without the script touching them. In the middle a grid (网格视窗) of twelve items, each a copy of the template CL_cell (a dark tile with a star the script tints yellow or blue by its index). Above, a row of red discs the script makes at run time from the template CL_dot (game.InstantiateClientUIControl): three at the start, one more for every click on the preset button below (the script clicks it at play seconds 4 and 6) and for the 1 key (at 8): six discs at the end, three CL_MORE prints from the graph. The script reads the index of a template from a reference control that names it (referencedPrefabIndex), so no number is written into the Lua. Left of the grid a reference shows the template CL_cell itself; right of it a key hint shows the key 1.

## 一、工具调用顺序

1. `list_maps` `{}`
2. [UI] `scene_import_assets` `{"packs":[]}`：把上面的场景包导入并保存（演练时跳过）
3. `scene_list_entities` `{"namePrefix":"CL_"}` → `{"total":0}`
4. `scene_add_signal` `{"name":"CL_more"}` → `{"name":"CL_more"}`
5. `scene_add_graph` `{"name":"ClStage"}` → `{"graphId":1073741825,"name":"_GSTS_ClStage"}`
6. `scene_set_client_script` `{"name":"CL_list","source":"<Lua，见第三节>"}` → `{"name":"CL_list"}`
7. `scene_add_client_template` `{"template":{"name":"CL_cell","kind":"container","size":[70,70],"children":[{"name":"tile","kind":"image","image":100001,"colour":"#203050","opacity":0.9,"size":[64,64]},{"name":"icon","kind":"image","image":100138,"size":[40,40]}]}}` → `{"name":"CL_cell"}`
8. `scene_add_client_template` `{"template":{"name":"CL_dot","kind":"image","image":106025,"colour":"#e03030","size":[28,28]}}` → `{"name":"CL_dot"}`
9. `scene_add_client_ui` `{"name":"CL_ui","script":"CL_list","controls":[{"name":"panel","kind":"image","image":100001,"colour":"#000000","opacity":0.55,"position":[0,-20],"size":[560,480]},{"name":"title","kind":"image","image":100138,"colour":"#ffd040","position":[0,170],"size":[48,48]},{"name":"list","kind":"grid","position":[0,-10],"size":[440,260],"itemTemplate":"CL_cell"},{"name":"row","kind":"container","position":[0,300],"size":[420,40]},{"name":"cellRef","kind":"reference","position":[-360,0],"template":"CL_cell"},{"name":"dotRef","kind":"reference","position":[-360,-120],"template":"CL_dot"},{"name":"ok","kind":"presetButton","position":[0,-270]},{"name":"hint","kind":"keyHint","position":[360,0]}]}` → `{"name":"CL_ui"}`
10. `scene_list_prefabs` `{}`
11. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, … 共 1 张]}`：对每张图依次编译并写进存档，返回全部写好、可以试玩的存档。
12. `scene_list_components` `{"prefab":"player"}`
13. `inspect_map` `{}`
14. [UI] `playtest_start` `{"graphNames":["_GSTS_ClStage"],"durationSeconds":12,"screenshotsAt":[2,5,7,10],"inputs":[{"at":4,"click":[0.5,0.8]},{"at":6,"click":[0.5,0.8]},{"at":8,"key":"1"}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 1 张，合计 4 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_ClStage（4 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Client list, graph "stage": see examples/clientlist/gen_clientlist.py.
g.server({id:1073741825,name:'_GSTS_ClStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.printString('CL_READY');
})
.onSignal('CL_more',(evt,f)=>{
  f.printString('CL_MORE');
})
```

## 三、客户端脚本（Lua）

挂在哪棵控件树上见第一节里的 `scene_add_client_ui`。怎么写见 `read_knowledge {id:"client-lua.zh-CN"}`。

### CL_list

```lua
-- 客户端控件的其余几种：模板、网格视窗、模板引用、预设按钮、按键提示，以及不靠脚本就显示的静态图片。
-- panel 和 title 是 scene_add_client_ui 里直接给了图片和颜色的图片控件：脚本一行都没碰它们。
-- list 是网格视窗，列表项是模板 CL_cell 的拷贝；row 里的圆点是脚本用模板 CL_dot 现造的。
-- 按一下 ok（预设按钮）多造一个圆点，并通知节点图（信号 CL_more）。
local root = script.object
local list = root:GetChild("list")
local row = root:GetChild("row")
local ok = root:GetChild("ok")
local hint = root:GetChild("hint")
-- 模板的编号每张地图都不一样：从一个引用了它的“模板引用控件”上读，不写死在脚本里。
local dotIndex = root:GetChild("dotRef").referencedPrefabIndex
local dots = {}

local function addDot()
    local dot = game.InstantiateClientUIControl(dotIndex, row)
    dots[#dots + 1] = dot
    dot:SetActive(true)
    dot:SetVisible(true)
    dot:SetAnchoredPosition(-180 + 40 * (#dots - 1), 0)
    print("CL_LUA dots " .. tostring(#dots))
end

local function onOk()
    if #dots < 10 then addDot() end
    game.ServerSignal("CL_more"):SendSignal()
end

function OnStart()
    root.showCursor = true
    for _, name in ipairs({ "panel", "title", "list", "row", "ok", "hint", "cellRef" }) do
        local control = root:GetChild(name)
        control:SetActive(true)
        control:SetVisible(true)
    end
    root:GetChild("dotRef"):SetVisible(false) -- 只用来带编号，不给人看
    hint.keyboardKeyCode = Enum.KeyboardKeyCode.CraftspersonKey1
    -- 网格视窗：给个数和一个回调，每个列表项出现时回调一次（control 是模板的一份拷贝，index 是第几项）。
    list:RefreshItems(12, function(control, index)
        local icon = control:GetChild("icon")
        if icon ~= nil then
            icon.imageColor = (index % 2 == 0) and Color(255, 208, 64) or Color(120, 200, 255)
        end
    end)
    print("CL_LUA items " .. tostring(list.itemCount) .. " template " .. tostring(list.itemPrefabIndex == root:GetChild("cellRef").referencedPrefabIndex))
    ok:AddCursorEventListener(Enum.CursorEventType.CursorClick, onOk)
    root:AddKeyEventListener(Enum.KeyEventType.KeyboardCraftspersonKey1Down, function() onOk() return true end)
    for _ = 1, 3 do addDot() end
    print("CL_LUA started")
end
```
