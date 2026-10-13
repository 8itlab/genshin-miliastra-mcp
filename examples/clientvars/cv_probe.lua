-- 把脚本变量逐个读出来打印：挂在根上读到的是脚本自己的默认值，挂在控件上读到的是那个控件给的值。
local NAMES = {"whole", "speed", "on", "label", "at", "nums", "rates", "flags", "names", "spots",
    "target", "others", "guid", "config", "prefab", "guids", "configs", "prefabs", "who", "team", "hidden"}

local function show(v)
    local t = type(v)
    if t ~= "table" then
        return t .. ":" .. tostring(v)
    end
    -- 三维向量是以 x、y、z 为键的表，列表是从 1 数起的表。
    if v.x ~= nil then
        return "(" .. tostring(v.x) .. "," .. tostring(v.y) .. "," .. tostring(v.z) .. ")"
    end
    local parts = {}
    for _, x in ipairs(v) do
        parts[#parts + 1] = show(x)
    end
    return "{" .. table.concat(parts, ",") .. "}"
end

function OnStart()
    local who = script.object.name
    for _, name in ipairs(NAMES) do
        local ok, v = pcall(function()
            return script:GetParam(name)
        end)
        print("CV_LUA " .. who .. " " .. name .. " = " .. (ok and show(v) or ("ERR " .. tostring(v))))
    end
    -- 控件 ID 类型的变量读到的是运行时编号，用 game.GetClientUIControl 换成控件。
    local id = script:GetParam("target")
    local control = id ~= 0 and game.GetClientUIControl(id) or nil
    print("CV_LUA " .. who .. " target is " .. (control and control.name or "nothing") .. ", own id " .. tostring(script.object.id))
    for _, other in ipairs(script:GetParam("others")) do
        local c = game.GetClientUIControl(other)
        print("CV_LUA " .. who .. " others has " .. (c and c.name or "nothing"))
    end
end
