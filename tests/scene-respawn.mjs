// Offline check of scene_add_respawn_point / scene_list_respawn_points / scene_set_player_count against official samples:
// a respawn point added to a save that has none gives the level settings and the player template of the official sample
// 角色设置 (which has one), byte for byte; the group of players written for 1 to 8 and 1 to 4 is the one of the samples.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {container,fields} from '../src/scene/wire.mjs';
import {addRespawnPoint,listRespawnPoints,setPlayerCount,listPresetPoints} from '../src/scene-save.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dir=path.join(root,'knowledge','samples','gil'),workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-respawn-'));
const bySuffix=suffix=>path.join(dir,fs.readdirSync(dir).find(f=>f.endsWith(suffix)));
const number=(b,id)=>Number(fields(b).find(f=>f.id===id&&f.wire===0)?.value);
const level=(file,id)=>fields(fields(container(fs.readFileSync(file))).find(f=>f.id===11).data).find(f=>f.id===id&&f.wire===2)?.data;
const revive=file=>{const player=fields(fields(container(fs.readFileSync(file))).find(f=>f.id===4).data).filter(f=>f.id===1&&f.wire===2).map(f=>f.data).find(e=>number(e,2)===1000000);
  return fields(player).filter(f=>f.id===6&&f.wire===2).map(f=>f.data).find(b=>number(b,1)===5);};
try{
  const plain=bySuffix('_环境配置.gil'),official=bySuffix('_角色设置.gil'),classic=bySuffix('_经典模式.gil');
  assert.deepEqual(listRespawnPoints({mapPath:plain}).respawnPoints,[]);
  assert.deepEqual(listRespawnPoints({mapPath:official}).respawnPoints.map(r=>[r.respawnId,r.pointId,r.name]),[[1,1073741825,'复苏点1']]);

  const first=addRespawnPoint({mapPath:plain,point:1073741825},workspace);
  assert.deepEqual([first.respawnId,first.pointId,first.name],[1,1073741825,'复苏点1']);
  assert.ok(level(first.mapPath,4).equals(level(official,4)),'the respawn list differs from the official one');
  assert.ok(revive(first.mapPath).equals(revive(official)),'the revive settings of the player template differ from the official ones');
  assert.throws(()=>addRespawnPoint({mapPath:first.mapPath,point:1073741825,name:'again'},workspace),e=>e.code==='ALREADY_A_RESPAWN_POINT');
  assert.throws(()=>addRespawnPoint({mapPath:plain},workspace),e=>e.code==='INVALID_POINT');

  // A second one at a place of its own: a preset point is made, the player template lists both.
  const second=addRespawnPoint({mapPath:first.mapPath,position:[12,0.5,-3],rotation:[0,90,0],name:'checkpoint'},workspace);
  assert.equal(second.respawnId,2);
  assert.deepEqual(listRespawnPoints({mapPath:second.mapPath}).respawnPoints.map(r=>[r.respawnId,r.name,r.position]),[[1,'复苏点1',[0,0,0]],[2,'checkpoint',[12,0.5,-3]]]);
  assert.ok(listPresetPoints({mapPath:second.mapPath}).points.some(p=>p.name==='checkpoint'&&p.pointId===second.pointId));
  const list=fields(fields(revive(second.mapPath)).find(f=>f.id===14).data).find(f=>f.id===10).data;
  assert.equal(list.toString('hex'),'0102');

  // Players: the group as the samples write it.
  assert.deepEqual(listRespawnPoints({mapPath:plain}).players,{min:1,max:8});
  const same=setPlayerCount({mapPath:plain,min:1,max:8},workspace);
  assert.ok(level(same.mapPath,6).equals(level(plain,6)),'1 to 8 is not written as the samples have it');
  const four=setPlayerCount({mapPath:plain,max:4},workspace);
  assert.ok(level(four.mapPath,6).equals(level(classic,6)),'1 to 4 is not written as the sample 经典模式 has it');
  const solo=setPlayerCount({mapPath:plain,max:1},workspace);
  assert.deepEqual([solo.before,listRespawnPoints({mapPath:solo.mapPath}).players],[{min:1,max:8},{min:1,max:1}]);
  assert.throws(()=>setPlayerCount({mapPath:plain,min:3,max:2},workspace),e=>e.code==='INVALID_PLAYER_COUNT');
  console.log(JSON.stringify({ok:true}));
}finally{fs.rmSync(workspace,{recursive:true,force:true});}
