# 基础功能逻辑&玩法流程/2.1碰撞与交互——触发一个事件

(来源：原神千星奇域·教程，页面 ID mhumsn9uap96)

# 前言

## 课程说明：

**课程内容：** 【组件-碰撞触发器】和【组件-选项卡】的使用方式

**学习目标：** 学会使用碰撞触发器和选项卡发出事件，可用于制作拾取条件判断、触发特效、触发机关等功能（可在触发事件后自由编写，教程中不一一列举）

 _**该课程中涉及【编辑器面板配置】和【 千星沙箱节点图】两个模块内容，并且相互关联，阅读时建议按照课程顺序完整阅读_

## 相关信息：

**推荐学习顺序：** 【当前课程】→【综合指南】

 _**如课程中遇到概念不清等问题或想要了解更多相关信息，根据需要查询【综合指南】即可_

**关联知识点：** 课程中将涉及以下基础概念 _（建议优先根据该课程学习即可，如遇到概念不清等问题或想要了解更多相关信息，再根据需要查阅_** __【综合指南】__** _相关章节）_

> [碰撞触发器](/ys/ugc/tutorial//detail/mh8w69rzuc3i)
> 
> [选项卡](/ys/ugc/tutorial//detail/mh5jko05fzyw)

* * *

# 碰撞触发器——通过碰撞触发事件

## 功能示例-1：进入区域后，拾取物品

### 1.概念简述

**碰撞触发器：** 通过配置触发器和触发检测范围，当特定目标进入/离开某区域后发出事件

### 2.教学内容

**功能效果：** 制作可被拾取的道具，进入拾取范围后自动拾取

**效果演示：**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/e6de16af-2a79-4d1a-9775-4375fd65c343.gif)

###  3.操作步骤

**1.【局内编辑器】添加组件**

创建一个元件作为交互物（教程以挑战币为例），在面板中点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/5e6bbd83-66d7-45fe-8568-c02abd31be54.png)>>>进入组件页，点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/65e329b3-009d-43a0-b199-c4a89e721014.png)>>>选择【碰撞触发器】即可添加

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/8ed15ca8-2477-4660-a705-9f5e6eea75c9.png)

**2.【局内编辑器】添加触发器**

打开【组件-碰撞触发器】后，默认不含有触发器，点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/960016ed-6bf9-4ace-883c-19ed88363757.png)即可添加触发器（可同时添加多个触发器制作不同触发功能切换的效果）

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/86128958-eb95-4380-8338-78e6178a0b06.png)

**3.【局内编辑器】配置面板参数**

为达到预期的功能效果，教程中配置如下：

要做的功能| 对应的配置项  
---|---  
仅玩家单位能触发拾取（物件/造物（怪物）进入区域后不会拾取）| 【生效目标】调整为仅角色  
有一定的拾取范围| 【缩放倍率】调整大一些  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/6305c17b-bab8-46df-998a-ec781dbedaaa.png)

配置完成后，可在当前界面直接预览实际运行时触发区范围效果

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/aace52d0-5597-49d7-8a52-189a72d20fb3.png)

此外，还可在面板中配置触发器的【是否初始生效】、【触发区形状】、【范围】等规则，实际使用时可根据需求自由调整

 _**配置项说明：_

 _初始生效：是否随物体创建时展示（开启后默认生效，关闭后需要通过节点图动态开启）_

 _生效目标：可配置角色、物件、造物（怪物）（由于选项卡只能由角色选择，因此无需额外配置）_

**4.【 千星沙箱】节点图配置**

在实体节点图中，添加并配置该元件的节点图（设置参考见下图），为达到预期的功能效果教程中配置如下：

|  | 要做的功能| 对应的配置项  
---|---|---|---  
功能进入区域后拾取物品| 触发场景| 进入范围后拾取| 【事件节点】：进入碰撞触发器时（从外部进入，接触到配置的区域时触发）  
条件| /| /  
结果| 拾取金币| 【执行节点】：使用【销毁实体】制作拾取效果  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/dcd260dc-7e43-492c-b1c9-0a05b7e59af3.png)

此外，还可以使用其他碰撞触发器节点制作功能（如：制作基地泉水系统，进入回血，离开取消回血等）

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/0b9af033-701a-49d9-9bfb-3549fddbd8f5.png)

**5.【局内编辑器】挂载节点图**

将配置的节点图挂载在该元件上，保存元件设置

 _**该项为基础操作，教学示例仅演示一次，注意不要挂载错误或漏挂载即可_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/bbcdb48a-d102-420d-b69e-ccdc092a151c.png)

**6.【局内编辑器】放置元件，试玩体验**

将制作好的元件放置在场景中，进入试玩即可体验该功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/e6de16af-2a79-4d1a-9775-4375fd65c343.gif)

 _**更多相关信息可自行查阅【综合指南-碰撞触发器组件】_

# 选项卡——通过交互选项触发事件

## 功能示例-2：交互选项后，开启宝箱

### 1.概念简述

**选项卡：** 在碰撞触发器的基础上封装了原神原生的对话选项，即进入选项触发区域后，会弹出选项卡列表；通过配置选项，当玩家交互选项后发出事件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/d8112fe7-8ef0-4ef4-9667-292786500cbb.png)

### 2.教学内容

**功能效果：** 制作可进行交互的宝箱，进入范围后可进行交互，交互后开启宝箱

**效果演示：**

 _**演示中的文本显示，需达到特定奇匠等级后解锁【自定义文本外显】功能，教程中以效果展示为主_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/76c7cce3-ee8e-45e7-875b-d18fc08f31cb.gif)

###  3.操作步骤

**1.【局内编辑器】添加组件**

创建一个元件作为交互物（教程以宝箱为例），在面板中点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/f59fbb33-92a1-4b8e-961f-8b2f8bc6aa10.png)>>>进入组件页，点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/65e329b3-009d-43a0-b199-c4a89e721014.png)>>>选择【选项卡】即可添加

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/3ffa1fcc-6db7-4c92-b26e-f42418f77f1d.png)

**2.【局内编辑器】预设状态-交互表现**

教程中选择的宝箱具有【预设状态】可以用于简便制作开箱效果，查看确认面板中的【预设状态名称】和【状态值】即可

 _**【预设状态】指封装的物件的一种动画状态（如：箱子开关、金币旋转、拉杆开关等），当前仅部分物件具有预设状态，更多相关信息可自行查阅【综合指南-预设状态】_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/9c9c49f9-56f2-4786-8d38-e4cbdb2dbdb1.gif)

**3.【局内编辑器】配置面板参数**

为达到预期的功能效果教程中配置如下：

要做的功能| 对应的配置项  
---|---  
有一定交互引导提示，以“开启宝箱”为例| 【选项卡列表-选项文案】设置为开启宝箱  
有一定的可交互范围| 【触发选项区域-缩放倍率】调整大一些  
  
 _**由于打开【组件-选项卡】后，默认含1个选项和1个触发选项区域，教程中无特殊需求因此不进行添加，实际使用时可根据需要，点击【添加选项卡】或【添加触发区域】可另行添加新的配置项_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/989d47af-e593-4ad3-8ab5-4286b29f1c4a.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/94adfaa1-efb8-4922-a2c0-7dcc8af05f1b.png)

配置完成后，可在当前界面直接预览实际运行时触发区范围效果

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/fcfff5ec-6104-4cc0-9ed0-6c5adb0febe4.png)

此外，还可在面板中配置选项卡的【是否初始生效】、【排序等级】、【选项图标】、【触发区形状】等规则，实际使用时可根据需求自由调整

 _**配置项说明：_

 _初始生效：是否随物体创建时展示（开启后默认生效，关闭后需要通过节点图动态开启）_

 _选项卡：可配置不同选项（如：可配置多个选项用于触发不同的事件，教程中仅配置了1个）_

 _排序等级：影响选项的排序顺序（等级数字越大，排序越前；等级数字相等则按添加顺序排序）_

 _本地过滤器：通过特殊的本地过滤器节点图，进一步判断选项卡的是否显示（如：对不同玩家展示不同内容）_

**4.【千星沙箱】节点图配置**

在实体节点图中，添加并配置该元件的节点图（设置参考见下图），为达到预期的功能效果教程中配置如下：

|  | 要做的功能| 对应的配置项  
---|---|---|---  
功能交互后开宝箱| 触发场景| 交互选项后触发| 【事件节点】：选项卡选中时（交互选择“任意”选项时触发）  
条件| /| /  
结果-1| 开启宝箱| 【执行节点】：使用【设置预设状态】制作开箱效果  
结果-2| 开启宝箱后不能再进行开启| 【执行节点】：使用【激活/关闭选项卡】将选项关闭达到无法再次交互的效果  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/0dbd6c10-db0c-4fb4-be25-f92d291774eb.png)

**5.【局内编辑器】挂载节点图**

将配置的节点图挂载在该元件上，保存元件设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/50c3454f-c1de-4938-9efb-1162cd683628.png)

**6.【局内编辑器】放置元件，试玩体验**

将制作好的元件放置在场景中，进入试玩即可体验该功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/5d93e73a-fab2-4fe2-a463-3f2c7c3aeb40.gif)

 _**更多选项卡相关信息可自行查阅【综合指南-选项卡组件】_

#  拓展应用

该模块仅作为教学课程所能拓展应用的功能简述，涉及到多模块联动，以操作步骤演示为主，了解进阶用法即可

## 功能示例-3：玩家拾取特定物体后，可开启机关

**功能说明：** 玩家进入钥匙碰撞触发区后可获得钥匙，添加自定义变量作为判断条件，交互宝箱时判断玩家是否具有钥匙（对自定义变量进行判断），符合条件则开启宝箱

**效果演示：**

 _**演示中的文本显示，需达到特定奇匠等级后解锁【自定义文本外显】功能，教程中以效果展示为主_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/24ae4dab-98d8-4cd0-a401-22888c7b0907.gif)

**实现步骤：**

1.在【玩家】上，添加自定义变量，命名为【是否有钥匙】，类型为【布尔值】，初始值为【否】

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/43d2fa0c-9d97-4484-ac75-060b9ecc04d2.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/b6f30a2b-faaa-4619-be86-7871dff20217.png)

2.创建一个元件A，作为钥匙

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/0c4827fe-dd32-4516-bdcf-f33caf6ef660.png)

3.在元件A上，添加【组件-碰撞触发器】，并按需配置触发器和触发区域规则

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/03e47d6b-c81d-49bc-927c-ed6a536ae683.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/643f0d21-3618-427f-ab4c-1f25ffa9574a.png)

4.配置元件A的节点图（设置参考见下图）

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/c73c6104-9616-4132-8be4-c8696e6041d7.png)

5.将元件A的节点图挂载在元件A上，保存设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/1941bc72-8dbf-4328-97c3-82cf1e9ce01e.png)

6.创建一个元件B，作为交互机关（教程中选择珍贵的宝箱，该物体具有开/关箱子的预设状态）

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/e7340e3e-3347-4b86-bb8b-d97e6baf6aae.png)

7.在该元件上B，添加【组件-选项卡】，配置选项文案、图标等，并配置选项触发区域范围

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/4912bed9-c04e-4fca-8c3e-daf18c387d73.png)

8.配置元件B的节点图（设置参考见下图）

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/5e1a4169-8bbf-476c-8b4c-77fd548fbb13.png)

9.将元件B的节点图挂载在元件B上，保存设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/c5505bc8-0019-4cdd-9b59-beab75604727.png)

10.将元件A和元件B放置在场景中

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/bf8d4310-3398-4e97-a235-a01d9cde28b1.png)

11.进入试玩，即可体验该功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/24ae4dab-98d8-4cd0-a401-22888c7b0907.gif)

## 功能示例-4：不同条件下展示不同的选项（过滤器节点图的使用，在功能示例-3的基础上进行改造）

**功能说明：** 玩家没有钥匙时，宝箱交互项为“需要获取钥匙后才能打开”，有钥匙后，宝箱交互项为“开启宝箱”

**效果演示：**

 _**演示中的文本显示，需达到特定奇匠等级后解锁【自定义文本外显】功能，教程中以效果展示为主_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/de2e09ae-3032-4e66-958b-74df6a1fa580.gif)

**实现步骤：** 步骤1~6，9~12与功能示例-3完全一致（不再额外说明），仅7~8有差异

1.在【玩家】上，添加自定义变量，命名为【是否有钥匙】，类型为【布尔值】，初始值为【否】

2.创建一个元件A，作为钥匙

3.在元件A上，添加【组件-碰撞触发器】，并按需配置触发器和触发区域规则

4.配置元件A的节点图

5.将元件A的节点图挂载在元件A上，保存设置

6.创建一个元件B，作为交互机关（教程中选择精致的宝箱，该物体具有开/关箱子的预设状态）

7.配置元件B的过滤节点图（设置参考见下图）过滤节点

 _**此处教程使用的是【布尔型过滤节点图】，布尔型过滤可读取节点图输出结果的【是/否】（需在客户端节点资源管理器中查看，打开方式：千星沙箱左上角“窗口” >>>客户端节点资源管理器）。_

 _-如果最终输出为【是】，引用过滤节点图的选项卡_** _生效_** _，玩家视角可以看到该选项（展示）_

 _-如果最终输出为【否】，引用过滤节点图的选项卡_** _不生效_** _，玩家视角看不到该选项（不展示）_

 _**更多过滤节点图相关介绍，可见后续课程_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/6088722c-85f6-42a6-b4c5-03593ed47543.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/40d005b7-1a16-460b-ae99-f56a8bd303b7.png)

8.在该元件上B，添加【组件-选项卡】，配置选项文案、图标、过滤节点图等，并配置选项触发区域范围

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/ecfcc71d-ab23-420e-8248-9a2107d576de.png)

9.配置元件B的节点图（设置参考见下图）

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/93fc1874-aaff-4fbf-8d0b-ac47c1627ccf.png)

10.将元件B的节点图挂载在元件B上，保存设置

11.将元件A和元件B放置在场景中

12.进入试玩，即可体验该功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/7ae125c2-aec9-4345-ad82-630bd4770058.gif)

* * *

# 课程总结及辅助课件

**课程作业：** 可根据课程教学内容尝试进行以下功能复刻/拓展

> **功能复刻：** 制作开关A打开宝箱B
> 
> **进阶拓展：** 制作简易的任务系统，首次对话接取任务“获取金币-拾取5个金币”，满足条件后可提交任务，不满足条件则展示“当前未完成”

**课程回顾：** 学习如何使用【组件-碰撞触发器】或【组件-选项卡】发出事件，制作各类触发交互机关或道具

### 辅助课件

我们提供了上述课程内容相关的工程文件，可结合** _【教学存档-碰撞与交互】_** 对照学习

![](https://webstatic.mihoyo.com/upload/static-resource/2022/10/14/64e71b8a5e28fbdbc3d3df5d311e4154_847866555738962172.svg)

碰撞与交互.gil

44.1 KB

[](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhumsn9uap96/b9ce9419-0385-44c6-86d0-dfead1e6b1ca.gil)
