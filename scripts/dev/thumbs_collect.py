"""汇总各批的切图结论：每个物件挑一张最好的图放进仓库 src/scene/thumbs，并列出还要补拍的。
用法：python thumbs_collect.py [redo.json [stride]]
  给了 redo.json 就写出补拍清单 {"stride": n, "items": {物件编号: 缩放}}，接着跑 thumbs_shoot.py plan redo.json 和 thumbs_shoot.py run。
补拍缩放：上一次单独成块、量得出大小的，按量到的大小直接算出合适的缩放；和别的物件糊在一起量不出来的，
第一次原样在稀格子里重拍（多半是被旁边的大家伙连累的），之后每次缩到三分之一；空的放大三倍再试一次。每个物件最多拍 5 次。"""
import json, os, shutil, sys, tempfile
from pathlib import Path

WORK = Path(os.environ.get("MILIASTRA_SCRATCH") or Path(tempfile.gettempdir()) / "miliastra-dev") / "thumbs"
REPO = Path(__file__).resolve().parents[2]
DEST = REPO / "src" / "scene" / "thumbs"
plan = json.loads((WORK / "plan.json").read_text(encoding="utf-8"))
catalog = json.loads((REPO / "src" / "scene" / "asset-catalog.json").read_text(encoding="utf-8"))["assets"]
tries = {}
for batch in plan:
    report = WORK / "reports" / f"b{batch['index']:03d}.json"
    if not report.exists() or not (WORK / "results" / f"b{batch['index']:03d}.json").exists(): continue
    report = json.loads(report.read_text(encoding="utf-8"))
    for item in batch["items"]:
        r = report.get(str(item["id"]))
        if r: tries.setdefault(item["id"], []).append({"batch": batch["index"], "scale": item["scale"], **r})

def measured(x):
    """上一次量到的大小可信的话，返回让物件正好占满格子的缩放。"""
    if x.get("alone") and not x.get("touchesEdge") and x.get("extent"):
        return round(x["scale"] * min(4, max(0.05, 0.85 * x["nominal"] / x["extent"])), 5)
    return None


final, redo = {}, {}
for a in catalog:
    t = tries.get(a["id"], [])
    good = [x for x in t if x["status"] == "ok"]
    if good:
        best = max(good, key=lambda x: min(x["sourceSide"], 260))
        final[a["id"]] = {"status": "ok", "batch": best["batch"], "sourceSide": best["sourceSide"], "scale": best["scale"], "tries": len(t)}
        if best["sourceSide"] < 110 and len(t) < 3 and best is t[-1] and measured(best):
            redo[a["id"]] = measured(best)  # 认得出但太小，放大补拍一张更清楚的
    elif t:
        last = t[-1]
        final[a["id"]] = {"status": last["status"], "batch": last["batch"], "scale": last["scale"], "tries": len(t)}
        if len(t) >= 5: continue
        if last["status"] == "empty":
            if len(t) >= 2 and t[-2]["status"] != "empty": redo[a["id"]] = round(last["scale"] * 1.8, 5)  # 缩过头了
            elif sum(1 for x in t if x["status"] == "empty") < 2: redo[a["id"]] = round(last["scale"] * 3, 5)
        else:
            redo[a["id"]] = measured(last) or (last["scale"] if len(t) == 1 else round(last["scale"] / 3, 5))
    else:
        final[a["id"]] = {"status": "not-shot", "tries": 0}

DEST.mkdir(exist_ok=True)
keep = set()
for i, f in final.items():
    if f["status"] == "ok":
        shutil.copyfile(WORK / "out" / f"b{f['batch']:03d}" / f"{i}.jpg", DEST / f"{i}.jpg"); keep.add(f"{i}.jpg")
for old in DEST.glob("*.jpg"):
    if old.name not in keep: old.unlink()
groups = {}
for a in catalog:
    g = groups.setdefault(a["group"], {}); s = final[a["id"]]["status"]; g[s] = g.get(s, 0) + 1
size = sum(f.stat().st_size for f in DEST.glob("*.jpg"))
summary = {"total": len(catalog), "withImage": len(keep), "bytes": size, "byGroup": groups,
           "missing": {str(a["id"]): {"name": a["name"], "group": a["group"], **final[a["id"]]} for a in catalog if final[a["id"]]["status"] != "ok"}}
(WORK / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=1), encoding="utf-8")
print("with image", len(keep), "of", len(catalog), "| MB", round(size / 1e6, 2), "| to redo", len(redo))
for g, c in groups.items(): print(" ", g.encode("unicode_escape").decode() if False else g, c)
if len(sys.argv) > 1:
    Path(sys.argv[1]).write_text(json.dumps({"stride": int(sys.argv[2]) if len(sys.argv) > 2 else 2, "items": {str(k): v for k, v in redo.items()}}), encoding="utf-8")
