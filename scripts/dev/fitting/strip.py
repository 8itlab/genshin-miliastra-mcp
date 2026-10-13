# strip.py <out.jpg> <x0> <y0> <x1> <y1> <width> <name part> ...: the same crop (fractions) of several screenshots of the
# latest play (or an earlier one: STRIP_RUN), stacked, each labelled with its file name.
import glob, os, sys
from PIL import Image, ImageDraw, ImageFont
runs = sorted(glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'workspace', 'round-*', 'playtests', '*')), key=os.path.getmtime)
run = runs[-int(os.environ.get('STRIP_RUN', '1'))]   # STRIP_RUN=2: the play before the latest one
x0, y0, x1, y1 = [float(v) for v in sys.argv[2:6]]; width = int(sys.argv[6]); cells = []
font = ImageFont.truetype(r'C:\Windows\Fonts\msyh.ttc', 22)
for part in sys.argv[7:]:
    f = [p for p in sorted(glob.glob(os.path.join(run, "*.jpg"))) if part in os.path.basename(p)][0]
    im = Image.open(f).convert("RGB"); w, h = im.size
    c = im.crop((int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h)))
    c = c.resize((width, int(c.height * width / c.width)))
    ImageDraw.Draw(c).text((6, 4), os.path.basename(f), fill=(255, 255, 0), font=font)
    cells.append(c)
sheet = Image.new('RGB', (width, sum(c.height for c in cells)))
y = 0
for c in cells:
    sheet.paste(c, (0, y)); y += c.height
sheet.save(sys.argv[1], quality=88); print(sys.argv[1], sheet.size)
