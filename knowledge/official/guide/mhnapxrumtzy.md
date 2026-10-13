# 概念介绍/资产/界面控件

(来源：原神千星奇域·综合指南，页面 ID mhnapxrumtzy)

# 一、界面控件是什么

界面控件是指设计和实现[界面布局](/ys/ugc/tutorial//detail/mhozt0r74ng6)的各种文本框、图标或特殊功能的基础资产

# 二、界面控件的特点

每一种界面控件都有其特定的功能，可在后续介绍中查看。

界面控件可以直接配置在界面布局默认生效，也可以编辑为界面控件组模板使用。

界面控件的运行显示依赖界面布局。

# 三、界面控件的分类

界面控件分为 _固有界面控件_ 和 _预制界面控件_

固有界面控件是关卡运行时不可缺少的流程型控件，或与业务关联的功能型控件

预制界面控件提供原子化的界面资产，可以进行编辑修改和自定义组合，来构成更加定制的界面控件组

## 1.固有界面控件

### (1)固有界面控件的概述

固有界面控件是界面布局的默认包含的控件，大部分和业务逻辑相关，例如选项卡控件，需要通过选项卡组件进行调用。

不支持移除，不可移动，不可调节尺寸，仅支持少量编辑配置。

部分固有控件支持调整可见性。

### **(2)固有界面控件的引** 用

在界面布局中会默认存在的控件，无需主动添加

部分固有界面控件会在关卡运行时默认存在，部分固有界面会通过业务按需调用

### **(3)固有界面控件资** 产

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/c0cccc79-7d99-40c8-a03f-9c209c8b5eef.png)



**小地图**

位于界面布局左上角

关卡运行中，若满足条件，会在小地图控件中，显示带有[小地图标识](/ys/ugc/tutorial//detail/mh0pppib5eyc)的实体，并根据组件的配置显示内容



**技能区**

关卡运行时，用于释放角色技能的按键



**队伍信息**

显示共同运行关卡的玩家角色信息



**角色生命值条**

关卡运行时，显示当前角色的生命值的控件



**摇杆**

关卡运行时，移动端用于操控角色移动的控件



**造物生命值条**

关卡运行时，显示造物名称和血量的控件



**退出按钮**

关卡运行时，用于中断/退出关卡的按键



**选项卡**

关卡运行时，和[选项卡](/ys/ugc/tutorial//detail/mh5jko05fzyw)组件关联，当满足组件配置时，会显示对应信息



**聊天按钮**

关卡运行时，用于展开聊天窗口的按键



**网络状态**

关卡运行时，用于实时显示当前网络情况的界面控件



**挣扎按钮**

角色陷入挣扎状态时，表示当前状态的界面控件



**语音聊天按钮**

关卡运行时，用于语音聊天功能设置的界面控件



**语音聊天提示队列**

关卡运行时，用于实时显示当前哪些玩家在语音的界面控件

## 2.预制界面控件

### **(1)预制界面控件的概** 述

预制界面控件可以直接配置在界面布局默认生效，也可以编辑为界面控件组模板使用。

### **(2)预制界面控件的引** 用

在界面控件组库中，可以利用界面控件资产将其编辑为界面控件组模板，并通过节点图来使用

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/69fd604d-8688-4612-aa5c-57afb0f4c30d.png)

在界面布局中，可以通过【添加界面控件】来引用界面控件资产，随界面布局一同生效

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/d8360ae5-ea7a-4c4e-b1f6-e3e049d81eb0.png)

### **(3)预制界面控件资** 产



**交互按钮**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/ac1b5e2a-d907-4113-bd82-fb3f62df9d3a.png)

关卡运行中，点击和外接设备输入，都可以触发该界面控件的交互。

支持玩家进行交互，并在交互后向节点图发送：“界面控件组触发时“事件

详见[交互按钮界面控件](/ys/ugc/tutorial//detail/mhwkfsitckrw)



**道具展示**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/b7d08dbb-dec1-42a6-aa38-c9efdad6309c.png)

关卡运行中，点击和外接设备输入，都可以触发该界面控件的交互。

支持玩家进行交互，并在交互后向节点图发送：“界面控件组触发时“事件

详见[道具展示界面控件](/ys/ugc/tutorial//detail/mhjja1ipq9ck)



**文本框**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/df700f76-9092-486f-970c-d49f2a9d6799.png)

关卡运行中，显示预先编辑的文本内容。

若文本内容中，包含 _自定义变量_ ，会实时更新显示。

详见[文本框界面控件](/ys/ugc/tutorial//detail/mhnltrr3g966)



**弹窗**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/aa24249e-3283-4e0f-9eca-176e34993593.png)

关卡运行中，一种通过逻辑触发出现的界面，用于向玩家提供重要信息、提示、选项或交互功能。

详见[弹窗界面控件](/ys/ugc/tutorial//detail/mhen7r0djxkg)



**进度条**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/9f389852-c9ba-4f56-805b-5a531ef03ca5.png)

关卡运行中，可以实时展示需求变量在默认配置范围中占比的图形界面。

详见[进度条界面控件](/ys/ugc/tutorial//detail/mhwpzpixrad0)



**计时器**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/d8ab3567-20a3-4772-8a12-0f6aa34ce776.png)

用于显示时间进度的界面，包括倒计时、正计时两种表现方式。

详见[计时器界面控件](/ys/ugc/tutorial//detail/mhnrdor7uyra)



**计分板**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/b84343ac-2797-412a-9ff8-b567aec4caf5.png)

关卡运行时，用于显示玩家自定义变量，并可以根据自定义变量进行排名的信息展示界面

详见[计分板界面控件](/ys/ugc/tutorial//detail/mhesro0hyn5k)



**卡牌选择器**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/6b0f58ff-d469-4038-9c9b-1a37c9b3befa.png)

选择器面板提供编辑简单的决策交互界面功能

支持对可决策内容进行编辑，包括决策时间、决策项的表现、决策的交互方式等

详见[卡牌选择器界面控件](/ys/ugc/tutorial//detail/mh2teu0bmfbc)



**界面动效**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/7f3059c8-a126-4400-8c89-7ed4bc2c7500.png)

可以配置在界面布局中，并在界面布局中显示对应的特效，是用于美化、丰富表现而使用的一种界面控件

详见[界面动效控件](/ys/ugc/tutorial//detail/mh2iyk9fa4gy)



**全屏界面动效**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/720185e5-f2e7-487a-b6b2-a0894ad6badc.png)

可以配置在界面布局中，并在界面布局中显示对应的特效，是用于美化、丰富表现而使用的一种界面控件

详见[全屏界面动效控件](/ys/ugc/tutorial//detail/mhbn4i09l5ns)



**图片**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/ff9def66-b286-4e35-b050-9c8959742ad9.png)

可以配置在界面布局中，并在界面布局中显示对应的特效，是用于美化、丰富表现而使用的一种界面控件

详见[图片控件](/ys/ugc/tutorial//detail/mh2oih9jou22)



**自定义按钮**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/cce1f662-e60e-4109-b760-d696a057d46d.png)

是一种特殊的交互按钮，可以配置其图标和显示的文本

详见[自定义按钮控件](/ys/ugc/tutorial//detail/mhtpwgitsigc)



**自定义开关**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/4f4ccdce-3db9-46d3-b91b-3a3f83f6250c.png)

可以通过点击或其映射的自定义变量进行开和关的状态切换，并以此来触发不同的功能逻辑

详见[自定义开关控件](/ys/ugc/tutorial//detail/mhkrafr3w6um)



**悬浮交互页**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/6b86ab20-0d9d-481c-b52d-a156195451e2.png)

提供高级的页签、单选项视窗等一系列配置，便于奇匠配置较为复杂的关联界面。支持添加各种按键、开关，用来丰富功能和表现

详见[悬浮交互页控件](/ys/ugc/tutorial//detail/mh2u2e9o3jn6)



**特殊数字**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/138f831a-e9ee-4ad5-9525-f0fdcf19df61.png)

可以配置在界面布局中，支持表现与技能相关的诸多数据

详见[特殊数字控件](/ys/ugc/tutorial//detail/mhkwucr8awfq)

### **(4)预制界面控件通用数据配置**

####  a.索引

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/cb3f2895-536b-487d-94c9-df6711b9e130.png)

当界面控件被保存为界面控件模板时，会赋予其索引，支持在节点图引用

配置参数| 说明  
---|---  
 _索引_|  该界面控件模板的唯一标识，用于节点图引用  
  
#### b.变换

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/0b833823-4e1a-4b74-a727-b88acaa0788a.png)

配置参数| 说明  
---|---  
 _设备_|  包括键鼠、移动触屏、主机手柄、移动手柄  
 _位置_|  支持手写输入界面控件位置也支持通过编辑界面拖动该界面控件进行调整  
 _大小_|  仅有部分界面控件支持配置  
 _缩放比例_|  支持对X，Y轴调整缩放比例  
 _旋转_|  支持镜像、对称，和Z轴的旋转  
 _锚点设置_|  支持点击展开，选择需求的锚点位置，在屏幕分辨率改变时，会以锚点继承相对位置![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/daaeeaae-7b24-4acc-8e72-9cd2923a38c1.png)  
 _中心_|  支持配置旋转的中心点位置，旋转操作时，将以此为中心![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/cec0f8aa-d690-4a9f-9c84-93ba05809e49.png)  
 _层级_|  数字越大显示层级越高  
 _初始可见性_|  若不勾选，则界面控件激活后不可见支持通过节点【修改界面控件组状态】调整该参数  
  
## 3.素材库

素材库是支持奇匠对控件进行自由组合的引用资源，该资源可作为图像资源直接被功能引用

素材库支持在**自定义开关、自定义按钮、悬浮交互页、页签、单选项视窗、图片控件** 中进行引用

### **(1)素材库控件的概** 述

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/7c59b1d0-87d4-4634-9bc5-363f26534955.png)

素材库支持使用界面控件模板有：文本框、界面动效、图片、特殊数字

素材库使用的文本框和普通文本框略有不同

#### a.素材库特殊控件-文本框

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/61790d2d-688c-4b8e-a4ce-d0b52c805228.png)

文本框的插入变量，支持配置基础的玩家自定义变量，也支持配置悬浮交互页中声明的形式变量

若配置形式变量，会根据不同悬浮交互页中实际引用处关联的自定义变量赋值，无需多次重复设置

### **(2)素材库-素材组遮罩功能**

素材组支持配置遮罩，仅保留遮罩内的部分进行使用

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/3cb84b13-ef00-4184-928c-6a0c2b4680b9.png)

配置参数| 说明  
---|---  
 _开启遮罩_|  开启才会开放其它配置内容，并在使用时，仅有遮罩部分会展示  
 _遮罩形状_|  可选矩形、圆形![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/4e7004d6-d361-4cb4-b1df-6886667d9be1.png)例如配置圆形，可以配出如下效果![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/9c574a22-8275-44b5-83d6-371d572feb2f.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/03341b65-e4c9-4957-9941-8f9b8de4842f.png)  
 _位置_|  遮罩的中心位置  
 _大小_|  遮罩的大小  
  
# 四、界面控件的渲染模式

在月之五及之前的版本中，界面控件的渲染仅和创建时序有关，层级参数并未生效。在月之六版本我们对其进行了修复，并提供了两种渲染模式，分别为【时序渲染(旧)】和【层级渲染(新)】，可以在界面控件组管理中图示位置点击进行切换

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/0b4c23ba-01a6-411c-9773-6c18fe070789.png)

**时序渲染(旧)** ：原有的渲染逻辑，该模式下将按照“界面控件”创建时序进行渲染。月之六版本更新前创建的关卡存档、已发布的关卡均默认为该模式。如果需要对控件进行修改，那么新增的控件可能会出现层级显示的问题，建议切换到【层级渲染(新)】模式；如果不需要对控件进行修改，可以保持该模式

**层级渲染(新)** ：月之六版本新增的渲染逻辑，该模式下“界面控件”将会按照层级配置顺序进行渲染，支持对界面控件层级进行调整。月之六版本更新后新创建的关卡存档将默认为该模式。如果需要对旧存档的控件进行修改，或者需要创建新的存档，建议选择该模式

此外，请注意后续版本将不再维护新增控件在【时序渲染(旧)】模式的表现，建议奇匠们在月之六版本更新后均使用【层级渲染(新)】模式进行制作

【时序渲染(旧)】模式切换到【层级渲染(新)】模式后，推荐的修复方式



检查层级配置，层级越大越靠上；同层级的会按照创建时序排列，后创建的在上



层级渲染模式下，界面布局中的控件层级低于界面控件库中激活的控件层级，若原先是通过节点的创建时序实现主屏控件显示在控件模板上层的话，推荐都转为控件模板，然后通过层级配置实现

# 五、额外说明

## 1.搜索筛选功能

所有控件支持按控件名称、ID进行搜索，按类型进行筛选

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/b49b7ffe-f48c-4a00-b9ee-46be1e94ac7d.png)

## 2.控件可填入变量迭代

各个控件可填入变量的输入区域支持选列表、字典、结构体内的变量

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnapxrumtzy/55d66ab8-c75c-4aae-ba67-a2bc6e354a07.png)
