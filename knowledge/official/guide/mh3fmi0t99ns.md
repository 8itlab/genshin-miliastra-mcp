# 附录/节点图高级特性/结构体

(来源：原神千星奇域·综合指南，页面 ID mh3fmi0t99ns)

#  一、结构体是什么

 _结构体_ 是一种允许创作者(奇匠)将一组不同类型的数据整合在一起，形成一个自定义数据的高级数据结构

例如：在某些玩法中，创作者(奇匠)希望设计一个具有多种属性的【武器】。这个武器包括了【名字】、【攻击力】、【是否已强化】这三个字段

创作者(奇匠)希望玩家获取了这个武器后，可以将武器的数据以自定义变量的形式存储下来，以便后续使用。同时，玩家可能在玩法内获取有着相同字段的多种不同武器

那么结构体这个数据结构可以很有效的解决这样的需求

创作者(奇匠)定义一个名为【武器数据】的结构体，这个结构体包含了【名字】（ _字符串_ ）、【攻击力】（ _浮点数_ ）、【是否已强化】（ _布尔值_ ）这三个属性

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh3fmi0t99ns/e5db55a4-ab6b-484f-a6b6-c0e83b4b8418.png)

在完成定义后，创作者(奇匠)就可以把【武器数据】当作一种常规的数据类型使用，例如：在 _自定义变量_ 中定义，并在节点图中使用 _修改结构体_ 等节点修改其中存储的值

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh3fmi0t99ns/d505f809-0028-4f5e-ae75-709b171103c6.png)

创作者(奇匠)还可以结合 _字典_ 等数据结构，在自定义变量中维护武器相关的全量数据

如下图所示，可以定义一个整数到【武器数据】结构体的字典，将其当作一个武器库的数据使用（整数作为id）

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh3fmi0t99ns/0113515f-c41d-412f-bcde-d4cc8c511bc0.png)

## 1.结构体的定义

结构体是一种可以在服务端节点图中使用的自定义数据结构

每个结构体有一个唯一的名字，用于标识这个结构体

每个结构体内可以包含多个任意数据类型的数据，每个数据需要有一个唯一的字段名。这个数据被称为结构体的 _成员_

以上文【武器数据】结构体为例，其结构如下

**字段名**| **类型**  
---|---  
名字| 字符串  
攻击力| 浮点数  
是否已强化| 布尔值  
  
结构体中可以使用目前可用的所有基础、列表、字典以及结构体数据类型：

**数据类型**| **列表数据类型**  
---|---  
实体| 实体列表  
GUID| GUID列表  
整数| 整数列表  
布尔值| 布尔值列表  
浮点数| 浮点数列表  
字符串| 字符串列表  
阵营| 阵营列表  
三维向量| 三维向量列表  
元件ID| 元件ID列表  
配置ID| 配置ID列表  
自定义结构体| 自定义结构体列表  
所有类型的字典|   
  
需要注意的是，结构体内部是可以继续使用结构体以及结构体列表的（即**支持结构体嵌套** ）

## 2.结构体相关功能要点



**结构体的类型**

结构体的类型由其名字完全确定，不同名的结构体即使内部的数据结构相同，也是不同的结构体，在节点图中不能相连

因此结构体间也不允许同名



**结构体的引用传递**

与列表相似，结构体在节点图中也是以引用的方式进行传递的。因此结构体相关的修改节点会直接作用于自定义变量、节点图变量内的结构体数据，具体见[自定义变量](/ys/ugc/tutorial//detail/mhso1b9wjica)

同理，该修改方式不会触发【自定义变量变化时】事件，需要通过【获取自定义变量】节点来获取变化后的值

# 二、创建结构体

从系统菜单中找到【高级数据管理】选项，打开结构体编辑页面

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh3fmi0t99ns/0e6ce08a-e88c-4d9f-b687-3a26275f0fe0.png)

在结构体编辑页面内，可以查看关卡内已创建的结构体、新增结构体以及修改结构体内的成员的值

可以新增结构体，图中A

可以在结构体内新增成员，图中B

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh3fmi0t99ns/616e8bc0-a1cc-4d4e-a0e8-93328b6efa66.png)

完成创建后，即可以在 _服务端节点图_ 、 _自定义变量_ 、 _节点图变量_ 等功能中使用已定义的结构体

# 三、在泛型中使用结构体

在服务端节点图中，结构体以及结构体列表是一种较为特殊的 _泛型引脚_ 。需要选择特定的结构体或结构体列表后，才能将对应节点确定为特定的结构体或结构体列表类型

在可以使用结构体的泛型引脚上，可以在泛型的展开菜单中找到【结构体】和【结构体列表】选项，展开后可以找到所有当前关卡已定义的结构体数据类型

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh3fmi0t99ns/bc6fb362-54c1-4761-98a4-7eae0da22113.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh3fmi0t99ns/edfbcc74-1d61-4796-863b-7a8b912707af.png)

# 四、结构体相关节点

## 1.运算节点

**拼装结构体**

生成一个结构体，需要传入或者直接填写结构体内的各个参数

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh3fmi0t99ns/c3ecfd1d-7022-4119-a5a1-6370a24cc5b9.png)

使用该节点需要先通过泛型选择按钮选择已定义的结构体类型

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh3fmi0t99ns/49a68a38-9797-4c09-b5b8-33faf33a870b.png)

选择对应的结构体后，该节点会显示结构体定义中的所有成员变量

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh3fmi0t99ns/e8f74ece-ab2c-4a6a-9896-457f92ae6b2e.png)

**节点类型** ：运算

**节点功能**



填写结构体内的各个参数的值以生成一个结构体数据



需要定义对应类型的结构体后才可使用该节点

**拆分结构体**

传入一个结构体，获取这个结构体每个成员的值

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh3fmi0t99ns/c9614101-f35e-4345-81b2-4d1fa4c0ea94.png)

使用该节点需要先通过泛型选择按钮选择已定义的结构体类型

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh3fmi0t99ns/f7c5bd55-6f19-440f-81cd-1a69a48379b2.png)

选择对应的结构体后，该节点会显示结构体定义中的所有成员变量

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh3fmi0t99ns/1ac00965-26e8-4bfb-a5f3-ee442d29c98c.png)

**节点类型** ：运算

**节点功能**



返回传入的结构体数据内的各个成员的值



需要定义对应类型的结构体后才可使用该节点

## 2.执行节点

**修改结构体**

传入一个结构体，修改这个结构体内部分成员的值

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh3fmi0t99ns/070b7ef9-fa03-4075-8d45-a10da6e9208d.png)

使用该节点需要先通过泛型选择按钮选择已定义的结构体类型

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh3fmi0t99ns/7173bf2e-7132-4a2c-a617-ccd23f60092f.png)

选择对应的结构体后，该节点会变为如下结构

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh3fmi0t99ns/6bcd94b4-3ebb-45d3-a84e-2a7694403fc0.png)

可以通过下拉选项，选择需要修改的成员，只有被勾选的成员的值才会被修改

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh3fmi0t99ns/caf0f463-be4a-4a18-a27f-a8334b1e8fbe.png)

如下图，只有【名字】和【攻击力】字段的值会被修改

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh3fmi0t99ns/b2c8701c-c034-4b6b-bdda-0c6090bf1269.png)

**节点类型** ：执行

**节点功能**



修改结构体数据内的部分成员的值



可以选取需要修改的值。未被选取的成员的值不会被修改
