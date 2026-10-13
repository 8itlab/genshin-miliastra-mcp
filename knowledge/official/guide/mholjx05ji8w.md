# 节点介绍/客户端节点/角色技能节点图/查询节点

(来源：原神千星奇域·综合指南，页面 ID mholjx05ji8w)

# **一、列表相关**  
  
## **1\. 获取列表对应值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/d35acec3-e2b4-4325-9a0f-c5019dcac412.undefined)

**节点功能**

返回列表中指定序号对应的值。列表中序号从0开始

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 序号| 整数|   
入参| 数据列表| 泛型|   
出参| 结果| 泛型|   
  
## **2\. 获取列表长度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/71332447-5d0c-4710-988a-0fb2b8cf4fe9.undefined)

**节点功能**

获取列表长度（列表中的元素个数）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入列表| 泛型|   
出参| 长度| 整数|   
  
## **3\. 获取列表最大值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/8a94cb47-5e96-4b05-a972-de5c630ce9b5.undefined)

**节点功能**

仅对浮点数列表和整数列表有意义，返回列表中的最大值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 列表| 泛型|   
出参| 最大值| 泛型|   
  
## **4\. 获取列表最小值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/9b8ae8b3-b0dd-4e64-8cb3-00ac387833ca.undefined)

**节点功能**

仅对浮点数列表和整数列表有意义，返回列表中的最小值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 列表| 泛型|   
出参| 最小值| 泛型|   
  
## **5\. 获取实体类型列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/82892fab-475b-4122-8dba-bd7d6baea8dc.undefined)

**节点功能**

将所需的实体类型拼装为一个列表。类型分为关卡、物件、玩家、角色、造物

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 列表| 枚举列表|   
  
## **6\. 列表是否包含该值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/ac65761e-bcfd-4314-b533-707b4fe492a8.undefined)

**节点功能**

返回列表中是否包含指定值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 值| 泛型|   
入参| 列表| 泛型|   
出参| 结果| 布尔值|   
  
## **7\. 获取射线筛选类型列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/5fd831bd-aa31-40f5-9d89-17d54ec06588.undefined)

**节点功能**

将所需的射线筛选类型拼装为一个列表。可筛选项有受击盒、场景、物件自身碰撞

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 列表| 枚举列表|   
  
# **二、自定义变量**

## **1\. 获取自定义变量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/9f509487-79ed-4313-a7cc-3504e4298a17.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/b7ad67e9-c130-4142-92e1-53db6d132110.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/3ff2d9de-617c-4169-b1e1-4df8c520c7df.undefined)

**节点功能**

根据GUID查询实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| GUID| GUID|   
出参| 实体| 实体|   
  
## **2\. 获取实体位置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/8064821d-1cfb-4069-934a-a4322ca99356.undefined)

**节点功能**

获取指定实体的位置

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 实体| 实体|   
出参| 位置| 三维向量|   
  
## **3\. 获取实体旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/5959277f-d798-44c9-88df-65bb704cbc80.undefined)

**节点功能**

获取指定实体以欧拉角表示的旋转

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 实体| 实体|   
出参| 旋转| 三维向量|   
  
## **4\. 获取自身实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/e920bc78-91d7-4e14-8234-314c8500861f.undefined)

**节点功能**

返回该节点图所关联的实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 自身实体| 实体|   
  
## **5\. 获取目标实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/92dd1e3a-a6ca-4beb-bdaf-a1c03350cb15.undefined)

**节点功能**

获取目标实体，根据过滤器节点图被引用的功能模块不同，其指代含义会有区别

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 目标实体| 实体|   
  
## **6\. 获取单位攻击目标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/fb74bc9b-e848-463c-bf6c-d5d5bbc80666.undefined)

**节点功能**

获取单位实体当前正在攻击的目标实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 单位实体| 实体|   
出参| 攻击目标实体| 实体|   
  
## **7\. 获取目标挂接点位置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/444b5f1b-4028-4859-8224-956d3b1a914b.undefined)

**节点功能**

获取指定目标实体上对应挂接点名称的挂接点位置

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 挂接点名称| 字符串|   
出参| 挂接点位置| 三维向量|   
  
## **8\. 获取目标挂接点旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/84ad30a7-b172-44af-8b56-320f125c9c62.undefined)

**节点功能**

获取指定目标实体上对应挂接点名称的挂接点旋转

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 挂接点名称| 字符串|   
出参| 挂接点旋转| 三维向量|   
  
## **9\. 获取实体的类型**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/b941dbb2-f079-4a8a-a53d-e80482607320.undefined)

**节点功能**

获取指定实体的类型

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 实体类型| 枚举|   
  
## **10\. 筛选球体范围内的实体列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/1d43a182-6e27-4a56-91a9-548e99327eeb.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/2a727bbc-6487-427a-8847-133df5e12078.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/5e154c1c-1b38-41a7-b097-363e817f0edc.undefined)

**节点功能**

查询指定实体是否在场

注意角色实体即使处于倒下状态，仍然认为在场

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 是否在场| 布尔值|   
  
## **13\. 查询复杂造物的预设状态值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/119b6477-8a6a-4819-9350-50477ec97c3b.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/f9f35ac6-dffd-4d73-a0ec-036e18270840.undefined)

**节点功能**

查询目标实体的阵营

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 阵营| 阵营|   
  
## **2\. 查询阵营是否敌对**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/1facc5d0-fbd2-4184-8070-77919c9b968c.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/c28c70ae-e4f3-477e-bad7-0021513c75e0.undefined)

**节点功能**

获取指定玩家实体的角色实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 角色实体| 实体|   
  
## **2\. 获取角色归属的玩家实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/a3293ea1-a8b1-45f1-a775-ecb5cbc5d3f9.undefined)

**节点功能**

获取角色实体所归属的玩家实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 角色实体| 实体|   
出参| 所属玩家实体| 实体|   
  
## **3\. 获取在场玩家实体列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/d57f2028-9b0e-4b1b-82dc-f76c64af7be4.undefined)

**节点功能**

获取在场所有玩家实体组成的列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 玩家实体列表| 实体列表|   
  
## **4\. 以实体查询GUID**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/f5279498-a4ed-4fe7-833c-13553150c780.undefined)

**节点功能**

查询指定实体的GUID

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 实体| 实体|   
出参| GUID| GUID|   
  
## **5\. 查询自身是否已入战**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/b928c332-0be4-4e5c-afbd-f307dcb3dc6e.undefined)

**节点功能**

查询该节点图关联的实体是否入战

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 是否入战| 布尔值|   
  
## **6\. 获取当前角色**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/f23107bc-bfaf-4aeb-a73b-cfa24d62811d.undefined)

**节点功能**

获取该玩家客户端当前控制的角色实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 角色实体| 实体|   
  
## **7\. 获得玩家客户端输入设备类型**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/4da412c2-d34a-4699-ab2d-54b3fb41bf8a.undefined)

**节点功能**

获得玩家的客户端输入设备类型，根据用户界面的映射方式决定

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 输入设备类型| 枚举| 分为键盘鼠标、手柄、触屏  
  
## **8\. 获取玩家移动输入**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/fc39ad70-f65c-4d42-8389-a20e81cd8e9e.undefined)

**节点功能**

获取当前客户端玩家移动的输入方向和输入力度

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 输入方向| 浮点数|   
出参| 输入力度| 浮点数|   
  
## **9\. 查询技能变量对应值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/ad414f42-2da0-419c-ada7-fd937c618523.undefined)

**节点功能**

根据技能变量配置ID查询对应的变量值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 技能变量配置ID| 配置ID|   
出参| 变量值| 浮点数|   
  
## **10\. 获取当前关键行为**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/c14151cc-b518-41c7-a40f-0c988752bc1b.undefined)

**节点功能**

获取当前关键行为记录板上所有的关键行为ID以及对应的录入时间

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 行为ID列表| 整数列表|   
出参| 录入时间列表| 浮点数列表|   
  
## **11\. 获取当前关键行为（高精度）**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/e5ddd461-6a52-495c-a09a-3ded0c97956e.undefined)

**节点功能**

获取当前关键行为记录板上所有的关键行为ID以及对应的录入时间，由于浮点数的精度问题，想要获取更高精度的录入时间应该选用此节点

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 行为ID列表| 整数列表|   
出参| 录入时间列表（s）| 整数列表|   
出参| 录入时间列表（ms）| 整数列表|   
  
## **12\. 获取当前客户端时间**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/e731253d-718f-4955-956e-a0325ef9ec1e.undefined)

**节点功能**

获取当前客户端的时间

如需对玩家展示节点内容，奇匠应在简介等处提前告知玩家获取客户端时间后的相关效果

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 客户端时间| 浮点数|   
  
## **13\. 获取当前客户端时间（高精度）**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/39658376-b5ea-441a-a32d-3189812a47ce.undefined)

**节点功能**

获取当前客户端的时间，由于浮点数的精度问题，想要获取更高精度的客户端时间应该选用此节点

如需对玩家展示节点内容，奇匠应在简介等处提前告知玩家获取客户端时间后的相关效果

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 客户端时间（s）| 整数|   
出参| 客户端时间（ms）| 整数|   
  
## **14\. 查询玩家是否正在语音聊天**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/ed11c5a6-dbe8-4235-89ce-11ad9c81e984.undefined)

**节点功能**

当检测到该玩家客户端有麦克风输入时，会返回是

注意该节点必须在多人游戏(多人试玩、多人正式游玩)中逻辑才会生效，单人游戏(单人试玩、单人正式游玩)均不会生效

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 是否正在语音| 布尔值|   
  
## **15\. 根据技能实例ID获取技能配置ID**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/dd6407a2-fb5d-486c-96b0-5b9744c7b41e.undefined)

**节点功能**

根据技能实例ID获取对应的技能配置ID

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 技能实例ID| 整数|   
出参| 技能配置ID| 配置ID|   
  
## **16\. 查询指定槽位的技能实例列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/3bcf32df-28f4-485a-8e10-2428fc5dceb5.undefined)

**节点功能**

查询指定槽位的所有技能实例

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 技能槽位| 枚举|   
出参| 技能实例ID列表| 整数列表|   
  
## **17\. 查询指定槽位当前生效的技能实例**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/48e76197-ade8-4f2c-be2a-3dc1d4416f16.undefined)

**节点功能**

查询指定槽位当前位于前台的技能实例

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 技能槽位| 枚举|   
出参| 技能实例ID| 整数|   
  
## **18\. 以技能槽位和技能配置ID查询技能实例ID**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/ff6563ad-045e-401f-922f-d1b4bfa53467.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/b11702fe-f499-4d62-a518-af18c12706b1.undefined)

**节点功能**

获取指定预瞄准序号的基准对象，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 预瞄准序号| 整数|   
出参| 基准对象| 实体|   
  
## **2\. 获取预瞄结果**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/049b86f0-4446-475c-9218-ffad4110a793.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/f84c1f32-1fef-4f58-817e-7948b8694c17.undefined)

**节点功能**

获取指定预瞄准已经持续的时长（秒），仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 预瞄准序号| 整数|   
出参| 持续时长（s）| 浮点数|   
  
## **4\. 获取当前生效的预瞄准序号**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/f71b1d7d-9919-4a74-97bb-84712850cc6e.undefined)

**节点功能**

获取当前技能上下文中正在生效的预瞄准序号，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 预瞄准序号| 整数|   
  
## **5\. 获取预瞄碰撞检测结果数量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/60c7ad77-da69-46cc-8fe1-00198e18aa2b.undefined)

**节点功能**

获取指定预瞄准的碰撞检测结果数量，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 预瞄准序号| 整数|   
出参| 结果数量| 整数|   
  
## **6\. 获取预瞄射线命中信息**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/9e0af743-b889-4ce4-8218-f0041fc612b7.undefined)

**节点功能**

获取指定预瞄准的射线命中信息，包含命中位置与命中实体，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 预瞄准序号| 整数|   
出参| 命中位置| 三维向量|   
出参| 命中实体| 实体|   
  
## **7\. 获取预瞄准摇杆是否处于死区**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/5a6153d6-31a0-48ec-ad95-4345036d8ba0.undefined)

**节点功能**

获取指定预瞄准的输入摇杆是否处于死区，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 预瞄准序号| 整数|   
出参| 是否处于死区| 布尔值|   
  
## **8\. 查询预瞄准结束原因**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/110ea7e1-0250-4dcc-833d-e7f3b692229f.undefined)

**节点功能**

查询指定预瞄准的结束原因（无/完成/取消），仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 预瞄准序号| 整数|   
出参| 结束原因| 枚举|   
  
# **八、光标**

## **1\. 获取光标是否激活**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/2671e1b4-a15a-4a83-8ad4-b6ca243197fc.undefined)

**节点功能**

获取本机持久光标是否处于激活状态，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 是否激活| 布尔值|   
  
## **2\. 获取光标命中结果**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/91c88030-761e-4551-9cdc-ddc1501d91db.undefined)

**节点功能**

获取本机持久光标的命中结果，包含命中实体列表、命中位置列表与命中数量，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 命中实体列表| 实体列表|   
出参| 命中位置列表| 三维向量列表|   
出参| 命中数量| 整数|   
  
## **3\. 获取光标屏幕坐标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/97bb5ee3-9ada-4951-ae29-33d2274dad38.undefined)

**节点功能**

获取本机持久光标的屏幕坐标X与Y，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 屏幕X| 浮点数|   
出参| 屏幕Y| 浮点数|   
  
## **4\. 获取光标视口坐标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/8310d062-85c0-472d-a722-5ed49ac5a69b.undefined)

**节点功能**

获取本机持久光标的视口坐标X与Y，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 视口X| 浮点数|   
出参| 视口Y| 浮点数|   
  
# **九、标签**

## **1\. 获取实体的单位标签列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/2c2bd111-b9d8-47ba-a79a-06590a32b290.undefined)

**节点功能**

获取目标实体上携带的所有单位标签组成的列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 列表| 整数列表|   
  
## **2\. 获取单位标签的实体列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/9da03b82-0840-460c-a673-ab24b57e9400.undefined)

**节点功能**

获取在场所有携带该单位标签的实体列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 单位标签索引| 整数|   
出参| 实体列表| 实体列表|   
  
# **十、通用**

## **1\. 获取局部变量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/8e7011e5-241d-44a5-a733-61237b29ed29.undefined)

**节点功能**

获取特定局部变量的变量值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 变量名| 字符串|   
出参| 变量值| 泛型|   
  
# **十一、自定义仇恨**

## **1\. 获取指定实体的仇恨目标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/4478e95d-fec8-4d69-9f91-4de1a6804acb.undefined)

**节点功能**

仅自定义仇恨模式可用

获取指定实体的仇恨目标

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 指定实体| 实体|   
出参| 仇恨目标| 实体|   
  
## **2\. 获取指定实体的仇恨列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/6bc98aa0-5c08-4359-ad52-a280ea605f47.undefined)

**节点功能**

仅自定义仇恨模式可用

获取指定实体的仇恨列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 指定实体| 实体|   
出参| 仇恨列表| 实体列表|   
  
## **3\. 查询指定实体是否入战**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/a67a6c13-0776-4efe-aa17-ea582dfd0a83.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/f090a45f-f9b5-4526-9713-cf97f9ed38cc.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/8402ca1c-b402-47e7-b74f-bfadfbe5c7b2.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/5dbefa30-ea5b-4f4d-bec9-65d37e663444.undefined)

**节点功能**

获取扫描组件当前扫描到的实体，指扫描状态为“激活状态”的实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 对应实体| 实体|   
出参| 扫描标签配置ID| 配置ID|   
  
## **2\. 获取扫描组件可扫描的所有合法对象**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/7889f9c7-aadd-4cdc-8653-d5fccbb97aae.undefined)

**节点功能**

获取扫描组件可扫描的所有合法对象，此处的合法对象指代所有携带扫描组件且过滤器返回为“是”的单位，与单位的可扫描状态无关

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 对象列表| 实体列表|   
  
## **3\. 获取实体扫描状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/be34c280-6259-445a-b434-3ff4b7f0b8e1.undefined)

**节点功能**

获取实体扫描状态

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 扫描状态| 枚举| 分为不可见、当前扫描目标、候选目标、不满足条件  
  
## **4\. 获取实体当前生效的扫描标签**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/6019b050-dd6f-43c3-8dd5-05b6139d7a31.undefined)

**节点功能**

获取目标实体当前生效的扫描标签

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 扫描标签配置ID| 配置ID|   
  
# **十五、字典**

## **1\. 以键查询字典值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/7b457ee5-e20c-4d9a-9bb4-88bf0ce873c9.undefined)

**节点功能**

根据键查询字典中对应的值，如果键不存在，则返回类型默认值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
入参| 键| 泛型|   
出参| 值| 泛型|   
  
## **2\. 查询字典是否包含特定键**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/23597638-f234-4683-9a71-7917a5ed7eef.undefined)

**节点功能**

查询指定字典是否包含特定的键

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
入参| 键| 泛型|   
出参| 是否包含| 布尔值|   
  
## **3\. 查询字典是否包含特定值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/929de8fa-0ded-44c6-b21d-72581a89a1b2.undefined)

**节点功能**

查询指定字典是否包含特定的值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
入参| 值| 泛型|   
出参| 是否包含| 布尔值|   
  
## **4\. 查询字典长度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/6a43eccb-0db5-4e5f-9a1a-72c7cbb801d6.undefined)

**节点功能**

查询字典中键值对的数量

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
出参| 长度| 整数|   
  
## **5\. 获取字典中值组成的列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/85279210-4ec8-4fc6-a030-62d5801af911.undefined)

**节点功能**

获取字典中所有值组成的列表。由于字典中键值对是无序排列的，所以取出的值列表也不一定按照其插入顺序排列

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
出参| 值列表| 泛型|   
  
## **6\. 获取字典中键组成的列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/32bd24e8-2db4-4d33-a800-447099212fcf.undefined)

**节点功能**

获取字典中所有键组成的列表。由于字典中键值对是无序排列的，所以取出的键列表也不一定按照其插入顺序排列

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
出参| 键列表| 泛型|   
  
# **十六、单位状态**

## **1\. 实体是否携带指定单位状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mholjx05ji8w/ace07e4c-06e9-4b9d-ba15-6ecf1726c601.undefined)

**节点功能**

查询目标实体是否携带指定的单位状态

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 单位状态| 配置ID|   
出参| 是否携带| 布尔值|
