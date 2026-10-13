# 概念介绍/高级概念/界面控件组管理/界面布局

(来源：原神千星奇域·综合指南，页面 ID mhozt0r74ng6)

# 一、界面布局的定义  
  
界面布局是关卡运行时，玩家用于进行信息获取和交互操作的界面。

在包含基础功能的 _默认布局_ 之上，支持玩家对界面布局自定义。

界面布局依赖玩家运行，运行时每个玩家有且仅有一个生效的界面布局。

# **二、界面布局的管理**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/acbb9b99-03eb-439b-a17e-3da6f2744a4c.png)

界面布局通过 _界面控件组管理-界面布局_ 统一管理。

仅支持对关卡运行中表现的界面做编辑和引用，并不支持对匹配、结算等必要流程界面的编辑。

## 1.默认配置

玩家在关卡游玩时使用的界面布局，需要通过 _职业_ 进行配置。



打开“职业”编辑界面，通过 _选择布局_ ，引用界面布局

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/92779ffe-1a5e-4282-a147-25547bd530e0.png)



界面布局的参数配置窗口也可以直接跳转到该编辑界面

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/4fcfc59d-1dcf-40b9-a7db-ebb4cf7937e5.png)

## 2.以节点图管理



切换当前界面布局

通过布局索引，将目标玩家当前的界面布局按需替换。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/0a58f49b-25e4-4af4-b7c3-ea3b27211f31.png)

配置参数| 说明  
---|---  
 _目标玩家_|  需要切换界面布局的玩家实体  
 _布局索引_|  界面布局管理工具中，指定布局的索引![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/8d1828f2-915e-401c-9714-da19bfdb0e36.png)  
  


获取当前界面布局

运行时，获取玩家当前的界面布局索引。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/c043d32c-68ef-4eaf-ab92-dad6650cd52f.png)

# **三、界面布局的适配说明**

##  1.选择设备

由于不同设备上的分辨率/按钮排布等界面布局差异较大，如果需要制作 _PC端/移动端/主机端_ 都可以游玩的关卡，则需要调整控件在不同设备上的 _位置、大小、锚点_

可调整设备的位置有两处：

(1)顶部栏：可选择设备及分辨率

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/2da04304-7158-42be-b9ac-fa0eb308999b.png)

(2)控件详情-变换：点击选择设备![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/9bc2563f-7b07-42db-b18c-2e15216f0bc3.png)

不同设备在16：9分辨率下的主界面样式：

所选设备| 图标| 主界面示意图（16:9分辨率）  
---|---|---  
PC端| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/989765f6-7c82-46fc-a341-98f0823d0ddf.png)| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/d1796736-4795-4d25-ac05-756d84e9493d.png)  
移动端| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/622c7975-7072-4025-9233-6128d37022a1.png)| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/8a2ae3ba-4ce1-41af-a3be-2c0d5ddf22c5.png)  
主机端| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/d2ddb3af-9934-4103-9d37-b23ffa19475e.png)| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/5af513ae-49c1-41d1-aa50-fea7d5e04712.png)  
移动端手柄| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/d31769a9-1fdf-4e09-9051-363cdd52cf25.png)| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/5f481107-1115-4004-bdb8-d6d3597eabe1.png)  
  
## 2.调整位置与大小

### (1)位置

以画布左下角为原点，显示控件中心点与原点的相对位置

每个设备需单独设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/42226a2b-c323-434e-88c1-540973fcda1a.png)

### (2)大小

调整控件当前大小，点击右上角链条按钮可锁定当前长宽比，部分控件大小不可调整

每个设备需单独设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/03b61fbb-de5c-4ade-8521-757855447900.png)

## 3.锚点

### (1)定义

当分辨率变化时，控件会自适应位置与设置的锚点保持相对位置不变

以下图选中的任务文本为例：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/6c1d50ac-864a-4984-8918-a08a0cc3ea78.png)

所选锚点| 分辨率更改为21:9后  
---|---  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/ed7346e8-f16c-466b-93e3-ddc93cd8a6af.png)| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/24bcfe4b-cc5f-4c60-83b1-dc5c5a53a6ab.png)  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/4fc80614-ea4f-481c-86d8-60b22e687be6.png)| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/162e19a4-d28e-472e-9eb8-2283ad82bf44.png)  
  
### (2)**锚点选择建议**



根据控件所在位置：在九宫格中主体位于哪部分就选择对应位置的锚点

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/82dbce31-5bc9-4b3e-b5c2-e7f2c7afb204.png)



根据功能区：比如任务描述，多条文本框的锚点选择应该保持一致

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/93f777ed-50e2-42fa-a9e5-97257a79b88a.png)

### (3)**锚点类型扩展-拉伸锚点**

锚点类型中新增了拉伸锚点类型，使得UI元素可以根据背景或容器的大小变化进行拉伸适配

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/298f582a-b6ee-421e-88d1-d64081101261.png)

### (4)新增**锚点类型扩展-跟随固有控件**

原有的控件锚点功能，在适配不同的设备屏幕宽度时，无法与部分固有控件对齐，以技能区为例，图示中的文本框控件在屏幕比例为16：9时和技能区控件中的槽位保持对齐，切换至19.5：9后，文本框的位置相对技能区发生了偏移

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/ed19f75a-aa77-4ae3-a903-d8ff17a99e50.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/7840ea00-38f8-4248-a6fc-822b4f9ab07c.png)

借助新的锚点配置方式：跟随固有控件，在选取跟随对象为技能区后，在屏幕大小变化时，文本框控件即可正确与技能区的技能槽位保持对齐了

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/6f08feed-30a6-432e-88ca-02ac979c022f.png)

### (5)控件锚点外显

控件锚点在编辑画布中可常驻显示，点击拖拽可修改锚点位置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/0f522368-24ee-47d3-bd05-f43045e0d832.png)

## 4.界面死区

移动端界面最小，需要以移动端16:9适配作为基准确保可点击控件在红框区域内

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/f6ba2a5e-a5be-43aa-a56d-c84423c1e4bc.png)

# 四、界面规范参考

## 1.文字参考

### (1)字号

输入文本时建议参考下图选择字号，通常采用20号字

类型| 推荐字号  
---|---  
大标题| 36-32  
小标题/按钮文本| 24  
正文（最常用）| 20  
辅助字| 18  
推荐最小字号| 16  
  
### (2)字色

可使用 _< color=#FFFFFF>文本内容</color>_的命令符来改变中间文本的颜色，其中#FFFFFF可替换为下列颜色编码

深色底（弹窗/主界面中）  
---  
标题/次要文字| #D3BC8E  
普通文字| #FFFFFF  
关键字1| #FFCC33  
关键字2| #37FFFF  
警示文字| #FF5E41  
  
浅色底（Tips等）  
---  
普通文字| #4A5366  
次要文字（75%不透明度）| #4A5366BF  
关键字1| #F39000  
关键字2| #3399CC  
警示文字| #FF5E41  
  
其他特殊颜色：

元素属性颜色  
---  
水| #80C0FF  
火| #FF9999  
风| #80FFD7  
雷| #FFACFF  
草| #99FF88  
冰| #99FFFF  
岩| #FFE699  
  
品质颜色  
---  
灰| #CCCCCC  
绿| #ACFF44  
蓝| #50F4FF  
紫| #F998FF  
橙| #FFE14B  
  
弹窗：

小标题——字色#D3BC8E

内容——强调文本优先使用黄色（#FFCC33），新起的段落前需空一行

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/42be9796-1042-484a-b921-dade14e63177.png)

### (3)文字描边功能

可以输入文本的相关控件均添加了文字描边功能

如图所示，对于部分显示在亮色底板上的暗色文字而言，奇匠可以关闭【启用文字描边开关】开关，以增强文本的可辨识度

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/6da9ea9c-6382-4611-b7b6-1825b1ee2f65.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/ee1e8a9e-8339-458e-84f1-8a40edc54477.png)

## 2.界面布局参考

### (1)主界面任务

任务：主要任务文本框字号20号，次要任务字号18号，锚点左上角



多个次要任务：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/8b1f930a-a995-4bfe-9303-178daf2fd445.png)



次要任务带成功失败的情况：成功字色#ACFF44，失败字色#FFFFFFBF

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/f5cc5d27-5a09-4075-8a0e-6a8e4f7f7f9d.png)



有任务描述：描述文本18号，文本数量过多可考虑使用16号

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/f373fa96-4551-4f29-b46e-dc21df00eb26.png)



带追踪距离的任务：距离显示需在文本中插入 _自定义变量_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/65d76f6d-0d03-4309-a0ce-6aed0ae5fcf5.png)

### (2)提示

文本框字号20，居中，长度5000（适配各种屏幕不露出边界），锚点正上方

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/da0070a0-1620-4ab1-8438-872c53c1bd8e.png)

### (3)窗口

弹窗：

小标题——字色#D3BC8E

内容——强调文本优先使用黄色（#FFCC33），新起的段落前需空一行

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhozt0r74ng6/ea2351a1-71af-423b-aee5-ea7e3574a1f5.png)
