# 概念介绍/资产/界面控件/自定义小地图控件

(来源：原神千星奇域·综合指南，页面 ID mhls9miyjwjg)

# 一、自定义小地图的功能

自定义小地图支持奇匠根据关卡玩法需求上传自定义地图图片，并可以通过节点切换每位玩家对应的小地图

地图图片可以自定义与实际关卡场景的对应关系（大小、方向、位置）

自定义小地图支持显示小地图标识组件中的所有标识

# 二、自定义小地图管理

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhls9miyjwjg/3980cec0-d24d-40b8-aaeb-b7416561e415.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhls9miyjwjg/af0a8a74-45dc-4eaf-b52a-e293be9c62ac.png)

通过【界面控件组管理】-【固有内容】-【小地图】可打开小地图编辑面板



 _初始可见性_ ：决定应用当前界面布局的玩家是否显示小地图



 _显示自身视野范围_ ：决定应用当前界面布局的玩家是否显示小地图上方的距离数值



 _初始生效地图_ ：可选择应用对应界面布局玩家的默认生效小地图，需注意切换玩家的界面布局不会同步切换玩家对应生效的小地图

# 三、自定义小地图编辑

## 1.添加自定义小地图

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhls9miyjwjg/706cb4cd-0b6d-422b-b578-d1d2629164bb.png)

通过【编辑地图】可打开自定义地图编辑面板，点击“+”按钮可以新建自定义地图

## 2.上传自定义图片

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhls9miyjwjg/17c953a7-9def-46b9-8767-463c441f7efd.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhls9miyjwjg/a486b16e-f95c-44cb-a5fa-521102c1f1a5.png)

通过【选择地图图片】可以打开【地图图片资源管理】界面，支持玩家上传并选择希望使用的图片

## 3.映射自定义图片与关卡场景

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhls9miyjwjg/3ed33118-e598-4351-8938-dd2f59d63a69.png)



原点设置：

 _原点点位坐标_ ：图片与场景完全对应的点，用于确定图片的固定位置

需要输入图片中的原点坐标，并与场景中的预设点对应



方向点设置：

 _方向点点位坐标_ ：用于确定图片与场景映射方向的点

需要输入图片中的方向点坐标，并与场景中的预设点对应

配置好原点与方向点后，确立图片到场景的锚定和旋转映射关系。不考虑Y轴，只考虑场景XZ轴到图片XY的映射

需要注意的是，方向点只负责处理图片正方向，不做缩放比例上的计算。



 _10像素对应场景中距离(m)_ ：

决定图片与场景的缩放比例的地图比例尺，奇匠可通过场景大小与自定义图片大小计算得出

## 4.地图显示配置



小地图缩放比：

原有配置参数，可决定界面布局中小地图的默认缩放倍率

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhls9miyjwjg/531d680a-11a4-46f9-b079-30b3d5f78c67.png)



大地图缩放配置：  
该部分设置影响该地图显示在M键大地图时的可调整缩放比例，限制填入最小值0.1，最大值2，调整颗粒度为0.1

缩放后的地图效果可通过下方的缩放比例预览

## 5.自定义小地图的切换

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhls9miyjwjg/4237b9ed-5672-43e5-8afa-cc2aa9b14857.png)



服务器节点：切换自定义地图

用于切换目标玩家对应界面布局中小地图组件展示的小地图，并套用相关配置

是否显示地图：若为是，则显示地图；若否，则不显示地图（与无地图配置效果相同）
