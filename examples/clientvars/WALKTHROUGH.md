# 样例 clientvars：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

The variables of a client script, of every type the editor offers, and the values a control gives them; seen in play on 2026-10-13. One script, CV_probe, with twenty-one variables (an integer, a float, a boolean, a string, a vector3, a list of each, the ids guid, configId, prefabId and controlId and lists of them, an entity, a list of entities, and one that is not public), stands on the root and on the control a. Each prints what script:GetParam gives it. On the root it prints the script's own values: whole = number:42, speed = number:1.5, on = boolean:true, label = string:abc, at = (1.0,2.0,3.0), nums = {number:7,number:9}, flags = {boolean:true,boolean:false}, spots = {(4.0,5.0,6.0)}, guid 123, config 456, prefab 789, target = number:0, who = number:0. On a it prints the values a gives (script: {name, values}): 99, 2.25, false, hi, (7.0,2.0,3.0), {7,8}, {3.5}, {false}, {y,z}, {(9.0,5.0,6.0)}, 124, 457, 790, {55}, {66}, {77}; hidden, which is not public, is 5 in both. A vector3 is a table with the keys x, y and z; a list is a table counted from 1. target is given as the name of the control b: the script reads a run-time id (3, not the number in the save), and game.GetClientUIControl(id) is the control (it prints 'target is b'; others, a list of two controls, gives b and a; the control's own id is script.object.id). The example also writes what this machine cannot show: b has another place and size on a phone and another place on a console (devices), a and b say where the stick of a gamepad goes (navigation), and log is a text window without its scroll bar; these are byte for byte what the editor writes when configured by hand, and were played only on a computer.

## 一、工具调用顺序

1. `list_maps` `{}`
2. [UI] `scene_import_assets` `{"packs":[]}`：把上面的场景包导入并保存（演练时跳过）
3. `scene_list_entities` `{"namePrefix":"CV_"}` → `{"total":0}`
4. `scene_add_graph` `{"name":"CvStage"}` → `{"graphId":1073741825,"name":"_GSTS_CvStage"}`
5. `scene_set_client_script` `{"name":"CV_probe","source":"<Lua，见第三节>"}` → `{"name":"CV_probe"}`
6. `scene_add_client_ui` `{"name":"CV_ui","script":"CV_probe","controls":[{"name":"a","kind":"image","image":100138,"colour":"#ffd040","position":[-200,0],"size":[90,90],"navigation":{"right":"b"},"script":{"name":"CV_probe","values":{"whole":99,"speed":2.25,"on":false,"label":"hi","at":[7,2,3],"nums":[7,8],"rates":[3.5],"flags":[false],"names":["y","z"],"spots":[[9,5,6]],"target":"b","others":["b","a"],"guid":124,"config":457,"prefab":790,"guids":[55],"configs":[66],"prefabs":[77]}}},{"name":"b","kind":"image","image":100138,"colour":"#40a0ff","position":[200,0],"size":[90,90],"navigation":{"left":"a","right":"none"},"devices":{"mobile":{"position":[150,0],"size":[70,70]},"console":{"position":[260,0]}}},{"name":"log","kind":"textWindow","position":[0,-250],"size":[400,120],"text":{"content":"client variables","align":"right","scrollbar":false}}]}` → `{"name":"CV_ui"}`
7. `scene_list_prefabs` `{}`
8. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, … 共 1 张]}`：对每张图依次编译并写进存档，返回全部写好、可以试玩的存档。
9. `scene_list_components` `{"prefab":"player"}`
10. `inspect_map` `{}`
11. [UI] `playtest_start` `{"graphNames":["_GSTS_CvStage"],"durationSeconds":8,"screenshotsAt":[4],"inputs":[]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 1 张，合计 2 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_CvStage（2 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Client variables, graph "stage": see examples/clientvars/gen_clientvars.py.
g.server({id:1073741825,name:'_GSTS_CvStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.printString('CV_READY');
})
```

## 三、客户端脚本（Lua）

挂在哪棵控件树上见第一节里的 `scene_add_client_ui`。怎么写见 `read_knowledge {id:"client-lua.zh-CN"}`。

### CV_probe

```lua
-- 把脚本变量逐个读出来打印：挂在根上读到的是脚本自己的默认值，挂在控件上读到的是那个控件给的值。
local NAMES = {"whole", "speed", "on", "label", "at", "nums", "rates", "flags", "names", "spots",
    "target", "others", "guid", "config", "prefab", "guids", "configs", "prefabs", "who", "team", "hidden"}

local function show(v)
    local t = type(v)
    if t ~= "table" then
        return t .. ":" .. tostring(v)
    end
    -- 三维向量是以 x、y、z 为键的表，列表是从 1 数起的表。
    if v.x ~= nil then
        return "(" .. tostring(v.x) .. "," .. tostring(v.y) .. "," .. tostring(v.z) .. ")"
    end
    local parts = {}
    for _, x in ipairs(v) do
        parts[#parts + 1] = show(x)
    end
    return "{" .. table.concat(parts, ",") .. "}"
end

function OnStart()
    local who = script.object.name
    for _, name in ipairs(NAMES) do
        local ok, v = pcall(function()
            return script:GetParam(name)
        end)
        print("CV_LUA " .. who .. " " .. name .. " = " .. (ok and show(v) or ("ERR " .. tostring(v))))
    end
    -- 控件 ID 类型的变量读到的是运行时编号，用 game.GetClientUIControl 换成控件。
    local id = script:GetParam("target")
    local control = id ~= 0 and game.GetClientUIControl(id) or nil
    print("CV_LUA " .. who .. " target is " .. (control and control.name or "nothing") .. ", own id " .. tostring(script.object.id))
    for _, other in ipairs(script:GetParam("others")) do
        local c = game.GetClientUIControl(other)
        print("CV_LUA " .. who .. " others has " .. (c and c.name or "nothing"))
    end
end
```
