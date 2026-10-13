"""Measures what examples/listen played: cuts the recording of the playtest at the moment of every entry and writes
down whether anything was heard, how long it lasted, how loud it was and how bright it sounds.

Usage: python measure_sounds.py <round report json> <listen_list.json> <out.json>
The round report is what scripts/dev/mcp_round.mjs writes (ROUND_OUT): it has the prints with their seconds and the
audio summary of playtest_status with the path of the .wav.

For every entry: heard, seconds (from the first to the last moment it is above the quiet before it), peakDb (dB below
full scale), brightHz (the centre of its spectrum: a low thud is a few hundred, a click or a bell several thousand),
shape ("blip" under 0.4 s, "short" under 1.2 s, "long", "goes on" when it is still sounding when the next one starts)."""
import io, json, sys, wave
import numpy as np
report = json.load(io.open(sys.argv[1], encoding='utf-8'))
plan = json.load(io.open(sys.argv[2], encoding='utf-8'))
gap = plan['gapSeconds']
audio = report['audio']
with wave.open(audio['file'], 'rb') as w:
    rate = w.getframerate()
    data = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(np.float32) / 32768
# The prints come four at a time: LS_PLAY, place, kind, id. Their second is that of the log, a whole number.
prints = report['prints']; at = {}
for i, p in enumerate(prints):
    if p['text'] == 'LS_PLAY' and i + 1 < len(prints):
        at[int(prints[i + 1]['text'])] = p['t']
db = lambda v: round(20 * float(np.log10(max(v, 1e-6))), 1)
frame = rate // 50                                             # 20 ms
level = np.array([np.sqrt(np.mean(data[i:i + frame] ** 2)) for i in range(0, len(data) - frame + 1, frame)])
# When each entry was played, in seconds of the recording. The stamp of a print is a whole second of the log, whose
# clock runs about one percent slower than the wall clock and starts a little later, so it only says roughly when.
# The exact moment is where the sound begins: the first rise of 10 dB near the rough moment. The line from stamp to
# rough moment is fitted to the entries whose sound begins out of silence.
places = sorted(at)
stamp = np.array([at[k] for k in places], dtype=float) - audio['startsAt']


def rise(near, before=0.6, after=1.3):
    """The first moment near `near` (seconds) at which the level jumps 10 dB above the quietest of the 0.2 s before."""
    lo, hi = max(10, int((near - before) * 50)), min(len(level) - 1, int((near + after) * 50))
    for i in range(lo, hi):
        floor = max(float(level[i - 10:i].min()), 1e-5)
        if level[i] > max(floor * 3.2, 0.0015):
            return i, floor
    return None, None


line = (1.0093, 0.63)
for _ in range(3):
    xs, ys = [], []
    for x in stamp:
        i, floor = rise(x * line[0] + line[1])
        if i is not None and floor < 0.0006:
            xs.append(x); ys.append(i * 0.02)
    if len(xs) >= 8:
        line = tuple(float(v) for v in np.polyfit(xs, ys, 1))
print('stamps to seconds of the recording: x %.4f + %.2f, from %d entries that begin out of silence' % (line[0], line[1], len(xs)))
when = {k: x * line[0] + line[1] for k, x in zip(places, stamp)}
out = []
for k, entry in enumerate(plan['entries']):
    row = dict(entry, place=k)
    if k not in at:
        row['heard'] = None; out.append(row); continue
    first, floor = rise(when[k])
    if first is None:
        row.update(heard=False); out.append(row); continue
    # It lasts until it is back at the level before it for a fifth of a second, or until the next entry begins.
    limit = min(len(level), int((when.get(k + 1, when[k] + gap) - 0.25) * 50))
    last = first
    for i in range(first, limit):
        if level[i] > max(floor * 1.6, 0.0012): last = i
        elif i - last > 10: break
    seconds = round((last - first + 1) * 0.02, 2)
    piece = data[first * frame:(last + 1) * frame]
    spectrum = np.abs(np.fft.rfft(piece * np.hanning(len(piece)))); freqs = np.fft.rfftfreq(len(piece), 1 / rate)
    bright = int(round(float((spectrum * freqs).sum() / max(spectrum.sum(), 1e-9)), -1))
    goes_on = last >= limit - 3
    row.update(heard=True, at=round(first * 0.02 + audio['startsAt'], 1), seconds=seconds, peakDb=db(float(level[first:last + 1].max())), brightHz=bright,
               shape='goes on' if goes_on else 'blip' if seconds < 0.4 else 'short' if seconds < 1.2 else 'long', overPrevious=bool(floor > 0.0015))
    out.append(row)
json.dump({'about': 'Measured from a recording of examples/listen (scripts/dev/measure_sounds.py).', 'rows': out}, io.open(sys.argv[3], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for r in out:
    print(r['place'], r['kind'], r.get('id', ''), 'heard' if r.get('heard') else ('SILENT' if r.get('heard') is False else 'no print'),
          r.get('seconds', ''), r.get('peakDb', ''), r.get('brightHz', ''), r.get('shape', ''), '(over the one before)' if r.get('overPrevious') else '')
