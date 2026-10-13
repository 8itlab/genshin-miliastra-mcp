// Offline check against a save configured by hand in the editor on 2026-10-13 (tests/fixtures/editor-2026-10-13-handcfg.gil):
// what this tool writes for unit status effects, a launcher that pushes away, extra collision and the revive settings
// is what the editor wrote for the same settings.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {container,fields} from '../src/scene/wire.mjs';
import {statusRecord,launcherContent,forceFieldContent,extraCollisionContent,addUnitStatus,listUnitStatuses,addComponents,listComponents,addPrefab,setRevive,setPlayerCount,listRespawnPoints,removeEntities,listSceneEntities} from '../src/scene-save.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),fixture=path.join(root,'tests','fixtures','editor-2026-10-13-handcfg.gil'),samples=path.join(root,'knowledge','samples','gil');
const workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-handcfg-'));
const number=(b,id)=>Number(fields(b).find(f=>f.id===id&&f.wire===0)?.value),msg=(b,id)=>fields(b).find(f=>f.id===id&&f.wire===2)?.data,all=(b,id)=>fields(b).filter(f=>f.id===id&&f.wire===2).map(f=>f.data);
const top=container(fs.readFileSync(fixture));
try{
  // The entity the settings were made on: placed entity 1077936139 (records are its fields 7).
  const entity=all(msg(top,5),1).find(e=>number(e,1)===1077936139),records=all(entity,7),ofKind=k=>records.find(r=>number(r,1)===k);
  // Extra collision: the whole record.
  const wall=Buffer.concat([Buffer.from([0x08,8,0x10,1]),Buffer.from([0x92,0x01]),Buffer.from([extraCollisionContent([{size:[2,3,4]}]).length]),extraCollisionContent([{size:[2,3,4]}])]);
  assert.ok(wall.equals(ofKind(8)),'the extra collision record differs from the one the editor wrote');
  // The launcher that pushes away (device 2 of three): its rule block, speed 9, held 1 s, fading over 0.5 s.
  const devices=all(msg(ofKind(15),25),1),second=devices.find(d=>number(d,1)===2);
  const ours=all(launcherContent({areas:[{size:[1,1,1]}],speed:9,direction:'away',holdSeconds:1,fadeSeconds:0.5}),1)[0];
  assert.ok(msg(ours,13).equals(msg(second,13)),'the rule of a launcher that pushes away differs from the editor\'s');
  assert.ok(msg(ours,2).equals(msg(second,2)),'the area of the launcher differs from the editor\'s');
  // The second session (the other fixture): the force field with inner radius 1.5, outer 2, speeds 3 inside and 5 beyond,
  // and the launcher set to pull towards the piece.
  {
    const again=container(fs.readFileSync(path.join(root,'tests','fixtures','editor-2026-10-13-handcfg-2.gil'))),thing=all(msg(again,5),1).find(e=>number(e,1)===1077936139);
    const list=all(msg(all(thing,7).find(r=>number(r,1)===15),25),1),field3=list.find(d=>number(d,1)===3),pull=list.find(d=>number(d,1)===2);
    const wind=all(forceFieldContent({areas:[{size:[1,1,1]}],direction:[0,0,1],innerRadius:1.5,outerRadius:2,innerSpeed:3,outerSpeed:5}),1)[0];
    assert.ok(msg(wind,12).equals(msg(field3,12)),'the rule of the force field differs from the editor\'s');
    const towards=all(launcherContent({areas:[{size:[1,1,1]}],speed:9,direction:'toward',holdSeconds:1,fadeSeconds:0.5}),1)[0];
    assert.ok(msg(towards,13).equals(msg(pull,13)),'the rule of a launcher that pulls differs from the editor\'s');
  }
  // The status: speed +40 %, invincible, super jump 1.5 and 2, cannot move (after the maximum health it began with).
  const status=all(msg(top,16),1).find(e=>number(e,1)===1077936129),effectsOf=r=>{const body=msg(msg(all(r,3).find(b=>number(b,1)===6),21),1),list=msg(body,3);return {effects:all(list,1),units:msg(list,2)};};
  const made=effectsOf(statusRecord({id:1077936129,name:'HC_status',effects:[{maxHealth:100},{speedPercent:40},{invincible:true},{superJump:[1.5,2]},{rooted:true}]})),kept=effectsOf(status);
  assert.equal(kept.effects.length,5);
  for(const i of [1,2,3,4])assert.ok(made.effects[i].equals(kept.effects[i]),'effect '+i+' of the status differs from the editor\'s');
  assert.ok(made.units.equals(kept.units),'the kinds of unit the status works on differ');
  // Through the tools, on an official sample.
  const plain=path.join(samples,fs.readdirSync(samples).find(f=>f.endsWith('_环境配置.gil')));
  const boots=addUnitStatus({mapPath:plain,name:'boots',speedPercent:40,seconds:5},workspace),star=addUnitStatus({mapPath:boots.mapPath,name:'star',invincible:true,superJump:[1.2,2]},workspace);
  assert.deepEqual(listUnitStatuses({mapPath:star.mapPath}).statuses.map(s=>[s.name,s.effects]),[['boots',['speedPercent']],['star',['invincible','superJump']]]);
  assert.throws(()=>addUnitStatus({mapPath:plain,name:'x',speedPercent:80},workspace),e=>e.code==='INVALID_STATUS');
  assert.throws(()=>addUnitStatus({mapPath:plain,name:'x'},workspace),e=>e.code==='INVALID_STATUS');
  const pane=addPrefab({mapPath:plain,asset:10005018,name:'pane'},workspace),solid=addComponents({mapPath:pane.mapPath,prefab:'pane',extraCollision:{areas:[{size:[0.5,4,12]}]},launcher:{areas:[{radius:2}],speed:8,direction:'away'}},workspace);
  const carries=listComponents({mapPath:solid.mapPath,prefab:'pane'}).found[0];
  assert.deepEqual([carries.extraCollision,carries.launcher],[true,true]);
  // Revive settings: put back to what a new map has, the block is the one of the official sample 角色设置.
  const number5=file=>{const player=all(msg(container(fs.readFileSync(file)),4),1).find(e=>number(e,2)===1000000);return all(player,6).find(b=>number(b,1)===5);};
  const official=path.join(samples,fs.readdirSync(samples).find(f=>f.endsWith('_角色设置.gil')));
  assert.deepEqual(listRespawnPoints({mapPath:fixture}).revive,{seconds:3,auto:true,showScreen:false,lives:5,healthPercent:40,fallLossPercent:20});
  const back=setRevive({mapPath:fixture,seconds:10,auto:false,showScreen:true,lives:10,fallLossPercent:10},workspace);
  assert.ok(number5(back.mapPath).equals(number5(official)),'the revive settings put back to the defaults differ from the official sample');
  const arcade=setRevive({mapPath:official,seconds:3,auto:true,showScreen:false,lives:5,fallLossPercent:20},workspace);
  assert.ok(number5(arcade.mapPath).equals(number5(fixture)),'the revive settings differ from the ones the editor wrote');
  // The player template names as many player slots as the level takes players (the editor cut the list to one).
  const slots=file=>{const player=all(msg(container(fs.readFileSync(file)),4),1).find(e=>number(e,2)===1000000);return msg(msg(all(player,6).find(b=>number(b,1)===3),12),4).toString('hex');};
  assert.equal(slots(fixture),'00');
  assert.equal(slots(setPlayerCount({mapPath:plain,max:1},workspace).mapPath),'00');
  assert.equal(slots(setPlayerCount({mapPath:plain,max:3},workspace).mapPath),'000102');
  // Taking placed things out again: the floor pieces of the fixture go, with their lines in the library; the
  // GUID of a removed piece is nowhere in the save any more; what every map has by itself is refused.
  const before=listSceneEntities({mapPath:fixture}).entities,floors=before.filter(e=>e.name.startsWith('EV_floor'));
  assert.ok(floors.length>=9);
  const cleared=removeEntities({mapPath:fixture,namePrefix:'EV_floor'},workspace);
  assert.equal(cleared.removed,floors.length);assert.equal(cleared.unlisted,floors.length);
  const after=listSceneEntities({mapPath:cleared.mapPath}).entities;
  assert.ok(!after.some(e=>e.name.startsWith('EV_floor')));assert.equal(after.length,before.length-floors.length);
  const varint=n=>{const out=[];let v=BigInt(n);while(v>127n){out.push(Number(v&127n)|128);v>>=7n;}out.push(Number(v));return Buffer.from(out);};
  const whole=container(fs.readFileSync(cleared.mapPath));
  const five=fields(whole).find(f=>f.id===5).data,library=fields(whole).find(f=>f.id===6).data;
  for(const f of floors){assert.equal(five.indexOf(Buffer.concat([Buffer.from([0x08]),varint(f.guid)])),-1,'a removed piece is still placed: '+f.name);assert.equal(library.indexOf(Buffer.concat([Buffer.from([0x08,0xc8,0x01,0x10]),varint(f.guid)])),-1,'a removed piece is still listed: '+f.name);}
  // The unit status of the fixture has the number the first floor piece has as its GUID: it stays listed.
  assert.ok(listUnitStatuses({mapPath:cleared.mapPath}).statuses.length===listUnitStatuses({mapPath:fixture}).statuses.length);
  const one=removeEntities({mapPath:fixture,names:['EV_floor_3']},workspace);assert.equal(one.removed,1);
  assert.throws(()=>removeEntities({mapPath:fixture,names:['默认模版']},workspace),e=>e.code==='BUILT_IN_ENTITY');
  assert.throws(()=>removeEntities({mapPath:fixture,names:['关卡实体']},workspace),e=>e.code==='BUILT_IN_ENTITY');
  assert.throws(()=>removeEntities({mapPath:fixture,names:['EV_floor_3','nothing_here']},workspace),e=>e.code==='ENTITY_NOT_FOUND');
  assert.throws(()=>removeEntities({mapPath:fixture,namePrefix:'E'},workspace),e=>e.code==='INVALID_TARGET');
  console.log(JSON.stringify({ok:true}));
}finally{fs.rmSync(workspace,{recursive:true,force:true});}
