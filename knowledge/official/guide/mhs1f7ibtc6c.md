# 概念介绍/资产/界面控件/消息队列控件

(来源：原神千星奇域·综合指南，页面 ID mhs1f7ibtc6c)

# 一、消息队列的功能

 _消息队列_ 可以配置在界面布局中，并通过节点图实时推送指定样式的消息

消息队列控件适用于游戏进程中各种信息的推送与展示，如得分、资源获取、关卡流程更新等

消息队列控件仅供信息展示使用，不可交互

消息项在加入队列，移出队列时，会额外附带动画表现

# **二、消息队列的编辑**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhs1f7ibtc6c/f8957a19-2733-40c9-abba-71931407ec25.png)

## **1.添加消息队列**

在 _界面控件组编辑窗口_ ，添加界面控件模板-消息队列

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhs1f7ibtc6c/2aef96a5-f718-48fe-b13a-254c74f8548d.png)

## 2.消息项样式设置

与页签控件，单选项视窗控件类似，在样式设置中，可以定制消息项的样式

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhs1f7ibtc6c/d90e2cd8-5bba-4581-9dc7-a4a298f5768d.png)

奇匠可以点击【详情编辑】在消息项素材组中加入任意素材。比如可以添加界面动效，使得每次新消息项加入显示区时，触发界面动效的播放，以提示新消息项的更新

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhs1f7ibtc6c/a9255096-a94d-4fe4-b832-2dd69af1a542.png)

注意：消息在更新时，默认带有渐入和渐出动画，若同时更新大量消息，可能会存在动画导致的显示延迟问题

## 3.消息队列功能设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhs1f7ibtc6c/e214f7cf-de32-4159-bb27-5494e665f83e.png)



初始填充点：

第一个消息项加入队列时的初始填充位置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhs1f7ibtc6c/1e506525-1930-4990-b6e8-45ea08fa456a.png)



填充方向：

消息项的填充方向

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhs1f7ibtc6c/8759ef6d-8c7c-4347-896e-c91f1d798ff2.png)



新消息插入位置：

可以搭配【填充方向】【初始填充点】参数实现不同的效果

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhs1f7ibtc6c/ac2a18c3-3631-4b35-a0a1-985ae9767c4d.png)

举例：当排列限制=自动换行时：

若初始填充点=左上，填充方向=纵向，新消息插入位置=队列结尾，则消息在加入队列时，会从上到下进行填充

若初始填充点=左下，填充方向=纵向，新消息插入位置=队列开头，则消息在加入队列时，会从下到上进行填充



对齐：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhs1f7ibtc6c/ee39f27b-c0df-4b85-9e63-a4085be5e9fd.png)

与文本框对齐类似，可以设置所有消息项关于父级控件的上下左右对齐方式

## 4.注意事项

如图所示，消息队列数据的最大数量超出消息队列控件的显示范围时，在消息项素材组中添加的界面动效无法被裁切

因此**不推荐将消息队列的最大消息数量配置为超出消息队列控件大小的值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhs1f7ibtc6c/05ce5402-b3b5-46a9-a405-22d76f5d0f36.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhs1f7ibtc6c/2909351b-3e8c-4531-a224-8473f8d6aa95.png)

# 三.消息队列的更新方式

使用服务器节点-更新消息队列，即可实现推送消息的功能

其中，消息队列的更新只能以一份结构体数据为整体进行推送

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhs1f7ibtc6c/17fa4200-6997-4383-9462-03e716acb1be.png)
