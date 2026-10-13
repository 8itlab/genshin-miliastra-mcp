# 概念介绍/功能/通用组件/小地图标识

(来源：原神千星奇域·综合指南，页面 ID mh0pppib5eyc)

# 一、小地图标识组件的功能

 _小地图标识组件_ ，支持实体通过图标/范围等可视化标识显示在**预制小地图界面控件** 中

小地图标识组件需要挂载于实体，支持 _玩家_ 、 _物件_ 、 _造物_ 使用

小地图标识可以通过默认配置激活/关闭，也可以通过 _节点图_ 控制指定小地图标识的激活/关闭

# **二、** 小地图标识组件**的编** 辑

## **1.添加组** 件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/781999d6-8533-4383-ae15-be3575bc8641.png)

(1)在实体或元件编辑界面中，打开组件编辑页签

(2)点击下方的“添加组件”，选择并点击“小地图标识”，成功添加

(3)点击“详细编辑”，展开编辑页

## **2.** 小地图标识**组** 件的基础信息

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/5f5a798f-881c-43b2-aab9-09b4378286aa.png)

配置参数| 说明  
---|---  
 _初始生效_|  下拉菜单提供小地图标识枚举通过修改后面的勾选框，可以修改生效情况，修改后生效状态会同步到小地图标识详细编辑页内![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/40f0e156-5339-443d-9dbe-72f9b2541ea0.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/3c40463d-a5e2-4b72-8ef5-c91965fd544c.png)  
 _*小地图标识列表_|  枚举实体配置的所有小地图标识  
  
## 3\. **添加小地图标识**

点击详细编辑可进入小地图标识的编辑

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/b621a939-abd6-491a-9e08-c92f25215a22.png)



通过点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/93d3ad7e-6b1c-4e49-9a86-91b2b641110f.png)，添加小地图标识。

添加的小地图标识**初始生效** 默认开启。



 _标记X_ ，X为**序号** ，作为节点输入项可以调整小地图标识的初始生效参数。

## 4\. 小地图标识的参数说明

### (1)显示设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/81bff74b-9ec0-4be2-b0a7-be34a5f801f9.png)

配置参数| 说明  
---|---  
 _初始所有玩家可见_|  若开启，则小地图标识生效时，满足条件的所有玩家都可以在其小地图界面控件上看到该标识  
 _跟随物体可见性_|  若开启，则实体隐藏时，小地图标识一同隐藏  
 _显示优先级_|  在同一位置的小地图标识，造成堆叠后，优先级更高的会覆盖优先级低的。数字越大，优先级越高  
  
### (2)标记样式

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/8a08e7a6-d400-4113-8872-e846cb09282c.png)

配置参数| 说明  
---|---  
 _选择类型_|  分为图标、范围、标记点、玩家标记、造物头像几种，不同类型会带有不同的配置参数  
 _显示高低差_|  开启后，高低差超过10m的实体会在小地图内额外标记  
  
### (3)选择类型的分类



图标

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/876c6fca-f255-4edd-ba99-3905331d25d9.png)

配置参数| 说明  
---|---  
 _选择图标_| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/a2d9555a-4973-45a1-a255-6fafd7fc6439.png) 提供多种可供选择的图标  
 _底图_| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/20b4234b-771b-4b5f-ba2f-09f0d429194a.png) 提供无、圆形  
 _底图外框颜色_| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/b4314618-9097-4ce3-b818-139d6ff17a68.png) 图标底色支持选择，包括指定颜色和逻辑颜色。逻辑颜色包括【敌友关系】敌方红色、友方绿色、自身蓝色【跟随自身阵营】根据自身当前的阵营颜色【跟随所有者阵营】跟随当前实体的所有者阵营颜色  
 _是否可点击_|  开启后，展开地图，点击标识点，会显示配置信息  
 _文本内容_| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/e197df1b-394a-4303-87b4-35cec580acad.png) 支持配置点击后的右侧显示文本  
  


范围

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/a06da7f6-a282-4365-81ad-f2b288f205f1.png)

配置参数| 说明  
---|---  
 _范围样式_| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/9ddaffde-9e0f-49ef-9c6c-c891ab38e71b.png) 支持范围边缘显示为实线、虚线  
 _颜色_| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/bf5feeaa-a5c6-4ce6-9e0b-3b1bd9cb8769.png) 图标底色支持选择，包括指定颜色和逻辑颜色。逻辑颜色包括【敌友关系】敌方红色、友方绿色、自身蓝色【跟随自身阵营】根据自身当前的阵营颜色【跟随所有者阵营】跟随当前实体的所有者阵营颜色  
 _范围大小(m)_|  根据配置的尺寸，在小地图界面控件中，按比例显示  
  


标记点

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/1117953b-ee2b-4bc0-bec1-89fa6f904171.png)

配置参数| 说明  
---|---  
 _样式预览_|  展示点的样式，不可修改，且点在大地图中不可点击  
 _颜色_| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/33836895-28a2-4799-b10d-686c2548cfbb.png) 图标底色支持选择，包括指定颜色和逻辑颜色。逻辑颜色包括【敌友关系】敌方红色、友方绿色、自身蓝色【跟随自身阵营】根据自身当前的阵营颜色【跟随所有者阵营】跟随当前实体的所有者阵营颜色  
  


玩家标记

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/db059cad-8a02-4192-89ee-a13e63f1d2e7.png)

配置参数| 说明  
---|---  
 _样式预览_|  预览图标为创作者(奇匠)的当前头像，实际生效的图标需要通过节点传入，且玩家标记在大地图中不可点击  
 _底图外框颜色_| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/fc3faea3-888f-4643-b0b8-ef98d2903484.png) 图标底色支持选择，包括指定颜色和逻辑颜色。逻辑颜色包括【敌友关系】敌方红色、友方绿色、自身蓝色【跟随自身阵营】根据自身当前的阵营颜色【跟随所有者阵营】跟随当前实体的所有者阵营颜色  
  


造物头像

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/214cd0f9-5b1f-4132-9fbe-e3df37f4c072.png)

 _头像预览_|  仅造物可以设置此项，仅提供预览，不可编辑  
---|---  
 _底图外框颜色_| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/58c52ad3-f110-49d3-9093-21f2321b94b8.png) 图标底色支持选择，包括指定颜色和逻辑颜色。逻辑颜色包括【敌友关系】敌方红色、友方绿色、自身蓝色【跟随自身阵营】根据自身当前的阵营颜色  
 _是否可点击_|  开启后，展开地图，点击标识点，会显示配置信息  
 _标记名称_|  标记的名称  
 _文本内容_|  支持配置点击后的右侧显示文本  
  
# **三、通过节点图管理** 小地图标识



**修改小地图标识生效状态**

通过节点输入的小地图标识序号列表，批量修改目标实体的小地图标识生效状态。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/2c97aa27-afe3-4853-896d-2dd82b4a1ac2.png)



**修改可见小地图标识的玩家列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/b9d8cf34-7319-4299-b477-4e5efa7ea0d8.png)



**修改小地图标识的玩家标记**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/69f1264f-6b34-44d2-b667-231ba31cd3ce.png)



**修改小地图缩放**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/08def256-0937-4ec2-b89f-1b7f69e08cef.png)



**修改追踪小地图标识的玩家列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/9d64d9f2-0a24-479d-b315-5f7a5dff33f7.png)



**查询指定小地图标识信息**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/12abd97c-91c5-4670-be15-1176c2c88e15.png)



**获取实体的小地图标识状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0pppib5eyc/f335eca3-cfc0-429c-a32c-52129a41839d.png)
