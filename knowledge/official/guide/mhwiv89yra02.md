# 概念介绍/功能/通用组件/音效播放器

(来源：原神千星奇域·综合指南，页面 ID mhwiv89yra02)

# 一、音效播放器组件的功能

 _音效播放器组件_ 提供了让单位额外播放音效的功能，组件提供了两种播放方式

1.默认配置在组件上，会在持有该组件的单位创建后自动播放

2.通过节点图进行播放，但必须要求播放音效的单位持有音效播放器组件

# 二、音效播放器组件的编辑

## 1.添加音效播放器组件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwiv89yra02/7c1b3d5c-1e29-43c5-b422-113bced28027.png)

(1)切换到实体或元件的组件页签

(2)找到或新增一个音效播放器组件

## 2.新增音效播放器

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwiv89yra02/ce931a43-73b9-46bd-ab13-ebac7c0f5ffe.png)

点击【详细编辑】进入详情编辑页

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwiv89yra02/34d661f1-e6c5-473b-9049-4a81c30a7809.png)

在音效播放器组的详情页面，可以点击【添加音效】来新增一个音效配置

## 3.配置音效播放器

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwiv89yra02/52968a5a-68dd-4f3b-b3c8-1b763c2cdb7c.png)

 _序号_ ：音效播放器的识别序号

 _名称_ ：播放器的名称

 _音效资产_ ：引用具体要播放的音效资产

 _音量_ ：影响音效播放时的响度大小

 _播放速度_ ：音效资产的播放速度

 _循环播放_ ：开启后，音效资产的播放完毕后会再次进行播放

 _循环时间间隔（s）_ ：循环播放的音效在结束后会等待配置的间隔时间后再次播放

 _3D音效_ ：是否是3D音效，如果勾选则可以进行相关配置

 _*范围预览_ ：开启后可以在场景内看到对应的音效传播范围

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwiv89yra02/c78bba9f-22e3-47cd-98f2-3012a74fe1f6.png)

 _范围半径(m)_ ：可配置音效传播的范围

 _挂接点_ ：可指定某个挂接点位置作为音效的音源位置

 _衰减方式_ ：在使用3D音效的情况下，听者（大多数时候是角色）距离音源越远，则听到的音量越小，直至超过范围后音量变为0，衰减方式决定了音量变小的趋势

 _均匀衰减_ ：音量的衰减和听者距离音源的距离为线性关系

 _先快后慢_ ：听者在音源较近处时，远离音源造成的音量衰减会更快

 _先慢后快_ ：听者在音源较近处时，远离音源造成的音量衰减会更慢

 _偏移_ ：音源的位置偏移

# 三、使用节点图控制音效

添加音效播放器

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwiv89yra02/0457b9cd-0a12-465b-83d0-60fac204cb7e.png)

调整指定音效播放器

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwiv89yra02/51513674-fdbb-440a-994b-e7f76bce5d4a.png)

关闭指定音效播放器

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwiv89yra02/6118e23e-0add-4716-93d5-4d171baa8cea.png)

启动/暂停指定音效播放器

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwiv89yra02/704abeb5-5400-48be-86f7-fed6ab7da2e1.png)

玩家播放单次2D音效

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhwiv89yra02/faee72e8-12a9-4de3-8a10-dde366cc218c.png)
