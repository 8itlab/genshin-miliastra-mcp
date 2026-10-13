# Builds index.json of the picture library from the captured pages: python imgcat_index.py  (needs rapidocr-onnxruntime)
import glob, json, os, re, tempfile
from rapidocr_onnxruntime import RapidOCR
ocr = RapidOCR()
SRC = os.path.join(os.environ.get('MILIASTRA_SCRATCH') or os.path.join(tempfile.gettempdir(), 'miliastra-dev'), 'imgcat')
ABOUT = {
 'shape': ('基础形状', 'plain shapes to colour: a rectangle, rounded ones, a disc'),
 'function-mono': ('功能图标-单色', 'white icons of what a button or a state does (arrows, marks, tools, signs)'),
 'function-colour': ('功能图标-彩色', 'the same kind of icons in colour'),
 'play-mono': ('玩法图标-单色', 'white icons of play: weapons, shields, hearts, effects on a character'),
 'play-colour': ('玩法图标-彩色', 'icons of play in colour: the seven elements and their pairs, flags, attack and defence marks, buffs'),
 'decor-mono': ('装饰图案-单色', 'a few white ornaments'),
 'decor-colour': ('装饰图案-彩色', 'decorations in colour: stars, crowns, balloons, coins, fruit, chests, little animals, clouds, ribbons, arrows'),
 'plate-mono': ('底板-单色', 'white plates to put things on and to tint: discs, rings, frames, panels, soft glows, half moons'),
 'plate-colour': ('底板-彩色', 'plates and frames in colour, the bases of bars among them'),
 'divider': ('分隔线', 'lines that divide a panel'),
 'glyph': ('特殊字符', 'letters of ranks, signs and other single characters drawn as pictures'),
 'skill': ('技能天赋', 'icons of skills and talents'),
 'item': ('道具', 'things: crystals, wood, potions, letters, books, keys, a chest, swords, spears, bows, rings and armour'),
 'creature': ('造物', 'portraits of creatures: slimes, hilichurls, machines, animals, birds'),
 'pad-focus': ('手柄焦点提示', 'the frames a gamepad shows around what is chosen'),
}
ORDER = ['shape', 'function-mono', 'function-colour', 'play-mono', 'play-colour', 'decor-mono', 'decor-colour', 'plate-mono', 'plate-colour', 'divider', 'glyph', 'skill', 'item', 'creature', 'pad-focus']
cats = []
for name in ORDER:
    files = sorted(glob.glob(os.path.join(SRC, name + '_*.jpg')))
    ids = set()
    for f in files:
        result, _ = ocr(f)
        ids.update(int(m) for item in (result or []) for m in re.findall(r'\b1\d{5}\b', item[1]))
    prefix = min(ids) // 1000
    ids = sorted(i for i in ids if i // 1000 == prefix)
    # What the reading missed in between is there all the same: the ids of a category run without gaps.
    cats.append({'category': name, 'zh': ABOUT[name][0], 'about': ABOUT[name][1], 'firstId': ids[0], 'lastId': ids[-1], 'count': ids[-1] - ids[0] + 1, 'read': len(ids), 'files': [os.path.basename(f) for f in files]})
json.dump({'capturedOn': '2026-10-13', 'categories': cats}, open(os.path.join(SRC, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps([[c['category'], c['firstId'], c['lastId'], c['count'], c['read'], len(c['files'])] for c in cats]))
