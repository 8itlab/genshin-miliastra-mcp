"""批量拍物件缩略图。要在登录的桌面会话里跑（经 thumbs_daemon.py），编辑器里开着专用的空存档、
镜头保持标定时的位置（先跑 thumbs_calib_shoot.py）。用法：
  python thumbs_shoot.py plan [redo.json]   生成 plan.json（每批放哪些物件、缩放多少）；给了 redo.json（thumbs_collect.py 写的）就把里面的物件追加成补拍批次
  python thumbs_shoot.py run [起] [止]      拍第 起..止 批（含），已拍过的跳过；在临时目录的 thumbs 下放一个 stop 文件可中止
"""
import json, os, sys, time
from pathlib import Path
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from thumbs_lib import *
import thumbs_layout as layout
from thumbs_cut import cut_batch, counts
from PIL import Image

CATALOG = json.loads((REPO / "src" / "scene" / "asset-catalog.json").read_text(encoding="utf-8"))["assets"]
# 这些的原点在几何中心而不是底部（方块表里的 21 个，以及几何体分组），要抬高半个身位
CENTERED = {20001224, 20001034, 20001237, 20001238, 20001239, 20001869, 20001870, 20001872, 20001874, 20001875, 20001876, 20001877,
            20001878, 20001879, 20001082, 20001096, 20001097, 20001100, 20002146, 20002121, 10005014}
ORIGIN = MARKER = None


def load_calibration():
    """读入（或重新读入）镜头标定，算出格子。"""
    global ORIGIN, MARKER, CELLS, MARKS
    import importlib
    importlib.reload(layout)
    ORIGIN = tuple(layout.CAL["origin"])
    MARKER = (round(ORIGIN[0]) - 60, round(ORIGIN[1]) - 90, round(ORIGIN[0]) + 60, round(ORIGIN[1]) + 70)
    CELLS = layout.cells(); MARKS = layout.fiducials(CELLS)


def cells_for(stride):
    """stride 1 用全部格子；2 隔一个用一个（棋盘格）；3 隔行隔列。补拍时用稀的，邻居离得远。"""
    xs = sorted({c["x"] for c in CELLS}); out = []
    for c in CELLS:
        row = xs.index(c["x"]); col = sorted(k["z"] for k in CELLS if k["x"] == c["x"]).index(c["z"])
        if stride == 1 or (stride == 2 and (row + col) % 2 == 0) or (stride >= 3 and row % 2 == 0 and col % 2 == 0): out.append(c)
    return out


PARK = (2548, 700)  # 鼠标停在这里：在画面内（删除键要求鼠标悬在画面上），又不压任何格子
EMPTY_LIMIT = 0.00012


def log(*a):
    line = time.strftime("%H:%M:%S ") + " ".join(str(x) for x in a)
    print(line, flush=True)
    with open(WORK / "shoot.log", "a", encoding="utf-8") as f: f.write(line + "\n")


def make_plan(redo=None):
    old = WORK / "plan.json"
    plan = json.loads(old.read_text(encoding="utf-8")) if redo and old.exists() else []
    by_id = {a["id"]: a for a in CATALOG}
    def add(kind, assets, scale_of, stride=1):
        per = len(cells_for(stride))
        for i in range(0, len(assets), per):
            plan.append({"index": len(plan), "kind": kind, "stride": stride, "items": [{"id": a["id"], "name": a["name"], "scale": scale_of(a)} for a in assets[i:i + per]]})
    monster = lambda a: a["group"].startswith("怪物")
    sized = lambda a: bool(a.get("size")) and all(n > 0 for n in a["size"])
    order = lambda a: (a["group"], a["id"])
    if redo:
        spec = json.loads(Path(redo).read_text(encoding="utf-8"))  # {"stride": 2, "items": {物件编号: 缩放}}
        add("redo", [by_id[int(i)] for i in spec["items"]], lambda a: spec["items"][str(a["id"])], spec.get("stride", 2))
    else:
        add("sized", sorted([a for a in CATALOG if sized(a) and not monster(a)], key=order), lambda a: round(layout.OBJECT / max(a["size"]), 5))
        add("unsized", sorted([a for a in CATALOG if not sized(a) and not monster(a)], key=order), lambda a: 1)
        add("monster", sorted([a for a in CATALOG if monster(a)], key=order), lambda a: 1)
    old.write_text(json.dumps(plan, ensure_ascii=False), encoding="utf-8")
    log("plan", len(plan), "batches", {k: sum(len(b["items"]) for b in plan if b["kind"] == k) for k in ("sized", "unsized", "monster", "redo")})


def place(batch):
    """按当前标定给这一批的物件分配格子，返回几何信息（切图要用，随截图一起存）。"""
    by_id = {a["id"]: a for a in CATALOG}
    items = []
    for it, c in zip(batch["items"], cells_for(batch.get("stride", 1))):
        a = by_id[it["id"]]
        y = a["size"][1] * it["scale"] / 2 if a.get("size") and (a["id"] in CENTERED or a["group"] == "几何体") else 0
        items.append({"id": it["id"], "scale": it["scale"], "x": c["x"], "y": y, "z": c["z"], "crop": c["crop"], "core": c["core"]})
    return {"items": items, "fiducials": MARKS, "marker": [round(ORIGIN[0]), round(ORIGIN[1])]}


def park(run):
    move(run, *PARK); time.sleep(0.3)


def changed(a, b):
    x, y = np.asarray(a).astype(np.int16), np.asarray(b).astype(np.int16)
    d = np.abs(x - y).max(axis=2) > 45  # 草地本身每帧有轻微噪点，阈值低了会误报
    d[:62] = False; d[1370:, 2150:] = False; d[:210, 2380:] = False; d[:150, 1040:1520] = False  # 界面上的数字一直在变
    d[MARKER[1]:MARKER[3], MARKER[0]:MARKER[2]] = False  # 出生点图标自己会上下浮动
    return d


def leftover(run):
    """和空场景参考图比，返回 (不同像素占比, 不同像素的掩码, 当前画面)。"""
    park(run); time.sleep(0.8)
    now = grab()
    d = changed(now, Image.open(WORK / "empty.png").convert("RGB"))
    return float(d.mean()), d, now


def clear(run):
    """框选删除；框不住的（碰到屏幕边的大物件）逐个点选删除。清不干净就抛 Failed，由调用方停下整轮。"""
    import cv2
    for attempt in range(3):
        clear_scene(run, ORIGIN)
        frac, d, now = leftover(run)
        if frac < EMPTY_LIMIT: return now
        log("  not empty after box clear", attempt, round(frac, 5))
    for attempt in range(10):
        # 影子点不中物件：先只看不是草绿色的像素（物件本体），没有再退回全部差异像素
        rgb = np.asarray(now).astype(np.int16); body = d & ~((rgb[..., 1] > rgb[..., 0] + 12) & (rgb[..., 1] > rgb[..., 2] + 12))
        if attempt % 2 == 0 and body.sum() > 400: d = body
        n, lab, stats, cent = cv2.connectedComponentsWithStats(cv2.dilate(d.astype(np.uint8), np.ones((15, 15), np.uint8)))
        if n < 2: break
        big = 1 + int(np.argmax(stats[1:, 4]))
        ys, xs = np.nonzero((lab == big) & d)
        k = len(xs) // 2; x, y = int(xs[np.argsort(ys)[k]]), int(np.sort(ys)[k])
        run.click(x, y); time.sleep(0.4); move(run, 700, 1425); press_delete(run)
        frac, d, now = leftover(run)
        log("  click-delete at", x, y, "left", round(frac, 5))
        if frac < EMPTY_LIMIT: return now
    raise Failed("清场失败：删除后画面仍和空场景不一样（镜头动了，或有东西删不掉）。")


def settle(run, limit=12):
    park(run); time.sleep(3)
    prev = grab(); t0 = time.time()
    while time.time() - t0 < limit:
        time.sleep(1.2); cur = grab()
        if float(changed(prev, cur).mean()) < 0.0002: return cur
        prev = cur
    return prev


def check_camera(shot, geo):
    """两个雷质小方块（紫色）离标定算出来的位置有多远（像素）。大物件或它的影子可能盖住其中一个，取对得上的那个。
    切图是按“谁压着格子中心”认物件的，偏十几像素没影响；偏到四分之一个格子宽才算镜头动了。"""
    x = np.asarray(shot).astype(np.int16)
    offsets = []
    for f in geo["fiducials"]:
        px, py = (round(v) for v in f["pixel"])
        sub = x[max(py - 150, 0):py + 150, max(px - 150, 0):px + 150]
        m = (sub[..., 0] > 140) & (sub[..., 0] < 235) & (sub[..., 1] < 150) & (sub[..., 2] > 215)
        ys, xs = np.nonzero(m)
        offsets.append(999.0 if len(xs) < 40 else float(np.hypot(xs.mean() + max(px - 150, 0) - f["pixel"][0], ys.mean() + max(py - 150, 0) - f["pixel"][1])))
    limit = min(c["crop"][2] - c["crop"][0] for c in CELLS) * 0.25
    # 两个都找不到，多半是被这一批里的大物件挡住了，不是镜头动了：重新标定也没用，照旧标定切图
    if min(offsets) >= 999: return -1.0
    if min(offsets) > limit: raise CameraMoved(f"两个定位方块分别偏了 {offsets[0]:.0f}、{offsets[1]:.0f} 像素（上限 {limit:.0f}）")
    return min(offsets)


class CameraMoved(Exception):
    pass


def recalibrate(run):
    """镜头动了：清场、重新标定、按新标定重算格子，然后接着拍。"""
    import subprocess
    log("  recalibrating")
    out = subprocess.run([sys.executable, str(HERE / "thumbs_calib_shoot.py"), f"Recal{int(time.time()) % 100000}"], capture_output=True, text=True, encoding="utf-8", errors="replace")
    log("  ", out.stdout.strip().splitlines()[:1], out.stderr.strip()[-300:])
    if "OK" not in out.stdout: raise Failed("重新标定失败")
    load_calibration()
    run.focus("game"); park(run); time.sleep(1)
    return grab()


def shoot(plan, first, last):
    run = Run({"runDir": str(WORK / "runs" / "shoot")})
    run.focus("game"); time.sleep(1)
    (WORK / "shots").mkdir(exist_ok=True); (WORK / "results").mkdir(exist_ok=True)
    frac, _, _ = leftover(run)
    empty = clear(run) if frac >= EMPTY_LIMIT else grab()
    recalibrations = 0
    todo = [b for b in plan[first:last + 1] if not (WORK / "results" / f"b{b['index']:03d}.json").exists()]
    while todo:
        batch = todo[0]; index = batch["index"]
        if (WORK / "stop").exists(): log("stop file found"); break
        t0 = time.time()
        empty.save(WORK / "empty.png")  # 参考图每批都换成刚清完场的画面，光照慢慢变也不会误报
        empty.save(WORK / "shots" / f"b{index:03d}_empty.png")
        geo = place(batch)
        blocks = [{"template": it["id"], "name": f"t{index}_{it['id']}", "position": [it["x"], it["y"], it["z"]], "scale": it["scale"]} for it in geo["items"]]
        blocks += [{"template": "雷质立方体", "name": f"t{index}_mark{k}", "position": f["position"], "size": [0.6, 0.6, 0.6]} for k, f in enumerate(geo["fiducials"])]
        try:
            for attempt in range(3):
                name = f"Tb{index}a{attempt}x{int(time.time()) % 100000}"
                built = build(name, blocks)
                try:
                    import_pack(name, [b["name"] for b in blocks]); break
                except Failed as e:
                    log("  batch", index, "import attempt", attempt, "failed:", e)
                    time.sleep(3); run.focus("game"); time.sleep(1); run.focus("game")
                    clear(run)  # 可能已经导进去一部分
                finally:
                    try: os.remove(built["installedTo"])  # 导入界面会加载目录里所有包，用完就拿走
                    except OSError: pass
            else:
                raise Failed("导入连续三次失败")
            run.focus("game")
            shot = settle(run)
            try:
                drift = check_camera(shot, geo)
            except CameraMoved as e:
                recalibrations += 1
                log("batch", index, "camera moved:", e)
                if recalibrations > 4: raise Failed("镜头反复移动，重新标定了 4 次还不行")
                empty = recalibrate(run)
                continue  # 这一批按新标定重拍
            shot.save(WORK / "shots" / f"b{index:03d}.png")
            (WORK / "shots" / f"b{index:03d}_geo.json").write_text(json.dumps(geo), encoding="utf-8")
            report = cut_batch(batch, shot, empty, geo=geo)
            empty = clear(run)
        except Failed as e:
            log("batch", index, "FAILED, stopping:", e); return
        (WORK / "results" / f"b{index:03d}.json").write_text(json.dumps({"index": index, "pack": name, "counts": counts(report), "drift": drift, "seconds": round(time.time() - t0)}, ensure_ascii=False))
        log("batch", index, batch["kind"], len(geo["items"]), counts(report), "drift", round(drift, 1), "sec", round(time.time() - t0))
        todo.pop(0)
    log("done range", first, last)


if __name__ == "__main__":
    load_calibration()
    if sys.argv[1] == "plan":
        make_plan(sys.argv[2] if len(sys.argv) > 2 else None)
    else:
        plan = json.loads((WORK / "plan.json").read_text(encoding="utf-8"))
        shoot(plan, int(sys.argv[2]) if len(sys.argv) > 2 else 0, int(sys.argv[3]) if len(sys.argv) > 3 else len(plan) - 1)
