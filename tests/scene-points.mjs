// Offline check of scene_list_preset_points / scene_add_preset_point / scene_set_spawn against official samples: a preset
// point rebuilt from an official one's numbers gives the same bytes, a new point gets the next id, and moving the spawn
// rewrites only the point the spawn point names (putting it back restores the file).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {container,fields} from '../src/scene/wire.mjs';
import {presetPointRecord,listPresetPoints,addPresetPoint,setSpawn} from '../src/scene-save.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dir=path.join(root,'knowledge','samples','gil'),workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-points-'));
const pick=prefix=>path.join(dir,fs.readdirSync(dir).find(f=>f.startsWith(prefix)));
const raw=file=>fields(fields(fields(container(fs.readFileSync(file))).find(f=>f.id===11).data).find(f=>f.id===5).data).filter(f=>f.id===1).map(f=>f.data);
const floats=b=>{const p=b?fields(b):[],n=id=>p.find(x=>x.id===id&&x.wire===5)?.data.readFloatLE(0)??0;return [n(1),n(2),n(3)];};
try{
  const timed=pick('mhujr59z1756_全局计时器.'),saved=raw(timed);
  // 起点: a position with three parts and a heading.
  const start=saved[1],part=id=>fields(start).find(f=>f.id===id&&f.wire===2).data;
  assert.ok(presetPointRecord({id:1073741826,name:'起点',position:floats(part(2)),rotation:floats(part(3))}).equals(start),'the preset point differs from the official one');
  const listed=listPresetPoints({mapPath:timed}).points;
  assert.deepEqual(listed.map(p=>[p.pointId,p.name,p.spawn]),[[1073741825,'新建预设点',true],[1073741826,'起点',false],[1073741827,'终点',false],[1073741828,'金币',false]]);
  assert.deepEqual(listed[1].rotation,[0,86.784,0]);

  const plain=pick('mhumsn9uap96_'),before=fs.readFileSync(plain),was=listPresetPoints({mapPath:plain}).points[0];
  const gate=addPresetPoint({mapPath:plain,name:'gate',position:[28,0,2],rotation:[0,90,0]},workspace);
  assert.equal(gate.pointId,1073741826);
  assert.deepEqual(listPresetPoints({mapPath:gate.mapPath}).points.at(-1),{pointId:1073741826,name:'gate',position:[28,0,2],rotation:[0,90,0],spawn:false});
  const moved=setSpawn({mapPath:gate.mapPath,position:[0,0.4,0],rotation:[0,0,0]},workspace);
  assert.equal(moved.pointId,1073741825);assert.deepEqual(moved.after,{position:[0,0.4,0],rotation:[0,0,0]});
  assert.deepEqual(listPresetPoints({mapPath:moved.mapPath}).points.map(p=>p.name),['新建预设点','gate'],'the other point is untouched');
  // Only the heading: the place stays.
  const turned=setSpawn({mapPath:plain,rotation:[0,90,0]},workspace);
  assert.deepEqual(turned.after.position,was.position);assert.deepEqual(turned.after.rotation,[0,90,0]);
  const exact=raw(plain)[0],place=id=>fields(exact).find(f=>f.id===id&&f.wire===2).data;
  const back=setSpawn({mapPath:turned.mapPath,position:floats(place(2)),rotation:floats(place(3))},workspace);
  assert.ok(fs.readFileSync(back.mapPath).equals(before),'putting the spawn back restores the save');
  assert.throws(()=>addPresetPoint({mapPath:gate.mapPath,name:'gate',position:[0,0,0]},workspace),e=>e.code==='DUPLICATE_POINT_NAME');
  assert.throws(()=>setSpawn({mapPath:plain},workspace),e=>e.code==='NOTHING_TO_SET');
  assert.ok(fs.readFileSync(plain).equals(before),'the source save was changed');
  console.log(JSON.stringify({ok:true}));
}finally{fs.rmSync(workspace,{recursive:true,force:true});}
