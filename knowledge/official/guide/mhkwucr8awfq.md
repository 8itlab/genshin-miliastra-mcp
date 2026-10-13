# 概念介绍/资产/界面控件/特殊数字控件

(来源：原神千星奇域·综合指南，页面 ID mhkwucr8awfq)

经典模式也可以配置特殊数字控件了

在数据来源为单位状态时，可选择监听模式



监听实体变量：显示指定实体的指定单位状态的数据



监听父级：需要与状态显示区控件配合使用，显示状态显示区分配的的对应单位状态（可以实现不同来源的单位状态区分显示在不同槽位）

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkwucr8awfq/e3e8209d-78f6-455b-9da0-9eb3116defb2.png)特殊数字控件

# 一、特殊数字的功能

 _特殊数字_ 可以配置在界面布局中，支持表现与技能相关的诸多数据

在关卡运行中，可通过节点图唤起特殊数字控件

# **二、特殊数字的编辑**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkwucr8awfq/5eb7cd1f-62a1-40f9-b52e-3ab4c2c4f8a7.png)

## **1.添加特殊数字**

在 _界面控件组编辑窗口_ ，添加界面控件模板-特殊数字

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkwucr8awfq/2f02dcec-ab83-4c5d-ac5e-9816c8ae2b6e.png)

## 2.特殊数字设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkwucr8awfq/117f682d-f04a-4dd8-afdf-69ab48d74bde.png)

配置参数| 说明  
---|---  
 _数据来源_|  可选技能、道具、单位状态。下述为选择技能时的可配置项  
 _监听技能槽位_|  支持选择所有槽位，以槽位为基础监听技能![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkwucr8awfq/490b4637-1c83-4316-996e-3700b59d5c57.png)  
 _数据内容_|  可读取技能冷却剩余时间、技能可用次数、技能资源、技能可用状态![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkwucr8awfq/ffa18d33-305c-4a75-b615-2c68fcd33f73.png)  
 _计时单位_|  可选 秒、分钟、小时  
 _字号_|  对应数字显示的字号大小  
  
## 3.注意事项

单位状态中可以配置不同来源的单位状态不叠加，所以在运行时不同来源的同一个单位状态会被放进不同的槽位里

当特殊数字的数据来源为单位状态时，如果在玩家身上，对应的同一个单位状态存在多个（在不同槽位中），则特殊数字这里，【单位状态层数】会显示为当前的总层数，【单位状态剩余可持续时间】会显示为剩余可持续时间最大的值

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkwucr8awfq/43e85a83-d50f-4b26-ba2f-c7397578be0d.png)

# **三、额外说明**

经典模式也可以配置特殊数字控件了

在数据来源为单位状态时，可选择监听模式



监听实体变量：显示指定实体的指定单位状态的数据



监听父级：需要与状态显示区控件配合使用，显示状态显示区分配的的对应单位状态（可以实现不同来源的单位状态区分显示在不同槽位）

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkwucr8awfq/26548fab-679b-41cc-9d66-096687e8e14a.png)
