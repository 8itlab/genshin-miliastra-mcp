# 玩法功能进阶实例/3.20界面控件——手柄适配引导

(来源：原神千星奇域·教程，页面 ID mhjobxrdykym)

创作者手柄适配引导

在千星沙箱界面控件组管理中，开放了四种界面布局适配方案供奇匠配置，根据不同平台和设备，交互方式和特点也有所不同：

平台| 交互方式| 限制与特点  
---|---|---  
触屏（移动端）| 触屏交互| 可以直接点击屏幕内任意位置的界面控件，相较键鼠没有悬停交互，没有快捷键，相较PC端屏幕空间较小  
键鼠（PC）| 鼠标指针点击/拖拽+键盘快捷键交互| 可以直接点击屏幕内任意位置的界面控件  
手柄（主机）| 焦点导航+快捷键交互，指针交互模式可用但操作不便，不推荐使用| 只能与手柄导航焦点所在的控件，或配置了手柄快捷键的界面控件进行交互，快捷键相较键鼠更少  
手柄（移动端）| 焦点导航+快捷键交互，指针交互模式可用但操作不便，不推荐使用| 只能与手柄导航焦点所在的控件，或配置了手柄快捷键的界面控件进行交互，快捷键相较键鼠更少，屏幕空间更小  
  
可以看到，手柄与其他端交互方式的差异决定了在设计手柄界面交互时，需要采取一套不同的设计方法，本文将为奇匠简单介绍手柄端适配设计的思路和常用方法。

# 一.认识手柄导航

## 1.支持手柄导航的控件

 __交互按钮，道具展示，自定义按钮，自定义开关_ _这类可交互的界面控件被添加至悬浮交互页内时，会额外提供【手柄导航】的配置，此外： __页签，单选项视窗，文本视窗__ 这些仅能在悬浮交互页中使用的控件，也支持【手柄导航】的配置。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/f8481d43-fd94-4735-9368-33023607aade.png)

## 2.手柄导航提示

如图所示，在交互悬浮页控件中，左下框内类型的控件可以被设置为手柄导航的对象，若希望控件能够被手柄摇杆导航选中，可开启“可被手柄导航选中”开关。

控件在成为手柄导航对象后，会以图中的箭头提示，可以选择导航提示箭头的样式，朝向以及位置偏移。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/140eb6b7-db4d-4b75-8d0b-05da959de53b.png)

## 3.手柄导航的规则

可以通过图示中 向左/向右/向上/向下 的参数，指定当手柄导航焦点位于当前控件时，玩家向左/向右/向上/向下推动摇杆后，希望焦点移动到的目标控件对象。

默认导航规则为：移动到当前摇杆方向上中心点距离最近的控件。

可通过控件列表指定希望跳转到的控件对象，或者不进行跳转。![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/db04ec62-5f84-4af4-8c56-830c013157a5.png)

## 4.导航焦点与按键

除页签，文本视窗外的控件在成为手柄导航的对象时，均能够响应固定确认按键![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/3c8fd917-fa82-4270-b2b2-e6266ef269e5.png)或![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/ac65e145-fb8c-402e-8d4e-5ef2566e29b1.png)（取决于玩家的系统按键设置），若控件自身额外配置了快捷键，则还能同时响应手柄快捷键。

# 二.手柄端适配设计准则

奇匠在进行手柄端的界面交互设计时，可以按照以下几条准则进行设计

**焦点导航为主，手柄快捷键为辅：**

手柄的快捷键数量有限，在界面控件较多的界面中，为每一个控件设置一个单独的快捷键是不现实的。

推荐奇匠将手柄快捷键分配给界面中的重要功能，其他控件的交互则主要通过配置手柄焦点导航实现。

**推荐对功能进行分区和收纳：**

由于手柄端玩家无法直接点击到屏幕内的界面控件，因此推荐玩家对功能定位相同/相似的控件进行分区，将次要功能控件收纳到弹窗/次级界面内，已确保玩家能快速理解界面功能，同时专注于界面的核心功能和玩法。

**非必要不使用指针交互：**

在月之八版本我们为奇匠开放了常驻指针功能，推荐在键鼠布局下使用该功能。

在手柄布局下，该功能虽然可用，但在手柄端的操作效率低，体验较差，也不符合手柄玩家的操作习惯，若使用指针作为手柄端的主要交互方式，可能降低手柄玩家的游玩意愿，因此推荐在手柄端设计时，非必要情况不使用指针交互。

# 三.手柄端界面设计示例

由于不同平台下界面分辨率不同，控件尺寸也可能不同，因此建议优先以移动端/移动端手柄 _作为初始布局进行界面设计与搭建，_ 再切换到其他端对将页签，列表等控件的宽度和高度进行拉伸。

以下以移动端手柄界面为例，进行界面交互设计的建议说明：

## 1.系统类界面

系统类界面通常由顶部标题栏，页签/列表区（左侧），详情内容区域（右侧），以及底部控件区域组成。

其中，奇匠可以在内容区内，通过页签，单选项视窗（列表）控件对列表信息进行管理，示意如下：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/fb2cbd73-3cc6-4a69-b44f-855af406b316.png)

常用区域划分| 包含内容| 推荐区域尺寸| 位置示意  
---|---|---|---  
顶部：标题栏| 1.界面标题栏（按需）2.关闭按钮（通常需要有）3.次级功能按钮：如界面详情说明，更多菜单入口等| 推荐区域高度=80| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/4a0b249b-bc8b-4f56-ac96-22fa8b60ea14.png)  
内容区| 左侧：1.一级页签（按需）2.二级页签（按需）3.内容列表-单选项视窗（按需）右侧：1.标题文本（按需）2.图片（按需）2.文本视窗（按需）| | ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/ee726875-cd9e-4434-9b72-91318aba3bd2.png)  
底部：控件区域| 核心功能控件（高频操作，主要功能按钮）| 推荐区域高度=100| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/56689a59-0a7e-4c82-ad8e-36659d60ca59.png)  
两侧保护| 保护区域，不建议设置控件和文本信息| 屏幕单侧保护宽度建议值=24| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/decc3a4e-13dd-4ca0-bdc0-c82d7c301b7f.png)  
  
## 2.玩法类界面

### 1）2d玩法主界面-布局1

玩法类主界面通常由顶部标题栏，关卡目标进度信息，道具列表区域（右侧），以及底部技能控件区域组成，根据玩法的深度和复杂度有所不同。

当** _移动操作 不属于高频/核心玩法操作时_** ，推荐使用以下配置思路：

 _将道具列表等功能菜单配置为单选项视窗，并使用手柄摇杆导航切换，如下图：_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/5189be1d-e886-4819-bd14-acfd9033e090.png)

常用区域划分| 包含内容| 推荐区域尺寸| 位置示意| 推荐参数配置  
---|---|---|---|---  
顶部：标题栏| 1.积分进度条（按需）2.关闭/退出按钮（通常需要有）3.关卡目标说明文本（按需）4.次级功能按钮：如界面详情说明，更多菜单入口等| 推荐区域高度=80| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/c24bb4a9-b771-425e-ad46-b349e262b230.png)| **关闭/退出按钮：** 系统默认快捷键，建议关闭手柄导航**次级功能按钮：** 配置快捷键，建议关闭手柄导航（推荐按键：![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/003434d7-3ddf-4854-bcfb-946affb37bed.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/0ca076b0-a996-49a8-a681-f1fcee6fc6e3.png)）  
内容区| 1.道具/角色列表（按需）2.其他界面信息| | ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/44be2887-e47e-4651-9ba2-fbb142f2d340.png)| **道具/角色列表：** 通过单选项视窗实现，开启手柄导航，设置列表项选中方式为”按下确认后选中“  
底部：控件区域| 核心功能控件（移动按钮，技能按钮，及其他核心操作或功能入口）| 推荐区域高度=100| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/960fdbd1-f963-448f-8993-7de9d458cf7c.png)| **核心功能控件：** 配置快捷键，建议关闭手柄导航（推荐按键：![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/b26ea03c-da10-4b54-93c2-341ad54089e8.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/fb387df5-0144-4c06-81c8-125a684ca7b2.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/6e39f255-032c-46f9-b53f-64b0dacbf12f.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/f982699d-8019-4a00-8ec2-109b9e940fcc.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/138ed3ea-75c2-4801-86fd-055c7b0cfad4.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/cbe967c5-3202-4c02-8253-9a8da28f78bc.png)）  
两侧保护| 保护区域，不建议设置控件和文本信息| 屏幕单侧保护宽度建议值=24| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/03cd4a90-4d29-4da4-ac0a-ff9c69f575e3.png)|   
  
### 2）2d玩法主界面-布局2

当** _摇杆移动操作 属于高频/核心玩法操作时_** ，推荐使用以下配置思路：

 _将核心操作区配置为单选项视窗/自定义按钮，并使用手柄摇杆导航切换，如下图：_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/d0781030-a4dd-416d-bb01-0c756c7b1dd0.png)

常用区域划分| 包含内容| 推荐区域尺寸| 位置示意| 推荐参数配置  
---|---|---|---|---  
顶部：标题栏| 1.积分进度条（按需）2.关闭/退出按钮（通常需要有）3.关卡目标说明文本（按需）4.次级功能按钮：如界面详情说明，更多菜单入口等| 推荐区域高度=80| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/399265d8-ae13-4c4a-a9df-8eb8ab82b87e.png)| **关闭/退出按钮：** 系统默认快捷键，建议关闭手柄导航**次级功能按钮：** 配置快捷键，建议关闭手柄导航（推荐按键：![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/20b6e356-a5db-4aec-ae2d-1817c12c49b5.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/f4d879dd-79cf-461a-91ff-3d9a5091ddd6.png)）  
内容区| 核心内容列表：如玩法/拼豆等玩法关卡的道具列表| | ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/4b4b9660-f0ad-4603-96cb-b6e9fd3b9042.png)| **道具/角色列表：** 通过单选项视窗实现，开启手柄导航，设置列表项选中方式为”按下确认后选中“  
底部：控件区域| 1.核心功能控件（移动按钮，技能按钮，及其他核心操作或功能入口）2.道具/角色列表（按需）| 推荐区域高度=100| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/9d8f00b7-72ed-4ddf-8747-6656356ebc3f.png)| **核心功能控件：** 配置快捷键，建议关闭手柄导航（推荐按键：![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/94fd3c2d-7893-4e5b-b9cd-48cdf28f2abf.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/6a3be650-24cb-483d-b72e-3e02930ec190.png)）**道具/角色列表：** 通过横向页签实现，并启用页签的手柄快捷键  
两侧保护区| 保护区域，不建议设置控件和文本信息| 屏幕单侧保护宽度建议值=24| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/c586843b-701e-428d-a9f7-cb24acc85992.png)|   
  
### 3）进阶：手柄端界面的功能收纳整理

手柄端的快捷键有限，若奇匠的玩法设计较复杂，推荐按照以下方式对功能进行收纳整理

类型| 适用情形| 界面示意| 配置示意| 推荐参数配置  
---|---|---|---|---  
功能菜单| 在主界面右上角提供功能菜单入口，通过手柄快捷键打开功能菜单，在菜单中可设置多个辅助功能入口，并通过手柄焦点导航选中触发| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/48f9e285-c514-4673-9d06-3349b13ac248.png)| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/e97d598e-7d59-4075-8035-b0163bcd6d0d.png)| **功能菜单：** 方法1.将菜单内的辅助功能入口配置为多个自定义按钮，开启手柄导航，同时将快捷键配置为“无”方法2.将功能菜单配置为单选项视窗  
次级列表| 在主界面提供道具列表入口，通过手柄快捷键打开道具列表，在列表中通过手柄焦点导航选择道具| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/9fa830ef-ae91-49db-bead-518ec7be4d9b.png)| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/d883fb12-a1c3-4421-82e0-1abfa9fce047.png)| **道具/角色列表：** 将道具列表配置为单选项视窗，开启手柄导航，设置列表项选中方式为”按下确认后选中“  
  
### 辅助课件

我们提供了上述课程内容相关的工程文件，可结合** _【教学存档-界面手柄适配】_** 对照学习

![](https://webstatic.mihoyo.com/upload/static-resource/2022/10/14/64e71b8a5e28fbdbc3d3df5d311e4154_847866555738962172.svg)

界面手柄适配.gil

270.9 KB

[](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhjobxrdykym/42d1fd2c-b772-466b-bb95-98eb0901f9ca.gil)
