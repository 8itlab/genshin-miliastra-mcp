# 玩法功能进阶实例/3.19复杂造物——通过状态决策触发自定义造物技能

(来源：原神千星奇域·教程，页面 ID mh6riq9wvxqq)

# 前言

## 课程说明：

**课程内容：** 系统讲解复杂造物的完整实现流程，涵盖从技能与状态逻辑设计，最终实现造物自主行为与动态环境寻路。

**学习目标：** 学会如何创建一个复杂造物，捋清【自定义造物技能】，【技能设置】，【造物状态节点图】，【造物状态决策节点图】之间的关系，并让造物可以正确施放自定义技能。同时学习怪物巡逻/寻路的机制，通过寻路阻拦组件帮助造物绕开动态物件。

 _**该课程中涉及【局内编辑器面板配置】和【千星沙箱节点图】两个模块内容，并且相互关联，阅读时建议按照课程顺序完整阅读_

##  相关信息：

**推荐学习顺序：** 【前置课程】→【当前课程】→【综合指南】

 _**如课程中遇到概念不清等问题或想要了解更多相关信息，根据需要查询_** __【综合指南】__** _即可_

**前置课程：** 该课程与以下前置课程所讲述的功能知识点相关 _（建议首次使用时，优先学习_** __【前置课程】__** _，学习体验更流畅）_

> ​​[2.8技能设置——让角色能攻击](/ys/ugc/tutorial/course/detail/mh0apmie08e4)

**关联知识点：** 课程中将涉及以下基础概念 _（建议优先根据该课程学习即可，如遇到概念不清等问题或想要了解更多相关信息，再根据需要查阅_** __【综合指南】__** _相关章节）_

> [复杂造物](/ys/ugc/tutorial//detail/mhb8nl0w8cao)

* * *

# 复杂造物——自定义怪物自主逻辑与技能，让怪物更智能

## 功能示例-1：如何生成一个拥有自定义技能的复杂造物

### 1.概念简述

**复杂造物：** 是支持通过编辑自定义造物技能，自定义寻路，索敌，巡逻等配置的特殊造物类型，可以通过这些模块让造物执行特定行为（如：冲撞持续造成伤害，施放火球等）

**在编辑器和千星沙箱中，复杂造物由造物技能管理（自定义造物技能），自主逻辑参数设置，造物状态决策节点图，巡逻设置4部分组成，这几部分的功能环环相扣，请务必按照顺序学习！**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/1f1580af-fb95-49fd-95be-feaba843c39e.png)

### 2.教学内容

**功能效果：** 制作丘丘霜铠王普通攻击效果，并在造物靠近玩家时持续触发施放。

**效果演示：**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/7bc5b2c3-3eb2-42d8-9b4d-b5027257e675.gif)

 _**如果在试玩时遇到造物（怪物）无法正常攻击、巡逻异常等问题，可以尝试使用【关卡设置-地形导航-烘焙网格体】_

### **3.目标拆解**

## 功能逻辑

以下为制作一个完整的自定义造物所需的功能点，课程中将根据这些功能点进行组合讲解：

①制作丘丘霜铠王的自定义技能

②配置造物状态节点图

③配置造物状态决策节点图

④绑定决策节点图并试玩查看效果

#### ①制作丘丘霜铠王的自定义技能

**操作步骤**

**1.【局内编辑器】创建复杂造物 >>>丘丘霜铠王**

进入元件库>>>选择左边的![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/28874ad7-e507-42cd-8a10-7fddc75342d0.png)图标>>>找到复杂造物的页签>>>选择丘丘部族>>>找到丘丘霜铠王点击后创建。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/c9676d8d-7ba2-49f1-ac85-dd281c0c2085.gif)

在新增造物的左边信息栏内的![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/86b7b868-5d77-43e8-b44a-311274f957c1.png)能预览到四个新增的模块，后续会对四个模块功能分别进行讲解。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/88b8d7f8-1ef0-4cee-92c4-73bff9d7a331.png)

  
**2.【局内编辑器】添加自定义技能**

进入【战斗预设】，选择![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/b845885b-ef17-4d81-9d47-33c9775c181c.png)>>>进入技能页，点击造物自定义技能页签>>>新建技能![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/d315a78c-d305-492f-9047-f7c6983a201a.png)>>>设置技能名称与造物技能归属模型后，即可添加（教学中直接命名为普通攻击，实际可自由配置）

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/be01dc5c-6c66-4ade-8deb-8601b76aa110.gif)

**3.【局内编辑器】配置【技能基础设置】**

可在该页面中配置技能的【归属模型】、【技能打断】、【施放方式】等参数

**教程中全部使用默认参数，未进行修改，此处仅示意，实际使用时可根据技能效果调整

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/6cfcb1e9-b082-444c-bcda-78824cf94f92.png)

 _**配置项说明：_

>  _技能类型：目前有【普通技能】【瞬发技能】_ 两种
> 
>  _瞬发技能：没有动画；施放后，一次性执行所有技能效果_
> 
>  _普通技能仅支持一次性技能动画；可在动画中任意帧插入技能效果（如：武器挥砍时才攻击）_

**4.【千星沙箱】造物技能节点图配置【技能效果】**

在【客户端节点图资源管理器-造物技能节点图】中，添加并配置技能的节点图（设置参考见下图），为达到预期的功能效果教程中配置如下：

 _**特殊：造物技能节点图无需额外配置触发场景（开端固定包含【节点图开始】），施放技能就代表可触发，在后续设置的技能动画编辑中将再说明_

|  | 要做的功能| 对应的配置项  
---|---|---|---  
功能以扇形范围，打出AOE伤害，有击中特效| 触发场景| /| /  
条件| /| /  
结果| 触发攻击| 【执行节点】：使用【特定位置打攻击盒】制作攻击伤害效果  
  
 _**攻击盒配置项逻辑说明（更多详细说明可自行查阅_ _【综合指南-能力单元效果】_ _）：_

伤害范围| 攻击位置| 获取自身位置和旋转，攻击点为玩家施放技能后角色当前位置  
---|---|---  
攻击范围| 【攻击盒类型】选择了扇形，设置其高度、角度、半径等范围参数即可  
伤害目标和形式| 攻击对象为除了自己以外的其他人| 【目标阵营筛选】选择需求的受击目标  
范围内AOE| 选择【触发类型】为每个实体只触发一次（范围内所有单位都会造成一次伤害）  
伤害值| 攻击有一定伤害| 伤害值=伤害系数*攻击力+伤害增量（实际伤害与防御力有关，此处不拓展讲解）教程中为了便于展示效果，仅设置伤害增量，并设置该次伤害为【绝对伤害】**绝对伤害，忽略防御值，仅以伤害增量直接造成伤害  
命中时的其他效果| 攻击命中有特效提示| 【命中特效】配置一个合适的特效资产即可，并配置合适的【特效缩放】和【偏移】  
可以看到伤害数字| 【是否屏蔽伤害跳字】=否  
  
打开客户端节点图资源管理器—并且新建一个造物技能节点图：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/167a1b67-dc40-46c6-bb86-846b867aa6c1.gif)

配置需要的造物技能节点图内容：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/5dd26cc5-5641-4770-999a-387c64235f22.png)

此外，还可以使用其他技能节点制作功能（如：回血、转向、发射子弹等）

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/e70d2c86-aac3-4b8d-afb2-040d8f92b064.png)

**5.【局内编辑器】配置【造物动画】**

点击【动画编辑】进入动画时间轴编辑页，为达到预期的功能效果教程中配置如下：

要做的功能| 对应的配置项  
---|---  
丘丘霜铠王普通攻击| 选择动画合适的动画资产，教程中以丘丘霜铠王_近战攻击_01为例  
挥剑中途才造成伤害（即拔剑时没有伤害，挥出时才造成伤害）| 【节点图事件轨道】找到需要的动画对应的具体帧，添加步骤4中配置的技能节点图  
造物有挥击动画| 【状态轨道】添加特效，配置挂接点【GI_WeaponR】挂点可在【造物】-【添加通用组件-自定义挂接点】查看  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/a7278d8f-804f-4c30-8a4d-5659a9061a52.png)

配置完成后，可在当前界面直接预览技能动画和伤害范围效果

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/94f8bd6f-b9f8-41a3-83e0-9996d6a608ba.gif)

**6.【局内编辑器】造物技能配置【技能触发】**

进入【元件库】，选择新建的丘丘霜铠王>>>选择![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/b635508e-ad11-402b-bf90-ec1096c66939.png)>>>打开造物技能管理>>>![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/ce7654c6-085d-4043-b9f3-717d846e114f.png)新增造物技能，点击选择造物技能添加制作好的普通攻击技能。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/e07345a7-07d1-4be5-83a0-b5e18358ecc4.gif)

#### ②配置造物状态节点图

**操作步骤：**

**1.【千星沙箱】造物状态节点图配置【技能触发】**

造物状态节点图配置【技能触发】（设置参考见下图），为达到预期的功能效果教程中配置如下：

|  | 要做的功能| 对应的配置项  
---|---|---|---  
功能为造物配置状态| 触发场景| /| /  
条件| /| /  
结果| 让造物会按照预期移动到目标并执行技能| 【执行节点】：战术：移动到目标实体——执行技能  
  
打开【客户端节点图资源管理器>>>造物状态节点图】—并且新建一个造物状态节点图：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/38ff590e-2a4e-4a53-9fbd-a92a5aba28f4.gif)

配置需要的造物状态节点图内容：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/a7dab3fd-06ad-41fb-bd43-7f29010c26eb.png)

#### ③配置造物状态决策节点图

**操作步骤**

**1.【局内编辑器】自主逻辑参数设置**

进入【元件库】，选择新建的丘丘霜铠王>>>选择![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/b635508e-ad11-402b-bf90-ec1096c66939.png)>>>打开自主逻辑参数设置>>>![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/ce7654c6-085d-4043-b9f3-717d846e114f.png)新增，并将自主参数设置为初始生效。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/b5269462-d1c3-4f99-a649-1971e9cc10cf.gif)

可在该页面中配置技能的【入战设置】、【脱战设置】、【领地设置】等参数

**教程中全部使用默认参数，未进行修改，此处仅示意，实际使用时可根据技能效果调整

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/39c62ac7-a13d-4623-a520-e0fe184d3d8d.png)

**2.【千星沙箱】造物状态决策节点图配置【自主逻辑绑定】**

造物状态状态节点图配置【自主逻辑绑定】（设置参考见下图），为达到预期的功能效果教程中配置如下：

|  | 要做的功能| 对应的配置项  
---|---|---|---  
功能为造物配置状态| 触发场景| /| /  
条件| /| /  
结果| 让造物以特定的自主逻辑寻敌并触发状态| 【执行节点】：切换自身执行状态，并且绑定执行状态的自主逻辑参数。  
  
打开【客户端节点图资源管理器——造物状态决策节点图】—并且新建一个造物状态决策节点图：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/e03714f6-5042-455f-ad99-cb7dd996e1cb.gif)

配置需要的造物状态决策节点图内容：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/21f82998-24a3-44cd-8f37-a59bf32dffd2.png)

#### ④绑定决策节点图并试玩查看效果

**操作步骤：**

**1.【局内编辑器】造物状态决策节点图绑定到对应造物上**

进入【元件库】，选择新建的丘丘霜铠王>>>选择![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/b635508e-ad11-402b-bf90-ec1096c66939.png)>>>打开造物状态决策节点图>>>![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/250cad0e-ee14-4602-bf41-11576076dcff.png)选择配置好的状态决策节点图，并且保存。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/18c41a72-229c-4ed0-80ef-3a16a69329b1.gif)

**2.【局内编辑器】将造物放置到场景内并试玩查看效果。**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/5ed069ca-0c69-42ce-b47b-636819aa9d4b.gif)

##  功能示例-2：如何为复杂造物添加巡逻机制

### 1.教学内容

**功能效果：** 制作打手丘丘人进行巡逻

**效果演示：**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/0d107f52-7809-49d8-a748-cc5353a1e054.gif)

 _**如果在试玩时遇到造物（怪物）无法正常攻击、巡逻异常等问题，可以尝试使用【关卡设置-地形导航-烘焙网格体】_

### 2.操作步骤

**1.【局内编辑器】创建复杂造物 >>>打手丘丘人**

进入元件库>>>选择左边的![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/28874ad7-e507-42cd-8a10-7fddc75342d0.png)图标>>>找到复杂造物的页签>>>选择丘丘部族>>>找到打手丘丘人点击后创建。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/26153ecc-24e9-40ee-909b-19858d74037d.gif)

**2.【局内编辑器】巡逻设置**

进入【元件库】，选择新建的打手丘丘人>>>选择![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/b635508e-ad11-402b-bf90-ec1096c66939.png)>>>打开巡逻设置>>>![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/ce7654c6-085d-4043-b9f3-717d846e114f.png)新增巡逻模板，并为其添加巡逻路径，通过路点设置添加寻路路径。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/a8c8013b-0817-4ebd-921c-17f6282193ca.gif)

可在该页面中配置循环类型和巡逻起始点位置等参数。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/80eb9c90-660a-4956-8860-5331007144ab.png)

**3.【千星沙箱】造物状态节点图配置【巡逻触发】**

造物状态节点图配置【技能触发】（设置参考见下图），为达到预期的功能效果教程中配置如下：

|  | 要做的功能| 对应的配置项  
---|---|---|---  
功能为造物配置状态| 触发场景| /| /  
条件| /| /  
结果| 让造物会进行巡逻状态| 【执行节点】：战术：移动到目标实体——执行技能  
  
打开【客户端节点图资源管理器>>>造物状态节点图】—并且新建一个造物状态节点图：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/38ff590e-2a4e-4a53-9fbd-a92a5aba28f4.gif)

配置需要的造物状态节点图内容：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/0dc72d15-6549-473b-a670-76c972286ca8.png)

**3.【局内编辑器】自主逻辑参数设置**

进入【元件库】，选择新建的打手丘丘人>>>选择![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/b635508e-ad11-402b-bf90-ec1096c66939.png)>>>打开自主逻辑参数设置>>>![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/ce7654c6-085d-4043-b9f3-717d846e114f.png)新增，并将自主参数设置为初始生效。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/38bec400-9753-4a4a-98e5-5f7b71c2fa7b.gif)

**4.【千星沙箱】造物状态决策节点图配置【自主逻辑绑定】**

造物状态状态节点图配置【自主逻辑绑定】（设置参考见下图），为达到预期的功能效果教程中配置如下：

|  | 要做的功能| 对应的配置项  
---|---|---|---  
功能为造物配置状态| 触发场景| /| /  
条件| /| /  
结果| 让造物进入巡逻的状态| 【执行节点】：切换自身执行状态，并且绑定执行状态的自主逻辑参数。  
  
打开【客户端节点图资源管理器——造物状态决策节点图】—并且新建一个造物状态决策节点图：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/e03714f6-5042-455f-ad99-cb7dd996e1cb.gif)

配置需要的造物状态决策节点图内容：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/c2ab57c6-af45-43a0-bc41-b8536cf2817b.png)

**5.【局内编辑器】造物状态决策节点图绑定到对应造物上**

进入【元件库】，选择新建的打手丘丘人>>>选择![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/b635508e-ad11-402b-bf90-ec1096c66939.png)>>>打开造物状态决策节点图>>>![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/250cad0e-ee14-4602-bf41-11576076dcff.png)选择配置好的状态决策节点图，并且保存。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/8de20d16-086d-4e78-a022-da7319e5811f.gif)

**6.【局内编辑器】将丘丘人置入场景并进入试玩查看**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/0d107f52-7809-49d8-a748-cc5353a1e054.gif)

##  功能示例-3：如何在造物寻路/巡逻时自动绕开动态物件

### 1.教学内容

**功能效果：** 打手丘丘人在进行巡逻时，会自动绕开添加寻路阻拦组件的动态物件。

**效果演示：**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/65ee7f06-5d7e-47d3-8573-1519969dc294.gif)

 _**如果在试玩时遇到造物（怪物）无法正常攻击、巡逻异常等问题，可以尝试使用【关卡设置-地形导航-烘焙网格体】_

### 2.操作步骤

**1.【局内编辑器】添加组件**

创建一个元件作为交互物（教程以石质功能平台为例），在面板中点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/40b76732-1d76-4f6c-8a5e-ef5868a39cc4.png)>>>进入组件页，点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/2d5fc8ce-0835-4985-a717-cb3d896da622.png)>>>选择【寻路阻挡】>>>修改对应参数即可

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/8bbeeb32-5855-4a32-8c92-a742b5b4d5b3.gif)

**2.【局内编辑器】将动态物件添加到场景中**

将对应物件放置到功能示例-2制作的路径中间，并添加一个没有寻路阻挡的石质功能平台作为对照。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/63596855-8075-46bb-92a6-be497254f234.png)

**3.【局内编辑器】试玩体验**

将制作好的元件放置在场景中，进入试玩即可体验该功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/65ee7f06-5d7e-47d3-8573-1519969dc294.gif)

* * *

# 课程总结及辅助课件

**课程作业：** 可根据课程教学内容尝试进行以下功能复刻/拓展

> 功能复刻：制作造物朝目标位置发射子弹的技能。
> 
> 进阶拓展：制作一套完整的怪物自主逻辑，先进行寻路，识别到附近的敌方单位时造成普通攻击和发射子弹等等技能。

**课程回顾：** 学会如何通过复杂造的自定义造物技能、造物状态、造物状态决策之间的基本逻辑与设置，学习了专为动态组件添加的寻路阻挡组件在造物寻路时的作用。

### 辅助课件

我们提供了上述课程内容相关的工程文件，可结合** _【教学存档-复杂造物】_** 对照学习

![](https://webstatic.mihoyo.com/upload/static-resource/2022/10/14/64e71b8a5e28fbdbc3d3df5d311e4154_847866555738962172.svg)

复杂造物.gil

39.7 KB

[](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh6riq9wvxqq/578fce75-4bf4-487e-82a3-9e1216b4c885.gil)
