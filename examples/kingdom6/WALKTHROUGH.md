# 样例 kingdom6：只用 MCP 工具从空白地图搭出来的全过程

这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。

- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。
- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。
- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。

## 这个样例是什么

Kingdom v6, the full game: days of 60 seconds, nights of 45, five nights (about nine minutes). This is the save to hand to a person. The script plays one sensible line so that every part runs once: day 1 two citizens, the builder, a knife thrower, the wooden wall; day 2 a soldier; day 3 a second thrower and a farmer; day 4 the keep and a second soldier; day 5 a citizen who becomes the third thrower, and stone. Played by the script it is won or lost on the fourth night by seconds (three games: two won, one lost as the fourth dawn broke); a person plays differently. Its numbers are kg6_rules_play.json (smaller waves than v5, sturdier walls and soldiers, two coins more each morning: balance6.py). At night it stands between the site and the wall, where nothing offers an option and the fight can be watched. A person plays differently, and whether it is fun is for a person to say. From the third night brutes come too (火斧丘丘暴徒 with a big blade: 45 a blow, and they take five strokes).

## 一、工具调用顺序

1. `list_maps` `{}`
2. `scene_set_camera` `{"distance":17,"yawRange":[0,0]}`
3. `editor_open_map` `{}`
4. `scene_build_blocks` `{"name":"Kingdom_V6","blocks":[{"template":20002088,"name":"KV_flag","position":[-2.6,7.6,5.2]},{"template":20002409,"name":"KV_hammer_sign","position":[8.4,7.6,4.2]},{"template":20002764,"name":"KV_bow_target_b","position":[16,7.6,5.6],"rotation":[0,25,0]},"… 20 more pieces of the same form"],"offset":[-9,-7.6,0]}` → `{"name":"Kingdom_V6"}`
5. `scene_build_blocks` `{"name":"Kingdom_V3_Scenery","blocks":[{"template":20002056,"name":"KS_001","position":[-42,7.6,-10.25],"scale":[1.21,0.2,1.15]},{"template":10005106,"name":"KS_002","position":[-42,7.85,-10.25],"scale":[12.05,0.4,11.5]},{"template":20002056,"name":"KS_003","position":[-30,7.6,-10.25],"scale":[1.21,0.2,1.15]},"… 128 more pieces of the same form"],"offset":[-9,-7.6,0]}` → `{"name":"Kingdom_V3_Scenery"}`
6. `scene_import_assets` `{"packs":["Kingdom_V6","Kingdom_V3_Scenery"]}`
7. `scene_list_entities` `{"namePrefix":"KV_"}` → `{"total":23}`
8. `scene_add_prefab` `{"asset":10005009,"name":"KV_coin","scale":0.5}` → `{"name":"KV_coin","prefabId":1077936276}`
9. `scene_add_prefab` `{"asset":10005009,"name":"KV_tag_keep","scale":0.3}` → `{"name":"KV_tag_keep","prefabId":1077936277}`
10. `scene_add_prefab` `{"asset":10005009,"name":"KV_tag_site","scale":0.3}` → `{"name":"KV_tag_site","prefabId":1077936278}`
11. `scene_add_prefab` `{"asset":10005009,"name":"KV_tag","scale":0.3}` → `{"name":"KV_tag","prefabId":1077936279}`
12. `scene_add_prefab` `{"asset":20002336,"name":"KV_keep","scale":1}` → `{"name":"KV_keep","prefabId":1077936280}`
13. `scene_add_prefab` `{"asset":20002087,"name":"KV_camp","scale":0.55}` → `{"name":"KV_camp","prefabId":1077936281}`
14. `scene_add_prefab` `{"asset":20001613,"name":"KV_smith","scale":0.8}` → `{"name":"KV_smith","prefabId":1077936282}`
15. `scene_add_prefab` `{"asset":20002764,"name":"KV_range","scale":1}` → `{"name":"KV_range","prefabId":1077936283}`
16. `scene_add_prefab` `{"asset":20001965,"name":"KV_farm","scale":0.8}` → `{"name":"KV_farm","prefabId":1077936284}`
17. `scene_add_prefab` `{"asset":20002275,"name":"KV_site","scale":1}` → `{"name":"KV_site","prefabId":1077936285}`
18. `scene_add_prefab` `{"asset":20002863,"name":"KV_crown","scale":0.45}` → `{"name":"KV_crown","prefabId":1077936286}`
19. `scene_add_prefab` `{"asset":20002261,"name":"KV_barracks","scale":1}` → `{"name":"KV_barracks","prefabId":1077936287}`
20. `scene_add_prefab` `{"asset":20003092,"name":"KV_wall_wood","scale":[0.55,1.2,1],"health":250}` → `{"name":"KV_wall_wood","prefabId":1077936288}`
21. `scene_add_prefab` `{"asset":20002893,"name":"KV_wall_stone","scale":[1,0.6,1],"health":600}` → `{"name":"KV_wall_stone","prefabId":1077936289}`
22. `scene_add_prefab` `{"asset":20001929,"name":"KV_knife","scale":0.2}` → `{"name":"KV_knife","prefabId":1077936290}`
23. `scene_add_prefab` `{"fromEntity":"KV_enemy_00","name":"KV_greed","health":12}` → `{"name":"KV_greed","prefabId":1082130440}`
24. `scene_add_prefab` `{"fromEntity":"KV_enemy_big","name":"KV_brute","health":36}` → `{"name":"KV_brute","prefabId":1082130441}`
25. `scene_add_prefab` `{"fromEntity":"KV_unit_vagrant","name":"KV_vagrant","health":15}` → `{"name":"KV_vagrant","prefabId":1082130442}`
26. `scene_add_prefab` `{"fromEntity":"KV_unit_farmer","name":"KV_farmer","health":15}` → `{"name":"KV_farmer","prefabId":1082130443}`
27. `scene_add_prefab` `{"fromEntity":"KV_unit_builder","name":"KV_builder","health":15}` → `{"name":"KV_builder","prefabId":1082130444}`
28. `scene_add_prefab` `{"fromEntity":"KV_unit_thrower","name":"KV_thrower","health":15}` → `{"name":"KV_thrower","prefabId":1082130445}`
29. `scene_add_prefab` `{"fromEntity":"KV_unit_soldier","name":"KV_soldier","health":40}` → `{"name":"KV_soldier","prefabId":1082130446}`
30. `scene_set_faction_hostility` `{"hostilePairs":[[1,3]]}`
31. `scene_set_level_settings` `{"aggroMode":"custom"}`
32. `scene_add_environment` `{"name":"KV_night","hour":0}` → `{"name":"KV_night","environmentId":1186988034,"defaultEnvironmentId":1186988033}`
33. `scene_add_environment` `{"name":"KV_day","hour":11,"stars":false,"milkyWay":false}` → `{"name":"KV_day","environmentId":1186988035,"defaultEnvironmentId":1186988033}`
34. `scene_set_spawn` `{"position":[-7,0.4,0],"rotation":[0,0,0]}` → `{"pointId":1073741825}`
35. `scene_add_signal` `{"name":"KG_state"}` → `{"name":"KG_state"}`
36. `scene_add_signal` `{"name":"KG_warn"}` → `{"name":"KG_warn"}`
37. `scene_add_signal` `{"name":"KG_dusk"}` → `{"name":"KG_dusk"}`
38. `scene_add_signal` `{"name":"KG_dawn"}` → `{"name":"KG_dawn"}`
39. `scene_add_signal` `{"name":"KG_wall_down"}` → `{"name":"KG_wall_down"}`
40. `scene_add_signal` `{"name":"KG_mend"}` → `{"name":"KG_mend"}`
41. `scene_add_signal` `{"name":"KG_mended"}` → `{"name":"KG_mended"}`
42. `scene_set_class` `{"allowJump":false}`
43. `scene_add_light` `{"name":"KV_lamp_0","environment":"KV_night","position":[-12.9,2.2,4.3],"radius":9,"intensity":3}` → `{"name":"KV_lamp_0","environmentId":1186988034}`
44. `scene_add_light` `{"name":"KV_lamp_1","environment":"KV_night","position":[-1.7,2.2,4.3],"radius":9,"intensity":3}` → `{"name":"KV_lamp_1","environmentId":1186988034}`
45. `scene_add_light` `{"name":"KV_lamp_2","environment":"KV_night","position":[12.4,2.2,4.3],"radius":9,"intensity":3}` → `{"name":"KV_lamp_2","environmentId":1186988034}`
46. `scene_add_light` `{"name":"KV_lamp_3","environment":"KV_night","position":[21.5,2.2,4.3],"radius":9,"intensity":3}` → `{"name":"KV_lamp_3","environmentId":1186988034}`
47. `scene_add_light` `{"name":"KV_lamp_4","environment":"KV_night","position":[-20.5,2.2,4.3],"radius":9,"intensity":3}` → `{"name":"KV_lamp_4","environmentId":1186988034}`
48. `scene_add_graph` `{"name":"KgStage"}` → `{"graphId":1073741825,"name":"_GSTS_KgStage"}`
49. `scene_add_graph` `{"name":"KgCoin","attachToPrefab":"KV_coin"}` → `{"graphId":1073741826,"name":"_GSTS_KgCoin"}`
50. `scene_add_graph` `{"name":"KgCamp","attachToPrefab":"KV_camp"}` → `{"graphId":1073741827,"name":"_GSTS_KgCamp"}`
51. `scene_add_graph` `{"name":"KgFarm","attachToPrefab":"KV_farm"}` → `{"graphId":1073741828,"name":"_GSTS_KgFarm"}`
52. `scene_add_graph` `{"name":"KgSmith","attachToPrefab":"KV_smith"}` → `{"graphId":1073741829,"name":"_GSTS_KgSmith"}`
53. `scene_add_graph` `{"name":"KgSite","attachToPrefab":"KV_site"}` → `{"graphId":1073741830,"name":"_GSTS_KgSite"}`
54. `scene_add_graph` `{"name":"KgKeep","attachToPrefab":"KV_keep"}` → `{"graphId":1073741831,"name":"_GSTS_KgKeep"}`
55. `scene_add_graph` `{"name":"KgRange","attachToPrefab":"KV_range"}` → `{"graphId":1073741832,"name":"_GSTS_KgRange"}`
56. `scene_add_graph` `{"name":"KgBarracks","attachToPrefab":"KV_barracks"}` → `{"graphId":1073741833,"name":"_GSTS_KgBarracks"}`
57. `scene_add_graph` `{"name":"KgUnit","attachToPrefab":["KV_vagrant","KV_farmer","KV_builder","KV_thrower","KV_soldier"]}` → `{"graphId":1073741834,"name":"_GSTS_KgUnit"}`
58. `scene_add_graph` `{"name":"KgKnife","attachToPrefab":"KV_knife"}` → `{"graphId":1073741835,"name":"_GSTS_KgKnife"}`
59. `scene_add_graph` `{"name":"KgWall","attachToPrefab":["KV_wall_wood","KV_wall_stone"]}` → `{"graphId":1073741836,"name":"_GSTS_KgWall"}`
60. `scene_add_graph` `{"name":"KgGreed","attachToPrefab":["KV_greed","KV_brute"]}` → `{"graphId":1073741837,"name":"_GSTS_KgGreed"}`
61. `scene_add_graph` `{"name":"KgPlayer","attachToPrefab":"player"}` → `{"graphId":1073741838,"name":"_GSTS_KgPlayer"}`
62. `scene_add_graph` `{"name":"KgDig","kind":"creatureSkill"}` → `{"graphId":1082130433,"name":"_GSTS_KgDig"}`
63. `scene_add_graph` `{"name":"KgHammer","kind":"creatureSkill"}` → `{"graphId":1082130434,"name":"_GSTS_KgHammer"}`
64. `scene_add_graph` `{"name":"KgThrow","kind":"creatureSkill"}` → `{"graphId":1082130435,"name":"_GSTS_KgThrow"}`
65. `scene_add_graph` `{"name":"KgSlash","kind":"creatureSkill"}` → `{"graphId":1082130436,"name":"_GSTS_KgSlash"}`
66. `scene_add_graph` `{"name":"KgPunch","kind":"creatureSkill"}` → `{"graphId":1082130437,"name":"_GSTS_KgPunch"}`
67. `scene_add_graph` `{"name":"KgSmash","kind":"creatureSkill"}` → `{"graphId":1082130438,"name":"_GSTS_KgSmash"}`
68. `scene_add_graph` `{"name":"KgCitizenMind","kind":"creatureDecision"}` → `{"graphId":1082130439,"name":"_GSTS_KgCitizenMind"}`
69. `scene_add_graph` `{"name":"KgFarmerMind","kind":"creatureDecision"}` → `{"graphId":1082130440,"name":"_GSTS_KgFarmerMind"}`
70. `scene_add_graph` `{"name":"KgBuilderMind","kind":"creatureDecision"}` → `{"graphId":1082130441,"name":"_GSTS_KgBuilderMind"}`
71. `scene_add_graph` `{"name":"KgThrowerMind","kind":"creatureDecision"}` → `{"graphId":1082130442,"name":"_GSTS_KgThrowerMind"}`
72. `scene_add_graph` `{"name":"KgSoldierMind","kind":"creatureDecision"}` → `{"graphId":1082130443,"name":"_GSTS_KgSoldierMind"}`
73. `scene_add_graph` `{"name":"KgGreedMind","kind":"creatureDecision"}` → `{"graphId":1082130444,"name":"_GSTS_KgGreedMind"}`
74. `scene_add_graph` `{"name":"KgDoHome","kind":"creatureStatus"}` → `{"graphId":1082130445,"name":"_GSTS_KgDoHome"}`
75. `scene_add_graph` `{"name":"KgDoPost","kind":"creatureStatus"}` → `{"graphId":1082130446,"name":"_GSTS_KgDoPost"}`
76. `scene_add_graph` `{"name":"KgDoStroll","kind":"creatureStatus"}` → `{"graphId":1082130447,"name":"_GSTS_KgDoStroll"}`
77. `scene_add_graph` `{"name":"KgDoToil","kind":"creatureStatus"}` → `{"graphId":1082130448,"name":"_GSTS_KgDoToil"}`
78. `scene_add_graph` `{"name":"KgDoMend","kind":"creatureStatus"}` → `{"graphId":1082130449,"name":"_GSTS_KgDoMend"}`
79. `scene_add_graph` `{"name":"KgDoShoot","kind":"creatureStatus"}` → `{"graphId":1082130450,"name":"_GSTS_KgDoShoot"}`
80. `scene_add_graph` `{"name":"KgDoFight","kind":"creatureStatus"}` → `{"graphId":1082130451,"name":"_GSTS_KgDoFight"}`
81. `scene_add_graph` `{"name":"KgDoAdvance","kind":"creatureStatus"}` → `{"graphId":1082130452,"name":"_GSTS_KgDoAdvance"}`
82. `scene_add_graph` `{"name":"KgDoBash","kind":"creatureStatus"}` → `{"graphId":1082130453,"name":"_GSTS_KgDoBash"}`
83. `scene_add_graph` `{"name":"KgDoSiege","kind":"creatureStatus"}` → `{"graphId":1082130454,"name":"_GSTS_KgDoSiege"}`
84. `scene_add_graph` `{"name":"KgDoRetreat","kind":"creatureStatus"}` → `{"graphId":1082130455,"name":"_GSTS_KgDoRetreat"}`
85. `scene_add_creature_skill` `{"name":"KV_dig","creature":30006009,"animation":"挖矿01","graphAtMs":700,"effect":{"asset":10006070,"attachPoint":"GI_WeaponR","ms":4400},"graphId":1082130433}` → `{"graphId":1082130433,"name":"KV_dig","skillId":1191182337}`
86. `scene_add_creature_skill` `{"name":"KV_hammer","creature":30006009,"animation":"挖矿01","graphAtMs":700,"effect":{"asset":10006070,"attachPoint":"GI_WeaponR","ms":4400},"graphId":1082130434}` → `{"graphId":1082130434,"name":"KV_hammer","skillId":1191182338}`
87. `scene_add_creature_skill` `{"name":"KV_throw","creature":30006009,"animation":"远程攻击_01","animationPortion":0.62,"graphAtMs":2050,"faceTarget":true,"effect":{"asset":10006069,"attachPoint":"GI_WeaponR","ms":2000},"graphId":1082130435}` → `{"graphId":1082130435,"name":"KV_throw","skillId":1191182339}`
88. `scene_add_creature_skill` `{"name":"KV_slash","creature":30008001,"animation":"近战攻击_02","graphAtMs":750,"faceTarget":true,"graphId":1082130436}` → `{"graphId":1082130436,"name":"KV_slash","skillId":1191182340}`
89. `scene_add_creature_skill` `{"name":"KV_punch","creature":30007001,"animations":["攻击","闪避"],"graphAtMs":1050,"faceTarget":true,"graphId":1082130437}` → `{"graphId":1082130437,"name":"KV_punch","skillId":1191182341}`
90. `scene_add_creature_skill` `{"name":"KV_smash","creature":30005002,"animation":"近战攻击_01","animationPortion":0.65,"graphAtMs":1300,"faceTarget":true,"graphId":1082130438}` → `{"graphId":1082130438,"name":"KV_smash","skillId":1191182342}`
91. `scene_add_creature_skill` `{"name":"KV_sweep","creature":30005002,"animation":"近战攻击_01","animationPortion":0.37,"graphAtMs":1300,"faceTarget":true,"graphId":1082130438}` → `{"graphId":1082130438,"name":"KV_sweep","skillId":1191182343}`
92. `scene_set_creature_logic` `{"prefab":"KV_vagrant","decisionGraphId":1082130439}`
93. `scene_set_creature_logic` `{"prefab":"KV_farmer","skills":[{"skill":"KV_dig","cooldownSeconds":[0.5,1.5]}],"decisionGraphId":1082130440}`
94. `scene_set_creature_logic` `{"prefab":"KV_builder","skills":[{"skill":"KV_hammer","cooldownSeconds":[0.2,0.5]}],"decisionGraphId":1082130441}`
95. `scene_set_creature_logic` `{"prefab":"KV_thrower","skills":[{"skill":"KV_throw","cooldownSeconds":[0.4,0.9]}],"logic":{"noticeRadius":13,"leaveCombatDistance":20},"decisionGraphId":1082130442}`
96. `scene_set_creature_logic` `{"prefab":"KV_soldier","skills":[{"skill":"KV_slash","cooldownSeconds":[0.5,1]}],"logic":{"noticeRadius":8,"leaveCombatDistance":14},"decisionGraphId":1082130443}`
97. `scene_set_creature_logic` `{"prefab":"KV_greed","skills":[{"skill":"KV_punch","cooldownSeconds":[1,2]}],"logic":{"noticeRadius":4,"leaveCombatDistance":12,"territoryRadius":100},"decisionGraphId":1082130444}`
98. `scene_set_creature_logic` `{"prefab":"KV_brute","skills":[{"skill":"KV_smash","cooldownSeconds":[1.5,2.5]},{"skill":"KV_sweep","cooldownSeconds":[2.5,3.5]}],"logic":{"noticeRadius":4,"leaveCombatDistance":12,"territoryRadius":100},"decisionGraphId":1082130444}`
99. `scene_add_components` `{"entity":"关卡实体","variables":[{"name":"dark","type":"integer","value":0},{"name":"mend","type":"integer","value":0}]}`
100. `scene_add_components` `{"prefab":"KV_coin","solid":false,"follow":"chase","collisionTriggers":[{"areas":[{"radius":5}],"targets":["character"]},{"areas":[{"size":[1.6,2,1.6]}],"targets":["character"]}]}`
101. `scene_add_components` `{"prefab":"KV_tag_keep","solid":false}`
102. `scene_add_components` `{"prefab":"KV_tag_site","solid":false}`
103. `scene_add_components` `{"prefab":"KV_tag","solid":false}`
104. `scene_add_components` `{"prefab":"KV_crown","solid":false,"follow":"attach"}`
105. `scene_add_components` `{"prefab":"KV_keep","optionTab":{"areas":[{"size":[5,5,14]}],"options":[{"text":"升级主堡 5金币 · 每早多2金币","icon":20},{"text":"再升主堡 8金币 · 每早多2金币","icon":20,"active":false}]},"variables":[{"name":"lit","type":"boolean","value":false}]}`
106. `scene_add_components` `{"prefab":"KV_camp","optionTab":{"areas":[{"size":[5,6,30]}],"options":[{"text":"招募村民 1金币","icon":1}]},"variables":[{"name":"lit","type":"boolean","value":false}]}`
107. `scene_add_components` `{"prefab":"KV_farm","optionTab":{"areas":[{"size":[5,5,16]}],"options":[{"text":"农夫 2金币 · 每早多2金币","icon":5}]},"variables":[{"name":"lit","type":"boolean","value":false}]}`
108. `scene_add_components` `{"prefab":"KV_smith","optionTab":{"areas":[{"size":[4,5,16]}],"options":[{"text":"工匠 3金币 · 筑墙修墙","icon":3}]},"variables":[{"name":"lit","type":"boolean","value":false}]}`
109. `scene_add_components` `{"prefab":"KV_site","optionTab":{"areas":[{"size":[4,5,14]}],"options":[{"text":"筑木墙 3金币","icon":15},{"text":"升石墙 6金币 · 要主堡1级","icon":15,"active":false}]},"variables":[{"name":"lit","type":"boolean","value":false},{"name":"level","type":"integer","value":0}]}`
110. `scene_add_components` `{"prefab":"KV_range","optionTab":{"areas":[{"size":[4,5,14]}],"options":[{"text":"飞刀手 2金币 · 夜里在墙后掷刀","icon":10}]},"variables":[{"name":"lit","type":"boolean","value":false}]}`
111. `scene_add_components` `{"prefab":"KV_barracks","optionTab":{"areas":[{"size":[4,5,14]}],"options":[{"text":"士兵 3金币 · 夜里在墙前迎敌","icon":12}]},"variables":[{"name":"lit","type":"boolean","value":false}]}`
112. `scene_add_components` `{"prefab":"KV_wall_wood","solid":false,"variables":[{"name":"kind","type":"integer","value":8}],"hurtBox":{"areas":[{"size":[4,1.1,1.6],"offset":[0,0.55,0]}]}}`
113. `scene_add_components` `{"prefab":"KV_wall_stone","solid":false,"variables":[{"name":"kind","type":"integer","value":9}],"hurtBox":{"areas":[{"size":[4.5,1.8,1.8],"offset":[0,0.9,0]}]}}`
114. `scene_add_components` `{"prefab":"KV_knife","solid":false,"projectile":{"type":"tracking","velocity":[0,0,16],"turnDegreesPerSecond":720},"hitDetection":{"areas":[{"radius":0.5}],"trigger":"oncePerEntity","delaySeconds":0.05,"abilityUnit":"KV_pierce","layers":["hurtBox"],"factions":"hostile","continuous":{"speedAbove":5,"radius":0.5}},"abilityUnits":[{"name":"KV_pierce","attack":{"coefficient":0,"added":80}}]}`
115. `scene_add_components` `{"prefab":"KV_vagrant","variables":[{"name":"kind","type":"integer","value":1},{"name":"hx","type":"float","value":0},{"name":"hz","type":"float","value":0},{"name":"wx","type":"float","value":0},{"name":"wz","type":"float","value":0}]}`
116. `scene_add_components` `{"prefab":"KV_farmer","variables":[{"name":"kind","type":"integer","value":2},{"name":"hx","type":"float","value":0},{"name":"hz","type":"float","value":0},{"name":"wx","type":"float","value":0},{"name":"wz","type":"float","value":0}]}`
117. `scene_add_components` `{"prefab":"KV_builder","variables":[{"name":"kind","type":"integer","value":3},{"name":"hx","type":"float","value":0},{"name":"hz","type":"float","value":0},{"name":"wx","type":"float","value":0},{"name":"wz","type":"float","value":0}]}`
118. `scene_add_components` `{"prefab":"KV_thrower","variables":[{"name":"kind","type":"integer","value":4},{"name":"hx","type":"float","value":0},{"name":"hz","type":"float","value":0},{"name":"wx","type":"float","value":0},{"name":"wz","type":"float","value":0}]}`
119. `scene_add_components` `{"prefab":"KV_soldier","variables":[{"name":"kind","type":"integer","value":5},{"name":"hx","type":"float","value":0},{"name":"hz","type":"float","value":0},{"name":"wx","type":"float","value":0},{"name":"wz","type":"float","value":0}]}`
120. `scene_add_components` `{"prefab":"KV_greed","variables":[{"name":"kind","type":"integer","value":6},{"name":"dmg","type":"integer","value":1},{"name":"sated","type":"integer","value":0},{"name":"grabbing","type":"integer","value":0},{"name":"siege","type":"integer","value":0},{"name":"near","type":"float","value":2.4},{"name":"stand","type":"float","value":2.8},{"name":"hack","type":"integer","value":1},{"name":"lane","type":"float","value":0}]}`
121. `scene_add_components` `{"prefab":"KV_brute","variables":[{"name":"kind","type":"integer","value":7},{"name":"dmg","type":"integer","value":2},{"name":"sated","type":"integer","value":0},{"name":"grabbing","type":"integer","value":0},{"name":"siege","type":"integer","value":0},{"name":"near","type":"float","value":3.6},{"name":"stand","type":"float","value":3.6},{"name":"hack","type":"integer","value":2},{"name":"lane","type":"float","value":0}]}`
122. `scene_add_components` `{"prefab":"player","variables":[{"name":"coins","type":"integer","value":0},{"name":"citizens","type":"integer","value":0},{"name":"farmers","type":"integer","value":0},{"name":"builders","type":"integer","value":0},{"name":"throwers","type":"integer","value":0},{"name":"soldiers","type":"integer","value":0},{"name":"keep","type":"integer","value":0},{"name":"night","type":"integer","value":0},{"name":"wall","type":"integer","value":0}]}`
123. `scene_add_global_timer` `{"name":"KG_clock","seconds":60,"holder":"stage"}` → `{"name":"KG_clock"}`
124. `scene_add_timer_display` `{"name":"KG_clock","timer":"KG_clock","position":[0,380]}` → `{"name":"KG_clock","controlId":1073741847}`
125. `scene_add_progress_bar` `{"name":"KG_purse","variable":"coins","max":10,"position":[-300,384],"size":[260,34]}` → `{"name":"KG_purse","controlId":1073741850}`
126. `scene_add_progress_bar` `{"name":"KG_wall","variable":"wall","max":100,"position":[-300,348],"size":[260,22]}` → `{"name":"KG_wall","controlId":1073741853}`
127. `scene_add_progress_bar` `{"name":"KG_nights","variable":"night","max":5,"position":[300,384],"size":[260,34]}` → `{"name":"KG_nights","controlId":1073741856}`
128. `scene_list_prefabs` `{}`
129. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, … 共 37 张]}`：对每张图依次编译并写进存档，返回全部写好、可以试玩的存档。
130. `playtest_start` `{"graphNames":["_GSTS_KgStage","_GSTS_KgCamp","_GSTS_KgFarm","_GSTS_KgSite","_GSTS_KgRange","_GSTS_KgUnit","_GSTS_KgKnife","_GSTS_KgWall","_GSTS_KgGreed","_GSTS_KgPlayer"],"durationSeconds":540,"screenshotsAt":[20,50,66,72,78,84,90,96,102,125,155,171,177,183,189,195,201,207,230,260,276,282,288,294,300,306,312,335,365,381,387,393,399,405,411,417,440,470,486,492,498,504,510,516,522,528,533],"inputs":[{"at":5,"key":"d","holdMs":600},{"at":7,"key":"f"},{"at":8.5,"key":"f"},{"at":10,"key":"d","holdMs":950},{"at":12,"key":"f"},{"at":14,"key":"d","holdMs":800},{"at":16,"key":"f"},{"at":18,"key":"d","holdMs":1650},{"at":21,"key":"f"},{"at":23,"key":"d","holdMs":600},{"at":107,"key":"a","holdMs":4700},{"at":114,"key":"d","holdMs":700},{"at":116,"key":"f"},{"at":117.5,"key":"d","holdMs":2550},{"at":121.5,"key":"f"},{"at":123,"key":"d","holdMs":1450},{"at":212,"key":"a","holdMs":4700},{"at":219,"key":"d","holdMs":700},{"at":221,"key":"f"},{"at":222.5,"key":"d","holdMs":1720},{"at":225.5,"key":"f"},{"at":227,"key":"a","holdMs":1720},{"at":230,"key":"f"},{"at":231.5,"key":"a","holdMs":2400},{"at":235.5,"key":"f"},{"at":237,"key":"d","holdMs":4900},{"at":243,"key":"d","holdMs":1500},{"at":317,"key":"a","holdMs":4700},{"at":323,"key":"a","holdMs":1700},{"at":326.5,"key":"d","holdMs":1500},{"at":329.5,"key":"f"},{"at":331,"key":"d","holdMs":1000},{"at":333.5,"key":"f"},{"at":335,"key":"d","holdMs":2550},{"at":339,"key":"f"},{"at":340.5,"key":"d","holdMs":1450},{"at":422,"key":"a","holdMs":4700},{"at":428,"key":"a","holdMs":1700},{"at":431.5,"key":"d","holdMs":2500},{"at":435,"key":"f"},{"at":436.5,"key":"d","holdMs":1620},{"at":439,"key":"f"},{"at":440.5,"key":"d","holdMs":1680},{"at":443.5,"key":"f"},{"at":445,"key":"d","holdMs":600}],"readTextAt":[],"recordAudio":true,"bakeNavigation":true}`

## 二、各张节点图的源码

一共 37 张，合计 2215 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。

### _GSTS_KgStage（605 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { EntityType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v6, graph "stage": see examples/kingdom6/gen_kingdom6.py.
g.server({id:1073741825,name:'_GSTS_KgStage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'KG_SETUP',false,[2]);
  f.printString('KG_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0];
  const stage=evt.eventSourceEntity;
  if(evt.timerName==='KG_SETUP'){
    f.createPrefab(1077936284,[-16,0,4.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936279,[-16.23,3.4,4.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936279,[-15.78,3.4,4.6],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936280,[-9,0,3.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936277,[-9.9,3.4,3.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936277,[-9.45,3.4,3.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936277,[-9.0,3.4,3.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936277,[-8.55,3.4,3.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936277,[-8.1,3.4,3.6],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936281,[-4,0,7.2],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936279,[-4.0,3.4,7.2],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936282,[1,0,5.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936279,[0.55,3.4,5.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936279,[1.0,3.4,5.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936279,[1.45,3.4,5.6],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936283,[4.6,0,5.0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936279,[4.38,3.4,5.0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936279,[4.82,3.4,5.0],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936287,[8.8,0,5.2],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936279,[8.35,3.4,5.2],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936279,[8.8,3.4,5.2],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936279,[9.25,3.4,5.2],[0,0,0],stage,false,1,[] as bigint[]);
    f.createPrefab(1077936285,[13,0,4.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936278,[12.55,3.4,4.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936278,[13.0,3.4,4.6],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936278,[13.45,3.4,4.6],[0,0,0],stage,false,1,[] as bigint[]);
    // The first coins lie on the way to the camp: picking them up is the first thing the game teaches.
    f.createPrefab(1077936276,[-5.8,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936276,[-5.1,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936276,[-4.4,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936276,[-3.7,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936276,[-3.0,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936276,[-2.3,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936276,[-1.6,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936276,[-0.9,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936276,[-0.2,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936276,[0.5,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);
    // The crown is a star that follows the monarch above the head.
    for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(player)){
      const crown=f.createPrefab(1077936286,[-7,2.6,0],[0,0,0],stage,false,1,[] as bigint[]);
      f.switchFollowMotionDeviceTargetByEntity(crown,hero,'',[0,2.3,0],[0,0,0],FollowCoordinateSystem.WorldCoordinateSystem,FollowLocationType.FollowLocation);
      f.activateDisableFollowMotionDevice(crown,true);
    }
    f.modifyPlayerBackgroundMusic(player,10006n,0,86,60n,true,0,1,true);
    f.startTimer(stage,'KG_TO_WARN',false,[52]);
    f.startTimer(stage,'KG_TO_DUSK',false,[60]);
    f.startGlobalTimer(stage,'KG_clock');
    f.printString('KG_DAY');
    return;
  }
  if(evt.timerName==='KG_TO_WARN'){
    // The horn: every decision graph reads "dark" and its creature runs to its place for the night.
    f.setCustomVariable(stage,'dark',1n,true);
    f.playerPlaysOneShot2dSoundEffect(player,51063n,100n,1);
    f.sendSignal('KG_warn');
    f.printString('KG_WARN');
    return;
  }
  if(evt.timerName==='KG_TO_DUSK'){
    const night=f.getCustomVariable(player,'night').asType('int')+1n;
    f.setCustomVariable(player,'night',night,true);
    f.modifyEnvironmentSettings(1186988034n,players,false,0n);
    f.modifyPlayerBackgroundMusic(player,10162n,0,134,70n,true,0,1,true);f.playerPlaysOneShot2dSoundEffect(player,10071n,100n,1);
    f.sendSignal('KG_dusk');
    if(night===1n)f.startTimer(stage,'KG_WAVE',false,[5.4,20.2]);
    if(night===2n)f.startTimer(stage,'KG_WAVE',false,[4.5,15.7,27.0]);
    if(night===3n)f.startTimer(stage,'KG_WAVE',false,[4.5,15.7,27.0]);
    if(night===4n)f.startTimer(stage,'KG_WAVE',false,[3.6,12.6,21.6,30.6]);
    if(night===5n)f.startTimer(stage,'KG_WAVE',false,[3.6,12.6,21.6,30.6]);
    f.startTimer(stage,'KG_TO_DAWN',false,[45]);
    f.startGlobalTimer(stage,'KG_clock');
    f.modifyGlobalTimer(stage,'KG_clock',-15);
    f.printString('KG_DUSK');f.printString(f.dataTypeConversion(night,'str'));
    return;
  }
  if(evt.timerName==='KG_WAVE'){
    const tonight=f.getCustomVariable(player,'night').asType('int');
    f.playerPlaysOneShot2dSoundEffect(player,20176n,80n,1);
    if(tonight===1n&&evt.timerSequenceId===0n){f.setCustomVariable(f.createPrefab(1082130440,[30.0,0.4,-1.05],[0,-90,0],stage,false,1,[] as bigint[]),'stand',2.8,true);}
    if(tonight===1n&&evt.timerSequenceId===1n){f.setCustomVariable(f.createPrefab(1082130440,[30.0,0.4,-0.15],[0,-90,0],stage,false,1,[] as bigint[]),'stand',3.5,true);}
    if(tonight===2n&&evt.timerSequenceId===0n){f.setCustomVariable(f.createPrefab(1082130440,[30.0,0.4,-1.05],[0,-90,0],stage,false,1,[] as bigint[]),'stand',2.8,true);f.setCustomVariable(f.createPrefab(1082130440,[31.1,0.4,-0.15],[0,-90,0],stage,false,1,[] as bigint[]),'stand',2.8,true);}
    if(tonight===2n&&evt.timerSequenceId===1n){f.setCustomVariable(f.createPrefab(1082130440,[30.0,0.4,-0.15],[0,-90,0],stage,false,1,[] as bigint[]),'stand',3.5,true);}
    if(tonight===2n&&evt.timerSequenceId===2n){f.setCustomVariable(f.createPrefab(1082130440,[30.0,0.4,0.75],[0,-90,0],stage,false,1,[] as bigint[]),'stand',2.8,true);}
    if(tonight===3n&&evt.timerSequenceId===0n){f.setCustomVariable(f.createPrefab(1082130440,[30.0,0.4,-1.05],[0,-90,0],stage,false,1,[] as bigint[]),'stand',2.8,true);f.setCustomVariable(f.createPrefab(1082130440,[31.1,0.4,-0.15],[0,-90,0],stage,false,1,[] as bigint[]),'stand',2.8,true);}
    if(tonight===3n&&evt.timerSequenceId===1n){f.setCustomVariable(f.createPrefab(1082130440,[30.0,0.4,-0.15],[0,-90,0],stage,false,1,[] as bigint[]),'stand',3.5,true);f.setCustomVariable(f.createPrefab(1082130440,[31.1,0.4,0.75],[0,-90,0],stage,false,1,[] as bigint[]),'stand',3.5,true);}
    if(tonight===3n&&evt.timerSequenceId===2n){f.setCustomVariable(f.createPrefab(1082130440,[30.0,0.4,0.75],[0,-90,0],stage,false,1,[] as bigint[]),'stand',2.8,true);f.setCustomVariable(f.createPrefab(1082130441,[31.1,0.4,1.65],[0,-90,0],stage,false,1,[] as bigint[]),'stand',3.6,true);}
    if(tonight===4n&&evt.timerSequenceId===0n){f.setCustomVariable(f.createPrefab(1082130440,[30.0,0.4,-1.05],[0,-90,0],stage,false,1,[] as bigint[]),'stand',2.8,true);f.setCustomVariable(f.createPrefab(1082130440,[31.1,0.4,-0.15],[0,-90,0],stage,false,1,[] as bigint[]),'stand',2.8,true);}
    if(tonight===4n&&evt.timerSequenceId===1n){f.setCustomVariable(f.createPrefab(1082130440,[30.0,0.4,-0.15],[0,-90,0],stage,false,1,[] as bigint[]),'stand',3.5,true);f.setCustomVariable(f.createPrefab(1082130440,[31.1,0.4,0.75],[0,-90,0],stage,false,1,[] as bigint[]),'stand',3.5,true);f.setCustomVariable(f.createPrefab(1082130441,[32.2,0.4,1.65],[0,-90,0],stage,false,1,[] as bigint[]),'stand',4.3,true);}
    if(tonight===4n&&evt.timerSequenceId===2n){f.setCustomVariable(f.createPrefab(1082130440,[30.0,0.4,0.75],[0,-90,0],stage,false,1,[] as bigint[]),'stand',2.8,true);f.setCustomVariable(f.createPrefab(1082130440,[31.1,0.4,1.65],[0,-90,0],stage,false,1,[] as bigint[]),'stand',2.8,true);}
    if(tonight===4n&&evt.timerSequenceId===3n){f.setCustomVariable(f.createPrefab(1082130440,[30.0,0.4,1.65],[0,-90,0],stage,false,1,[] as bigint[]),'stand',3.5,true);f.setCustomVariable(f.createPrefab(1082130440,[31.1,0.4,-1.05],[0,-90,0],stage,false,1,[] as bigint[]),'stand',3.5,true);}
    if(tonight===5n&&evt.timerSequenceId===0n){f.setCustomVariable(f.createPrefab(1082130440,[30.0,0.4,-1.05],[0,-90,0],stage,false,1,[] as bigint[]),'stand',2.8,true);f.setCustomVariable(f.createPrefab(1082130440,[31.1,0.4,-0.15],[0,-90,0],stage,false,1,[] as bigint[]),'stand',2.8,true);f.setCustomVariable(f.createPrefab(1082130440,[32.2,0.4,0.75],[0,-90,0],stage,false,1,[] as bigint[]),'stand',2.8,true);}
    if(tonight===5n&&evt.timerSequenceId===1n){f.setCustomVariable(f.createPrefab(1082130440,[30.0,0.4,-0.15],[0,-90,0],stage,false,1,[] as bigint[]),'stand',3.5,true);f.setCustomVariable(f.createPrefab(1082130440,[31.1,0.4,0.75],[0,-90,0],stage,false,1,[] as bigint[]),'stand',3.5,true);f.setCustomVariable(f.createPrefab(1082130441,[32.2,0.4,1.65],[0,-90,0],stage,false,1,[] as bigint[]),'stand',4.3,true);}
    if(tonight===5n&&evt.timerSequenceId===2n){f.setCustomVariable(f.createPrefab(1082130440,[30.0,0.4,0.75],[0,-90,0],stage,false,1,[] as bigint[]),'stand',2.8,true);f.setCustomVariable(f.createPrefab(1082130440,[31.1,0.4,1.65],[0,-90,0],stage,false,1,[] as bigint[]),'stand',2.8,true);f.setCustomVariable(f.createPrefab(1082130440,[32.2,0.4,-1.05],[0,-90,0],stage,false,1,[] as bigint[]),'stand',2.8,true);f.setCustomVariable(f.createPrefab(1082130441,[33.3,0.4,-0.15],[0,-90,0],stage,false,1,[] as bigint[]),'stand',3.6,true);}
    if(tonight===5n&&evt.timerSequenceId===3n){f.setCustomVariable(f.createPrefab(1082130440,[30.0,0.4,1.65],[0,-90,0],stage,false,1,[] as bigint[]),'stand',3.5,true);f.setCustomVariable(f.createPrefab(1082130440,[31.1,0.4,-1.05],[0,-90,0],stage,false,1,[] as bigint[]),'stand',3.5,true);}
    f.printString('KG_GREED');
    return;
  }
  if(evt.timerName==='KG_TO_DAWN'){
    f.stopTimer(stage,'KG_WAVE');
    f.setCustomVariable(stage,'dark',0n,true);
    f.modifyEnvironmentSettings(1186988035n,players,false,0n);
    f.sendSignal('KG_dawn');
    f.printString('KG_DAWN');
    if(f.getCustomVariable(player,'night').asType('int')>=5n){
      // The last night is over: fireworks over the keep, then the level is won.
      f.modifyPlayerBackgroundMusic(player,10152n,0,111,80n,true,0,1,true);f.playerPlaysOneShot2dSoundEffect(player,50921n,100n,1);
      for(const hall of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936280)){f.playTimedEffects(10001116,hall,'GI_RootNode',true,false,[0,3,0],[0,0,0],1,true);}
      f.startTimer(stage,'KG_WIN',false,[4]);
      return;
    }
    f.modifyPlayerBackgroundMusic(player,10006n,0,86,60n,true,0,1,true);f.playerPlaysOneShot2dSoundEffect(player,20024n,100n,1);
    const keep=f.getCustomVariable(player,'keep').asType('int'),farmers=f.getCustomVariable(player,'farmers').asType('int');
    f.printString('KG_INCOME');f.printString(f.dataTypeConversion(6n+keep*2n+farmers*2n,'str'));
    f.createPrefab(1077936276,[-10.5,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936276,[-9.7,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936276,[-8.9,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936276,[-8.1,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936276,[-7.3,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936276,[-6.5,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);
    if(keep>=1n){f.createPrefab(1077936276,[-5.7,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936276,[-4.9,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);}
    if(keep>=2n){f.createPrefab(1077936276,[-4.1,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936276,[-3.3,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);}
    if(farmers>=1n){f.createPrefab(1077936276,[-17.6,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936276,[-17.0,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);}
    if(farmers>=2n){f.createPrefab(1077936276,[-16.4,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936276,[-15.8,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);}
    if(farmers>=3n){f.createPrefab(1077936276,[-15.2,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936276,[-14.6,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);}
    if(farmers>=4n){f.createPrefab(1077936276,[-14.0,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);f.createPrefab(1077936276,[-13.4,0.8,0],[0,0,0],stage,false,1,[] as bigint[]);}
    f.startTimer(stage,'KG_TO_WARN',false,[52]);
    f.startTimer(stage,'KG_TO_DUSK',false,[60]);
    f.startGlobalTimer(stage,'KG_clock');
    return;
  }
  if(evt.timerName==='KG_WIN'){
    f.printString('KG_VICTORY');
    f.setPlayerSettlementSuccessStatus(player,SettlementStatus.Victory);
    f.settleStage();
  }
})
.onSignal('KG_mend',(evt,f)=>{
  // A wall is damaged and there is a builder: the builder's decision graph reads this.
  f.setCustomVariable(f.getSelfEntity(),'mend',1n,true);
  f.printString('KG_MEND');
})
.onSignal('KG_mended',(evt,f)=>{
  f.setCustomVariable(f.getSelfEntity(),'mend',0n,true);
  f.printString('KG_MENDED');
})
.on('whenEntityIsDestroyed',(evt,f)=>{
  // Somebody ran out of health. The entity is gone: what it was is read from the copy of its variables the event
  // carries. (An entity taken away with removeEntity does not come here.)
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0],stage=f.getSelfEntity();
  const kind=f.queryCustomVariableSnapshot(evt.customVariableComponentSnapshot,'kind').asType('int');
  if(kind===6n||kind===7n){f.playerPlaysOneShot2dSoundEffect(player,30004n,80n,1);f.printString('KG_KILL');return;}
  if(kind===5n){
    f.playerPlaysOneShot2dSoundEffect(player,50936n,100n,1);
    f.printString('KG_DOWN');f.printString('soldier');
    f.setCustomVariable(player,'soldiers',f.getCustomVariable(player,'soldiers').asType('int')-1n,true);
    f.sendSignal('KG_state');
    return;
  }
  if(kind===4n){
    f.playerPlaysOneShot2dSoundEffect(player,50936n,100n,1);
    f.printString('KG_DOWN');f.printString('thrower');
    f.setCustomVariable(player,'throwers',f.getCustomVariable(player,'throwers').asType('int')-1n,true);
    f.sendSignal('KG_state');
    return;
  }
  if(kind===2n){
    f.playerPlaysOneShot2dSoundEffect(player,50936n,100n,1);
    f.printString('KG_DOWN');f.printString('farmer');
    f.setCustomVariable(player,'farmers',f.getCustomVariable(player,'farmers').asType('int')-1n,true);
    f.sendSignal('KG_state');
    return;
  }
  if(kind===1n){
    f.playerPlaysOneShot2dSoundEffect(player,50936n,100n,1);
    f.printString('KG_DOWN');f.printString('citizen');
    f.setCustomVariable(player,'citizens',f.getCustomVariable(player,'citizens').asType('int')-1n,true);
    f.sendSignal('KG_state');
    return;
  }
  if(kind===3n){
    f.playerPlaysOneShot2dSoundEffect(player,50936n,100n,1);
    f.printString('KG_DOWN');f.printString('builder');
    f.setCustomVariable(stage,'mend',0n,true);
    f.setCustomVariable(player,'builders',f.getCustomVariable(player,'builders').asType('int')-1n,true);
    f.sendSignal('KG_state');
    return;
  }
  if(kind!==8n&&kind!==9n)return;
  // The wall is down: the site offers a new one, the builder has nothing to mend, the Greed look for the monarch.
  f.setCustomVariable(player,'wall',0n,true);
  f.setCustomVariable(stage,'mend',0n,true);
  f.playerPlaysOneShot2dSoundEffect(player,50146n,100n,1);
  for(const site of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936285)){f.playTimedEffects(10001031,site,'GI_RootNode',true,false,[3,0,-4.3],[0,0,0],1,true);}
  f.sendSignal('KG_wall_down');
  f.printString('KG_WALL_DOWN');
})
```

### _GSTS_KgCoin（27 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { EntityType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v6, graph "coin": see examples/kingdom6/gen_kingdom6.py.
g.server({id:1073741826,name:'_GSTS_KgCoin'})
.on('whenEnteringCollisionTrigger',(evt,f)=>{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.enteringEntity as any);
  if(evt.triggerId===1n){
    // A full purse takes nothing: the coin stays where it lies.
    if(f.getCustomVariable(player,'coins').asType('int')>=10n)return;
    // A character has no GUID: the device follows it through the GUID of its player.
    f.switchFollowMotionDeviceTargetByGuid(evt.triggerEntity,f.queryGuidByEntity(player),'',[0,1,0],[0,0,0],FollowCoordinateSystem.WorldCoordinateSystem,FollowLocationType.FollowLocation);
    f.activateDisableFollowMotionDevice(evt.triggerEntity,true);
    return;
  }
  const coins=f.getCustomVariable(player,'coins').asType('int');
  if(coins>=10n){f.activateDisableFollowMotionDevice(evt.triggerEntity,false);return;}
  f.playerPlaysOneShot2dSoundEffect(player,50927n,70n,1);f.playTimedEffects(10002057,evt.enteringEntity,'GI_RootNode',true,false,[0,0,0],[0,0,0],1,true);
  f.setCustomVariable(player,'coins',coins+1n,true);
  f.destroyEntity(evt.triggerEntity);
})
```

### _GSTS_KgCamp（116 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { EntityType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v6, graph "camp": see examples/kingdom6/gen_kingdom6.py.
g.server({id:1073741827,name:'_GSTS_KgCamp'})
.on('whenTabIsSelected',(evt,f)=>{
  const self=evt.eventSourceEntity;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const coins=f.getCustomVariable(player,'coins').asType('int');
  const citizens=f.getCustomVariable(player,'citizens').asType('int');
  if(f.getCustomVariable(player,'citizens').asType('int')+f.getCustomVariable(player,'farmers').asType('int')+f.getCustomVariable(player,'builders').asType('int')+f.getCustomVariable(player,'throwers').asType('int')+f.getCustomVariable(player,'soldiers').asType('int')>=9n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  if(coins<1n){f.printString('KG_POOR');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  f.setCustomVariable(player,'citizens',citizens+1n,true);
  const unit=f.createPrefab(1082130442,f.create3dVector(-4.8+Number(citizens)*0.9,0.4,2.6),[0,0,0],self,false,1,[] as bigint[]);
  f.modifyEntityFaction(unit,f.queryEntityFaction(player));f.playTimedEffects(21,unit,'GI_RootNode',true,false,[0,0,0],[0,0,0],1,true);f.setCustomVariable(unit,'hx',-8.2+Number(citizens)*0.7,true);f.setCustomVariable(unit,'hz',2.2,true);
  f.printString('KG_CITIZEN');
  f.playerPlaysOneShot2dSoundEffect(player,50917n,100n,1);f.playTimedEffects(7,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.setCustomVariable(player,'coins',coins-1n,true);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='KG_ASK')return;
  f.clearSpecialEffectsBasedOnSpecialEffectAssets(evt.eventSourceEntity,10004184);
})
.onSignal('KG_state',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0],self=f.getSelfEntity();
  const coins=f.getCustomVariable(player,'coins').asType('int'),on=f.getCustomVariable(self,'lit').asType('bool');
  if(f.getCustomVariable(player,'citizens').asType('int')+f.getCustomVariable(player,'farmers').asType('int')+f.getCustomVariable(player,'builders').asType('int')+f.getCustomVariable(player,'throwers').asType('int')+f.getCustomVariable(player,'soldiers').asType('int')>=9n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(coins<1n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(on)return;
  f.setCustomVariable(self,'lit',true,true);f.mountLoopingSpecialEffect(10001085,self,'GI_RootNode',true,true,[0,4,0],[0,0,0],1.5,false);
})
```

### _GSTS_KgFarm（132 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { EntityType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v6, graph "farm": see examples/kingdom6/gen_kingdom6.py.
g.server({id:1073741828,name:'_GSTS_KgFarm'})
.on('whenTabIsSelected',(evt,f)=>{
  const self=evt.eventSourceEntity;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const coins=f.getCustomVariable(player,'coins').asType('int');
  const citizens=f.getCustomVariable(player,'citizens').asType('int'),have=f.getCustomVariable(player,'farmers').asType('int');
  if(have>=4n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  if(citizens<1n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  if(coins<2n){f.printString('KG_POOR');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  f.setCustomVariable(player,'citizens',citizens-1n,true);
  const folk=f.getEntitiesWithSpecifiedPrefabOnTheField(1082130442);
  if(folk.length>0)f.removeEntity(folk[0]);
  f.setCustomVariable(player,'farmers',have+1n,true);
  const unit=f.createPrefab(1082130443,f.create3dVector(-17.4+Number(have)*0.9,0.4,2.4),[0,0,0],self,false,1,[] as bigint[]);
  f.modifyEntityFaction(unit,f.queryEntityFaction(player));f.playTimedEffects(21,unit,'GI_RootNode',true,false,[0,0,0],[0,0,0],1,true);f.setCustomVariable(unit,'hx',-12.4+Number(have)*0.7,true);f.setCustomVariable(unit,'hz',2.2,true);f.setCustomVariable(unit,'wx',-17.8+Number(have)*1.2,true);f.setCustomVariable(unit,'wz',6.2,true);
  f.printString('KG_FARMER');
  f.playerPlaysOneShot2dSoundEffect(player,50917n,100n,1);f.playTimedEffects(7,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.setCustomVariable(player,'coins',coins-2n,true);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='KG_ASK')return;
  f.clearSpecialEffectsBasedOnSpecialEffectAssets(evt.eventSourceEntity,10004184);
})
.onSignal('KG_state',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0],self=f.getSelfEntity();
  const coins=f.getCustomVariable(player,'coins').asType('int'),on=f.getCustomVariable(self,'lit').asType('bool');
  if(f.getCustomVariable(player,'citizens').asType('int')<1n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(f.getCustomVariable(player,'farmers').asType('int')>=4n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(coins<2n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(on)return;
  f.setCustomVariable(self,'lit',true,true);f.mountLoopingSpecialEffect(10001085,self,'GI_RootNode',true,true,[0,4,0],[0,0,0],1.5,false);
})
```

### _GSTS_KgSmith（132 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { EntityType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v6, graph "smith": see examples/kingdom6/gen_kingdom6.py.
g.server({id:1073741829,name:'_GSTS_KgSmith'})
.on('whenTabIsSelected',(evt,f)=>{
  const self=evt.eventSourceEntity;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const coins=f.getCustomVariable(player,'coins').asType('int');
  const citizens=f.getCustomVariable(player,'citizens').asType('int'),have=f.getCustomVariable(player,'builders').asType('int');
  if(have>=1n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  if(citizens<1n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  if(coins<3n){f.printString('KG_POOR');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  f.setCustomVariable(player,'citizens',citizens-1n,true);
  const folk=f.getEntitiesWithSpecifiedPrefabOnTheField(1082130442);
  if(folk.length>0)f.removeEntity(folk[0]);
  f.setCustomVariable(player,'builders',have+1n,true);
  const unit=f.createPrefab(1082130444,f.create3dVector(1.4+Number(have)*0.9,0.4,2.8),[0,0,0],self,false,1,[] as bigint[]);
  f.modifyEntityFaction(unit,f.queryEntityFaction(player));f.playTimedEffects(21,unit,'GI_RootNode',true,false,[0,0,0],[0,0,0],1,true);f.setCustomVariable(unit,'hx',-13.4+Number(have)*0,true);f.setCustomVariable(unit,'hz',2.2,true);f.setCustomVariable(unit,'wx',15.299999999999999+Number(have)*0,true);f.setCustomVariable(unit,'wz',1.6,true);
  f.printString('KG_BUILDER');
  f.playerPlaysOneShot2dSoundEffect(player,50917n,100n,1);f.playTimedEffects(7,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.setCustomVariable(player,'coins',coins-3n,true);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='KG_ASK')return;
  f.clearSpecialEffectsBasedOnSpecialEffectAssets(evt.eventSourceEntity,10004184);
})
.onSignal('KG_state',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0],self=f.getSelfEntity();
  const coins=f.getCustomVariable(player,'coins').asType('int'),on=f.getCustomVariable(self,'lit').asType('bool');
  if(f.getCustomVariable(player,'citizens').asType('int')<1n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(f.getCustomVariable(player,'builders').asType('int')>=1n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(coins<3n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(on)return;
  f.setCustomVariable(self,'lit',true,true);f.mountLoopingSpecialEffect(10001085,self,'GI_RootNode',true,true,[0,4,0],[0,0,0],1.5,false);
})
```

### _GSTS_KgSite（238 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { EntityType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v6, graph "site": see examples/kingdom6/gen_kingdom6.py.
g.server({id:1073741830,name:'_GSTS_KgSite'})
.on('whenTabIsSelected',(evt,f)=>{
  const self=evt.eventSourceEntity;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const coins=f.getCustomVariable(player,'coins').asType('int');
  const level=f.getCustomVariable(self,'level').asType('int');
  if(f.getCustomVariable(player,'builders').asType('int')<1n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  if(level===0n){
    if(coins<3n){f.printString('KG_POOR');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
    // The wall joins the monarch's side: creatures are hostile to players only, and an order to go for something that
    // is not an enemy moved nobody (seen in play).
    const wood=f.createPrefab(1077936288,[17.2,0,0.3],[0,90,0],self,false,1,[] as bigint[]);
    f.modifyEntityFaction(wood,f.queryEntityFaction(player));
    f.playTimedEffects(47,wood,'GI_RootNode',true,false,[0,0,0],[0,0,0],1,true);
    f.setCustomVariable(self,'level',1n,true);
    f.activateDisableTab(self,1n,false);f.activateDisableTab(self,2n,true);
    for(const old of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936278))f.removeEntity(old);f.createPrefab(1077936278,[11.88,3.4,4.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936278,[12.32,3.4,4.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936278,[12.78,3.4,4.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936278,[13.22,3.4,4.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936278,[13.68,3.4,4.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936278,[14.12,3.4,4.6],[0,0,0],self,false,1,[] as bigint[]);
    f.setCustomVariable(player,'wall',100n,true);
    f.printString('KG_WALL');f.printString('1');
    f.playerPlaysOneShot2dSoundEffect(player,50918n,100n,1);f.playTimedEffects(7,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.setCustomVariable(player,'coins',coins-3n,true);
    return;
  }
  if(level===1n){
    // Stone needs a keep of level 1. The wooden wall is taken away without falling: nobody is told it is down.
    if(f.getCustomVariable(player,'keep').asType('int')<1n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
    if(coins<6n){f.printString('KG_POOR');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
    for(const piece of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936288))f.removeEntity(piece);
    const stone=f.createPrefab(1077936289,[17.2,0,0.3],[0,90,0],self,false,1,[] as bigint[]);
    f.modifyEntityFaction(stone,f.queryEntityFaction(player));
    f.playTimedEffects(47,stone,'GI_RootNode',true,false,[0,0,0],[0,0,0],1,true);
    f.setCustomVariable(self,'level',2n,true);
    f.activateDisableTab(self,2n,false);
    for(const old of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936278))f.removeEntity(old);
    f.setCustomVariable(player,'wall',100n,true);
    f.sendSignal('KG_mended');
    f.printString('KG_WALL');f.printString('2');
    f.playerPlaysOneShot2dSoundEffect(player,50918n,100n,1);f.playTimedEffects(7,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.setCustomVariable(player,'coins',coins-6n,true);
    return;
  }
  if(level>=2n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
})
.onSignal('KG_wall_down',(evt,f)=>{
  const self=f.getSelfEntity();
  f.setCustomVariable(self,'level',0n,true);
  f.activateDisableTab(self,1n,true);f.activateDisableTab(self,2n,false);
  for(const old of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936278))f.removeEntity(old);f.createPrefab(1077936278,[12.55,3.4,4.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936278,[13.0,3.4,4.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936278,[13.45,3.4,4.6],[0,0,0],self,false,1,[] as bigint[]);
  f.sendSignal('KG_state');
})
.onSignal('KG_warn',(evt,f)=>{
  // The horn has sounded and there is no wall: the site flashes red.
  const self=f.getSelfEntity();
  if(f.getCustomVariable(self,'level').asType('int')!==0n)return;
  f.playTimedEffects(10004188,self,'GI_RootNode',true,false,[0,0.5,0],[0,0,0],1,true);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='KG_ASK')return;
  f.clearSpecialEffectsBasedOnSpecialEffectAssets(evt.eventSourceEntity,10004184);
})
.onSignal('KG_state',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0],self=f.getSelfEntity();
  const coins=f.getCustomVariable(player,'coins').asType('int'),on=f.getCustomVariable(self,'lit').asType('bool');
  if(f.getCustomVariable(player,'builders').asType('int')<1n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(f.getCustomVariable(self,'level').asType('int')===0n&&coins<3n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(f.getCustomVariable(self,'level').asType('int')===1n&&f.getCustomVariable(player,'keep').asType('int')<1n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(f.getCustomVariable(self,'level').asType('int')===1n&&coins<6n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(f.getCustomVariable(self,'level').asType('int')>=2n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(on)return;
  f.setCustomVariable(self,'lit',true,true);f.mountLoopingSpecialEffect(10001085,self,'GI_RootNode',true,true,[0,4,0],[0,0,0],1.5,false);
})
```

### _GSTS_KgKeep（153 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { EntityType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v6, graph "keep": see examples/kingdom6/gen_kingdom6.py.
g.server({id:1073741831,name:'_GSTS_KgKeep'})
.on('whenTabIsSelected',(evt,f)=>{
  const self=evt.eventSourceEntity;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const coins=f.getCustomVariable(player,'coins').asType('int');
  const level=f.getCustomVariable(player,'keep').asType('int');
  if(level>=2n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  if(level===0n&&coins<5n){f.printString('KG_POOR');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  if(level===1n&&coins<8n){f.printString('KG_POOR');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  f.setCustomVariable(player,'keep',level+1n,true);
  f.activateDisableTab(self,level+1n,false);
  if(level===0n)f.activateDisableTab(self,2n,true);
  f.printString('KG_KEEP');f.printString(f.dataTypeConversion(level+1n,'str'));
  f.playerPlaysOneShot2dSoundEffect(player,50935n,100n,1);f.playTimedEffects(7,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);
  if(level===0n){
    for(const old of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936277))f.removeEntity(old);f.createPrefab(1077936277,[-10.57,3.4,3.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936277,[-10.12,3.4,3.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936277,[-9.68,3.4,3.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936277,[-9.22,3.4,3.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936277,[-8.78,3.4,3.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936277,[-8.32,3.4,3.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936277,[-7.88,3.4,3.6],[0,0,0],self,false,1,[] as bigint[]);f.createPrefab(1077936277,[-7.42,3.4,3.6],[0,0,0],self,false,1,[] as bigint[]);
    f.setCustomVariable(player,'coins',coins-5n,true);
    return;
  }
  for(const old of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936277))f.removeEntity(old);
  f.setCustomVariable(player,'coins',coins-8n,true);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='KG_ASK')return;
  f.clearSpecialEffectsBasedOnSpecialEffectAssets(evt.eventSourceEntity,10004184);
})
.onSignal('KG_state',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0],self=f.getSelfEntity();
  const coins=f.getCustomVariable(player,'coins').asType('int'),on=f.getCustomVariable(self,'lit').asType('bool');
  if(f.getCustomVariable(player,'keep').asType('int')===0n&&coins<5n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(f.getCustomVariable(player,'keep').asType('int')===1n&&coins<8n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(f.getCustomVariable(player,'keep').asType('int')>=2n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(on)return;
  f.setCustomVariable(self,'lit',true,true);f.mountLoopingSpecialEffect(10001085,self,'GI_RootNode',true,true,[0,4,0],[0,0,0],1.5,false);
})
```

### _GSTS_KgRange（127 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { EntityType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v6, graph "range": see examples/kingdom6/gen_kingdom6.py.
g.server({id:1073741832,name:'_GSTS_KgRange'})
.on('whenTabIsSelected',(evt,f)=>{
  const self=evt.eventSourceEntity;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const coins=f.getCustomVariable(player,'coins').asType('int');
  const citizens=f.getCustomVariable(player,'citizens').asType('int'),have=f.getCustomVariable(player,'throwers').asType('int');
  if(have>=3n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  if(citizens<1n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  if(coins<2n){f.printString('KG_POOR');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  f.setCustomVariable(player,'citizens',citizens-1n,true);
  const folk=f.getEntitiesWithSpecifiedPrefabOnTheField(1082130442);
  if(folk.length>0)f.removeEntity(folk[0]);
  f.setCustomVariable(player,'throwers',have+1n,true);
  const unit=f.createPrefab(1082130445,f.create3dVector(5.199999999999999+Number(have)*0.9,0.4,2.6),[0,0,0],self,false,1,[] as bigint[]);
  f.modifyEntityFaction(unit,f.queryEntityFaction(player));f.playTimedEffects(21,unit,'GI_RootNode',true,false,[0,0,0],[0,0,0],1,true);f.setCustomVariable(unit,'wx',14.6+Number(have)*-1.3,true);f.setCustomVariable(unit,'wz',2.2,true);
  f.printString('KG_THROWER');
  f.playerPlaysOneShot2dSoundEffect(player,50917n,100n,1);f.playTimedEffects(7,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.setCustomVariable(player,'coins',coins-2n,true);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='KG_ASK')return;
  f.clearSpecialEffectsBasedOnSpecialEffectAssets(evt.eventSourceEntity,10004184);
})
.onSignal('KG_state',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0],self=f.getSelfEntity();
  const coins=f.getCustomVariable(player,'coins').asType('int'),on=f.getCustomVariable(self,'lit').asType('bool');
  if(f.getCustomVariable(player,'citizens').asType('int')<1n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(f.getCustomVariable(player,'throwers').asType('int')>=3n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(coins<2n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(on)return;
  f.setCustomVariable(self,'lit',true,true);f.mountLoopingSpecialEffect(10001085,self,'GI_RootNode',true,true,[0,4,0],[0,0,0],1.5,false);
})
```

### _GSTS_KgBarracks（127 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { EntityType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v6, graph "barracks": see examples/kingdom6/gen_kingdom6.py.
g.server({id:1073741833,name:'_GSTS_KgBarracks'})
.on('whenTabIsSelected',(evt,f)=>{
  const self=evt.eventSourceEntity;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const coins=f.getCustomVariable(player,'coins').asType('int');
  const citizens=f.getCustomVariable(player,'citizens').asType('int'),have=f.getCustomVariable(player,'soldiers').asType('int');
  if(have>=2n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  if(citizens<1n){f.printString('KG_NEED');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  if(coins<3n){f.printString('KG_POOR');f.playerPlaysOneShot2dSoundEffect(player,50933n,100n,1);f.playTimedEffects(10001041,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10004184);f.mountLoopingSpecialEffect(10004184,self,'GI_RootNode',true,true,[0,3.2,0],[0,0,0],1.5,false);f.startTimer(self,'KG_ASK',false,[1.5]);return;}
  f.setCustomVariable(player,'citizens',citizens-1n,true);
  const folk=f.getEntitiesWithSpecifiedPrefabOnTheField(1082130442);
  if(folk.length>0)f.removeEntity(folk[0]);
  f.setCustomVariable(player,'soldiers',have+1n,true);
  const unit=f.createPrefab(1082130446,f.create3dVector(8.4+Number(have)*0.9,0.4,2.8),[0,0,0],self,false,1,[] as bigint[]);
  f.modifyEntityFaction(unit,f.queryEntityFaction(player));f.playTimedEffects(21,unit,'GI_RootNode',true,false,[0,0,0],[0,0,0],1,true);f.setCustomVariable(unit,'wx',19.599999999999998+Number(have)*1.2,true);f.setCustomVariable(unit,'wz',1.4,true);
  f.printString('KG_SOLDIER');
  f.playerPlaysOneShot2dSoundEffect(player,50917n,100n,1);f.playTimedEffects(7,self,'GI_RootNode',true,false,[0,1.5,0],[0,0,0],1,true);f.setCustomVariable(player,'coins',coins-3n,true);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='KG_ASK')return;
  f.clearSpecialEffectsBasedOnSpecialEffectAssets(evt.eventSourceEntity,10004184);
})
.onSignal('KG_state',(evt,f)=>{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0],self=f.getSelfEntity();
  const coins=f.getCustomVariable(player,'coins').asType('int'),on=f.getCustomVariable(self,'lit').asType('bool');
  if(f.getCustomVariable(player,'citizens').asType('int')<1n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(f.getCustomVariable(player,'soldiers').asType('int')>=2n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(coins<3n){if(on){f.setCustomVariable(self,'lit',false,true);f.clearSpecialEffectsBasedOnSpecialEffectAssets(self,10001085);}return;}
  if(on)return;
  f.setCustomVariable(self,'lit',true,true);f.mountLoopingSpecialEffect(10001085,self,'GI_RootNode',true,true,[0,4,0],[0,0,0],1.5,false);
})
```

### _GSTS_KgUnit（126 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { EntityType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v6, graph "unit": see examples/kingdom6/gen_kingdom6.py.
g.server({id:1073741834,name:'_GSTS_KgUnit'})
.on('whenEntityIsCreated',(evt,f)=>{
  // A soldier carries its sword from the first moment: a looping effect that is a model, on the right hand.
  const self=evt.eventSourceEntity;
  if(f.getEntityListBySpecifiedPrefabId([self],1082130446).length===1)f.mountLoopingSpecialEffect(10002152,self,'GI_WeaponR',true,true,[0,0,0],[0,0,0],1.4,false);
})
.on('whenSkillNodeIsCalled',(evt,f)=>{
  // The creature's skill has come to the moment that counts (graphAtMs of the skill). Which unit this is, its prefab says.
  const self=f.getSelfEntity();
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0];
  if(f.getEntityListBySpecifiedPrefabId([self],1082130443).length===1){return;}
  if(f.getEntityListBySpecifiedPrefabId([self],1082130446).length===1)return;
  if(f.getEntityListBySpecifiedPrefabId([self],1082130444).length===1){
    for(const wall of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936288)){
    const state=f.getObjectAttribute(wall as any);
    if(state.currentHp>=state.maxHp)continue;
    f.playTimedEffects(141,wall,'GI_RootNode',true,false,[0,1,0],[0,0,0],1,true);f.playerPlaysOneShot2dSoundEffect(player,50425n,70n,1);
    f.recoverHpDirectly(self,wall,40,true,0,0,[] as string[]);
    const now=f.getObjectAttribute(wall as any).currentHp;
    f.printString('KG_WALL_HP');f.printString(f.dataTypeConversion(now,'str'));
    f.setCustomVariable(player,'wall',f.dataTypeConversion(now*100/state.maxHp,'int'),true);
    if(now>=state.maxHp)f.sendSignal('KG_mended');
  }
    for(const wall of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936289)){
    const state=f.getObjectAttribute(wall as any);
    if(state.currentHp>=state.maxHp)continue;
    f.playTimedEffects(141,wall,'GI_RootNode',true,false,[0,1,0],[0,0,0],1,true);f.playerPlaysOneShot2dSoundEffect(player,50425n,70n,1);
    f.recoverHpDirectly(self,wall,40,true,0,0,[] as string[]);
    const now=f.getObjectAttribute(wall as any).currentHp;
    f.printString('KG_WALL_HP');f.printString(f.dataTypeConversion(now,'str'));
    f.setCustomVariable(player,'wall',f.dataTypeConversion(now*100/state.maxHp,'int'),true);
    if(now>=state.maxHp)f.sendSignal('KG_mended');
  }
    return;
  }
  const target=f.getTheAggroTargetOfTheSpecifiedEntity(self);
  if(!f.queryIfEntityIsOnTheField(target))return;
  const here=f.split3dVector(f.getEntityLocationAndRotation(self).location),there=f.split3dVector(f.getEntityLocationAndRotation(target).location);
  const from=f.create3dVector(here.xComponent,here.yComponent+1.3,here.zComponent);
  const way=f.create3dVector(there.xComponent-here.xComponent,there.yComponent-here.yComponent-0.3,there.zComponent-here.zComponent);
  const knife=f.createProjectile(1077936290,from,f.directionVectorToRotation(way,[0,1,0]),self,target,false,1n,[] as bigint[]);
  f.modifyEntityFaction(knife,f.queryEntityFaction(self));
  f.playerPlaysOneShot2dSoundEffect(player,40026n,60n,1);
  f.printString('KG_THROW');
})
.on('whenAttackHits',(evt,f)=>{
  // The soldier's stroke took health off somebody.
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0];
  f.playerPlaysOneShot2dSoundEffect(player,40305n,70n,1);
  f.printString('KG_SLASH');f.printString(f.dataTypeConversion(evt.damage,'str'));
})
```

### _GSTS_KgKnife（21 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { EntityType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v6, graph "knife": see examples/kingdom6/gen_kingdom6.py.
g.server({id:1073741835,name:'_GSTS_KgKnife'})
.on('whenEntityIsCreated',(evt,f)=>{
  // What is seen flying: the knife (a looping effect that is a model) and its trail. A knife that meets nobody is gone
  // after three seconds.
  f.mountLoopingSpecialEffect(10006069,evt.eventSourceEntity,'GI_RootNode',true,true,[0,0,0],[0,0,0],1,false);
  f.mountLoopingSpecialEffect(10006071,evt.eventSourceEntity,'GI_RootNode',true,true,[0,0,0],[0,0,0],1,false);
  f.startTimer(evt.eventSourceEntity,'KG_GONE',false,[3]);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  f.removeEntity(evt.eventSourceEntity);
})
.on('whenOnHitDetectionIsTriggered',(evt,f)=>{
  // It touched an enemy's hurt box (its hit detection does not answer to friends): the ability unit named in the hit
  // detection has attacked it. The knife is gone a moment later (removed in this same moment, it did no damage).
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0];
  f.playTimedEffects(10006059,evt.onHitEntity,'GI_RootNode',true,false,[0,1,0],[0,0,0],1,true);
  f.playerPlaysOneShot2dSoundEffect(player,40203n,80n,1);
  f.printString('KG_KNIFE');
  f.startTimer(evt.eventSourceEntity,'KG_DONE',false,[0.3]);
})
```

### _GSTS_KgWall（39 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { EntityType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v6, graph "wall": see examples/kingdom6/gen_kingdom6.py.
g.server({id:1073741836,name:'_GSTS_KgWall'})
.on('whenAttacked',(evt,f)=>{
  // A blow landed: the bar on the screen follows the wall's health. (When it runs out the wall is destroyed, and the
  // stage's graph hears of that.)
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0],self=evt.eventSourceEntity;
  const state=f.getObjectAttribute(self as any);
  f.playerPlaysOneShot2dSoundEffect(player,50425n,90n,1);
  f.printString('KG_WALL_HP');f.printString(f.dataTypeConversion(state.currentHp,'str'));
  f.setCustomVariable(player,'wall',f.dataTypeConversion(state.currentHp*100/state.maxHp,'int'),true);
})
.onSignal('KG_dawn',(evt,f)=>{
  // A damaged wall asks for the builder, who walks over and hammers it whole.
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0];
  if(f.getCustomVariable(player,'builders').asType('int')<1n)return;
  const state=f.getObjectAttribute(f.getSelfEntity() as any);
  if(state.currentHp>=state.maxHp)return;
  f.sendSignal('KG_mend');
})
```

### _GSTS_KgGreed（205 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { EntityType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v6, graph "greed": see examples/kingdom6/gen_kingdom6.py.
g.server({id:1073741837,name:'_GSTS_KgGreed'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'KG_LOOK',true,[0.5]);
  // Its lane is where it appeared.
  f.setCustomVariable(evt.eventSourceEntity,'lane',f.split3dVector(f.getEntityLocationAndRotation(evt.eventSourceEntity).location).zComponent,true);
  f.playTimedEffects(33,evt.eventSourceEntity,'GI_RootNode',true,false,[0,0,0],[0,0,0],1,true);
  if(f.getEntityListBySpecifiedPrefabId([evt.eventSourceEntity],1082130440).length===1)f.mountLoopingSpecialEffect(10002151,evt.eventSourceEntity,'GI_WeaponR',true,true,[0,0,0],[0,0,0],0.55,false);
  if(f.getEntityListBySpecifiedPrefabId([evt.eventSourceEntity],1082130441).length===1)f.mountLoopingSpecialEffect(10002151,evt.eventSourceEntity,'GI_WeaponR',true,true,[0,0,0],[0,0,0],1.2,false);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  const self=evt.eventSourceEntity;
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0];
  if(evt.timerName==='KG_GONE'){f.removeEntity(self);return;}
  if(evt.timerName==='KG_LOST'){
    f.setPlayerSettlementSuccessStatus(player,SettlementStatus.Defeat);
    f.settleStage();
    return;
  }
  if(evt.timerName==='KG_GRAB'){
    // The grab ends: the crown is gone unless the monarch ran out of reach, or found a coin to throw meanwhile.
    f.setCustomVariable(self,'grabbing',0n,true);
    const hero=f.getAllCharacterEntitiesOfSpecifiedPlayer(player)[0];
    if(f.distanceBetweenTwoCoordinatePoints(f.getEntityLocationAndRotation(self).location,f.getEntityLocationAndRotation(hero).location)>5.5){f.printString('KG_ESCAPED');return;}
    const coins=f.getCustomVariable(player,'coins').asType('int');
    if(coins>0n){
      f.playerPlaysOneShot2dSoundEffect(player,50936n,100n,1);
      f.printString('KG_STOLEN');
      f.setCustomVariable(self,'sated',1n,true);
      f.startTimer(self,'KG_GONE',false,[7]);
      f.setCustomVariable(player,'coins',coins-1n,true);
      return;
    }
    f.printString('KG_CROWN_LOST');
    for(const crown of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936286))f.switchFollowMotionDeviceTargetByEntity(crown,self,'',[0,2.6,0],[0,0,0],FollowCoordinateSystem.WorldCoordinateSystem,FollowLocationType.FollowLocation);
    f.playerPlaysOneShot2dSoundEffect(player,50919n,100n,1);
    f.startTimer(self,'KG_LOST',false,[2]);
    return;
  }
  if(evt.timerName!=='KG_LOOK')return;
  if(f.getCustomVariable(self,'sated').asType('int')===1n)return;
  if(f.getEntitiesWithSpecifiedPrefabOnTheField(1077936288).length+f.getEntitiesWithSpecifiedPrefabOnTheField(1077936289).length<1){
    for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(player))f.setTheAggroValueOfSpecifiedEntity(hero,self,100000n);
    if(f.getCustomVariable(self,'siege').asType('int')===1n){f.setCustomVariable(self,'siege',0n,true);}
    return;
  }
  if(f.getCustomVariable(self,'siege').asType('int')===0n){f.setCustomVariable(self,'siege',1n,true);}
  if(f.split3dVector(f.getEntityLocationAndRotation(self).location).xComponent>23.7)return;
  for(const piece of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936288)){
    if(f.queryTheAggroValueOfTheSpecifiedEntity(piece,self)>1000n)continue;
    f.setTheAggroValueOfSpecifiedEntity(piece,self,100000n);
    f.printString('KG_AT_WALL');
  }
  for(const piece of f.getEntitiesWithSpecifiedPrefabOnTheField(1077936289)){
    if(f.queryTheAggroValueOfTheSpecifiedEntity(piece,self)>1000n)continue;
    f.setTheAggroValueOfSpecifiedEntity(piece,self,100000n);
    f.printString('KG_AT_WALL');
  }
})
.on('whenSkillNodeIsCalled',(evt,f)=>{
  // The blow lands (graphAtMs of the skill). What it does to walls and villagers is the hit box's business; here it is
  // only about the monarch, whom no blow hurts: a Greed takes coins, and from an empty purse the crown.
  const self=f.getSelfEntity();
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0];
  if(f.getCustomVariable(self,'sated').asType('int')===1n)return;
  const target=f.getTheAggroTargetOfTheSpecifiedEntity(self);
  if(!f.queryIfEntityIsOnTheField(target))return;
  if(f.getEntityListBySpecifiedType([target],EntityType.Character).length<1)return;
  if(f.distanceBetweenTwoCoordinatePoints(f.getEntityLocationAndRotation(self).location,f.getEntityLocationAndRotation(target).location)>4.5)return;
  const coins=f.getCustomVariable(player,'coins').asType('int'),dmg=f.getCustomVariable(self,'dmg').asType('int');
  if(coins>0n){
    // It takes what it can carry and runs off with it (its decision graph reads "sated").
    f.playTimedEffects(10001041,target,'GI_RootNode',true,false,[0,1,0],[0,0,0],1,true);f.playerPlaysOneShot2dSoundEffect(player,50936n,100n,1);
    f.printString('KG_STOLEN');
    f.setCustomVariable(self,'sated',1n,true);
    f.startTimer(self,'KG_GONE',false,[7]);
    if(coins<dmg){f.setCustomVariable(player,'coins',0n,true);return;}
    f.setCustomVariable(player,'coins',coins-dmg,true);
    return;
  }
  // An empty purse: it starts to grab the crown, which takes a few seconds. Running away breaks the grab.
  if(f.getCustomVariable(self,'grabbing').asType('int')===1n)return;
  f.setCustomVariable(self,'grabbing',1n,true);
  f.playTimedEffects(10001247,target,'GI_RootNode',true,false,[0,0,0],[0,0,0],1,true);f.playerPlaysOneShot2dSoundEffect(player,50937n,100n,1);
  f.startTimer(self,'KG_GRAB',false,[2.5]);
  f.printString('KG_GRAB');
})
.on('whenAttackHits',(evt,f)=>{
  // Its blow took health off the wall or off a villager.
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0];
  f.playerPlaysOneShot2dSoundEffect(player,40106n,70n,1);
  f.printString('KG_PUNCH');f.printString(f.dataTypeConversion(evt.damage,'str'));
})
.onSignal('KG_dawn',(evt,f)=>{
  // Morning: its decision graph makes it run back to the portal; a few seconds later it is gone.
  f.startTimer(f.getSelfEntity(),'KG_GONE',false,[7]);
})
```

### _GSTS_KgPlayer（10 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { EntityType, FollowCoordinateSystem, FollowLocationType, SettlementStatus } from 'genshin-ts/definitions/enum'

// Kingdom v6, graph "player": see examples/kingdom6/gen_kingdom6.py.
g.server({id:1073741838,name:'_GSTS_KgPlayer'})
.on('whenCustomVariableChanges',(evt,f)=>{
  if(evt.variableName!=='coins')return;
  f.printString('KG_COINS');
  f.printString(f.dataTypeConversion(evt.postChangeValue.asType('int'),'str'));
  f.sendSignal('KG_state');
})
```

### _GSTS_KgDig（2 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { AttackType, ElementalType, EntityType, HitType, TargetType, TriggerRestriction } from 'genshin-ts/definitions/enum'
import { AttackLayerConfig, HitLevel, KnockbackDirectionType, SectorDetectionDirection } from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "dig": see examples/kingdom6/gen_kingdom6.py.
g.creationSkill({id:1082130433,name:'_GSTS_KgDig',prefix:false}).on('start',(evt,f)=>{
  f.notifyServerNodeGraph('act','','');
})
```

### _GSTS_KgHammer（2 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { AttackType, ElementalType, EntityType, HitType, TargetType, TriggerRestriction } from 'genshin-ts/definitions/enum'
import { AttackLayerConfig, HitLevel, KnockbackDirectionType, SectorDetectionDirection } from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "hammer": see examples/kingdom6/gen_kingdom6.py.
g.creationSkill({id:1082130434,name:'_GSTS_KgHammer',prefix:false}).on('start',(evt,f)=>{
  // The builder's server graph hears this (whenSkillNodeIsCalled) and mends.
  f.notifyServerNodeGraph('act','','');
})
```

### _GSTS_KgThrow（2 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { AttackType, ElementalType, EntityType, HitType, TargetType, TriggerRestriction } from 'genshin-ts/definitions/enum'
import { AttackLayerConfig, HitLevel, KnockbackDirectionType, SectorDetectionDirection } from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "throw": see examples/kingdom6/gen_kingdom6.py.
g.creationSkill({id:1082130435,name:'_GSTS_KgThrow',prefix:false}).on('start',(evt,f)=>{
  // The thrower's server graph hears this and lets the knife fly.
  f.notifyServerNodeGraph('act','','');
})
```

### _GSTS_KgSlash（10 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { AttackType, ElementalType, EntityType, HitType, TargetType, TriggerRestriction } from 'genshin-ts/definitions/enum'
import { AttackLayerConfig, HitLevel, KnockbackDirectionType, SectorDetectionDirection } from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "slash": see examples/kingdom6/gen_kingdom6.py.
g.creationSkill({id:1082130436,name:'_GSTS_KgSlash',prefix:false}).on('start',(evt,f)=>{
  const self=f.getSelfEntity();
  f.triggerSectorHitboxAtSpecificLocation(TargetType.HostileFaction,f.getEntityLocation(self),f.getEntityRotation(self),0,40,[EntityType.Creation],
    TriggerRestriction.TriggerOnlyOncePerEntity,10006012,2,120,3,0,SectorDetectionDirection.FromInsideOut,AttackLayerConfig.OnlyOnHitHurtbox,[] as string[],
    ElementalType.None,0,HitType.Slash,AttackType.MeleeAttack,0,true,10006012,KnockbackDirectionType.LineConnectingAttackerAndHitPoint,false,
    [0,0,0],[0,0,0],1,[0,0,0],[0,0,0],1.5,1,1,HitLevel.LightHit,1000,1000);
  f.notifyServerNodeGraph('act','','');
  // The arc the blade draws: the effect made for this animation, where the creature stands, turned as it is.
  f.playTimedEffects(10016139,f.getEntityLocation(self),f.getEntityRotation(self),1,true);
})
```

### _GSTS_KgPunch（7 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { AttackType, ElementalType, EntityType, HitType, TargetType, TriggerRestriction } from 'genshin-ts/definitions/enum'
import { AttackLayerConfig, HitLevel, KnockbackDirectionType, SectorDetectionDirection } from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "punch": see examples/kingdom6/gen_kingdom6.py.
g.creationSkill({id:1082130437,name:'_GSTS_KgPunch',prefix:false}).on('start',(evt,f)=>{
  const self=f.getSelfEntity();
  f.triggerSectorHitboxAtSpecificLocation(TargetType.HostileFaction,f.getEntityLocation(self),f.getEntityRotation(self),0,25,[EntityType.Object,EntityType.Creation],
    TriggerRestriction.TriggerOnlyOncePerEntity,10006012,2,120,3,0,SectorDetectionDirection.FromInsideOut,AttackLayerConfig.OnlyOnHitHurtbox,[] as string[],
    ElementalType.None,0,HitType.Slash,AttackType.MeleeAttack,0,true,10006012,KnockbackDirectionType.LineConnectingAttackerAndHitPoint,false,
    [0,0,0],[0,0,0],1,[0,0,0],[0,0,0],1.5,1,1,HitLevel.LightHit,1000,1000);
  f.notifyServerNodeGraph('act','','');
})
```

### _GSTS_KgSmash（7 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { AttackType, ElementalType, EntityType, HitType, TargetType, TriggerRestriction } from 'genshin-ts/definitions/enum'
import { AttackLayerConfig, HitLevel, KnockbackDirectionType, SectorDetectionDirection } from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "smash": see examples/kingdom6/gen_kingdom6.py.
g.creationSkill({id:1082130438,name:'_GSTS_KgSmash',prefix:false}).on('start',(evt,f)=>{
  const self=f.getSelfEntity();
  f.triggerSectorHitboxAtSpecificLocation(TargetType.HostileFaction,f.getEntityLocation(self),f.getEntityRotation(self),0,45,[EntityType.Object,EntityType.Creation],
    TriggerRestriction.TriggerOnlyOncePerEntity,10006012,2,120,4,0,SectorDetectionDirection.FromInsideOut,AttackLayerConfig.OnlyOnHitHurtbox,[] as string[],
    ElementalType.None,0,HitType.Slash,AttackType.MeleeAttack,0,true,10006012,KnockbackDirectionType.LineConnectingAttackerAndHitPoint,false,
    [0,0,0],[0,0,0],1,[0,0,0],[0,0,0],1.5,1,1,HitLevel.LightHit,1000,1000);
  f.notifyServerNodeGraph('act','','');
})
```

### _GSTS_KgCitizenMind（6 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "citizenMind": see examples/kingdom6/gen_kingdom6.py.
g.creationStatusDecision({id:1082130439,name:'_GSTS_KgCitizenMind',prefix:false}).on('start1',(evt,f)=>{
  if(f.getCustomVariable(TargetEntity.StageEntity,'dark').asType('int')===1n){f.switchToSelfExecutionStatus(true,1082130445,1n);}
  else{f.switchToSelfExecutionStatus(true,1082130447,1n);}
})
```

### _GSTS_KgFarmerMind（6 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "farmerMind": see examples/kingdom6/gen_kingdom6.py.
g.creationStatusDecision({id:1082130440,name:'_GSTS_KgFarmerMind',prefix:false}).on('start1',(evt,f)=>{
  if(f.getCustomVariable(TargetEntity.StageEntity,'dark').asType('int')===1n){f.switchToSelfExecutionStatus(true,1082130445,1n);}
  else{f.switchToSelfExecutionStatus(true,1082130448,1n);}
})
```

### _GSTS_KgBuilderMind（10 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "builderMind": see examples/kingdom6/gen_kingdom6.py.
g.creationStatusDecision({id:1082130441,name:'_GSTS_KgBuilderMind',prefix:false}).on('start1',(evt,f)=>{
  if(f.getCustomVariable(TargetEntity.StageEntity,'dark').asType('int')===1n){f.switchToSelfExecutionStatus(true,1082130445,1n);}
  else{if(f.getCustomVariable(TargetEntity.StageEntity,'mend').asType('int')===1n){f.switchToSelfExecutionStatus(true,1082130449,1n);}
  else{f.switchToSelfExecutionStatus(true,1082130447,1n);}}
})
```

### _GSTS_KgThrowerMind（9 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "throwerMind": see examples/kingdom6/gen_kingdom6.py.
g.creationStatusDecision({id:1082130442,name:'_GSTS_KgThrowerMind',prefix:false}).on('start1',(evt,f)=>{
  if(f.queryIfEntityIsOnTheField(TargetEntity.AggroTarget)){f.switchToSelfExecutionStatus(true,1082130450,1n);}
  else{if(f.getCustomVariable(TargetEntity.StageEntity,'dark').asType('int')===1n){f.switchToSelfExecutionStatus(true,1082130446,1n);}
  else{f.switchToSelfExecutionStatus(true,1082130447,1n);}}
})
```

### _GSTS_KgSoldierMind（9 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "soldierMind": see examples/kingdom6/gen_kingdom6.py.
g.creationStatusDecision({id:1082130443,name:'_GSTS_KgSoldierMind',prefix:false}).on('start1',(evt,f)=>{
  if(f.queryIfEntityIsOnTheField(TargetEntity.AggroTarget)){f.switchToSelfExecutionStatus(true,1082130451,1n);}
  else{if(f.getCustomVariable(TargetEntity.StageEntity,'dark').asType('int')===1n){f.switchToSelfExecutionStatus(true,1082130446,1n);}
  else{f.switchToSelfExecutionStatus(true,1082130447,1n);}}
})
```

### _GSTS_KgGreedMind（22 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "greedMind": see examples/kingdom6/gen_kingdom6.py.
g.creationStatusDecision({id:1082130444,name:'_GSTS_KgGreedMind',prefix:false}).on('start1',(evt,f)=>{
  if(!(f.getCustomVariable(TargetEntity.StageEntity,'dark').asType('int')===1n)){f.switchToSelfExecutionStatus(true,1082130455,1n);}
  else{if(f.getCustomVariable(TargetEntity.Self,'sated').asType('int')===1n){f.switchToSelfExecutionStatus(true,1082130455,1n);}
  else{if(f.getCustomVariable(TargetEntity.Self,'siege').asType('int')===1n&&f.split3dVector(f.getEntityLocation(TargetEntity.Self)).xComponent<=23.7){f.switchToSelfExecutionStatus(true,1082130454,1n);}
  else{if(f.queryIfEntityIsOnTheField(TargetEntity.AggroTarget)){f.switchToSelfExecutionStatus(true,1082130453,1n);}
  else{f.switchToSelfExecutionStatus(true,1082130452,1n);}}}}
})
```

### _GSTS_KgDoHome（6 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "home": see examples/kingdom6/gen_kingdom6.py.
g.creationStatus({id:1082130445,name:'_GSTS_KgDoHome',prefix:false}).on('start1',(evt,f)=>{
  f.tacticMoveToTheTargetPosition(true,f.create3dVector(f.getCustomVariable(TargetEntity.Self,'hx').asType('float'),0,f.getCustomVariable(TargetEntity.Self,'hz').asType('float')),1,TacticSpeed.Run,360,'home',false);
  f.tacticStandStill(true,'still',false);
})
```

### _GSTS_KgDoPost（6 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "post": see examples/kingdom6/gen_kingdom6.py.
g.creationStatus({id:1082130446,name:'_GSTS_KgDoPost',prefix:false}).on('start1',(evt,f)=>{
  f.tacticMoveToTheTargetPosition(true,f.create3dVector(f.getCustomVariable(TargetEntity.Self,'wx').asType('float'),0,f.getCustomVariable(TargetEntity.Self,'wz').asType('float')),1,TacticSpeed.Walk,360,'post',false);
  f.tacticStandStill(true,'still',false);
})
```

### _GSTS_KgDoStroll（3 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "stroll": see examples/kingdom6/gen_kingdom6.py.
g.creationStatus({id:1082130447,name:'_GSTS_KgDoStroll',prefix:false}).on('start1',(evt,f)=>{
  f.tacticGroundIdleRoaming(true,TacticSpeed.Walk,3.5,1,4,1,3,'stroll',false);
  f.tacticStandStill(true,'still',false);
})
```

### _GSTS_KgDoToil（7 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "toil": see examples/kingdom6/gen_kingdom6.py.
g.creationStatus({id:1082130448,name:'_GSTS_KgDoToil',prefix:false}).on('start1',(evt,f)=>{
  f.tacticMoveToTheTargetPosition(true,f.create3dVector(f.getCustomVariable(TargetEntity.Self,'wx').asType('float'),0,f.getCustomVariable(TargetEntity.Self,'wz').asType('float')),1,TacticSpeed.Walk,360,'field',false);
  f.executeSkill(true,1n);
  f.tacticStandStill(true,'still',false);
})
```

### _GSTS_KgDoMend（7 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "mend": see examples/kingdom6/gen_kingdom6.py.
g.creationStatus({id:1082130449,name:'_GSTS_KgDoMend',prefix:false}).on('start1',(evt,f)=>{
  f.tacticMoveToTheTargetPosition(true,f.create3dVector(f.getCustomVariable(TargetEntity.Self,'wx').asType('float'),0,f.getCustomVariable(TargetEntity.Self,'wz').asType('float')),1.2,TacticSpeed.Run,360,'wall',false);
  f.executeSkill(true,1n);
  f.tacticStandStill(true,'still',false);
})
```

### _GSTS_KgDoShoot（4 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "shoot": see examples/kingdom6/gen_kingdom6.py.
g.creationStatus({id:1082130450,name:'_GSTS_KgDoShoot',prefix:false}).on('start1',(evt,f)=>{
  f.executeSkill(true,1n);
  f.tacticRotateToTheTargetEntity(true,f.getTargetEntity(),360,false,'face',false);
})
```

### _GSTS_KgDoFight（5 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "fight": see examples/kingdom6/gen_kingdom6.py.
g.creationStatus({id:1082130451,name:'_GSTS_KgDoFight',prefix:false}).on('start1',(evt,f)=>{
  f.tacticGroundPursuit(true,3.8,30,3.4,TacticSpeed.Run,4,TacticSpeed.Run,6,0,'chase',false);
  f.executeSkill(true,1n);
  f.tacticRotateToTheTargetEntity(true,f.getTargetEntity(),360,false,'face',false);
})
```

### _GSTS_KgDoAdvance（7 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "advance": see examples/kingdom6/gen_kingdom6.py.
g.creationStatus({id:1082130452,name:'_GSTS_KgDoAdvance',prefix:false}).on('start1',(evt,f)=>{
  f.tacticMoveToTheTargetPosition(true,f.create3dVector(17.2+f.getCustomVariable(TargetEntity.Self,'stand').asType('float'),0,f.getCustomVariable(TargetEntity.Self,'lane').asType('float')),1.5,TacticSpeed.Walk,360,'march',false);
  f.tacticStandStill(true,'still',false);
})
```

### _GSTS_KgDoBash（7 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "bash": see examples/kingdom6/gen_kingdom6.py.
g.creationStatus({id:1082130453,name:'_GSTS_KgDoBash',prefix:false}).on('start1',(evt,f)=>{
  f.tacticMoveToTheTargetEntity(true,f.getTargetEntity(),f.getCustomVariable(TargetEntity.Self,'near').asType('float'),TacticSpeed.Run,360,'close',false);
  f.executeSkill(true,1n);
  f.tacticRotateToTheTargetEntity(true,f.getTargetEntity(),360,false,'face',false);
})
```

### _GSTS_KgDoSiege（10 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "siege": see examples/kingdom6/gen_kingdom6.py.
g.creationStatus({id:1082130454,name:'_GSTS_KgDoSiege',prefix:false}).on('start1',(evt,f)=>{
  f.tacticMoveToTheTargetPosition(true,f.create3dVector(17.2+f.getCustomVariable(TargetEntity.Self,'stand').asType('float'),0,f.getCustomVariable(TargetEntity.Self,'lane').asType('float')),0.6,TacticSpeed.Walk,360,'line',false);
  f.executeSkill(true,f.getCustomVariable(TargetEntity.Self,'hack').asType('int'));
  f.tacticRotateToTheTargetEntity(true,f.getTargetEntity(),360,false,'face',false);
})
```

### _GSTS_KgDoRetreat（3 个节点）

```ts
/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'

// Kingdom v6, graph "retreat": see examples/kingdom6/gen_kingdom6.py.
g.creationStatus({id:1082130455,name:'_GSTS_KgDoRetreat',prefix:false}).on('start1',(evt,f)=>{
  f.tacticMoveToTheTargetPosition(true,[30,0,0],1.5,TacticSpeed.Run,360,'flee',false);
  f.tacticStandStill(true,'still',false);
})
```
