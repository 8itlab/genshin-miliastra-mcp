# 基础功能逻辑&玩法流程/2.2角色设置——增强角色属性，让角色能跑能跳

(来源：原神千星奇域·教程，页面 ID mhr0zrrfahm6)

# 前言

## 课程说明：

**课程内容：** 该课程主要包括战斗预设中对于玩家/角色/职业三个模块的设置

**学习目标：** 学会如何通过面板配置或节点图调整角色的控制和属性变化

 _**该课程中涉及【局内编辑器面板配置】和【 千星沙箱节点图】两个模块内容，并且相互关联，阅读时建议按照课程顺序完整阅读_

## 相关信息：

**推荐学习顺序：** 【前置课程】→【当前课程】→【综合指南】

 _**如课程中遇到概念不清等问题或想要了解更多相关信息，根据需要查询_** __【综合指南】__** _即可_

**前置课程：** 该课程与以下前置课程所讲述的功能知识点相关 _（建议首次使用时，优先学习_** __【前置课程】__** _，学习体验更流畅）_

> [2.1碰撞与交互——触发一个事件](/ys/ugc/tutorial/course/detail/mhumsn9uap96)

关联知识点：课程中将涉及以下基础概念 _（建议优先根据该课程学习即可，如遇到概念不清等问题或想要了解更多相关信息，再根据需要查阅_** __【综合指南】__** _相关章节）_

> [玩家](/ys/ugc/tutorial//detail/mhctmgi51lpo)
> 
> [角色](/ys/ugc/tutorial//detail/mh3ecor1x5cm)
> 
> [职业](/ys/ugc/tutorial//detail/mhodlcrpht3q)

* * *

# 绑定职业——改变角色属性

## 功能示例-1：更改绑定的职业

### 1.概念简述

在编辑器和千星沙箱中，将与【玩家】与【角色】相关的各项设置，拆分为【玩家】、【角色】、【职业】三项配置

> 【玩家】：一种特殊的抽象实体类型，处理游戏中逻辑层运算，没有物理实体
> 
>  _参考：原神中，玩家的队伍中可以最多存在4个角色，这4个角色从属于1个玩家实体_
> 
>  _**需要额外说明的是，在UGC中，每个玩家至多对应1个角色，而非本篇中1个玩家至多对应4个角色_
> 
> 【角色】：游戏过程中玩家实际控制的走跑爬飞单位，有物理实体
> 
>  _参考：实际玩家操控的香菱、行秋、班尼特等，都属于角色实体_
> 
> 【职业】：可以视作是玩家的一个属性，影响玩家的角色的初始属性和技能
> 
>  _参考：玩家操控的香菱、行秋、班尼特角色本身没有任何属性和技能，是通过添加香菱、行秋、班尼特的职业实现具有不同的EQ和普攻_

### 2.教学内容

**功能效果：** 制作两个属性不同的初始职业（该功能可不使用节点图，仅面板配置实现），可用作非对称竞技玩法中的不同阵营角色（躲猫猫类玩法）；实际应用时可根据需要制作不同移动能力、不同属性、不同技能等的差异化职业

**效果演示：**

 _**演示中职业A、B设置为生命值差异，职业B生命值=1，职业A生命值=10000；查看底部生命值即可看出角色差异_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/9ca23fce-a89f-4a2e-b3a8-59884942dc6d.gif)

### 3.操作步骤

**1.【局内编辑器】添加职业**

点击局内编辑器顶部菜单栏![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/7fd88652-9bf2-4f60-9e30-87edf12ad45a.png)>>>切换至战斗预设，点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/a0ca3da1-1fbb-4d10-8332-ccaff258305a.png)>>>进入玩家设置分页，选择【职业】>>>点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/310e3626-6924-4129-86a0-9b597b4e94e6.png)创建职业

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/ebccec1f-9edd-4f0c-9df1-4a923545353e.png)

**2.【局内编辑器】配置面板参数**

为达到预期的功能效果教程中配置如下：

要做的功能| 对应的配置项  
---|---  
职业AB有血量差异| 【属性-基础生命值】配置不同，职业A=10000，职业B=1  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/05280897-86af-4d20-8e89-a808e6db7c03.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/ae9c71fd-62f4-4566-bea5-789e108f3bdc.png)

此外，还可在面板中配置职业的【等级】、【复苏】、【基础移动】、【镜头与界面布局】、【名称】等规则，实际使用时可根据需求自由调整

**3.【局内编辑器】绑定职业**

在玩家模版中，选择所需的初始职业即可

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/a7abd675-c510-4d0c-bb43-a7020fb266ee.png)

## 可变更的属性

在编辑器和千星沙箱中，可通过更改职业的以下规则，影响角色的属性

>  _等级设置：初始等级、最高等级、升级所需经验等_
> 
>  _复苏设置：死亡后是否允许复苏、复苏规则等_
> 
>  _基础移动：是否允许跳跃/冲刺/攀爬/滑翔等移动属性_
> 
>  _各项属性：基础生命值、攻击力、防御力、体力上限等_
> 
>  _镜头与界面布局：玩家操作视角、界面所显示的UI控件信息_

### 等级设置

### 操作方式

#### 1.面板配置

等级设置共有2部分：【玩家】中的等级设置 和 【职业】中的等级设置

> 【玩家】中的等级设置：覆盖初始绑定职业的等级设置，但不影响切换为其他职业时的等级
> 
> 【职业】中的等级设置：首次切换为该职业时，玩家的职业等级
> 
>  _如：共有【玩家A-等级1】，【职业A-等级5】、【职业B-等级10】，设置玩家初始职业为职业A；_
> 
>  _进入游戏后，实际等级为1（玩家覆盖初始绑定职业的等级设置）；在游玩过程中切换为职业B，将以【职业】中的等级设定为准，等级为10（切换为其他职业后以其他职业的等级设置为准）_
> 
> ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/ba6859a7-b2a9-431e-802f-897f848941d5.png)
> 
> ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/c498d206-dab0-44e0-afa5-d90e9771b3b5.png)

#### 2.节点图配置

节点图中有【更改职业等级】、【提升职业经验】2个节点可调整等级

> 更改职业等级：把当前的职业等级更改为xx级
> 
> 提升职业经验：提供xx经验值
> 
> ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/e16618aa-e573-4a92-9ce7-605a0d024262.png)

### 复苏设置

### 操作方式

#### 面板配置

复苏设置分2部分：【玩家】中的复苏规则 和 【关卡设置】中的复苏点设置

> 【玩家】中的复苏规则：是否允许复苏、耗时、复苏点选择规则等
> 
> 【关卡设置】中的复苏点设置：复苏点列表设定，影响复苏规则中可选择的复苏点
> 
> ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/c92d02d8-d245-46b1-a6a7-cc065d27164c.png)
> 
> ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/bb2ecd78-c3d7-415a-a392-05cf05ca8c24.png)

### 基础移动

### 操作方式

#### 面板配置

在【职业】中进行配置，通过绑定特定职业来规定操控角色的基础移动属性（跳跃/冲刺/攀爬/滑翔）

> ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/e0edfea8-b195-4e6b-9afe-ecf0eeda5dbf.png)

_**需要额外说明的是：角色攀爬需要【职业-允许攀爬】+【攀爬的物体-是否可攀爬】同时设定，才能进行攀爬_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/d3de6788-966d-49b3-b69f-a8b47f1c414e.png)

### 各项属性

### 操作方式

#### 面板配置

在【职业】中进行配置，通过绑定特定职业来规定操控角色的各项属性（生命值/攻击力/防御力/体力值上限等）

> ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/827d34cf-26d8-4632-b109-aac6ba2cea81.png)

### 镜头与界面布局

### 操作方式

#### 面板配置

在【职业】中进行配置，通过绑定特定职业来规定操控角色的镜头与界面布局

 _**该配置项涉及其他模块设置，将在后续课程进行拓展讲解，此处仅简单示意职业中的配置位置_

> ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/86b485d1-ed9c-4e80-81f2-62ba100f9ee4.png)

# 拓展应用

该模块仅作为教学课程所能拓展应用的功能简述，涉及到多模块联动，以操作步骤演示为主，了解进阶用法即可

## 功能示例-2：交互选项卡后，更改职业

**功能效果：** 制作两个不同职业（有血量差异），当玩家交互选项后，如果选项为1，则更改为职业B，如果选项为2，则更改为职业A

**效果演示：**

演示中职业A、B设置为生命值差异，职业B生命值=1，职业A生命值=10000；生命值变更时，即切换职业成功

 _**演示中的文本显示，需达到特定奇匠等级后解锁【自定义文本外显】功能，教程中以效果展示为主_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/b3a0fbad-1296-40a5-a8ec-a4c8bb9848b2.gif)

**实现步骤：**

1.创建一个元件，作为交互物

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/38168731-e479-4c71-ae78-b5519b4a461a.png)

2.添加【组件-选项卡】，并配置选项和触发区

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/bf4cad7b-2396-41d0-924c-8306e52f9d17.png)

3.节点图配置（设置参考见下图）

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/488131e5-f1a1-423a-b03a-2044cad1502d.png)

4.将节点图挂载在元件上，保存设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/4aa7f96e-c9f0-4e8b-9b0a-1b8ff26ddf27.png)

5.将元件放置在场景中

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/75fa05f5-908d-4ea1-94df-7e6acdcfa46a.png)

6.进入试玩，即可体验该功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/b3a0fbad-1296-40a5-a8ec-a4c8bb9848b2.gif)

## 功能示例-3：交互选项卡后，更改职业等级为固定等级

**功能说明：** 当玩家交互选项后，如果选项为1，则更改为10级，如果选项为2，则提升为20级

**效果演示：**

 _**演示中的文本显示，需达到特定奇匠等级后解锁【自定义文本外显】功能，教程中以效果展示为主_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/8c44c54e-5e6a-44bc-9413-3056525147f8.gif)

**实现步骤：** 与功能示例1步骤相同，仅节点图差异，详见下图参考

1.创建一个元件，作为交互物

2.添加【组件-选项卡】，并配置选项和触发区

3.节点图配置（设置参考见下图）

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/559b65b3-0f05-4c0f-9ea6-d3dcc380fc2d.png)

4.将节点图挂载在元件上，保存设置

5.将元件放置在场景中

6.进入试玩，即可体验该功能

## 功能示例-4：交互选项卡后，更改职业等级为当前等级+1

**功能说明：** 当玩家交互选项后，当前等级升1级

**效果演示：**

 _**演示中的文本显示，需达到特定奇匠等级后解锁【自定义文本外显】功能，教程中以效果展示为主_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/43316c03-54c0-4f24-83a6-bc7e76f115b8.gif)

**实现步骤：** 与功能示例1步骤相同，仅节点图差异，详见下图参考

1.创建一个元件，作为交互物

2.添加【组件-选项卡】，并配置选项和触发区

3.节点图配置（设置参考见下图）

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/8ce75794-daba-4b63-8cbb-1a9278efd19d.png)

4.将节点图挂载在元件上，保存设置

5.将元件放置在场景中

6.进入试玩，即可体验该功能

* * *

# 课程总结及辅助课件

**课程作业：** 可根据课程教学内容尝试进行以下功能复刻/创新

> 功能复刻-1：在特定区域进行职业切换，切换后角色不可跳跃、不可冲刺（可用于跑酷/解密玩法中，特定场景下限制移动方式进行精准走位）
> 
> 功能复刻-2：制作一个悬崖墙面，墙面上布设藤蔓路径，仅允许角色沿藤蔓路径攀爬，其他墙面位置不可攀爬（可用于跑酷/解密玩法中，沿特定引导路径攀爬移动）

**课程回顾：** 学会如何通过更改职业影响角色属性，制作具有差异化（移动能力、属性、技能等）的职业

### 辅助课件

我们提供了上述课程内容相关的工程文件，可结合** _【教学存档-角色设置】_** 对照学习

![](https://webstatic.mihoyo.com/upload/static-resource/2022/10/14/64e71b8a5e28fbdbc3d3df5d311e4154_847866555738962172.svg)

角色设置.gil

29.7 KB

[](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhr0zrrfahm6/c9e9ab29-4d03-4fa3-ace3-b91b3de1d307.gil)
