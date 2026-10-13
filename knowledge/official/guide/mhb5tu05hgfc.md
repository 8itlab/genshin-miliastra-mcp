# 节点介绍/客户端节点/造物状态决策节点图/运算节点

(来源：原神千星奇域·综合指南，页面 ID mhb5tu05hgfc)

# **一、通用**  
  
## **1\. 枚举匹配**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/c6c9c4de-f423-4c80-a0b2-e179dcc9bbfe.undefined)

**节点功能**

确认枚举的类型后，判断两个输入的值是否相等

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 枚举1| 泛型|   
入参| 枚举2| 泛型|   
出参| 结果| 布尔值| 相等输出“是”，不相等输出“否”  
  
## **2\. 是否相等**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/eba39343-77ce-416b-9d60-00d9829d8cc3.undefined)

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
  
## **3\. 数据类型转换**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/d709da16-5f9a-4e04-b713-ba3200ca538f.undefined)

**节点功能**

将输入的参数类型转换为另一种类型输出。具体规则见[基础概念](/ys/ugc/tutorial//detail/mhk23ora1wom)-【基础数据类型之间的转换规则】

在客户端节点中对于浮点数转整数，会截尾取整

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 泛型|   
出参| 转换结果| 泛型|   
  
# **二、数学**

## **1\. 逻辑与运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/1f711a98-77e8-41b3-b2a5-8bb0f59122a8.undefined)

**节点功能**

对输入的两个布尔值进行与运算后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 条件1| 布尔值|   
入参| 条件2| 布尔值|   
出参| 结果| 布尔值|   
  
## **2\. 逻辑或运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/635e2df1-dc25-4a18-a882-adc679a48f5b.undefined)

**节点功能**

对输入的两个布尔值进行或运算后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 条件1| 布尔值|   
入参| 条件2| 布尔值|   
出参| 结果| 布尔值|   
  
## **3\. 逻辑非运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/02899ff5-87b8-4fe1-ae0d-a8617a2e784f.undefined)

**节点功能**

对输入的布尔值进行非运算后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 条件| 布尔值|   
出参| 结果| 布尔值|   
  
## **4\. 逻辑异或运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/fcc15368-2da2-492a-8cc3-a9ec780e206e.undefined)

**节点功能**

对输入的两个布尔值进行异或运算后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 条件1| 布尔值|   
入参| 条件2| 布尔值|   
出参| 结果| 布尔值|   
  
## **5\. 是否大于**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/44a9cddf-29fb-4fda-8e8e-ea526215db0e.undefined)

**节点功能**

返回左值是否大于右值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 布尔值|   
  
## **6\. 是否小于**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/44594132-0a9f-4f77-8660-b8abfe3c8f40.undefined)

**节点功能**

返回左值是否小于右值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 布尔值|   
  
## **7\. 是否小于等于**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/2b58c438-6b45-45b8-ba6b-0b8562b359a6.undefined)

**节点功能**

返回左值是否小于等于右值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 布尔值|   
  
## **8\. 是否大于等于**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/fd7ced12-7a16-48dd-b2bc-193310e15760.undefined)

**节点功能**

返回左值是否大于等于右值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 布尔值|   
  
## **9\. 加法运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/e6de7d74-29e0-410c-9bb1-e7007883e25c.undefined)

**节点功能**

计算两个浮点数或整数的加法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 泛型|   
  
## **10\. 减法运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/3eedd2d6-215e-42d0-9d4a-731c1c922209.undefined)

**节点功能**

计算两个浮点数或整数的减法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 泛型|   
  
## **11\. 乘法运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/9c05baef-99ad-4133-957f-b51f69326116.undefined)

**节点功能**

乘法运算，支持浮点数乘法和整数乘法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 泛型|   
  
## **12\. 除法运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/f8e51c6c-f02f-4e55-acfc-fabbc941c5f6.undefined)

**节点功能**

除法运算，支持浮点数除法和整数除法。整数除法返回整除结果

除数不应为0，否则可能返回非法值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 泛型|   
  
## **13\. 绝对值运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/35e0f258-d2bb-400b-beba-2b837eea6d2c.undefined)

**节点功能**

返回输入的绝对值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 泛型|   
出参| 结果| 泛型|   
  
## **14\. 获取随机数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/56294148-e8c3-49db-920d-ca074512c0c3.undefined)

**节点功能**

获取一个大于等于下限，小于等于上限的随机数。注意该节点生成的随机数包含上下限

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 下限| 泛型|   
入参| 上限| 泛型|   
出参| 随机数| 泛型|   
  
## **15\. 拼装列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/34b481f2-6bb9-4f55-b515-60e866428731.undefined)

**节点功能**

将多个类型相同的入参(至多10个)拼装为一个列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 列表| 泛型| 拼装成的列表  
入参| 0~9| 泛型| 将至多10个参数拼装为一个列表  
  
## **16\. 三维向量内积**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/902ee577-25af-4aac-bd10-af54765233bf.undefined)

**节点功能**

计算两个输入三维向量的内积（点乘）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 计算结果| 浮点数|   
  
## **17\. 三维向量外积**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/41516324-a00b-4f68-8d91-37b7250fd398.undefined)

**节点功能**

计算两个三维向量的外积（叉乘）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 计算结果| 三维向量|   
  
## **18\. 拆分三维向量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/20201723-b472-42ae-975c-6747d28e6514.undefined)

**节点功能**

将三维向量的x、y、z分量输出为三个浮点数

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量| 三维向量|   
出参| X分量| 浮点数|   
出参| Y分量| 浮点数|   
出参| Z分量| 浮点数|   
  
## **19\. 三维向量缩放**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/94a21738-dd40-4739-96c0-82452ee1b92a.undefined)

**节点功能**

将输入的三维向量缩放后输出（三维向量数乘）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 缩放倍率| 浮点数|   
入参| 三维向量| 三维向量|   
出参| 结果| 三维向量|   
  
## **20\. 三维向量夹角**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/e442bb8b-0bed-4c0e-aa8d-24926ea522b2.undefined)

**节点功能**

计算两个三维向量之间的夹角，以角度输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 夹角(角度)| 浮点数|   
  
## **21\. 三维向量旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/bb09d967-fe9a-4e52-a27e-cf794bdd0bc0.undefined)

**节点功能**

将被旋转的三维向量，按照旋转所表示的欧拉角进行旋转后返回结果

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 被旋转的三维向量| 三维向量|   
入参| 旋转| 三维向量|   
出参| 结果| 三维向量|   
  
## **22\. 三维向量模运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/44eeb55e-1410-4cb3-92f6-d9fc36ffaafc.undefined)

**节点功能**

计算输入三维向量的模

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量| 三维向量|   
出参| 结果| 浮点数|   
  
## **23\. 创建三维向量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/de91edfb-b6b8-41ec-892f-c503114266f0.undefined)

**节点功能**

根据x、y、z分量创建一个三维向量

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| X分量| 浮点数|   
入参| Y分量| 浮点数|   
入参| Z分量| 浮点数|   
出参| 三维向量| 三维向量|   
  
## **24\. 三维向量加法**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/503acfb4-adbe-496d-9f25-a5392e58f4cc.undefined)

**节点功能**

计算两个三维向量的加法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 计算结果| 三维向量|   
  
## **25\. 三维向量减法**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/d51d89eb-535a-4269-a17c-b1be8e126d95.undefined)

**节点功能**

计算两个三维向量的减法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 计算结果| 三维向量|   
  
## **26\. 方向向量转旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/e8325ffe-8229-444b-ab03-eafa20763deb.undefined)

**节点功能**

给定向前向量和向上向量，转化为欧拉角

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 向前向量| 三维向量| 表示单位期望的朝向  
入参| 向上向量| 三维向量| 定义单位的上方向（用于确定旋转的旋转角度），默认值为世界坐标系Y轴正方向  
出参| 旋转| 三维向量|   
  
## **27\. 朝向转旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/d5ff31ef-358c-448e-8bc5-dd56673421a3.undefined)

**节点功能**

将方向向量转化为欧拉角

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 朝向| 三维向量|   
出参| 旋转| 三维向量|   
  
## **28\. 正弦函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/24aef3df-5364-4916-89c6-40f6fea147da.undefined)

**节点功能**

计算输入弧度的正弦

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 弧度| 浮点数|   
出参| 结果| 浮点数|   
  
## **29\. 余弦函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/2f0995af-b09e-4115-9774-fb66df9e0ec5.undefined)

**节点功能**

计算输入弧度的余弦

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 弧度| 浮点数|   
出参| 结果| 浮点数|   
  
## **30\. 正切函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/92338374-0a31-48df-bd8e-b1b46ce2105a.undefined)

**节点功能**

计算输入弧度的正切

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 弧度| 浮点数|   
出参| 结果| 浮点数|   
  
## **31\. 反正弦函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/6a065c18-dd87-48bb-9b8b-0d63d08e715d.undefined)

**节点功能**

计算输入的反正弦值，返回为弧度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 浮点数|   
出参| 弧度| 浮点数|   
  
## **32\. 反余弦函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/d5418d2b-309f-4c23-8b94-6996529299ca.undefined)

**节点功能**

计算输入的反余弦值，返回为弧度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 浮点数|   
出参| 弧度| 浮点数|   
  
## **33\. 反正切函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/d4b48915-f4fb-497c-8871-853ee059b003.undefined)

**节点功能**

计算输入的反正切值，返回为弧度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 浮点数|   
出参| 弧度| 浮点数|   
  
## **34\. 三维向量归一化**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/ca7d1e5c-d5ef-4631-a301-0534851c2f09.undefined)

**节点功能**

将三维向量的长度归一化后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量| 三维向量|   
出参| 结果| 三维向量|   
  
## **35\. 弧度转角度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/e0f8ee29-edfe-4061-ac9f-bd991a14fd66.undefined)

**节点功能**

将弧度值转为角度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 弧度| 浮点数|   
出参| 角度| 浮点数|   
  
## **36\. 角度转弧度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/05f7f1ce-7a2c-4739-96c5-8731122fadc7.undefined)

**节点功能**

将角度值转为弧度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 角度| 浮点数|   
出参| 弧度| 浮点数|   
  
# **三、字典**

## **1\. 拼装字典**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/7e0a932b-ed14-48ef-b1b8-9a1263ee4a9f.undefined)

**节点功能**

将至多50个键值对拼合为一个字典

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 字典| 泛型|   
入参| 键0~49| 泛型|   
入参| 值0~49| 泛型|   
  
## **2\. 建立字典**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/0454fa56-6b76-461d-bd98-cc2de7d4acb1.undefined)

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
  
# **四、结构体**

## **1\. 拼装结构体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/bf9b5d23-c4b2-4cd2-b5d0-dc457fefd281.undefined)

**节点功能**

将多个参数拼合为一个结构体类型的值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 结构体| 结构体|   
  
## **2\. 拆分结构体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb5tu05hgfc/ae63a9bb-872c-4912-ab48-378266865575.undefined)

**节点功能**

获取指定结构体的所有参数

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 结构体| 结构体|
