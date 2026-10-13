# 概念介绍/功能/特化配置/基础战斗属性

(来源：原神千星奇域·综合指南，页面 ID mhvyqz9xwu0q)

描述了攻击力/防御力/生命值等战斗校验所需要的 _属性_ ，不同类型的实体该属性的定义也会有所区别

# 一、物件基础战斗属性

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhvyqz9xwu0q/40952836-e449-4a99-b0cb-811865ffec07.png)

 _等级_ ： _元件_ /_实体_ 上配置的物件默认等级，在使用节点图创建物件时，也可以重新指定等级

 _基础生命值_ ：物件的生命值，当受到攻击导致生命值为0时，实体会被击倒，并触发销毁和移除对应事件

 _基础攻击力_ ：物件的基础攻击力

 _基础防御力_ ：物件的基础防御力

# 二、造物基础战斗属性

与物件的区别在于，从等级属性和固定属性两方面，支持创作者(奇匠)对造物进行参数的调整、成长曲线的规划

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhvyqz9xwu0q/2875478f-bfc3-471f-a43b-17ae1c00f690.png)

## 1.等级属性

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhvyqz9xwu0q/31e153b3-624b-4366-a72f-56d639eaf2a0.png)

配置参数| 说明  
---|---  
 _等级_|  造物创建时的等级  
 _基础生命值_|  造物的基础生命值，实际生命值是根据 _属性成长_ 提供的倍率做乘法计算后的结果  
 _基础攻击力_|  造物的基础攻击力，实际攻击力是根据属性成长提供的倍率做乘法计算后的结果  
 _基础防御力_|  造物的基础防御力，实际防御力是根据属性成长提供的倍率做乘法计算后的结果  
 _属性成长_|  以等级为基础的数值曲线，是为生命值和攻击力提供倍率的属性曲线提供 _无成长_ 、 _预制成长曲线_ 、 _自定义成长曲线_ 三种模板![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhvyqz9xwu0q/db0dd60a-19fa-4e56-90b4-1763a5563883.png)  
  
### (1)属性成长配置

属性成长曲线枚举说明

无成长——倍率参数皆为1，基础属性不会随着等级的变化而变化

预制成长曲线——该曲线为预制数值曲线，可以在查看曲线界面查看具体的 _成长倍率_ ，但不可修改

自定义成长曲线——使用创作者(奇匠)自己定制的成长曲线，可以点击编辑曲线进行手动修改，也支持曲线属性的导入/导出 

属性成长曲线计算说明 



以生命值计算为例。等级配置1，基础生命值改为200，选择预制成长曲线。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhvyqz9xwu0q/917edfd6-663a-4aee-a6eb-b442a3762f55.png)



选择“查看曲线”，得知等级为1时， _生命值倍率_ 等于5.3938，则该造物运行时实际生命值应该为200*5.3938=1078.76

右上角选择 _*预览结果数值_ ，可看到实际生命值为1078.76，符合计算结果

其余参数计算同理。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhvyqz9xwu0q/748599c4-6286-45eb-9eef-3a21a8989710.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhvyqz9xwu0q/0908b081-f466-4030-b397-d0059df93d2f.png)

### (2)属性成长规则

 _实际生命值_ =当前等级对应行的生命值倍率*基础生命值

 _实际攻击力_ =当前等级对应行的攻击力倍率*基础攻击力

其中基础生命值与基础攻击力为创作者(奇匠)在基础战斗属性中所配置的值

实际生命值与实际攻击力为游戏运行中实际生效的值，可能由于装备、单位状态等其他功能而产生变动

## 2.固定属性

以下固定属性参数，支持进行覆写，会在关卡运行时，对该造物生效

每种参数的可配置范围不同，下面用表格进行说明

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhvyqz9xwu0q/d784accf-7904-4b82-a6f3-d79798c04596.png)

配置参数| 支持配置下限| 支持配置上限  
---|---|---  
 _元素精通_|  0| 3000  
 _各种抗性_|  0| 3  
  
# 三、节点图

可以使用节点图来查询造物或者物件的基础战斗属性

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhvyqz9xwu0q/89b5167c-9c9f-4f64-9d59-7ac6a3edd186.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhvyqz9xwu0q/3e7a8fa4-3848-4a86-8f98-c97f36047f08.png)

#
