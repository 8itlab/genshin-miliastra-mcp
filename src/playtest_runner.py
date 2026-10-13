"""One-call playtest loop for the Miliastra sandbox.

Imports a candidate save through the official UI, subscribes the debug log,
plays for a fixed time while taking screenshots and sending scripted keys,
leaves the playtest and collects the official log file.

UI targets are located by on-screen text (OCR), not fixed pixels, so the flow
does not depend on resolution. Only three icon-only buttons use window
fractions. Progress is written to <runDir>/status.json after every step so a
caller can poll, and every step leaves a screenshot for diagnosis.

Usage: python playtest_runner.py <request.json>
"""
import ctypes as C
import glob
import hashlib
import json
import os
import queue
import re
import shutil
import sys
import threading
import time
from ctypes import wintypes as W
from pathlib import Path

from PIL import ImageGrab

user, kernel = C.windll.user32, C.windll.kernel32
try:
    C.windll.shcore.SetProcessDpiAwareness(2)
except Exception:
    pass

user.GetForegroundWindow.restype = W.HWND
user.SetForegroundWindow.argtypes = [W.HWND]
user.BringWindowToTop.argtypes = [W.HWND]
user.ShowWindow.argtypes = [W.HWND, C.c_int]
user.IsIconic.argtypes = [W.HWND]
user.GetWindowRect.argtypes = [W.HWND, C.POINTER(W.RECT)]
user.GetWindowThreadProcessId.argtypes = [W.HWND, C.POINTER(W.DWORD)]
kernel.OpenProcess.restype = W.HANDLE
kernel.CloseHandle.argtypes = [W.HANDLE]
kernel.QueryFullProcessImageNameW.argtypes = [W.HANDLE, W.DWORD, W.LPWSTR, C.POINTER(W.DWORD)]

GAME_EXES = {'yuanshen.exe', 'genshinimpact.exe'}
SANDBOX_EXE = 'beyondeditor.exe'
# Icon-only buttons, as fractions of the game window.
GRID_ICON = (25 / 1600, 16 / 900)
EXIT_ICON = (25 / 1600, 870 / 900)
CLOSE_ICON = (1580 / 1600, 17 / 900)  # top-right X of full-screen editor panels
SEARCH_BOX = (520 / 1600, 98 / 900)  # asset screen search field (no placeholder text to find)
FIRST_TILE = (418 / 1600, 160 / 900)  # first asset tile in the asset screen


class Failed(Exception):
    pass


class Ear:
    """Records what the machine plays while the level runs: the loopback of the default speaker, mono, 16 kHz.

    Nobody listens to a scripted playtest, so this is how a caller learns whether its sounds and music play at all and
    when: finish() writes a .wav a person can listen to and returns how loud each second was and the moments at which
    a sound began."""
    RATE = 16000

    def __init__(self):
        self.chunks, self.stop, self.error, self.started = [], False, None, None

    def run(self):
        try:
            import warnings
            warnings.filterwarnings('ignore')
            import soundcard
            speaker = soundcard.default_speaker()
            source = soundcard.get_microphone(id=str(speaker.name), include_loopback=True)
            with source.recorder(samplerate=self.RATE, channels=1) as recorder:
                self.started = time.time()
                while not self.stop:
                    self.chunks.append(recorder.record(numframes=self.RATE // 5))
        except Exception as error:  # no speaker, no soundcard module: the playtest goes on without a recording
            self.error = f'{type(error).__name__}: {error}'

    def start(self):
        import threading
        self.thread = threading.Thread(target=self.run, daemon=True)
        self.thread.start()

    def finish(self, path, play_start):
        import wave
        import numpy as np
        self.stop = True
        self.thread.join(timeout=5)
        if self.error or not self.chunks:
            return {'error': self.error or 'nothing was recorded'}
        data = np.concatenate(self.chunks)[:, 0]
        with wave.open(str(path), 'wb') as out:
            out.setnchannels(1)
            out.setsampwidth(2)
            out.setframerate(self.RATE)
            out.writeframes((np.clip(data, -1, 1) * 32767).astype('<i2').tobytes())
        offset = self.started - play_start          # the recording began this long after the level did
        db = lambda rms: round(20 * float(np.log10(max(rms, 1e-6))), 1)
        # Loudness of every second and of every tenth of a second, as dB below full scale (0 is as loud as it gets,
        # -120 is silence).
        second = [db(np.sqrt(np.mean(data[i:i + self.RATE] ** 2))) for i in range(0, len(data) - self.RATE + 1, self.RATE)]
        step = self.RATE // 10
        tenth = np.array([np.sqrt(np.mean(data[i:i + step] ** 2)) for i in range(0, len(data) - step + 1, step)])
        # A sound begins where a tenth of a second is at least 6 dB louder than the second before it and not silent.
        onsets = []
        for i in range(10, len(tenth)):
            before = float(np.median(tenth[i - 10:i]))
            if tenth[i] > 0.003 and tenth[i] > 2 * before and (not onsets or i / 10 + offset - onsets[-1]['at'] >= 0.4):
                onsets.append({'at': round(i / 10 + offset, 1), 'dB': db(tenth[i]), 'before': db(before)})
        heard = [s for s in second if s > -60]
        return {'file': str(path), 'seconds': round(len(data) / self.RATE, 1), 'startsAt': round(offset, 2),
                'heardSeconds': len(heard), 'loudestDb': max(second) if second else None, 'dbPerSecond': second, 'onsets': onsets[:200]}


class Run:
    def __init__(self, request):
        self.req = request
        self.dir = Path(request['runDir'])
        self.dir.mkdir(parents=True, exist_ok=True)
        self.steps, self.shots, self.started = [], [], time.time()
        self.state = 'running'
        self.result = {}
        self._ocr = None
        self.save()

    # ---- bookkeeping ----
    def save(self, error=None):
        data = {'state': self.state, 'startedAt': self.started, 'updatedAt': time.time(), 'steps': self.steps,
                'screenshots': self.shots, 'result': self.result, 'error': error}
        tmp = self.dir / 'status.json.tmp'
        tmp.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
        os.replace(tmp, self.dir / 'status.json')

    def step(self, name, **detail):
        self.steps.append({'at': round(time.time() - self.started, 1), 'step': name, **detail})
        self.save()

    # ---- windows ----
    def windows(self):
        found = []

        @C.WINFUNCTYPE(W.BOOL, W.HWND, W.LPARAM)
        def each(hwnd, _):
            if not user.IsWindowVisible(hwnd):
                return True
            pid = W.DWORD()
            user.GetWindowThreadProcessId(hwnd, C.byref(pid))
            handle = kernel.OpenProcess(0x1000, False, pid.value)
            if not handle:
                return True
            buf, size = C.create_unicode_buffer(1024), W.DWORD(1024)
            ok = kernel.QueryFullProcessImageNameW(handle, 0, buf, C.byref(size))
            kernel.CloseHandle(handle)
            exe = os.path.basename(buf.value).lower() if ok else ''
            if exe not in GAME_EXES and exe != SANDBOX_EXE:
                return True
            title = C.create_unicode_buffer(256)
            user.GetWindowTextW(hwnd, title, 256)
            rect = W.RECT()
            user.GetWindowRect(hwnd, C.byref(rect))
            found.append({'hwnd': hwnd, 'pid': pid.value, 'exe': exe, 'title': title.value,
                          'rect': (rect.left, rect.top, rect.right, rect.bottom), 'minimized': bool(user.IsIconic(hwnd))})
            return True
        user.EnumWindows(each, 0)
        return found

    def window(self, kind, required=True):
        for w in self.windows():
            if kind == 'game' and w['exe'] in GAME_EXES and w['title'] in ('原神', 'Genshin Impact'):
                return w
            if kind == 'sandbox' and w['exe'] == SANDBOX_EXE and w['title'] == '千星沙箱':
                return w
            if kind == 'log' and w['exe'] == SANDBOX_EXE and w['title'] == '日志':
                return w
            if kind == 'import' and w['exe'] in GAME_EXES and w['title'] == '导入存档':
                return w
        if required:
            raise Failed(f'找不到窗口：{kind}。请确认原神千星奇域和千星沙箱已打开。')
        return None

    def focus(self, kind):
        w = self.window(kind)
        hwnd = w['hwnd']
        if w['minimized']:
            user.ShowWindow(hwnd, 9)
            time.sleep(0.6)
        for _ in range(4):
            user.SetForegroundWindow(hwnd)
            time.sleep(0.2)
            if user.GetForegroundWindow() == hwnd:
                break
            # Windows refuses focus changes from background processes unless input queues are shared.
            me = kernel.GetCurrentThreadId()
            other = user.GetWindowThreadProcessId(user.GetForegroundWindow(), None)
            user.AttachThreadInput(me, other, True)
            user.BringWindowToTop(hwnd)
            user.SetForegroundWindow(hwnd)
            user.AttachThreadInput(me, other, False)
            time.sleep(0.2)
        if user.GetForegroundWindow() != hwnd:
            raise Failed(f'无法把窗口切到前台：{kind}')
        time.sleep(0.3)
        return self.window(kind)

    # ---- input ----
    class _Mouse(C.Structure):
        _fields_ = [('dx', W.LONG), ('dy', W.LONG), ('data', W.DWORD), ('flags', W.DWORD), ('time', W.DWORD), ('extra', C.c_size_t)]

    class _Key(C.Structure):
        _fields_ = [('vk', W.WORD), ('scan', W.WORD), ('flags', W.DWORD), ('time', W.DWORD), ('extra', C.c_size_t)]

    class _Union(C.Union):
        pass

    class _Input(C.Structure):
        pass

    def _send(self, *events):
        array = (self._Input * len(events))(*events)
        user.SendInput(len(events), array, C.sizeof(self._Input))

    def _mouse(self, flags, x=0, y=0, data=0):
        event = self._Input(type=0)
        event.u.mi = self._Mouse(x, y, data & 0xffffffff, flags, 0, 0)
        return event

    def scroll(self, kind, notches, at=(0.5, 0.5)):
        """Wheel over a window (its middle unless a fractional spot is given); positive notches scroll down, which
        zooms the editor camera out."""
        left, top, right, bottom = self.window(kind)['rect']
        vx, vy, vw, vh = (user.GetSystemMetrics(i) for i in (76, 77, 78, 79))
        x, y = left + (right - left) * at[0], top + (bottom - top) * at[1]
        self._send(self._mouse(0x8000 | 0x4000 | 1, round((x - vx) * 65535 / (vw - 1)), round((y - vy) * 65535 / (vh - 1))))
        for _ in range(abs(notches)):
            self._send(self._mouse(0x0800, data=-120 if notches > 0 else 120))
            time.sleep(0.03)
        time.sleep(0.5)

    def _key(self, vk=0, scan=0, flags=0):
        event = self._Input(type=1)
        event.u.ki = self._Key(vk, scan, flags, 0, 0)
        return event

    def click(self, x, y):
        vx, vy, vw, vh = (user.GetSystemMetrics(i) for i in (76, 77, 78, 79))
        nx, ny = round((x - vx) * 65535 / (vw - 1)), round((y - vy) * 65535 / (vh - 1))
        self._send(self._mouse(0x8000 | 0x4000 | 1, nx, ny))
        time.sleep(0.08)  # frame-polled game buttons need a moment to register hover
        self._send(self._mouse(2))
        time.sleep(0.06)
        self._send(self._mouse(4))
        time.sleep(0.25)

    KEYS = {'ESC': 0x1B, 'ESCAPE': 0x1B, 'ENTER': 0x0D, 'CTRL': 0x11, 'SHIFT': 0x10, 'SPACE': 0x20, 'TAB': 9,
            'LEFT': 0x25, 'UP': 0x26, 'RIGHT': 0x27, 'DOWN': 0x28, 'BACKSPACE': 8, 'DELETE': 0x2E}

    def _codes(self, chord):
        codes = []
        for name in chord.upper().split('+'):
            name = name.strip()
            code = self.KEYS.get(name) or (ord(name) if len(name) == 1 and name.isalnum() else None)
            if code is None:
                raise Failed(f'不支持的按键：{chord}')
            codes.append(code)
        return codes

    def key(self, chord, hold=0.06):
        codes = self._codes(chord)
        self._send(*[self._key(vk=c, scan=user.MapVirtualKeyW(c, 0)) for c in codes])
        time.sleep(hold)
        self._send(*[self._key(vk=c, scan=user.MapVirtualKeyW(c, 0), flags=2) for c in reversed(codes)])
        time.sleep(0.2)

    # During play a key goes down at its moment and comes up at another, with nothing waiting in between: a held
    # movement key no longer keeps other keys, screenshots and frames from happening (walk and strike at once), and a
    # tap no longer costs a third of a second of frames.
    def key_down(self, chord):
        codes = self._codes(chord)
        self._send(*[self._key(vk=c, scan=user.MapVirtualKeyW(c, 0)) for c in codes])
        self._held = getattr(self, '_held', {})
        self._held[chord] = codes

    def key_up(self, chord):
        codes = getattr(self, '_held', {}).pop(chord, None) or self._codes(chord)
        self._send(*[self._key(vk=c, scan=user.MapVirtualKeyW(c, 0), flags=2) for c in reversed(codes)])

    def release_keys(self):
        for chord in list(getattr(self, '_held', {})):
            self.key_up(chord)

    def text(self, value):
        events = []
        data = value.encode('utf-16-le')
        for i in range(0, len(data), 2):
            unit = int.from_bytes(data[i:i + 2], 'little')
            events += [self._key(scan=unit, flags=4), self._key(scan=unit, flags=6)]
        for i in range(0, len(events), 40):
            self._send(*events[i:i + 40])
            time.sleep(0.03)
        time.sleep(0.2)

    # ---- seeing ----
    def grab(self, rect):
        return ImageGrab.grab(bbox=rect, all_screens=True)

    def shot(self, kind, label, t=None):
        w = self.window(kind, required=False)
        if not w or w['minimized']:
            return None
        image = self.grab(w['rect']).convert('RGB')
        side = int(self.req.get('screenshotWidth') or 1600)
        image.thumbnail((side, side))
        name = f'{len(self.shots):02d}-{label}.jpg'
        image.save(self.dir / name, quality=85)
        self.shots.append({'file': str(self.dir / name), 'label': label, 'wallTime': time.time(),
                           **({'playSeconds': t} if t is not None else {})})
        self.save()
        return name

    def frame(self, start):
        """One frame of a burst: grabbed and made small now, written to disk by another thread, so that the next one
        can follow a tenth of a second later. It is listed with the screenshots under its play second (two decimals)."""
        w = self.window('game', required=False)
        if not w or w['minimized']:
            return
        at = time.time()
        # Measured on a 4K screen (2026-10-12): the grab itself takes 113 ms whatever part of the screen is asked for,
        # a resize to an exact width 40 ms more, a reduction by a whole factor 8 ms. So a frame is made smaller by a
        # whole factor (it comes out at least burstWidth wide) and nothing else is done to it here: about eight frames
        # a second.
        image = self.grab(w['rect'])
        if image.mode != 'RGB':
            image = image.convert('RGB')
        factor = max(1, max(image.size) // int(self.req.get('burstWidth') or 1280))
        if factor > 1:
            image = image.reduce(factor)
        play = round(at - start, 2)
        name = f'{len(self.shots):02d}-b{int(play):03d}.jpg'
        if self._frames is None:
            self._frames = queue.Queue()
            def write():
                while True:
                    item = self._frames.get()
                    if item is None:
                        return
                    try:
                        item[0].save(item[1], quality=82)
                    except Exception:
                        pass
            self._writer = threading.Thread(target=write, daemon=True)
            self._writer.start()
        self._frames.put((image, self.dir / name))
        self.shots.append({'file': str(self.dir / name), 'label': f'b{int(play):03d}', 'wallTime': at, 'playSeconds': play, 'burst': True})

    def read(self, kind, region=None, scale=None):
        """OCR a window (or a fractional region of it). Returns [{text, x, y, box}] in screen pixels."""
        if self._ocr is None:
            from rapidocr_onnxruntime import RapidOCR
            self._ocr = RapidOCR()
        import numpy as np
        w = self.window(kind)
        # Screen pixels are only this window's when it is in front; the fullscreen game also minimizes on focus loss.
        if (w['minimized'] or user.GetForegroundWindow() != w['hwnd']):
            w = self.focus(kind)
        left, top, right, bottom = w['rect']
        if region:
            width, height = right - left, bottom - top
            left, top, right, bottom = (left + round(region[0] * width), top + round(region[1] * height),
                                        left + round(region[2] * width), top + round(region[3] * height))
        # The game renders large text; halving keeps it legible and makes OCR several times faster.
        return self.read_rect((left, top, right, bottom), scale or (0.5 if kind == 'game' and right - left > 1700 else 1))

    def read_rect(self, rect, factor=1):
        import numpy as np
        if self._ocr is None:
            from rapidocr_onnxruntime import RapidOCR
            self._ocr = RapidOCR()
        left, top = rect[0], rect[1]
        image = self.grab(tuple(round(v) for v in rect)).convert('RGB')
        if factor != 1:
            image = image.resize((round(image.width * factor), round(image.height * factor)))
        found, _ = self._ocr(np.asarray(image)[:, :, ::-1])
        items = []
        for box, text, _score in found or []:
            xs, ys = [p[0] for p in box], [p[1] for p in box]
            items.append({'text': text.strip(), 'x': left + (min(xs) + max(xs)) / 2 / factor, 'y': top + (min(ys) + max(ys)) / 2 / factor,
                          'box': (left + min(xs) / factor, top + min(ys) / factor, left + max(xs) / factor, top + max(ys) / factor)})
        return items

    @staticmethod
    def plain(text):
        """OCR drops or mangles underscores and spacing; compare on letters and digits only."""
        return re.sub(r'[\W_]+', '', text).lower()

    @staticmethod
    def match(items, wanted, exact=False):
        hits = [i for i in items if (i['text'] == wanted if exact else wanted in i['text'])]
        return min(hits, key=lambda i: len(i['text'])) if hits else None

    def wait_text(self, kind, wanted, timeout=30, exact=False, region=None, scale=None, required=True):
        """Wait until any of the wanted texts is visible; returns (text, item)."""
        wanted = [wanted] if isinstance(wanted, str) else wanted
        end = time.time() + timeout
        while True:
            items = self.read(kind, region, scale)
            for text in wanted:
                hit = self.match(items, text, exact)
                if hit:
                    return text, hit
            if time.time() > end:
                if required:
                    self.shot(kind, 'timeout')
                    # A window that stopped answering shows its last picture for ever: say that instead of the text
                    # that never came (the game hung in the editor after a navigation bake on 2026-10-12).
                    stuck = self.window(kind, required=False)
                    if stuck and stuck.get('hwnd') and user.IsHungAppWindow(stuck['hwnd']):
                        raise Failed('游戏窗口没有响应（卡死了）：请关掉原神重新打开，回到主世界后再试。（已截图）')
                    raise Failed(f'等待界面文字超时：{" / ".join(wanted)}（已截图）')
                return None, None
            time.sleep(0.7)

    def click_text(self, kind, wanted, **options):
        text, hit = self.wait_text(kind, wanted, **options)
        self.click(hit['x'], hit['y'])
        return text

    def click_fraction(self, kind, fraction):
        left, top, right, bottom = self.window(kind)['rect']
        self.click(left + fraction[0] * (right - left), top + fraction[1] * (bottom - top))

    # ---- official saves and logs ----
    def roots(self):
        base = Path(os.path.expanduser('~')) / 'AppData' / 'LocalLow' / 'miHoYo'
        return [p for p in (base / '原神' / 'BeyondLocal', base / 'Genshin Impact' / 'BeyondLocal') if p.exists()]

    def maps(self):
        files = {}
        for root in self.roots():
            for pattern in ('*/Beyond_Local_Save_Level/*.gil', '*/Beyond_Local_Save_Level/*/*.gil'):
                for path in glob.glob(str(root / pattern)):
                    if 'Temp' not in path and 'Backup' not in path:
                        files[path] = os.path.getmtime(path)
        return files

    def logs(self):
        return {path: os.path.getmtime(path) for root in self.roots() for path in glob.glob(str(root / '*/Beyond_Debug_Log/**/*.gia'), recursive=True)}

    def keep_front(self):
        """Keys go to whatever window is in front. Another window taking the foreground during play (a remote-desktop
        viewer did once: the ESC at the end went to it and the run was lost) is put right and noted in the steps."""
        w = self.window('game')
        if user.GetForegroundWindow() != w['hwnd']:
            self.step('game-was-not-in-front')
            self.focus('game')

    def wait_watching(self, until):
        """Wait until the given time, watching the game window meanwhile for a level that ends by itself.
        The result screen (重新挑战 at the bottom right) stays, so its first sighting gives the time. When the server
        ended the level for load it also says so in one line near the top for a few seconds
        (关卡内所用资产总量过大，导致服务器负载过高) and nowhere else, so that line is looked for until a little
        after the result screen has come up."""
        while True:
            # Look first, then sleep: a key that is held for seconds keeps this from running, and the line may have
            # come and gone by the next slice if the look only came after a sleep.
            ended = self.result.get('levelEndedAt')
            now = round(time.time() - self.result.get('playStartedAt', time.time()), 1)
            # A look takes time (about a second on a 4K screen): one is begun only when it will be over before the
            # next key or screenshot is due. Begun whenever half a second was left, looks made keys come up to a
            # second late, and a scripted walk ended a metre from where it should (seen 2026-10-12).
            cost = getattr(self, '_look_cost', 1.0)
            if until - time.time() > cost + 0.4 and not (ended is not None and (self.result.get('serverMessage') or now - ended > 8)):
                began = time.time()
                try:
                    width = self.window('game')['rect'][2] - self.window('game')['rect'][0]
                    items = self.read('game', scale=min(0.5, 1280 / max(width, 1)) if ended is None else 1)
                    said = [i['text'] for i in items if any(word in i['text'] for word in ('负载', '过高', '过大', '服务器'))]
                    if said and not self.result.get('serverMessage'):
                        self.result['serverMessage'] = said[0]
                        self.shot('game', 'server-message', t=now)
                        self.step('server-message', text=said[0])
                    if ended is None and any('重新挑战' in i['text'] for i in items):
                        self.result['levelEndedAt'] = now
                        self.shot('game', 'level-ended', t=now)
                        self.step('level-ended', playSeconds=now)
                except Exception as error:
                    if not self.result.get('watchError'):
                        self.result['watchError'] = str(error)[:200]
                self._look_cost = max(time.time() - began, 0.8 * cost)
                self._last_look = time.time()
            elif ended is None and time.time() - getattr(self, '_last_look', self.result.get('playStartedAt', 0)) > 12:
                # A script with a key every second never leaves room for a whole look: a fight that was lost at second
                # 86 was played on to second 284, where the keys ran out (2026-10-13). So every twelve seconds at the
                # latest the corner where the result screen has its 重新挑战 is read by itself, a quarter of the window,
                # whatever is due; a key may come a fraction of a second late for it.
                self._last_look = time.time()
                try:
                    if any('重新挑战' in i['text'] for i in self.read('game', region=(0.5, 0.7, 1, 1))):
                        self.result['levelEndedAt'] = now
                        self.shot('game', 'level-ended', t=now)
                        self.step('level-ended', playSeconds=now, seenBy='corner-look')
                except Exception as error:
                    if not self.result.get('watchError'):
                        self.result['watchError'] = str(error)[:200]
            left = until - time.time()
            if left <= 0:
                return
            time.sleep(min(0.6, left))

    # ---- the flow ----
    def open_level_menu(self):
        """The grid icon toggles the level menu, so only click it when the menu is closed. A click right after a panel
        was closed can go unanswered (the menu stayed shut once, after a navigation bake, 2026-10-12): look again and
        click again a few times before giving up."""
        self.focus('game')
        for attempt in range(6):
            text, _ = self.wait_text('game', '试玩', exact=True, timeout=1 if attempt == 0 else 5, required=False)
            if text:
                return
            # The menu can be open with its list scrolled down: the tiles at its top (试玩 among them) are then out of
            # sight, and clicking the grid icon would only close and open it for ever (a blind test lost three calls
            # to this, 2026-10-13, after somebody had scrolled the list by hand). The line 奇匠等级 at the foot of
            # the menu is there however far the list is scrolled: wheel the list back to its top.
            foot, _ = self.wait_text('game', '奇匠等级', region=(0, 0.9, 0.3, 1), timeout=1, required=False)
            if foot:
                self.scroll('game', -60, at=(0.12, 0.5))
                self.step('level-menu-scrolled-back')
                continue
            # A manager that fills the window (界面控件组管理 and its kind) has no grid icon of its own: its title stands
            # where the icon would be. The icon at its top right folds it away into a tab and the editor is back.
            # Folded away, the same words stand on its tab further right (from 0.115 of the width on; the title of the
            # full window ends at 0.08): a save that was stored with such a tab is not a manager in the way (the
            # official sample 客户端脚本 is one, and was taken for it six times over, 2026-10-13).
            full, _ = self.wait_text('game', ['界面控件组管理', '主镜头管理'], region=(0, 0, 0.09, 0.04), timeout=1, required=False)
            if full:
                self.click_fraction('game', (1580 / 1600, 16 / 900))
                self.step('manager-screen-folded-away', title=full)
                time.sleep(1.5)
                continue
            self.click_fraction('game', GRID_ICON)
            time.sleep(0.8)
        text, _ = self.wait_text('game', '试玩', exact=True, timeout=10, required=False)
        if not text:
            self.shot('game', 'no-level-menu')
            raise Failed('在编辑器里没能打开左上角的关卡菜单（菜单里找不到“试玩”，已截图）。编辑器里可能开着别的面板或弹窗：关掉它，或者手动退出编辑器回到存档列表，再调一次。')

    LEVEL_SETTINGS_MINIMISE = (1231 / 1600, 224 / 900)  # the icon at the top right of the 关卡设置 panel

    def bake_stamp(self):
        """The line under the navigation mesh that says when it was last baked (上次烘焙:暂无记录, or a date and a time)."""
        for item in self.read('game', region=(0.2, 0.2, 0.8, 0.8), scale=1):
            if '上次烘焙' in item['text']:
                return re.sub(r'\s+', '', item['text'])
        return None

    def bake_navigation(self):
        """Bakes the navigation mesh of the level that is open in the editor (关卡设置 > 地形导航 > 开始烘焙).

        A complex creature's tactics that choose their own points (wandering, pursuit, fleeing) find none on a level
        that was never baked, and the creature stands still; walking to a given point works either way (measured
        2026-10-11). The bake is kept with the save in the editor, so it is done after the import, before the playtest."""
        self.focus('game')
        text, hit = self.wait_text('game', '关卡设置', region=(0, 0, 0.6, 0.05), timeout=3, required=False)
        if hit:
            self.click(hit['x'], hit['y'])
        else:
            self.open_level_menu()
            self.click_text('game', '关卡设置', exact=True, timeout=10)
        self.click_text('game', '地形导航', exact=True, timeout=15)
        time.sleep(0.8)
        before = self.bake_stamp()
        self.click_text('game', '开始烘焙', exact=True, timeout=10)
        self.click_text('game', '保存后开始', timeout=10)
        self.step('navigation-bake-started', before=before)
        started, settled = time.time(), 0
        while True:
            time.sleep(2)
            items = self.read('game', region=(0.2, 0.2, 0.8, 0.8), scale=1)
            texts = [i['text'] for i in items]
            stamp = next((re.sub(r'\s+', '', t) for t in texts if '上次烘焙' in t), None)
            idle = any(t.strip() == '开始烘焙' for t in texts) and not any('保存后开始' in t or '烘焙中' in t for t in texts)
            # Done: the stamp is a date and, where there was one before, a new one; the stamp only counts minutes, so a
            # bake within the same minute as the last is taken as done once the panel has been idle for a while.
            fresh = bool(stamp) and '暂无' not in stamp and (stamp != before or time.time() - started > 25)
            settled = settled + 1 if idle and fresh else 0
            if settled >= 2:
                break
            if time.time() - started > 720:
                self.shot('game', 'navigation-bake-timeout')
                raise Failed('寻路网格烘焙超过 12 分钟没有完成（已截图）。')
        self.result['navigationBaked'] = {'stamp': stamp, 'seconds': round(time.time() - started, 1)}
        self.shot('game', 'navigation-baked')
        self.click_fraction('game', self.LEVEL_SETTINGS_MINIMISE)
        time.sleep(0.6)
        self.step('navigation-baked', seconds=self.result['navigationBaked']['seconds'])

    def editor_panel_shown(self):
        """The editor's own panel in the game window: 摆放 at the top left."""
        text, _ = self.wait_text('game', '摆放', exact=True, region=(0, 0, 0.2, 0.12), timeout=1.5, required=False)
        return bool(text)

    def leave_editor(self):
        # The editor normally shows its tool window (千星沙箱, a process of its own). That window can be closed by hand
        # while the game stays in the editor, so without it the game window itself is looked at.
        tool_window = bool(self.window('sandbox', required=False))
        self.focus('game')
        if not tool_window and not self.editor_panel_shown():
            return
        # The sandbox process is also running while the game shows the save list (我的奇域), with no editor to leave:
        # the clicks below would close the list and drop back into the main game.
        text, _ = self.wait_text('game', '导入存档', timeout=1.5, required=False)
        if text:
            return
        self.open_level_menu()
        self.click_fraction('game', EXIT_ICON)
        # With unsaved changes the editor asks 保存提示 (放弃修改 / 保存) and stays open until answered.
        # Saving keeps the creator's work; discarding it silently would not be ours to decide.
        text, hit = self.wait_text('game', '保存', exact=True, timeout=4, required=False)
        if text:
            self.click(hit['x'], hit['y'])
            self.step('saved-before-leaving')
        end = time.time() + 60
        while self.window('sandbox', required=False) and time.time() < end:
            time.sleep(1)
        while not tool_window and self.editor_panel_shown() and time.time() < end:
            time.sleep(1)
        self.step('left-editor', toolWindow=tool_window)

    def open_save_list(self):
        self.focus('game')
        for _ in range(12):
            text, hit = self.wait_text('game', ['导入存档', '我的奇域'], timeout=4, required=False)
            if text == '导入存档':
                return
            if text == '我的奇域':
                self.click(hit['x'], hit['y'])
                self.wait_text('game', '导入存档', timeout=45)
                return
            # At the daily reset (04:00) the game returns to the lobby and shows the daily reward screens; they have to be
            # clicked away before the menu can open.
            daily, spot = self.wait_text('game', ['点击领取今日', '双击跳过', '点击空白区域继续'], timeout=1, required=False)
            if daily:
                left, top, right, bottom = self.window('game')['rect']
                self.click(left + (right - left) * 0.16, top + (bottom - top) * 0.84)
                self.step('daily-reward-screen-dismissed', text=daily)
                time.sleep(2)
                continue
            # In the main game ESC opens Paimon's menu, and the 千星奇域 entries (我的奇域 among them) are at the bottom
            # of its grid, below the fold: wheel down over the grid and look again.
            paimon, _ = self.wait_text('game', ['冒险等阶', '世界等级'], timeout=1, required=False)
            if paimon:
                self.scroll('game', 25, at=(0.22, 0.65))
                self.step('scrolled-main-menu')
                continue
            self.key('ESC')  # lobby or main game: opens the menu; still loading: harmless
            time.sleep(2.5)
        self.shot('game', 'no-menu')
        raise Failed('没能打开千星奇域菜单。请把游戏停在主世界、千星奇域大厅、存档列表或编辑器里再试。')

    def import_save(self):
        candidate = os.path.abspath(self.req['mapPath'])
        if not os.path.isfile(candidate):
            raise Failed(f'候选存档不存在：{candidate}')
        # Save cards show their time to the minute, and the import is found afterwards as the newest card. A save
        # written in this same minute (the one that was just edited and saved) would tie with it, so let the minute turn.
        stamp = re.compile(r'(\d{4})年(\d{1,2})月(\d{1,2})日\D*(\d{1,2})\D(\d{2})')
        shown = [tuple(int(v) for v in m.groups()) for m in (stamp.search(i['text']) for i in self.read('game', scale=1)) if m]
        now = time.localtime()
        if shown and max(shown) >= (now.tm_year, now.tm_mon, now.tm_mday, now.tm_hour, now.tm_min):
            self.step('waited-for-next-minute')
            time.sleep(62 - now.tm_sec)
        before = self.maps()
        self.click_text('game', '导入存档', timeout=10)
        end = time.time() + 15
        while not self.window('import', required=False):
            if time.time() > end:
                raise Failed('没有弹出导入存档的文件选择框。')
            time.sleep(0.4)
        self.focus('import')
        self.text(candidate)
        self.key('ENTER')
        end = time.time() + 40
        new = []
        while not new:
            if time.time() > end:
                self.shot('game', 'import-failed')
                raise Failed('导入后没有出现新的官方存档。')
            time.sleep(1)
            new = [p for p in self.maps() if p not in before]
        self.result['officialSave'] = new[0]
        self.step('imported', officialSave=new[0])
        return new[0]

    def open_imported(self, official):
        self.focus('game')
        self.wait_text('game', '导入存档', timeout=20)
        time.sleep(1)
        items = self.read('game', scale=1)  # timestamps are small; read at full resolution
        stamp = re.compile(r'(\d{4})年(\d{1,2})月(\d{1,2})日\D*(\d{1,2})\D(\d{2})')
        cards = []
        for item in items:
            found = stamp.search(item['text'])
            if found:
                cards.append((tuple(int(v) for v in found.groups()), item))
        edits = [i for i in items if '编辑' in i['text']]
        if not cards or not edits:
            self.shot('game', 'save-list')
            raise Failed('没能在存档列表里读出存档时间或“编辑”按钮。')
        newest = max(cards, key=lambda c: c[0])[1]
        # Each card's edit button sits below and to the right of its timestamp.
        below = [e for e in edits if e['y'] > newest['y'] and e['x'] > newest['box'][0]]
        button = min(below or edits, key=lambda e: (e['y'] - newest['y']) ** 2 + (e['x'] - newest['x']) ** 2)
        self.click(button['x'], button['y'])
        self.wait_editor()
        saved = os.path.getmtime(official)
        self.key('CTRL+S')
        end = time.time() + 12
        while os.path.getmtime(official) == saved:
            if time.time() > end:
                self.shot('game', 'wrong-save')
                raise Failed('保存后新导入的存档文件没有变化，打开的可能不是刚导入的那个存档。')
            time.sleep(0.5)
        self.step('opened-and-saved')

    def wait_editor(self):
        # The save list can be opened from inside the editor (the second icon of the level menu): a save is then
        # still open, and 编辑 on another one first asks 加载存档 "是否退出，并加载 ...？". Say yes: the save that is
        # open was saved when it was opened or played, and the one asked for is what the caller wants.
        text, _ = self.wait_text('game', '加载存档', timeout=2.5, required=False)
        if text:
            _, ok = self.wait_text('game', '确认', exact=True, timeout=5)
            self.click(ok['x'], ok['y'])
            self.step('confirmed-loading-another-save')
            # The editor that was open goes away first; do not take its window for the new one.
            gone = time.time() + 8
            while self.window('sandbox', required=False) and time.time() < gone:
                time.sleep(1)
        end = time.time() + 90
        while not self.window('sandbox', required=False):
            if time.time() > end:
                self.shot('game', 'editor-not-opened')
                raise Failed('点了“编辑”但编辑器没有打开。')
            time.sleep(1)
        # The sandbox takes the foreground while it starts. Changing focus before it has
        # finished drawing leaves its windows blank for the whole session, so let it settle.
        time.sleep(10)
        self.focus('game')
        self.wait_text('game', '摆放', timeout=150)
        time.sleep(1.5)

    def sandbox_drawn(self):
        text, _ = self.wait_text('sandbox', '窗口', exact=True, region=(0, 0, 0.3, 0.05), scale=1, timeout=6, required=False)
        return bool(text)

    def reopen_last_save(self):
        """Leave and re-enter the save that is open; a fresh sandbox process redraws its windows."""
        self.leave_editor()
        self.open_save_list()
        time.sleep(1)
        items = self.read('game', scale=1)
        tag = self.match(items, '上次打开')
        edits = [i for i in items if '编辑' in i['text']]
        if not tag or not edits:
            self.shot('game', 'save-list')
            raise Failed('没能在存档列表里找到“上次打开”的存档。')
        button = min((e for e in edits if e['y'] > tag['y']), key=lambda e: (e['y'] - tag['y']) ** 2 + (e['x'] - tag['x']) ** 2)
        self.click(button['x'], button['y'])
        self.wait_editor()

    def last_save_note(self):
        return self.dir.parent / 'last-official.json'

    @staticmethod
    def digest(path):
        try:
            return hashlib.sha256(Path(path).read_bytes()).hexdigest()
        except OSError:
            return None

    def candidate_key(self):
        # What the candidate is, for telling "the same build again": the digest of the file, or the key the caller
        # gives when it adds something of its own to a copy on every call (the playtest probe: the copy differs by a
        # few bytes each time though level, track and teleports are the same).
        return self.req.get('candidateKey') or self.digest(self.req['mapPath'])

    def remember_save(self, official, played=False):
        # played: this save was made from the candidate of this request, so that the same candidate asked for again
        # can be played without importing it again (same_save_open). A save that was opened for building (open_map:
        # the scene is imported into it, and the settings that follow start from its file) is remembered as one to
        # keep: a playtest must not write its candidate over it.
        try:
            self.last_save_note().write_text(json.dumps({'officialSave': official, 'candidate': self.candidate_key() if played else None, 'keep': not played}), encoding='utf-8')
        except OSError:
            pass

    def same_save_open(self):
        """The candidate is byte for byte the one this workspace played last, and the editor still has that save open:
        there is nothing to import or to open. Returns the save's path, or None (the caller then goes the long way).
        A second playtest of the same build (other keys, other moments for the screenshots) starts two minutes sooner."""
        try:
            note = json.loads(self.last_save_note().read_text(encoding='utf-8'))
        except (OSError, ValueError):
            return None
        official, known = note.get('officialSave'), note.get('candidate')
        if not official or not known or not os.path.isfile(official) or known != self.candidate_key():
            return None
        if not self.window('sandbox', required=False):
            return None
        try:
            self.focus('game')
            if not self.editor_panel_shown():
                return None
            # Saving rewrites the file of the save that is open: if this one's does not change, another save is open.
            saved = os.path.getmtime(official)
            self.key('CTRL+S')
            end = time.time() + 8
            while os.path.getmtime(official) == saved:
                if time.time() > end:
                    self.step('same-save-not-the-open-one')
                    return None
                time.sleep(0.5)
        except Failed:
            return None
        self.result['officialSave'] = official
        self.result['sameSave'] = True
        self.step('same-save-still-open', officialSave=official)
        return official

    def replace_last_save(self):
        """Write the candidate over the save imported last by this workspace and open that save again.
        Returns its path, or None when this did not work out (the caller then imports)."""
        try:
            note = json.loads(self.last_save_note().read_text(encoding='utf-8'))
            official = note['officialSave']
        except (OSError, ValueError, KeyError):
            return None
        # Only a save that a playtest of this workspace made itself is written over. One that was opened for building,
        # or one remembered by a version of this tool that did not say which it was (no candidate noted), is kept: a
        # blind test lost the clean copy of its finished level to a playtest this way (2026-10-13).
        if note.get('keep') or not note.get('candidate'):
            self.step('kept-the-save-that-was-opened-for-building')
            return None
        candidate = os.path.abspath(self.req['mapPath'])
        if not os.path.isfile(official) or not os.path.isfile(candidate):
            return None
        # What the save held, to put back when it turns out not to be the one that opens.
        try:
            held = Path(official).read_bytes()
        except OSError:
            return None

        def put_back():
            try:
                Path(official).write_bytes(held)
            except OSError:
                pass
        try:
            shutil.copyfile(candidate, official)
            self.open_save_list()
            time.sleep(1)
            items = self.read('game', scale=1)
            tag = self.match(items, '上次打开')
            edits = [i for i in items if '编辑' in i['text']]
            if not tag or not edits:
                put_back()
                self.step('replace-save-not-found')
                return None
            button = min((e for e in edits if e['y'] > tag['y']), key=lambda e: (e['y'] - tag['y']) ** 2 + (e['x'] - tag['x']) ** 2)
            self.click(button['x'], button['y'])
            self.wait_editor()
            saved = os.path.getmtime(official)
            self.key('CTRL+S')
            end = time.time() + 12
            while os.path.getmtime(official) == saved:
                if time.time() > end:
                    # The save that opened is another one (somebody opened a different save since). The editor is
                    # open on it now: leave it, so that the import that follows starts from the save list.
                    put_back()
                    self.step('replace-save-not-the-open-one')
                    self.leave_editor()
                    return None
                time.sleep(0.5)
        except Failed as error:
            put_back()
            self.step('replace-save-failed', error=str(error)[:120])
            try:
                self.leave_editor()
            except Failed:
                pass
            return None
        self.result['officialSave'] = official
        self.result['replacedSave'] = True
        self.step('replaced-and-opened', officialSave=official)
        return official

    def open_log_window(self):
        """Show the sandbox log window and return its “选择单位” label.

        The menu entry is a toggle and the sandbox may restore the window by itself a few
        seconds after starting, so the only reliable check is reading the window's text.
        """
        # With a large graph the sandbox is slow to answer (the window once failed to appear in three tries with 2898
        # nodes), so later tries wait longer.
        for attempt in range(5):
            if self.window('log', required=False):
                self.focus('log')
                text, label = self.wait_text('log', '选择单位', scale=1, timeout=5 + attempt * 3, required=False)
                if text:
                    return label
            self.focus('sandbox')
            _, menu = self.wait_text('sandbox', '窗口', exact=True, region=(0, 0, 0.3, 0.05), scale=1, timeout=10)
            self.click(menu['x'], menu['y'])
            time.sleep(0.8)
            # The dropdown is a separate layered window; read the screen area under the menu title instead.
            line = menu['box'][3] - menu['box'][1]
            hit = self.match(self.read_rect((menu['x'] - line * 3, menu['y'] + line, menu['x'] + line * 22, menu['y'] + line * 22)), '日志', exact=True)
            if not hit:
                self.shot('sandbox', 'no-log-menu')
                raise Failed('“窗口”菜单里没有找到“日志”。')
            self.click(hit['x'], hit['y'])
            end = time.time() + 8 + attempt * 6
            while not self.window('log', required=False) and time.time() < end:
                time.sleep(0.4)
            time.sleep(1.5)
        self.shot('sandbox', 'no-log-window')
        # Seen three times in some sixty runs (2026-10-11 and 12): the window stays a faint outline over the sandbox
        # and its text cannot be read. The same request went through when it was simply sent again, which starts a
        # fresh sandbox; so do that here once, by leaving the save and entering it again, before giving up.
        if not getattr(self, '_reopened_for_log', False):
            self._reopened_for_log = True
            self.step('log-window-blank-reopening-save')
            self.reopen_last_save()
            return self.open_log_window()
        raise Failed('日志窗口打不开（已截图，重进存档后再试一次也不行）。这种情况偶尔出现，原样再调一次 playtest_start 通常就好。')

    def subscribe_log(self):
        # graphNames: the level is usually several small graphs, each on its own entity; the log shows only the ticked ones.
        names = [n for n in (self.req.get('graphNames') or []) if n] or ([self.req.get('graphName')] if self.req.get('graphName') else [])
        scripts = bool(self.req.get('clientScriptLog'))
        if not names and not scripts:
            self.step('log-skipped', reason='没有提供 graphName，不订阅日志')
            return
        if not self.sandbox_drawn():
            self.step('sandbox-blank', action='重新进入存档')
            self.reopen_last_save()
            if not self.sandbox_drawn():
                self.shot('sandbox', 'sandbox-blank')
                raise Failed('千星沙箱窗口显示不正常（空白）。请手动重开沙箱后再试。')
        label = self.open_log_window()
        clears = [i for i in self.read('log', scale=1) if i['text'].endswith('清空')]
        if clears:
            clear = min(clears, key=lambda i: i['x'])  # the left one resets the selection, the right one wipes log lines
            self.click(clear['x'], clear['y'])
        # The first graph is found the careful way (typed into the filter, its folders opened). With the filter emptied
        # again the open folders list every graph, and the others are ticked from one reading of the list; searching
        # for each by itself took nine seconds a graph, a minute and a half for ten. Whatever the one reading does not
        # settle (a name below the fold, a count that does not come out right) goes the careful way.
        began = time.time()
        if names:
            self.tick_log_graph(label, names[0], 1)
        rest = names[1:]
        if rest and os.environ.get('MILIASTRA_LOG_TICK_ONE_BY_ONE') != '1':
            ticked = self.tick_log_graphs_listed(label, rest)
            if ticked is None:
                self.step('log-ticking-one-by-one')
                clears = [i for i in self.read('log', scale=1) if i['text'].endswith('清空')]
                if clears:
                    clear = min(clears, key=lambda i: i['x'])
                    self.click(clear['x'], clear['y'])
                for count, name in enumerate(names, 1):
                    self.tick_log_graph(label, name, count)
            else:
                count = 1 + len(ticked)
                for name in [n for n in rest if n not in ticked]:
                    count += 1
                    self.tick_log_graph(label, name, count)
        else:
            for count, name in enumerate(rest, 2):
                self.tick_log_graph(label, name, count)
        if scripts:
            self.tick_client_scripts(label)
        self.result['logTickSeconds'] = round(time.time() - began, 1)
        self.click_text('log', '确认选择', scale=1, timeout=5)
        self.shot('log', 'log-subscribed')
        self.step('log-subscribed', graphNames=names, clientScripts=scripts)

    def tick_client_scripts(self, label):
        """Tick the row 客户端脚本 of the log window: what the Lua client scripts print and where they fail (game 7.1).
        It is one row for all scripts, the last of the list, under the two groups of graphs: with the filter emptied
        and the list wheeled to its end it is in sight."""
        line = label['box'][3] - label['box'][1]
        self.click(label['x'] + line * 4, label['y'] + line * 2.6)  # search box under the label
        self.key('CTRL+A')
        time.sleep(0.3)
        self.key('BACKSPACE')
        time.sleep(0.2)
        self.key('ENTER')
        time.sleep(1)
        left, top, right, bottom = self.window('log')['rect']
        row = None
        for attempt in range(4):
            self.scroll('log', 40, at=(0.18, 0.6))
            rows = [i for i in self.read('log', region=(0, 0, 0.38, 1), scale=1) if self.plain(i['text']) == '客户端脚本' and i['y'] > label['y'] + line * 4.5]
            if rows:
                row = max(rows, key=lambda i: i['y'])
                break
        if not row:
            self.shot('log', 'no-client-script-row')
            self.step('client-script-log-not-found')
            return
        self.click(left + (right - left) * 0.33, row['y'])
        time.sleep(0.4)
        self.step('client-script-log-ticked')

    def tick_log_graphs_listed(self, label, names):
        """Tick the graphs of `names` that the unfiltered list shows, after one graph was ticked the careful way.
        Returns the names it ticked, or None when the count the window shows afterwards is not what it should be
        (the caller then clears the selection and ticks every graph by itself)."""
        line = label['box'][3] - label['box'][1]
        self.click(label['x'] + line * 4, label['y'] + line * 2.6)  # search box under the label
        self.key('CTRL+A')
        time.sleep(0.3)
        self.key('BACKSPACE')
        time.sleep(0.2)
        self.key('ENTER')
        time.sleep(1)
        loose = lambda text: self.plain(text).replace('i', 'l').replace('1', 'l').replace('0', 'o')
        wanted = {loose(n): n for n in names}
        if len(wanted) != len(names):
            return None  # two names the screen cannot tell apart
        items = self.read('log', region=(0, 0, 0.38, 1), scale=1)
        rows = [i for i in items if i['y'] > label['y'] + line * 4.5 and '已选择' not in i['text']]
        left, top, right, bottom = self.window('log')['rect']
        column = left + (right - left) * 0.342
        ticked = []
        for row in sorted(rows, key=lambda i: i['y']):
            name = wanted.get(loose(row['text']))
            # A row low in the window may be cut by its edge: leave it to the careful way.
            if name and name not in ticked and row['y'] < bottom - line * 2:
                self.click(column, row['y'])
                time.sleep(0.25)
                ticked.append(name)
        if not ticked:
            return []
        text, _ = self.wait_text('log', [f'已选择{1 + len(ticked)}/', f'已选择 {1 + len(ticked)}/'], scale=1, timeout=3, required=False)
        if not text:
            self.shot('log', 'listed-ticks-miscounted')
            return None
        self.step('log-ticked-from-list', count=len(ticked))
        return ticked

    def tick_log_graph(self, label, name, count):
        """Find one graph in the log window's list and tick it; `count` is how many are ticked after this one."""
        line = label['box'][3] - label['box'][1]
        # The box filters by substring, so the name is typed without its leading underscores: the first characters typed
        # right after the selection shortcut have twice arrived changed (_G as GG, _G as _y), and a wrong letter finds
        # nothing. What was typed is read back and typed again unless it is exactly the name.
        needle = name.lstrip('_')
        for attempt in range(4):
            self.click(label['x'] + line * 4, label['y'] + line * 2.6)  # search box under the label
            self.key('CTRL+A')
            time.sleep(0.3)
            self.key('BACKSPACE')
            time.sleep(0.2)
            self.text(needle)
            typed = ''.join(i['text'] for i in self.read('log', region=(0, 0, 0.38, 1), scale=1) if abs(i['y'] - (label['y'] + line * 2.6)) < line * 1.2)
            # The magnifier in the box is sometimes read as a Q.
            if self.plain(typed) in (self.plain(needle), 'q' + self.plain(needle)):
                break
            self.step('retyping-graph-name', seen=typed)
        self.key('ENTER')
        time.sleep(1)
        # The row is found by reading the screen, and a small l, a capital I and a 1 (or an O and a 0) look alike there:
        # a graph named HlStage was read as HIStage and "not found" (2026-10-11). Compare with those folded together.
        loose = lambda text: self.plain(text).replace('i', 'l').replace('1', 'l').replace('0', 'o')
        prefix = loose(name)[:12]
        folder_name = lambda text: re.sub(r'\d+', '', self.plain(text))
        opened, target = set(), None
        for _ in range(10):
            items = self.read('log', region=(0, 0, 0.38, 1), scale=1)
            # Rows start well below the search box, which itself shows the typed name.
            rows = sorted((i for i in items if i['y'] > label['y'] + line * 4.5 and '已选择' not in i['text']), key=lambda i: i['y'])
            hits = [i for i in rows if prefix in loose(i['text'])]
            if hits:
                target = hits[0]
                break
            folders = [i for i in rows if folder_name(i['text']) and folder_name(i['text']) not in opened and '清空' not in i['text'] and '确认' not in i['text']]
            if not folders:
                break
            folder = folders[0]
            opened.add(folder_name(folder['text']))
            # Clicking a row only selects it; the Right key then expands it and does nothing if it is already open.
            self.click(folder['x'], folder['y'])
            self.key('RIGHT')
            time.sleep(0.6)
        if not target:
            self.shot('log', 'graph-not-found')
            raise Failed(f'日志窗口里找不到节点图：{name}')
        # Checkboxes share one column near the right edge of the left pane.
        left, top, right, bottom = self.window('log')['rect']
        column = left + (right - left) * 0.342
        self.click(column, target['y'])
        time.sleep(0.5)
        text, _ = self.wait_text('log', [f'已选择{count}/', f'已选择 {count}/'], scale=1, timeout=4, required=False)
        if not text:
            self.shot('log', 'not-selected')
            raise Failed(f'没能勾选日志节点图 {name}（已截图）。')

    def play(self):
        duration = float(self.req.get('durationSeconds', 60))
        events = [(float(s), 'shot', None) for s in self.req.get('screenshotsAt', [])]
        # Bursts: {from, to, everyMs}, a frame every everyMs between two moments of the play. A frame whose turn comes
        # too late is left out rather than made up for, so that keys stay on time; at most 600 frames a run.
        self._frames = self._writer = None
        frames = 0
        for burst in self.req.get('bursts', []):
            every = max(60, float(burst.get('everyMs', 125))) / 1000
            at = float(burst['from'])
            while at < float(burst['to']) and frames < 600:
                events.append((round(at, 3), 'frame', {'every': every}))
                at += every
                frames += 1
        # A key input is two events, down and up; one with repeat {every, until} is that pair again and again.
        for i in self.req.get('inputs', []):
            if not i.get('key'):
                events.append((float(i['at']), 'key', i))
                continue
            hold = min(float(i.get('holdMs', 120)), 60000) / 1000
            repeat, at = i.get('repeat'), float(i['at'])
            times = [at]
            if repeat:
                every, until = max(0.2, float(repeat['every'])), float(repeat['until'])
                while times[-1] + every <= until and len(times) < 2000:
                    times.append(round(times[-1] + every, 3))
                hold = min(hold, every * 0.8)
            for t in times:
                events.append((t, 'keydown', i))
                events.append((round(t + hold, 3), 'keyup', i))
        # recordVideo {from, to}: the Xbox Game Bar records the game window between two seconds of the play.
        video = self.req.get('recordVideo')
        if video:
            events += [(float(video['from']), 'video', 'start'), (float(video['to']), 'video', 'stop')]
        self._recording = False
        events += [(float(s), 'read', None) for s in self.req.get('readTextAt', [])]
        events.sort(key=lambda e: e[0])
        known_logs = self.logs()
        self.open_level_menu()
        self.click_text('game', '试玩', exact=True, timeout=10)
        # The editor checks the level before a playtest and lists what is wrong in a 校验失败 dialog (too many nodes in a
        # graph, a creature without combat attributes, ...). Pass its lines on: they are the answer to why nothing started.
        text, hit = self.wait_text('game', ['直接上传', '开始游戏', '校验失败'], timeout=30)
        if text == '直接上传':
            self.click(hit['x'], hit['y'])
            text, hit = self.wait_text('game', ['开始游戏', '校验失败'], timeout=90)
        if text == '校验失败':
            items = self.read('game', scale=1)
            # The dialog is a panel in the middle of the window; text of the editor behind it shows through at the sides.
            left, top, right, bottom = self.window('game')['rect']
            inside = lambda i: left + (right - left) * 0.2 < i['x'] < left + (right - left) * 0.8
            lines = [i['text'] for i in items if i['y'] > hit['y'] + 10 and inside(i) and i['text'] not in ('关闭',)]
            self.shot('game', 'validation-failed')
            self.result['validation'] = lines
            # Leave the editor usable: an open dialog would hide the 试玩 button from the next run.
            close = [i for i in items if i['text'] == '关闭' and i['y'] > hit['y'] + 10]
            if close:
                self.click(close[0]['x'], close[0]['y'])
                self.step('validation-dialog-closed')
            raise Failed('试玩校验失败：' + '；'.join(lines[:8]))
        self.click(hit['x'], hit['y'])
        self.step('playtest-requested')
        # The level is ready when the loading art is gone and the default HP bar is readable.
        end = time.time() + 90
        while time.time() < end:
            items = self.read('game', region=(0.3, 0.88, 0.7, 1))
            if any(re.search(r'\d{2,}\s*/\s*\d{2,}', i['text']) for i in items):
                break
            time.sleep(0.5)
        start = time.time()
        self.result['playStartedAt'] = start
        ear = None
        if self.req.get('recordAudio'):
            ear = Ear()
            ear.start()
        self.step('playing')
        for at, kind, data in events:
            if at > duration:
                break
            # The level reached its result screen: nothing more will happen, so the rest of the script is left out
            # and the run ends six seconds later instead of waiting out the planned time.
            ended = self.result.get('levelEndedAt')
            if ended is not None and time.time() - start > ended + 6:
                self.result['endedEarly'] = True
                break
            if kind == 'keyup':
                # A key comes up on time or as soon as possible after; nothing is looked at while one waits to.
                left = start + at - time.time()
                if left > 0:
                    self.wait_watching(start + at)
                self.key_up(data['key'])
                continue
            self.wait_watching(start + at)
            self.keep_front()
            # A key that comes late puts a scripted walk in the wrong place: the result says which did.
            late = round(time.time() - (start + at), 2)
            if kind in ('key', 'keydown') and late > 0.3 and len(self.result.get('inputsLate', [])) < 40:
                self.result.setdefault('inputsLate', []).append({'at': at, 'lateSeconds': late})
            if kind == 'keydown':
                self.key_down(data['key'])
                continue
            if kind == 'video':
                if (data == 'start') != self._recording:
                    self.game_bar_record()
                    self._recording = data == 'start'
                    self.step('video-' + ('started' if self._recording else 'stopped'), playSeconds=round(time.time() - start, 1))
            elif kind == 'frame':
                if time.time() - (start + at) > data['every'] * 0.9:
                    self.result['burstFramesDropped'] = self.result.get('burstFramesDropped', 0) + 1
                else:
                    self.frame(start)
            elif kind == 'shot':
                self.shot('game', f't{int(at):03d}', t=round(time.time() - start, 1))
            elif kind == 'read':
                # The text on the screen at this moment, top to bottom: what a shop or a dialog says, without an image.
                items = sorted(self.read('game', scale=1), key=lambda i: (round(i['y'] / 12), i['x']))
                self.result.setdefault('screenTexts', []).append({'at': at, 'lines': [i['text'] for i in items][:120]})
            elif data.get('clickText'):
                # A mouse click on a word that is on the screen (a button of a shop, a dialog). Missing words are reported.
                text, hit = self.wait_text('game', data['clickText'], timeout=2, scale=1, required=False)
                if hit:
                    self.click(hit['x'], hit['y'])
                else:
                    self.result.setdefault('inputsMissed', []).append({'at': at, 'clickText': data['clickText']})
            elif data.get('click'):
                self.click_fraction('game', data['click'])
            elif data.get('look'):
                # The mouse moved without a button, as a player turns the camera: so many pixels to the right and
                # down, in twenty small steps over a third of a second.
                dx, dy = (int(v) for v in data['look'])
                for i in range(20):
                    self._send(self._mouse(0x0001, round(dx * (i + 1) / 20) - round(dx * i / 20), round(dy * (i + 1) / 20) - round(dy * i / 20)))
                    time.sleep(0.016)
            else:
                # A tap is held 120 ms (it was 60): long enough to outlast a stutter of the game.
                self.key(data['key'], hold=min(float(data.get('holdMs', 120)), 5000) / 1000)
        self.release_keys()
        ended = self.result.get('levelEndedAt')
        self.wait_watching(start + (min(duration, ended + 6) if ended is not None else duration))
        self.keep_front()
        if self._recording:
            self.game_bar_record()
            self._recording = False
            self.step('video-stopped', playSeconds=round(time.time() - start, 1))
        if self._frames is not None:
            self._frames.put(None)
            self._writer.join(60)
        self.shot('game', 'end', t=round(time.time() - start, 1))
        if ear:
            self.result['audio'] = ear.finish(self.dir / 'audio.wav', start)
            self.step('audio-recorded', **{k: self.result['audio'].get(k) for k in ('seconds', 'heardSeconds', 'error') if self.result['audio'].get(k) is not None})
        # A screen that is open in the level (a shop, a dialog) takes the first ESC for itself; the menu comes with the next.
        for attempt in range(4):
            self.key('ESC')
            text, hit = self.wait_text('game', ['中断挑战', '离开'], timeout=15 if attempt == 3 else 4, required=attempt == 3)
            if hit:
                break
        self.click(hit['x'], hit['y'])
        if text == '中断挑战':
            self.click_text('game', '离开', timeout=30)
        self.step('left-playtest')
        end = time.time() + 40
        log = None
        while time.time() < end and not log:
            time.sleep(1.5)
            fresh = [p for p, m in self.logs().items() if p not in known_logs or m > known_logs[p]]
            if fresh:
                size = os.path.getsize(fresh[0])
                time.sleep(1.5)
                if os.path.getsize(fresh[0]) == size:
                    log = max(fresh, key=os.path.getmtime)
        if log:
            shutil.copyfile(log, self.dir / 'session-log.gia')
            self.result['logFile'] = str(self.dir / 'session-log.gia')
            self.result['officialLog'] = log
        else:
            self.result['logFile'] = None
            self.result['logNote'] = '没有生成运行日志。日志需要先订阅节点图，且关卡里要有打印。'
        self.step('log-collected', found=bool(log))
        if video:
            self.collect_video(start)

    def game_bar_record(self):
        """Win+Alt+R: the Xbox Game Bar starts or stops recording the window in front (the game)."""
        for vk in (0x5B, 0x12, 0x52):
            user.keybd_event(vk, 0, 0, 0)
            time.sleep(0.05)
        time.sleep(0.1)
        for vk in (0x52, 0x12, 0x5B):
            user.keybd_event(vk, 0, 2, 0)
            time.sleep(0.05)

    def collect_video(self, play_start):
        """The Game Bar writes its recordings to Videos\\Captures; the one made during this play is copied to the run."""
        folder = Path(os.path.expanduser('~')) / 'Videos' / 'Captures'
        end, found = time.time() + 20, None
        while time.time() < end and not found:
            fresh = [p for p in glob.glob(str(folder / '*.mp4')) if os.path.getmtime(p) > play_start]
            if fresh:
                newest = max(fresh, key=os.path.getmtime)
                size = os.path.getsize(newest)
                time.sleep(1.5)
                if os.path.getsize(newest) == size and size > 0:
                    found = newest
            else:
                time.sleep(1)
        if found:
            target = self.dir / 'video.mp4'
            shutil.copyfile(found, target)
            self.result['video'] = {'file': str(target), 'bytes': os.path.getsize(target), 'recordedAs': found}
        else:
            self.result['video'] = {'file': None, 'note': '没有找到录像。录像靠系统自带的 Xbox Game Bar（Win+Alt+R）：先确认它已开启（设置 → 游戏 → Xbox Game Bar），并且录像存到“视频\\捕获”文件夹。'}
        self.step('video-collected', found=bool(found))

    def import_assets(self):
        if not self.window('sandbox', required=False):
            raise Failed('要先在编辑器里打开目标存档，再导入资产。')
        self.focus('game')
        text, _ = self.wait_text('game', '导入与转存', timeout=1, required=False)
        if not text:  # the asset screen may still be open from an earlier attempt
            self.open_level_menu()
            self.click_text('game', '资产导入导出管理', timeout=8)
        self.click_text('game', '加载外部资产', timeout=15)
        # The confirmation dialog repeats the button text next to “打开目录”; click that one.
        _, folder_button = self.wait_text('game', '打开目录', timeout=10)
        confirm = [i for i in self.read('game') if '加载外部资产' in i['text']]
        button = min(confirm, key=lambda i: abs(i['y'] - folder_button['y']))
        self.click(button['x'], button['y'])
        end = time.time() + 90
        while True:
            time.sleep(1)
            items = self.read('game')
            if not self.match(items, '加载中') and self.match(items, '资产包', exact=True):
                break
            if time.time() > end:
                self.shot('game', 'load-timeout')
                raise Failed('加载外部资产超时，或导入目录里没有资产包。')
        self.click_text('game', '资产包', exact=True, timeout=5)
        time.sleep(0.8)
        for pack in self.req['packs']:
            # Tile labels are tiny and truncated, so filter with the search box and take the first tile.
            self.click_fraction('game', SEARCH_BOX)
            self.key('CTRL+A')
            self.text(pack)
            self.key('ENTER')
            time.sleep(1)
            self.click_fraction('game', FIRST_TILE)
            time.sleep(0.5)
            chosen = lambda: any('1' in i['text'] for i in self.read('game', region=(0, 0.9, 0.3, 1), scale=1) if '已选择' in i['text'])
            if not chosen():
                # A file with a single piece is not listed as a pack: the editor shows it under 实体.
                self.click_text('game', '实体', exact=True, timeout=5)
                time.sleep(0.8)
                self.click_fraction('game', FIRST_TILE)
                time.sleep(0.5)
                if not chosen():
                    self.shot('game', 'pack-not-found')
                    raise Failed(f'资产包和实体两个列表里都找不到或选不中：{pack}')
                single = True
            else:
                single = False
            self.shot('game', f'selected-{pack}')
            self.click_text('game', '转存所选资产', timeout=5)
            self.wait_text('game', '取消', exact=True, timeout=10)
            self.click_text('game', '确认', exact=True, timeout=5)
            # The transfer finishes some time after the dialog closes; leaving the screen earlier drops it.
            # The “转存成功” toast is the only completion signal, and it only stays for a few seconds.
            end, done, closed_at = time.time() + 120, False, None
            while time.time() < end and not done:
                items = self.read('game')
                done = bool(self.match(items, '转存成功'))
                if not done and not self.match(items, '取消', exact=True):
                    closed_at = closed_at or time.time()
                    if time.time() - closed_at > 12:
                        break  # toast may have been missed between reads; the save check below decides
                    time.sleep(0.3)
            if not done and closed_at is None:
                self.shot('game', 'transfer-timeout')
                raise Failed('转存资产超时。')
            time.sleep(2)
            self.step('pack-imported', pack=pack, listedUnder='实体' if single else '资产包')
            if single:
                self.click_text('game', '资产包', exact=True, timeout=5)
                time.sleep(0.8)
        time.sleep(1)
        self.click_fraction('game', CLOSE_ICON)
        time.sleep(1)
        saves = self.maps()
        self.key('CTRL+S')
        time.sleep(2.5)
        # The editor reports nothing we can read back, so confirm against the save file itself.
        changed = [p for p, m in self.maps().items() if m != saves.get(p)]
        if not changed:
            self.shot('game', 'not-saved')
            raise Failed('保存后存档文件没有变化，导入可能没有生效。')
        # The editor silently drops pieces it does not accept and still reports success,
        # so check every piece name against the saved file.
        data = open(max(changed, key=os.path.getmtime), 'rb').read()
        dropped = {}
        for pack, names in (self.req.get('expect') or {}).items():
            gone = [name for name in names if name.encode('utf-8') not in data]
            if len(gone) == len(names):
                self.shot('game', 'not-in-save')
                raise Failed(f'资产包 {pack} 的物件一个都没有进存档（界面可能仍显示转存成功）。')
            if gone:
                dropped[pack] = gone
        self.result['droppedPieces'] = dropped
        self.step('assets-saved', packs=self.req['packs'], verifiedInSave=bool(self.req.get('expect')),
                  dropped={pack: len(names) for pack, names in dropped.items()})
        if self.req.get('overview', True):
            time.sleep(1.5)
            self.scroll('game', 45)
            self.shot('game', 'overview', t=0)

    @staticmethod
    def monitors_on():
        """How many monitors the desktop is actually shown on. With none (the monitor switched off or in deep standby, a
        machine reached only by remote control) Windows keeps a desktop, but nothing drawn through the graphics card is
        shown any more: the game's window stays empty and the editor stops answering (2026-10-12: a round hung this way
        when the monitor went off at midnight, and every later start of the game showed no picture)."""
        class Device(C.Structure):
            _fields_ = [('cb', W.DWORD), ('DeviceName', W.WCHAR * 32), ('DeviceString', W.WCHAR * 128), ('StateFlags', W.DWORD),
                        ('DeviceID', W.WCHAR * 128), ('DeviceKey', W.WCHAR * 128)]
        count, i = 0, 0
        while True:
            adapter = Device(); adapter.cb = C.sizeof(Device)
            if not user.EnumDisplayDevicesW(None, i, C.byref(adapter), 0):
                return count
            i += 1
            if not adapter.StateFlags & 1:      # not part of the desktop
                continue
            j = 0
            while True:
                monitor = Device(); monitor.cb = C.sizeof(Device)
                if not user.EnumDisplayDevicesW(adapter.DeviceName, j, C.byref(monitor), 0):
                    break
                count += monitor.StateFlags & 1
                j += 1

    def run(self):
        try:
            # MILIASTRA_IGNORE_NO_MONITOR=1 skips this check, for a setup where the count is wrong and the game does draw.
            if self.monitors_on() < 1 and os.environ.get('MILIASTRA_IGNORE_NO_MONITOR') != '1':
                raise Failed('这台电脑现在没有接通的显示器（显示器关了，或者进了深度待机）。没有显示器时游戏画不出画面，导入、打开存档和试玩都做不了。请打开显示器后再试。')
            if self.req.get('action') == 'import_assets':
                self.import_assets()
                self.state = 'succeeded'
                self.save()
                return
            if self.req.get('action') == 'open_map':
                self.leave_editor()
                self.open_save_list()
                official = self.import_save()
                self.open_imported(official)
                # The save a later playtest of this workspace writes over is the one imported last, this one.
                self.remember_save(official)
                self.state = 'succeeded'
                self.save()
                return
            if self.req.get('mapPath') and self.req.get('replaceSave') and self.same_save_open():
                pass
            elif self.req.get('mapPath'):
                self.leave_editor()
                # replaceSave: the candidate is written over the save this workspace imported last, which is then
                # opened again, instead of being imported as one more save (an import and, often, a wait for the
                # minute to turn; and a save list that fills up). When that save cannot be found or opened this way,
                # the candidate is imported as usual.
                official = self.replace_last_save() if self.req.get('replaceSave') else None
                if not official:
                    self.open_save_list()
                    official = self.import_save()
                    self.open_imported(official)
                self.remember_save(official, played=True)
            elif not self.window('sandbox', required=False):
                raise Failed('没有提供 mapPath，且当前不在编辑器里。')
            if self.req.get('bakeNavigation'):
                self.bake_navigation()
            self.subscribe_log()
            self.play()
            self.state = 'succeeded'
            self.save()
        except Failed as error:
            self.state = 'failed'
            self.save(error=str(error))
        except Exception as error:  # keep the caller informed instead of dying silently
            import traceback
            self.state = 'failed'
            self.save(error=f'{type(error).__name__}: {error}\n{traceback.format_exc()[-1500:]}')


Run._Union._fields_ = [('mi', Run._Mouse), ('ki', Run._Key)]
Run._Input._fields_ = [('type', W.DWORD), ('u', Run._Union)]

if __name__ == '__main__':
    Run(json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))).run()
