# 现状和限制

更新：2026-10-13。

## 这个项目要做到什么

产品是给千星奇域创作者用的工具，不是某一个游戏：创作者自己电脑上开着千星沙箱，他的 AI 接上这套 MCP 帮他做关卡。检验标准只有一条：**另一个没参与过开发的 AI，只拿到这套 MCP，能不能把事情重复做出来。** 所以凡是绕开工具才办成的事，都先把工具补上再继续；范例和盲测是用来找出工具缺什么的。

## 现在能做到什么

在一张全新的空白地图上，只调 MCP 工具，从零搭出一个游戏并用脚本在游戏里走通。

**盲测**（每局一个全新的 AI，只给 MCP，不看仓库）：

| 时间 | 做出来的 | 记录 |
|---|---|---|
| 2026-10-12 | 一个侧视横版的守夜小游戏（捡金币、花钱招人和建墙、撑过三夜），从空白地图做到第四轮试玩通关 | [BLIND_TEST_2026-10-12](BLIND_TEST_2026-10-12.zh-CN.md) |
| 2026-10-13 | 三局不靠任何自定义文字、按发布标准做的整局游戏：竞技场清怪、机关逃脱、躲避生存；三局的赢和输都按脚本走到了游戏自己的结算界面 | [BLIND_TEST_2026-10-13](BLIND_TEST_2026-10-13.zh-CN.md) |

盲测没有证明的事：这些游戏还没有被真人玩家玩过，好不好玩、看不看得懂不在脚本能验证的范围里。

**范例**（`examples/`，每个都有“全过程”页面：每一步工具调用带参数、每张图的源码；没有文件的 AI 也能通过 `read_knowledge` 读到）：

| 样例 | 玩法 | 规模 | 游戏里走通的路线 |
|---|---|---|---|
| `examples/kingdom4` | 塔防经营（仿《王国》）：站点按 F 花币、招人、建墙、夜里出怪撞墙、弓铺射击、昼夜 | 10 张图约 600 节点 | 胜利；丢王冠判负；石墙升级 |
| `examples/kingdom6` | 同一玩法往深里做：所有人和怪都是复杂造物，带武器，自己发现敌人、追上去打 | 37 张图 | 两夜短流程到胜利；被抢光判负；完整五夜 |
| `examples/hop` | 平台跳跃闯关：移动平台、拉杆开门、岩浆送回、闪现技能、宝箱、倒计时 | 9 张图 157 节点 | 通关；倒计时走完判负 |
| `examples/farm` | 采集经营：拿工具、开垦、播种、作物自己生长、收获、交货 | 9 张图 202 节点 | 通关；倒计时走完判负 |
| `examples/raid` | 打怪—战利品—买卖：挥剑砍箱子和怪、捡掉落、摊位卖钱买钥匙、开门、开宝箱 | 8 张图 141 节点 | 通关 |

另有一批单项的验证关，每个把一两样工具在游戏里用一遍：`events`（最小的事件驱动范例）、`checks`、`skills`、`shop`、`drops`、`buttons`、`strike`（攻击盒打到东西）、`shoot`（技能发射投射物）、`potion`、`presets`（机关的预设状态）、`hazards`（弹跳垫、力场、状态效果、锁定视角）、`walls`（什么挡得住人）、`doors`（门开了再关）、`images`（屏幕上的图片和进度条样式）、`skirmish` 和 `brain`（复杂造物）、`fitting`（近看间：逐帧看造物的动作）、`listen`（把音效放出来录音）、`clientui`（Lua 界面和节点图互通）、`clientgame`（整局用 Lua 写的 2D 小游戏）、`clientlist`（模板、网格等其余几种控件）、`clientmenu`（脚本变量、按钮状态、模板和子控件上的脚本）、`clientcheck`（脚本出错时日志里是什么样）。

**一关的完整做法写在服务器自带的说明里**：资源 `miliastra://workflow`（步骤和每步用哪个工具）和 `miliastra://platform-rules`（平台实测规则，即 [PLATFORM_RULES](PLATFORM_RULES.zh-CN.md)）。想了解平台有哪些系统、官方怎么拼玩法、工具覆盖到哪，读 [HOW_MILIASTRA_BUILDS_GAMES](HOW_MILIASTRA_BUILDS_GAMES.zh-CN.md)。

## 工具清单（按做一关的顺序）

1. 看地图：`list_maps`、`inspect_map`、`scene_list_*`、`scene_get_level_settings`。
2. 搭景：`scene_search_assets` / `scene_asset_images` → `scene_build_blocks` → `editor_open_map` → `scene_import_assets`；摆错的用 `scene_remove_entities` 拿掉。
3. 设置：`scene_set_camera`（`fixedView` 锁定视角）、`scene_set_spawn`、`scene_add_preset_point`、`scene_set_class`、`scene_set_faction_hostility`、`scene_set_level_settings`、`scene_add_respawn_point`、`scene_set_revive`、`scene_set_player_count`。
4. 东西和它们的能力：`scene_add_prefab` / `scene_update_prefab`（物件、造物、掉落物；预设状态、生命值）、`scene_add_components`（碰撞触发器、选项卡、变量、运动器、跟随、小地图、受击盒、能力单元、战利品、投射运动器、命中检测、弹射器、力场、额外碰撞）、`scene_add_graph`（挂到关卡实体、元件、玩家模板、角色模板；客户端的技能图、过滤器图；道具图）。
5. 平台的系统：`scene_add_signal`、`scene_add_global_timer`、`scene_add_skill`、`scene_add_creature_skill`、`scene_set_creature_logic`、`scene_add_currency`、`scene_add_item`、`scene_add_shop`、`scene_add_unit_status`、`scene_add_environment`、`scene_add_light`。
6. 客户端界面（游戏 7.1）：`scene_set_client_script` 放 Lua 脚本，`scene_add_client_ui` 摆它控制的客户端控件（十一种，各自的设置都能定），`scene_add_client_template` 做运行时照着造的模板，`scene_remove_client` 拿掉；会动、收鼠标和按键的界面和 2D 玩法用它（`knowledge/notes/client-lua.zh-CN.md`）。
7. 屏幕上的东西（服务器控件）：`scene_add_progress_bar`（横条、竖条、圆环，可显示数字）、`scene_add_image`（图从 `image_catalog` 里挑）、`scene_add_timer_display`、`scene_add_button`；控件可以一开始隐藏，由节点图开关。
8. 写规则：`search_node_docs` 查节点，`write_graphs` 把一张或多张图的源码编译并写进存档。很多步设置可以放进一次 `scene_batch`。
9. 反馈：`effect_catalog`、`sound_catalog`、`music_catalog` 查编号，图里放特效、音效、换音乐（做法见 `knowledge/notes/feedback.zh-CN.md`）。
10. 试玩：`playtest_start`（按键、点鼠标、转视角、点屏幕上的字、把玩家放到指定位置、记录轨迹、读屏幕文字、截图和连拍、录音、录像）→ `playtest_status`，读日志也要看截图；`playtest_frames` 逐帧看动作。
11. 发布前：`publish_kit` 出封面、四张图、标题、简介和检查表。发布本身由创作者在游戏里做。

设计一个机制之前，先 `search_knowledge` 查官方是怎么做的；写事件监听之前，先查 `knowledge/notes/event-receivers.zh-CN.md`（事件发给哪张图，挂错地方不报错、只是永远收不到）。

## 已知限制（细节和实测数据都在平台规则文档里）

- 只在 Windows、国服中文客户端、16:9 全屏下验证过。试玩工具靠识别屏幕文字操作游戏，别的窗口抢前台会干扰。
- 屏幕上的文字：创作账号的奇匠等级是 Lv.1 时，自定义文本框不显示，选项卡的选项文字也不显示（只有图标）。平台自己的界面（商店、背包、结算、计时器的数字、进度条的数字）上的字正常。所以低等级账号的引导靠图标、图片、标记特效、进度条，不靠文字。`scene_add_text_box` 写出来的内容和官方样例逐字节一致，但没有在高等级账号上看过。
- 数据是用到时才取的：先 `removeEntity` 再用从那个实体读的值，读到的是空。
- 平台的定时器比钟慢约 4.5%；日志文件在试玩结束时才写出来，所以试玩脚本不能按“看到某条打印再做某事”来写，只能按时间。
- 节点图大小上限 3000（折算数）、每秒运算量上限约 1400、日志窗口最多勾 10 张图。事件驱动的小图离这些线很远。
- 编译器写不出枚举类型的空列表。
- 巡逻模板：2026-10-09 游戏更新后，导入存档会清空造物的巡逻模板。指挥怪走位用自定义仇恨。
- 造物索敌距离很短（5 米外不动）；自定义仇恨下，对不是敌人的目标设仇恨无效。
- 技能自己的冷却配置没做成（图里用 `f.setCharacterSkillCd` 可以给冷却）；长按、连段、瞄准三种技能没做。
- 音效库里 651 条长名字被列表截掉了结尾（以 … 结尾）；音效只有名字，听起来怎样要放出来录音（`examples/listen`）。
- 隐形墙会挤开自由镜头（人贴近镜头那侧的墙时画面变特写）；锁定视角（2.5D 镜头）可以设成不理会碰撞。
- 已有的界面控件只能加、不能删改；两根重叠的进度条谁压谁不由添加顺序决定；显示数值的进度条带一位小数。
- 能力单元还不能设“绝对伤害”（它扣的血是配置值的 0.45，原因见平台规则“伤害为什么打折”）。
- 所有范例都按单人写、单人测。

## 还没做的

- 客户端界面还缺的：脚本变量只有整数和字符串两种；四种设备各自的布局；手柄导航的目标；节点图直接给脚本发消息的那个节点（现在用自定义变量代替）。手机上没验过。

- 排行榜和成就（在编辑器的“外围系统管理”里配，没有可参照的样本）。
- 装备（装备栏、词条）、计分板、铭牌和文本气泡、卡牌选择器、道具展示控件。
- 本地投射物（技能的客户端图直接发射的那一种；现在只有服务器创建的）。
- 另外 30 种复杂造物的动画表（谁用到谁读，`scripts/dev/animscrape.py`）。
- 职业的默认技能。
- 多人。
- 英文文档和国际服客户端的验证。

## 给想改这套工具的人

- 离线测试：`npm test` 和 `tests/` 下的各个脚本（`node tests/<名字>.mjs`）。场景工具的测试拿编辑器亲手存出来的存档当夹具，逐字节比。
- 读存档里一个没见过的设置的办法：先用工具造一份“每样东西各一个”的存档（`scripts/dev/handcfg_build.mjs`）→ 在编辑器里手改那一项并保存 → `scripts/dev/savediff.mjs` 对比前后 → 写工具 → 把编辑器存出来的那份留作测试夹具。夹具进仓库之前用 `scripts/dev/scrub_account.py` 把账号编号换掉。
- `scripts/dev/mcp_round.mjs` 按一个测试 json 把整条链路走一遍，全程只调 MCP 工具；别的开发脚本见 `scripts/dev/README.md`。
- 关于千星奇域平台本身的发现写进 `docs/PLATFORM_RULES.zh-CN.md`，那份文件就是服务器给 AI 的 `miliastra://platform-rules`。
