"""Kingdom v3 scene: the same functional pieces as v2 (names KV_*, read by gen_kingdom_v2.py) plus scenery (names KS_*).
Usage: python gen_kv3_scene.py <v2_scene.json> <out_functional.json> <out_scenery.json>

Framing: the lane runs along x at z=0 (keep 0, camp 5, hammer 10, bow 15, wall 23, portal 30), ground y=7.6. The play camera
stands on the -z side, 14 m from the monarch (scene_set_camera; the base map had 6 m), so the picture is about 20 m wide and
11.6 m tall at the lane, with the monarch a little below the middle.

Composition, front to back:
  river        z -16..-4.5  water fills the bottom of the picture the way the river does in Kingdom; reeds and stones on the bank
  lane         z -2..2      paved inside the town only
  props        z 3..9       one tight group per station (keep, camp, hammer, bow, wall site) with open grass between groups
  houses       z 9..13
  near trees   z 13..18     thinned out behind the town so it reads as a clearing, closing in on both sides of it
  far trees    z 22..27     scaled to different heights so the skyline rises and falls and some sky shows
Palette: the town is deep green, thatch, wood and warm lamps; beyond the wall it turns to grey rock and pale dead trees."""
import json, sys
G = 7.6
v2 = json.load(open(sys.argv[1], encoding="utf-8"))
# From v2: the stations' props, the crown and the twelve dormant Greed. The purse cubes are gone (coins are created by the graph),
# and the wall is created by the graph from finished assets when it is built.
keep = [b for b in v2["blocks"] if not b["name"].startswith(("KV_portal", "KV_road", "KV_coin_")) and b["name"] != "KV_wall"]
def add(lst, name, template, x, z, y=0, rot=0, **kw):
    b = {"template": template, "name": name, "position": [x, round(G + y, 2), z]}
    if rot: b["rotation"] = [0, rot, 0]
    b.update(kw); lst.append(b)
fx = []
# portal: a ruined stone arch facing the camera. The water block is translucent, so a dark board behind it gives the pane its depth.
add(fx, "KV_portal_arch", 20002586, 30, 4.6, scale=1.1)
add(fx, "KV_portal_veil", "水质立方体", 30, 4.6, y=1.7, size=[3.2, 3.4, 0.15], createAtStart=False)  # the graph lights it at night
add(fx, "KV_portal_back", "木质天花板（黑）", 30, 4.82, y=1.7, size=[3.2, 3.4, 0.1])
# lamps by the keep, the camp and the wall site: named so the graph can find them (lit at night)
for i, x in enumerate((-3.9, 7.3, 19.4)):
    add(fx, f"KV_lamp_{i}", 20002570, x, 4.3, scale=0.6)
functional = {"name": "Kingdom_V3", "blocks": keep + fx}

s = []
def put(template, x, z, rot=0, scale=None, y=0):
    kw = {} if scale is None else {"scale": scale}
    add(s, f"KS_{len(s) + 1:03d}", template, x, z, y=y, rot=rot, **kw)
def many(items):
    for it in items: put(it[2], it[0], it[1], *it[3:])

# river: a dark stone bed with a clear water body (立方形水体, a 1 m cube anchored at its centre) lying on it. The water body
# mirrors the bank and the lamps, but only over something dark: over grass it cannot be seen at all. The bright 水质立方体
# looks like blue jelly at this size, and a stretched block shows its texture as a giant grid, so the bed is a floor asset.
for x in range(-42, 67, 12):
    put(20002056, x, -10.25, scale=[1.21, 0.2, 1.15])
    put(10005106, x, -10.25, scale=[12.05, 0.4, 11.5], y=0.25)
many([(6.0, -6.2, 20001197, 0, None, 0.47), (-12.0, -6.6, 20002395, 40, None, 0.47), (21.0, -6.4, 20001197, 120, None, 0.47),
      (33.0, -6.8, 20002395, 200, None, 0.47)])  # lily pads near the bank
put(20002463, -4.0, -8.0, rot=90, scale=0.5, y=0.3)  # a rowing boat by the keep
# reeds and stones on the bank. Everything on the camera side stays under about 1 m: the camera pulls in close
# whenever something stands on the line between it and the monarch.
many([(-14.0, -3.6, 20002489, 0, 0.5), (-13.1, -4.0, 20002489, 0, 0.5), (-5.5, -3.7, 20002489, 0, 0.5), (2.5, -3.9, 20002489, 0, 0.5),
      (3.3, -3.5, 20002489, 0, 0.5), (9.2, -3.8, 20002489, 0, 0.5), (15.5, -3.6, 20002489, 0, 0.5), (16.3, -4.0, 20002489, 0, 0.5),
      (22.6, -3.7, 20002489, 0, 0.5), (28.4, -3.9, 20002489, 0, 0.5), (34.0, -3.7, 20002489, 0, 0.5), (39.0, -3.9, 20002489, 0, 0.5),
      (-8.5, -3.8, 20001208, 0, 0.35), (19.0, -3.9, 20001208, 70, 0.35), (31.5, -3.7, 20001208, 200, 0.35)])

# paved lane inside the town
for i, x in enumerate(range(-6, 23, 4)):
    put(20001116, x, 0, rot=(0, 180)[i % 2], scale=[1, 0.2, 0.62])

# keep: two thatched houses behind the fire, a well, a few barrels, a lamp
many([(-7.5, 11.5, 20002403), (4.0, 12.5, 20002402, 180), (-4.6, 7.4, 20002112), (1.9, 5.0, 20001019), (2.7, 5.5, 20001019),
      (-1.3, 6.8, 20001018, 20)])
# camp, hammer shop, bow shop: the tent, goods, sign and targets are functional pieces; these complete each group
many([(11.8, 7.6, 20001230, 30), (13.0, 7.2, 20001086), (17.0, 6.6, 20002275, 40),
      (18.2, 7.2, 20001271), (15.5, 9.4, 20001047, 90), (18.7, 9.4, 20001047, 90)])
# wall site: watchtower, a stake marking the far end of the wall line, a lamp
many([(21.2, 9.5, 20002675, 0, 0.55), (23, 8.3, 20001837, 0, [1, 0.72, 1])])
# flowers and low greens along the lane edge, white and green only
many([(-3.2, 3.0, 20001189), (12.5, 3.1, 20001189), (20.8, 3.0, 20001189), (3.6, 3.2, 20001190), (25.5, 3.2, 20001190),
      (16.2, 3.2, 20001860), (-10.5, 3.2, 20001860)])

# behind the town: a thin line of dark trees and a few bushes, so the houses stand in a clearing
many([(-3.0, 16, 20002340), (-0.5, 15.5, 20002183), (8.5, 16.5, 20002338), (11.0, 15, 20002183), (15.5, 17, 20002338),
      (18.5, 15.5, 20002340), (22.5, 16.5, 20002183), (-1.5, 10.5, 20002359), (9.5, 11.5, 20001004), (14.0, 11.0, 20001186),
      (19.5, 12.0, 20002359)])
# left of the town the forest closes in on the lane and ends at a rock face
many([(-11.0, 7.5, 20002183), (-13.5, 5.2, 20002338), (-12.5, 10.0, 20001004), (-9.8, 5.0, 20001186), (-16.5, 7.0, 20001004),
      (-19.0, 15, 20002183), (-14.5, 16.5, 20002338), (-20.0, 4.5, 20002352), (-23.0, 12, 20002183), (-26.0, 16, 20002338),
      (-24.0, 6.5, 20001035, 90), (-17.5, 10.5, 20002172)])
# just outside the wall: the last green
many([(25.0, 7.5, 20002183), (24.5, 10.0, 20001186), (25.0, 13.5, 20001199)])
# enemy side: grey rock, pale dead trees, hilichurl works
many([(26.8, 10.5, 20001044), (35.5, 11.5, 20001045), (33.5, 8.0, 20002171), (38.8, 8.5, 20001043, 0, 0.7),
      (27.5, 15.0, 20003184), (33.5, 14.5, 20003181), (39.0, 13.5, 20003182), (44.5, 15.0, 20003183),
      (31.0, 19.5, 20003184, 120), (36.0, 17.5, 20003172), (42.0, 19.0, 20003181, 200), (48.0, 18.0, 20003182),
      (36.2, 6.2, 20003176), (32.6, 6.8, 20003182, 0, 0.6),
      (34.5, 4.4, 20001663), (26.6, 4.0, 20001661, 20), (43.5, 6.5, 20002084, 0, 0.8), (41.0, 11.0, 20001740)])
# right end: rock and dead wood close the view
many([(50.0, 8.5, 20002172), (47.0, 5.5, 20001043), (52.0, 12.0, 20003184), (55.0, 7.0, 20003181)])
# far trees at different heights
many([(-36, 20, 20002344, 0, 0.8), (-30, 24, 20002344, 0, 0.8), (-21, 23, 20002337, 0, 0.75), (-15, 25, 20002182, 0, 0.9),
      (-8, 23, 20002337, 0, 0.6), (-2, 25.5, 20002344, 0, 0.55), (5.5, 23, 20002337, 0, 0.7), (11, 25, 20002182, 0, 0.55),
      (17.5, 23.5, 20002337, 0, 0.65), (23, 26, 20002344, 0, 0.7), (30, 24, 20002337, 0, 0.75), (37, 26, 20002182, 0, 0.8),
      (45, 24, 20002337, 0, 0.7), (53, 25, 20002344, 0, 0.8)])
scenery = {"name": "Kingdom_V3_Scenery", "blocks": s}
json.dump(functional, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False)
json.dump(scenery, open(sys.argv[3], "w", encoding="utf-8"), ensure_ascii=False)
print(len(functional["blocks"]), len(s))
