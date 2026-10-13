# 概念介绍/资产/界面控件/交互按钮界面控件

(来源：原神千星奇域·综合指南，页面 ID mhwkfsitckrw)

# 一、交互按钮的功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwkfsitckrw/ec3f16b8-ea84-466c-adb5-62f31e24d220.png)

关卡运行中，点击和外接设备输入，都可以触发该界面控件的交互。

支持玩家进行交互，在选择类型为“交互事件”时，交互后会向节点图发送 _界面控件组触发时_ 事件

# **二、交互按钮的编辑**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwkfsitckrw/8ba71a30-1660-4180-8541-96ac1cd3476f.png)

 _按键映射-键鼠_

提供PC按键供选择，作为输入交互项。选择后会显示在编辑窗口按键下方

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwkfsitckrw/de5fb1b2-719e-4a00-9043-6ed90dd0f0fc.png)

 _按键映射-手柄_

提供手柄按键供选择，作为输入交互项。选择后会显示在编辑窗口按键下方

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwkfsitckrw/3c721c54-bf49-4e43-b282-5f85661e4c0f.png)

 _大小_

可以修改交互按钮的大小，大的为64*64，小的为40.96*40.96

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwkfsitckrw/18bf6ee1-e70f-4159-acdc-0a8cf13a657c.png)

 _类型_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwkfsitckrw/b1bbaba7-3ec0-4f96-9c89-dbef7780f636.png)



按钮技能 

需指定一个技能，对应的图标和功能编辑详情可见角色技能编辑。[技能](/ys/ugc/tutorial//detail/mho81frl33im)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwkfsitckrw/31fd0633-9b62-43b1-a213-3f22343d9ff6.png)



交互事件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwkfsitckrw/ee8f5344-94cf-49af-a312-db3f834a9ae4.png)

代表触发后会向节点图发送事件

 _按钮图标_

通过操作![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwkfsitckrw/9f48eb95-3a56-4904-ba14-5484cdeeec3c.png)可以配置按钮的显示图形，并同步显示在编辑窗口。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwkfsitckrw/6409917b-3eed-4988-a3d5-10df54eeb763.png)

 _按钮冷却时间_

每次使用技能后，需要间隔该配置时间才能再次使用。并且在此期间，该按键图形会置灰

 _按钮次数限制_ __

若开启，则激活显示使用次数的配置及功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwkfsitckrw/37938112-008c-4752-bea3-09a20495cb9d.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwkfsitckrw/5b841e7f-c6c9-4c5a-bc7e-bdc2b5967442.png)

 _无次数时隐藏_

若开启，则当配置的玩家自定义变量数值为0时，按键隐藏

 _次数_



次数限制开启才开放配置。



根据不同的玩家，可以配置不同的使用次数，该次数只能读取对应玩家的自定义变量。



配置后的默认次数显示在编辑窗口内的按键上。



若需要次数变化，需要在节点图中编辑玩家的自定义变量使用情况。当配置的自定义变量变化时，按钮次数显示会同步变化。



使用道具

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwkfsitckrw/e2b2b5af-a4db-442d-8395-96ef6a2c1f3b.png)

 _选择变量_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwkfsitckrw/8781ec41-b8ff-4d7b-9f64-52fc1ad34431.png)

可以选择玩家自身实体的变量

 _无道具时表现_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwkfsitckrw/db24aade-c5f6-4b0f-b94a-289dfa9af808.png)

分为图标置灰、不显示图标、隐藏按钮三种情况

# 三、通过节点图管理交互按钮

**界面控件组触发时**

在关卡运行中，通过按钮界面控件制作的界面控件组，被执行交互操作会发送节点图事件”界面控件组触发时“，此事件只有触发交互的 _玩家_ 节点图可以获取

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwkfsitckrw/0726935c-2203-4558-ba6e-f222ea497877.png)
