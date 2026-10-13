"""Coin Dash: a second, different small game made with the same tools, on a blank map.

Rules: ten coins lie at random places in a fenced field. Walk over a coin to pick it up; picked coins line up along the
top fence. Two slimes hunt the player: one that touches the player is knocked away (it is back three seconds later in
the far corner) and takes a picked coin with it. Six lamps along the bottom fence are the clock: one goes out every ten
seconds. Eight coins before the last lamp goes out wins; otherwise the game is lost.

The graph runs HZ times a second (a looping timer) so that a running player does not step over a coin between two
looks. At five times a second the server ended the level for load after about twelve seconds (the work per second
is over the limit, see the load rule in docs/PLATFORM_RULES.zh-CN.md), so it runs twice a second with a wider reach.

Usage: python gen_dash.py <guids.json> <out.ts> [ignored...]
guids.json: 'graph:id', 'graph:name', and the prefabs 'prefab:DS_coin', 'prefab:DS_count', 'prefab:DS_pip', 'prefab:DS_slime'.
Prints: DS_READY, DS_GO, DS_COIN, DS_HIT, DS_BACK, DS_LAMP, DS_WIN, DS_TIME_UP."""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
COIN, COUNT, PIP, SLIME = (guids['prefab:' + n] for n in ('DS_coin', 'DS_count', 'DS_pip', 'DS_slime'))
HZ = int(guids.get('hz', 2))   # how often the rules run; the pick-up radius grows as this shrinks
REACH = 2.25 if HZ >= 5 else 4.0   # square of the pick-up distance in metres
NO_TAGS = '[] as bigint[]'
FX = "'GI_RootNode',true,true,[0,0,0],[0,0,0],1,false"
TEN = ','.join(f'{i}n' for i in range(10))
SIX = ','.join(f'{i}n' for i in range(6))


def rightmost(prefab, name):
    """Remove the entity of this prefab that stands furthest to the right."""
    return (f"const {name}=f.getEntitiesWithSpecifiedPrefabOnTheField({prefab});let {name}Best=-1n;let {name}X=-999;let {name}N=-1n;"
            f"for(const one of {name}){{{name}N+=1n;const ox=f.split3dVector(f.getEntityLocationAndRotation(one).location).xComponent;"
            f"if(ox>{name}X){{{name}X=ox;{name}Best={name}N;}}}}"
            f"if({name}Best>=0n)f.removeEntity(f.getCorrespondingValueFromList({name},{name}Best));")


source = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ SettlementStatus }} from 'genshin-ts/definitions/enum'

// Coin Dash: see examples/dash/gen_dash.py for the rules.
g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}',variables:{{
  tick:0n,placed:false,ready:false,startTick:0n,collected:0n,state:1n,settled:false,backAt:0n,glow:0n,glowUntil:0n
}}}})
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'DASH',true,[{1 / HZ}]);
  f.printString('DS_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName!=='DASH')return;
  const tick=f.get('tick')+1n;
  f.set('tick',tick);
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const characters=f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0]);
  if(characters.length!==1)return;
  const hero=characters[0];
  if(f.get('state')!==1n){{
    if(f.get('settled'))return;
    f.set('settled',true);
    if(f.get('state')===2n)f.setPlayerSettlementSuccessStatus(players[0],SettlementStatus.Defeat);
    if(f.get('state')===3n)f.setPlayerSettlementSuccessStatus(players[0],SettlementStatus.Victory);
    f.settleStage();return;
  }}
  if(!f.get('placed')){{f.teleportPlayer(players[0],[0,0.4,0],[0,0,0]);f.set('placed',true);return;}}
  if(!f.get('ready')){{
    if(tick<{2 * HZ}n)return;
    f.switchMainCameraTemplate(players,'自定义镜头');
    f.setPlayerCameraToFollowEntity(players[0],hero,'自定义镜头');
    for(const i of [{TEN}])f.createPrefab({COIN},f.create3dVector(f.getRandomFloatingPointNumber(-8.5,8.5),0.7,f.getRandomFloatingPointNumber(-5.5,5.5)),[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
    for(const i of [{SIX}])f.createPrefab({PIP},f.create3dVector(-2.5+Number(i),0,-8.2),[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
    f.createPrefab({SLIME},[-8.5,0.4,5.5],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
    f.createPrefab({SLIME},[8.5,0.4,-5.5],[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
    f.set('ready',true);f.set('startTick',tick);f.printString('DS_GO');return;
  }}
  const elapsed=tick-f.get('startTick');
  const at=f.split3dVector(f.getEntityLocationAndRotation(hero).location);
  const x=at.xComponent;const z=at.zComponent;
  if(f.get('glow')!==0n&&tick>=f.get('glowUntil')){{f.clearLoopingSpecialEffect(f.get('glow'),hero);f.set('glow',0n);}}
  // Coins: walk over one to pick it up; it joins the row along the top fence.
  for(const coin of f.getEntitiesWithSpecifiedPrefabOnTheField({COIN})){{
    const p=f.split3dVector(f.getEntityLocationAndRotation(coin).location);
    const dx=p.xComponent-x;const dz=p.zComponent-z;
    if(dx*dx+dz*dz<{REACH}){{
      f.removeEntity(coin);
      f.createPrefab({COUNT},f.create3dVector(-8.6+Number(f.get('collected'))*0.7,0.5,7.6),[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
      f.set('collected',f.get('collected')+1n);f.printString('DS_COIN');
      if(f.get('glow')===0n){{f.set('glow',f.mountLoopingSpecialEffect(87,hero,{FX}));f.set('glowUntil',tick+{HZ}n);}}
    }}
  }}
  // Slimes: sent at the player every two seconds; one that touches the player is knocked away and takes a coin.
  const slimes=f.getEntitiesWithSpecifiedPrefabOnTheField({SLIME});
  for(const slime of slimes){{
    if(tick%{2 * HZ}n===0n)f.setTheAggroValueOfSpecifiedEntity(hero,slime,1000n);
    const p=f.split3dVector(f.getEntityLocationAndRotation(slime).location);
    const dx=p.xComponent-x;const dz=p.zComponent-z;
    if(dx*dx+dz*dz<3.2){{
      f.removeEntity(slime);f.set('backAt',tick+{3 * HZ}n);f.printString('DS_HIT');
      if(f.get('collected')>0n){{
        f.set('collected',f.get('collected')-1n);
        {rightmost(COUNT, 'row')}
      }}
    }}
  }}
  if(f.get('backAt')>0n&&tick>=f.get('backAt')){{
    // Back in the corner furthest from the player.
    let bx=8.5;let bz=5.5;
    if(x>0)bx=-8.5;
    if(z>0)bz=-5.5;
    f.createPrefab({SLIME},f.create3dVector(bx,0.4,bz),[0,0,0],evt.eventSourceEntity,false,1,{NO_TAGS});
    f.set('backAt',0n);f.printString('DS_BACK');
  }}
  // The clock: a lamp goes out every ten seconds.
  if(elapsed>0n&&elapsed%{10 * HZ}n===0n){{
    {rightmost(PIP, 'lamps')}
    f.printString('DS_LAMP');
    if(elapsed>={60 * HZ}n){{f.set('state',2n);f.printString('DS_TIME_UP');return;}}
  }}
  if(f.get('collected')>=8n){{f.set('state',3n);f.printString('DS_WIN');}}
}})
"""
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(source)
print('written', sys.argv[2], len(source), 'chars')
