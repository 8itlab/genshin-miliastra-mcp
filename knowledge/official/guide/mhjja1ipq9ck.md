# 概念介绍/资产/界面控件/道具展示界面控件

(来源：原神千星奇域·综合指南，页面 ID mhjja1ipq9ck)

# 一、道具展示的功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjja1ipq9ck/1b62a47c-bae0-481b-b5cf-29e6102e1a8a.png)

关卡运行中，点击和外接设备输入，都可以触发该界面控件的交互。

支持玩家进行交互，在选择类型为“玩家当前装备”或“模板道具”时，交互后向节点图发送 _界面控件组触发时_ 事件

# **二、道具展示的编辑**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjja1ipq9ck/3781366d-eb2d-46d5-ad91-2daca57db0e9.png)

 _是否可交互_

开启时可以配置交互的方式

 _按键映射-键鼠_

提供PC按键供选择，作为输入交互项。选择后会显示在编辑窗口按键下方

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjja1ipq9ck/77a7a8c1-1366-4a6b-acb1-e595d07af3ad.png)

 _按键映射-手柄_

提供手柄按键供选择，作为输入交互项。选择后会显示在编辑窗口按键下方

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjja1ipq9ck/45fd49e9-ade4-4320-bbce-e0e70213beb9.png)

 _类型_

分为玩家当前装备、模板道具、背包内道具三种类型

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjja1ipq9ck/73321abb-1ca5-4e1a-9f72-c894c39fceeb.png)



玩家当前装备

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjja1ipq9ck/863fddb2-2702-4e70-b93d-165d8a7911da.png)

 _装备配置ID变量_

可选取玩家自身的变量

 _无装备时表现_

当前没有装备时，该控件的表现形式

分为显示空白槽位和隐藏两种

 _栏位冷却时间(s)_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjja1ipq9ck/3388a665-ce3c-46cc-a77a-1db9996350db.png)

可选取玩家自身，玩家1-8，关卡上的某个浮点数类型的自定义变量

 _栏位使用次数_

开启后可以配置无次数时隐藏和次数

 _无次数时隐藏_

开启后若无使用次数则隐藏该控件

 _次数_

可选取玩家自身，玩家1-8，关卡上的某个自定义变量

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjja1ipq9ck/3388a665-ce3c-46cc-a77a-1db9996350db.png)



模板道具

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjja1ipq9ck/83c766f8-b0cb-441d-ade9-ea4ed7061d1e.png)

 _道具配置ID变量_

可选取玩家自身，玩家1-8，关卡上的某个自定义变量

 _道具数量展示_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjja1ipq9ck/2e9e88bc-00f1-443b-9dae-d61d89ca0e5f.png)

开启后图标正下方会显示当前道具数量，图中00

 _数量为零时隐藏_

开启后若道具数量为零时则隐藏该控件

 _道具数量变量_

可选取玩家自身，玩家1-8，关卡上的某个自定义变量

 _栏位冷却时间(s)_

可选取玩家自身，玩家1-8，关卡上的某个自定义变量



背包内道具

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjja1ipq9ck/5fa77725-0c63-4036-969a-4df3ccced771.png)

 _道具配置ID变量_

可选取玩家自身上的某个自定义变量

 _无道具时表现_

当前没有道具时，该控件的表现形式

分为显示空白槽位和隐藏两种

# 三、通过节点图管理道具展示

**界面控件组触发时**

在关卡运行中，通过按钮界面控件制作的界面控件组，被执行交互操作会发送节点图事件”界面控件组触发时“，此事件只有触发交互的 _玩家_ 节点图可以获取

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjja1ipq9ck/ee5d3822-df7b-471e-959f-b2d6937c50cf.png)
