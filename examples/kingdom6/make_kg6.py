"""Writes the files of Kingdom v6 that are data: rules, feedback table, scene and the rounds (short check, the way
to lose, the full game). Run once; the results are what is kept in examples/kingdom6. It starts from the files of
examples/kingdom5."""
import copy
import json
import os

# What v6 starts from: the files of v5.
FROM_V5 = {'kg6_rules.json': 'kg5_rules.json', 'kg6_feel.json': 'kg5_feel.json', 'kingdom6_scene.json': 'kingdom5_scene.json', 'kg6_test.json': 'kg5_test.json'}
HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
load = lambda name: json.load(open(os.path.join(HERE, '..', 'kingdom5', FROM_V5[name]), encoding='utf-8'))
save = lambda name, data: json.dump(data, open(name, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
X0 = -9

# ---- rules ----
rules = load('kg6_rules.json')
rules['about'] = ('王国第六版的数值，生成脚本 gen_kingdom6.py 读这一份。waves 是每一夜的几拨怪，每拨写 [小怪数, 大怪数]；waveAt 是每拨在夜里出现的时刻'
                  '（占夜长的比例）。cap 是钱袋上限：取 10，界面上的进度条一枚币正好 10%。fight 是打起来的数：health 是元件上的基础生命（造物的实际生命'
                  '是它的 5.39 倍，墙就是这个数），slash / punch / smash 是士兵一刀、小怪一下、大怪一下扣的生命（攻击盒的增量，不打折），knife 是飞刀能力单元'
                  '的增量（打在造物身上约为它的 0.45 倍），mend 是工匠一锤补回的生命。')
rules['throwers'] = rules.pop('archers')
rules['soldiers'] = 2
rules['people'] = 9
rules['price']['thrower'] = rules['price'].pop('archer')
rules['price']['soldier'] = 3
for gone in ('wall', 'reloadSeconds', 'arrowSeconds'):
    rules.pop(gone, None)
rules['fight'] = {'health': {'vagrant': 15, 'farmer': 15, 'builder': 15, 'thrower': 15, 'soldier': 30, 'greed': 12, 'brute': 36, 'wall_wood': 200, 'wall_stone': 500},
                  'slash': 40, 'punch': 25, 'smash': 45, 'knife': 80, 'mend': 30}
save('kg6_rules.json', rules)

# The numbers of the full game. Those above came from v5, where an arrow killed a Greed outright; with real health a
# line of play that was sensible in v5 falls on the third night (balance6.py: 0 of 300). These let a sensible line
# through and a careless one fall, in the model and in the one game the script played with them.
tuned = copy.deepcopy(rules)
tuned['about'] = ('王国第六版完整五夜用的数值（kg6_play.json）。两夜短流程用的是 kg6_rules.json。这一份先用 balance6.py 的粗略模型调：波次比第五版小（真打之后一刀不再秒怪），'
                  '木墙 250、石墙 600，士兵基础生命 40，工匠一锤补 40，每早的基础收入 6。2026-10-12 上机按脚本的打法玩了四局。收入 5、只招一个士兵的两局：一局险胜（第五夜石墙只剩 25），'
                  '一局第四夜墙破、王冠被抢（士兵第三夜就倒了：士兵不回血，怪先打迎上来的士兵）。收入加到 6、第四天再招一个士兵之后又玩了三局：两局撑到第五个黎明（木墙最低 130，'
                  '第五夜两个士兵倒下、石墙剩 125），一局在第四夜最后两秒墙破、王冠被抢（怪改成分道分排站之后的那一局）。也就是说照脚本这种“样样买一点”的打法，第四夜是道坎，'
                  '输赢差在几秒上；我没有再为它调数值。模型按前几局对过，只修墙加一个飞刀手撑不过第五夜。好不好玩、难不难，要人来玩了再调。')
tuned['waves'] = [[[1, 0], [1, 0]], [[2, 0], [1, 0], [1, 0]], [[2, 0], [2, 0], [1, 1]], [[2, 0], [2, 1], [2, 0], [2, 0]], [[3, 0], [2, 1], [3, 1], [2, 0]]]
tuned['fight']['health'].update(wall_wood=250, wall_stone=600, soldier=40)
tuned['fight']['mend'] = 40
tuned['income']['base'] = 6
save('kg6_rules_play.json', tuned)

# ---- feedback ----
feel = load('kg6_feel.json')
feel['about'] = feel['about'].replace('第五版', '第六版')
s = feel['sound']
s['thrower'] = s.pop('archer')
s['soldier'] = {'id': 50917, 'note': '确认按钮_中', 'volume': 100}
s['throw'] = {'id': 40026, 'note': '弓箭_01：飞刀出手', 'volume': 60}
s['slash'] = {'id': 40305, 'note': '单手剑：士兵砍中', 'volume': 70}
s['punch'] = {'id': 40106, 'note': '躯体打击：怪打中', 'volume': 70}
s['kill'] = {'id': 30004, 'note': '倒地：怪倒下', 'volume': 80}
s['down'] = {'id': 50936, 'note': '提示性UI_中_扣血：自己人倒下', 'volume': 100}
s['mendTick'] = {'id': 50425, 'note': '场景物件_碰撞反馈_常规_02：工匠一锤', 'volume': 70}
feel['burst']['mendTick'] = {'id': 141, 'note': '黄色出现烟尘', 'offset': [0, 1, 0]}
feel['burst']['dig'] = {'id': 0}
feel['loop'].pop('arrow', None)
save('kg6_feel.json', feel)

# ---- scene: the decorations of v5 (in v5's coordinates: the round moves everything by sceneOffset), and the creatures
# the unit prefabs are made from ----
scene = load('kingdom6_scene.json')
keep = [b for b in scene['blocks'] if not b['name'].startswith(('KV_enemy', 'KV_unit'))]
for b in keep:
    if b['name'] == 'KV_wall_stump':
        b['position'][0] = 24.6
    if b['name'] == 'KV_lamp_2':
        b['position'][0] = 21.4
units = [('KV_unit_vagrant', 30006009, 1), ('KV_unit_farmer', 30006009, 1), ('KV_unit_builder', 30006009, 1), ('KV_unit_thrower', 30006009, 1),
         ('KV_unit_soldier', 30008001, 1), ('KV_enemy_00', 30007001, 1), ('KV_enemy_big', 30005002, 1)]
for i, (name, asset, scale) in enumerate(units):
    piece = {'template': asset, 'name': name, 'position': [3 + 2.5 * i, 7.6, 14], 'createAtStart': False}
    if scale != 1:
        piece['scale'] = scale
    keep.append(piece)
save('kingdom6_scene.json', {'name': 'Kingdom_V6', 'blocks': keep})

# ---- the rounds ----
H = rules['fight']['health']
base = load('kg6_test.json')
base.update(dir='kingdom6', generator='gen_kingdom6.py', scenes=['kingdom6_scene.json', '../kingdom/kingdom_v3_scenery.json'],
            sceneOffset=[X0, -7.6, 0], spawn={'position': [X0 + 2, 0.4, 0], 'rotation': [0, 0, 0]}, bakeNavigation=True,
            signals=['KG_state', 'KG_warn', 'KG_dusk', 'KG_dawn', 'KG_wall_down', 'KG_mend', 'KG_mended'])
for light in base['lights']:
    light['position'][0] = round(light['position'][0] + X0, 2)
base['lights'][2]['position'][0] = round(21.4 + X0, 2)
base['prefabs'] = [p for p in base['prefabs'] if 'fromEntity' not in p and p['name'] not in ('KV_arrow', 'KV_wall_wood', 'KV_wall_stone')] + [
    {'asset': 20002261, 'name': 'KV_barracks', 'scale': 1},
    {'asset': 20003092, 'name': 'KV_wall_wood', 'scale': [0.55, 1.2, 1], 'health': H['wall_wood']},
    {'asset': 20002893, 'name': 'KV_wall_stone', 'scale': [1, 0.6, 1], 'health': H['wall_stone']},
    {'asset': 20001929, 'name': 'KV_knife', 'scale': 0.2},
    {'fromEntity': 'KV_enemy_00', 'name': 'KV_greed', 'health': H['greed']}, {'fromEntity': 'KV_enemy_big', 'name': 'KV_brute', 'health': H['brute']},
    {'fromEntity': 'KV_unit_vagrant', 'name': 'KV_vagrant', 'health': H['vagrant']}, {'fromEntity': 'KV_unit_farmer', 'name': 'KV_farmer', 'health': H['farmer']},
    {'fromEntity': 'KV_unit_builder', 'name': 'KV_builder', 'health': H['builder']}, {'fromEntity': 'KV_unit_thrower', 'name': 'KV_thrower', 'health': H['thrower']},
    {'fromEntity': 'KV_unit_soldier', 'name': 'KV_soldier', 'health': H['soldier']}]
UNITS = ['KV_vagrant', 'KV_farmer', 'KV_builder', 'KV_thrower', 'KV_soldier']
base['graphs'] = [g for g in base['graphs'] if g['key'] not in ('archer', 'arrow', 'wall', 'greed', 'player', 'range')] + [
    {'key': 'range', 'name': 'KgRange', 'attachToPrefab': 'KV_range'},
    {'key': 'barracks', 'name': 'KgBarracks', 'attachToPrefab': 'KV_barracks', 'log': False},
    {'key': 'unit', 'name': 'KgUnit', 'attachToPrefab': UNITS},
    {'key': 'knife', 'name': 'KgKnife', 'attachToPrefab': 'KV_knife'},
    {'key': 'wall', 'name': 'KgWall', 'attachToPrefab': ['KV_wall_wood', 'KV_wall_stone']},
    {'key': 'greed', 'name': 'KgGreed', 'attachToPrefab': ['KV_greed', 'KV_brute']},
    {'key': 'player', 'name': 'KgPlayer', 'attachToPrefab': 'player'}] + [
    {'key': k, 'name': 'Kg' + k[0].upper() + k[1:], 'kind': 'creatureSkill'} for k in ('dig', 'hammer', 'throw', 'slash', 'punch', 'smash')] + [
    {'key': k, 'name': 'Kg' + k[0].upper() + k[1:], 'kind': 'creatureDecision'} for k in ('citizenMind', 'farmerMind', 'builderMind', 'throwerMind', 'soldierMind', 'greedMind')] + [
    {'key': k, 'name': 'KgDo' + k[0].upper() + k[1:], 'kind': 'creatureStatus'} for k in ('home', 'post', 'stroll', 'toil', 'mend', 'shoot', 'fight', 'advance', 'bash', 'siege', 'retreat')]
SCOUT, NOBUSHI, HILI, MITA = 30006009, 30008001, 30007001, 30005002
PICK, KNIFE = 10006070, 10006069
base['creatureSkills'] = [
    {'name': 'KV_dig', 'creature': SCOUT, 'graph': 'dig', 'animation': '挖矿01', 'graphAtMs': 700, 'effect': {'asset': PICK, 'attachPoint': 'GI_WeaponR', 'ms': 4400}},
    {'name': 'KV_hammer', 'creature': SCOUT, 'graph': 'hammer', 'animation': '挖矿01', 'graphAtMs': 700, 'effect': {'asset': PICK, 'attachPoint': 'GI_WeaponR', 'ms': 4400}},
    {'name': 'KV_throw', 'creature': SCOUT, 'graph': 'throw', 'animation': '远程攻击_01', 'animationPortion': 0.62, 'graphAtMs': 2050, 'faceTarget': True,
     'effect': {'asset': KNIFE, 'attachPoint': 'GI_WeaponR', 'ms': 2000}},
    {'name': 'KV_slash', 'creature': NOBUSHI, 'graph': 'slash', 'animation': '近战攻击_02', 'graphAtMs': 750, 'faceTarget': True},
    # The Greed's strokes are the ones made for a weapon in the hand (the cleaver follows the hand in them). 攻击 lands at
    # about 1050 ms and carries the creature 1.3 m forward; 闪避 after it is a hop of 2.5 m back, so that a Greed ends a
    # little farther out than it began. The brute's 近战攻击_01 is two cuts: a sweep that lands at about 1300 ms and
    # hardly moves it, then a lunge of nearly three metres (from 1.8 s); 0.65 of it leaves out the long recovery, 0.37
    # the lunge as well: that is the stroke for the wall (KV_sweep).
    {'name': 'KV_punch', 'creature': HILI, 'graph': 'punch', 'animations': ['攻击', '闪避'], 'graphAtMs': 1050, 'faceTarget': True},
    {'name': 'KV_smash', 'creature': MITA, 'graph': 'smash', 'animation': '近战攻击_01', 'animationPortion': 0.65, 'graphAtMs': 1300, 'faceTarget': True},
    {'name': 'KV_sweep', 'creature': MITA, 'graph': 'smash', 'animation': '近战攻击_01', 'animationPortion': 0.37, 'graphAtMs': 1300, 'faceTarget': True}]
GREED_LOGIC = {'noticeRadius': 4, 'leaveCombatDistance': 12, 'territoryRadius': 100}
base['creatureLogic'] = [
    {'prefab': 'KV_vagrant', 'decisionGraph': 'citizenMind'},
    {'prefab': 'KV_farmer', 'decisionGraph': 'farmerMind', 'skills': [{'skill': 'KV_dig', 'cooldownSeconds': [0.5, 1.5]}]},
    {'prefab': 'KV_builder', 'decisionGraph': 'builderMind', 'skills': [{'skill': 'KV_hammer', 'cooldownSeconds': [0.2, 0.5]}]},
    {'prefab': 'KV_thrower', 'decisionGraph': 'throwerMind', 'skills': [{'skill': 'KV_throw', 'cooldownSeconds': [0.4, 0.9]}], 'logic': {'noticeRadius': 13, 'leaveCombatDistance': 20}},
    {'prefab': 'KV_soldier', 'decisionGraph': 'soldierMind', 'skills': [{'skill': 'KV_slash', 'cooldownSeconds': [0.5, 1]}], 'logic': {'noticeRadius': 8, 'leaveCombatDistance': 14}},
    {'prefab': 'KV_greed', 'decisionGraph': 'greedMind', 'skills': [{'skill': 'KV_punch', 'cooldownSeconds': [1, 2]}], 'logic': GREED_LOGIC},
    # The sweep is short: with the longer wait a brute strikes the wall about as often as it strikes a soldier.
    {'prefab': 'KV_brute', 'decisionGraph': 'greedMind', 'skills': [{'skill': 'KV_smash', 'cooldownSeconds': [1.5, 2.5]}, {'skill': 'KV_sweep', 'cooldownSeconds': [2.5, 3.5]}], 'logic': GREED_LOGIC}]
integer = lambda name, value=0: {'name': name, 'type': 'integer', 'value': value}
real = lambda name, value=0: {'name': name, 'type': 'float', 'value': value}
KIND = {'vagrant': 1, 'farmer': 2, 'builder': 3, 'thrower': 4, 'soldier': 5, 'greed': 6, 'brute': 7, 'wall_wood': 8, 'wall_stone': 9}
stations = [c for c in base['components'] if c.get('prefab') in ('KV_coin', 'KV_tag_keep', 'KV_tag_site', 'KV_tag', 'KV_crown', 'KV_keep', 'KV_camp', 'KV_farm', 'KV_smith', 'KV_site')]
# A station offers its option while the monarch is within 2 m of it along the lane (4 m wide; v5 had 5): between the
# site and the wall nothing is offered, so the fight at the wall can be watched without a prompt over it.
for c in stations:
    if c['prefab'] in ('KV_smith', 'KV_site'):
        c['optionTab']['areas'][0]['size'][0] = 4
    # The camp's area was 8 m wide and lay over the keep's: between the two the monarch was offered both, and F took the keep's.
    if c['prefab'] == 'KV_camp':
        c['optionTab']['areas'][0]['size'][0] = 5
base['components'] = [{'entity': '关卡实体', 'variables': [integer('dark'), integer('mend')]}] + stations + [
    {'prefab': 'KV_range', 'optionTab': {'areas': [{'size': [4, 5, 14]}], 'options': [{'text': '飞刀手 2金币 · 夜里在墙后掷刀', 'icon': 10}]}, 'variables': [{'name': 'lit', 'type': 'boolean', 'value': False}]},
    {'prefab': 'KV_barracks', 'optionTab': {'areas': [{'size': [4, 5, 14]}], 'options': [{'text': '士兵 3金币 · 夜里在墙前迎敌', 'icon': 12}]}, 'variables': [{'name': 'lit', 'type': 'boolean', 'value': False}]},
    {'prefab': 'KV_wall_wood', 'solid': False, 'variables': [integer('kind', KIND['wall_wood'])], 'hurtBox': {'areas': [{'size': [4, 1.1, 1.6], 'offset': [0, 0.55, 0]}]}},
    {'prefab': 'KV_wall_stone', 'solid': False, 'variables': [integer('kind', KIND['wall_stone'])], 'hurtBox': {'areas': [{'size': [4.5, 1.8, 1.8], 'offset': [0, 0.9, 0]}]}},
    {'prefab': 'KV_knife', 'solid': False, 'projectile': {'type': 'tracking', 'velocity': [0, 0, 16], 'turnDegreesPerSecond': 720},
     'hitDetection': {'areas': [{'radius': 0.5}], 'trigger': 'oncePerEntity', 'delaySeconds': 0.05, 'abilityUnit': 'KV_pierce', 'layers': ['hurtBox'], 'factions': 'hostile',
                      'continuous': {'speedAbove': 5, 'radius': 0.5}},
     'abilityUnits': [{'name': 'KV_pierce', 'attack': {'coefficient': 0, 'added': rules['fight']['knife']}}]}] + [
    {'prefab': 'KV_' + name, 'variables': [integer('kind', KIND[name]), real('hx'), real('hz'), real('wx'), real('wz')]} for name in ('vagrant', 'farmer', 'builder', 'thrower', 'soldier')] + [
    {'prefab': 'KV_greed', 'variables': [integer('kind', KIND['greed']), integer('dmg', 1), integer('sated'), integer('grabbing'), integer('siege'), real('near', 2.4), real('stand', 2.8), integer('hack', 1), real('lane')]},
    {'prefab': 'KV_brute', 'variables': [integer('kind', KIND['brute']), integer('dmg', 2), integer('sated'), integer('grabbing'), integer('siege'), real('near', 3.6), real('stand', 3.6), integer('hack', 2), real('lane')]},
    {'prefab': 'player', 'variables': [integer(n) for n in ('coins', 'citizens', 'farmers', 'builders', 'throwers', 'soldiers', 'keep', 'night', 'wall')]}]
base.pop('readTextAt', None)

# The short check: two nights. Day 1: two citizens, the builder, a thrower, the wooden wall. Day 2: a citizen, a soldier.
test = copy.deepcopy(base)
# It is looked at frame by frame (playtest_frames): two screenshots a second while the Greed are at the wall in each
# night, kept large enough to see what is in the hands.
test.update(day=34, night=26, coins=10, generatorArgs=[2], durationSeconds=134, recordAudio=False, screenshotWidth=2560,
            screenshotsAt=sorted(set([4, 12, 20, 28, 34, 60, 64, 70, 76, 82, 88, 120, 124, 128] + [39 + i * 0.5 for i in range(32)] + [93 + i * 0.5 for i in range(50)])),
            inputs=[{'at': 5, 'key': 'd', 'holdMs': 600}, {'at': 7, 'key': 'f'}, {'at': 8.5, 'key': 'f'}, {'at': 10, 'key': 'd', 'holdMs': 950}, {'at': 12, 'key': 'f'},
                    {'at': 14, 'key': 'd', 'holdMs': 800}, {'at': 16, 'key': 'f'}, {'at': 18, 'key': 'd', 'holdMs': 1650}, {'at': 21, 'key': 'f'}, {'at': 23, 'key': 'd', 'holdMs': 600},
                    {'at': 62, 'key': 'a', 'holdMs': 4700}, {'at': 69, 'key': 'd', 'holdMs': 700}, {'at': 71, 'key': 'f'}, {'at': 72.5, 'key': 'd', 'holdMs': 2550}, {'at': 76.5, 'key': 'f'},
                    {'at': 78, 'key': 'd', 'holdMs': 1450}])
test['about'] = ("Kingdom v6, the short run a script can check: two nights of 26 seconds, days of 34. The villagers and the Greed are complex creatures and the fighting is the platform's "
                 "(health, hit boxes, a projectile). The script picks up the ten starting coins, recruits two citizens, makes one the builder and one a knife thrower, builds the wooden wall "
                 "and stands behind it. The horn: the citizens' places empty, the thrower walks to its post behind the wall. Night 1, two single Greed, a crude cleaver in the hand: they walk to the wall, are given it "
                 "and hack at it from their line before it, hopping back after every blow (KG_PUNCH 25, KG_WALL_HP going down from 200), while the thrower's knives hit them (KG_THROW, KG_KNIFE, KG_KILL). Dawn: the builder walks to the wall and hammers "
                 "it whole (KG_MEND, KG_WALL_HP going up, KG_MENDED); the script collects the morning's four coins, recruits a citizen and makes it a soldier at the barracks. Night 2 (bursts "
                 "of 2, 2 and 1): the soldier stands in front of the wall and leaps at the Greed it notices (KG_SLASH 40); it may fall (KG_DOWN soldier). The second dawn wins. Prints to expect, "
                 "in order: KG_READY, KG_DAY, KG_COINS 1..10, KG_CITIZEN x2, KG_BUILDER, KG_THROWER, KG_WALL 1, KG_WARN, KG_DUSK 1, KG_GREED x2, KG_AT_WALL, KG_PUNCH / KG_WALL_HP, KG_THROW / "
                 "KG_KNIFE / KG_KILL, KG_DAWN, KG_INCOME 4, KG_MEND ... KG_MENDED, KG_COINS, KG_CITIZEN, KG_SOLDIER, KG_WARN, KG_DUSK 2, KG_GREED x3, KG_SLASH, KG_DAWN, KG_VICTORY. KG_POOR / "
                 "KG_NEED mean a station refused. Whether it is fun is for a person to say; this run only shows that every part works. During both nights it takes two screenshots a second, 2560 wide: playtest_frames "
                 "over seconds 39-55 and 93-118, cropped to the wall, shows every blow frame by frame (what is in the hands, when it lands). The full game is kg6_play.json: day 60, night 45, five "
                 "nights. An option shows no text on an account of 奇匠 level 1, only its icon, so prices are rows of small coins above the stations.")
for bar in test['bars']:
    if bar['name'] == 'KG_nights':
        bar['max'] = 2
save('kg6_test.json', test)
print('graphs', len(test['graphs']), 'prefabs', len(test['prefabs']), 'components', len(test['components']))

# The bench: the short check's first day, then one crowded night (the fourth night of the full game: eight Greed and a
# brute against a wooden wall and one thrower). For looking at the fight at the wall without playing a whole game: a
# round of a minute and a quarter. Everything but the graphs and the play is the short check's, so a round of it can go
# on from the save of a short check and the other way round (ROUND_REUSE in scripts/dev/mcp_round.mjs).
bench_rules = copy.deepcopy(rules)
bench_rules['about'] = '试验台（kg6_bench.json）用的数值：只有一夜，来的是完整版第四夜那么多怪（八只小怪加一只大怪），用来看墙前的打斗，不是给人玩的。其余同 kg6_rules.json。'
bench_rules['waves'][0] = [[2, 0], [2, 1], [2, 0], [2, 0]]
bench_rules['waveAt'][0] = [0.08, 0.3, 0.5, 0.7]
save('kg6_rules_bench.json', bench_rules)
bench = copy.deepcopy(test)
bench.update(generatorArgs=[1], generatorData={'rules': 'kg6_rules_bench.json'}, durationSeconds=72,
             screenshotsAt=sorted(set([4, 20, 34] + [38 + i * 0.5 for i in range(60)])), inputs=test['inputs'][:10])
bench['about'] = ("Kingdom v6, the bench (a development aid, not a game): the first day of the short check, then one night of 26 seconds with as many enemies as the fourth night of the "
                  "full game (eight Greed and a brute) against the wooden wall and one knife thrower, two screenshots a second all night. It is for looking at the fight at the wall "
                  "frame by frame (playtest_frames over seconds 38-68, cropped to the wall) after a change to how the enemies stand, strike or die, without playing a whole game. Only "
                  "the stage, the wall and the Greed are logged. The wall falls before dawn and the level may be lost: that is not what this round is about.")
for g in bench['graphs']:
    if g['key'] not in ('stage', 'wall', 'greed') and g.get('kind') in (None, 'server'):
        g['log'] = False
save('kg6_bench.json', bench)

# The way to lose, and the refusals: no wall, no fighters.
defeat = copy.deepcopy(base)
defeat.update(day=40, night=30, coins=10, generatorArgs=[2], durationSeconds=84, recordAudio=False,
              screenshotsAt=[4, 8, 10, 12, 14.5, 16, 20, 24, 27, 30, 33, 36, 41, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 74, 78],
              inputs=[{'at': 5, 'key': 'd', 'holdMs': 600}, {'at': 7.5, 'key': 'd', 'holdMs': 950}, {'at': 9.5, 'key': 'f'}, {'at': 11, 'key': 'd', 'holdMs': 2450}, {'at': 14, 'key': 'f'},
                      {'at': 15.5, 'key': 'a', 'holdMs': 3400}, {'at': 19.5, 'key': 'f'}, {'at': 20.7, 'key': 'f'}, {'at': 21.9, 'key': 'f'}, {'at': 23.1, 'key': 'f'},
                      {'at': 24.5, 'key': 'a', 'holdMs': 1000}, {'at': 26.5, 'key': 'f'}, {'at': 28, 'key': 'd', 'holdMs': 4600}])
defeat['about'] = ("Kingdom v6, the way to lose, and the refusals. The script asks the smith for a builder with no citizen and the site for a wall with no builder (KG_NEED twice, a question "
                   "mark over each), recruits four citizens, upgrades the keep and stands by the empty site with one coin left. The horn sounds, the citizens run to the keep and the site "
                   "flashes red (no wall). At night there is no wall to stop the Greed: each is given the monarch, runs up and strikes with its cleaver. The blow does not hurt the monarch (the hit box "
                   "leaves characters out): the first Greed takes the coin (KG_STOLEN) and runs off with it, the second finds the purse empty and grabs the crown (KG_GRAB, two and a half "
                   "seconds later KG_CROWN_LOST): the star goes from the monarch's head to the Greed and the level is lost. Prints: KG_READY, KG_DAY, KG_COINS 1..10, KG_NEED, KG_NEED, "
                   "KG_CITIZEN x4, KG_KEEP 1, KG_WARN, KG_DUSK 1, KG_GREED, KG_STOLEN, KG_COINS 0, KG_GREED, KG_GRAB, KG_CROWN_LOST.")
for bar in defeat['bars']:
    if bar['name'] == 'KG_nights':
        bar['max'] = 2
save('kg6_test_defeat.json', defeat)

# The full game: the save to hand to a person. The script plays one sensible line so that every part runs once.
play = copy.deepcopy(base)
D, N = 60, 45
dawn = lambda n: n * (D + N)          # second at which night n ends
home = lambda t: [{'at': t, 'key': 'a', 'holdMs': 4700}]   # from the watching spot behind the wall to the keep, where the morning's coins lie
steps = [{'at': 5, 'key': 'd', 'holdMs': 600}, {'at': 7, 'key': 'f'}, {'at': 8.5, 'key': 'f'}, {'at': 10, 'key': 'd', 'holdMs': 950}, {'at': 12, 'key': 'f'},
         {'at': 14, 'key': 'd', 'holdMs': 800}, {'at': 16, 'key': 'f'}, {'at': 18, 'key': 'd', 'holdMs': 1650}, {'at': 21, 'key': 'f'}, {'at': 23, 'key': 'd', 'holdMs': 600}]
t = dawn(1) + 2      # day 2: a citizen, a soldier
steps += home(t) + [{'at': t + 7, 'key': 'd', 'holdMs': 700}, {'at': t + 9, 'key': 'f'}, {'at': t + 10.5, 'key': 'd', 'holdMs': 2550}, {'at': t + 14.5, 'key': 'f'}, {'at': t + 16, 'key': 'd', 'holdMs': 1450}]
t = dawn(2) + 2      # day 3: a citizen and a second thrower, a citizen and a farmer
steps += home(t) + [{'at': t + 7, 'key': 'd', 'holdMs': 700}, {'at': t + 9, 'key': 'f'}, {'at': t + 10.5, 'key': 'd', 'holdMs': 1720}, {'at': t + 13.5, 'key': 'f'},
                    {'at': t + 15, 'key': 'a', 'holdMs': 1720}, {'at': t + 18, 'key': 'f'}, {'at': t + 19.5, 'key': 'a', 'holdMs': 2400}, {'at': t + 23.5, 'key': 'f'},
                    {'at': t + 25, 'key': 'd', 'holdMs': 4900}, {'at': t + 31, 'key': 'd', 'holdMs': 1500}]
t = dawn(3) + 2      # day 4: the coins by the keep and on the field, the keep, a citizen, a soldier (the first may have fallen: soldiers do not heal)
steps += home(t) + [{'at': t + 6, 'key': 'a', 'holdMs': 1700}, {'at': t + 9.5, 'key': 'd', 'holdMs': 1500}, {'at': t + 12.5, 'key': 'f'}, {'at': t + 14, 'key': 'd', 'holdMs': 1000}, {'at': t + 16.5, 'key': 'f'},
                    {'at': t + 18, 'key': 'd', 'holdMs': 2550}, {'at': t + 22, 'key': 'f'}, {'at': t + 23.5, 'key': 'd', 'holdMs': 1450}]
t = dawn(4) + 2      # day 5: a citizen and a third thrower, stone
steps += home(t) + [{'at': t + 6, 'key': 'a', 'holdMs': 1700}, {'at': t + 9.5, 'key': 'd', 'holdMs': 2500}, {'at': t + 13, 'key': 'f'}, {'at': t + 14.5, 'key': 'd', 'holdMs': 1620}, {'at': t + 17, 'key': 'f'},
                    {'at': t + 18.5, 'key': 'd', 'holdMs': 1680}, {'at': t + 21.5, 'key': 'f'}, {'at': t + 23, 'key': 'd', 'holdMs': 600}]
play.update(day=D, night=N, coins=10, generatorArgs=[5], generatorData={'rules': 'kg6_rules_play.json'}, durationSeconds=dawn(5) + D + 15 - D, recordAudio=True, inputs=steps,
            screenshotsAt=[t for n in range(5) for t in (n * 105 + 20, n * 105 + 50, n * 105 + 66, n * 105 + 72, n * 105 + 78, n * 105 + 84, n * 105 + 90, n * 105 + 96, n * 105 + 102)] + [dawn(5) + 3, dawn(5) + 8])
play['about'] = ("Kingdom v6, the full game: days of 60 seconds, nights of 45, five nights (about nine minutes). This is the save to hand to a person. The script plays one sensible line so "
                 "that every part runs once: day 1 two citizens, the builder, a knife thrower, the wooden wall; day 2 a soldier; day 3 a second thrower and a farmer; day 4 the keep and a second soldier; "
                 "day 5 a citizen who becomes the third thrower, and stone. Played by the script it is won or lost on the fourth night by seconds (three games: two won, one lost as the fourth dawn broke); a person plays differently. Its numbers are kg6_rules_play.json (smaller waves than v5, sturdier walls and soldiers, two coins more each morning: balance6.py). At night it stands between the site and the wall, where nothing offers an option and the fight can be watched. A person plays differently, and whether it is fun "
                 "is for a person to say. From the third night brutes come too (火斧丘丘暴徒 with a big blade: 45 a blow, and they take five strokes).")
for bar in play['bars']:
    if bar['name'] == 'KG_nights':
        bar['max'] = 5
for timer in play['timers']:
    timer['seconds'] = D
PH = tuned['fight']['health']
for p in play['prefabs']:
    if p['name'] == 'KV_wall_wood':
        p['health'] = PH['wall_wood']
    if p['name'] == 'KV_wall_stone':
        p['health'] = PH['wall_stone']
    if p['name'] == 'KV_soldier':
        p['health'] = PH['soldier']
save('kg6_play.json', play)
print('play seconds', play['durationSeconds'], 'inputs', len(steps))

