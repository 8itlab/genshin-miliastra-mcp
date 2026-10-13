# 概念介绍/功能/通用组件/定时器

(来源：原神千星奇域·综合指南，页面 ID mhufb90zbnts)

# 一、定时器的功能

 _定时器_ 提供计时能力，支持操纵计时的启动、终止、暂停、恢复，也支持同步界面控件显示计时时间

# 二、定时器的使用方式

只能通过节点图创建和使用，创建定时器时需要明确归属实体

支持对计时进行分段，在每一个时间段计时到达时，节点图都会发送事件

# 三、通过节点图管理定时器



启动定时器

在目标实体上启动一个定时器

定时器通过定时器名称进行唯一标识

定时器由一个循环或不循环的 _定时器序列_ 组成。定时器序列应是一组从小到大排列的，以秒为单位的时间点(最小间隔为0.03秒)，在定时器运行到这些时间点时，会触发【定时器触发时】事件

例如：[1,3,5,7]，如果传入这样的定时器序列，那么分别在第1、3、5、7秒，会触发【定时器触发时】事件

当是否循环为“是”时，在定时器到达最后一个时间点后，会从0秒开始进行循环计时。以[1,3,5,7]这样的定时器为例，则在运行到7秒后，再从0秒开始计时

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhufb90zbnts/80237437-9009-4c89-a9e7-f3b01620dd2e.png)



暂停定时器

定时器运行过程中，可按需做暂停处理，暂停计时功能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhufb90zbnts/573277c9-f509-41d7-b44f-22fc6522254f.png)



恢复定时器

定时器运行过程中，若之前有暂停操作，可按需做恢复处理，继续计时

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhufb90zbnts/f48b5531-384f-4fdc-b4cd-f854ddeb762a.png)



终止定时器

在定时器运行过程中，可按需终止已创建的定时器

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhufb90zbnts/ae414f3d-7c73-4969-9b96-6ee5ce5f8ec7.png)



定时器触发时

定时器运行时，计时到达序列中的时间段，会向挂载该定时器的实体的节点图发送 _定时器触发时_ 事件

定时器序列序号，代表定时器序列的序号

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhufb90zbnts/ad36cc5f-774a-4acf-a012-c3b5635a4608.png)
