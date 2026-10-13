# 概念介绍/高级概念/界面控件组管理/客户端控件和客户端脚本

(来源：原神千星奇域·综合指南，页面 ID mhbgxf0nynww)

# 一、客户端控件和客户端脚本的定义

 _服务器控件：_ 7.1版本更新前所有的界面控件都是服务器控件，受服务器节点图控制

 _客户端控件：_ 不受服务器节点图控制，而是受到客户端脚本控制，客户端控件需要搭配客户端脚本使用

 _客户端脚本：_ 可以通过脚本对客户端控件进行逻辑控制，需要搭配客户端控件使用，脚本调用的详细接口请参考[客户端控件API文档](/ys/ugc/tutorial//detail/mhtakr07vej4)

# 二、客户端控件的入口

## 1.从客户端控件模板进入编辑

界面控件组管理-界面控件组库-客户端控件模板，点击【添加客户端控件】后可以选择添加所需的客户端控件并存为模板

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/df069644-2305-4a1d-b440-e65779535b36.png)

## 2.从客户端控件容器进入编辑

界面控件组管理-界面布局-点击【添加界面控件】-添加并选中【客户端控件容器】-画布设置-前往编辑，可以在容器详情中添加并编辑客户端控件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/40840a55-8058-4f95-b8d6-07d83a3c1e2c.png)

# 三、客户端控件使用方式

要让客户端控件能正常显示在主屏中，需要依托于 _客户端控件容器_(自身为服务器控件)，所有的 _客户端控件_ 都需要在 _客户端控件容器_ 内进行创建

运行时，仅当客户端控件所处的客户端控件容器状态处于激活且可见时，客户端控件和脚本可正常生效

接下来将示例如何创建一个能够正常生效的客户端控件

## 1.新增客户端控件容器

在界面控件组管理-界面布局中，点击添加界面控件-新增客户端控件容器

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/9283b7b8-bbe8-4844-a72b-3d831405d0e6.png)

## 2.编辑客户端控件容器画布

选中客户端控件容器，可以通过编辑画布设置，来修改客户端控件容器中的客户端控件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/1a3f7fe0-b8a7-470f-9bca-45b1299c111f.png)

点击【前往编辑】后会打开客户端控件容器的详情界面，在此界面可以编辑客户端控件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/591c929c-25c8-4b4a-b530-8e93a9560ece.png)

## 3.创建客户端控件

在客户端控件容器详情中，可以通过 _添加控件_ 来添加所需的客户端控件

需注意，客户端控件所依赖的客户端容器控件必须处于开启状态，该客户端控件才可在运行时于主屏正常显示，客户端容器控件隐藏或关闭的情况下都会导致其中的客户端控件无法正常显示

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/ab4eeeb6-4a3b-49f9-ac56-c517c9cb7c5a.png)

# 四、相关的界面控件资产

## 1.服务器控件资产

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/f10ae750-d01a-4f03-8e23-86523f7efb26.png)

 _客户端控件容器_ 用于使 _客户端控件_ 能在奇域关卡运行时正常显示，但其本身属于服务器控件

详见[客户端控件容器](/ys/ugc/tutorial//detail/mhlz2lrly3dq)

## 2.客户端控件资产

客户端控件只有在 _客户端控件容器_ 的画布设置，或 _客户端控件模板_ 中才能添加

以下所提到的查询接口，可以在[客户端控件API文档](/ys/ugc/tutorial//detail/mhtakr07vej4)中找到更详细的介绍

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/19662134-f852-4f8a-a192-62685ca73452.png)



**容器节点**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/0fbdcc24-0688-4cc0-a4cc-e37568b05b5a.png)

主要作为其他客户端控件的挂点

详见[容器节点控件](/ys/ugc/tutorial//detail/mh3qqq9xc102)

查询接口：可通过`ContainerControl`在API文档里查询关联脚本接口



**文本框**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/947f11d2-ffbc-4a40-af23-66928d7376f0.png)

基础功能与服务器文本框控件一致，但额外支持了手柄导航

详见[文本框界面控件](/ys/ugc/tutorial//detail/mhnltrr3g966)

查询接口：可通过`TextBoxControl`在API文档里查询关联脚本接口



**文本视窗**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/e0d321e5-0b8e-4b59-8ec6-7f18048e1084.png)

在具有所有文本框控件功能的基础上，额外支持了文本框滚动

详见[文本视窗控件](/ys/ugc/tutorial//detail/mhv38jig94kk)

查询接口：可通过`TextWindowControl`在API文档里查询关联脚本接口



**图片**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/dfa65923-b49c-4308-a29e-12b22dd2055c.png)

基础功能与服务器图片控件一致，额外支持了遮罩功能和手柄导航

详见[图片控件](/ys/ugc/tutorial//detail/mh2oih9jou22)

查询接口：可通过`ImageControl`在API文档里查询关联脚本接口



**界面动效**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/8981ce1c-dfed-42b6-96e2-3795b664783c.png)

基础功能与服务器界面动效控件一致，额外支持了手柄导航

详见[界面动效控件](/ys/ugc/tutorial//detail/mh2iyk9fa4gy)

查询接口：可通过`UIAnimationControl`在API文档里查询关联脚本接口



**全屏界面动效**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/0ce55319-c260-4124-98db-a0b0caa498b8.png)

基础功能与服务器全屏界面动效控件一致，额外支持了手柄导航

详见[全屏界面动效控件](/ys/ugc/tutorial//detail/mhbn4i09l5ns)

查询接口：可通过`FullscreenUIAnimationControl`在API文档里查询关联脚本接口



**预设按钮**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/57592d12-9dbf-4ec8-b2e8-cea0c01f1a58.png)

特殊的客户端交互按钮，可以配置四种状态的图标和显示文本

详见[预设按钮控件](/ys/ugc/tutorial//detail/mhdbkf04v6y8)

查询接口：可通过`PresetButton`在API文档里查询关联脚本接口



**按键提示**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/9cda0fb3-278c-4c9e-9f15-60d22b67ec41.png)

封装的提示信息控件，可配置PC、键鼠和手柄端的快捷键

详见[按键提示](/ys/ugc/tutorial//detail/mh265urgupye)

查询接口：可通过`UIKeyHintControl`在API文档里查询关联脚本接口



**光标检测区域**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/b1a755eb-c09a-4fda-8a48-bb33deb5dab2.png)

可以用于制作光标的事件检测

详见[光标检测区域控件](/ys/ugc/tutorial//detail/mhd4fxr5v6la)

查询接口：可通过`CursorEventArea`在API文档里查询关联脚本接口



**网格视窗**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/d5f2c6fb-e504-4911-b067-285ca844ec2f.png)

可以作为滚动列表使用，制作道具背包、商品列表等

详见[网格视窗](/ys/ugc/tutorial//detail/mhfkrr0i7gds)

查询接口：可通过`GridScrollerControl`在API文档里查询关联脚本接口



**模板引用控件**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/3f7c439b-d5a0-46df-bbe6-067a861a8236.png)

可以引用其他模板，并提供预览

详见[模板引用控件](/ys/ugc/tutorial//detail/mhucb6reudwm)

查询接口：可通过`ReferenceControl`在API文档里查询关联脚本接口

# 五、客户端控件关联功能

## 1.客户端和服务器的通信规则



 _客户端脚本向服务器发送信号：_ 客户端脚本通过`ServerSignal:SendSignal()`方法向服务器发送信号，可以通过`ServerSignal`相关的方法为信号添加不同参数



 _服务器通过节点图向客户端脚本发送信号：_ 通过服务器节点【发送客户端脚本信号】可以向客户端脚本发送信号，客户端脚本通过`script:RegisterServerSignalHandler(signalName: string, callback: fun(signalName: string, signalParams: any[]))`方法监听服务器信号



 _发送信号延迟：_ 联机情况下，服务器发送信号的延迟最低为100ms

## 2.客户端控件和客户端容器控件的联动规则



 _客户端控件的显示：_ 客户端控件挂载的客户端容器控件显示时，控件和脚本正常运行



 _客户端控件会销毁的情况：_ 客户端容器控件隐藏或销毁时，客户端控件销毁

## 3.客户端控件断线重连的处理



玩家传送、断线重连时，所有的客户端控件都会被销毁然后回到初始状态，若需在传送后仍保留传送前的界面显示，需要奇匠自行处理界面恢复逻辑

## 4.客户端按键事件响应规则



客户端按键事件按照控件的渲染顺序传递，层级和排序靠前的控件响应优先级更高



可以通过`AddKeyEventListener`接口处理按键的响应规则

## 5.手柄导航



仅在当前界面存在已聚焦控件(即手柄导航的框定位到对应控件)的情况下，才能响应手柄导航事件的触发



当前界面若无已聚焦控件，所有的手柄导航事件无法正常触发和响应

### (1)容器节点手柄导航配置方法



启用隔离手柄导航的情况下，手柄按照距离最近控件导航时，内外相互不穿透

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/20fe45e2-0f71-47dd-9f8c-0ad3c47eec43.png)

### (2)脚本配置方法



仅靠控件无法进行完整的手柄导航配置，需要在脚本里处理适配的相关逻辑



需要在脚本中规定界面默认选中的控件，使用`SetControllerFocus`和`GetControllerFocus`接口

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/b7791a51-0e0e-4839-bd91-00d39b14409a.png)

## 6.本地化功能



可以通过多语言文本管理-脚本文本变量，管理脚本相关的多语言配置



已经配置的TextmapID，可以在脚本中通过`GetText`方法在API文档中查到

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/ee4a5283-b975-4101-a2c8-e20f90740faa.png)

## 7.音频功能



可以通过`PlayAudio2D`在API文档中查询音频相关的接口

## 8.日志功能



日志功能将用于查看客户端脚本运行期间的信息和报错内容

### (1)使用方法



 _开始调试：_ 在日志中勾选客户端脚本-确认选择



 _调试显示：_ 运行过程中若脚本存在错误，可通过双击对应条目查看具体的错误信息

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/81f104c9-cd67-496c-a85f-40ebabd47ee0.png)

### (2)本地日志



如果运行时出现了 _循环调用_ 等情况，可能导致进关加载变久或卡死，且正常日志无法报告此情况，此时可以通过本地日志查询具体的日志信息



本地日志的路径和客户端脚本的储存路径一致，文件名为ErrorLog.txt(本地日志仅在出现正常日志无法报告的错误时才会创建)

# 六、客户端脚本的入口

千星沙箱-客户端脚本资源管理器-客户端脚本映射文件夹内

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/c29e0853-5056-414f-a224-d521a02fef6d.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/5d8ced35-90f4-4649-878c-8b7b639e3672.png)

# 七、客户端脚本的使用方式

客户端脚本可以实现绝大多数2D玩法，以及界面的动态效果

接下来将示例如何创建一个可以正常运行的客户端脚本：

## 1.使用脚本映射创建

通过编辑文件路径将客户端脚本与本地文件关联，保存并试玩时就能使对应文件的lua脚本正常运行

### (1)新建脚本映射



在任意客户端脚本文件夹内右键-新建脚本映射

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/0bfd4b75-1139-45fa-9409-2b3a312ff110.png)

### (2)编辑脚本映射路径



脚本映射需要和本地文件关联，才能使本地文件中的脚本在试玩时正常运行

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/34678c51-1359-4e1d-8f03-3443325a1d08.png)

### (3)选择与脚本映射关联的本地文件



在打开的文件夹中选择需要与脚本映射关联的本地文件



成功关联的状态如下图所示

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/9f3e3a40-4186-42a6-986e-2b3a95bdba14.png)

## 2.使用客户端脚本创建

使用新建客户端脚本选项，可以在本地创建脚本文件的同时新建脚本映射，并将二者进行关联

### (1)新建客户端脚本



在任意客户端脚本文件夹内右键-新建客户端脚本

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/b6f5c190-2f44-4814-b173-75567f0a0b99.png)

### (2)创建客户端脚本和本地文件



在打开的文件夹中，编辑本地文件名称并保存，以此方法创建的脚本映射将与本地文件使用相同的命名



成功创建脚本和关联本地文件的状态如下图所示

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/804ecf9b-49f0-45ca-ade4-608592db6178.png)

## 3.将脚本与客户端控件关联

脚本需要与客户端控件关联才能正常生效



在任意客户端控件-脚本页签中，点击添加脚本，为该控件挂载客户端脚本



 _脚本上传规则：_ 只有在千星沙箱里建立了映射的lua文件才会被打包上传，仅在本地创建文件但未建立映射的脚本，无法在运行时正常上传

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/be3704bc-09a6-47b7-b184-916744ebc2b1.png)

# 八、客户端脚本的使用规则

客户端脚本只能获取到客户端控件的模板索引，客户端脚本可以通过调用客户端控件的模板索引在运行时动态创建客户端控件，或修改对应控件中的内容

除客户端控件容器画布中的客户端控件以及客户端控件模板中的控件外，其他控件均为服务器控件，服务器控件的模板索引无法被客户端脚本调用

## 1.如何在脚本中调用客户端控件

调用客户端控件要用到控件的控件模板索引，接下来将介绍控件模板索引的概念及如何调用控件模板索引

### (1)调用客户端控件的模板索引



编辑时，可以通过点击客户端控件查看对应的控件模板索引ID



可以通过`ControlPrefabIndex`在API文档中查询控件模板索引ID的相关接口并使用脚本调用



 _运行时：_ 客户端控件会生成运行时ID供脚本调用，可通过`controlId`在API文档中查询运行时ID的相关接口



 _注意：_ 仅存为模板的客户端控件的 _父节点_ ，支持通过接口`ClientUIBaseControl`被动态创建



 _注意：_ 挂载在主屏中的客户端控件，以及存为模板的客户端控件的 _子节点_ ，均不支持通过脚本接口动态创建

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/8fd64e6b-89e1-4448-a3e4-a97356ed6dcb.png)

### (2)调用脚本映射ID



可以通过脚本映射ID在脚本中调用其他脚本



可以通过`scriptMappingId`在API文档中查询脚本映射ID的相关接口

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/664fb324-f3ac-499a-b558-683bdc19f65c.png)

## 2.客户端脚本变量

客户端脚本资源管理器-右键任意客户端脚本-编辑脚本变量，可以配置脚本中的变量内容



 _客户端控件ID：_ 编辑时需填写客户端控件对应的模板索引，运行时脚本可以通过变量拿到此模板索引对应的运行时ID

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhbgxf0nynww/78561ae3-e31d-4f07-93ea-2b3b5321ca3a.png)

#
