# 概念介绍/高级概念/技能/复杂造物技能

(来源：原神千星奇域·综合指南，页面 ID mhftoirpwd46)

# 一、造物技能的定义

 _造物技能_ 是让造物执行某一段预设行为的封装。在提瓦特大陆中，丘丘人的丢史莱姆，丢石头等，都是一个技能。

技能主要实现三个基本功能：



 _造物动画_ 的调用：在技能编辑时，奇匠可以定义技能释放后的造物动画演出效果



触发客户端节点图：通过编辑技能动画 _节点图事件轨道_ 上的事件，可以在动画的特定阶段触发指定的客户端节点图



配置 _技能状态_ ：在动画播放的过程中，可以指定特定的时间窗口附加持续性的逻辑，比如播放特效、设置造物朝向等

# 二、造物技能的编辑

## 1.编辑入口

造物技能编辑的入口位于战斗预设页签的技能页签下

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhftoirpwd46/1840d25f-b982-4529-a13f-af1628349e9f.png)

点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhftoirpwd46/7d29c030-fca5-4afd-856e-ec681369cb28.png)，在弹窗选择要为哪个造物创建技能，这决定了编辑技能时，提供的技能动画

最后点击【确认创建】即可完成新技能的添加

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhftoirpwd46/f20f1b03-300e-4e44-b34f-397bd4a25c8d.png)

## 2.技能参数

一个技能的参数配置如下图：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhftoirpwd46/133c846c-1b7e-493d-9f2c-1fb99ed14e16.png)

 _配置ID_ ：技能的唯一标识，在节点图修改对应的技能配置时，引用该ID

 _技能类型_ ：目前分为两种

 _瞬发技能_ ：无法编辑动画，在接受输入的瞬间立即触发逻辑

 _普通技能_ ：基础的技能类型

### (1)基础设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhftoirpwd46/6c55ccd6-b40b-486f-ba7a-ee7d1b5a33f0.png)

 _归属模型_ ：不同造物模型可用技能动作不同，切换模型时会清空当前造物技能所有配置

 _技能备注_ ：奇匠可自定义为该技能做一些备注

### (2)通用配置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhftoirpwd46/5b148520-7697-44cf-9a95-c3e4d518767f.png)

配置参数| 说明  
---|---  
 _可打断其他技能_|  开启后可以在其他技能正在释放时，打断其他技能释放该技能  
 _自动面向目标_|  开启后技能自动面对目标释放  
 _击败目标是否继续释放_|  关闭后如果目标不存在则不使用  
 _目标可达时释放技能_|  开启时若目标所在位置可正常寻路抵达，会释放技能  
 _目标不可达时释放技能_|  开启时若目标所在位置不可正常寻路抵达，会释放技能  
  
# 三、造物技能的动画编辑

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhftoirpwd46/faee2177-0c70-4eef-9429-2a3726f07bba.png)

在定义完了技能的通用配置后，即可点击动画编辑，来继续编辑技能释放后的具体逻辑，仅普通技能类型支持配置动画

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhftoirpwd46/bb84b281-cf7c-47c6-87c8-7190e2da3bb5.png)

界面如上图，以时间轴的形式来进行配置，分为动作轴和逻辑轴。在技能释放时，从前往后按时间依次触发动作轴上的动画，以及逻辑轴上的事件，依次来实现整个技能的具体效果。

### 1.添加动作

首先我们需要添加对应的 _动作_ ，入口在上图“1”所示位置，点击可选择目前可用的 _造物动画_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhftoirpwd46/e2d56526-992a-4149-b821-f5741973cbea.png)

动画是整个 _技能轨道_ 的尺度，事件轴的总长度等于所有动画的时长之和，在对应的动画时点添加事件，即可让表现和逻辑匹配

### 2.编辑事件轨道

事件轨道在上图"2"所示位置

 _事件轨道_ 分为四种类型：

 _开始事件轨道_ ：在技能开始释放时立即触发的时点

 _结束事件轨道_ ：在技能的动作全部播放完成后触发的时点

 _节点图事件轨道_ ：可以根据动作进度进行打点并添加事件的轨道，在该轨道下可选择具体的动画进度位置，并添加一个 _本地节点图_ ，如下图。当动画进行到配置的进度处时，本地节点图会被触发

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhftoirpwd46/25a41ca1-0cac-4bb3-868d-a4d7c2f18399.png)

 _状态轨道_ ：用于定义非触发类型的表现，如持续播放特效等，如下图，并且可以自由配置该状态的开始时点和结束时点

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhftoirpwd46/9e8e1bca-38d4-4198-a608-884d3987f545.png)

注意：状态轨道中的【设置造物朝向】事件，在多个事件有重叠的时候，互相之间逻辑上会有竞争关系，所以有重叠的事件不会被执行。如下图中第二个事件不会被执行，只会执行第一和第三个【设置造物朝向】事件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhftoirpwd46/7b2cb8e7-dfb2-4acd-845e-94d2768b0221.png)

### 3.瞬发技能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhftoirpwd46/1c9270b8-4b71-424e-ba28-597b68239cac.png)

界面如上图，由于瞬发技能的所有逻辑都在技能释放瞬间触发，且也不会调用动画。因此瞬发技能不可添加动作，且只保留开始事件轨道

# 四、造物技能的添加

在复杂造物的特化配置，造物技能管理中，点击详情编辑进入详情界面

在引用技能中点击"+"，并在左下角弹出的页签中选择预先定义好的技能即可完成添加

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhftoirpwd46/5e5d5147-a506-4b46-a077-b10865ed75ae.png)
