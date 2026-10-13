# 节点介绍/客户端节点/角色技能节点图/运算节点

(来源：原神千星奇域·综合指南，页面 ID mhfmxw9fn6n6)

# **一、通用**  
  
## **1\. 是否相等**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/29646bcd-31f8-42ae-a16a-01d782b31569.undefined)

**节点功能**

判断两个输入是否相等

部分参数类型有较为特殊的判定规则：

浮点数：浮点数采用近似相等进行比较，当两个浮点数小于一个极小值时，这两个浮点数认为相等。例如：2.0000001与2.0认为相等

三维向量：三维向量的x、y、z分别采用浮点数近似相等比较

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 布尔值|   
  
## **2\. 数据类型转换**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/0e72070a-2ef5-4b19-8181-cda0fefebfe7.undefined)

**节点功能**

将输入的参数类型转换为另一种类型输出。具体规则见[基础概念](/ys/ugc/tutorial//detail/mhk23ora1wom)-【基础数据类型之间的转换规则】

在客户端节点中对于浮点数转整数，会截尾取整

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 泛型|   
出参| 转换结果| 泛型|   
  
## **3\. 枚举匹配**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/3a7104a4-cdce-450f-aa1f-754aa3448234.undefined)

**节点功能**

确认枚举的类型后，判断两个输入的值是否相等

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 枚举1| 泛型|   
入参| 枚举2| 泛型|   
出参| 结果| 布尔值| 相等输出“是”，不相等输出“否”  
  
# **二、数学**

## **1\. 加法运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/05e0f709-59e5-4a5d-ae3e-b2d06ef64ecc.undefined)

**节点功能**

计算两个浮点数或整数的加法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 泛型|   
  
## **2\. 减法运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/5b40545c-300f-4879-9399-2e94edacb4af.undefined)

**节点功能**

计算两个浮点数或整数的减法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 泛型|   
  
## **3\. 乘法运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/a7b3ba97-fc7b-4cea-aa1f-f7b07bb60994.undefined)

**节点功能**

乘法运算，支持浮点数乘法和整数乘法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 泛型|   
  
## **4\. 除法运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/bf36c06a-f54a-4fd2-9112-051a49c466e2.undefined)

**节点功能**

除法运算，支持浮点数除法和整数除法。整数除法返回整除结果

除数不应为0，否则可能返回非法值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 泛型|   
  
## **5\. 绝对值运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/f0f967e0-4f83-4ce1-a60e-2c3a64b5e85e.undefined)

**节点功能**

返回输入的绝对值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 泛型|   
出参| 结果| 泛型|   
  
## **6\. 获取随机数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/9ede0555-a120-4747-a42a-4158800c2695.undefined)

**节点功能**

获取一个大于等于下限，小于等于上限的随机数。注意该节点生成的随机数包含上下限

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 下限| 泛型|   
入参| 上限| 泛型|   
出参| 随机数| 泛型|   
  
## **7\. 三维向量夹角**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/90f0741d-af8b-4687-bb40-a2f7d9b8bfd7.undefined)

**节点功能**

计算两个三维向量之间的夹角，以角度输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 夹角(角度)| 浮点数|   
  
## **8\. 三维向量模运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/f77aee3b-dea0-489e-ba8a-b634567ffb36.undefined)

**节点功能**

计算输入三维向量的模

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量| 三维向量|   
出参| 结果| 浮点数|   
  
## **9\. 三维向量缩放**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/ac335128-a7e8-4815-9201-bfe09cb09155.undefined)

**节点功能**

将输入的三维向量缩放后输出（三维向量数乘）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 缩放倍率| 浮点数|   
入参| 三维向量| 三维向量|   
出参| 结果| 三维向量|   
  
## **10\. 三维向量旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/28dc1754-f387-4b40-a67b-1175c49b81fa.undefined)

**节点功能**

将被旋转的三维向量，按照旋转所表示的欧拉角进行旋转后返回结果

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 被旋转的三维向量| 三维向量|   
入参| 旋转| 三维向量|   
出参| 结果| 三维向量|   
  
## **11\. 三维向量加法**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/e644d509-4812-4a3b-a736-1d80e9a284bd.undefined)

**节点功能**

计算两个三维向量的加法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 计算结果| 三维向量|   
  
## **12\. 三维向量减法**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/e18993d8-a3ee-4c90-8518-4e64e84f5eeb.undefined)

**节点功能**

计算两个三维向量的减法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 计算结果| 三维向量|   
  
## **13\. 三维向量内积**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/15843510-337e-48c7-8832-b875d7ad22d4.undefined)

**节点功能**

计算两个输入三维向量的内积（点乘）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 计算结果| 浮点数|   
  
## **14\. 三维向量外积**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/50940190-c01c-4dfc-b320-91a77df2846b.undefined)

**节点功能**

计算两个三维向量的外积（叉乘）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 计算结果| 三维向量|   
  
## **15\. 方向向量转旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/571621ba-9eb9-46c5-b2c0-4b78722d7a5b.undefined)

**节点功能**

给定向前向量和向上向量，转化为欧拉角

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 向前向量| 三维向量| 表示单位期望的朝向  
入参| 向上向量| 三维向量| 定义单位的上方向（用于确定旋转的旋转角度），默认值为世界坐标系Y轴正方向  
出参| 旋转| 三维向量|   
  
## **16\. 朝向转旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/b9e9c10a-c484-4999-9f0c-34c60cc90417.undefined)

**节点功能**

将方向向量转化为欧拉角

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 朝向| 三维向量|   
出参| 旋转| 三维向量|   
  
## **17\. 拆分三维向量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/a9062732-e289-4c96-8c11-2fbd8040fff3.undefined)

**节点功能**

将三维向量的x、y、z分量输出为三个浮点数

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量| 三维向量|   
出参| X分量| 浮点数|   
出参| Y分量| 浮点数|   
出参| Z分量| 浮点数|   
  
## **18\. 正弦函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/6b49496c-6720-4256-9aba-07c52e252530.undefined)

**节点功能**

计算输入弧度的正弦

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 弧度| 浮点数|   
出参| 结果| 浮点数|   
  
## **19\. 余弦函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/3a51de8e-703f-497a-82bd-92e5068cdd77.undefined)

**节点功能**

计算输入弧度的余弦

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 弧度| 浮点数|   
出参| 结果| 浮点数|   
  
## **20\. 正切函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/19334d62-7ab8-4238-9451-82c81eb95c45.undefined)

**节点功能**

计算输入弧度的正切

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 弧度| 浮点数|   
出参| 结果| 浮点数|   
  
## **21\. 反正弦函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/0e2f6916-9f07-43fe-9719-6aa2e582b2c6.undefined)

**节点功能**

计算输入的反正弦值，返回为弧度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 浮点数|   
出参| 弧度| 浮点数|   
  
## **22\. 反余弦函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/9afa6f62-bf22-4498-898d-8b440992d827.undefined)

**节点功能**

计算输入的反余弦值，返回为弧度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 浮点数|   
出参| 弧度| 浮点数|   
  
## **23\. 反正切函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/2124502b-802a-4975-a553-104a0ebf6904.undefined)

**节点功能**

计算输入的反正切值，返回为弧度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 浮点数|   
出参| 弧度| 浮点数|   
  
## **24\. 三维向量归一化**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/435ddcac-5f6f-4eea-a1e4-17b75b50df14.undefined)

**节点功能**

将三维向量的长度归一化后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量| 三维向量|   
出参| 结果| 三维向量|   
  
## **25\. 弧度转角度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/b68c262e-f3c7-4192-b3d7-2ae628ed83fc.undefined)

**节点功能**

将弧度值转为角度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 弧度| 浮点数|   
出参| 角度| 浮点数|   
  
## **26\. 角度转弧度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/9395311e-6fe3-49fe-a991-b1ac966c2c91.undefined)

**节点功能**

将角度值转为弧度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 角度| 浮点数|   
出参| 弧度| 浮点数|   
  
## **27\. 逻辑与运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/2e1fe772-090e-42d8-b251-e54a5d95dff1.undefined)

**节点功能**

对输入的两个布尔值进行与运算后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 条件1| 布尔值|   
入参| 条件2| 布尔值|   
出参| 结果| 布尔值|   
  
## **28\. 逻辑或运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/9af1cf8e-5c58-45ed-9dd0-20bced53ee3e.undefined)

**节点功能**

对输入的两个布尔值进行或运算后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 条件1| 布尔值|   
入参| 条件2| 布尔值|   
出参| 结果| 布尔值|   
  
## **29\. 逻辑非运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/ab2a5a4b-bce5-4886-ad22-ab92e4c777ea.undefined)

**节点功能**

对输入的布尔值进行非运算后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 条件| 布尔值|   
出参| 结果| 布尔值|   
  
## **30\. 逻辑异或运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/be3a582b-50ee-4380-8e2f-bd23c0b26612.undefined)

**节点功能**

对输入的两个布尔值进行异或运算后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 条件1| 布尔值|   
入参| 条件2| 布尔值|   
出参| 结果| 布尔值|   
  
## **31\. 是否大于**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/cf990e5d-2856-4d44-8df2-bd84dca529ae.undefined)

**节点功能**

返回左值是否大于右值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 布尔值|   
  
## **32\. 是否小于**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/64fed238-7ff2-4493-b6c7-14729d111f22.undefined)

**节点功能**

返回左值是否小于右值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 布尔值|   
  
## **33\. 是否小于等于**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/656984e9-5d3d-4cd6-9602-bea1528ca9c9.undefined)

**节点功能**

返回左值是否小于等于右值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 布尔值|   
  
## **34\. 是否大于等于**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/01eac3dc-0a40-40b8-a3c4-977985120e0d.undefined)

**节点功能**

返回左值是否大于等于右值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 布尔值|   
  
## **35\. 创建三维向量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/d9ee3706-8a78-4cd6-ac29-78fe6e4163f9.undefined)

**节点功能**

根据x、y、z分量创建一个三维向量

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| X分量| 浮点数|   
入参| Y分量| 浮点数|   
入参| Z分量| 浮点数|   
出参| 三维向量| 三维向量|   
  
## **36\. 屏幕坐标转视口坐标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/cd74f239-ba33-4b30-a014-550939515389.undefined)

**节点功能**

将屏幕坐标转换为视口坐标（归一化0-1），仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 屏幕X| 浮点数|   
入参| 屏幕Y| 浮点数|   
出参| 视口X| 浮点数|   
出参| 视口Y| 浮点数|   
  
## **37\. 视口坐标转屏幕坐标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/46d3dbc9-4604-49df-89d3-799632b0da1f.undefined)

**节点功能**

将视口坐标（归一化0-1）转换为屏幕坐标，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 视口X| 浮点数|   
入参| 视口Y| 浮点数|   
出参| 屏幕X| 浮点数|   
出参| 屏幕Y| 浮点数|   
  
## **38\. 屏幕坐标转世界坐标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/edcde9d9-71d6-476f-9501-1dbf346ce208.undefined)

**节点功能**

将屏幕坐标加上深度值，转换为世界坐标，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 屏幕X| 浮点数|   
入参| 屏幕Y| 浮点数|   
入参| 深度值| 浮点数|   
出参| 世界坐标| 三维向量|   
  
## **39\. 世界坐标转屏幕坐标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/d2d47587-48c8-4cb4-b998-e4b585c6b2a1.undefined)

**节点功能**

将世界坐标转换为屏幕坐标，仅在超限模式可用

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 世界坐标| 三维向量|   
出参| 屏幕X| 浮点数|   
出参| 屏幕Y| 浮点数|   
  
# **三、列表**

## **1\. 拼装列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/ea5777c9-9140-43e9-b778-280b1e096a8d.undefined)

**节点功能**

将多个类型相同的入参(至多10个)拼装为一个列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 列表| 泛型| 拼装成的列表  
入参| 0~9| 泛型| 将至多10个参数拼装为一个列表  
  
# **四、结构体**

## **1\. 拼装结构体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/43a46fa0-91a5-462c-b8d3-4ffda35b755b.undefined)

**节点功能**

将多个参数拼合为一个结构体类型的值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 结构体| 结构体|   
  
## **2\. 拆分结构体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/2c24a8c3-1d50-4cb5-8aac-33b0acba8966.undefined)

**节点功能**

获取指定结构体的所有参数

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 结构体| 结构体|   
  
# **五、字典**

## **1\. 拼装字典**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/25df09d0-f966-446f-bc67-7fa3277c82c2.undefined)

**节点功能**

将至多50个键值对拼合为一个字典

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 字典| 泛型|   
入参| 键0~49| 泛型|   
入参| 值0~49| 泛型|   
  
## **2\. 建立字典**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhfmxw9fn6n6/d4430da9-5216-4880-9c3a-c67bd159d26e.undefined)

**节点功能**

根据输入的键和值列表的顺序依次建立键值对。

此节点会按照键和值列表中较短的一个进行字典创建，多余的部分会被截断

如果键列表中存在重复值，则会创建失败，返回空字典

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 键列表| 泛型|   
入参| 值列表| 泛型|   
出参| 字典| 泛型|
