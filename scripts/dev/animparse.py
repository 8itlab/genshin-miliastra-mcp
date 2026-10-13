# animparse.py：把 animscrape.py 读到的一行行标签整理成 src/scene/media/creature-animations.json。
# 用法：python animparse.py <anim_out.jsonl> <assets.json：{资产编号: 名字}> <out.json> [每个技能几段，默认 4]
# 每个技能名是 AP_<资产编号>_<第几个>，里面第 j 段的编号 = 资产编号后四位 × 1000 + 1 + (第几个-1) × 每技能段数 + j。
# 标签形如 “2 盗宝团·斥候_近战攻击_01 2.33s”，循环动画前面多一个 “#N 循环动画”；文字识别常把序号、名字、时长粘在一起。
# 拿不准的行（时长 ≥ 10 秒、空槽后面还有名字、名字只出现过一次且和常见名字只差一个字）打印出来，对照截图人工核对。
import io, json, re, sys
src, assets_file, out = sys.argv[1:4]
per = int(sys.argv[4]) if len(sys.argv) > 4 else 4
assets = json.load(io.open(assets_file, encoding='utf-8'))
LOOP, LONE, DUR = re.compile(r'^#?\d*循环动画$'), re.compile(r'^\d$'), re.compile(r'^(\d+\.\d+)s?$')
table, doubts = {}, []
for line in io.open(src, encoding='utf-8'):
    row = json.loads(line)
    if 'name' not in row: continue
    _, asset, k = row['name'].split('_'); first = (int(asset) % 10000) * 1000 + 1 + (int(k) - 1) * per
    names, loop_next, empty_seen = [], False, False
    tokens = [t for _, t in row['items'] if t != '+']
    for i, t in enumerate(tokens):
        if LOOP.match(t): loop_next = True; continue
        if LONE.match(t):
            # A lone number is the label of the next name, or an empty slot when no name follows it.
            nxt = tokens[i + 1] if i + 1 < len(tokens) else ''
            if not ('_' in nxt and (not re.match(r'^\d', nxt) or nxt.startswith(t))): empty_seen = True
            continue
        if DUR.match(t):
            if names and names[-1][1] is None: names[-1][1] = float(DUR.match(t).group(1))
            continue
        if '_' not in t: doubts.append((row['name'], 'unreadable token', t)); continue
        if empty_seen: doubts.append((row['name'], 'a name after an empty slot', t))
        text = re.sub(r'^#?\d(?=\D)', '', t)                      # the slot number glued in front
        text = text.split('_', 1)[1]                              # the creature's name and its underscore
        seconds, m = None, re.match(r'^(.*?)(\d*)\.(\d+)s?$', text)
        if m:
            name, digits, frac = m.groups()
            if len(digits) >= 3: name, digits = name + digits[:2], digits[2:]   # 近战攻击_01 + 3.58
            seconds = float((digits or '0') + '.' + frac)
            text = name
        names.append([text, seconds, loop_next or text.endswith('循环')]); loop_next = False
    for j, (name, seconds, loop) in enumerate(names):
        if seconds is None or seconds >= 10 or not name: doubts.append((row['name'], 'check the length', name, seconds))
        table.setdefault(asset, []).append([first + j, name, seconds, 1 if loop else 0])
# Names that occur once and are one character away from a common one are probably misread.
count = {}
for rows in table.values():
    for r in rows: count[r[1]] = count.get(r[1], 0) + 1
common = [n for n, c in count.items() if c >= 3]
near = lambda a, b: len(a) == len(b) and sum(x != y for x, y in zip(a, b)) == 1
for asset, rows in table.items():
    for r in rows:
        if count[r[1]] == 1:
            like = [c for c in common if near(r[1], c)]
            if like: doubts.append(('AP_%s' % asset, 'looks like', r[1], like[0], r[0]))
json.dump({'source': "Read from the editor's skill timeline (战斗预设 > 技能 > 造物自定义技能 > 动画编辑) on 2026-10-11 with scripts/dev/animscrape.py, game version 7.x. Each row: id, name, seconds, 1 if it loops.",
           'names': {a: assets[a] for a in table}, 'creatures': table}, io.open(out, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(len(table), 'creatures', sum(len(r) for r in table.values()), 'animations')
for d in doubts: print('DOUBT', *d)
