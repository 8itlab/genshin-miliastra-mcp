"""Graphs for finding what the editor's memory check (校验失败：服务器内存消耗过高) counts: about 2000 print nodes, which
pass on their own, plus a hundred of one kind of thing each. A graph that is refused shows that kind to be heavy.
Usage: python gen_mem.py <guids.json> <out dir>   (guids: graph:id, graph:name, prefab:DS_coin, DS_fire)
Nothing in these graphs runs: no timer is started."""
import json, os, sys
guids = json.load(open(sys.argv[1], encoding='utf-8'))
COIN, PIECE = guids['prefab:DS_coin'], guids['DS_fire']
out = sys.argv[2]
os.makedirs(out, exist_ok=True)
FX = "'GI_RootNode',true,true,[0,0,0],[0,0,0],1,false"
TWELVE = ','.join(f'new guid({PIECE})' for _ in range(12))

def graph(name, extra, prints=667, variables=''):
    block = lambda tag: ''.join(f"f.printString('{tag}{i}');" for i in range(prints))
    source = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ DamagePopUpType }} from 'genshin-ts/definitions/enum'
import {{ guid }} from 'genshin-ts/runtime/value'
// Memory trial {name}. See scripts/dev/gen_mem.py.
g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}',variables:{{tick:0n,sum:0{variables}}}}})
.on('whenEntityIsCreated',(evt,f)=>{{{block('a')}}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  {block('b')}
  const self=evt.eventSourceEntity;
  {extra}
}})
.on('whenEntityIsDestroyed',(evt,f)=>{{{block('c')}}})
"""
    open(os.path.join(out, name + '.ts'), 'w', encoding='utf-8', newline='\n').write(source)

many = lambda n, line: ''.join(line(i) for i in range(n))
graph('base', '')
graph('prefab100', many(100, lambda i: f"f.createPrefab({COIN},[{i},0.7,0],[0,0,0],self,false,1,[] as bigint[]);"))
graph('effect100', many(100, lambda i: f"f.mountLoopingSpecialEffect({4 + i % 80},self,{FX});"))
graph('loop50', many(50, lambda i: f"for(const one of [{TWELVE}]){{f.removeEntity(f.queryEntityByGuid(one));}}"))
graph('field100', many(100, lambda i: f"if(f.getEntitiesWithSpecifiedPrefabOnTheField({COIN}).length>{i})f.set('sum',{i});"))
graph('guid100', many(100, lambda i: f"f.hpLoss(f.queryEntityByGuid(new guid({PIECE})),{i + 1},true,false,false,DamagePopUpType.NormalPopUp);"))
graph('local100', many(100, lambda i: f"let v{i}=f.get('sum');if(v{i}>{i})v{i}=v{i}+1;f.set('sum',v{i});"))
graph('vars200', '', variables=''.join(f',v{i}:0n' for i in range(200)))
print('written', sorted(os.listdir(out)))
