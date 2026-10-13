# 概念介绍/高级概念/预设点

(来源：原神千星奇域·综合指南，页面 ID mhfvn30ctm9c)

# 一、预设点是什么

预设点是一组场景中的世界位置和朝向的数据信息。

预设点可以被需要点位信息的功能所引用，例如出生点、复苏点、节点图获取点位等。

# 二、预设点的编辑

## 1.编辑入口

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfvn30ctm9c/9fec83a9-de33-4455-aae9-80e41ee4aad4.png)

## **2.整体编辑界面**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfvn30ctm9c/eae4c048-4c53-4f5b-a1bd-002647fff4b6.png)

### (1)预设点库

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfvn30ctm9c/7e75a4d1-aabf-462a-923e-d07c8267eaf3.png)

所有预设点在这个窗口枚举。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfvn30ctm9c/72e46f5b-a3b2-40df-9bb5-3924fe2debde.png) 可管理对应预设点在布设场景的可见性

### **(2)编辑窗口预设点可见** 性

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfvn30ctm9c/29c5f8c3-ca5b-4e8c-8375-6704bbf2e849.png)

 _常驻显示开关开启_ 关闭预设点管理工具，在编辑窗口也可以看到所有预设点

 _常驻显示开关关闭_ __ 关闭预设点管理工具，所有预设点不可见

### **(3)创建预设** 点

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfvn30ctm9c/56d75fe4-f9a2-4fa5-be3e-d9333b7cfa94.png)

通过点击“创建预设点”，在当前编辑窗口中央生成新的预设点。并自动开启命名编辑。

### **(4)预设点的参数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfvn30ctm9c/15790b35-8fb4-4c0d-a205-dd2cf8592f78.png)

 _预设点名称_ __ 预设点的名称，可以修改

 _预设点索引_ 作为节点的入参，是预设点的唯一标识

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfvn30ctm9c/c2669f6d-dee1-462c-b58d-6abc201ba470.png)

配置参数| 说明  
---|---  
 _锁定变换_|  勾选后不可调整预设点的位置和旋转  
 _是否在场景中显示_|  取消勾选后，只留坐标轴，定点模型不可见  
 _位置_ | 预设点的位置数据  
 _旋转_|  预设点的朝向数据  
 _单位标签_|  可以给预设点添加单位标签。详见[单位标签](/ys/ugc/tutorial//detail/mhzldmiwdgu4)  
 _*__引用关系_| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfvn30ctm9c/b7332300-92bf-489c-b883-e27d22d1d010.png)  
  
#  三、预设点的引用

## 1.出生点

在“关卡设置”-出生点配置中，可通过 _选择点位_ 引用预设点，作为出生点

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfvn30ctm9c/09008a48-9708-4993-910b-25fa140f1155.png)

## 2.复苏点

在“关卡设置”-复苏点配置中，可通过 _选择点位_ 引用预设点，作为复苏点

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfvn30ctm9c/872aed02-b33f-4759-92c4-d12b8f7c0b17.png)

## 3.节点图



**查询预设点位置旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfvn30ctm9c/8af9c22b-3ead-44b8-8660-f371ddb6339e.png)

通过预设点索引，可以查询其位置和旋转数据

通过点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfvn30ctm9c/233f37ab-2629-42f6-bd79-3ad2909cd5d3.png)，可展开所有预设点枚举，用于选择做入参

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfvn30ctm9c/fd49f8a6-4688-41b6-9b77-1c2aadc7eb03.png)



**以单位标签获取预设点位列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfvn30ctm9c/39fb5a94-2796-40cc-90b4-cf2b9fc2c5f0.png)
