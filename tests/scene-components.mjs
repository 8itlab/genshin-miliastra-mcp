// Offline check of scene_add_components / scene_list_components and of scene_add_graph on prefabs, against an official
// sample save (knowledge/samples/gil): the records these tools write for a collision trigger and an option tab are byte
// for byte what the editor saved for the official coin and chest, a graph attached to a prefab or to the player
// template lands on the template and on every placed copy, and an entity can run several graphs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {container,fields} from '../src/scene/wire.mjs';
import {addPrefab,addGraph,addComponents,listComponents,launcherContent} from '../src/scene-save.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-components-'));
const sample=path.join(root,'knowledge','samples','gil',fs.readdirSync(path.join(root,'knowledge','samples','gil')).find(f=>f.startsWith('mhumsn9uap96_')));
const before=fs.readFileSync(sample);
const messages=(b,id)=>fields(b).filter(f=>f.id===id&&f.wire===2).map(f=>f.data),kind=b=>Number(fields(b).find(f=>f.id===1&&f.wire===0)?.value);
// The record of one kind on the prefab of this name.
function record(file,name,code){
  for(const entry of messages(container(fs.readFileSync(file)),4).flatMap(s=>messages(s,1))){
    const label=messages(entry,6).filter(m=>kind(m)===1).flatMap(m=>messages(m,11)).flatMap(m=>messages(m,1))[0]?.toString('utf8');
    if(label===name)return messages(entry,8).find(r=>kind(r)===code);
  }
}
try{
  const coin=listComponents({mapPath:sample,prefab:'功能示例-1 金币'}).found;
  assert.equal(coin[0].collisionTriggers,1);assert.equal(coin[0].graphs.length,1);assert.ok(coin.length>1,'placed copies are listed with the prefab');
  assert.deepEqual(listComponents({mapPath:sample,prefab:'功能示例-2 宝箱'}).found[0].options,[{id:1,text:'开启宝箱'}]);

  let made=addPrefab({mapPath:sample,asset:20001310,name:'t_coin',scale:1},workspace);
  made=addComponents({mapPath:made.mapPath,prefab:'t_coin',solid:false,collisionTriggers:[{areas:[{size:[2,2,2]}],targets:['character']}],
    variables:[{name:'score',type:'integer',value:5},{name:'label',type:'string',value:'hi'},{name:'on',type:'boolean',value:true},{name:'ratio',type:'float',value:1.5}]},workspace);
  assert.ok(record(made.mapPath,'t_coin',5).equals(record(sample,'功能示例-1 金币',5)),'the collision trigger record differs from the official coin');
  made=addComponents({mapPath:made.mapPath,prefab:'t_coin',optionTab:{areas:[{size:[3,3,3]}],options:[{text:'开启宝箱'}]}},workspace);
  assert.ok(record(made.mapPath,'t_coin',17).equals(record(sample,'功能示例-2 宝箱',17)),'the option tab record differs from the official chest');
  // Variables are added to the ones already there; a second call with the same name replaces that one only.
  made=addComponents({mapPath:made.mapPath,prefab:'t_coin',variables:[{name:'score',type:'integer',value:-3},{name:'extra',type:'integer'}]},workspace);
  assert.deepEqual(listComponents({mapPath:made.mapPath,prefab:'t_coin'}).found[0].variables.map(v=>v.name).sort(),['extra','label','on','ratio','score']);

  const first=addGraph({mapPath:made.mapPath,name:'coin_pick',attachToPrefab:'t_coin'},workspace),second=addGraph({mapPath:first.mapPath,name:'coin_more',attachToPrefab:'t_coin'},workspace);
  assert.deepEqual(listComponents({mapPath:second.mapPath,prefab:'t_coin'}).found[0].graphs,[first.graphId,second.graphId]);
  const onPlayer=addGraph({mapPath:second.mapPath,name:'player_score',attachToPrefab:'player'},workspace);
  assert.equal(onPlayer.templates,1);assert.equal(onPlayer.placedCopies,9,'the player template has one entity per player slot');
  const player=listComponents({mapPath:onPlayer.mapPath,prefab:'player'}).found;
  assert.ok(player.every(p=>p.graphs.includes(onPlayer.graphId)));assert.ok(player[0].variables.some(v=>v.name==='是否有钥匙'),'variables already on the template are kept');
  // A placed entity by name, and a graph on a prefab that already has one from the editor.
  const onEntity=addGraph({mapPath:onPlayer.mapPath,name:'stage_rules',attachTo:'关卡物件'},workspace).mapPath;
  assert.throws(()=>addGraph({mapPath:onPlayer.mapPath,name:'x',attachTo:'路牌'},workspace),e=>e.code==='ENTITY_NOT_FOUND','two placed entities share the name 路牌');
  const official=addGraph({mapPath:onEntity,name:'coin_extra',attachToPrefab:'功能示例-1 金币'},workspace);
  assert.equal(listComponents({mapPath:official.mapPath,prefab:'功能示例-1 金币'}).found.every(c=>c.graphs.length===2),true);
  // One graph on two prefabs that behave alike.
  const shared=addGraph({mapPath:official.mapPath,name:'shared_rules',attachToPrefab:['t_coin','功能示例-1 金币']},workspace);
  assert.equal(shared.templates,2);assert.equal(shared.prefabIds.length,2);
  for(const prefab of ['t_coin','功能示例-1 金币'])assert.ok(listComponents({mapPath:shared.mapPath,prefab}).found.every(c=>c.graphs.includes(shared.graphId)),'the shared graph is on '+prefab);
  assert.throws(()=>addGraph({mapPath:official.mapPath,name:'y',attachToPrefab:['t_coin','t_coin']},workspace),e=>e.code==='INVALID_TARGET');
  // Client graphs: numbered from 1082130433 in a numbering of their own, flagged {100: 1}, listed in the tab of their
  // kind, and not attached to an entity. The sample already holds two filters (…433, …434) and two more client ids.
  const filter=addGraph({mapPath:official.mapPath,name:'has_key',kind:'boolFilter'},workspace);
  assert.ok(filter.graphId>1082130432&&filter.graphId<1090000000);
  const saved=fields(container(fs.readFileSync(filter.mapPath))),graphOf=id=>messages(fields(saved.find(f=>f.id===10).data).filter(f=>f.id===1).map(f=>f.data).find(g=>messages(g,1).some(r=>Number(fields(messages(r,1)[0]).find(f=>f.id===5).value)===id)),1)[0];
  const filterRecord=graphOf(filter.graphId),head=fields(messages(filterRecord,1)[0]);
  assert.equal(Number(head.find(f=>f.id===2).value),20001);assert.equal(Number(fields(filterRecord).find(f=>f.id===100)?.value),1,'a client graph carries {100: 1}');
  const listed=messages(saved.find(f=>f.id===6).data,1).find(t=>kind(t)===13);
  assert.ok(messages(messages(listed,3)[0],5).some(e=>Number(fields(e).find(f=>f.id===2).value)===filter.graphId),'the filter is listed in the filter tab');
  assert.equal(addGraph({mapPath:filter.mapPath,name:'swing',kind:'characterSkill'},workspace).graphId,filter.graphId+1,'client graphs share one numbering');
  assert.throws(()=>addGraph({mapPath:filter.mapPath,name:'x',kind:'boolFilter',attachToPrefab:'player'},workspace),e=>e.code==='INVALID_TARGET');
  const gated=addComponents({mapPath:filter.mapPath,prefab:'t_coin',optionTab:{areas:[{size:[3,3,3]}],options:[{text:'open',filterGraphId:filter.graphId}]}},workspace);
  assert.deepEqual(listComponents({mapPath:gated.mapPath,prefab:'t_coin'}).found[0].options,[{id:1,text:'open'}]);
  // Motion devices against the official samples: the slab of 建成我的第一个奇域 rises 6 m in 2 s, the rake of 自定义挂接点
  // sticks to its target and the coin of 跟随运动器 chases it.
  const pick=prefix=>path.join(root,'knowledge','samples','gil',fs.readdirSync(path.join(root,'knowledge','samples','gil')).find(f=>f.startsWith(prefix)));
  let moved=addComponents({mapPath:made.mapPath,prefab:'t_coin',motions:[{name:'上升',move:[0,6,0],seconds:2}],follow:'attach'},workspace);
  assert.ok(record(moved.mapPath,'t_coin',4).equals(record(pick('mhg94h90x3oq_'),'石板',4)),'the basic motion record differs from the official slab');
  assert.ok(record(moved.mapPath,'t_coin',9).equals(record(pick('mh85mxrh6kfy_'),'功能示例2 装备的耙子',9)),'the follow record differs from the official rake');
  moved=addComponents({mapPath:moved.mapPath,prefab:'t_coin',follow:'chase'},workspace);
  assert.ok(record(moved.mapPath,'t_coin',9).equals(record(pick('mhz70x0ra8u8_'),'功能示例1-可拾取金币',9)),'the chasing follow record differs from the official coin');
  const carried=listComponents({mapPath:moved.mapPath,prefab:'t_coin'}).found[0];
  assert.deepEqual(carried.motions,['上升']);assert.equal(carried.follow,true);
  assert.throws(()=>addComponents({mapPath:made.mapPath,prefab:'t_coin',motions:[{name:'a',move:[0,0,0],seconds:1}]},workspace),e=>e.code==='INVALID_MOTION');
  // Path motions: the platforms of the official first lesson and of 信号 go there and back for ever from the start; the
  // tools of 操作提示与反馈 turn on the spot (their record also keeps an older copy, so only the new block is compared).
  const samplesDir=path.join(root,'knowledge','samples','gil'),bySuffix=suffix=>path.join(samplesDir,fs.readdirSync(samplesDir).find(f=>f.endsWith(suffix)));
  let lift=addComponents({mapPath:made.mapPath,prefab:'t_coin',motions:[{name:'上下移动',path:[{position:[0,6,0],seconds:3}],loop:'backAndForth',active:true}]},workspace);
  assert.ok(record(lift.mapPath,'t_coin',4).equals(record(pick('mhg94h90x3oq_'),'上下移动平台',4)),'the path motion record differs from the official lift');
  lift=addComponents({mapPath:made.mapPath,prefab:'t_coin',motions:[{name:'移动',path:[{position:[36,0,0],seconds:5}],loop:'backAndForth',active:true}]},workspace);
  assert.ok(record(lift.mapPath,'t_coin',4).equals(record(bySuffix('_信号.gil'),'平台',4)),'the path motion record differs from the official platform of 信号');
  const spin=addComponents({mapPath:made.mapPath,prefab:'t_coin',motions:[{name:'运动器1',path:[{rotation:[0,180,0],seconds:1},{rotation:[0,360,0],seconds:1}],loop:'restart',active:true}]},workspace);
  const newBlock=rec=>fields(fields(rec).find(f=>f.id===14&&f.wire===2).data).find(f=>f.id===3&&f.wire===2).data;
  assert.ok(newBlock(record(spin.mapPath,'t_coin',4)).equals(newBlock(record(bySuffix('_操作提示与反馈.gil'),'工具-水壶',4))),'the spinning motion differs from the official one');
  assert.throws(()=>addComponents({mapPath:made.mapPath,prefab:'t_coin',motions:[{name:'a',path:[{position:[1,0,0],seconds:1}],loop:'sideways'}]},workspace),e=>e.code==='INVALID_MOTION');
  assert.throws(()=>addComponents({mapPath:made.mapPath,prefab:'t_coin',motions:[{name:'a',path:[],loop:'once'}]},workspace),e=>e.code==='INVALID_MOTION');
  // The minimap marker of the official sample 小地图标识.
  const marker=addComponents({mapPath:moved.mapPath,prefab:'t_coin',minimapMarker:{name:'机关',description:'一个普通的机关'}},workspace);
  assert.ok(record(marker.mapPath,'t_coin',32).equals(record(pick('mhw6purbjsrq_'),'目标点',32)),'the minimap marker record differs from the official one');
  assert.equal(listComponents({mapPath:marker.mapPath,prefab:'t_coin'}).found[0].minimapMarker,true);
  // The hurt boxes of two official samples (a 2 m and a 3 m box).
  const hit=addComponents({mapPath:marker.mapPath,prefab:'t_coin',hurtBox:{areas:[{size:[2,2,2]}]}},workspace);
  assert.ok(record(hit.mapPath,'t_coin',19).equals(record(pick('mh1t3z9s7hne_'),'雀雀球20001881',19)),'the hurt box record differs from the official one');
  const wide=addComponents({mapPath:hit.mapPath,prefab:'t_coin',hurtBox:{areas:[{size:3}]}},workspace);
  assert.ok(record(wide.mapPath,'t_coin',19).equals(record(pick('mhn4nsiz7k18_'),'炮塔',19)),'the larger hurt box record differs from the official one');
  assert.equal(listComponents({mapPath:wide.mapPath,prefab:'t_coin'}).found[0].hurtBox,true);
  // The launcher of the official bounce mushroom (sample 角色扰动装置, 功能演示-1 弹弹菇): a sphere of 1.5 m, 7 m/s straight up.
  const gilDir=path.dirname(pick('mhw6purbjsrq_')),springs=path.join(gilDir,fs.readdirSync(gilDir).find(f=>f.endsWith('_角色扰动装置.gil')));
  const bounce=addComponents({mapPath:wide.mapPath,prefab:'t_coin',launcher:{areas:[{radius:1.5,offset:[0,0.5,0]}],speed:7}},workspace);
  assert.ok(record(bounce.mapPath,'t_coin',15).equals(record(springs,'功能演示-1 弹弹菇',15)),'the launcher record differs from the official bounce mushroom');
  assert.equal(listComponents({mapPath:bounce.mapPath,prefab:'t_coin'}).found[0].launcher,true);
  assert.equal(listComponents({mapPath:bounce.mapPath,prefab:'t_coin'}).found[0].hurtBox,true,'the launcher replaced another component');
  assert.throws(()=>addComponents({mapPath:wide.mapPath,prefab:'t_coin',launcher:{areas:[{radius:1}],speed:5,direction:[0,0,0]}},workspace),e=>e.code==='INVALID_LAUNCHER');
  // Ability units of the official sample 能力单元: the thorn's direct attack and the platform's heal. They live in the
  // property block of kind 14, one field below the component records.
  const property=(file,name,code)=>{for(const entry of messages(container(fs.readFileSync(file)),4).flatMap(s=>messages(s,1))){const label=messages(entry,6).filter(m=>kind(m)===1).flatMap(m=>messages(m,11)).flatMap(m=>messages(m,1))[0]?.toString('utf8');if(label===name)return messages(entry,6).find(r=>kind(r)===code);}};
  const thorn=addComponents({mapPath:wide.mapPath,prefab:'t_coin',abilityUnits:[{name:'荆棘攻击',attack:{coefficient:1,added:99999}}]},workspace);
  assert.ok(property(thorn.mapPath,'t_coin',14).equals(property(pick('mh8wpr0h7ywg_'),'荆棘',14)),'the attack ability unit differs from the official thorn');
  const spring=addComponents({mapPath:thorn.mapPath,prefab:'t_coin',abilityUnits:[{name:'持续恢复',heal:10}]},workspace);
  assert.ok(property(spring.mapPath,'t_coin',14).equals(property(pick('mh8wpr0h7ywg_'),'回血平台',14)),'the heal ability unit differs from the official platform');
  assert.deepEqual(listComponents({mapPath:spring.mapPath,prefab:'t_coin'}).found[0].abilityUnits,['持续恢复']);
  assert.throws(()=>addComponents({mapPath:wide.mapPath,prefab:'t_coin',abilityUnits:[{name:'x',attack:{},heal:3}]},workspace),e=>e.code==='INVALID_ABILITY_UNIT');
  assert.throws(()=>addComponents({mapPath:sample,prefab:'nobody',solid:false},workspace),e=>e.code==='PREFAB_NOT_FOUND');
  assert.throws(()=>addComponents({mapPath:sample,prefab:'t',entity:'t',solid:false},workspace),e=>e.code==='INVALID_TARGET');
  assert.throws(()=>addComponents({mapPath:sample,prefab:'路牌',collisionTriggers:[{areas:[{size:1,radius:1}]}]},workspace),e=>e.code==='INVALID_TRIGGER');
  assert.ok(fs.readFileSync(sample).equals(before),'the source save was changed');
  // Projectile motion and hit detection: the bullet, the sword wave and the falling thing of the official sample 投射运动器.
  // (The velocities there were typed or dragged to values like 7.998: they are read from the record so the bytes match.)
  {
    const shots=path.join(root,'knowledge','samples','gil',fs.readdirSync(path.join(root,'knowledge','samples','gil')).find(f=>f.startsWith('mhn4nsiz7k18_')));
    const floatsOf=b=>{const out=[];(function walk(x,depth){if(depth>8)return;let parts;try{parts=fields(x);}catch{return;}for(const f of parts){if(f.wire===5)out.push([f.id,f.data.readFloatLE(0)]);else if(f.wire===2&&f.data.length)walk(f.data,depth+1);}})(b,0);return out;};
    const tryOn=(name,parts)=>{const made=addPrefab({mapPath:sample,asset:10005018,name:'p_'+name,outputName:'p-'+name},workspace);return addComponents({mapPath:made.mapPath,prefab:'p_'+name,...parts,outputName:'pc-'+name},workspace).mapPath;};
    const wave=tryOn('wave',{projectile:{type:'straight',velocity:[0,0,5],acceleration:5,accelerationSeconds:5},hitDetection:{areas:[{size:[5,1,1]}],trigger:'oncePerEntity',delaySeconds:0.5,abilityUnit:'刀波'}});
    assert.ok(record(wave,'p_wave',11).equals(record(shots,'刀波',11)),'the straight projectile differs from the official sword wave');
    assert.ok(record(wave,'p_wave',12).equals(record(shots,'刀波',12)),'the hit detection differs from the official sword wave');
    const arc=floatsOf(record(shots,'子弹',11)),vy=arc.find(f=>f[0]===2)[1],vz=arc.find(f=>f[0]===3)[1];
    const bullet=tryOn('bullet',{projectile:{type:'parabola',velocity:[0,vy,vz],gravity:9.8},hitDetection:{areas:[{size:[1,1,1],offset:[0,0.5,0]}],trigger:'once',delaySeconds:100,abilityUnit:'落地爆炸'}});
    assert.ok(record(bullet,'p_bullet',11).equals(record(shots,'子弹',11)),'the parabola differs from the official bullet');
    assert.ok(record(bullet,'p_bullet',12).equals(record(shots,'子弹',12)),'the hit detection differs from the official bullet');
    const fall=floatsOf(record(shots,'掉落物件',11)),fy=fall.find(f=>f[0]===2)[1],fz=fall.find(f=>f[0]===3)[1];
    const falling=tryOn('fall',{projectile:{type:'parabola',velocity:[0,fy,fz]},hitDetection:{areas:[{radius:0.5}],delaySeconds:0.5}});
    assert.ok(record(falling,'p_fall',11).equals(record(shots,'掉落物件',11)),'the parabola differs from the official falling thing');
    assert.ok(record(falling,'p_fall',12).equals(record(shots,'掉落物件',12)),'the sphere hit detection differs from the official falling thing');
    // What the sample does not have, against records the editor wrote after the settings were made in it by hand: a
    // projectile that follows its target, hit detection for enemies only and continuous detection for a fast thing.
    const edited=JSON.parse(fs.readFileSync(path.join(root,'tests','fixtures','projectile-edited.json'),'utf8'));
    const homing=tryOn('homing',{projectile:{type:'tracking',velocity:[0,0,22],acceleration:3,accelerationSeconds:0.5,turnDegreesPerSecond:720,snapRange:1.5,snapSeconds:0.25},
      hitDetection:{areas:[{radius:0.6}],trigger:'oncePerEntity',delaySeconds:0.05,layers:['hurtBox'],factions:'hostile',continuous:{speedAbove:5,radius:0.6}}});
    assert.equal(record(homing,'p_homing',11).toString('hex'),edited.projectile,'the tracking projectile differs from the one the editor saved');
    assert.equal(record(homing,'p_homing',12).toString('hex'),edited.hitDetection,'the hit detection differs from the one the editor saved');
    assert.throws(()=>tryOn('bad',{projectile:{type:'spiral',velocity:[0,0,1]}}),e=>e.code==='INVALID_PROJECTILE');
    assert.throws(()=>tryOn('bad2',{hitDetection:{areas:[]}}),e=>e.code==='INVALID_HIT_DETECTION');
  }
  console.log(JSON.stringify({ok:true,triggerBytes:record(made.mapPath,'t_coin',5).length,tabBytes:record(made.mapPath,'t_coin',17).length}));
}finally{fs.rmSync(workspace,{recursive:true,force:true});}
