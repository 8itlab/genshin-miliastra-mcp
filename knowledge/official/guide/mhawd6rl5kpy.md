# 概念介绍/功能/通用组件/全局计时器

(来源：原神千星奇域·综合指南，页面 ID mhawd6rl5kpy)

#  一、全局计时器组件的功能

 _全局计时器_ 组件提供计时能力，支持操纵计时的暂停、重启、修改，也支持同步界面控件显示计时时间

全局计时器支持配置多组静态计时器数据

全局计时器在不同的运行时实体上独立运行

# 二、全局计时器的使用方式

全局计时器有两种使用方式

1.实体编辑组件配置引用计时器，计时器会随实体创建一同激活。

2.节点图执行节点激活计时器，计时器会随节点图的执行激活。

# 三、全局计时器管理工具

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhawd6rl5kpy/3fe3631c-95ca-4575-9c5f-44d85910bb84.png)

通过计时器管理工具，可预定义所有的全局计时器。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhawd6rl5kpy/90b1c534-6797-4411-8713-59cf7364ebac.png)



全局计时器列表

枚举当前关卡所有预定义的全局计时器

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhawd6rl5kpy/c6eeebe1-6db5-48fb-93d6-0344c0833674.png)

# 四、全局计时器的编辑



添加计时器

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhawd6rl5kpy/8b55b178-4993-4e95-87fe-1d2717055893.png)

通过上图按键，可新增计时器



命名和序号

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhawd6rl5kpy/ad5fd724-2910-47e5-8988-e87176745d58.png)

点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhawd6rl5kpy/9f203aa9-a181-441a-aad5-9235983ab44e.png)图标，可重命名，或删除指定计时器

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhawd6rl5kpy/ad3a2fcc-0166-4f4a-aa4c-b0db9c463f95.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhawd6rl5kpy/e26eb8e7-cbd0-4c6c-9859-daf9fc9a085c.png)

该名称就是全局计时器的引用



基础信息

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhawd6rl5kpy/98b2b162-656f-48cf-9c75-9f0b87c027de.png)

配置参数| 说明  
---|---  
 _全局计时器类型_|  提供 _倒计时、正计时_ 两种  
 _时长(s)_|  当计时类型为倒计时，需要配置时长  
  
# 五、全局计时器的引用

## **1.以界面控件引用全局计时** 器

打开[界面布局](/ys/ugc/tutorial//detail/mhozt0r74ng6)管理工具，选择[计时器界面控件](/ys/ugc/tutorial//detail/mhnrdor7uyra)的“计时器”，进行编辑

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhawd6rl5kpy/7e0ee71d-86ec-485f-a603-d6eabe621e0a.png)

配置参数| 说明  
---|---  
 _类型_|  正计时、倒计时  
 _指定计时器_|  会枚举符合“类型”的所有预定义全局计时器  
 _来源实体_|  默认配置为关卡实体，可选择关卡实体，或者玩家实体  
  


选择的来源实体需要配置“全局计时器组件”



若界面控件配置的计时器，在来源实体运行时并未生效，界面控件会显示默认值00:00

当来源实体运行时，所选计时器处于生效状态，且该界面控件激活时，该界面控件会显示具体计时器的时间信息

## 2.以组件引用全局计时器

### (1)添加组件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhawd6rl5kpy/a12f91a3-3041-41e3-93e9-389017c42782.png)

a.在实体或元件编辑界面中，打开组件编辑页签

b.点击下方的“添加通用组件”，选择并点击“全局计时器”，成功添加

c.点击“详细编辑”，展开编辑页

### (2)引用计时器

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhawd6rl5kpy/aff55349-a7b7-4a2f-b007-560b468ea9c5.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhawd6rl5kpy/26c10710-d98f-46da-8dcc-a9b992779278.png)

点击“添加计时器”，会弹出全局计时器枚举窗口，可按需选择需要的全局计时器。

通过组件引用的全局计时器，会随实体创建一同激活生效。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhawd6rl5kpy/37a56f74-2192-48d9-8fb3-6ed869625f37.png)

点击“管理计时器”，会打开全局计时器管理工具

# 六、以节点图引用全局计时器



启动全局计时器

可通过节点图，引用全局计时器，以运行中实体为载体运行

此处的计时器引用，只能是全局计时器管理工具中预先定义的计时器，否则无效

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhawd6rl5kpy/4417c741-6568-4d68-8865-a33aa0081223.png)



终止全局计时器

通过节点图，提前结束运行中的全局计时器

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhawd6rl5kpy/0a1f3b39-594b-4e08-8e0b-57b8e62df600.png)



暂停全局计时器

通过节点图，可以暂停运行中的全局计时器。

暂停时，若有界面控件引用对应计时器，则其显示时间也会暂停

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhawd6rl5kpy/80d0892a-e61c-4b44-ae25-83b5af948ace.png)



恢复全局计时器

通过节点图，可以将通过“暂停全局计时器”暂停的计时器进行恢复

若有界面控件引用对应计时器，则恢复界面控件的计时表现

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhawd6rl5kpy/2529c1b6-c4a5-4cc8-93a3-c267839cb769.png)



增加全局计时器的值

通过节点图，可以将运行中的全局计时器时间进行调整。

 _增加值_ 若计时器为倒计时，则正数为增加倒计时剩余时间，负数为减少剩余时间。

若计时器为正计时，则正数为增加正计时累计时间，负数为减少累计时间。

若计时器先暂停，后修改减少时间，则修改后时间最少为0s

若为倒计时，则暂停后修改时间为0s且恢复计时器后，会触发【全局计时器触发时】事件

若计时器先暂停，后修改时间到0s，再修改增加时间，再恢复计时器，则不会触发【全局计时器触发时】事件

若有界面控件引用对应计时器，则界面控件的计时表现会同步修改

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhawd6rl5kpy/568a717f-57a1-43b6-9d12-e26f8119c926.png)



全局计时器触发时

当倒计时的全局计时器，计时结束，会向节点图发送事件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhawd6rl5kpy/c64c3fe9-7a5a-4ff5-a369-d4c17f6a9f15.png)



获取全局计时器当前时间

通过节点图，可以获取运行中全局计时器的当前时间。

 _当前时间_ 若计时器为倒计时，则获取剩余时间。

若计时器为正计时，则获取当前累计时间。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhawd6rl5kpy/8140d3dc-168e-4ea4-b81a-f0db46ae3e37.png)
