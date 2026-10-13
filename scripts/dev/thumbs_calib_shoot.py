"""标定：导入标定方块 → 截图 → 求镜头模型（写 thumbs_calibration.json）→ 清场 → 拍空场景参考图。
要在桌面会话里跑；之后不能再动镜头（滚轮拉远再拉回并不回到原位：拉到最远会被截住）。用法：python thumbs_calib_shoot.py <包名>"""
import json, subprocess, sys, time
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from thumbs_lib import *

name = sys.argv[1]
blocks = []
for x in range(-16, 9, 4):
    for z in range(-16, 17, 4):
        if x == 0 and z == 0: continue
        t = "水质立方体" if (x, z) == (0, 4) else "冰质立方体" if z == 0 else "火质立方体"
        blocks.append({"template": t, "name": f"{name}_{x}_{z}", "position": [x, 0.4, z], "size": [0.8, 0.8, 0.8]})
for x, z in [(-6, -6), (-6, 10), (6, -10), (6, 6), (-14, 2)]:
    blocks.append({"template": "雷质立方体", "name": f"{name}H_{x}_{z}", "position": [x, 3.0, z], "size": [0.8, 0.8, 0.8]})
probe = Run({"runDir": str(WORK / "runs" / "calib")}); probe.focus("game"); time.sleep(1)
if (HERE / "thumbs_calibration.json").exists():  # 先按旧标定把场上的东西清掉
    for _ in range(2): clear_scene(probe, json.loads((HERE / "thumbs_calibration.json").read_text())["origin"], side=90, up=120, down=100)
built = build(name, blocks)
r = import_pack(name, [b["name"] for b in blocks])
os.remove(built["installedTo"])
time.sleep(2); r.focus("game"); move(r, 2548, 700); time.sleep(2.5)
grab(str(WORK / "calib.png"))
out = subprocess.run([sys.executable, str(HERE / "thumbs_calibrate.py"), str(WORK / "calib.png"), str(HERE / "thumbs_calibration.json")], capture_output=True, text=True)
print(out.stdout, out.stderr)
origin = json.loads((HERE / "thumbs_calibration.json").read_text())["origin"]
for _ in range(2):
    clear_scene(r, origin)
move(r, 2548, 700); time.sleep(1.5)
grab(str(WORK / "empty.png")).resize((1280, 720)).save(str(WORK / "empty_small.jpg"), quality=60)
print("OK")
