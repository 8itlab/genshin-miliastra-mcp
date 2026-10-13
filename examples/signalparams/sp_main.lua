-- 带好几个参数的信号：脚本开局两秒后给节点图发 SP_report（整数、浮点数、字符串、三维向量、布尔值、整数列表），
-- 节点图收到后回 SP_reply（整数、三维向量、布尔值、字符串列表、实体），脚本把收到的每个值打印出来。
local lamp
local waited = 0
local sent = false

function OnStart()
    lamp = script.object:GetChild("lamp")
    lamp.imageColor = Color(128, 128, 128)
    script:RegisterServerSignalHandler("SP_reply", function(name, params)
        print("SP_LUA reply count " .. #params)
        print("SP_LUA reply points " .. tostring(params[1]) .. " " .. math.type(params[1]))
        print("SP_LUA reply at " .. type(params[2]) .. " " .. tostring(params[2].x) .. "," .. tostring(params[2].y) .. "," .. tostring(params[2].z))
        print("SP_LUA reply ok " .. tostring(params[3]))
        print("SP_LUA reply names " .. type(params[4]) .. " " .. #params[4] .. " " .. tostring(params[4][1]) .. " " .. tostring(params[4][2]))
        print("SP_LUA reply who " .. type(params[5]))
        lamp.imageColor = Color(60, 220, 80)
    end)
    script:EnableUpdate(true)
    print("SP_LUA listening")
end

function OnUpdate(dt)
    if sent then return end
    waited = waited + dt
    if waited < 6 then return end
    sent = true
    local s = game.ServerSignal("SP_report")
    s:AddInt(42)
    s:AddFloat(0.5)
    s:AddString("hello")
    s:AddVector3({x = 1, y = 2.5, z = -3})
    s:AddBool(true)
    s:AddIntList({3, 4, 5})
    s:SendSignal()
    lamp.imageColor = Color(255, 216, 60)
    print("SP_LUA sent report")
end
