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
