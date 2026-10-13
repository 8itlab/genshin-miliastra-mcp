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
