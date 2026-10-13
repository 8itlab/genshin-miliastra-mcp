# 概念介绍/高级概念/外围系统/关卡结算

(来源：原神千星奇域·综合指南，页面 ID mhx1du08nhwo)

# 一、关卡结算的定义

 _关卡结算_ 是由节点图触发的行为，触发结算后整个关卡将会结束，关卡结算结果将会被传递到 _外围系统_ 来更新 _排行榜_ 、 _竞技段位_ 相关的数据

# 二、关卡结算状态

关卡结算状态需要在游玩过程中动态修改，在调用结算关卡节点后，会按各玩家当前的结算状态进行结算

关卡结算状态是每个玩家的属性，由两个字段构成

 _逃跑合法性_ ：当逃跑合法性为“否”时，玩家的结算状态都为“逃跑状态”

 _结算状态_ ：仅当逃跑合法性为“是”，该字段才有意义，有“胜利”，“失败”，“未定”三种状态，作为加 _段位分_ 的判据

 _胜利_ ：以该状态结算关卡时，获得对应计分模板的胜利分数

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhx1du08nhwo/a7b3b8ee-55f4-4938-a84a-9a73b891703f.png)

 _失败_ ：以该状态结算关卡时，获得对应计分模板的失败分数

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhx1du08nhwo/3271fb6b-0ff3-4ef8-a6d0-078a8bab0d8f.png)

 _未定_ ：玩家默认处于的状态，以该状态结算关卡时，获得对应计分模板的未定分数

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhx1du08nhwo/4511c090-b16a-481e-8fe2-6a39f147519c.png)

# 三、关卡结算表现

关卡结算表现决定了对局会以何种形式进行结算，仅在对局内进行展示，并不会影响到外围系统

从系统菜单点击【关卡设置】，可进入关卡设置界面

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhx1du08nhwo/facf4933-326f-4f33-9095-607cdf8c2d7f.png)

在关卡设置界面的结算页签，即可进行关卡结算相关的设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhx1du08nhwo/a8ceb96a-008f-4c70-94c6-e4c3f1e4d4a8.png)

 _结算界面类型_ ：决定了关卡结算时的界面显示样式，分为阵营结算和个人结算两种

 _阵营结算_ ：以阵营为单位进行结算

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhx1du08nhwo/0e9f61d9-994b-41ff-ad7c-f0c2b907e2d0.png)

 _个人结算_ ：以个人为单位进行结算

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhx1du08nhwo/f94ab4f5-f28d-41f3-8ece-f88151e5e8b8.png)

 _启用游戏内排名_ ：启用后，将可以使用排名设置节点，对结算阶段个人/阵营的展示顺序进行编辑

 _排名数值比较顺序_ ：决定了排名数值映射到实际显示顺序的规则，分为由小到大和由大到小两种

 _由小到大_ ：排名数值小的显示在上方

 _由大到小_ ：排名数值大的显示在上方

# 四、以节点图管理关卡结算



结算关卡

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhx1du08nhwo/c301a82f-7da4-445e-8ae6-3637a1329ef3.png)



设置玩家结算排名数值

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhx1du08nhwo/be0f5696-60b3-44c4-a638-eb5a686bdf52.png)



设置阵营结算排名数值

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhx1du08nhwo/25e143fb-abd6-43c0-9e53-63f83331f203.png)



设置玩家结算成功状态

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhx1du08nhwo/868638cd-c02d-42fe-8ed1-aa58b4864eb8.png)



设置阵营结算成功状态

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhx1du08nhwo/c965cca7-2b67-4146-8f27-5005c9877830.png)
