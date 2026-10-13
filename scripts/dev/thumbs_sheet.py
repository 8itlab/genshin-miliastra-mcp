"""把若干缩略图拼成一张带编号的总览图，抽查用。用法：python thumbs_sheet.py <输出.jpg> batch <批次号> | ids <编号>..."""
import json, os, sys, tempfile
from pathlib import Path
from PIL import Image, ImageDraw
WORK = Path(os.environ.get("MILIASTRA_SCRATCH") or Path(tempfile.gettempdir()) / "miliastra-dev") / "thumbs"
def sheet(ids, out, folder, cols=8, cell=160):
    folder = Path(folder)
    rows = (len(ids) + cols - 1) // cols
    im = Image.new("RGB", (cols * cell, rows * (cell + 14)), (30, 30, 30)); d = ImageDraw.Draw(im)
    for k, i in enumerate(ids):
        x, y = k % cols * cell, k // cols * (cell + 14)
        f = folder / f"{i}.jpg"
        if f.exists(): im.paste(Image.open(f).resize((cell, cell)), (x, y))
        d.text((x + 3, y + cell + 1), str(i), fill=(255, 255, 255))
    im.save(out, quality=72)
if __name__ == "__main__":
    out, mode, rest = sys.argv[1], sys.argv[2], sys.argv[3:]
    if mode == "batch":
        plan = json.loads((WORK / "plan.json").read_text(encoding="utf-8"))
        sheet([it["id"] for it in plan[int(rest[0])]["items"]], out, WORK / "out" / f"b{int(rest[0]):03d}")
    else:  # 从仓库里最终选定的缩略图里取
        sheet([int(r) for r in rest], out, Path(__file__).resolve().parents[2] / "src" / "scene" / "thumbs")
