"""Buttons: interaction buttons on the screen, tried in the game.

Two buttons (scene_add_button). A graph on the player template hears whenUiControlGroupIsTriggered, prints which control
it was (BT_PRESS index compositeIndex) and adds one to the player's score, which a progress bar shows.

Graphs (the last argument picks one):
  stage   (关卡实体)         prints BT_READY
  player  (player template)  the button event

Usage: python gen_buttons.py <guids.json> <out.ts> <ignored x3> <graph>"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'

// Buttons, graph "{which}": see examples/buttons/gen_buttons.py.
"""
SERVER = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})"
STR = lambda v: f"f.dataTypeConversion({v},'str')"
BODY = {
    'stage': SERVER + """
.on('whenEntityIsCreated',(evt,f)=>{
  f.printString('BT_READY');
})
""",
    'player': SERVER + f"""
.on('whenUiControlGroupIsTriggered',(evt,f)=>{{
  f.printString('BT_PRESS');f.printString({STR('evt.uiControlGroupIndex')});f.printString({STR('evt.uiControlGroupCompositeIndex')});
  const player=evt.eventSourceEntity;
  f.setCustomVariable(player,'score',f.getCustomVariable(player,'score').asType('int')+1n,true);
}})
""",
}
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(HEAD + BODY[which])
print('written', sys.argv[2], which)
