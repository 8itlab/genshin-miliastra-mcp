# 概念介绍/功能/特化配置/仇恨配置

(来源：原神千星奇域·综合指南，页面 ID mhw9ut96q96y)

# 一、什么是仇恨

 _仇恨_ 是实体用来选择自身技能目标的功能。仇恨系统会根据一定的规则（取决于使用的仇恨模式）为造物选取一个当前的技能目标

通常来说，造物会优先锁定并持续攻击当前的 _仇恨目标_

#  二、仇恨模式

在关卡配置上，仇恨有两种模式： _默认仇恨模式_ 和 _自定义仇恨模式_ 。如下图所示

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/155afb4d-d7bb-4f8b-b5cc-7aa4600d91c8.png)

## **1.默认仇恨模式**



与经典模式的造物仇恨规则一致，仇恨目标与受到的伤害量无关，且在战斗中会根据规则转换仇恨目标



仇恨值跟攻击频率有关



仇恨目标的仇恨值会随时间衰减



如果两个仇恨对象攻击频率差不多, 可能会隔段时间切换一次

## **2.自定义仇恨模式**



造物会根据其它实体对自身造成的伤害量、对队友产生的治疗量等原因产生 _仇恨值_ ，并依据仇恨值的排序来选择自身的仇恨目标。



支持仇恨相关参数的配置



支持对仇恨值、仇恨列表进行各类操作。支持 _嘲讽_ 等仇恨相关行为



允许物件使用仇恨功能

需要注意的是，两个模式的功能是完全隔离的。自定义仇恨模式下的各类参数配置、节点，在默认仇恨模式中均不可用

# 三、自定义仇恨模式的功能

## 1.自定义仇恨相关基础概念

### (1)仇恨拥有者与仇恨对象

 _仇恨拥有者_ ：

持有 _仇恨列表_ ，可以将仇恨列表中的实体选择为仇恨目标并执行相关行动

造物默认都是仇恨拥有者，造物的行为会针对仇恨目标行动

物件也可以被设置为仇恨拥有者，根据其仇恨列表自行拟定相关的行为逻辑

角色无法成为仇恨拥有者

 _仇恨对象_ ：

与仇恨拥有者处于 _敌对阵营_ 的所有角色、物件、造物，都可以成为仇恨拥有者的仇恨对象

### (2)仇恨值、仇恨列表以及仇恨目标

每个仇恨拥有者上会记录一组仇恨列表，包含了对自身产生仇恨值的仇恨对象以及该实体造成的仇恨值

进入战斗时，仇恨拥有者会对仇恨列表进行排序，将仇恨值最高的目标设置为自身的仇恨目标，并在后续根据仇恨转移的规则切换仇恨目标

对于造物类型的实体而言，绝大多数情况下会将仇恨目标设置为自身的技能目标，因此会持续攻击该仇恨目标

### (3)什么行为会产生仇恨值

一般来说，有以下四个来源会产生仇恨值



直接对仇恨拥有者造成伤害

**产生的仇恨值 = 实际造成的伤害 × 本次攻击的仇恨倍率 × 实体/职业仇恨倍率 + 本次攻击的仇恨增量**



对目前已位于仇恨列表中的实体恢复生命

**产生的仇恨值 = 实际造成的恢复量 × 本次恢复的仇恨倍率 × 实体/职业仇恨倍率 + 本次恢复的仇恨增量**



使用节点图中仇恨值操作的相关节点



当仇恨拥有者处于未入战的情况下，通过 _视野检测_ 、 _范围感知_ 等方式进入战斗，会对引发入战的目标记录1点仇恨

### (4)自定义仇恨模式的案例

假定玩家1的角色对丘丘人造成了10点伤害，玩家2的角色对丘丘人造成了20点伤害，玩家3的角色为玩家1治疗了15点生命。

同时：



三名角色在造成伤害/治疗前在丘丘人的仇恨列表中仇恨值为0



三名角色的 _职业仇恨倍率_ 分别为3.0、2.0和1.0

那么丘丘人的仇恨列表中会记录以下数值：

**仇恨对象**| **仇恨值**  
---|---  
角色1| 30（10×3.0）  
角色2| 40（20×2.0）  
角色3| 15（15×1.0）  
  
由于此时角色2有最高的仇恨值，那么丘丘人会选取角色2为仇恨目标（通常来说也是丘丘人的技能目标），直到发生仇恨转移或嘲讽相关行为

## 2.仇恨转移

在关卡配置中，可以配置全局的 _仇恨转移倍率_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/ad151bca-3358-4680-881b-33e1ec7ef3fe.png)

当仇恨列表中的某个仇恨对象的**仇恨值 ≥ 当前仇恨目标的仇恨值 × 仇恨转移倍率** 时，会发生 _仇恨转移_ ，仇恨目标设置为该仇恨对象

以上述案例为例，在执行完上述行动后，角色2为丘丘人的仇恨目标，其仇恨值为40

当角色3造成了30点伤害后，仇恨列表变为如下状态：

**仇恨对象**| **仇恨值**  
---|---  
角色1| 30（10×3.0）  
角色2（当前仇恨目标）| 40（20×2.0）  
角色3| 15+30（30×1.0）  
  
由于角色3的仇恨值（45点）超过了当前仇恨目标的仇恨值（角色2，40点）× 全局仇恨转移倍率（假定是1.10），此时丘丘人会将仇恨目标转向角色3

## 3.嘲讽

嘲讽是一种特定的实体行为，可以由 _服务端节点图_ 或 _本地节点图_ 发起

嘲讽会将嘲讽者在目标仇恨拥有者的仇恨值设置为**当前仇恨目标仇恨值 × 仇恨转移倍率** 。因此触发仇恨转移导致嘲讽目标将嘲讽者设置为仇恨目标，通常来说这会导致造物开始攻击嘲讽者

需要注意的是：



当嘲讽者自身就是仇恨目标时，嘲讽行为不会导致仇恨值的变化



如果嘲讽目标未入战，那么嘲讽行为会使嘲讽者产生1点仇恨值，并因此导致嘲讽者和嘲讽目标入战

## 4.入战与脱战

### **(1)入战**

一些行为会导致实体进入战斗状态。对于造物来说，入战通常会切换进入战斗状态的行为模式



对于角色来说，当**角色位于其他任意实体的仇恨列表中** 时，认为这名角色入战（例如角色攻击造物，会导致角色入战）



对于物件/造物来说，当该**实体是仇恨拥有者，且仇恨列表不为空** 时，认为自身入战（例如造物受到攻击时，认为造物自身入战）

任何可能产生仇恨值的行为都可能导致入战，包括：



造物的范围感知或视野检测入战（产生1点仇恨值）



攻击其他实体入战



为仇恨列表中的实体恢复生命



嘲讽入战



通过节点图强制设置仇恨值导致入战

### **(2)脱战**

一些行为会导致实体脱离战斗状态。对于造物来说，脱战会导致造物立刻回到原位并脱离战斗状态

对于任意的实体来说，当实体**不在任何其他实体的仇恨列表中，且自身的仇恨列表（如果有的话）也为空** 时，认为自身脱战

有一些特定的行为会导致脱战，包括：



仇恨列表中的实体不在场（例如被销毁）



造物的寻路失败或远离自身的领地区域等



使用【 _清空仇恨列表_ 】相关节点清空了仇恨列表

需要注意的是，无法通过【 _设置仇恨值_ 】相关节点将仇恨值设置为0来进行脱战（战斗中的仇恨值至少为1，不能设为0）

# 四、仇恨系统的配置入口

## 1.全局仇恨配置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/388e051d-dedd-4b17-bd57-d3f01758f3f3.png)

在关卡设置中，可以配置仇恨相关的全局配置，包括

 _仇恨类型_ ：可切换自定义仇恨模式或默认仇恨模式。需要注意的是，切换为默认仇恨模式后无法使用自定义仇恨相关功能

 _仇恨转移倍率_ ：全局的仇恨转移倍率，默认为1.2（即超过当前仇恨目标1.2倍的仇恨值时会发生仇恨转移）。这个值不能小于等于1

## 2.仇恨参数配置

### (1)物件的仇恨配置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/f82e261e-3ba9-4162-80f8-2b51ce2f0da5.png)

 _产生仇恨的倍率_ ：该物件通过造成伤害和生命恢复行为产生仇恨的倍率

 _是否开启仇恨记录_ ：开启后，该物件会成为仇恨拥有者，可以通过节点图获取其仇恨目标等实体

 _是否同步仇恨值_ ：是否将该实体拥有的仇恨列表中的仇恨值同步至客户端（默认情况下不会同步仇恨值，仅同步仇恨对象），这通常用于需要在界面上显示仇恨值时使用。这个按钮仅在【是否开启仇恨记录】为开启的情况下可用

### (2)职业的仇恨配置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/160fc9bb-717d-45ff-b4be-83938bd8047a.png)

 _产生仇恨的倍率_ ：拥有该职业的角色通过攻击和生命恢复行为产生仇恨的倍率

### (3)造物的仇恨配置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/2bf54bae-5bc3-448a-b00c-7acf03bee9eb.png)

 _产生仇恨的倍率_ ：该造物通过造成伤害和生命恢复行为产生仇恨的倍率

 _是否同步仇恨值_ ：是否将该实体拥有的仇恨列表中的仇恨值同步至客户端（默认情况下不会同步仇恨值，仅同步仇恨对象），这通常用于需要在界面上显示仇恨值时使用。

需要注意的是，由于仇恨值在服务端进行计算，任意客户端对于仇恨值的直接取值都是不准确的

# 五、仇恨相关节点

## 1.服务端节点

**嘲讽目标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/65d42ac7-65ad-430f-95f8-049a49a44663.png)

**将目标实体移除出仇恨列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/dc6de8b1-1333-4a2f-9dd5-d8f1aa09c868.png)

**清空指定目标的仇恨列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/3841ae0d-0b81-40ca-b03f-3caf0cd74da3.png)

**设置指定实体的仇恨值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/9ee84751-59bc-4228-ae0e-4eb5b6a6f8ad.png)

**仇恨目标变化时**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/848a767a-cc5b-489e-8199-1f89e2ccc438.png)

**自身入战时**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/00b70280-bafd-4600-825b-c318b320aa9c.png)

**自身脱战时**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/e5895842-c252-49f0-864e-f4db6f0db7ca.png)

**查询全局仇恨转移倍率**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/7f7367a3-768c-4e8e-a665-0bfdcaae2cee.png)

**查询指定实体的仇恨倍率**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/6960bc2f-c06f-4a13-9887-f60f6ddf4791.png)

**查询指定实体的仇恨值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/1fc08ae6-c72a-4193-b81f-a7c0f2581296.png)

**查询指定实体是否已入战**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/186197bf-d327-4f72-b25f-a21f67eb87a5.png)

**获取目标所在仇恨列表的拥有者列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/3065b466-9aee-4a42-9275-f7d397b6458e.png)

**获取以目标为仇恨目标的实体列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/ceef9fe8-8258-444e-8803-8a65d0fa6aa2.png)

**获取指定实体的仇恨列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/efd5bd57-dc03-470e-a713-3f9d2abd90ff.png)

**获取指定实体的仇恨目标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/d0a58fc3-561a-475b-8ea7-0af5a824b9a1.png)

##  2.客户端节点

**按比例修改指定实体的仇恨值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/f0ff8bdc-697c-400a-8b7d-1d891c98b158.png)

**按比例转移指定实体的仇恨值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/5b12e79b-0cac-4482-a6ec-242cc853266f.png)

**嘲讽目标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/53565da5-091d-4319-a526-4bceade73a4b.png)

**将目标实体移除出仇恨列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/d5c3689c-a96b-450d-954a-f5a802fd46cb.png)

**清空指定实体的仇恨列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/f11a4e07-f562-4a31-a585-b53ed58edfcd.png)

**设置指定实体的仇恨值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/6774aefc-dd44-4aaf-8ef0-4de256264cbe.png)

**修改指定实体的仇恨值**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/c601453e-c6d6-49b3-ade1-959486bdadaf.png)

**查询指定实体是否入战**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/0df1d14c-a9bb-4f02-aadd-7657a94119a7.png)

**获取指定实体的仇恨列表**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/8b98408b-5acd-4525-a0a0-3cae0d19e0ea.png)

**获取指定实体的仇恨目标**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhw9ut96q96y/fff0242c-045b-4ac7-9fb6-c371e76db8d4.png)
