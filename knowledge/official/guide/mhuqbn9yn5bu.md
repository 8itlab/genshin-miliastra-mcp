# 概念介绍/功能/基础信息/变换、原生碰撞、可见性和创建设置

(来源：原神千星奇域·综合指南，页面 ID mhuqbn9yn5bu)

# 一、变换

## 1.变换的含义

描述单位在场景中的几何信息，一般包含位置、旋转与缩放

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuqbn9yn5bu/2eb9c8bc-6cf8-4176-b2ef-24e6ecdc8d3b.png)

 _位置_ ：在世界坐标系下的位置

 _旋转_ ：在世界坐标系下的旋转

 _缩放_ ：物件被放大的倍率

 _*锁定变换_ ：编辑时属性，如果该属性为“开启”则无法修改实体的变换信息

## 2.节点图相关

可通过节点图查询获取位置信息

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuqbn9yn5bu/9ae4eef0-fa52-4007-9e3b-b8629697b12b.png)

# 二、原生碰撞

## 1.原生碰撞的含义

 _原生碰撞_ 指物件的基础碰撞，相比于 _额外碰撞组件_ 所添加的碰撞，更加精细贴合模型。

相对的，原生碰撞作为 _基础信息_ ，其形状无法被修改，玩家仅能控制碰撞的 _初始生效_ 和 _是否可攀爬_ 开关。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuqbn9yn5bu/6db1225b-01ca-4909-a700-ca38531917e3.png)

 _初始生效_ ：单位被初始化时，原生碰撞是否生效

 _是否可攀爬_ ：原生碰撞是否可以被角色攀爬，同时要求角色本身必须具有攀爬能力

 _*原生碰撞预览_ ：编辑时的功能，如果勾选即可在编辑界面预览到碰撞的外形，见上图

 _可被镜头忽略碰撞：_ 为“否”时，镜头可能会被当前物件实体的碰撞所推挤，产生卡顿或镜头突变等问题。为“是”时，镜头将会忽略与此物件实体产生的碰撞，但与之相对的，镜头位置可能会移动到模型的内部，导致表现不佳，因此需要创作者(奇匠)根据实际的玩法场景进行定制

## 2.节点图相关

修改碰撞开关

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuqbn9yn5bu/1f7327c5-03c0-44ba-ab6e-442a86973ab4.png)

修改碰撞可攀爬性

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuqbn9yn5bu/65e3aecc-8775-4ced-b635-d85f3867fe9a.png)

# 三、可见性

## 1.可见性的含义

该 _基础信息_ 描述了运行时 _实体_ 的 _模型_ 是否对玩家可见。仅影响模型，不影响 _碰撞_ ， _触发器_ ， _节点图_ 等其他逻辑

推荐制作一些隐藏实体相关的功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuqbn9yn5bu/48d1893f-f9e1-4073-b555-371259a65e74.png)

## 2.节点图相关

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuqbn9yn5bu/f04db402-900b-4e68-902e-16d5ac83cd69.png)

# 四、创建设置

## 1.创建设置的含义

指当 _实体_ 被布设在场上后，关卡初始化时，是否创建。如果该开关为“关闭”，则需要后续通过节点图动态创建。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuqbn9yn5bu/aef22f09-0993-47bf-882d-8b0bb052b34e.png)

## 2.节点图相关

当实体被销毁或移除后，也可以使用该节点再次创建

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhuqbn9yn5bu/7cb07b30-aa0a-4e07-83ea-21364b1ae992.png)
