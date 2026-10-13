# 概念介绍/资产/界面控件/图片控件

(来源：原神千星奇域·综合指南，页面 ID mh2oih9jou22)

# 一、图片的功能

 _图片_ 可以配置在界面布局中，并在界面布局中显示对应的图片，是用于美化、丰富表现而使用的一种界面控件

在关卡运行中，可通过节点图唤起图片控件

# **二、图片的编辑**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2oih9jou22/efe4f077-36ff-4639-98f0-df8583c450a8.png)

## **1.添加图片**

在 _界面控件组编辑窗口_ ，添加界面控件模板-图片

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2oih9jou22/db9bd0a4-d658-4e99-bfb6-5fcd77dab95f.png)

## 2.图片设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2oih9jou22/2cae5a53-4604-4c93-a625-d29b0f606efe.png)

配置参数| 说明  
---|---  
 _图片源_|  枚举，支持配置静态引用、动态引用、道具、状态、技能、单位状态根据选择不同，影响后续配置参数  
  
### **(1)当图片源配置为静态引用时**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2oih9jou22/ea398b37-480e-4ba0-b0b9-be90bb1bf84b.png)

 _引用素材资产：_ 选择预设素材，部分素材支持配置颜色

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2oih9jou22/1c1d9706-a659-4824-bfd7-4b6afcbb2931.png)

 _填充颜色：_ 图片资产分为单色和彩色两类，可以通过选色器修改资产的颜色，单色的资产在修改颜色时具有更好的表现

 _图片类型：_ 支持配置基础、拉伸。部分图片资产具有拉伸属性，可以通过图片资产库中的筛选项进行查找

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2oih9jou22/0998253a-1f58-4d09-9f16-569236f3e974.png)

图片属性| 特性| 常见用途  
---|---|---  
 _普通_|  图片拉伸时四角会跟随形变| 拼接特定形状或基础图案  
 _三宫格_|  图片在横向或纵向的其中一个方向拉伸时，四角会维持原有的形状不变| 自定义样式的按钮，页签项等控件的底板图片  
 _九宫格_|  图片在横向或纵向拉伸时，四角都会保持原有的形状不变| 单选项视窗中列表项底板，或页签，单选项视窗等控件的背景图片  
  
### **(2)当图片源配置为其他类型时**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2oih9jou22/867f91fa-c984-4c6b-973d-4b96371bf69c.png)

支持奇匠配置自定义变量，作为对应图片的标识使用

### **(3)** 图片控件的颜色配置

所有图片源类型均支持配置颜色

注：若为素材组，则无法被填充颜色

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2oih9jou22/323156cf-c9f9-46f4-a45b-3a9e7398ad50.png)

# 三、客户端控件中的图片

客户端图片控件可以挂载 _客户端脚本_ ，支持通过 _客户端脚本_ 进行调用

查询接口：可通过`ImageControl`在API文档里查询关联脚本接口

## 1.遮罩功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2oih9jou22/c0f1f884-5015-4d2b-b9e2-e1afac4c16c5.png)

### (1)遮罩功能

客户端图片控件支持更自由的遮罩功能设置，示例如下：



选择任意图片素材，并开启遮罩功能，作为需要保留的图片形状



在该图片下，添加一个图片，将其拖拽至前者的层级下



即可根据父级图片控件的形状进行裁切，制作一个父层级裁切的图片

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2oih9jou22/35b85a17-d159-4418-8599-8b6eb24303cb.png)

### (2)边缘羽化

开启功能后，图标的边缘位置将根据参数被虚化处理



 _羽化模式：_ 对图片进行虚化处理的方式

选项内容| 选项功能  
---|---  
 _像素_|  按照X轴与Y轴的参数对图片边缘进行羽化![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2oih9jou22/3b507972-4a49-4603-a800-08d7e7510798.png)  
 _百分比_|  按照横向和纵向区域范围的百分比，对图片边缘进行羽化![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2oih9jou22/0fc18770-93f4-458d-92ac-abb1f71bb3de.png)  
  
### (3)按进度填充

可以以进度条的形式编辑图片，图片按照进度显示对应区域



 _形状：_ 编辑进度填充的形状样式



 _方向：_ 决定填充的方向，根据不同形状有不同效果



 _起始位置：_ 决定进度开始填充的起始位置，根据不同形状有不同效果

选项内容| 选项功能  
---|---  
 _横向_|  _填充效果预览：_![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2oih9jou22/1fdf439f-5d16-496a-8d5e-2be78bcce319.gif)  
 _纵向_|  _填充效果预览：_![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2oih9jou22/bb30f233-e2d7-49ff-9b4e-3a6503f9366d.gif)  
 _90度环绕_|  _填充效果预览：_![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2oih9jou22/3a3d1c59-72f9-42a8-88ed-43e843a6fd29.gif)  
 _180度环绕_|  _填充效果预览：_![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2oih9jou22/c7fc8fbd-fd37-48f5-b722-444c5f41734a.gif)  
 _360度环绕_|  _填充效果预览：_![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2oih9jou22/e3381806-1304-4bcb-b1c5-f3973852d43b.gif)  
  
### (4)遮罩区域反转

开启开关后，图像原本被遮罩的区域变为可见，而原本可见的区域被遮罩变为隐藏

## 2.手柄导航



 _可被手柄摇杆导航选中：_ 控制手柄导航是否可选中此控件

开启后可编辑手柄四向移动时选中的其他控件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2oih9jou22/3c4e7fef-f8d1-43b9-a2b9-75bd7e85aadc.png)
