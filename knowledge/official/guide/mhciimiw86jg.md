# 概念介绍/单位/本地投射物

(来源：原神千星奇域·综合指南，页面 ID mhciimiw86jg)

# 一、本地投射物的定义

本地投射物是由本地计算和呈现投射物效果以及命中表现效果的实体

# 二、本地投射物的特点

本地投射物需要在编辑时预先定义，才能被技能节点图引用创建。技能相关可参考[技能](/ys/ugc/tutorial//detail/mho81frl33im)

本地投射物实体运行时，依赖 _投射运动器_ 决定其运行时的规则，依赖 _命中检测_ 决定其碰撞触发的判定规则和效果。

本地投射物实体运行时，遵循“生命周期”的配置

# **三、本地投射物的编** 辑

## 1.新建本地投射物

进入战斗预设页签后，可以选择本地投射物页签，按需管理页签，并在页签内新建对应的本地投射物

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhciimiw86jg/175d8d52-3df2-47b7-a635-f16d64ddc621.png)

点击 _确认创建_ 即可新建一个本地投射物

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhciimiw86jg/b747d61e-d1a7-4c34-a912-be3b764b151e.png)

## 2.命名与索引

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhciimiw86jg/c3836dae-56e2-4bd0-adbf-f39602542e4e.png)

每个预定义的本地投射物 _命名_ 需要全局唯一，并且会自动生成全局唯一的 _元件_ _ID_ 。

## **3.基础属** 性

第一栏为基础属性栏

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhciimiw86jg/7a5b2314-5a5d-46d2-8e54-617ba669680b.png)

### (1)基础设置

本地投射物运行时采用的模型配置，可选模型皆来自于预先提供的投射物模型库。

支持调节xyz轴缩放，切换模型后，缩放数值会保留

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhciimiw86jg/a71e187a-60dd-44e6-bd0a-71c8089c395f.png)

### **(2)战斗参数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhciimiw86jg/9861e375-6340-46f3-addd-bc2176d4507d.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhciimiw86jg/ff3a3b5f-8c5b-429a-803e-303f744c0efc.png)

配置参数| 说明  
---|---  
 _属性设置_|  提供2个枚举项， _继承自创建者_ 和 _独立设置_ ，不同选项选择后下方对应的参数不同默认为继承自创建者继承自创建者：生命值、攻击力、防御力，和创建者相同独立设置：按需配置生命值、攻击力、防御力不同选项选择后下方对应的参数不同  
 _后续是否受创建者影响_|  若开启，则创建者受到的部分单位状态会同步给投射物仅有影响生命值、攻击力、防御力的单位状态会同步  
  
### **(3)生命周期设** 置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhciimiw86jg/78ebfcb8-a4bc-4db6-9529-79c6f536d560.png)

配置参数| 说明  
---|---  
 _永久持续_|  若不开启，需要填写具体的 _持续时长_  
 _持续时长_|  无其他影响因素条件下，该本地投射物从开始运行到销毁的最长时间  
 _X/Z轴销毁距离_|  除 _能力单元_ 外，优先级最高的本地投射物运行时销毁判定条件本地投射物运行时超过最大销毁距离，会自行销毁  
 _Y轴销毁距离_  
  
### **(4)生命周期结束时行为设** 置

本地投射物生命周期结束时，会依照配置顺序从上到下执行配置的能力单元。

此处引用的能力单元来自于该本地投射物能力单元内的编辑。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhciimiw86jg/f46ca98e-bbb9-4e66-85e4-d33e0a355e3c.png)

## **4.通用组件**

第二栏为通用组件栏

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhciimiw86jg/a15743df-e8cb-487b-aa78-ba637a449393.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhciimiw86jg/2c1bb4fa-78af-4d3b-825a-d5088cf61c4c.png)

### **(1)特效播放** 组件

详情可见[特效播放](/ys/ugc/tutorial//detail/mh4ppo02m1o8)

### **(2)投射运动** 器组件

详情可见[投射运动器](/ys/ugc/tutorial//detail/mhaqt9rgqv4u)

### **(3)命中检** 测组件

详情可见[命中检测](/ys/ugc/tutorial//detail/mh2pir0hat1s)

## 5.能力单元

第三栏为能力单元栏

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhciimiw86jg/e3764b10-41e3-417d-b22e-af87b2ac0c8d.png)

本地投射物可引用能力单元，需要进行预定义编辑，详情可见[能力单元](/ys/ugc/tutorial//detail/mh0ucw9e76f6)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhciimiw86jg/14d4f93e-bec1-40af-9233-d9346e7d6b82.png)

通过“详细编辑”可以对能力单元进行调整

在 _命中检测组件_ 中，可引用预定义的能力单元，在命中检测生效后执行
