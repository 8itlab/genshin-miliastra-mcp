# 概念介绍/资产/界面控件/自定义开关控件

(来源：原神千星奇域·综合指南，页面 ID mhkrafr3w6um)

# 一、自定义开关的功能

 _自定义开关_ 可以通过点击或其所映射的自定义变量进行开和关的状态切换，并以此来触发不同的功能逻辑

自定义开关的交互可以向节点图发送 _界面控件组触发时_ 事件

# **二、自定义开关的编辑**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkrafr3w6um/7fb1cfdc-59ee-4fdc-b966-5bd0650192bd.png)

## **1.添加自定义开关**

在 _界面控件组编辑窗口_ ，添加界面控件模板-自定义开关

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkrafr3w6um/874d2928-1629-4511-8ef3-02c5cb1900dd.png)

## 2.自定义开关设置

### (1)基础

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkrafr3w6um/c0554ded-98de-43cc-bf3e-ccab29f30b9e.png)

### (2)样式

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkrafr3w6um/1b6a8d1d-9bae-414a-b57d-6ee6de5cd0de.png)

 _样式_ ：支持选择 _预设样式、自定义_



**预设样式**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkrafr3w6um/bffef452-3e46-44a0-ab12-799624461153.png)

可以选择不同的预设按钮样式，部分预设样式支持自定义图标、颜色、和文本等

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkrafr3w6um/23dce22b-9908-48db-902b-5beaac6ea8c1.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkrafr3w6um/50735473-30b7-4b13-b9be-7d2d1c535f7d.png)



**自定义样式**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkrafr3w6um/3030fd48-2683-4d72-b587-7e4dbbc577d3.png)

可以自由配置默认状态、悬停状态、按下状态的素材

状态| 说明| 样式特征| 示意图  
---|---|---|---  
开启-默认| 无交互状态| /| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkrafr3w6um/638670af-e858-4833-b54c-874241961c4c.png)  
开启-悬停| 在键鼠操作时，指针悬停在按钮上的状态| 悬停状态通常用外描边，颜色略微高亮，尺寸略微增大来示意按钮的可交互性| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkrafr3w6um/11fead73-2846-44ce-8537-b54ac6c0c622.png)  
开启-按下| 在键鼠或触屏操作，按下时的状态| 按下状态通常用颜色变化，尺寸略微减小来示意按钮处于交互状态，松开后，按钮将返回默认状态| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkrafr3w6um/7d03f9bd-f391-4c14-9be9-699118658604.png)  
关闭-默认| 无交互状态| /| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkrafr3w6um/1a454409-9a61-44b6-b7d9-fd7268b7e438.png)  
关闭-悬停| 在键鼠操作时，指针悬停在按钮上的状态| 悬停状态通常用外描边，颜色略微高亮，尺寸略微增大来示意按钮的可交互性| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkrafr3w6um/3e70957e-38d4-40aa-b65e-f24760d3b93b.png)  
关闭-按下| 在键鼠或触屏操作，按下时的状态| 按下状态通常用颜色变化，尺寸略微减小来示意按钮处于交互状态，松开后，按钮将返回默认状态| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkrafr3w6um/4da3599c-4e43-453b-9211-521a58f34847.png)  
  
### (3)功能



**按键设置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkrafr3w6um/668d01b3-7918-4879-9e92-8c1c489fc5b8.png)

配置参数| 说明  
---|---  
 _开关映射自定义变量_|  支持配置映射玩家的布尔型自定义变量自定义变量变化时，开关会对应变化  
 _按键映射-键鼠_|  配置开关对应的PC端快捷使用按键  
 _按键提示偏移-键鼠_|  当鼠标悬停开关时，提示信息偏移显示配置  
 _按键映射-手柄_|  配置开关对应的手柄快捷使用按键  
 _按键提示偏移-手柄_|  当手柄悬停开关时，提示信息偏移显示配置  
 _打开音效_|  当开关变成打开状态时，播放该配置音效  
 _关闭音效_|  当开关变成关闭状态时，播放该配置音效  
  


**响应点击区域**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkrafr3w6um/b5393cc3-8933-4330-8366-f68ecb90d552.png)

当且仅当配置样式为自定义时，支持配置点击区域

支持在编辑窗口中直接拖动，调整点击区域

实际触发以此点击区域配置的大小为准

配置参数| 说明  
---|---  
 _是否可点击_|  若不开启，则本按钮无点击交互功能  
 _点击区域预览_|  开启后，编辑窗口对应控件中浅黄色区域则为点击区域![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkrafr3w6um/aba06579-0bf6-47c8-afd1-b23ed7a09bf4.png)  
 _区域大小_|  支持配置跟随按钮尺寸/自定义尺寸  
 _位置偏移_|  当**区域大小** 选择自定义尺寸时，支持配置点击区域的中心位置偏移  
 _尺寸_|  当**区域大小** 选择自定义尺寸时，支持配置点击区域的尺寸
