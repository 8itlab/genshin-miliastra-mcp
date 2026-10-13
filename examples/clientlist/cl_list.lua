-- 客户端控件的其余几种：模板、网格视窗、模板引用、预设按钮、按键提示，以及不靠脚本就显示的静态图片。
-- panel 和 title 是 scene_add_client_ui 里直接给了图片和颜色的图片控件：脚本一行都没碰它们。
-- list 是网格视窗，列表项是模板 CL_cell 的拷贝；row 里的圆点是脚本用模板 CL_dot 现造的。
-- 按一下 ok（预设按钮）多造一个圆点，并通知节点图（信号 CL_more）。
local root = script.object
local list = root:GetChild("list")
local row = root:GetChild("row")
local ok = root:GetChild("ok")
local hint = root:GetChild("hint")
-- 模板的编号每张地图都不一样：从一个引用了它的“模板引用控件”上读，不写死在脚本里。
local dotIndex = root:GetChild("dotRef").referencedPrefabIndex
local dots = {}

local function addDot()
    local dot = game.InstantiateClientUIControl(dotIndex, row)
    dots[#dots + 1] = dot
    dot:SetActive(true)
    dot:SetVisible(true)
    dot:SetAnchoredPosition(-180 + 40 * (#dots - 1), 0)
    print("CL_LUA dots " .. tostring(#dots))
end

local function onOk()
    if #dots < 10 then addDot() end
    game.ServerSignal("CL_more"):SendSignal()
end

function OnStart()
    root.showCursor = true
    for _, name in ipairs({ "panel", "title", "list", "row", "ok", "hint", "cellRef" }) do
        local control = root:GetChild(name)
        control:SetActive(true)
        control:SetVisible(true)
    end
    root:GetChild("dotRef"):SetVisible(false) -- 只用来带编号，不给人看
    hint.keyboardKeyCode = Enum.KeyboardKeyCode.CraftspersonKey1
    -- 网格视窗：给个数和一个回调，每个列表项出现时回调一次（control 是模板的一份拷贝，index 是第几项）。
    list:RefreshItems(12, function(control, index)
        local icon = control:GetChild("icon")
        if icon ~= nil then
            icon.imageColor = (index % 2 == 0) and Color(255, 208, 64) or Color(120, 200, 255)
        end
    end)
    print("CL_LUA items " .. tostring(list.itemCount) .. " template " .. tostring(list.itemPrefabIndex == root:GetChild("cellRef").referencedPrefabIndex))
    ok:AddCursorEventListener(Enum.CursorEventType.CursorClick, onOk)
    root:AddKeyEventListener(Enum.KeyEventType.KeyboardCraftspersonKey1Down, function() onOk() return true end)
    for _ = 1, 3 do addDot() end
    print("CL_LUA started")
end
