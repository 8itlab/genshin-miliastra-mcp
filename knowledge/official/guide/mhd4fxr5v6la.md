# 概念介绍/资产/界面控件/光标检测区域控件

(来源：原神千星奇域·综合指南，页面 ID mhd4fxr5v6la)

# 一、光标检测区域控件的功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhd4fxr5v6la/1c0f9325-bc2a-4ba6-a3ee-cb9e6075bc57.png)

 _光标检测区域控件_ 是可接收光标射线事件的区域，例如：可以与图片，文本框控件一起组成一个最基础的按钮

光标检测区域控件是客户端控件，可以挂载 _客户端脚本_ ，支持通过 _客户端脚本_ 进行调用

查询接口：可通过`CursorEventArea`在API文档里查询关联脚本接口

# 二、光标检测区域控件的配置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhd4fxr5v6la/c8246ae2-6a5b-448e-9e6c-d144a1ea094b.png)

## 1.响应点击区域



 _范围常驻预览：_ 用于标识光标检测区域的色块可以在编辑其他控件时常驻显示



 _可被光标射线检测：_ 可以检测到光标在控件范围内的悬浮和点击行为

## 2.手柄导航



 _可被手柄摇杆导航选中：_ 控制手柄导航是否可选中此控件

开启后可编辑手柄四向移动时选中的其他控件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhd4fxr5v6la/4e7a70c4-037c-42dc-8970-c2801fc2d845.png)
