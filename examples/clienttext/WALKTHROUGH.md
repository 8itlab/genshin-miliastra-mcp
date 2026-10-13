# 样例 clienttext：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。这份记录是离线演练，跳过了这三步，它们的位置在下面标出。

## 这个样例是什么

Text on the screen, seen in play on 2026-10-13 on an account of 奇匠 level 2 (level 1 shows no custom text at all). Seven client text boxes, each with what the save gives it: left/top at size 24, centre/middle in yellow at 36, right/bottom without outline, all three on a background that is 80% solid (the box gets rounded corners); a long line with autoSize, which shrinks to three lines inside its box, beside the same line without it, of which only the start fits and the rest is cut off; white letters with a red outline. The box live has no text in the save: the script writes control.text every second, turns it red at 3 (fontColor) and larger at 5 (fontSize). Two text windows hold twenty lines: win shows eight of them and a scroll bar; winbare stands its text right and has no bar (scrollbar: false). At the bottom a text box of the ordinary interface (scene_add_text_box, "金币：{1:ps.CT_coins}") follows a custom variable of the player that the graph counts up: it reads 35 at play second 7. The script reads back what the save gave: the window's text (1290 bytes), interactable true, showScrollBar true, the text and size of mid.

## 一、工具调用顺序

1. `list_maps` `{}`
2. [UI] `scene_import_assets` `{"packs":[]}`：把上面的场景包导入并保存（演练时跳过）
3. `scene_list_entities` `{"namePrefix":"CT_"}` → `{"total":0}`
4. `scene_add_graph` `{"name":"CtStage"}` → `{"graphId":1073741825,"name":"_GSTS_CtStage"}`
5. `scene_add_components` `{"prefab":"player","variables":[{"name":"CT_coins","type":"integer","value":10}]}`
6. `scene_add_text_box` `{"name":"CT_coins","text":"金币：{1:ps.CT_coins}","fontSize":34,"position":[0,-380],"size":[400,60]}` → `{"name":"CT_coins","controlId":1073741847}`
7. `scene_set_client_script` `{"name":"CT_main","source":"<Lua，见第三节>"}` → `{"name":"CT_main"}`
8. `scene_add_client_ui` `{"name":"CT_ui","script":"CT_main","controls":[{"name":"left","kind":"text","position":[-450,330],"size":[300,90],"text":{"content":"左上 24","fontSize":24,"align":"left","valign":"top","background":"#203050","backgroundOpacity":0.8}},{"name":"mid","kind":"text","position":[0,330],"size":[300,90],"text":{"content":"居中 36","fontSize":36,"colour":"#ffd040","background":"#203050","backgroundOpacity":0.8}},{"name":"right","kind":"text","position":[450,330],"size":[300,90],"text":{"content":"右下 无描边","fontSize":24,"align":"right","valign":"bottom","outline":false,"background":"#203050","backgroundOpacity":0.8}},{"name":"auto","kind":"text","position":[-450,200],"size":[300,90],"text":{"content":"这一行字很长，开着字号自适应，看它会不会自己缩小塞进这个框里","fontSize":40,"autoSize":true,"minFontSize":10,"background":"#503020","backgroundOpacity":0.8}},{"name":"fixed","kind":"text","position":[0,200],"size":[300,90],"text":{"content":"这一行字很长，没开字号自适应，看它超出框以后是什么样","fontSize":40,"background":"#503020","backgroundOpacity":0.8}},{"name":"outlined","kind":"text","position":[450,200],"size":[300,90],"text":{"content":"红描边","fontSize":40,"colour":"#ffffff","outlineColour":"#ff0000","outlineOpacity":1}},{"name":"live","kind":"text","position":[-450,60],"size":[300,90],"text":{"content":"","fontSize":30,"align":"left"}},{"name":"win","kind":"textWindow","position":[150,-60],"size":[520,220],"text":{"content":"第 1 行：文本视窗里的字比框多的时候可以滚动\n第 2 行：文本视窗里的字比框多的时候可以滚动\n第 3 行：文本视窗里的字比框多的时候可以滚动\n第 4 行：文本视窗里的字比框多的时候可以滚动\n第 5 行：文本视窗里的字比框多的时候可以滚动\n第 6 行：文本视窗里的字比框多的时候可以滚动\n第 7 行：文本视窗里的字比框多的时候可以滚动\n第 8 行：文本视窗里的字比框多的时候可以滚动\n第 9 行：文本视窗里的字比框多的时候可以滚动\n第 10 行：文本视窗里的字比框多的时候可以滚动\n第 11 行：文本视窗里的字比框多的时候可以滚动\n第 12 行：文本视窗里的字比框多的时候可以滚动\n第 13 行：文本视窗里的字比框多的时候可以滚动\n第 14 行：文本视窗里的字比框多的时候可以滚动\n第 15 行：文本视窗里的字比框多的时候可以滚动\n第 16 行：文本视窗里的字比框多的时候可以滚动\n第 17 行：文本视窗里的字比框多的时候可以滚动\n第 18 行：文本视窗里的字比框多的时候可以滚动\n第 19 行：文本视窗里的字比框多的时候可以滚动\n第 20 行：文本视窗里的字比框多的时候可以滚动","fontSize":22,"background":"#102030","backgroundOpacity":0.85}},{"name":"winbare","kind":"textWindow","position":[-450,-120],"size":[300,160],"text":{"content":"第 1 行：文本视窗里的字比框多的时候可以滚动\n第 2 行：文本视窗里的字比框多的时候可以滚动\n第 3 行：文本视窗里的字比框多的时候可以滚动\n第 4 行：文本视窗里的字比框多的时候可以滚动\n第 5 行：文本视窗里的字比框多的时候可以滚动\n第 6 行：文本视窗里的字比框多的时候可以滚动\n第 7 行：文本视窗里的字比框多的时候可以滚动\n第 8 行：文本视窗里的字比框多的时候可以滚动\n第 9 行：文本视窗里的字比框多的时候可以滚动\n第 10 行：文本视窗里的字比框多的时候可以滚动\n第 11 行：文本视窗里的字比框多的时候可以滚动\n第 12 行：文本视窗里的字比框多的时候可以滚动\n第 13 行：文本视窗里的字比框多的时候可以滚动\n第 14 行：文本视窗里的字比框多的时候可以滚动\n第 15 行：文本视窗里的字比框多的时候可以滚动\n第 16 行：文本视窗里的字比框多的时候可以滚动\n第 17 行：文本视窗里的字比框多的时候可以滚动\n第 18 行：文本视窗里的字比框多的时候可以滚动\n第 19 行：文本视窗里的字比框多的时候可以滚动\n第 20 行：文本视窗里的字比框多的时候可以滚动","fontSize":22,"align":"right","scrollbar":false,"background":"#102030","backgroundOpacity":0.85}}]}` → `{"name":"CT_ui"}`
9. `scene_list_prefabs` `{}`
10. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, … 共 1 张]}`：对每张图依次编译并写进存档，返回全部写好、可以试玩的存档。
11. `scene_list_components` `{"prefab":"player"}`
12. `inspect_map` `{}`
13. [UI] `playtest_start` `{"graphNames":["_GSTS_CtStage"],"durationSeconds":9,"screenshotsAt":[2,7],"inputs":[]}`，然后 `playtest_status` 读打印和截图（演练时跳过）

## 二、各张节点图的源码

一共 1 张，合计 10 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_CtStage（10 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Client text, graph "stage": see examples/clienttext/gen_clienttext.py.
g.server({id:1073741825,name:'_GSTS_CtStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'CT_T',true,[2]);
  f.printString('CT_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  for(const player of f.getListOfPlayerEntitiesOnTheField())f.setCustomVariable(player,'CT_coins',f.getCustomVariable(player,'CT_coins').asType('int')+5n,true);
})
```

## 三、客户端脚本（Lua）

挂在哪棵控件树上见第一节里的 `scene_add_client_ui`。怎么写见 `read_knowledge {id:"client-lua.zh-CN"}`。

### CT_main

```lua
-- 文字：文本框的各项设置在存档里定好，这里只改会变的那一个（每秒加一的计数），再把文本视窗滚到底看它会不会滚。
local live
local t, n = 0, 0

function OnStart()
    local root = script.object
    live = root:GetChild("live")
    live.text = "计数 0"
    local win = root:GetChild("win")
    print("CT_LUA window text has " .. #win.text .. " bytes, scrollable " .. tostring(win.interactable) .. ", bar " .. tostring(win.showScrollBar))
    print("CT_LUA mid text is " .. root:GetChild("mid").text .. ", size " .. tostring(root:GetChild("mid").fontSize))
    script:EnableUpdate(true)
end

function OnUpdate(dt)
    t = t + dt
    if t >= 1 then
        t = t - 1
        n = n + 1
        live.text = "计数 " .. n
        if n == 3 then live.fontColor = Color(255, 96, 96) end   -- 颜色、字号都能在运行时改
        if n == 5 then live.fontSize = 44 end
    end
end
```
