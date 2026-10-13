# 附录/节点图高级特性/节点图日志

(来源：原神千星奇域·综合指南，页面 ID mhu951iz7wz8)

# 一、节点图日志是什么

在玩法逻辑的开发过程中，会碰到许多难以定位问题的情况。

节点图日志可以展示节点图在各个时间点的运行流程，并显示各个节点的参数输入输出值，方便创作者(奇匠)进行调试

下图为节点图日志查看状态下的节点图![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhu951iz7wz8/f3579b8f-8fa3-4f2f-9805-393dc495cfd0.png)

# 二、通过节点图日志调试

## 1.开启节点图日志

从窗口——日志，打开节点图日志窗口

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhu951iz7wz8/918b57d7-8ee0-48dc-8114-b72f04f4435c.png)

节点图日志页签

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhu951iz7wz8/2f0fe14e-e696-4f40-8154-60496892d516.png)

## 2.通过节点图日志调试



**筛选节点图**

在使用日志调试前，需要先在节点图筛选页签中选择查看哪些节点图的日志，如下图所示

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhu951iz7wz8/6e59efc2-052d-4910-a273-54a7cfae46fd.png)

在完成筛选后，在关卡运行过程中，该节点图执行时会返回日志信息

日志信息包含以下几个内容：

节点图事件：显示当前生效的节点图以及生效时间点

打印信息：通过【 _打印字符串_ 】节点打印的信息

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhu951iz7wz8/09541acc-dcfb-4291-af30-b31dc3f2d873.png)

双击生效节点图，可以进入节点图调试模式

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhu951iz7wz8/f524f624-c7d5-41c7-a898-b17cdb7065bf.png)



**节点图的调试模式**

左上角的调试工具中，可以查看当前日志时间点生效的 _逻辑子图_ （可能有多个）。每个逻辑子图都是一个从事件节点触发的节点图执行流

选中当前生效逻辑子图后，该子图部分会高亮显示（如下图所示）

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhu951iz7wz8/cb32f771-4823-4540-a8c0-959023f9c4bd.png)

将鼠标悬停在节点上，可以看到这个节点当前的输入输出参数值

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhu951iz7wz8/0581e1d8-fe45-404a-8f08-88c30b41f7b5.png)
