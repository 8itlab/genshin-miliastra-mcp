# frames.py <video cut by cutgb.py> <from> <to> <fps> <cols> <cellW> <out.jpg> [x0 y0 x1 y1]
# A contact sheet of the frames between two moments of the play, each labelled with its moment: seconds on the play's
# clock, the one the screenshots are named by (t005 is second 5; the cut video begins three seconds before its zero).
# The log's clock (the t of a print) runs five or six seconds ahead of it, differently in every round.
# x0..y1 crop the picture, as fractions of its width and height.
import glob, os, shutil, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont
v, s, e, fps, cols, w, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4]), int(sys.argv[5]), int(sys.argv[6]), sys.argv[7]
c = [float(a) for a in sys.argv[8:12]] if len(sys.argv) >= 12 else [0, 0, 1, 1]
tmp = os.path.join(os.environ.get('MILIASTRA_SCRATCH') or os.path.join(tempfile.gettempdir(), 'miliastra-dev'), 'frames_tmp')
shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp)
vf = f"fps={fps},crop=iw*{c[2]-c[0]}:ih*{c[3]-c[1]}:iw*{c[0]}:ih*{c[1]},scale={w}:-2"
subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-ss', str(s + 3), '-i', v, '-t', str(e - s), '-vf', vf, '-q:v', '3', os.path.join(tmp, 'f%04d.jpg')], check=True)
files = sorted(glob.glob(os.path.join(tmp, '*.jpg')))
h = Image.open(files[0]).height; rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * h)); d = ImageDraw.Draw(sheet); font = ImageFont.truetype(r'C:\Windows\Fonts\msyh.ttc', 18)
for k, f in enumerate(files):
    sheet.paste(Image.open(f), (k % cols * w, k // cols * h))
    d.text((k % cols * w + 4, k // cols * h + 2), '%.2f' % (s + k / fps), fill=(255, 255, 0), font=font)
sheet.save(out, quality=82)
print(out, len(files), sheet.size)
