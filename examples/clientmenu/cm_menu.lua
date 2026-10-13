-- 一个“商店”样子的界面：读脚本变量、填网格、按钮有按下的样子、点了通知节点图。
-- 鼠标是界面自己开的（scene_add_client_ui 的 showCursor），脚本里不用再设。
local root = script.object
local list = root:GetChild("list")
local buy = root:GetChild("buy")
local sleeper = root:GetChild("sleeper")
local fx = root:GetChild("fx")
local bought = 0

function OnStart()
    -- 脚本变量：在 scene_set_client_script 的 variables 里定，这里按名字读。
    print("CM_LUA title " .. tostring(script:GetParam("title")) .. " rows " .. tostring(script:GetParam("rows")))
    list:RefreshItems(8, function(control, index)
        local icon = control:GetChild("icon")
        if icon ~= nil then
            icon.imageColor = (index % 2 == 0) and Color(255, 208, 64) or Color(120, 200, 255)
        end
    end)
    buy:AddCursorEventListener(Enum.CursorEventType.CursorClick, function()
        bought = bought + 1
        game.ServerSignal("CM_buy"):SendSignal()
        sleeper:SetActive(true) -- 一开始不激活的控件，第一次买了才出现
        fx:PlayAnimation()
        print("CM_LUA bought " .. tostring(bought) .. " sleeper " .. tostring(sleeper.active))
    end)
    print("CM_LUA started sleeper " .. tostring(sleeper.active))
end
