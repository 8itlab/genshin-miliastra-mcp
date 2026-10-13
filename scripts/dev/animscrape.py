# animscrape.py：把复杂造物的动画名从编辑器的技能时间轴上读下来。
# 动画只有编号能写进存档，名字只在编辑器里看得到。做法：先用工具做一个存档，里面是一批造物技能，每个技能放四段
# 动画（编号连着排）；导入后编辑器的“动画编辑”界面会把每一段的名字和时长显示成一排标签，这个脚本逐个技能打开、
# 文字识别这一排、按 Esc 退出。事先要把编辑器停在：战斗预设 → 技能 → 造物自定义技能 → 未分类页签。
# 用法：python animscrape.py <names.json：技能名列表> <out.jsonl> [从第几个开始]
# 技能名形如 AP_<资产编号>_<第几个>：某个造物的一个技能里一个名字都没有，说明它的动画排完了，后面的技能跳过。
# 每行：{"name": 技能名, "items": [[x, 文字], ...]}，另存一张这一排的截图 <out>.strips/<技能名>.jpg 供人核对。
# 要在交互桌面里跑（Win+R 启动批处理），不能从 SSH 跑。游戏窗口一旦不在前台（有人在用电脑）就停。
import json, os, sys, tempfile, time
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src'))
import playtest_runner as P
names = json.load(open(sys.argv[1], encoding='utf-8'))
out, first = sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 0
strips = out + '.strips'
os.makedirs(strips, exist_ok=True)
run = P.Run({'runDir': os.path.join(tempfile.gettempdir(), 'animscrape_run')})
game = run.focus('game')
left, top, right, bottom = game['rect']
at = lambda fx, fy: (left + fx * (right - left), top + fy * (bottom - top))
SEARCH, FIRST, EDIT = at(190 / 1600, 96 / 900), at(288 / 1600, 210 / 900), at(1493 / 1600, 858 / 900)
ROW = (*at(125 / 1600, 684 / 900), *at(1.0, 716 / 900))
finished = set()                  # creatures whose animations have run out: a skill of theirs showed no name
with open(out, 'a', encoding='utf-8') as f:
    for index in range(first, len(names)):
        name = names[index]
        if name.rsplit('_', 1)[0] in finished: continue
        if P.user.GetForegroundWindow() != game['hwnd']:
            f.write(json.dumps({'stopped': index, 'why': 'the game is no longer in front'}) + '\n')
            break
        run.click(*SEARCH); run.key('CTRL+A'); run.text(name); time.sleep(0.7)
        run.click(*FIRST); time.sleep(0.5)
        run.click(*EDIT); time.sleep(1.6)
        items = sorted([round(i['x'] - left), i['text']] for i in run.read_rect(ROW, 0.6))
        run.grab(tuple(round(v) for v in ROW)).convert('RGB').resize((1475, 32)).save(os.path.join(strips, name + '.jpg'), quality=85)
        f.write(json.dumps({'index': index, 'name': name, 'items': items}, ensure_ascii=False) + '\n'); f.flush()
        if not any('_' in text for _, text in items): finished.add(name.rsplit('_', 1)[0])
        run.key('ESC'); time.sleep(0.9)
    else:
        f.write(json.dumps({'done': True, 'count': len(names)}) + '\n')
