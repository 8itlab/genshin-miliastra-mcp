# 概念介绍/功能/通用组件/商店组件

(来源：原神千星奇域·综合指南，页面 ID mho6gviqhsqs)

# 一、商店组件的功能

[商店](/ys/ugc/tutorial//detail/mhi9s7isvp50)内的模板配置由商店组件进行引用，并在运行时实例化

商店组件支持同时配置多个商店

# 二、商店组件的编辑

## 1.添加组件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/3e95e17c-92f7-4ea8-b4f6-5b586c3e2ed6.png)

(1)在实体或元件编辑界面中，打开组件编辑页签

(2)点击下方的“添加通用组件”，选择并点击“商店”，成功添加

(3)点击“详细编辑”，展开编辑页

## 2.基础概念

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/e705d7bb-f5e9-4f0e-9dff-19b369773d87.png)

 _商店序号_ ：一个商店组件可以同时定义多个商店，商店之间的配置数据相互独立

 _商店名称_ ：商店的命名

 _商店模板_ ：引用一个全局定义的商店模板

 _*预览商店样式_ ：点击可以预览当前配置在运行时实际展示的商店样式

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/4c7b5024-d871-4290-9318-e368a24ace90.png)

 _添加商店_ ：可以添加一个新的商店

# 三、商店的运行时实例

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/70c50814-452d-4b40-8d39-9f37bfa5e68f.png)

# 四、节点图相关操作

## 1.商店相关执行节点



从背包商店出售表中移除商品

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/cd913f6f-f053-4228-9278-ddfe32da4d2a.png)



从物品收购表中移除物品

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/0595831e-a037-4034-a79a-62f26d5e91f8.png)



从自定义商店出售表中移除商品

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/28a4dc74-5f3d-4a97-a9b7-d802c436dbaa.png)



打开商店

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/fedf4b76-e811-4446-a71e-ea40b8b0f48a.png)



关闭商店

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/e382a465-4c53-42a5-8312-3d0e441c6bb6.png)



向背包商店出售表中新增商品

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/b45d5fb4-ff3a-4c92-941a-17056064cec4.png)



向物品收购表中新增物品

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/b4079b39-1838-4577-81ec-890eee606407.png)



向自定义商店出售表中新增商品

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/9523a787-b6bb-4187-9f4e-b2748ccb7089.png)



修改背包商店商品出售信息

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/9f5f805b-2895-44ed-bfec-7774c8897ec1.png)



修改物品收购表中道具收购信息

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/2fbe2e4a-a7e8-4351-89fb-a583d46d6451.png)



修改自定义商店商品出售信息

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/d144c54c-1fbd-4c89-9a51-7b805badfc3a.png)

## 2.商店相关事件节点



商店出售背包物品时

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/665bd039-5caf-45a1-90e4-4fe864970aad.png)



商店出售自定义商品时

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/cdc74c49-a169-4ac9-909c-94203f67da93.png)



商店收购道具时

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/102db1d3-f49a-4702-9604-4fe9288528f6.png)

## 3.商店相关查询节点



查询背包商店商品出售信息

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/298f02e8-37fa-4eab-aeb5-b5c0388db060.png)



查询背包商店物品出售列表

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/0c92ff4f-8639-4582-a99c-c1fa3aac9c97.png)



查询商店收购物品列表

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/f08c7b3c-0137-40ea-833a-dd6504d12b2a.png)



查询商店物品收购信息

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/21f14fbe-1b02-4612-9d5c-d779adf692a3.png)



查询自定义商店商品出售列表

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/40ec6279-8a75-4e1f-aa8b-32f9f97b7608.png)



查询自定义商店商品出售信息

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mho6gviqhsqs/497f22a1-7041-421c-aaf6-54c6ed778892.png)
