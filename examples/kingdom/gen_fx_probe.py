"""Find special-effect asset ids by trying them in a playtest.
Usage: python gen_fx_probe.py <guids.json> <out.ts> <first_id> <count> [ignored]   (mcp_round.mjs passes day as first, night as count)
Ids go into lists of 40 (one list node each) and a loop mounts every id as a looping effect on the monarch; when the
node returns an instance id the number is printed and the effect cleared again. One list is tried per second.
Control prints at the start: what an id that cannot exist returns, and which attachment-point names id 2101 accepts
(2101 appears in one official prefab record)."""
import json, sys
FIRST = int(sys.argv[3]); COUNT = int(sys.argv[4]); PER_LIST = 40; LISTS_PER_TICK = 1   # a trigger has a work limit: with 100 ids in one trigger the statements after the loop never ran
def mount(i, point='GI_RootNode'):
    return f"f.mountLoopingSpecialEffect({i},monarch,'{point}',true,true,[0,0,0],[0,0,0],1,false)"
steps = []
lists = [list(range(a, min(a + PER_LIST, FIRST + COUNT))) for a in range(FIRST, FIRST + COUNT, PER_LIST)]
for s in range(0, len(lists), LISTS_PER_TICK):
    body = []
    for k, ids in enumerate(lists[s:s + LISTS_PER_TICK]):
        n = s + k
        body.append(f"""    const ids{n}=f.assemblyList([{','.join(str(i) for i in ids)}],'config_id');
    let at{n}={ids[0]}n;
    for(const id of ids{n}){{
      if(f.mountLoopingSpecialEffect(id,monarch,'GI_RootNode',true,true,[0,0,0],[0,0,0],1,false)!==0n){{
        f.printString(f.dataTypeConversion(at{n},'str'));f.clearSpecialEffectsBasedOnSpecialEffectAssets(monarch,id);
      }}
      at{n}+=1n;
    }}""")
    step = s // LISTS_PER_TICK + 1
    steps.append(f"  if(step==={step}n){{\n" + '\n'.join(body) + f"\n    f.printString('FX_SCANNED_TO_{lists[min(s + LISTS_PER_TICK, len(lists)) - 1][-1]}');f.set('step',{step + 1}n);return;\n  }}")
points = ['GI_RootNode', 'Root', 'RootNode', 'GI_Root']
control = '\n'.join(f"    if({mount(2101, p)}!==0n)f.printString('CTRL_2101_{p}_NONZERO');else f.printString('CTRL_2101_{p}_ZERO');" for p in points)
src = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ UIControlGroupStatus }} from 'genshin-ts/definitions/enum'

g.server({{id:1073741908,name:'_GSTS_KingdomEconomy',variables:{{lastTick:-1n,placed:false,ready:false,step:0n}}}})
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
  if(!f.get('placed')){{f.teleportPlayer(players[0],[2,8,0],[0,90,0]);f.set('placed',true);return;}}
  if(!f.get('ready')){{
    f.switchMainCameraTemplate(players,'自定义镜头');
    f.setPlayerCameraToFollowEntity(players[0],monarch,'自定义镜头');
    f.switchCurrentInterfaceLayout(players[0],1073741825n);
    f.modifyUiControlStatusWithinTheInterfaceLayout(players[0],1073741843n,UIControlGroupStatus.Hidden);
    f.set('ready',true);f.printString('KV_DAY');return;
  }}
  const step=f.get('step');
  if(step===0n){{
    if({mount(999999999)}!==0n)f.printString('CTRL_IMPOSSIBLE_ID_NONZERO');else f.printString('CTRL_IMPOSSIBLE_ID_ZERO');
{control}
    f.set('step',1n);return;
  }}
{chr(10).join(steps)}
}})
"""
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(src)
print('written fx probe', FIRST, COUNT, len(src))
