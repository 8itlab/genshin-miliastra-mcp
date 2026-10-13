# 概念介绍/高级概念/界面控件组管理

(来源：原神千星奇域·综合指南，页面 ID mhewyi0fjfvs)

界面控件组管理，统一管理 _界面布局_ 和 _界面控件组_ 。

# 一、入口

左上角系统菜单，选择【界面控件组管理】，打开管理界面

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhewyi0fjfvs/b97adb1f-be7a-4d3e-b19d-74fa581a7cc0.png)

分为菜单栏、库窗口、详情窗口、预览窗口、编辑按键处、参数配置窗口

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhewyi0fjfvs/6f4f453e-a994-4676-8bd0-22126d62b2c5.png)

# 二、界面布局管理工具

## **1.界面布局**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhewyi0fjfvs/a2184db7-d063-47d3-ad24-21598467666d.png)

默认包含“默认布局”界面，包含关卡运行的必要界面控件

界面布局库不可为空，最少包含一个界面布局

切换选择界面布局，可以同步在界面布局预览窗口查看

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhewyi0fjfvs/e7b0c792-6a39-4827-aecb-d6684f75d17c.png)

右键可以操作复制、粘贴、重命名

## **2.界面布局详情**

当前选中的界面布局包含内容，以界面控件为基础枚举列出。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhewyi0fjfvs/87608706-0ca3-46b1-940a-18f4a132549a.png)

通过【添加界面控件】可以给当前界面布局添加界面控件

### (1)固有内容

是流程、功能必要的界面控件属于此分类。

通过节点图管理时，仅支持修改表现状态，不支持进行移除。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhewyi0fjfvs/c2531de4-0ca1-4f56-a0de-65fdae37b334.png)

不可调整位置、大小。默认生效，不可更改。

配置参数| 说明  
---|---  
 _索引_|  当前界面控件组/界面控件的唯一标识  
 _初始可见_|  当关卡运行，此界面布局生效时，该界面控件是否可见  
  
### **(2)自定义**

通过【添加界面控件】增加的自定义或者预制界面控件，属于此分类

通过节点图管理时，仅支持修改 _表现状态_ ，不支持进行移除

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhewyi0fjfvs/9a62cd36-d4ba-4579-980c-451952ab1e62.png)

可调整位置、大小。默认生效，不可更改。

配置参数| 说明  
---|---  
 _索引_|  当前界面控件组/界面控件的唯一标识  
 _初始可见_|  支持配置界面布局生效时，该界面控件组是否可见  
 _文本框设置_|  可配置文本框的颜色、字号、内容  
  
## **3.界面布局预览窗口**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhewyi0fjfvs/18e34b7e-68e3-4bf1-bfe4-d577189cf3d7.png)

可预览编辑中的界面布局的基础表现效果

可以调整设备，进行对比

## 4.参数配置窗口

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhewyi0fjfvs/27d2738e-a92b-4f9d-aa63-1b7ec105b32a.png)

当前界面布局的默认应用配置，作为某位玩家运行关卡后的默认界面

【打开玩家编辑】 ，会跳转到[职业](/ys/ugc/tutorial//detail/mhodlcrpht3q)配置界面，配置其应用的默认界面布局

# 三、界面控件组管理工具

## **1.界面控件组自定义模板**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhewyi0fjfvs/32e9fac6-ad1b-4606-bbb5-467dc40487e4.png)

保存为自定义模板的界面控件组枚举在此罗列

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhewyi0fjfvs/a2dfac84-c69e-47e6-b787-077cb7323052.png)

通过右键可以对选定的自定义模板进行操作



重命名 

对界面控件组自定义模板重命名



删除模板 

将所选模板删除

删除模板，若有引用，会将所有引用（界面布局、界面控件组详情）一起删除。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhewyi0fjfvs/d89a4ee6-b888-4f67-bedc-418e917de828.png)

 _界面控件组详情窗口_ 编辑的界面控件组保存为自定义模板后，会出现在 _界面控件组库_ 中

当选中界面控件组库内的自定义模板



若界面控件组详情内没有自定义模板的引用，通过点击库中的目标，会在界面控件组详情内创建一个引用，并默认选中，用于编辑，编辑后可以覆盖修改模板内容，也可以另存为新的模板。



若界面控件组详情内已有该模板的引用，通过单点，会选中“界面控件组详情”的对应引用，用于覆盖修改模板内容。

## **2.界面控件组详** 情

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhewyi0fjfvs/3632388c-bab3-4c0c-9fd5-dfa479f6708b.png)

显示编辑中的界面控件组枚举

只有处于该窗口的界面控件组，才可以被编辑

模板在该界面的引用，支持修改后覆盖保存模板

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhewyi0fjfvs/92afc3fd-39ce-467c-bb69-c9fb37300293.png)

通过【添加界面控件模板】可以创建以预制界面控件资产为基础的界面控件组

### (1)界面控件组

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhewyi0fjfvs/d92bac5f-e6ba-4c30-97f6-c0c2bd9ac94f.png)



通过鼠标多选，或者shift按键多选界面控件/界面控件组



右键【创建组合】，或者 _编辑按键处_ 的【创建组合】，生成界面控件组组合，生成索引



单个界面控件也可以直接选择【保存】，生成界面控件组，生成索引

### **(2)界面控件组预览窗** 口



可预览编辑中的界面控件组的基础效果



可以调整设备，进行对比

## 3.编辑按键处

预览窗口下方交互，只对编辑中的界面控件组生效

### (1)界面控件组-多界面控件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhewyi0fjfvs/345b1d0b-684d-4a4b-b852-9021622d659a.png)

配置参数| 说明  
---|---  
 _创建组合_|  将选中的界面控件组打包为一个组合的功能  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhewyi0fjfvs/37cad28e-e0db-4a6d-927d-de065615da37.png)| 删除多选的界面控件组  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhewyi0fjfvs/2dc77b4a-f388-412f-80e0-2ab59f3ddf4c.png)

配置参数| 说明  
---|---  
 _解散组合_|  将组合拆散为单独界面控件组，并删除组合  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhewyi0fjfvs/79caf233-1902-4acc-9f85-b22958b74e5f.png)| 删除该界面控件组  
 _保存修改_|  若组合内容有调整，会提示保存覆盖  
 _另存为模板_|  将当前数据另存为一个新的界面控件组模板  
  
### (2)界面控件组-单界面控件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhewyi0fjfvs/8ce4a2ef-4489-4c94-a002-ae7b5292c0a7.png)

配置参数| 说明  
---|---  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhewyi0fjfvs/083aeca3-8537-4b7f-b83a-d34fc331d4f4.png)| 删除该界面控件组  
 _保存修改_|  若该界面控件组内容有调整，会提示保存覆盖  
 _另存为模板_|  将当前数据另存为一个新的界面控件组模板  
  
## **4.参数配置窗** 口

### (1)界面控件组-多界面控件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhewyi0fjfvs/f4a0f6d7-5a66-4788-ac27-995e3d1777ad.png)

配置参数| 说明  
---|---  
 _初始可见_|  界面控件组模板激活时的默认表现状态  
 _位置_|  界面布局上的位置  
 _大小_|  不可修改。代表界面控件组的最大范围  
 _层级_|  代表界面控件组的显示层级  
  
### (2)界面控件组-单界面控件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhewyi0fjfvs/bbac6ddd-0806-4a5b-8f93-248b65c492c2.png)

配置参数| 说明  
---|---  
 _初始可见_|  界面控件组模板激活时的默认表现状态  
 _位置_|  界面布局上的位置  
 _大小_|  不可修改。代表界面控件组的最大范围  
 _层级_|  代表界面控件组的显示层级
