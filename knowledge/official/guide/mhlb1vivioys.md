# 概念介绍/功能/基础信息/负载优化

(来源：原神千星奇域·综合指南，页面 ID mhlb1vivioys)

当游戏运行中，场景内的 _实体_ 过多时，可能会导致游戏负载超标，当用户遇到此类问题时可以考虑使用 _视野检测_ 来进行 _负载优化_ 。

简单来说，用户可以指定一些非关键的实体，使其在角色距离较远时，在本地卸载，以此来节约该部分物件的开销

# 一、视野检测参数配置

视野检测参数有两个配置入口：

## 1.负载优化全局配置

在关卡设置界面，可以看到负载优化选项

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlb1vivioys/4bd63bd8-26e2-4d43-a424-b4a2cba9efc1.png)

视野检测是否生效：

 _跟随实体配置_ ：当选择该选项时，该项负载优化将会依据元件/实体上的属性配置进行生效

 _关闭_ ：当选择该选项时，该项负载优化功能将会关闭

## 2.负载优化单位属性

在物件的基础信息页签，可以看到负载优化属性，如果设置为“开启”，则该物件的实体将会接受负载优化逻辑，从而可能在距离角色过远时在 _本地销毁_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlb1vivioys/af5b08e5-80d0-4c1f-b97c-0cbef93d9ae5.png)

## 3.造物专属优化功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlb1vivioys/40b75d32-a521-41a5-b856-de1b1e85e731.png)

超出范围降频运行：造物专属优化功能，默认开启。

开启时：关卡运行时，该造物实体超出角色一定范围将在该角色端的客户端降频运行

关闭时：关卡运行时，该造物实体超出角色一定范围依然保持正常逻辑运行

## 4.模型可视范围与精度功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlb1vivioys/8bf5968c-b3f5-423c-a5a4-25ea4642ed4c.png)

可以通过【模型可视范围与精度】设置单位模型的可视距离与精度(需要关闭【超出范围不运行】开关后，才可使用该配置)



默认：不对模型可视范围与精度做额外调整



永久显示：当玩家与单位的距离超出单位默认可视范围时，保持单位模型以最低精度显示而不消失



永久以最高精度显示：在任何距离，单位模型都可见且保持最高精度

# 二、视野检测的生效规则

## 1.本地销毁状态

上述的“本地销毁”状态区别于实体的销毁，可以理解为仅仅是在客户端“不显示”了，但实体的逻辑依然存在：



依然可以通过节点图节点进行索引，并控制其逻辑



在玩家靠近一个本地销毁状态的实体时，实体在本地会重新被创建



在联机下，不同用户的本地被销毁的实体根据其距离本地角色距离，可能各不相同



当本地实体不存在时，部分纯本地逻辑可能会不执行，如播放特效等

## 2.销毁规则（视野网格）

### (1)平面网格化

在视野检测负载优化规则下，用户实际游玩的场景会被分为多个大小相同的正方形区域，则在运行时，角色单位和场景内的其他实体都会被落入某一个唯一的网格内：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlb1vivioys/6bfaaaf4-3508-4c94-9d85-4050e84a23e2.png)

以角色单位所在网格为中心，周围的复数个网格即为“ _视野检测范围_ ”，在启动视野检测优化时，视野检测范围外的实体就会被“本地销毁”，并且在游玩时不可见，如下图，假设视野范围为3*3：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlb1vivioys/14630baf-41ef-4a0f-9483-7ff91a6650e9.png)

### (2)角色跨网格

当角色位置发生运动时，视野检测范围也会变化，同时实体在进/出角色的视野检测范围时也会被创建或销毁，如下图：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlb1vivioys/83cf84fe-5714-477b-8fb5-1abb86d1bd80.png)

### (3)实体跨网格

通过运动器或造物的行为使实体跨越网格时，如果触发了进/出角色视野检测范围，也会被创建或销毁：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlb1vivioys/4a0dfb77-26b3-4e9b-a540-a7b752a810f1.png)

# 三、超限模式下的视野检测规格

## 1.网格大小

超限模式下的网格正方形大小为40m*40m

## 2.视野检测范围

超限模式下的实际视野检测范围为除自身网格外的周围三格范围，如下图所示：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlb1vivioys/5922e849-b739-4b39-a28d-fbe713ec6558.png)

# 三、超限模式下的视野检测规格
