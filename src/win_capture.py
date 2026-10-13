"""Windows 10 capture worker. JSON stdin/stdout; no WGC or IsBorderRequired.

Window discovery/capture and explicit input, restricted to the game and its editor.
Pillow window capture uses PrintWindow; screen mode uses visible desktop pixels.
Input actions are delegated to win_input after target validation. No settings changes.
"""
import ctypes as C
from ctypes import wintypes as W
import io
import json
from pathlib import Path
import sys
import time
import base64


class CaptureError(Exception):
    def __init__(self, code, message, details=None):
        self.code = code
        self.details = details or {}
        super().__init__(message)


def require(condition, code, message):
    if not condition:
        raise CaptureError(code, message)


def main(request):
    require(sys.platform == "win32", "UNSUPPORTED_PLATFORM", "Window capture requires Windows.")
    user = C.WinDLL("user32", use_last_error=True)
    kernel = C.WinDLL("kernel32", use_last_error=True)
    user.GetWindowRect.argtypes = [W.HWND, C.POINTER(W.RECT)]
    user.GetWindowRect.restype = W.BOOL
    user.GetClientRect.argtypes = [W.HWND, C.POINTER(W.RECT)]
    user.GetClientRect.restype = W.BOOL
    user.ClientToScreen.argtypes = [W.HWND, C.POINTER(W.POINT)]
    user.ClientToScreen.restype = W.BOOL
    user.GetWindowThreadProcessId.argtypes = [W.HWND, C.POINTER(W.DWORD)]
    user.GetWindowThreadProcessId.restype = W.DWORD
    user.GetWindowTextLengthW.argtypes = [W.HWND]
    user.GetWindowTextLengthW.restype = C.c_int
    user.GetWindowTextW.argtypes = [W.HWND, W.LPWSTR, C.c_int]
    user.GetWindowTextW.restype = C.c_int
    for name in ["IsWindowVisible", "IsIconic", "IsWindow"]:
        getattr(user, name).argtypes = [W.HWND]
        getattr(user, name).restype = W.BOOL
    user.GetForegroundWindow.restype = W.HWND
    user.GetAncestor.argtypes = [W.HWND, W.UINT]
    user.GetAncestor.restype = W.HWND
    user.OpenInputDesktop.argtypes = [W.DWORD, W.BOOL, W.DWORD]
    user.OpenInputDesktop.restype = W.HANDLE
    user.GetUserObjectInformationW.argtypes = [W.HANDLE, C.c_int, W.LPVOID, W.DWORD, C.POINTER(W.DWORD)]
    user.GetUserObjectInformationW.restype = W.BOOL
    user.CloseDesktop.argtypes = [W.HANDLE]
    user.CloseDesktop.restype = W.BOOL
    desktop = user.OpenInputDesktop(0, False, 1)  # DESKTOP_READOBJECTS
    require(bool(desktop), "DESKTOP_UNAVAILABLE", "Cannot access the interactive desktop. Unlock Windows and retry.")
    try:
        name = C.create_unicode_buffer(256)
        needed = W.DWORD()
        require(user.GetUserObjectInformationW(desktop, 2, name, C.sizeof(name), C.byref(needed)),
                "DESKTOP_UNAVAILABLE", "Cannot determine interactive desktop state.")
        require(name.value.lower() == "default", "DESKTOP_LOCKED", "The active desktop is locked or protected. Unlock Windows and retry.")
    finally:
        user.CloseDesktop(desktop)
    kernel.OpenProcess.argtypes = [W.DWORD, W.BOOL, W.DWORD]
    kernel.OpenProcess.restype = W.HANDLE
    kernel.QueryFullProcessImageNameW.argtypes = [W.HANDLE, W.DWORD, W.LPWSTR, C.POINTER(W.DWORD)]
    kernel.QueryFullProcessImageNameW.restype = W.BOOL
    kernel.CloseHandle.argtypes = [W.HANDLE]
    kernel.CloseHandle.restype = W.BOOL
    # Per-monitor physical coordinates; only changes this short-lived worker.
    try:
        user.SetProcessDpiAwarenessContext.argtypes = [W.HANDLE]
        user.SetProcessDpiAwarenessContext.restype = W.BOOL
        user.SetProcessDpiAwarenessContext(W.HANDLE(-4))
    except AttributeError:
        user.SetProcessDPIAware()
    allowed = {"yuanshen.exe", "genshinimpact.exe", "beyondeditor.exe"}

    def process_info(hwnd):
        pid = W.DWORD()
        user.GetWindowThreadProcessId(hwnd, C.byref(pid))
        handle = kernel.OpenProcess(0x1000, False, pid.value)
        if not handle:
            return pid.value, ""
        try:
            size = W.DWORD(32768)
            name = C.create_unicode_buffer(size.value)
            if kernel.QueryFullProcessImageNameW(handle, 0, name, C.byref(size)):
                return pid.value, name.value
            return pid.value, ""
        finally:
            kernel.CloseHandle(handle)

    def describe(hwnd):
        pid, exe = process_info(hwnd)
        rect = W.RECT()
        if not user.GetWindowRect(hwnd, C.byref(rect)):
            return None
        size = user.GetWindowTextLengthW(hwnd) + 1
        title = C.create_unicode_buffer(size)
        user.GetWindowTextW(hwnd, title, size)
        foreground = user.GetForegroundWindow()
        active_family = bool(foreground) and int(user.GetAncestor(foreground, 3) or foreground) == int(user.GetAncestor(hwnd, 3) or hwnd)
        return {"windowId": f"{int(hwnd)}:{pid}", "hwnd": int(hwnd), "pid": pid, "activeFamily": active_family,
                "title": title.value, "executable": exe, "minimized": bool(user.IsIconic(hwnd)),
                "foreground": int(user.GetForegroundWindow() or 0) == int(hwnd),
                "rect": {"left": rect.left, "top": rect.top, "right": rect.right, "bottom": rect.bottom}}

    windows = []
    Callback = C.WINFUNCTYPE(W.BOOL, W.HWND, W.LPARAM)

    @Callback
    def enum(hwnd, _):
        if user.IsWindowVisible(hwnd):
            item = describe(hwnd)
            if item:
                windows.append(item)
        return True

    user.EnumWindows.argtypes = [Callback, W.LPARAM]
    user.EnumWindows.restype = W.BOOL
    require(user.EnumWindows(enum, 0), "ENUM_WINDOWS_FAILED", "Could not enumerate visible windows.")
    targets = [w for w in windows if Path(w["executable"]).name.lower() in allowed]
    if request["action"] == "list":
        return {"windows": targets, "backend": "win32-pillow", "windowsBuild": sys.getwindowsversion().build}

    require(request["action"] in ("capture", "focus", "input"), "INVALID_ACTION", "Expected list, capture, focus or input.")
    target = next((w for w in targets if w["windowId"] == request.get("windowId")), None)
    require(target is not None, "WINDOW_NOT_FOUND", "Window is stale, closed, hidden or outside the game/editor allowlist. Call list_editor_windows again.")
    if request["action"] == "focus":
        from win_input import operate
        return operate(user, kernel, request, target, describe, require)
    require(not target["minimized"], "WINDOW_MINIMIZED", "Restore the game/editor window before capture.")
    rect = target["rect"]
    width, height = rect["right"] - rect["left"], rect["bottom"] - rect["top"]
    require(0 < width <= 16384 and 0 < height <= 16384, "INVALID_WINDOW_SIZE", "Window dimensions are invalid or exceed 16384 pixels.")
    if request["action"] in ("focus", "input"):
        from win_input import operate
        return operate(user, kernel, request, target, describe, require)
    method = request.get("method", "window")
    require(method in ("window", "screen"), "INVALID_METHOD", "Expected window or screen.")
    try:
        from PIL import ImageGrab, ImageStat, Image, __version__ as pillow_version
    except ImportError:
        raise CaptureError("PILLOW_MISSING", "Install requirements-capture.txt with the configured Python interpreter.")
    require(tuple(int(v) for v in pillow_version.split('.')[:3]) >= (11, 2, 1), "PILLOW_TOO_OLD", "Pillow >=11.2.1 is required for HWND capture.")
    capture_rect = rect.copy()
    warnings = []
    def client_rect_in_screen():
        area = W.RECT()
        require(user.GetClientRect(target["hwnd"], C.byref(area)), "CAPTURE_GEOMETRY_MISMATCH", "Cannot observe the client rectangle.")
        top_left, bottom_right = W.POINT(area.left, area.top), W.POINT(area.right, area.bottom)
        require(user.ClientToScreen(target["hwnd"], C.byref(top_left)) and user.ClientToScreen(target["hwnd"], C.byref(bottom_right)),
                "CAPTURE_GEOMETRY_MISMATCH", "Cannot map client pixels to screen coordinates.")
        return {"left": top_left.x, "top": top_left.y, "right": bottom_right.x, "bottom": bottom_right.y}
    if method == "window":
        from capture_geometry import client_capture_rect
        client_before = client_rect_in_screen()
        image = ImageGrab.grab(window=target["hwnd"])
        # Pillow HWND capture uses GetClientRect, excluding native window chrome.
        # Never map a file-dialog client screenshot to the outer-window origin.
        try:
            capture_rect = client_capture_rect(rect, client_before, image.size)
        except ValueError as error:
            raise CaptureError("CAPTURE_GEOMETRY_MISMATCH", str(error) + "; use screen capture after re-observing.")
        require(client_rect_in_screen() == client_before, "WINDOW_CHANGED", "Client geometry changed during capture.")
        warnings.append("PrintWindow may return stale or incomplete GPU content. Inspect the image; success does not prove correct game rendering.")
    else:
        require(target["activeFamily"], "WINDOW_NOT_FOREGROUND", "Screen capture requires the target window or its owning editor in the foreground. This tool will not change focus.")
        from capture_geometry import crop_edge_occlusion
        vx, vy = user.GetSystemMetrics(76), user.GetSystemMetrics(77)
        vr, vb = vx + user.GetSystemMetrics(78), vy + user.GetSystemMetrics(79)
        capture_rect = {"left": max(rect["left"], vx), "top": max(rect["top"], vy), "right": min(rect["right"], vr), "bottom": min(rect["bottom"], vb)}
        # EnumWindows is in z order. Reject other-process windows above the target
        # when they overlap; prevents knowingly capturing another app's content.
        for item in windows:
            if item["hwnd"] == target["hwnd"]:
                break
            r = item["rect"]
            intersects = max(rect["left"], r["left"]) < min(rect["right"], r["right"]) and max(rect["top"], r["top"]) < min(rect["bottom"], r["bottom"])
            if intersects and item["pid"] != target["pid"]:
                try:
                    cropped = crop_edge_occlusion(capture_rect, r)
                    require((cropped['right']-cropped['left'])*(cropped['bottom']-cropped['top']) >= width*height/2,
                            "WINDOW_OCCLUDED", "Less than half the target remains visible.")
                    if cropped != capture_rect:
                        warnings.append("Excluded edge occluded by " + Path(item['executable']).name)
                    capture_rect = cropped
                except ValueError:
                    raise CaptureError("WINDOW_OCCLUDED", "Another application's window overlaps the target. Clear overlays and try again.",
                                       {"blocker": {"processName": Path(item["executable"]).name,
                                                    "pid": item["pid"], "rect": item["rect"]},
                                        "targetWindowId": target["windowId"]})
        require(capture_rect["right"] > capture_rect["left"] and capture_rect["bottom"] > capture_rect["top"], "WINDOW_OFFSCREEN", "Window is outside the visible desktop.")
        image = ImageGrab.grab(bbox=tuple(capture_rect[k] for k in ("left", "top", "right", "bottom")), all_screens=True, include_layered_windows=True)
        warnings.append("Visible desktop pixels: same-process popups or overlays may appear. Do not use this as proof of input focus.")
    current = describe(target["hwnd"])
    require(current is not None and current["windowId"] == target["windowId"] and current["rect"] == rect,
            "WINDOW_CHANGED", "Window moved, resized or closed during capture. Retry with fresh window discovery.")
    if method == "screen":
        require(current["activeFamily"], "FOCUS_CHANGED", "Foreground changed during screen capture; image discarded.")
    width, height = image.size
    # Heuristic only. Keep diagnostic evidence even for suspect/black frames.
    inner = image.crop((min(12, width//4), min(40, height//4), max(width-12, width*3//4), max(height-12, height*3//4))).convert("L")
    stats = ImageStat.Stat(inner)
    histogram = inner.histogram()
    black_fraction = sum(histogram[:8]) / max(1, sum(histogram))
    suspect = stats.stddev[0] < 1 or black_fraction > 0.98
    if suspect:
        warnings.append("Image content appears blank or near-black. Try screen mode with the target foreground and unobscured.")
    output = Path(request["outputPath"])
    require(output.suffix.lower() == ".png", "INVALID_OUTPUT", "Output must be a PNG.")
    output.parent.mkdir(parents=True, exist_ok=True)
    # Unique output names are generated by the MCP server, never overwrite.
    with output.open("xb") as file:
        image.save(file, format="PNG")
    preview = image.copy()
    preview.thumbnail((request.get("maxWidth", 1600), request.get("maxHeight", 1200)), Image.Resampling.LANCZOS)
    encoded = io.BytesIO()
    preview.save(encoded, format="PNG")
    return {"window": target, "backend": "pillow-printwindow" if method == "window" else "pillow-screen",
            "pillowVersion": pillow_version, "windowsBuild": sys.getwindowsversion().build,
            "capturedAtUnixMs": int(time.time()*1000), "path": str(output.resolve()),
            "width": width, "height": height, "previewWidth": preview.width, "previewHeight": preview.height,
            "captureRect": capture_rect, "coordinateSpace": "editor_input uses returned preview pixels; pass preview coordinates directly without scaling. PNG/captureRect use physical pixels; the server applies previewToImageScale and imageOffsetInWindow.",
            "previewToImageScale": {"x": width/preview.width, "y": height/preview.height},
            "imageOffsetInWindow": {"x": capture_rect["left"]-rect["left"], "y": capture_rect["top"]-rect["top"]},
            "suspectBlank": suspect, "blackFraction": round(black_fraction, 4), "luminanceStddev": round(stats.stddev[0], 4),
            "warnings": warnings, "imageBase64": base64.b64encode(encoded.getvalue()).decode("ascii")}


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    try:
        print(json.dumps(main(json.load(sys.stdin)), ensure_ascii=False))
    except Exception as error:
        print(json.dumps({"error": {"code": getattr(error, "code", "CAPTURE_FAILED"), "message": str(error), "details": getattr(error, "details", {})}}, ensure_ascii=False))
        sys.exit(1)
