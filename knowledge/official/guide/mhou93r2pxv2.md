# 附录/单位状态效果池

(来源：原神千星奇域·综合指南，页面 ID mhou93r2pxv2)

最终值=（基础值+变更量）*（1+调整率）* 倍率 + 修正值  
  
“变更量“表示基础数值的变化程度  
“调整率“表示数值额外缩放的系数  
“倍率”表示数值整体缩放的系数  
“修正值”表示数值最终增减的变化程度

说明：其中某些单位状态有动态的版本，用节点动态修改单位状态的方法可以参考[单位状态](/ys/ugc/tutorial//detail/mh6rh59iil2i)中

三、单位状态的运行 —— 2.以服务器节点管理 —— 单位状态参数字典的使用

# 一、基础属性

**单位状态**| **示意**| **效果**  
---|---|---  
受打断倍率| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/d5c5cc53-7917-44f8-99e4-dbd8cf0caa63.png)| 影响受到攻击时，受打断值增长的倍率。当这个值为0时，说明受到伤害不增加受打断值，即实体霸体  
坠落效率变更量| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/f08e85a7-77a6-46db-a33a-59b794e56ca0.png)| 影响坠落时坠落加速度。在默认状态下，所有角色和造物有200%的坠落效率，因此当该值设为-200%时，可以使角色或造物无视重力  
坠落伤害调整率| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/91c1ae42-4eb9-43a3-ab61-b97ed651a351.png)| 影响角色坠落时受到的坠落伤害。为-100时，使角色完全不受到坠落伤害  
最大生命值调整率| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/d4e8cd66-0eea-471e-a781-7d6b0b371603.png)| 影响实体的最大生命值  
最大生命值修正值| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/d2d195f2-63fe-4e77-ad53-310b5258a5c9.png)| 影响实体的最大生命值  
移动速度调整率| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/4802e390-3409-48e0-b1de-e44a50345398.png)| 影响角色、造物的移动速度  
攻击速度调整率(暂不生效)| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/426d623c-539b-4c51-aab8-e03acc373330.png)| 影响角色的攻击速度  
被击退效率调整率| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/07f9a090-cd98-49c3-bb4e-1f99222badd7.png)| 受到攻击时，击退力的大小会受该值影响，从而影响击退距离或高度。  
体力消耗调整率| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/354355cb-b002-4558-89e7-c58d73f06877.png)| 影响角色在奔跑、游泳等状态下的体力消耗。设为-100%时可以使这些行为不消耗体力  
护盾强效调整率| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/718d64fa-eea1-4cf2-a30d-e66b7e092f08.png)| 获得护盾时，按照调整率改变获得的护盾值  
体力恢复调整率| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/d1a181bf-66db-4d00-bfc6-f6a70fae9f55.png)| 影响角色在损失体力后的体力恢复效率。设为-100%时可以使角色无法恢复体力  
  
# 二、伤害流程

**单位状态**| **示意**| **效果**  
---|---|---  
防御力调整率| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/82699375-5025-45bd-b2fb-c0143e27617e.png)| 影响实体的防御力  
防御力修正值| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/bd5d05b6-41f9-450f-893c-8e7105ca0f4e.png)| 影响实体的防御力  
攻击力调整率| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/041b03cc-0b52-4f8a-9690-fd6a79a79529.png)| 影响实体的攻击力  
攻击力修正值| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/1f7025ef-abc1-48cf-bc4e-5523fa68e244.png)| 影响实体的攻击力  
暴击触发变更量| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/e6da1300-1be3-4d85-b14b-1bcadc272598.png)| 影响实体的暴击率  
绽放反应抗性调整率| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/49ca2606-a851-4a77-819e-309b166d875d.png)| 影响实体的绽放反应抗性  
抗暴击触发变更量| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/9edc0ffa-06c4-497d-afe9-b3c781a7d8df.png)| 影响受到攻击时，攻击者的暴击率  
暴击伤害变更量| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/89399f95-301f-47c5-95cc-d83d55201a1d.png)| 影响实体的暴击伤害  
攻击增伤调整率| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/b22b166c-1750-4d6f-826f-3f22e014883c.png)| 影响实体的攻击增伤率  
受击减伤调整率| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/a5152e31-9fe4-49ca-adab-14a122269f9f.png)| 影响实体的受击减伤率  
恢复效果调整率| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/e93f7e8a-0f01-4a56-9718-877faa291766.png)| 影响实体施加的恢复效果  
受恢复效果调整率| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/43f98b33-d602-434c-bfa3-58f5e09120d2.png)| 影响实体受到的恢复效果  
元素增伤调整率| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/fc7ac697-4b86-4066-be64-ec1a3534e6e6.png)| 影响实体造成的元素伤害，包括物理以及七种元素  
元素抗性调整率| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/0ffc1730-a07e-491c-a9ee-c1d87aa09938.png)| 影响实体受到的元素伤害，包括物理以及七种元素  
元素精通修正值| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/973c1be3-4f65-44ad-a413-0686e2ced0a2.png)| 影响实体的元素精通值  
剧变反应增伤调整率| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/2c2053ea-01db-4aac-aa93-30de7a00c6d7.png)| 影响实体造成的剧变反应的伤害包括以下元素反应：扩散、超导、感电、点燃、冻结、超载、碎冰、绽放、烈绽放、超绽放  
增幅反应增伤调整率| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/849d4ca2-03d7-41ff-9cb3-ad5ab923c371.png)| 影响实体造成的增幅反应的伤害包括以下元素反应：蒸发、融化  
无视防御调整率| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/6618a9a3-c225-431e-b608-29402b3e3a12.png)| 影响实体造成伤害时无视的防御比例  
无视防御修正值| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/c9dae8ba-2670-4666-8237-b733f1dec133.png)| 影响实体造成伤害时无视的防御数值  
元素伤害免疫| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/ca8f8b81-39b7-4d8d-ad82-f521896edc85.png)| 设为【是】时，可以免疫特定元素的伤害，包括物理以及七种元素  
技能冷却效率变更量| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/7625385c-b03e-4ddd-bb91-a334664766a5.png)| 影响角色技能的冷却时间缩减效率，这个数值越高，角色的技能冷却越快  
激化反应增伤调整率| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/50e41a23-f701-4549-8eaf-680d505123fc.png)| 影响实体造成的激化反应的伤害包括以下元素反应：超激化、蔓激化  
仇恨倍率调整率| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/49a3a0e0-c162-4713-a6a6-f542e92292de.png)| 获得仇恨值时的调整率  
仇恨倍率修正值| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/182ec6b8-8dff-40ee-b2cb-ca6450b32cf7.png)| 获得仇恨值时的修正值  
  
# 三、特殊功能

**单位状态**| **示意**| **效果**  
---|---|---  
造物不可见| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/1988eb7a-2f6b-40f7-bd4d-10139e882720.png)| 当布尔型本地过滤器返回TRUE，造物不可见  
始终播放动作| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/a13af583-19c4-4c00-86da-9a5aaffaa356.png)| 无论是否可见、是否在摄像机画面内，动画都会完整地计算和播放。（默认情况下，当不可见或是不在画面内时，动画可能会因为性能优化的原因停止播放）  
定时触发技能| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/16b2cb0d-fc00-4aa5-98f6-bcfc5eb3fb7c.png)| 可以让指定槽位的技能按触发间隔触发  
调整动画速度| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/0d38850e-69b5-4a08-8307-553ecc11018f.png)| 可以调整指定属性组的动画速度  
调整冷却时间| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/8bf38dc0-98c7-472b-b979-6a287c83859e.png)| 可以调整指定属性组的冷却时间  
状态显示区添加状态| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/2ebb53fe-03fa-4fab-99e3-18c28787b9e1.png)| 选择对应的状态显示区控件，可使该单位状态的信息显示在对应控件所在的位置  
攻击伤害调整| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/e1635983-ae9a-45f4-81f4-f4357ac457dc.png)| 挂载在攻击者实体上，用于对该攻击者实体发起的、符合特定条件的攻击进行伤害判定前的效果调整。注意：三个攻击条件（攻击标签、攻击类型、本地过滤器）为与关系，即三项条件必须均为是才可通过判定攻击标签列表：发起的攻击的攻击标签需在攻击标签列表内攻击类型：发起的攻击的攻击类型需在攻击类型内布尔型本地过滤器：可配置一个布尔型本地过滤器。如果不配置则此项不生效覆写攻击元素类型：覆写攻击元素类型，可选择不覆写。在攻击者实体上有多个不同的覆写攻击元素类型时，生效顺序不确定覆写是否为绝对伤害：覆写是否为绝对伤害，可选择不覆写。在攻击者实体上有多个不同的覆写是否为绝对伤害时，生效顺序不确定额外攻击相关参数：额外增伤调整率、额外暴击触发等。用于在伤害判定生效前修改该次伤害的效果  
受击伤害调整| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/dacb2439-9b8c-41e2-b17f-4dbc7e04c300.png)| 挂载在受击者实体上，用于对该受击者实体受到的、符合特定条件的攻击进行伤害判定前的效果调整。注意：三个攻击条件（攻击标签、攻击类型、本地过滤器）为与关系，即三项条件必须均为是才可通过判定攻击标签列表：受到的攻击的攻击标签需在攻击标签列表内攻击类型：受到的攻击的攻击类型需在攻击类型内布尔型本地过滤器：可配置一个布尔型本地过滤器。如果不配置则此项不生效额外攻击相关参数：额外增伤调整率、额外暴击触发等。用于在伤害判定生效前修改该次伤害的效果  
光标点击施放技能| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/7a166959-33be-4e32-afff-72e11782bdee.png)| 用于移动端使用常驻光标功能需要补充的额外逻辑  
操控运动器自动前进| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/040cf0c6-e74a-4174-8a9f-3d2877f58c7f.png)| 单位状态效果添加给操控运动器时，将会在激活时自动向前运动  
操控运动器运动参数| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/5dbdbe37-ec36-4b01-8254-22b9647b5cf9.png)| 单位状态效果添加给操控运动器时，可使运动参数增加指定值  
造物浮空（仅对复杂造物生效）| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/8b6e80c6-eb12-4555-8902-1d45038a2573.png)| 使复杂造物进入不受重力影响的浮空状态，不会改变动画表现该状态下，造物可以执行空中类型战术，无法执行地面类型战术  
角色禁止移动| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/c035e6f3-7ef1-4757-ae68-97d48df8caad.png)| 使玩家操控的角色无法通过方向键或推摇杆的形式进行移动  
挂载特效| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/2b508ac0-12a9-4868-b57a-d757ff2fcd16.png)| 在实体上挂载一个循环特效，配置与特效相关配置基本一致  
元素附着| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/8e82f7dc-db08-4cef-8fe5-80c0f7221718.png)| 在实体上附着一个特定类型的元素。这个元素不会自然消耗，但会被元素反应消耗  
特殊状态：无敌| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/903801d6-1539-4ce1-803a-afedd736556f.png)| 使实体进入无敌状态无敌状态下，无法受到任何伤害，且受到攻击不会触发【受到攻击时】事件  
特殊状态：禁止锁定| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/26952682-f5b5-4c85-b473-109868c1b15d.png)| 使实体进入禁止锁定状态该状态下，造物自动锁定类的攻击和技能无法锁定该实体  
特殊状态：锁定生命值| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/4ae5dea4-547b-4166-9009-5888017b8ae5.png)| 使实体进入锁定生命值状态该状态下，生命无法降低，但受到攻击时会触发【受到攻击时】事件  
特殊状态：挣扎| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/8b88836f-77aa-4dfe-a3e1-45fdff7f31e0.png)| 使实体进入挣扎状态该状态下，实体无法做出任何行动。玩家可以通过快速点按挣脱键进行挣脱不是所有造物都可支持该状态  
特殊状态：禁止恢复生命值| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/935e3f14-414a-426e-a9fa-452812061237.png)| 使实体进入禁止恢复生命值状态该状态下，实体无法恢复生命  
特殊状态：禁止生命低于指定值| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/5b27644e-91b1-47a1-8bd3-e4ba6bbfe4db.png)| 使实体进入禁止生命低于指定值状态该状态下，实体的生命禁止低于生命阈值所配置的生命百分比  
超级跳| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/4080d613-192b-42a4-be4f-19f9cc36cc30.png)| 该状态下，角色获得增强跳跃的能力xz倍率为平面上跳跃的距离，超过1即增强平面的跳跃距离y倍率为向上跳跃的高度，超过1即增强向上跳跃的高度  
阻止攻击元素附着| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/cdc2dc91-1c72-4f67-a50a-9f292da48e98.png)| 该状态下，造物造成的元素攻击无法附着元素  
免疫嘲讽| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/e7e97814-72d8-46d3-8033-eed54b8afd8e.png)| 免疫经典仇恨模式和自定义仇恨模式的嘲讽  
禁止移动| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/b81240e6-8017-457f-8417-82f23fac3715.png)| 限制造物的常规移动，不会影响技能过程中的移动，也不会影响技能造成的移动效果禁止移动期间，会对处于脱战环节的造物产生影响，会带来无法脱战，或其他不稳定的状态阻塞，建议创作者(奇匠)规避或监听脱战状态时对禁止移动进行管理  
禁用跳跃| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/e37ca7b4-0866-4c4d-8496-a71e9cfedc45.png)| 禁止角色跳跃  
造物沉默| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/80a06221-b697-49d0-a70e-5576697411eb.png)| 使造物无法释放技能暂时无法对复杂造物的自定义技能生效，在下个版本中将会支持该功能  
禁用冲刺| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/e59ac645-4a13-4d5f-ac61-2cf115507581.png)| 禁止角色冲刺  
禁用滑翔| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/3d458054-ac01-4bc1-b6c5-c6aec919627d.png)| 禁止角色滑翔  
监听元素反应| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/91275151-7189-4665-8a5b-1e469bb9d085.png)| 设置事件的发送目标和监听的反应类型，当该实体发生指定元素反应时，可触发目标实体挂载的节点图事件【发生元素反应时】  
护盾| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/af66284c-9067-48a6-85f9-f527d9589060.png)| 获得护盾，参数引用护盾配置  
禁用攀爬| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/fe7a669b-2f7a-46eb-9932-012b293c2a85.png)| 禁止角色攀爬  
监听移动速率| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/e5064487-9d74-4b25-b86d-d7e81f34f438.png)| 添加后，将在条件满足的时候触发角色挂载的节点图事件【角色移动速度达到条件时】。同时，添加该单位状态的角色，可以通过【查询角色当前移动速度】节点获取移动速度、方向。  
铭牌隐藏| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/f23573dc-156d-430b-8d51-1ae9faab3177.png)| 隐藏该单位的铭牌  
禁用挣扎按钮| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/75858b9f-82b8-4bb7-8b3c-d96634b42669.png)| 角色进入挣扎状态时，无法通过挣扎按钮提前挣脱  
冲刺时不关闭受击盒| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/def3f537-6ca4-4287-9aba-6f9402a898dc.png)| 冲刺时，不关闭受击盒。（默认情况下，角色冲刺会短暂关闭受击盒）  
挂载描边效果| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/e8b4da84-157f-4753-8119-84f4b097f0a2.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/2fc22e41-57c7-4bc7-b3f3-cb8fcddb9046.png)| 实体边缘会显示配置颜色描边支持配置布尔型过滤器当布尔型本地过滤器返回TRUE时，实体会被描边  
隐藏实体的小地图标识| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/643dafb4-cdbd-4dc3-be66-cb0de7aedc76.png)| 隐藏实体在小地图上的显示  
挂载透视效果| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/b032c3f9-be4d-44b9-92f6-1bd8b10a35f1.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/d0d9c862-dcf3-4b6c-b392-b7fd0442a226.png)| 当布尔型本地过滤器返回TRUE，并且挂载实体被遮挡时，该实体会以配置颜色穿透显示  
角色隐藏| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/4301ac35-5f68-4978-98d4-08a8539d4d19.png)| 半透明、全透明，都是隐藏的一种状态布尔型本地过滤器的判定结果可以理解为【本地对挂载角色隐藏的角色是否可见】当屏蔽特效、音频全勾选上时：从本地看挂载该状态的角色，若过滤器判定true，挂载角色虚化半透明，屏蔽特效不会生效，屏蔽音效不会生效过滤器判定false，挂载角色完全隐藏屏蔽特效生效，通过特效组件、特效单位状态挂上的特效不会生效屏蔽音效生效，走/跑/动作等音效不会生效，播放音效不会生效是否同时屏蔽特效：该单位状态开关的优先级高于特效器内特效的开关优先级  
物件不可见| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/ce45f3ab-436d-48ef-a071-ccc0d7a3b3f9.png)| 当布尔型本地过滤器返回TRUE，实体不可见  
覆写扫描标签数据| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/79121ea9-a45b-4ea3-ba7d-19b5a8d19328.png)| 添加后，角色的扫描标签组件数据将按照设置参数生效  
修正小地图方向| ![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/cb82e218-5ed5-41ee-9e7e-8964a9478789.png)![](https://act-webstatic.mihoyo.com/ugc-tutorial/knowledge/cn/zh-cn/mhou93r2pxv2/117aed82-c10f-4f11-8f2d-0d7211efd034.png)| 可选择以角色朝向为小地图正上方，还是以指定的偏转角度为小地图的正上方
