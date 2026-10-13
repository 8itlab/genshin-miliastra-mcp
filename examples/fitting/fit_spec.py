"""What the fitting room shows: read by make_fit.py (writes the scene and the round's arguments) and gen_fitting.py
(writes the graphs). Edit SHOWS and MOMENTS, run make_fit.py, play fit_test.json.

Every entry of SHOWS is a booth: one animation of one kind of complex creature, played over and over by a few copies
standing in front of the camera, one copy per entry of 'tools' (None is as the model comes, otherwise a list of
(looping effect that is a model, attachment point[, scale])). The player is teleported from booth to booth. Attack
animations move the creature forward, which is why every animation gets a booth and fresh copies of its own. The booths
stand in a grid that stays on the ground of a new map (it ends near 32 m from the middle: a player teleported to x=32
fell out of the world)."""
import json
import os

# Complex creatures by a short name: add the ones to be looked at (scene_search_assets {group: "怪物(AI版)"}).
KEYS = {'scout': 30006009, 'nobushi': 30008001, 'hili': 30007001, 'hiliArcher': 30006001, 'musket': 30006008,
        'shield': 30006005, 'axe': 30006011, 'fireaxe': 30005002, 'water': 30006012}
CLEAVER = lambda scale: [(10002151, 'GI_WeaponR', scale)]   # 双手剑01, a dark slab of a blade: small it is a crude cleaver
SWORD = [(10002152, 'GI_WeaponR')]                          # 单手剑01
# (creature, animation, tools of each copy, layout). 'front' has the copies face the camera: what is in the hands, what
# the stroke looks like. 'side' shows them from the side, 3.5 m to either side of the player, the first walking in from
# the left and the second, farther away, from the right: how far a stroke carries the creature is only seen from the
# side (打手丘丘人's 攻击 was first written down as "hardly any step forward" from a front view; it is 1.3 m).
SHOWS = [
    ('hili', '攻击', [None, CLEAVER(0.55)], 'front'),
    ('hili', '攻击', [CLEAVER(0.55), CLEAVER(0.55)], 'side'),
    ('hili', '单手武器_三连击', [CLEAVER(0.55), CLEAVER(0.55)], 'side'),
]
# The moments of an animation at which its skill's graph runs (graphAtMs), where one moment at the start is not what is
# wanted. The creature's server graph prints FT_S every time the graph runs: a triple stroke with three moments prints
# three times each time it plays, which is how a moment (or several) is checked against what the frames show.
MOMENTS = {('hili', '攻击'): 1050, ('hili', '单手武器_三连击'): [350, 900, 1700]}
FIRST_AT = 8   # seconds on the stage's clock at which the first booth opens (its copies have stood there since second 1)
place = lambda b: (-25 + 10 * (b % 6), -26 + 10 * (b // 6))   # where the player stands in booth b: rows of six, the near row first
# Where the copies stand and which way they look, by layout and number of copies: (x, z ahead of the player, heading).
SLOTS = {'front': {1: [(1.4, 4, 155)], 2: [(-1.5, 4, 155), (1.5, 4, 155)], 4: [(-3.7, 4, 155), (-1.3, 4, 155), (1.3, 4, 155), (3.7, 4, 155)]},
         'side': {1: [(-3.2, 4.5, 105)], 2: [(-3.5, 4, 105), (3.5, 6.5, 255)]}}
USED = [key for key in KEYS if any(show[0] == key for show in SHOWS)]


def skills(key):
    """The animations shown of one creature, in the order of its skill list (numbered from 1)."""
    out = []
    for k, name, _, _ in SHOWS:
        if k == key and name not in out:
            out.append(name)
    return out


MAX_SKILLS = max(len(skills(k)) for k in USED)


def lengths():
    """Seconds of every animation by creature and name, from the catalog of the repository this file is in."""
    here = os.path.dirname(os.path.abspath(__file__))
    for path in (os.path.join(here, 'creature-animations.json'), os.path.join(here, '..', '..', 'src', 'scene', 'media', 'creature-animations.json')):
        if os.path.exists(path):
            data = json.load(open(path, encoding='utf-8'))
            return {int(c): {row[1]: row[2] for row in rows} for c, rows in data['creatures'].items()}
    raise SystemExit('creature-animations.json not found')


def plan():
    """[(second the booth opens, booth number, creature key, animation, tools, layout)], and the second it all ends.
    A creature begins about four seconds after it is created, so the copies of a booth are made when the booth before
    it opens."""
    seconds, at, out = lengths(), FIRST_AT, []
    for b, (key, name, tools, layout) in enumerate(SHOWS):
        out.append((at, b, key, name, tools, layout))
        at += max(6, int(seconds[KEYS[key]][name] + 3.999))
    return out, at
