# 概念介绍/资产/界面控件/预设按钮控件

(来源：原神千星奇域·综合指南，页面 ID mhdbkf04v6y8)

# 一、预设按钮的功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhdbkf04v6y8/458bd155-e929-4fe6-9427-63e1472021e4.png)

 _预设按钮_ 是一种特殊的客户端交互按钮，可以配置四种状态的图标和显示文本

预设按钮控件是客户端控件，可以挂载 _客户端脚本_ ，支持通过 _客户端脚本_ 进行调用

查询接口：可通过`PresetButton`在API文档里查询关联脚本接口

# **二、** 编辑预设按钮的不同状态

预设按钮可以引用子层级中的客户端控件，作为不同状态节点的外显样式

## 1.创建预设按钮的子层级控件



添加任意控件，按住控件并将其拖拽至预设按钮选项中

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhdbkf04v6y8/b642630f-1653-4dac-9dc9-dec350d43b86.png)

## 2.设置按钮状态节点的引用关系



单击任意状态节点，在弹出的子控件列表中选择需要引用的控件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhdbkf04v6y8/8e8e1626-482d-440c-9ff5-cb0bfbe5d7d6.png)

# 三、预设按钮的配置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhdbkf04v6y8/2e78e971-b81f-4679-b907-1f1c5c76a986.png)

## 1.按钮设置

### (1)可被光标射线检测



开启时，可以响应光标的交互事件

### **(2)按钮是否可用**



决定与按钮交互时，是否能正常触发按钮关联的节点和客户端脚本

### (3)按钮状态节点



按钮在四种状态下的显示引用，每个节点可引用相同或不同的子控件

状态| 说明  
---|---  
 _默认_|  无交互状态  
 _悬停_|  在键鼠操作时，指针悬停在按钮上的状态  
 _按下_|  在键鼠或触屏操作，按下时的状态  
 _不可用_|  按钮是否可用开关处于关闭状态时的状态  
  


可以通过点击已配置按钮的播放键，预览此状态下按钮的显示

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhdbkf04v6y8/1001f025-c3ff-4074-b3da-6d509d22ddb0.png)

### (4)音效



按钮发生按下交互事件时，将播放已配置的对应音效

## 2.手柄导航



 _可被手柄摇杆导航选中：_ 控制手柄导航是否可选中此控件

开启后可编辑手柄四向移动时选中的其他控件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhdbkf04v6y8/f05a5f2e-73a7-4fa7-bf69-bd34b94d5877.png)
