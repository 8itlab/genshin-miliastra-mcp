-- 客户端界面范例：三条命的圆点跟着玩家变量 CU_lives 走，底下一根条跟着 CU_score 变长，
-- 点屏幕下方的按钮就给服务器发信号 CU_click（节点图收到后给 CU_score 加一）。
-- 控件由 scene_add_client_ui 摆好（都是空的），长什么样全在这里设。
local root = script.object
local PLAYER = Enum.CustomVariableEntityType.PlayerSelf

local panel = root:GetChild("panel")
local lives = { root:GetChild("life1"), root:GetChild("life2"), root:GetChild("life3") }
local track = root:GetChild("track")
local fill = root:GetChild("fill")
local button = root:GetChild("button")
local face = button:GetChild("face")
local hit = button:GetChild("hit")

-- 新控件默认是不激活的：要显示就得 SetActive(true)、SetVisible(true)。
local function show(control, image, r, g, b, a)
    control:SetActive(true)
    control:SetVisible(true)
    if image then
        control:SetImage(Enum.ImageSource.StaticReference, image)
        control.imageType = Enum.ImageType.Stretch
        control.imageColor = Color(r, g, b, a)
    end
end

local function number(name)
    local value = game.GetGlobalCustomVariableValue(PLAYER, name)
    return type(value) == "number" and value or 0
end

local function drawLives()
    local n = number("CU_lives")
    for i, disc in ipairs(lives) do
        disc:SetVisible(i <= n)
    end
    print("CU_LUA lives " .. tostring(n))
end

local function drawScore()
    local n = number("CU_score")
    local width = 12 + 36 * math.min(n, 8)
    fill:SetSizeDelta(width, 20)
    -- fill 的左边和 track 的左边对齐：位置是中心，所以随宽度挪半个宽度。
    fill:SetAnchoredPosition(-150 + width / 2, -330)
    print("CU_LUA score " .. tostring(n))
end

local function onClick()
    game.ServerSignal("CU_click"):SendSignal()
    -- 点下去的反馈：按钮面缩一下再弹回来。
    face:SetLocalScale(0.85, 0.85, 1)
    game.Tween(face, { localScaleX = 1, localScaleY = 1 }, 0.15):Play()
    print("CU_LUA click")
end

function OnStart()
    root.showCursor = true -- 没有这一句就没有鼠标，光标检测区域收不到点击
    show(panel, 100001, 0, 0, 0, 128)
    for _, disc in ipairs(lives) do
        show(disc, 106025, 224, 48, 48)
    end
    show(track, 100001, 0, 0, 0, 128)
    show(fill, 100001, 64, 200, 96)
    show(button)
    show(face, 106025, 64, 160, 255)
    show(hit)
    hit:AddCursorEventListener(Enum.CursorEventType.CursorClick, onClick)
    script:RegisterCustomVariableChangedHandler(PLAYER, "CU_lives", drawLives)
    script:RegisterCustomVariableChangedHandler(PLAYER, "CU_score", drawScore)
    drawLives()
    drawScore()
    print("CU_LUA started")
end

function OnDestroy()
    if hit ~= nil and hit.alive then
        hit:RemoveCursorEventListener(Enum.CursorEventType.CursorClick, onClick)
    end
end
