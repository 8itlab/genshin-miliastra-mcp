# 样例 clientsignal：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

A node graph sends a signal to the client scripts (Lua) of a player: the server node 发送客户端脚本信号 of game 7.1; seen in play on 2026-10-13. Two signals are defined with scene_add_signal, CS_ping and CS_tell (which carries one string, word). The graph writes f.sendSignal('client:CS_ping', player) at level second 9 and f.sendSignal('client:CS_tell', player, 'hello') at second 13: the prefix client: says the signal goes to the scripts of that player, and the player is the argument after the name. The script registers script:RegisterServerSignalHandler(name, function(name, params) ... end) for both in OnStart and prints what arrives: 'CS_LUA got CS_ping with 0 params' in the same second as the graph's CS_SENT ping, 'CS_LUA got CS_tell word hello' with CS_SENT tell. The lamp on the screen is grey at the start, green after the first signal and yellow after the second. The compiler has no such node: the server replaces the send node by it when it writes the graph into the save, and scene_add_signal writes the definition the node needs (a fourth one beside send, listen and send-to-server, byte for byte the one the 7.1 editor adds to a signal).

## 一、工具调用顺序

1. `list_maps` `{}`
2. [UI] `scene_import_assets` `{"packs":[]}`：把上面的场景包导入并保存（演练时跳过）
3. `scene_list_entities` `{"namePrefix":"CS_"}` → `{"total":0}`
4. `scene_add_signal` `{"name":"CS_ping"}` → `{"name":"CS_ping"}`
5. `scene_add_signal` `{"name":"CS_tell","parameter":"word"}` → `{"name":"CS_tell"}`
6. `scene_add_graph` `{"name":"CsStage"}` → `{"graphId":1073741825,"name":"_GSTS_CsStage"}`
7. `scene_set_client_script` `{"name":"CS_main","source":"<Lua，见第三节>"}` → `{"name":"CS_main"}`
8. `scene_add_client_ui` `{"name":"CS_ui","script":"CS_main","controls":[{"name":"lamp","kind":"image","image":106025,"position":[0,300],"size":[90,90]}]}` → `{"name":"CS_ui"}`
9. `scene_list_prefabs` `{}`
10. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, … 共 1 张]}`：对每张图依次编译并写进存档，返回全部写好、可以试玩的存档。
11. `scene_list_components` `{"prefab":"player"}`
12. `inspect_map` `{}`
13. [UI] `playtest_start` `{"graphNames":["_GSTS_CsStage"],"durationSeconds":13,"screenshotsAt":[2,7,11],"inputs":[]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 1 张，合计 19 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_CsStage（19 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Client signal, graph "stage": see examples/clientsignal/gen_clientsignal.py.
g.server({id:1073741825,name:'_GSTS_CsStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'CS_A',false,[9]);
  f.startTimer(evt.eventSourceEntity,'CS_B',false,[13]);
  f.printString('CS_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName==='CS_A'){
    for(const player of f.getListOfPlayerEntitiesOnTheField())f.sendSignal('client:CS_ping',player);
    f.printString('CS_SENT ping');
  }
  if(evt.timerName==='CS_B'){
    for(const player of f.getListOfPlayerEntitiesOnTheField())f.sendSignal('client:CS_tell',player,'hello');
    f.printString('CS_SENT tell');
  }
})
```

## 三、客户端脚本（Lua）

挂在哪棵控件树上见第一节里的 `scene_add_client_ui`。怎么写见 `read_knowledge {id:"client-lua.zh-CN"}`。

### CS_main

```lua
-- 节点图用【发送客户端脚本信号】发来的信号，脚本在这里收：灯先是灰的，收到 CS_ping 变绿，收到 CS_tell 变黄。
local lamp

function OnStart()
    lamp = script.object:GetChild("lamp")
    lamp.imageColor = Color(128, 128, 128)
    script:RegisterServerSignalHandler("CS_ping", function(name, params)
        print("CS_LUA got " .. name .. " with " .. #params .. " params")
        lamp.imageColor = Color(60, 220, 80)
    end)
    script:RegisterServerSignalHandler("CS_tell", function(name, params)
        print("CS_LUA got " .. name .. " word " .. tostring(params[1]))
        lamp.imageColor = Color(255, 216, 60)
    end)
    print("CS_LUA listening")
end
```
