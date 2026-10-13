"""Hazards: what pickups and hazards do to a character (examples/hazards/hazards_test.json).

Graphs (the last argument picks one):
  stage  (关卡实体)        puts the player at the start, creates the four things, knocks the player down at second 26
  boots  (prefab HZ_boots)  whoever walks in gets the status HZ_fast
  snare  (prefab HZ_snare)  whoever walks in gets the status HZ_held
The second lane (hazards_test2.json):
  stage2 (关卡实体)        puts the player at the start and creates the six things
  sting  (prefab HZ_sting)  hits whoever walks in with the ability unit HZ_sting
  star   (prefab HZ_starcoin)    gives the status HZ_star (invincible)
  spring (prefab HZ_springcoin)  gives the status HZ_spring (a higher jump)
The sky (hazards_sky.json):
  sky    (关卡实体)        switches to a day sky made by the tool, then to its night sky

Usage: python gen_hazards.py <guids.json> <out.ts> <ignored x3> <stage | boots | snare | stage2 | sting | star | spring | sky>"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'

// Hazards, graph "{which}": see examples/hazards/gen_hazards.py.
"""
OPEN = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})"
NO_TAGS = '[] as bigint[]'
P = lambda name: guids['prefab:' + name]


def giver(status, word):
    return OPEN + f"""
.on('whenEnteringCollisionTrigger',(evt,f)=>{{
  f.addUnitStatus(evt.enteringEntity,evt.enteringEntity,{guids['status:' + status]},1n,f.createDictionary([] as string[],[] as number[]));
  f.printString('{word}');
}})
"""


BODY = {
    'stage': lambda: OPEN + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'HZ_START',false,[2]);
  f.startTimer(evt.eventSourceEntity,'HZ_KILL',false,[26]);
  f.printString('HZ_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  if(evt.timerName==='HZ_KILL'){{f.defeatAllPlayerSCharacters(players[0]);f.printString('HZ_DOWN');return;}}
  if(evt.timerName!=='HZ_START')return;
  f.teleportPlayer(players[0],[-15,0.4,0],[0,0,0]);
  f.createPrefab({P('HZ_boots')},[-11,0.8,0],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
  f.createPrefab({P('HZ_snare')},[-3,0.8,0],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
  f.createPrefab({P('HZ_bumper')},[4,1.2,0],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
  f.createPrefab({P('HZ_pane')},[10,0,0],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
  f.printString('HZ_GO');
}})
""",
    'boots': lambda: giver('HZ_fast', 'HZ_BOOTS'),
    'star': lambda: giver('HZ_star', 'HZ_STAR'),
    'spring': lambda: giver('HZ_spring', 'HZ_SPRING'),
    'sting': lambda: OPEN + """
.on('whenEnteringCollisionTrigger',(evt,f)=>{
  f.initiateAttack(evt.enteringEntity,1,2000,[0,0,0],[0,0,0],'HZ_sting',false,evt.triggerEntity);
  f.printString('HZ_STING');
})
""",
    'stage2': lambda: OPEN + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'HZ_START',false,[2]);
  f.printString('HZ_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName!=='HZ_START')return;
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  f.teleportPlayer(players[0],[-17,0.4,0],[0,0,0]);
  f.createPrefab({P('HZ_sting')},[-14,0.8,0],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
  f.createPrefab({P('HZ_starcoin')},[-10,0.8,0],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
  f.createPrefab({P('HZ_sting')},[-6,0.8,0],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
  f.createPrefab({P('HZ_wind')},[-1,0,0],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
  f.createPrefab({P('HZ_magnet')},[7,1.2,0],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
  f.createPrefab({P('HZ_springcoin')},[13,0.8,0],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
  f.printString('HZ_GO');
}})
""",
    'snare': lambda: giver('HZ_held', 'HZ_SNARE'),
    # hazards_sky.json: the sky of the map until second 4, a day sky made by the tool until 10, then its night sky.
    'sky': lambda: OPEN + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'HZ_DAY',false,[9]);
  f.startTimer(evt.eventSourceEntity,'HZ_NIGHT',false,[15]);
  f.printString('HZ_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(evt.timerName==='HZ_DAY'){{f.modifyEnvironmentSettings({guids.get('environment:HZ_day',0)}n,players,false,0n);f.printString('HZ_DAY');}}
  if(evt.timerName==='HZ_NIGHT'){{f.modifyEnvironmentSettings({guids.get('environment:HZ_night',0)}n,players,false,0n);f.printString('HZ_NIGHT');}}
}})
""",
}
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(HEAD + BODY[which]())
print('written', sys.argv[2], which)
