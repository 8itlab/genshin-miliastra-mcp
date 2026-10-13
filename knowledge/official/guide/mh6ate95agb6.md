# 概念介绍/高级概念/技能/技能资源

(来源：原神千星奇域·综合指南，页面 ID mh6ate95agb6)

# 一、技能资源的定义

 _技能资源_ 是特定技能释放时需要扣除的资源，例如经典模式的“元素能量”就是一种技能资源，在千星奇域中支持创作者(奇匠)自己定义技能资源的类型，并制定技能依赖的技能资源种类

# 二、技能资源的编辑

## 1.编辑入口

通过系统菜单栏的 _技能资源管理_ 按钮进入

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh6ate95agb6/8170edca-23e2-48ac-a96b-636dc2b13b30.png)

打开界面即可编辑全局可用的技能资源类型

## 2.参数介绍

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh6ate95agb6/efe6dc8c-bd44-4596-8608-94b8267edf81.png)



 _技能资源名_ ：技能资源的命名



 _配置ID_ ：技能资源的唯一标识，在节点图调用时依赖该配置ID



 _增长类型_ ：增长类型决定了当外部逻辑尝试增加技能资源量时，实际的增长规则，目前支持三种类型

 _无条件增长_ ：在未超过可获取最大值时，该技能资源量会无条件增长

 _跟随技能（保留值）_ ：当尝试改变技能资源量时，只有当前玩家身上存在需要该技能资源释放的技能时，才能改变成功，否则不生效，当某个技能资源没有任何一个技能需要时，技能资源量会保留

 _跟随技能（不保留值）_ ：规则同上，区别在于当某个技能资源没有任何一个技能需要时，技能资源量会清零



 _可获取最大值_ ：技能资源量的最大值，角色获取的技能资源量无法超过该值



 _引用信息_ ：表示该技能资源被哪些技能引用

# 三、节点图修改技能资源

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh6ate95agb6/76719495-bf87-4fe4-8dcb-82773011a7d3.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh6ate95agb6/d8c5c0e0-78d7-4c4c-a0c8-2b004fe22d9a.png)
