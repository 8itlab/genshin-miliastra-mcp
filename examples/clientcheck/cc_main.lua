-- 验证用：故意出几种错，看试玩日志里能看到什么；发一个带参数的信号；被传送后会不会重新启动。
local root = script.object
local hit = root:GetChild("hit")
local frames = 0

function OnStart()
    root.showCursor = true
    print("CC_LUA main started")
    printerr("CC_LUA printerr line")
    hit:AddCursorEventListener(Enum.CursorEventType.CursorClick, function()
        print("CC_LUA click before fault")
        local nothing = nil
        nothing.field = 1 -- 回调里的运行时错误
        print("CC_LUA click after fault")
    end)
    root:AddKeyEventListener(Enum.KeyEventType.KeyboardCraftspersonKey1Down, function()
        local signal = game.ServerSignal("CC_say")
        signal:AddString("hello")
        signal:SendSignal()
        print("CC_LUA sent")
        return true
    end)
    root:AddKeyEventListener(Enum.KeyEventType.KeyboardCraftspersonKey2Down, function()
        root:GetChild("no such control"):SetVisible(true) -- 找不到控件：对 nil 调方法
        return true
    end)
end

function OnUpdate(dt)
    frames = frames + 1
    if frames == 120 then
        error("CC_LUA fault in update")
    end
    if frames == 240 then
        print("CC_LUA still updating after the fault")
    end
end
