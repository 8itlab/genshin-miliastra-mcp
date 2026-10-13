# 概念介绍/资产/界面控件/全屏界面动效控件

(来源：原神千星奇域·综合指南，页面 ID mhbn4i09l5ns)

# 一、全屏界面动效的功能

 _全屏界面动效_ 可以配置在界面布局中，并在界面布局中显示对应的特效，是用于美化、丰富表现而使用的一种界面控件

在关卡运行中，可通过节点图唤起全屏界面动效

# **二、全屏界面动效的编辑**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbn4i09l5ns/605431d0-f8e0-4cd0-9488-92a64cca39d9.png)

## **1.添加全屏界面动效**

在 _界面控件组编辑窗口_ ，添加界面控件模板-全屏界面动效

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbn4i09l5ns/08f25508-442f-4e12-8046-30362e199055.png)

## 2.全屏界面动效设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbn4i09l5ns/ade8bbca-ffb0-4edc-8ff7-25fc776d9455.png)

 _选择界面动效_ ：可以选中所需要展示在界面布局中的特效资产

 _是否播放音效_ ：选是则会同步播放该资产自带的音效

## 3.全屏界面动效与界面动效的区别

全屏界面动效的层级默认在所有层级的最下方且不可更改

全屏界面动效会覆盖全屏，不可修改其生效范围

全屏界面动效一般用于做一些视野氛围的表现效果

# 三、通过节点图管理界面动效

播放界面动效控件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbn4i09l5ns/1cd159a8-28a7-4e60-b31d-b31a1111a041.png)

# 四、客户端控件中的全屏界面动效

客户端全屏界面动效控件可以挂载 _客户端脚本_ ，支持通过 _客户端脚本_ 进行调用

查询接口：可通过`FullscreenUIAnimationControl`在API文档里查询关联脚本接口

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbn4i09l5ns/4b8a266a-115d-41c5-a490-0cc520228e2d.png)

## 1.手柄导航



 _可被手柄摇杆导航选中：_ 控制手柄导航是否可选中此控件

开启后可编辑手柄四向移动时选中的其他控件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbn4i09l5ns/2952d2c5-e68c-4016-b2c3-ac74b5bd5572.png)
