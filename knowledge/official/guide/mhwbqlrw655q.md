# 节点介绍/服务器节点/查询节点

(来源：原神千星奇域·综合指南，页面 ID mhwbqlrw655q)

# **一、通用**  
  
## **1\. 获取局部变量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/80612a92-03b8-4133-870e-9239a06de911.undefined)

**节点功能**

可以获取局部变量，也可以设置该局部变量的【初始值】

设置【初始值】以后，出参的【值】输出即为输入的【初始值】

当出参【局部变量】与执行节点【设置局部变量】的入参【局部变量】连接后，执行节点【设置局部变量】的入参【值】会覆写该查询节点的出参【值】，再次使用【获取局部变量】节点时，出参【值】为覆写后的值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 初始值| 泛型| 可以设置局部变量的初始默认值  
出参| 局部变量| 局部变量| 存储数据的载体  
出参| 值| 泛型| 未被覆写时，该值等于初始值，被覆写后，该值等于被覆写后的值  
  
## **2\. 查询对局游玩方式及人数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/229c6265-d82f-4af0-b4a8-67634dd01f17.undefined)

**节点功能**

查询进入对局的理论人数，即参与匹配或开房间的人数和进入对局的方式

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 游玩人数| 整数|   
出参| 游玩方式| 枚举| 分为试玩、房间游玩、匹配游玩  
  
# **二、数学**

## **1\. 获取随机浮点数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/8fdc4985-48da-4d22-b72e-001c4511809a.undefined)

**节点功能**

获取一个大于等于下限，小于等于上限的随机浮点数。注意该节点生成的随机数包含上下限

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 下限| 浮点数|   
入参| 上限| 浮点数|   
出参| 结果| 浮点数|   
  
## **2\. 权重随机**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/5fa713e7-9f87-44f2-8fc6-6b5ea15b9a3b.undefined)

**节点功能**

输入一组权重组成的权重列表，按照权重随机选择其中的一个序号

例如：权重列表为{10，20，66，4}，那么此节点分别由10%、20%、66%、4%的概率输出0、1、2、3

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 权重列表| 整数列表|   
出参| 权重序号| 整数|   
  
## **3\. 圆周率**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/420384ee-27dd-44f4-a76a-eee6d22ac3b8.undefined)

**节点功能**

返回圆周率π的近似值，约为3.142

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 圆周率（π）| 浮点数|   
  
## **4\. 三维向量：零向量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/00b27ddf-5943-4854-a45f-751c5e72063f.undefined)

**节点功能**

返回(0,0,0)

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| (0,0,0)| 三维向量|   
  
## **5\. 三维向量：上方**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/f213ca01-9973-4c90-8716-18a60cfd59c6.undefined)

**节点功能**

返回(0,1,0)

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| (0,1,0)| 三维向量|   
  
## **6\. 三维向量：下方**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/00a3d984-ddb0-43fa-bf02-66bd336afc4d.undefined)

**节点功能**

返回(0,-1,0)

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| (0,-1,0)| 三维向量|   
  
## **7\. 三维向量：左侧**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/a9001c9b-6a5a-48b1-9047-a1b37e1a7f14.undefined)

**节点功能**

返回(-1,0,0)

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| (-1,0,0)| 三维向量|   
  
## **8\. 三维向量：右侧**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/374f3d0c-e486-4cb8-83d6-b207281c320f.undefined)

**节点功能**

返回(1,0,0)

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| (1,0,0)| 三维向量|   
  
## **9\. 三维向量：前方**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/d86d69f5-5c15-4f70-a298-612a16e1604a.undefined)

**节点功能**

返回(0,0,1)

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| (0,0,1)| 三维向量|   
  
## **10\. 三维向量：后方**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/b805730a-a1e9-46cd-84ce-cb85977f465a.undefined)

**节点功能**

返回(0,0,-1)

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| (0,0,-1)| 三维向量|   
  
## **11\. 获取随机整数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/fcf1b3d5-1a77-45a9-9f35-32452c3f235c.undefined)

**节点功能**

获取一个大于等于下限，小于等于上限的随机整数。注意该节点生成的随机数包含上下限

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 下限| 整数|   
入参| 上限| 整数|   
出参| 结果| 整数|   
  
## **12\. 查询时间戳（UTC+0时区）**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/1b490737-bfc9-429b-92bc-0b15443d875c.undefined)

**节点功能**

可以查询当前的时间戳

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 时间戳| 整数|   
  
## **13\. 查询服务器时区**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/fe96a228-2934-4902-b7e8-04f0537365bc.undefined)

**节点功能**

可以查询服务器的时区

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 时区| 整数|   
  
# **三、列表相关**

## **1\. 列表是否包含该值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/ef185997-f85e-4c94-98e6-5dd961fe6cda.undefined)

**节点功能**

返回列表中是否包含指定值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 列表| 泛型|   
入参| 值| 泛型|   
出参| 是否包含| 布尔值|   
  
## **2\. 查找列表并返回值的序号**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/173c680a-955b-47e8-ae7e-0c436d39c0e4.undefined)

**节点功能**

从列表中查找指定值，并返回列表中该值出现的序号列表

例如：目标列表为{1,2,3,2,1}，值为1，返回的序号列表为{0，4}，即1出现在目标列表的序号0和4

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标列表| 泛型|   
入参| 值| 泛型|   
出参| 序号列表| 整数列表| 未找到则返回空列表  
  
## **3\. 获取列表对应值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/9528f89e-d0ff-41a1-a3fe-b90c43eb4f9c.undefined)

**节点功能**

返回列表中指定序号对应的值，序号从0开始

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 列表| 泛型|   
入参| 序号| 整数|   
出参| 值| 泛型|   
  
## **4\. 获取列表长度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/7727024f-380b-4416-871a-56e3c01184e3.undefined)

**节点功能**

获取列表长度（列表中的元素个数）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 列表| 泛型|   
出参| 长度| 整数|   
  
## **5\. 获取列表最大值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/ec97398b-8805-4f12-bdfb-ee5c5a93c010.undefined)

**节点功能**

仅对浮点数列表和整数列表有意义，返回列表中的最大值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 列表| 泛型|   
出参| 最大值| 泛型|   
  
## **6\. 获取列表最小值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/21adffbe-fc2c-4ef4-8e19-c353a7a46418.undefined)

**节点功能**

仅对浮点数列表和整数列表有意义，返回列表中的最小值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 列表| 泛型|   
出参| 最小值| 泛型|   
  
# **四、自定义变量**

## **1\. 获取自定义变量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/984d69b0-0a0c-4a90-85bb-06c780ae2836.undefined)

**节点功能**

获取目标实体的指定自定义变量的值

如果变量不存在，则返回类型的默认值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 变量名| 字符串|   
出参| 变量值| 泛型|   
  
## **2\. 获取节点图变量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/d1d4496d-bf30-47f7-aa61-4605fe9a3bc3.undefined)

**节点功能**

获取当前节点图的指定节点图变量的值

如果变量不存在，则返回类型的默认值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 变量名| 字符串|   
出参| 变量值| 泛型|   
  
## **3\. 查询自定义变量快照**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/9047bee2-c373-4580-948e-15bea9475d74.undefined)

**节点功能**

从自定义变量组件快照中，查询指定变量名的值

仅可用于【实体销毁时】事件

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 自定义变量组件快照| 自定义变量快照|   
入参| 变量名| 字符串|   
出参| 变量值| 泛型|   
  
# **五、预设状态**

## **1\. 获取预设状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/f1d8fd66-df3b-4732-93ed-dbe3ee713d02.undefined)

**节点功能**

获取目标实体的指定预设状态的预设状态值。如果该实体没有指定的预设状态，则返回0

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 预设状态索引| 整数|   
出参| 预设状态值| 整数|   
  
# **六、实体相关**

## **1\. 获取自身实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/9a0b33dc-be08-4d3d-94de-ed3f8d096e9f.undefined)

**节点功能**

返回该节点图所关联的实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 自身实体| 实体|   
  
## **2\. 以GUID查询实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/058c9fd0-2abf-472b-8a66-5fa9cd6577d0.undefined)

**节点功能**

根据GUID查询实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| GUID| GUID|   
出参| 实体| 实体|   
  
## **3\. 以实体查询GUID**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/cabcc673-b4c1-4ddb-a1f3-87606d444d9e.undefined)

**节点功能**

查询指定实体的GUID

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 实体| 实体|   
出参| GUID| GUID|   
  
## **4\. 获取实体位置与旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/7bdf5c47-3bff-4c5d-bd15-68d78168bd90.undefined)

**节点功能**

获取目标实体的位置和旋转

对玩家实体和关卡实体无意义

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 位置| 三维向量|   
出参| 旋转| 三维向量|   
  
## **5\. 获取实体类型**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/255a0d71-007e-4682-9036-6c24cc682e32.undefined)

**节点功能**

获取目标实体的实体类型

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 实体类型| 枚举| 分为玩家、角色、关卡、物件、造物  
  
## **6\. 获取场上所有实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/079de23a-0f1c-43f0-afe9-def100836dfe.undefined)

**节点功能**

获取当前场上所有在场的实体，该实体列表的数量可能会较大

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 实体列表| 实体列表|   
  
## **7\. 获取场上指定类型实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/ab0f56c1-cab8-41ef-a2a6-5de41cdcea1d.undefined)

**节点功能**

获取当前场上指定类型的所有实体，该实体列表的数量可能会较大

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 实体类型| 枚举| 分为关卡、物件、玩家、角色、造物  
出参| 实体列表| 实体列表|   
  
## **8\. 获取场上指定元件ID的实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/c3d9a6e5-b6ba-442e-a9f4-5b63e5d1c345.undefined)

**节点功能**

获取当前场上通过指定元件ID创建的所有实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 元件ID| 元件ID|   
出参| 实体列表| 实体列表|   
  
## **9\. 获取指定类型的实体列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/591b3ca6-b742-4e82-b5c0-298abe8f7b4a.undefined)

**节点功能**

在目标实体列表中获取指定类型的实体列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体列表| 实体列表|   
入参| 实体类型| 枚举| 分为玩家、角色、关卡、物件、造物  
出参| 结果列表| 实体列表|   
  
## **10\. 获取指定元件ID的实体列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/19218a53-c485-4376-bbab-e56bdd6b82ff.undefined)

**节点功能**

在目标实体列表中获取以指定元件ID创建的实体列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体列表| 实体列表|   
入参| 元件ID| 元件ID|   
出参| 结果列表| 实体列表|   
  
## **11\. 获取指定阵营的实体列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/ab3b58ce-89ae-461b-81e5-3e37569d552a.undefined)

**节点功能**

在目标实体列表中获取归属于某个阵营的实体列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体列表| 实体列表|   
入参| 阵营| 阵营|   
出参| 结果列表| 实体列表|   
  
## **12\. 获取指定范围的实体列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/d9df75e6-575b-4264-b258-29a88be83505.undefined)

**节点功能**

在目标实体列表中获取指定球形范围内的实体列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体列表| 实体列表|   
入参| 中心点| 三维向量|   
入参| 半径| 浮点数|   
出参| 结果列表| 实体列表|   
  
## **13\. 查询实体是否在场**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/ec2926e2-2492-4015-a51f-fbbd40f6a9d1.undefined)

**节点功能**

查询指定实体是否在场

注意角色实体即使处于倒下状态，仍然认为在场

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 是否在场| 布尔值|   
  
## **14\. 获取物件属性**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/e6ef7688-44ec-4fd5-9e9a-7af3db2c6888.undefined)

**节点功能**

获取物件的相关基础属性

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 物件实体| 实体|   
出参| 等级| 整数|   
出参| 当前生命值| 浮点数|   
出参| 上限生命值| 浮点数|   
出参| 当前攻击力| 浮点数|   
出参| 基础攻击力| 浮点数|   
出参| 当前防御力| 浮点数|   
出参| 基础防御力| 浮点数|   
  
## **15\. 获取实体向前向量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/93ced454-ba14-4715-bdf0-4a49582d0e8c.undefined)

**节点功能**

获取指定实体的向前向量（即该实体本地坐标系下的z轴正方向朝向）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 向前向量| 三维向量|   
  
## **16\. 获取实体向右向量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/733e5433-9c41-4fc9-a57a-59fc9b63a3db.undefined)

**节点功能**

获取指定实体的向右向量（即该实体本地坐标系下的x轴正方向朝向）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 向右向量| 三维向量|   
  
## **17\. 获取实体向上向量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/2ae745ba-ba53-412b-a52c-9eb20fe87800.undefined)

**节点功能**

获取指定实体的向上向量（即该实体本地坐标系下的y轴正方向朝向）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 向上向量| 三维向量|   
  
## **18\. 查询角色当前移动速度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/d87fc29d-0721-47c7-ad04-2a3dd78bb036.undefined)

**节点功能**

仅当角色拥有【监听移动速率】的单位状态效果时，才能查询

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 角色实体| 实体|   
出参| 当前速度| 浮点数|   
出参| 速度向量| 三维向量|   
  
## **19\. 获取角色属性**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/03b7a187-d065-4557-a6bb-546d5de6ca05.undefined)

**节点功能**

获取角色实体的基础属性

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 等级| 整数|   
出参| 当前生命值| 浮点数|   
出参| 上限生命值| 浮点数|   
出参| 当前攻击力| 浮点数|   
出参| 基础攻击力| 浮点数|   
出参| 当前防御力| 浮点数|   
出参| 基础防御力| 浮点数|   
出参| 受打断值上限| 浮点数|   
出参| 当前受打断值| 浮点数|   
出参| 当前受打断状态| 枚举|   
  
## **20\. 获取拥有者实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/83d45151-fa0e-4e8f-b33b-bb0617aa3435.undefined)

**节点功能**

获取指定目标实体的拥有者实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 拥有者实体| 实体|   
  
## **21\. 获取实体拥有的实体列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/ff65aee0-0b27-46f8-aafb-0ef8df96679d.undefined)

**节点功能**

获取所有以目标实体为拥有者的实体组成的列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 实体列表| 实体列表|   
  
## **22\. 获取实体进阶属性**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/1f312680-0e47-4211-a3f0-496ba9983e71.undefined)

**节点功能**

获取实体的进阶属性

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 暴击率| 浮点数|   
出参| 暴击伤害| 浮点数|   
出参| 治疗加成| 浮点数|   
出参| 受治疗加成| 浮点数|   
出参| 元素充能效率| 浮点数|   
出参| 冷却缩减| 浮点数|   
出参| 超限模式护盾强效| 浮点数|   
出参| 经典模式护盾强效| 浮点数|   
  
## **23\. 获取实体元素属性**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/42d8a780-f1b6-4cef-a299-e04975943879.undefined)

**节点功能**

获取目标实体的元素相关属性

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 火元素伤害加成| 浮点数|   
出参| 火元素抗性| 浮点数|   
出参| 水元素伤害加成| 浮点数|   
出参| 水元素抗性| 浮点数|   
出参| 草元素伤害加成| 浮点数|   
出参| 草元素抗性| 浮点数|   
出参| 雷元素伤害加成| 浮点数|   
出参| 雷元素抗性| 浮点数|   
出参| 风元素伤害加成| 浮点数|   
出参| 风元素抗性| 浮点数|   
出参| 冰元素伤害加成| 浮点数|   
出参| 冰元素抗性| 浮点数|   
出参| 岩元素伤害加成| 浮点数|   
出参| 岩元素抗性| 浮点数|   
出参| 物理伤害加成| 浮点数|   
出参| 物理抗性| 浮点数|   
  
## **24\. 查询实体的元素附着状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/965bfd25-5432-453e-b26c-41b46f93f3b3.undefined)

**节点功能**

查询实体当前的元素附着状态

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 水附着| 布尔值|   
出参| 冰附着| 布尔值|   
出参| 雷附着| 布尔值|   
出参| 火附着| 布尔值|   
出参| 草附着| 布尔值|   
出参| 风附着| 布尔值|   
出参| 岩附着| 布尔值|   
出参| 冻结状态| 布尔值|   
出参| 感电状态| 布尔值| 月感电不属于感电状态  
出参| 燃烧状态| 布尔值|   
出参| 石化状态| 布尔值|   
出参| 激化状态| 布尔值|   
  
## **25\. 获取模型颜色和材质**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/aedb3fb4-8d76-4558-bbd3-5b3a5fcea8c5.undefined)

**节点功能**

获取实体模型的【材质】功能是否开启、【叠加颜色】功能是否开启、以及具体【材质】【颜色叠加方式】【叠加颜色】

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 是否开启自定义颜色| 布尔值|   
出参| 颜色叠加模式| 枚举|   
出参| 颜色| 整数|   
出参| 颜色透明度| 浮点数|   
出参| 是否开启自定义材质| 布尔值|   
出参| 材质| 枚举|   
  
# **七、关卡相关**

## **1\. 查询游戏已进行时间**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/4e03fd44-8a8d-4566-8863-f11c76fcada5.undefined)

**节点功能**

查询游戏已进行了多长时间，单位秒

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 游戏已进行时间| 整数|   
  
## **2\. 查询当前环境时间**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/290c875b-7ff5-4359-a047-fe4d37f2acdc.undefined)

**节点功能**

查询当前的环境时间，范围为[0,24)

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 当前环境时间| 浮点数| 获取到的值范围为[0,24)  
出参| 当前循环天数| 整数| 当前已经循环了多少天  
  
# **八、阵营相关**

## **1\. 查询实体阵营**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/4e2798ba-1c1a-49ff-b039-7628839c09e3.undefined)

**节点功能**

查询指定实体的阵营

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 阵营| 阵营|   
  
## **2\. 查询阵营是否敌对**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/ade5af21-10ae-4889-80d0-16a74661a0ee.undefined)

**节点功能**

查询两个阵营是否敌对

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 阵营1| 阵营|   
入参| 阵营2| 阵营|   
出参| 是否敌对| 布尔值|   
  
# **九、玩家与角色相关**

## **1\. 获取在场玩家实体列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/01e2c217-0430-4ec9-860f-e83aba718ba4.undefined)

**节点功能**

获取在场所有玩家实体组成的列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 玩家实体列表| 实体列表|   
  
## **2\. 获取指定玩家所有角色实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/69148140-b268-49e5-a7ce-a31c78d0fbcd.undefined)

**节点功能**

获取指定玩家实体的所有角色实体列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 角色实体列表| 实体列表|   
  
## **3\. 获取角色归属的玩家实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/8dfcd31f-adc1-4516-8a3f-2b6d8fd66790.undefined)

**节点功能**

获取角色实体所归属的玩家实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 角色实体| 实体|   
出参| 所属玩家实体| 实体|   
  
## **4\. 获取玩家剩余复苏次数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/67830052-ecb9-47dd-80ae-c0ddc7c13c69.undefined)

**节点功能**

获取指定玩家实体的剩余复苏次数

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 剩余次数| 整数|   
  
## **5\. 获取玩家复苏耗时**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/f1f3288c-d1d0-4242-924a-bbb438a60b6b.undefined)

**节点功能**

获取指定玩家实体的复苏耗时，单位秒

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 时长| 整数|   
  
## **6\. 查询玩家角色是否全部倒下**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/a311f74e-888b-41bc-bae8-7cc7557fab7f.undefined)

**节点功能**

查询玩家的所有角色是否已全部倒下

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 结果| 布尔值|   
  
## **7\. 根据玩家序号获取玩家GUID**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/2c778f11-c896-4b53-a8a6-9cc33f54c6e8.undefined)

**节点功能**

根据玩家序号获取玩家GUID，玩家序号即该玩家为玩家几

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家序号| 整数|   
出参| 玩家GUID| GUID|   
  
## **8\. 根据玩家GUID获取玩家序号**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/12443239-8ab6-4beb-838b-6c13a5db1647.undefined)

**节点功能**

根据玩家GUID获取玩家序号，玩家序号即该玩家为玩家几

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家GUID| GUID|   
出参| 玩家序号| 整数|   
  
## **9\. 获取玩家昵称**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/7f26e5c5-78f5-408a-9d19-b72abdb3ad65.undefined)

**节点功能**

获取玩家的昵称

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 玩家昵称| 字符串|   
  
## **10\. 获得玩家客户端输入设备类型**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/de2eae83-4bfd-43bd-a73e-84b139d983e1.undefined)

**节点功能**

获得玩家的客户端输入设备类型，根据用户界面的映射方式决定

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 输入设备类型| 枚举| 分为键盘鼠标、手柄、触屏  
  
## **11\. 查询经典模式角色编号**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/80ca3454-da29-4e49-afb1-2abd5982a679.undefined)

**节点功能**

仅经典模式可用，查询目标角色的角色编号，可以查看附录对应具体是哪位角色[经典模式角色编号一览](/ys/ugc/tutorial//detail/mh4imrrhzdzi)

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标角色| 实体|   
出参| 角色编号| 整数|   
  
## **12\. 获取指定玩家的前台角色**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/c2934c8f-c50a-4d23-8dac-88b751572040.undefined)

**节点功能**

仅经典模式可用，获取玩家队伍内的前台角色

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 前台角色实体| 实体|   
  
# **十、跟随运动器**

## **1\. 获取跟随运动器的目标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/ba1b2c73-9ce6-43e0-bb33-0f0021f2091b.undefined)

**节点功能**

获取跟随运动器的目标，可以获取目标实体和实体的GUID

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 跟随目标实体| 实体|   
出参| 跟随目标GUID| GUID|   
  
# **十一、全局计时器**

## **1\. 获取全局计时器当前时间**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/5013e9c2-23b4-4b74-932f-9af933ae9284.undefined)

**节点功能**

获取目标实体上指定全局计时器的当前时间

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 计时器名称| 字符串|   
出参| 当前时间| 浮点数|   
  
# **十二、界面控件组**

## **1\. 获取玩家当前界面布局**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/0aa479a5-6007-4c80-9543-8230dac62bc4.undefined)

**节点功能**

获取指定玩家实体上当前生效的界面布局的索引

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 布局索引| 整数|   
  
# **十三、造物**

## **1\. 获取造物当前目标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/dfb1ae12-6720-4a48-9130-d1e49ddfe617.undefined)

**节点功能**

根据造物当前行为的不同，目标实体也不尽相同。

例如当造物在攻击敌方时，造物的目标为敌方指定实体。

例如当造物在对友方进行治疗时，造物的目标为友方指定实体。

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 造物实体| 实体| 运行时的造物实体  
出参| 目标实体| 实体| 造物当前的智能选取目标实体  
  
## **2\. 获取造物属性**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/69d8f7eb-407d-414c-af86-655ddd492729.undefined)

**节点功能**

获取指定造物的属性

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 造物实体| 实体|   
出参| 等级| 整数|   
出参| 当前生命值| 浮点数|   
出参| 上限生命值| 浮点数|   
出参| 当前攻击力| 浮点数|   
出参| 基础攻击力| 浮点数|   
出参| 受打断值上限| 浮点数|   
出参| 当前受打断值| 浮点数|   
出参| 当前受打断状态| 枚举|   
  
## **3\. 获取默认模式的造物仇恨列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/215de4c2-9db7-4197-989a-b0ee238f5fce.undefined)

**节点功能**

获取造物的默认仇恨模式的仇恨列表，即仅仇恨配置为【默认类型】时，该节点才会有正确的输出列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 造物实体| 实体| 运行时的造物实体  
出参| 仇恨列表| 实体列表| 造物当前对哪些实体有仇恨，该列表是无序的  
  
# **十四、职业**

## **1\. 查询玩家职业**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/47adbded-0e3f-408e-ab2c-7241b28fec71.undefined)

**节点功能**

查询玩家当前的职业，会输出该职业的配置ID

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 职业配置ID| 配置ID|   
  
## **2\. 查询玩家职业的等级**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/12eba958-8dd9-41e5-9a0c-794678746431.undefined)

**节点功能**

查询玩家指定职业的等级

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
入参| 职业配置ID| 配置ID|   
出参| 等级| 整数|   
  
# **十五、技能**

## **1\. 查询角色技能**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/ceba584b-2cfb-4e58-a306-d1549ee1e530.undefined)

**节点功能**

查询角色指定槽位的技能，会输出该技能的配置ID

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 角色实体| 实体|   
入参| 角色技能槽位| 枚举|   
出参| 技能配置ID| 配置ID|   
  
## **2\. 以技能实例ID查询技能配置ID**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/c069f8be-be30-46ad-8942-19e751605924.undefined)

**节点功能**

根据角色实体与指定技能实例ID查询对应的技能配置ID

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 角色实体| 实体|   
入参| 技能实例ID| 整数|   
出参| 技能配置ID| 配置ID|   
  
## **3\. 以技能配置ID查询所有技能实例ID**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/5cef0364-0235-4277-ae75-ce7b10670c1a.undefined)

**节点功能**

根据角色实体与指定技能配置ID查询对应的技能实例ID列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 角色实体| 实体|   
入参| 技能配置ID| 配置ID|   
出参| 技能实例ID列表| 整数列表|   
  
## **4\. 以技能槽位查询所有技能实例ID**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/e1d79803-006e-41a3-ba09-48e4f8994861.undefined)

**节点功能**

查询角色实体对应技能槽位上的所有技能实例ID

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 角色实体| 实体|   
入参| 技能槽位| 枚举|   
出参| 技能实例ID列表| 整数列表|   
  
## **5\. 以技能槽位和技能配置ID查询技能实例ID**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/3493bdea-224b-4c94-a85d-8edc6bc95d7d.undefined)

**节点功能**

根据技能配置ID查询角色实体对应技能槽位上的技能实例ID

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 角色实体| 实体|   
入参| 技能槽位| 枚举|   
入参| 技能配置ID| 配置ID|   
出参| 技能实例ID| 整数|   
  
## **6\. 查询技能属性组值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/542ca33c-bacb-4050-9862-8430c8d441cf.undefined)

**节点功能**

查询角色实体上指定技能组配置ID对应技能组的值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 角色实体| 实体|   
入参| 技能组配置ID| 配置ID|   
出参| 技能组值| 浮点数|   
  
# **十六、单位状态**

## **1\. 查询实体是否具有单位状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/1b821801-042a-4f76-b1ae-51df3e228198.undefined)

**节点功能**

查询指定实体是否具有特定配置ID的单位状态

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 单位状态配置ID| 配置ID|   
出参| 是否具有| 布尔值|   
  
## **2\. 根据槽位序号查询单位状态层数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/46cb0fbb-9523-44ab-9c59-4a3a1da7b8ae.undefined)

**节点功能**

查询目标实体指定槽位上的特定单位状态的层数

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 查询目标实体| 实体|   
入参| 单位状态配置ID| 配置ID|   
入参| 槽位序号| 整数|   
出参| 层数| 整数|   
  
## **3\. 根据槽位序号查询单位状态施加者**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/39168b22-d5e4-4a76-bc80-e317df8a1e86.undefined)

**节点功能**

查询目标实体指定槽位上的特定单位状态的施加者

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 查询目标实体| 实体|   
入参| 单位状态配置ID| 配置ID|   
入参| 槽位序号| 整数|   
出参| 施加者实体| 实体|   
  
## **4\. 查询单位状态的槽位序号列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/a2e1400b-c543-4a72-ac2d-5235e5cde796.undefined)

**节点功能**

查询指定目标实体上特定配置ID的单位状态的所有槽位序号列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 查询目标实体| 实体|   
入参| 单位状态配置ID| 配置ID|   
出参| 槽位序号列表| 整数列表|   
  
# **十七、标签**

## **1\. 获取实体单位标签列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/94bc651d-cbbf-4ad5-8926-f7dc6b887adf.undefined)

**节点功能**

获取目标实体上携带的所有单位标签组成的列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 单位标签列表| 整数列表|   
  
## **2\. 获取单位标签的实体列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/b93d666a-87ac-43a9-a7e1-7687271010ce.undefined)

**节点功能**

获取在场所有携带该单位标签的实体列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 单位标签索引| 整数|   
出参| 实体列表| 实体列表|   
  
# **十八、自定义仇恨**

## **1\. 查询指定实体的仇恨值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/c2e5150e-ef49-4e86-b657-be678d579ea1.undefined)

**节点功能**

查询目标实体在仇恨拥有者上的仇恨值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 查询目标| 实体|   
入参| 仇恨拥有者| 实体|   
出参| 仇恨值| 整数|   
  
## **2\. 查询指定实体的仇恨倍率**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/c54b8268-d3a4-4ac6-a4ff-a043212fc6fd.undefined)

**节点功能**

查询指定实体的仇恨倍率

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 查询目标| 实体|   
出参| 仇恨倍率| 浮点数|   
  
## **3\. 查询全局仇恨转移倍率**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/5fcf6db7-370c-4e19-8e59-c4954670b64b.undefined)

**节点功能**

查询全局仇恨转移倍率，在【关卡设置】中可以配置

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 全局仇恨转移倍率| 浮点数|   
  
## **4\. 获取指定实体的仇恨目标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/8f15dbe4-07b5-4555-92bb-0ad7fb2a3510.undefined)

**节点功能**

获取指定实体的仇恨目标

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 仇恨拥有者| 实体|   
出参| 仇恨目标| 实体|   
  
## **5\. 获取目标所在仇恨列表的拥有者列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/b5b5ce19-fcff-4b2a-8b15-905c0eaffecc.undefined)

**节点功能**

查询指定目标实体在哪些实体的仇恨列表中

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 查询目标| 实体|   
出参| 仇恨拥有者列表| 实体列表|   
  
## **6\. 获取以目标为仇恨目标的拥有者列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/e60fe44c-100c-40e9-ab2c-1a55ffcb0319.undefined)

**节点功能**

查询哪些实体以目标实体为仇恨目标

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 仇恨拥有者列表| 实体列表|   
  
## **7\. 获取指定实体的仇恨列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/6d808fcf-779c-4190-87f4-7107f7a8d72b.undefined)

**节点功能**

获取指定实体的仇恨列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 仇恨列表| 实体列表|   
  
## **8\. 查询指定实体是否已入战**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/8f623cfe-c9bd-4570-901a-8edbd54a2ee4.undefined)

**节点功能**

查询指定实体是否已经入战

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 查询目标| 实体|   
出参| 是否入战| 布尔值|   
  
# **十九、路径**

## **1\. 获取指定路径点信息**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/7e14f90f-3414-4cfe-86ac-d1591fa11b68.undefined)

**节点功能**

查询指定路径的特定路点信息

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 路径索引| 整数|   
入参| 路径路点序号| 整数|   
出参| 路点位置| 三维向量|   
出参| 路点朝向| 三维向量|   
  
## **2\. 获得全局路径的路点个数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/ea09321f-4c5d-4e80-960c-51a8dadb4de4.undefined)

**节点功能**

获得指定全局路径的路点个数

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 路径索引| 整数|   
出参| 路点个数| 整数|   
  
# **二十、预设点**

## **1\. 查询预设点位置旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/eedf02f5-6f53-4a72-ad10-5353fd29c9c6.undefined)

**节点功能**

查询指定预设点的位置和旋转

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 点位索引| 整数|   
出参| 位置| 三维向量|   
出参| 旋转| 三维向量|   
  
## **2\. 以单位标签获取预设点位列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/242952fc-df5f-4d09-83f8-11fa6ba69bf4.undefined)

**节点功能**

根据单位标签索引查询所有携带该单位标签的预设点位列表，输出值为该预设点位的索引

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 单位标签索引| 整数|   
出参| 点位索引列表| 整数列表|   
  
# **二十一、关卡结算**

## **1\. 获取玩家结算排名数值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/681ed9d5-ba04-423b-97ab-7a5b4d813d77.undefined)

**节点功能**

获取指定玩家实体结算的排名数值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 排名数值| 整数|   
  
## **2\. 获取玩家结算成功状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/3f08310a-2a4b-4773-8d4e-fd49e7ca3e8c.undefined)

**节点功能**

获取玩家结算成功状态

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 结算状态| 枚举| 分为未定、胜利、失败  
  
## **3\. 获取阵营结算排名数值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/d24b19ab-527d-4f7c-8001-867ebde7994a.undefined)

**节点功能**

获取指定阵营结算的排名数值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 阵营| 阵营|   
出参| 排名数值| 整数|   
  
## **4\. 获取阵营结算成功状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/3eca0636-f9e7-4021-8419-c75f370ae76b.undefined)

**节点功能**

获取阵营结算成功状态

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 阵营| 阵营|   
出参| 结算状态| 枚举| 分为未定、胜利、失败  
  
# **二十二、字典**

## **1\. 以键查询字典值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/d5d89ad0-f834-4e20-8ee0-e12a4c2cb06f.undefined)

**节点功能**

根据键查询字典中对应的值，如果键不存在，则返回类型默认值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
入参| 键| 泛型|   
出参| 值| 泛型|   
  
## **2\. 查询字典是否包含特定键**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/7cbb8e91-1652-44a4-b318-e3ea9df70a1e.undefined)

**节点功能**

查询指定字典是否包含特定的键

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
入参| 键| 泛型|   
出参| 是否包含| 布尔值|   
  
## **3\. 查询字典是否包含特定值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/d7ca5aff-77ea-4f08-bd88-f4ec7fbe4428.undefined)

**节点功能**

查询指定字典是否包含特定的值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
入参| 值| 泛型|   
出参| 是否包含| 布尔值|   
  
## **4\. 获取字典中键组成的列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/a6caeb45-39e9-4a03-98aa-a1bfac6b901f.undefined)

**节点功能**

获取字典中所有键组成的列表。由于字典中键值对是无序排列的，所以取出的键列表也不一定按照其插入顺序排列

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
出参| 键列表| 泛型|   
  
## **5\. 获取字典中值组成的列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/51e8fbbe-ac85-4678-b31c-865d8c271ae5.undefined)

**节点功能**

获取字典中所有值组成的列表。由于字典中键值对是无序排列的，所以取出的值列表也不一定按照其插入顺序排列

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
出参| 值列表| 泛型|   
  
## **6\. 查询字典长度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/33ab6a62-064e-419f-986d-7ed7f4d74331.undefined)

**节点功能**

查询字典中键值对的数量

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 字典| 泛型|   
出参| 长度| 整数|   
  
# **二十三、商店**

## **1\. 查询自定义商店商品出售列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/e453c92c-b8de-46bd-940a-d808f9337904.undefined)

**节点功能**

查询自定义商店商品出售列表，出参为商品序号组成的列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 商店归属者实体| 实体|   
入参| 商店序号| 整数|   
出参| 商品序号列表| 整数列表|   
  
## **2\. 查询背包商店物品出售列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/272ac9eb-7ff0-4b43-a05a-d87194ee61ca.undefined)

**节点功能**

查询背包商店物品出售列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 商店归属者实体| 实体|   
入参| 商店序号| 整数|   
出参| 道具配置ID列表| 配置ID列表|   
  
## **3\. 查询商店收购物品列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/f32f20bb-7e96-4ad1-a5a7-d18e1efb424a.undefined)

**节点功能**

查询商店收购物品列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 商店归属者实体| 实体|   
入参| 商店序号| 整数|   
出参| 道具配置ID列表| 配置ID列表|   
  
## **4\. 查询自定义商店商品出售信息**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/3ad336f2-c2e3-4642-ad40-8b28098dce3c.undefined)

**节点功能**

查询自定义商店特定商品的出售信息

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 商店归属者实体| 实体|   
入参| 商店序号| 整数|   
入参| 商品序号| 整数|   
出参| 道具配置ID| 配置ID|   
出参| 出售货币字典| 字典|   
出参| 所属页签序号| 整数|   
出参| 是否限购| 布尔值|   
出参| 限购数量| 整数|   
出参| 排序优先级| 整数|   
出参| 是否可出售| 布尔值|   
  
## **5\. 查询背包商店商品出售信息**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/d73905eb-3af6-4ed8-8a8e-90afe151d576.undefined)

**节点功能**

查询背包商店中特定商品的出售信息

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 商店归属者实体| 实体|   
入参| 商店序号| 整数|   
入参| 道具配置ID| 配置ID|   
出参| 出售货币字典| 字典|   
出参| 排序优先级| 整数|   
出参| 是否可出售| 布尔值|   
  
## **6\. 查询商店物品收购信息**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/7118c0ba-3bf0-4cfe-9ef2-bb6a87ae2305.undefined)

**节点功能**

查询商店特定物品的收购信息

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 商店归属者实体| 实体|   
入参| 商店序号| 整数|   
入参| 道具配置ID| 配置ID|   
出参| 收购货币字典| 字典|   
出参| 是否可收购| 布尔值|   
  
# **二十四、装备**

## **1\. 获取装备词条列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/4e93f8af-f189-4905-b8ef-e6018db6e4c9.undefined)

**节点功能**

获取该装备实例的所有词条组成的列表

装备初始化时，词条的数值会发生随机，所以装备实例上的装备词条也会生成对应的实例，故数据类型为整数而不是配置ID

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 装备索引| 整数|   
出参| 装备词条列表| 整数列表|   
  
## **2\. 获取装备词条配置ID**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/ca07b83c-be1c-490f-860f-f84c68f02f28.undefined)

**节点功能**

根据装备实例上装备词条的序号获取该词条的配置ID

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 装备索引| 整数|   
入参| 词条序号| 整数|   
出参| 词条配置ID| 配置ID|   
  
## **3\. 获取装备词条数值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/d02729d2-ba1c-4764-9bb6-f370c2cf0bfe.undefined)

**节点功能**

获取装备实例上对应序号词条的数值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 装备索引| 整数|   
入参| 词条序号| 整数|   
出参| 词条数值| 浮点数|   
  
## **4\. 查询装备标签列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/1e600237-8cfe-4be9-8314-12374b8f7b10.undefined)

**节点功能**

查询该装备实例的所有标签组成的列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 装备索引| 整数|   
出参| 标签列表| 配置ID列表|   
  
## **5\. 根据装备索引查询装备配置ID**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/d5461cf8-2a11-4868-9e63-62a7b89b66a7.undefined)

**节点功能**

根据装备索引查询装备配置ID，装备实例的索引可以在【装备初始化】事件中获取到

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 装备索引| 整数|   
出参| 装备配置ID| 配置ID|   
  
## **6\. 获取指定装备栏位的装备索引**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/704adcaa-a164-4da3-8ac1-1d3c77d9ccc9.undefined)

**节点功能**

获取目标实体装备栏上指定行列对应装备的索引

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 行| 整数|   
入参| 列| 整数|   
出参| 装备索引| 整数|   
  
# **二十五、道具**

## **1\. 获取背包容量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/b35a5b88-af4a-42f0-b59e-15cb3e225824.undefined)

**节点功能**

获取背包容量

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 背包持有者实体| 实体|   
出参| 背包容量| 整数|   
  
## **2\. 获取背包道具数量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/8b8b5417-aaad-43bd-8cc7-bcd24f85f2db.undefined)

**节点功能**

获取背包内特定配置ID的道具数量

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 背包持有者实体| 实体|   
入参| 道具配置ID| 配置ID|   
出参| 道具数量| 整数|   
  
## **3\. 获取背包货币数量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/53abf5ac-dd6b-4fd2-b521-85b9b1c2f892.undefined)

**节点功能**

获取背包内特定配置ID的货币数量

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 背包持有者实体| 实体|   
入参| 货币配置ID| 配置ID|   
出参| 资源数量| 整数|   
  
## **4\. 获取背包所有基础道具**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/9068a965-06e1-47f2-ad08-63b026f54409.undefined)

**节点功能**

获取背包所有基础道具，包括道具类型和对应的数量

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 背包持有者实体| 实体|   
出参| 基础道具字典| 字典|   
  
## **5\. 获取背包所有货币**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/d6270c4b-33b6-433c-91b8-685222e6d5cb.undefined)

**节点功能**

获取背包所有货币，包括货币类型和对应的数量

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 背包持有者实体| 实体|   
出参| 货币字典| 字典|   
  
## **6\. 获取背包所有装备**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/6af8891d-5f7f-40f0-80fb-8bf9ebd9d978.undefined)

**节点功能**

获取背包所有装备，出参为所有装备索引组成的列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 背包持有者实体| 实体|   
出参| 装备索引列表| 整数列表|   
  
## **7\. 获取掉落物组件道具数量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/cf76bb20-6d1f-4bbc-848b-6493240b1930.undefined)

**节点功能**

获取掉落物元件上掉落物组件中特定配置ID的道具数量

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 掉落物实体| 实体|   
入参| 道具配置ID| 配置ID|   
出参| 道具数量| 整数|   
  
## **8\. 获取掉落物组件货币数量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/a75e1017-4cd3-4302-9e44-2f047c4d11c7.undefined)

**节点功能**

获取掉落物元件上掉落物组件中特定配置ID的货币数量

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 掉落物实体| 实体|   
入参| 货币配置ID| 配置ID|   
出参| 货币数量| 整数|   
  
## **9\. 获取掉落物组件所有道具**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/b2d17677-e935-45da-8036-ee8b8a364db7.undefined)

**节点功能**

获取掉落物元件上掉落物组件中的所有道具

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 掉落者实体| 实体|   
出参| 道具字典| 字典|   
  
## **10\. 获取掉落物组件所有货币**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/09eb93ca-e73c-452b-a831-64521802b87c.undefined)

**节点功能**

获取掉落物元件上掉落物组件中的所有货币

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 掉落者实体| 实体|   
出参| 货币字典| 字典|   
  
## **11\. 获取掉落物组件所有装备**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/9e926012-c9b4-47f4-83e9-6521e97d43d5.undefined)

**节点功能**

获取掉落物元件上掉落物组件中的所有装备

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 掉落物实体| 实体|   
出参| 装备索引列表| 整数列表|   
  
# **二十六、碰撞触发器**

## **1\. 获取碰撞触发器内所有实体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/9a036a26-2b26-4a9a-a511-b9fb659287a2.undefined)

**节点功能**

获取目标实体上碰撞触发器组件中特定序号对应的碰撞触发器内的所有实体

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 触发器序号| 整数|   
出参| 实体列表| 实体列表|   
  
# **二十七、小地图标识组件**

## **1\. 查询指定小地图标识信息**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/3dcc9fee-137a-4f87-be2f-89f656c21a67.undefined)

**节点功能**

查询目标实体上小地图标识组件中特定序号对应的小地图标识的信息

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体| 运行时的实体  
入参| 小地图标识序号| 整数| 要查询的指定小地图标识的序号  
出参| 生效状态| 布尔值| 查询的小地图标识的生效状态  
出参| 可见标识的玩家列表| 实体列表| 返回可见该标识的玩家列表  
出参| 追踪标识的玩家列表| 实体列表| 返回追踪该标识的玩家列表  
  
## **2\. 获取实体的小地图标识状态**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/3433080d-f828-4632-8723-3127ea79c27b.undefined)

**节点功能**

查询实体当前小地图标识的配置及生效情况

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体| 运行时的实体  
出参| 全量小地图标识序号列表| 整数列表| 该实体的所有小地图标识枚举列表  
出参| 生效的小地图标识序号列表| 整数列表| 该实体的所有生效小地图标识枚举列表  
出参| 未生效的小地图标识序号列表| 整数列表| 该实体的所有未生效小地图标识枚举列表  
  
# **二十八、造物巡逻**

## **1\. 获取当前造物的巡逻模板**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/ac2e6037-7b6e-4bf5-b6ec-cc2d8fdf6271.undefined)

**节点功能**

获取指定造物实体的巡逻模板信息

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 造物实体| 实体| 运行时的造物实体  
出参| 巡逻模板序号| 整数| 造物当前生效的巡逻模板序号  
出参| 路径索引| 整数| 造物当前生效的巡逻模板引用的路径索引  
出参| 目标路点序号| 整数| 造物即将前往的路点序号  
  
# **二十九、成就**

## **1\. 查询成就是否完成**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/5e34301c-7773-4655-8411-0250654ac1ed.undefined)

**节点功能**

查询目标实体上特定序号对应的成就是否完成

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
入参| 成就序号| 整数|   
出参| 是否完成| 布尔值|   
  
# **三十、扫描标签**

## **1\. 获取当前生效的扫描标签配置ID**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/69e86b78-12c8-4b9e-8cfa-e70c924b8124.undefined)

**节点功能**

获取目标实体上当前生效的扫描标签的配置ID

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体|   
出参| 扫描标签配置ID| 配置ID|   
  
# **三十一、段位**

## **1\. 获取玩家段位变化分数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/c0ac5240-e322-4d93-af44-c94648ffb76c.undefined)

**节点功能**

获取玩家实体在不同结算状态下段位的变化分数

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
入参| 结算状态| 枚举|   
出参| 分数| 整数|   
  
## **2\. 获取玩家段位信息**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/4276cf24-837a-4878-a015-c21b6579ab99.undefined)

**节点功能**

获取玩家段位相关信息

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 玩家段位总分| 整数|   
出参| 玩家连胜次数| 整数|   
出参| 玩家连败次数| 整数|   
出参| 玩家连续逃跑次数| 整数|   
  
## **3\. 获取玩家逃跑合法性**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/528dc530-3661-40c8-93eb-19e99e694dc0.undefined)

**节点功能**

获取玩家逃跑合法性

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 是否合法| 布尔值|   
  
# **三十二、实体布设组**

## **1\. 查询当前激活的实体布设组列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/f9711db1-f55d-4f22-9ca4-38a4bd33024a.undefined)

**节点功能**

查询当前关卡激活的实体布设组组成的列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 实体布设组索引列表| 整数列表|   
  
# **三十三、奇域礼盒相关**

## **1\. 查询对应礼盒数量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/c0453f9e-ded1-4a11-ad8f-aa487b73d2b0.undefined)

**节点功能**

查询玩家实体上指定礼盒的数量

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
入参| 礼盒索引| 整数|   
出参| 数量| 整数|   
  
## **2\. 查询对应华丽演绎礼盒消耗数量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/b8b6fdec-bd48-4dbe-8b02-65d2189523b6.undefined)

**节点功能**

查询玩家实体上华丽演绎礼盒的消耗数量(无法对其他类型的礼盒使用)

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
入参| 礼盒索引| 整数|   
出参| 数量| 整数|   
  
# **三十四、造物预设状态**

## **1\. 获取复杂造物的预设状态值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/276acb63-0799-4d4e-81af-836d7d597aa0.undefined)

**节点功能**

**节点功能**  
获取复杂造物指定预设状态索引的预设状态值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 目标实体| 实体| 复杂造物实体  
入参| 预设状态索引| 整数|   
出参| 预设状态值| 整数|   
  
# **三十五、关卡任务**

## **1\. 查询指定任务计数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/ed6bdcc5-27e5-4561-8f91-44a2eacef9e6.undefined)

**节点功能**

仅超限模式可用

可以查询对应玩家的指定任务的当前计数

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
入参| 任务索引| 整数|   
出参| 任务计数| 整数|   
  
## **2\. 查询指定任务是否完成**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/28bc13a9-49cc-4a4c-b366-3a43325ddf1f.undefined)

**节点功能**

仅超限模式可用

可以查询对应玩家的指定任务是否完成

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体| 所查询的玩家实体  
入参| 任务索引| 整数| 所要查询的任务对应的索引  
出参| 是否完成| 布尔值|   
  
# **三十六、操控运动器**

## **1\. 查询玩家当前激活操控运动器列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/abf646dd-daa7-43c2-ae25-b489be1780da.undefined)

**节点功能**

查询玩家当前激活操控运动器列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 操控运动器实体列表| 实体列表|   
  
## **2\. 查询玩家当前跟随操控运动器**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/dd7d77d3-e5be-4be5-ad89-3c99e3c40b1c.undefined)

**节点功能**

查询玩家当前跟随操控运动器

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体|   
出参| 操控运动器实体| 实体|   
  
## **3\. 查询操控运动器当前运动参数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/8666ebed-49a8-4685-a727-261bdbe5ffbc.undefined)

**节点功能**

查询操控运动器当前运动参数。不包含操控技能节点添加的临时运动参数。

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 操控运动器| 实体|   
出参| 前进加速度| 浮点数|   
出参| 后退加速度| 浮点数|   
出参| 转向速率| 浮点数|   
出参| 基础阻力| 浮点数|   
出参| 阻力系数| 浮点数|   
出参| 最大前进速度| 浮点数|   
出参| 最大后退速度| 浮点数|   
  
# **三十七、作者订阅**

## **1\. 查询玩家是否订阅**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/fd869fbf-5af1-4c6a-808c-232b6fd6d214.undefined)

**节点功能**

可以查询对应玩家是否订阅该奇匠

奇匠无法订阅自己，但该节点由奇匠自身触发时，出参结果为true

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体| 所查询的玩家实体  
出参| 是否订阅| 布尔值|   
  
# **三十八、光标**

## **1\. 查询玩家光标是否激活**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwbqlrw655q/ab017327-e3f7-46f1-9c68-8d00180332d1.undefined)

**节点功能**

查询指定玩家当前的光标是否处于激活（常驻显示）状态

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 玩家实体| 实体| 要查询的玩家  
出参| 是否激活| 布尔值| 光标常驻显示则为“是”
