-- 节点图用【发送客户端脚本信号】发来的信号，脚本在这里收：灯先是灰的，收到 CS_ping 变绿，收到 CS_tell 变黄。
local lamp

function OnStart()
    lamp = script.object:GetChild("lamp")
    lamp.imageColor = Color(128, 128, 128)
    script:RegisterServerSignalHandler("CS_ping", function(name, params)
        print("CS_LUA got " .. name .. " with " .. #params .. " params")
        lamp.imageColor = Color(60, 220, 80)
    end)
    script:RegisterServerSignalHandler("CS_tell", function(name, params)
        print("CS_LUA got " .. name .. " word " .. tostring(params[1]))
        lamp.imageColor = Color(255, 216, 60)
    end)
    print("CS_LUA listening")
end
