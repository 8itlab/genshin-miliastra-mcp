# 概念介绍/功能/通用组件/文本气泡

(来源：原神千星奇域·综合指南，页面 ID mhwtz297kp6a)

# 一、文本气泡组件的功能  
  
 _文本气泡组件_ ，提供挂载于实体的文本气泡功能，可以引用 _自定义变量_ 数据，在关卡运行时显示配置内容。

文本气泡组件需要挂载于实体，支持 _物件_ 、 _造物_ 使用。

文本气泡组件可以配置多个文本气泡但仅支持同时生效一个文本气泡。

文本气泡可以通过默认配置激活或关闭，也可以通过 _节点图_ 控制指定生效文本气泡的切换；同时支持通过 _本地过滤器_ 调整指定文本气泡的可见性。

# **二、文本气泡组件的编** 辑

## **1.添加组** 件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwtz297kp6a/51f00aeb-bfb7-4e8c-b838-c08166dc6b6a.png)

(1)在实体/元件编辑界面中，打开组件编辑页签

(2)点击下方的**添加组件** ，选择并点击文本气泡，成功添加

选中文本气泡组件时，编辑中的实体会显示当前生效的文本气泡表现情况。

(3)点击**详细编辑** ，展开编辑页

## **2.文本气泡组** 件的编辑

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwtz297kp6a/710295b8-c9e3-438b-90dd-1f7525667c2f.png)

配置参数| 说明  
---|---  
 _初始生效文本气泡_|  下拉菜单提供文本气泡枚举通过修改后面的勾选框，可以修改生效情况，修改后生效状态会同步到文本气泡编辑页内![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwtz297kp6a/5907bc57-42a5-4969-83b9-17d00f13157c.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwtz297kp6a/ac53fa33-760b-4333-bcc0-6c13658e5123.png)  
 _*文本气泡列表_|  枚举实体配置的所有文本气泡  
  
# **三、文本气泡的编** 辑

## 1\. **添加文本气泡**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwtz297kp6a/220b8a50-be30-4af5-8a3a-c209df4ec076.png)



通过点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwtz297kp6a/30740480-33e0-4bc1-a624-743011133277.png)，添加文本气泡。

添加的文本气泡**初始生效** 默认关闭



气泡X，X为气泡**序号** ，作为节点输入项可以调整文本气泡的初始生效参数

## 2\. 文本气泡的编辑

### (1)基础设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwtz297kp6a/53b58d83-fee6-4672-837d-7052f10de989.png)

配置参数| 说明  
---|---  
 _选择挂点_|  选择实体的预制 _挂接点_ ，或玩家自定义挂接点。可通过下拉菜单进行选择。文本气泡将以此点为基础坐标点调整位置  
 _偏移_|  以基础设置选定的挂接点为基准，可调整偏移  
 _字号_|  字体大小配置  
 _可见半径（m）_|  文本气泡的生效距离，角色和实体距离满足配置，才会实际运行文本气泡的逻辑  
 _过滤器节点图_|  可引用本地过滤器节点图，用于决策文本气泡在本地可见与否  
选择类型：布尔型| 当本地过滤器返回值为true时，该文本气泡对本地可见  
选择类型：整型生效整数范围：按需配置整数列表| 当本地过滤器返回值在生效整数范围内时，该文本气泡对本地可见  
对应本地过滤器节点图中的基础节点，进行说明获取自身实体输出参数为挂载文本气泡组件的实体获取目标实体输出参数为在文本气泡生效范围内的角色实体当且仅当该角色实体等于本地角色才会获取成功获取当前角色输出参数为本地角色  
 _是否循环播放_|  若开启则会循环播放该文本气泡；关闭则只会播放一次。  
 _是否发送结束事件_|  若开启则会在每次对话最后一句执行结束后，向节点图发送事件有且仅有挂载该文本气泡组件的实体节点图可收到当且仅当勾选该选项时，不同角色完成气泡的事件才会被服务器记录结束，角色重新进入范围或者断线重连，将不会重新触发气泡若不勾选，当角色重新进入组件触发范围，气泡对话依然会重新触发，且断线重连后也会重新触发  
  
### (2)文本气泡的文本编辑

#### **a.添加文本**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwtz297kp6a/ffbb2781-e78a-4c66-a161-8954b1f75b7a.png)

通过添加文本，增加配置条目。文本气泡支持配置多条文本，按照顺序依次播放。

#### **b.编辑气泡文本**

通过![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwtz297kp6a/6a5a855d-d9b8-402d-aff5-f1c04d78d3f4.png)对指定项进行复制、粘贴、删除等操作。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwtz297kp6a/27f6e6f0-34bd-47a8-b70c-c5323be411e0.png)

配置参数| 说明  
---|---  
 _持续时间_|  当前气泡文本内容的显示时间  
 _文本内容_|  显示文本编辑支持**插入变量** ，选择指定实体的自定义变量，会在文本框内实时更新文本字号依赖基础配置中的字号气泡文本框的实际大小根据文本数量和字号大小自适应  
  
#### **c.预览气泡文本**

点击**预览** ，将以当前文本气泡为准（无论配置是否初始生效）。

按照文本气泡配置的位置、文本的字号、每一句文本的持续时间以及是否循环播放，都会在预览时获得正确的展示![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwtz297kp6a/79934de5-739d-4d18-be4c-bf19f628511f.png)

# **四、通过节点图管理文本气泡**

实体运行时，可通过节点图管理其生效的文本气泡



**切换生效的文本气泡**

通过节点输入的文本气泡序号，将替换为最新的生效文本气泡

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwtz297kp6a/7c256085-5a16-4615-9cf9-097a9e14efae.png)



**文本气泡完成时**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwtz297kp6a/866eb4d0-3fa7-4d47-9af4-0f89b87410b1.png)
