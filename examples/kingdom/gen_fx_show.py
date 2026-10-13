"""Show special effects one after another on the monarch so a playtest can photograph them.
Usage: python gen_fx_show.py <guids.json> <out.ts> <mode> [ignored...]   mode 1 = looping effects (fx_looping_ids.json),
mode 2 = every other id up to 200 played as a timed effect.
Effect k is shown from game second 6 + 2k and replaced two seconds later; FX_SHOW_<id> is printed when it starts."""
import json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
looping = json.load(open(os.path.join(HERE, 'fx_looping_ids.json')))
MODE = int(sys.argv[3]) if len(sys.argv) > 3 else 1
ids = looping if MODE == 1 else [i for i in range(1, 201) if i not in looping]
ARGS = "monarch,'GI_RootNode',true,true,[0,0,0],[0,0,0],1,false"
steps = []
for k, i in enumerate(ids):
    clear = f"f.clearSpecialEffectsBasedOnSpecialEffectAssets(monarch,{ids[k - 1]});" if MODE == 1 and k else ''
    show = f"f.mountLoopingSpecialEffect({i},{ARGS});" if MODE == 1 else f"f.playTimedEffects({i},{ARGS});"
    steps.append(f"  if(step==={k}n&&now>=f.get('t0')+{4 + 2 * k}n){{{clear}{show}f.printString('FX_SHOW_{i}');f.set('step',{k + 1}n);return;}}")
src = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ UIControlGroupStatus }} from 'genshin-ts/definitions/enum'

g.server({{id:1073741908,name:'_GSTS_KingdomEconomy',variables:{{lastTick:-1n,placed:false,ready:false,step:0n,t0:0n}}}})
.on('whenEntityIsCreated',(evt,f)=>{{
  f.set('lastTick',-1n);f.set('placed',false);f.set('ready',false);f.set('step',0n);
  f.startTimer(evt.eventSourceEntity,'KINGDOM_CLOCK',true,[1]);
  f.printString('KV_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName!=='KINGDOM_CLOCK')return;
  const now=f.queryGameTimeElapsed();
  if(now===f.get('lastTick'))return;
  f.set('lastTick',now);
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const characters=f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0]);
  if(characters.length!==1)return;
  const monarch=characters[0];
  if(!f.get('placed')){{f.teleportPlayer(players[0],[13,8,0],[0,90,0]);f.set('placed',true);return;}}
  if(!f.get('ready')){{
    f.switchMainCameraTemplate(players,'自定义镜头');
    f.setPlayerCameraToFollowEntity(players[0],monarch,'自定义镜头');
    f.switchCurrentInterfaceLayout(players[0],1073741825n);
    f.modifyUiControlStatusWithinTheInterfaceLayout(players[0],1073741843n,UIControlGroupStatus.Hidden);
    f.set('ready',true);f.set('t0',now);f.printString('KV_DAY');return;
  }}
  const step=f.get('step');
{chr(10).join(steps)}
}})
"""
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(src)
print('written fx show mode', MODE, len(ids), 'effects', len(src))
