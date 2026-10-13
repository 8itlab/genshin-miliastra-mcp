# 附录/节点图高级特性/复合节点

(来源：原神千星奇域·综合指南，页面 ID mhty17iqeht0)

# 一、复合节点是什么

## 1.节点图中的功能复用

在节点图的制作过程中，你应该碰到了许多可复用逻辑的情形：

以下图为例，该节点图实现了一个持续计分装置，这个装置的规则如下：



受到攻击时使实体上的【受击计分】自定义变量增加3



并在之后的1、3、5秒时，为【受击计分】自定义变量加1

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/834f493c-daae-4a9d-9c49-40e28a65d3d8.png)

从图中可以看到，为自定义变量增加分数部分的逻辑存在多次重复。这样的重复会导致许多迭代时的问题

例如：



你发现加分不能完全满足你的需求，你决定将其改为扣分，因此需要批量将节点图中的加法操作替换为减法操作



你需要换一个计分的自定义变量名，在上图中需要修改四个节点内的填值。在节点图较为复杂的情况下很容易漏改

## 2.复合节点的定义

复合节点就是用来解决上述问题的功能。

复合节点是一种创作者(奇匠)可以自定义节点结构的节点类型。创作者(奇匠)可以将部分节点图实现的功能封装在复合节点内部，并自行决定对外暴露的参数和逻辑引脚

在外部节点图中，复合节点可以当作一种常规的节点使用，遵循通用的节点图连线规则，但复合节点只能在服务器节点图中使用，无法在客户端节点图中使用

使用复合节点优化上述节点图后结果如下。可以看到节点图的功能更加清晰，也可以更好地支持复杂的迭代

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/5f4a6b76-7c24-4a3c-b69d-8ac5f17b2793.png)

# 二、复合节点的结构

## 1.对外部节点图

复合节点对外可以当作一个通用的节点使用，而不用关心其内部实现

其所有引脚均遵循通用的节点连接规则

## 2.复合节点内部

复合节点内部是一张 _子节点图_ ，这张子节点图实现了一些特定的功能（例如下图的为自定义变量增加值）

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/df93d302-16b0-4ab2-b780-6dd3b6cd8c32.png)

在复合节点图内部，可以指定将哪些引脚对外暴露（即下图框出的引脚）。

下图中连接在这些引脚上的称为 _虚拟引脚_ ，它们相当于这个复合节点对外连接的入引脚或出引脚

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/b3359795-772d-465f-aad4-ae85c0e0535a.png)

对外暴露的引脚，可以在外部节点图中当作正常的引脚使用，如下图所示。虚拟引脚上的序号数字与节点图编辑内的引脚序号数字是相同的

其中【目标实体】、【变量名】、【是否触发事件】就是由上面【设置自定义变量】节点对外引出的

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/38fac95d-64ca-483a-a032-22028e35d230.png)

# 三、复合节点的编辑

## 1.复合节点的创建



**通过节点图创建**

在节点图中，框选需要封入复合节点的所有节点

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/1b7aae6b-a049-4e56-b6ea-d91261b2d818.png)

在任意框选的节点上点击右键菜单中的【生成复合节点】

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/1b652c75-3713-4131-a0c7-5c3cb874f65a.png)

即可创建一个新的复合节点

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/ed9f0aac-94c7-4f59-b92f-0ce393eb3099.png)



**通过节点管理器创建**

从左上角窗口菜单中，打开节点管理器界面

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/4d77493a-fac0-489a-b12f-5edb8ce39267.png)

在左侧复合节点分页中，可以新增复合节点页签

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/486b0812-7854-4ea4-ad87-f082d5879f6a.png)

在复合节点管理页面中，点击右键-创建复合节点，即可创建一个新的复合节点

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/a1de0c45-c495-4bc8-9c2a-65b237864afa.png)

## 2.复合节点编辑

通过在节点图内双击复合节点或从节点管理器中双击复合节点，均可以进入复合节点编辑界面

该界面分为两部分

左侧是【复合节点节点图编辑】界面，与其他节点图的使用方式基本一致

右侧是【复合节点编辑预览】界面，可以预览当前正在编辑的复合节点对外暴露的样式，并调整节点名、引脚名等样式

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/1e0460c6-241d-4476-8cbf-0826fdbde7ff.png)



**复合节点节点图**

复合节点节点图的功能与其他节点图基本一致，主要的区别是，复合节点节点图中存在这样的虚拟引脚

这些虚拟引脚代表了哪些引脚与复合节点外部相连，可以在复合节点编辑预览页面修改引脚的配置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/7d5f06dd-6c4b-4fd2-a7ba-a9d64edf624d.png)

在引脚上点击右键，可以选择将该引脚作为复合节点引脚对外暴露

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/6e176ae2-22a7-4da7-bec2-a34300a43eb5.png)



**复合节点样式编辑**

在复合节点样式编辑页面，可以设置复合节点对外暴露的表现



**复合节点重命名**

双击复合节点名即可修改复合节点名

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/64d2a993-6a66-4bf7-ba5a-cbf6a0aec66b.png)



**引脚详情编辑**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/c6c8750e-9de8-467a-8334-eb2bf248c1b1.png)

支持以下编辑：

修改引脚名

修改外部使用时的参数框提示内容



**引脚操作**

右键点击引脚，可以进行一些引脚操作，例如：上下移动、取消在复合节点上显示等

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/b0aa1c44-876b-4bc4-9e71-5af4834e37ae.png)



**引脚合并**

当复合节点上存在两个类型相同的引脚时，可以将他们合并

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/e61adc66-c6a4-423e-9430-13646f201943.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/0188bb61-0dc1-4dff-bb66-88a24516da2b.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/b7fe0773-cabc-4c61-a1bf-a88e6b1d1f90.png)

合并后的引脚相当于同时连接在两个引脚上

如下图所示，1号和4号虚拟引脚分别连接在【设置自定义变量】和【获取自定义变量】的第一个入参引脚上

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/93cf9b08-afd7-422c-9589-e10835598210.png)

合并后，复合节点的样式如下图所示

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/80a96672-d7ba-4a10-80e8-fba0f3965043.png)

可以看到复合节点的【目标实体】引脚现在同时连接在了【设置自定义变量】和【获取自定义变量】的第一个入参引脚上

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/673f5dae-e696-4df7-a21d-6609a65857fa.png)

## 3.在外部节点图中使用复合节点

外部节点图中，可以在【复合节点】分类中找到已经制作的复合节点

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/c0da858a-2055-4c32-bc14-588f386f4b69.png)

节点图中的复合节点与其他节点的规则完全一致，可以将其当作任意一种节点类型使用。如下图所示，这两张图的功能是完全相同的

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/951dbc9e-32ba-4e66-94ea-51fb77a7979a.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhty17iqeht0/eb505c6f-3c5f-4dad-8255-3c2302a4f77f.png)
