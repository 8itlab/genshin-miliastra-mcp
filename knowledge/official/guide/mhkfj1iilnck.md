# 概念介绍/高级概念/资源系统/掉落物

(来源：原神千星奇域·综合指南，页面 ID mhkfj1iilnck)

# 一、掉落物的定义

在所有虚拟 _物品_ （包括道具、装备、货币、背包）掉落在场景中时，会转为一个元件实体，这个实体就是 _掉落物_ 。

在进行上述虚拟物品的模板编辑时，都需要关联一个掉落物元件，如果没有关联，则掉落逻辑会被屏蔽

掉落物是一种特殊的元件，相比普通的动态单位元件，其会额外携带一个 _掉落物内容组件_ ，除此之外，部分动态单位元件可用的组件掉落物不可用

# 二、掉落物内容组件的功能

所有掉落物类型的元件会固定携带一个掉落物内容组件，不可被移除

掉落物内容组件定义了掉落物的掉落表现和拾取规则

掉落物内容组件可支持同时配置多个拾取范围，他们的生效范围会进行叠加。

# 三、掉落物内容组件的编辑

## 1.掉落物内容组件的位置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkfj1iilnck/eabfce6f-2128-45b7-b4af-d93b3da20232.png)

进入元件库编辑，可以看到对应的掉落物页签

点击“详细编辑”，展开编辑页

## 2.掉落物设置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkfj1iilnck/80603cc0-65ab-4a8c-b3c6-7e0988d7e209.png)

当掉落物因为掉落逻辑被创建在场景上时，掉落的表现和掉落物的拾取规则

 _拾取规则_ ：游戏运行时，玩家需要以什么方式拾取该掉落物

 _交互拾取_ ：角色靠近掉落物至拾取范围内时，会显示交互按钮，触发按键交互即可直接拾取该道具

 _自动拾取_ ：角色靠近掉落物至拾取范围内时，会自动触发拾取

 _打开拾取界面_ ：角色靠近掉落物至拾取范围内时，会显示交互按钮，触发交互按键会打开道具拾取界面，玩家需要在界面内选中对应道具进行拾取，推荐用于掉落物列表内包含多个物品时使用

 _自动吸附拾取_ ：需要额外配置“自动吸附距离”，角色进入吸附距离时，掉落物会朝角色移动，并在进入拾取范围时，自动触发拾取

 _自动吸附距离(m)_ ：“自动吸附拾取”触发掉落物移动的距离

 _本地过滤器_ 分为布尔过滤器和整数过滤器两种。具体可见[节点图](/ys/ugc/tutorial//detail/mhjwjrr5n73i)

 _过滤器节点图_ 可引用上述选择类型的过滤器节点图，用于判断是否达成条件

 _掉落内容_ ：支持在组件内配置一个掉落物所包含虚拟物品的字典，当掉落物被直接布设在场景内，通过元件实体创生时，掉落物将包含组件内所配置的所有虚拟物品。而当掉落物通过战利品形式创建时，则只包含实际掉落的虚拟物品，组件内的默认数据会被覆盖

## 3.拾取范围

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkfj1iilnck/4f8650e2-1797-491e-8caf-133df09f0341.png)

 _拾取范围_ ：定义玩家可拾取掉落物的范围，使用通用的形状定义结构，支持长方体，球体，胶囊体三种基本形状

# 四、掉落物拾取实例

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkfj1iilnck/33d8f528-78e0-4f5d-93c2-81663a80f316.png)

# 五、节点图操作掉落物组件

## 1.掉落物组件相关执行节点



增加掉落物组件道具数量

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkfj1iilnck/605b87c4-b0ac-475d-b8ea-201add673bc9.png)



增加掉落物组件货币数量

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkfj1iilnck/61231f72-5cd0-4ec3-8223-02e1b30345c4.png)

## 2.掉落物组件相关查询节点



获取掉落物组件道具数量

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkfj1iilnck/7bae7443-e6a9-47d7-b413-23dcb38f2071.png)



获取掉落物组件装备列表

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkfj1iilnck/8fd99be3-1b15-487c-a113-0c681503f340.png)



获取掉落物组件货币数量

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhkfj1iilnck/c0c0f245-7ebe-44c4-8024-8bbc648389f4.png)
