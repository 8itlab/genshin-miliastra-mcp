# 节点介绍/客户端节点/过滤器节点图/运算节点

(来源：原神千星奇域·综合指南，页面 ID mhte5piu3it0)

# **一、通用**  
  
## **1\. 是否相等**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/1789d71d-c916-4766-9218-a247f4223ea1.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/e7abc34d-db92-4cf2-b2d4-ec423c8aace9.undefined)

**节点功能**

将输入的参数类型转换为另一种类型输出。具体规则见[基础概念](/ys/ugc/tutorial//detail/mhk23ora1wom)-【基础数据类型之间的转换规则】

在客户端节点中对于浮点数转整数，会截尾取整

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 泛型|   
出参| 转换结果| 泛型|   
  
## **3\. 枚举匹配**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/2621b542-e66e-4e67-bed0-831e5c2ac560.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/055c5edf-7026-4e9b-8033-46f010989330.undefined)

**节点功能**

计算两个浮点数或整数的加法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 泛型|   
  
## **2\. 减法运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/66770b46-8972-45fb-ae51-ee4e18b13388.undefined)

**节点功能**

计算两个浮点数或整数的减法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 泛型|   
  
## **3\. 乘法运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/5966f535-56ed-45e2-bfee-7e27d4fd57e6.undefined)

**节点功能**

乘法运算，支持浮点数乘法和整数乘法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 泛型|   
  
## **4\. 除法运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/13423aa2-5605-46e8-b346-ea9bde87dfe8.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/b35188d8-9cb9-4c38-a6f1-aa0d7550dce9.undefined)

**节点功能**

返回输入的绝对值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 泛型|   
出参| 结果| 泛型|   
  
## **6\. 获取随机数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/37b1268d-f6f7-416a-9810-f0a30c7e646d.undefined)

**节点功能**

获取一个大于等于下限，小于等于上限的随机数。注意该节点生成的随机数包含上下限

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 下限| 泛型|   
入参| 上限| 泛型|   
出参| 随机数| 泛型|   
  
## **7\. 三维向量内积**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/e54af9e8-5be8-4c94-915c-a30064c9a4c1.undefined)

**节点功能**

计算两个输入三维向量的内积（点乘）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 计算结果| 浮点数|   
  
## **8\. 三维向量外积**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/09cf1de4-2ccb-4252-823f-c9bfed546d49.undefined)

**节点功能**

计算两个三维向量的外积（叉乘）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 计算结果| 三维向量|   
  
## **9\. 拆分三维向量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/8fc32b67-8046-45e3-ba96-7d18938c7072.undefined)

**节点功能**

将三维向量的x、y、z分量输出为三个浮点数

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量| 三维向量|   
出参| X分量| 浮点数|   
出参| Y分量| 浮点数|   
出参| Z分量| 浮点数|   
  
## **10\. 三维向量缩放**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/15bc18cd-1615-4ff4-b11a-0b50239ead32.undefined)

**节点功能**

将输入的三维向量缩放后输出（三维向量数乘）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 缩放倍率| 浮点数|   
入参| 三维向量| 三维向量|   
出参| 结果| 三维向量|   
  
## **11\. 三维向量夹角**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/37ec5f33-9deb-4c27-8c21-1ff99f9f0f8c.undefined)

**节点功能**

计算两个三维向量之间的夹角，以角度输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 夹角(角度)| 浮点数|   
  
## **12\. 三维向量旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/f4911855-2190-449d-9db0-e1bd7d7c2d2f.undefined)

**节点功能**

将被旋转的三维向量，按照旋转所表示的欧拉角进行旋转后返回结果

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 被旋转的三维向量| 三维向量|   
入参| 旋转| 三维向量|   
出参| 结果| 三维向量|   
  
## **13\. 三维向量模运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/6142b26c-1ad9-4993-87d8-3b30528f26df.undefined)

**节点功能**

计算输入三维向量的模

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量| 三维向量|   
出参| 结果| 浮点数|   
  
## **14\. 创建三维向量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/aaa630d1-ff69-4890-ad28-709f83a7b43d.undefined)

**节点功能**

根据x、y、z分量创建一个三维向量

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| X分量| 浮点数|   
入参| Y分量| 浮点数|   
入参| Z分量| 浮点数|   
出参| 三维向量| 三维向量|   
  
## **15\. 三维向量加法**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/9089bbbe-697f-4e3e-ad2d-2cef8bdc63a5.undefined)

**节点功能**

计算两个三维向量的加法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 计算结果| 三维向量|   
  
## **16\. 三维向量减法**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/d4906780-c87a-450a-b065-a506ef015e30.undefined)

**节点功能**

计算两个三维向量的减法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 计算结果| 三维向量|   
  
## **17\. 方向向量转旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/61c8be17-610c-4e07-bbbb-7e8681926e34.undefined)

**节点功能**

给定向前向量和向上向量，转化为欧拉角

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 向前向量| 三维向量| 表示单位期望的朝向  
入参| 向上向量| 三维向量| 定义单位的上方向（用于确定旋转的旋转角度），默认值为世界坐标系Y轴正方向  
出参| 旋转| 三维向量|   
  
## **18\. 朝向转旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/d8151626-d3df-404d-853b-51189b1a5988.undefined)

**节点功能**

将方向向量转化为欧拉角

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 朝向| 三维向量|   
出参| 旋转| 三维向量|   
  
## **19\. 正弦函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/ff95393f-207f-46d5-916a-5812261d1dd5.undefined)

**节点功能**

计算输入弧度的正弦

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 弧度| 浮点数|   
出参| 结果| 浮点数|   
  
## **20\. 余弦函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/a619b8f9-4450-4844-aa67-7285b675707a.undefined)

**节点功能**

计算输入弧度的余弦

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 弧度| 浮点数|   
出参| 结果| 浮点数|   
  
## **21\. 正切函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/49290723-e6ad-4bd3-a33e-2ba4d6c3e474.undefined)

**节点功能**

计算输入弧度的正切

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 弧度| 浮点数|   
出参| 结果| 浮点数|   
  
## **22\. 反正弦函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/6f382727-33cb-43cb-8f81-05ff603dcfa4.undefined)

**节点功能**

计算输入的反正弦值，返回为弧度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 浮点数|   
出参| 弧度| 浮点数|   
  
## **23\. 反余弦函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/d3cab6ce-b8fb-4211-b2e5-a64535a5ca15.undefined)

**节点功能**

计算输入的反余弦值，返回为弧度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 浮点数|   
出参| 弧度| 浮点数|   
  
## **24\. 反正切函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/c5063c41-f4c5-432c-8c28-ed30354c2aa7.undefined)

**节点功能**

计算输入的反正切值，返回为弧度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 浮点数|   
出参| 弧度| 浮点数|   
  
## **25\. 三维向量归一化**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/58e34c6e-0ba8-45d5-a2bb-78c05b6fc0e4.undefined)

**节点功能**

将三维向量的长度归一化后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量| 三维向量|   
出参| 结果| 三维向量|   
  
## **26\. 弧度转角度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/91338af0-728f-4a11-83b0-87dadbaa3154.undefined)

**节点功能**

将弧度值转为角度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 弧度| 浮点数|   
出参| 角度| 浮点数|   
  
## **27\. 角度转弧度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/fa4b3fe7-771f-49dc-9258-26d03e58511a.undefined)

**节点功能**

将角度值转为弧度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 角度| 浮点数|   
出参| 弧度| 浮点数|   
  
## **28\. 逻辑与运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/0c53f3bd-7add-4306-9660-01efe3bbc16f.undefined)

**节点功能**

对输入的两个布尔值进行与运算后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 条件1| 布尔值|   
入参| 条件2| 布尔值|   
出参| 结果| 布尔值|   
  
## **29\. 逻辑或运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/6b11f712-ae67-4fa8-b8b0-fb91f1ff8fea.undefined)

**节点功能**

对输入的两个布尔值进行或运算后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 条件1| 布尔值|   
入参| 条件2| 布尔值|   
出参| 结果| 布尔值|   
  
## **30\. 逻辑非运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/34098f6d-bc7d-4abd-b207-1c464b7849dc.undefined)

**节点功能**

对输入的布尔值进行非运算后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 条件| 布尔值|   
出参| 结果| 布尔值|   
  
## **31\. 逻辑异或运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/99849712-903a-479c-8803-f36d27451f68.undefined)

**节点功能**

对输入的两个布尔值进行异或运算后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 条件1| 布尔值|   
入参| 条件2| 布尔值|   
出参| 结果| 布尔值|   
  
## **32\. 是否大于**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/e32e55fe-70ff-489a-8f48-33b5f07104df.undefined)

**节点功能**

返回左值是否大于右值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 布尔值|   
  
## **33\. 是否小于**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/8a6c7ac7-a697-485a-904a-9a60b856b09d.undefined)

**节点功能**

返回左值是否小于右值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 布尔值|   
  
## **34\. 是否小于等于**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/6d8b25d5-890b-44b7-8c17-1de3244c77f9.undefined)

**节点功能**

返回左值是否小于等于右值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 布尔值|   
  
## **35\. 是否大于等于**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/0affb0f5-54ee-4284-aa0c-892adc83a608.undefined)

**节点功能**

返回左值是否大于等于右值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 布尔值|   
  
## **36\. 屏幕坐标转视口坐标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/d380594f-72ea-4694-8ed2-855b198ccf5d.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/2649e639-4fff-4bc8-8b6e-91d00b68fee6.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/e0c17d3a-a2fc-4f8c-8670-07e17a14ba68.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/270eb916-212f-40f9-a01a-1e14b9a5a217.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/bf4941e7-3c2f-4cd7-8572-0dc66dbbf489.undefined)

**节点功能**

将多个类型相同的入参(至多10个)拼装为一个列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 列表| 泛型| 拼装成的列表  
入参| 0~9| 泛型| 将至多10个参数拼装为一个列表  
  
# **四、结构体**

## **1\. 拼装结构体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/edf107b8-d6d2-4dbc-b77e-8a5dff6a5bf3.undefined)

**节点功能**

将多个参数拼合为一个结构体类型的值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 结构体| 结构体|   
  
## **2\. 拆分结构体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/67435fc7-c9fe-4f2f-a171-1f65abb26723.undefined)

**节点功能**

获取指定结构体的所有参数

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 结构体| 结构体|   
  
# **五、字典**

## **1\. 拼装字典**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/9348970a-825c-48b1-b4ef-03d750d3ba1d.undefined)

**节点功能**

将至多50个键值对拼合为一个字典

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 字典| 泛型|   
入参| 键0~49| 泛型|   
入参| 值0~49| 泛型|   
  
## **2\. 建立字典**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhte5piu3it0/017868bb-e940-4e38-b46a-26cfe4fdaeae.undefined)

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
