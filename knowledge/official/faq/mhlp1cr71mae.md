# 关卡编辑

(来源：原神千星奇域·常见问题，页面 ID mhlp1cr71mae)

# Q：关卡实体（LevelEntity）在哪？经常无法正常点击到关卡实体，如何快速定位关卡实体？

关卡实体（LevelEntity）实体摆放界面中以**蓝色立方体图标** 表示（如下图），本质是一个没有模型的点。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/faq/cn/zh-cn/mhlp1cr71mae/c0b143be-5032-48b5-85d3-ddb6cf123d21.png)

快速定位方法：①Esc界面—②关卡设置—③基础—④关卡实体【查看】

![](https://act-webstatic.mihoyo.com/ugc-tutorial/faq/cn/zh-cn/mhlp1cr71mae/06ab0b92-b621-411c-8dda-bf9703cf1fb7.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/faq/cn/zh-cn/mhlp1cr71mae/f9eea4e8-1056-40ce-a465-f3d1016adbc5.png)

# Q：关卡实体中挂载【实体创建时】事件逻辑后，为什么我点击试玩进入游戏时，逻辑已经跑一半/跑完了？

实际在加载界面中，尽管玩家还没有进入关卡进行游玩，关卡就已经创建完成了，因此会导致一些初始生效的逻辑（如运动器、实体创建时等逻辑）在玩家进入以前就已经开始运行。

# Q：阵营中的敌对/友善关系可以在游戏运行中通过节点图切换吗？

现阶段不支持保持原有阵营的情况下，切换该阵营和其他阵营的敌对/友善关系；不过可以通过创建多个阵营，在游戏中通过切换阵营来达到此效果。
