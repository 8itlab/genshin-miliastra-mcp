"""Graphs for finding how the editor counts nodes (校验失败：节点图中的节点数超标：N). Each is 2994 print nodes, which the
editor counts one for one, plus twenty copies of one construct, so that the editor always refuses it and names its count.
(editor's count - build_project's nodeCount) / 20 is what the editor adds for that construct.
Usage: python gen_count.py <guids.json> <out dir>   (guids: graph:id, graph:name, prefab:DS_coin, DS_fire)"""
import json, os, sys
guids = json.load(open(sys.argv[1], encoding='utf-8'))
COIN, PIECE = guids['prefab:DS_coin'], guids['DS_fire']
out = sys.argv[2]
os.makedirs(out, exist_ok=True)
ints = lambda n: ','.join(f'{i}n' for i in range(n))

def graph(name, line, copies=20, prints=998):
    block = lambda tag: ''.join(f"f.printString('{tag}{i}');" for i in range(prints))
    extra = ''.join(line(i) for i in range(copies))
    source = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ guid }} from 'genshin-ts/runtime/value'
// Node count trial {name}. See scripts/dev/gen_count.py.
g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}',variables:{{tick:0n,sum:0}}}})
.on('whenEntityIsCreated',(evt,f)=>{{{block('a')}}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  {block('b')}
  {extra}
}})
.on('whenEntityIsDestroyed',(evt,f)=>{{{block('c')}}})
"""
    open(os.path.join(out, name + '.ts'), 'w', encoding='utf-8', newline='\n').write(source)

graph('c_branch', lambda i: f"if(f.get('tick')>{i}n)f.set('tick',{i}n);")
graph('c_add', lambda i: f"f.set('tick',f.get('tick')+{i + 1}n);")
graph('c_local', lambda i: f"let v{i}=f.get('tick');f.set('tick',v{i});")
graph('c_local_set', lambda i: f"let w{i}=f.get('tick');w{i}=w{i}+1n;w{i}=w{i}+2n;f.set('tick',w{i});")
graph('c_loop12', lambda i: f"for(const one of [{ints(12)}]){{f.set('tick',one);}}")
graph('c_loop3', lambda i: f"for(const one of [{ints(3)}]){{f.set('tick',one);}}")
graph('c_list12', lambda i: f"f.set('tick',f.getCorrespondingValueFromList([{ints(12)}],{i % 12}n));")
graph('c_loop_field', lambda i: f"for(const one of f.getEntitiesWithSpecifiedPrefabOnTheField({COIN})){{f.removeEntity(one);}}")
graph('c_sum', lambda i: f"f.set('sum',f.get('sum')+Number(f.get('tick')+{i}n)*0.5+1);")
# Second round: the two constructs after which the editor counted more than build_project (twelve GUIDs looped over: +19
# a loop; a local changed inside an if: +6), taken apart.
guids12 = ','.join(f'new guid({PIECE})' for _ in range(12))
guids3 = ','.join(f'new guid({PIECE})' for _ in range(3))
graph('d_loop_guid12', lambda i: f"for(const one of [{guids12}]){{f.removeEntity(f.queryEntityByGuid(one));}}")
graph('d_loop_guid3', lambda i: f"for(const one of [{guids3}]){{f.removeEntity(f.queryEntityByGuid(one));}}")
graph('d_list_guid12', lambda i: f"f.removeEntity(f.queryEntityByGuid(f.getCorrespondingValueFromList([{guids12}],{i % 12}n)));")
graph('d_guid', lambda i: f"f.removeEntity(f.queryEntityByGuid(new guid({PIECE})));")
graph('d_local_if', lambda i: f"let v{i}=f.get('sum');if(v{i}>{i})v{i}=v{i}+1;f.set('sum',v{i});")
graph('d_local_if_int', lambda i: f"let v{i}=f.get('tick');if(v{i}>{i}n)v{i}=v{i}+1n;f.set('tick',v{i});")
graph('d_float_cmp', lambda i: f"if(f.get('sum')>{i})f.set('sum',{i});")
# Third round. The editor has a second count, shown when a graph of fewer than 3000 nodes is refused for memory
# (服务器内存消耗过高): there some constructs count for more than their nodes. Each graph here stays under 3000 nodes
# (2928 prints + 3 + about 64 nodes of one construct), so a number above 3000 in the refusal is that second count.
def heavy(name, nodes, line):
    graph(name, line, copies=64 // nodes, prints=975)
heavy('e_loop_guid12', 4, lambda i: f"for(const one of [{guids12}]){{f.removeEntity(f.queryEntityByGuid(one));}}")
heavy('e_loop_int12', 3, lambda i: f"for(const one of [{ints(12)}]){{f.set('tick',one);}}")
heavy('e_list_int12', 3, lambda i: f"f.set('tick',f.getCorrespondingValueFromList([{ints(12)}],{i % 12}n));")
heavy('e_list_int3', 3, lambda i: f"f.set('tick',f.getCorrespondingValueFromList([{ints(3)}],{i % 3}n));")
heavy('e_loop_field', 3, lambda i: f"for(const one of f.getEntitiesWithSpecifiedPrefabOnTheField({COIN})){{f.removeEntity(one);}}")
heavy('e_local_if', 8, lambda i: f"let v{i}=f.get('sum');if(v{i}>{i})v{i}=v{i}+1;f.set('sum',v{i});")
heavy('e_local_set', 8, lambda i: f"let w{i}=f.get('tick');w{i}=w{i}+1n;w{i}=w{i}+2n;f.set('tick',w{i});")
heavy('e_local', 4, lambda i: f"let v{i}=f.get('tick');f.set('tick',v{i});")
heavy('e_prefab', 3, lambda i: f"f.createPrefab({COIN},[{i},0.7,0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);")
# Fourth round: other loops and other kinds of variable.
heavy('f_finite_loop', 2, lambda i: f"f.finiteLoop(0n,5n,(n)=>{{f.printString('r{i}');}});")
heavy('f_custom_set', 1, lambda i: f"f.setCustomVariable(evt.eventSourceEntity,'c{i % 5}',{i}n);")
heavy('f_custom_get', 2, lambda i: f"f.set('tick',f.getCustomVariable(evt.eventSourceEntity,'c{i % 5}') as unknown as bigint);")
heavy('f_timer', 2, lambda i: f"f.startTimer(evt.eventSourceEntity,'T{i}',false,[1]);")
heavy('f_effect', 1, lambda i: f"f.mountLoopingSpecialEffect({4 + i % 80},evt.eventSourceEntity,'GI_RootNode',true,true,[0,0,0],[0,0,0],1,false);")
heavy('f_where', 4, lambda i: f"f.printString(f.dataTypeConversion(f.split3dVector(f.getEntityLocationAndRotation(evt.eventSourceEntity).location).xComponent,'str'));")
print('written', sorted(os.listdir(out)))
