# 概念介绍/功能/通用组件/跟随运动器

(来源：原神千星奇域·综合指南，页面 ID mhuts59m9gju)

# 一、跟随运动器组件的功能

跟随运动器组件赋予实体跟随另一个实体运动的功能

跟随运动器组件上同时只能生效一个跟随运动器

# 二、跟随运动器组件的编辑

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuts59m9gju/823bb4cc-9d23-4c87-a59b-8e30bff69292.png)

(1)在实体/元件编辑界面中，打开组件编辑页签

(2)点击下方的“添加通用组件”，选择并点击“跟随运动器”，成功添加

(3)点击“详细编辑”，展开编辑页

# 三、参数配置

跟随运动器的参数如下：

## 1.基础设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuts59m9gju/ac1ff35c-577b-40af-8d9e-f6eccb371b2a.png)

 _初始生效_ ：在实体创建后是否立即生效

 _追踪目标_ ：可以选择跟随运动器的跟随目标，初始也支持不设置，后续通过节点图进行动态指定

 _跟随类型_ ：目前提供了三种跟随类型



 _完全跟随_ ：同时跟随位置和朝向



 _跟随位置_ ：仅跟随目标的位置，朝向保持不变



 _跟随旋转_ ：仅跟随目标的朝向，位置保持不变

 _跟随挂接点_ ：指定跟随目标的挂接点

## 2.追踪方式

 _追踪方式_ 定义了当实体上的跟随运动器组件执行追踪逻辑时，追踪表现的细节行为定义，目前提供了三种行为表现：

### (1)吸附追踪

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuts59m9gju/330f8a3e-b5fa-43a2-b2a7-4d299efc88d2.png)

该方式会严格根据跟随位置的配置进行吸附

### (2)延时追踪

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuts59m9gju/5c53e654-d1ba-40dd-877c-3f44f92188ca.png)

带有过渡时间的追踪方式。当跟随目标发生位置变化时，跟随运动器会在配置的过渡时间内逐步跟随到设定的跟随位置

 _过渡时间_ ：追踪到目标跟随位置需要的时长

### (3)定速追踪

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuts59m9gju/f87d5a86-4b81-4bd4-bac4-527b130e2e5a.png)

使用指定速度进行跟随的追踪方式。当跟随目标发生位置变化时，跟随运动器会用指定的速度进行跟随。

 _初始速度_ ：跟随运动器的初始速度

 _加速率_ ：每秒的速度提升值

 _加速时长_ ：加速行为的时长

 _是否修正朝向运动方向_ ：为“是”时，将会自动调整实体的向前朝向为速度朝向

 _到达目标半径_ ：在追踪行为中跟随实体和被跟随实体的距离小于目标半径时，被视为追踪完成，追踪完成后的表现会和“吸附”相同

## 3.初始跟随位置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuts59m9gju/8ce32c71-6606-484f-8a9a-b78d574c8200.png)

 _坐标系类型_ ：决定了跟随时的偏移基于目标的世界坐标系还是相对坐标系

 _偏移_ ：基于跟随目标的位置偏移值

 _旋转_ ：基于跟随目标的朝向向偏移值

# 四、使用节点图控制跟随运动器

激活/关闭跟随运动器

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuts59m9gju/67a684d1-5d62-489e-86af-d1001263c662.png)

以实体切换跟随运动器的目标

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuts59m9gju/2208f0b7-9328-4788-9753-f62939691d79.png)

以GUID切换跟随运动器的目标

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuts59m9gju/ce5bad02-026c-4c58-8c0e-6b725bf1ffcb.png)

获取当前跟随运动器的目标

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuts59m9gju/f90e4fff-bde5-4677-9f52-921268773939.png)

# 五、特殊说明

当带有跟随运动器的实体跟随物件时，若跟随过程中物件被销毁，则该实体会立刻停止跟随停在原地

当带有跟随运动器的实体跟随玩家时，若跟随过程中角色倒下，则该实体会继续跟随朝角色倒下位置移动，当角色复苏时相当于重新进场，此时该实体会被重置回创建位置并从创建位置开始跟随
