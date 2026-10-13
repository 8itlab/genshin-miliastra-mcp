# 概念介绍/单位/玩家

(来源：原神千星奇域·综合指南，页面 ID mhctmgi51lpo)

# 一、玩家的概念

 _玩家_ 是一种特殊的抽象实体类型，用于描述游戏中“角色的从属概念”，如：

在提瓦特上，玩家队伍中可以编入多个角色。

在超限模式中，每个 _玩家_ 只对应一个 _角色_ 。

# 二、玩家的配置

玩家的具体配置通过玩家模板进行引用，模板配置入口如下：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhctmgi51lpo/648d7a1f-70a1-4bf1-812c-547d384e5cf0.png)

点击 _新建模版_ 即可创建一个新的玩家模板

## 1.基础信息

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhctmgi51lpo/b416981d-f77e-4c82-a9d4-8c607905f9f9.png)

基础信息页签：可配置所有可用的玩家基础信息

 _生效目标_ ：决定了该模板对哪些玩家生效

 _等级_ ：覆写职业的初始等级

 _出生点_ ：玩家可用的出生点列表，见预设点文档[预设点](/ys/ugc/tutorial//detail/mhfvn30ctm9c)

 _初始职业_ ：该玩家模板的初始职业，职业定义见职业文档[职业](/ys/ugc/tutorial//detail/mhodlcrpht3q)

 _复苏_ ：玩家对应的复苏规则，见复苏规则文档[复苏](/ys/ugc/tutorial//detail/mh796lr44x0e)

 _特殊被击倒损伤_ ：当角色因为溺水、摔伤等特殊原因被击倒时，扣除的生命的百分比

## 2.组件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhctmgi51lpo/82bcdd15-3123-4366-aeb5-e0da6834be9a.png)

通用组件页签，可在此页签给玩家实体添加组件，或查看已添加的组件

玩家实体的可用组件概览

[自定义变量](/ys/ugc/tutorial//detail/mhso1b9wjica)

[全局计时器](/ys/ugc/tutorial//detail/mhawd6rl5kpy)

[单位状态](/ys/ugc/tutorial//detail/mhd7nxrfa8im)

## 3.节点图

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhctmgi51lpo/aa58af34-bf27-4107-b4c3-e94f738426b1.png)

节点图配置页签，可在此页签给玩家实体添加节点图，或查看已添加的节点图

# 三、运行时特性

## **1.无物理实体**

玩家实体是一个纯逻辑实体

## **2.没有布设信息**

玩家实体并不会直接布设在场景上，因此没有布设信息

## **3.生命周期**

玩家实体的生命周期随关卡初始化创建，随关卡销毁而移除

当用户主动退出返回大厅时，玩家实体会被移除

# 四、常驻光标

常驻光标功能主要用于屏幕点击相关的功能实现

## 1.功能入口

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhctmgi51lpo/fe56a8f0-9d94-45d4-89fa-17be515d358b.png)

玩家模板 - 玩家编辑 - 光标配置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhctmgi51lpo/684b5c6b-2a28-45ac-8cca-cf8cd99828e0.png)

 _光标常驻_ ：关闭时光标系统及相关功能无效，开启时该玩家的光标会常驻显示

 _可点击层级_ ：场景/受击盒/物件碰撞/光标碰撞

 _光标最多可选目标数_ ：光标最多可选目标数量

 _点击可穿透UI控件_ ：关闭时，光标点击穿过UI控件后不再打到场景

## 2.特殊说明

在移动端使用常驻光标功能时，必须要使用单位状态效果【光标点击释放技能】来补充PC端鼠标点击选中的额外逻辑

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhctmgi51lpo/aa783136-f821-4b1c-aa1b-b789ca6f5e3f.png)
