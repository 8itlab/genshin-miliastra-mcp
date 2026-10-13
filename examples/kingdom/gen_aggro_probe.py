"""Probe: in custom aggro mode (scene_set_level_settings aggroMode "custom"), can a graph send a creature after a target
that is far outside its notice range? Six creatures come out of the portal three seconds apart, 17 to 19 m from the
player, and each gets a different order one second after it appears. Every three seconds each one's x, z, fighting/calm,
the x and z of what it is aiming at and the x and z of its aggro target are printed (PP_AT and eight more lines).

  0  aggro value 100 on the player's character       3  nothing (what creatures do by themselves in custom mode)
  1  the player's character taunts it                4  aggro value 100 on the character, removed twelve seconds later
  2  aggro value 100 on a cube standing at x = 20    5  aggro value 1 on the character

Usage: python gen_aggro_probe.py <guids.json> <out.ts> [ignored...]"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
E = [guids[f'KV_enemy_{i:02d}'] for i in range(6)]
NO_TAGS = '[] as bigint[]'
CUBE = 20001879  # 雷质立方体, created by its asset id
spawn = '\n'.join(f"  if(t==={3 * i + 6}n)f.createEntity(new guid({g}),{NO_TAGS});" for i, g in enumerate(E))
unit = lambda i: f"f.queryEntityByGuid(new guid({E[i]}))"
at = lambda i: 3 * i + 7
where = lambda name, entity: (f"if(f.queryIfEntityIsOnTheField({entity})){{const {name}=f.split3dVector(f.getEntityLocationAndRotation({entity}).location);"
                              f"f.printString(f.dataTypeConversion({name}.xComponent,'str'));f.printString(f.dataTypeConversion({name}.zComponent,'str'));}}"
                              f"else{{f.printString('none');f.printString('none');}}")
trace = '\n'.join(f"""  if(t%3n===0n){{const e{i}={unit(i)};if(f.queryIfEntityIsOnTheField(e{i})){{
    const p{i}=f.split3dVector(f.getEntityLocationAndRotation(e{i}).location);
    f.printString('PP_AT');f.printString('{i}');
    f.printString(f.dataTypeConversion(p{i}.xComponent,'str'));f.printString(f.dataTypeConversion(p{i}.zComponent,'str'));
    if(f.queryIfSpecifiedEntityIsInCombat(e{i}))f.printString('fighting');else f.printString('calm');
    const a{i}=f.getCreationSCurrentTarget(e{i});
    {where(f'q{i}', f'a{i}')}
    const g{i}=f.getTheAggroTargetOfTheSpecifiedEntity(e{i});
    {where(f'r{i}', f'g{i}')}
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
  const characters=f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0]);
  if(characters.length!==1)return;
  const monarch=characters[0];
  if(!f.get('placed')){{f.teleportPlayer(players[0],[12,8,0],[0,90,0]);f.set('placed',true);return;}}
  if(t===4n)f.createPrefab({CUBE},[20,8.1,3],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
{spawn}
  if(t==={at(0)}n)f.setTheAggroValueOfSpecifiedEntity(monarch,{unit(0)},100n);
  if(t==={at(1)}n)f.tauntTarget(monarch,{unit(1)});
  if(t==={at(2)}n){{for(const cube of f.getEntitiesWithSpecifiedPrefabOnTheField({CUBE}))f.setTheAggroValueOfSpecifiedEntity(cube,{unit(2)},100n);}}
  if(t==={at(4)}n)f.setTheAggroValueOfSpecifiedEntity(monarch,{unit(4)},100n);
  if(t==={at(4) + 12}n)f.removeTargetEntityFromAggroList(monarch,{unit(4)});
  if(t==={at(5)}n)f.setTheAggroValueOfSpecifiedEntity(monarch,{unit(5)},1n);
{trace}
}})
"""
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(source)
print('written', sys.argv[2], len(source), 'chars')
