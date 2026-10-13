# 玩法功能进阶实例/3.16货币与商店——制作可以买卖道具的商店

(来源：原神千星奇域·教程，页面 ID mh53tyir62xo)

# 前言

## 课程说明：

**课程内容：** 货币和商店制作与使用案例。

**学习目标：** 学会如何配置货币和商店，让玩家可以唤出商店进行道具交易。

 _**该课程中涉及【局内编辑器面板配置】和【千星沙箱节点图】两个模块内容，并且相互关联，阅读时建议按照课程顺序完整阅读。_

##  相关信息：

**推荐学习顺序：** 【前置课程】→【当前课程】→【综合指南】

 _**如课程中遇到概念不清等问题或想要了解更多相关信息，根据需要查询_** __【综合指南】__** _即可_

 __

**前置课程：** 该课程与以下前置课程所讲述的功能知识点相关 _（建议首次使用时，优先学习_** __【前置课程】__** _，学习体验更流畅）_

> [3.14掉落物、道具、背包——制作一个可掉落且能使用的道具](/ys/ugc/tutorial/course/detail/mh1t3z9s7hne)

关联知识点：课程中将涉及以下基础概念 _（建议优先根据该课程学习即可，如遇到概念不清等问题或想要了解更多相关信息，再根据需要查阅_** __【综合指南】__** _相关章节）_

> [货币](/ys/ugc/tutorial//detail/mh2cr30yeak0)
> 
> [商店](/ys/ugc/tutorial//detail/mhi9s7isvp50)
> 
> [商店组件](/ys/ugc/tutorial//detail/mho6gviqhsqs)

* * *

# 货币与商店——制作可以买卖道具的商店

## 功能示例-1：使用商店组件制作可以买卖道具的商店

### 1.概念简述

**货币：** 自定义的特殊资源，可用于商店交易过程中的道具购买/出售

**商店：** 预封装的商店模版，配置后可进行交互，用于道具类物品的购买/出售

### 2.教学内容

**功能效果：** 制作一个可以买卖道具的商店

**效果演示：**

 _**演示中的文本显示，需达到特定奇匠等级后解锁【自定义文本外显】功能，教程中以效果展示为主_

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/8b55b374-9a99-456c-b78f-051c32373f31.gif)

###  3.操作步骤

**1.【局内编辑器】配置货币**

首先，我们先配置游戏中使用的货币：在ESC面板，点击【货币与背包】>>>进入货币与背包配置页，点击【添加货币】>>>在详情页中，可以对新添加货币的基础属性进行编辑。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/dd8a9039-b6d4-4057-97ef-c0bb84c9667b.png)

为达到预期的功能效果，教程中配置如下：

要做的功能| 对应的配置项  
---|---  
货币名称为摩拉| 点击名称右侧的![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/3743d051-6290-4f90-b0d2-9f0b3da71352.png)进行重命名——输入“摩拉“  
货币图标为摩拉| 【图标】——选择“摩拉“图片  
死亡后不会掉落/损失已有的货币| 【归属者销毁时道具处理】——“保留”  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/25902e18-756f-4631-814d-9375400beb6c.png)

**2.【局内编辑器】配置道具及对应价值**

①创建可供交易的道具

在战斗预设面板中，点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/13583b40-26d3-4555-acf9-a3b4a02fb49f.png)>>>进入道具配置页，点击【新建道具】>>>在弹窗中选择对应的道具图标>>>设置道具的基本信息，如名称、类型、品质等（教学中将道具命名为苹果，设置为普通道具，品质为绿色）>>>点击保存确认创建。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/44b1bf9c-3f8d-4abc-afac-d3ae3a22fbee.png)

**②配置道具的价值，使其可用于交易**

创建好道具后，可以在基础设置中，对道具的价值进行设置，为达到预期的功能效果，教程中配置如下：

要做的功能| 对应的配置项  
---|---  
道具具有货币价值| 是否有货币价值——选择“开启”  
在道具详情中显示其货币价值| 显示货币价值——选择“开启”  
苹果道具价值为5摩拉| 【添加货币价值】——勾选我们配置好的货币“摩拉”——将【货币价值】改为“x5”  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/b5a39170-756e-4b1f-82de-425ccbbbf6f5.png)

点击保存后，道具及对应价值就设置好了。

**3.【局内编辑器】配置商店模板**

接下来制作一个商店模板；在Esc菜单中，点击【商店模板管理】>>>进入货币与商店模板管理页，点击【新建商店模板】>>>对新建的商城模板进行编辑（教程中将其命名为“商店模板01”）。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/836c090e-c5f1-45e5-b21f-8fa8a9decfbe.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/f6de76e6-b76e-4da4-97fe-5a6cde0dfa64.png)

商店模板创建完成之后，需要对商店的买卖功能进行设置。为达到预期的功能效果，教程中配置如下：

要做的功能| 对应的配置项  
---|---  
开启商店时同时将玩家背包打开| 【开启商店时同时打开背包】——选择“开启”  
商品根据默认类型页签分类| 【商品页签类型】——选择“默认页签”  
商店只出售苹果，存量1个| 在【出售设置】中进行如下设置【商品来源】——选择“自定义列表”【售价设置】——选择“编辑”——在弹出的出售价格表中点击【添加商品】——找到材料页签下的“苹果”——将数量改为“1”——在售价中将售价调整为“10”——点击“添加商品”  
商店也回收苹果，但回收价为5摩拉| 在【收购设置】中进行如下设置【收购范围】——选择“全部道具”【收购价格设置】——选择“编辑”——在弹出的收购价格表中——将苹果的【收购价】改为“5”  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/9f940bfd-c637-4a8d-b049-18294713f6e0.gif)

**4.【局内编辑器】配置背包**

①添加背包组件

商店买卖的道具，角色需要用背包来进行存储，否则无法进行交易，因此需要在角色上配置背包组件。点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/420e933d-0dff-42ec-8164-1de33562073f.png)进入战斗预设界面>>>点击【角色编辑】面板中的![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/137d22c8-9fb5-4aee-830c-c22bec031d79.png)>>>进入组件页，点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/d4de3020-c432-4cd9-8c63-e62133ce0d59.png)>>>选择【背包组件】即可添加。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/20bbaba8-901c-4933-b85f-1e9d3aa7c0c0.png)

②配置背包模板

背包还需要配置对应的【背包模板】，点击背包组件的详细编辑>>>点击背包模板中的“请选择模板”>>>点击“打开背包模板编辑”>>>点击“添加模板”即可完成模板添加。教程中由于没有特殊需求，故使用默认配置，制作中可以根据自身需要随意调整背包模板的参数。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/c3c89ffc-d46c-4f9c-9eca-aebfcb855007.gif)

**5.【局内编辑器】创建元件，挂载商店组件并进行配置**

接下来需要元件来充当商店，让玩家进入元件碰撞盒范围后，弹出商店界面。创建一个元件作为商店（教程以摊位铺为例），在面板中点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/b1839afa-d4a4-40d1-bc8f-2e0d42f16fa3.png)>>>进入组件页，点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/a49a213d-b2d8-4e58-81fa-cbc29133d657.png)>>>选择【商店组件】即可添加。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/9748b1d7-1717-4c33-80bb-178ebfc0328b.png)

在商店组件中点击“详细编辑”>>>进入详情页，在【商店模板】中选择我们刚刚做好的“商店模板01”

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/0638e39f-9821-4eea-b514-69fdc29339b9.png)

**6.【千星沙箱】进入碰撞触发盒后打开商店页面**

此外，还需要一个事件来唤起做好的商店页面，实际制作中可以根据自身需要选择事件。为方便理解，本教程通过碰撞触发盒事件来唤起商店。制作好的逻辑挂载在“摊位铺”元件上。

|  | 要做的功能| 对应的配置项  
---|---|---|---  
功能进入碰撞触发区唤出商店| 触发场景| 进入触发区| 【事件节点】：进入碰撞触发器  
条件| /| /  
结果| 打开商店| 【查询节点】：确定打开商店的玩家实体是进入碰撞触发器的玩家。注：由于触发器组件和上商店组件都挂在同一个元件“摊位铺”上，仅此触发器实体=商店实体【执行节点】：打开商店。  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/0ecfe40a-0429-4637-ab30-8e4f8d72bb6d.png)

**7.【局内编辑器】配置掉落物**

最后，可以制作一个“苹果”道具的对应掉落物，让玩家拾取掉落物之后，可以将获取到的道具出售给商店获得货币，也可以再使用货币在商店里购买新的道具。具体的配置方式可以参考往期课程【掉落物、道具和背包】，这里仅根据教学需求做简单流程演示：

创建一个预设掉落物作为掉落道具（教程以果实堆为例），在元件库面板中点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/a44d8a83-6e03-43da-b53a-ac332a117718.png)>>>进入掉落物页，点击预设中的【挑战币掉落物】>>>点击【模型】>>>选择【果实堆】即切换掉落物模型>>>点击【保存】即可添加一个新的掉落物。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/9c259acc-9c02-4b19-8319-83d3d26e94ae.png)

掉落物会默认携带【掉落物组件】，在面板中点击![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/0f7d2d04-a30d-418f-8209-ed6226ebae95.png)>>>进入组件页便可以看到【掉落物组件】，为达到预期的功能效果，教程中配置如下：

要做的功能| 对应的配置项  
---|---  
掉落物通过交互项来拾取| 【拾取规则】——选择“交互拾取“  
掉落物掉落时有落地动画| 【开启掉落动画】——选择“开启“  
掉落物直接会出现在关卡中，代表5个“苹果”道具| 【掉落内容】——“添加物品”——选择“苹果”——数量选择“5”  
  
![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/02741ea3-3e55-4415-b042-a61dbe8ca7c1.png)

**8.【局内编辑器】试玩体验**

此时进入试玩，即可拾取并在商店内买卖道具。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/8b55b374-9a99-456c-b78f-051c32373f31.gif)

 _**更多相关信息可自行查阅【综合指南-资源系统-商店】【综合指南-资源系统-货币】【综合指南-商店组件】_

* * *

#  课程总结及辅助课件

**课程作业：** 可根据课程教学内容尝试进行以下功能复刻

> 功能复刻：制作可以买卖道具和装备的商店

**课程回顾：** 学会如何通过基础设置制作商店和货币。

### 辅助课件

我们提供了上述课程内容相关的工程文件，可结合【教学存档-货币与商店】对照学习

![](https://webstatic.mihoyo.com/upload/static-resource/2022/10/14/64e71b8a5e28fbdbc3d3df5d311e4154_847866555738962172.svg)

货币与商店.gil

20.1 KB

[](https://act-webstatic.mihoyo.com/ugc-tutorial/course/cn/zh-cn/mh53tyir62xo/81e88bff-00bd-421e-baaa-330b174b46b0.gil)
