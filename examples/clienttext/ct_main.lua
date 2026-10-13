-- 文字：文本框的各项设置在存档里定好，这里只改会变的那一个（每秒加一的计数），再把文本视窗滚到底看它会不会滚。
local live
local t, n = 0, 0

function OnStart()
    local root = script.object
    live = root:GetChild("live")
    live.text = "计数 0"
    local win = root:GetChild("win")
    print("CT_LUA window text has " .. #win.text .. " bytes, scrollable " .. tostring(win.interactable) .. ", bar " .. tostring(win.showScrollBar))
    print("CT_LUA mid text is " .. root:GetChild("mid").text .. ", size " .. tostring(root:GetChild("mid").fontSize))
    script:EnableUpdate(true)
end

function OnUpdate(dt)
    t = t + dt
    if t >= 1 then
        t = t - 1
        n = n + 1
        live.text = "计数 " .. n
        if n == 3 then live.fontColor = Color(255, 96, 96) end   -- 颜色、字号都能在运行时改
        if n == 5 then live.fontSize = 44 end
    end
end
