"""Target-bound SendInput operations for the game/editor capture worker."""
import ctypes as C
from ctypes import wintypes as W
import time


def operate(user, kernel, request, target, describe, require):
    hwnd = target['hwnd']
    action = request['action']
    user.SetForegroundWindow.argtypes = [W.HWND]
    user.SetForegroundWindow.restype = W.BOOL
    user.GetAncestor.argtypes = [W.HWND, W.UINT]
    user.GetAncestor.restype = W.HWND
    def active_family():
        current = user.GetForegroundWindow()
        return bool(current) and int(user.GetAncestor(current, 3) or current) == int(user.GetAncestor(hwnd, 3) or hwnd)
    if action == 'focus':
        if target['minimized']:
            user.ShowWindowAsync.argtypes = [W.HWND, C.c_int]
            user.ShowWindowAsync.restype = W.BOOL
            user.ShowWindowAsync(hwnd, 9)  # SW_RESTORE, only the validated target.
            for _ in range(20):
                time.sleep(0.05)
                restored = describe(hwnd)
                require(restored is not None and restored['windowId'] == target['windowId'],
                        'WINDOW_CHANGED', 'Target changed while restoring.')
                if not restored['minimized']:
                    break
            require(not restored['minimized'], 'RESTORE_FAILED', 'Windows did not restore the target.')
        user.SetForegroundWindow(hwnd)
        time.sleep(0.15)
        if int(user.GetForegroundWindow() or 0) != hwnd:
            # Temporarily share the foreground input queue; no global settings change.
            kernel.GetCurrentThreadId.restype = W.DWORD
            user.AttachThreadInput.argtypes = [W.DWORD, W.DWORD, W.BOOL]
            user.AttachThreadInput.restype = W.BOOL
            current_thread = kernel.GetCurrentThreadId()
            foreground_thread = user.GetWindowThreadProcessId(user.GetForegroundWindow(), None)
            target_thread = user.GetWindowThreadProcessId(hwnd, None)
            attached = []
            try:
                for thread in set((foreground_thread, target_thread)) - {0, current_thread}:
                    if user.AttachThreadInput(current_thread, thread, True):
                        attached.append(thread)
                user.BringWindowToTop.argtypes = [W.HWND]
                user.BringWindowToTop.restype = W.BOOL
                user.BringWindowToTop(hwnd)
                user.SetForegroundWindow(hwnd)
            finally:
                for thread in reversed(attached):
                    user.AttachThreadInput(current_thread, thread, False)
            time.sleep(0.15)
        require(int(user.GetForegroundWindow() or 0) == hwnd, 'FOCUS_FAILED', 'Windows did not foreground the target. Select the window manually and retry.')
        return {'focused': True, 'window': describe(hwnd)}
    require(target['rect'] == request.get('expectedRect'), 'WINDOW_CHANGED', 'Window moved/resized since capture. Capture again.')
    require(active_family(), 'WINDOW_NOT_FOREGROUND', 'Focus the target or its owning editor and capture it again before input.')
    require(target['title'] == request.get('expectedTitle'), 'WINDOW_CHANGED', 'Window title changed. Capture again.')

    class Mouse(C.Structure):
        _fields_ = [('dx', W.LONG), ('dy', W.LONG), ('mouseData', W.DWORD), ('dwFlags', W.DWORD), ('time', W.DWORD), ('dwExtraInfo', C.c_size_t)]
    class Keyboard(C.Structure):
        _fields_ = [('wVk', W.WORD), ('wScan', W.WORD), ('dwFlags', W.DWORD), ('time', W.DWORD), ('dwExtraInfo', C.c_size_t)]
    class Hardware(C.Structure):
        _fields_ = [('uMsg', W.DWORD), ('wParamL', W.WORD), ('wParamH', W.WORD)]
    class Payload(C.Union):
        _fields_ = [('mi', Mouse), ('ki', Keyboard), ('hi', Hardware)]
    class Input(C.Structure):
        _anonymous_ = ('data',)
        _fields_ = [('type', W.DWORD), ('data', Payload)]
    user.SendInput.argtypes = [W.UINT, C.POINTER(Input), C.c_int]
    user.SendInput.restype = W.UINT
    user.GetAsyncKeyState.argtypes = [C.c_int]
    user.GetAsyncKeyState.restype = C.c_short
    user.WindowFromPoint.argtypes = [W.POINT]
    user.WindowFromPoint.restype = W.HWND
    user.GetAncestor.argtypes = [W.HWND, W.UINT]
    user.GetAncestor.restype = W.HWND
    for key in (0x10, 0x11, 0x12, 0x5B, 0x5C):
        require(not user.GetAsyncKeyState(key) & 0x8000, 'MODIFIER_HELD', 'Release physical Shift/Ctrl/Alt/Windows keys before automation.')

    def foreground():
        require(active_family(), 'FOCUS_CHANGED', 'Target lost focus; input stopped. Reobserve before retrying.')

    def send(events):
        foreground()
        sequence = (Input * len(events))(*events)
        count = user.SendInput(len(events), sequence, C.sizeof(Input))
        require(count == len(events), 'INPUT_FAILED', f'SendInput delivered {count}/{len(events)} events. The target may run at a different integrity level; outcome may be partial.')

    def mouse(flags, x=0, y=0, data=0):
        event = Input(type=0)
        event.mi = Mouse(x, y, data & 0xffffffff, flags, 0, 0)
        return event

    def key_event(vk=0, scan=0, flags=0):
        event = Input(type=1)
        event.ki = Keyboard(vk, scan, flags, 0, 0)
        return event

    def point(x, y):
        rect = target['rect']
        require(0 <= x < rect['right']-rect['left'] and 0 <= y < rect['bottom']-rect['top'], 'POINT_OUTSIDE_WINDOW', 'Coordinates must be inside the observed window.')
        sx, sy = rect['left']+round(x), rect['top']+round(y)
        top = user.GetAncestor(user.WindowFromPoint(W.POINT(sx, sy)), 2)
        require(int(top or 0) == hwnd, 'POINT_OCCLUDED', 'Point belongs to another window or popup. Capture and target that window instead.')
        vx, vy = user.GetSystemMetrics(76), user.GetSystemMetrics(77)
        vw, vh = user.GetSystemMetrics(78), user.GetSystemMetrics(79)
        require(vx <= sx < vx+vw and vy <= sy < vy+vh, 'POINT_OFFSCREEN', 'Point is outside the desktop.')
        return mouse(0x8000 | 0x4000 | 1, round((sx-vx)*65535/(vw-1)), round((sy-vy)*65535/(vh-1)))

    kind = request['kind']
    if kind == 'click':
        flags = {'left': (2, 4), 'right': (8, 16), 'middle': (32, 64)}[request.get('button', 'left')]
        for _ in range(request.get('clickCount', 1)):
            # Give frame-polled game controls time to update their hover target.
            send([point(request['x'], request['y'])])
            time.sleep(0.06)
            send([mouse(flags[0])])
            try:
                time.sleep(0.06)
            finally:
                # Release our button even if focus changed during the short hold.
                release = (Input * 1)(mouse(flags[1]))
                user.SendInput(1, release, C.sizeof(Input))
            time.sleep(0.08)
    elif kind == 'key':
        mapping = {'CTRL': 0x11, 'CONTROL': 0x11, 'SHIFT': 0x10, 'ALT': 0x12, 'ENTER': 0x0D, 'RETURN': 0x0D, 'TAB': 9, 'ESCAPE': 0x1B, 'ESC': 0x1B, 'SPACE': 0x20, 'BACKSPACE': 8, 'DELETE': 0x2E, 'INSERT': 0x2D, 'HOME': 0x24, 'END': 0x23, 'PAGEUP': 0x21, 'PAGEDOWN': 0x22, 'LEFT': 0x25, 'UP': 0x26, 'RIGHT': 0x27, 'DOWN': 0x28}
        mapping.update({chr(k): k for k in range(65, 91)})
        mapping.update({str(k): 48+k for k in range(10)})
        mapping.update({f'F{k}': 0x6F+k for k in range(1, 13)})
        names = [s.strip().upper() for s in request['key'].split('+')]
        require(len(names) <= 4 and all(s in mapping for s in names), 'UNSUPPORTED_KEY', 'Use Ctrl/Shift/Alt, A-Z, 0-9, F1-F12 or navigation keys. Windows/system keys are unavailable.')
        codes = [mapping[n] for n in names]
        require(len(set(codes)) == len(codes), 'UNSUPPORTED_KEY', 'Duplicate keys are not allowed.')
        require(not (0x12 in codes and any(k in codes for k in [9, 0x73, 0x1B])) and not (0x11 in codes and 0x12 in codes), 'UNSUPPORTED_KEY', 'System switching/closing chords are unavailable.')
        hold_ms = request.get('holdMs', 60)
        require(isinstance(hold_ms, int) and 20 <= hold_ms <= 2000, 'INVALID_INPUT', 'Key hold must be 20–2000 ms.')
        send([key_event(vk=c) for c in codes])
        try:
            end = time.monotonic() + hold_ms / 1000
            while time.monotonic() < end:
                time.sleep(min(0.02, max(0, end-time.monotonic())))
                foreground()
        finally:
            releases = (Input * len(codes))(*[key_event(vk=c, flags=2) for c in reversed(codes)])
            user.SendInput(len(codes), releases, C.sizeof(Input))
    elif kind == 'text':
        # Unicode SendInput avoids changing the user's clipboard.
        text = request['text']
        require(not any(ord(c) < 32 for c in text), 'INVALID_TEXT', 'Text cannot contain control characters. Use key actions for Enter/Tab.')
        encoded = text.encode('utf-16-le')
        for offset in range(0, len(encoded), 64):
            events = []
            chunk = encoded[offset:offset+64]
            for i in range(0, len(chunk), 2):
                scan = int.from_bytes(chunk[i:i+2], 'little')
                events.extend([key_event(scan=scan, flags=4), key_event(scan=scan, flags=6)])
            send(events)
    elif kind == 'scroll':
        send([point(request['x'], request['y']), mouse(0x800, data=request['delta'])])
    elif kind == 'drag':
        start = point(request['x'], request['y'])
        point(request['toX'], request['toY'])
        send([start, mouse(2)])
        try:
            for step in range(1, 13):
                time.sleep(0.025)
                ratio = step/12
                send([point(request['x']+(request['toX']-request['x'])*ratio, request['y']+(request['toY']-request['y'])*ratio)])
        finally:
            # Release even if focus changed mid-drag, to avoid leaving mouse held.
            events = (Input * 1)(mouse(4))
            user.SendInput(1, events, C.sizeof(Input))
    else:
        require(False, 'INVALID_INPUT_KIND', 'Unknown input kind.')
    time.sleep(0.2)
    return {'inputSent': True, 'kind': kind, 'window': describe(hwnd), 'verification': 'Inspect the fresh screenshot; sent input alone does not establish success.'}
