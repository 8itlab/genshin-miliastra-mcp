"""Images: switching a control of the screen off and on from a graph (examples/images/images_lives.json).

Graph "lives" (关卡实体): three discs on a dark panel stand for three lives. Nine seconds into the level the first is
switched off, at twelve the second, at fifteen the first comes back.

Usage: python gen_images.py <guids.json> <out.ts> <ignored x3> lives"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
C = lambda name: guids['image:' + name]
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ UIControlGroupStatus }} from 'genshin-ts/definitions/enum'

// Images, graph "lives": see examples/images/gen_images.py.
g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'IM_STEP',false,[9,12,15]);
  f.printString('IM_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName!=='IM_STEP')return;
  const players=f.getListOfPlayerEntitiesOnTheField();
  f.printString('IM_STEP');f.printString(f.dataTypeConversion(evt.timerSequenceId,'str'));
  for(const player of players){{
    f.setCustomVariable(player,'IM_hp',6n,true);
    if(evt.timerSequenceId===0n)f.modifyUiControlStatusWithinTheInterfaceLayout(player,{C('IM_life1')}n,UIControlGroupStatus.Off);
    if(evt.timerSequenceId===1n)f.modifyUiControlStatusWithinTheInterfaceLayout(player,{C('IM_life2')}n,UIControlGroupStatus.Off);
    if(evt.timerSequenceId===1n)f.modifyUiControlStatusWithinTheInterfaceLayout(player,{C('IM_late')}n,UIControlGroupStatus.On);
    if(evt.timerSequenceId===2n)f.modifyUiControlStatusWithinTheInterfaceLayout(player,{C('IM_life1')}n,UIControlGroupStatus.On);
  }}
}})
""")
print('written', sys.argv[2])
