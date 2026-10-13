# 客户端 Lua 脚本和客户端控件：怎么用工具做

游戏 7.1 版本起，千星奇域多了一套跑在玩家本机上的界面：**客户端控件**（图片、文本框、按钮、网格、光标检测区域……）由**客户端脚本**（Lua 5.3）控制。节点图做不到的三件事它能做：界面每帧在动、收鼠标和任意按键、整局 2D 玩法画在屏幕上。官方的说法是“可以实现绝大多数 2D 玩法”。

这一页讲用本项目的工具怎么做，以及上机量出来的规矩。完整接口是官方的《附录/客户端控件API文档》（`search_knowledge "客户端控件API文档"`，页面 `mhtakr07vej4`），概念页是《客户端控件和客户端脚本》（`mhbgxf0nynww`）。

## 工具

| 工具 | 做什么 |
|---|---|
| `scene_set_client_script {name, source, variables}` | 把一段 Lua 放进存档副本；同名的就替换（编号不变，挂着它的控件不用动）；`variables` 是脚本变量，二十种类型 |
| `scene_add_client_template {template}` | 加一个控件模板：脚本运行时照它造拷贝，网格视窗拿它当列表项，模板引用控件显示它 |
| `scene_add_client_ui {name, script, controls}` | 在屏幕上放一棵客户端控件树：一个铺满全屏的容器，根上挂着脚本，下面是你给的控件 |
| `scene_remove_client {ui \| template \| script}` | 拿掉一个界面、模板或脚本。要改一个已有的界面，就拿掉再照新的样子加一次 |
| `scene_list_client_scripts`、`scene_list_interface` | 读回脚本（变量的名字和类型；`includeSource` 带源码）、控件树（`clientInterfaces`）和模板（`clientTemplates`） |
| `scene_add_signal` + 节点图里 `f.sendSignal('client:名字', 玩家)` | 节点图给脚本发一次性的消息（见“和节点图怎么通”） |
| `scene_check_client {mapPath}` | 不进游戏，把脚本里写死的名字对着存档、节点图、图鉴和官方接口查一遍 |
| `editor_preview_interface {mapPath, canvases}` | 让编辑器把界面画在手机、主机的画布上，各截一张 |
| `scene_import_simulator {mapPath, save}` | 把千星沙箱模拟器的工程整个写进存档 |

顺序：先脚本，再模板（模板可以带脚本），最后界面（界面里的网格和引用要叫得出模板的名字）。

试玩照旧用 `playtest_start`：存档里有客户端脚本时，工具会自己在日志窗口勾上“客户端脚本”，脚本里 `print` 的内容和节点图的打印一起回来（带 `clientScript: true`）。

改脚本的一轮：`scene_set_client_script`（换源码）→ `playtest_start` → 看打印和截图。控件不用重摆。

### 一轮大约一分钟，而且先查后跑

- **只改了 Lua，不用重新导入存档。** 编辑器把每个脚本存成存档旁边的一个文件（`external_lua_file\<文件名>`），游戏跑的就是那个文件。上一次试玩打开的存档还开着、这次的存档和它只差脚本的文字时，`playtest_start` 直接把新脚本写进那些文件就开始试玩，日志窗口里勾着的图也不重勾。实测一轮 74 秒（其中试玩 8 秒；剩下主要是游戏自己上传关卡和加载），重新导入的一轮是四五分钟。结果里的 `shortWay` 说明走的是这条路。加了脚本、改了控件或变量，就照常导入。
- **写进去的当场就查。** `scene_set_client_script` 遇到语法错直接拒绝并给出行列（不用等试玩校验）；脚本里写死的名字逐个对一遍：`game` 的函数、`script` 的方法、`Enum` 的值对官方接口，`GetChild` / `FindChild` 的控件名对挂着这个脚本的控件底下有什么，信号名对存档里定义的信号，自定义变量名对玩家和角色模板上的变量，`GetParam` 的名字对脚本自己的变量，模板编号、图片编号、音效编号对存档和图鉴。对不上的在结果的 `problems` 里，带脚本名、行号和最接近的名字。这个平台上名字对不上不报错、只是没反应，所以这一步能省掉大半“为什么没动静”的试玩。
- **全部写完后整份再查一遍**：`scene_check_client {mapPath}`。这时节点图也在存档里了，还会指出“脚本发的信号没有图在听”“图发给脚本的信号没有脚本在收”。`playtest_start` 开始前也会自己查一遍，结果在 `clientCheck` 里。只查得到写死的名字，运行时拼出来的名字查不到。
- **让试玩自己说过没过**：`playtest_start` 给 `expect: {prints: ["CG_READY", "CG_LUA caught 5", "CG_VICTORY"], absent: ["CG_LOSE"]}`，`playtest_status` 的 `expectations` 就是 `passed` 或者第一条没等到的打印（以及那个位置实际打印了什么）；脚本运行时报错也算没过。画面对不对还是要看截图。

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
| `text` / `textWindow` | 文本框 / 能滚动的文本视窗 | `text: {content, fontSize, colour, background, outline, align, valign, autoSize}`；文本视窗另有 `scrollable`（能不能滚）、`scrollbar`（显不显示滚动条），没有 `valign`；**奇匠 Lv.1 的账号不显示** |
| `animation` / `fullscreenAnimation` | 界面动效 | `effect`（动效编号，编辑器里列着：10001001 雷能量满值1、10001002 火能量满值1……）、`effectSound`、`below`；一出现就在播 |

每个控件都能给：`position`、`size`、`scale`、`rotation`（度）、`pivot`、`anchor: {min, max}`、`active: false`（一开始不存在，脚本 `SetActive(true)` 才出现）、`visible: false`（只是不画）、`script`（挂在它自己身上的脚本，也可以连它的变量取值一起给，见“脚本变量”）、`devices`（别的设备上不一样的位置和大小，见下）、`navigation`（手柄摇杆往哪走，见下）。

每一种、每一项设置写出来的记录，都和在编辑器里手配的逐字节相同；除了文字（一级账号看不到）、文本视窗、别的设备上的布局和手柄导航（本机只有电脑和键鼠），都在游戏里看过（2026-10-13，`examples/clientlist`、`examples/clientmenu`、`examples/clientvars`）。

### 四种设备各有各的画布

编辑器里每个控件的“变换”有四个设备按钮，默认“同步信息至所有设备”。四种设备的画布大小不一样（2026-10-13 在编辑器里量的）：

| 设备 | `devices` 里的名字 | 画布 |
|---|---|---|
| 电脑 | （控件本身写的就是它） | 1600 × 900 |
| 手机 | `mobile` | 1280 × 720 |
| 主机 | `console` | 1920 × 1080 |
| 手机接手柄 | `mobileGamepad` | 1280 × 720 |

**同一组数字在四种设备上都照用**，所以离中心超过 640（横）或 360（竖）的控件在手机上就出屏幕了。两个办法：该贴边的东西用 `anchor` 挂到边上（比如右上角 `anchor: {min: [1, 1], max: [1, 1]}`，`position` 就是离那个角多远）；或者给 `devices`，只写不一样的那几项：

```json
{"name": "b", "kind": "image", "position": [600, 300], "size": [90, 90],
 "devices": {"mobile": {"position": [480, 240], "size": [70, 70]}, "console": {"position": [720, 360]}}}
```

给了 `devices` 的控件就不再“同步”，没写的设备沿用控件本身的数字。写出的记录和编辑器里手调四种设备后存下来的逐字节相同；游戏里只看过电脑这一种。

**看别的设备上是什么样：`editor_preview_interface {mapPath, canvases}`。** 它打开编辑器自己的界面管理，把画布依次切到电脑、手机、主机（共十种：`pc`、`pc-21:9`、`mobile`、`mobile-19.5:9`、`mobile-4:3`、`console`、`console-21:9`、`mobileGamepad` 及其两种比例），每种截一张回来，大约半分钟。图是编辑器画的，带着那种设备自带的界面（手机的触屏按键、电脑的按键提示），所以控件有没有出界、有没有压在平台按键上一眼能看出来。说界面做完之前看一眼手机那张：大多数玩家在手机上。它画的是存档里的样子，脚本运行时才画的东西不在上面（没给图的图片是一个问号）。

### 手柄摇杆往哪走

`focusable: true` 的控件能被摇杆选中。默认摇杆往哪个方向推就去那个方向最近的可选控件；要指定就给 `navigation`：

```json
{"name": "a", "kind": "image", "focusable": true, "navigation": {"right": "b", "left": "none"}}
```

四个方向 `left / right / up / down`，值是同一个界面里另一个可选控件的名字（重名时写“上级/名字”的路径），或者 `"none"`（这个方向哪也不去）；没写的方向照旧找最近的。给了 `navigation` 的控件自动算可选；指向的控件必须自己写了 `focusable: true`。和编辑器手配的逐字节相同；本机没有手柄，游戏里没验过。

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

**颜色是 0 到 255，不是 0 到 1。** `Color(0.5, 0.5, 0.5)` 画出来是黑的（上机踩过）。`scene_set_client_script` 见到三个都不超过 1 的小数会在结果里提醒（`coloursLookLikeFractions`）。

### 填充：进度条和冷却圈（要开遮罩）

图片可以只画出一部分：横着、竖着、绕一圈。**只有开了遮罩的图片填充才生效**——没开时 `fillAmount` 读回来是你设的数，画面上图片还是整张（上机试过两种图片类型、晚几秒再设，都一样；开了遮罩就对了）。遮罩在 `scene_add_client_ui` 里给 `mask: true`，或者脚本里 `control.enableMask = true`。

```lua
bar:SetFillHorizontal(Enum.ImageFillHorizontalType.Left, 0.3)   -- 从左边起画三成；Right 是从右边起
ring.enableMask = true
ring:SetFillRadial360(Enum.ImageFillRadialType.Top, 0.25)       -- 从顶上起绕四分之一圈
pic:SetFillVertical(Enum.ImageFillVerticalType.Bottom, 0.5)     -- 下半张
game.Tween(bar, { fillAmount = 1 }, 6):Play()                   -- 进度能补间
```

脚本用了填充又从没提过 `enableMask`，`scene_set_client_script` 会在结果里提醒（`fillNeedsMask`）。不想开遮罩，条也可以靠改宽度做（`SetSizeDelta`），`examples/clientui` 是那样做的。范例 `examples/clientapi`。

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

脚本里 `script:GetParam("rows")` 读。编辑器给的二十种类型都能定：

| `type` | `value` 怎么写 | 脚本里读到的 |
|---|---|---|
| `integer` / `float` | 数 | number |
| `boolean` | `true` / `false` | boolean |
| `string` | 文字 | string |
| `vector3` | `[x, y, z]` | 以 `x`、`y`、`z` 为键的表：`v.x` |
| `guid` / `configId` / `prefabId` | 编号 | number |
| `controlId` | 默认值一般不写；由控件给（见下） | **运行时编号**，`game.GetClientUIControl(编号)` 换成控件；没给时是 0 |
| `entity` | 不能预先给值 | 没给时读到 0 |
| 上面每一种加 `List`（`integerList`、`stringList`、`vector3List`、`controlIdList`……） | 数组 | 从 1 数起的表 |

### 同一个脚本挂在几个控件上，各给各的值

变量标 `public: true`，挂这个脚本的控件就能给它另一个值，脚本读到的是自己所在控件给的那份；没给的读脚本的默认值：

```json
{"name": "speed", "type": "float", "value": 1.5, "public": true}
```

```json
{"name": "a", "kind": "image", "script": {"name": "spin", "values": {"speed": 2.25, "target": "b", "others": ["b", "row/c"]}}}
```

`controlId` 类型的变量在这里直接写同一个界面里控件的名字（或“上级/名字”路径），工具换成编号。根上的脚本同样可以给：`scene_add_client_ui {script: {name, values}}`。没标 `public` 的变量控件给不了（工具会拒绝）。

二十种类型的定义、十六种能给值的类型在控件上的取值，都和编辑器里手配的逐字节相同；并在游戏里逐个读回打印过（2026-10-13，`examples/clientvars`：根上读到默认值，控件 `a` 上读到它自己的那份，`target` 换成的控件名字是 `b`）。

## 和节点图怎么通

- **节点图 → 界面：改自定义变量。** 节点图照常 `f.setCustomVariable(player, 'lives', 2n, true)`；脚本用 `game.GetGlobalCustomVariableValue(Enum.CustomVariableEntityType.PlayerSelf | Level | AvatarSelf, 名字)` 读，用 `script:RegisterCustomVariableChangedHandler(类型, 名字, 回调)` 监听变化。变量要先在玩家模板上有（`scene_add_components {prefab:"player", variables:[...]}`）。节点图改变量，界面同一秒就跟着变。
- **界面 → 节点图：发信号。** 脚本 `game.ServerSignal("名字"):SendSignal()`，节点图用 `.onSignal('名字', (evt, f) => {...})` 收，信号要先用 `scene_add_signal` 定义。带参数：信号定义时给 `parameter`，脚本 `signal:AddString("hello")` 再发，节点图里 `defineSignal('名字', [['word','str']] as const)` 后读 `evt.params.word`（上机验过字符串）。
- **整块界面的开关：** `scene_add_client_ui` 给 `hidden: true`，节点图用 `f.modifyUiControlStatusWithinTheInterfaceLayout(玩家, containerId, UIControlGroupStatus.On)` 打开。打开的那一刻它的脚本才启动；关掉时控件销毁。背包、商店、暂停菜单这种整块开合的界面用它。
- 结算、掉血、生成东西这些只有节点图能做：脚本发信号，节点图去办。`examples/clientgame` 的输赢就是这样结算的。
- **节点图 → 脚本：发信号（一次性的消息）。** 游戏 7.1 的服务器节点【发送客户端脚本信号】。节点图里写 `f.sendSignal('client:名字', 玩家, ...参数)`：名字前面加 `client:`，第二个参数是发给哪个玩家；脚本里 `script:RegisterServerSignalHandler("名字", function(name, params) ... end)` 收，`params` 是参数的表（`params[1]` 是第一个）。信号照常用 `scene_add_signal` 定义（同一个信号既能在节点图之间发，也能发给脚本）。上机验过不带参数和带一个字符串（2026-10-13，`examples/clientsignal`）。
  - 编译器（Genshin-TS）没有这个节点；工具在把图写进存档前，把 `client:` 开头的发送节点换成这个节点。它在编辑器里是【执行节点 → 界面控件组 → 发送客户端脚本信号】，有“信号名”和“目标玩家”两项。
  - 7.1 以前定义的信号没有这个节点的定义，工具会报 `SIGNAL_NOT_FOR_CLIENT_SCRIPTS`：把存档在编辑器里打开存一次（编辑器会补上），或者在副本上重新定义信号。
  - 要一直保持的状态（血量、分数）还是用自定义变量：信号只在发的那一刻有，界面重建以后收不回来。

## 接口里还有什么（上机验过的）

完整的在官方接口文档里；这几样常用、容易漏（2026-10-13，`examples/clientapi`）：

- **关卡时停**：`game.PauseLevelTime(true)` 让关卡停住（单人模式），节点图的计时器不走了；`false` 恢复。`OnUpdate` 和补间照常跑，`OnLevelUpdate(dt)` 才跟着停。暂停菜单就用它。
- **音效**：`local id = game.PlayAudio2D(编号)`，编号是 `sound_catalog` 里的；`game.StopAudio(id)` 停，`game.IsAudioAlive(id)` 问还在不在播。
- **画布和设备**：`game.GetUICanvasSize()` 电脑上是 1600 × 900；`game.GetDevice()` 是 `Enum.Device.KeyboardAndMouse / Mobile / Controller / MobileController`。脚本里按设备摆位置就靠这两个。`game.IsTestPlay()` 试玩时是 true。
- **找控件**：`控件:GetChild("名字")` 只找直接的子控件；`控件:FindChild("a/b")` 按路径找。`game.GetClientUIRoots()`、`game.FindClientUIRoot(名字)` 在 `OnStart` 里还是空的（过几秒才有），根控件直接用 `script.object`。
- **调自己的函数**：`script:Invoke("函数名", 参数...)` 调脚本里的全局函数。`typeof(控件)` 给出类型名（根是 `ClientUIContainerControl`）。
- `game.PrintClientUITree()` 把控件树写进日志（在 `OnStart` 里调只打出 `Roots: 0`）。

## 从千星沙箱模拟器来

[千星沙箱模拟器](https://github.com/1475505/miliastra-beyond-simulator)在游戏之外跑客户端 Lua 和界面，几秒一轮，适合先把玩法调出来；它到真机这一步是人手做的（导入 GIA、挂脚本、校准模板编号）。`scene_import_simulator {mapPath, save}` 把这一步做掉：

- `save` 是模拟器的完整存档（它“导出 → 完整存档”写出的 `.json`）。
- 脚本、控件模板、界面（脚本挂在原来的控件上，各设备不同的位置照搬）都写进存档；脚本和服务端规则里提到的信号自动定义，规则要设的玩家变量自动加上。
- 模拟器的“服务端规则”（收到脚本发来的某个信号时：设变量、给脚本发信号）会变成关卡实体上的一张节点图，源码在结果里。
- **模板编号自动对上**：Lua 里凡是等于模拟器里模板编号的数字，都换成模板在这份存档里的编号；只动 Lua 自己的数字，字符串和注释里的不动。
- 结果的 `notes` 列出模拟器里有、这边写不进去的东西（图片的填充和羽化、信号的第二个参数、游戏里不存在的按钮状态），`check` 是 `scene_check_client` 对导入后整份存档查出来的问题。
- 然后 `playtest_start {mapPath}` 上真机。上机验过（2026-10-14）：脚本发信号、节点图设变量再发回、脚本收到，文字和模板都画出来了。

两处模拟器和游戏不一样、导入时替你处理了的：模拟器把预设按钮的第一个状态叫“不可用”、第四个叫“选中”，编辑器里其实是“默认”和“不可用”；按键提示的键盘键和手柄键在它那里是反的。只读了它的存档格式，没有用它的代码。

## 输入

- **鼠标**：`cursorArea` 或 `presetButton` 收，`控件:AddCursorEventListener(Enum.CursorEventType.CursorClick, 回调)`；还有 `CursorDown / CursorUp / CursorEnter / CursorExit / CursorDrag`。要鼠标可见：`scene_add_client_ui` 给 `showCursor: true`，或者脚本里 `root.showCursor = true`。
- **键盘**：`控件:AddKeyEventListener(Enum.KeyEventType.<键>Down, 回调)`，回调返回 `true` 表示这次按键处理掉了。能收的键是平台定好的一批：“奇匠按键”1 到 41（数字键 1 到 0 是 1 到 10，`U Z Y G H I O P J K L V` 是 11 到 22，F5 到 F10 是 23 到 28，方向键 ↑ ↓ ← → 是 36 到 39），以及移动、跳跃、技能这些功能键（`KeyboardMoveLeftKeyDown` 等）；每个都有 `Down` 和 `Up`。完整的表在接口文档“按键输入”一节。
- 界面开着时不想让按键漏给下面的关卡（比如菜单里按方向键角色不该走）：`blockKeys: true`；不想让点击漏下去：`blockCursor: true`。
- 试玩脚本里方向键写 `"LEFT"`、`"RIGHT"`、`"UP"`、`"DOWN"`，数字键写 `"1"`。

## 别的规矩（上机量的）

- **奇匠 Lv.1 的账号，客户端文本框也不显示**，和普通文本框一样；升到 Lv.2 就都有了（2026-10-14 实测，`examples/clienttext`：对齐、颜色、描边、背景、自适应、文本视窗的滚动条、脚本运行时改文字，全部按写的显示）。给 Lv.1 的账号做，数字用一排圆点、一根变长的条来表示。
- 文字放不下时：开了 `autoSize` 会缩小并折行塞进框里；没开就只显示开头，后面的裁掉。文本视窗里文字太宽会自动折行。
- **控件按给的顺序画，后面的盖住前面的**，也盖住平台自己的界面（小地图、技能键）。铺满全屏的底图会把它们全挡住。
- **关卡里的传送不会重置界面**：试玩输入里的 `teleport` 之后控件还在、脚本没有重新启动。官方文档说“传送、断线重连时客户端控件会销毁重建”，至少同一关里的传送不是这样；断线重连没验过，稳妥起见脚本要能只凭自定义变量把界面重新画出来。
- **这版 Lua 没有的**：`coroutine`、`io`、`package`、`load`、`loadfile`、`dofile`、`string.dump`，`os` 只剩 `time / date / clock / difftime`，`debug` 只剩 `traceback`（上机看过，前六样都是 `nil`）。`scene_set_client_script` 见到就拒绝。
- **`require` 是有的**（2026-10-14 上机验过；之前这里写的“没有”是错的）：`local m = require("CV_util")` 运行文件名是 `CV_util.lua` 的那个脚本一次，拿到它 `return` 的东西。名字是脚本的文件名去掉 `.lua`，**大小写要一模一样**（`require("cv_util")` 找不到 `CV_util.lua`）。被 `require` 的脚本用 `scene_set_client_script` 放进存档就行，不用挂到控件上；它的 `OnStart` 这些不会被调用，只有顶层代码跑一遍。一局游戏可以拆成几个文件。要等一段时间用 `OnUpdate` 里累加 `dt`，或者 `game.TweenSequence()` 的 `AppendInterval`。
- 位置是控件中心相对它上一级中心的偏移，y 向上，单位是画布的格子；电脑上画布 1600 × 900（和 `scene_add_image` 的坐标一样），手机 1280 × 720，主机 1920 × 1080（见“四种设备各有各的画布”）。
- **试玩里的点击可以按住**：输入里给 `{"at": 4, "click": [0.5, 0.8], "holdMs": 600}`，这 0.6 秒里鼠标一直按着，中间截的图能看到按钮“按下”的样子（`examples/clientmenu` 第 4.3 秒那张，按钮是黄的）。不给 `holdMs` 就是点一下。
- 导入存档时，编辑器会把存档里的 Lua 写到存档旁边的 `external_lua_file\<文件名>`；工具写进存档的源码就是运行的那一份。

## 范例

- `examples/clientui`：血量圆点跟着变量走、点按钮给服务器发信号、条跟着分数变长。最小的“界面和节点图互通”。
- `examples/clientgame`：整局 2D 小游戏（方向键接金币），逐帧动画和按键都在 Lua 里，输赢发信号给节点图结算。
- `examples/clientlist`：模板、网格视窗、模板引用、按键提示和静态图片；运行时照模板造控件。
- `examples/clientmenu`：脚本变量、模板自带脚本、子控件上的脚本、有按下样子的预设按钮、旋转缩放、一开始不激活的控件。
- `examples/clientcheck`：故意出错，看日志里是什么样；隐藏的容器由节点图打开；信号带参数；传送。
- `examples/clientvars`：每种类型的脚本变量、控件各自的取值、控件编号换成控件；另带一个分设备布局、手柄导航和文本视窗的写法。
- `examples/clientsignal`：节点图给脚本发信号（不带参数和带一个字符串），脚本收到后换灯的颜色。
- `examples/clienttext`：文本框的每项设置、字号自适应、两种文本视窗、脚本运行时改文字，外加一个跟着变量走的普通文本框（要奇匠 Lv.2 的账号才看得到）。
- `examples/clientapi`：图片填充做的进度条和冷却圈（要开遮罩）、关卡时停、音效、画布大小和设备、按路径找控件。

## 还没做的

- 图片的填充和边缘羽化不能写进存档（工具只写遮罩开关），由脚本设，见“填充”。
- 读不回一个已有界面的全部设置：`scene_list_interface` 只给控件树（名字、种类、脚本），位置、颜色、变量取值这些读不出来。所以改一个界面要自己留着当初的参数，拿掉再加；编辑器里手做的界面工具接不过来改。
- 信号的参数只能有一个字符串（`scene_add_signal` 的限制），发给脚本的信号也一样。
- 手机、主机上没验过：分设备的布局和手柄导航只做到“和编辑器写的一样”，本机只有电脑和键鼠。触屏点击多半和鼠标一样，但手机没有键盘，靠按键的玩法要在屏幕上放按钮。
- 发布以后脚本是否照常打包上传，没验过（要发布才知道）。
