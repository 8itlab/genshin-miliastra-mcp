# FurinyaWorks 资产维护入口

维护仓库：https://github.com/FurinyaWorks/genshin-miliastra-mcp 。上游保留为 upstream；只维护这一份 Fork。

2026-11-07 本轮客户端 config.ini 为 game_version=7.2.0、wpf_version=7.2.0.49085326。新增目录记录来自官方编辑器当轮面板，不声称每项首次加入版本就是7.2。原目录2468项保留。证据及输入在 docs/evidence/7.2，逐批来源、哈希在 src/scene/asset-updates。游戏素材权利属于原权利人；原 CC BY 4.0 数据署名保持。

本轮新增11项可通过 scene_search_assets 查询。秘源机兵·寻捕械30008015已有本轮官方手摆种子及MCP生成包的官方导入/存档读回证据，查询返回placementStatus=candidate-only，scene_build_blocks可生成候选；实际试玩与决策图仍未验收。其余10项返回unverified并拒绝构建，避免导出静态空怪物。

含手摆和MCP生成秘源机兵的同一测试地图已进入并离开试玩，图中模型出现。截图未单独观察生成坐标处的实体，不证明生成实体独立spawn或动作效果。到授权窗口结束时日志收集尚未完成，已停止采集器；无完整日志/ready结论，candidate-only状态保留。见30008015-startup.json。

creature_animations {creature:30008015} 已接入4项：8015003虚弱1.66秒、8015004攻击_02_受击_前摇1.76秒、8015006攻击_02_受击_后摇6.08秒、8015016攻击_01 3.96秒。编号从官方保存的技能记录读回，时长来自官方时间轴截图，标记列表不完整；没有宣称动作实战验证。

## 隔离接入

克隆 Fork，检出交付提交，运行 npm ci 和 npm run build:core；入口为 node src/server.mjs。Windows 需允许本地仓库脚本执行；本轮使用进程环境 PSExecutionPolicyPreference=Bypass（仅此进程及子进程，不改系统策略）执行已检查的 src/host/private-runtime.ps1。

在 Agent 的 MCP 配置新增独立名称 miliastra-furinya，command=node，args 为此副本 src/server.mjs 的绝对路径。env 设置独立 MILIASTRA_WORKSPACE、MILIASTRA_ALLOW_LIVE_WRITE=0、MILIASTRA_PYTHON 和 MILIASTRA_PLAYTEST_PYTHON 为本机 Python3.12。不要复用旧服务 workspace，不覆盖旧进程。重启选择新版的 Agent 会话后读 miliastra://workflow 与 miliastra://platform-rules。

本机隔离副本：F:/New folder/worktrees/miliastra-assets。旧D:/MiliastraTools安装保留，既有进程继续原版本；新会话加载新版需重启其MCP连接。用户级配置的实际切换状态以本轮交付说明为准。

2026-11-07已将C:/Users/Administrator/.codebuddy/mcp.json中miliastra后续会话入口切到上述副本，独立工作区workspace-furinya-20261107-v2，liveWrite=0。原配置备份为同目录mcp.json.before-furinya-20261107-v2；未终止旧MCP或改写旧安装。其他客户端尚需按前述说明配置。

## 增量更新

先阅读 scripts/dev/README.md；复用 listscrape/listparse、animscrape/animparse 和 thumbs 采集器。桌面脚本只在当轮授权窗口内运行。只抄新增项；OCR不确定编号须用官方面板或存档读回核实。采集 JSON 格式见 docs/evidence/7.2/capture.json。

运行 node scripts/dev/update-assets.mjs capture.json 预览；加 --apply 写本隔离副本真实目录。要求版本、来源、授权和现存证据，拒绝同ID字段冲突；重复输入不重复添加。先记录 prepared 账本、原子替换目录，再将账本记 applied；中断后用同一输入恢复。单写者运行，勿同时维护同一目录。

验证 node tests/asset-update.mjs、npm run test:assets、node tests/media-catalog.mjs、node tests/mcp-asset-update.mjs。资源变更后使用新工作区或关闭本隔离服务全部客户端再启动；不能依赖运行中目录缓存热更新。正式解除catalogOnly前，必须补官方种子、候选导入及当前客户端试玩证据。

采官方底盘：在专用测试副本手摆并保存一个目标造物，将官方GIL复制到工作区，运行 node scripts/dev/extract-creature-seed.mjs copied.gil 30008015 out.json；提取器要求双模板ID一致、唯一实体、战斗组件及运行时记录，原样保留protobuf字节。独立对照原始存档后加入monster-seeds，先以candidate-only生成包并官方导入读回，不能拿无warning当实机通过。范例scene_build_blocks参数：{"name":"Asset72SeedProbe","blocks":[{"template":30008015,"name":"SecretSourceGenerated","position":[9,0,0],"scale":1}],"install":false}。

同步：git fetch upstream；在独立分支合入 upstream/main（以实际默认分支为准），跑同一组验证后提交自有 Fork PR。发布前保留 MIT、THIRD_PARTY_NOTICES.md 和每批原始来源。不得把本轮目录更新当作完整7.1/7.2采集完成。
