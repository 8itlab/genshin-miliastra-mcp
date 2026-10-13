# 概念介绍/资产/界面控件/自定义按钮控件

(来源：原神千星奇域·综合指南，页面 ID mhtpwgitsigc)

# 一、自定义按钮的功能

 _自定义按钮_ 是一种特殊的交互按钮，可以配置其图标和显示的文本

交互按钮适配的逻辑在自定义按钮中同样适用

# **二、自定义** 按钮**的编辑**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhtpwgitsigc/6ebfba76-eda5-4d41-b84b-20fa4257b3dd.png)

## **1.添加自定义按钮**

在 _界面控件组编辑窗口_ ，添加界面控件模板-自定义按钮

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhtpwgitsigc/d767d432-c808-4ea7-b0ff-94ab8644498a.png)

## 2.自定义按钮设置

### (1)基础

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhtpwgitsigc/53fe90a7-bc6c-4e76-b509-efc208e0edbc.png)

### (2)样式

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhtpwgitsigc/76854dc9-34c2-4996-9a26-46b2caaf9372.png)

 _样式_ ：支持选择 _预设样式、自定义_



**预设样式**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhtpwgitsigc/52726f6e-480e-41c9-9b53-2784c42170dd.png)

可以选择不同的预设按钮样式，部分预设样式支持自定义图标、颜色、和文本等

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhtpwgitsigc/6915b008-ca3d-4e45-9f98-c4d2b2c81a46.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhtpwgitsigc/80fea631-63f0-480c-a197-542f6bd26ed5.png)



**自定义样式**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhtpwgitsigc/d18f28e6-b509-4a2e-b436-a7fc5f0a74d8.png)

可以自由配置默认状态、悬停状态、按下状态的素材

当且仅当在功能-按键类型，选择了技能时，才可以配置不可用状态的素材

状态| 说明| 样式特征| 示意图  
---|---|---|---  
默认| 无交互状态| /| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhtpwgitsigc/b7810981-8ea2-4b7c-936b-73f99df73806.png)  
悬停| 在键鼠操作时，指针悬停在按钮上的状态| 悬停状态通常用外描边，颜色略微高亮，尺寸略微增大来示意按钮的可交互性| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhtpwgitsigc/651fe58a-7dc3-494d-abc2-cd739e045c97.png)  
按下| 在键鼠或触屏操作，按下时的状态| 按下状态通常用颜色变化，尺寸略微减小来示意按钮处于交互状态，松开后，按钮将返回默认状态| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhtpwgitsigc/0c73f560-5bb9-4c09-a04e-c54f11a69e33.png)  
  
### (3)功能



**按键设置**

当样式选择为预设样式时，按键类型会锁定为交互事件不可修改

当样式选择为自定义时，按键类型会在技能、交互事件、道具中三选一

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhtpwgitsigc/161ce2f8-2e31-48f4-842c-763520477f02.png)

配置参数| 说明  
---|---  
 _按键类型_|  支持以下三种配置技能:会可配置对应技能槽位交互事件:会可配置冷却时间道具:会可配置对应道具的配置ID  
 _按键映射-键鼠_|  配置按钮对应的PC端快捷使用按钮  
 _按键提示偏移-键鼠_|  当鼠标悬停按钮时，提示信息偏移显示配置  
 _按键映射-手柄_|  配置按钮对应的手柄快捷使用按钮  
 _按键提示偏移-手柄_|  当手柄悬停按钮时，提示信息偏移显示配置  
 _音效_|  当按钮触发时播放该配置音效  
  


**响应点击区域**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhtpwgitsigc/ef82414a-12d2-4f92-bdbf-ea630b5bdf81.png)

当且仅当配置样式为自定义时，支持配置点击区域

支持在编辑窗口中直接拖动，调整点击区域

实际触发以此点击区域配置的大小为准

配置参数| 说明  
---|---  
 _是否可点击_|  若不开启，则本按钮无点击交互功能  
 _点击区域预览_|  开启后，编辑窗口对应控件中浅黄色区域则为点击区域![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhtpwgitsigc/e7deaaad-b620-426f-9442-74cb8ffaa121.png)  
 _区域大小_|  支持配置跟随按钮尺寸/自定义尺寸  
 _位置偏移_|  当**区域大小** 选择自定义尺寸时，支持配置点击区域的中心位置偏移  
 _尺寸_|  当**区域大小** 选择自定义尺寸时，支持配置点击区域的尺寸  
  
### (4)推荐配置

可以根据按钮的功能优先级，划分不同的按钮尺寸，以下是推荐值

按钮重要性(数字越小越重要)| 说明| 建议大小| 示意图  
---|---|---|---  
1级| 界面核心操作按钮，如强化装备，强化角色等等| 宽度按需，高度范围推荐值：48~52| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhtpwgitsigc/0cc2bf94-dfcd-42ff-bcc4-441fbd8ec05d.png)  
2级| 界面中的次要操作按钮，如查看详情| 宽度按需，高度范围推荐值：32~40| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhtpwgitsigc/069d5806-0435-4a80-a228-c10be5e74fcd.png)  
3级| 界面中的提示性按钮，如【？】| 宽度，高度推荐值：32x32| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhtpwgitsigc/84b0f4bb-20ad-4f34-9e9e-75b92fd04eeb.png)  
  
# **三、额外说明**

自定义按钮无法同时响应多个同按键映射，默认规则为根据按钮的创建时序，会优先响应最近创建的按钮。如果在关卡运行中，使用节点图相关的逻辑动态增删了自定义按钮，则该行为也会改变响应的优先级
