# 概念介绍/功能/通用组件/选项卡

(来源：原神千星奇域·综合指南，页面 ID mh5jko05fzyw)

# 一、选项卡组件的功能

选项卡组件赋予玩家对动态物件和造物配置交互操作的功能

实体添加此组件后，支持同时配置、生效多个选项卡

每个选项卡支持通过本地过滤器判定对每个玩家是否显示

触发选项卡功能的实体类型为 _角色_

#  二、选项卡组件的编辑

## 1.添加组件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh5jko05fzyw/c423d851-ceee-47bd-b205-2d090c9c7acf.png)

(1)在实体或元件编辑界面中，打开组件编辑页签(A)

(2)点击下方的“添加通用组件”，选择并点击“选项卡”，成功添加(B)、(C)

选中“选项卡”时，编辑中的实体会以蓝色范围显示选项卡触发区

(3)点击“详细编辑”，展开编辑页(D)

## 2.选项卡的编辑

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh5jko05fzyw/88f83311-30a4-434f-93f0-92483517bb95.png)

### (1)选项卡基础信息

配置参数| 说明  
---|---  
 _初始生效选项卡_|  下拉菜单提供选项卡枚举通过修改后面的勾选框，可以修改生效情况，修改后生效状态会同步到选项卡编辑页内![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh5jko05fzyw/7c3918a0-6563-47ec-bf0c-d8396b405fb4.png)  
 _*选项卡列表_|  枚举实体配置的所有选项卡  
  
可以通过点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh5jko05fzyw/416aba3b-0a5f-49a2-8565-e209f5851e51.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh5jko05fzyw/248ee51d-6a8c-4b1d-be13-0c81f6a44529.png)来切换选项卡在编辑窗口的可见性状态，仅编辑时生效

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh5jko05fzyw/cfeff724-9fa5-4b59-86b8-6b4708876ad1.png)

点击“详细编辑”可进入选项卡列表和触发区域配置界面

### (2)选项卡列表

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh5jko05fzyw/b383661a-ca10-47ca-ba93-f488937bf84c.png)



新增选项卡

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh5jko05fzyw/279a7ea0-b26d-4cb4-8f5d-04790bb02148.png)

点击添加选项卡，可新增选项卡



选项卡编辑

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh5jko05fzyw/d6f02735-09ef-41ee-a0ca-ba5905527421.png)

 _选项序号_ _序号_ _X_ ，可用于节点图入参，调整选项卡的生效与否

 _选项卡图标_ 点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh5jko05fzyw/77feb70d-503e-4841-8b9f-5812853dfdb2.png)，可切换选项卡前面的图标。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh5jko05fzyw/7a500877-045a-4ac1-91fa-e331d4757de9.png)

 _初始生效_ 若开启，则该选项卡随实体创建立即生效。生效的选项卡可见，并可操作选中

 _排序等级_ 控制选项卡的显示顺序，数字越大，显示越靠前

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh5jko05fzyw/03e8430f-5ae2-403c-aa87-b32c2606699d.png)

 _本地过滤器_ 分为布尔过滤器和整数过滤器两种。具体可见[节点图](/ys/ugc/tutorial//detail/mhjwjrr5n73i)

 _过滤器节点图_ 可引用上述选择类型的过滤器节点图，用于判断选项卡是否达成显示条件

以下用布尔过滤器举例

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh5jko05fzyw/80339b63-46c3-4cd6-93bb-1d92ba524781.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh5jko05fzyw/edc323c6-8dac-4128-bacc-b6e157f0f677.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh5jko05fzyw/7001a998-33ee-409b-8332-1e1f0f757bcc.png)

本地过滤器会在角色进入生效范围期间内，持续进行检测，若结果变化，立即更新显示。

对应本地过滤器节点图中的基础节点，进行说明



获取自身实体

输出参数为挂载选项卡组件的实体



获取目标实体

当自身角色在范围里，该节点输出参数为在选项卡生效范围内的自身角色实体



获取当前角色

输出参数为本地角色



举例说明

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh5jko05fzyw/5b396071-b1e5-4665-a230-0ad24c0f84e6.png)

### (3)触发选项区域

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh5jko05fzyw/2de29b16-d266-4f97-80c5-31090c952fdd.png)



添加触发区域

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh5jko05fzyw/e1d49f69-8279-40d2-b324-6c2b1cbb7117.png)

点击添加触发选项区域按键，可新增触发区域



触发区域

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh5jko05fzyw/108a6909-0530-42ff-bc6c-fb45bb47343a.png)

配置参数| 说明  
---|---  
 _触发区形状_|  支持长方体、球体、胶囊体，根据选择的不同形状会展开具体的大小配置参数  
 _中心_|  相对实体/元件中心的偏移  
 _旋转_|  以中心位置为基准，在不同轴向上支持调整朝向  
 _缩放倍率_|  触发区配置形状在不同轴向上支持定义缩放  
  
# 三、通过节点图管理选项卡



激活/关闭选项卡

通过输入选项卡序号，可控制选项卡的激活与否

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh5jko05fzyw/0ac37ad1-fcbd-4f38-9e2a-25634f69b26b.png)



选项卡选中时

生效的选项卡被选中后，会向节点图发送事件

配置选项卡组件的实体节点图，会接受该事件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh5jko05fzyw/bf31d9aa-3c25-4da5-a14f-68f042b0c61c.png)

配置参数| 说明  
---|---  
 _事件源实体_|  挂载选项卡组件的实体  
 _事件源GUID_|  挂载选项卡组件的实体，若无则输出0  
 _选项卡序号_|  选项卡的序号![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh5jko05fzyw/29eb36dc-31a2-4bda-a229-b406178b9a99.png)  
 _选择者实体_|  触发选项卡时的角色实体
