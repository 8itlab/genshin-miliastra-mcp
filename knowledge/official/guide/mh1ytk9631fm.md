# 概念介绍/功能/通用组件/操控运动器

(来源：原神千星奇域·综合指南，页面 ID mh1ytk9631fm)

# 一、操控运动器的功能

在元件/实体上挂载操控运动器组件，可以实现在运行时通过轮盘输入操控元件/实体移动、施放技能等功能

操控运动器和其他类型的运动器互斥

推荐操控实体的缩放为等比缩放(如1:1:1)，若缩放不等比可能导致实体在斜坡运动时出现形变

创作复杂操控实体时，推荐通过主物件使用等比空模型、装饰物修改缩放的形式进行制作

# 二、操控运动器组件的编辑

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/eedf84e1-515d-45a9-8a14-197ae7ffa880.png)

(1) 在实体/元件编辑界面中，打开组件编辑页签

(2) 点击下方的“添加通用组件”，选择并点击“操控运动器”，成功添加

(3) 点击“详细编辑”，展开编辑页

# 三、参数配置

## 1.基础设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/2f9f197a-0c31-4a44-afc6-4fc927f68753.png)

### (1)实体接地位置

 _实体接地位置_ 定义了运行时，操控实体与地面接触的位置

 _偏移：_ 基于操控实体底部位置的偏移值

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/27e8032d-7a0b-4b5f-b6e3-82e82c28b299.png)

### (2)角色退出点

 _角色退出点_ 定义了操控者离开操控实体时，操控者的弹出位置

 _角色退出点：_ 操控实体的挂接点

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/19cd53db-085b-48f1-a75f-f7b654f269ac.png)

### (3)操控实体碰撞

 _操控实体碰撞_ 定义了操控实体的碰撞盒大小

挂载操控运动器组件的元件或实体，在运行时的碰撞以操控实体碰撞为准，原生的碰撞和额外碰撞都将不生效

注意：运行时若操控实体碰撞低于实体接地位置，将因碰撞和地面挤压使得运行表现异常

推荐碰撞区形状使用胶囊体或球体，位置设置在实体模型的上半部分，可有效避免部分碰撞异常表现

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/d77ef6ee-7ea4-4c14-a8ac-3d54a165f290.png)

点击“详细编辑”展开编辑页![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/6e30197f-7a40-4d3e-a602-a407850e470f.png)

#### a.默认实体碰撞

 _默认实体碰撞_ 定义了操控实体的默认碰撞，以及运行时的其他碰撞检测标准

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/107b4891-d152-4370-9f34-faa8af507f0d.png)

配置参数| 说明  
---|---  
 _触发区形状_|  仅支持胶囊体基础形状  
 _中心_|  相对接地位置的偏移  
 _半径_|  胶囊体的半径运行时将以半径为基准，根据平均地面法向计算倾斜角度半径会参与物理碰撞相关的检测  
 _高度_|  胶囊体的高度运行时将以高度为基准，检测可以跨越的障碍、判断浮空状态等物理相关的性能  
  
#### b.操控实体碰撞区域

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/97cce79d-26ae-402e-b837-3a4b7f895ff2.png)

通过“添加碰撞区”，可增加基础形状

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/c42be084-94ce-40c6-be4e-3cffea1afcc8.png)

配置参数| 说明  
---|---  
 _触发区形状_|  支持配置长方体、球体、胶囊体三种基础形状![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/9fcfa009-4e7a-4304-89d0-8de036a48df0.png)  
 _中心_|  相对实体或元件中心的偏移  
 _旋转_|  以中心位置为基准，在不同轴向上支持调整朝向  
 _缩放_|  长方体：碰撞配置形状在不同轴向上支持自定义缩放球体：碰撞配置形状支持通过半径配置统一缩放胶囊体：碰撞配置形状支持通过半径和高度配置自定义缩放  
  
### (4)装饰物运动表现

 _装饰物运动表现_ 定义了运行时，操控实体的哪些装饰物部件可以有运动动画表现

使用流程参考：



编辑模型装饰物时，确认哪些装饰物需要有运动表现（例：编辑车辆时，确定四个轮胎需要有运动效果）



添加自定义挂接点，将装饰物挂接至对应的挂接点（例：将轮胎整体的装饰物散件挂接在同一挂接点下）



新增装饰物运动表现，引用对应的挂接点并编辑运动表现设置（例：引用挂接轮胎的挂接点，编辑运动表现设置）

装饰物运动的原理：对引用的挂接点进行旋转，使得挂接点下的所有装饰物呈现出对应的运动表现

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/4b40eb1b-324b-4a68-894c-cc563953c780.png)

点击“详细编辑”展开编辑页

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/754f6fc5-85e0-45ed-9884-56cac8ab4915.png)

#### a.新增装饰物运动

通过点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/e8a959fd-5d81-4ffd-8f82-fba3cf0b1d86.png)，添加新“装饰物运动”。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/ab6b39b5-d983-4a57-8e29-9f4acef98b04.png)

#### b.运动表现设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/1901a3b9-9511-4913-a320-36678ee1bbd1.png)

配置参数| 说明  
---|---  
 _运动类型_|  当前仅支持配置轮胎运动表现 _轮胎运动表现：_ 支持模拟车辆运行和转弯时时，轮胎的滚动和左右偏转效果![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/9daa1d49-f455-4efd-a789-3e2b680e5fe5.png)  
 _跟随前后输入旋转_|  功能开启时：将根据当前操控运动器的移动速度，使处于此运动表现下的装饰物朝操控实体正朝向/正朝向反方向持续旋转功能关闭时：无前/后旋转的运动表现  
 _旋转速度计算规则_|  _默认：_ 自动根据装饰物挂接点到接地点的距离，计算旋转速度 _自定义：_ 可以配置最大旋转速度，自动计算的旋转速度不会超过此最大值![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/b7413d1b-9418-460d-861c-482ebdac1ee9.png)  
 _最大旋转速度_|  装饰物最大的前后旋转速度  
 _旋转轴预览_|  功能开启时：可以预览前后输入的旋转方向（x轴旋转）  
 _跟随左右输入旋转_|  功能开启时：根据当前操作者的左/右输入，使装饰物朝自身正朝向左侧/右侧偏转功能关闭时：无左/右偏转的运动表现  
 _旋转轴预览_|  功能开启时：可以预览左右输入的旋转方向（y轴旋转）  
  
#### c.关联装饰物

 _关联装饰物_ 决定了哪个自定义挂接点下装饰物，会在运行中有对应的装饰物运动表现

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/2d60e3b2-3af6-40b7-a995-d7d7da4a601c.png)

配置参数| 说明  
---|---  
 _装饰物挂接点_|  支持配置所有自定义挂接点挂在选中自定义挂接点下的所有装饰物，将在运行时应用对应的装饰物运动表现![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/799747e2-5949-487d-971f-fdec6efbecb5.png)  
 _已挂接装饰物_|  预览挂在装饰物挂接点下的所有装饰物  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/75c32e4f-6407-4614-87cc-2456818f453e.png)

点击“前往装饰物编辑”，跳转至元件/实体的装饰物管理界面

## 2.运动设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/07ead107-229a-458f-b726-f019884b7fac.png)

### (1)操控输入设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/32cab56a-a92d-4c05-a3c8-8d21ceaf1030.png)

配置参数| 说明  
---|---  
 _方向输入类型_|  _镜头朝向：_ 操控实体始终朝向镜头朝向进行移动 _操控实体朝向：_ 操控实体以自身模型正朝向进行移动![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/e2df91d3-81d2-4ee8-8e64-aa8911907beb.png)  
 _输入前进区范围_|  当轮盘输入落在此区域内时，操控实体向前移动，反之则向后移动输入轮盘正前方为0°，输入角度将以0度为中心拆分为左右对称的区域电脑端的输入将换算为轮盘输入，例：W为正方向0°  
  
### (2)运动区域设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/e301cb39-c15f-4c0e-be7d-7ab9ef9c5e9a.png)

配置参数| 说明  
---|---  
 _运动坡度上限_|  决定了操控实体能够爬上倾斜角度多少的斜坡表面  
 _跟随斜坡倾斜_|  决定了操控实体在倾斜表面上运动时，自身是否有与之相符的倾斜表现  
  
### (3)运动设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mh1ytk9631fm/333a737f-175d-4268-b6e7-549a510ea8c8.png)

配置参数| 说明  
---|---  
 _转向速度_|  实体按Y轴旋转的速度  
 _前进加速度_|  输入落在前进区时，提供给实体的向前加速度  
 _最大前进速度_|  实体的最大前进速度限制达到最大前进速度后，前进区的输入不会再为实体提供加速度  
 _区分前进后退速度_|  功能关闭时：前进速度与后退速度相同功能开启时：可以单独配置后退速度的相关参数  
 _后退加速度_|  输入落在后退区时，提供给实体的向后加速度  
 _最大后退速度_|  实体的最大后退速度限制达到最大后退速度后，后退区的输入不会再为实体提供加速度  
 _阻力减速度_|  实体运动时受到的基础阻力阻力减速度会影响实际运行时的速度，以及停止输入后操控实体多久会减速至静止  
 _跟随移动速度变化_|  功能开启时：实体运动越快，受到的阻力越大  
 _减速系数_|  减速系数越大，实体运动时受到的阻力越大公式=基础阻力减速度 + 减速系数*速度平方  
 _最大速度预览_|  综合实体运动加速度、阻力、阻力，计算出的实体最终能达到的最大速度注意：实际运行时若阻力系数配置过大，可能出现最大速度不为0但无法移动的情况  
  
# 四、角色操控技能相关

角色处于操控状态下时，无法使用普通角色技能，仅可使用角色操控技能

技能编辑方式类似于角色技能，详见[角色操控技能](/ys/ugc/tutorial//detail/mhj4a0rzu4pi)
