# listparse.py：把 listscrape.py 读到的逐步结果并成一张表。每条资产在好几步里都出现，名字取出现次数最多的写法。
# 用法：python listparse.py <in.jsonl[+第二段.jsonl]> <kind: music|sound|effect|loop> <out.json> [分类标题,用逗号隔开]
import collections, json, re, sys
src, kind, out = sys.argv[1:4]
KNOWN = sys.argv[4].split(',') if len(sys.argv) > 4 else None   # 分类标题的名单；不给就靠猜
PAT = {'music': re.compile(r'(\d{5})\s*[/1Il|]?\s*(\d\d)\s*[:：.]\s*(\d\d)\s*$'),
       'sound': re.compile(r'[索累余]?[引51]*[l1I|]?\s*[:：]\s*(\d{5})\s*$'),
       'loop': re.compile(r'ID\s*[:：]?\s*(\d{1,9})\s*$', re.I),
       'effect': re.compile(r'ID\s*[:：]?\s*(\d{1,9})\s*[/1Il|]\s*([\d.]+)\s*s?\s*$', re.I)}[kind]
names = collections.defaultdict(collections.Counter); extra = collections.defaultdict(collections.Counter)
cats = {}; order = []; current = None; headers = []
import itertools
for line in itertools.chain.from_iterable(open(f, encoding='utf-8') for f in src.split('+')):
    row = json.loads(line)
    if 'items' not in row: continue
    items = row['items']
    for i, (y, x, text) in enumerate(items):
        m = PAT.search(text.replace(' ', ''))
        if not m:
            # 分类标题：下一行不是编号行、自己也不是某条的名字
            nxt = items[i + 1][2].replace(' ', '') if i + 1 < len(items) else ''
            if (text in KNOWN) if KNOWN else (i + 1 < len(items) and not PAT.search(nxt) and len(text) <= 12 and not re.search(r'\d{4}', text)):
                current = text
                if text not in headers: headers.append(text)
            continue
        if i == 0: continue  # 名字那一行已经滚出去了
        name = items[i - 1][2]
        if PAT.search(name.replace(' ', '')): continue
        aid = int(m.group(1))
        names[aid][name] += 1
        if kind == 'music': extra[aid]['%s:%s' % (m.group(2), m.group(3))] += 1
        if kind == 'effect': extra[aid][m.group(2)] += 1
        if aid not in cats: cats[aid] = current; order.append(aid)
rows = []
for aid in order:
    row = {'id': aid, 'name': names[aid].most_common(1)[0][0], 'category': cats[aid]}
    if kind == 'music': row['length'] = extra[aid].most_common(1)[0][0]
    if kind == 'effect': row['seconds'] = float(extra[aid].most_common(1)[0][0])
    row['seen'] = sum(names[aid].values())
    rows.append(row)
json.dump({'headers': headers, 'count': len(rows), 'rows': rows}, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('headers', headers, 'count', len(rows))
by = collections.Counter(r['category'] for r in rows); print(dict(by))
for r in rows[:4] + rows[-4:]: print(r)
weak = [r for r in rows if r['seen'] < 2]; print('seen once:', len(weak), [(r['id'], r['name']) for r in weak][:12])
