# boothsheet.py <video> <log ahead> <fps> <cols> <cellW> <x0> <y0> <x1> <y1> <booth> [<from> <to>]: a contact sheet of one
# booth of the fitting room, from the moment the round's log (copied to fit_out.json in the scratch folder) says it opened (FT <booth>) to the
# next one, or of the part of it between <from> and <to> seconds after it opened. <log ahead> is how many seconds the
# log's clock runs ahead of the play's (see frames.py; found by looking at when the first booths change in the video).
# Written to bs_<booth>.jpg in the scratch folder (MILIASTRA_SCRATCH, or miliastra-dev in the system's temporary folder).
import json, os, subprocess, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
SCRATCH = os.environ.get('MILIASTRA_SCRATCH') or os.path.join(tempfile.gettempdir(), 'miliastra-dev')
r = json.load(open(os.path.join(SCRATCH, 'fit_out.json'), encoding="utf-8"))
texts = [(p["t"], str(p["text"])) for p in r["prints"]]
opened = {}
for i, (t, text) in enumerate(texts):
    if text == 'FT' and i + 1 < len(texts): opened[int(texts[i + 1][1])] = t - float(sys.argv[2])
b = int(sys.argv[10]); start = opened[b]; end = opened.get(b + 1, start + 7)
if len(sys.argv) > 12: start, end = opened[b] + float(sys.argv[11]), opened[b] + float(sys.argv[12])
out = os.path.join(SCRATCH, 'bs_%d.jpg' % b)
subprocess.run([sys.executable, os.path.join(HERE, 'frames.py'), sys.argv[1], str(start), str(end), *sys.argv[3:6], out, *sys.argv[6:10]], check=True)
