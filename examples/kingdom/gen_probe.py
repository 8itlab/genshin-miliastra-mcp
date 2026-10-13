"""Capability probe for the Kingdom work: one graph that tries platform features at fixed seconds and prints what happened.
Usage: python gen_probe.py <guids.json> <out.ts> [ignored...]   (same call shape as gen_kingdom_v2.py)
Seconds are counted from the moment the camera is set (KV_DAY): 2 prefabs by asset id, 4 motion devices, 12 time 22,
20 time 2, 28 environment config 1, 36 environment config 2, 44 back to day + an enemy, 46 hpLoss, 48 lamp off."""
import json, sys
g = json.load(open(sys.argv[1], encoding='utf-8'))
COIN, ENEMY, LAMP = g['KV_coin_00'], g['KV_enemy_00'], g['KV_lamp_0']
src = f"""/// <reference types="genshin-ts" />
import {{ g }} from 'genshin-ts/runtime/core'
import {{ DamagePopUpType, MovementMode, FixedMotionParameterType, UIControlGroupStatus }} from 'genshin-ts/definitions/enum'
import {{ guid }} from 'genshin-ts/runtime/value'

g.server({{id:1073741908,name:'_GSTS_KingdomEconomy',variables:{{lastTick:-1n,placed:false,ready:false,t0:0n,step:0n}}}})
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
    f.setCurrentEnvironmentTime(10);f.setEnvironmentTimePassageSpeed(0);
    f.set('ready',true);f.set('t0',now);f.printString('KV_DAY');return;
  }}
  const t=now-f.get('t0');
  const step=f.get('step');
  if(t>=2n&&step===0n){{
    f.set('step',1n);
    const a=f.createPrefab(10005009,[4,8.6,0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
    const b=f.createPrefab(20001874,[6,8.6,0],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
    const c=f.createPrefab(20002275,[8,7.6,2],[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
    if(f.queryIfEntityIsOnTheField(a))f.printString('P_PREFAB_COIN_OK');else f.printString('P_PREFAB_COIN_NO');
    if(f.queryIfEntityIsOnTheField(b))f.printString('P_PREFAB_WATER_OK');else f.printString('P_PREFAB_WATER_NO');
    if(f.queryIfEntityIsOnTheField(c))f.printString('P_PREFAB_HAY_OK');else f.printString('P_PREFAB_HAY_NO');
    f.createEntity(new guid({COIN}),[] as bigint[]);
    return;
  }}
  if(t>=4n&&step===1n){{
    f.set('step',2n);
    const coin=f.queryEntityByGuid(new guid({COIN}));
    if(f.queryIfEntityIsOnTheField(coin)){{
      f.activateFixedPointMotionDevice(coin,'probe_up',MovementMode.UniformLinearMotion,2,[2,10.5,0],[0,0,0],false,FixedMotionParameterType.FixedSpeed,1);
      f.printString('P_MOTION_COIN_SENT');
    }}else f.printString('P_COIN_NOT_ON_FIELD');
    const owned=f.getListOfEntitiesOwnedByTheEntity(evt.eventSourceEntity);
    for(const unit of f.getEntityListBySpecifiedPrefabId(owned,10005009)){{
      f.activateFixedPointMotionDevice(unit,'probe_up2',MovementMode.UniformLinearMotion,2,[4,11,0],[0,0,0],false,FixedMotionParameterType.FixedSpeed,1);
      f.printString('P_MOTION_PREFAB_SENT');
    }}
    return;
  }}
  if(t>=8n&&step===2n){{
    f.set('step',3n);
    const coin=f.queryEntityByGuid(new guid({COIN}));
    const at=f.split3dVector(f.getEntityLocationAndRotation(coin).location);
    if(at.yComponent>9.5)f.printString('P_MOTION_COIN_MOVED');else f.printString('P_MOTION_COIN_STAYED');
    return;
  }}
  if(t>=12n&&step===3n){{f.set('step',4n);f.setCurrentEnvironmentTime(22);f.printString('P_TIME_22');return;}}
  if(t>=20n&&step===4n){{f.set('step',5n);f.setCurrentEnvironmentTime(2);f.printString('P_TIME_2');return;}}
  if(t>=28n&&step===5n){{f.set('step',6n);f.modifyEnvironmentSettings(1,players,false,0);f.printString('P_ENV_1');return;}}
  if(t>=36n&&step===6n){{f.set('step',7n);f.modifyEnvironmentSettings(2,players,false,0);f.printString('P_ENV_2');return;}}
  if(t>=44n&&step===7n){{
    f.set('step',8n);f.setCurrentEnvironmentTime(10);
    f.createEntity(new guid({ENEMY}),[] as bigint[]);f.printString('P_ENEMY_CREATED');return;
  }}
  if(t>=46n&&step===8n){{
    f.set('step',9n);
    const enemy=f.queryEntityByGuid(new guid({ENEMY}));
    if(f.queryIfEntityIsOnTheField(enemy)){{
      const before=f.getCreationAttribute(enemy).currentHp;
      f.hpLoss(enemy,before*0.5,false,false,false,DamagePopUpType.NormalPopUp);
      const after=f.getCreationAttribute(enemy).currentHp;
      if(after<before-0.5)f.printString('P_HPLOSS_WORKS');else f.printString('P_HPLOSS_NO_CHANGE');
    }}else f.printString('P_ENEMY_NOT_ON_FIELD');
    return;
  }}
  if(t>=48n&&step===9n){{
    f.set('step',10n);
    const lamp=f.queryEntityByGuid(new guid({LAMP}));
    if(f.queryIfEntityIsOnTheField(lamp)){{
      f.toggleEntityLightSource(lamp,0,false);f.toggleEntityLightSource(lamp,1,false);f.toggleEntityLightSource(lamp,2,false);
      f.printString('P_LAMP_FOUND_TOGGLED');
    }}else f.printString('P_LAMP_NOT_FOUND');
    return;
  }}
}})
"""
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write(src)
print('written probe', len(src))
