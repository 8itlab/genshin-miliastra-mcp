# 概念介绍/单位/造物/复杂造物

(来源：原神千星奇域·综合指南，页面 ID mhb8nl0w8cao)

# 一、复杂造物的定义

为了满足奇匠对于造物的模型和行为进行更自由化定制的需求，我们投放了部分造物可以对其自主逻辑进行编辑以及可以像角色一样编辑自定义技能，这部分造物我们称之为 _复杂造物_

# 二、复杂造物的创建

与其他实体一样，在实体摆放界面，在复杂造物页签中选择具体项，选中或将其拖入场景内即可创建该复杂造物

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb8nl0w8cao/9c4e3f09-3ed4-443a-8f29-b3959ec31ab4.png)

# 三、复杂造物与基础造物的区别

仅在此列出复杂造物与基础造物有区别的地方，其它参数的含义可以参考[造物](/ys/ugc/tutorial//detail/mhufqo0c0tqw)这篇文章进行了解

## 1.基础信息

### (1)变换

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb8nl0w8cao/b655f9dc-9334-4005-85ff-3c243bb13419.png)

复杂造物支持缩放调整，缩放调整率为0.5-3.0

### (2)模型

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb8nl0w8cao/20908844-ab5d-49fe-8f54-cf69533521e6.png)

复杂造物可以调整预设状态，预设状态会影响复杂造物的一系列表现，包括但不局限于初始动作

## 2.特化配置

### (1)造物状态决策节点图

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb8nl0w8cao/3229a3ea-da0d-4152-ab6a-7978aed81829.png)

复杂造物可以配置 _造物状态决策节点图_ ，在此处配置节点图后，复杂造物将会持续访问节点图，并按照配置的条件，进入不同的自主逻辑状态

在 _造物状态决策节点图_ 中，可以引用 _造物状态节点图_ ，在造物状态节点图中，可以让造物执行实际技能、战术

### (2)造物技能管理

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb8nl0w8cao/8caf4e61-701e-46e9-abde-22e43d1e797c.png)

复杂造物可以使用自定义技能，技能需要定义好以后才可以在造物状态节点图中进行使用。

复杂造物的技能编辑方式类似于角色技能，可以参考[技能](/ys/ugc/tutorial//detail/mho81frl33im)

复杂造物的技能释放，受到 _技能公共冷却时间_ _、_ _技能冷却时间_ _、_ _技能冷却组时间_ 的三重限制。当三种时间限制全部满足时，技能才可以释放

点击详情编辑可以打开造物技能的详情界面

#### a.技能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb8nl0w8cao/c1e23ecb-4423-4f4a-ae6a-dedcb5c2e5b5.png)



**基础设置**

配置参数| 说明  
---|---  
 _序号_|  状态节点图中引用，用于实际执行的调用  
 _引用技能_|  复杂造物自定义技能，只能引用支持自身使用的技能  
  


**冷却时间配置**

配置参数| 说明  
---|---  
 _初始冷却开始时点_|  可选择枚举入战时:入战时开始计算初始冷却脱战时:脱战时开始计算初始冷却  
 _初始冷却区间(s)_|  配置区间内随机某一时间，作为生效冷却时间造物创生后，经过生效冷却时间之后，才会开始使用该技能  
 _默认冷却区间(s)_|  配置区间内随机某一时间，作为实际冷却时间造物使用该技能后，在实际冷却时间内，不可以使用该技能  
 _所属冷却时间组_|  如某一技能配置了冷却时间组，则仅当同时满足自身的冷却时间、技能公共冷却时间、冷却时间组的时间，技能才会被释放  
 _冷却时间触发时机_|  可选择枚举技能结束时:技能释放结束才开始计算冷却时间技能开始时:技能开始释放即开始计算冷却时间  
 _触发技能公共冷却时间_|  是否会影响技能公共冷却时间  
 _忽略技能公共冷却时间_|  若勾选，则技能释放条件中，无视技能公共冷却时间的限制  
  
#### b.冷却时间

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb8nl0w8cao/9ea8f03a-d7cd-4a6a-a9a6-c4b24fc0b139.png)



**基础设置**

配置参数| 说明  
---|---  
 _公共冷却时间(s)_|  当前复杂造物的所有技能，都受到公共冷却时间的影响  
  


**冷却时间组配置**

可通过【添加冷却时间组】，按需增加需要的冷却时间组。

冷却时间组：可以将多个技能的释放时间进行关联，在同一冷却时间组的技能，都需要满足冷却时间后，才可以释放

配置参数| 说明  
---|---  
 _冷却时间组序号_|  运行时，支持在节点中引用  
 _冷却时间组名称_|  可在指定编辑中，进行选取  
 _冷却区间(s)_|  冷却时间的范围配置  
  
### (3)自主逻辑**参数设置**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb8nl0w8cao/4f95d261-74dd-4f77-8ac6-139357518761.png)

复杂造物需要定义 _自主逻辑参数模板_ ，可以在造物状态节点图中进行使用

这些参数是复杂造物战斗行为的基础需求参数

配置参数| 说明  
---|---  
 _初始生效自主逻辑参数模板_|  该复杂造物运行时默认生效的自主逻辑参数模板，至多1个支持通过选择下拉枚举的选项，修改生效情况，修改后生效状态会同步到对应参数模板编辑页内![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb8nl0w8cao/1cf608e8-ad70-404b-87c5-12c8172f4ab2.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb8nl0w8cao/1d326d85-6c6a-45b1-813f-63f3b0a0229f.png)  
 _*自主逻辑参数模板列表_|  枚举该复杂造物配置的所有自主逻辑参数模板  
  
点击详情编辑可以打开自主逻辑参数模板的详情界面

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb8nl0w8cao/43c8b8de-d9ee-4e76-afd1-9b4957a926b7.png)



枚举该复杂造物定义的所有自主逻辑参数模板



通过点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb8nl0w8cao/0371c585-dc3d-425c-ad13-7a178701fd72.png)，添加自主逻辑参数模板，默认为不生效



“模板_X”，X为“自主逻辑参数模板序号”，作为节点输入项，可以调整状态使用不同的自主逻辑参数模板

#### a.基础设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb8nl0w8cao/e1c672c0-05a5-4d0d-a894-12d05a41d6a4.png)

配置参数| 说明  
---|---  
 _初始生效_|  若开启，则该自主逻辑参数模板随复杂造物创建立即生效  
  
#### b.入战设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb8nl0w8cao/d60cc829-6f11-4fec-9337-b4be43eb77f8.png)



范围感知

配置参数| 说明  
---|---  
 _范围感知距离_|  敌对实体处于该范围内，造物可获取对应实体信息，并以对应实体为目标进入战斗  
 _*预览范围_|  开启后，可在编辑界面查看编辑中造物实体的感知范围  
  


视野检测

配置参数| 说明  
---|---  
 _视野类型_|  提供视锥和全视野枚举，选择后其范围编辑参数也会一同变化  
 _视锥-视锥距离_|  配置视锥的半径距离  
 _全视野-视野检测半径_|  配置球体的半径  
 _*预览范围_|  开启后，可在编辑界面查看编辑中造物实体的视野检测范围  
  
 _连锁入战距离(m)_ ：造物实体入战时，处于该范围内未入战的造物实体也会一同入战

 _*预览连锁入战距离_ ：开启后，可在编辑界面查看编辑中造物实体的连锁入战范围

#### c.脱战设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb8nl0w8cao/d6568f3a-29a0-4ea0-813c-04a3dc938d9c.png)

造物实体运行时，且对敌对实体进入战斗状态后，造物自主脱战的规则设置

配置参数| 说明  
---|---  
 _脱战距离(m)_|  当处于战斗中的造物，和战斗目标实体之间的距离大于配置距离，造物会脱战  
 _*预览脱战距离_|  开启后，可在编辑界面查看编辑中造物实体的脱战范围  
 _寻路失败脱战_|  当处于战斗中的造物，和战斗目标实体之间没有合法路径时，造物会脱战  
 _脱战延时(s)_|  当处于战斗中的造物，和战斗目标实体之间没有合法路径时，造物会在脱战延时后脱战  
  
#### d.领地设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb8nl0w8cao/533328a7-7954-472e-ac96-29436a3218f7.png)

配置参数| 说明  
---|---  
 _领地_|  支持配置无、球体、圆柱体，需要配置尺寸参数领地以造物的创建坐标为中心，不会随造物的运动改变位置造物的运动范围，被限制在领地内，可以通过节点调整该限制![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb8nl0w8cao/d6deb66f-1040-462c-84ec-a2da7d84928e.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb8nl0w8cao/cb36e8d5-7e0e-40bc-bde3-80f9ce6fd242.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb8nl0w8cao/54e55516-ec07-4111-bbc0-2b3c8cf45f1e.png)  
 _*预览领地范围_|  开启后，可在编辑界面查看配置的领地范围  
 _玩家离开区域后脱战_|  开启后，战斗目标实体离开该范围，造物会触发脱战行为  
 _脱战延时(s)_|  作为战斗目标的实体离开领地范围后，造物会在脱战延时后脱战  
  
### (4)巡逻**设置**

可参考[常规设置](/ys/ugc/tutorial//detail/mh3rgo0c16c8)中巡逻部分

# 四、通过客户端节点图管理复杂造物行为

## 1.造物状态决策节点图

造物状态决策节点图以【**按顺序唯一执行】** 节点起始，每个出引脚连接【**切换自身执行状态】** 节点，来做到按需执行不同行为。若前置状态的进入条件不满足，优先进入 _失败执行_ ，若依然不满足条件，则会尝试执行下一引脚的状态

造物状态决策节点图会持续执行，若前置顺序的状态满足条件，复杂造物会立刻切换执行状态，执行前置顺序的造物状态节点图

若条件不满足，复杂造物可能不会执行任何状态节点图

举例：运行时从1号分支开始优先判断A节点，若A节点满足条件执行成功，则不会执行后续B和C节点，如果不满足条件则继续判断B节点。若A、B节点均不满足条件则从2号分支开始判断C节点是否满足条件

若造物正在执行C节点内的造物状态节点图，但A节点的执行条件满足了，则复杂造物会立即切换为执行A节点内的造物状态节点图

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb8nl0w8cao/577aefbe-2ce1-4534-9374-2bd2ab877d5b.png)

按顺序唯一执行

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb8nl0w8cao/65edea2e-c275-4016-b570-4c84f08e0ceb.png)

切换自身执行状态

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb8nl0w8cao/7c988a2f-f8e6-4a0e-9a65-b37171973b4b.png)

## 2.造物状态节点图

造物状态节点图的出入引脚，仅支持单线连接

造物状态节点图代表了持续性的行为，当复杂造物处于某个执行状态中，且未被状态决策节点图的逻辑切换时，会持续的执行造物状态节点图中的配置。

例如：当复杂造物运行时，通过造物状态决策节点图切换到下图造物状态节点图时，该节点图会持续执行![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhb8nl0w8cao/38f77b43-6493-4d3d-b57c-25b3838423a4.png)

造物状态节点图中可配置的战术节点，分为地面战术、空中战术和通用战术三类。地面战术仅在造物处于地面状态时可执行，空中战术仅在造物处于浮空状态时可执行；通用战术不受浮空状态影响，两种状态下均可执行

造物是否处于浮空状态，由其是否挂载 _造物浮空_ 单位状态效果决定：挂载该单位状态效果时视为处于浮空状态，未挂载时视为处于地面状态
