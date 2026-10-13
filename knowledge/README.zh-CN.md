# 知识库：千星奇域是怎么搭游戏的

这个目录是给 AI（和人）用的，目的是**不用再去翻官方网站**就能知道千星奇域提供了哪些系统、每个系统怎么配、官方自己是怎么把它们拼成一个玩法的。

MCP 里对应的工具：`search_knowledge`（全文搜索，返回命中的段落）、`read_knowledge`（按页面 ID 读整页或某一节）；资源 `miliastra://knowledge` 是索引。

先读的总结：[`../docs/HOW_MILIASTRA_BUILDS_GAMES.zh-CN.md`](../docs/HOW_MILIASTRA_BUILDS_GAMES.zh-CN.md)——系统清单、官方的组织方式、我们的工具覆盖到哪。

## 目录

| 目录 | 内容 | 来源 |
|---|---|---|
| `official/guide/` | 综合指南 219 页（界面介绍、概念介绍、全部节点介绍、附录），约 105 万字 | 奇匠学院 https://act.mihoyo.com/ys/ugc/tutorial/ ，2026-10-10 抓取 |
| `official/course/` | 教程 84 页：编辑器通识、基础功能 12 课、进阶实例 21 课、《农场乱斗》案例、新手视频课的文字说明 | 同上 |
| `official/faq/` | 常见问题 12 页 | 同上 |
| `samples/gil/` | 教程附带的 50 份官方教学存档原文件 | 同上（教程页面的“辅助课件”） |
| `samples/dump/` + `samples/README.zh-CN.md` | 用 `samples/kb_dump.mjs` 把教学存档拆成 JSON：实体、挂的图、每张图的节点和连线；README 是人读的汇总 | 自己拆的 |
| `transcripts/` | 官方教学视频的文字稿（本机 Whisper 转写，有错字，关键名词已按教程校正） | 同上 |
| `notes/` | 我们自己验证过的补充（和 `docs/PLATFORM_RULES.zh-CN.md` 分工：那边是实测出来的规则，这里是从官方资料整理的） | 自己写的 |
| `../examples/<名字>/WALKTHROUGH.md` | 我们自己的样例的全过程：一次只用 MCP 工具的整轮运行里，每一步工具调用（带参数和返回的编号）和每张节点图的源码。搜索时是 `examples` 这一栏，页面编号 `example-<名字>`（`example-events` 最小，`example-kingdom4` 是一整个带昼夜和敌人的游戏，`example-hop` 是平台跳跃闯关，`example-farm` 是采集经营，`example-checks` 每个新工具用一次，`example-skills` 是三个带动画的技能，`example-shop` 是货币、道具和商店，`example-drops` 是掉落物和战利品，`example-buttons` 是屏幕上的按钮，`example-strike` 是挥剑打箱子和怪、掉战利品，`example-raid` 是第四个游戏：打怪、捡战利品、卖钱买钥匙、开门，`example-potion` 是从背包里使用道具，`example-shoot` 是技能发射投射物） | `scripts/dev/write_walkthrough.mjs` 从运行记录生成，不要手改 |

每个官方页面的文件名就是官方页面 ID，页首写了它在官方目录里的位置；`official/*/INDEX.md` 是目录树。正文里的图片仍指向官方 CDN（节点图截图、界面截图都在图里，要看图时按链接取）。

## 版权

`official/` 和 `samples/gil/` 是米哈游的资料，只在本仓库内部作参考，不要单独再分发。
