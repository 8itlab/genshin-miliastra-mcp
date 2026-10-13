# fxthumbs.py：从 listscrape.py 留下的逐步截图里，把每条特效在编辑器列表里的小图裁出来，按编号存成 <out>\<id>.jpg。
# 每条特效在好几步的截图里都出现，取小图完整落在截图里、而且离截图上下边最远的那一次。
# 用法：python fxthumbs.py <out dir> <y0（读列表时区域的上边，屏幕像素）> <jsonl> [更多 jsonl...]
import io, json, os, re, sys
from PIL import Image
out, y0 = sys.argv[1], int(sys.argv[2])
os.makedirs(out, exist_ok=True)
PAT = re.compile(r'ID\s*[:：]?\s*(\d{1,9})', re.I)
BOX, CX = 92, 55          # 小图的边长和中心横坐标（截图里的像素）
best = {}                 # id -> (离边距离, 文件, 中心纵坐标)
for src in sys.argv[3:]:
    for line in io.open(src, encoding='utf-8'):
        row = json.loads(line)
        if 'items' not in row: continue
        frame = '%s.%03d.jpg' % (src, row['step'])
        if not os.path.exists(frame): continue
        items = row['items']
        for i in range(1, len(items)):
            m = PAT.search(items[i][2].replace(' ', ''))
            if not m or PAT.search(items[i - 1][2].replace(' ', '')): continue
            if items[i][0] - items[i - 1][0] > 60: continue        # 名字行和编号行应该紧挨着
            cy = (items[i][0] + items[i - 1][0]) / 2 - y0
            best.setdefault(int(m.group(1)), []).append((frame, cy))
done = 0; cache = {}; sizes = {}
def get(frame):
    if frame not in cache:
        if len(cache) > 60: cache.clear()
        cache[frame] = Image.open(frame).convert('RGB'); sizes[frame] = cache[frame].height
    return cache[frame]
for aid, seen in sorted(best.items()):
    picks = []
    for frame, cy in seen:
        h = sizes[frame] if frame in sizes else get(frame).height
        if cy - BOX / 2 < 2 or cy + BOX / 2 > h - 2: continue
        picks.append((min(cy, h - cy), frame, cy))
    if not picks: continue
    _, frame, cy = max(picks)
    get(frame).crop((CX - BOX // 2, round(cy) - BOX // 2, CX + BOX // 2, round(cy) + BOX // 2)).resize((72, 72), Image.LANCZOS).save(os.path.join(out, '%d.jpg' % aid), quality=78)
    done += 1
print('ids seen', len(best), 'thumbnails', done)
