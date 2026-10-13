# 客户端 Lua 脚本和客户端控件：怎么用工具做

游戏 7.1 版本起，千星奇域多了一套跑在玩家本机上的界面：**客户端控件**（图片、文本框、光标检测区域、容器……）由**客户端脚本**（Lua 5.3）控制。节点图做不到的三件事它能做：界面每帧在动、收鼠标和任意按键、整局 2D 玩法画在屏幕上。官方的说法是“可以实现绝大多数 2D 玩法”。

这一页讲用本项目的工具怎么做，以及上机量出来的规矩。完整接口是官方的《附录/客户端控件API文档》（`search_knowledge "客户端控件API文档"`，页面 `mhtakr07vej4`），概念页是《客户端控件和客户端脚本》（`mhbgxf0nynww`）。

## 三个工具

| 工具 | 做什么 |
|---|---|
| `scene_set_client_script {name, source}` | 把一段 Lua 放进存档副本；同名的就替换（编号不变，挂着它的控件不用动） |
| `scene_add_client_ui {name, script, controls}` | 在屏幕上放一棵客户端控件树：一个铺满全屏的容器，根上挂着脚本，下面是你给的控件 |
| `scene_list_client_scripts`、`scene_list_interface` | 读回脚本（`includeSource` 带源码）和控件树（`clientInterfaces`） |

试玩照旧用 `playtest_start`：存档里有客户端脚本时，工具会自己在日志窗口勾上“客户端脚本”，脚本里 `print` 的内容和节点图的打印一起回来（带 `clientScript: true`）。

改脚本的一轮：`scene_set_client_script`（换源码）→ `playtest_start` → 看打印和截图。控件不用重摆。

## 控件是空的，长什么样由脚本设

`scene_add_client_ui` 写出来的控件和你在编辑器里新加一个、什么都不配的控件一模一样（和官方教学存档逐字节一致）。官方范例也是这么做的：编辑器里只摆层级和大小，图片、颜色、位置全在脚本里设。

**新控件默认不激活**。要显示，脚本里得对每个控件 `SetActive(true)`、`SetVisible(true)`；图片还要给图和颜色：

```lua
local function show(control, image, r, g, b, a)
    control:SetActive(true)
    control:SetVisible(true)
    control:SetImage(Enum.ImageSource.StaticReference, image)  -- 图片编号从 image_catalog 里挑
    control.imageType = Enum.ImageType.Stretch
    control.imageColor = Color(r, g, b, a)                     -- 0 到 255；a 不写就是不透明
end
```

`100001` 是一块纯色矩形（配上颜色就是底板、条、方块），`106025` 是一个圆点。

## 脚本的骨架

```lua
local root = script.object                -- 脚本挂在哪个控件上：这里是铺满全屏的根容器
local panel = root:GetChild("panel")      -- 按名字找直接的子控件；孙子用子控件自己的 GetChild
local PLAYER = Enum.CustomVariableEntityType.PlayerSelf

local function draw()
    local lives = game.GetGlobalCustomVariableValue(PLAYER, "lives")
    -- 照着变量把界面画一遍
end

function OnStart()                         -- 游戏按名字调用：OnInit、OnStart、OnEnable、OnUpdate(dt)、OnLevelUpdate(dt)、OnDisable、OnDestroy
    root.showCursor = true                 -- 要鼠标就得有这句，否则光标检测区域收不到点击
    -- 这里把每个控件 show 出来、注册事件
    script:RegisterCustomVariableChangedHandler(PLAYER, "lives", draw)
    draw()
end

function OnUpdate(dt)                      -- 每帧一次；不需要时 script:EnableUpdate(false) 关掉
end
```

## 和节点图怎么通

- **节点图 → 界面：改自定义变量。** 节点图照常 `f.setCustomVariable(player, 'lives', 2n, true)`；脚本用 `game.GetGlobalCustomVariableValue(Enum.CustomVariableEntityType.PlayerSelf | Level | AvatarSelf, 名字)` 读，用 `script:RegisterCustomVariableChangedHandler(类型, 名字, 回调)` 监听变化。变量要先在玩家模板上有（`scene_add_components {prefab:"player", variables:[...]}`）。上机验过（2026-10-13，`examples/clientui`）：节点图改变量，界面下一刻就跟着变。
- **界面 → 节点图：发信号。** 脚本 `game.ServerSignal("名字"):SendSignal()`，节点图用 `.onSignal('名字', (evt, f) => {...})` 收，信号要先用 `scene_add_signal` 定义。上机验过：点一下按钮，同一秒节点图就收到。要带参数用 `ServerSignal:AddInt` 等（见接口文档），没上机验过。
- 结算、掉血、生成东西这些只有节点图能做：脚本发信号，节点图去办。`examples/clientgame` 的输赢就是这样结算的。
- 我们用的 Genshin-TS 版本里没有【发送客户端脚本信号】这个节点；用自定义变量代替它就够了。

## 输入

- **鼠标**：一个 `cursorArea` 控件盖在要点的东西上，`area:AddCursorEventListener(Enum.CursorEventType.CursorClick, 回调)`；还有 `CursorDown / CursorUp / CursorEnter / CursorExit / CursorDrag`。根上要 `showCursor = true`。
- **键盘**：`控件:AddKeyEventListener(Enum.KeyEventType.<键>Down, 回调)`，回调返回 `true` 表示这次按键处理掉了。能收的键是平台定好的一批：“奇匠按键”1 到 41（数字键 1 到 0 是 1 到 10，`U Z Y G H I O P J K L V` 是 11 到 22，F5 到 F10 是 23 到 28，方向键 ↑ ↓ ← → 是 36 到 39），以及移动、跳跃、技能这些功能键（`KeyboardMoveLeftKeyDown` 等）；每个都有 `Down` 和 `Up`。完整的表在接口文档“按键输入”一节。
- 试玩脚本里方向键写 `"LEFT"`、`"RIGHT"`、`"UP"`、`"DOWN"`，数字键写 `"1"`。

## 上机量出来的规矩

- **一级账号（奇匠 Lv.1）下客户端文本框不显示**，和普通文本框一样（2026-10-13，官方教学存档里的“分数：0”在我们的试玩里没有出现）。数字用一排圆点、一根变长的条来表示。
- **脚本比试玩先开始跑。** 关卡一加载脚本就启动了，这时离试玩工具的第 0 秒还有四五秒。照时间走的 2D 玩法要等一个“开始”的按键再动，否则脚本按键对不上。
- **控件按给的顺序画，后面的盖住前面的**，也盖住平台自己的界面（小地图、技能键）。铺满全屏的底图会把它们全挡住。
- **玩家被传送或断线重连时，客户端控件全部销毁重建**，脚本从头再跑（官方文档写明）。脚本要能只凭自定义变量把界面重新画出来，不要把状态只存在 Lua 的局部变量里。试玩输入里的 `teleport` 会触发这一条。
- **这版 Lua 没有的**：`coroutine`、`io`、`require`、`string.dump`，`os` 只剩 `time / date / clock / difftime`，`debug` 只剩 `traceback`。`scene_set_client_script` 见到就拒绝。要等一段时间用 `OnUpdate` 里累加 `dt`，或者 `game.Tween`。
- 动画用补间：`game.Tween(控件, { anchoredPositionX = 120, localScaleX = 1 }, 秒数):Play()`；**不写 `:Play()` 什么都不发生**（上机踩过，2026-10-13）。能补间的字段在接口文档里标着 Tweenable；`SetEase`、`SetLoops`、`SetOnComplete` 接在 `Play` 前面，几段接起来用 `game.TweenSequence()`。
- 位置是控件中心相对它上一级中心的偏移，画布 1600 × 900，y 向上；和 `scene_add_image` 的坐标一样。
- 导入存档时，编辑器会把存档里的 Lua 写到存档旁边的 `external_lua_file\<文件名>`；工具写进存档的源码就是运行的那一份。

## 范例

- `examples/clientui`：血量圆点跟着变量走、点按钮给服务器发信号、条跟着分数变长。最小的“界面和节点图互通”。
- `examples/clientgame`：整局 2D 小游戏（方向键接金币），逐帧动画和按键都在 Lua 里，输赢发信号给节点图结算。

## 还没做的

- 控件只有四种：容器、图片、文本框、光标检测区域。预设按钮、网格视窗、文本视窗、界面动效、按键提示、模板引用还没有（存档里各缺一份样本）。
- 控件模板（脚本里 `game.InstantiateClientUIControl` 动态创建控件用的）还没有：要多个一样的东西，先在树里摆够数量，用 `SetVisible` 开关。
- 图片、文字的初始内容不能在工具里定，只能脚本里设。
- 容器一开始隐藏、由节点图打开，还没有。
