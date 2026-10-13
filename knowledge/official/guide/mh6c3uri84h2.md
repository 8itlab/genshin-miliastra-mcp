# 概念介绍/功能/通用组件/寻路阻挡

(来源：原神千星奇域·综合指南，页面 ID mh6c3uri84h2)

# 一、寻路阻挡组件的功能

导航系统使用导航网格来定义场景中可行走的区域

寻路阻挡是指那些在场景中阻碍导航网格生成或阻碍造物移动的物体

寻路阻挡组件中的区域用于标记那些造物不可行走的区域

# 二、寻路阻挡组件的编辑

## **1.添加组** 件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh6c3uri84h2/46e04dfd-c70c-4d87-bfd5-05f314535aaa.png)

(1)在实体/元件编辑界面中，打开组件编辑页签

(2)点击下方的“添加通用组件”，选择并点击“寻路阻挡”，成功添加

(3)点击“详细编辑”，展开编辑页

## **2.寻路阻挡组** 件的编辑

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh6c3uri84h2/4f5a66f2-ec45-418a-bee8-bf1d67903942.png)

配置参数| 说明  
---|---  
 _初始生效寻路阻挡_|  下拉菜单提供寻路阻挡枚举通过修改后面的勾选框，可以修改生效情况，修改后生效状态会同步到寻路阻挡编辑页内![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh6c3uri84h2/079d9d8c-6f06-486f-b689-09c60d5afbfa.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh6c3uri84h2/ed990714-776f-444b-9936-8e9c0d1f9a90.png)  
 _*寻路阻挡列表_|  枚举实体配置的所有寻路阻挡  
  
# **三、寻路阻挡的编** 辑

## 1\. **添加寻路阻挡**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh6c3uri84h2/dd83ce07-606e-4ee3-9f18-a253810e4abb.png)



通过点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh6c3uri84h2/5ab69681-6cf5-4dfe-90a5-1ef8e33ffd9f.png)，添加寻路阻挡。

添加的寻路阻挡**初始生效** 默认开启



序号:X，X为该寻路阻挡的**序号** ，作为节点输入项可以调整该寻路阻挡是否激活

## 2\. 相关参数说明

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh6c3uri84h2/3132d3c3-0b44-4ae5-9e8b-2fcd53c49d02.png)

寻路阻挡可以调整是否初始生效

单个寻路阻挡可以通过【添加寻路阻挡】按钮添加多个区域

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh6c3uri84h2/c6996d8e-a5be-4dd9-ac2b-682838ba4c28.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh6c3uri84h2/79d96b07-eee9-47fa-bee3-7c515f0ff3de.png)

寻路阻挡形状为长方体时

 _中心_ ：该区域中心相对于物件位置的偏移

 _旋转_ ：该区域的旋转

 _缩放倍率_ ：该区域的大小缩放

 _运行时生效尺寸_ ：该寻路阻挡运行时实际生效的尺寸，该参数不支持手动编辑仅起一个提示作用，会根据物件本身的缩放和区域的缩放计算。当物件本身的缩放或区域的缩放超出寻路阻挡的范围限制时，可能会导致预览和实际生效的范围不一致，最终效果以运行时生效尺寸为准

长方体最小生效尺寸：0.5*0.5*0.5，长方体最大生效尺寸：30*30*30

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh6c3uri84h2/c9a489b5-9d58-4fa3-91b8-09adac1dfac3.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh6c3uri84h2/aad9a95f-789e-4b8e-9505-95b33f8d3e19.png)

寻路阻挡形状为圆柱体时

 _中心_ ：该区域中心相对于物件位置的偏移

 _角度_ ：该区域的旋转角度

 _半径_ ：该区域的半径大小

 _高度_ ：该区域的高度

 _运行时生效尺寸_ ：该寻路阻挡运行时实际生效的尺寸，该参数不支持手动编辑仅起一个提示作用，会根据物件本身的缩放和区域的缩放计算。当物件本身的缩放或区域的缩放超出寻路阻挡的范围限制时，可能会导致预览和实际生效的范围不一致，最终效果以运行时生效尺寸为准

圆柱体最小生效尺寸：0.25*0.5，圆柱体最大生效尺寸：15*30

# **四、通过节点图管理寻路阻挡**

## 1\. 激活/关闭寻路阻挡

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh6c3uri84h2/35395b0e-6fbe-4427-b3f7-bffe285b3848.png)

## 2\. 激活/关闭寻路阻挡功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh6c3uri84h2/f0293d21-fe16-472e-9c69-818bb5586146.png)
