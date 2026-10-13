# 附录/节点图高级特性/信号

(来源：原神千星奇域·综合指南，页面 ID mhlaj0r9bldi)

# 一、信号是什么

在节点图的制作过程中，你应当碰到了许多需要进行全局通信的情景。

例如：当某个机关触发时，会发生以下几件事：



某个大门打开



几个火把上燃起火焰



为角色添加一个新的技能

如果在机关这端制作相关的逻辑，会需要按照下图撰写逻辑

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlaj0r9bldi/1cf9ae6e-24a7-4b40-af3e-f675b34fdd49.png)

当需要迭代上述逻辑时，例如：在燃起火焰之前需要新增【修改丘丘人上的 _自定义变量_ 】，那么每次迭代都需要修改这个机关的节点图，这可能不是一种合理的实现方式

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlaj0r9bldi/254c7913-c4a9-45e9-b958-4a09d1e0a5f0.png)

 _信号_ 就是用来解决上述问题的功能。

# **二、信号的功能**



信号是一个全局自定义的结构。你可以为其添加多个任意类型的 _信号参数_



每个信号通过 _信号名_ 来进行标识



可以从任意实体的服务端节点图上 _发送信号_ 。发送信号的操作是全局的



你可以在任意实体的服务端节点图上 _接收信号_ 。需要注意的是信号的发送和接收都是全局的。这意味着实体1发送的信号，关卡内的任意实体均可以监听并接收这个信号



在技能节点图中，也可以使用定义好的信号向服务器节点图发送。所有服务器节点图都可以监听到该信号

在使用信号后，上述的案例可以将逻辑放到各个实体上实现

当机关触发时，发送信号【机关触发信号】

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlaj0r9bldi/68b910dd-6805-43bf-b000-2854df963b19.png)

大门接收【机关触发信号】的信号，然后修改自身的预设状态（大门打开）

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlaj0r9bldi/33127426-bf37-4247-b94f-261e80cd7abd.png)

火把接收【机关触发信号】的信号，然后播放火焰特效

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlaj0r9bldi/83dc2892-ca7b-4e5f-a7a0-3ed239efa88c.png)

角色接收【机关触发信号】的信号，为自身添加一个技能

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlaj0r9bldi/10301568-6542-488b-86be-9f064e537459.png)

此时如果需要新增【修改丘丘人上的自定义变量】的逻辑，可以直接在丘丘人的节点图上：

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlaj0r9bldi/020f6ec3-a3f9-4c91-98f4-c331bdaf96b0.png)

可以看到，即使新增、调整逻辑，可以完全只修改需要关心的实体的节点图，而不需要修改其他实体的节点图。

这在游戏逻辑开发中，这种**每个实体只根据自己关心的事件处理对应的逻辑，而不是直接操作其他实体** 是很重要的【**解耦** 】思想，可以用来分离实体之间复杂的交互逻辑

# 三、信号的配置

在 _千星沙箱_ 中，可以进行信号的配置

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlaj0r9bldi/aa579636-7132-4829-a32b-581ca0a16ade.png)

可以打开信号管理器界面，在这个界面可以新增、修改信号

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlaj0r9bldi/eacdb16b-78da-4d94-a6eb-a7e83764560a.png)

每个信号由【信号名】进行标识，不同信号名的信号，即使参数构成相同，也是不同的信号

每个信号可以声明任意数量的自定义参数，这些参数可以是任意合法的节点图数据类型

以上图为例，这个信号的信号名为【信号_1】，有三个参数

参数_1：类型为整数

参数_2：类型为字符串

参数_3：类型为实体列表

# 四、信号的使用

在节点图中，可以使用【发送信号】和【接收信号】节点调用信号

**发送信号 （服务器节点图）**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlaj0r9bldi/4d0c3fc1-6671-4df7-92c5-0afa392ad4d1.png)

在节点图中放置了发送信号节点后，需要先选择【信号名】

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlaj0r9bldi/2b3ff027-d991-4bce-a356-fcbe075edef9.png)

选择【信号名】后，该节点的入参会新增这个信号名对应的信号的所有参数，可以将值传入信号中，并在接收信号端接收这一组参数

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlaj0r9bldi/1c3c6f99-e547-4e8a-ab79-81baeb07a14f.png)

**向服务器节点图发送信号（客户端节点图）**

在技能节点图中，也可以使用定义好的信号向服务器节点图发送。所有服务器节点图都可以监听到该信号

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlaj0r9bldi/8de25dec-a81e-49c3-8ecb-bf6b6a8bd7ad.png)

**监听信号**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlaj0r9bldi/b8b3ce2a-91ca-45c7-bfad-b29cffffeea6.png)

可以在任意的实体上接收信号，同样需要先选择【信号名】

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlaj0r9bldi/f57932f1-2522-4ba6-8b29-dc4da0e943bd.png)

选择【信号名】后，该节点的出参会新增这个信号名对应信号的所有参数，可以从这些出参取到由【发送信号】节点传入的参数值

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhlaj0r9bldi/c7e9ebd8-7115-460a-86c3-23c30a1fcd0f.png)
