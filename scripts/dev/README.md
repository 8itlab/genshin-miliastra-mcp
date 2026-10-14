# 开发用的脚本

做这套工具的过程中用过的脚本：读存档、对比存档、从编辑器的界面上抄图鉴、不接 AI 客户端直接调 MCP 工具。不属于发布内容，用工具做游戏不需要它们；想给工具加功能、或者游戏更新后要重抄图鉴时才用。

几条通用的事：

- 要操作游戏窗口的脚本必须在登录的桌面会话里跑（界面自动化进不了 SSH 会话）。
- 临时文件放在环境变量 `MILIASTRA_SCRATCH` 指的目录（没设就用系统临时目录下的 `miliastra-dev`）；下面写的 `<临时目录>` 就是它。
- 有些脚本是为某一次调查写的，参数和假设都很具体，用之前先读开头的注释。

`build.mjs`、`mcp_playtest.mjs`、`mcp_scene_file.mjs` 是把单个步骤经真实 MCP 调一遍的小客户端（参数各读一个 json）。


存档分析（只读，用来对比“编辑器手摆的”和“我们导入的”实体）：

- `ent_summary.mjs <存档.gil> [筛选字]`：列出每个实体的编号、物件编号、名字、属性种类和组件种类。
- `ent_diff.mjs <存档.gil> <编号A> <编号B>`：逐字段比较两个实体。
- `f7types.mjs <存档.gil>`：列出每个实体带哪些运行时记录、是不是静态单位。
- `f7.mjs`、`f6.mjs`、`where.mjs`、`cmp_ent.mjs`：打印运行时组件、目录登记、编号出现位置、完整字段树。

## 资产目录是怎么抄出来的（特效、音效、音乐）

编辑器的资产库显示名字和编号，本地数据里没有明文表，所以从屏幕上读：

- `listscrape.py <out.jsonl> <x0> <y0> <x1> <y1> <每步滚几格> <最多几步> [缩放] [frames]`：在编辑器里把列表打开、分类全展开，给出列表所在的屏幕区域（物理像素），它每一步截图、文字识别、滚轮往下，直到连续三步内容不变。要在交互桌面里跑（Win+R 启动一个批处理）；没给参数时读环境变量 `LISTSCRAPE_ARGS` 指的文件里的一行。`frames` 表示每一步的截图都留下。
- `listparse.py <in.jsonl[+第二段.jsonl]> <music|sound|effect|loop> <out.json> [分类标题,…]`：把逐步读到的并成一张表，名字取出现次数最多的写法。
- `fxthumbs.py <out dir> <区域的上边 y0> <jsonl>…`：从留下的截图里裁出每条特效在列表里的小图。
- 2026-10-11 抄的四份：限时特效（区域 2328 955 2904 2040，每步 9 格，约 760 步）、循环特效（同一区域，450 步）、音效（2328 1320 2904 2117，每步 6 格，935 步）、音乐（2652 768 3216 1574，每步 2 格，260 步）。游戏更新后要重抄时照这个做，再把结果整理进 `src/scene/media/`。
- `animprobe/`、`animscrape.py`、`animparse.py`：读复杂造物的动画名。`animprobe/` 是一轮的描述（拷到 `examples/_animprobe/` 再跑）：给每种造物做几个技能，每个放四个连着的动画编号；导入后停在“战斗预设 → 技能 → 造物自定义技能 → 未分类页签”，`animscrape.py <技能名列表.json> <out.jsonl>` 逐个技能打开“动画编辑”、识别那一排标签（要在交互桌面里跑，会占着游戏窗口；某个造物读到空技能就跳过它剩下的）；`animparse.py <out.jsonl> <资产名.json> <creature-animations.json>` 整理成工具用的表，拿不准的行打印出来对照 `<out.jsonl>.strips/` 里的截图。读之前把 `src/scene/media/creature-animations.json` 里要重读的造物先拿掉，否则工具不收表里没有的编号。
- `fitting/`：近看间配套的看录像小工具。近看间本身（要看哪些造物和动作、生成场景和节点图）已经是正式范例 `examples/fitting`，用试玩工具自己的连拍（`bursts`）加 `playtest_frames` 就能逐帧看，不需要录像；这里留下的是用 Xbox Game Bar 录像时的四个脚本，要每秒三十帧那样细的时候才用。录像用 Win+Alt+R。`frames.py <视频> <起> <止> <每秒几帧> <列数> <格宽> <out.jpg> [裁剪]` 把一段切成逐帧拼图；`boothsheet.py`、`allbooths.py` 按日志里隔间打开的时刻出图（日志的钟比试玩时钟快 5～6 秒，每轮不同）；`strip.py` 把几张 4K 截图的同一块裁出来叠在一起看细节。结论写进 `src/scene/media/creature-animations.json` 的 `seen`。
- `measure_sounds.py <一轮的报告 json> <listen_list.json> <out.json>`：配合 `examples/listen`，把试玩录音按条切开，量每条的时长、响度、明亮程度。

## 通过 MCP 调工具（不接 AI 客户端时）

- `mcp_batch.mjs <调用清单.json> <输出目录>`：起一个服务进程，按顺序调清单里的工具（`[{"tool":"...","args":{...},"wait":true}]`），结果写到 `results.json`，返回的图片存成文件。`wait:true` 会一直查 `playtest_status` 到那次运行结束（导入、打开存档、试玩用）。只查图鉴、打包这类不碰界面的调用可以直接从 SSH 跑；要操作游戏界面的必须在桌面会话里跑。
- `mcp_cli.mjs tools | resources | read <uri> | call <工具> <参数.json> [输出目录]`：一次一个调用的命令行客户端，打印的就是 AI 客户端看到的东西（工具说明、资源、返回的 JSON，图片存成文件）。工作区用环境变量 `MILIASTRA_WORKSPACE` 指定。
- `core_keeper.mjs`：在交互桌面里把某个工作区的内核一直开着（Win+R 启动一个批处理来跑它；它把自己的进程号写到 `<工作区>/keeper.json`，看到 `<工作区>/keeper.stop` 就退出）。这样从 SSH 里用 `mcp_cli.mjs` 发的 `editor_open_map`、`scene_import_assets`、`playtest_start` 也能操作游戏窗口：内核是桌面里那个进程。2026-10-12 的盲测（另一个 AI 只拿到 `mcp_cli.mjs`，不看仓库）就是这样接的，经过和结论见 `docs/BLIND_TEST_2026-10-12.zh-CN.md`。
- `mcp_round.mjs`：整轮验收（打开底图 → 打包并导入场景 → 设巡逻 → 生成并应用节点图 → 试玩）。`ROUND_ARGS` 里的 `scenes` 是 `examples/kingdom` 下的物件清单文件名，可以给多个，一次导入。
- 找特效编号的两个图生成脚本在 `examples/kingdom`：`gen_fx_probe.py`（把一段编号逐个挂成循环特效，把挂得上的编号打印出来；`ROUND_ARGS` 里 `day` 是起始编号、`night` 是个数）和 `gen_fx_show.py`（把 `fx_looping_ids.json` 里的特效每 2 秒换一个挂在角色身上，配合 `screenshotsAt` 逐个截图）。`src/scene/fx` 里的图就是这样拍的。
- 王国 v3 的三条回归脚本在 `examples/kingdom/kv3_test_economy.json`、`kv3_test_defeat.json`、`kv3_test_victory.json`：把其中一个拷成 `ROUND_ARGS` 指向的文件再跑 `mcp_round.mjs`，对照文件里 `about` 写的日志打印。每轮约 8～9 分钟。

## 物件缩略图（`src/scene/thumbs/<物件编号>.jpg`）

`scene_asset_images` 返回的图是在编辑器里实拍的：把物件按编号摆成网格导进一个空存档，截全屏，再按格子切。重拍步骤：

1. 在千星编辑器里新建并打开一个**专用的空存档**（超限模式，平地）。收起左侧“摆放”面板，滚轮把镜头拉远到大约能看见 40 米宽（标定会量出实际位置，不用精确）。之后**不要再碰镜头**。
2. 在桌面上按 Win+R 运行一个批处理，内容就是用装好依赖的 Python 跑 `thumbs_daemon.py`。它常驻在桌面会话里，轮询 `<临时目录>\thumbs\queue\*.py` 并逐个执行，输出写到同名 `.log`，所以后面的步骤都可以从 SSH 投递（先传成 `.tmp` 再改名成 `.py`）。往 `queue` 里放一个 `stop` 文件让它退出。
3. 标定：投递一个调用 `thumbs_calib_shoot.py <包名>` 的任务。它导入一批标定方块、截图、用 `thumbs_calibrate.py` 求出镜头模型写进 `thumbs_calibration.json`，然后清场。
4. 拍摄：`thumbs_shoot.py plan` 生成批次计划，`thumbs_shoot.py run [起] [止]` 逐批导入、截图、切图、清场。进度看 `<临时目录>\thumbs\shoot.log`；放一个 `<临时目录>\thumbs\stop` 文件可在批次之间停下，再次 `run` 会跳过已拍的批次。每批约 20 个物件、1 分钟。
5. 汇总和补拍：`thumbs_collect.py redo.json 2` 把合格的图拷进 `src/scene/thumbs`，并把不合格的写成补拍清单；`thumbs_shoot.py plan redo.json` 把它们追加成更稀的批次（第二个参数 2 = 隔一个格子放一个，3 = 隔行隔列），再 `run`。重复到清单很短为止。最后不带参数跑一次 `thumbs_collect.py`，结果在 `<临时目录>\thumbs\summary.json`。
6. 抽查：`thumbs_sheet.py <输出.jpg> batch <批次号>` 或 `... ids <编号>...` 拼一张带编号的总览图。`thumbs_cut.py [批次号...]` 可以不重拍、只按保存的截图重新切图（改了切图规则后用）。

文件：`thumbs_lib.py`（导入、框选、删除等公共函数）、`thumbs_build.mjs`（清单 → 资产包）、`thumbs_layout.py`（由标定算格子位置）、`thumbs_calibration.json`（最近一次标定结果）。

实测出来的规矩（脚本里都已经照做）：

- 截图分辨率是 2560×1440。默认镜头是俯角 45° 的透视镜头，世界 +x 朝屏幕下方、+z 朝屏幕右方；滚轮只改变镜头远近。
- **键盘快捷键会带动镜头**：编辑器把 Ctrl+S 里的 S 当成“后退”、Ctrl+A 里的 A 当成“左移”，每按一次镜头就挪一点。所以拍摄期间导入后不存档（`NoSaveRun`），全部拍完再存。滚轮拉远再拉回也不保证回到原位。
- 清场：没有“全选”快捷键。左键在空地上拖动是框选，只选中完全落在框里的物件；按 Delete 删除。两个坑：选区里带上原点的出生点标记时 Delete 不起作用（所以分四个框，都避开原点）；Delete 要求鼠标悬在画面上，而且要按扫描码发扩展键（`Run.key('DELETE')` 不行）。右键菜单里没有删除。
- 图鉴里的尺寸有一部分不准（比实际小很多），按尺寸缩放后这些物件会变得巨大、压住邻居，所以切图按“前景连通块”认物件，并靠补拍收敛。
- 每批放两个雷质小方块当定位标记，拍完核对像素位置；偏得太多脚本会自动重新标定再接着拍。出生点图标自己会上下浮动，不能当定位标记。
- **拍摄期间屏幕分辨率不能变**：脚本里的点击和框选位置都按 2560×1440 写死。远程桌面连上来有时会把分辨率改掉（实测被改成过 3840×2160），之后定位标记全都“找不到”，清场也点不中。发现这种情况先把分辨率改回去再续拍。
- 两个定位标记都找不到时，脚本当作“被这一批里的大物件挡住了”，照旧标定继续切图，不再重新标定（重新标定一次要 3 分钟，而且对这种情况没用）。
- 清场时逐个点选删除，优先点物件本体（不是草绿色的像素）；只点到影子是选不中物件的。
- 2026-10-09 全量结果：2466 个物件里 2398 个有图（约 11.5 MB），68 个没有（放大后和邻居糊在一起 33、拍出来是空的 27、露出屏幕边或被邻居压住 8）。补拍只跑了一轮，最后 3 批因为分辨率被改没有拍。
- `fresh_map_round.mjs`：在一张全新的空白地图上只用 MCP 工具走完整流程（建节点图、设阵营和仇恨、调镜头、做元件、写图、试玩）。用来验证“创作者的新地图不需要任何手工准备”。
- `graph_trials.mjs`：把一批节点图源码依次交给编辑器校验并试玩，记录每张图的节点数和结果。节点数上限等结论是用它测出来的。环境变量 `TRIAL_GRAPH_ID`、`TRIAL_GRAPH_NAME` 指定地图里被替换的那张图，`TRIAL_SECONDS` 是每张图试玩多久（默认 5 秒只看编辑器收不收；设 30 秒可以看服务器让不让它一直跑，结果里有 `levelEndedAt`、`serverMessage`）。
- `gen_load.py <guids.json> <输出目录>`：生成一批“只做一种事”的小图（只计数、平铺算式、循环、遍历实体查位置，各种频率），配合 `graph_trials.mjs` 测服务器的运算量界线。平台规则里那张表就是这样测的。
- `gen_count.py <guids.json> <输出目录>`：测编辑器怎么数节点。每张图是近三千条打印语句加几十份同一种写法，编辑器拒绝时会报出它数到的数，和编译结果里的 `nodeCount` 相减就是这种写法多算了多少。`TRIAL_SECONDS=5` 跑 `graph_trials.mjs` 即可。
- `gen_mem.py`：同一目的的第一版（两千条打印加一百份某种写法，只能看出通过还是被拒）。
- `graph_stats.mjs <工作目录或 build.json>`：打印编译后图的节点数、引脚数、连线数和最多的几种节点；`node_dump.mjs <build.json> <节点类型号>`：打印某一种节点的原始内容。
- 王国的测试脚本（`examples/kingdom/kv3_test_*.json`）现在从空白地图开始：`baseName` 是你在游戏里新建并保存过一次的空白存档的名字（“我的奇域 → 新建存档”，超限模式）。换机器时把它改成自己的存档名。探针脚本（`kv3_probe_*.json`）仍用最初那张旧底图。
- `mcp_round.mjs` 的 `ROUND_REUSE=<上一轮的报告 json>`（2026-10-12）：这一轮的布置（场景、元件、组件、技能、界面，也就是 `ROUND_ARGS` 里除了试玩怎么玩以外的全部）和那一轮一样时，接着那一轮写好的存档，只重写源码变了的图，不开底图、不导场景。布置不一样就照常全做，并在 `warnings` 里说一声。报告里的 `reused`、`graphsWritten` 说明这一轮是不是接着跑的、写了几张图。可以每轮成功后把报告另存一份，下一轮拿它当 `ROUND_REUSE`。`ROUND_GRAPH_BATCH` 是一次 `write_graphs` 发几张图（默认 60）；`MILIASTRA_WRITE_ONE_BY_ONE=1` 让 `write_graphs` 退回逐张编译，用来对照。
- `regress_rounds.mjs <清单> [汇总.jsonl]`（2026-10-14）：把清单里的测试 json 一轮接一轮跑完，每轮记一行（有没有报错、`expect` 过没过、最后几条标记性的打印、迟到的按键数、有没有看到结算界面），最后给出 PASS / RAN / FAIL。没写 `expect` 的测试只能算 RAN：要对着它 `about` 里写的打印看最后的标记（`kingdom4` 走错站点那次就是“跑完了、没报错”，只有标记看得出来）。`regress_core.txt` 是改了试玩执行器之后该跑的八轮（先跑靠按键走位的）。要在游戏所在的桌面会话里跑，`ROUND_DRY=1` 时只演练。
- `mcp_round.mjs` 不只跑王国：试玩脚本里的 `dir` 指定 `examples` 下的文件夹，`namePrefix` 指定要把哪些摆件的编号交给生成脚本。
- `secdump.mjs <存档.gil> <段号[,段号]> [行数]`：把存档里某一段按字段层层展开打印出来；`seccmp.mjs <甲.gil> <乙.gil>`：列出两份存档哪些段不一样。找“某个编辑器设置存在哪个字段”时，先在编辑器里只改这一项、存一份，再用这两个脚本对比（负载需求档位、仇恨类型、阵营关系都是这样找到的）。
- `prefab_diff.mjs <存档.gil> <元件A编号> <元件B编号> [f8]`：逐字段比较两个元件模板（第 4 段）；`comp_table.mjs <存档.gil>…`：统计元件模板 `f8` 里通用组件的种类码、内容字段和标签。对照表在 `knowledge/notes/component-codes.zh-CN.md`。官方教学存档在 `knowledge/samples/gil/`，`knowledge/samples/kb_dump.mjs` 把它们拆成 JSON（要放在仓库根目录跑）。
- `comp_dump.mjs <种类码> <存档.gil>…`：把某一种通用组件在所有存档里的写法展开打印并去重（碰撞触发器 5、选项卡 17、自定义变量 1 的字段含义就是这样比出来的）；`mount_dump.mjs <存档.gil> <实体或元件编号>…`：打印节点图挂载记录。
- `mcp_round.mjs` 新参数：`components`（一组 `scene_add_components` 的参数）、`graphs`（多张图，每张 `{key, name, attachTo | attachToPrefab}`；生成脚本对每张图各跑一次，最后一个参数是 key；每张图一个项目，接着上一张的存档做）。范例 `examples/events/events_test.json`。
- `ui_dump.mjs <存档.gil> [行宽]`：把存档第 9 段（界面）压成每条记录一行，布局、控件库、模板和控件之间怎么引用一眼能看出来（进度条工具就是照这个写的）。`mcp_round.mjs` 的 `bars` 参数是一组 `scene_add_progress_bar` 的参数。
- `mcp_round.mjs` 又加的参数：`statuses`（一组 `scene_add_unit_status` 的参数）、`environments`（一组 `scene_add_environment` 的参数），它们的编号以 `status:<名字>`、`environment:<名字>`、`environment:default` 交给生成脚本；`graphs` 里的图可以带 `kind`（客户端图），组件里选项的 `filterGraph: "<图的 key>"` 会换成那张过滤器图的编号。环境变量 `ROUND_DRY=1` 是演练：不打开编辑器、不导入场景、不试玩，其余步骤照常，用来在不开游戏时把整轮的参数错误先抓出来。
- `examples/checks`：验证关卡，把离线写的工具放在一轮里实机检查（跟随的金币、靠近时描边的路牌和小地图标识、带过滤器的选项、会升起的门、夜晚环境）。跑法和别的样例一样：`ROUND_ARGS` 指向 `examples\checks\checks_test.json`，跑 `mcp_round.mjs`。
- `graph_headers.mjs <存档.gil>`：列出每张节点图的类型、编号和资源库登记；`f100.mjs`：看客户端图的标记字段和空图的样子；`sec_line.mjs <存档.gil> <段号>`：把某一段压成一行一条记录。
