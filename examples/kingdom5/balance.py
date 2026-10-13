"""Kingdom v5 的数值模拟：只算规则，不进游戏。用来回答三个问题——
什么都不做会不会输、乱买能不能赢、认真玩有没有余量。数值读同目录的 kg5_rules.json，和 gen_kingdom5.py 用的是同一份。
用法：python balance.py

一局：N 个白天和夜晚。白天随便买；夜里怪分几拨从传送门出来，每拨里弓手各射一箭（大怪要两箭），
剩下的撞墙（一只掉一点墙血，大怪掉两点），墙倒了以后剩下的去抢君主：钱袋里有钱抢一枚（大怪两枚），没钱就抢王冠，输。
天亮：有工匠就把墙修满；按 基础 + 农夫 + 主堡 发钱，钱袋有上限。"""
import itertools, json, os, random, sys

RULES = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'kg5_rules.json'), encoding='utf-8'))
RULES['waves'] = [[tuple(b) for b in night] for night in RULES['waves']]
BUYS = ['citizen', 'farmer', 'archer', 'builder', 'wall', 'keep']


def new_state(r):
    return dict(coins=r['start'], citizens=0, farmers=0, archers=0, builders=0, keep=0, wall=None, hp=0, day=1, bounty=0, ground=0, log=[])


def can(s, r, what):
    p = r['price']
    people = s['citizens'] + s['farmers'] + s['archers'] + s['builders']
    if what == 'citizen': return s['coins'] >= p['citizen'] and people < r['people']
    if what == 'archer' and s['archers'] >= r['archers']: return False
    if what == 'farmer' and s['farmers'] >= r['farmers']: return False
    if what == 'builder' and s['builders'] >= 1: return False
    if what in ('farmer', 'archer', 'builder'): return s['citizens'] >= 1 and s['coins'] >= p[what]
    if what == 'wall':
        if s['builders'] < 1: return False
        if s['wall'] is None: return s['coins'] >= p['wood']
        if s['wall'] == 'wood': return s['keep'] >= 1 and s['coins'] >= p['stone']
        return False
    if what == 'keep': return s['keep'] < 2 and s['coins'] >= p['keep%d' % (s['keep'] + 1)]


def buy(s, r, what):
    p = r['price']
    if what == 'citizen': s['coins'] -= p['citizen']; s['citizens'] += 1
    elif what in ('farmer', 'archer', 'builder'): s['coins'] -= p[what]; s['citizens'] -= 1; s[what + 's'] += 1
    elif what == 'wall':
        kind = 'wood' if s['wall'] is None else 'stone'
        s['coins'] -= p[kind]; s['wall'] = kind; s['hp'] = r['wall'][kind]
    elif what == 'keep': s['keep'] += 1; s['coins'] -= p['keep%d' % s['keep']]
    s['log'].append('d%d %s' % (s['day'], what))
    take = min(s['ground'], r['cap'] - s['coins']); s['coins'] += take; s['ground'] -= take   # 钱袋有了空位，地上剩的币捡起来


def night(s, r, n):
    """返回 False 表示王冠被抢。"""
    for small, big in r['waves'][n]:
        shots = s['archers']
        # 弓手先打小怪（一箭一个），多出来的箭两支换一只大怪
        k = min(shots, small); small -= k; shots -= k; s['bounty'] += k * r.get('bounty', 0)
        k = min(shots // 2, big); big -= k; s['bounty'] += k * 2 * r.get('bounty', 0)
        for dmg in [1] * small + [2] * big:
            if s['wall'] is not None:
                s['hp'] -= dmg
                if s['hp'] <= 0: s['wall'] = None; s['hp'] = 0
                continue
            if s['coins'] <= 0: return False
            s['coins'] = max(0, s['coins'] - dmg)
    return True


def dawn(s, r):
    if s['wall'] is not None and s['builders'] >= 1: s['hp'] = r['wall'][s['wall']]
    inc = r['income']['base'] + r['income']['farmer'] * s['farmers'] + r['income']['keep'] * s['keep']
    total = s['coins'] + s['ground'] + inc + s['bounty']; s['coins'] = min(r['cap'], total); s['ground'] = total - s['coins']; s['bounty'] = 0
    s['day'] += 1


def play(r, policy, seed=0):
    rng = random.Random(seed); s = new_state(r)
    for n in range(r['nights']):
        policy(s, r, rng)
        if not night(s, r, n): return False, n + 1, s
        dawn(s, r)
    return True, r['nights'], s


def nothing(s, r, rng): pass


def randomly(s, r, rng):
    for _ in range(12):
        options = [b for b in BUYS if can(s, r, b)]
        if not options or rng.random() < 0.15: return
        buy(s, r, rng.choice(options))


def cost_of(s, r, what):
    p = r['price']
    if what == 'wall': return p['wood'] if s['wall'] is None else p['stone']
    if what == 'keep': return p['keep%d' % (s['keep'] + 1)]
    return p[what]


def ordered(order, reserve=0):
    """按固定的优先顺序买：每天从头看这张单子，买得起就买；买完钱袋至少留 reserve 枚。"""
    def policy(s, r, rng):
        progress = True
        while progress:
            progress = False
            for what, limit in order:
                have = {'citizen': s['citizens'], 'farmer': s['farmers'], 'archer': s['archers'], 'builder': s['builders'],
                        'wall': {None: 0, 'wood': 1, 'stone': 2}[s['wall']], 'keep': s['keep']}[what]
                if have >= limit: continue
                need = 'citizen' if what in ('farmer', 'archer', 'builder') and s['citizens'] < 1 else what
                if not can(s, r, need) or s['coins'] - cost_of(s, r, need) < reserve: continue
                buy(s, r, need); progress = True; break
    return policy


POLICIES = {
    '不买': nothing,
    '只墙': ordered([('builder', 1), ('wall', 2), ('keep', 1)]),
    '只弓': ordered([('archer', 3)]),
    '先农': ordered([('farmer', 3), ('builder', 1), ('wall', 1), ('archer', 3), ('keep', 1), ('wall', 2)]),
    '墙弓农': ordered([('builder', 1), ('wall', 1), ('archer', 1), ('farmer', 2), ('archer', 2), ('keep', 1), ('wall', 2), ('archer', 3), ('farmer', 4)]),
    '墙农弓': ordered([('builder', 1), ('wall', 1), ('farmer', 2), ('archer', 2), ('keep', 1), ('wall', 2), ('archer', 3), ('farmer', 4)]),
    '墙弓不农': ordered([('builder', 1), ('wall', 1), ('archer', 3), ('keep', 1), ('wall', 2)]),
}


def report(r, label):
    line = []
    for name, pol in POLICIES.items():
        ok, n, st = play(r, pol)
        line.append('%s:%s' % (name, ('赢剩%d' % st['coins']) if ok else '输%d' % n))
    wins = 0; died = [0] * (r['nights'] + 1); N = 4000
    for i in range(N):
        ok, n, st = play(r, randomly, i); wins += ok
        if not ok: died[n] += 1
    print(label, '|', ' '.join(line), '| 乱买赢 %.0f%% 输在 %s' % (wins * 100 / N, ' '.join('%d:%.0f%%' % (i, died[i] * 100 / N) for i in range(1, r['nights'] + 1))))


if __name__ == '__main__':
    r = RULES; r.setdefault('bounty', 0)
    for name, pol in POLICIES.items():
        ok, n, st = play(r, pol)
        print('%-6s %s 第%d夜 剩%d币 墙%s/%d 弓%d 农%d 堡%d | %s' % (name, '赢' if ok else '输', n, st['coins'], st['wall'], st['hp'], st['archers'], st['farmers'], st['keep'], ' '.join(st['log'])))
    report(r, '现在的数值')
