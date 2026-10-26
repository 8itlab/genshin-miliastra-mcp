"""Paimon (派蒙) put together from white-box shapes: the part list of examples/paimon, for scene_add_shape_prefab.

A chibi figure about 1.5 m tall whose face looks to +z (the way a prefab created with rotation 0 faces): a round head
with big blue eyes, white hair with bangs and two side locks, a dark crown, a white dress with a gold collar, a dark blue
cape with a purple lining, short arms and legs. Every part has solid false: she floats beside the player and must not
push anyone. The design was shaped with scene_preview_shapes (two rounds of looking from four sides) before anything
was written. In the game a pure white (#F4F3F7) on a white-box shape glared in the sun so that the hair was one bright
blob (playtest of 2026-10-26); the hair is a pale lavender grey (#B8BFCF) now, which read as white hair in play. Usage: python gen_paimon_parts.py  (writes paimon_parts.json next to it)"""
import json, math, os
P=[]
def add(shape,pos,size,color,rot=(0,0,0),name=None):
    d={"shape":shape,"position":[round(v,3) for v in pos],"size":[round(v,3) for v in size],"color":color,"solid":False}
    if any(rot): d["rotation"]=list(rot)
    if name: d["name"]=name
    P.append(d)
SKIN="#F2D2C0";HAIR="#B8BFCF";NAVY="#1F2B5E";GOLD="#E9B949";WHITE="#DCDFE7";EYE="#2B3F99";LIN="#5B4BA6"
# head and face
add("球体",(0,1.30,0),(0.62,0.60,0.58),SKIN,name="头")
add("球体",(-0.115,1.29,0.265),(0.10,0.14,0.05),EYE,name="左眼")
add("球体",(0.115,1.29,0.265),(0.10,0.14,0.05),EYE,name="右眼")
add("球体",(-0.10,1.32,0.29),(0.035,0.035,0.02),WHITE,name="左眼高光")
add("球体",(0.13,1.32,0.29),(0.035,0.035,0.02),WHITE,name="右眼高光")
add("球体",(-0.19,1.20,0.23),(0.08,0.04,0.03),"#F6B3B8",name="左腮红")
add("球体",(0.19,1.20,0.23),(0.08,0.04,0.03),"#F6B3B8",name="右腮红")
add("球体",(0,1.17,0.28),(0.05,0.025,0.02),"#C8566B",name="嘴")
# hair: back dome, top, bangs, side locks
add("球体",(0,1.36,-0.05),(0.68,0.66,0.60),HAIR,name="后脑头发")
add("球体",(0,1.52,0.06),(0.62,0.30,0.50),HAIR,name="头顶头发")
for i,x in enumerate((-0.18,-0.06,0.06,0.18)):
    add("圆锥",(x,1.47,0.24),(0.16,0.20,0.08),HAIR,rot=(180,0,(-12+8*i)),name=f"刘海{i+1}")
add("圆锥",(-0.30,1.05,0.10),(0.14,0.55,0.12),HAIR,rot=(180,0,-6),name="左鬓发")
add("圆锥",(0.30,1.05,0.10),(0.14,0.55,0.12),HAIR,rot=(180,0,6),name="右鬓发")
# crown on top: a dark band with three points and a gold gem
add("圆柱",(0.04,1.66,0.02),(0.22,0.06,0.20),"#2E2550",rot=(0,0,-12),name="发冠底座")
for i,(x,h) in enumerate(((-0.04,0.13),(0.04,0.17),(0.12,0.13))):
    add("三棱锥",(x+0.02,1.70+h/2-0.02*(i!=1),0.02),(0.07,h,0.06),"#2E2550",rot=(0,0,-12),name=f"发冠尖{i+1}")
add("球体",(0.045,1.67,0.12),(0.05,0.05,0.03),GOLD,name="发冠宝石")
# body: white dress
add("圆柱",(0,0.98,0),(0.26,0.22,0.22),WHITE,name="上身")
add("圆锥",(0,0.82,0),(0.46,0.32,0.40),WHITE,name="裙子")
add("圆柱",(0,1.07,0.02),(0.27,0.04,0.23),GOLD,name="领口金边")
# cape
add("长方体",(0,0.80,-0.19),(0.64,0.78,0.04),NAVY,rot=(-14,0,0),name="斗篷")
add("长方体",(0,0.81,-0.165),(0.58,0.72,0.02),LIN,rot=(-14,0,0),name="斗篷内衬")
for i,(x,y) in enumerate(((-0.15,0.95),(0.12,0.78),(-0.05,0.62),(0.18,1.0))):
    add("球体",(x,y,-0.15+0.25*(y-0.8)*0.25),(0.03,0.03,0.01),"#F5E9A8",rot=(-14,0,0),name=f"斗篷星{i+1}")
add("圆柱",(0,1.12,-0.08),(0.34,0.05,0.10),GOLD,name="斗篷扣")
# arms and legs
add("圆柱",(-0.19,0.95,0.02),(0.07,0.24,0.07),WHITE,rot=(0,0,-25),name="左臂")
add("圆柱",(0.19,0.95,0.02),(0.07,0.24,0.07),WHITE,rot=(0,0,25),name="右臂")
add("球体",(-0.24,0.84,0.03),(0.07,0.07,0.07),SKIN,name="左手")
add("球体",(0.24,0.84,0.03),(0.07,0.07,0.07),SKIN,name="右手")
add("圆柱",(-0.065,0.60,0.0),(0.08,0.18,0.08),WHITE,name="左腿")
add("圆柱",(0.065,0.60,0.0),(0.08,0.18,0.08),WHITE,name="右腿")
add("球体",(-0.065,0.50,0.02),(0.09,0.06,0.12),"#2C2C3A",name="左鞋")
add("球体",(0.065,0.50,0.02),(0.09,0.06,0.12),"#2C2C3A",name="右鞋")
out=os.path.join(os.path.dirname(os.path.abspath(__file__)),"paimon_parts.json")
json.dump(P,open(out,"w",encoding="utf8"),ensure_ascii=False,indent=1)
print(len(P),"parts written to",out)
