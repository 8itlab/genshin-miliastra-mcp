# 概念介绍/高级概念/技能/关键行为

(来源：原神千星奇域·综合指南，页面 ID mhapp3r8gkdq)

# 一、关键行为的定义

 _关键行为_ 是一种纯客户端的数据，奇匠可以在技能施放的过程中主动通过节点图进行定义并记录，系统会将记录的关键行为列表和其触发的客户端时间保存在 _关键行为记录板_ 内，并可以通过节点图获取已记录的关键行为列表

关键行为可以视为一个简化的指令序列，奇匠可以基于此实现有时效性需求的技能连段或者组合技能

# 二、关键行为的基础概念介绍

 _关键行为ID_ ：关键行为的唯一标识，在节点图调用时依赖该ID

 _客户端时间_ ：添加时在客户端的时间

# 三、使用节点图设置关键行为

添加关键行为

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhapp3r8gkdq/646a9f68-bda1-4824-8288-4ac643545d48.png)

清空关键行为记录板

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhapp3r8gkdq/64f6a5d9-bc91-47d3-a877-02209ae425e9.png)

获取当前关键行为

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhapp3r8gkdq/b491dc15-a608-4c83-b7d5-9f06e11bc476.png)

获取当前关键行为(高精度)

客户端时间受到浮点数精度的影响，如果需要更高的精度则推荐使用高精度版本的节点

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhapp3r8gkdq/c798accd-9fb1-420d-b6a6-f9e6b01ee389.png)
