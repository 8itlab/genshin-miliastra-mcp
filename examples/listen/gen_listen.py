"""Listen: plays a list of sounds one after another so that a recording of the playtest can tell them apart.

Nobody hears a scripted playtest, and the names in sound_catalog say what a sound is for, not what it is like. This
level plays one entry of listen_list.json every few seconds (a sound for the player, a piece of background music, or a
one-off effect with its own sound) and prints which. Played with playtest_start {recordAudio:true}; measure.py then
cuts the recording at those moments and writes down, for every entry, whether anything was heard, for how long, how
loud and how bright.

Graph: stage (关卡实体). A looping timer; the player's variable n says which entry is next.

Usage: python gen_listen.py <guids.json> <out.ts> <ignored x3> <graph>
Prints: LS_READY, then LS_PLAY <place in the list> <kind> <id> for every entry, LS_END."""
import json
import os
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
LIST = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'listen_list.json'), encoding='utf-8'))
GAP = LIST['gapSeconds']
HEAD = """/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

// Listen: see examples/listen/gen_listen.py.
"""
SERVER = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})"


def play(entry):
    kind, sid = entry['kind'], entry.get('id')
    if kind == 'sound':
        return f"f.playerPlaysOneShot2dSoundEffect(player,{sid}n,100n,1);"
    if kind == 'music':
        return f"f.modifyPlayerBackgroundMusic(player,{sid}n,0,{entry['seconds']},100n,true,0,1,false);"
    if kind == 'quiet':   # the music is taken away again: its volume goes to nothing
        return "f.adjustPlayerBackgroundMusicVolume(player,0n);"
    if kind == 'effect':
        return (f"for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(player))"
                f"f.playTimedEffects({sid},hero,'GI_RootNode',true,false,[0,1,0],[0,0,0],1,true);")
    raise SystemExit('unknown kind ' + kind)


steps = '\n  '.join(f"if(n==={i}n){{{play(e)}f.printString('LS_PLAY');f.printString('{i}');f.printString('{e['kind']}');f.printString('{e.get('id', 0)}');return;}}"
                    for i, e in enumerate(LIST['entries']))
BODY = SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'LS_NEXT',true,[{GAP}]);
  f.printString('LS_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const player=players[0];
  const n=f.getCustomVariable(player,'n').asType('int');
  f.setCustomVariable(player,'n',n+1n,true);
  {steps}
  if(n==={len(LIST['entries'])}n)f.printString('LS_END');
}})
"""
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(HEAD + BODY)
print('written', sys.argv[2])
