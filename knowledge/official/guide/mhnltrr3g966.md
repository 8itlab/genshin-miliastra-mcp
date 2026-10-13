# 概念介绍/资产/界面控件/文本框界面控件

(来源：原神千星奇域·综合指南，页面 ID mhnltrr3g966)

# 一、文本框的功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnltrr3g966/6eb7b309-a986-4803-b06d-0d9021e06db6.png)

关卡运行中，显示预先编辑的 _文本内容_

若文本内容中包含自定义变量，会实时更新显示。

# **二、文本框的编辑**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnltrr3g966/8bc744ed-2c89-484e-a6de-8358948f5c86.png)

 _背景颜色_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnltrr3g966/62c30aac-d679-4a2d-8e45-afc7f27cd65e.png)

支持配置透明、黑色半透明底色

 _字号_

文本显示的字号大小配置

 _文本内容_ __

编辑文本框内显示的内容，支持编辑基础字符、文字、数字、自定义变量。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnltrr3g966/55c1853a-d32d-4621-9ee8-bb1c86a0d580.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnltrr3g966/e45ec2a2-018c-4d44-9324-f028b645b61f.png)

通过插入变量，可以选择预定义在关卡实体、玩家实体上的 _自定义变量_

插入的自定义变量数据变化后，运行中显示的文本内容会进行更新。

插入引用的自定义变量以富文本的形式填写，格式为：

**{类型:前缀.变量名}**

类型：

引用自定义变量时，为1

前缀：

见下表

**自定义变量目标**| **前缀**  
---|---  
玩家1~8| p1~8  
关卡实体| lv  
玩家自身实体| ps  
  
例如：需要插入引用一个4号玩家上的名为【测试2】的自定义变量，富文本应写为：{1:p4.测试2}

_对齐_

可根据文本位置与内容选择合适的对齐方式

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnltrr3g966/96ebbe9c-b116-49f2-a17a-42402b9f5e0b.png)

对齐方式| 说明| 示意图  
---|---|---  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnltrr3g966/b7445f40-62bd-4c55-b63c-a401ef13e1ef.png)| 左侧对齐| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnltrr3g966/c5f27949-b4c5-44f8-92cc-98139b592462.png)  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnltrr3g966/8c285ce9-08c5-4f46-9663-03d47410b041.png)| 水平居中| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnltrr3g966/735d1b89-d226-4546-9223-ff13d9a7c7a2.png)  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnltrr3g966/ae253126-b3b1-4261-8cf0-55be38763054.png)| 右侧对齐| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnltrr3g966/a5a2ef4a-2436-49dd-92c5-03af02b20826.png)  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnltrr3g966/39cd305c-2942-48eb-8fa9-7735129e2685.png)| 顶部对齐| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnltrr3g966/f8815813-7167-4ad8-84a7-f69f53a9e203.png)  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnltrr3g966/fbd7bd93-3e4d-4b66-9460-95fd43082df7.png)| 垂直居中| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnltrr3g966/dfce3745-8c5a-4fe6-9f28-78a333dacaa2.png)  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnltrr3g966/f47554dc-7e0a-4d92-a232-cc3ba1cb0f21.png)| 底部对齐| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnltrr3g966/8ef7b965-a246-4525-9d87-959cf68964c4.png)  
  
# 三、文本框在界面布局的调整

将鼠标放在编辑窗口内，正在编辑中的文本框边界，鼠标将会变成箭头符号，支持调整文本框的大小。

调整后，其位置、大小参数会同步进行更新。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnltrr3g966/e37791ea-1dce-4cc2-aabc-2eb99c961446.png)

# 四、客户端控件中的文本框

客户端文本框控件可以挂载 _客户端脚本_ ，支持通过 _客户端脚本_ 进行调用

查询接口：可通过`TextBoxControl`在API文档里查询关联接口

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnltrr3g966/164c0217-944b-40ff-b4d6-9a2ea30be2be.png)

## 1.手柄导航



 _可被手柄摇杆导航选中：_ 控制手柄导航是否可选中此控件

开启后可编辑手柄四向移动时选中的其他控件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhnltrr3g966/1b05f599-dc61-46bc-a853-387de23f9182.png)
