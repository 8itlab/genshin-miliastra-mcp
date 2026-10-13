# 概念介绍/高级概念/资源系统/装备

(来源：原神千星奇域·综合指南，页面 ID mhkl2yin0cxo)

# 一、装备的定义

装备是一种道具的子类型，和普通道具一样通过背包进行管理，不同之处在于装备可以被装备到装备栏位上，为装备者提供属性加成或额外的逻辑功能

# 二、装备的编辑

## 1.新建装备

同道具编辑的页签，如下图点击新建道具

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/79bc8dcd-7122-4de2-86c2-458fa922b190.png)

在弹出的窗口下拉【选择类型】，选择装备即可新建一个装备模板

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/965062bd-6af6-4537-bb3a-1b7d932b4e52.png)

## 2.基础设置

装备的基础设置和普通道具基本一致，但不支持配置堆叠。可参考[道具](/ys/ugc/tutorial//detail/mhbgx0rspbqu)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/c17318c6-fe4c-428f-a10d-509caf07ded3.png)

## 3.交互设置

交互设置中支持对于装备类型的额外设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/5a788eab-6428-4ca2-a01d-3edea179e0ec.png)

 _装备类型_ ：装备类型可在装备类型页签进行定义，在尝试装备一件装备时，需要 _装备栏位_ 支持该装备类型，才可装备成功

 _详情中显示类型_ ：在实际运行时，界面上是否显示该件装备的类型信息

 _详情中显示标签_ ：在实际运行时，界面上是否显示该件装备的标签信息

 _选择标签_ ：此处可以在已提前配置好的所有装备标签内选择该装备需要携带的 _标签_

 _选择初始词条_ ：此处可以在已提前配置好的所有装备词条内选择该装备需要携带的 _初始词条_

##  4.装备类型

装备类型是装备的属性，被两处业务引用：

 _装备模板_ ：装备本身的类型定义

 _装备栏模板_ ：每个装备栏位定义可以装入哪些类型的装备

当装备模板配置的类型列表与装备栏位的类型列表交集不为空时，即有任意类型匹配成功，即可成功进行装备

由图示 _装备数据管理_ 处进入装备相关编辑界面

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/6530c885-63e9-46bf-bf02-f87a95d48a3f.png)

进入装备类型页签，即可进行装备类型的编辑和新增

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/962c6fcf-c9b3-4a63-9b4b-ff89f45da3e5.png)

 _类型名称_ ：由创作者(奇匠)定义的类型的命名

 _配置ID_ ：装备类型数据的唯一标识

 _引用列表_ ：可以在此查看使用该类型的所有装备模板

## 5.装备标签

标签是一种装备的外显备注，可用于创作者(奇匠)向玩家传达该装备的特性

在装备数据管理的标签页签，可以对装备标签进行定义，并由装备模板引用：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/96cdf8da-67bd-4502-a89a-d1981ba03f65.png)

 _标签名称_ ：由创作者(奇匠)定义的标签的命名

 _配置ID_ ：装备标签数据的唯一标识

 _引用列表_ ：可以在此查看使用该标签的所有装备模板

## 6.装备词条

装备词条是装备属性加成和机制加成的唯一来源，一件装备可以持有多个词条，根据词条的具体配置，当装备进入背包或被装备时，词条提供的加成会应用到持有者或装备者实体上

在装备数据管理的词条页签，可以对装备词条进行定义，并由装备模板引用：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/ffd02a1f-1d82-4573-9a80-0236af4ee198.png)

 _词条名称_ ：由创作者(奇匠)定义的词条的命名

 _配置ID_ ：装备词条数据的唯一标识

 _引用列表_ ：可以在此查看使用该词条的所有装备模板

**词条属性**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/c99e9ae9-a0d2-4006-85ad-f525cf185727.png)

 _生效时机_ ：该词条对应的加成会在什么时点生效

 _获取时生效_ ：装备进入背包时，就对背包持有者生效

 _装备时生效_ ：装入装备栏位时才对装备者生效

词条分为多种不同的类型，其提供加成的内容也不相同



 _基础属性加成_ ：提供基础的战斗属性类型加成

 _选择属性_ ：选择具体要加成哪一种战斗属性，每一个词条能提供的加成属性类型是唯一的

 _加成类型_ ：分为 _随机值_ 和 _固定值_ 两种，随机值加成会从创作者(奇匠)配置的随机值范围内随机一个值作为最终加成，而固定值加成则会使用创作者(奇匠)配置的确定数值作为最终加成

 _随机值范围_ ：加成类型为随机值时，创作者(奇匠)可配置随机的上下限

 _加成固定值_ ：加成类型为固定值时，创作者(奇匠)可配置具体的加成数值

 _描述类型_ ：在游玩过程中查看装备时，在界面上会显示词条的具体描述，创作者(奇匠)可以使用预制好的描述文本，也可以自己对词条描述进行编辑

 _固定描述_ ：使用预制好的描述文本，只在基础属性加成类型的词条上可以使用

 _描述中显示随机值的上下限_ ：开启时则会在固定描述的最后显示配置的随机值上下限

 _自定义描述_ ：创作者(奇匠)自定编辑描述，选择后可在下方的文本框内进行文本输入

 _插入变量_ ：在词条描述文本中插入占位符，以显示加成的范围以及实际加成数值



 _赋予节点图_ ：提供创作者(奇匠)自己定义的节点图逻辑

 _关联节点图_ ：词条类型为赋予节点图时，可以选择所需关联的节点图



 _赋予单位状态_ ：支持词条绑定一个单位状态

 _对应单位状态_ ：词条类型为赋予单位状态时，可以选择所需关联的单位状态

# 三、装备实例

装备未被拾取时，会以模板的形式存在在掉落物组件内，当装备模板首次被获取进入背包时，会进行初始化，此时词条的数值会发生随机，并抛出 _装备初始化_ 事件，此时事件出参会返回装备实例的唯一索引，通过此索引即可对装备的词条属性进行动态修改，如创作者(奇匠)有自定义的装备初始化规则，也可在此事件内自行编写逻辑覆写预制的随机规则

# 四、装备栏

装备栏是装备的容器，装备的词条生效依赖装备行为触发

## 1.装备栏模板

用于定义装备栏位的样式、数量以及每个栏位的装备标签。通过【货币与背包】按钮进入编辑界面

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/d8814d19-86f8-4f18-9c45-d958bcc2bae2.png)

进入装备栏页签，可进行模板编辑

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/74ea11dd-43d3-414d-ad30-f8d150ab53c4.png)

 _模板名称_ ：由创作者(奇匠)定义的装备栏模板的命名

 _配置ID_ ：装备栏模板数据的唯一标识

 _装备栏样式_ ：通过点击“加号”图标，可以动态叠加装备栏位，添加完成后可对一个装备栏位进行详细设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/debd3a5b-d691-42aa-9592-4685c233ed1e.png)

 _栏位设置_ ：单个装备栏位的设置

 _当前栏位名称_ ：创作者(奇匠)可以为栏位命名，会显示在栏位界面的底部

 _可装备类型_ ：选择该栏位可接受的装备类型

 _图标_ ：未放入装备时，栏位界面的底图显示

配置完成后，一个装备栏位的表现如下图所示：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/eaff6cce-9ce8-4ad2-98bf-cfabe9bd33b4.png)

## 2.装备栏组件

装备栏组件仅有角色可以添加

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/ccc34770-9a7c-42ab-b068-eb24c2e64711.png)

选择添加通用组件->添加装备栏组件即可添加

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/94827ad4-e7d4-4463-8f5d-25eac1a038c4.png)

组件界面如下

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/38282e6c-afdc-4d23-93a0-d034390467aa.png)

 _装备栏模板_ ：引用预先定义好的装备栏模板

# 五、节点图修改装备属性

## 1.装备相关执行节点



修改装备词条值

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/32364d0f-281d-4c30-b683-c15aa79752d9.png)



移除装备词条

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/28642060-abf4-4593-b484-61f64a7e25c3.png)



装备添加词条

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/779fb97f-461f-4a9d-9305-a25f31a24aa7.png)



装备指定序号添加词条

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/0134ebad-dc1c-4da9-9e93-b6d756b6ff66.png)

## 2.装备相关事件节点



装备初始化时

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/5b3ea4f9-c5e6-455d-b045-55ef3ef7aec1.png)



装备的词条数值改变时

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/ad10d5e3-39ca-48f6-85cb-d0ec978f9813.png)



装备被卸下时

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/7149f44d-c5f7-420e-abe3-a3fae3e9d852.png)



装备被穿戴时

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/34ebfd32-4023-425c-b119-cd03e8d215dc.png)

## 3.装备相关查询节点



查询装备标签列表

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/170fdee5-0c1b-4dc7-bf64-15ac191a8dad.png)



获取装备词条配置ID

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/a2b461bf-14e3-407f-988f-cc33965227e3.png)



获取装备词条列表

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/3c16ccc7-75c6-459c-80f5-c44b5c8bc0cb.png)



获取装备词条数值

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkl2yin0cxo/5e59d9b1-210e-4140-8bca-4f2b5150497b.png)
