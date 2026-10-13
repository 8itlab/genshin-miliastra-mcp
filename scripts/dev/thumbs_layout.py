"""由镜头标定算出每批的格子：世界坐标和截图里的裁剪框。被拍摄脚本和切图脚本共用。"""
import json, itertools
from pathlib import Path
import numpy as np

HERE = Path(__file__).resolve().parent
CAL = json.loads((HERE / "thumbs_calibration.json").read_text())
OBJECT = 4.0   # 物件最长边缩放到多少米
PITCH_X, PITCH_Z = 10.0, 9.2  # 格距是物件的 2.5 / 2.3 倍，邻居才不会入镜
W, H = CAL["screen"]
# 界面挡住的地方（屏幕物理像素）：顶部工具条、右上角按钮、右下角 UID、原点的出生点标记
OX, OY = CAL["origin"]
FORBIDDEN = [(1040, 0, 1520, 150), (2380, 0, W, 210), (2150, 1370, W, H), (OX - 60, OY - 90, OX + 60, OY + 70)]
USABLE = (40, 62, W - 40, H - 40)  # 四周留边：清场时从边上起拖，起点不能压到物件


def project(p):
    r1, r2, r3, t = (np.array(CAL[k]) for k in ("r1", "r2", "r3", "t"))
    v = r1 * p[0] + r3 * p[1] + r2 * p[2] + t
    return CAL["focal"] * v[0] / v[2] + CAL["center"][0], CAL["focal"] * v[1] / v[2] + CAL["center"][1]


def box(cx, cz, half, height):
    pts = [project((cx + sx * half, y, cz + sz * half)) for sx in (-1, 1) for sz in (-1, 1) for y in (0, height)]
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    return min(xs), min(ys), max(xs), max(ys)


def cells(pitch_x=PITCH_X, pitch_z=PITCH_Z, size=OBJECT):
    """返回 [{x,z,crop:(l,t,r,b),core:(l,t,r,b)}]，按从远到近、从左到右排。crop 是物件占满时的外框，core 是物件一定盖住的中心小块。
    起点偏移取能放下最多格子的那一组。"""
    def make(x0, z0):
        out = []
        for i, j in itertools.product(range(-8, 8), range(-10, 10)):
            cx, cz = x0 + i * pitch_x, z0 + j * pitch_z
            b = box(cx, cz, size / 2 * 1.12, size * 1.08)
            if b[0] < USABLE[0] or b[1] < USABLE[1] or b[2] > USABLE[2] or b[3] > USABLE[3]: continue
            if any(b[0] < f[2] and b[2] > f[0] and b[1] < f[3] and b[3] > f[1] for f in FORBIDDEN): continue
            out.append({"x": float(cx), "z": float(cz), "crop": [round(v) for v in b], "core": [round(v) for v in box(cx, cz, size * 0.22, size * 0.3)]})
        return sorted(out, key=lambda c: (c["x"], c["z"]))
    return max((make(a, b) for a in np.arange(0, pitch_x, 0.25) for b in np.arange(0, pitch_z, 0.23)), key=len)


def fiducials(cs):
    """每批都放的两个 0.6 米雷质小方块；拍完核对它们的像素位置，镜头动没动一看便知。
    位置挑在离所有格子的外框都远的空地上（免得入镜），两个尽量离得远。"""
    def clear_of_cells(px, py):
        if not (USABLE[0] + 40 < px < USABLE[2] - 40 and USABLE[1] + 40 < py < USABLE[3] - 40): return False
        if any(f[0] - 60 < px < f[2] + 60 and f[1] - 60 < py < f[3] + 60 for f in FORBIDDEN): return False
        for c in cs:
            l, t, r, b = c["crop"]; grow = (r - l) * 0.3 + 45
            if l - grow < px < r + grow and t - grow < py < b + grow: return False
        return True
    spots = []
    for x in np.arange(-30, 25, 0.5):
        for z in np.arange(-40, 40, 0.5):
            px, py = project((x, 0.3, z))
            if clear_of_cells(px, py): spots.append(((float(x), 0.3, float(z)), (float(px), float(py))))
    first = min(spots, key=lambda s: s[1][0] + s[1][1])
    second = max(spots, key=lambda s: np.hypot(s[1][0] - first[1][0], s[1][1] - first[1][1]))
    return [{"position": list(p), "pixel": list(q)} for p, q in (first, second)]


if __name__ == "__main__":
    for px, pz, s in [(PITCH_X, PITCH_Z, OBJECT)]:
        c = cells(px, pz, s)
        sides = [min(k["crop"][2] - k["crop"][0], k["crop"][3] - k["crop"][1]) for k in c]
        print("fiducials", fiducials(c))
        print(px, pz, s, "cells", len(c), "crop side px min/max", min(sides), max(sides), "rows", sorted({k["x"] for k in c}))
