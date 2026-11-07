# FurinyaWorks 资产维护入口

维护仓库：https://github.com/FurinyaWorks/genshin-miliastra-mcp 。上游保留为 upstream；只维护这一份 Fork。

2026-11-07 本轮客户端 config.ini 为 game_version=7.2.0、wpf_version=7.2.0.49085326。新增目录记录来自官方编辑器当轮面板，不声称每项首次加入版本就是7.2。原目录2468项保留。证据及输入在 docs/evidence/7.2，逐批来源、哈希在 src/scene/asset-updates。游戏素材权利属于原权利人；原 CC BY 4.0 数据署名保持。

本轮新增项可通过 scene_search_assets 查询。catalogOnly 项的名称/编号/分类已观测，官方种子、技能动作、时长和实际试玩尚未验证；查询返回 placementStatus=unverified，scene_build_blocks 拒绝这类条目，避免导出静态空怪物。截图是官方元件预览，不代表关卡 ready。没有补造动作编号或时长。

## 隔离接入

克隆 Fork，检出交付提交，运行 npm ci 和 npm run build:core；入口为 node src/server.mjs。Windows 需允许本地仓库脚本执行；本轮使用进程环境 PSExecutionPolicyPreference=Bypass（仅此进程及子进程，不改系统策略）执行已检查的 src/host/private-runtime.ps1。

在 Agent 的 MCP 配置新增独立名称 miliastra-furinya，command=node，args 为此副本 src/server.mjs 的绝对路径。env 设置独立 MILIASTRA_WORKSPACE、MILIASTRA_ALLOW_LIVE_WRITE=0、MILIASTRA_PYTHON 和 MILIASTRA_PLAYTEST_PYTHON 为本机 Python3.12。不要复用旧服务 workspace，不覆盖旧进程。重启选择新版的 Agent 会话后读 miliastra://workflow 与 miliastra://platform-rules。

本机隔离副本：F:/New folder/worktrees/miliastra-assets。旧 D:/MiliastraTools 安装和用户级配置未改，既有会话继续旧版；新会话需主动选择此入口。

## 增量更新

先阅读 scripts/dev/README.md；复用 listscrape/listparse、animscrape/animparse 和 thumbs 采集器。桌面脚本只在当轮授权窗口内运行。只抄新增项；OCR不确定编号须用官方面板或存档读回核实。采集 JSON 格式见 docs/evidence/7.2/capture.json。

运行 node scripts/dev/update-assets.mjs capture.json 预览；加 --apply 写本隔离副本真实目录。要求版本、来源、授权和现存证据，拒绝同ID字段冲突；重复输入不重复添加。先记录 prepared 账本、原子替换目录，再将账本记 applied；中断后用同一输入恢复。单写者运行，勿同时维护同一目录。

验证 node tests/asset-update.mjs、npm run test:assets、node tests/media-catalog.mjs，再用 scripts/dev/mcp_cli.mjs 调真实 scene_search_assets。资源变更后使用新工作区或关闭本隔离服务全部客户端再启动；不能依赖运行中目录缓存热更新。正式解除 catalogOnly 前，必须补官方种子、候选导入及当前客户端试玩证据。

同步：git fetch upstream；在独立分支合入 upstream/main（以实际默认分支为准），跑同一组验证后提交自有 Fork PR。发布前保留 MIT、THIRD_PARTY_NOTICES.md 和每批原始来源。不得把本轮目录更新当作完整7.1/7.2采集完成。
