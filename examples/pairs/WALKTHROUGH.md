# 样例 pairs：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

A whole game written in Lua on client controls, made with the tools of this server alone and played to its end by script on 2026-10-13: 翻牌配对, twelve cards, six pairs, a minute. One script (pr_game.lua) holds all of it: a start screen with a button, the board, the turn of a card (a tween sequence that squeezes the card flat, changes its face and opens it again), a sound for a card, a pair and a miss (game.PlayAudio2D), a bar that runs down with the time (the fill of an image whose mask is on), a count of moves and pairs in a text box, a pause button that stops the level (game.PauseLevelTime) under a dark screen with a button to go on, and the end: the script sends PR_win or PR_lose and the graph settles the level. The cards are copies of the template PR_card made by the script (the index of the template is read from a reference control, not written into the script); the faces are the six plain shapes of the picture library (100001 to 100006), tinted. In a playtest the deck is not shuffled (game.IsTestPlay()), so that a script of clicks can play it: this route presses 开始, opens two cards that do not match, pauses and goes on, then opens the six pairs. Prints: PR_LUA ready cards 12, start, paused, resumed, pair 1 to pair 6, win moves 7 left 48, and PR_VICTORY from the graph; the platform's own 胜利 screen follows. The run was given expect {prints} and answered passed. Before the first play scene_add_client_ui pointed out a mistake in the script (CONTROL_NOT_A_CHILD: GetChild("moves") on the root, while moves stands under hud); with that corrected the game ran as written at the first playtest. editor_preview_interface shows the interface inside the canvas of a phone (16:9 and 4:3) and of a console. The text needs an account of 奇匠 level 2.

## 一、工具调用顺序

1. `list_maps` `{}`
2. [UI] `scene_import_assets` `{"packs":[]}`：把上面的场景包导入并保存（演练时跳过）
3. `scene_list_entities` `{"namePrefix":"PR_"}` → `{"total":0}`
4. `scene_add_signal` `{"name":"PR_win"}` → `{"name":"PR_win"}`
5. `scene_add_signal` `{"name":"PR_lose"}` → `{"name":"PR_lose"}`
6. `scene_add_graph` `{"name":"PrStage"}` → `{"graphId":1073741825,"name":"_GSTS_PrStage"}`
7. `scene_set_client_script` `{"name":"PR_game","source":"<Lua，见第三节>"}` → `{"name":"PR_game"}`
8. `scene_add_client_template` `{"template":{"name":"PR_card","kind":"container","size":[120,150],"children":[{"name":"back","kind":"image","image":100001,"colour":"#2a3f6a","size":[120,150]},{"name":"edge","kind":"image","image":100001,"colour":"#5a7fc0","size":[108,138]},{"name":"mark","kind":"image","image":100001,"colour":"#2a3f6a","size":[96,126]},{"name":"face","kind":"image","image":100005,"size":[84,84]},{"name":"hit","kind":"cursorArea","size":[120,150]}]}}` → `{"name":"PR_card"}`
9. `scene_add_client_ui` `{"name":"PR_ui","showCursor":true,"blockKeys":true,"controls":[{"name":"dim","kind":"image","image":100001,"colour":"#0b1020","size":[0,0],"opacity":0.72,"anchor":{"min":[0,0],"max":[1,1]}},{"name":"title","kind":"text","position":[0,315],"size":[600,60],"text":{"content":"翻牌配对","fontSize":40,"colour":"#ffd040"}},{"name":"cardRef","kind":"reference","template":"PR_card","position":[0,0]},{"name":"board","kind":"container","position":[0,-10],"size":[600,520]},{"name":"hud","kind":"container","position":[0,0],"size":[1200,700],"children":[{"name":"barBack","kind":"image","image":100001,"colour":"#000000","size":[608,26],"opacity":0.5,"position":[0,-300]},{"name":"bar","kind":"image","image":100001,"colour":"#40c060","size":[600,18],"mask":true,"position":[0,-300]},{"name":"moves","kind":"text","position":[0,-336],"size":[600,36],"text":{"content":"步数 0    已配 0 / 6","fontSize":22}},{"name":"pause","kind":"presetButton","position":[500,315],"size":[120,50],"states":{"normal":"up","hover":"over","pressed":"down"},"children":[{"name":"up","kind":"image","image":100001,"colour":"#3a7bd5","size":[120,50]},{"name":"over","kind":"image","image":100001,"colour":"#5a9bf5","size":[120,50]},{"name":"down","kind":"image","image":100001,"colour":"#ffd040","size":[120,50]},{"name":"label","kind":"text","size":[120,50],"text":{"content":"暂停","fontSize":28}}]}]},{"name":"menu","kind":"container","position":[0,0],"size":[700,360],"children":[{"name":"panel","kind":"image","image":100001,"colour":"#101830","size":[700,360],"opacity":0.9},{"name":"tip","kind":"text","position":[0,70],"size":[640,120],"text":{"content":"点开两张一样的牌就配成一对\\n在时间走完之前配完六对","fontSize":28}},{"name":"go","kind":"presetButton","position":[0,-70],"size":[220,70],"states":{"normal":"up","hover":"over","pressed":"down"},"children":[{"name":"up","kind":"image","image":100001,"colour":"#3a7bd5","size":[220,70]},{"name":"over","kind":"image","image":100001,"colour":"#5a9bf5","size":[220,70]},{"name":"down","kind":"image","image":100001,"colour":"#ffd040","size":[220,70]},{"name":"label","kind":"text","size":[220,70],"text":{"content":"开始","fontSize":28}}]}]},{"name":"result","kind":"text","position":[0,0],"size":[700,120],"text":{"content":"","fontSize":60,"colour":"#ffd040","background":"#101830","backgroundOpacity":0.9}},{"name":"pauseMask","kind":"container","anchor":{"min":[0,0],"max":[1,1]},"size":[0,0],"children":[{"name":"shade","kind":"image","image":100001,"colour":"#000000","size":[0,0],"opacity":0.6,"anchor":{"min":[0,0],"max":[1,1]}},{"name":"paused","kind":"text","position":[0,80],"size":[500,90],"text":{"content":"已暂停","fontSize":54}},{"name":"resume","kind":"presetButton","position":[0,-60],"size":[220,70],"states":{"normal":"up","hover":"over","pressed":"down"},"children":[{"name":"up","kind":"image","image":100001,"colour":"#3a7bd5","size":[220,70]},{"name":"over","kind":"image","image":100001,"colour":"#5a9bf5","size":[220,70]},{"name":"down","kind":"image","image":100001,"colour":"#ffd040","size":[220,70]},{"name":"label","kind":"text","size":[220,70],"text":{"content":"继续","fontSize":28}}]}]}],"script":"PR_game"}` → `{"name":"PR_ui"}`
10. `scene_list_prefabs` `{}`
11. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, … 共 1 张]}`：对每张图依次编译并写进存档，返回全部写好、可以试玩的存档。
12. `scene_list_components` `{"prefab":"player"}`
13. `inspect_map` `{}`
14. [UI] `playtest_start` `{"graphNames":["_GSTS_PrStage"],"durationSeconds":19,"screenshotsAt":[1,3.8,5.3,10,14.6,18],"inputs":[{"at":2,"click":[0.5,0.5778]},{"at":3,"click":[0.3688,0.3222]},{"at":3.5,"click":[0.4562,0.3222]},{"at":4.8,"click":[0.8125,0.15]},{"at":5.8,"click":[0.5,0.5667]},{"at":6.6,"click":[0.3688,0.3222]},{"at":7.1,"click":[0.5437,0.5111]},{"at":8,"click":[0.4562,0.3222]},{"at":8.5,"click":[0.6312,0.5111]},{"at":9.4,"click":[0.5437,0.3222]},{"at":9.9,"click":[0.3688,0.7]},{"at":10.8,"click":[0.6312,0.3222]},{"at":11.3,"click":[0.4562,0.7]},{"at":12.2,"click":[0.3688,0.5111]},{"at":12.7,"click":[0.5437,0.7]},{"at":13.6,"click":[0.4562,0.5111]},{"at":14.1,"click":[0.6312,0.7]}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 1 张，合计 14 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_PrStage（14 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { SettlementStatus } from 'genshin-ts/definitions/enum'

// Pairs, graph "stage": see examples/pairs/gen_pairs.py.
g.server({id:1073741825,name:'_GSTS_PrStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.printString('PR_READY');
})
.onSignal('PR_win',(evt,f)=>{
  f.printString('PR_VICTORY');
  for(const player of f.getListOfPlayerEntitiesOnTheField())f.setPlayerSettlementSuccessStatus(player,SettlementStatus.Victory);
  f.settleStage();
})
.onSignal('PR_lose',(evt,f)=>{
  f.printString('PR_DEFEAT');
  for(const player of f.getListOfPlayerEntitiesOnTheField())f.setPlayerSettlementSuccessStatus(player,SettlementStatus.Defeat);
  f.settleStage();
})
```

## 三、客户端脚本（Lua）

挂在哪棵控件树上见第一节里的 `scene_add_client_ui`。怎么写见 `read_knowledge {id:"client-lua.zh-CN"}`。

### PR_game

```lua
-- 翻牌配对：十二张牌六对，一分钟内全部配上就赢。整局都在这个脚本里：开始界面、翻牌动画、计时条、暂停、音效、
-- 输赢。赢和输各发一个信号，节点图去结算。牌是照模板 PR_card 现造的。
local SHAPES = {                                      -- 六种牌面：图形编号和颜色
    { 100002, Color(255, 96, 96) }, { 100003, Color(255, 200, 64) }, { 100004, Color(96, 220, 120) },
    { 100005, Color(96, 180, 255) }, { 100006, Color(200, 130, 255) }, { 100001, Color(255, 150, 200) },
}
local COLS, ROWS = 4, 3
local TIME = script:GetParam("seconds")              -- 一局多少秒：脚本变量，换个数不用改代码
local SOUND_FLIP, SOUND_PAIR, SOUND_MISS = 50883, 50918, 50933

local root, board, cards = nil, nil, {}
local state = "menu"                                  -- menu / play / paused / over
local open, pairsFound, moves, timeLeft, lock = {}, 0, 0, TIME, 0

local function deck()
    local order = {}
    for i = 1, COLS * ROWS do order[i] = (i - 1) % 6 + 1 end
    if not game.IsTestPlay() then                     -- 试玩时牌序固定（1 2 3 4 5 6 1 2 3 4 5 6），正式游玩才洗牌
        math.randomseed(os.time())
        for i = #order, 2, -1 do
            local j = math.random(i)
            order[i], order[j] = order[j], order[i]
        end
    end
    return order
end

local function show(card, faceUp)
    card.back:SetVisible(not faceUp)
    card.face:SetVisible(faceUp)
end

local function flip(card, faceUp)                     -- 横向压扁、换面、再展开
    game.TweenSequence()
        :Append(game.Tween(card.control, { localScaleX = 0 }, 0.12))
        :AppendCallback(function() show(card, faceUp) end)
        :Append(game.Tween(card.control, { localScaleX = 1 }, 0.12))
        :Play()
end

local function hud()
    root:FindChild("hud/moves").text = "步数 " .. moves .. "    已配 " .. pairsFound .. " / 6"
end

local function finish(won)
    state = "over"
    script:EnableUpdate(false)
    root:GetChild("result").text = won and "全部配对！" or "时间到"
    root:GetChild("result"):SetVisible(true)
    print("PR_LUA " .. (won and "win" or "lose") .. " moves " .. moves .. " left " .. math.max(0, math.floor(timeLeft)))
    game.ServerSignal(won and "PR_win" or "PR_lose"):SendSignal()
end

local function onCard(card)
    if state ~= "play" or lock > 0 or card.done or card.up then return end
    card.up = true
    flip(card, true)
    game.PlayAudio2D(SOUND_FLIP)
    open[#open + 1] = card
    if #open < 2 then return end
    moves = moves + 1
    local a, b = open[1], open[2]
    open = {}
    if a.kind == b.kind then
        a.done, b.done = true, true
        pairsFound = pairsFound + 1
        game.PlayAudio2D(SOUND_PAIR)
        print("PR_LUA pair " .. pairsFound)
        if pairsFound == 6 then finish(true) end
    else
        lock = 0.7                                    -- 让人看清第二张，再一起翻回去
        game.PlayAudio2D(SOUND_MISS)
        a.pending, b.pending = true, true
    end
    hud()
end

local function start()
    if state ~= "menu" then return end
    state = "play"
    root:GetChild("menu"):SetVisible(false)
    board:SetVisible(true)
    root:GetChild("hud"):SetVisible(true)
    hud()
    script:EnableUpdate(true)
    print("PR_LUA start")
end

local function togglePause()
    if state == "play" then
        state = "paused"
        game.PauseLevelTime(true)
        root:GetChild("pauseMask"):SetVisible(true)
        print("PR_LUA paused")
    elseif state == "paused" then
        state = "play"
        game.PauseLevelTime(false)
        root:GetChild("pauseMask"):SetVisible(false)
        print("PR_LUA resumed")
    end
end

function OnStart()
    root = script.object
    board = root:GetChild("board")
    local index = root:GetChild("cardRef").referencedPrefabIndex   -- 模板编号从引用控件上读，不写死
    root:GetChild("cardRef"):SetVisible(false)
    local order = deck()
    for i = 1, COLS * ROWS do
        local control = game.InstantiateClientUIControl(index, board)
        control:SetActive(true)
        local col, row = (i - 1) % COLS, (i - 1) // COLS
        control:SetAnchoredPosition(-210 + 140 * col, 170 - 170 * row)
        local card = { control = control, back = control:GetChild("back"), face = control:GetChild("face"), kind = order[i] }
        card.face:SetImage(Enum.ImageSource.StaticReference, SHAPES[card.kind][1])
        card.face.imageColor = SHAPES[card.kind][2]
        show(card, false)
        control:GetChild("hit"):AddCursorEventListener(Enum.CursorEventType.CursorClick, function() onCard(card) end)
        cards[i] = card
    end
    board:SetVisible(false)
    root:GetChild("hud"):SetVisible(false)
    root:GetChild("result"):SetVisible(false)
    root:GetChild("pauseMask"):SetVisible(false)
    local bar = root:FindChild("hud/bar")
    bar:SetFillHorizontal(Enum.ImageFillHorizontalType.Left, 1)   -- 计时条：填充要开遮罩，存档里给了 mask
    root:FindChild("menu/go"):AddCursorEventListener(Enum.CursorEventType.CursorClick, start)
    root:FindChild("hud/pause"):AddCursorEventListener(Enum.CursorEventType.CursorClick, togglePause)
    root:GetChild("pauseMask"):GetChild("resume"):AddCursorEventListener(Enum.CursorEventType.CursorClick, togglePause)
    print("PR_LUA ready cards " .. #cards)
end

function OnUpdate(dt)
    if state ~= "play" then return end
    timeLeft = timeLeft - dt
    root:FindChild("hud/bar").fillAmount = math.max(0, timeLeft / TIME)
    if lock > 0 then
        lock = lock - dt
        if lock <= 0 then
            for _, card in ipairs(cards) do
                if card.pending then
                    card.pending, card.up = false, false
                    flip(card, false)
                end
            end
        end
    end
    if timeLeft <= 0 then finish(false) end
end
```
