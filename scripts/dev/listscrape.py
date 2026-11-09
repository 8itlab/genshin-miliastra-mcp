# listscrape.py：把编辑器里一个可滚动的列表读成文字。每一步：截下列表所在的屏幕区域 → 文字识别 → 滚轮往下几格，
# 直到连续三步读到的内容不变（到底了）或到最多步数。结果一步一行写进 <out>.jsonl（每行：步数、这一步读到的 [y, x, 文字]）。
# 用法：python listscrape.py <out.jsonl> <x0> <y0> <x1> <y1> <每步滚几格> <最多几步> [识别前缩放，默认 1] [frames]
# 坐标是屏幕物理像素。滚轮落在区域正中。要在交互桌面里跑（比如 Win+R 启动一个批处理），不能从 SSH 跑。
import json, math, os, sys, tempfile, time
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src'))
import playtest_runner as P
if len(sys.argv) < 8:  # 没给参数就读环境变量 LISTSCRAPE_ARGS 指的文件里的一行（Win+R 启动时不好带参数）
    sys.argv = [sys.argv[0]] + open(os.environ['LISTSCRAPE_ARGS'], encoding='utf-8').read().split()
out, x0, y0, x1, y1, notches, steps = sys.argv[1], *map(int, sys.argv[2:8])
factor = float(sys.argv[8]) if len(sys.argv) > 8 else 1
keep = len(sys.argv) > 9 and sys.argv[9] == 'frames'   # 第九个参数写 frames：每一步的截图都留下（用来裁缩略图）
run = P.Run({'runDir': os.path.join(tempfile.gettempdir(), 'listscrape_run')})
user = P.user
deadline = float(os.environ.get('MILIASTRA_CAPTURE_DEADLINE', '0'))
if not math.isfinite(deadline) or deadline <= time.time():
    raise SystemExit('Set MILIASTRA_CAPTURE_DEADLINE to the authorized UTC Unix deadline')
try:
    game = run.window('game')
except Exception as e:
    raise SystemExit('Cannot locate the authorized game window: ' + str(e))
def allowed():
    return time.time() < deadline and user.GetForegroundWindow() == game['hwnd'] and not os.path.exists(out + '.stop')
if not allowed():
    raise SystemExit('Game must already be foreground, deadline valid, and stop file absent')
vx, vy, vw, vh = (user.GetSystemMetrics(i) for i in (76, 77, 78, 79))
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
def wheel(n):
    if not allowed(): return False
    run._send(run._mouse(0x8000 | 0x4000 | 1, round((cx - vx) * 65535 / (vw - 1)), round((cy - vy) * 65535 / (vh - 1))))
    time.sleep(0.05)
    for _ in range(abs(n)):
        if not allowed(): return False
        run._send(run._mouse(0x0800, data=-120 if n > 0 else 120)); time.sleep(0.04)
    return allowed()
same, last, stopped, reached_end, collected = 0, None, False, False, 0
with open(out, 'w', encoding='utf-8') as f:
    for step in range(steps):
        if not allowed():
            stopped = True; break
        time.sleep(0.45)
        if not allowed():
            stopped = True; break
        items = sorted(([round(i['y']), round(i['x']), i['text']] for i in run.read_rect((x0, y0, x1, y1), factor)), key=lambda t: (t[0], t[1]))
        text = '|'.join(t[2] for t in items)
        if not allowed():
            stopped = True; break
        f.write(json.dumps({'step': step, 'items': items}, ensure_ascii=False) + '\n'); f.flush()
        collected += 1
        if keep or step % 25 == 0: run.grab((x0, y0, x1, y1)).convert('RGB').save(out + '.%03d.jpg' % step, quality=88)
        same = same + 1 if text == last else 0
        last = text
        if same >= 3:
            reached_end = True; break
        if not wheel(notches):
            stopped = True; break
    f.write(json.dumps({'done': True, 'steps': collected, 'completed': reached_end and not stopped,
        **({'stoppedReason': 'deadline, focus lost, or stop file'} if stopped else
           {'stoppedReason': 'step limit reached'} if not reached_end else {})}) + '\n')
