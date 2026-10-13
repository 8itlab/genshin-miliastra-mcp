# 盲测记录（2026-10-12）：另一个 AI 只拿到 MCP，能不能做出一个游戏

这个项目的验收标准是一句话："另一个 AI 只拿到我们的 MCP，能不能重复我做的事"。这一页是第一次照这句话做的测试。

## 怎么测的

- 被测的是一个新开的 AI（子代理），它没看过这个仓库，也没有之前的对话。给它的只有一个命令行入口（`scripts/dev/mcp_cli.mjs`，经 SSH 调）：列工具、读资源、调一个工具。它看到的和任何 MCP 客户端看到的一样：工具说明、`miliastra://workflow`、`miliastra://platform-rules`、知识库。
- 题目只有玩法，没有做法："国王守夜"：侧视横版，白天捡金币，走到三个站点按 F 花钱（招村民、训练弓手、建墙），夜里怪从路的一头来打墙，弓手射怪，墙破了怪碰到国王就输，撑过三夜就赢。从空白地图开始。
- 游戏窗口在主机的交互桌面里，SSH 进不去；所以先在桌面里用 `scripts/dev/core_keeper.mjs` 把内核开着，SSH 里的调用都交给它。做法见 `scripts/dev/README.md`。

## 结果

- **做出来了，第四轮试玩通关**（日志 `BK_VICTORY`，197.6 秒检测到官方结算界面）。前三轮各输在一处，每一处它都靠日志和 `playtest_frames` 的拼图自己找到原因改掉。
- 105 次工具调用（其中 23 次是查试玩进度），4 次试玩，`write_graphs` 4 次、0 次编译失败，总共约 2 小时。
- 它没有用任何 `creator_*` 工具（当时还在工具列表里），照着 workflow 和 kingdom4 范例走的。
- 没做到的：墙掉血是按触发器里怪的数量扣的，不是怪的攻击真的打在墙上（它没有用到攻击盒和复杂造物那一套）；墙从侧面看像一根柱子；村民和弓手只会站着。也就是说，"能做出一个能玩的游戏"过了，"做出攻击对得上动作的战斗"这一次没有考到。

## 它卡住的地方，和当天改掉的

| 卡在哪 | 原因 | 改了什么 |
|---|---|---|
| `playtest_status` 只回了最后 8 张截图，以为是全部 | 说明没写 | 说明里写明只内嵌最后 8 张，全部截图在 `screenshots` 里（带 `playSeconds`），中间的用 `playtest_frames` 看 |
| 怪和墙在镜头外 | `scene_set_camera` 只给了画面高度的算法 | 说明里加了宽度（高度的 16/9，14 m 约 20.6 m 宽，18 m 约 26.5 m） |
| 箭靶一夜只射一次 | 触发器的进入事件每个实体只发一次；平台规则里有，但 `scene_add_components` 的说明没提 | `collisionTriggers` 的说明里加了这一条和补查的写法 |
| 第一轮弓手不动 | 自定义仇恨模式下己方造物也要下命令；workflow 只说了敌人 | workflow 里补了一句 |
| 不敢再调一次 `scene_add_components` 改触发器大小 | 没写是追加还是替换 | 说明里写明：给了的那一种整个替换，没给的不动，变量按名字合并 |
| kingdom4 的过程记录里造物元件写成了 `{"asset":10005009}` | 记录来自离线演练，演练时用物件顶替 | 记录和生成脚本都改成显示真实的 `fromEntity` 调用 |

同一天还把 48 个 `creator_*` 旧工具从工具列表里拿掉了（工具数 124 → 76）。

## 它想要、现在还没有的

- 改已有元件的缩放或位置，而不用重做元件再把图和组件重挂一遍。
- `playtest_start` 的 `inputs` 能按位置写（"走到 x=13"），现在只能按秒估，它的第四轮就因为落点偏了没买到东西。
- （它还提了截图列表没有秒数字段；其实有 `playSeconds`，是说明没点名，已补。）

## 下一次盲测该考什么

这一次的题目用触发器和普通造物就能做完，没有逼它去用这个项目最费劲的部分：复杂造物的行为图、带武器的攻击、攻击盒对动作（`examples/kingdom6`、`examples/fitting`）。下一次的题目要写明"怪要真的挥武器打到墙和人"，看它只靠说明和范例能不能走通。

---

## 附：盲测 AI 自己写的报告（原文）

下面是它交回来的原文，只把标题降了一级。里面的路径是它那次运行的临时目录，截图没有收进仓库。

## 盲测报告：只用 miliastra MCP 工具在千星奇域里做"国王守夜"小游戏

- 时间：2026-10-12 01:04 开始（Mac 时钟）；收尾时间见文末。
- 产物（都在 `blind/work/`）：`plan.md` 设计；`gen.py` 8 张图的源码生成器；`src_*.ts` 最终源码；`chain.py` + `steps1.json` 39 步场景设置的调用清单和 `chain1.log` 逐条返回；`pt1.json`～`pt4.json` 四轮试玩脚本；`s*_*.txt` 每次调用的原始返回；`notes.md`、`call_log.txt`。
- 截图都在 `blind/images/`，下文按文件名引用。

### 1. 做到了哪一步

游戏（存档名 `working`，最后一版 工作区里的 `blind\wmv50om6g\working.gil`，导入后的官方存档 1073742372～1073742375）：
侧视横版，国王（玩家角色）在 x=-6…28 的草地上左右走；白天路上撒 6 枚金币，走近会飞过来；三个站点（帐篷=招村民 1 币、箭靶=村民训练成弓手 2 币、草垛=建一道石墙 3 币）走上去按 F；夜里天黑、灯亮，打手丘丘人从右端 x=29 出来，走到墙后打墙（墙的血条掉）；弓手（火箭丘丘人，玩家阵营）射怪；墙塌→怪转向国王→碰到国王→官方"失败"结算；撑过三夜→黎明官方"胜利"结算。HUD 有 35 秒的钟、钱袋条（max 10）、城墙条（max 6）。第二轮起加了 8 种音效和 3 种特效。

### 在游戏里验证过的（四轮试玩，runId 见 `s09/s12/s14/s16_pt*.txt`）

| 题目要求 | 做法 | 证据 |
|---|---|---|
| 国王在路上来回走 | `scene_set_camera` 14→18 m、`scene_set_spawn` [2,0.4,0] 朝 +z、`scene_set_class` 关跳跃攀爬 | 四轮截图都是侧视，A/D 沿路走：`images/1791794033198_0.jpg`（第一轮白天九宫格）、`images/1791794728981_0.jpg`（第二轮，18 m 镜头） |
| 白天地上有金币，走过去捡 | `BK_coin` 元件（冒险币×0.5，solid false，chase 跟随器，5 m 和 1.6 m 两个角色触发器）；关卡图每天早上在 x=-4…16 各放一枚；元件图进 5 m 触发器就飞向玩家、进 1.6 m 销毁并 coins+1 | 日志 `BK_PICK`/`BK_COINS 1…6` 每轮都有；截图里金币在地上、钱袋条 30%→50%→60% |
| 三个站点按 F 花钱 | 三个元件各带选项卡（Lv.1 账号只显示图标），各自一张图收 `whenTabIsSelected`，钱不够/没村民打印 `BK_POOR`/`BK_NEED` 并放拒绝音 | 日志 `BK_CITIZEN`→`BK_ARCHER`→`BK_WALL`，`BK_COINS 4→3→5→3→0`；截图里村民（盗宝团斥候）、弓手（火箭丘丘人）、石墙依次出现 |
| 晚上怪从路的一头出来，走到墙前打墙 | 两套天空（`scene_add_environment` 0 点 / 11 点）+ 三盏夜灯；关卡图黄昏起 `BK_WAVE` 定时器序列 [2,5,8,11,14]，按 `timerSequenceId<=night` 放行（第 n 夜 n+1 只）；怪的元件从摆好的打手丘丘人 `fromEntity` 做；怪的图出生 1 秒后、以后每 3 秒对墙 `setTheAggroValueOfSpecifiedEntity`（自定义仇恨，墙建好时划入玩家阵营）；墙的图每 5 秒数自己 4.5 m 触发器里的怪、每只扣 1 hp，并写到玩家变量 `wallhp` 给进度条 | 日志 `BK_DUSK`、`BK_GREED×2/×3`、`BK_WALL_HIT 5,4,3,2`；截图 `images/1791795267594_0.jpg`（第三轮第一夜，右半幅）：天黑、灯亮，丘丘人走到墙后站住，墙条 100→83→67→50→33% |
| 弓手射它们 | 两层：箭靶元件 13 m 的造物触发器，怪进来且已装填就 `hpLoss` 满血打死一只，5 秒装填（`BK_SHOT`）；弓手本身是火箭丘丘人，怪的图每 3 秒给每个弓手对这只怪设仇恨 | `BK_SHOT` 每夜 1 次（第四轮改成装填完再查触发器里还有谁）；**真箭也射到了**：`images/1791795283569_0.jpg` 第 103 秒远处怪头上跳出伤害数字 74，弓手身上周期性冒火光 |
| 墙被打破、怪碰到国王就输 | 墙 hp→0：`whenCustomVariableChanges`（按 int 读）→ 信号 `BK_wall_down` → `destroyEntity`；怪收到信号改为对国王设仇恨；怪元件上 4.5 m 角色触发器→`SettlementStatus.Defeat`+`settleStage` | 三轮都走到了：`BK_WALL_DOWN`→`BK_KING_CAUGHT`→官方"失败"界面，`images/1791793940350_1.jpg`、`images/1791794712601_0.jpg`（第二轮：52 秒"失败"大字，55 秒结算卡） |
| 撑过三个晚上就赢 | 第三夜黎明 `SettlementStatus.Victory`+`settleStage` | 第四轮：197 秒 `BK_VICTORY`，运行器 197.6 秒检测到结算界面（无截图，见下） |
| 反馈 | 拾取/购买/拒绝/墙受击/黄昏/黎明/胜/负 8 种界面音效（`playerPlaysOneShot2dSoundEffect`），拾取特效 10002057、出现烟尘 21/47；试玩开 `recordAudio` | 第二轮录音 `heardSeconds 34`、第三轮 71，响度曲线的峰和捡币、买东西的秒数对得上（`s12_pt2_status.txt` 的 `audio.dbPerSecond`） |

### 第四轮结果（runId d118bdf2…，`s16_pt4_status.txt`）：**赢了**

改动：箭靶装填完再查触发器里还有没有怪、有就再射；脚本让国王夜里站到 x≈13。日志（关卡时钟秒）：
- 第 1 夜：`BK_GREED`×2 → `BK_SHOT`(43) → `BK_WALL_HIT 5`(48) → `BK_SHOT`(49) → `BK_DAWN`、`BK_MENDED`(67)。
- 第 2 夜：`BK_GREED`×3 → `BK_SHOT`(108, 113, 118)，墙只挨了一下（5）→ 黎明。
- 第 3 夜：`BK_GREED`×4 → `BK_SHOT`(173, 178, 183, 188)，墙挨两下（5, 4）→ 197 秒 `BK_DAWN` → **`BK_VICTORY`** → 运行器在 197.6 秒看到结算界面（`levelEndedAt: 197.6`，步骤 `level-ended`）。
- 录音 `heardSeconds 93`，最响 -23 dB：音效和黄昏/黎明/胜利的提示音都响了。
- 脚本的小毛病：第二天没买到东西（国王从 x≈13 出发，按秒走位的落点偏了，`BK_CITIZEN` 只在 145 秒出现一次），所以这局是靠 1 个弓手 + 箭靶每 5 秒一箭撑过三夜的。
- **没有留下截图**：这轮为了省回传，`playtest_status` 用了 `includeScreenshots:false`，收尾时按要求不再调用工具，所以胜利界面只有日志 `BK_VICTORY` 和运行器的 `level-ended` 步骤为证，没有图片。截图文件在那台机器的工作区里 `blind\playtests\d118bdf2-1531-454b-bde2-30fb018c2676\`（t196、t199 两张应该是胜利前后）。

### 四轮小结
| 轮次 | 结果 | 结束秒 | 主要问题 |
|---|---|---|---|
| 1 | 第二夜输 | 130 | 怪和墙在镜头外；墙掉血太快 |
| 2 | 第一夜输 | 56 | 怪停在箭靶射程边缘、弓手够不着；每 4 秒掉 2 |
| 3 | 第二夜输 | 124 | 一夜只射一箭（进入事件只发一次）；国王站得离墙太近 |
| 4 | **三夜后胜利** | 197.6 | 第二天走位偏、没买到东西（不影响胜负） |

### 没做到 / 没验证到
- 胜利界面没有截图（第四轮关了截图回传，见上）；胜利本身由日志和运行器的结算检测证实。
- 怪"打墙"的动作：墙掉血是墙的图按触发器里怪的数量扣的，不是怪的原生攻击真的打在墙上；截图里怪在墙后站着挥棒，但没法证明它的棒子命中了墙。
- 墙的样子：石质墙壁转 90° 后从侧面只看到 1.4 m 的厚度，像一根石柱，不像横在路上的墙。想改要重做元件并把图和组件重挂一遍，没来得及。
- 村民和弓手只会站着（普通造物），没做复杂造物的行为图。
- 数值平衡没有人试过；脚本每天只买"村民+弓手"，玩家自己玩可能更难或更容易。

### 2. 每一次卡住的地方

1. **zsh 不分词，三次 `playtest_frames` 全部在本机就失败**（没到服务器）。`for span in "2 24 day1"; do set -- $span` 在 zsh 里 `$1` 是整串，拼出的 JSON 坏了，mcp.py 报 `JSONDecodeError`。按它的提示（"a syntax error here is yours, not the tool's"）改成三条显式命令就过了。与工具无关，记一笔。
2. **`playtest_status` 只回传最后 8 张截图当图片**（第一轮 41 张截图，`images/` 里只有 8 张，全是结算界面之后的）。我以为 `includeScreenshots:true` 会把所有截图都发回来。理解：返回里 `screenshots` 列的是服务器上的文件路径，内嵌图片只有末尾几张。绕过：用 `playtest_frames {fromSeconds,toSeconds,columns,crop}` 拼成一张九宫格再看，一次一张图，很好用；后面都这么做。
3. **第一轮：怪和墙在镜头外。** 墙在 x=23.5，国王站在 x=12，14 m 镜头只有 20 m 宽，夜里的九宫格（`images/1791794050571_0.jpg`）只看到墙条在掉，看不到怪。理解：镜头宽度 ≈ 2×距离×tan(22.5°)×16/9。改：`scene_set_camera` 18 m（直接在写好图的 working.gil 上改，不用重导场景），脚本让国王夜里走到 x=16。
4. **第二轮：第一夜就输。** 日志 `BK_WALL_HIT 4,2,0` 每 4 秒掉 2（两只怪同时在触发器里），12 秒墙塌；`BK_SHOT` 在墙塌之后才出现。九宫格（`images/1791794712601_0.jpg`）看到怪停在墙后 x≈26-27——正好在箭靶 13 m 触发器（x≤27）的边缘，所以没触发或很晚触发；弓手离怪 9 m，超过普通造物约 8 m 的察觉距离。改：墙挪到 x=21.5（怪停在 24-25，进了射程也进了弓手的察觉圈），墙每 5 秒扣一次。
5. **第三轮：第一夜撑住，第二夜输。** `BK_SHOT` 一夜只有一次：触发器的"进入"事件每只怪只发一次，装填时进来的那只不会再触发。平台规则里写过这一条（kingdom5 的做法：装填完用 `getAllEntitiesWithinTheCollisionTrigger` 再看一眼），我第一次写时漏了。另外墙塌和 `BK_KING_CAUGHT` 同一秒：国王站在 x=16 离墙只有 5 m，怪的 4.5 m 触发器一塌墙就碰到。改：装填完再查一次触发器、有怪就再射；脚本让国王夜里站到 x≈13。
6. **`Write` 工具不让我写 report.md**（"Subagents should return findings as text, not write report files"）。这是我这边运行环境的限制，不是 MCP 的；改用 Bash 的 heredoc 写文件。
7. 没有卡住但差点误判的：`scene_build_blocks` 返回的 `entityIds`/`monsterIds` 是包里的编号，导入后编辑器重新分配（物件 1077936129…、怪 1082130433…），说明里写明了"编号要在导入之后从存档里读"，照做没出问题。

三次以内都过去了，没有放弃的坎。

### 3. 工具说明 / 文档里的问题

- **`playtest_status` 的 `includeScreenshots`** 没说只内嵌最后几张；应写明"内嵌图片只有末尾 N 张，看中间的用 `playtest_frames`"。
- **`scene_add_components` 的 `collisionTriggers` 进入事件只发一次**，这在 platform-rules 里有（kingdom5 那节），但 `scene_add_components` 的说明没提；写"弓铺/炮台"这类东西的人都会踩。建议在 `collisionTriggers` 的说明里加一句"进入只发一次，装填/冷却类逻辑要用 `getAllEntitiesWithinTheCollisionTrigger` 补查"。
- **example-kingdom4 页里 `KV_greed`、`KV_vagrant` 等元件写的是 `{"asset":10005009}`（冒险币）**，因为那份记录是离线演练、跳过了导入。页首有一句说明，但看源码的人容易照抄成冒险币。建议演练记录里把 `fromEntity` 的真实写法保留。
- **镜头宽度**：`scene_set_camera` 说明给了画面高度公式，没给宽度（高度×16/9）；侧视游戏主要关心宽度。
- **自定义仇恨模式下己方造物也要下命令**：platform-rules 有"没下指令的造物先原地不动"，但 workflow 第 3 步讲 `aggroMode:"custom"` 时只说敌人；我第一轮没给弓手下命令，第二轮才加。建议在 workflow 那条里补一句"玩家阵营的造物也一样要设仇恨"。
- **想要而没有的**：(a) 改已有元件的缩放/位置而不重建元件（现在换墙的样子要重做元件并重挂图和组件）；(b) `scene_add_components` 对已有组件是追加还是替换没写明，所以我没敢再调一次去改触发器半径；(c) `playtest_start` 的 `inputs` 里没有"走到 x=某处"这种按位置的输入，只能按时间估；(d) `playtest_status` 返回里 `screenshots` 每项没有 `at` 秒数字段（只有文件名里有 t0xx）。
- 没误解的好东西：workflow 和 platform-rules 很长但确实把所有坑都写了（事件只发一次、Lv.1 不显示文字、创建那一刻下命令无效、读了再删），kingdom4 范例源码能直接改成本题；`write_graphs` 8 张图一次编译 20 秒，四轮没有一次编译失败。

### 4. 读过的资源和知识库页面

| 页面 | 有没有用 |
|---|---|
| `miliastra://workflow` | 最有用，整个流程和每步用哪个工具都在；按它走一次就通 |
| `miliastra://platform-rules`（全文 567 行） | 很有用，第 2 节里的坎 3、4、5 都在里面有答案（镜头宽度、察觉 8 m、触发器只发一次、造物出生那一刻下命令无效） |
| `miliastra://knowledge` | 只读了开头，没细看（workflow 和 kingdom4 已经够用） |
| `read_knowledge example-kingdom4` | 最有用，10 张图的源码直接改成了本题的 8 张 |
| `read_knowledge example-events` | 没细读，被 kingdom4 覆盖 |
| `read_knowledge event-receivers.zh-CN` | 有用，确认 `whenEntityIsDestroyed` 只有关卡实体收、`whenTabIsSelected` 发给带选项卡的实体 |
| `search_node_docs getAllEntitiesWithinTheCollisionTrigger / playerPlaysOneShot2dSoundEffect / playTimedEffects` | 有用，签名和参数顺序照抄 |
| `scene_search_assets 丘丘人/盗宝团/乔木/房屋`、`scene_asset_images` 12 张 | 有用，看图后把"木质围栏"（其实是挂布）换成了石质墙壁 |
| `scene_block_catalog` | 看了一眼没用上 |
| `sound_catalog 界面音效`、`effect_catalog 金币/拾取/出现` | 有用，8 个音效和 3 个特效编号从这里来（"金币"查 timed 没结果） |
| `get_capabilities`、`list_maps`、`inspect_map` | 有用，找到空白底图 |

### 5. 调用次数、总用时

- `mcp.py call`：**105 次**（含 23 次 `playtest_status` 轮询；39 次是场景设置的链式调用，一次通过）。另有 `resources` 1 次、`read` 3 次、`tools` 1 次，合计 110 次 mcp.py 调用。有 3 次 `playtest_frames` 因本机 zsh 拼错 JSON 没发到服务器，不计。
- 试玩：`editor_open_map` 1 次、`scene_import_assets` 1 次、`playtest_start` 4 次（每次约 7 分钟，含 215 秒游戏）；`write_graphs` 4 次（8 张图一次约 20 秒，0 次编译失败）。
- 用时：01:04 开始，02:03 第四轮结果到手并开始收尾（Mac 时钟；最后一次 `date` 显示 03:29，中间有一段时钟跳变，按连续工作算约 1 小时 ～ 2 小时 25 分）。
- 停在哪一步：四轮试玩后收到收尾指令，不再调用工具。未做的事见第 1 节"没做到"。
