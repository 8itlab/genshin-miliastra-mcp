# 玩法功能进阶实例/3.5单位状态——让某物获得增益或减益的效果

(来源：原神千星奇域·教程，页面 ID mhtbbb9hr32y)

# 前言

## 课程说明：

**课程内容：** 单位状态的制作和使用方法

**学习目标：** 学会制作不同效果的单位状态，并能通过不同事件进行添加/移除（例如：施放技能获得xx增益，走入区域获得xx效果等）

 _**该课程中涉及【局内编辑器面板配置】和【千星沙箱节点图】两个模块内容，并且相互关联，阅读时建议按照课程顺序完整阅读_

##  相关信息：

**推荐学习顺序：** 【前置课程】→【当前课程】→【综合指南】

 _**如课程中遇到概念不清等问题或想要了解更多相关信息，根据需要查询_** __【综合指南】__** _即可_

**前置课程：** 该课程与以下前置课程所讲述的功能知识点相关 _（建议首次使用时，优先学习_** __【前置课程】__** _，学习体验更流畅）_

> [2.1碰撞与交互——触发一个事件](/ys/ugc/tutorial/course/detail/mhumsn9uap96)
> 
> [2.8技能设置——让角色能攻击](/ys/ugc/tutorial/course/detail/mh0apmie08e4)

关联知识点：课程中将涉及以下基础概念 _（建议优先根据该课程学习即可，如遇到概念不清等问题或想要了解更多相关信息，再根据需要查阅_** __【综合指南】__** _相关章节）_

> [单位状态](/ys/ugc/tutorial//detail/mhd7nxrfa8im)
> 
> [单位状态效果池](/ys/ugc/tutorial//detail/mhou93r2pxv2)

* * *

# 单位状态——增益或减益的效果

## 功能示例-1：施放技能获得增益效果

### 1.概念简述

**单位状态：** 是一种“已预设好”的可对属性或功能进行增益或减益的效果

 _**目前可用的单位状态效果详见【综合指南-单位状态效果池】_

### 

### 2.教学内容

**功能效果：** 制作增加血量上限的单位状态，可以叠加5层，持续时间无限

**效果演示：**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhtbbb9hr32y/4ef9eeaa-b574-4312-8140-c62eb4890b5a.gif)

#### 

### 3.操作步骤

**1.【局内编辑器】添加状态**

新建一个状态作为增加血量的buff状态，在面板中点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhtbbb9hr32y/b0bc8749-a3fe-4520-be20-cd6d7d723cfa.png)>>>进入战斗预设，点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhtbbb9hr32y/f82d3800-0aa3-414e-8ff6-9464e6cd14b3.png)>>>选择![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhtbbb9hr32y/aa6c1a9b-79da-4b16-9b40-d21df84e7a92.png)即可添加

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhtbbb9hr32y/95557ced-3e16-46af-b498-421ea1644b48.png)

**2.【局内编辑器】配置面板参数**

添加状态后可对状态的名称、叠加层数上限、持续时间、状态规则等进行调整，为达到预期的功能效果教程中配置如下：

| 要做的功能| 对应的配置项  
---|---|---  
通用信息| 状态可叠加5层| 【叠加层数上限】改为“5”  
状态持续时间无上限| 【无限持续时间】选项打开  
效果详细信息| 每层增加“1000”血量上限| 效果选择【最大生命值修正值】，设置为“1000”  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhtbbb9hr32y/18770cdf-7bdb-4c47-98ca-f321874a32ac.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhtbbb9hr32y/00af65db-3aaf-4691-a9f4-80e216a548c6.png)

 _**重要配置项说明：_

 _让位状态列表：如果目标已获得其中任意一种单位状态，则本次施加行为会直接终止并失败_

 _顶替状态列表：如果目标已获得其中任意一种单位状态，则【所有】列表中的状态均会被移除，随后施加该状态_

**3.【千星沙箱】节点图配置，制作技能效果**

在【客户端-技能节点图】中，添加并配置节点图（设置参考见下图），为达到预期的功能效果教程中配置如下：

**该节点图挂载在【技能】上

|  | 要做的功能| 对应的配置项  
---|---|---|---  
功能玩家施放技能时，给自己添加1层状态| 触发场景| 施放技能时| /  
条件| /| /  
结果| 给自身添加1层加血量上限的状态| 【执行节点】：使用【施加单位状态】给自身添加1层对应的状态  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhtbbb9hr32y/921bb993-f53b-409b-a5a1-aec75bfeba7e.png)

**4.【局内编辑器】添加技能，配置节点图**

新建技能，将技能节点图挂载在技能上，并将技能配置给对应职业

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhtbbb9hr32y/1814e338-8850-41e9-b968-9c7c17e5fd03.gif)

**5.【局内编辑器】试玩体验**

进入试玩即可体验该功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhtbbb9hr32y/4ef9eeaa-b574-4312-8140-c62eb4890b5a.gif)

 _**更多相关信息可自行查阅【综合指南-单位状态】_

* * *

#  课程总结及辅助课件

**课程作业：** 可根据课程教学内容尝试进行以下功能复刻/拓展

> 功能复刻：制作安全区无敌效果，进入安全区则获得无敌效果，离开安全区失效
> 
> 进阶拓展：制作范围光环效果，获得特殊道具后可施放技能，施放后角色周围一定范围内的友方单位获得增益效果，离开范围后增益失效

**课程回顾：** 学习如何制作单位状态，并根据实际需要触发添加或移除，例如：可用于跑酷玩法的体力无限、用于解密玩法的超级跳、用于各类RPG玩法的伤害、元素反应倍率加成等

### 辅助课件

我们提供了上述课程内容相关的工程文件，可结合** _【教学存档-单位状态】_** 对照学习

![](https://webstatic.mihoyo.com/upload/static-resource/2022/10/14/64e71b8a5e28fbdbc3d3df5d311e4154_847866555738962172.svg)

单位状态.gil

16.4 KB

[](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhtbbb9hr32y/9498748f-7b4a-4168-a181-dc30e7600d3b.gil)
