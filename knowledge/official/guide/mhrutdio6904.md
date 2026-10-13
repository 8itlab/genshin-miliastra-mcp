# 概念介绍/功能/基础信息/模型

(来源：原神千星奇域·综合指南，页面 ID mhrutdio6904)

表示该单位模型包含的一些功能，包括 _预设状态_ 、 _单位挂接点_ 和 _装饰物_

对于不同的模型，其所包含的功能也有所不同

# 一、预设状态

 _预设状态_ 是物件的独有属性，每一个预设状态代表物件的一组动画状态

只有部分物件持有预设状态属性

## 1.预设状态的介绍

### (1)预设状态

 _预设状态_ 代表了一组状态的定义，比如宝箱的“开-关”，火把的“点燃-熄灭”等，且满足以下特性：



每一组预设状态下的所有子状态都是互斥的



每一组预设状态下的子状态都可以相互切换

### (2)预设状态值

每组预设状态下的子状态通过 _状态值_ 来表示，如下图中的“0”状态代表地刺机关的关闭状态，“1”状态代表地刺机关的打开状态

每种状态值都代表了一种特定的动画状态

切换到不同的状态值时，动画表现也会发生变化，有些状态值的切换还会有对应的动画过渡表现

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhrutdio6904/2cc53650-7dc6-437d-9182-ee9ada267e5e.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhrutdio6904/ff4d1214-6470-493f-89ff-27e6b291a96c.png)

## 2.节点图控制预设状态

预设状态变化时

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhrutdio6904/e5ad53aa-f4ee-4c4c-9370-c402909b900a.png)

设置预设状态

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhrutdio6904/b63c7944-de94-47ed-8ca7-0fb8d2d0d954.png)

获取预设状态

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhrutdio6904/61752951-b497-497c-9287-45da850699c4.png)

# 二、单位挂接点

 _单位挂接点_ 是指在 _实体_ 的骨骼或结构上指定的特定位置，用于附加其他 _单位_ 或 _特效_ 。

## 1.查看默认的挂接点

在 _元件_ 或实体的基础信息栏可以看到预制的 _默认挂接点_ ，包括其命名和位置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhrutdio6904/c800c1da-791c-4a32-9752-5dc4415a422a.png)

每个实体都会带有默认的基础挂接点： _中心原点_ ，该挂点的位置也等同于实体在场景内的位置

此外，造物类型和角色类型的实体还会根据骨骼结构有对应的默认挂接点，该类挂接点的特性是在实体的骨骼运动时，挂接点会跟随骨骼位置移动：比如角色的手部挂点，因此可以被用来作为射击动作的 _本地投射物_ 创建点

## 2.添加额外的挂接点

参考[自定义挂接点](/ys/ugc/tutorial//detail/mhmshmimtegs)

# 三、装饰物

## 1.装饰物的概念

### (1)装饰物功能是什么

根据创作者(奇匠)需求，可以在元件或实体上挂接静态物件模型，实现更多自定义的表现

### (2)装饰物功能相关定义

a.装饰物属于元件（包括物件、造物）的基础信息，也可以在实体摆放场景中对实体进行修改

b.装饰物配置不会导致元件或实体数量增减

## 2.装饰物的编辑

### (1)编辑界面位置

装饰物编辑的入口位于元件（或实体）基础信息中的“模型”栏目下。

该栏目下可见主模型、单位挂接点以及装饰物列表编辑界面。

点击“装饰物编辑”可以打开装饰物列表。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhrutdio6904/60978507-5f1b-45c4-9fde-18d2434d82c3.png)

点击选择模型资产即可打开模型资产库

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhrutdio6904/202ad1c6-f4c2-4a41-ba3b-0a86da80b9aa.png)

在模型资产库点击想添加的模型即可添加一个装饰物

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhrutdio6904/1b535847-0c1a-4c8a-bdcf-add2eb230da5.png)

### (2)装饰物的属性

a.模型

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhrutdio6904/16e60e8b-0a41-4216-86c9-672527c9c1bd.png)

选择该装饰物的模型

b.变换

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhrutdio6904/3b87d29f-39f2-4bc0-aa7d-edff7cda90a3.png)

设置该装饰物跟随在主模型的哪个挂接点上，并配置额外的位置、旋转和缩放。

c.原生碰撞

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhrutdio6904/46cefc06-719f-4070-8a79-3b48a792935c.png)

设置其碰撞的开关、是否可攀爬。

# 四、颜色与材质

 _颜色与材质_ 可以在元件或实体的基础颜色和材质上叠加/替换新的颜色和材质

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhrutdio6904/7fe7e22b-9074-4bff-bc2c-bfcf29b326aa.png)

## 1.自定义颜色

自定义颜色的定义是可以在元件或实体自身的颜色基础上，叠加新的颜色，或以新的颜色覆盖原本颜色![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhrutdio6904/8cca52c6-4f88-4eea-a078-628390dff611.png)

配置参数| 说明  
---|---  
 _启用自定义颜色_|  功能开启时：可以使用自定义的颜色覆盖物件原有颜色，或叠加在物件的原有颜色上功能关闭时：使用物件的原生颜色  
 _覆盖装饰物颜色_|  功能开启时：将使用主物件模型配置的颜色覆盖所有装饰物颜色功能关闭时：装饰物使用自身的原生颜色或已编辑的自定义颜色  
 _颜色_|  可通过选色器或修改颜色代码，选取需要更改的颜色，也可以修改当前使用的自定义颜色的透明度![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhrutdio6904/7847efa6-7c24-4c21-9bbc-7b0a024fd476.png)  
 _节点图颜色码_|  当前使用的颜色对应的10进制代码，用于在节点图中进行调用  
 _颜色叠加模式_|  可选覆盖和整篇叠底![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhrutdio6904/aecbd8e2-8e0b-4f22-ba88-672a5f0c3ba4.png)覆盖：自定义颜色将完全替换实体或物件的原生颜色正片叠底：自定义颜色将叠加在原生颜色上  
  
注意：组件中的透明度参数取值范围为0-100的整数，而对于节点【修改模型颜色和材质】中的【颜色透明度】参数，取值范围也为0-100的整数，如果输入或传入的是浮点数，则会在实际生效时将该浮点数向下取整生效

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhrutdio6904/374fe98e-3af1-4c2f-a1de-cf0502b965f1.undefined)

## 2.自定义材质

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhrutdio6904/cc28219c-b2f0-4914-9385-7d97c9ae9a09.png)

配置参数| 说明  
---|---  
启用自定义材质| 功能开启时：可以使用自定义的材质叠加在物件的原生材质上功能关闭时：使用物件的原生材质  
覆盖装饰物材质| 功能开启时：将使用主物件模型配置的材质替换所有装饰物的自定义材质功能关闭时：装饰物使用自身的自定义材质  
填充材质| 可选冰材质和石化材质![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhrutdio6904/7bdfa883-045d-438b-b953-6df26e3ca474.png)冰材质：使元件或实体拥有结冰的材质效果![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhrutdio6904/2d7693ec-c6f8-4211-b618-3c5910b185e8.png)石化材质：使元件或实体拥有石化的材质效果![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhrutdio6904/5712c11e-3682-4d5a-ae49-864212e98972.png)
