# 概念介绍/单位/角色

(来源：原神千星奇域·综合指南，页面 ID mh3ecor1x5cm)

区别于 _玩家实体_ ， _角色实体_ 指代的是游戏过程中玩家实际控制的走跑爬飞单位，有物理实体  
  
# 一、角色模板

在超限模式中，玩家和角色是一一对应的，因此角色的 _模板配置_ 作为 _玩家模板_ 的一部分存在，入口在玩家模板的角色编辑页签下：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh3ecor1x5cm/b9ea291b-f1d2-4acb-a310-206f448d61b7.png)

页签概述：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh3ecor1x5cm/17979034-ad8e-4887-a9cb-c2143c40158e.png)：基础信息页签，角色这里对比其它实体仅有音效相关信息

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh3ecor1x5cm/4d490283-5894-4fcf-804c-1bf1cc1051c5.png)：特化配置页签，角色这里对比其它实体仅有战斗设置相关参数

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh3ecor1x5cm/65714567-8464-4ab2-9884-dc17221678bd.png)：通用组件页签，可在此页签给角色实体添加组件，或查看已添加的组件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh3ecor1x5cm/2ed810ce-7870-4983-981c-21902148c247.png)：节点图配置页签，可在此页签给角色实体添加节点图，或查看已添加的节点图

# 二、角色实体的可用组件概览

[碰撞触发器](/ys/ugc/tutorial//detail/mh8w69rzuc3i)

[自定义变量](/ys/ugc/tutorial//detail/mhso1b9wjica)

[全局计时器](/ys/ugc/tutorial//detail/mhawd6rl5kpy)

[单位状态](/ys/ugc/tutorial//detail/mhd7nxrfa8im)

[特效播放](/ys/ugc/tutorial//detail/mh4ppo02m1o8)

[自定义挂接点](/ys/ugc/tutorial//detail/mhmshmimtegs)

[碰撞触发源](/ys/ugc/tutorial//detail/mhn95di01j84)

[音效播放器](/ys/ugc/tutorial//detail/mhwiv89yra02)

[背包组件](/ys/ugc/tutorial//detail/mh5y5001vqd4)

[战利品](/ys/ugc/tutorial//detail/mh63ox06afy8)

[铭牌](/ys/ugc/tutorial//detail/mh5n160t2b6w)

[文本气泡](/ys/ugc/tutorial//detail/mhwtz297kp6a)

[扫描标签](/ys/ugc/tutorial//detail/mhfc0lr1tcke)

[小地图标识](/ys/ugc/tutorial//detail/mh0pppib5eyc)

此外还有仅角色可以添加的装备栏组件

详情可见[装备](/ys/ugc/tutorial//detail/mhkl2yin0cxo)

# 三、运行时特性



角色在游戏过程中，会根据模板配置动态进行初始化，因此角色实体不具有对应的 _GUID_



特殊的，当角色生命值归零时，角色实体上的节点图可以收到角色的 _实体销毁时事件_ 以及 _实体移除/销毁时事件_ ，而物件销毁时，事件会被推送到关卡实体上



在联机游玩过程中，如果玩家主动返回大厅，则关卡会收到角色的移除事件
