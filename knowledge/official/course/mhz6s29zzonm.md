# 基础功能逻辑&玩法流程/2.12场景生成模板管理——快速生成关卡的场景

(来源：原神千星奇域·教程，页面 ID mhz6s29zzonm)

# 前言

## 课程说明：

**课程内容：** 学习场景生成模板的管理与使用方法，包含模板配置、参数调整及实际应用，实现快速生成与搭建关卡场景。

**学习目标：** 掌握通过配置面板调整场景生成模板，并运用模板高效搭建完整关卡场景。

## 相关信息：

**推荐学习顺序：** 【当前课程】→【综合指南】

 _**如课程中遇到概念不清等问题或想要了解更多相关信息，根据需要查询_** __【综合指南】__** _即可_

关联知识点：课程中将涉及以下基础概念 _（建议优先根据该课程学习即可，如遇到概念不清等问题或想要了解更多相关信息，再根据需要查阅_** __【综合指南】__** _相关章节）_

> [场景生成模板](/ys/ugc/tutorial//detail/mhymc4i349e4)

* * *

# 场景生成模板管理——配置场景生成模板所用到的参数

### 功能示例-1：使用默认模板生成场景

#### 1.概念简述

**场景生成模板管理：** 是用于快捷场景生成模板的模块，可以通过配置模板参数快速生成所需的场景效果。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhz6s29zzonm/4cf11864-4f40-4538-8458-da0dab698881.png)

**基础属性：** 可以修改相关模板的基础生成方式，主要有生成规则和生成范围可以进行修改。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhz6s29zzonm/0e3ef39b-f4a8-4020-99d8-9c5478911d66.png)

**资产配置：** 预设了五种层提供玩家修改分别为岩石层、建筑层、树木层、植被层、装饰物层，也可以通过添加自定义层来配置想要的样式。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhz6s29zzonm/4297c825-bd50-434f-905f-6ad3adac628b.png)

**预设模板：** 可以使用默认的模板快速放置外景所用的物件，可用模板如下图所示：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhz6s29zzonm/d7440467-8ec9-4026-9732-0487cc0cd805.png)

#### 2.教学内容

**功能效果：** 使用默认模板生成场景。

**效果演示：**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhz6s29zzonm/efd7daa6-89ae-4817-8a28-e28ac5251aef.gif)

####  3.操作步骤

**1.【局内编辑器】进入场景生成模板创建默认模板**

在![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhz6s29zzonm/248e6b8b-2bfb-4b6b-8d56-38e3164e92ec.png)【物件摆放】面板左侧的【场景生成模板】中点击【预设模板】>>>创建【斑驳幽篁】模板>>>转存到未分类页签。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhz6s29zzonm/2463fb22-a087-4ed5-bb90-cff9c4f90a36.gif)

**2.【局内编辑器】使用默认模板生成场景**

在未分类页签内找到这个模板【斑驳幽篁】，并且点击确认生成。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhz6s29zzonm/78d8adc4-2497-4faf-a94f-bc6e620fecbf.gif)

**3.【局内编辑器】进入试玩查看效果**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhz6s29zzonm/77960c36-5d57-4821-8131-67a6e1dac117.gif)

###  功能示例-2：自由配置场景生成模板参数，生成自定义场景

#### 1.教学内容

**功能效果：** 实现通过灵活配置模板中的各类参数（如岩石、植被、建筑等），生成符合特定需求或风格差异化的自定义场景。

**效果演示：**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhz6s29zzonm/43f79e0e-f0f7-46c5-992b-c3ba2c497081.gif)

####  2.操作步骤

**1.【局内编辑器】进入场景生成模板管理**

局内编辑器左上角![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhz6s29zzonm/912854ad-a636-4480-a025-a45f0d0dfad8.png)（或直接按ESC键）>>>呼出左侧面板-ESC菜单栏，下滑点击【场景生成模板管理】>>>即可打开

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhz6s29zzonm/49de991d-dda4-4b71-8a0f-c65043c8ff66.png)

**2.【局内编辑器】新建场景生成模板**

在管理中新建场景生成模板。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhz6s29zzonm/2e38a5bb-c38c-4870-b452-a8e0ca349691.png)

**3.【 局内编辑器】设置添加散布规则，使用对应预设**

可以点击下方“随机预览”按钮以预览随机效果。对散布满意的话可以点击“保存散布规则”。下次可以在“散布规则预设列表”里选用保存过的规则生成。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhz6s29zzonm/560ce2b2-b842-4d0d-8c42-234cea7e3cfd.png)

**3.【局内编辑器】修改基础属性，更改生成范围**

缩放和旋转调整成预期的参数。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhz6s29zzonm/b9b7f9a5-0ac8-4fc0-a897-a6843f146c71.png)

**4.【局内编辑器】修改资产配置，更改生成场景结果**

将你想修改的层内参数进行修改，并且可以修改生成密度和随机性，还能修改是否初始生效。相关参数功能如下：

参数名称| 参数类型| 参数设置影响  
---|---|---  
初始生效| 布尔值（切换）| 是否让该层在使用时生效  
是否基于地形生成（岩石层）| 布尔值（切换）| 是基于预览的白盒的底部生成还是基于地形生成。  
生成密度| 浮点数| 控制同一层中生成物的生成密度。数字越小，生成物越稀疏；数字越大，生成物越稠密。  
生成随机性| 浮点数| 控制生成物的采样点的震动幅度。0趋近均匀分布，1则趋近杂乱分布。  
伴生范围（植被层）| 浮点数| 仅植被层拥有，定义生成物以植被层内目标对象为圆心的生成距离。超过伴生范围则不会生成。  
  
通过参数的调整，并选择你要使用的模型资产。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhz6s29zzonm/52802ef7-87b2-451f-8fe2-1cb28a20153e.gif)

**4.【局内编辑器】修改完后点击生成，进入场景预览效果**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhz6s29zzonm/43f79e0e-f0f7-46c5-992b-c3ba2c497081.gif)

* * *

#  课程总结及辅助课件

**课程作业：** 可根据课程教学内容尝试进行以下功能复刻。

> 功能复刻：通过调整相关模板参数制作一个璃月风格的场景模板。

**课程回顾：** 学会如何使用创建默认场景生成模板，并通过场景生成模板管理修改对应参数，生成自己想要的场景效果。

### 辅助课件

我们提供了上述课程内容相关的工程文件，可结合** _【教学存档-场景生成模板管理】_** 对照学习

![](https://webstatic.mihoyo.com/upload/static-resource/2022/10/14/64e71b8a5e28fbdbc3d3df5d311e4154_847866555738962172.svg)

场景生成模板管理.gil

19 KB

[](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mhz6s29zzonm/73588d9b-fd64-46be-bb82-1b941e46f84e.gil)
