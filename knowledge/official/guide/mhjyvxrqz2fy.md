# 节点介绍/客户端节点/造物状态节点图/运算节点

(来源：原神千星奇域·综合指南，页面 ID mhjyvxrqz2fy)

# **一、通用**  
  
## **1\. 枚举匹配**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/26328240-4065-4f25-9c7f-cc0f2315af78.undefined)

**节点功能**

确认枚举的类型后，判断两个输入的值是否相等

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 枚举1| 泛型|   
入参| 枚举2| 泛型|   
出参| 结果| 布尔值| 相等输出“是”，不相等输出“否”  
  
## **2\. 是否相等**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/fe2b9483-394d-42ab-89ce-9462a4c6563a.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/26330031-f339-4c2e-957c-280639a7db43.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/116cb02e-961a-4947-8b14-3fb5580b59bd.undefined)

**节点功能**

对输入的两个布尔值进行与运算后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 条件1| 布尔值|   
入参| 条件2| 布尔值|   
出参| 结果| 布尔值|   
  
## **2\. 逻辑或运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/3d586d72-5732-4657-9d59-5f46c8099c23.undefined)

**节点功能**

对输入的两个布尔值进行或运算后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 条件1| 布尔值|   
入参| 条件2| 布尔值|   
出参| 结果| 布尔值|   
  
## **3\. 逻辑非运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/b4897b9d-29bb-4804-8b25-2b4d2de37086.undefined)

**节点功能**

对输入的布尔值进行非运算后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 条件| 布尔值|   
出参| 结果| 布尔值|   
  
## **4\. 逻辑异或运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/cf362371-be03-4f4a-8c0b-60c47864133f.undefined)

**节点功能**

对输入的两个布尔值进行异或运算后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 条件1| 布尔值|   
入参| 条件2| 布尔值|   
出参| 结果| 布尔值|   
  
## **5\. 是否大于**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/f622d77b-7491-4361-82b0-4b69bf552e7f.undefined)

**节点功能**

返回左值是否大于右值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 布尔值|   
  
## **6\. 是否小于**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/e4ea2e87-902b-4020-b78e-52ca713975fb.undefined)

**节点功能**

返回左值是否小于右值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 布尔值|   
  
## **7\. 是否小于等于**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/6769ad18-6564-4361-bcfb-e7d62be22613.undefined)

**节点功能**

返回左值是否小于等于右值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 布尔值|   
  
## **8\. 是否大于等于**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/11545e69-3ab1-463f-9bb6-8391cb2f7156.undefined)

**节点功能**

返回左值是否大于等于右值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 布尔值|   
  
## **9\. 加法运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/39f4f529-6853-48fb-8d97-d01146e7ac56.undefined)

**节点功能**

计算两个浮点数或整数的加法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 泛型|   
  
## **10\. 减法运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/8e7abdd1-4a5c-4bc5-b7c2-12a2239917cf.undefined)

**节点功能**

计算两个浮点数或整数的减法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 泛型|   
  
## **11\. 乘法运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/f8670d83-3dee-4c09-864d-e86309e9a4ca.undefined)

**节点功能**

乘法运算，支持浮点数乘法和整数乘法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| | 泛型|   
入参| | 泛型|   
出参| 结果| 泛型|   
  
## **12\. 除法运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/5ee62803-8043-4286-b7ec-91b9a6538620.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/d3e509a1-6cf7-48e5-9915-083b16b8d631.undefined)

**节点功能**

返回输入的绝对值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 泛型|   
出参| 结果| 泛型|   
  
## **14\. 获取随机数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/4678d951-f546-40b2-82f2-9e12a15132e1.undefined)

**节点功能**

获取一个大于等于下限，小于等于上限的随机数。注意该节点生成的随机数包含上下限

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 下限| 泛型|   
入参| 上限| 泛型|   
出参| 随机数| 泛型|   
  
## **15\. 拼装列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/8355a3dd-8f26-4b22-b59b-4c588fc7ad43.undefined)

**节点功能**

将多个类型相同的入参(至多10个)拼装为一个列表

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 列表| 泛型| 拼装成的列表  
入参| 0~9| 泛型| 将至多10个参数拼装为一个列表  
  
## **16\. 三维向量内积**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/9f616f7e-3ffe-4036-a47d-a5fdf3dcaafb.undefined)

**节点功能**

计算两个输入三维向量的内积（点乘）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 计算结果| 浮点数|   
  
## **17\. 三维向量外积**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/b8c43100-12a4-4a47-82bf-6358d76de738.undefined)

**节点功能**

计算两个三维向量的外积（叉乘）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 计算结果| 三维向量|   
  
## **18\. 拆分三维向量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/35ea7670-d63e-4e2f-88a1-1d7b0b2c4bc1.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/bee74b0e-7b5f-4e1a-ba7f-62e9a6368598.undefined)

**节点功能**

将输入的三维向量缩放后输出（三维向量数乘）

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 缩放倍率| 浮点数|   
入参| 三维向量| 三维向量|   
出参| 结果| 三维向量|   
  
## **20\. 三维向量夹角**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/63cfaf0b-9446-4a98-9a0c-2b9543ad4f84.undefined)

**节点功能**

计算两个三维向量之间的夹角，以角度输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 夹角(角度)| 浮点数|   
  
## **21\. 三维向量旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/16d4703e-7d6e-40cf-9a7c-06282e595e26.undefined)

**节点功能**

将被旋转的三维向量，按照旋转所表示的欧拉角进行旋转后返回结果

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 被旋转的三维向量| 三维向量|   
入参| 旋转| 三维向量|   
出参| 结果| 三维向量|   
  
## **22\. 三维向量模运算**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/8e5a6641-fa60-49e3-9441-e2bf8ade30e6.undefined)

**节点功能**

计算输入三维向量的模

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量| 三维向量|   
出参| 结果| 浮点数|   
  
## **23\. 创建三维向量**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/add5597a-7652-4b51-838e-8e97dd2abb30.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/6e03a19c-5a86-4e56-8049-f797ed335099.undefined)

**节点功能**

计算两个三维向量的加法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 计算结果| 三维向量|   
  
## **25\. 三维向量减法**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/0e60fe85-013c-44ec-aee5-1c90283e6572.undefined)

**节点功能**

计算两个三维向量的减法

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量1| 三维向量|   
入参| 三维向量2| 三维向量|   
出参| 计算结果| 三维向量|   
  
## **26\. 方向向量转旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/5a3f2704-78a7-4bc6-961c-426f23af0472.undefined)

**节点功能**

给定向前向量和向上向量，转化为欧拉角

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 向前向量| 三维向量| 表示单位期望的朝向  
入参| 向上向量| 三维向量| 定义单位的上方向（用于确定旋转的旋转角度），默认值为世界坐标系Y轴正方向  
出参| 旋转| 三维向量|   
  
## **27\. 朝向转旋转**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/de4e0fb9-b029-419b-a976-93ce85065a6f.undefined)

**节点功能**

将方向向量转化为欧拉角

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 朝向| 三维向量|   
出参| 旋转| 三维向量|   
  
## **28\. 正弦函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/1b96f5b8-bc5d-4564-b468-920ec3ac348c.undefined)

**节点功能**

计算输入弧度的正弦

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 弧度| 浮点数|   
出参| 结果| 浮点数|   
  
## **29\. 余弦函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/73d2ba09-22a3-4b3b-94c8-18a104d019f8.undefined)

**节点功能**

计算输入弧度的余弦

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 弧度| 浮点数|   
出参| 结果| 浮点数|   
  
## **30\. 正切函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/9e13b766-8bb5-4002-b115-9303ab3f1e66.undefined)

**节点功能**

计算输入弧度的正切

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 弧度| 浮点数|   
出参| 结果| 浮点数|   
  
## **31\. 反正弦函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/e03e418d-0930-4ef4-bbc9-975a01c08cb5.undefined)

**节点功能**

计算输入的反正弦值，返回为弧度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 浮点数|   
出参| 弧度| 浮点数|   
  
## **32\. 反余弦函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/f01ed905-3102-4199-bcb6-901f9ead5204.undefined)

**节点功能**

计算输入的反余弦值，返回为弧度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 浮点数|   
出参| 弧度| 浮点数|   
  
## **33\. 反正切函数**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/9347283c-3bd1-47d2-a2e2-bcb6045c6269.undefined)

**节点功能**

计算输入的反正切值，返回为弧度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 输入| 浮点数|   
出参| 弧度| 浮点数|   
  
## **34\. 三维向量归一化**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/e4f58d89-c025-4736-a14c-383d47291039.undefined)

**节点功能**

将三维向量的长度归一化后输出

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 三维向量| 三维向量|   
出参| 结果| 三维向量|   
  
## **35\. 弧度转角度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/8bfe3be0-f3f4-4adb-b21d-48235766e07e.undefined)

**节点功能**

将弧度值转为角度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 弧度| 浮点数|   
出参| 角度| 浮点数|   
  
## **36\. 角度转弧度**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/f97f5fcd-605b-4b4b-9300-f11f884eee75.undefined)

**节点功能**

将角度值转为弧度值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 角度| 浮点数|   
出参| 弧度| 浮点数|   
  
# **三、字典**

## **1\. 拼装字典**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/ec2caa8c-6dab-4465-bcf1-a1e0a5862b88.undefined)

**节点功能**

将至多50个键值对拼合为一个字典

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 字典| 泛型|   
入参| 键0~49| 泛型|   
入参| 值0~49| 泛型|   
  
## **2\. 建立字典**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/de88c08e-54e6-4177-90bd-68fe2be57f73.undefined)

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

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/7ad95688-67a7-4bc0-9a1b-b478878db79d.undefined)

**节点功能**

将多个参数拼合为一个结构体类型的值

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
出参| 结构体| 结构体|   
  
## **2\. 拆分结构体**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhjyvxrqz2fy/febd7fc1-6f3c-4bc8-a10c-c81166aec58b.undefined)

**节点功能**

获取指定结构体的所有参数

**节点参数**

**参数类型**| **参数名**| **类型**| **说明**  
---|---|---|---  
入参| 结构体| 结构体|
