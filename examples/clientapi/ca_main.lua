-- 接口里几样常用又容易漏的：图片填充（要开遮罩）、关卡时停、2D 音效、画布大小和设备、按路径找控件。
local bar, ring
local t, step = 0, 0

function OnStart()
    local root = script.object
    bar = root:GetChild("bar")
    ring = root:FindChild("corner/ring")              -- 按路径找孙子控件
    local w, h = game.GetUICanvasSize()
    print("CA_LUA canvas " .. math.floor(w + 0.5) .. " x " .. math.floor(h + 0.5)
        .. " device " .. tostring(game.GetDevice()) .. " testplay " .. tostring(game.IsTestPlay()))
    -- 填充只在开了遮罩的图片上生效：bar 在存档里给了 mask，ring 在这里开。
    bar:SetFillHorizontal(Enum.ImageFillHorizontalType.Left, 0)
    ring.enableMask = true
    ring:SetFillRadial360(Enum.ImageFillRadialType.Top, 1)
    game.Tween(bar, { fillAmount = 1 }, 12):Play()    -- 进度可以补间：条慢慢长满
    game.Tween(ring, { fillAmount = 0 }, 12):Play()   -- 圆环慢慢走完（冷却圈就是这样做的）
    local sound = game.PlayAudio2D(50888)             -- 编号是音效目录里的编号
    print("CA_LUA audio playing " .. tostring(game.IsAudioAlive(sound)))
    script:EnableUpdate(true)
end

function OnUpdate(dt)                                 -- OnUpdate 不受时停影响（OnLevelUpdate 才受）
    t = t + dt
    if step == 0 and t > 9 then
        step = 1
        game.PauseLevelTime(true)                     -- 单人模式下关卡停住：节点图的计时器不走了
        print("CA_LUA paused " .. tostring(game.IsLevelTimePaused()))
    elseif step == 1 and t > 12 then
        step = 2
        game.PauseLevelTime(false)
        print("CA_LUA resumed")
        script:EnableUpdate(false)
    end
end
