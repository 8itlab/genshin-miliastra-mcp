# 概念介绍/功能/特化配置/能力单元

(来源：原神千星奇域·综合指南，页面 ID mh0ucw9e76f6)

# 一、能力单元的定义  
  
## 1.能力单元是什么

能力单元是一组由创作者(奇匠)在编辑时预定义好的一组能力数据，它可以在运行时被 _节点图_ 、 _命中检测组件_ 、 _本地投射物_ 等多个其他的功能模块调用

包括以下类型：

**类型**| **说明**  
---|---  
攻击盒攻击| 以指定目标或位置为基准，发起一次攻击盒攻击。攻击盒碰撞到实体的 _受击盒_ 时，会对实体发起一次攻击  
直接攻击| 对指定目标发起一次直接攻击  
播放特效| 以指定目标或位置为基准，播放 _限时特效_  
创建本地投射物| 以指定目标或位置为基准，创生一个 _本地投射物_  
添加单位状态| 对指定目标添加 _单位状态_  
移除单位状态| 从指定目标上移除 _单位状态_  
销毁自身|  _销毁_ 自身  
恢复生命| 为目标恢复一定的生命  
  
## 2.如何使用能力单元

能力单元是一组纯数据，本身不具备任何功能。因此需要其他系统来调用能力单元实现对应的效果

当前模式中共有以下的几个能力单元调用入口。需要注意的是，每个调用入口可用的能力单元类型是不同的

**调用类型**| **说明**| **可用能力单元类型**  
---|---|---  
服务端节点图直接调用| 从 _服务端节点图_ 直接发起一次能力单元调用，仅可使用攻击相关能力单元| 【攻击盒攻击】【直接攻击】【恢复生命】  
命中检测组件的命中时事件调用| [命中检测](/ys/ugc/tutorial//detail/mh2pir0hat1s)在命中实体或场景时，可以发起一次能力单元调用| 【攻击盒攻击】【直接攻击】【恢复生命】  
本地投射物的命中时事件调用| [本地投射物](/ys/ugc/tutorial//detail/mhciimiw86jg)在命中实体或场景时，可以发起一次能力单元调用| 【攻击盒攻击】【直接攻击】【播放特效】【创生投射物】【添加单位状态】【移除单位状态】【销毁自身】【恢复生命】  
本地投射物的销毁时事件调用| [本地投射物](/ys/ugc/tutorial//detail/mhciimiw86jg)被销毁时，可以发起一次能力单元调用| 【攻击盒攻击】【直接攻击】【播放特效】【创生投射物】  
  
# 二、能力单元的相关编辑

## 1.能力单元的编辑入口

### (1)特化配置页签编辑入口

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0ucw9e76f6/fca27140-de67-4886-8fdf-ade9fcd75335.png)

可点击详细编辑进入详情界面

### (2)本地投射物页签编辑入口

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0ucw9e76f6/25ec0b3c-91ce-4bbb-bcaa-c5a2b4197b07.png)

可点击详细编辑进入详情界面

## 2.能力单元的编辑

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0ucw9e76f6/0b1ad1ea-b4b1-4a6a-a979-78139d91837f.png)

在能力单元详情编辑页面，点击+号，可以新增一个能力单元配置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0ucw9e76f6/0e05344b-bac9-415b-aa83-75bfb2b757d1.png)

之后可以在能力单元类型选项中，切换配置的能力单元类型

## 3.能力单元的效果

见[能力单元效果](/ys/ugc/tutorial//detail/mhrvqvioautg)

## 4.能力单元的调用

### (1)服务端节点图节点调用

服务端节点图中可以调用【攻击盒攻击】、【直接攻击】和【恢复生命】这三个能力单元

【攻击盒攻击】和【直接攻击】使用【发起攻击】节点进行调用

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0ucw9e76f6/7fd976f7-cbce-4ca1-8881-3c7fdba72fee.png)

【恢复生命】使用【恢复生命】节点进行调用

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0ucw9e76f6/e1114846-51fe-4742-995f-1e7fd7fb6e85.png)

### (2)命中检测组件命中时调用

命中检测组件中可以配置【命中时触发】的能力单元

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0ucw9e76f6/f5fd6d8b-4eb9-4979-a082-a68ce659c8b1.png)

点击详情进入命中检测组件详情设置界面

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0ucw9e76f6/089bdf46-1fd9-4578-94bc-e322aea48477.png)

点击添加能力单元即可添加预先配置好的能力单元

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0ucw9e76f6/b7eb9c20-95fa-407c-bf5f-0fbac05ef37d.png)

当命中检测成功触发后，会立刻调用一次配置的能力单元

与在服务端节点图中使用【命中检测触发时】事件来处理同样的逻辑相比，在【命中触发设置】中配置可以在本地更快地触发能力单元的效果，减少网络波动的影响

### (3)本地投射物命中时调用

在本地投射物的【命中检测】组件中，同样可以配置【命中时触发】的能力单元。由于本地投射物没有节点图相关配置，本地投射物的多数逻辑需要通过命中时触发逻辑来编写

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0ucw9e76f6/0de05a75-182c-4796-971c-48de3ea535d2.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0ucw9e76f6/74e06efe-7c1e-4e13-b9ed-c0ab0873150e.png)

如下图所示，是一个常见的本地投射物命中后、特效播放、最后销毁自身的能力单元配置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0ucw9e76f6/ce2a5b3d-3941-4d0a-aac4-f4efd288f874.png)

顺次配置：直接攻击——特效播放——销毁自身的三个能力单元

然后在命中触发设置中进行配置，即可实现本地投射物在命中后造成伤害、播放特效，最后使自身消失

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0ucw9e76f6/73961cef-b316-4dfb-9917-9fbd150e3016.png)

### (4)本地投射物销毁时调用

在本地投射物的基础属性页面的【生命周期结束时行为设置】中，也可以引用一组能力单元

通常用于本地投射物在销毁时执行的一些行为，例如：销毁时发起一次攻击

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh0ucw9e76f6/0f7e9ed4-b9e8-49e3-a43b-31ccaaec8934.png)
