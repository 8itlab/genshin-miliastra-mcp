"""Small graphs that load the server in one way each, to find what makes it end a level for load.
Usage: python gen_load.py <guids.json> <out dir>   (guids: graph:id, graph:name, prefab:DS_coin)
Each graph prints LT_READY, LT_DONE when the third run got through its work, then LT_BEAT every 25 (5 Hz) or 10 (2 Hz) runs."""
import json, os, sys
guids = json.load(open(sys.argv[1], encoding='utf-8'))
COIN = guids['prefab:DS_coin']
out = sys.argv[2]
os.makedirs(out, exist_ok=True)
nums = lambda n: ','.join(f'{i}n' for i in range(n))

def graph(name, period, coins=0, work=''):
    hz = round(1 / period)
    setup = (f"if(tick===1n){{for(const i of [{nums(coins)}])f.createPrefab({COIN},f.create3dVector(-8.5+Number(i%10n)*1.8,0.7,-4+Number(i/10n)*2.5),[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);}}" if coins else '')
    source = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
// Load trial {name}: every {period} s. See scripts/dev/gen_load.py.
g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}',variables:{{tick:0n,sum:0}}}})
.on('whenEntityIsCreated',(evt,f)=>{{f.startTimer(evt.eventSourceEntity,'LT',true,[{period}]);f.printString('LT_READY');}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName!=='LT')return;
  const tick=f.get('tick')+1n;f.set('tick',tick);
  {setup}
  let acc=0;
  {work}
  f.set('sum',acc);
  if(tick===3n)f.printString('LT_DONE');
  if(tick%{5 * hz}n===0n)f.printString('LT_BEAT');
}})
"""
    open(os.path.join(out, name + '.ts'), 'w', encoding='utf-8', newline='\n').write(source)

query = f"for(const coin of f.getEntitiesWithSpecifiedPrefabOnTheField({COIN})){{const p=f.split3dVector(f.getEntityLocationAndRotation(coin).location);acc=acc+p.xComponent*p.zComponent;}}"
def math(n):
    tens, rest = n // 10, nums(10)
    return f"for(const a of [{nums(tens)}]){{for(const b of [{rest}]){{acc=acc+Number(a)*0.5+Number(b);}}}}"
single = lambda n: f"for(const a of [{nums(n)}]){{acc=acc+Number(a)*0.5+1;}}"
graph('idle5', 0.2)
graph('idle10', 0.1)
for coins in (10, 25, 50, 100):
    graph(f'query5x{coins}', 0.2, coins, query)
graph('query2x25', 0.5, 25, query)
for n in (20, 100):
    graph(f'single5x{n}', 0.2, 0, single(n))
graph('nest5x20', 0.2, 0, math(20))
graph('math5x100', 0.2, 0, math(100))
graph('math2x250', 0.5, 0, math(250))
flat = lambda n: ''.join(f"acc=acc+Number(tick+{i}n)*0.5+1;" for i in range(n))   # the same sums without a loop
for n in (12, 16):
    graph(f'single5x{n}', 0.2, 0, single(n))
graph('single2x30', 0.5, 0, single(30))
graph('single1x100', 1, 0, single(100))
for n in (16, 30, 45, 60, 200):
    graph(f'flat5x{n}', 0.2, 0, flat(n))
# Few rounds of a loop with a long body: is it the rounds that cost, or the nodes inside a loop?
body = ''.join(f"acc=acc+Number(a+{i}n)*0.5+1;" for i in range(8))
graph('heavy5x3x8', 0.2, 0, f"for(const a of [0n,1n,2n]){{{body}}}")
# Reading and writing a graph variable: the editor's size check counts each as four nodes. Does the running cost too?
# 45 times get, add, set is 135 nodes a tick as plain nodes (about 630 a second with the rest: fine) but 405 if each
# get and set counts four (about 1770 a second: over).
graph('var5x45', 0.2, 0, ''.join(f"f.set('sum',f.get('sum')+{i + 1});" for i in range(45)))
graph('var5x25', 0.2, 0, ''.join(f"f.set('sum',f.get('sum')+{i + 1});" for i in range(25)))
print('written', sorted(os.listdir(out)))
