# 样例 clientgame：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

A whole 2D game in a Lua client script (cg_game.lua): coins fall down five lanes, the arrow keys move a basket under them. The script presses 1 at play second 3 to start and then the arrows that put the basket under each of the first five coins (lanes 4, 5, 3, 2, 4; a coin needs 2.1 s to come down): five catches, the Lua sends CG_win, the level's graph prints CG_VICTORY and settles the level as won, about 11 s after the start. The Lua prints CG_LUA ready, start, caught 1 to 5 and CG_win. Screenshots show the coin on its way and the row of dots at the top filling up.

## 一、工具调用顺序

1. `list_maps` `{}`
2. [UI] `scene_import_assets` `{"packs":[]}`：把上面的场景包导入并保存（演练时跳过）
3. `scene_list_entities` `{"namePrefix":"CG_"}` → `{"total":0}`
4. `scene_add_signal` `{"name":"CG_win"}` → `{"name":"CG_win"}`
5. `scene_add_signal` `{"name":"CG_lose"}` → `{"name":"CG_lose"}`
6. `scene_add_graph` `{"name":"CgStage"}` → `{"graphId":1073741825,"name":"_GSTS_CgStage"}`
7. `scene_set_client_script` `{"name":"CG_game","source":"<Lua，见第三节>"}` → `{"name":"CG_game"}`
8. `scene_add_client_ui` `{"name":"CG_ui","script":"CG_game","controls":[{"name":"back","kind":"image","position":[0,0],"size":[760,860]},{"name":"caught1","kind":"image","position":[-330,390],"size":[32,32]},{"name":"caught2","kind":"image","position":[-286,390],"size":[32,32]},{"name":"caught3","kind":"image","position":[-242,390],"size":[32,32]},{"name":"caught4","kind":"image","position":[-198,390],"size":[32,32]},{"name":"caught5","kind":"image","position":[-154,390],"size":[32,32]},{"name":"missed1","kind":"image","position":[242,390],"size":[32,32]},{"name":"missed2","kind":"image","position":[286,390],"size":[32,32]},{"name":"missed3","kind":"image","position":[330,390],"size":[32,32]},{"name":"coin","kind":"image","position":[0,330],"size":[56,56]},{"name":"basket","kind":"image","position":[0,-260],"size":[110,36]}]}` → `{"name":"CG_ui"}`
9. `scene_list_prefabs` `{}`
10. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, …]}`：把每张图的源码编译并写进存档，返回可以试玩的存档。
11. `scene_list_components` `{"prefab":"player"}`
12. `inspect_map` `{}`
13. [UI] `playtest_start` `{"graphNames":["_GSTS_CgStage"],"durationSeconds":22,"screenshotsAt":[2,5,8,11,15],"inputs":[{"at":3,"key":"1"},{"at":3.4,"key":"RIGHT"},{"at":5.52,"key":"RIGHT"},{"at":7.64,"key":"LEFT"},{"at":7.99,"key":"LEFT"},{"at":9.76,"key":"LEFT"},{"at":11.88,"key":"RIGHT"},{"at":12.23,"key":"RIGHT"}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 1 张，合计 14 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_CgStage（14 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { SettlementStatus } from 'genshin-ts/definitions/enum'

// Catch the coins, graph "stage": see examples/clientgame/gen_clientgame.py.
g.server({id:1073741825,name:'_GSTS_CgStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.printString('CG_READY');
})
.onSignal('CG_win',(evt,f)=>{
  f.printString('CG_VICTORY');
  for(const player of f.getListOfPlayerEntitiesOnTheField())f.setPlayerSettlementSuccessStatus(player,SettlementStatus.Victory);
  f.settleStage();
})
.onSignal('CG_lose',(evt,f)=>{
  f.printString('CG_DEFEAT');
  for(const player of f.getListOfPlayerEntitiesOnTheField())f.setPlayerSettlementSuccessStatus(player,SettlementStatus.Defeat);
  f.settleStage();
})
```

## 三、客户端脚本（Lua）

挂在哪棵控件树上见第一节里的 `scene_add_client_ui`。怎么写见 `read_knowledge {id:"client-lua.zh-CN"}`。

### CG_game

```lua
-- 接金币：一局完全用客户端 Lua 写的 2D 小游戏。
-- 按 1 开始；金币从上面落下，← → 把篮子挪到它下面接住。接到 5 个算赢，漏掉 3 个算输，
-- 输赢由服务器的节点图结算（这里只发信号 CG_win / CG_lose）。
-- 控件由 scene_add_client_ui 摆好：back（底）、coin（金币）、basket（篮子）、caught1..5、missed1..3（计数的圆点）。
local root = script.object

local COLUMNS = { -240, -120, 0, 120, 240 }  -- 五条竖道的 x
local ORDER = { 4, 5, 3, 2, 4, 1, 3, 5 }     -- 金币依次落在哪条道上（固定的，脚本才能照着接）
local TOP, FLOOR, BASKET_Y = 330, -330, -260
local FALL = 260                             -- 每秒落多少
local NEED, ALLOWED = 5, 3

local back = root:GetChild("back")
local coin = root:GetChild("coin")
local basket = root:GetChild("basket")
local caughtDots, missedDots = {}, {}
for i = 1, NEED do caughtDots[i] = root:GetChild("caught" .. i) end
for i = 1, ALLOWED do missedDots[i] = root:GetChild("missed" .. i) end

local state = { running = false, over = false, lane = 3, drop = 0, y = TOP, caught = 0, missed = 0 }

local function show(control, image, r, g, b, a)
    control:SetActive(true)
    control:SetVisible(true)
    control:SetImage(Enum.ImageSource.StaticReference, image)
    control.imageType = Enum.ImageType.Stretch
    control.imageColor = Color(r, g, b, a)
end

local function nextCoin()
    state.drop = state.drop + 1
    state.y = TOP
    coin:SetAnchoredPosition(COLUMNS[ORDER[(state.drop - 1) % #ORDER + 1]], TOP)
    coin:SetVisible(true)
end

local function finish(signal)
    state.running = false
    state.over = true
    coin:SetVisible(false)
    script:EnableUpdate(false)
    game.ServerSignal(signal):SendSignal()
    print("CG_LUA " .. signal)
end

local function move(by)
    if not state.running then return false end
    state.lane = math.max(1, math.min(#COLUMNS, state.lane + by))
    -- 篮子滑过去而不是跳过去
    game.Tween(basket, { anchoredPositionX = COLUMNS[state.lane] }, 0.08):Play()
    return true
end

local function start()
    if state.running or state.over then return false end
    state.running = true
    nextCoin()
    script:EnableUpdate(true)
    print("CG_LUA start")
    return true
end

function OnStart()
    show(back, 100001, 16, 24, 48, 200)
    show(coin, 106025, 255, 208, 64)
    coin:SetVisible(false)
    show(basket, 100002, 96, 200, 255)
    for _, dot in ipairs(caughtDots) do show(dot, 106025, 255, 255, 255, 60) end
    for _, dot in ipairs(missedDots) do show(dot, 106025, 255, 255, 255, 60) end
    root:AddKeyEventListener(Enum.KeyEventType.KeyboardCraftspersonKey1Down, start)
    root:AddKeyEventListener(Enum.KeyEventType.KeyboardCraftspersonKey38Down, function() return move(-1) end)
    root:AddKeyEventListener(Enum.KeyEventType.KeyboardCraftspersonKey39Down, function() return move(1) end)
    script:EnableUpdate(false)
    print("CG_LUA ready")
end

function OnUpdate(dt)
    if not state.running then return end
    state.y = state.y - FALL * dt
    local lane = ORDER[(state.drop - 1) % #ORDER + 1]
    if state.y <= BASKET_Y + 40 and state.y >= BASKET_Y - 20 and lane == state.lane then
        state.caught = state.caught + 1
        caughtDots[state.caught].imageColor = Color(255, 208, 64)
        print("CG_LUA caught " .. tostring(state.caught))
        if state.caught >= NEED then finish("CG_win") else nextCoin() end
        return
    end
    if state.y < FLOOR then
        state.missed = state.missed + 1
        missedDots[state.missed].imageColor = Color(224, 48, 48)
        print("CG_LUA missed " .. tostring(state.missed))
        if state.missed >= ALLOWED then finish("CG_lose") else nextCoin() end
        return
    end
    coin:SetAnchoredPosition(COLUMNS[lane], state.y)
end
```
