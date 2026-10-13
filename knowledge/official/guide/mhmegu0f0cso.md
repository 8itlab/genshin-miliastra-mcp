# 界面介绍/编辑工具

(来源：原神千星奇域·综合指南，页面 ID mhmegu0f0cso)

# 一、功能简介

编辑工具是一组辅助编辑功能的集合，包括包围盒显示、阵列生成、对称编辑、3D备注等

# 二、阵列生成

## 1.功能简介

支持通过两种方式（网格阵列、环形阵列）快速批量创建副本。

## 2.适用对象

物件实体

造物实体

掉落物实体

## 3.功能入口

选中物件 → 右键菜单 → 阵列

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/a762d55b-10e8-40ef-bc65-470b1fdec74c.png)

## 4.网格阵列

### (1)功能说明

按照X、Y、Z轴的间隔距离和数量，生成规则排列的物件阵列

### (2)模式特性

\- 为独占模式，进入后无法操作其他内容

\- 点击右上角【退出】按钮或使用Esc键离开模式

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/58ef1b90-d41a-4ce8-907a-7ded19a4f10d.png)

### (3)阵列设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/e6da722d-da27-49cb-ab9e-98a9699ebc27.png)

阵列间隔：表示X轴、Y轴、Z轴方向的间隔距离

阵列数量：表示X轴、Y轴、Z轴方向的生成数量

### (4)阵列预览

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/acee5a27-a8d9-49c9-823a-725c886bd062.png)

点击后预览阵列效果，不进行实际创建

### (5)阵列生成

点击右下角【确认创建】后创建阵列结果，并退出模式

## 5.环形阵列

### (1)功能说明

以某一点为中心，按指定角度间隔生成物件的圆周排列。

### (2)模式特性

\- 为独占模式，进入后无法操作其他内容

\- 点击右上角【退出】按钮或使用Esc键离开模式

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/13fc682f-7561-41f6-a93d-cb327ac47e11.png)

### (3)阵列设置

将内容按照目标轴的起点位置，按照目标轴的朝向，以输入角度和数量为准，阵列会生成对应的物件实体

例：每隔80度生成一个实体，共3个

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/6f89c6bd-1d8b-4b9a-8d44-c230db70ced5.png)

# 三、对称编辑

## 1.功能简介

通过定义对称中心、对称轴或对称面，快速生成内容的镜像副本。支持点对称、轴对称、面对称三种模式。

## 2.适用对象

物件实体

造物实体

掉落物实体

## 3.功能入口

选中物件 → 右键菜单 → 对称

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/2857b032-9c07-48a6-8387-453a83f2395f.png)

## 4.模式特性

\- 为独占模式，进入后无法操作其他内容

\- 点击右上角【退出】按钮或使用Esc键离开模式

## 5.对称操作流程

### (1)选择对称模式

在右键菜单中选择【对称】的子选项：【点】、【轴】或【面】。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/17d9cda9-4193-423c-bf71-8167b6f82d98.png)

### (2)编辑对称点、轴、面的信息

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/5126bc80-44f8-4ad6-811f-9eb19fad08e6.png)

### (3)预览对称效果

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/89136627-569b-4a5b-bdb9-d286ab2b61ca.png)

点击后预览对称效果，不进行实际创建

### (4)生成对称结果

点击右下角【确认创建】后创建对称结果，并退出模式

## 6.对称方式说明

### (1)点对称

按照对称点和对称内容的连线，以180度反方向计算新位置和旋转

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/886e2dcc-0711-41be-be6f-2bbaf103b917.png)

### (2)轴对称

以定义的点为轴心，沿该轴的方向形成对称轴，以180度反方向计算位置和旋转

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/3793bcb9-66ca-4ba2-9e40-2f496c8d2c43.png)

###  (3)面对称

以定义的点为中心，形成对称面，以180度反方向计算位置和旋转

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/9ee57e33-b377-45cb-a8b1-736cef4ad812.png)

## 7.额外说明

每次进入对称模式，对称点会新生成，对称点数据不进行保存

退出模式时对称点数据被清除

# 四、包围盒显示

## 1.功能简介

该功能为了便于编辑时对于各内容的尺寸进行测算，可以达到更精确的编辑效果

## 2.适用内容

物件实体

造物实体

## 3.功能入口

模型 - 显示类型

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/38ff5bf4-b32a-4c76-b78c-08ac01ba9fbe.png)

## 4.显示类型

仅尺寸

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/a544783d-14e8-46b0-9075-fcebb6ad10f2.png)

包围盒及尺寸

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/42741dcd-3b9d-480a-9ea3-ee4411c54014.png)

碰撞及尺寸（仅物件）

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/a521e8b6-add5-4a9c-9fe5-7f0015ddb9da.png)

# 五、备注功能

## 1.显示Z轴

### (1)功能说明

提供额外的Z轴正朝向控件显示。

### (2)功能入口

详情栏 → 底部 → 编辑工具部分

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/03482fbf-a373-4635-a5a1-de6cf8be0ca5.png)

### (3)表现效果

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/b759ad3e-2ecb-4463-be8d-faf6141f2ee3.png)

## 2.3D备注

### (1)功能说明

3D备注由图标和文本两部分组成，用于在编辑场景中显示物件的备注信息

### (2)功能入口

详情栏 → 底部 → 编辑工具部分

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/cf1c0b54-e08a-45e8-82d9-c09e3d239d57.png)

### (3)表现效果

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/e96f86fd-cd2c-4d3b-83b1-ae328a12c183.png)

## 3.全局备注显示控制

### (1)功能说明

通过关卡设置中的选项，控制所有内容的备注文本是否常驻显示

### (2)功能入口

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/98146b02-22af-4df3-80fc-1ee16f504f8d.png)

# 六、模型数据复制粘贴

## 1.功能说明

支持复制和粘贴物件的模型数据（包含主模型和所有装饰物）（造物仅复制装饰物内容）

## 2.功能入口

模型 - 复制

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/637c631b-70d1-43f9-9c72-b9cf0f57f0c3.png)

# 七、多选显示中心点位置信息

## 1.功能说明

在场景层和摆放层，多选内容后，目前可显示位置信息

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/2c452a10-1173-495b-a10f-6e988bdc3851.png)

# 八、测距功能

## 1.功能说明

测距工具是内置于编辑器中可以进行距离测量的功能

## 2.工具入口

右键菜单 → 测距线 → 【添加测距线】

点击【添加测距线】进入测距模式，可以用光标左键对地面点击选点，界面上会显示两点之间的距离

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/651e3687-0545-4dbe-b51d-a67f55a0ea27.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/7fb0351e-481c-4d5f-a915-719eccc6efbe.png)

## 3.去除测距线

方式一：可以对单条线进行删除

方式二：右键菜单 → 测距线 → 【全部删除】，可以删除所有的测距线

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/e2ec29cf-5765-41f4-b22e-6c22226131f6.png)

## 4.编辑器设置

可以在设置里调整测距线是否常驻显示

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhmegu0f0cso/ed3a68cd-772e-4886-8d10-380d57d86240.png)
