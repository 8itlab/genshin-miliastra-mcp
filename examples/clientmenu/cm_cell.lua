-- 挂在模板 CM_cell 上：网格每造出一个列表项，这个脚本就在那一项上启动一次。
function OnStart()
    print("CM_LUA cell " .. tostring(script.object.name))
end
