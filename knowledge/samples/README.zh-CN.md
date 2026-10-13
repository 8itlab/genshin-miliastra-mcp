# 官方教学存档拆解（48 份）

`gil/` 是教程页面附带的官方教学存档原文件（.gil / .gia），`dump/` 是用 `scripts/dev/kb_dump.mjs` 拆出来的 JSON：每个实体的名字、物件编号、挂的图，每张图的节点名（英文，来自编译器自带的节点表）和连线。
下面每份存档列出：图名、节点数、挂在哪些实体上、用了哪些事件。看完就知道官方是怎么组织一个玩法的。

## 共同的规律

- 一份存档里有很多张**小图**（2～50 个节点），按“谁的事”命名：`物件-种植格-可操作`、`玩家-拾取工具`、`角色-使用/放下工具`。
- 图**挂在当事的实体上**：金币的图挂在每一个金币上（30 个金币共用一张图）、玩家的图挂在玩家模板（9 个玩家位）、角色的图挂在角色模板；只有“实体被销毁”“全局计时器”这类全局事件才挂在关卡实体上。
- 全部**事件驱动**，没有一张图是定时轮询整个场景的。最常用的事件：选项卡选中、进入/离开碰撞触发器、自定义变量变化、定时器触发、技能节点调用（客户端技能图通知服务器）。
- 状态存在当事实体的**自定义变量**上（玩家身上记“拿的工具”“积分”，土地身上记“等级”“是否可采集”），改变量时顺便触发“自定义变量变化时”让别的图响应。
- 跨实体通知用**信号**（一发多收），不是在一张图里直接操作别的实体。

## 特效

教程页：基础功能逻辑&玩法流程/2.5特效——让效果更丰富；实体 13 个，图 1 张。

- **功能示例-2 点火机关**（5 节点）挂在：功能示例-2 触发机关；事件：When Tab Is Selected

## 角色扰动装置

教程页：基础功能逻辑&玩法流程/2.9角色扰动装置——让角色受到持续或瞬间力的作用；实体 13 个，图 4 张。

- **功能示例-1 弹弹菇**（4 节点）挂在：功能演示-1 弹弹菇；事件：When Entering Collision Trigger, When Exiting Collision Trigger
- **功能示例-2 切换阵营-发服务器信号**（2 节点）挂在：（客户端图或未挂载）；事件：无
- **功能示例-2 切换阵营**（8 节点）挂在：默认模版(角色编辑)；事件：When Skill Node Is Called
- **功能示例-2 阵营1玩家可使用**（5 节点）挂在：（客户端图或未挂载）；事件：无

## 技能设置

教程页：基础功能逻辑&玩法流程/2.8技能设置——让角色能攻击；实体 15 个，图 3 张。

- **功能示例-1：普通攻击**（5 节点）挂在：（客户端图或未挂载）；事件：无
- **功能示例-2：召唤**（4 节点）挂在：默认模版(角色编辑)；事件：When Skill Node Is Called
- **功能示例-2：召唤小怪**（2 节点）挂在：（客户端图或未挂载）；事件：无

## 铭牌与气泡对话

教程页：玩法功能进阶实例/3.11铭牌与气泡对话——场景界面中更丰富的信息展示样式；实体 12 个，图 1 张。

- **功能示例3：交互后开启气泡对话**（2 节点）挂在：功能示例3；事件：When Tab Is Selected

## 掉落物、道具、背包

教程页：玩法功能进阶实例/3.14掉落物、道具、背包——制作一个可掉落且能使用的道具；实体 13 个，图 2 张。

- **碰撞后销毁**（3 节点）挂在：雀雀球20001881；事件：When Entering Collision Trigger
- **禽肉恢复生命**（7 节点）挂在：（客户端图或未挂载）；事件：When Inventory Item Is Used

## 信号

教程页：新手入门系列视频教程/建成我的第一个奇域/信号；实体 128 个，图 7 张。

- **平台拉杆发送信号**（8 节点）挂在：平台拉杆×2；事件：When Tab Is Selected
- **平台接收信号**（4 节点）挂在：平台, 平台拉杆；事件：无
- **踏板发送信号**（3 节点）挂在：踏板；事件：When Entering Collision Trigger
- **大门接收信号**（5 节点）挂在：大门；事件：无
- **开门拉杆发送信号**（4 节点）挂在：开门拉杆；事件：When Tab Is Selected
- **打开宝箱**（2 节点）挂在：宝箱；事件：When Tab Is Selected
- **传送至起点**（4 节点）挂在：空模型；事件：When Entering Collision Trigger

## 货币与商店

教程页：玩法功能进阶实例/3.16货币与商店——制作可以买卖道具的商店；实体 13 个，图 1 张。

- **打开商店**（4 节点）挂在：摊位铺；事件：When Entering Collision Trigger

## 复杂造物

教程页：玩法功能进阶实例/3.19复杂造物——通过状态决策触发自定义造物技能；实体 14 个，图 6 张。

- **普通攻击_状态**（4 节点）挂在：（客户端图或未挂载）；事件：无
- **丘丘霜铠王**（2 节点）挂在：（客户端图或未挂载）；事件：无
- **新建节点图**（0 节点）挂在：（客户端图或未挂载）；事件：无
- **普通攻击**（5 节点）挂在：（客户端图或未挂载）；事件：无
- **巡逻**（2 节点）挂在：（客户端图或未挂载）；事件：无
- **打手丘丘人**（2 节点）挂在：（客户端图或未挂载）；事件：无

## 玩家订阅

教程页：奇匠订阅；实体 12 个，图 1 张。

- **发放武器**（6 节点）挂在：领取武器；事件：When Tab Is Selected

## 自定义挂接点

教程页：玩法功能进阶实例/3.4自定义挂接点——可跟随移动、旋转的预设点；实体 12 个，图 2 张。

- **功能示例2-拾取工具**（5 节点）挂在：功能示例1 工具-耙子；事件：When Tab Is Selected
- **功能示例2-玩家拾取工具后的表现**（7 节点）挂在：默认模版×9；事件：When Custom Variable Changes S<T:Str>

## 耕种-采集流程

教程页：项目案例实战/4.1派对小游戏：《农场乱斗》/4.1.1《农场乱斗》耕种-采集流程；实体 21 个，图 13 张。

- **物件-种植格-可操作**（11 节点）挂在：队伍1-种植格×4, 队伍2-种植格；事件：When Entering Collision Trigger, When Exiting Collision Trigger
- **物件-种子-拾取/切换种子**（23 节点）挂在：工具-种子×2；事件：When Tab Is Selected
- **物件-耙子-拾取/切换耙子**（20 节点）挂在：工具-耙子；事件：When Tab Is Selected
- **物件-水壶-拾取/切换水壶**（20 节点）挂在：工具-水壶；事件：When Tab Is Selected
- **使用工具**（2 节点）挂在：（客户端图或未挂载）；事件：无
- **角色-使用/放下工具**（51 节点）挂在：默认模版(角色编辑)；事件：When Skill Node Is Called
- **放下工具**（2 节点）挂在：（客户端图或未挂载）；事件：无
- **玩家-拾取工具**（9 节点）挂在：默认模版×9；事件：When Custom Variable Changes S<T:Str>
- **玩家-种子到达使用上限**（15 节点）挂在：默认模版×9；事件：When Custom Variable Changes S<T:Int>
- **物件-种植格-种子成长**（24 节点）挂在：队伍1-种植格×4, 队伍2-种植格；事件：When Custom Variable Changes S<T:Int>, When Timer Is Triggered
- **物件-种植格-采集果实**（20 节点）挂在：队伍1-种植格×4, 队伍2-种植格；事件：When Entering Collision Trigger
- **玩家-采集果实**（9 节点）挂在：（客户端图或未挂载）；事件：When Custom Variable Changes S<T:Int>
- **物件-果实商-提交果实**（8 节点）挂在：果实商；事件：When Entering Collision Trigger

## 能力单元

教程页：玩法功能进阶实例/3.9能力单元——具有预设属性的战斗组件；实体 13 个，图 2 张。

- **棘刺造成伤害**（2 节点）挂在：荆棘；事件：When Entering Collision Trigger
- **持续回血**（9 节点）挂在：回血平台；事件：When Entering Collision Trigger, When Exiting Collision Trigger, When Timer Is Triggered

## 基础运动

教程页：基础功能逻辑&玩法流程/2.4基础运动——让物体动起来；实体 14 个，图 1 张。

- **功能示例-2：开门、关门**（12 节点）挂在：元件B-触发物；事件：When Entering Collision Trigger, When Exiting Collision Trigger

## 阵营设置

教程页：基础功能逻辑&玩法流程/2.7阵营设置——标签判断与攻击逻辑；实体 15 个，图 1 张。

- **新建节点图**（5 节点）挂在：功能示例-2 阵营切换台；事件：When Tab Is Selected

## 信号通信

教程页：玩法功能进阶实例/3.6信号通信——一对多的信号广播，触发多物体产生不同行为；实体 16 个，图 7 张。

- **接受信号1**（3 节点）挂在：柱子1；事件：无
- **接受信号2**（3 节点）挂在：柱子2；事件：无
- **接受信号3**（3 节点）挂在：柱子3；事件：无
- **全局发出信号**（5 节点）挂在：触发点；事件：When Entering Collision Trigger
- **指定跟随对象**（4 节点）挂在：跟随物体；事件：无
- **新建过滤器节点图**（1 节点）挂在：（客户端图或未挂载）；事件：无
- **新建技能节点图**（2 节点）挂在：（客户端图或未挂载）；事件：无

## 制作我的第一个奇域组件_-_文本框

教程页：新手入门系列视频教程/制作我的第一个奇域组件/元件的制作；实体 16 个，图 2 张。

- **元件—交互拾取得分**（6 节点）挂在：金币×5；事件：When Entering Collision Trigger
- **玩家—结算奇域**（7 节点）挂在：默认模版×9；事件：When Custom Variable Changes S<T:Int>

## 制作我的第一个奇域组件_-_进度条

教程页：新手入门系列视频教程/制作我的第一个奇域组件/元件的制作；实体 16 个，图 2 张。

- **元件—交互拾取得分**（6 节点）挂在：金币×5；事件：When Entering Collision Trigger
- **玩家—结算奇域**（7 节点）挂在：默认模版×9；事件：When Custom Variable Changes S<T:Int>

## 自定义变量

教程页：玩法功能进阶实例/3.1自定义变量——特定条件下，切换物体表现状态；实体 12 个，图 1 张。

- **物件-种植格-种植升级**（21 节点）挂在：种植格；事件：When Tab Is Selected

## 卡牌选择器

教程页：玩法功能进阶实例/3.12卡牌选择器——制作选择弹窗与选项卡片；实体 12 个，图 3 张。

- **功能示例2：卡片4选2效果**（20 节点）挂在：默认模版×9；事件：When Deck Selector Is Complete
- **功能示例1：点击按钮，打开3选1弹窗；卡片3选1效果**（16 节点）挂在：默认模版×9；事件：When Deck Selector Is Complete, When UI Control Group Is Triggered
- **功能示例2：打开宝箱，打开4选2弹窗**（8 节点）挂在：功能示例2 打开宝箱，打开4选2弹窗；事件：When Tab Is Selected

## 字典与结构体

教程页：玩法功能进阶实例/3.13字典与结构体——具有映射关系的数据结构；实体 18 个，图 2 张。

- **功能示例-1：根据拾取物品增长积分值**（10 节点）挂在：禽肉, 松茸, 鱼切片, 果实堆；事件：When Entering Collision Trigger
- **功能示例-2：根据拾取的装备获得对应的属性加成**（12 节点）挂在：功能示例2：1级大剑, 功能示例2：2级大剑, 功能示例2：3级大剑；事件：When Entering Collision Trigger

## 建成我的第一个奇域

教程页：新手入门系列视频教程/建成我的第一个奇域/ 关卡导出；实体 314 个，图 18 张。

- **玩家—结算奇域**（13 节点）挂在：默认模版×9；事件：When Custom Variable Changes S<T:Int>
- **元件—交互拾取得分**（6 节点）挂在：金币×30；事件：When Entering Collision Trigger
- **普通攻击**（7 节点）挂在：（客户端图或未挂载）；事件：无
- **启动石板**（12 节点）挂在：控制机关；事件：When Tab Is Selected
- **石板坍塌**（7 节点）挂在：石板×5；事件：When Entering Collision Trigger, When Timer Is Triggered
- **点燃火炬**（7 节点）挂在：火炬×4；事件：When Tab Is Selected
- **获得战斗能力**（8 节点）挂在：武器；事件：When Entering Collision Trigger
- **等级提升到40**（6 节点）挂在：关卡实体；事件：When Entity Is Destroyed
- **等级提升到90**（5 节点）挂在：关卡实体；事件：When Entity Is Destroyed
- **解除宝箱封印**（7 节点）挂在：关卡实体；事件：When Entity Is Destroyed
- **打开宝箱**（5 节点）挂在：宝箱；事件：When Tab Is Selected
- **解锁武器**（9 节点）挂在：默认模版×9；事件：When Custom Variable Changes S<T:Int>
- **开启木门**（2 节点）挂在：门；事件：When Tab Is Selected
- **拾取钥匙激活门**（8 节点）挂在：（客户端图或未挂载）；事件：When Tab Is Selected
- **退出奇域**（4 节点）挂在：退出奇域装置；事件：When Tab Is Selected
- **弹窗-奇域说明**（6 节点）挂在：空模型；事件：When Entering Collision Trigger, When Exiting Collision Trigger
- **文本框-寻找武器**（6 节点）挂在：空模型；事件：When Entering Collision Trigger, When Exiting Collision Trigger
- **文本框-寻找钥匙**（6 节点）挂在：空模型；事件：When Entering Collision Trigger, When Exiting Collision Trigger

## 描边与透视

教程页：玩法功能进阶实例/3.18描边与透视——实体更丰富的指引表现效果；实体 16 个，图 1 张。

- **功能示例1 进入/离开时，添加/移除单位状态**（4 节点）挂在：锤子, 铲子, 锄头；事件：When Entering Collision Trigger, When Exiting Collision Trigger

## 操作提示与反馈

教程页：项目案例实战/4.1派对小游戏：《农场乱斗》/4.1.2《农场乱斗》操作提示与反馈；实体 21 个，图 15 张。

- **物件-种植格-可操作**（11 节点）挂在：队伍1-种植格×4, 队伍2-种植格；事件：When Entering Collision Trigger, When Exiting Collision Trigger
- **物件-种子-拾取/切换种子**（23 节点）挂在：工具-种子×2；事件：When Tab Is Selected
- **物件-耙子-拾取/切换耙子**（20 节点）挂在：工具-耙子；事件：When Tab Is Selected
- **物件-水壶-拾取/切换水壶**（20 节点）挂在：工具-水壶；事件：When Tab Is Selected
- **使用工具**（2 节点）挂在：（客户端图或未挂载）；事件：无
- **角色-使用/放下工具**（53 节点）挂在：默认模版(角色编辑)；事件：When Skill Node Is Called
- **放下工具**（2 节点）挂在：（客户端图或未挂载）；事件：无
- **玩家-拾取工具**（23 节点）挂在：默认模版×9；事件：When Custom Variable Changes S<T:Str>
- **玩家-种子到达使用上限**（20 节点）挂在：默认模版×9；事件：When Custom Variable Changes S<T:Int>
- **物件-种植格-种子成长**（24 节点）挂在：队伍1-种植格×4, 队伍2-种植格；事件：When Custom Variable Changes S<T:Int>, When Timer Is Triggered
- **物件-种植格-采集果实**（20 节点）挂在：队伍1-种植格×4, 队伍2-种植格；事件：When Entering Collision Trigger
- **玩家-采集果实**（12 节点）挂在：默认模版×9；事件：When Custom Variable Changes S<T:Int>
- **物件-果实商-提交果实**（12 节点）挂在：果实商；事件：When Entering Collision Trigger
- **玩家-放下/切换工具**（7 节点）挂在：默认模版×9；事件：When Custom Variable Changes S<T:Bol>
- **玩家-增加选项框**（4 节点）挂在：默认模版×9；事件：When Custom Variable Changes S<T:Ety>

## 镜头设置

教程页：基础功能逻辑&玩法流程/2.3镜头设置——不同视角下的游戏；实体 12 个，图 1 张。

- **功能示例-2：切换镜头模式**（6 节点）挂在：切换视角；事件：When Tab Is Selected

## 定时器

教程页：新手入门系列视频教程/建成我的第一个奇域/定时器；实体 51 个，图 4 张。

- **拉杆开启木门**（14 节点）挂在：拉杆；事件：When Tab Is Selected, When Timer Is Triggered
- **踏板开启铁门**（25 节点）挂在：踏板；事件：When Entering Collision Trigger, When Exiting Collision Trigger, When Timer Is Triggered
- **清理废墟**（15 节点）挂在：空模型；事件：When Tab Is Selected, When Timer Is Triggered
- **打开宝箱**（28 节点）挂在：珍贵的宝箱；事件：When Tab Is Selected, When Timer Is Triggered

## 定时器地形

教程页：新手入门系列视频教程/建成我的第一个奇域/定时器；实体 43 个，图 3 张。

- **Chest**（28 节点）挂在：（客户端图或未挂载）；事件：When Tab Is Selected, When Timer Is Triggered
- **Door Lever**（14 节点）挂在：（客户端图或未挂载）；事件：When Tab Is Selected, When Timer Is Triggered
- **Gate Button**（25 节点）挂在：（客户端图或未挂载）；事件：When Entering Collision Trigger, When Exiting Collision Trigger, When Timer Is Triggered

## 过滤节点图

教程页：玩法功能进阶实例/3.7过滤节点图——对不同物体筛选过滤，产生不同效果；实体 14 个，图 4 张。

- **功能示例-1 拾取钥匙**（5 节点）挂在：功能示例-1 钥匙；事件：When Entering Collision Trigger
- **没有钥匙**（5 节点）挂在：（客户端图或未挂载）；事件：When Custom Variable Changes S<T:Flt>
- **有钥匙**（5 节点）挂在：（客户端图或未挂载）；事件：When Custom Variable Changes S<T:Flt>
- **功能示例-1 开门**（8 节点）挂在：功能示例-1 开门机关；事件：When Tab Is Selected

## 投射运动器

教程页：玩法功能进阶实例/3.8投射运动器——制作一个能发射的子弹；实体 16 个，图 4 张。

- **宝箱掉落物件**（9 节点）挂在：宝箱；事件：When Entering Collision Trigger
- **物件生成**（6 节点）挂在：（客户端图或未挂载）；事件：When On-Hit Detection Is Triggered
- **炮塔逻辑**（8 节点）挂在：新建元件胶水大炮10005036；事件：When Tab Is Selected
- **刀波技能**（7 节点）挂在：（客户端图或未挂载）；事件：无

## 定时器

教程页：玩法功能进阶实例/3.2定时器——定时发出事件；实体 12 个，图 1 张。

- **物件-种植植物**（23 节点）挂在：种植格；事件：When Tab Is Selected, When Timer Is Triggered

## 玩法流程

教程页：项目案例实战/4.1派对小游戏：《农场乱斗》/4.1.3《农场乱斗》玩法流程；实体 22 个，图 18 张。

- **物件-种植格-可操作**（11 节点）挂在：队伍1-种植格×4, 队伍2-种植格；事件：When Entering Collision Trigger, When Exiting Collision Trigger
- **物件-种子-拾取/切换种子**（23 节点）挂在：工具-种子×2；事件：When Tab Is Selected
- **物件-耙子-拾取/切换耙子**（20 节点）挂在：工具-耙子；事件：When Tab Is Selected
- **物件-水壶-拾取/切换水壶**（20 节点）挂在：工具-水壶；事件：When Tab Is Selected
- **使用工具**（2 节点）挂在：（客户端图或未挂载）；事件：无
- **角色-使用/放下工具**（53 节点）挂在：默认模版(角色编辑)；事件：When Skill Node Is Called
- **放下工具**（2 节点）挂在：（客户端图或未挂载）；事件：无
- **玩家-拾取工具**（23 节点）挂在：默认模版×9；事件：When Custom Variable Changes S<T:Str>
- **玩家-种子到达使用上限**（20 节点）挂在：默认模版×9；事件：When Custom Variable Changes S<T:Int>
- **物件-种植格-种子成长**（24 节点）挂在：队伍1-种植格×4, 队伍2-种植格；事件：When Custom Variable Changes S<T:Int>, When Timer Is Triggered
- **物件-种植格-采集果实**（20 节点）挂在：队伍1-种植格×4, 队伍2-种植格；事件：When Entering Collision Trigger
- **玩家-采集果实**（12 节点）挂在：默认模版×9；事件：When Custom Variable Changes S<T:Int>
- **物件-果实商-提交果实**（12 节点）挂在：果实商；事件：When Entering Collision Trigger
- **玩家-放下/切换工具**（7 节点）挂在：默认模版×9；事件：When Custom Variable Changes S<T:Bol>
- **玩家-增加选项框**（4 节点）挂在：默认模版×9；事件：When Custom Variable Changes S<T:Ety>
- **玩家-记录关卡总人数**（5 节点）挂在：默认模版×9；事件：When Entity Is Created
- **物件-准备台**（20 节点）挂在：准备台；事件：When Tab Is Selected
- **关卡-游戏结束传送**（6 节点）挂在：关卡物件；事件：When Global Timer Is Triggered

## 角色设置

教程页：基础功能逻辑&玩法流程/2.2角色设置——增强角色属性，让角色能跑能跳；实体 14 个，图 3 张。

- **功能示例-3：更改职业等级为固定等级**（5 节点）挂在：默认模版(角色编辑), 固定升级；事件：When Tab Is Selected
- **功能示例-4：更改职业等级为当前等级+1**（6 节点）挂在：+1级；事件：When Tab Is Selected
- **功能示例-2：更改职业**（5 节点）挂在：切换职业；事件：When Tab Is Selected

## 界面控件

教程页：基础功能逻辑&玩法流程/2.6界面控件——展示一段信息，按下触发事件；实体 17 个，图 6 张。

- **功能示例-1：拾取金币**（7 节点）挂在：功能示例-1 金币×5；事件：When Entering Collision Trigger
- **没有钥匙**（5 节点）挂在：（客户端图或未挂载）；事件：When Custom Variable Changes S<T:Flt>
- **有钥匙**（6 节点）挂在：（客户端图或未挂载）；事件：When Custom Variable Changes S<T:Flt>
- **功能示例-2：按下添加积分**（4 节点）挂在：默认模版×9；事件：When UI Control Group Is Triggered
- **功能示例-3：占点开启or中断**（7 节点）挂在：功能示例-3 占点平台；事件：When Entering Collision Trigger, When Exiting Collision Trigger
- **功能示例-3：增加积分or暂停增加**（4 节点）挂在：默认模版×9；事件：When Timer Is Triggered

## 命中与受击

教程页：玩法功能进阶实例/3.10命中与受击——制作攻击命中的效果；实体 13 个，图 2 张。

- **大炮发射子弹**（4 节点）挂在：大炮；事件：When Tab Is Selected
- **普攻**（5 节点）挂在：（客户端图或未挂载）；事件：无

## 装备

教程页：玩法功能进阶实例/3.15装备——可用于角色穿戴的特殊道具；实体 11 个，图 2 张。

- **碰撞销毁实体**（3 节点）挂在：（客户端图或未挂载）；事件：When Entering Collision Trigger
- **装备剑增加武器外观**（6 节点）挂在：（客户端图或未挂载）；事件：When Equipment Is Equipped

## 单位状态

教程页：玩法功能进阶实例/3.5单位状态——让某物获得增益或减益的效果；实体 11 个，图 2 张。

- **功能示例-1 施放技能添加状态**（3 节点）挂在：（客户端图或未挂载）；事件：无
- **新建节点图**（0 节点）挂在：（客户端图或未挂载）；事件：无

## 全局计时器

教程页：新手入门系列视频教程/建成我的第一个奇域/全局计时器；实体 296 个，图 7 张。

- **玩家**（10 节点）挂在：默认模版×9；事件：When Entity Is Created, When Global Timer Is Triggered
- **开始游戏**（5 节点）挂在：开始游戏；事件：When Tab Is Selected
- **陷阱**（5 节点）挂在：空模型；事件：When Entering Collision Trigger
- **金币**（4 节点）挂在：金币；事件：When Entering Collision Trigger
- **完成游戏**（5 节点）挂在：完成游戏；事件：When Tab Is Selected
- **再次挑战**（12 节点）挂在：再次挑战；事件：When Tab Is Selected
- **结算游戏**（2 节点）挂在：结算游戏；事件：When Tab Is Selected

## 碰撞与交互

教程页：基础功能逻辑&玩法流程/2.1碰撞与交互——触发一个事件；实体 23 个，图 6 张。

- **功能示例-1：拾取金币**（2 节点）挂在：功能示例-1 金币×5；事件：When Entering Collision Trigger
- **功能示例-2：开箱子**（3 节点）挂在：功能示例-2 宝箱；事件：When Tab Is Selected
- **功能示例-3：元件A-钥匙**（5 节点）挂在：功能示例-3 钥匙×2；事件：When Entering Collision Trigger
- **功能示例-3：元件B-宝箱**（8 节点）挂在：功能示例-3 宝箱, 功能示例-4 宝箱；事件：When Tab Is Selected
- **有钥匙时展示，没有钥匙不展示**（4 节点）挂在：（客户端图或未挂载）；事件：When Custom Variable Changes S<T:Flt>
- **没有钥匙展示，有钥匙时不展示**（5 节点）挂在：（客户端图或未挂载）；事件：When Custom Variable Changes S<T:Flt>

## 关卡结算

教程页：基础功能逻辑&玩法流程/2.11关卡结算——游戏结束，让所有玩家进行游玩结算；实体 14 个，图 3 张。

- **功能示例1 交互后关卡结算**（7 节点）挂在：功能示例1；事件：When Tab Is Selected
- **功能示例2 交互后获得钥匙**（11 节点）挂在：功能示例2 宝箱；事件：When Tab Is Selected
- **功能示例2 交互后关卡结算**（6 节点）挂在：功能示例2；事件：When Tab Is Selected

## 经典模式

教程页：编辑器通识/1.7经典模式；实体 12 个，图 1 张。

- **通过节点图修改角色能量**（6 节点）挂在：修改玩家能量；事件：When Tab Is Selected

## 环境配置

教程页：基础功能逻辑&玩法流程/2.10环境配置——天空背景、游戏滤镜和光源的使用；实体 13 个，图 1 张。

- **切换环境设置**（3 节点）挂在：石质功能平台；事件：When Entering Collision Trigger

## 小地图标识

教程页：玩法功能进阶实例/3.17小地图标识——游戏地图中显示实体位置的特殊标签；实体 13 个，图 1 张。

- **增加追踪**（5 节点）挂在：目标点；事件：When Entering Collision Trigger

## 跟随运动器

教程页：玩法功能进阶实例/3.3跟随运动器——制作吸附、跟随的道具；实体 16 个，图 1 张。

- **功能示例-1 物件跟随**（8 节点）挂在：功能示例1-可拾取金币×5；事件：When Entering Collision Trigger

## 事件节点在 48 份样例里出现的次数

- 49 × When Tab Is Selected
- 43 × When Entering Collision Trigger
- 14 × When Timer Is Triggered
- 13 × When Exiting Collision Trigger
- 13 × When Custom Variable Changes S<T:Int>
- 6 × When Custom Variable Changes S<T:Flt>
- 5 × When Skill Node Is Called
- 4 × When Custom Variable Changes S<T:Str>
- 3 × When Entity Is Destroyed
- 2 × When Deck Selector Is Complete
- 2 × When UI Control Group Is Triggered
- 2 × When Custom Variable Changes S<T:Bol>
- 2 × When Custom Variable Changes S<T:Ety>
- 2 × When Entity Is Created
- 2 × When Global Timer Is Triggered
- 1 × When Inventory Item Is Used
- 1 × When On-Hit Detection Is Triggered
- 1 × When Equipment Is Equipped

## 最常用的 50 种节点

- 153 × Get Self Entity
- 90 × Get Player Entity to Which the Character Belongs
- 78 × Double Branch
- 72 × Create Prefab
- 62 × Set Custom Variable S<T:Int>
- 49 × When Tab Is Selected
- 49 × Get Custom Variable S<T:Int>
- 44 × Multiple Branches S<T:Str>
- 43 × When Entering Collision Trigger
- 42 × Destroy Entity
- 37 × Set Custom Variable S<T:Ety>
- 35 × Query Entity by GUID
- 34 × Multiple Branches S<T:Int>
- 32 × Get Entity Location and Rotation
- 29 × Set Custom Variable S<T:Bol>
- 25 × Set Preset Status
- 24 × Mount Looping Special Effect
- 22 × Get Custom Variable S<T:Ety>
- 22 × Addition S<T:Int>
- 22 × Start Timer
- 20 × Activate/Disable Tab
- 20 × Assembly List S<T:Flt>
- 18 × Get Custom Variable S<T:Bol>
- 17 × Set Custom Variable S<T:Str>
- 16 × Set Custom Variable S<T:D<Str,L<Int>>>
- 16 × Equal S<T:Int>
- 15 × Set Custom Variable S<T:D<Str,L<Bol>>>
- 14 × Activate Basic Motion Device
- 14 × When Timer Is Triggered
- 14 × Set UI Control (Group) Status
- 13 × When Exiting Collision Trigger
- 13 × Get Custom Variable S<T:Str>
- 13 × When Custom Variable Changes S<T:Int>
- 13 × Play Timed Effects
- 12 × Switch Follow Motion Device Target by GUID
- 12 × Delete Character Skill by Slot
- 12 × Add Character Skill
- 11 × Get All Character Entities of Specified Player
- 11 × Get Corresponding Value From List S<T:Ety>
- 10 × Settle Stage
- 10 × Stop Timer
- 8 × #200000
- 8 × Query Preset Point Position Rotation
- 8 × Clear Special Effects Based on Special Effect Assets
- 7 × Query Entity Faction
- 7 × Set or Add Key Value Pair to Dictionary S<K:Int,V:L<Str>>
- 7 × Set or Add Key Value Pair to Dictionary S<K:Str,V:Fct>
- 7 × Set or Add Key Value Pair to Dictionary S<K:Str,V:Str>
- 7 × Teleport Player (Beyond Mode)
- 7 × Subtraction S<T:Int>
