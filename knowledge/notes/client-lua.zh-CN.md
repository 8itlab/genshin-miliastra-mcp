# 客户端 Lua 脚本和客户端控件：怎么用工具做

游戏 7.1 版本起，千星奇域多了一套跑在玩家本机上的界面：**客户端控件**（图片、文本框、按钮、网格、光标检测区域……）由**客户端脚本**（Lua 5.3）控制。节点图做不到的三件事它能做：界面每帧在动、收鼠标和任意按键、整局 2D 玩法画在屏幕上。官方的说法是“可以实现绝大多数 2D 玩法”。

这一页讲用本项目的工具怎么做，以及上机量出来的规矩。完整接口是官方的《附录/客户端控件API文档》（`search_knowledge "客户端控件API文档"`，页面 `mhtakr07vej4`），概念页是《客户端控件和客户端脚本》（`mhbgxf0nynww`）。

## 工具

| 工具 | 做什么 |
|---|---|
| `scene_set_client_script {name, source, variables}` | 把一段 Lua 放进存档副本；同名的就替换（编号不变，挂着它的控件不用动） |
| `scene_add_client_template {template}` | 加一个控件模板：脚本运行时照它造拷贝，网格视窗拿它当列表项，模板引用控件显示它 |
| `scene_add_client_ui {name, script, controls}` | 在屏幕上放一棵客户端控件树：一个铺满全屏的容器，根上挂着脚本，下面是你给的控件 |
| `scene_remove_client {ui \| template \| script}` | 拿掉一个界面、模板或脚本。要改一个已有的界面，就拿掉再照新的样子加一次 |
| `scene_list_client_scripts`、`scene_list_interface` | 读回脚本（`includeSource` 带源码）、控件树（`clientInterfaces`）和模板（`clientTemplates`） |

顺序：先脚本，再模板（模板可以带脚本），最后界面（界面里的网格和引用要叫得出模板的名字）。

试玩照旧用 `playtest_start`：存档里有客户端脚本时，工具会自己在日志窗口勾上“客户端脚本”，脚本里 `print` 的内容和节点图的打印一起回来（带 `clientScript: true`）。

改脚本的一轮：`scene_set_client_script`（换源码）→ `playtest_start` → 看打印和截图。控件不用重摆。

## 脚本写错了会看到什么

- **编译不过（语法错）**：进不了试玩。`playtest_start` 直接失败，报“试玩校验失败：脚本编译报错：文件名:行号: 原因”。
- **运行时出错**：试玩照常，错误作为一条打印回来，带位置和调用栈，例如 `CC_main:13: attempt to index a nil value (local 'nothing')` 加 `stack traceback: CC_main: 13: in function <CC_main:10>`。出错的那个回调到此为止，它之前打印的还在，之后的没有；别的回调照常。
- `printerr(...)` 和 `print` 一样进日志。
- 所以排错的办法就是：多 `print`，试玩，读回来。范例 `examples/clientcheck` 里每种错各出了一次。

## 脚本的骨架

```lua
local root = script.object                -- 脚本挂在哪个控件上，script.object 就是哪个
local panel = root:GetChild("panel")      -- 按名字找直接的子控件；孙子用子控件自己的 GetChild
local PLAYER = Enum.CustomVariableEntityType.PlayerSelf

local function draw()
    local lives = game.GetGlobalCustomVariableValue(PLAYER, "lives")
    -- 照着变量把界面画一遍
end

function OnStart()                         -- 游戏按名字调用：OnInit、OnStart、OnEnable、OnDisable、OnDestroy
    script:RegisterCustomVariableChangedHandler(PLAYER, "lives", draw)
    draw()
    script:EnableUpdate(true)              -- 要逐帧就得有这句：不调它，OnUpdate 一次都不会被调用
end

function OnUpdate(dt)                      -- 每帧一次；用完 script:EnableUpdate(false) 关掉
end
```

三条最容易踩的（都上机踩过）：

1. **`OnUpdate` 默认不跑**，要先 `script:EnableUpdate(true)`。
2. **`game.Tween(...)` 不调 `:Play()` 什么都不发生**：`game.Tween(控件, { anchoredPositionX = 120 }, 0.2):Play()`。
3. **脚本比试玩先开始跑**：关卡一加载脚本就启动，这时离试玩工具的第 0 秒还有四五秒。照时间走的玩法要等一个“开始”的按键再动。

`scene_set_client_script` 见到前两条会在返回里提醒。

## 十一种控件

| `kind` | 是什么 | 能定什么 |
|---|---|---|
| `container` | 容器节点 | 装别的控件（`children`），挪它里面的跟着挪；`showCursor`、`blockKeys`、`blockCursor` |
| `image` | 图片 | `image`（编号从 `image_catalog` 挑）、`colour`、`opacity`、`mask`；不给 `image` 就是空的，等脚本 `SetImage` |
| `cursorArea` | 光标检测区域 | 收鼠标：点击、按下、抬起、进入、离开、拖拽 |
| `presetButton` | 预设按钮 | 它的样子是它装着的控件：`states: {normal, hover, pressed, disabled}` 各叫一个子控件的名字；`enabled`、`sound` |
| `grid` | 网格视窗 | 会滚动的列表，列表项是模板的拷贝（`itemTemplate`）；`grid: {columns 或 rows, itemSize, spacing, padding, scrollbar}`；脚本 `RefreshItems(个数, function(control, index) end)` 填内容 |
| `reference` | 模板引用控件 | 把一个模板显示在这里（`template`）；脚本能从它读出模板的编号 `referencedPrefabIndex` |
| `keyHint` | 按键提示 | 按当前设备显示一个键：`key`（奇匠按键的序号，1 到 10 是数字键）、`padKey` |
| `text` / `textWindow` | 文本框 / 能滚动的文本视窗 | `text: {content, fontSize, colour, background, outline, align, valign, autoSize}`；**奇匠 Lv.1 的账号不显示** |
| `animation` / `fullscreenAnimation` | 界面动效 | `effect`（动效编号，编辑器里列着：10001001 雷能量满值1、10001002 火能量满值1……）、`effectSound`、`below`；一出现就在播 |

每个控件都能给：`position`、`size`、`scale`、`rotation`（度）、`pivot`、`anchor: {min, max}`、`active: false`（一开始不存在，脚本 `SetActive(true)` 才出现）、`visible: false`（只是不画）、`script`（挂在它自己身上的脚本）。

每一种、每一项设置写出来的记录，都和在编辑器里手配的逐字节相同；除了文字（一级账号看不到）和文本视窗，都在游戏里看过（2026-10-13，`examples/clientlist`、`examples/clientmenu`）。

### 预设按钮要给齐状态

预设按钮自己没有样子，四种状态各显示它装着的一个子控件。**只给 `normal` 不给 `hover`，鼠标一挪到按钮上它就什么都不显示了**（上机看过）。最少这样给：

```json
{"name": "buy", "kind": "presetButton", "size": [180, 64],
 "states": {"normal": "up", "hover": "up", "pressed": "down"},
 "children": [{"name": "up", "kind": "image", "image": 100001, "colour": "#40a0ff", "size": [180, 64]},
              {"name": "down", "kind": "image", "image": 100001, "colour": "#ffd040", "size": [180, 64]}]}
```

脚本里 `buy:AddCursorEventListener(Enum.CursorEventType.CursorClick, 回调)` 收点击。只要一个能点的区域、样子自己管，用 `cursorArea` 盖在图片上也行。

### 没给内容的图片是空的

图片不给 `image` 就什么都不显示（编辑器里是一个问号），等脚本来设：

```lua
control:SetImage(Enum.ImageSource.StaticReference, 106025)   -- 编号从 image_catalog 挑
control.imageType = Enum.ImageType.Stretch
control.imageColor = Color(255, 208, 64)                     -- 0 到 255；第四个数是不透明度
```

`100001` 是一块纯色矩形（配上颜色就是底板、条、方块），`106025` 是一个圆点。

## 模板：数量不定的东西

子弹、卡牌、列表的一行，这类“运行时才知道要几个”的东西做成模板（`scene_add_client_template`），脚本照着造：

```lua
local dotIndex = root:GetChild("dotRef").referencedPrefabIndex   -- 从一个引用了模板的 reference 控件上读编号
local dot = game.InstantiateClientUIControl(dotIndex, row)       -- 在 row 下面造一个
dot:SetAnchoredPosition(40, 0)
-- 不要了：game.DestroyClientUIControl(dot)
```

模板的编号每张地图都不一样。两种拿法：工具返回的 `templateIndex` 直接写进脚本；或者像上面这样，在界面里放一个 `reference` 控件指向模板、脚本从它身上读（读完 `SetVisible(false)` 藏起来），脚本就不用带数字。

**模板可以自带脚本**：模板里的控件给了 `script`，每造出一份拷贝，那个脚本就在那份拷贝上启动一次（`script.object` 是那份拷贝）。网格的每个列表项也是这样。一张卡牌、一颗子弹自己的行为写在它自己的脚本里，不用都塞进根上的大脚本。

## 脚本变量

给脚本配的常量，不用改源码就能换：

```json
{"name": "menu", "source": "...", "variables": [{"name": "title", "type": "string", "value": "Shop"}, {"name": "rows", "type": "integer", "value": 2}]}
```

脚本里 `script:GetParam("rows")` 读。现在能定整数和字符串两种。

## 和节点图怎么通

- **节点图 → 界面：改自定义变量。** 节点图照常 `f.setCustomVariable(player, 'lives', 2n, true)`；脚本用 `game.GetGlobalCustomVariableValue(Enum.CustomVariableEntityType.PlayerSelf | Level | AvatarSelf, 名字)` 读，用 `script:RegisterCustomVariableChangedHandler(类型, 名字, 回调)` 监听变化。变量要先在玩家模板上有（`scene_add_components {prefab:"player", variables:[...]}`）。节点图改变量，界面同一秒就跟着变。
- **界面 → 节点图：发信号。** 脚本 `game.ServerSignal("名字"):SendSignal()`，节点图用 `.onSignal('名字', (evt, f) => {...})` 收，信号要先用 `scene_add_signal` 定义。带参数：信号定义时给 `parameter`，脚本 `signal:AddString("hello")` 再发，节点图里 `defineSignal('名字', [['word','str']] as const)` 后读 `evt.params.word`（上机验过字符串）。
- **整块界面的开关：** `scene_add_client_ui` 给 `hidden: true`，节点图用 `f.modifyUiControlStatusWithinTheInterfaceLayout(玩家, containerId, UIControlGroupStatus.On)` 打开。打开的那一刻它的脚本才启动；关掉时控件销毁。背包、商店、暂停菜单这种整块开合的界面用它。
- 结算、掉血、生成东西这些只有节点图能做：脚本发信号，节点图去办。`examples/clientgame` 的输赢就是这样结算的。
- 我们用的 Genshin-TS 版本里没有【发送客户端脚本信号】这个节点，所以节点图不能直接给脚本发一次性的消息；用“改一个自定义变量、脚本监听”代替（要传一次性事件，就让变量每次加一）。

## 输入

- **鼠标**：`cursorArea` 或 `presetButton` 收，`控件:AddCursorEventListener(Enum.CursorEventType.CursorClick, 回调)`；还有 `CursorDown / CursorUp / CursorEnter / CursorExit / CursorDrag`。要鼠标可见：`scene_add_client_ui` 给 `showCursor: true`，或者脚本里 `root.showCursor = true`。
- **键盘**：`控件:AddKeyEventListener(Enum.KeyEventType.<键>Down, 回调)`，回调返回 `true` 表示这次按键处理掉了。能收的键是平台定好的一批：“奇匠按键”1 到 41（数字键 1 到 0 是 1 到 10，`U Z Y G H I O P J K L V` 是 11 到 22，F5 到 F10 是 23 到 28，方向键 ↑ ↓ ← → 是 36 到 39），以及移动、跳跃、技能这些功能键（`KeyboardMoveLeftKeyDown` 等）；每个都有 `Down` 和 `Up`。完整的表在接口文档“按键输入”一节。
- 界面开着时不想让按键漏给下面的关卡（比如菜单里按方向键角色不该走）：`blockKeys: true`；不想让点击漏下去：`blockCursor: true`。
- 试玩脚本里方向键写 `"LEFT"`、`"RIGHT"`、`"UP"`、`"DOWN"`，数字键写 `"1"`。

## 别的规矩（上机量的）

- **奇匠 Lv.1 的账号，客户端文本框也不显示**，和普通文本框一样。数字用一排圆点、一根变长的条来表示；文字照写，升级以后就有了。
- **控件按给的顺序画，后面的盖住前面的**，也盖住平台自己的界面（小地图、技能键）。铺满全屏的底图会把它们全挡住。
- **关卡里的传送不会重置界面**：试玩输入里的 `teleport` 之后控件还在、脚本没有重新启动。官方文档说“传送、断线重连时客户端控件会销毁重建”，至少同一关里的传送不是这样；断线重连没验过，稳妥起见脚本要能只凭自定义变量把界面重新画出来。
- **这版 Lua 没有的**：`coroutine`、`io`、`require`、`string.dump`，`os` 只剩 `time / date / clock / difftime`，`debug` 只剩 `traceback`。`scene_set_client_script` 见到就拒绝。要等一段时间用 `OnUpdate` 里累加 `dt`，或者 `game.TweenSequence()` 的 `AppendInterval`。
- 位置是控件中心相对它上一级中心的偏移，画布 1600 × 900，y 向上；和 `scene_add_image` 的坐标一样。
- 导入存档时，编辑器会把存档里的 Lua 写到存档旁边的 `external_lua_file\<文件名>`；工具写进存档的源码就是运行的那一份。

## 范例

- `examples/clientui`：血量圆点跟着变量走、点按钮给服务器发信号、条跟着分数变长。最小的“界面和节点图互通”。
- `examples/clientgame`：整局 2D 小游戏（方向键接金币），逐帧动画和按键都在 Lua 里，输赢发信号给节点图结算。
- `examples/clientlist`：模板、网格视窗、模板引用、按键提示和静态图片；运行时照模板造控件。
- `examples/clientmenu`：脚本变量、模板自带脚本、子控件上的脚本、有按下样子的预设按钮、旋转缩放、一开始不激活的控件。
- `examples/clientcheck`：故意出错，看日志里是什么样；隐藏的容器由节点图打开；信号带参数；传送。

## 还没做的

- 脚本变量只有整数和字符串；控件上给公开变量另设值还没有。
- 四种设备（电脑、手机等）各自的布局：现在四种写成一样的。
- 手柄导航的上下左右目标、文本视窗自己的滚动设置、图片的填充方式。
- 手机上没验过：触屏点击多半和鼠标一样，但手机没有键盘，靠按键的玩法要在屏幕上放按钮。
- 发布以后脚本是否照常打包上传，没验过（要发布才知道）。
