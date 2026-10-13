# 节点介绍/客户端节点/造物技能节点图/查询节点

(来源：原神千星奇域·综合指南，页面 ID mhpw06rvah3a)

# **一、技能**  
  
## **1\. 获取复杂造物当前施放的技能**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/785a4fb2-01ad-4aaa-b704-d2cdf4b1a50e.undefined)

**节点功能**

返回复杂造物当前正在施放的技能的序号

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 技能序号| 整数|   
  
## **2\. 查询技能变量对应值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/06d75da1-d747-4f27-9a5f-7aca3cfa5b89.undefined)

**节点功能**

根据技能变量配置ID查询对应的变量值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 技能变量配置ID| 配置ID|   
出参| 变量值| 浮点数|   
  
# **二、列表相关**

## **1\. 获取列表对应值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/4d18c3a7-435d-47ca-9b44-8b70be083db2.undefined)

**节点功能**

返回列表中指定序号对应的值。列表中序号从0开始

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 序号| 整数|   
入参| 数据列表| 泛型|   
出参| 结果| 泛型|   
  
## **2\. 获取列表长度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/258275d6-c93a-49ec-ab35-c78cb8706728.undefined)

**节点功能**

获取列表长度（列表中的元素个数）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入列表| 泛型|   
出参| 长度| 整数|   
  
## **3\. 获取列表最大值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/357d5f58-4c36-4ee4-bbc6-b157f7e1dde3.undefined)

**节点功能**

仅对浮点数列表和整数列表有意义，返回列表中的最大值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 列表| 泛型|   
出参| 最大值| 泛型|   
  
## **4\. 获取列表最小值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/b224cec0-e5a4-4231-9eca-e2f4b6ee5cd4.undefined)

**节点功能**

仅对浮点数列表和整数列表有意义，返回列表中的最小值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 列表| 泛型|   
出参| 最小值| 泛型|   
  
## **5\. 获取实体类型列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/1e9bea85-bcd9-4d4d-a697-bd52f58ddfc2.undefined)

**节点功能**

将所需的实体类型拼装为一个列表。类型分为关卡、物件、玩家、角色、造物

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 列表| 枚举列表|   
  
## **6\. 列表是否包含该值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/8bf772ac-d6fc-4917-a3b0-e19fd90471ce.undefined)

**节点功能**

返回列表中是否包含指定值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 值| 泛型|   
入参| 列表| 泛型|   
出参| 结果| 布尔值|   
  
## **7\. 获取射线筛选类型列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/c12566c1-c319-419c-803b-d8e1efc051e4.undefined)

**节点功能**

将所需的射线筛选类型拼装为一个列表。可筛选项有受击盒、场景、物件自身碰撞

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 列表| 枚举列表|   
  
# **三、自定义变量**

## **1\. 获取自定义变量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/cd113ed2-fcbc-4950-b7b4-b019e4cc37dc.undefined)

**节点功能**

获取目标实体的指定自定义变量的值

如果变量不存在，则返回类型的默认值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 变量名| 字符串|   
出参| 变量值| 泛型|   
  
# **四、预设状态**

## **1\. 获取预设状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/5be5811f-0764-4097-983f-7dead7fee60a.undefined)

**节点功能**

获取指定实体的预设状态值。如果该实体没有指定的预设状态，则返回0

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 实体| 实体|   
入参| 预设状态索引| 整数|   
出参| 预设状态值| 整数|   
  
# **五、实体相关**

## **1\. 以GUID查询实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/3fd0ad7b-58ec-401e-9c6b-ec6230763437.undefined)

**节点功能**

根据GUID查询实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| GUID| GUID|   
出参| 实体| 实体|   
  
## **2\. 获取实体位置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/ae701f22-28c7-465f-99ce-61f57ca84ff8.undefined)

**节点功能**

获取指定实体的位置

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 实体| 实体|   
出参| 位置| 三维向量|   
  
## **3\. 获取实体旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/9fde0f16-dac2-4927-b86a-f80621929051.undefined)

**节点功能**

获取指定实体以欧拉角表示的旋转

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 实体| 实体|   
出参| 旋转| 三维向量|   
  
## **4\. 获取自身实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/416f53ce-d46c-4e39-9ac4-184e22eda6b3.undefined)

**节点功能**

返回该节点图所关联的实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 自身实体| 实体|   
  
## **5\. 获取单位攻击目标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/90cd6ab2-229c-4dcc-b43e-fa25f939e4c4.undefined)

**节点功能**

获取单位实体当前正在攻击的目标实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 单位实体| 实体|   
出参| 攻击目标实体| 实体|   
  
## **6\. 获取目标挂接点位置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/6dca90cb-b88f-4f46-8f07-e3a2cea125c0.undefined)

**节点功能**

获取指定目标实体上对应挂接点名称的挂接点位置

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 挂接点名称| 字符串|   
出参| 挂接点位置| 三维向量|   
  
## **7\. 获取目标挂接点旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/aa302f3b-1540-4eb8-977d-46a52ba05e15.undefined)

**节点功能**

获取指定目标实体上对应挂接点名称的挂接点旋转

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 挂接点名称| 字符串|   
出参| 挂接点旋转| 三维向量|   
  
## **8\. 获取实体的类型**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/dd1f4c06-5a49-426d-94fe-10a8bdd44b89.undefined)

**节点功能**

获取指定实体的类型

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 实体类型| 枚举|   
  
## **9\. 筛选球体范围内的实体列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/76b81299-6884-4660-bcc9-a8f76008fd01.undefined)

**节点功能**

以特定的规则和数量上限筛选在球形范围内的实体，满足条件的实体会组成实体列表输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 半径| 浮点数|   
入参| 中心位置| 三维向量|   
入参| 筛选数量上限| 整数|   
入参| 筛选规则| 枚举| 分为默认排序、随机排序、从近到远排序  
出参| 筛选结果| 实体列表|   
  
## **10\. 筛选方形范围内的实体列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/b6b94667-d928-46f8-960f-08d2779b331d.undefined)

**节点功能**

以特定的规则和数量上限筛选在方形范围内的实体，满足条件的实体会组成实体列表输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 宽度| 浮点数|   
入参| 高度| 浮点数|   
入参| 长度| 浮点数|   
入参| 中心位置| 三维向量|   
入参| 筛选数量上限| 整数|   
入参| 筛选规则| 枚举| 分为默认排序、随机排序、从近到远排序  
出参| 筛选结果| 实体列表|   
  
## **11\. 查询实体是否在场**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/2db39142-9538-419c-862b-0ca5642fbea9.undefined)

**节点功能**

查询指定实体是否在场

注意角色实体即使处于倒下状态，仍然认为在场

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 是否在场| 布尔值|   
  
## **12\. 获取子实体列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/32354880-316f-4389-adc8-348bb5cde915.undefined)

**节点功能**

返回目标实体的子实体列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 子实体列表| 实体列表|   
  
## **13\. 获取造物当前目标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/4b43f0ae-7918-4ddf-b32a-82dfcb36f666.undefined)

**节点功能**

返回指定造物当前的目标

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 造物| 实体|   
出参| 目标实体| 实体|   
  
## **14\. 查询复杂造物的预设状态值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/c6aaa4ee-f2c0-4437-a0a4-693e7e834263.undefined)

**节点功能**

查询目标造物对应预设状态索引下的预设状态值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标造物| 实体|   
入参| 预设状态索引| 整数|   
出参| 预设状态值| 整数|   
  
## **15\. 获取角色归属的玩家实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/53cd7981-45f1-43bb-890a-c82dca0fde85.undefined)

**节点功能**

获取角色实体所归属的玩家实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 角色实体| 实体|   
出参| 所属玩家实体| 实体|   
  
## **16\. 获取在场玩家实体列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/555d8a74-8b1c-44e9-87bf-68f7a71c57e9.undefined)

**节点功能**

获取在场所有玩家实体组成的列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 玩家实体列表| 实体列表|   
  
## **17\. 以实体查询GUID**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/03693d09-69d5-481f-b174-1fe8c71a2b78.undefined)

**节点功能**

查询指定实体的GUID

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 实体| 实体|   
出参| GUID| GUID|   
  
## **18\. 获取玩家的角色列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/c3cafb1e-2946-46e7-9755-aab577af3d87.undefined)

**节点功能**

仅经典模式可用，获取玩家队伍内的角色列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 角色列表| 实体列表|   
  
## **19\. 获取指定玩家的前台角色**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/9cab2684-c795-4c7c-9bf7-29cd84336f30.undefined)

**节点功能**

仅经典模式可用，获取玩家队伍内的前台角色

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 角色实体| 实体|   
  
## **20\. 查询经典模式角色编号**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/28cefac5-0a97-4363-a7be-dde084d40848.undefined)

**节点功能**

仅经典模式可用，查询目标角色的角色编号，可以查看附录对应具体是哪位角色[经典模式角色编号一览](/ys/ugc/tutorial//detail/mh4imrrhzdzi)

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标角色| 实体|   
出参| 角色编号| 整数|   
  
# **六、阵营相关**

## **1\. 查询实体阵营**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/f82ca772-f072-4088-9ab5-6eda67a0761f.undefined)

**节点功能**

查询目标实体的阵营

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 阵营| 阵营|   
  
## **2\. 查询阵营是否敌对**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/19c4f99c-5a58-4fec-9a33-2959f79c516e.undefined)

**节点功能**

查询阵营1和阵营2是否敌对

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 阵营1| 阵营|   
入参| 阵营2| 阵营|   
出参| 是否敌对| 布尔值|   
  
# **七、光标**

## **1\. 获取光标是否激活**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/930c14e4-94d3-4a22-ada8-76fbfce43de3.undefined)

**节点功能**

获取本机持久光标是否处于激活状态，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 是否激活| 布尔值|   
  
## **2\. 获取光标命中结果**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/b99487d1-32e5-414f-acd9-7360733dc143.undefined)

**节点功能**

获取本机持久光标的命中结果，包含命中实体列表、命中位置列表与命中数量，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 命中实体列表| 实体列表|   
出参| 命中位置列表| 三维向量列表|   
出参| 命中数量| 整数|   
  
## **3\. 获取光标屏幕坐标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/3a28df23-df3e-4531-8153-12a19f883c4c.undefined)

**节点功能**

获取本机持久光标的屏幕坐标X与Y，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 屏幕X| 浮点数|   
出参| 屏幕Y| 浮点数|   
  
## **4\. 获取光标视口坐标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/775f7ebc-7b6f-46d9-b05e-3a915db6d2d6.undefined)

**节点功能**

获取本机持久光标的视口坐标X与Y，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 视口X| 浮点数|   
出参| 视口Y| 浮点数|   
  
# **八、标签**

## **1\. 获取实体的单位标签列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/27386486-ac5d-4508-b527-512b48319c8c.undefined)

**节点功能**

获取目标实体上携带的所有单位标签组成的列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 列表| 整数列表|   
  
## **2\. 获取单位标签的实体列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/8fd7418c-374e-46e6-a75b-3fafbc2a5cbb.undefined)

**节点功能**

获取在场所有携带该单位标签的实体列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 单位标签索引| 整数|   
出参| 实体列表| 实体列表|   
  
# **九、通用**

## **1\. 获取局部变量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/cb23a0d7-b02e-4e97-9522-04d7fe120018.undefined)

**节点功能**

获取特定局部变量的变量值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 变量名| 字符串|   
出参| 变量值| 泛型|   
  
# **十、自定义仇恨**

## **1\. 获取指定实体的仇恨目标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/be0e0b23-6251-4d6b-a1bb-dc753398ea96.undefined)

**节点功能**

仅自定义仇恨模式可用

获取指定实体的仇恨目标

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 指定实体| 实体|   
出参| 仇恨目标| 实体|   
  
## **2\. 获取指定实体的仇恨列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/0b8a1238-b7f8-4853-bb73-eb354e1b539a.undefined)

**节点功能**

仅自定义仇恨模式可用

获取指定实体的仇恨列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 指定实体| 实体|   
出参| 仇恨列表| 实体列表|   
  
## **3\. 查询指定实体是否入战**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/777076e1-56f2-44df-939a-ce0301d610aa.undefined)

**节点功能**

仅自定义仇恨模式可用

查询指定实体是否已经入战

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 是否入战| 布尔值|   
  
# **十一、触发器**

## **1\. 获取碰撞触发器内所有实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/94409351-447b-4a5e-9c41-b5cb904919a7.undefined)

**节点功能**

获取目标实体上碰撞触发器组件中特定序号对应的碰撞触发器内的所有实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 触发器序号| 整数|   
出参| 实体列表| 实体列表|   
  
# **十二、射线**

## **1\. 获取射线检测结果**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/54c25eb5-2bb9-445e-840c-f82d785cdc65.undefined)

**节点功能**

获取射线检测结果，会根据射线命中从近到远的顺序返回满足筛选条件的第一个目标或命中位置

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 检测发起者实体| 实体|   
入参| 出射位置| 三维向量|   
入参| 出射方向| 三维向量|   
入参| 射线最大长度| 浮点数|   
入参| 阵营筛选| 枚举|   
入参| 实体类型筛选| 枚举列表| 分为关卡、物件、玩家、角色、造物  
入参| 命中层筛选| 枚举列表| 分为受击盒、场景、物件自身碰撞  
出参| 命中位置| 三维向量|   
出参| 命中实体| 实体|   
  
# **十三、字典**

## **1\. 以键查询字典值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/e8256fa0-9fc4-4c91-a655-dba14b2869ee.undefined)

**节点功能**

根据键查询字典中对应的值，如果键不存在，则返回类型默认值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
入参| 键| 泛型|   
出参| 值| 泛型|   
  
## **2\. 查询字典是否包含特定键**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/a43a32aa-8046-4917-813f-9323fe3c7d5b.undefined)

**节点功能**

查询指定字典是否包含特定的键

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
入参| 键| 泛型|   
出参| 是否包含| 布尔值|   
  
## **3\. 查询字典是否包含特定值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/df0c4108-4bfb-42bb-81af-81d5a3c1cadc.undefined)

**节点功能**

查询指定字典是否包含特定的值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
入参| 值| 泛型|   
出参| 是否包含| 布尔值|   
  
## **4\. 查询字典长度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/d1dab92c-92fa-498e-8bcd-664890c7505e.undefined)

**节点功能**

查询字典中键值对的数量

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
出参| 长度| 整数|   
  
## **5\. 获取字典中值组成的列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/2ce40d1c-75b0-4aff-bd71-bc1a8bad1d27.undefined)

**节点功能**

获取字典中所有值组成的列表。由于字典中键值对是无序排列的，所以取出的值列表也不一定按照其插入顺序排列

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
出参| 值列表| 泛型|   
  
## **6\. 获取字典中键组成的列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/0df76f21-3c39-46f1-8e91-d7fd2124eba7.undefined)

**节点功能**

获取字典中所有键组成的列表。由于字典中键值对是无序排列的，所以取出的键列表也不一定按照其插入顺序排列

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
出参| 键列表| 泛型|   
  
# **十四、单位状态**

## **1\. 实体是否携带指定单位状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhpw06rvah3a/851ef7d6-5291-40bd-af05-ccb14d3a377d.undefined)

**节点功能**

查询目标实体是否携带指定的单位状态

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 单位状态| 配置ID|   
出参| 是否携带| 布尔值|
