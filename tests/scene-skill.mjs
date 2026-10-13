// Offline check of scene_add_skill / scene_list_skills against the official samples: the skill record and its copy in
// section 16 are byte for byte those of the instant skill 放下工具 in the official sample 耕种-采集流程; on another save a
// skill is added to both sections and to the library, and unit statuses, which share section 16, keep their own numbering.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {container,fields} from '../src/scene/wire.mjs';
import {skillRecord,skillCopy,addSkill,listSkills,addGraph,addUnitStatus,listUnitStatuses} from '../src/scene-save.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dir=path.join(root,'knowledge','samples','gil'),workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-skill-'));
const bySuffix=suffix=>path.join(dir,fs.readdirSync(dir).find(f=>f.endsWith(suffix)));
const number=(b,id)=>Number(fields(b).find(f=>f.id===id&&f.wire===0)?.value),msg=(b,id)=>fields(b).find(f=>f.id===id&&f.wire===2).data;
const section=(file,id)=>{const s=fields(container(fs.readFileSync(file))).find(f=>f.id===id&&f.wire===2);return s?fields(s.data).filter(f=>f.id===1&&f.wire===2).map(f=>f.data):[];};
const library=(file,kind)=>{const tab=fields(fields(container(fs.readFileSync(file))).find(f=>f.id===6).data).map(f=>f.data).find(t=>number(t,1)===kind);return tab?fields(msg(tab,3)).filter(f=>f.id===5).map(f=>number(f.data,2)):null;};
try{
  const farm=bySuffix('_耕种-采集流程.gil'),plain=bySuffix('_环境配置.gil');
  const official=section(farm,15).find(r=>number(r,2)===6&&number(r,1)===1098907652),copy=section(farm,16).find(r=>number(r,1)===1098907652);
  assert.ok(skillRecord({id:1098907652,name:'放下工具',graphId:1082130434}).equals(official),'the skill record differs from the official one');
  assert.ok(skillCopy({id:1098907652,name:'放下工具',graphId:1082130434}).equals(copy),'the copy in section 16 differs from the official one');
  const listed=listSkills({mapPath:farm}).skills;
  assert.deepEqual(listed.map(s=>[s.skillId,s.name,s.type]),[[1098907649,'耙子-开垦','animated'],[1098907650,'种子-种植','animated'],[1098907651,'水壶-浇水','animated'],[1098907652,'放下工具','instant']]);
  assert.equal(listed[3].graphId,1082130434);
  assert.deepEqual([listed[0].graphId,listed[0].animations],[1082130433,[1006]]);

  // A normal skill, one animation and the graph at its start: the official 耙子-开垦, record and copy. The portion of the
  // animation that is played is read from the official record so that the comparison is exact.
  const float=(b,id)=>fields(b).find(f=>f.id===id&&f.wire===5).data.readFloatLE(0);
  const timelineOf=r=>msg(msg(fields(r).filter(f=>f.id===4&&f.wire===2).map(f=>f.data).find(b=>number(b,1)===35),45),1);
  const rake=section(farm,15).find(r=>number(r,2)===6&&number(r,1)===1098907649);
  const raking={id:1098907649,name:'耙子-开垦',graphId:1082130433,type:'normal',animation:1006,animationPortion:float(msg(timelineOf(rake),3),3)};
  assert.ok(Math.abs(raking.animationPortion-0.167)<0.001);
  assert.ok(skillRecord(raking).equals(rake),'the normal skill record differs from the official one');
  // The graph some milliseconds into the animation and a sword in the hand meanwhile: the official 普攻 of 命中与受击.
  const hit=bySuffix('_命中与受击.gil'),attack=section(hit,15).find(r=>number(r,2)===6&&number(r,1)===1098907649),line=timelineOf(attack);
  const swing={id:1098907649,name:'普攻',graphId:1082130433,type:'normal',animation:1001,graphAtMs:float(msg(line,6),4),effect:{asset:10002152,attachPoint:'GI_WeaponR',ms:float(msg(line,7),4)}};
  assert.ok(Math.abs(swing.graphAtMs-251.083)<0.001&&Math.abs(swing.effect.ms-1833.333)<0.001);
  assert.ok(skillRecord(swing).equals(attack),'the timed normal skill record differs from the official one');
  // (The copy of 耙子-开垦 in the farming sample still repeats the name, as older editors did; this one leaves it out.)
  assert.ok(skillCopy(swing).equals(section(hit,16).find(r=>number(r,1)===1098907649)),'the copy of the normal skill differs from the official one');

  // A save without skills: a skill graph, then the skill.
  assert.deepEqual(listSkills({mapPath:plain}).skills,[]);
  const before=fs.readFileSync(plain),graph=addGraph({mapPath:plain,name:'drop_coin',kind:'characterSkill'},workspace);
  const made=addSkill({mapPath:graph.mapPath,name:'drop coin',graphId:graph.graphId},workspace);
  assert.ok(before.equals(fs.readFileSync(plain)),'the source save is not touched');
  assert.equal(made.skillId,1098907649);assert.equal(made.type,'instant');
  assert.deepEqual(listSkills({mapPath:made.mapPath}).skills,[{skillId:1098907649,name:'drop coin',type:'instant',graphId:graph.graphId,animations:undefined}]);
  assert.ok(section(made.mapPath,15).some(r=>r.equals(skillRecord({id:1098907649,name:'drop coin',graphId:graph.graphId}))));
  assert.ok(section(made.mapPath,16).some(r=>r.equals(skillCopy({id:1098907649,name:'drop coin',graphId:graph.graphId}))));
  assert.ok(library(made.mapPath,12).includes(1098907649),'the skill is listed in the library');
  // Unit statuses share section 16 with the copies of skills and keep their own numbers.
  const status=addUnitStatus({mapPath:made.mapPath,name:'glow',outline:'green'},workspace);
  assert.equal(status.statusId,1077936129);
  assert.deepEqual(listUnitStatuses({mapPath:status.mapPath}).statuses.map(s=>s.name),['glow']);
  const second=addSkill({mapPath:status.mapPath,name:'second',graphId:graph.graphId},workspace);
  assert.equal(second.skillId,1098907650);
  assert.throws(()=>addSkill({mapPath:made.mapPath,name:'drop coin',graphId:graph.graphId},workspace),e=>e.code==='DUPLICATE_SKILL_NAME');
  assert.throws(()=>addSkill({mapPath:made.mapPath,name:'x',graphId:1},workspace),e=>e.code==='GRAPH_NOT_FOUND');
  // A normal skill through the tool function: needs an animation; an instant one takes none.
  const swung=addSkill({mapPath:second.mapPath,name:'swing',graphId:graph.graphId,type:'normal',animation:1001,graphAtMs:250,effect:{asset:10002152,attachPoint:'GI_WeaponR',ms:1833}},workspace);
  assert.deepEqual([swung.skillId,swung.type,swung.animation],[1098907651,'normal',1001]);
  assert.deepEqual(listSkills({mapPath:swung.mapPath}).skills[2],{skillId:1098907651,name:'swing',type:'animated',graphId:graph.graphId,animations:[1001]});
  assert.throws(()=>addSkill({mapPath:made.mapPath,name:'y',graphId:graph.graphId,type:'normal'},workspace),e=>e.code==='ANIMATION_REQUIRED');
  assert.throws(()=>addSkill({mapPath:made.mapPath,name:'y',graphId:graph.graphId,animation:1001},workspace),e=>e.code==='INSTANT_HAS_NO_ANIMATION');
  const server=addGraph({mapPath:made.mapPath,name:'rules'},workspace);
  assert.throws(()=>addSkill({mapPath:server.mapPath,name:'x',graphId:server.graphId},workspace),e=>e.code==='NOT_A_SKILL_GRAPH');
  console.log(JSON.stringify({ok:true}));
}finally{fs.rmSync(workspace,{recursive:true,force:true});}
