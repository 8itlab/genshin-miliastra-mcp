# 节点介绍/客户端节点/过滤器节点图/查询节点

(来源：原神千星奇域·综合指南，页面 ID mh2crq9jzueq)

# **一、列表相关**  
  
## **1\. 获取列表对应值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/7860571d-82e6-4a3c-bf1c-81eb8e3702dc.undefined)

**节点功能**

返回列表中指定序号对应的值。列表中序号从0开始

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 序号| 整数|   
入参| 数据列表| 泛型|   
出参| 结果| 泛型|   
  
## **2\. 获取列表长度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/2b345278-df4a-4176-9008-01d0e1df5763.undefined)

**节点功能**

获取列表长度（列表中的元素个数）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入列表| 泛型|   
出参| 长度| 整数|   
  
## **3\. 列表是否包含该值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/75645e1a-fecc-4c5f-82d2-875970c582d9.undefined)

**节点功能**

返回列表中是否包含指定值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 值| 泛型|   
入参| 列表| 泛型|   
出参| 结果| 布尔值|   
  
## **4\. 获取列表最大值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/f1f96a84-1941-4ad2-b54e-686952d7a9cb.undefined)

**节点功能**

仅对浮点数列表和整数列表有意义，返回列表中的最大值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 列表| 泛型|   
出参| 最大值| 泛型|   
  
## **5\. 获取列表最小值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/25253cab-41ca-4af7-acd0-9a9a8d536e3c.undefined)

**节点功能**

仅对浮点数列表和整数列表有意义，返回列表中的最小值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 列表| 泛型|   
出参| 最小值| 泛型|   
  
## **6\. 获取实体类型列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/c188eb92-9548-41db-898a-faeee797833d.undefined)

**节点功能**

将所需的实体类型拼装为一个列表。类型分为关卡、物件、玩家、角色、造物

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 列表| 枚举列表|   
  
## **7\. 获取射线筛选类型列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/fc81fda4-19ac-401d-9af1-da4f516f5dd6.undefined)

**节点功能**

将所需的射线筛选类型拼装为一个列表。可筛选项有受击盒、场景、物件自身碰撞

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 列表| 枚举列表|   
  
# **二、自定义变量**

## **1\. 获取自定义变量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/224d94d3-cdca-4766-8cc1-e929e1980e47.undefined)

**节点功能**

获取目标实体的指定自定义变量的值

如果变量不存在，则返回类型的默认值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 变量名| 字符串|   
出参| 变量值| 泛型|   
  
# **三、预设状态**

## **1\. 获取预设状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/c4f39b93-20d4-48ee-af43-a34fc2ffa012.undefined)

**节点功能**

获取指定实体的预设状态值。如果该实体没有指定的预设状态，则返回0

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 实体| 实体|   
入参| 预设状态索引| 整数|   
出参| 预设状态值| 整数|   
  
# **四、实体相关**

## **1\. 以GUID查询实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/5c92fdef-c4a9-4573-a5e2-6a4aae667441.undefined)

**节点功能**

根据GUID查询实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| GUID| GUID|   
出参| 实体| 实体|   
  
## **2\. 获取实体位置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/528453b9-3997-43d1-ad4e-404097cb932c.undefined)

**节点功能**

获取指定实体的位置

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 实体| 实体|   
出参| 位置| 三维向量|   
  
## **3\. 获取实体旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/48788118-b530-4cab-912a-55b1349a2c4a.undefined)

**节点功能**

获取指定实体以欧拉角表示的旋转

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 实体| 实体|   
出参| 旋转| 三维向量|   
  
## **4\. 获取自身实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/cdee5f93-3e5a-40a4-99c2-d2261e044c43.undefined)

**节点功能**

返回该节点图所关联的实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 自身实体| 实体|   
  
## **5\. 获取目标实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/9d7c7995-6d7b-4d82-930e-37b50287e9e8.undefined)

**节点功能**

获取目标实体，根据过滤器节点图被引用的功能模块不同，其指代含义会有区别

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 目标实体| 实体|   
  
## **6\. 筛选球体范围内的实体列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/c68fa966-c6f1-46b1-a2a3-d95444e5dffb.undefined)

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
  
## **7\. 筛选方形范围内的实体列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/f73cce64-b0c2-437f-a9a5-c870a41dbb76.undefined)

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
  
## **8\. 获取实体的类型**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/5cdd98d0-5abd-4d19-8ba7-2f065c04f6a8.undefined)

**节点功能**

获取指定实体的类型

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 实体类型| 枚举|   
  
## **9\. 获取单位攻击目标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/df824100-cc6d-4994-b457-b082d6e4ec3b.undefined)

**节点功能**

获取单位实体当前正在攻击的目标实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 单位实体| 实体|   
出参| 攻击目标实体| 实体|   
  
## **10\. 获取目标挂接点位置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/4f19871e-fd2a-4b62-97c9-ddf1333586b5.undefined)

**节点功能**

获取指定目标实体上对应挂接点名称的挂接点位置

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 挂接点名称| 字符串|   
出参| 挂接点位置| 三维向量|   
  
## **11\. 查询实体是否在场**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/ba00b2fc-5fad-42c0-a08d-df937ffde04b.undefined)

**节点功能**

查询指定实体是否在场

注意角色实体即使处于倒下状态，仍然认为在场

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 是否在场| 布尔值|   
  
## **12\. 查询复杂造物的预设状态值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/7d528823-70ea-47e4-b19d-72e87cf549a7.undefined)

**节点功能**

查询目标造物对应预设状态索引下的预设状态值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标造物| 实体|   
入参| 预设状态索引| 整数|   
出参| 预设状态值| 整数|   
  
# **五、阵营相关**

## **1\. 查询实体阵营**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/8fb2b05c-64da-4c0c-87ce-a06282a1727d.undefined)

**节点功能**

查询目标实体的阵营

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 阵营| 阵营|   
  
## **2\. 查询阵营是否敌对**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/b6bb40d7-7921-40d8-ae47-722607d57d49.undefined)

**节点功能**

查询阵营1和阵营2是否敌对

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 阵营1| 阵营|   
入参| 阵营2| 阵营|   
出参| 是否敌对| 布尔值|   
  
# **六、玩家与角色相关**

## **1\. 获取指定玩家的角色实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/eb1b7875-c030-4667-9408-1b6dece89f50.undefined)

**节点功能**

获取指定玩家实体的角色实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 角色实体| 实体|   
  
## **2\. 获取角色归属的玩家实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/9e2aac43-7bad-4de1-90f1-9ed9f30665fc.undefined)

**节点功能**

获取角色实体所归属的玩家实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 角色实体| 实体|   
出参| 所属玩家实体| 实体|   
  
## **3\. 获取在场玩家实体列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/aac65f47-99e7-4a7e-a1d6-315bc2e660e1.undefined)

**节点功能**

获取在场所有玩家实体组成的列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 玩家实体列表| 实体列表|   
  
## **4\. 以实体查询GUID**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/a8b066c6-acc2-4f5a-9375-3062947bc3b8.undefined)

**节点功能**

查询指定实体的GUID

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 实体| 实体|   
出参| GUID| GUID|   
  
## **5\. 查询自身是否已入战**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/dfd402d6-f626-4b41-bbcb-49cfd4045ef9.undefined)

**节点功能**

查询该节点图关联的实体是否入战

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 是否入战| 布尔值|   
  
## **6\. 获取当前角色**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/2718a61b-26b1-4f88-88aa-8b5dfa9f8cf5.undefined)

**节点功能**

获取该玩家客户端当前控制的角色实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 角色实体| 实体|   
  
## **7\. 获得玩家客户端输入设备类型**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/28c68780-40e1-4f7a-affa-18db2ab51c81.undefined)

**节点功能**

获得玩家的客户端输入设备类型，根据用户界面的映射方式决定

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 输入设备类型| 枚举| 分为键盘鼠标、手柄、触屏  
  
## **8\. 获取玩家移动输入**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/ce684b27-7e13-4823-a087-a5394dac779a.undefined)

**节点功能**

获取当前客户端玩家移动的输入方向和输入力度

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 输入方向| 浮点数|   
出参| 输入力度| 浮点数|   
  
## **9\. 查询技能变量对应值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/ff4d29fc-bb5d-4f83-b5d5-af135f817cb0.undefined)

**节点功能**

根据技能变量配置ID查询对应的变量值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 技能变量配置ID| 配置ID|   
出参| 变量值| 浮点数|   
  
## **10\. 获取当前关键行为**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/1fa8822c-e81e-4170-a628-b7d0030c7909.undefined)

**节点功能**

获取当前关键行为记录板上所有的关键行为ID以及对应的录入时间

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 行为ID列表| 整数列表|   
出参| 录入时间列表| 浮点数列表|   
  
## **11\. 获取当前关键行为（高精度）**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/1bb351b7-0700-4afd-a150-60f0966f5c2d.undefined)

**节点功能**

获取当前关键行为记录板上所有的关键行为ID以及对应的录入时间，由于浮点数的精度问题，想要获取更高精度的录入时间应该选用此节点

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 行为ID列表| 整数列表|   
出参| 录入时间列表（s）| 整数列表|   
出参| 录入时间列表（ms）| 整数列表|   
  
## **12\. 获取当前客户端时间**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/699b6e56-1c17-470d-8860-ee9308a9f4d4.undefined)

**节点功能**

获取当前客户端的时间

如需对玩家展示节点内容，奇匠应在简介等处提前告知玩家获取客户端时间后的相关效果

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 客户端时间| 浮点数|   
  
## **13\. 获取当前客户端时间（高精度）**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/25d77ff6-7260-44ec-b973-6d9b208de81a.undefined)

**节点功能**

获取当前客户端的时间，由于浮点数的精度问题，想要获取更高精度的客户端时间应该选用此节点

如需对玩家展示节点内容，奇匠应在简介等处提前告知玩家获取客户端时间后的相关效果

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 客户端时间（s）| 整数|   
出参| 客户端时间（ms）| 整数|   
  
## **14\. 查询玩家是否正在语音聊天**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/4eb3ceea-47af-4552-b707-ff1b5a287ac2.undefined)

**节点功能**

当检测到该玩家客户端有麦克风输入时，会返回是

注意该节点必须在多人游戏(多人试玩、多人正式游玩)中逻辑才会生效，单人游戏(单人试玩、单人正式游玩)均不会生效

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 是否正在语音| 布尔值|   
  
## **15\. 根据技能实例ID获取技能配置ID**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/3c183a1e-a6d8-4cf5-a145-8854a7af2e79.undefined)

**节点功能**

根据技能实例ID获取对应的技能配置ID

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 技能实例ID| 整数|   
出参| 技能配置ID| 配置ID|   
  
## **16\. 查询指定槽位的技能实例列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/7cc78e4e-59e3-443f-893b-1905352b46f9.undefined)

**节点功能**

查询指定槽位的所有技能实例

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 技能槽位| 枚举|   
出参| 技能实例ID列表| 整数列表|   
  
## **17\. 查询指定槽位当前生效的技能实例**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/9b210001-c46f-4462-a47f-e39c6d765400.undefined)

**节点功能**

查询指定槽位当前位于前台的技能实例

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 技能槽位| 枚举|   
出参| 技能实例ID| 整数|   
  
## **18\. 以技能槽位和技能配置ID查询技能实例ID**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/0e571745-f967-4a97-af93-284de2260a32.undefined)

**节点功能**

根据技能槽位和技能配置ID查询对应的技能实例

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 技能槽位| 枚举|   
入参| 技能配置ID| 配置ID|   
出参| 技能实例ID| 整数|   
  
## **19\. 获取玩家的角色列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/f5fb54ff-b56c-482f-86d3-b5ca4e9c133e.undefined)

**节点功能**

仅经典模式可用，获取玩家队伍内的角色列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 角色列表| 实体列表|   
  
## **20\. 获取指定玩家的前台角色**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/47f0d54c-647a-4bd0-b79c-555c7565c1c4.undefined)

**节点功能**

仅经典模式可用，获取玩家队伍内的前台角色

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 角色实体| 实体|   
  
## **21\. 查询经典模式角色编号**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/3616265e-d9af-4ae3-a949-3e6d7bd37841.undefined)

**节点功能**

仅经典模式可用，查询目标角色的角色编号，可以查看附录对应具体是哪位角色[经典模式角色编号一览](/ys/ugc/tutorial//detail/mh4imrrhzdzi)

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标角色| 实体|   
出参| 角色编号| 整数|   
  
# **七、预瞄准**

## **1\. 获取指定预瞄准的基准对象**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/f9e2e465-5866-4ea9-889a-de4c30fe3836.undefined)

**节点功能**

获取指定预瞄准序号的基准对象，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 预瞄准序号| 整数|   
出参| 基准对象| 实体|   
  
## **2\. 获取预瞄结果**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/a644e60b-6142-4d92-97d8-f9f02b901784.undefined)

**节点功能**

获取指定预瞄准的命中位置、范围内位置、最优合法目标与合法目标列表，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 预瞄准序号| 整数|   
出参| 命中位置| 三维向量|   
出参| 范围内位置| 三维向量|   
出参| 最优合法目标| 实体|   
出参| 合法目标列表| 实体列表|   
  
## **3\. 获取预瞄持续时长**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/364a7523-ca68-4df3-bc0f-b51096aaecb3.undefined)

**节点功能**

获取指定预瞄准已经持续的时长（秒），仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 预瞄准序号| 整数|   
出参| 持续时长（s）| 浮点数|   
  
## **4\. 获取当前生效的预瞄准序号**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/2c3de394-9527-4dcc-a77a-ae63ed4cd0b0.undefined)

**节点功能**

获取当前技能上下文中正在生效的预瞄准序号，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 预瞄准序号| 整数|   
  
## **5\. 获取预瞄碰撞检测结果数量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/02a2b80b-3e1a-4df0-ae9b-9270fcf67735.undefined)

**节点功能**

获取指定预瞄准的碰撞检测结果数量，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 预瞄准序号| 整数|   
出参| 结果数量| 整数|   
  
## **6\. 获取预瞄射线命中信息**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/151b4ec4-20e6-4cc8-9a2f-c3b52ab7617c.undefined)

**节点功能**

获取指定预瞄准的射线命中信息，包含命中位置与命中实体，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 预瞄准序号| 整数|   
出参| 命中位置| 三维向量|   
出参| 命中实体| 实体|   
  
## **7\. 获取预瞄准摇杆是否处于死区**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/565b63c4-3708-4b3e-b70f-5640bdbcca9c.undefined)

**节点功能**

获取指定预瞄准的输入摇杆是否处于死区，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 预瞄准序号| 整数|   
出参| 是否处于死区| 布尔值|   
  
## **8\. 查询预瞄准结束原因**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/6e374acf-55a6-4ef1-a1a8-ca18070b5364.undefined)

**节点功能**

查询指定预瞄准的结束原因（无/完成/取消），仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 预瞄准序号| 整数|   
出参| 结束原因| 枚举|   
  
# **八、光标**

## **1\. 获取光标是否激活**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/50246356-275d-473e-813c-257d19e3dd28.undefined)

**节点功能**

获取本机持久光标是否处于激活状态，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 是否激活| 布尔值|   
  
## **2\. 获取光标命中结果**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/df25aa26-02b5-4615-83cb-eaec4fad0229.undefined)

**节点功能**

获取本机持久光标的命中结果，包含命中实体列表、命中位置列表与命中数量，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 命中实体列表| 实体列表|   
出参| 命中位置列表| 三维向量列表|   
出参| 命中数量| 整数|   
  
## **3\. 获取光标屏幕坐标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/e28ec495-3f8c-419e-b3ad-5f3c2eb418f7.undefined)

**节点功能**

获取本机持久光标的屏幕坐标X与Y，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 屏幕X| 浮点数|   
出参| 屏幕Y| 浮点数|   
  
## **4\. 获取光标视口坐标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/b1aaa1c6-d42e-48ed-b30c-44a0238c5c26.undefined)

**节点功能**

获取本机持久光标的视口坐标X与Y，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 视口X| 浮点数|   
出参| 视口Y| 浮点数|   
  
# **九、挂接点**

## **1\. 获取目标挂接点旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/7753b0fc-c576-4b28-b3a5-74d6a748b081.undefined)

**节点功能**

获取指定目标实体上对应挂接点名称的挂接点旋转

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 挂接点名称| 字符串|   
出参| 挂接点旋转| 三维向量|   
  
# **十、触发器**

## **1\. 获取碰撞触发器内所有实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/c4314887-bbf3-4e2f-8143-a2f2b3d677ea.undefined)

**节点功能**

获取目标实体上碰撞触发器组件中特定序号对应的碰撞触发器内的所有实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 触发器序号| 整数|   
出参| 实体列表| 实体列表|   
  
# **十一、射线**

## **1\. 获取射线检测结果**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/487af2c8-82a0-45eb-b64d-bd34807c22dd.undefined)

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
  
# **十二、扫描**

## **1\. 获取扫描组件当前扫描到的实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/e6605f4d-e1c8-4298-97cd-fe26c17b7644.undefined)

**节点功能**

获取扫描组件当前扫描到的实体，指扫描状态为“激活状态”的实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 对应实体| 实体|   
出参| 扫描标签配置ID| 配置ID|   
  
## **2\. 获取扫描组件可扫描的所有合法对象**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/61fb73fa-bc99-44df-ad0b-f2b28d594a38.undefined)

**节点功能**

获取扫描组件可扫描的所有合法对象，此处的合法对象指代所有携带扫描组件且过滤器返回为“是”的单位，与单位的可扫描状态无关

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 对象列表| 实体列表|   
  
## **3\. 获取实体扫描状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/3c5f5eef-d349-413f-8859-242f2ae18895.undefined)

**节点功能**

获取实体扫描状态

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 扫描状态| 枚举| 分为不可见、当前扫描目标、候选目标、不满足条件  
  
## **4\. 获取实体当前生效的扫描标签**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/b1cb813a-455b-463c-a40a-f7dd0060d454.undefined)

**节点功能**

获取目标实体当前生效的扫描标签

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 扫描标签配置ID| 配置ID|   
  
# **十三、字典**

## **1\. 以键查询字典值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/cb7b3e0e-607a-4b8c-a266-95b146aa75c9.undefined)

**节点功能**

根据键查询字典中对应的值，如果键不存在，则返回类型默认值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
入参| 键| 泛型|   
出参| 值| 泛型|   
  
## **2\. 查询字典是否包含特定键**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/b0139886-7609-48ca-8a95-24a9ca0d80b9.undefined)

**节点功能**

查询指定字典是否包含特定的键

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
入参| 键| 泛型|   
出参| 是否包含| 布尔值|   
  
## **3\. 查询字典是否包含特定值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/4066ac10-341f-480a-b5b5-f5a8ae6057d7.undefined)

**节点功能**

查询指定字典是否包含特定的值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
入参| 值| 泛型|   
出参| 是否包含| 布尔值|   
  
## **4\. 查询字典长度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/c02d8ff5-ce6d-45ca-9c88-af4a5244200e.undefined)

**节点功能**

查询字典中键值对的数量

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
出参| 长度| 整数|   
  
## **5\. 获取字典中值组成的列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/24c75b1d-69b3-4bb9-b2bc-d3501d3b73ab.undefined)

**节点功能**

获取字典中所有值组成的列表。由于字典中键值对是无序排列的，所以取出的值列表也不一定按照其插入顺序排列

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
出参| 值列表| 泛型|   
  
## **6\. 获取字典中键组成的列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/eaa91849-efa3-476e-baeb-6f14368a85ca.undefined)

**节点功能**

获取字典中所有键组成的列表。由于字典中键值对是无序排列的，所以取出的键列表也不一定按照其插入顺序排列

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
出参| 键列表| 泛型|   
  
# **十四、单位状态**

## **1\. 实体是否携带指定单位状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh2crq9jzueq/0312b2e1-ffff-44a5-a0a1-f6fe707c1b5b.undefined)

**节点功能**

查询目标实体是否携带指定的单位状态

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 单位状态| 配置ID|   
出参| 是否携带| 布尔值|
