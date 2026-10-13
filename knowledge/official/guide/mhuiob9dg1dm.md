# 概念介绍/功能/通用组件/额外碰撞

(来源：原神千星奇域·综合指南，页面 ID mhuiob9dg1dm)

# 一、额外碰撞组件的功能  
  
碰撞阻挡，也称为碰撞检测，是指在游戏运行中为了模拟物理世界中的物体碰撞表现的功能。

除 _原生碰撞_ 外，额外碰撞组件支持灵活配置需求的形状、大小和组合，作为实体运行时的生效碰撞范围，或者可攀爬范围。

额外碰撞组件可支持同时生效多个 _额外碰撞_ ，他们的生效范围会进行叠加。

每个 _额外碰撞_ 可支持同时生效多个碰撞范围，他们的生效范围也会进行叠加。

**原生碰撞**

原生碰撞是预制元件默认携带的碰撞。

可以通过配置“初始生效”，来设置“原生碰撞”是否开启

# 二、额外碰撞组件的编辑

## 1.添加组件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuiob9dg1dm/3475474d-4364-437a-a39b-7c232b7711ee.png)

(1)在实体或元件编辑界面中，打开组件编辑页签

(2)点击下方的“添加通用组件”，选择并点击“额外碰撞”，成功添加

选中“额外碰撞组件”时，编辑中的实体会以蓝色显示“额外碰撞”组件当前生效的范围。

(3)点击“详细编辑”，展开编辑页



**初始生效额外碰撞**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuiob9dg1dm/164ef5e0-77e6-481d-be95-035f8d11ad57.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuiob9dg1dm/96c345f2-e76d-4120-8948-dbd00a375dd3.png)

配置参数| 说明  
---|---  
 _初始生效额外碰撞_|  当前配置生效的额外碰撞，对应“详细编辑”页内配置  
 _额外碰撞结构列表_|  编辑实体所有额外碰撞枚举列表  
  


**原生碰撞**

配置参数| 说明  
---|---  
 _原生碰撞生效_|  在基础属性页签中的“原生碰撞”支持配置生效与否  
*_原生碰撞预览_|  若开启，则用蓝色点来显示原生碰撞范围  
  
## 2.额外碰撞的编辑

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuiob9dg1dm/3d50f20d-eef5-452a-b559-095fb3619c36.png)



通过点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuiob9dg1dm/9d422ebd-9c3e-40f6-b4e7-d08ff464bd2a.png)，添加“额外碰撞”。



新增的“额外碰撞”，默认配置初始生效。



“序号:X”，X为“碰撞区序号”，作为节点输入项可以调整额外碰撞的参数

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuiob9dg1dm/2883858a-74fe-46bd-b870-3598693fd572.png)

配置参数| 说明  
---|---  
 _初始生效_|  额外碰撞是否随实体创建一同激活生效  
 _是否可攀爬_|  额外碰撞攀爬功能是否一同开启  
 _*原生碰撞_|  提示原生碰撞是否生效  
 _*原生碰撞预览_|  开启可查看原生碰撞的范围  
  


通过“添加额外碰撞”，可增加基础形状

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuiob9dg1dm/a8c5dbf3-0eff-4866-9fc0-fc6d993b00d3.png)

配置参数| 说明  
---|---  
 _触发区形状_|  支持配置长方体、球体、胶囊体三种基础形状![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuiob9dg1dm/f10c1893-7638-4a76-b6aa-a8c0e88c76f8.png)  
 _中心_|  相对实体或元件中心的偏移  
 _缩放倍率_|  支持配置形状在不同轴向上支持定义缩放  
 _旋转_|  以中心位置为基准，在不同轴向上支持调整朝向  
  
# 三、通过节点图管理额外碰撞



激活/关闭额外碰撞

通过选择实体、填入“额外碰撞序号”，调整该额外碰撞的生效与否。

若不生效，其可攀爬属性也不生效

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuiob9dg1dm/9f418dc3-1770-49bc-ad26-1fd1e3098e88.png)



激活/关闭额外碰撞可攀爬性

额外碰撞生效时，可以单独调整其可攀爬功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuiob9dg1dm/283ca967-b3a2-4ab4-8612-235b6d9a505f.png)
