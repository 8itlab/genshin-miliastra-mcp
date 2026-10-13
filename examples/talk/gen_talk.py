"""Talk: text bubbles (文本气泡) and nameplates (铭牌) on things, the platform's own way to put words and bars over an
NPC or an enemy. Three dolls stand in front of the player:

  TK_a  speaks from the start (two lines, once, and its graph is told when it has said them); a label over it shows
        its custom variable mood, and under the label its health bar with the numbers
  TK_b  speaks again and again; over it an icon and a bar that follows mood between the variables zero and top
  TK_c  is silent and bare until level second 16, when its graph switches its first bubble on and shows its nameplate; at
        second 24 the graph switches to its second bubble

Graphs (the last argument picks one):
  stage  (关卡实体)          puts the three dolls in place
  npc    (the three prefabs)  mood goes up by one every second, to 10; the late one switches at level seconds 16 and 24

Usage: python gen_talk.py <guids.json> <out.ts> <ignored x3> <graph>"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
HEAD = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'

// Talk, graph "{which}": see examples/talk/gen_talk.py.
"""
SERVER = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})"
STR = lambda v: f"f.dataTypeConversion({v},'str')"
NO_TAGS = '[] as bigint[]'
BODY = {
    'stage': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  const stage=evt.eventSourceEntity;
  f.createPrefab({guids['prefab:TK_a']},[-3,0,4],[0,180,0],stage,false,1,{NO_TAGS});
  f.createPrefab({guids['prefab:TK_b']},[0,0,4],[0,180,0],stage,false,1,{NO_TAGS});
  f.createPrefab({guids['prefab:TK_c']},[3,0,4],[0,180,0],stage,false,1,{NO_TAGS});
  f.printString('TK_READY');
}})
""",
    'npc': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'TK_MOOD',true,[1]);
  f.startTimer(evt.eventSourceEntity,'TK_LATE',false,[16,24]);
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  const self=evt.eventSourceEntity;
  if(evt.timerName==='TK_MOOD'){{
    const mood=f.getCustomVariable(self,'mood').asType('int');
    if(mood<10n)f.setCustomVariable(self,'mood',mood+1n,true);
  }}
  if(evt.timerName==='TK_LATE'){{
    if(f.getCustomVariable(self,'late').asType('int')===1n){{
      if(evt.timerSequenceId===0n){{
        f.switchActiveTextBubble(self,1n);
        f.setEntityActiveNameplate(self,f.assemblyList([1n],'config_id'));
        f.printString('TK_SWITCHED 1');
      }}else{{
        f.switchActiveTextBubble(self,2n);
        f.printString('TK_SWITCHED 2');
      }}
    }}
  }}
}})
.on('whenTextBubbleIsCompleted',(evt,f)=>{{
  f.printString('TK_SAID');f.printString({STR('evt.textBubbleCompletionCount')});
}})
""",
}
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(HEAD + BODY[which])
print('written', sys.argv[2])
