# 概念介绍/高级概念/主镜头

(来源：原神千星奇域·综合指南，页面 ID mhfua005zpeg)

_镜头_ 是游戏中用于呈现玩家视角的工具。它决定了玩家在游戏中看到的画面。

在超限模式中支持创作者(奇匠)通过定义镜头模板的方式来定义镜头的规则，每一个镜头模板都对应一种镜头状态。

# 一、镜头模板的定义

在游玩过程中可以提供给玩家使用的 _镜头模板_ ，都需要在主镜头管理中进行编辑，入口如下图所示：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/ea79f08d-c9b5-4c27-912b-fd7b4f07a7fa.png)

在游戏运行过程中，每个玩家都会有一个唯一生效的镜头模板：

不同玩家之间生效的镜头模板可能不同，例如联机时玩家A生效模板为“模板1”，同时玩家B生效模板为“模板2”。

运行时可以通过节点图切换某一个具体玩家实体的生效镜头模板，但无法动态修改模板内的参数。

# 二、镜头模板编辑

进入主镜头编辑后，可以看到以下界面，主要分为三个部分：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/f96d1758-852e-40eb-92fc-475fcc1c936a.png)

1.

当前预览镜头模板的参数配置

2.

场景内镜头位置和人物位置关系预览

3.

实际游戏运行时游戏画面预览

# 三、镜头模板参数配置

## 1.模板名称

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/e0de24bf-6a94-4a99-a457-fe6f0231d61f.png)

 _模板名称_ ：该镜头模板的命名，用于备注该模板在玩法中的定位，同时也被作为节点图操作玩家单位主镜头模板时的引用

## 2.位置信息

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/0b4f9ea8-d201-4e86-b1a9-ab3f91ee8811.png)

镜头与角色的相对位置信息：编辑时的参数，默认折叠，用于显示当前预览界面下，镜头和角色相对位置关系的详细参数，作为编辑时的参考

## 3.镜头基础配置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/66fda3ae-4622-4865-92c6-a0230e76f7f6.png)

 _移动模式_ ：当前版本仅支持镜头跟随单位为角色实体，后续会拓展为支持其他实体单位，例如载具等

 _模式_ ：区分镜头模板类型的重要参数，模式决定了镜头的主要镜头规则，每种模式下的镜头可微调参数也会有所区别

 _默认生效目标_ ：镜头模板作为玩家身上的参数，在运行时可以直接修改对应玩家的镜头模板，但初始化时必须依赖玩家的职业进行赋予，该字段可以设置该模板初始应用于哪些职业

## 4.镜头详细设置

根据上述的模式不同，在模板的详细设置里暴露的可调整参数也会有所区别

### (1)经典镜头

经典镜头是和经典模式一致的镜头模板类型，参数置灰，只支持预览并不支持修改，因此不做赘述

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/62729ac5-462e-4ba9-a1be-f34ba1e071f6.png)

### (2)3D背镜头

3D背镜头是一种越肩镜头，镜头位置位于角色的右后方，参考表现如下：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/3480369b-8ccc-4913-8a0c-2cf48cf04cfa.png)

详细设置如下图：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/37b24c93-fe51-4dc4-9a4a-7a12446402c8.png)

 _镜头视野检测_ ：视场角，即视锥范围，如下图，修改FOV时会改变白色视锥的范围

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/f5f4c56a-f984-4c75-bb99-e1a6870e2ded.png) _忽略镜头碰撞_ ：为“否”时，镜头可能会被场景内的实体碰撞所推挤，产生卡顿或镜头突变等问题。为“是”时，镜头将会忽略其他碰撞，但与之相对的，镜头位置可能会移动到模型的内部，导致表现不佳，因此需要创作者(奇匠)根据实际的玩法场景进行定制

 _视点偏移_ ：镜头看向目标后，在世界坐标系下额外叠加的位置偏移，下图红框内即为看点

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/946dcd45-7099-4897-aa31-e5fd3ba64e73.png)

 _视点跟随旋转_ ：镜头是否跟随角色旋转而旋转

 _默认视距_ ：初始化时，镜头距离看点的距离

 _视距范围_ ：通过玩家的操作输入可以调整的视距范围

 _水平角度范围_ ：玩家通过操作输入左右移动镜头时，镜头可被左右旋转的范围，单位为角度

 _俯仰角度范围_ ：玩家通过操作输入上下移动镜头时，镜头可被上下旋转的范围，单位为角度

### (3)2.5D镜头

用于传统2.5D游戏的镜头，参考表现如下：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/d199e12b-ed59-4bd0-a665-8a3bf7698d8b.png)

详细设置如下图：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/58953f31-b54c-45b1-9bbd-8f052ff135cb.png)

其他属性：在前文已有说明，不再赘述

### (4)第一人称镜头

镜头位于角色的眼睛位置，模仿第一人称观察场景的表现，参考表现如下：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/e67dab12-9d70-4595-b426-483b87673fbc.png)

详细设置如下图：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/fd446b72-7c2c-48c7-96c3-344176d6e269.png)

### (5)第三人称镜头

和经典模式的镜头近似，区别在于详细设置支持用户进行修改：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/deaa9359-e182-45c2-af67-d52c1f0dbcaf.png)

详细设置如下图：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/1ae6d9bf-fa43-45c0-9f44-69c9f8010024.png)

# 四、镜头模板切换

可以使用节点图在运行时动态切换镜头模板，目标单位为 _玩家实体的列表_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/7600e084-f21f-4bf3-b864-be4caf6ae810.png)

# 五、物件镜头

## 1.镜头基础设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/fe34c7f0-57c3-4631-b2e9-46c8f1c3f7cc.png)

 _模式_ ：新增物件镜头支持镜头跟随物件/造物实体，当前仅支持第三人称镜头

 _移动模式_ ：区分镜头模板类型的重要参数，模式决定了镜头的主要镜头规则，每种模式下的镜头可微调参数也会有所区别。当前仅支持跟随物件/造物

## 2.详细设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/1458ea92-f1fa-4365-8d2a-33086793948a.png)

与角色镜头参数配置逻辑相同

## 3.运动修正设置

### (1)镜头跟随旋转

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/66b6e1d4-aee8-409d-8404-ea17cd728d3e.png)

 _镜头跟随旋转_ ：决定物件镜头是否在镜头位置发生偏移后修正镜头位置，关闭时以下参数且不生效不可修改

 _水平回正基准_ ：基于物件正方向的水平方向上物件镜头的修正基准，0为物件正方向

 _俯仰回正基准_ ：基于物件正方向的垂直方向上物件镜头的修正基准，0为物件正方向

水平回正速度与俯仰回正速度的范围为[0°,360°]，水平回正基准与俯仰回正基准的范围为[-180°,180°]

_仅在移动时修正_ ：开启后在满足下述条件后，将根据配置速度与基准角度修正物件镜头：  
1.物件镜头挂载对象物件发生位移 2.玩家并未移动或控制镜头

 _镜头延迟跟随_ ：决定在玩家停止移动控制镜头后是否立刻开始镜头修正

 _延迟跟随时间_ ：在玩家停止移动镜头后，延迟对应时间后开始镜头修正，每次移动镜头均将重置计时

### (2)镜头视野修正

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/9d2cd618-824b-46f5-9077-0fe32a170134.png)

 _镜头视野修正_ ：决定是否根据物件的运动速度修正物件镜头的镜头视野，适用于加速等表现效果，关闭时以下参数且不生效不可修改

 _正向最大视野变化量_ ：当物件处于正向移动最大速度运动状态下的视野修正值，配置后实际运行时将根据速度在[0,最大速度]中的位置决定具体FOV修正值，当以最大速度运动时镜头视野=配置值+修正值

 _正向速率最大参考值_ ：进行FOV修正的正向运动速度基准

 _逆向速度视野变化量_ ：当物件处于逆向移动最大速度运动状态下的视野修正值，配置后实际运行时将根据速度在[0,最大速度]中的位置决定具体FOV修正值，当以最大速度运动时镜头视野=配置值+修正值

 _逆向速率最大参考值_ ：进行FOV修正的正向运动速度基准

### (3)镜头运动阻尼

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/5f00f61d-de7a-4ae8-bdd9-bf09e8a6336a.png)

 _自定义运动阻尼_ ：决定镜头跟随物件运动的阻尼系数是否由奇匠自行配置，关闭时三轴阻尼系数均为1，即有效阻尼时间为0.15秒

 _运动阻尼系数_ ：决定镜头三个方向的跟随阻尼系数，默认值均为0，可输入范围（0，10】，数值越大与物件运动速度的跟随延迟越大，该轴有效阻尼时间 = 0.15 秒 × 该轴运动阻尼系数。

## 4.物件镜头的使用

在动态物件和造物中添加通用组件【物件镜头】，在选择镜头中选择预先配置好的物件镜头模板![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/1882014e-741d-4009-b8e9-95e0b003bf14.png)

在关卡运行中，使用节点图来切换对应镜头

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/7d81ada0-b115-4685-89a6-bd7d862b84a4.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfua005zpeg/2566d494-aae9-4032-a230-f48a03605000.png)
