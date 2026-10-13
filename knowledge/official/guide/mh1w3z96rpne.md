# 节点介绍/客户端节点/造物状态节点图/查询节点

(来源：原神千星奇域·综合指南，页面 ID mh1w3z96rpne)

# **一、通用**

## **1\. 获取自身当前执行状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/78905982-4fd5-46de-bf0f-310e22ea4630.undefined)

**节点功能**

获取造物自身当前正在执行的【造物状态节点图】的配置ID

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 状态节点图配置ID| 配置ID|   
  
## **2\. 查询自身距离目标的水平角度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/db26fe16-1da2-4907-ade8-06c32cc1af73.undefined)

**节点功能**

查询造物自身距离目标实体的水平角度，当且仅当造物存在目标时有效

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 水平角度| 浮点数|   
  
## **3\. 查询自身距离目标的垂直角度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/bc016450-2002-43c8-be6a-45546f1ef695.undefined)

**节点功能**

查询造物自身距离目标实体的垂直角度，当且仅当造物存在目标时有效

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 垂直角度| 浮点数|   
  
## **4\. 查询自身距离目标的水平距离**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/f8d9f623-5887-4086-a1b0-f2fa03b2dfd6.undefined)

**节点功能**

查询造物自身距离目标实体的水平距离，当且仅当造物存在目标时有效

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 水平距离| 浮点数|   
  
## **5\. 查询自身距离目标的垂直距离**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/d5263480-ff0e-42fd-8640-3c5f928a7769.undefined)

**节点功能**

查询造物自身距离目标实体的垂直距离，当且仅当造物存在目标时有效

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 垂直距离| 浮点数|   
  
## **6\. 查询自身距离目标的距离**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/7f4ea0a7-ea54-4452-878d-9fb49d7ca2fe.undefined)

**节点功能**

查询造物自身距离目标实体的距离，当且仅当造物存在目标时有效

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 距离| 浮点数|   
  
## **7\. 查询目标点是否寻路可达**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/188fa8d8-d331-4c16-92da-98a2e492bde5.undefined)

**节点功能**

查询造物当前的目标点是否可以正常寻路到达

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 是否寻路可达| 布尔值|   
  
## **8\. 查询自身是否正在释放技能**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/f65de03e-1796-4d7f-96bd-fa32e70f346f.undefined)

**节点功能**

查询造物当前是否正在释放技能，如果正在释放技能，可以返回当前释放技能的序号

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 是否正在释放技能| 布尔值|   
出参| 技能序号| 整数|   
  
## **9\. 查询自身是否处于交战中**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/aae52fbe-004b-460e-9f9d-24a6c84c4106.undefined)

**节点功能**

查询造物自身当前是否在交战

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 是否交战中| 布尔值|   
  
## **10\. 查询自身是否在领地中**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/cd62f592-14e9-40e4-b73d-f8e87179555d.undefined)

**节点功能**

查询造物自身当前所处位置是否在领地中

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 是否在领地中| 布尔值|   
  
## **11\. 查询入战时的坐标点**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/11528b89-5066-455d-9efa-16a451cef174.undefined)

**节点功能**

查询造物入战时的坐标点

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 入战位置| 三维向量|   
出参| 入战旋转| 三维向量|   
  
## **12\. 获取出生点位置信息**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/c14585b2-69a7-407e-8476-355dcdaf2d7b.undefined)

**节点功能**

获取造物自身的出生点信息

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 出生点坐标| 三维向量|   
出参| 出生点旋转| 三维向量|   
  
## **13\. 获取自身实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/f4c33602-57a1-460b-85ba-0e1690ed1579.undefined)

**节点功能**

返回该节点图所关联的实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 自身实体| 实体|   
  
## **14\. 获取目标实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/c458954d-f5d9-4ec8-a2bd-68106e2401c7.undefined)

**节点功能**

获取造物当前的目标实体，当且仅当造物存在目标时有效

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 目标实体| 实体|   
  
## **15\. 获取关卡实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/2e74205b-42f5-4871-b877-b548b034c9da.undefined)

**节点功能**

获取关卡实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 关卡实体| 实体|   
  
## **16\. 查询实体是否在场**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/b78c33bf-f51a-4b4e-8552-35c43125c7f1.undefined)

**节点功能**

查询目标实体是否在场，注意角色实体即使处于倒下状态，仍然认为在场

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 枚举|   
出参| 是否在场| 布尔值|   
  
## **17\. 获取实体的类型**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/5574d484-d832-475b-b6f7-a0ca299af2a7.undefined)

**节点功能**

获取目标实体的类型

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 枚举|   
出参| 实体类型| 枚举|   
  
## **18\. 获取实体位置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/887872c5-4d92-424c-96f6-e39fee92345d.undefined)

**节点功能**

获取目标实体的位置

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 枚举|   
出参| 位置| 三维向量|   
  
## **19\. 获取实体旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/7f1a8cf2-6a5d-41c5-939d-40ae2e09d8c3.undefined)

**节点功能**

获取目标实体的旋转

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 枚举|   
出参| 旋转| 三维向量|   
  
## **20\. 获取物件预设状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/f7984f83-f8d5-4b0b-85e8-220f5c04b0c2.undefined)

**节点功能**

获取目标实体的指定预设状态索引的预设状态值。如果该实体没有指定的预设状态，则返回0

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 枚举|   
入参| 预设状态索引| 整数|   
出参| 预设状态值| 整数|   
  
## **21\. 获取自定义变量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/1765bb73-2613-4c62-9a49-2e29b91ef8d8.undefined)

**节点功能**

获取目标实体的指定自定义变量的变量值。如果变量不存在，则返回类型的默认值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 枚举|   
入参| 变量名| 字符串|   
出参| 变量值| 泛型|   
  
## **22\. 获取目标生命值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/01c328ba-11bc-4a20-9acf-67f883ec8d38.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/c03d9503-2a6b-4e75-89f7-c0ef788786fa.undefined)

**节点功能**

获取目标实体的当前等级

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 枚举|   
出参| 当前等级| 整数|   
  
## **24\. 获取目标攻击力**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/2f5476cc-0c16-46f9-b977-a3ee7fac1f4f.undefined)

**节点功能**

获取目标实体的攻击力相关参数

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 枚举|   
出参| 基础攻击力| 浮点数|   
出参| 当前攻击力| 浮点数|   
  
## **25\. 获取自身预设状态值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/28ca09fa-d73e-4960-b322-ddbd94285d18.undefined)

**节点功能**

获取自身的指定预设状态索引的预设状态值。如果该实体没有指定的预设状态索引，则返回0

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 预设状态索引| 整数|   
出参| 预设状态值| 整数|   
  
## **26\. 获取前一帧执行状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/0fb2c6fe-04a5-4aef-8a24-35b3f1c44d9b.undefined)

**节点功能**

获取造物前一帧执行的【造物状态节点图】的配置ID

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 状态节点图配置ID| 配置ID|   
  
## **27\. 获取前一帧执行战术**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/0e7296e2-a398-4568-af4a-0f76224adf4b.undefined)

**节点功能**

获取造物前一帧执行的战术

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 战术类型| 枚举|   
出参| 战术上下文| 字符串|   
出参| 战术持续时长| 浮点数|   
  
## **28\. 实体是否携带指定单位状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/db37135c-8d36-4028-93be-4231cb454a27.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/dea83118-24c0-4233-998e-34c3088cb385.undefined)

**节点功能**

查询阵营1和阵营2是否敌对

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 阵营1| 阵营|   
入参| 阵营2| 阵营|   
出参| 是否敌对| 布尔值|   
  
## **2\. 查询实体阵营**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/f395daa2-5a75-454e-9df9-7eb8bdd9a351.undefined)

**节点功能**

查询目标实体的阵营

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 枚举|   
出参| 阵营| 阵营|   
  
# **三、列表相关**

## **1\. 获取列表对应值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/ec45a32d-8ca4-4051-9dd3-791fcfae8ea2.undefined)

**节点功能**

返回数据列表中指定序号对应的值。列表中序号从0开始

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 序号| 整数|   
入参| 数据列表| 泛型|   
出参| 结果| 泛型|   
  
## **2\. 获取列表长度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/50f1f64a-9281-4442-a890-2ca28ab30376.undefined)

**节点功能**

获取列表长度（列表中的元素个数）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入列表| 泛型|   
出参| 长度| 整数|   
  
## **3\. 列表是否包含该值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/786d9344-a12f-4103-886b-988e66ec03ee.undefined)

**节点功能**

查询指定列表是否包含特定的值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 值| 泛型|   
入参| 列表| 泛型|   
出参| 结果| 布尔值|   
  
## **4\. 获取列表最大值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/1bf673bd-a24e-4540-90d9-63a8450f525c.undefined)

**节点功能**

仅对浮点数列表和整数列表有意义，返回列表中的最大值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 列表| 泛型|   
出参| 最大值| 泛型|   
  
## **5\. 获取列表最小值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/fe594ec8-9e04-4e06-a3ec-8979c66b5b23.undefined)

**节点功能**

仅对浮点数列表和整数列表有意义，返回列表中的最小值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 列表| 泛型|   
出参| 最小值| 泛型|   
  
## **6\. 获取实体类型列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/30562c59-8261-4364-8e8f-efa743357b05.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/271b34ab-da15-44d5-8b86-4f3cb6f3fa7e.undefined)

**节点功能**

根据键查询字典中对应的值，如果键不存在，则返回类型默认值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
入参| 键| 泛型|   
出参| 值| 泛型|   
  
## **2\. 查询字典是否包含特定键**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/66c27721-8b6f-4dc0-9b58-96df89bed148.undefined)

**节点功能**

查询指定字典是否包含特定的键

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
入参| 键| 泛型|   
出参| 是否包含| 布尔值|   
  
## **3\. 查询字典是否包含特定值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/ac8f0d7d-3cfc-4038-8aaa-44fe1f846235.undefined)

**节点功能**

查询指定字典是否包含特定的值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
入参| 值| 泛型|   
出参| 是否包含| 布尔值|   
  
## **4\. 查询字典长度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/eb50e7ab-919e-44ea-8405-79ed4afb6fff.undefined)

**节点功能**

查询字典中键值对的数量

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
出参| 长度| 整数|   
  
## **5\. 获取字典中值组成的列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/976fe9d4-0f3a-4ad2-8361-0b9705e3dc7a.undefined)

**节点功能**

获取字典中所有值组成的列表。由于字典中键值对是无序排列的，所以取出的值列表也不一定按照其插入顺序排列

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
出参| 值列表| 泛型|   
  
## **6\. 获取字典中键组成的列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/11765cc0-8c88-415b-b4c0-d171fd6435a3.undefined)

**节点功能**

获取字典中所有键组成的列表。由于字典中键值对是无序排列的，所以取出的键列表也不一定按照其插入顺序排列

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
出参| 键列表| 泛型|   
  
# **五、射线**

## **1\. 获取射线检测结果**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/b38cc939-5c14-4a52-884e-b2b4b4d3b03b.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1w3z96rpne/827e2488-9a46-4d47-8c58-df4f0048477f.undefined)

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
