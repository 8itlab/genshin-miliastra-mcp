# 节点介绍/客户端节点/造物技能节点图/运算节点

(来源：原神千星奇域·综合指南，页面 ID mh7ys59fhtvu)

# **一、通用**  
  
## **1\. 是否相等**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/b65c33e4-a110-4450-9029-01c60357b837.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/217efbc4-8944-42f3-a50f-b8d55e6a939a.undefined)

**节点功能**

将输入的参数类型转换为另一种类型输出。具体规则见[基础概念](/ys/ugc/tutorial//detail/mhk23ora1wom)-【基础数据类型之间的转换规则】

在客户端节点中对于浮点数转整数，会截尾取整

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 泛型|   
出参| 转换结果| 泛型|   
  
## **3\. 枚举匹配**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/ec53875e-652a-4bd2-b146-d96b81f61962.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/7c73a8ec-44a9-4966-a1cc-6f254802efb4.undefined)

**节点功能**

计算两个浮点数或整数的加法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 泛型|   
  
## **2\. 减法运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/b5013571-0c96-46ea-9cd9-4b0430b31046.undefined)

**节点功能**

计算两个浮点数或整数的减法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 泛型|   
  
## **3\. 乘法运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/664c141a-c62b-4e43-a896-2fe7996f4fc9.undefined)

**节点功能**

乘法运算，支持浮点数乘法和整数乘法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 泛型|   
  
## **4\. 除法运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/8226f676-7dca-4221-8230-3282d29be045.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/17117f65-ce59-49ed-bafa-e631110b5605.undefined)

**节点功能**

返回输入的绝对值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 泛型|   
出参| 结果| 泛型|   
  
## **6\. 获取随机数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/ac84ea3a-5d12-4cde-8d03-a375533750da.undefined)

**节点功能**

获取一个大于等于下限，小于等于上限的随机数。注意该节点生成的随机数包含上下限

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 下限| 泛型|   
入参| 上限| 泛型|   
出参| 随机数| 泛型|   
  
## **7\. 三维向量夹角**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/63f360b5-dc55-4bef-a224-a1706b321de2.undefined)

**节点功能**

计算两个三维向量之间的夹角，以角度输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 夹角(角度)| 浮点数|   
  
## **8\. 三维向量模运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/0b2c528e-48ef-494f-9da9-778fbc22b090.undefined)

**节点功能**

计算输入三维向量的模

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量| 三维向量|   
出参| 结果| 浮点数|   
  
## **9\. 三维向量缩放**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/3a9046b7-9195-46f6-b8b2-8740c29b7510.undefined)

**节点功能**

将输入的三维向量缩放后输出（三维向量数乘）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 缩放倍率| 浮点数|   
入参| 三维向量| 三维向量|   
出参| 结果| 三维向量|   
  
## **10\. 三维向量旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/6c03cc30-87c3-407e-80f4-ab8e3b231603.undefined)

**节点功能**

将被旋转的三维向量，按照旋转所表示的欧拉角进行旋转后返回结果

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 被旋转的三维向量| 三维向量|   
入参| 旋转| 三维向量|   
出参| 结果| 三维向量|   
  
## **11\. 三维向量加法**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/2410f602-606d-4835-8f6b-6e76614fdfd3.undefined)

**节点功能**

计算两个三维向量的加法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 计算结果| 三维向量|   
  
## **12\. 三维向量减法**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/f12cd403-d626-489d-be26-49dcd0c3804a.undefined)

**节点功能**

计算两个三维向量的减法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 计算结果| 三维向量|   
  
## **13\. 三维向量内积**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/c1c7f77c-2e8c-4fa2-af66-4f5cfdb6c0ff.undefined)

**节点功能**

计算两个输入三维向量的内积（点乘）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 计算结果| 浮点数|   
  
## **14\. 三维向量外积**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/78b79512-35a6-4a01-bb95-525b2c6e6b78.undefined)

**节点功能**

计算两个三维向量的外积（叉乘）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 计算结果| 三维向量|   
  
## **15\. 方向向量转旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/cd64847f-29f8-4608-b7c8-2d134f507557.undefined)

**节点功能**

给定向前向量和向上向量，转化为欧拉角

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 向前向量| 三维向量| 表示单位期望的朝向  
入参| 向上向量| 三维向量| 定义单位的上方向（用于确定旋转的旋转角度），默认值为世界坐标系Y轴正方向  
出参| 旋转| 三维向量|   
  
## **16\. 朝向转旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/003c1e51-0a1a-4297-bae7-922df92b83fe.undefined)

**节点功能**

将方向向量转化为欧拉角

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 朝向| 三维向量|   
出参| 旋转| 三维向量|   
  
## **17\. 拆分三维向量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/f7e0513d-befa-4b81-b95c-95cfca156622.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/6d3d4d24-07ef-42dc-a9e0-4c6f6e6d5a96.undefined)

**节点功能**

计算输入弧度的正弦

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 弧度| 浮点数|   
出参| 结果| 浮点数|   
  
## **19\. 余弦函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/cae315e4-5e15-4573-af9b-67cfb3bce672.undefined)

**节点功能**

计算输入弧度的余弦

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 弧度| 浮点数|   
出参| 结果| 浮点数|   
  
## **20\. 正切函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/b420da45-5ffd-4e9b-b339-8bc7efd2fd49.undefined)

**节点功能**

计算输入弧度的正切

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 弧度| 浮点数|   
出参| 结果| 浮点数|   
  
## **21\. 反正弦函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/e26e0e76-2f31-470f-b21e-ea519e2e52b4.undefined)

**节点功能**

计算输入的反正弦值，返回为弧度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 浮点数|   
出参| 弧度| 浮点数|   
  
## **22\. 反余弦函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/2acefd4c-e3d2-435f-aded-999067b31362.undefined)

**节点功能**

计算输入的反余弦值，返回为弧度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 浮点数|   
出参| 弧度| 浮点数|   
  
## **23\. 反正切函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/87d2f2a1-282d-45cd-aeca-04958cd107f9.undefined)

**节点功能**

计算输入的反正切值，返回为弧度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 浮点数|   
出参| 弧度| 浮点数|   
  
## **24\. 三维向量归一化**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/296b4f2e-c7cb-492e-9b70-3a16f30375c7.undefined)

**节点功能**

将三维向量的长度归一化后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量| 三维向量|   
出参| 结果| 三维向量|   
  
## **25\. 弧度转角度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/b962cbd8-9b4a-49ec-9fc5-e9f236b2dc45.undefined)

**节点功能**

将弧度值转为角度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 弧度| 浮点数|   
出参| 角度| 浮点数|   
  
## **26\. 角度转弧度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/b82dddda-b81e-4b9f-938a-a4a201294a8e.undefined)

**节点功能**

将角度值转为弧度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 角度| 浮点数|   
出参| 弧度| 浮点数|   
  
## **27\. 逻辑与运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/7a748a9e-fd05-4993-a023-a66ecd0de3b4.undefined)

**节点功能**

对输入的两个布尔值进行与运算后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 条件1| 布尔值|   
入参| 条件2| 布尔值|   
出参| 结果| 布尔值|   
  
## **28\. 逻辑或运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/0cf72986-187e-443d-a096-1c6529e51ab7.undefined)

**节点功能**

对输入的两个布尔值进行或运算后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 条件1| 布尔值|   
入参| 条件2| 布尔值|   
出参| 结果| 布尔值|   
  
## **29\. 逻辑非运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/d0a43e98-6766-4b3f-82d8-fc933fa9e25e.undefined)

**节点功能**

对输入的布尔值进行非运算后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 条件| 布尔值|   
出参| 结果| 布尔值|   
  
## **30\. 逻辑异或运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/161d7cec-3667-4034-9f1e-aec44a77ee62.undefined)

**节点功能**

对输入的两个布尔值进行异或运算后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 条件1| 布尔值|   
入参| 条件2| 布尔值|   
出参| 结果| 布尔值|   
  
## **31\. 是否大于**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/f8eb70db-1eea-4553-8d33-1073e473793a.undefined)

**节点功能**

返回左值是否大于右值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 布尔值|   
  
## **32\. 是否小于**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/b3e46f32-bddd-486b-abaa-95e022e69858.undefined)

**节点功能**

返回左值是否小于右值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 布尔值|   
  
## **33\. 是否小于等于**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/be9057fd-fbe0-48be-89bf-49d25d9fca93.undefined)

**节点功能**

返回左值是否小于等于右值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 布尔值|   
  
## **34\. 是否大于等于**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/182e6e2b-2e41-483d-ba49-a7059d83bcc5.undefined)

**节点功能**

返回左值是否大于等于右值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 布尔值|   
  
## **35\. 创建三维向量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/723c692c-aaeb-4b72-bdd6-af9d7c7f11e0.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/9ccc741c-db0a-4e2a-8891-11d9ef5b0df6.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/c09ec991-5a74-484c-97b1-d5ad7c28b241.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/b1c298a7-3cf1-442d-acbe-2ac5194c8ae5.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/7e412a6e-6c6d-4190-864e-35d4f5095442.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/eeba0a0a-259c-4dc0-9882-42b8165f6a4d.undefined)

**节点功能**

将多个类型相同的入参(至多10个)拼装为一个列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 列表| 泛型| 拼装成的列表  
入参| 0~9| 泛型| 将至多10个参数拼装为一个列表  
  
# **四、结构体**

## **1\. 拼装结构体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/53ed8597-a521-4588-8897-4c7f478090d6.undefined)

**节点功能**

将多个参数拼合为一个结构体类型的值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 结构体| 结构体|   
  
## **2\. 拆分结构体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/350896ef-a7ae-4c45-b6cc-743f7a81b5f3.undefined)

**节点功能**

获取指定结构体的所有参数

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 结构体| 结构体|   
  
# **五、字典**

## **1\. 拼装字典**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/85db1044-a168-416e-821b-797e63d46d79.undefined)

**节点功能**

将至多50个键值对拼合为一个字典

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 字典| 泛型|   
入参| 键0~49| 泛型|   
入参| 值0~49| 泛型|   
  
## **2\. 建立字典**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh7ys59fhtvu/9231f54c-ddb2-4492-9f9a-31cceb36dd95.undefined)

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
