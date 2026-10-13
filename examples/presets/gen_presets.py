"""Presets: finds out, in the game, whether a mechanism asset has a preset status under a guessed id, and what its
values look like.

For the wooden and stone mechanisms the official samples use, the id is (asset id - 4000) x 10 (examples: the chest
10005006 has 100010060, the lever 10005030 has 100010300). This level tries that guess on assets the samples never
touch: scene_add_prefab registers the guessed id (presetStatusId), and the game is asked.

Four things at a time are put in front of the camera, six seconds per group. Each thing runs the same graph:
  0.0 s  it appears (value 0)
  2.5 s  f.setPresetStatus(self, id, 1)
  4.0 s  prints PS_V <asset> <value read back>, then sets 2
  5.5 s  prints PS_V <asset> <value read back>, then removes itself
and prints PS_CHANGED <asset> whenever the game reports that its preset status changed.

Graphs (the last argument picks one):
  stage  (关卡实体)        creates group after group
  thing  (every PS_ prefab) the steps above; the id and the asset are variables on the prefab

Usage: python gen_presets.py <guids.json> <out.ts> <ignored x3> <graph>"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
THINGS = sorted((k for k in guids if k.startswith('prefab:PS_')), key=lambda k: guids['order:' + k[7:]] if 'order:' + k[7:] in guids else k)
NO_TAGS = '[] as bigint[]'
PERIOD, FIRST = 6, 6
HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'

// Presets, graph "{which}": see examples/presets/gen_presets.py.
"""
SERVER = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})"
STR = lambda v: f"f.dataTypeConversion({v},'str')"
SPOTS = (-7.5, -2.5, 2.5, 7.5)
groups = [THINGS[i:i + 4] for i in range(0, len(THINGS), 4)]
times = ','.join(str(FIRST + PERIOD * i) for i in range(len(groups)))


def group(i, names):
    made = '\n    '.join(f"f.createPrefab({guids[n]},[{SPOTS[j]},0,5],[0,0,0],stage,false,1,{NO_TAGS});" for j, n in enumerate(names))
    return f"""  if(evt.timerSequenceId==={i}n){{
    {made}
    f.printString('PS_GROUP');f.printString('{i}');
    return;
  }}
"""


REPORT = f"""f.printString('PS_V');f.printString({STR("f.getCustomVariable(self,'aid').asType('int')")});f.printString({STR("f.getPresetStatus(self,sid)")});"""
BODY = {
    'stage': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'PS_NEXT',false,[{times}]);
  f.printString('PS_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName!=='PS_NEXT')return;
  const stage=evt.eventSourceEntity;
{''.join(group(i, names) for i, names in enumerate(groups))}}})
""",
    'thing': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'PS_STEP',false,[2.5,4,5.5]);
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName!=='PS_STEP')return;
  const self=evt.eventSourceEntity;
  const sid=f.getCustomVariable(self,'sid').asType('int');
  // The places in a timer's sequence are numbered from 0.
  if(evt.timerSequenceId===0n){{f.setPresetStatus(self,sid,1n);return;}}
  {REPORT}
  if(evt.timerSequenceId===1n){{f.setPresetStatus(self,sid,2n);return;}}
  f.removeEntity(self);
}})
.on('whenPresetStatusChanges',(evt,f)=>{{
  f.printString('PS_CHANGED');f.printString({STR("f.getCustomVariable(evt.eventSourceEntity,'aid').asType('int')")});
}})
""",
}
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(HEAD + BODY[which])
print('written', sys.argv[2], which)
