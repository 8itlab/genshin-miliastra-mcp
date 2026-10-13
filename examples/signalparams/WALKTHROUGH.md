# 样例 signalparams：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

Signals that carry several values of several types, on the three ways a signal travels; seen in play on 2026-10-13 (passed at the first run). scene_add_signal defines three with parameters: [{name, type}]. Graph to graph: the stage graph sends SP_note (an integer, an entity) and hears it itself; the log shows SP_NOTE n and 7. Client script to graph: six seconds in, sp_main.lua sends SP_report with AddInt(42), AddFloat(0.5), AddString("hello"), AddVector3({x=1,y=2.5,z=-3}), AddBool(true), AddIntList({3,4,5}); the graph prints 42, 0.5, hello, {1.0,2.5,-3.0}, True and the length of the list, 3. Graph to client script: the graph answers with client:SP_reply (the player first, then an integer, a vector, a boolean, a list of strings, an entity) and the script prints what arrived: five values, 42 as a Lua integer, the vector as a table with x, y and z, true, a table of two strings, and the entity as a number. In a graph a signal with parameters is declared once with defineSignal and that declaration is given to f.sendSignal and .onSignal; the values are evt.params.<name>.

## 一、工具调用顺序

1. `list_maps` `{}`
2. [UI] `scene_import_assets` `{"packs":[]}`：把上面的场景包导入并保存（演练时跳过）
3. `scene_list_entities` `{"namePrefix":"SP_"}` → `{"total":0}`
4. `scene_add_signal` `{"name":"SP_note","parameters":[{"name":"n","type":"integer"},{"name":"who","type":"entity"}]}` → `{"name":"SP_note"}`
5. `scene_add_signal` `{"name":"SP_report","parameters":[{"name":"points","type":"integer"},{"name":"ratio","type":"float"},{"name":"label","type":"string"},{"name":"at","type":"vector3"},{"name":"ok","type":"boolean"},{"name":"picks","type":"integerList"}]}` → `{"name":"SP_report"}`
6. `scene_add_signal` `{"name":"SP_reply","parameters":[{"name":"points","type":"integer"},{"name":"at","type":"vector3"},{"name":"ok","type":"boolean"},{"name":"names","type":"stringList"},{"name":"who","type":"entity"}]}` → `{"name":"SP_reply"}`
7. `scene_add_graph` `{"name":"SpStage"}` → `{"graphId":1073741825,"name":"_GSTS_SpStage"}`
8. `scene_set_client_script` `{"name":"SP_main","source":"<Lua，见第三节>"}` → `{"name":"SP_main"}`
9. `scene_add_client_ui` `{"name":"SP_ui","script":"SP_main","controls":[{"name":"lamp","kind":"image","image":106025,"position":[0,300],"size":[90,90]}]}` → `{"name":"SP_ui"}`
10. `scene_list_prefabs` `{}`
11. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, … 共 1 张]}`：对每张图依次编译并写进存档，返回全部写好、可以试玩的存档。
12. `scene_list_components` `{"prefab":"player"}`
13. `inspect_map` `{}`
14. [UI] `playtest_start` `{"graphNames":["_GSTS_SpStage"],"durationSeconds":14,"screenshotsAt":[2,12],"inputs":[]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 1 张，合计 37 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_SpStage（37 个节点）

```ts
/// <reference types="genshin-ts" />
import { g, defineSignal } from 'genshin-ts/runtime/core'

// Signal parameters, graph "stage": see examples/signalparams/gen_signalparams.py.
const NOTE=defineSignal('SP_note',[['n','int'],['who','entity']] as const)
const REPORT=defineSignal('SP_report',[['points','int'],['ratio','float'],['label','str'],['at','vec3'],['ok','bool'],['picks','int_list']] as const)
const REPLY=defineSignal('client:SP_reply',[['player','entity'],['points','int'],['at','vec3'],['ok','bool'],['names','str_list'],['who','entity']] as const)
g.server({id:1073741825,name:'_GSTS_SpStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'SP_T',false,[3]);
  f.printString('SP_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName==='SP_T'){
    f.sendSignal(NOTE,7n,evt.eventSourceEntity);
    f.printString('SP_SENT note');
  }
})
.onSignal(NOTE,(evt,f)=>{
  f.printString('SP_NOTE n');f.printString(f.dataTypeConversion(evt.params.n,'str'));
})
.onSignal(REPORT,(evt,f)=>{
  f.printString('SP_REPORT points');f.printString(f.dataTypeConversion(evt.params.points,'str'));
  f.printString('SP_REPORT ratio');f.printString(f.dataTypeConversion(evt.params.ratio,'str'));
  f.printString('SP_REPORT label');f.printString(evt.params.label);
  f.printString('SP_REPORT at');f.printString(f.dataTypeConversion(evt.params.at,'str'));
  f.printString('SP_REPORT ok');f.printString(f.dataTypeConversion(evt.params.ok,'str'));
  f.printString('SP_REPORT picks');f.printString(f.dataTypeConversion(f.getListLength(evt.params.picks),'str'));
  for(const player of f.getListOfPlayerEntitiesOnTheField())f.sendSignal(REPLY,player,evt.params.points,evt.params.at,true,f.assemblyList(['red','blue']),player);
  f.printString('SP_SENT reply');
})
```

## 三、客户端脚本（Lua）

挂在哪棵控件树上见第一节里的 `scene_add_client_ui`。怎么写见 `read_knowledge {id:"client-lua.zh-CN"}`。

### SP_main

```lua
-- 带好几个参数的信号：脚本开局两秒后给节点图发 SP_report（整数、浮点数、字符串、三维向量、布尔值、整数列表），
-- 节点图收到后回 SP_reply（整数、三维向量、布尔值、字符串列表、实体），脚本把收到的每个值打印出来。
local lamp
local waited = 0
local sent = false

function OnStart()
    lamp = script.object:GetChild("lamp")
    lamp.imageColor = Color(128, 128, 128)
    script:RegisterServerSignalHandler("SP_reply", function(name, params)
        print("SP_LUA reply count " .. #params)
        print("SP_LUA reply points " .. tostring(params[1]) .. " " .. math.type(params[1]))
        print("SP_LUA reply at " .. type(params[2]) .. " " .. tostring(params[2].x) .. "," .. tostring(params[2].y) .. "," .. tostring(params[2].z))
        print("SP_LUA reply ok " .. tostring(params[3]))
        print("SP_LUA reply names " .. type(params[4]) .. " " .. #params[4] .. " " .. tostring(params[4][1]) .. " " .. tostring(params[4][2]))
        print("SP_LUA reply who " .. type(params[5]))
        lamp.imageColor = Color(60, 220, 80)
    end)
    script:EnableUpdate(true)
    print("SP_LUA listening")
end

function OnUpdate(dt)
    if sent then return end
    waited = waited + dt
    if waited < 6 then return end
    sent = true
    local s = game.ServerSignal("SP_report")
    s:AddInt(42)
    s:AddFloat(0.5)
    s:AddString("hello")
    s:AddVector3({x = 1, y = 2.5, z = -3})
    s:AddBool(true)
    s:AddIntList({3, 4, 5})
    s:SendSignal()
    lamp.imageColor = Color(255, 216, 60)
    print("SP_LUA sent report")
end
```
