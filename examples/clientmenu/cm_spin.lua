-- 挂在子控件 spin 上：script.object 就是 spin。
-- OnUpdate 默认不跑（上机验过：不调 EnableUpdate(true) 一帧都不会进来），要逐帧动就得先打开。
local frames = 0
function OnStart()
    script:EnableUpdate(true)
    print("CM_LUA spin started on " .. tostring(script.object.name))
end
function OnUpdate(dt)
    frames = frames + 1
    script.object.localRotationZ = script.object.localRotationZ + 90 * dt
    if frames == 60 then
        print("CM_LUA spin turning")
    end
end
