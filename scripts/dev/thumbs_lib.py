"""物件缩略图拍摄的公共函数：生成资产包、导入、截图。临时文件放在环境变量 MILIASTRA_SCRATCH 指的目录（没设就用系统临时目录下的 miliastra-dev），Node 用 MILIASTRA_NODE（没设就用 PATH 里的 node）。"""
import json, os, subprocess, sys, tempfile, time
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
WORK = Path(os.environ.get("MILIASTRA_SCRATCH") or Path(tempfile.gettempdir()) / "miliastra-dev") / "thumbs"
NODE = os.environ.get("MILIASTRA_NODE", "node")
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(REPO / "src"))
from playtest_runner import Run, Failed  # noqa: E402
from PIL import ImageGrab  # noqa: E402


def build(name, blocks):
    WORK.mkdir(parents=True, exist_ok=True)
    spec = WORK / "specs" / (name + ".json")
    spec.parent.mkdir(exist_ok=True)
    spec.write_text(json.dumps({"name": name, "blocks": blocks}, ensure_ascii=False), encoding="utf-8")
    out = subprocess.run([NODE, str(HERE / "thumbs_build.mjs"), str(spec)], cwd=str(REPO), capture_output=True, timeout=120)
    if out.returncode:
        raise RuntimeError("build failed: " + out.stderr.decode("utf-8", "replace")[-800:])
    return json.loads(out.stdout.decode("utf-8"))


class NoSaveRun(Run):
    """导入流程最后会按 Ctrl+S 存档，但编辑器把其中的 S 也当成“镜头后退”，每存一次镜头就退一点
    （同理 Ctrl+A 会让镜头左移）。拍缩略图要求镜头纹丝不动，所以这里不存档，物件有没有进场改由截图判断。"""
    def key(self, chord, hold=0.06):
        if chord.upper() == "CTRL+S":
            return
        super().key(chord, hold)


def import_pack(name, piece_names):
    run = NoSaveRun({"action": "import_assets", "packs": [name], "overview": False, "runDir": str(WORK / "runs" / name)})
    try:
        run.import_assets()
    except Failed as e:
        if "保存后存档文件没有变化" not in str(e):  # 没存档，这一条是预期的
            raise
    return run


def grab(path=None):
    image = ImageGrab.grab().convert("RGB")
    if path:
        image.save(path)
    return image


def drag(run, x0, y0, x1, y1, steps=24):
    """按住左键从一点拖到另一点（屏幕物理像素）。"""
    import ctypes
    user = ctypes.windll.user32
    vx, vy, vw, vh = (user.GetSystemMetrics(i) for i in (76, 77, 78, 79))
    norm = lambda x, y: (round((x - vx) * 65535 / (vw - 1)), round((y - vy) * 65535 / (vh - 1)))
    run._send(run._mouse(0x8000 | 0x4000 | 1, *norm(x0, y0))); time.sleep(0.15)
    run._send(run._mouse(2)); time.sleep(0.15)
    for i in range(1, steps + 1):
        run._send(run._mouse(0x8000 | 0x4000 | 1, *norm(x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps))); time.sleep(0.02)
    time.sleep(0.2); run._send(run._mouse(4)); time.sleep(0.3)


def press_delete(run, variant="scan"):
    """Run.key('DELETE') 发的是不带扩展标志的虚拟键，编辑器不认；这里按扫描码发扩展键。"""
    if variant == "scan":
        down, up = run._key(scan=0x53, flags=0x8 | 0x1), run._key(scan=0x53, flags=0x8 | 0x1 | 0x2)
    else:
        down, up = run._key(vk=0x2E, flags=0x1), run._key(vk=0x2E, flags=0x1 | 0x2)
    run._send(down); time.sleep(0.12); run._send(up); time.sleep(0.4)


def move(run, x, y):
    import ctypes
    user = ctypes.windll.user32
    vx, vy, vw, vh = (user.GetSystemMetrics(i) for i in (76, 77, 78, 79))
    run._send(run._mouse(0x8000 | 0x4000 | 1, round((x - vx) * 65535 / (vw - 1)), round((y - vy) * 65535 / (vh - 1)))); time.sleep(0.3)


def clear_scene(run, origin, side=55, up=85, down=65):
    """删掉画面里所有物件。选区里只要带上原点的出生点标记，删除键就不起作用，
    所以用四个互相重叠的框（标记左边、右边、上边、下边的整片），每个都避开出生点标记。
    框选只选中完全落在框里的物件，所以贴着屏幕边、露出一半的选不中。origin 是标记的屏幕像素。
    删除键还要求鼠标悬在画面上（停在右侧详情面板上不行）。"""
    ox, oy = round(origin[0]), round(origin[1])
    boxes = [(15, 1425, ox - side, 60), (ox + side, 1425, 2545, 60), (15, 62, 2545, oy - up), (15, 1425, 2545, oy + down)]
    for x0, y0, x1, y1 in boxes:
        drag(run, x0, y0, x1, y1)
        move(run, 700, 1425)
        press_delete(run)
        time.sleep(0.4)
