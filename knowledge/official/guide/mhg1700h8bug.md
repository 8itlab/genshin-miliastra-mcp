# 概念介绍/高级概念/界面控件组管理/界面控件组

(来源：原神千星奇域·综合指南，页面 ID mhg1700h8bug)

# 一、界面控件组的定义

 _界面控件组_ 是创作者(奇匠)对界面控件的自定义数据。

界面控件组是对单个/多个预制 _界面控件_ ，进行组合、编辑参数后保存的数据。

界面控件组包括单个界面控件组，组合界面控件组两种。

[界面控件](/ys/ugc/tutorial//detail/mhnapxrumtzy)指用于设计和实现[界面布局](/ys/ugc/tutorial//detail/mhozt0r74ng6)的各种资产

# 二、界面控件组的编辑

界面控件组模板可以直接引用于 _界面布局_ 的配置，也可以通过节点图管理。

组合界面控件组可以通过界面控件组组合统一管理，也可以对包含的单个界面控件做状态管理。

## 1.命名和索引

在 _界面控件组库管理工具_ 中，每个界面控件组都有其索引，作为节点图的入参

界面控件组模板的组合、组合内控件，都有自己的索引进行标识

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhg1700h8bug/8ff0d769-18ec-45f0-bdc6-46f1b1147c8c.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhg1700h8bug/cb67f1c3-c753-434e-8b94-5a0e4de9a620.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhg1700h8bug/632ab907-15a5-4d42-90a4-e79ae4cc333f.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhg1700h8bug/12760bbc-821f-4d82-a9d7-8b3ad1da99fe.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhg1700h8bug/341c3605-9ee5-4ad7-b0ff-5a5d65f4a08c.png)

## **2.界面控件组状态**

(1)界面控件组 _状态_ ：**激活、未激活**



激活 存在于界面布局，可通过节点图管理表现状态



未激活 不存在于界面布局，不可操作表现状态

(2)已经激活的界面控件组 _表现状态_ ：**开启、关闭、隐藏**



开启，界面控件组可见性开启。

隐藏状态到开启状态，将界面控件组可见性开启。

关闭状态到开启状态，将界面控件组重新初始化，并开启可见性



关闭，界面控件组可见性关闭，并且不保留动态改动的信息

关闭后开启的界面控件组，表现和数据都会初始化



隐藏，界面控件组可见性关闭，并且保留动态改动的信息

隐藏后开启的界面控件组，表现和数据都和隐藏前的一致

# 三、界面控件组的管理

## 1.以界面布局引用

在界面布局中引用的界面控件组模板，默认随界面布局一同激活。不可对状态修改，仅可对表现状态做调整。

## 2.以节点图管理



**激活控件组库内界面控件组**

运行时，可以将界面控件组创建在玩家的当前界面布局中。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhg1700h8bug/7e1dde56-bcdb-4173-8c38-ae906d920204.png)



**移除控件组库内界面控件组**

运行时，可以将”**激活控件组库内界面控件组** “节点创建的界面控件组在玩家的当前界面布局中移除

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhg1700h8bug/92698f84-90d6-48f5-a336-a39361d48296.png)



**修改界面布局内界面控件状态**

对已经激活的界面控件，可调整其表现状态。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhg1700h8bug/08df02d6-cba9-4e26-ae68-0ffb548ce18c.png)



**界面控件组触发时**  
该事件只有触发按钮的 _玩家_ 节点图可以收到。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhg1700h8bug/6aa19b5f-1bfb-49e5-ad66-c565a2e00c35.png)
