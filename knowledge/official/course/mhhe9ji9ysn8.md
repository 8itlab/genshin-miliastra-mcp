# 玩法功能进阶实例/3.18描边与透视——实体更丰富的指引表现效果

(来源：原神千星奇域·教程，页面 ID mhhe9ji9ysn8)

# 前言

## 课程说明：

**课程内容：** 特殊的单位状态“描边”与“透视”的使用方法

**学习目标：** 了解如何配置“描边”与“透视”，制作游戏中的引导信息等（如：隔墙透视、可交互描边、队伍描边、造物（怪物）描边等）

 _**该课程中涉及【局内编辑器面板配置】和【千星沙箱节点图】两个模块内容，并且相互关联，阅读时建议按照课程顺序完整阅读。_

##  相关信息：

**推荐学习顺序：** 【前置课程】→【当前课程】

**前置课程：** 该课程与以下前置课程所讲述的功能知识点相关 _（建议首次使用时，优先学习_** __【前置课程】__** _，学习体验更流畅）_

> [2.1碰撞与交互——触发一个事件](/ys/ugc/tutorial/course/detail/mhumsn9uap96)
> 
> [3.5单位状态——让某物获得增益或减益的效果](/ys/ugc/tutorial/course/detail/mhtbbb9hr32y)

* * *

# 描边——实体的差异化表现

## 功能示例-1：给可进行交互操作的物件添加绿色描边

### 1.概念简述

**描边：** 特殊的【单位状态】类型，通过配置描边颜色，可制作例如：可交互的物件有描边、根据不同分队给角色添加描边等差异化表现效果。

### 2.教学内容

**功能效果：** 制作绿色的描边效果，给当前可以被交互操作的物件添加，即当人物靠近物件时，添加绿色描边

**效果演示：**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhhe9ji9ysn8/846c52a2-07cd-49e8-bc29-608d13df60ed.gif)

### 3.操作步骤

**1.【局内编辑器】添加单位状态**

新建一个状态作为增加血量的buff状态，在面板中点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhhe9ji9ysn8/ed3605ff-c7b9-41e2-b8f1-fefd22c7e854.png)>>>进入战斗预设，点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhhe9ji9ysn8/eb30b373-09fd-4152-b0c8-a11958d30f23.png)>>>选择![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhhe9ji9ysn8/60b8d2ad-ddbf-4531-a1e3-6ca9e17b6fc9.png)即可添加

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhhe9ji9ysn8/5c24d4ba-b51b-4ac4-bc18-1ee783b8cadc.png)

**2.【局内编辑器】制作“描边”效果**

添加状态后可对状态的名称、叠加层数上限、持续时间、状态规则等进行调整，为达到预期的功能效果教程中配置如下：

| 要做的功能| 对应的配置项  
---|---|---  
通用信息| 状态持续时间无上限| 【无限持续时间】选项打开  
效果详细信息| 描边效果| 效果选择【挂载描边效果】  
描边为绿色| 效果选择【自定义颜色】，设置为“绿色”  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhhe9ji9ysn8/ffe74047-1db3-4617-8666-971fd4eeec96.gif)

**3.【局内编辑器】制作差异化的物件和触发效果（碰撞触发器组件）**

制作3个差异化物件（教程中选择锤子、铲子、锄头），添加【碰撞触发器】组件，并配置触发器形状/大小，为达到预期的功能效果教程中配置如下：

 _**3个物件仅模型不同，其他配置完全一样，教程以锤子为例_

要做的功能| 对应的配置项  
---|---  
触发器形状/大小合适| 【形状】设置为“球体”【半径】设置为“1” _**实际教程中沿用了球体的初始设置，此处仅演示_  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhhe9ji9ysn8/a24dd0b3-77bc-40d8-ba58-abd704a190b2.png)

**4.【千星沙箱】节点图配置**

在实体节点图中，添加并配置该元件的节点图（设置参考见下图），为达到预期的功能效果教程中配置如下：

 _**该节点图挂载在【物件元件】上_

|  | 要做的功能| 对应的配置项  
---|---|---|---  
功能-1玩家进入一定范围，可操作的物件添加描边效果| 触发场景| 进入一定范围时，触发事件| 【事件节点】：进入碰撞触发器时  
条件| /| /  
结果| 添加描边效果| 【执行节点】：使用【添加单位状态】添加绿色描边表现  
功能-1玩家进入一定范围，可操作的物件添加描边效果 | 触发场景| 离开一定范围后，触发事件| 【事件节点】：离开碰撞触发器时  
条件| /| /  
结果| 移除描边效果| 【执行节点】：使用【移除单位状态】移除绿色描边表现  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhhe9ji9ysn8/f40bd192-c444-4e4c-b281-760ea11bb041.png)

**5.【局内编辑器】挂载节点图**

将配置的节点图挂载在3个差异化的物件元件上，保存元件设置

**6.【局内编辑器】放置元件，试玩体验**

将制作好的元件放置在场景中，进入试玩即可体验该功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhhe9ji9ysn8/846c52a2-07cd-49e8-bc29-608d13df60ed.gif)

# 透视——隔墙透视的实体表现效果

## 功能示例-2：给特定物件添加透视效果

### 1.概念简述

**透视：** 特殊的【单位状态】类型，通过配置透视颜色，过滤节点图，可制作例如：特定物件可透视、透视技能等差异化表现效果。

### 2.教学内容

**功能效果：** 制作白色的透视效果，给特定的物件添加，当人物与该物件间有墙壁等实体遮挡时，可隔墙看到该物件

**效果演示：**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhhe9ji9ysn8/2779243c-fb4e-4ae2-9623-fc91f43656f6.gif)

###  3.操作步骤

**1.【局内编辑器】添加单位状态**

新建一个状态作为增加血量的buff状态，在面板中点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhhe9ji9ysn8/5311ee2f-1c49-4de8-a0bc-56432d3b8c7b.png)>>>进入战斗预设，点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhhe9ji9ysn8/7f0cdec8-cdeb-4574-aa8b-26c92cbe30b8.png)>>>选择![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhhe9ji9ysn8/fb8f0d43-43b0-403f-8ef2-f3a1068330a8.png)即可添加

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhhe9ji9ysn8/5c24d4ba-b51b-4ac4-bc18-1ee783b8cadc.png)

**2.【局内编辑器】制作“透视”效果**

添加状态后可对状态的名称、叠加层数上限、持续时间、状态规则等进行调整，为达到预期的功能效果教程中配置如下：

| 要做的功能| 对应的配置项  
---|---|---  
通用信息| 状态持续时间无上限| 【无限持续时间】选项打开  
效果详细信息| 透视效果| 效果选择【挂载透视效果】  
透视为白色| 效果选择【自定义颜色】，设置为“白色”  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhhe9ji9ysn8/53ef55c3-aba7-4965-86e0-eb5d6e3e7e8a.gif)

**3.【局内编辑器】制作可透视的物件**

制作1个可透视的物件（教程中以火炬为例），直接在【单位状态】组件添加设置好的单位状态即可。

 _**此处仅演示效果直接添加，实际制作时可根据关卡需要，灵活制作透视时段、透视物件等。_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhhe9ji9ysn8/9485d93c-e05b-4fab-9d98-6b2b771614de.gif)

**6.【局内编辑器】放置元件，试玩体验**

将制作好的元件放置在场景中，在前面额外摆放一个墙体作为障碍物，进入试玩即可体验该功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhhe9ji9ysn8/2779243c-fb4e-4ae2-9623-fc91f43656f6.gif)

* * *

# 课程总结及辅助课件

**课程作业：** 可根据课程教学内容尝试进行以下功能复刻/拓展

> **功能复刻：** 制作扫描技能效果，开启技能后，可以看到不同物件的描边效果（用于查找特定标签的物品道具）

**课程回顾：** 学习如何制作【描边】和【透视】效果，并在所需情况下给特定实体添加该状态，制作各类差异化表现的物件、技能等。

### 辅助课件

我们提供了上述课程内容相关的工程文件，可结合【教学存档-描边与透视】对照学习

![](https://webstatic.mihoyo.com/upload/static-resource/2022/10/14/64e71b8a5e28fbdbc3d3df5d311e4154_847866555738962172.svg)

描边与透视.gil

34.9 KB

[](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhhe9ji9ysn8/20a7416c-2313-4820-a1c5-8f3aea8dff1c.gil)
