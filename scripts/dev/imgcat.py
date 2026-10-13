# imgcat.py: photographs the picture library of the editor's image control, page by page, one folder of pages for each
# of its categories. The library has to be open (界面控件组管理 > an image control > 引用素材资产) and the game in front.
# Coordinates are those of a 1600 x 900 view of the full screen.
import ctypes, os, sys, tempfile, time
from PIL import ImageGrab, ImageChops
ctypes.windll.shcore.SetProcessDpiAwareness(2)
u = ctypes.windll.user32
W, H = u.GetSystemMetrics(0), u.GetSystemMetrics(1)
S = W / 1600
OUT = os.path.join(os.environ.get('MILIASTRA_SCRATCH') or os.path.join(tempfile.gettempdir(), 'miliastra-dev'), 'imgcat')
os.makedirs(OUT, exist_ok=True)
def move(x, y): u.SetCursorPos(int(x * S), int(y * S)); time.sleep(0.12)
def click(x, y):
    move(x, y); u.mouse_event(2, 0, 0, 0, 0); time.sleep(0.06); u.mouse_event(4, 0, 0, 0, 0); time.sleep(0.5)
def wheel(x, y, notches):
    move(x, y)
    for _ in range(abs(notches)):
        u.mouse_event(0x0800, 0, 0, ctypes.c_ulong((-120 if notches > 0 else 120) & 0xFFFFFFFF), 0); time.sleep(0.02)
    time.sleep(0.9)
def grid():
    # The mouse off the grid first: over a picture it raises a label with the id, which would make two photographs of
    # the same rows differ.
    move(800, 517); time.sleep(0.3)
    return ImageGrab.grab(bbox=(int(272 * S), int(574 * S), int(1592 * S), int(872 * S)))
def same(a, b):
    d = ImageChops.difference(a.convert('L'), b.convert('L')).point(lambda v: 255 if v > 24 else 0)
    box = d.getbbox()
    return box is None or (box[2] - box[0]) * (box[3] - box[1]) < 60000
top = ['custom', 'function-mono', 'function-colour', 'play-mono', 'play-colour', 'decor-mono', 'decor-colour', 'plate-mono', 'plate-colour', 'shape']
bottom = [None, None, None, None, 'pad-focus', 'divider', 'glyph', 'skill', 'item', 'creature']
log = []
for state, names, first in (('top', top, 592.0), ('bottom', bottom, 594.0)):
    wheel(130, 760, -80 if state == 'top' else 80)
    for i, name in enumerate(names):
        if not name or name == 'custom':
            continue
        click(100, first + 28.5 * i)
        time.sleep(0.6)
        for k in range(6):
            wheel(600 + k * 100, 700 + k * 20, -120)
        last, page = None, 0
        while page < 30:
            shot = grid()
            # The list loads six rows at a time and stops at the end of what it has; it goes on once the mouse has
            # moved. Only a page that stays the same through three more tries, each from another spot, is the end.
            tries = 0
            while last is not None and same(shot, last) and tries < 3:
                tries += 1
                move(500 + 150 * tries, 700 + 20 * tries); time.sleep(0.8)
                wheel(600 + 130 * tries, 730 + 15 * tries, 23)
                shot = grid()
            if last is not None and same(shot, last):
                break
            shot.resize((1650, int(1650 * shot.size[1] / shot.size[0]))).save(os.path.join(OUT, '%s_%02d.jpg' % (name, page)), quality=80)
            last, page = shot, page + 1
            wheel(700 + (page % 4) * 120, 720 + (page % 3) * 25, 23)
        log.append('%s %d' % (name, page))
        open(os.path.join(OUT, 'log.txt'), 'w').write('\n'.join(log))
open(os.path.join(OUT, 'done.txt'), 'w').write('\n'.join(log))
