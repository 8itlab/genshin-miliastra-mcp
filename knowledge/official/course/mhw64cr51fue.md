# 基础功能逻辑&玩法流程/2.10环境配置——天空背景、游戏滤镜和光源的使用

(来源：原神千星奇域·教程，页面 ID mhw64cr51fue)

# 前言

## 课程说明：

**课程内容：** 该课程主要讲解关卡环境配置制作与使用案例。

**学习目标：** 学会如何配置天空盒，滤镜以及点光源，提升关卡整体氛围表现。

 _**该课程中涉及【局内编辑器面板配置】和【千星沙箱节点图】两个模块内容，并且相互关联，阅读时建议按照课程顺序完整阅读。_

##  相关信息：

**推荐学习顺序：** 【前置课程】→【当前课程】→【综合指南】

 _**如课程中遇到概念不清等问题或想要了解更多相关信息，根据需要查询_** __【综合指南】__** _即可_

**前置课程：** 该课程与以下前置课程所讲述的功能知识点相关 _（建议首次使用时，优先学习_** __【前置课程】__** _，学习体验更流畅）_

> [2.1碰撞与交互——触发一个事件](/ys/ugc/tutorial/course/detail/mhumsn9uap96)

**关联知识点：** 课程中将涉及以下基础概念 _（建议优先根据该课程学习即可，如遇到概念不清等问题或想要了解更多相关信息，再根据需要查阅_** __【综合指南】__** _相关章节）_

> [环境配置](/ys/ugc/tutorial//detail/mhdznsie9up8)

* * *

# 环境配置——改变天空背景相关参数

## 功能示例-1：通过环境配置制作夜晚场景效果

### 1.概念简述

**环境配置：** 可以对关卡的天空盒、滤镜、光源等进行设置

**天空盒：** 指关卡内的天空背景，光照色彩、角度等。效果可见下图：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/d72ae3cf-7970-4064-a267-8f4398c7e6a9.png)

**滤镜：** 指可在关卡中生效的色彩滤镜，增强画面质感。效果可见下图：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/edcf5a05-e3ad-46e6-9595-a9343f28274a.png)

**光源：** 指可照亮局部场景的光源，如点光源、聚光灯等效果。效果可见下图：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/1f48d3ab-fcb0-4333-ab4f-b94916d0209b.png)

### 2.教学内容

**功能效果：** 使用环境配置制作一个夜晚场景

**效果演示：**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/558e926a-2285-4d9b-9fa8-b9155856166f.gif)

### 3.操作步骤

**1.【局内编辑器】进入环境配置**

在![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/12cfe48e-d090-4b93-b2be-f3025484efeb.png)【地形编辑】面板左侧的环境配置中点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/d1d757dc-90e7-4db0-aaac-2a6655a108a6.png)>>>进入详情配置页。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/d64ca1f4-29f1-42c1-b45c-3b0126d3eca1.png)

**2.【局内编辑器】配置时间为夜晚**

可以在![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/0bd0d06f-83d4-4d5b-a4de-5048794e2ad5.png)标签页中对天空盒参数进行设置。为达到预期的功能效果，教程中配置如下：

要做的功能| 对应的配置项  
---|---  
天空盒对所有玩家都可见| 【生效目标】选择“所有”  
天空背景为默认颜色| 【背景设置】选择“正常”  
在关卡过程中，昼夜不会随着时间流逝而变化| 【随时间自动切换】选择“关闭” _**如需配置昼夜随时间变化，可以开启后，在ESC菜单的关卡设置——基础中设置关卡的初始时间点和时间流逝速度，教学不做赘述。_  
天空盒时间为夜晚| 【设定时间点】设置为“00:00”  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/7fe08ee8-8550-4ecd-9afb-c81cf162e7ed.png)

**3.【局内编辑器】配置环境要素参数，增加星星和云**

打开环境配置详情页后，可以在【环境要素】中对天空中出现的星星和云朵进行进一步设置，为达到预期的功能效果，教程中配置如下：

要做的功能| 对应的配置项  
---|---  
天空中有明亮的星星且密度较高| 【星星】——开启【密度】——100.0【强度】——0.5  
天空中能看到银河| 【银河】——开启【强度】——0.5【受光颜色】——默认  
天空中还有较密的云层| 【云】——开启【强度】——1.00【类型】——全部  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/d9e49c93-4bec-4244-a66b-7cedd5887f14.png)

**4.【局内编辑器】配合光源配置制作灯具**

在黑夜中，为了增加环境氛围效果，我们还可以添加点光源。（教程演示中放置了静态单位：木质路灯，在静态路灯处设置了点光源，创作者可根据自身关卡实际需要来放置单位，也可以不放置单位直接配置光源）

打开环境配置详情页后，可以在标签页![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/53f0ed4b-9810-4816-b10b-ffd7fbce99dd.png)中对光源参数进行设置。点击【添加光源】>>>【打开光源工具】>>>【新建光源】即可对光源进行设置。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/5ce47b12-b45b-4f06-9388-06ef83d207b1.png)

在光源管理中，可以对光源进行详细设置，为达到预期的功能效果，教程中配置如下

要做的功能| 对应的配置项  
---|---  
制作的是路灯的光源| 【位置】调节到路灯实体位置  
光源跟随黑夜环境生效| 【归属文件】选择“环境配置”（为上文配置的黑夜文件）归属是指光源在什么环境下生效，如果不进行配置，光源默认不生效。  
光源为圆型橙色点光源| 【光源类型】选择“点光源”【颜色】设置为“橙色”【半径】设置为“10.0”【强度】设置为“3.0”**实际制作时可根据自身需要灵活调整光源效果  
光源在一定距离外也显示| 【生效范围】设置为“100.00”  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/ea328dd1-d741-473d-bbef-75b0677fa682.png)

**5.【局内编辑器】试玩体验**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/558e926a-2285-4d9b-9fa8-b9155856166f.gif)

## 功能示例-2：通过节点图事件快速切换环境设置

### 1.教学内容

**功能效果：** 通过事件快速切换环境设置。

**效果演示：**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/521d793c-d227-4c9c-a017-ce7a02365fb8.gif)

### 2.操作步骤

**1.【局内编辑器】新增环境设置**

在![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/d229f0ae-3893-4e96-acd0-e1a554870b01.png)【地形编辑】面板左侧的环境配置中点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/0150d45d-235f-47f6-ae2f-27549953084c.png)>>>点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/f2ea516d-806b-46d6-a6d7-a36ae386e175.png)新建一个环境，进入新环境详情配置页。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/7d50a41a-e931-4a08-9ca6-e5f253786c44.png)

**2.【局内编辑器】配置背景和环境要素**

整体的配置方式和功能示例1一致，在本教学中，需要配置2个环境用于切换。

环境1的配置和上文功能示例1完全一致，故不赘述；环境2的配置为达到预期的功能效果，教程中配置如下：

要做的功能| 对应的配置项  
---|---  
不初始生效| 【生效目标】选择“无”  
天空背景为紫色| 【背景设置】选择“蓝色”  
在关卡过程中，昼夜不会随着时间流逝而变化| 【随时间自动切换】选择“关闭”  
天空盒时间为正午| 【设定时间点】选择“12:00”  
天空中有云且密度较高| 【云】选择“开启”【强度】选择“1”【类型】选择“全部”**实际制作时可根据自身需要灵活调整环境效果  
  
 _**配置完成后请确保有两个环境配置供切换，如下图：_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/2a170491-db96-42cf-9458-45fead83b0f0.png)

**3.【局内编辑器】配置携带触发器组件的动态元件**

接下来需要配置一个动态组件以发出事件（教程中以石质功能平台为例），在元件库中创建元件后，挂载触发器组件；具体配置方式可以参考往期教程：碰撞与交互。为达到预期的功能效果，教程中配置如下：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/f3b97217-d594-4c57-a6ea-ee8f54e81412.png)

**4.【千星沙箱】节点图配置**

在实体节点图中，添加并配置该元件的节点图（设置参考见下图），为达到预期的功能效果教程中配置如下：

 _**该节点图挂载在【物件元件】上_

|  | 要做的功能| 对应的配置项  
---|---|---|---  
功能交互后开宝箱| 触发场景| 进入碰撞区后触发| 【事件节点】：进入碰撞触发器时  
条件| /| /  
结果-1| 切换环境配置| 【查询节点】：使用【获取在场玩家实体列表】获取在场的所有玩家【执行节点】：使用【修改环境配置】制作环境切换效果 _**环境配置索引在环境配置详情页中可以找到_![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/00e52d34-7f81-41e0-ac44-89a26c35c8ea.png)  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/6a038367-a876-4c20-89bf-07176b05ff83.png)

**5.【局内编辑器】挂载节点图**

将配置的节点图挂载在机关元件上，保存元件设置。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/94de64e5-7bd5-40a9-9b89-62bceb82907a.png)

**6.【局内编辑器】放置元件，试玩体验**

将制作好的元件放置在场景中，进入试玩即可体验该功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/6b51978b-b061-44d2-b3cb-b0acf1f75097.gif)

* * *

# 课程总结及辅助课件

**课程作业：** 可根据课程教学内容尝试进行以下功能复刻

> **功能复刻：** 制作清晨或傍晚环境的关卡
> 
> **进阶拓展：** 制作可以通过节点图动态切换的环境。

**课程回顾：** 学会如何进行环境设置，提升整体关卡氛围表现。

### 辅助课件

我们提供了上述课程内容相关的工程文件，可结合**【教学存档-环境配置】** 对照学习

![](https://webstatic.mihoyo.com/upload/static-resource/2022/10/14/64e71b8a5e28fbdbc3d3df5d311e4154_847866555738962172.svg)

环境配置.gil

20 KB

[](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhw64cr51fue/abd64d32-c4f7-4086-8547-c52d56237f07.gil)

#
