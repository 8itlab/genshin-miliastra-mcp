# 节点介绍/客户端节点/角色操控技能节点图/查询节点

(来源：原神千星奇域·综合指南，页面 ID mh65asiyhv2k)

# **一、列表相关**

## **1\. 获取列表对应值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/3e00e200-7eec-40af-b453-7c3a27fa2fdc.undefined)

**节点功能**

返回列表中指定序号对应的值。列表中序号从0开始

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 序号| 整数|   
入参| 数据列表| 泛型|   
出参| 结果| 泛型|   
  
## **2\. 获取列表长度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/3c3a71b2-dc69-4646-837d-38884d9720c1.undefined)

**节点功能**

获取列表长度（列表中的元素个数）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入列表| 泛型|   
出参| 长度| 整数|   
  
## **3\. 获取列表最大值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/388e6bfc-ed63-4408-af04-1106306ff43d.undefined)

**节点功能**

仅对浮点数列表和整数列表有意义，返回列表中的最大值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 列表| 泛型|   
出参| 最大值| 泛型|   
  
## **4\. 获取列表最小值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/91fcb84f-853e-41d3-8345-9fa80f1e5b9e.undefined)

**节点功能**

仅对浮点数列表和整数列表有意义，返回列表中的最小值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 列表| 泛型|   
出参| 最小值| 泛型|   
  
## **5\. 获取实体类型列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/ade37c95-7b05-41c1-bea2-fdbe033d226d.undefined)

**节点功能**

将所需的实体类型拼装为一个列表。类型分为关卡、物件、玩家、角色、造物

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 列表| 枚举列表|   
  
## **6\. 列表是否包含该值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/bb6b44f5-75f6-408b-aa21-d9b7dbc07d23.undefined)

**节点功能**

返回列表中是否包含指定值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 值| 泛型|   
入参| 列表| 泛型|   
出参| 结果| 布尔值|   
  
## **7\. 获取射线筛选类型列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/c8304c86-3d48-4b30-addf-df172ef0e0ca.undefined)

**节点功能**

将所需的射线筛选类型拼装为一个列表。可筛选项有受击盒、场景、物件自身碰撞

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 列表| 枚举列表|   
  
# **二、自定义变量**

## **1\. 获取自定义变量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/78d18a52-936b-4f72-8513-63f33e29696f.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/e548e4ba-ce6d-4da4-9d70-bc39b966bb14.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/ebe5474c-c34b-45e1-b932-0fe67dec42fd.undefined)

**节点功能**

根据GUID查询实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| GUID| GUID|   
出参| 实体| 实体|   
  
## **2\. 获取实体位置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/8c9820a7-387d-4b2b-a29f-f2d70391197d.undefined)

**节点功能**

获取指定实体的位置

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 实体| 实体|   
出参| 位置| 三维向量|   
  
## **3\. 获取实体旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/16c9134a-44c1-4b5e-9f38-f2df6e356ced.undefined)

**节点功能**

获取指定实体以欧拉角表示的旋转

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 实体| 实体|   
出参| 旋转| 三维向量|   
  
## **4\. 获取自身实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/50716a0b-9eb2-4f7c-8a01-5817efc5cc51.undefined)

**节点功能**

返回该节点图所关联的实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 自身实体| 实体|   
  
## **5\. 获取目标实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/e6e92c86-7fbb-47e8-b96f-7bd5e9ca7c8b.undefined)

**节点功能**

获取目标实体，根据过滤器节点图被引用的功能模块不同，其指代含义会有区别

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 目标实体| 实体|   
  
## **6\. 获取单位攻击目标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/d7192ed5-12b4-418a-9c5e-ff95cfce8706.undefined)

**节点功能**

获取单位实体当前正在攻击的目标实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 单位实体| 实体|   
出参| 攻击目标实体| 实体|   
  
## **7\. 获取目标挂接点位置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/d5ba2830-0353-4290-9d85-166c5eb5f114.undefined)

**节点功能**

获取指定目标实体上对应挂接点名称的挂接点位置

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 挂接点名称| 字符串|   
出参| 挂接点位置| 三维向量|   
  
## **8\. 获取目标挂接点旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/3a05c1e2-f59c-4295-9f07-818175139c14.undefined)

**节点功能**

获取指定目标实体上对应挂接点名称的挂接点旋转

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 挂接点名称| 字符串|   
出参| 挂接点旋转| 三维向量|   
  
## **9\. 获取实体的类型**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/e21f7980-1c89-4939-b1c2-c1f4727f358b.undefined)

**节点功能**

获取指定实体的类型

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 实体类型| 枚举|   
  
## **10\. 筛选球体范围内的实体列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/590d89a7-4fc0-4fb0-b895-4b11a4a39e52.undefined)

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
  
## **11\. 筛选方形范围内的实体列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/92b1c6f1-1e50-4946-bd6d-e019739d2bc2.undefined)

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
  
## **12\. 查询实体是否在场**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/34af6c16-d005-49b9-a243-0962661c62f4.undefined)

**节点功能**

查询指定实体是否在场

注意角色实体即使处于倒下状态，仍然认为在场

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 是否在场| 布尔值|   
  
## **13\. 查询复杂造物的预设状态值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/9682b423-0d87-4a6c-8eae-24117f7dbaaa.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/3a19e77d-5f32-4070-bb2b-489af91f2d99.undefined)

**节点功能**

查询目标实体的阵营

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 阵营| 阵营|   
  
## **2\. 查询阵营是否敌对**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/60409d21-7932-4eca-bb9a-332f4cf720a9.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/e4603fc3-de5d-44d4-bfa4-338efb435ee4.undefined)

**节点功能**

获取指定玩家实体的角色实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 角色实体| 实体|   
  
## **2\. 获取角色归属的玩家实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/979383e2-be4b-4d0a-a13d-4143e61a3e05.undefined)

**节点功能**

获取角色实体所归属的玩家实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 角色实体| 实体|   
出参| 所属玩家实体| 实体|   
  
## **3\. 获取在场玩家实体列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/919c8be1-8c9d-4dfc-bcca-570aaa3494a8.undefined)

**节点功能**

获取在场所有玩家实体组成的列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 玩家实体列表| 实体列表|   
  
## **4\. 以实体查询GUID**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/9b4417eb-8c51-42e2-aa66-0a7f1d2eecdb.undefined)

**节点功能**

查询指定实体的GUID

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 实体| 实体|   
出参| GUID| GUID|   
  
## **5\. 查询自身是否已入战**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/668ccd44-a660-4248-8e6f-61929a2387ef.undefined)

**节点功能**

查询该节点图关联的实体是否入战

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 是否入战| 布尔值|   
  
## **6\. 获取当前角色**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/d49ee8bf-a91e-42b9-85cc-494f56d7845e.undefined)

**节点功能**

获取该玩家客户端当前控制的角色实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 角色实体| 实体|   
  
## **7\. 获得玩家客户端输入设备类型**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/2596cd8b-1b80-4ebf-815c-065038ad5351.undefined)

**节点功能**

获得玩家的客户端输入设备类型，根据用户界面的映射方式决定

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 输入设备类型| 枚举| 分为键盘鼠标、手柄、触屏  
  
## **8\. 获取玩家移动输入**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/75535a29-09a0-4d3c-922c-3bb78fd76267.undefined)

**节点功能**

获取当前客户端玩家移动的输入方向和输入力度

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 输入方向| 浮点数|   
出参| 输入力度| 浮点数|   
  
## **9\. 查询技能变量对应值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/a76665b7-d945-436b-9471-b3a303c206a8.undefined)

**节点功能**

根据技能变量配置ID查询对应的变量值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 技能变量配置ID| 配置ID|   
出参| 变量值| 浮点数|   
  
## **10\. 获取当前关键行为**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/82b2631a-ad52-4c70-a35e-eb7248701feb.undefined)

**节点功能**

获取当前关键行为记录板上所有的关键行为ID以及对应的录入时间

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 行为ID列表| 整数列表|   
出参| 录入时间列表| 浮点数列表|   
  
## **11\. 获取当前关键行为（高精度）**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/51f666c6-545d-47ae-858e-aea3dfcc9c75.undefined)

**节点功能**

获取当前关键行为记录板上所有的关键行为ID以及对应的录入时间，由于浮点数的精度问题，想要获取更高精度的录入时间应该选用此节点

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 行为ID列表| 整数列表|   
出参| 录入时间列表（s）| 整数列表|   
出参| 录入时间列表（ms）| 整数列表|   
  
## **12\. 获取当前客户端时间**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/71b51362-d467-4cab-a224-1efe885d475d.undefined)

**节点功能**

获取当前客户端的时间

如需对玩家展示节点内容，奇匠应在简介等处提前告知玩家获取客户端时间后的相关效果

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 客户端时间| 浮点数|   
  
## **13\. 获取当前客户端时间（高精度）**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/86f8d4bd-1997-4dd7-a5c4-ba0217fdd616.undefined)

**节点功能**

获取当前客户端的时间，由于浮点数的精度问题，想要获取更高精度的客户端时间应该选用此节点

如需对玩家展示节点内容，奇匠应在简介等处提前告知玩家获取客户端时间后的相关效果

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 客户端时间（s）| 整数|   
出参| 客户端时间（ms）| 整数|   
  
## **14\. 查询玩家是否正在语音聊天**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/3298293c-15c6-4fb2-a17d-aa7c78945678.undefined)

**节点功能**

当检测到该玩家客户端有麦克风输入时，会返回是

注意该节点必须在多人游戏(多人试玩、多人正式游玩)中逻辑才会生效，单人游戏(单人试玩、单人正式游玩)均不会生效

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 是否正在语音| 布尔值|   
  
## **15\. 根据技能实例ID获取技能配置ID**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/87f1fabb-6e2e-4ff5-b916-fb044addb763.undefined)

**节点功能**

根据技能实例ID获取对应的技能配置ID

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 技能实例ID| 整数|   
出参| 技能配置ID| 配置ID|   
  
## **16\. 查询指定槽位的技能实例列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/e8d39825-2148-4d06-9859-5699daad47af.undefined)

**节点功能**

查询指定槽位的所有技能实例

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 技能槽位| 枚举|   
出参| 技能实例ID列表| 整数列表|   
  
## **17\. 查询指定槽位当前生效的技能实例**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/6a243828-4d21-471b-9cbf-7f3d2761c5ce.undefined)

**节点功能**

查询指定槽位当前位于前台的技能实例

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 技能槽位| 枚举|   
出参| 技能实例ID| 整数|   
  
## **18\. 以技能槽位和技能配置ID查询技能实例ID**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/d3ba71e5-cbb1-4f26-b707-79a3c390ca98.undefined)

**节点功能**

根据技能槽位和技能配置ID查询对应的技能实例

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 技能槽位| 枚举|   
入参| 技能配置ID| 配置ID|   
出参| 技能实例ID| 整数|   
  
# **七、预瞄准**

## **1\. 获取指定预瞄准的基准对象**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/2b79d028-2eb9-4f86-9feb-87427c835f54.undefined)

**节点功能**

获取指定预瞄准序号的基准对象，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 预瞄准序号| 整数|   
出参| 基准对象| 实体|   
  
## **2\. 获取预瞄结果**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/6c7594f9-c432-4a54-8eee-98ee046fb337.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/359bafee-7064-44c1-bba7-f6b2ae7dee49.undefined)

**节点功能**

获取指定预瞄准已经持续的时长（秒），仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 预瞄准序号| 整数|   
出参| 持续时长（s）| 浮点数|   
  
## **4\. 获取当前生效的预瞄准序号**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/f9b218f8-c529-49e7-84c7-055dce7dd46e.undefined)

**节点功能**

获取当前技能上下文中正在生效的预瞄准序号，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 预瞄准序号| 整数|   
  
## **5\. 获取预瞄碰撞检测结果数量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/f1da5cef-8a6b-4abb-806f-b2bbb014c214.undefined)

**节点功能**

获取指定预瞄准的碰撞检测结果数量，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 预瞄准序号| 整数|   
出参| 结果数量| 整数|   
  
## **6\. 获取预瞄射线命中信息**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/78921fab-9aae-4b71-af2a-36fe99ed6510.undefined)

**节点功能**

获取指定预瞄准的射线命中信息，包含命中位置与命中实体，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 预瞄准序号| 整数|   
出参| 命中位置| 三维向量|   
出参| 命中实体| 实体|   
  
## **7\. 获取预瞄准摇杆是否处于死区**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/e6d9f701-54cb-4a29-96be-abe716d2d236.undefined)

**节点功能**

获取指定预瞄准的输入摇杆是否处于死区，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 预瞄准序号| 整数|   
出参| 是否处于死区| 布尔值|   
  
## **8\. 查询预瞄准结束原因**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/d7766592-ee34-410f-8b29-f28f01089238.undefined)

**节点功能**

查询指定预瞄准的结束原因（无/完成/取消），仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 预瞄准序号| 整数|   
出参| 结束原因| 枚举|   
  
# **八、光标**

## **1\. 获取光标是否激活**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/e09143e7-85e3-4c71-a259-b5a781ff66d7.undefined)

**节点功能**

获取本机持久光标是否处于激活状态，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 是否激活| 布尔值|   
  
## **2\. 获取光标命中结果**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/896834d1-19bb-4f20-bde9-a7bb2099b80b.undefined)

**节点功能**

获取本机持久光标的命中结果，包含命中实体列表、命中位置列表与命中数量，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 命中实体列表| 实体列表|   
出参| 命中位置列表| 三维向量列表|   
出参| 命中数量| 整数|   
  
## **3\. 获取光标屏幕坐标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/5375c91c-c46e-4181-b83f-8a943765b7c5.undefined)

**节点功能**

获取本机持久光标的屏幕坐标X与Y，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 屏幕X| 浮点数|   
出参| 屏幕Y| 浮点数|   
  
## **4\. 获取光标视口坐标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/c41d2101-8661-4f3d-b368-04f48037de85.undefined)

**节点功能**

获取本机持久光标的视口坐标X与Y，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 视口X| 浮点数|   
出参| 视口Y| 浮点数|   
  
# **九、标签**

## **1\. 获取实体的单位标签列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/cce70d72-a828-458c-bbc4-84efa9f341fb.undefined)

**节点功能**

获取目标实体上携带的所有单位标签组成的列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 列表| 整数列表|   
  
## **2\. 获取单位标签的实体列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/045b7a65-f9d9-4a47-9acd-063135a1154e.undefined)

**节点功能**

获取在场所有携带该单位标签的实体列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 单位标签索引| 整数|   
出参| 实体列表| 实体列表|   
  
# **十、通用**

## **1\. 获取局部变量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/7225c7a1-86bf-4aee-998e-4e959020bb3f.undefined)

**节点功能**

获取特定局部变量的变量值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 变量名| 字符串|   
出参| 变量值| 泛型|   
  
# **十一、自定义仇恨**

## **1\. 获取指定实体的仇恨目标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/8188b7cb-eb40-4279-93c6-d0b71ff753ba.undefined)

**节点功能**

仅自定义仇恨模式可用

获取指定实体的仇恨目标

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 指定实体| 实体|   
出参| 仇恨目标| 实体|   
  
## **2\. 获取指定实体的仇恨列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/e663d4ef-a80d-4490-99dc-4cebda373ec4.undefined)

**节点功能**

仅自定义仇恨模式可用

获取指定实体的仇恨列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 指定实体| 实体|   
出参| 仇恨列表| 实体列表|   
  
## **3\. 查询指定实体是否入战**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/b342ae9f-aafd-4d9b-af11-52420740cdde.undefined)

**节点功能**

仅自定义仇恨模式可用

查询指定实体是否已经入战

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 是否入战| 布尔值|   
  
# **十二、触发器**

## **1\. 获取碰撞触发器内所有实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/97c03962-3408-423f-bfee-e277c0a03694.undefined)

**节点功能**

获取目标实体上碰撞触发器组件中特定序号对应的碰撞触发器内的所有实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 触发器序号| 整数|   
出参| 实体列表| 实体列表|   
  
# **十三、射线**

## **1\. 获取射线检测结果**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/e0ad0757-bb8a-4502-bf46-3011fe06b92a.undefined)

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
  
# **十四、扫描**

## **1\. 获取扫描组件当前扫描到的实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/01cce1d0-fe46-422e-983e-1168923dde71.undefined)

**节点功能**

获取扫描组件当前扫描到的实体，指扫描状态为“激活状态”的实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 对应实体| 实体|   
出参| 扫描标签配置ID| 配置ID|   
  
## **2\. 获取扫描组件可扫描的所有合法对象**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/e9d3fefc-c87b-4ad4-8cd0-55dbacdb6ca4.undefined)

**节点功能**

获取扫描组件可扫描的所有合法对象，此处的合法对象指代所有携带扫描组件且过滤器返回为“是”的单位，与单位的可扫描状态无关

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 对象列表| 实体列表|   
  
## **3\. 获取实体扫描状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/02109edc-2a87-4dd3-ba97-c7bfd0b72e16.undefined)

**节点功能**

获取实体扫描状态

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 扫描状态| 枚举| 分为不可见、当前扫描目标、候选目标、不满足条件  
  
## **4\. 获取实体当前生效的扫描标签**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/125a9a67-b23d-47b3-a101-6cc175af9fdd.undefined)

**节点功能**

获取目标实体当前生效的扫描标签

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 扫描标签配置ID| 配置ID|   
  
# **十五、字典**

## **1\. 以键查询字典值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/e1c0ff67-5119-4e51-947f-6a8bbbd46c0f.undefined)

**节点功能**

根据键查询字典中对应的值，如果键不存在，则返回类型默认值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
入参| 键| 泛型|   
出参| 值| 泛型|   
  
## **2\. 查询字典是否包含特定键**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/c14690ec-5736-4255-8274-42e4fb326dcb.undefined)

**节点功能**

查询指定字典是否包含特定的键

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
入参| 键| 泛型|   
出参| 是否包含| 布尔值|   
  
## **3\. 查询字典是否包含特定值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/f145bbf2-861e-438e-a3c5-f0d25042edab.undefined)

**节点功能**

查询指定字典是否包含特定的值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
入参| 值| 泛型|   
出参| 是否包含| 布尔值|   
  
## **4\. 查询字典长度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/b431457c-9ee3-4b3f-a236-7ff4484feb85.undefined)

**节点功能**

查询字典中键值对的数量

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
出参| 长度| 整数|   
  
## **5\. 获取字典中值组成的列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/2ed83b01-eea7-486a-9fea-47c3257792d6.undefined)

**节点功能**

获取字典中所有值组成的列表。由于字典中键值对是无序排列的，所以取出的值列表也不一定按照其插入顺序排列

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
出参| 值列表| 泛型|   
  
## **6\. 获取字典中键组成的列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/9b22cc76-16a3-4230-be9a-e1334c33416b.undefined)

**节点功能**

获取字典中所有键组成的列表。由于字典中键值对是无序排列的，所以取出的键列表也不一定按照其插入顺序排列

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
出参| 键列表| 泛型|   
  
# **十六、单位状态**

## **1\. 实体是否携带指定单位状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/81d5e113-8e0f-4803-85f0-f2243bac1c45.undefined)

**节点功能**

查询目标实体是否携带指定的单位状态

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 单位状态| 配置ID|   
出参| 是否携带| 布尔值|   
  
# **十七、操控运动器**

## **1\. 获取当前激活操控运动器列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/8bd4fc9b-4d28-4441-8f87-8567c716a91c.undefined)

**节点功能**

获取当前激活操控运动器列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 操控运动器列表| 实体列表|   
  
## **2\. 获取当前跟随操控运动器**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/202a3dc2-a38f-4ffb-bcf7-b9764301ad81.undefined)

**节点功能**

获取当前跟随操控运动器

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 跟随操控运动器| 实体|   
  
## **3\. 获取操控运动器运动参数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/53416311-2379-4654-bd53-e2c706fa2c7b.undefined)

**节点功能**

获取指定操控运动器的运动参数，包含临时运动参数。临时值的添加将在下一帧生效，因此无法在当前执行流中通过获取节点查到值的变化。

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 操控运动器| 实体|   
出参| 前进加速度| 浮点数|   
出参| 后退加速度| 浮点数|   
出参| 转向速率| 浮点数|   
出参| 基础阻力减速度| 浮点数|   
出参| 阻力系数| 浮点数|   
出参| 最大前进速度| 浮点数|   
出参| 最大后退速度| 浮点数|   
  
## **4\. 获取操控运动器当前速度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/3155a572-fd5d-43bf-add2-cfc8aae61125.undefined)

**节点功能**

获取指定操控运动器的当前速度（速度大小及单位方向向量）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 操控运动器| 实体|   
出参| 速度大小| 浮点数|   
出参| 速度方向| 三维向量|   
  
## **5\. 获取操控运动器前向**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/9d08134f-7e05-4306-9e04-94911e6ca722.undefined)

**节点功能**

获取指定操控运动器的前向方向向量

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 操控运动器| 实体|   
出参| 前向| 三维向量|   
  
## **6\. 获取操控运动器目标转向方向**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/1cc2b6ca-5836-47f3-9be9-9624fbedb942.undefined)

**节点功能**

获取操控运动器目标转向方向（移动轮盘输入后，转换成操控运动器的目标转向）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 操控运动器| 实体|   
出参| 目标转向方向| 三维向量|   
  
## **7\. 获取操控运动器是否接地**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh65asiyhv2k/d05d6832-9767-4aa8-ae22-124173cbe817.undefined)

**节点功能**

获取指定操控运动器当前是否接地

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标操控运动器| 实体|   
出参| 是否接地| 布尔值|
