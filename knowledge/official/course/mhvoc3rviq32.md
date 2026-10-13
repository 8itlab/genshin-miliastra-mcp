# 编辑器通识/1.7经典模式

(来源：原神千星奇域·教程，页面 ID mhvoc3rviq32)

# 前言

## 课程说明：

**课程内容：** 了解「经典模式」与「超限模式」的区别，学习「经典模式」关卡的完整创建流程，并详细介绍关卡配置中的关键参数及其作用。

**学习目标：** 掌握「经典模式」关卡的创建方法，能够完成关卡的搭建与核心参数配置。

 _**该课程中涉及【局内编辑器面板配置】和【千星沙箱节点图】两个模块内容，并且相互关联，阅读时建议按照课程顺序完整阅读_

##  相关信息：

**推荐学习顺序：** 【当前课程】→【综合指南】

 _**如课程中遇到概念不清等问题或想要了解更多相关信息，根据需要查询_** __【综合指南】__** _即可_

**前置课程：** 该课程与以下前置课程所讲述的功能知识点相关 _（建议首次使用时，优先学习_** __【前置课程】__** _，学习体验更流畅）_

> ​​[1.2创建关卡与试玩](/ys/ugc/tutorial/course/detail/mhcegrr5omvi)
> 
> [1.3节点图编写与挂载](/ys/ugc/tutorial/course/detail/mhzu1vi0s3ms)

**关联知识点：** 课程中将涉及以下基础概念 _（建议优先根据该课程学习即可，如遇到概念不清等问题或想要了解更多相关信息，再根据需要查阅_** __【综合指南】__** _相关章节）_

> > [经典模式角色编号一览](/ys/ugc/tutorial//detail/mh4imrrhzdzi)

* * *

# 经典模式

## 一、如何创建经典模式存档

经典模式与超限模式之间的区别。

**功能**| **经典模式**| **超限模式**  
---|---|---  
游玩人数| 最多4人| 最多8人  
提瓦特角色是否可以进入| ✔| ❌  
奇偶是否可以进入| ✔| ✔  
  
 _**特别说明：经典模式与超限模式的存档（gil）无法互相转换，导出的资产文件（gia）无法互相导入。_

### 通过存档界面创建

进入存档界面后点击右下角【新建存档】>>>选择经典模式>>>点击确定即可创建。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/36069ed2-bd54-4aae-8c51-3150a2eed858.png)

创建后会进入到编辑器的界面，在该界面的操作与超限模式无异。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/d752f0a2-01d9-41e0-95b8-1456bfa5b30e.png)

## 二、设置经典模式关卡基础参数

点击局内编辑器左上角![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/b64080fb-4bcf-4ea7-a4f3-39fb50d0dcfe.png)（或直接按ESC键）>>>呼出左侧面板-ESC菜单栏，点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/51990128-d31a-4288-aa87-0c3b48fc4a51.png)>>>即可进入。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/ece15315-77da-487b-8684-a676b9779897.png)

### 功能简述

在基础系统预设中新增了**角色设置** ，主要包含**可出战角色数量** 和**角色限制** 两个功能。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/6d68d3e6-bc58-4002-bed4-22a3f75f2d3e.png)

#### 1.可出战角色数量

可以调整当前关卡的玩家最多编入队伍的角色数量，一个玩家最多编入4个角色，两个玩家最多每人编入2个角色，多于二个玩家时只能编入1个角色，可以将前两个数字修改，让玩家最多只能编入你想要的数量的角色。

#### 2.角色限制

将限制从无限制改为部分角色可用。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/90de437c-561a-42a3-9ff5-2832ba7352b2.png)

点击加号图标，选择可以进入关卡的角色。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/bd4e75c0-8bdc-4872-a21c-603802efc665.png)

在这个界面你能选择可以进入关卡的角色，现在以旅行者为例。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/ae2d31b6-15d7-4b13-9b8a-59e5f9e1f8dd.png)

退出界面后即可看到可用角色里添加了旅行者作为可用角色，这意味着只有旅行者能进入到对应的关卡中，该功能具体将由下面的试玩部分展示。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/7d34aa41-cf23-44c6-bc4e-486233a70bf6.png)

此外也可以通过左上角筛选选择你需要的使用相应元素力/武器的角色，并通过一键全选，选择筛选后所有的结果，或者全部取消选择来去掉筛选的结果。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/0412dc98-ad49-44a0-b21a-9f5103731420.gif)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/d04497d0-7415-4072-94a7-005d58b52aa3.gif)

## 三、试玩经典模式关卡

点击局内编辑器左上角![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/14b0113e-ca74-4230-a2c2-200b45424bb3.png)（或直接按ESC键）>>>呼出左侧面板-系统菜单，点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/1f1a8dcf-a530-4338-822c-53492250f70e.png)>>>进行试玩

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/545c7ef2-ff25-42df-aa9c-bb350aa090cc.gif)

进入到试玩界面后，可以需要选择你要进队的角色。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/bb97b22b-2dfd-432c-a8ec-b8e4b32f8d63.gif)

当开启关卡设置的角色限制时，只能编入旅行者进入关卡中。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/8b771822-39f7-4b3c-bdeb-6e188e38d629.gif)

# 拓展应用

该模块仅作为教学课程所能拓展应用的功能简述，涉及到多模块联动，以操作步骤演示为主，了解进阶用法即可

## 功能示例：交互选项卡后，更改修改角色能量

**功能效果：** 当玩家交互选项后，如果选项为1，则设置能量为100；如果选项为2，则设置能量为0；如果选项为3，则添加10点能量；如果选项为4，则减少10点能量。

**效果演示：**

演示中风元素旅行者元素爆发所需能量为60点，通过节点修改角色能量会看到元素爆发的图标产生变化。

 _**演示中的文本显示，需达到特定奇匠等级后解锁【自定义文本外显】功能，教程中以效果展示为主_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/38ff0c64-e7d5-4088-b104-6e231be1edde.gif)

**实现步骤：**

1.创建一个元件，作为交互物

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/2823d38c-2bf2-4a56-a14c-accbbbd14535.png)

2.添加【组件-选项卡】，并配置选项和触发区

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/7d8c859b-68f5-4f79-a298-ac3898bd35f8.png)

3.节点图配置（设置参考见下图）

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/4497d2d3-8103-4881-bcf9-af6a45326d40.png)

4.将节点图挂载在元件上，保存设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/7da580b3-8698-4e1c-81e1-1153e9d47d5e.png)

5.将元件放置在场景中

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/b7bbef82-b4da-4f98-a925-7ebaf1df9f6e.png)

6.进入试玩，即可体验该功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/0b9eaff2-e0f3-4668-8153-2df7da5c15d3.gif)

* * *

# 课程总结及辅助课件

**课程作业：** 可根据课程教学内容尝试进行以下功能复刻

> **功能复刻：** 通过查询角色编号（在[经典模式角色编号一览](/ys/ugc/tutorial//detail/mh4imrrhzdzi)查询）为队伍中的安柏和凯亚设置能量。

**课程回顾：** 学习如何创建经典模式关卡，了解经典模式与超限模式的区别，并学会如何为角色添加能量。

### 辅助课件

我们提供了上述课程内容相关的工程文件，可结合** _【教学存档-经典模式】_** 对照学习

![](https://webstatic.mihoyo.com/upload/static-resource/2022/10/14/64e71b8a5e28fbdbc3d3df5d311e4154_847866555738962172.svg)

经典模式.gil

13.6 KB

[](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhvoc3rviq32/f7495bf7-8324-498c-bf22-f3c7b419ea35.gil)
