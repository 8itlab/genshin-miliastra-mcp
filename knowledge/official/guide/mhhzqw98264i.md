# 概念介绍/高级概念/技能/技能变量

(来源：原神千星奇域·综合指南，页面 ID mhhzqw98264i)

# 一、什么是技能变量

 _技能变量_ 是一类可以被持久化记录在玩家身上的值，其特性和自定义变量相似，区别在于：

1.技能变量是一个客户端的值，可以被客户端节点直接修改且修改会立即生效，时效性好于自定义变量

2.技能变量默认是浮点数类型，暂时不支持其他类型

3.角色倒下后技能变量值会被置为0

通过使用技能变量，玩家可以实时记录需要的信息，以实现同一技能中的异步查询，或者跨技能的信息传递

# 二、技能变量的编辑

在系统菜单中点击【技能变量管理】，打开技能变量管理界面

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhhzqw98264i/ed47980d-a31d-4af1-a8cd-158ef3931b25.png)

在打开的界面即可编辑全局可用的技能变量

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhhzqw98264i/d02b56fb-a486-4099-b995-f335f73a6b17.png)

点击【新增变量】可以增加一个技能变量

 _变量名_ ：技能变量的命名

 _配置ID_ ：技能变量的唯一标识，在节点图调用时依赖该ID

# 三、使用节点图修改技能变量

设置技能变量

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhhzqw98264i/b9a2e16e-afd6-4207-bf43-ebe9c2b30b10.png)

增加技能变量值

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhhzqw98264i/94419051-330e-4e3d-ac4b-9a0c8757b7d3.png)

查询技能变量对应值

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhhzqw98264i/3fae9e92-3786-4e3e-a622-9bf079ae9c1e.png)
