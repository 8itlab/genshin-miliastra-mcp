# 概念介绍/高级概念/技能/角色操控技能

(来源：原神千星奇域·综合指南，页面 ID mhj4a0rzu4pi)

# 一、角色操控技能的定义

角色操控技能为操控状态下才可以使用的特殊类别角色技能，配置方式与角色技能类似，但释放期间角色无技能动画表现

角色操控技能有以下特性：



自定义槽位时长：在技能编辑时，奇匠可以自由定义单个槽位的具体时间



触发客户端节点图：通过编辑技能动画 _节点图事件轨道_ 上的事件，可以在特定时间触发指定的客户端节点图



属于角色技能子类：角色操控技能仍然属于角色技能，释放主体为角色，添加、移除方式与角色技能完全相同且可以使用角色技能适配的所有节点图节点、单位状态、技能槽位等功能

# 二、角色操控技能的编辑

## 1.编辑入口

角色操控技能的入口位于战斗预设页签的技能页签下

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj4a0rzu4pi/d59d388a-52a4-4120-9f6f-edae5d5384b7.png)

点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj4a0rzu4pi/b8260f06-dd99-407c-9a8a-8d5461b394fa.png)可打开角色操控技能添加面板，在此处可编辑技能名称、所属页签以及在编辑界面的预览对象  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj4a0rzu4pi/6776f5f8-2ec6-49e5-9732-c66036ffd2b1.png)

预览对象：默认为空模型，可选择所有挂载有操控运动器组件的元件作为预览对象，仅预览不影响实际技能效果，后续编辑时可通过底部【预览对象】功能按钮切换预览对象，预览对象显示的位置高度会根据组件中的实体接地位置所配置的高度进行修正。

点击【确认创建】即可完成新技能的添加

## 2.技能参数

角色操控技能的参数配置如下图

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj4a0rzu4pi/c9c34d0b-544b-466c-9cd8-75a23b82abdb.png)

 _配置ID_ ：技能的唯一标识，在节点图修改对应的技能配置时，引用该ID

 _技能类型_ ：目前分为三种

 _瞬发技能_ ：无技能动画槽位，在接受输入的瞬间立即触发逻辑

 _普通技能_ ：基础的技能类型

 _长按技能_ ：提供长按槽位的技能，可根据玩家长按输入的时间进行不同分支的响应

### (1)基础设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj4a0rzu4pi/2c0b42d8-e403-4659-834c-434f29d9a0f0.png)

 _技能备注_ ：可以在编辑时描述该技能的大致作用

### (2)数值配置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj4a0rzu4pi/7fc76bf5-1f0b-46ce-9c84-58a152664f4b.png)

数值参数与技能编辑相同，具体查看[技能](/ys/ugc/tutorial//detail/mho81frl33im)  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj4a0rzu4pi/82e8b3cf-2842-45e0-8bb2-6943e93faf09.png)

*技能属性组：可以修改技能属性组的值来动态修改技能的部分行为，角色操控技能仅支持通过属性组调整冷却时间倍率

### (3)生命周期管理

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj4a0rzu4pi/5269b0fb-cf16-44bd-915d-75703ef9fbad.png)

 _达到次数上限是否销毁技能_ ：开启时可以配置次数上限

 _次数上限_ ：该技能在整个生命周期内可以使用的次数，当技能被使用达到最大次数时，技能会被自动移除

### (4)技能预瞄准配置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj4a0rzu4pi/b34b6a00-779f-4ec9-8a87-4f1c80eca926.png)

角色操控技能的瞬发技能、普通技能类型支持配置技能预瞄准，预瞄准相关内容详细可见[技能预瞄准](/ys/ugc/tutorial//detail/mhr3pdi50u1g)

## 3.角色操控技能的动画编辑

与普通技能编辑逻辑相同，定义完施放条件和施放逻辑后，可点击【动画编辑】编辑后续逻辑，角色操控技能的配置方式会与角色技能略有差异：

### (1)普通技能

以普通技能为例介绍角色操控技能的大致配置方式，场景中的预览模型可通过上文中的【预览对象】进行切换

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj4a0rzu4pi/8674e9e9-9e5f-4ee0-a581-875ddbd9f17c.png)

#### a.槽位编辑

不同于角色技能、造物技能等带有动画表现的技能类型，角色操控技能本身不关联动画，仅含有一个可填入自定义时长的【操控状态空动画】槽位

填入自定义时长后即作为整个 _技能轨道_ 的尺度，在对应的时点添加事件，即可让技能逻辑与时间匹配。

#### b.编辑事件轨道

事件轨道在上图“2”位置，角色操控技能的时间轨道分为3种类型：  
_开始事件轨道_ ：在技能开始释放时立即触发的时点

 _结束事件轨道_ ：在技能的动作全部播放完成后触发的时点

 _节点图事件轨道_ ：可以根据技能时间进度进行打点并添加事件的轨道，在该轨道下可选择具体的进度位置，并添加一个 _客户端节点图_ ，如下图。当动画进行到配置的进度处时，客户端节点图会被触发。角色操控技能的节点图时间轨道同样支持配置为循环节轨道，详细可见[技能](/ys/ugc/tutorial//detail/mho81frl33im)-技能时间轴循环节部分

*角色操控技能仅支持添加节点图类型为【角色操控技能节点图】的 _客户端节点图_  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj4a0rzu4pi/f2dabc36-9643-4cdb-8fed-fe0765cf458e.png)

### (2)瞬发技能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj4a0rzu4pi/4491d8b5-b408-474f-ad12-2f4059718d71.png)

界面如上图，由于瞬发技能的所有逻辑都在技能释放瞬间触发，因此只保留开始事件轨道

### (3)长按技能

长按技能与角色长按技能逻辑类似，包含2个操控状态空动画，分别对应有长按状态空动画与长按结束空动画，根据玩家使用技能时的长按时间来执行不同的逻辑

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj4a0rzu4pi/12fb62fb-8903-49f5-9282-d09d5bb14a82.png)

分别输入二者的持续时长后，在实际施放技能时：

如果角色进入该技能后输入保持长按状态，则会持续运行长按状态空动画中配置的技能逻辑，最多为奇匠输入的时长

如果角色进入该技能后未保持输入长按，则长按状态空动画的逻辑会立即中断，并根据 _分支轨道_ 配置跳转对应分支

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj4a0rzu4pi/a52fe0bf-0edc-4019-8dd5-c9f04ab017ba.png)

#### a.分支

点击下图中的按钮可添加或删除分支，每个分支代表了1个结束空槽位的配置逻辑，在实际的技能施放过程中，根据技能长按的松开时机，会转入到某一个分支中

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj4a0rzu4pi/5af13c39-5726-49e7-a9e5-e3126afa96b0.png)

每个分支独立对应着自己的操控状态空动画

#### b.分支轨道

分支轨道定义了如何跳转至各个分支的具体规则，点击分支轨道，会在界面右侧弹出分支事件编辑界面

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj4a0rzu4pi/81cc3460-17c3-462d-8616-18de71ab62a3.png)

 _可跳转分支数_ ：该技能支持几种分支跳转情境，该配置会使分支轨道被划分为对应数量的段落

 _响应_ ：支持由创作者(奇匠)配置分支轨道的每一个段落跳转到哪一个具体分支上

在分支轨道上，创作者(奇匠)可以通过调节每个段落的长度，来精细化调节分支转入的条件。在实际的运行时，当玩家停止长按时，当前的技能进度落在哪一个响应段落内，则动画会自动转入该段落所对应配置的分支
