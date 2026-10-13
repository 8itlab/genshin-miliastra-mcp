"""把一批的截图按格子切成缩略图。用法：python thumbs_cut.py [批次号...]（不带参数就重切全部已拍批次）
前景 = 和空场景截图不一样的像素（去掉像阴影的）。前景连成的一块块里，压着本格中心小块的算本格物件，
按它的外框取正方形，所以物件原点不在底部中心、或者实际大小和图鉴不符，也能框住。
图鉴的用途是让 AI 看个大概来选型，所以只拒收真正有问题的。每个物件的结论 status：
  ok        收下（邻居的影子、枝叶伸进来一点，或者只和邻居细细地连着，都算 ok）
  empty     格子里没东西（物件本身不可见，或导入被丢弃）
  merged    主体和别的格子的物件糊成一块，分不清谁是谁
  neighbor  裁剪框里别的物件比主体还抢眼
  edge      物件比格子大很多还碰到屏幕边，主体多半被切掉了
"""
import json, os, sys, tempfile
from pathlib import Path
import numpy as np
from PIL import Image

WORK = Path(os.environ.get("MILIASTRA_SCRATCH") or Path(tempfile.gettempdir()) / "miliastra-dev") / "thumbs"
OUT = WORK / "out"
SIZE, QUALITY = 192, 80


def foreground(shot, empty):
    import cv2
    e = np.asarray(empty.convert("RGB")).astype(np.int16)
    a = np.asarray(shot.convert("RGB")).astype(np.int16)
    diff = np.abs(a - e).max(axis=2) > 40
    # 草地上的阴影偏蓝：全影时红、绿、蓝分别剩约 0.45、0.62、0.78，半影在这和 1 之间按比例过渡
    ratio = a / np.maximum(e, 1)
    k = (1 - ratio[..., 1]) / 0.38
    shadow = (k > 0.05) & (k < 1.25) & (np.abs(ratio[..., 0] - (1 - 0.55 * k)) < 0.1) & (np.abs(ratio[..., 2] - (1 - 0.22 * k)) < 0.1)
    fg = (diff & ~shadow).astype(np.uint8)
    fg[:62] = 0; fg[:150, 1040:1520] = 0; fg[:210, 2380:] = 0; fg[1370:, 2150:] = 0  # 界面
    return cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))  # 去掉草地噪点


def geometry(batch):
    """这一批拍摄时各格子的像素位置：拍摄时写在 shots/bNNN_geo.json；最早几批没有这个文件，位置在计划里。"""
    geo = WORK / "shots" / f"b{batch['index']:03d}_geo.json"
    if geo.exists(): return json.loads(geo.read_text(encoding="utf-8"))
    return {"items": batch["items"], "fiducials": batch.get("fiducials", []), "marker": batch["marker"]}


def cut_batch(batch, shot=None, empty=None, out=None, geo=None):
    import cv2
    index = batch["index"]
    geo = geo or geometry(batch)
    shot = shot or Image.open(WORK / "shots" / f"b{index:03d}.png")
    empty = empty or Image.open(WORK / "shots" / f"b{index:03d}_empty.png")
    fg = foreground(shot, empty)
    Hh, Ww = fg.shape
    for f in geo["fiducials"]:
        x, y = (round(v) for v in f["pixel"]); fg[max(y - 45, 0):y + 45, max(x - 45, 0):x + 45] = 0
    ox, oy = geo["marker"]; fg[oy - 90:oy + 70, ox - 60:ox + 60] = 0
    # 两种连通：loose 稍微膨胀，同一物件的零碎部件算一块；tight 先腐蚀，细枝、影子边这类细连接会断开，剩下的是“主体”
    _, loose, _, _ = cv2.connectedComponentsWithStats(cv2.dilate(fg, np.ones((9, 9), np.uint8)))
    loose[fg == 0] = 0
    _, tight, _, _ = cv2.connectedComponentsWithStats(cv2.erode(fg, np.ones((9, 9), np.uint8)))
    seeds, tight_owner, loose_owner = {}, {}, {}
    for item in geo["items"]:
        l, t, r, b = item["core"]
        ts = set(np.unique(tight[t:b, l:r]).tolist()) - {0}
        ls = set(np.unique(loose[t:b, l:r]).tolist()) - {0}
        if not ls:  # 中心小块没盖住（很矮、很细或原点偏了的物件）：退到名义外框里最大的一块
            l, t, r, b = item["crop"]
            sub = loose[t:b, l:r]; found = np.bincount(sub[sub > 0])
            ls = {int(found.argmax())} if len(found) and found.max() >= 60 else set()
        seeds[item["id"]] = (ts, ls)
        for i in ts: tight_owner.setdefault(i, set()).add(item["id"])
        for i in ls: loose_owner.setdefault(i, set()).add(item["id"])
    out = out or OUT / f"b{index:03d}"  # 每批一个目录：补拍不会盖掉之前拍好的
    out.mkdir(parents=True, exist_ok=True)
    report = {}
    for item in geo["items"]:
        ts, ls = seeds[item["id"]]
        nominal = item["crop"][2] - item["crop"][0]
        if not ls:
            report[item["id"]] = {"status": "empty", "nominal": nominal}; continue
        shared = any(len(loose_owner[i]) > 1 for i in ls)
        fused = any(len(tight_owner[i]) > 1 for i in ts) or (shared and not ts)
        if shared and not fused:
            # 只是细细地连着：以自己的主体为准，外框向外放一点把被腐蚀掉的边找回来
            ys, xs = np.nonzero(np.isin(tight, list(ts)))
            x0, x1, y0, y1 = max(int(xs.min()) - 14, 0), int(xs.max()) + 15, max(int(ys.min()) - 14, 0), int(ys.max()) + 15
            mine = np.zeros(fg.shape, bool); mine[y0:y1, x0:x1] = np.isin(loose[y0:y1, x0:x1], list(ls))
        else:
            mine = np.isin(loose, list(ls))
        ys, xs = np.nonzero(mine)
        x0, x1, y0, y1 = int(xs.min()), int(xs.max()) + 1, int(ys.min()), int(ys.max()) + 1
        extent = max(x1 - x0, y1 - y0)
        side = max(extent * 1.14, 96)
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        c = [round(cx - side / 2), round(cy - side / 2), round(cx + side / 2), round(cy + side / 2)]
        c = [max(c[0], 0), max(c[1], 62), min(c[2], Ww), min(c[3], Hh)]
        own = int(mine[c[1]:c[3], c[0]:c[2]].sum())
        others = int(((fg[c[1]:c[3], c[0]:c[2]] > 0) & ~mine[c[1]:c[3], c[0]:c[2]]).sum())
        touches = x0 <= 2 or y0 <= 64 or x1 >= Ww - 2 or y1 >= Hh - 2
        status = "ok"
        if touches and extent > 1.6 * nominal: status = "edge"
        if others > 0.6 * own: status = "neighbor"
        if fused: status = "merged"
        thumb = shot.crop(c).convert("RGB")
        if thumb.width != thumb.height:  # 贴着屏幕边时补成正方形
            canvas = Image.new("RGB", (max(thumb.size),) * 2, (96, 150, 80)); canvas.paste(thumb, ((canvas.width - thumb.width) // 2, (canvas.height - thumb.height) // 2)); thumb = canvas
        thumb.resize((SIZE, SIZE), Image.LANCZOS).save(out / f"{item['id']}.jpg", quality=QUALITY, optimize=True)
        report[item["id"]] = {"status": status, "pixels": int(len(xs)), "box": c, "sourceSide": int(c[2] - c[0]), "extent": int(extent), "nominal": nominal,
                              "touchesEdge": bool(touches), "alone": not shared, "othersRatio": round(others / max(own, 1), 2)}
    (WORK / "reports").mkdir(exist_ok=True)
    (WORK / "reports" / f"b{index:03d}.json").write_text(json.dumps(report, ensure_ascii=False))
    return report


def counts(report):
    return {s: n for s in ("ok", "empty", "merged", "neighbor", "edge") if (n := sum(1 for v in report.values() if v["status"] == s))}


if __name__ == "__main__":
    plan = json.loads((WORK / "plan.json").read_text(encoding="utf-8"))
    wanted = [int(a) for a in sys.argv[1:]] or [b["index"] for b in plan if (WORK / "shots" / f"b{b['index']:03d}.png").exists()]
    for index in wanted:
        print(index, counts(cut_batch(plan[index])))
