"""Probe: does a text control whose text names level variables ({1:lv.NAME}) show their values, and does it follow when
a graph changes them? The first Kingdom map has such a control (文本框, with KINGDOM_COINS, KINGDOM_DAY and others) and
the variable definitions on its stage entity. The graph writes the game clock into two of them every second.

Usage: python gen_hud_probe.py <guids.json> <out.ts> [ignored...]   (guids.json may carry 'stage', the stage entity's GUID)"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
STAGE = guids.get('stage', 1094713345)
source = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ guid }} from 'genshin-ts/runtime/value'

g.server({{id:{guids.get('graph:id', 1073741908)},name:'{guids.get('graph:name', '_GSTS_KingdomEconomy')}',variables:{{lastTick:-1n}}}})
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'HUD_CLOCK',true,[1]);
  f.printString('HUD_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName!=='HUD_CLOCK')return;
  const t=f.queryGameTimeElapsed();
  if(t===f.get('lastTick'))return;
  f.set('lastTick',t);
  const stage=f.queryEntityByGuid(new guid({STAGE}));
  f.setCustomVariable(stage,'KINGDOM_COINS',t);
  f.setCustomVariable(stage,'KINGDOM_DAY',t*100n);
  if(t%3n===0n){{f.printString('HUD_SET');f.printString(f.dataTypeConversion(t,'str'));}}
}})
"""
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(source)
print('written', sys.argv[2], len(source), 'chars')
