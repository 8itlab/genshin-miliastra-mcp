# 概念介绍/高级概念/技能

(来源：原神千星奇域·综合指南，页面 ID mho81frl33im)

# 一、技能的定义

 _技能_ 是一种通过接收游玩时的用户输入，让角色执行某一段预设行为的封装。在经典模式中，角色的普通攻击，元素战技，元素爆发等都是一个技能。

技能主要实现三个基本功能：



 _角色动画_ 的调用：在技能编辑时，创作者(奇匠)可以定义技能施放后的角色动画演出效果



触发 _客户端节点图_ ：通过编辑技能动画 _节点图事件轨道_ 上的事件，可以在动画的特定阶段触发指定的客户端节点图



配置 _技能状态_ ：在动画播放的过程中，可以指定特定的时间窗口附加持续性的逻辑，比如播放循环动画等等

# 二、技能的编辑

## 1.编辑入口

技能编辑的入口位于战斗预设页签的技能页签下

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/6060a4a4-dfe1-44b0-bfd9-07a8ba1914b7.png)

点击【新建技能】![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/150b3bb1-67d1-429f-aa39-3405222deef4.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/9b0131b4-b16d-4e25-8baa-214d64584968.png)

并在弹出的窗口中选择【确认创建】即可完成新技能的添加

## 2.技能参数

一个技能的参数配置如下图：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/04e53bef-8e81-49ec-bfac-435459c61256.png)

 _配置ID_ ：技能的唯一标识，在节点图修改对应的技能配置时，引用该ID

 _技能类型_ ：目前分为七种

 _瞬发技能_ ：无法编辑动画，在接受输入的瞬间立即触发逻辑

 _长按技能_ ：可以提供循环动画类型的技能，玩家长按对应的输入即可进入循环动画

 _普通技能_ ：基础的技能类型

 _连段技能_ ：可以配置一连串的连续动作，并在接受特定时点的输入后，在动作之间进行跳转

 _瞄准技能_ ：提供成套的瞄准动作，并在施放技能时使角色进入瞄准状态

 _空中技能_ ：可以在空中施放的技能

 _套组技能_ ：可以使用不同的预先定义好的一个套组动画的技能，当前仅支持蹲伏套组

### (1)基础设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/df197679-bad1-4509-acdb-2c2e5e405ac6.png)

 _启用运动坠崖保护_ ：勾选时，角色施放该技能产生位移时不会触发坠崖

 _是否可以在空中施放_ ：在角色处于跳跃，下落，滑翔等空中状态时能否使用该技能

 _特殊状态是否可用_ ：用于实现受身或反制效果的技能，基于此配置可以在通常无法施放技能的状态下强行施放该技能

 _受击时可用_ ：处于受击动画中时是否可施放

 _空中受击时可用_ ：处于击飞或空中受击动画中时是否可施放

 _游泳时可用_ ：处于游泳动画中时是否可施放，仅瞬发技能可用

 _攀爬时可用_ ：处于攀爬动画中时是否可施放(若该技能放在普通攻击槽位中，则该选项默认不生效且不可修改)

_*技能备注_ ：可以在编辑时描述该技能的大致作用

### (2)数值配置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/798d2ec8-f90e-4971-b052-becd348ff8b9.png)

 _是否有冷却时间_ ：开启时可以配置技能冷却时间

 _冷却时间(s)_ ：当该技能施放后需要多久才能够再次施放

 _是否有次数限制_ ：开启时可以配置技能使用次数

 _使用次数_ ：技能添加时的默认可使用次数，当使用次数归0时，技能无法使用，每经过一个冷却时间，可以恢复一次使用次数，最大恢复到默认配置的次数，就不会再增加

 _是否有消耗_ ：开启时可以配置消耗类型和消耗量

 _消耗类型_ ：施放该技能需要消耗的 _技能资源_ 类型，具体查看[技能资源](/ys/ugc/tutorial//detail/mh6ate95agb6)

 _消耗量_ ：施放该技能需要消耗的技能资源值

 _索敌范围_ ：该技能施放时，会在多大的范围内寻找施放目标，并且在本地节点图内，可以通过查询节点获取到本次技能施放的目标单位，索敌范围目前提供了两种类型

 _圆柱体_ ：使用 _半径_ 和 _高度_ 进行描述

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/0d2848bd-5b46-48b4-8fd7-2fd42b85bd55.png)

 _扇形_ ：可以视为是圆柱的升级版本，除了 _半径_ 和 _高度_ 外，还可以配置筛选的 _角度_ ，以及 _旋转_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/03500b8f-bab1-4824-a557-9423639ebaf1.png)

 _技能属性组_ ：可以修改技能属性组的值来动态修改技能的部分行为[技能属性组](/ys/ugc/tutorial//detail/mh0inr0jak34)

### (3)生命周期管理

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/3f20567b-90d9-44e5-887a-fd5edc5ed2e8.png)

 _达到次数上限是否销毁技能_ ：开启时可以配置次数上限

 _次数上限_ ：该技能在整个生命周期内可以使用的次数，当技能被使用达到最大次数时，技能会被自动移除

### (4)连段配置

对于连段技能类型的专有配置：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/5cadf441-8182-485d-a812-796d3c51db57.png)

 _是否开启蓄力分支_ ：开启后可在动画编辑处定义连段转入蓄力动作相关逻辑

 _蓄力公共前摇_ ：开启后，连段动画与蓄力动画将共用同一个前摇动画槽位，以及槽位内的所有配置。关闭后，运行时该槽位的动画将不会播放

### (5)瞄准配置

对于瞄准技能类型的专有配置：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/ee098cd3-565c-4e7c-9500-f9b1013c2ff9.png)

 _瞄准进入方式_ ：分为长按和点按切换两种

 _长按_ ：长按技能进入瞄准状态，松开后退出

 _点按切换_ ：点按技能进入瞄准状态，再次点击退出

 _瞄准中是否可移动_ ：在瞄准模式下角色是否可以进行位移

 _瞄准发射动画时长_ ：切换为自定义后，可修改瞄准技能的发射动画播放时长(该功能在游戏运行时生效，预览时不生效)

# 三、技能的动画编辑

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/b5675ac3-7caf-4d98-bddd-4b99d585443e.png)

在定义完了技能的施放条件和施放逻辑后，即可点击动画编辑，来继续编辑技能施放后的具体逻辑，不同的技能类型，配置方式也会有所区别：

## 1.普通技能

普通技能是最通用的技能类型，配置方式也最为常规，因此先以普通技能为例介绍动画编辑的大致配置方法

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/5ae1a04a-a90f-4c42-9eeb-5357ac6b81a1.png)

界面如上图，以时间轴的形式来进行配置，分为动作轴和逻辑轴。在技能施放时，从前往后按时间依次触发动作轴上的动画，以及逻辑轴上的事件，依次来实现整个技能的具体效果。

### (1)添加动作

首先我们需要添加对应的 _动作_ ，入口在上图“A”所示位置，点击可选择目前可用的 _角色动画_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/efc4841e-1afb-4f94-9021-fc18321c4c01.png)

动画是整个 _技能轨道_ 的尺度，事件轴的总长度等于所有动画的时长之和，在对应的动画时点添加事件，即可让表现和逻辑匹配

### (2)编辑事件轨道

事件轨道在上图"B"所示位置

 _事件轨道_ 分为四种类型：

 _开始事件轨道_ ：在技能开始施放时立即触发的时点

 _结束事件轨道_ ：在技能的动作全部播放完成后触发的时点

 _节点图事件轨道_ ：可以根据动作进度进行打点并添加事件的轨道，在该轨道下可选择具体的动画进度位置，并添加一个 _技能节点图_ ，如下图。当动画进行到配置的进度处时，技能节点图会被触发

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/d5a4eea2-96d6-45ca-8853-7856c9a8d25e.png)

 _状态轨道_ ：用于定义非触发类型的表现，如持续播放特效等，如下图，并且可以自由配置该状态的开始时点和结束时点

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/9b3b90aa-b4ef-45ac-b737-914275c40b3c.png)

### (3)特殊说明

节点图事件轨道上有极小的概率出现跳过事件的情况，所以某些关键逻辑应当写在结束事件轨道上作为兜底

### (4)动画裁切

点击填有动画的技能槽位，可打开动画详情栏

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/e8d7321e-3391-4a5c-9881-e2bf8632ad85.png)

动画详情栏配置：

 _动画资源_ ：点击可更换动画资产

 _所在栏位_ ：点击可更换动画所在栏位

 _动画时长_ ：可进行动画裁切

 _栏位时长_ ：可选跟随动画或者自定义，自定义栏位时长不可超过动画时长

### (5)动画时间轴吸附

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/92be53da-5363-429f-bcd3-e559243620ab.png)

支持节点图事件轨道和状态轨道上的配置对时间轴上的特殊时间点进行吸附，可通过时间轴右侧的设置按钮控制吸附功能是否开启

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/19eb33c0-3254-459f-bf67-9df5283bfdb2.png)

可吸附时间点包含：

动画起止时间（红线）

动画预览时间（蓝线）

节点图事件轨道和状态轨道的端点

### (6)技能时间轴循环节

循环节可实现功能：可按照指定时间间隔，持续地重复执行一段时间内的逻辑

选中事件轨道(节点图事件轨道和状态轨道)时，右侧显示轨道详情栏

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/45f27242-96a8-4f09-8d65-ffcd02937663.png)

循环节配置：

 _启用循环节_ ：打开后开启轨道循环节，或直接在新建轨道选项中可选择直接创建循环轨道

 _循环节起点_ ：循环节开始时间

 _循环节时长_ ：每个循环节的持续时间

 _无限循环_ ：启用时，该循环节会一直循环至时间轴结束

 _循环次数_ ：该循环节的循环次数，不启用无限循环时该参数可配置

配置后表现如下图所示

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/fb89ddcb-77dc-47d7-b67e-01497c83aed5.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/02643700-dd6e-40f7-9e66-38c3ea8d26ac.png)

### (7)自适应槽位和槽位增删

包含该功能的技能类型有：长按技能、普通技能、空中技能

自适应槽位：每个槽位都可任意添加循环或者非循环动画

槽位增删：点击槽位末尾的加号可实现槽位数量的扩充，对已有槽位点击右键可删除槽位

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/36b31ace-ff40-4270-b038-11744ef6aea2.png)

## 2.瞬发技能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/406b469d-02bf-46af-85dd-4048bbe929dd.png)

界面如上图，由于瞬发技能的所有逻辑都在技能施放瞬间触发，也不会调用动画。因此瞬发技能不可添加动作，且只保留开始事件轨道

## 3.长按技能

 _长按技能_ 支持创作者(奇匠)在动画时间轴上引用循环动画，并根据角色进入该动画后是否长按来执行不同的逻辑

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/6b87e096-d9a5-44f9-88d2-e42e93342054.png)

选择完循环动画栏位的动画后，可调整循环动画的 _持续时长_ ，在实际施放技能时：

如果角色进入该动画后输入保持长按状态，则该循环动画会持续播放，最多播放到持续时长

如果角色进入该动画后未保持输入长按，则动画会立即中断，并根据 _分支轨道_ 配置跳转到对应的分支

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/d2b74f81-36b9-4086-9128-c41e810dd770.png)

### (1)分支

点击下图中的按钮可添加或删除分支，每个分支代表了多个捆绑好的动画，在实际的技能施放过程中，根据技能长按的松开时机，会转入到某一个分支中

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/c51f119a-2af8-4d4b-8cb3-fcb18d82a82f.png)

每一个分支可配置多段动画，在进入对应的分支后，会顺序进行播放

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/db3aa8c0-c01f-4813-ad2a-05c6bb94d8a1.png)

### (2)分支轨道

分支轨道定义了如何跳转至各个分支的具体规则，点击分支轨道，会在界面右侧弹出分支事件编辑界面

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/3c3a0957-f992-44bf-bb8f-8e441e952421.png)

 _可跳转分支数_ ：该技能支持几种分支跳转情境，该配置会使分支轨道被划分为对应数量的段落

 _响应_ ：支持由创作者(奇匠)配置分支轨道的每一个段落跳转到哪一个具体分支上

在分支轨道上，创作者(奇匠)可以通过调节每个段落的长度，来精细化调节分支转入的条件。在实际的运行时，当玩家停止长按时，当前的动画进度落在哪一个响应段落内，则动画会自动转入该段落所对应配置的分支

## 4.连段技能

 _连段技能_ 支持创作者(奇匠)配置多个独立的动作，并通过定义动作间的跳转规则和输入窗口期，来实现“连招”的效果。与此同时连段技能也提供了转入蓄力分支的功能，在配置上有两个页签：连段技能动画页签及蓄力分支动画页签



**连段技能动画编辑页签**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/585dfe47-64f0-4786-83b9-843e461ea385.png)



**蓄力分支动画编辑页签**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/3281bc37-d288-40ec-a790-5fa42feec458.png)

连段技能的配置界面如上图，与普通技能的编辑不同的是，连段技能中配置的技能槽位在技能施放时并不会顺序播放，而是依赖连段轨道上的配置和创作者(奇匠)实际的输入进行跳转

### (1)连段轨道

连段轨道是连段技能的专有轨道。在连段轨道上，创作者(奇匠)可以配置连段响应事件，一个连段响应事件由一个预输入阶段与多个响应阶段构成：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/48faaec1-bcff-4f79-8947-f7a71bf2399b.png)

 _预输入阶段_ ：在预输入阶段点按技能，会接受该次预输入，并在进入第一个响应阶段时直接触发响应进行相应的动画跳转。在预输入阶段长按技能，若满足 _蓄力成功时长_ 则会立即跳转到蓄力分支动画

 _响应阶段_ ：在响应阶段点按技能，会立即触发响应并进行相应的动画跳转

一个连段响应事件的具体编辑界面如下图：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/d07b37bf-97bb-4988-8354-953784c2ce34.png)

 _跳转设置_ ：连段动画之间的跳转规则配置

 _可响应段数_ ：定义了该动作存在几个响应阶段

 _响应跳转动画_ ：每一个响应阶段接受输入时转到的目标动画槽位

 _蓄力设置_ ：在预输入阶段跳转进蓄力分支的相关逻辑配置

 _当前预输入是否可跳转蓄力分支_ ：跳转到蓄力分支的开关

 _蓄力成功时长_ ：在预输入阶段长按蓄力达到该配置值时，会立即转入蓄力分支

### (2)公共前摇

公共前摇是一个特殊的动画槽位：

1.角色从待机动画短按技能初次进入连段技能动画时，会优先播放公共前摇配置的动作

2.角色从待机动画长按技能直接进入蓄力分支动画时，也会优先播放公共前摇配置的动作

### (3)蓄力分支动画特殊说明

在蓄力分支的动画槽位中，公共前摇#1和循环动画#3之间有一个额外槽位#2

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/b792dce7-dd46-4bf8-877c-aecb52701d4a.png)

该槽位中的动画只有从主分支跳转时才会被执行。如果从待机动画长按技能直接进入蓄力分支动画时，则该槽位的动画会被跳过不会被执行

## 5.瞄准技能

 _瞄准技能_ 对应了弓箭角色的蓄力瞄准动作，其特点在于：



瞄准技能提供了三个动画槽位，但不支持分别配置，而是采用成套动作的方式进行配置，当创作者(奇匠)选中一套动作时，会同时填充全部三个动画槽位

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/a2276a03-d2d7-4fdb-898b-6dc19ff94b0b.png)



瞄准技能也提供了分支以及分支轨道，但每个分支只提供了一个动画槽位



不同于长按技能当循环动画时长达到循环时间时会退出动画并转入对应分支，瞄准技能的蓄力动作在到达持续时长后会保持在动作的最后时刻，即轨道的结尾处。直到玩家主动解除瞄准后，再转入对应分支

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/e19efbd4-fb6d-492b-98a7-2bf04674020a.png)

除以上特性外，瞄准技能的事件轨道和分支轨道配置和其他技能相同。在状态轨道上存在两种需要配合使用的状态事件：进入瞄准状态及开启准星：

### (1)进入瞄准状态

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/6a360125-6b30-43a8-9a6a-38b44e2fca8a.png)

 _镜头视野_ ：进入瞄准状态后的视野范围

 _瞄准视角偏移_ ：进入瞄准状态后，镜头位置的偏移值

 _俯仰角度范围_ ：进入瞄准状态后，玩家可调整的镜头俯仰角范围

 _进入过渡时长(秒)_ ：从原始镜头切换至瞄准镜头的过渡时长

 _退出过渡时长(秒)_ ：从瞄准镜头切换至原始镜头的过渡时长

对比是否应用该事件的瞄准技能表现：



使用瞄准状态：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/35da540d-c3bd-4967-ad33-b8858246f9e1.png)



不使用瞄准状态：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/c47927ee-b217-46b2-a35f-4d666f4ee17d.png)

### (2)开启准星

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/06c26b87-dd6a-43c6-b88c-d4f37c1904a6.png)

无可配置参数，开启后的效果：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/c7733aee-e564-4372-b2f7-e95dd9bc1366.png)

## 6.空中技能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/076cc4c0-ff63-4db7-89ac-088eadc8b8c8.png)

在战斗预设-玩家-职业-技能配置中新增空中技能槽位

当角色满足一定空中条件时（高于地面一定距离），指定槽位的技能将被强制替换为空中技能，空中技能默认可在空中释放

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/c8495be4-e315-4e78-9ec1-f710a37b0cf2.png)

当空中技能释放且动画进入【无限循环槽位】后，将一直处于此动画槽位循环内，直到成功判定进入【落地分支】

进入落地分支的判定条件：技能处于“进入落地分支”状态块持续时间内，此时若角色落地，将触发跳转，并进入后续的落地分支。空中技能的落地分支轨道内可配置多个进入落地分支节点

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/b4ac0e26-7875-4863-b8aa-8857326e630c.png)

事件轨道上的事件块，可以配置是否【跟随无限循环槽位执行】，当启用该功能且事件块的时间轴处于无限循环槽位时间区间内，则可以随动画一起无限循环执行

## 7.套组技能

一些包含不可编辑功能的套组动画，将其作为封装好的技能模组投放，例如蹲伏。实际技能使用方式接近瞄准技能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/2f11528e-dcb7-4755-8982-65f33fe59399.png)

# 四、技能槽位

 _技能槽位_ 决定了技能会被显示在UI的哪个位置，以及施放该技能对应的输入。目前开放了以下技能槽位



 _普通攻击_ ：对应PC端鼠标左键



 _技能1_ ：对应PC端键盘E键



 _技能2_ ：对应PC端键盘Q键



 _技能3_ ：对应PC端键盘R键



 _技能4_ ：对应PC端键盘T键

# 五、技能实例

当一个技能被添加到单位身上时，会创建一个对应的 _技能实例_ ，每一个技能实例拥有自己的唯一ID，类型为整数

同一个单位可以拥有多个相同配置ID技能的技能实例，当技能实例被绑定到技能槽位上时，玩家才可以用槽位对应的UI按钮进行输入操作并释放技能，技能实例未被绑定到槽位上时，仅可以用执行节点尝试触发

同一个技能槽位可以容纳多个技能实例，并会以栈结构存储，即后添加的技能会优先显示，当前台技能被销毁或从槽位中解除时，上一个被添加的技能会被作为前台技能映射到UI上

特殊的，空中技能和地面技能(即其余6种技能)拥有独立的存储结构，并当角色在地面或空中时根据对应技能的存储结构决定前台技能

通过节点图，玩家可以自行将技能实例和槽位进行绑定和解绑，被解绑的技能实例依然会存在角色身上，并且可使用次数和剩余冷却时间仍会被记录，冷却时间也会在后台持续计算

# 六、技能的添加

技能的添加主要有两种途径，一是职业的默认配置，在[职业](/ys/ugc/tutorial//detail/mhodlcrpht3q)文档内有详细的使用说明

第二种是通过节点图进行添加

## 1.通过服务端节点图修改技能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/2d95fa3e-a056-41f8-a8de-617fd0b034dd.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/fa7d9a50-a50b-418e-b9f3-5681dc31a541.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/d36ebc5f-2854-490f-8945-fc027793e6f9.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/ed0a41b8-76ae-4336-89cd-d21003c8e1e1.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/cfed64a7-ef86-481d-b9cc-e1660f25ea85.png)

## 2.通过服务端节点绑定/解绑技能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/d0b888a6-5d6a-47bc-af68-0c4021fd6a85.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/c3ebb5e8-9cb5-445e-aac1-ac3b8661530a.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/181171f2-a385-44f1-8170-d3369ec5e0f4.png)

## 3.通过服务端节点图释放技能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/1b018c53-6fe7-41de-8456-4bccb19a789a.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/057dca3c-9b6a-4783-afde-539fc6adc4fd.png)

## 4.双端查询角色技能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/e80198f8-f2cd-472b-a508-238e4e6fca4b.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/c09746d3-4284-4272-87a3-854e508e948b.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/ae1a3e13-7e5e-4776-9fd5-350d6dff6a3e.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/c1067a8a-affe-49a8-be27-dc0d84334382.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/2fc8cfc5-cedf-4d1d-b47b-59c28f9a5680.png)

## 5.客户端节点释放技能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/014d23d2-a2bb-4f37-9d14-5c55a30e6733.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho81frl33im/b0d057d4-2ccb-4270-b7c4-99a660653bb8.png)
