# 概念介绍/功能/通用组件/扫描标签

(来源：原神千星奇域·综合指南，页面 ID mhfc0lr1tcke)

# 一、什么是扫描功能

扫描功能是指玩家在游玩关卡时，可以通过操作镜头来选取某一个实体的功能。

扫描选取的目标支持配置对应的特殊表现，例如特殊的图标提示或特效等。

在技能释放逻辑中，也可以通过相关节点图的节点来获取扫描到的目标，以达到选取特定技能目标的效果。

一个实体是否可以被扫描以及被扫描后具体的状态表现，可通过 _扫描标签_ 进行定义，并通过 _扫描组件_ 赋予元件和实体对应的逻辑。

# 二、扫描标签的编辑

一个 _扫描标签_ 对应了一种可扫描物的筛选逻辑和表现配置，需要预先在全局进行定义，从系统菜单的“扫描标签管理”可进入扫描标签定义界面

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/e8bdf31a-7abc-4376-8319-8729c6e3aef9.png)

进入扫描标签定义界面后，编辑界面会被划分为三个主要部分：

1.扫描标签列表

2.扫描标签效果预览

3.扫描标签生效逻辑配置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/5b394541-c562-4886-a0a1-0c4cf0a1caaa.png)

## 1.扫描标签列表

全局已定义的扫描标签会被汇总到该界面下，方便创作者(奇匠)进行全局的筛选和查询

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/a64d6ae1-d090-4957-83ba-35ce91da1178.png)

点击“新建扫描标签模板”按钮，即可新增一个扫描标签

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/682b0a14-4335-4550-96b8-f07e16fa126d.png)

## 2.扫描标签生效逻辑配置

该部分的配置决定了持有该标签的元件和实体，在运行时会以何种规则被扫描到，以及被扫描到时的相应表现，在配置上被分为“状态表现”和“生效条件”两个页签

### (1)基础定义

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/2a0460bd-b16c-47b5-9205-e7fad865ef9f.png)

 _扫描标签名称_ ：扫描标签的名称，仅作为识别用

 _配置ID_ ：数据类型为配置ID，是该扫描标签的唯一标识，用于在节点图内索引到此扫描标签

### (2)状态表现

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/3114e93a-87e1-4029-832b-4d33bb6b5262.png)

 _图标设置_ ：当一个带有该扫描标签的元件或实体被扫描逻辑选中时，会出现提示图标，此处配置图标的相关表现

 _选择图标_ ：可配置一个图标资源组，对应各种选中状态，支持配空，若为空则不会显示图标。图标同屏最多显示两个

 _挂接点_ ：该图标显示在实体对应名称的挂接点上

 _偏移_ ：图标显示的偏移

 _选中状态_ ：对于一个可扫描的实体，会存在三种选中状态，三种状态下的图标显示也各不相同

 _激活状态_ ：当前被扫描功能选中时的状态，同一时刻处于扫描标签激活状态的实体是唯一的

 _可用状态_ ：满足生效条件，但并未激活的状态，通常是由于存在其他优先级更高的目标已激活

 _禁用状态_ ：未满足生效条件时的状态

对应的运行时表现如下图所示：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/4483bed4-7239-4246-8ee6-573f7f18cc84.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/e7697553-66a8-4312-8c42-a9adf6817572.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/de2216c4-94ab-44c9-9b45-c4d3b446472b.png)

**特效相关配置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/30621081-a4fd-4f73-bb6c-4ff337ec311d.png)

 _激活状态特效_ ：当携带扫描标签组件的实体处于激活状态时，会被施加的特效配置

 _特效资产_ ：创作者(奇匠)可以在此选择一种合适的特效资产，作为施加的特效

 _挂接点_ ：特效被施加在对应的单位挂接点所在位置上，且会自动跟随挂接点的位置和旋转

 _缩放比例_ ：特效资产实际播放时的缩放比例

 _偏移_ ：基于上述挂接点位置的额外偏移

 _旋转_ ：基于上述挂接点位置的额外旋转

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/a82f4195-daf8-454e-af0b-3c1c97a4d2b2.png)

 _可用状态特效_ ：当携带扫描组件的实体处于可用状态时，会被施加的特效配置

可配置参数与激活状态特效一致

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/123651b8-fe5f-4315-bf6a-48d3ecdeb636.png)

 _禁用状态特效_ ：当携带扫描组件的实体处于禁用状态时，会被施加的特效配置

可配置参数与激活状态特效一致

### (3)生效条件

生效条件具体描述了一个可扫描实体的可用状态生效条件，即只有满足了所有生效条件，才会处于可用状态

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/42a598f1-1a12-4a51-a172-3a5d3a8665ce.png)

 _本地过滤器_ ：可选布尔过滤器和整数过滤器

 _过滤器节点图_ ：可关联上述选择类型的本地过滤器节点图，当本地过滤器的返回值不满足条件时，则该实体不参与状态计算，视为非扫描物

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/4a8ebb4f-238b-4a8b-a817-f1826a910b78.png)

 _障碍检测_ ：障碍检测用于确认本地客户端操作的角色和扫描物实体之间是否射线可见，即本地角色和扫描物之间是否有阻挡，开启障碍检测后，如果射线检测不通过，则该实体变为禁用状态

 _障碍检测点_ ：扫描物身上的单位挂接点名称，射线检测的目标点

 _忽略水面_ ：开启时，如果检测到玩家和实体间有水面阻挡，会进行忽略，认为没有阻挡

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/59e29439-ff4c-4701-867e-a6e1ee581b78.png)

 _距离检测_ ：用于定义一个扫描物实体的可用范围，即定义了扫描物和本地角色在什么样的距离范围下是可用的

 _距离检测点_ ：在进行距离检测时，基于配置的单位挂接点的位置进行判定

 _检测距离范围_ ：如果扫描物实体不在配置的范围内，则变为禁用状态，其范围在场景内可直接进行预览

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/47966b1c-707e-4e2b-8ec3-7715944fd0ce.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/c6b1393a-611d-4264-a2e0-e57593142187.png)

 _视线检测_ ：视线检测用于确认本地镜头位置和扫描物实体之间是否射线可见，即本地镜头和扫描物之间是否有阻挡，开启视线检测后，如果射线检测不通过，则该实体变为禁用状态

 _视线检测点_ ：扫描物身上的单位挂接点名称，射线检测的目标点

 _忽略水面_ ：开启时，如果检测到本地镜头和实体间有水面阻挡，会进行忽略，认为没有阻挡

 _忽略障碍阻挡_ ：开启后视线检测将直接视为通过

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/a673bebc-312a-414b-a14d-c2d7eef3d5f7.png)

 _视野范围设置_ ：该检测要求在屏幕坐标系下，扫描物实体必须处于屏幕中心的椭圆形区域内，否则该实体变为禁用状态

 _视野检测点_ ：基于实体上配置的单位挂接点位置进行检测

 _椭圆横轴比例_ ：椭圆的左右边界占屏幕的比例

 _椭圆纵轴比例_ ：椭圆的上下边界占屏幕的比例

点击下方“预览视野范围”，即可直观地浏览实际生效的范围，如下图：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/0d8fc67d-d9fb-4ba1-be93-af78d6a40b22.png)

# 三、扫描标签组件的编辑

## **1.添加组** 件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/9c5df930-45fe-4187-b585-e1e8bac76125.png)

(1)在实体或元件编辑界面中，打开组件编辑页签

(2)点击下方的“添加组件”，选择并点击“扫描标签”，成功添加

## **2.** 扫描标签组件的配置

扫描标签组件可以配置多个备选的扫描标签模板，但运行时只有一个扫描标签可以生效，可以使用节点图进行动态切换

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/c1819c8c-9e08-47da-bc91-0d7c50b64534.png)

 _初始生效_ ：默认生效的扫描标签

 _扫描标签列表_ ：该组件持有的全部扫描标签

点击详细编辑，可进入详细编辑界面

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/a1643745-a438-49c6-a017-b2e52c2c0dbf.png)

此界面下，点击新增按钮即可新增一个扫描标签，并配置对应的扫描标签模板引用

 _扫描标签序号_ ：用于节点图动态切换时的标识

 _初始生效_ ：可以修改该扫描标签是否初始生效，同时只有一个扫描标签可以生效

 _引用扫描标签_ ：可选择预先定义好的全局扫描标签进行引用

# 四、扫描标签的筛选逻辑

上文生效逻辑配置部分介绍了单个扫描物在何种条件下会被视为可用状态，当有多个处于可用状态的扫描物同时在场时，只有唯一的一个扫描物会被设置为激活状态，其筛选规则通过职业属性“扫描标签识别规则”定义

更多的职业介绍可查看[职业](/ys/ugc/tutorial//detail/mhodlcrpht3q)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/052c0b27-ab10-4488-942b-c808e07d506b.png)

 _扫描标签识别规则_ ：以何种规则在全部的可用扫描物中筛选出激活的单位

 _视野中心距离_ ：优先激活距离视野中心最近的扫描标签

 _实际位置距离_ ：优先激活距离玩家角色最近的扫描标签

# 五、扫描标签节点图节点

## 1.服务器节点



设置扫描标签的规则

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/a82264d1-b813-4efa-9e65-f07122e49fe8.png)



设置扫描组件的生效扫描标签序号

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/773dbd6c-12d3-4537-9dd1-20b34075b14c.png)



获取当前生效的扫描标签配置ID

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/79af426c-ecc3-43b7-b408-658f87ae8165.png)

## 2.客户端节点



获取扫描组件可扫描的所有合法对象

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/16a0160f-d20a-4944-8be7-4778be4d5bc3.png)



获取扫描组件当前扫描到的实体

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/f5fc0ff6-82d1-4927-9759-6bf0be2f3bbb.png)



获取实体当前生效的扫描标签

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/198d8def-ace6-47f4-bdfb-091a3c0656bd.png)



获取实体扫描状态

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfc0lr1tcke/4fc6e0ba-aa20-44b7-88e5-6b80465f6ada.png)
