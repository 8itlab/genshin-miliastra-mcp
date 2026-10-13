# 辅助功能/协作编辑

(来源：原神千星奇域·综合指南，页面 ID mhj3gr0ye4wg)

# 一、功能简介

协作编辑模式是一套完整的多人实时协作系统，允许多个奇匠同时编辑同一关卡的不同部分

# 二、核心机制

\- 关卡被分为64个协作部分（可独立编辑）+ 核心部分（部分不可拆分数据及关卡核心数据）  
\- 每个部分有独立的ID段（16~21位）  
\- 支持动态切换当前编辑部分  
\- 支持协作文件导出导入（多人分工、合并）

# 三、创建协作模式存档

## 1.**新建存档时直接创建**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/21c894c3-41b4-4832-9549-9dcc66db9ce2.png)  
新建存档 → 勾选"创建为协作存档"勾选项 → 确认创建

## 2.从**普通存档创建协作模式存档**

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/bda50d76-64ff-4b96-a33e-023d1d6fbcc2.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/c8af4be6-0306-4fef-9a8b-9ba20fdc9ef1.png)  
关卡设置 → 协作模式 → 创建协作模式存档 → 确认

创建后将创建一个新的协作模式存档，而非当前普通存档的直接转换

# 四、协作部分管理

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/99dd124b-5592-4816-ad1d-7cda6b8db472.png)

## 1.查看协作部分

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/1ab943ba-06c2-465e-8b33-4bbb4cab4a8e.png)

关卡设置 → 协作模式 → 左键选中协作部分

\- 分类

\- 包含的资产（有多少个实体、元件等）

\- 协作部分名称（仅本地显示）

\- 打开文件目录

## 2.切换编辑部分

根据上文步骤，点击右下角可切换为当前编辑

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/f53e6607-4fea-49f5-afd8-91485558f32e.png)

右键选中协作部分 → 切换为当前编辑

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/b379553e-1f89-4084-96d4-f7610de0b095.png)

# 五、修改状态

## 1.状态列表

### (1)使用状态

状态| 标志| 含义  
---|---|---  
已使用| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/4963edc6-d4d5-4427-9f60-1d5683323ae0.png)| 协作部分已存在文件内容  
未使用| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/992f4fd1-6df7-4a9b-b210-4252f13b1056.png)| 协作部分为空  
当前编辑| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/aa6157cc-bea4-4525-9717-6055161b7fd2.png)| 正在编辑的内容，进行的所有创建类操作，内容都将创建于这部分里  
  
### (2)归属状态（仅本地显示）

状态| 标志| 含义  
---|---|---  
默认| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/71b08b8a-f823-4c94-b40c-1665ff5bddd6.png)| 默认未标记部分内容  
我的部分| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/7997cc31-af14-4483-969b-71238fc7d616.png)| 自己编辑的内容部分  
其他成员的部分| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/e05f7b81-2dcc-4df1-9251-9d6bfc7046d5.png)| 该部分不是我的编辑内容范围  
  
## 2.修改方式

### **(1)单独修改**

右键选中协作部分 - 更改分类为

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/46d624dc-a217-46fc-8413-4cdd3f0d96d0.png)

### **(2)多选修改**

点击【多选模式】

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/0ef2e6cf-311a-42f3-ba29-368e8e4381e3.png)

左键点击想要修改的部分，当前选中会有绿色框标记，再次左键点击该部分可取消选中

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/33a07c08-41ff-4cdb-bca6-789b1c4d4201.png)

选中所有想要修改的部分后，右键 - 更改分类为 

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/ec7013eb-e875-4a7a-ae51-e5faf274e68b.png)

## 3.筛选协作部分

大部分内容（例：元件，界面控件组管理，技能资源管理等）可通过筛选功能，仅看特定协作部分

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/10bc3bfc-829a-487a-a07f-1fc9b5a3becd.png)

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/03c79e46-16af-4bab-94d0-56a893769af8.png)

# 六、导入导出

## 1.普通模式和协作模式切换

ESC菜单 -【资产导入导出管理】 - 右上角 - 切换至【协作模式】

右上角按钮显示的是所要切换到的模式而非当前的模式，如图当前按钮显示的是【协作模式】则说明目前的模式其实是【普通模式】，左上角的模式显示才表明的是当前处于什么模式

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/fa13face-ac0f-4994-a177-d66aea0caf56.png)

## 2.协作部分导出

【关卡设置】 - 【协作模式】- 【打开文件目录】

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/a70a19a7-ca98-45d9-a914-ea9eea7d06d6.png)

点击后，会打开本地资源管理器（关卡协作部分存放的位置）。结构为：核心文件（.gilh）+64个关卡切片（.gis）。

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/3c8d40a8-5306-43e0-b4aa-21812b4ee9ad.png)

选择并复制希望拷贝的协作部分（.gis）（用于后续协作部分的加载）

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/a82b6283-668c-43e3-89ad-15ed6ffd0c86.png)

## 3.协作部分导入

ESC菜单 -【资产导入导出管理】- 切换到协作模式 - 加载协作文件

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/4089934a-31b9-4c56-b409-79abeeaedd47.png)

打开用来存放【可加载协作部分的文件】对应本地文件目录，并将希望导入的协作部分文件（.gis）放入

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/ad79e707-7ffe-4d59-9f64-16477101b4e0.png)

加载后可以看见协作部分的内容（仅显示同一协作关卡存档的对应协作部分内容，即无法从其他关卡存档导出内容到不同的关卡内）

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/743874ae-3f6b-41c0-bc97-9e9603f75637.png)

覆盖保存文件 - 直接替换对应协作部分的所有内容（例：原有协作部分7的内容会被清除，加载导入的协作部分7所有内容）

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/da3e9527-e518-4d64-a8d0-1708846cea0b.png)

## 4.新增导入导出内容

**外围管理（新增）**  
包含内容  
\- 排行榜  
\- 段位系统  
\- 成就系统  
**背景音乐（新增）**  
包含内容  
\- 所有背景音乐资源  
\- 音乐配置参数

# 七、数据规则

协作部分的数据变化仅在存档保存后发生修改

部分情况下，由于基础数据的动态加载，可能会出现弹窗提示协作部分内容段分配过多，因此分配至其他部分。该部分基础数据的变动对存档本身没有影响

![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhj3gr0ye4wg/219d2092-6e62-454a-aab3-7f23326a414b.png)
