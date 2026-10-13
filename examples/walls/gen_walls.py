"""Walls: what stops a character (examples/walls/walls_test.json).

One graph on the stage entity: two seconds in it puts the player at the start of the lane and switches off the model of
the last wall (WL_ghost), which should leave a wall that cannot be seen and still cannot be walked through.

Usage: python gen_walls.py <guids.json> <out.ts> <ignored x3> stage"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
# (In a rehearsal nothing is imported and the wall has no id: any number lets the graph compile.)
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ guid }} from 'genshin-ts/runtime/value'

// Walls, the stage graph: see examples/walls/gen_walls.py.
g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'WL_START',false,[2]);
  f.printString('WL_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName!=='WL_START')return;
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  f.teleportPlayer(players[0],[0,0.4,0],[0,0,0]);
  f.activateDisableModelDisplay(f.queryEntityByGuid(new guid({guids.get('WL_ghost', 1078000000)})),false);
  f.createPrefab({guids['prefab:WL_pad']},[-8,0,0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
  f.printString('WL_GO');
}})
""")
print('written', sys.argv[2])
