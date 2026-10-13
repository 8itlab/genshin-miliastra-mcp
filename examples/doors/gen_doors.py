"""Doors: can one piece open, close and open again with its motion devices? (examples/doors/doors_test.json)

Graphs (the last argument picks one):
  stage (关卡实体)       creates the gate two seconds into the level
  gate  (prefab DR_gate)  3, 6, 9 and 12 seconds after it appears it starts its motion "open" (4 m up in a second),
                          "close" (4 m down), "open", "close", and says each time how high it stands before starting

Usage: python gen_doors.py <guids.json> <out.ts> <ignored x3> <stage | gate>"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'

// Doors, graph "{which}": see examples/doors/gen_doors.py.
g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})"""
BODY = {
    'stage': lambda: f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'DR_START',false,[2]);
  f.printString('DR_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName!=='DR_START')return;
  f.createPrefab({guids['prefab:DR_gate']},[5,0,0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
  f.printString('DR_GATE');
}})
""",
    'gate': lambda: """
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'DR_STEP',false,[3,6,9,12,15]);
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='DR_STEP')return;
  const at=f.split3dVector(f.getEntityLocationAndRotation(evt.eventSourceEntity).location);
  f.printString('DR_STEP');f.printString(f.dataTypeConversion(evt.timerSequenceId,'str'));f.printString(f.dataTypeConversion(at.yComponent,'str'));
  if(evt.timerSequenceId===0n)f.activateBasicMotionDevice(evt.eventSourceEntity,'open');
  if(evt.timerSequenceId===1n)f.activateBasicMotionDevice(evt.eventSourceEntity,'close');
  if(evt.timerSequenceId===2n)f.activateBasicMotionDevice(evt.eventSourceEntity,'open');
  if(evt.timerSequenceId===3n)f.activateBasicMotionDevice(evt.eventSourceEntity,'close');
})
""",
}
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(HEAD + BODY[which]())
print('written', sys.argv[2], which)
