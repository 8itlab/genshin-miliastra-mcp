# 概念介绍/资产/界面控件/界面动效控件

(来源：原神千星奇域·综合指南，页面 ID mh2iyk9fa4gy)

# 一、界面动效的功能

 _界面动效_ 可以配置在界面布局中，并在界面布局中显示对应的特效资产，是用于美化、丰富表现而使用的一种界面控件

在关卡运行中，可通过节点图唤起界面动效控件

# **二、界面动效的编辑**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2iyk9fa4gy/99670aae-7aa7-44c6-ad50-86a029ed25af.png)

## **1.添加界面动效**

在 _界面控件组编辑窗口_ ，添加界面控件模板-界面动效

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2iyk9fa4gy/534cc6e9-55b1-4100-99d2-6486d40cc729.png)

## 2.界面动效设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2iyk9fa4gy/346044df-3026-40a5-90f4-69d9930e96a3.png)

 _选择界面动效_ ：可以选中所需要展示在界面布局中的特效资产

 _是否播放音效_ ：选是则会同步播放该资产自带的音效

 _层级_ ：仅支持在所有控件之上/在所有控件之下，默认在所有控件之上

## 3.预览设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2iyk9fa4gy/bc2e8fc6-fad4-43f1-9ab7-f457eab59251.png)

通过右上角的设置，可以让界面动效在编辑时不受层级的限制常驻预览

# 三、通过节点图管理界面动效

播放界面动效控件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2iyk9fa4gy/3b2f1a05-47ca-406d-ba31-65f2438ab738.png)

# 四、客户端控件中的界面动效

客户端界面动效控件可以挂载 _客户端脚本_ ，支持通过 _客户端脚本_ 进行调用

查询接口：可通过`UIAnimationControl`在API文档里查询关联脚本接口

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2iyk9fa4gy/163e13d9-6bae-4bb6-b55d-5eee51c8b2a2.png)

## 1.手柄导航



 _可被手柄摇杆导航选中：_ 控制手柄导航是否可选中此控件

开启后可编辑手柄四向移动时选中的其他控件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2iyk9fa4gy/250d61d0-ecf3-4bcb-b71e-27d44e672ec9.png)
