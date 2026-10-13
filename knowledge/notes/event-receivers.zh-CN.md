# 事件由哪张图收到

来源：官方综合指南“节点介绍 / 服务器节点 / 事件节点”一页里每个事件的说明，用自己的话归类；“实测”一栏是我们在游戏里确认过的。2026-10-11 整理。

为什么要有这一页：监听挂错了地方不会报错，只是永远收不到。10 月 11 日凌晨我把道具的三个事件挂在角色模板和玩家模板上，查了几轮“为什么不触发”，其实官方写明它们只发给道具自己的图。**写监听之前先在这里查它发给谁。**

## 只有关卡实体收得到

| 事件 | 源码里的名字 | 说明 | 实测 |
|---|---|---|---|
| 实体销毁时 | `whenEntityIsDestroyed` | 物件、造物被销毁；带位置、阵营等 | ✅ `examples/strike`、`examples/raid` |
| 实体移除/销毁时 | `whenEntityIsRemovedDestroyed` | 任何实体被移除或销毁；只带 GUID | — |

## 发给“这张图挂着的那个实体”

事件说的是谁的事，就在谁身上的图里收。

| 事件 | 源码里的名字 | 说明 | 实测 |
|---|---|---|---|
| 实体创建时 | `whenEntityIsCreated` | 每个实体自己出现的那一刻 | ✅ |
| 自定义变量变化时 | `whenCustomVariableChanges` | 持有这个变量的实体 | ✅ |
| 预设状态变化时 | `whenPresetStatusChanges` | 状态变了的那个物件 | ✅ `examples/presets` |
| 定时器触发时 | `whenTimerIsTriggered` | 启动定时器时指定的那个实体 | ✅ |
| 全局计时器触发时 | `whenGlobalTimerIsTriggered` | 持有计时器的实体（关卡实体或玩家） | ✅ |
| 进入 / 离开碰撞触发器时 | `whenEnteringCollisionTrigger` / `whenExitingCollisionTrigger` | 带触发器的那个实体 | ✅ |
| 选项卡选中时 | `whenTabIsSelected` | 带选项卡的那个实体；事件里有选的人 | ✅ |
| 受到攻击时 | `whenAttacked` | 挨打的实体（要有受击盒） | ✅ `examples/strike` |
| 攻击命中时 | `whenAttackHits` | 打人的实体 | — |
| 被恢复生命值时 / 发起恢复生命值时 | `whenHpIsRecovered` / `whenInitiatingHpRecovery` | 被治疗的 / 发起治疗的 | — |
| 基础运动器停止时、路径到达路点时 | — | 带运动器的实体；路点要勾“到达发送事件” | — |
| 命中检测触发时 | `whenOnHitDetectionIsTriggered` | 带命中检测组件的实体 | — |
| 单位状态结束时 / 变更时 | — | 带这个状态的实体 | — |
| 实体阵营变化时 | — | 阵营变了的实体 | — |
| 商店出售自定义商品时 | `whenCustomShopItemIsSold` | 带商店组件的实体（摊位） | ✅ `examples/shop` |
| 商店出售背包物品时 | `whenSellingInventoryItemsInTheShop` | 同上；只对“卖摊主背包里的东西”那种商店 | 自定义列表的商店不触发（实测） |
| 商店收购道具时 | `whenSellingItemsToTheShop` | 同上 | ✅ `examples/shop` |
| 背包货币数量变化时 | `whenTheQuantityOfInventoryCurrencyChanges` | 背包的持有者（我们的工具把背包放在角色上，所以是角色） | ✅ |
| 文本气泡完成时 | — | 带文本气泡组件、说完话的实体 | — |
| 造物抵达巡逻路点时 | — | 造物自己；路点要勾发送事件 | — |
| 仇恨目标变化时、自身入战 / 脱战时 | — | 造物自己；只在自定义仇恨模式 | — |
| 造物入战 / 脱战时 | — | 造物自己；只在经典仇恨模式 | — |

## 只有角色身上的图收得到

| 事件 | 源码里的名字 | 实测 |
|---|---|---|
| 技能节点调用时 | `whenSkillNodeIsCalled` | ✅ 技能图【通知服务器节点图】之后，角色模板上的图收到。复杂造物放造物技能时，是挂在那只造物自己身上的图收到（`examples/brain`） |
| 角色倒下时 / 复苏时 | `whenTheCharacterIsDown` 等 | — |
| 角色移动速度达到条件时 | — | 要先给角色加“监听移动速率”的单位状态 |

## 只有玩家身上的图收得到

| 事件 | 源码里的名字 | 实测 |
|---|---|---|
| 界面控件组触发时 | `whenUiControlGroupIsTriggered` | ✅ `examples/buttons`；只有按下按钮的那个玩家收到 |
| 玩家所有角色倒下时 / 复苏时 | `whenAllPlayerSCharactersAreDown` 等 | — |
| 玩家异常倒下并复苏时 | `whenPlayerIsAbnormallyDownedAndRevives` | — |
| 玩家传送完成时 | — | — |
| 卡牌选择器完成时 | — | — |
| 悬浮交互页操作触发时 | — | 控件要开“返回服务器事件” |
| 操控运动器的三个事件 | — | — |

## 只有道具自己的道具节点图收得到

道具节点图用 `scene_add_graph {kind:"item"}` 新建，由道具引用（`scene_add_item` 的 `useGraphId`），源码 `g.server({id, name, type:'item'})`。

| 事件 | 源码里的名字 | 实测 |
|---|---|---|
| 背包道具新增时 | `whenItemIsAddedToInventory` | ✅ `examples/potion`；只在这种道具从无到有时触发 |
| 背包道具失去时 | `whenItemIsLostFromInventory` | —；数量变成 0 时 |
| 背包道具数量变化时 | `whenTheQuantityOfInventoryItemChanges` | ✅ `examples/potion` |
| 背包内道具被使用时 | `whenItemsInTheInventoryAreUsed` | ✅ `examples/potion` |
| 装备初始化 / 穿戴 / 卸下 / 词条数值改变时 | — | —；装备我们还没做 |

## 只有职业节点图收得到

玩家职业更改时、职业等级变化时、职业解除时：发给对应的玩家，在职业节点图里收。职业节点图我们还没做。

## 全局的

监听信号（`.onSignal(...)`）：任何服务器图都能收，发的人用 `f.sendSignal`。✅ `examples/kingdom4`、`examples/farm`。
