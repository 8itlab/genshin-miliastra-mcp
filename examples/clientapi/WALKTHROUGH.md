# 样例 clientapi：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

Things of the Lua API that are easy to miss, each seen in play on 2026-10-13. (1) The fill of an image (a bar that grows, a ring that runs out) shows only on an image whose mask is on: bar has mask: true in the save, ring gets control.enableMask = true in the script. Without the mask the value reads back as set and the picture stays whole (tried with both image types and at a later moment: no difference). SetFillHorizontal(Enum.ImageFillHorizontalType.Left, 0) and SetFillRadial360(Enum.ImageFillRadialType.Top, 1) set the kind of fill; fillAmount can be tweened: the bar is half full at play second 1, three quarters at 4 and full at 9, the ring half, a quarter, gone. (2) game.PauseLevelTime(true) stops the level in single play: the graph prints CA_TICK every second, and there is none between level seconds 10 and 14 while the script had the level paused. OnUpdate goes on meanwhile (OnLevelUpdate is the one that stops), and so does a tween. (3) game.PlayAudio2D(50888) plays a sound by its id of the sound catalogue and returns an instance id; game.IsAudioAlive says true (the sound itself was not listened to). (4) game.GetUICanvasSize() is 1600 x 900 on a computer, game.GetDevice() is Enum.Device.KeyboardAndMouse, game.IsTestPlay() is true in a playtest. (5) control:FindChild("corner/ring") finds a control by its path; GetChild only a direct child.

## 一、工具调用顺序

1. `list_maps` `{}`
2. [UI] `scene_import_assets` `{"packs":[]}`：把上面的场景包导入并保存（演练时跳过）
3. `scene_list_entities` `{"namePrefix":"CA_"}` → `{"total":0}`
4. `scene_add_graph` `{"name":"CaStage"}` → `{"graphId":1073741825,"name":"_GSTS_CaStage"}`
5. `scene_set_client_script` `{"name":"CA_main","source":"<Lua，见第三节>"}` → `{"name":"CA_main"}`
6. `scene_add_client_ui` `{"name":"CA_ui","script":"CA_main","controls":[{"name":"back","kind":"image","image":100001,"colour":"#000000","opacity":0.5,"position":[0,250],"size":[408,38]},{"name":"bar","kind":"image","image":100001,"colour":"#40c060","mask":true,"position":[0,250],"size":[400,30]},{"name":"corner","kind":"container","position":[-500,-250],"children":[{"name":"ring","kind":"image","image":106025,"colour":"#ffd040","size":[100,100]}]}]}` → `{"name":"CA_ui"}`
7. `scene_list_prefabs` `{}`
8. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, … 共 1 张]}`：对每张图依次编译并写进存档，返回全部写好、可以试玩的存档。
9. `scene_list_components` `{"prefab":"player"}`
10. `inspect_map` `{}`
11. [UI] `playtest_start` `{"graphNames":["_GSTS_CaStage"],"durationSeconds":10,"screenshotsAt":[1,4,9],"inputs":[]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 1 张，合计 6 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_CaStage（6 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Client API, graph "stage": see examples/clientapi/gen_clientapi.py.
g.server({id:1073741825,name:'_GSTS_CaStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'CA_T',true,[1]);
  f.printString('CA_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  f.printString('CA_TICK');
})
```

## 三、客户端脚本（Lua）

挂在哪棵控件树上见第一节里的 `scene_add_client_ui`。怎么写见 `read_knowledge {id:"client-lua.zh-CN"}`。

### CA_main

```lua
-- 接口里几样常用又容易漏的：图片填充（要开遮罩）、关卡时停、2D 音效、画布大小和设备、按路径找控件。
local bar, ring
local t, step = 0, 0

function OnStart()
    local root = script.object
    bar = root:GetChild("bar")
    ring = root:FindChild("corner/ring")              -- 按路径找孙子控件
    local w, h = game.GetUICanvasSize()
    print("CA_LUA canvas " .. math.floor(w + 0.5) .. " x " .. math.floor(h + 0.5)
        .. " device " .. tostring(game.GetDevice()) .. " testplay " .. tostring(game.IsTestPlay()))
    -- 填充只在开了遮罩的图片上生效：bar 在存档里给了 mask，ring 在这里开。
    bar:SetFillHorizontal(Enum.ImageFillHorizontalType.Left, 0)
    ring.enableMask = true
    ring:SetFillRadial360(Enum.ImageFillRadialType.Top, 1)
    game.Tween(bar, { fillAmount = 1 }, 12):Play()    -- 进度可以补间：条慢慢长满
    game.Tween(ring, { fillAmount = 0 }, 12):Play()   -- 圆环慢慢走完（冷却圈就是这样做的）
    local sound = game.PlayAudio2D(50888)             -- 编号是音效目录里的编号
    print("CA_LUA audio playing " .. tostring(game.IsAudioAlive(sound)))
    script:EnableUpdate(true)
end

function OnUpdate(dt)                                 -- OnUpdate 不受时停影响（OnLevelUpdate 才受）
    t = t + dt
    if step == 0 and t > 9 then
        step = 1
        game.PauseLevelTime(true)                     -- 单人模式下关卡停住：节点图的计时器不走了
        print("CA_LUA paused " .. tostring(game.IsLevelTimePaused()))
    elseif step == 1 and t > 12 then
        step = 2
        game.PauseLevelTime(false)
        print("CA_LUA resumed")
        script:EnableUpdate(false)
    end
end
```
