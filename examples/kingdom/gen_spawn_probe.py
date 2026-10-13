"""Probe: does a creature prefab made with scene_add_prefab fromEntity work when a graph creates it? Two are created near
the player: one put into the player's faction, one left in the creature faction. Every three seconds the number of them
on the field and, for each, x, z, fighting/calm and hit points are printed (SP_COUNT n, then SP_AT x z state hp).

Usage: python gen_spawn_probe.py <guids.json> <out.ts> [ignored...]   (needs 'prefab:KV_guard' in guids.json)"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
GUARD = guids['prefab:KV_guard']
NO_TAGS = '[] as bigint[]'
source = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'

g.server({{id:1073741908,name:'_GSTS_KingdomEconomy',variables:{{lastTick:-1n,placed:false}}}})
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'PROBE_CLOCK',true,[1]);
  f.printString('SP_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName!=='PROBE_CLOCK')return;
  const t=f.queryGameTimeElapsed();
  if(t===f.get('lastTick'))return;
  f.set('lastTick',t);
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  if(!f.get('placed')){{f.teleportPlayer(players[0],[12,8,0],[0,90,0]);f.set('placed',true);return;}}
  if(t===5n){{
    const friend=f.createPrefab({GUARD},[9,8,1.5],[0,90,0],evt.eventSourceEntity,false,1,{NO_TAGS});
    if(f.queryIfEntityIsOnTheField(friend))f.modifyEntityFaction(friend,f.queryEntityFaction(players[0]));
  }}
  if(t===8n)f.createPrefab({GUARD},[17,8,-1.5],[0,270,0],evt.eventSourceEntity,false,1,{NO_TAGS});
  if(t%3n===0n){{
    const units=f.getEntitiesWithSpecifiedPrefabOnTheField({GUARD});
    f.printString('SP_COUNT');f.printString(f.dataTypeConversion(units.length,'str'));
    for(const unit of units){{
      const p=f.split3dVector(f.getEntityLocationAndRotation(unit).location);
      f.printString('SP_AT');
      f.printString(f.dataTypeConversion(p.xComponent,'str'));f.printString(f.dataTypeConversion(p.zComponent,'str'));
      if(f.queryIfSpecifiedEntityIsInCombat(unit))f.printString('fighting');else f.printString('calm');
      f.printString(f.dataTypeConversion(f.getCreationAttribute(unit).currentHp,'str'));
    }}
  }}
}})
"""
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(source)
print('written', sys.argv[2], len(source), 'chars')
