"""由标定截图求镜头模型。用法：python thumbs_calibrate.py <Calib_B.png> <输出 thumbs_calibration.json>
标定包（见 README）：地面 y=0.4 上每 4 米一个 0.8 米火质立方体，z=0 那一列换成冰质，(0,·,4) 换成水质，
另有几个 y=3.0 的雷质立方体用来检验高度方向。"""
import json, sys
import numpy as np, cv2

img = cv2.imread(sys.argv[1])[:, :, ::-1].astype(int)
H_, W_ = img.shape[:2]
R, G, B = img[..., 0], img[..., 1], img[..., 2]
masks = {"fire": (R > 215) & (G > 70) & (G < 200) & (B < 120), "ice": (R < 200) & (G > 215) & (B > 225) & (R > 60),
         "water": (R < 70) & (B > 215) & (G < 200), "thunder": (R > 140) & (R < 235) & (G < 150) & (B > 215)}

def blobs(mask, min_area=600):
    n, lab, stats, cent = cv2.connectedComponentsWithStats(cv2.morphologyEx(mask.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)))
    out = []
    for i in range(1, n):
        x, y, w, h, a = stats[i]
        # 贴着屏幕边缘或界面条的方块不完整，丢掉
        if a < min_area or x < 8 or y < 70 or x + w > W_ - 8 or y + h > H_ - 8: continue
        if 1050 < cent[i][0] < 1500 and y < 150: continue  # 顶部工具条
        if cent[i][0] > 2200 and (y < 190 or y + h > H_ - 90): continue  # 右上角按钮、右下角 UID
        out.append((float(cent[i][0]), float(cent[i][1]), int(a)))
    return out

fire, ice, water, thunder = (blobs(masks[k]) for k in ("fire", "ice", "water", "thunder"))
assert len(water) == 1, water
# 分行：按 y 聚类（同一行的方块 y 基本相同）
ground = [(x, y, "f") for x, y, a in fire] + [(x, y, "i") for x, y, a in ice] + [(water[0][0], water[0][1], "w")]
ground.sort(key=lambda p: p[1])
rows = [[ground[0]]]
for p in ground[1:]:
    (rows[-1] if p[1] - rows[-1][-1][1] < 35 else rows.append([p]) or rows[-1]).append(p) if False else None
    if p[1] - rows[-1][-1][1] < 35: rows[-1].append(p)
    else: rows.append([p])
anchor_row = next(i for i, r in enumerate(rows) if any(p[2] == "w" for p in r))
world, pix = [], []
for i, row in enumerate(rows):
    wx = (i - anchor_row) * 4
    row.sort(key=lambda p: p[0])
    if wx == 0:
        k0 = next(k for k, p in enumerate(row) if p[2] == "w"); z0 = 4
    else:
        ks = [k for k, p in enumerate(row) if p[2] == "i"]
        if len(ks) != 1: continue
        k0, z0 = ks[0], 0
    for k, p in enumerate(row):
        wz = z0 + (k - k0) * 4
        if wx == 0 and wz <= 0: wz -= 4  # 原点处没有方块
        world.append((wx, wz)); pix.append((p[0], p[1]))
world, pix = np.array(world, float), np.array(pix, float)
# 方块中心在 y=0.4，先求该平面的单应，再分解出焦距和姿态（主点取画面中心，像素为正方形）
c = np.array([W_ / 2, H_ / 2])
Hm, _ = cv2.findHomography(world, pix - c, cv2.RANSAC, 6.0)
h1, h2, h3 = Hm[:, 0], Hm[:, 1], Hm[:, 2]
f = float(np.sqrt((h2[0] ** 2 + h2[1] ** 2 - h1[0] ** 2 - h1[1] ** 2) / (h1[2] ** 2 - h2[2] ** 2)))
Kinv = np.diag([1 / f, 1 / f, 1])
lam = (np.linalg.norm(Kinv @ h1) + np.linalg.norm(Kinv @ h2)) / 2
r1, r2, t = Kinv @ h1 / lam, Kinv @ h2 / lam, Kinv @ h3 / lam
if t[2] < 0: r1, r2, t = -r1, -r2, -t
r3 = np.cross(r1, r2)
if r3[1] > 0: r3 = -r3  # 世界向上在屏幕上应朝上（像素 y 变小）
t0 = t - r3 * 0.4  # 把平面从 y=0.4 换回 y=0

def project(p):
    v = r1 * p[0] + r3 * p[1] + r2 * p[2] + t0
    return [float(f * v[0] / v[2] + c[0]), float(f * v[1] / v[2] + c[1])]

err = [np.hypot(*(np.array(project((w[0], 0.4, w[1]))) - p)) for w, p in zip(world, pix)]
print("ground cubes", len(world), "rows", len(rows), "focal", round(f, 1), "reproj mean/max px", round(float(np.mean(err)), 2), round(float(np.max(err)), 2))
for x, z in [(-6, -6), (-6, 10), (6, -10), (6, 6), (-14, 2)]:
    pr = project((x, 3.0, z)); d = min((np.hypot(pr[0] - b[0], pr[1] - b[1]), b[:2]) for b in thunder) if thunder else None
    print("elevated", (x, z), "predicted", [round(v) for v in pr], "nearest blob dist", None if d is None else round(d[0], 1))
cam = -np.array([r1, r3, r2]).T @ t0 if False else None
Rm = np.array([r1, r3, r2]).T  # 列依次是世界 x、y、z 轴在相机坐标里的方向
pos = -Rm.T @ t0
print("camera position (x,y,z)", [round(float(v), 2) for v in pos], "pitch below horizon deg", round(float(np.degrees(np.arcsin(-(Rm.T @ np.array([0, 0, 1.0]))[1]))), 1))
json.dump({"screen": [W_, H_], "focal": f, "center": c.tolist(), "r1": r1.tolist(), "r2": r2.tolist(), "r3": r3.tolist(), "t": t0.tolist(),
           "origin": project((0, 0, 0)), "cameraPosition": pos.tolist(), "reprojMaxPx": float(np.max(err))}, open(sys.argv[2], "w"), indent=1)
