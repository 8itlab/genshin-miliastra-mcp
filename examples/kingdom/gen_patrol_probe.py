"""Probe: what makes a creature that a graph created walk its patrol? Six creatures come out of the portal three seconds
apart, each given a different order, and every three seconds each one's x, z, fighting/calm and the x and z of what it is
aiming at are printed (PP_AT, number, x, z, state, aim x, aim z). The player stands 18 m from the portal: creatures
farther than about 30 m from every player do not move at all (first run of this probe, player 34 m away).

Run it with four patrol templates on the creatures (kv3_probe_patrol.json): 1 and 2 are the Kingdom ones, which start at
a waypoint in the spawn area; 3 and 4 are the same paths without that first waypoint.

  0  template 1 (spawn area -> 24.6)        3  template 4 (straight to x = 1)
  1  template 2 (24.6 -> 1)                 4  template 3, ordered four seconds after it appears
  2  template 3 (straight to 24.6)          5  never ordered

Usage: python gen_patrol_probe.py <guids.json> <out.ts> [ignored...]"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
E = [guids[f'KV_enemy_{i:02d}'] for i in range(6)]
NO_TAGS = '[] as bigint[]'
spawn = '\n'.join(f"  if(t==={3 * i + 6}n)f.createEntity(new guid({g}),{NO_TAGS});" for i, g in enumerate(E))
literal = lambda i: f"f.queryEntityByGuid(new guid({E[i]}))"
trace = '\n'.join(f"""  if(t%3n===0n){{const e{i}={literal(i)};if(f.queryIfEntityIsOnTheField(e{i})){{
    const p{i}=f.split3dVector(f.getEntityLocationAndRotation(e{i}).location);
    f.printString('PP_AT');f.printString('{i}');
    f.printString(f.dataTypeConversion(p{i}.xComponent,'str'));f.printString(f.dataTypeConversion(p{i}.zComponent,'str'));
    if(f.queryIfSpecifiedEntityIsInCombat(e{i}))f.printString('fighting');else f.printString('calm');
    const a{i}=f.getCreationSCurrentTarget(e{i});
    if(f.queryIfEntityIsOnTheField(a{i})){{const q{i}=f.split3dVector(f.getEntityLocationAndRotation(a{i}).location);
      f.printString(f.dataTypeConversion(q{i}.xComponent,'str'));f.printString(f.dataTypeConversion(q{i}.zComponent,'str'));}}
    else{{f.printString('none');f.printString('none');}}
  }}}}""" for i in range(6))
source = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ guid }} from 'genshin-ts/runtime/value'

g.server({{id:1073741908,name:'_GSTS_KingdomEconomy',variables:{{lastTick:-1n,placed:false}}}})
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'PROBE_CLOCK',true,[1]);
  f.printString('PP_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName!=='PROBE_CLOCK')return;
  const t=f.queryGameTimeElapsed();
  if(t===f.get('lastTick'))return;
  f.set('lastTick',t);
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  if(!f.get('placed')){{f.teleportPlayer(players[0],[12,8,0],[0,90,0]);f.set('placed',true);return;}}
{spawn}
  if(t==={3 * 0 + 7}n)f.switchCreationPatrolTemplate({literal(0)},1n);
  if(t==={3 * 1 + 7}n)f.switchCreationPatrolTemplate({literal(1)},2n);
  if(t==={3 * 2 + 7}n)f.switchCreationPatrolTemplate({literal(2)},3n);
  if(t==={3 * 3 + 7}n)f.switchCreationPatrolTemplate({literal(3)},4n);
  if(t==={3 * 4 + 10}n)f.switchCreationPatrolTemplate({literal(4)},3n);
{trace}
}})
"""
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(source)
print('written', sys.argv[2], len(source), 'chars')
