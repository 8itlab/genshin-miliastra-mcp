# 玩法功能进阶实例/3.10命中与受击——制作攻击命中的效果

(来源：原神千星奇域·教程，页面 ID mhsdgyi53pz0)

# 前言

## 课程说明：

**课程内容：** 命中检测组件与受击盒配置与使用案例。

**学习目标：** 学会如何配置命中检测组件和受击盒来制作攻击命中的效果。

 _**该课程中涉及【局内编辑器面板配置】和【千星沙箱节点图】两个模块内容，并且相互关联，阅读时建议按照课程顺序完整阅读。_

## 相关信息：

**推荐学习顺序：** 【前置课程】→【当前课程】→【综合指南】

 _**如课程中遇到概念不清等问题或想要了解更多相关信息，根据需要查询【综合指南】即可_

**前置课程：** 该课程与以下前置课程所讲述的功能知识点相关 _（建议首次使用时，优先学习_** __【前置课程】__** _，学习体验更流畅）_

> [3.8投射运动器——制作一个能发射的子弹](/ys/ugc/tutorial/course/detail/mhn4nsiz7k18)
> 
> [3.9能力单元——具有预设属性的战斗组件](/ys/ugc/tutorial/course/detail/mh8wpr0h7ywg)

**关联知识点：** 课程中将涉及以下基础概念 _（建议优先根据该课程学习即可，如遇到概念不清等问题或想要了解更多相关信息，再根据需要查阅_** __【综合指南】__** _相关章节）_

> [命中检测](/ys/ugc/tutorial//detail/mh2pir0hat1s)
> 
> [受击盒设置](/ys/ugc/tutorial//detail/mhvg40rc5w9i)

* * *

# 命中检测——定义实体的命中区域

## 功能示例-1：使用命中检测制作造成伤害的子弹

### 1.概念简述

**命中检测组件：** 定义实体的命中区域，用于判断定义的区域是否命中场景或其他实体，多数情况用于制作子弹命中判定。

### 2.教学内容

**功能效果：** 制作可以命中造物（怪物）的子弹。

**效果演示：**

 _**演示中的文本显示，需达到特定奇匠等级后解锁【自定义文本外显】功能，教程中以效果展示为主_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/dfe9fc52-2933-43b0-8d16-ea26ddb76d95.gif)

### 3.操作步骤

**1.【局内编辑器】添加组件**

创建一个元件作为子弹（教程以空物件为例），在面板中点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/05162e15-5383-497f-bac2-d4bc48cc5c00.png)>>>进入组件页，点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/0641d08a-f68d-4c02-957a-e8c54716bc1c.png)>>>选择【命中检测】即可添加。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/97cdb8ab-4704-401a-a409-c15f29d261a1.png)

**2.【局内编辑器】配置面板数据**

在新建的命中检测组件中，点击“详情”对命中检测规则和区域进行详细配置。

首先我们先设置命中区域，点击“命中区域”页签，点击“添加触发区”即可配置生效区域。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/8ed83f1a-54bf-488b-8380-f67f455687de.png)

其次对命中规则进行配置，点击“命中规则”页签，为达到预期的功能效果，教程中配置如下。

要做的功能| 对应的配置项  
---|---  
对进入区域的实体都触发1次命中| 【触发类型】选择“不重复触发”  
在创生时命中检测延迟激活| 【检测延迟时间】调整为“0.50”  
  
如此配置之后，子弹在命中非场景和水面的实体时，便会触发命中检测事件了。但还不会对命中实体造成伤害，这是由于我们还没有设置“命中时执行能力单元”，因此我们还需要设置子弹的能力单元。

在子弹面板中点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/e5ac7469-cec3-471b-98d7-769524c19122.png)>>>进入战斗属性页，找到【能力单元】>>>选择【详细编辑】>>>点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/4dd6ec99-03ad-4666-a6f5-a9c067766abe.png)即可添加一个新的能力单元。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/deb88f25-7223-4cd7-ae0e-e4793d4dbc84.png)

其次对能力单元进行配置，为达到预期的功能效果，教程中配置如下。

要做的功能| 对应的配置项  
---|---  
给能力单元命名| 点击详情页的![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/1a8ee1da-71da-4914-83d2-dcba744a3781.png)按钮，将能力单元名改为“子弹造成伤害”  
对命中的实体造成范围伤害| 【能力单元类型】设置为攻击盒攻击【目标筛选】“目标阵营筛选”选择“除自身外全部”【攻击参数】伤害系数为“1.00”；伤害增量为“100.00”  
在命中的实体上播放爆炸特效| 【命中表现】命中场景特效和命中目标特效都选择“爆炸_地面”  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/89f9d6ab-84af-48fe-8ded-ec29adab06f9.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/1e8b2892-26ee-4b27-9775-573b844abaee.png)

此时命中单元就配置完成了，我们回到“命中检测”组件详情页面，在“命中触发设置”中点击“添加能力单元”，将我们刚刚配置好的能力单元添加即可。

 _**命中触发设置可以不依赖节点图，直接在命中检测时调用能力单元；但如制图中有特殊需求，也可以在节点图中继续监听并重复/额外调用能力单元，本教学不涉及。_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/84d41f5f-eda8-46f7-8a6c-3f7b8ba028a7.png)

至此，子弹的战斗能力就已经做好了，在命中非场景和水体的实体时，会触发命中事件且造成伤害。

**3.【局内编辑器】完善子弹表现。**

除此之外，我们还需要给子弹添加【特效】和【投射运动器】组件，使其在外观和运动表现上更符合子弹的特征。关于【投射运动器】组件的相关知识可以查阅往期教程【投射运动器——制作一个能发射的子弹】，这里仅简单罗列对应配置项。

要做的功能| 对应的配置项  
---|---  
使子弹可见| 【特效】组件，添加“火箭丘丘人_炸弹_拖尾”特效  
使子弹直线运动| 【投射运动器】设置为“直线投射物”初始速度为“x=0.00，y=0.00，z=15.00”，速率为“15.00”，加速率为“10.00”，贴地运动为关闭。  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/bacd55e9-d30c-491f-a950-a5af8f1d8abf.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/9d764e17-adaa-4425-9533-53179df109a1.png)

**4.【局内编辑器 &千星沙箱】制作可以发射子弹的炮台**

子弹需要被发射出去，因此还需要制作一个可以发射子弹的炮台，炮台的制作方法可以查阅往期教程【投射运动器——制作一个能发射的子弹】，这里仅简单罗列对应配置项。

要做的功能| 对应的配置项  
---|---  
炮塔模型| 在元件库中，选择“大炮”，将其作为炮塔元件。  
炮塔可以交互| 添加组件【选项卡】，添加选项并重命名为“开炮！”  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/332ece00-a37e-4b19-b284-2271081a3495.png)

进入千星沙箱创建节点图，使选项卡被点击之后，在炮口创建子弹并发射。节点图挂载在炮台上。

|  | 要做的功能| 对应的配置项  
---|---|---|---  
功能  
选中选项后，炮台发射子弹| 触发场景| 选项卡被选中| 【事件节点】：选项卡选中时  
条件| /| /  
结果| 在炮台的位置和朝向发射子弹| 【查询节点】：获取实体位置与旋转，获取炮台的位置和朝向；【运算节点】：三维向量加法，由于模型本身旋转和预期发射位置有偏移，因此需要另外计算。【执行节点】：创建投射物，填入我们刚才制作的子弹元件ID创建出投射物。  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/4bbe7cad-5bbf-46a0-a1b3-93ddcc72b961.png)

**5.【局内编辑器】将物件拖入场景，添加造物（怪物）试玩体验。**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/dfe9fc52-2933-43b0-8d16-ea26ddb76d95.gif)

#  受击盒——使实体可以被攻击

## 功能示例-2：使用受击盒制作可被攻击的标靶

### 1.概念简述

**受击盒组件：** 定义实体的受击区域，使实体能被攻击；非造物（怪物）/角色单位默认没有受击盒，因此需要额外添加才能被攻击。

### 2.教学内容

**功能效果：** 制作一个可被击打的标靶

**效果演示：**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/4561fc92-fa32-4f2f-b8f5-e98532ab1660.gif)

### 3.操作步骤

**1.【局内编辑器】配置受击盒面板参数**

创建一个元件作为标靶（教程以坏坏法师靶为例），在面板中点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/6278138a-2fab-4aad-aacd-de477f316b0a.png)>>>进入战斗预设页>>>找到【受击盒设置】选择“详细编辑”>>>点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/54afad37-f230-48f2-8cfe-5122503da57a.png)后，再点击“添加受击盒”即可配置受击盒区域。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/5b94a940-23d4-4cf7-8637-fc99d006522e.gif)

**2.【局内编辑器】配置受击效果**

配置好受击盒后，实体就已经可以被攻击了，为了增加受击效果，我们可以给标靶配上受击特效。

在面板中点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/dee08aa6-0aba-491d-950e-c9e9a0daaf3c.png)>>>进入战斗预设页>>>找到【战斗设置】选择“详细编辑>>>在“受击特效”中选择资产即可。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/c76296a2-162d-4913-9d0d-2928c1f2a752.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/0f3dc7f7-4458-4c8b-9ca4-bc79c5c4f98f.png)

**3.【局内编辑器】将物件拖入场景，试玩体验**

将做好的标靶拖入场景当中，即可试玩体验。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/4561fc92-fa32-4f2f-b8f5-e98532ab1660.gif)

 _**更多相关信息可自行查阅【综合指南-能力单元】_

* * *

#  课程总结及辅助课件

**课程作业：** 可根据课程教学内容尝试进行以下功能复刻

> 功能复刻：制作可以造成伤害以及可被攻击的物体

**课程回顾：** 学会如何通过命中检测组件和受击盒组件制作更丰富的战斗单位。

### 辅助课件

我们提供了上述课程内容相关的工程文件，可结合** _【教学存档-命中与受击】_** 对照学习

![](https://webstatic.mihoyo.com/upload/static-resource/2022/10/14/64e71b8a5e28fbdbc3d3df5d311e4154_847866555738962172.svg)

命中与受击.gil

23.5 KB

[](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhsdgyi53pz0/2da1745e-8b16-403f-9233-9c58116e0537.gil)
