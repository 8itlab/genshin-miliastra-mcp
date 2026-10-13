# 项目案例实战/4.1派对小游戏：《农场乱斗》/4.1.3《农场乱斗》玩法流程

(来源：原神千星奇域·教程，页面 ID mhqdyt95smtm)

# 前言

## 相关信息：

**推荐学习顺序：** 【前置课程】→【当前课程】

**前置课程：** 该课程与以下前置课程所讲述的功能知识点相关（建议首次使用时，优先学习【前置课程】，学习体验更流畅）

> [3.1自定义变量——特定条件下，切换物体表现状态](/ys/ugc/tutorial/course/detail/mhflri07dzd4)
> 
> [3.3跟随运动器——制作吸附、跟随的道具](/ys/ugc/tutorial/course/detail/mhz70x0ra8u8)
> 
> [3.4自定义挂接点——可跟随移动、旋转的预设点](/ys/ugc/tutorial/course/detail/mh85mxrh6kfy)
> 
> [4.1.1《农场乱斗》耕种-采集流程](/ys/ugc/tutorial/course/detail/mh8gqrrpzzm6)
> 
> [4.1.2《农场乱斗》操作提示与反馈](/ys/ugc/tutorial/course/detail/mhhfcsifwb7w)

* * *

## 目标拆解

## 功能逻辑

以下为在该玩法中与操作提示与反馈相关的功能点，课程中将根据这些功能点进行组合讲解：

> ①进入游戏后，所有玩家在等待区进行准备，确认所有玩家准备后游戏正式开始
> 
> ②单局游戏时长5分钟，时间结束后根据玩家“积分值”进行结算，积分最高的玩家获胜

### ①进入游戏后，所有玩家在等待区进行准备，确认所有玩家准备后游戏正式开始

**功能原理：**

使用1个分割场地，其中1个作为准备区，1个作为游戏区；玩家进入游戏后出生点均在准备区，交互机关后完成准备，检测玩家人数足够后，将玩家传送到游戏区，正式开始游戏

**效果演示：**

 _**演示中的文本显示，需达到特定奇匠等级后解锁【自定义文本外显】功能，教程中以效果展示为主_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhqdyt95smtm/a951aab0-8eb9-4a70-a8c4-9ca40ee26425.gif)

**操作步骤：**

**1.【局内编辑器】在【esc面板-预设点管理】中添加预设点，分别放置在“准备区”和“游戏区”**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhqdyt95smtm/4d899360-8828-4bed-b213-b0908e942ac5.gif)

**2.【局内编辑器】将玩家初始出生点绑定在预设的“准备区”预设点，即玩家出生时会自动在准备区出生**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhqdyt95smtm/1edeb245-d416-4ff0-96b2-1a745bb1d407.png)

**3.【局内编辑器】在【关卡实体】上创建2个变量，用于检测判断局内玩家总人数和已准备人数，当2个变量值相等时，即视作游戏正式开始**

 _变量1-类型：整数；初始值：0_

 _变量2-类型：整数；初始值：0_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhqdyt95smtm/bbefa30f-056a-4d0d-8276-fe6f67218a7e.png)

**4.【局内编辑器】在【玩家】上创建1个变量，用于检测判断玩家的准备状态，已准备的玩家无法再次准备**

 _类型：布尔值；初始值：否_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhqdyt95smtm/2eff84be-b98b-4b70-965e-a1e969ec5e8a.png)

**5.【局内编辑器】添加1个UI控件，以文本框展示信息，告知玩家目前的准备状态**

 _**实际展示信息可以根据自身需要灵活调整_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhqdyt95smtm/61ce6821-fc14-4b02-a255-1a831447bcaf.png)

**6.【局内编辑器】制作1个准备物件，添加【组件-选项卡】，用于玩家触发准备**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhqdyt95smtm/70275b21-93ea-406e-9bc2-71ee01d0c423.png)

此外，还可以添加特效让玩家更多关注到这个路牌指引

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhqdyt95smtm/5dcb9bec-5118-4ad9-9601-3553afea29d7.png)

**7.【千星沙箱】制作玩家准备后检测当前所有玩家准备状态，均完成准备后开始游戏**

**功能原理：**

每个玩家角色创生时——关卡变量“局内玩家总人数”+1；

每个玩家准备后——关卡变量“当前已准备人数”+1——判断2个变量是否相等——相等则游戏正式开始（触发玩家传送到另一个场地）

为达到预期的功能效果教程中配置如下：

该节点图挂载对象为：【玩家】

|  | 要做的功能| 对应的配置项  
---|---|---|---  
功能-1每个玩家加入游戏后，关卡记录的总人数+1| 触发场景| 玩家加入游戏时| 【事件节点】：实体创建时  
条件| /| /  
结果| 关卡总人数记录+1| 【执行节点】：使用【设置自定义变量】将关卡变量“局内玩家总人数”+1  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhqdyt95smtm/ab28dbd7-136e-4489-ba88-5310b1e544fd.png)

该节点图挂载对象为：【准备台】

|  | 要做的功能| 对应的配置项  
---|---|---|---  
功能-2每个玩家准备后，关卡记录的已准备人数+1，当已准备人数和总人数相等时游戏开始（将玩家传送至另一个场地）| 触发场景| 玩家加入游戏时| 【事件节点】：实体创建时  
条件-1| 玩家未准备| 【流程控制节点】：判断玩家变量“是否已准备”  
结果-1| 玩家准备后不能再次准备| 【执行节点】：使用【设置自定义变量】将玩家变量“是否已准备”改为“是”  
结果-2| 已准备人数增加| 【执行节点】：使用【设置自定义变量】将关卡变量“当前已准备玩家数”+1  
条件-2| 准备玩家等于总玩家数| 【流程控制节点】：判断关卡变量“局内玩家总人数”和“当前已准备玩家数”是否够相等  
结果-3| 游戏开始，将所有玩家传送到游戏区| 【执行节点】：使用【列表循环迭代】+【传送玩家】，将场上所有玩家传送到游戏区  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhqdyt95smtm/95845eb3-2288-4309-aafe-8170b67b93d9.png)

### ②单局游戏时长5分钟，时间结束后根据玩家“积分值”进行结算，积分最高的玩家获胜

**功能原理：**

触发游戏开始后（玩家传送至游戏区）——设定全局计时器倒计时5分钟——5分钟后游戏结束，将所有玩家传送回准备区——展示积分值排行

**效果演示：**

 _**演示中的文本显示，需达到特定奇匠等级后解锁【自定义文本外显】功能，教程中以效果展示为主_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhqdyt95smtm/b98b563a-72bd-4484-a185-32a86cf47e01.gif)

**操作步骤：**

**1.【局内编辑器】ESC面板-计时器管理中，增加1个5分钟的全局计时器，用于后续使用**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhqdyt95smtm/fc6e9612-814a-4226-94f6-2b7c63973e62.png)

**2.【局内编辑器】关卡实体上增加【组件-全局计时器】**

 _**此处仅添加组件无需额外配置，如果在面板添加，则实体创生时全局计时器默认启动_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhqdyt95smtm/7c1118ea-7372-44b7-ac3d-72d9e45411ed.png)

**3.【局内编辑器】增加1个UI控件，显示游戏时间**

预制模版中直接选择【计时器】配置为之前制作的全局计时器，类型为：倒计时

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhqdyt95smtm/55ad90b8-c899-44a2-8bbb-060cb59a6225.png)

**4.【局内编辑器】新增1个界面布局，制作游戏结束后的信息展示面板**

 _**界面布局是相互独立的UI控件界面，可用于完全不同的UI展示，减少其他信息干扰_

预制模版中直接选择【计分板】配置每个玩家分数=之前设定的变量【积分值】，其他辅助文字提示可根据需要灵活调整

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhqdyt95smtm/6f3d421c-ab2a-4477-a26c-c0aeb9d5a8be.png)

**5.【千星沙箱】制作游戏计时开始效果**

为达到预期的功能效果教程中配置如下：

该节点图挂载对象为：【准备台】

|  | 要做的功能| 对应的配置项  
---|---|---|---  
功能游戏开始后，开始计时| 触发场景| 所有玩家完成准备| /_**无需额外配置，直接使用步骤①中的准备台节点图_  
条件| 所有玩家完成准备| /_**无需额外配置，直接使用步骤①中的准备台节点图_  
结果| 开始计时| 【执行节点】：使用【启动全局计时器】启动【关卡】上的计时器 _**名称为设定全局计时器的名称_  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhqdyt95smtm/ed4ba571-176f-4a01-97bc-bbec21ff4891.png)

**6.【千星沙箱】制作游戏结束流程**

**功能逻辑：**

5分钟计时结束后——将所有玩家传送至准备区——展示游戏结束的积分排行信息

为达到预期的功能效果教程中配置如下：

该节点图挂载对象为：【关卡】

|  | 要做的功能| 对应的配置项  
---|---|---|---  
功能5分钟后，游戏结束传送玩家，并展示积分排行信息| 触发场景| 5分钟后| 【事件节点】：全局计时器触发时  
条件| /| /  
结果-1| 所有玩家传送至准备区| 【执行节点】：使用【列表循环迭代】+【传送玩家】，将场上所有玩家传送到准备区  
结果-2| 给所有玩家展示积分排行信息| 【执行节点】：使用【列表循环迭代】+【切换当前界面布局】，展示游戏结束的相关信息  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhqdyt95smtm/05ce4a69-3724-4fa9-9c95-da5c633aa380.png)

* * *

# 辅助课件

### 辅助课件

我们提供了上述课程内容相关的工程文件，可结合【教学存档-玩法流程】对照学习

![](https://webstatic.mihoyo.com/upload/static-resource/2022/10/14/64e71b8a5e28fbdbc3d3df5d311e4154_847866555738962172.svg)

玩法流程.gil

119.4 KB

[](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhqdyt95smtm/8ed66bc3-5cae-41a8-b1cd-e03f4d52fa52.gil)
