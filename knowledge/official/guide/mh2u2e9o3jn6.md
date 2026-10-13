# 概念介绍/资产/界面控件/悬浮交互页控件

(来源：原神千星奇域·综合指南，页面 ID mh2u2e9o3jn6)

# 一、悬浮交互页的功能  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/aea61c80-9158-4f82-a347-1a9629f3787e.png)

 _悬浮交互页_ 界面控件提供高级的页签、单选项视窗等一系列配置，便于奇匠配置较为复杂的关联界面。支持添加各种按键、开关，用来丰富功能和表现

关卡运行中，可通过节点图唤起悬浮交互页

支持玩家进行交互，并根据奇匠的静态配置，在展开/关闭页签或单选项视窗时，可以触发服务器节点图事件

悬浮交互页出现断线重连等异常行为，不会恢复

# **二、** 悬浮交互页**的编辑**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/1d3a3cfe-55de-4be1-a5c8-f9d02f3cf930.png)

## **1.添加悬浮交互页**

在 _界面控件组编辑窗口_ ，添加界面控件模板-悬浮交互页

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/614cb4e1-63b7-4062-8c3a-cd112c9160a0.png)

## 2.悬浮交互页设置

### (1)基础

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/6edbc6f4-7057-4988-a337-0d1e235e491e.png)

### (2)样式

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/d66de2d2-227a-4768-b7fd-b59b7951c486.png)

 _使用预设背景_ ：开启后可以在预设背景中选择一个，关闭则使用默认背景

 _选择预设样式_ ：从预设的样式中选择一个

 _页面容器_ ：容器是一个用于划分悬浮交互页内部控件信息结构的概念，可以根据界面的信息结构，对控件的容器进行划分。可以将每个容器理解为一个单独的页面

 _初始生效_ ：可以决定哪些容器初始生效

 _视窗容器列表_ ：会显示当前所有的容器

点击【详情编辑】会进入 _悬浮交互页编辑界面_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/43e55e81-75ef-4b92-988c-4427d6123faf.png)

### (3)功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/3b5834b6-7c08-4d20-8823-af07fb636364.png)

 _单人游玩打开页面时暂停游戏：_ 若勾选则当关卡为单人关卡时，打开悬浮交互页进行操作的时候会暂停游戏

注意：在暂停游戏时，音效资产库中环境、生物敌人叫声、角色动作、战斗、物件内包含的音效资产会跟着游戏暂停一同暂停。而界面音效中包含的音效资产不会随之暂停而是会继续播放

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/79e982b9-c613-44e7-92b6-fc0b44115fac.png)

 _手柄初始选中控件_ ：可以在悬浮交互页编辑界面内配置的控件中选择一个

 _打开音效_ ：打开该悬浮交互页时触发的音效资产

 _关闭音效_ ：关闭该悬浮交互页时触发的音效资产

 _形式变量管理_ ：每个悬浮交互页都支持配置一组形式变量，当素材库中引用了对应形式变量时，会以当前悬浮交互页的形式变量值为准

形式变量的映射关系，需要确保数据类型一致

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/120efc94-a15c-40e2-9d0e-1ceeade39f5f.png)

# 三、悬浮交互页编辑界面

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/ed4941f7-924e-44cd-ad69-e980586c3fb2.png)

悬浮交互页相当于打开了一个新的“界面布局”，在该页面也可以添加对应的界面控件并修改对应配置

不同的是，有一些界面控件是悬浮交互页专有的

## 1.交互页关闭按钮

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/a5aa5195-f83d-44be-b41a-c93cd9c1ba59.png)

交互页关闭按钮是悬浮交互页默认携带的界面控件，支持点击关闭整个悬浮交互页及其内包含的所有控件

交互页关闭按钮在固有容器中不可删除

若在悬浮交互页中配置固有容器不生效（即不包含该关闭按钮时），PC端支持使用ESC进行关闭，手柄端使用退出键也可以进行关闭，移动端则需要通过节点图关闭悬浮交互页

### (1)基础

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/9b1f703d-397d-46fd-814d-45595f459b97.png)

### (2)样式

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/8468c6e9-ac29-4aeb-8ab7-b0e4079e67bc.png)

 _样式_ ：支持选择 _预设样式、自定义_



**预设样式**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/5e7cdda9-f485-438d-ad67-ad110e198d2c.png)

可以选择不同的预设按钮样式，部分预设样式支持自定义图标、颜色、和文本等

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/62833317-64a3-40ab-b79a-9c5f933d88e2.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/9708516a-7b05-4b35-a564-8924c2186747.png)



**自定义样式**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/31a41f7e-8cde-4d18-b532-f885da4304ae.png)

可以自由配置默认状态、悬停状态、按下状态的素材

### (3)功能



**按键设置**

按键设置不可修改，对应PC端和手柄端的关闭功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/d0423aa8-a17f-4c48-ba8e-5f814dbf00e3.png)



**响应点击区域**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/95e7ed3e-9398-45ac-9f11-05fbf16c3e33.png)

当且仅当配置样式为自定义时，支持配置点击区域

支持在编辑窗口中直接拖动，调整点击区域

实际触发以此点击区域配置的大小为准

配置参数| 说明  
---|---  
 _是否可点击_|  若不开启，则本按钮无点击交互功能  
 _点击区域预览_|  开启后，编辑窗口对应控件中浅黄色区域则为点击区域![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/853fa86a-5b54-44a2-9181-5f43cade7092.png)  
 _位置偏移_|  点击区域和中心位置的偏移配置仅支持自定义按钮使用，关闭按钮无法改动  
 _尺寸_|  点击区域的大小仅支持自定义按钮使用，关闭按钮无法改动  
  


**手柄导航**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/1c87faa8-64c8-46f1-a621-551f578d532a.png)

当手柄遥感悬浮于按钮之上时，支持配置导航提示

配置参数| 说明  
---|---  
 _可被手柄摇杆导航选中_|  若开启，则在手柄悬停时，会给予配置提示显示  
 _手柄导航提示样式_|  支持选择预制样式  
 _导航提示指向_|  可上下左右，配置效果可参考![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/0e30aeca-98f7-49ca-be7a-c74e351c5034.png)  
 _导航提示偏移_|  可配X/Y的偏移  
 _向左/右/上/下_|  手柄从此处悬停移动时，优先吸附配置默认距离最近的控件支持选择所有已配置的容器中的控件  
  
## 2.页签

### (1)基础

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/e191fb06-40bc-4ea8-81f1-3921c87fa671.png)

### (2)样式

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/25406ae8-d8de-44e4-97b8-4865fe99356f.png)

 _样式_ ：支持选择 _预设样式、自定义_

两种样式都需要配置滚动方向

**横向**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/fe74a3d6-0c1a-4a26-a3a7-5b379819c242.png)

**纵向**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/2ad5e681-b8d1-457a-b05b-6b5fe6187a82.png)



**预设样式**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/615025aa-7de7-4825-b6b8-382d6c5f2bb1.png)

可以选择不同的预设样式

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/e9855afe-58cc-46a3-acf5-467e3f7fea97.png)



**自定义样式**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/31b5919c-bc68-4096-bc69-181ab034b5b2.png)

支持通过添加样式，提前配置多种页签项样式

每种样式可以自由配置默认状态、悬停状态、按下状态、选中状态的素材

### (3)功能

#### **a.页签设置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/4f348d91-0696-447a-a7a2-c62bcaaa29e6.png)

配置参数| 说明  
---|---  
 _页签项尺寸_|  每个页签项的通用配置  
 _间距_|  页签项和页签项之间的间距  
 _边距_|  距离边框的上下左右边距配置  
 _未撑满时居中_|  若开启，会辅助整体调整页签项居中  
  
#### **b.页签项配置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/de760bb1-5404-4b82-9cce-a7f6a1307910.png)

支持奇匠提前定制页签项，支持静态配置关联页签项，在关卡运行中也支持通过节点图调整显示内容

页签项支持配置点击时的反馈，包括唤起页签、控件状态显隐等

根据奇匠选定样式的预设样式/自定义，页签项的配置也会略有不同



**添加页签项**

详情编辑中，通过加号增加新的页签项

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/da4568c7-4d41-44bb-bef7-34160be7def7.png)

配置参数| 说明  
---|---  
 _页签名称_|  该页签项的名称  
 _序号_|  页签项的唯一标识  
  


**基础设置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/5771497d-9bc9-4a90-8ccd-84f624efd9c1.png)

配置参数| 说明  
---|---  
 _页签名称_|  该页签项的名称  
 _页签样式_|  可选择上一层中，页签样式中配置的样式  
 _预览选中状态_|  勾选则会在编辑窗中，显示默认显示配置  
 _返回服务器事件_|  当关卡运行时，点击此页签项，会触发【悬浮交互页操作触发时】服务器节点图事件  
  


**形式变量配置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/e0df26ae-f04d-41d3-bc89-e683c9ad8ec9.png)

将形式变量与指定数据，或者玩家自定义变量进行关联

在本页签项中若有素材引用形式变量，则会以对应配置的自定义变量实时数据为准



**容器状态设置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/b278f1fd-9f89-473c-80c4-c9b8ea563544.png)

支持添加页面容器，并配置每个页面容器的**显示、隐藏** 状态

当选择当前页签项时，配置的页面容器会根据该配置进行显隐



**控件状态设置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/fe17f896-a082-49d1-9f2d-2be91ae6aa10.png)

支持添加页面容器内的控件，并配置每个控件的**显示、隐藏** 状态

当选择当前页签项时，配置的控件会根据该配置进行显隐

#### c.交互设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/e5591ed4-b233-4672-bd97-5b8f7081faf0.png)

启用对应快捷键时，支持通过快捷键对该页签进行交互

交互该页签时会触发配置的音效

#### d.手柄导航

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/8e378613-84f9-43f6-af01-fd58423d6d6e.png)

页签开启手柄快捷键时，不能触发手柄导航功能

不开启手柄快捷键时，可参考交互页关闭按钮中对应的配置描述

## 3.单选项视窗

### (1)基础

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/78a731c8-7174-42dc-8a1d-bea10f0cedda.png)

### (2)样式

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/1e75b110-78c4-41fd-902f-ca1f196e9841.png)

单视窗的样式仅支持自定义样式

支持通过添加样式，提前配置多种页签项样式

每种样式可以自由配置默认状态、悬停状态、按下状态、选中状态的素材

### (3)功能

#### **a.列表设置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/9580c03a-236d-4e5c-8424-586b9a989a71.png)

配置参数| 说明  
---|---  
 _滚动方向_|  横向/纵向  
 _列表项大小_|  每个列表项的通用配置  
 _列表项间距_|  列表项之间的距离间隔  
 _边距_|  距离边框的上下左右边距配置  
 _未撑满时居中_|  若开启，会辅助整体调整页签项居中  
 _排列限制_|  自动换行/固定行数  
  
#### **b.列表项配置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/1e9d4f1f-7ec1-466e-8e2e-b2311503dcb1.png)

支持奇匠提前定制列表项，支持静态配置关联列表项，在关卡运行中也支持通过节点图调整显示内容

列表项支持配置点击时的反馈，包括唤起页签，控件状态显隐等



**添加列表项**

详情编辑中，通过加号增加新的列表项

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/a63eed1b-0fd0-4c51-b8a5-31223ad72f92.png)

配置参数| 说明  
---|---  
 _列表项名称_|  该列表项的名称  
 _序号_|  列表项的唯一标识  
  


**基础设置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/775580d2-6f24-49f6-bfd7-ac03853a375a.png)

配置参数| 说明  
---|---  
 _列表项名称_|  该列表项的名称  
 _列表项样式_|  可选择上一层中，列表样式中配置的样式  
 _预览选中状态_|  勾选则会在编辑窗中，显示默认显示配置  
 _返回服务器事件_|  当关卡运行时，点击此列表项，会触发【悬浮交互页操作触发时】服务器节点图事件  
  


**形式变量配置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/0ecaf544-c55c-4edc-99f8-68eab7749c10.png)

将形式变量与指定数据，或者玩家自定义变量进行关联

在本页签项中若有素材引用形式变量，则会以对应配置的自定义变量实时数据为准



**容器状态设置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/6ccfec5f-9311-4e6e-9465-3b147a9694b3.png)

支持添加页面容器，并配置每个页面容器的**显示、隐藏** 状态

当选择当前页签项时，配置的页面容器会根据该配置进行显隐



**控件状态设置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/275de646-b8b0-4fcd-a482-4c83cce587ab.png)

支持添加页面容器内的控件，并配置每个控件的**显示、隐藏** 状态

当选择当前页签项时，配置的控件会根据该配置进行显隐

#### c.交互设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/25fd5686-06db-4b50-971f-3ab092be6127.png)

交互该单选项视窗时会触发配置的音效

#### d.手柄导航

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/386d7738-1426-43f9-96e6-4b1f28de975f.png)

当手柄遥感悬浮于按钮之上时，支持配置导航提示

配置参数| 说明  
---|---  
 _可被手柄摇杆导航选中_|  若开启，则在手柄悬停时，会给予配置提示显示  
 _手柄选中规则_|  支持配置**切换焦点时选中/按下确认后选中**  
 _手柄导航提示样式_|  支持选择预制样式  
 _导航提示指向_|  可上下左右，配置效果可参考![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/05491dc0-8045-4313-9594-b6aa272df548.png)  
 _导航提示偏移_|  可配X/Y的偏移  
 _向左/右/上/下_|  手柄从此处悬停移动时，优先吸附配置默认距离最近的控件支持选择所有已配置的容器  
  
# 四、通过节点图管理悬浮交互页

悬浮交互页有一些特殊的控件，其中页签和单选项视窗的功能比较相似，参数的管理也是一致的，因此针对节点对其引用和出参的情况，我们统称页签和单选项视窗为【列表】

唤起悬浮交互页

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/90fbebd6-33d6-4c14-89ce-e29ba29db556.png)

关闭悬浮交互页

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/a3d8858d-ffc0-431b-b9fa-d4283d698a9a.png)

更新悬浮交互页列表数据

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/63499cde-7309-4182-805c-0e5defe5a8ab.png)

悬浮交互页操作触发时

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/7098a31b-1a3b-47f6-a509-2fe0cb265600.png)

# 五、悬浮交互页控件与手柄导航

## 1.支持手柄导航的控件

交互按钮，道具展示，自定义按钮，自定义开关这类可交互的界面控件被添加至悬浮交互页内时，会额外提供【手柄导航】的配置，此外：页签，单选项视窗，文本视窗这些仅能在悬浮交互页中使用的控件，也支持【手柄导航】的配置。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/89a0acf5-675a-4e05-a906-1d7f124e7ead.png)

## 2.手柄导航提示

如图所示，在悬浮交互页控件中，左下框内类型的控件可以被设置为手柄导航的对象，若希望控件能够被手柄摇杆导航选中，可开启“可被手柄导航选中”开关。

控件在成为手柄导航对象后，会以图中的箭头提示，可以选择导航提示箭头的样式，朝向以及位置偏移。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/bfa4adc6-36ea-4439-9dd9-34532f0b212f.png)

## 3.手柄导航的规则

可以通过图示中 向左/向右/向上/向下 的参数，指定当手柄导航焦点位于当前控件时，玩家向左/向右/向上/向下推动摇杆后，希望焦点移动到的目标控件对象。

默认导航规则为：移动到当前摇杆方向上中心点距离最近的控件。

可通过控件列表指定希望跳转到的控件对象，或者不进行跳转。![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/63f45ad4-4737-42d4-aae4-67ef39f1c0d1.png)

## 4.导航焦点与按键

除页签，文本视窗外的控件在成为手柄导航的对象时，均能够响应固定确认按键![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/a07b6d6d-dcb9-4f5c-a411-954ffd94a336.png)或![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2u2e9o3jn6/2d79fc16-6041-42ef-86c2-eb752d090f0d.png)（取决于玩家的系统按键设置），若控件自身额外配置了快捷键，则还能同时响应手柄快捷键。

## 5.手柄端界面适配设计教学

关于手柄端玩法界面设计的更多说明，可参考教程：

[界面控件——手柄适配引导](/ys/ugc/tutorial/course/detail/mhjobxrdykym)
