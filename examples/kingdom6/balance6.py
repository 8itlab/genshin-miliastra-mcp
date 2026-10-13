"""Kingdom v6, the numbers tried offline: a rough model of the five nights for a few ways of spending the coins.

It is not the game: who a Greed goes for and how fast everybody walks are guesses fitted to what the played rounds
showed (2026-10-11/12: a Greed is at the wall six or seven seconds after it appears and hacks at it every four and a
half, hopping back in between; a brute sweeps at it about as often; a thrower throws every four and a half seconds and
its knife takes 36; a soldier's leap takes 40 off up to two Greed every three and a half seconds; a soldier that stands
is fought first, out before the wall, and does not heal between nights; the builder mends 40 a blow, about seven blows
in a morning). It answers one question before anybody plays: with these numbers, does a sensible line get through, and
does a careless one fall? It flatters soldiers (in play the first one fell on the third night, here it mostly lives):
take the order of the lines from it, not the odds.

Usage: python balance6.py [rules.json] [runs]     (without a file: kg6_rules_play.json, the numbers of the full game)
Prints for every line of play: how many of the runs were won, on which night the others were lost, and what the wall
and the fighters looked like each morning (averages)."""
import json
import os
import random
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
RULES = json.load(open(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'kg6_rules_play.json'), encoding='utf-8'))
RUNS = int(sys.argv[2]) if len(sys.argv) > 2 else 200
DAY, NIGHT = 60, 45
F, PRICE, H = RULES['fight'], RULES['price'], RULES['fight']['health']
REAL = 5.39                                   # a creature's health is this many times the prefab's
KNIFE = round(F['knife'] * 0.45)              # what an ability unit's attack really takes
ARRIVE, THROW_EVERY, FIRST_THROW, SLASH_EVERY, BLOW_EVERY, BRUTE_EVERY = 6.5, 4.5, 5.0, 3.6, 4.5, 4.6
MEETS = 0.85                                  # how often a blow lands on a soldier while one stands: soldiers run out to meet the Greed
MEND_BLOWS = 7                                # blows of the builder in one morning

# What is bought on each day, in order (what cannot be paid or is not allowed is skipped).
LINES = {
    'the script (kg6_play)': [['citizen', 'citizen', 'builder', 'thrower', 'wood'], ['citizen', 'soldier'], ['citizen', 'thrower', 'citizen', 'farmer'], ['keep', 'citizen', 'soldier'], ['citizen', 'thrower', 'stone']],
    'the script with one soldier': [['citizen', 'citizen', 'builder', 'thrower', 'wood'], ['citizen', 'soldier'], ['citizen', 'thrower', 'citizen', 'farmer'], ['keep', 'citizen'], ['thrower', 'stone']],
    'defence first': [['citizen', 'citizen', 'builder', 'thrower', 'wood'], ['citizen', 'soldier'], ['citizen', 'thrower'], ['citizen', 'soldier'], ['citizen', 'thrower']],
    'economy first': [['citizen', 'citizen', 'builder', 'wood', 'citizen', 'farmer'], ['citizen', 'farmer', 'citizen'], ['thrower', 'citizen', 'soldier', 'citizen'], ['thrower', 'keep'], ['citizen', 'soldier', 'stone']],
    'wall and one thrower only': [['citizen', 'citizen', 'builder', 'thrower', 'wood'], [], [], [], []],
    'no wall': [['citizen', 'citizen', 'thrower', 'citizen', 'thrower'], ['citizen', 'soldier'], ['citizen', 'soldier'], ['citizen', 'thrower'], []],
}


def buy(s, what):
    people = s['citizens'] + s['farmers'] + s['builders'] + s['throwers'] + len(s['soldiers'])
    def pay(n):
        if s['coins'] < n:
            return False
        s['coins'] -= n
        return True
    if what == 'citizen':
        if people < RULES['people'] and pay(PRICE['citizen']):
            s['citizens'] += 1
    elif what in ('farmer', 'thrower', 'builder', 'soldier'):
        limit = {'farmer': RULES['farmers'], 'thrower': RULES['throwers'], 'builder': 1, 'soldier': RULES['soldiers']}[what]
        have = len(s['soldiers']) if what == 'soldier' else s[what + 's']
        if s['citizens'] > 0 and have < limit and pay(PRICE[what]):
            s['citizens'] -= 1
            if what == 'soldier':
                s['soldiers'].append(H['soldier'] * REAL)
            else:
                s[what + 's'] += 1
    elif what == 'wood':
        if s['builders'] and not s['wall'] and pay(PRICE['wood']):
            s['wall'] = [H['wall_wood'], H['wall_wood']]
    elif what == 'stone':
        if s['builders'] and s['wall'] and s['wall'][1] == H['wall_wood'] and s['keep'] >= 1 and pay(PRICE['stone']):
            s['wall'] = [H['wall_stone'], H['wall_stone']]
        elif s['builders'] and not s['wall'] and pay(PRICE['wood']):      # the wall fell: wood again
            s['wall'] = [H['wall_wood'], H['wall_wood']]
    elif what == 'keep':
        if s['keep'] < 2 and pay(PRICE['keep1'] if s['keep'] == 0 else PRICE['keep2']):
            s['keep'] += 1


def night(s, n, rng):
    """One night. Returns False when the crown is lost."""
    greed = []                                   # [appears, health, is brute, next blow, gone]
    for frac, (small, big) in zip(RULES['waveAt'][n], RULES['waves'][n]):
        greed += [[frac * NIGHT, H['greed'] * REAL, False, None] for _ in range(small)] + [[frac * NIGHT, H['brute'] * REAL, True, None] for _ in range(big)]
    throws = [FIRST_THROW + rng.random() for _ in range(s['throwers'])]
    slashes = [rng.random() * 2 for _ in s['soldiers']]
    grab = None
    t = 0.0
    while t < NIGHT:
        t += 0.1
        alive = [g for g in greed if g[1] > 0 and g[0] <= t]
        there = [g for g in alive if t >= g[0] + ARRIVE]
        # knives: at the Greed that appeared first
        for i in range(len(throws)):
            if alive and t >= throws[i] and t >= alive[0][0] + FIRST_THROW:
                alive[0][1] -= KNIFE
                throws[i] = t + THROW_EVERY + rng.random() * 0.5
                alive = [g for g in alive if g[1] > 0]
        # soldiers: a leap takes health off up to two of those before the wall
        for i in range(len(slashes)):
            if s['soldiers'][i] > 0 and there and t >= slashes[i]:
                for g in [g for g in there if g[1] > 0][:2]:
                    g[1] -= F['slash']
                slashes[i] = t + SLASH_EVERY + rng.random() * 0.5
        # the Greed's blows
        for g in there:
            if g[1] <= 0:
                continue
            if g[3] is None:
                g[3] = t + 0.3
            if t < g[3]:
                continue
            g[3] = t + (BRUTE_EVERY if g[2] else BLOW_EVERY) + rng.random()
            hit = F['smash'] if g[2] else F['punch']
            standing = [i for i, hp in enumerate(s['soldiers']) if hp > 0]
            if s['wall']:
                # A soldier that stands is fought first, out before the wall (in play no blow reached the wall on a
                # night the soldier lived through); the wall is hacked at by those the soldier is not busy with.
                if standing and rng.random() < MEETS:
                    s['soldiers'][rng.choice(standing)] -= hit
                    continue
                s['wall'][0] -= hit
                if s['wall'][0] <= 0:
                    s['wall'] = None
            else:
                # no wall: the monarch. A soldier in the way is fought first.
                if standing and rng.random() < 0.5:
                    s['soldiers'][standing[0]] -= hit
                elif s['coins'] > 0:
                    s['coins'] = max(0, s['coins'] - (2 if g[2] else 1))
                    g[1] = 0                         # it runs off with its loot
                elif grab is None:
                    grab = t + RULES['grabSeconds']
        if grab is not None and t >= grab:
            return False
    s['soldiers'] = [hp for hp in s['soldiers'] if hp > 0]
    return True


def play(line, rng):
    s = {'coins': RULES['start'], 'ground': 0, 'citizens': 0, 'farmers': 0, 'builders': 0, 'throwers': 0, 'soldiers': [], 'keep': 0, 'wall': None}
    mornings = []
    for n in range(RULES['nights']):
        if n:
            s['ground'] += RULES['income']['base'] + RULES['income']['farmer'] * s['farmers'] + RULES['income']['keep'] * s['keep']
            if s['wall'] and s['builders']:
                s['wall'][0] = min(s['wall'][1], s['wall'][0] + F['mend'] * MEND_BLOWS)
        for what in line[n]:
            took = min(RULES['cap'] - s['coins'], s['ground'])       # the purse holds ten: the rest lies there until there is room
            s['coins'] += took
            s['ground'] -= took
            buy(s, what)
        took = min(RULES['cap'] - s['coins'], s['ground'])
        s['coins'] += took
        s['ground'] -= took
        if not night(s, n, rng):
            return n + 1, mornings
        mornings.append((s['wall'][0] if s['wall'] else 0, len(s['soldiers']), s['coins']))
    return 0, mornings


for name, line in LINES.items():
    lost, seen = {}, [[0, 0, 0] for _ in range(RULES['nights'])]
    counts = [0] * RULES['nights']
    for run in range(RUNS):
        when, mornings = play(line, random.Random(run))
        lost[when] = lost.get(when, 0) + 1
        for i, m in enumerate(mornings):
            counts[i] += 1
            for k in range(3):
                seen[i][k] += m[k]
    won = lost.pop(0, 0)
    print(f"{name}: won {won}/{RUNS}" + ''.join(f", lost night {k}: {v}" for k, v in sorted(lost.items())))
    print('   mornings (wall, soldiers, coins): ' + '  '.join(f"{i + 1}: {seen[i][0] / counts[i]:.0f}, {seen[i][1] / counts[i]:.1f}, {seen[i][2] / counts[i]:.1f}" if counts[i] else f"{i + 1}: -" for i in range(RULES['nights'])))
