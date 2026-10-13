# 样例 clientui：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

A client interface (客户端控件 with a Lua client script, game version 7.1) made with scene_set_client_script and scene_add_client_ui. On a dark panel at the top left three red discs stand for the player variable CU_lives (3 at first); the level's graph takes one away at level seconds 12 and 16 and the Lua, which listens for the change of the variable, hides a disc each time. At the bottom a blue round button: a click on it makes the Lua send the signal CU_click, the graph hears it (prints CU_CLICK) and adds one to CU_score, and the Lua draws the green bar above the button one step longer. The script clicks the button at play seconds 4, 5 and 6: three CU_CLICK prints and a bar three steps long. Screenshots at 2 (three discs, short bar), 8 (two discs after second 12 of the level clock, which runs five or six seconds ahead; longer bar) and 13 (one disc).

## 一、工具调用顺序

1. `list_maps` `{}`
2. [UI] `scene_import_assets` `{"packs":[]}`：把上面的场景包导入并保存（演练时跳过）
3. `scene_list_entities` `{"namePrefix":"CU_"}` → `{"total":0}`
4. `scene_add_signal` `{"name":"CU_click"}` → `{"name":"CU_click"}`
5. `scene_add_graph` `{"name":"CuStage"}` → `{"graphId":1073741825,"name":"_GSTS_CuStage"}`
6. `scene_add_components` `{"prefab":"player","variables":[{"name":"CU_lives","type":"integer","value":3},{"name":"CU_score","type":"integer","value":0}]}`
7. `scene_set_client_script` `{"name":"CU_hud","source":"<Lua，见第三节>"}` → `{"name":"CU_hud"}`
8. `scene_add_client_ui` `{"name":"CU_ui","script":"CU_hud","controls":[{"name":"panel","kind":"image","position":[-620,380],"size":[280,80]},{"name":"life1","kind":"image","position":[-700,380],"size":[56,56]},{"name":"life2","kind":"image","position":[-620,380],"size":[56,56]},{"name":"life3","kind":"image","position":[-540,380],"size":[56,56]},{"name":"track","kind":"image","position":[0,-330],"size":[308,28]},{"name":"fill","kind":"image","position":[-144,-330],"size":[12,20]},{"name":"button","kind":"container","position":[0,-270],"size":[90,90],"children":[{"name":"face","kind":"image","size":[90,90]},{"name":"hit","kind":"cursorArea","size":[90,90]}]}]}` → `{"name":"CU_ui"}`
9. `scene_list_prefabs` `{}`
10. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, …]}`：把每张图的源码编译并写进存档，返回可以试玩的存档。
11. `scene_list_components` `{"prefab":"player"}`
12. `inspect_map` `{}`
13. [UI] `playtest_start` `{"graphNames":["_GSTS_CuStage"],"durationSeconds":15,"screenshotsAt":[2,8,13],"inputs":[{"at":4,"click":[0.5,0.8]},{"at":5,"click":[0.5,0.8]},{"at":6,"click":[0.5,0.8]}]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 1 张，合计 28 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_CuStage（28 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Client interface, graph "stage": see examples/clientui/gen_clientui.py.
g.server({id:1073741825,name:'_GSTS_CuStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'CU_STEP',false,[12,16]);
  f.printString('CU_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='CU_STEP')return;
  f.printString('CU_STEP');f.printString(f.dataTypeConversion(evt.timerSequenceId,'str'));
  for(const player of f.getListOfPlayerEntitiesOnTheField()){
    f.setCustomVariable(player,'CU_lives',evt.timerSequenceId===0n?2n:1n,true);
  }
})
.onSignal('CU_click',(evt,f)=>{
  f.printString('CU_CLICK');
  for(const player of f.getListOfPlayerEntitiesOnTheField()){
    f.setCustomVariable(player,'CU_score',f.getCustomVariable(player,'CU_score').asType('int')+1n,true);
  }
})
```

## 三、客户端脚本（Lua）

挂在哪棵控件树上见第一节里的 `scene_add_client_ui`。怎么写见 `read_knowledge {id:"client-lua.zh-CN"}`。

### CU_hud

```lua
-- 客户端界面范例：三条命的圆点跟着玩家变量 CU_lives 走，底下一根条跟着 CU_score 变长，
-- 点屏幕下方的按钮就给服务器发信号 CU_click（节点图收到后给 CU_score 加一）。
-- 控件由 scene_add_client_ui 摆好（都是空的），长什么样全在这里设。
local root = script.object
local PLAYER = Enum.CustomVariableEntityType.PlayerSelf

local panel = root:GetChild("panel")
local lives = { root:GetChild("life1"), root:GetChild("life2"), root:GetChild("life3") }
local track = root:GetChild("track")
local fill = root:GetChild("fill")
local button = root:GetChild("button")
local face = button:GetChild("face")
local hit = button:GetChild("hit")

-- 新控件默认是不激活的：要显示就得 SetActive(true)、SetVisible(true)。
local function show(control, image, r, g, b, a)
    control:SetActive(true)
    control:SetVisible(true)
    if image then
        control:SetImage(Enum.ImageSource.StaticReference, image)
        control.imageType = Enum.ImageType.Stretch
        control.imageColor = Color(r, g, b, a)
    end
end

local function number(name)
    local value = game.GetGlobalCustomVariableValue(PLAYER, name)
    return type(value) == "number" and value or 0
end

local function drawLives()
    local n = number("CU_lives")
    for i, disc in ipairs(lives) do
        disc:SetVisible(i <= n)
    end
    print("CU_LUA lives " .. tostring(n))
end

local function drawScore()
    local n = number("CU_score")
    local width = 12 + 36 * math.min(n, 8)
    fill:SetSizeDelta(width, 20)
    -- fill 的左边和 track 的左边对齐：位置是中心，所以随宽度挪半个宽度。
    fill:SetAnchoredPosition(-150 + width / 2, -330)
    print("CU_LUA score " .. tostring(n))
end

local function onClick()
    game.ServerSignal("CU_click"):SendSignal()
    -- 点下去的反馈：按钮面缩一下再弹回来。
    face:SetLocalScale(0.85, 0.85, 1)
    game.Tween(face, { localScaleX = 1, localScaleY = 1 }, 0.15):Play()
    print("CU_LUA click")
end

function OnStart()
    root.showCursor = true -- 没有这一句就没有鼠标，光标检测区域收不到点击
    show(panel, 100001, 0, 0, 0, 128)
    for _, disc in ipairs(lives) do
        show(disc, 106025, 224, 48, 48)
    end
    show(track, 100001, 0, 0, 0, 128)
    show(fill, 100001, 64, 200, 96)
    show(button)
    show(face, 106025, 64, 160, 255)
    show(hit)
    hit:AddCursorEventListener(Enum.CursorEventType.CursorClick, onClick)
    script:RegisterCustomVariableChangedHandler(PLAYER, "CU_lives", drawLives)
    script:RegisterCustomVariableChangedHandler(PLAYER, "CU_score", drawScore)
    drawLives()
    drawScore()
    print("CU_LUA started")
end

function OnDestroy()
    if hit ~= nil and hit.alive then
        hit:RemoveCursorEventListener(Enum.CursorEventType.CursorClick, onClick)
    end
end
```
