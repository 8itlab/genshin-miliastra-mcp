# 概念介绍/资产/界面控件/卡牌选择器界面控件

(来源：原神千星奇域·综合指南，页面 ID mh2teu0bmfbc)

卡牌选择器提供编辑简单的决策交互界面功能

支持对可决策内容进行编辑，包括决策时间、决策项的表现、决策的交互方式等

# **一、卡牌选择器** 的功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/3d81c54f-ef8a-4970-bf1c-247b806ac6e1.png)

关卡运行中，可通过默认配置/节点图唤起 _卡牌选择器_

支持玩家进行交互，并在超时/交互后向节点图发送 _决策弹窗完成事件_

# **二、卡牌选择器的编** 辑

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/1ef77ba0-7ac1-4c09-8bdb-f366fb8f2442.png)

## **1.添加卡牌选择器**



在 _界面控件组编辑窗口_ ，添加界面控件模板-卡牌选择器



卡牌选择器默认为一个界面控件组

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/8227fb66-5884-4fc6-b603-16c8a80433de.png)

## **2.界面配** 置 - 卡牌选择器

是卡牌选择器的整体外显和使用规则配置处，支持玩家定义卡牌选择器的外显风格

### (1)可见性

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/85f926de-6b05-4eb2-8835-bf976717e1db.png)

配置参数| 说明  
---|---  
 _索引_|  用于唤起卡牌选择器节点的入参  
 _初始可见_|  若不勾选，则界面控件激活后不可见支持通过节点图-_修改界面控件组状态_ 调整该参数  
  
### (2)变换

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/12495957-cc90-4111-a6bf-1b417b322a47.png)

配置参数| 说明  
---|---  
 _位置_|  支持手写输入界面控件位置也支持通过编辑界面拖动该界面控件，进行调整  
 _*大小_|  不支持配置  
 _层级_|  数字越大显示层级越高  
  
## **3.界面配** 置 - 决策面板

### (1)页面设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/7f12a6f4-3903-4774-8051-43603a9638dc.png)

#### a.可见性

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/571a2e9a-cfb5-4614-8821-612d11a1d2b3.png)

#### b.卡牌选择器

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/91b7a3d3-43a4-432e-af5d-891b348c57c5.png)

配置参数| 说明  
---|---  
 _显示标题_|  勾选则当前卡牌选择器有最上方标题，并且可编辑  
 _标题文本_|  支持编辑显示标题  
 _界面布局_|  枚举两种样式供选择  
列表| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/0dde8423-a2fd-4659-8ffc-3d3f6697a858.png)  
网格| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/ced190df-5028-449d-99b6-5add120c440a.png)  
  
#### **c.显示已选择数量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/df93c590-f57b-4788-9e95-1d0b66a8ff67.png)

配置参数| 说明  
---|---  
 _显示已选择数量_|  是否在卡牌选择器界面上显示当前已经选择个数  
  
#### **d.显示可重置次数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/98a61593-4026-4708-869e-4735ac3c7703.png)

配置参数| 说明  
---|---  
 _显示可重置次数_|  是否在卡牌选择器界面上显示选择项可重置的下限和上限个数  
  
#### **e.时间显示**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/99df4401-a54b-4bb1-8782-61be61bcf3bd.png)

配置参数| 说明  
---|---  
 _显示剩余时间(s)_|  若勾选，则倒计时时间结束时，自动关闭卡牌选择器，无需手动关闭若倒计时时间结束前，玩家已完成交互，则后续界面是否留存遵从 _决策完成样式_ 和 _决策完成样式停留时长_  
 _结束前预警时间(s)_|  倒计时剩余时间达到配置时间时，会在时间显示界面空间上，做红色闪烁提示表现  
  
#### **f.其他设** 置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/3b3d5b6e-b6ac-4160-a4e9-7f4e1975deb8.png)

配置参数| 说明  
---|---  
 _单人游玩打开页面时暂停游戏_|  若勾选则当关卡为单人关卡时，进行选择的时候会暂停游戏  
 _控件可收起_|  若勾选，则卡牌选择器支持主动收起可选择暂不处理，后续处理或直到超时![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/b7d6068b-54dc-41ba-aa03-b1480d3edb6b.png)  
 _可放弃选择_|  若勾选，则卡牌选择器支持主动关闭，卡牌选择器会增加关闭界面控件并支持交互若选择关闭，则触发节点图的 决策完成-主动关闭事件  
  
### (2)选项配置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/2a712298-5241-438f-b5ab-2bd539082e00.png)

#### **a.已知卡牌设置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/af6b32cd-fdbb-4454-b5b0-7557f5878bcb.png)

配置参数| 说明  
---|---  
 _显示卡牌图标_|  外显卡牌是否包含图标，若包含，则支持指定设置中配置其图标  
 _显示卡牌标题_|  外显卡牌是否显示标题，若包含，则支持指定设置中配置其标题  
 _显示卡牌描述_|  外显卡牌是否显示描述，若包含，则支持指定设置中配置其描述  
  
#### **b.未知卡牌设置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/a2c4d07a-4fce-4e02-ae0a-812decbd1386.png)

配置参数| 说明  
---|---  
 _选择后展示结果_|  在决策完成后，是否将选定决策项播放动效，切换显示其实际返回值  
 _结果页关闭方式_|  倒计时关闭| 需要额外配置**倒计时时长(s)**  
手动关闭| 需要主动关闭弹窗作为结束  
 _倒计时时长(s)_|  决策完成后，经过配置时间以后，卡牌选择器会主动关闭  
  
#### **c.卡牌库设置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/0fe773e3-cdc6-4421-952a-5efa21e4cc2a.png)

通过详情编辑，配置卡牌显示

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/9195b5e3-446e-4d8e-a4ab-32bacc8299e2.png)

配置参数| 说明  
---|---  
 _卡牌序号_|  用于在节点图唤起卡牌选择器时，作为卡牌显示调用从1开始按顺序递增，不可修改  
 _卡牌类型_|  已知卡牌| 提供明确可配置图标  
未知卡牌| 仅提供问号图标，推荐搭配**选择后展示结果** 及**倒计时关闭** 一同使用  
 _卡牌图标_|  综合设置中开启图标配置，才会有该配置  
 _卡牌标题_|  文本配置  
 _卡牌描述_|  文本配置  
 _标签颜色_|  文本颜色  
 _标签描述_|  文本配置  
  
# **三、通过节点图管理卡牌选择器**



**唤起卡牌选择器**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/6fc14589-3ea2-41bc-bd55-5af2f7da477b.png)



**关闭卡牌选择器**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/700fcc74-01a7-4b3d-a1d3-8fefb902ce91.png)



**卡牌选择器完成时**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/aaeaf001-82ff-41de-8402-e78193c5d0e0.png)



**随机卡牌选择器选择列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2teu0bmfbc/e3c5ed81-e5b0-4b4c-ade9-70f5e0e1dea4.png)
