# 节点介绍/客户端节点/造物状态决策节点图/查询节点

(来源：原神千星奇域·综合指南，页面 ID mhk4furvds12)

# **一、通用**

## **1\. 获取自身当前执行状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/9fddf995-44b8-4990-b798-76bf3e9765ce.undefined)

**节点功能**

获取造物自身当前正在执行的【造物状态节点图】的配置ID

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 状态节点图配置ID| 配置ID|   
  
## **2\. 查询自身距离目标的水平角度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/ed26c81d-d4f9-4d31-b5e1-632076c6c107.undefined)

**节点功能**

查询造物自身距离目标实体的水平角度，当且仅当造物存在目标时有效

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 水平角度| 浮点数|   
  
## **3\. 查询自身距离目标的垂直角度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/30ee5592-9689-45ad-bd78-656c00882307.undefined)

**节点功能**

查询造物自身距离目标实体的垂直角度，当且仅当造物存在目标时有效

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 垂直角度| 浮点数|   
  
## **4\. 查询自身距离目标的水平距离**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/fcf26f6d-23d4-461c-9cf9-793c625ffffa.undefined)

**节点功能**

查询造物自身距离目标实体的水平距离，当且仅当造物存在目标时有效

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 水平距离| 浮点数|   
  
## **5\. 查询自身距离目标的垂直距离**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/3421c291-cbe8-48ec-87e8-d2682cb5f788.undefined)

**节点功能**

查询造物自身距离目标实体的垂直距离，当且仅当造物存在目标时有效

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 垂直距离| 浮点数|   
  
## **6\. 查询自身距离目标的距离**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/9b54303b-05e3-426c-ad55-f4b77266fa97.undefined)

**节点功能**

查询造物自身距离目标实体的距离，当且仅当造物存在目标时有效

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 距离| 浮点数|   
  
## **7\. 查询目标点是否寻路可达**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/cf275c95-2c8f-4a94-91c1-17b488d32569.undefined)

**节点功能**

查询造物当前的目标点是否可以正常寻路到达

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 是否寻路可达| 布尔值|   
  
## **8\. 查询自身是否正在释放技能**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/2e77289d-903a-4e18-bd5d-383e43ce2f3d.undefined)

**节点功能**

查询造物当前是否正在释放技能，如果正在释放技能，可以返回当前释放技能的序号

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 是否正在释放技能| 布尔值|   
出参| 技能序号| 整数|   
  
## **9\. 查询自身是否处于交战中**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/9d59fe07-f5d8-45dd-99b4-ada30ef2ea17.undefined)

**节点功能**

查询造物自身当前是否在交战

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 是否交战中| 布尔值|   
  
## **10\. 查询自身是否在领地中**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/8911ea99-7eab-4c3c-8b3e-1a4ba93bdbd6.undefined)

**节点功能**

查询造物自身当前所处位置是否在领地中

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 是否在领地中| 布尔值|   
  
## **11\. 查询入战时的坐标点**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/dab3e48b-1b2b-4f03-92fc-bbf14abc9733.undefined)

**节点功能**

查询造物入战时的坐标点

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 入战位置| 三维向量|   
出参| 入战旋转| 三维向量|   
  
## **12\. 获取出生点位置信息**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/fecd235c-5eab-4509-a87f-bdb5705066aa.undefined)

**节点功能**

获取造物自身的出生点信息

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 出生点坐标| 三维向量|   
出参| 出生点旋转| 三维向量|   
  
## **13\. 获取自身实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/b206b2d2-6fd6-4918-a2ec-59578bc55bd7.undefined)

**节点功能**

返回该节点图所关联的实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 自身实体| 实体|   
  
## **14\. 获取目标实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/645e08ca-1098-4591-9981-e42c48797bdd.undefined)

**节点功能**

获取造物当前的目标实体，当且仅当造物存在目标时有效

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 目标实体| 实体|   
  
## **15\. 获取关卡实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/e8886d13-ec0c-4104-9282-a8d513d129ae.undefined)

**节点功能**

获取关卡实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 关卡实体| 实体|   
  
## **16\. 查询实体是否在场**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/96d35237-ff64-44a8-8fee-c69c7374b1a1.undefined)

**节点功能**

查询目标实体是否在场，注意角色实体即使处于倒下状态，仍然认为在场

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 枚举|   
出参| 是否在场| 布尔值|   
  
## **17\. 获取实体的类型**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/0a9773b0-2299-4b9c-ab11-f43d12841cbf.undefined)

**节点功能**

获取目标实体的类型

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 枚举|   
出参| 实体类型| 枚举|   
  
## **18\. 获取实体位置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/0d58f9e5-de43-48fa-ac5a-f4ab01886ac6.undefined)

**节点功能**

获取目标实体的位置

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 枚举|   
出参| 位置| 三维向量|   
  
## **19\. 获取实体旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/e1256825-1da9-403a-b32d-08fcb36c06a9.undefined)

**节点功能**

获取目标实体的旋转

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 枚举|   
出参| 旋转| 三维向量|   
  
## **20\. 获取物件预设状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/508ed664-891c-472a-a8e0-4702ee6ada6b.undefined)

**节点功能**

获取目标实体的指定预设状态索引的预设状态值。如果该实体没有指定的预设状态，则返回0

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 枚举|   
入参| 预设状态索引| 整数|   
出参| 预设状态值| 整数|   
  
## **21\. 获取自定义变量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/cdcb4e6c-8c66-4d46-92ac-9384af67423b.undefined)

**节点功能**

获取目标实体的指定自定义变量的变量值。如果变量不存在，则返回类型的默认值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 枚举|   
入参| 变量名| 字符串|   
出参| 变量值| 泛型|   
  
## **22\. 获取目标生命值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/49b6fa57-d47e-4f03-875d-63aa7752c8d8.undefined)

**节点功能**

获取目标实体的生命值相关参数

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 枚举|   
出参| 基础生命值| 浮点数|   
出参| 最大生命值| 浮点数|   
出参| 当前生命值百分比| 浮点数|   
  
## **23\. 获取目标等级**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/27458cfb-531d-419f-a6dc-848aad614826.undefined)

**节点功能**

获取目标实体的当前等级

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 枚举|   
出参| 当前等级| 整数|   
  
## **24\. 获取目标攻击力**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/fa9a499f-3ff5-4f15-aa02-c223d2f2d007.undefined)

**节点功能**

获取目标实体的攻击力相关参数

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 枚举|   
出参| 基础攻击力| 浮点数|   
出参| 当前攻击力| 浮点数|   
  
## **25\. 获取自身预设状态值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/40ceb5fa-6175-4c9c-a571-e518afb47052.undefined)

**节点功能**

获取自身的指定预设状态索引的预设状态值。如果该实体没有指定的预设状态索引，则返回0

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 预设状态索引| 整数|   
出参| 预设状态值| 整数|   
  
## **26\. 获取前一帧执行状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/368f2201-5b59-4de2-b8d9-2f9c0dbd4578.undefined)

**节点功能**

获取造物前一帧执行的【造物状态节点图】的配置ID

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 状态节点图配置ID| 配置ID|   
  
## **27\. 获取前一帧执行战术**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/48c15659-c603-4bc5-8831-7eb21d982240.undefined)

**节点功能**

获取造物前一帧执行的战术

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 战术类型| 枚举|   
出参| 战术上下文| 字符串|   
出参| 战术持续时长| 浮点数|   
  
## **28\. 实体是否携带指定单位状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/af9859fd-14a2-48c8-bff7-15ea437e96d3.undefined)

**节点功能**

查询目标实体是否携带指定的单位状态

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 单位状态| 配置ID|   
出参| 是否携带| 布尔值|   
  
# **二、阵营相关**

## **1\. 查询阵营是否敌对**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/3715790a-4c43-42ed-812c-710dd6e696a9.undefined)

**节点功能**

查询阵营1和阵营2是否敌对

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 阵营1| 阵营|   
入参| 阵营2| 阵营|   
出参| 是否敌对| 布尔值|   
  
## **2\. 查询实体阵营**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/8d940186-1d3d-480c-b815-85ff4eea081b.undefined)

**节点功能**

查询目标实体的阵营

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 枚举|   
出参| 阵营| 阵营|   
  
# **三、列表相关**

## **1\. 获取列表对应值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/b6e2f3fa-27b8-4410-a819-1f80b7bd4526.undefined)

**节点功能**

返回数据列表中指定序号对应的值。列表中序号从0开始

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 序号| 整数|   
入参| 数据列表| 泛型|   
出参| 结果| 泛型|   
  
## **2\. 获取列表长度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/77e1c475-9954-4e9e-8cd8-d5aaa385b3d6.undefined)

**节点功能**

获取列表长度（列表中的元素个数）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入列表| 泛型|   
出参| 长度| 整数|   
  
## **3\. 列表是否包含该值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/caf276b3-43b5-4809-8d24-934754161d51.undefined)

**节点功能**

查询指定列表是否包含特定的值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 值| 泛型|   
入参| 列表| 泛型|   
出参| 结果| 布尔值|   
  
## **4\. 获取列表最大值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/0979771b-4761-4242-8282-795ae302887f.undefined)

**节点功能**

仅对浮点数列表和整数列表有意义，返回列表中的最大值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 列表| 泛型|   
出参| 最大值| 泛型|   
  
## **5\. 获取列表最小值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/0a4f6571-6fc0-44c2-a47f-fbc968ab2ec8.undefined)

**节点功能**

仅对浮点数列表和整数列表有意义，返回列表中的最小值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 列表| 泛型|   
出参| 最小值| 泛型|   
  
## **6\. 获取实体类型列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/f6e19f88-2677-4e3f-9ebe-12c2693b6bfe.undefined)

**节点功能**

将所需的实体类型拼装为一个列表。

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 0| 枚举|   
入参| 1| 枚举|   
入参| 2| 枚举|   
入参| 3| 枚举|   
入参| 4| 枚举|   
入参| 5| 枚举|   
入参| 6| 枚举|   
入参| 7| 枚举|   
入参| 8| 枚举|   
入参| 9| 枚举|   
出参| 列表| 枚举列表|   
  
# **四、字典**

## **1\. 以键查询字典值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/a32528b3-6f7d-46c0-a6b6-b4e2d04022d0.undefined)

**节点功能**

根据键查询字典中对应的值，如果键不存在，则返回类型默认值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
入参| 键| 泛型|   
出参| 值| 泛型|   
  
## **2\. 查询字典是否包含特定键**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/3dbeeaa3-04bd-4a08-b841-c40db1d50f58.undefined)

**节点功能**

查询指定字典是否包含特定的键

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
入参| 键| 泛型|   
出参| 是否包含| 布尔值|   
  
## **3\. 查询字典是否包含特定值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/40bb3dee-9a12-4ab8-b873-fc6504b030fe.undefined)

**节点功能**

查询指定字典是否包含特定的值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
入参| 值| 泛型|   
出参| 是否包含| 布尔值|   
  
## **4\. 查询字典长度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/d7a0f766-0739-4f53-a19a-ca7596deb67f.undefined)

**节点功能**

查询字典中键值对的数量

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
出参| 长度| 整数|   
  
## **5\. 获取字典中值组成的列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/a3a3da59-b5d5-4035-ab55-e88e49327cbe.undefined)

**节点功能**

获取字典中所有值组成的列表。由于字典中键值对是无序排列的，所以取出的值列表也不一定按照其插入顺序排列

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
出参| 值列表| 泛型|   
  
## **6\. 获取字典中键组成的列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/3cc01f7d-28cc-4b33-90f4-4ba7c05b3711.undefined)

**节点功能**

获取字典中所有键组成的列表。由于字典中键值对是无序排列的，所以取出的键列表也不一定按照其插入顺序排列

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
出参| 键列表| 泛型|   
  
# **五、射线**

## **1\. 获取射线检测结果**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/8d2819f1-2994-40cc-9055-43dfd8fdf5f4.undefined)

**节点功能**

获取射线检测结果，会根据射线命中从近到远的顺序返回满足筛选条件的第一个目标或命中位置

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 检测发起者实体| 枚举|   
入参| 出射位置| 三维向量|   
入参| 出射方向| 三维向量|   
入参| 射线最大长度| 浮点数|   
入参| 阵营筛选| 枚举|   
入参| 实体类型筛选| 枚举列表| 分为关卡、物件、玩家、角色、造物  
入参| 命中层筛选| 枚举列表| 分为受击盒、场景、物件自身碰撞  
出参| 命中位置| 三维向量|   
出参| 是否命中实体| 布尔值|   
  
## **2\. 获取射线筛选类型列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhk4furvds12/7866247b-6069-4177-98bd-fbe8fcecae36.undefined)

**节点功能**

将所需的射线筛选类型拼装为一个列表。可筛选项有受击盒、场景、物件自身碰撞

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 0| 枚举|   
入参| 1| 枚举|   
入参| 2| 枚举|   
入参| 3| 枚举|   
入参| 4| 枚举|   
入参| 5| 枚举|   
入参| 6| 枚举|   
入参| 7| 枚举|   
入参| 8| 枚举|   
入参| 9| 枚举|   
出参| 列表| 枚举列表|
