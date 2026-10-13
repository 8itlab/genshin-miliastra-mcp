"""Puts screenshots of one playtest side by side in one picture (a contact sheet), each cut to the same part of the
screen and labelled with its play second: the way to look at motion frame by frame (does the knife leave when the hand
opens, is the sword in the hand, where does the stroke end).

Usage: python playtest_frames.py <request.json>
Request: {runDir, out, fromSeconds?, toSeconds?, every?, crop? [x0, y0, x1, y1] as fractions, columns?, width?, maxFrames?}
Prints one JSON line: {out, size, cell, frames: [{label, playSeconds}], skipped}."""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

req = json.load(open(sys.argv[1], encoding='utf-8'))
status = json.load(open(os.path.join(req['runDir'], 'status.json'), encoding='utf-8'))
shots = [s for s in status.get('screenshots', []) if s.get('playSeconds') is not None and os.path.exists(s['file'])]
low, high = req.get('fromSeconds'), req.get('toSeconds')
shots = [s for s in shots if (low is None or s['playSeconds'] >= low) and (high is None or s['playSeconds'] <= high)]
shots = shots[::max(1, int(req.get('every') or 1))]
limit = int(req.get('maxFrames') or 48)
skipped = max(0, len(shots) - limit)
shots = shots[:limit]
if not shots:
    print(json.dumps({'error': 'NO_FRAMES'}))
    sys.exit(0)
x0, y0, x1, y1 = req.get('crop') or [0, 0, 1, 1]
width = int(req.get('width') or 2000)
# Without a wish: up to four in one row, then rows of four, five and six as the frames get more.
columns = int(req.get('columns') or (len(shots) if len(shots) <= 4 else 4 if len(shots) <= 8 else 5 if len(shots) <= 15 else 6))
columns = max(1, min(columns, len(shots)))
cell_w = width // columns
font = None
for name in (r'C:\Windows\Fonts\msyh.ttc', r'C:\Windows\Fonts\arial.ttf'):
    if os.path.exists(name):
        font = ImageFont.truetype(name, max(12, cell_w // 24))
        break
cells = []
for s in shots:
    image = Image.open(s['file']).convert('RGB')
    w, h = image.size
    part = image.crop((int(x0 * w), int(y0 * h), max(int(x0 * w) + 1, int(x1 * w)), max(int(y0 * h) + 1, int(y1 * h))))
    part = part.resize((cell_w, max(1, round(part.height * cell_w / part.width))))
    text = ('%.2f s' if s.get('burst') else '%.1f s') % s['playSeconds']
    draw = ImageDraw.Draw(part)
    box = draw.textbbox((4, 2), text, font=font)
    draw.rectangle((box[0] - 3, box[1] - 2, box[2] + 3, box[3] + 2), fill=(0, 0, 0))
    draw.text((4, 2), text, fill=(255, 255, 0), font=font)
    cells.append(part)
cell_h = cells[0].height
rows = (len(cells) + columns - 1) // columns
sheet = Image.new('RGB', (cell_w * columns, cell_h * rows))
for k, part in enumerate(cells):
    sheet.paste(part, (k % columns * cell_w, k // columns * cell_h))
sheet.save(req['out'], quality=85)
print(json.dumps({'out': req['out'], 'size': list(sheet.size), 'cell': [cell_w, cell_h], 'columns': columns,
                  'frames': [{'label': s['label'], 'playSeconds': s['playSeconds']} for s in shots], 'skipped': skipped}))
