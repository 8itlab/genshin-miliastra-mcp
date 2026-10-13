// Offline check of the playtest probe (src/playtest-probe.mjs): its three graphs compile and are written into a copy of
// an official sample save together with the skill and the player variable; a second probe on the copy is refused; and
// the prints of a run are read back into the play clock, the teleports and the path of the player. No in-game claims.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Service} from '../src/core.mjs';
import {addPlaytestProbe,probeSources,readProbe} from '../src/playtest-probe.mjs';
import {listSkills,listComponents} from '../src/scene-save.mjs';
import {toolRegistry} from '../src/tool-registry.mjs';
import {otherDesktopRun,spread,clockAnchors} from '../src/playtest.mjs';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dir=path.join(repo,'knowledge','samples','gil');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-probe-')),mapDir=path.join(root,'saves','1','Beyond_Local_Save_Level');
try{
  fs.mkdirSync(mapDir,{recursive:true});
  const mapPath=path.join(mapDir,'1073741825.gil');
  fs.copyFileSync(path.join(dir,fs.readdirSync(dir).find(f=>f.endsWith('_环境配置.gil'))),mapPath);
  const service=new Service({workspace:path.join(root,'workspace'),saveRoots:[path.join(root,'saves')]});

  const src=probeSources({keyId:1082130433,heroId:1073741826,stageId:1073741827,skillId:1098907649,trackEverySeconds:0.5,teleports:[{at:4,position:[13,0.5,-2]},{at:9.5,position:[20,0,0],yaw:90}],syncAt:1,slow:1});
  // The teleports are places 0 and 2 of one timer sequence, started by the sync press; 1 and 3 are the looks after them.
  assert.match(src.hero,/if\(n===0n\)\{f\.teleportPlayer\(player,\[13,0\.5,-2\],\[0,0,0\]\);return;\}/);
  assert.match(src.hero,/if\(n===2n\)\{f\.teleportPlayer\(player,\[20,0,0\],\[0,90,0\]\);return;\}/);
  assert.match(src.hero,/if\(turn===0n\)f\.startTimer\(evt\.callerEntity,'PT_TP0',false,\[3,3\.5,8\.5,9\]\)/);
  // Which press it is comes from the clock of the world, half a minute to a turn, and a turn is taken once.
  assert.match(src.hero,/const turn=\(now-f\.getCustomVariable\(player,'PT_t0'\)\.asType\('int'\)\+10n\)\/30n;/);assert.match(src.hero,/if\(turn>f\.getCustomVariable\(player,'PT_turn'\)\.asType\('int'\)\)\{/);
  // Timers run slow: without slow: 1 the moments are set 4.5 % earlier.
  assert.match(probeSources({keyId:1,heroId:2,stageId:3,skillId:4,teleports:[{at:4,position:[1,0,0]}],syncAt:1}).hero,/'PT_TP0',false,\[2\.871,3\.349\]/);
  // Sixty teleports two seconds apart, the key pressed at 1, 31, 61 and 91: four timers, each started by its press and
  // counted from it; the place in a sequence plus what came before gives the teleport.
  const many=probeSources({keyId:1,heroId:2,stageId:3,skillId:4,teleports:Array.from({length:60},(_,i)=>({at:3+i*2,position:[i,0,0]})),syncAt:1,syncs:[1,31,61,91],slow:1}).hero;
  const timer=k=>many.match(new RegExp("if\\(turn==="+k+"n\\)f\\.startTimer\\(evt\\.callerEntity,'PT_TP"+k+"',false,\\[([^\\]]*)\\]"))[1].split(',').map(Number);
  assert.deepEqual(timer(0).slice(0,4),[2,2.5,4,4.5]);assert.equal(timer(0).length,30,'the teleport of second 31 stays with the first timer: it comes at the very moment of the next press');
  assert.deepEqual(timer(1).slice(0,2),[2,2.5],'the teleport of second 33 is two seconds after the press of 31');assert.equal(timer(1).length,30);assert.equal(timer(3).length,30);
  assert.match(many,/if\(evt\.timerName==='PT_TP1'\)f\.setCustomVariable\(player,'PT_tp',evt\.timerSequenceId\+30n,true\);/);
  assert.match(many,/if\(evt\.timerName!=='PT_TP0'&&evt\.timerName!=='PT_TP1'&&evt\.timerName!=='PT_TP2'&&evt\.timerName!=='PT_TP3'\)return;/);assert.match(many,/if\(n===118n\)\{f\.teleportPlayer\(player,\[59,0,0\]/);
  assert.doesNotMatch(probeSources({keyId:1,heroId:2,stageId:3,skillId:4,trackEverySeconds:0.5,teleports:[]}).hero,/PT_TP/);
  assert.match(src.hero,/startTimer\(evt\.callerEntity,'PT_TRACK',true,\[0\.5\]\)/);
  assert.match(src.stage,/Skill4T/);

  const before=service.inspectMap({mapPath}).graphs.length;
  const probe=await addPlaytestProbe({mapPath,trackEverySeconds:0.5,teleports:[{at:4,position:[13,0.5,-2]},{at:9.5,position:[20,0,0],yaw:90}]},service);
  assert.notEqual(probe.mapPath,mapPath);
  assert.deepEqual(probe.graphNames,['_GSTS_PT_hero','_GSTS_PT_stage']);
  const graphs=service.inspectMap({mapPath:probe.mapPath}).graphs;
  assert.equal(graphs.length,before+3);
  for(const name of ['_GSTS_PT_key','_GSTS_PT_hero','_GSTS_PT_stage']){const g=graphs.find(x=>x.name===name);assert.ok(g,name+' is missing');assert.ok(g.nodeCount>0,name+' is empty');}
  assert.ok(listSkills({mapPath:probe.mapPath}).skills.some(s=>s.name==='PT_key'&&s.type==='instant'));
  assert.ok(JSON.stringify(listComponents({mapPath:probe.mapPath,prefab:'player'})).includes('PT_step'));
  assert.ok(JSON.stringify(listComponents({mapPath:probe.mapPath,prefab:'player'})).includes('PT_tp'));
  // Teleports alone (no track) compile too.
  const only=await addPlaytestProbe({mapPath,teleports:Array.from({length:60},(_,i)=>({at:3+i*2,position:[i,0,1]})),syncs:[1,31,61,91]},service);
  assert.ok(service.inspectMap({mapPath:only.mapPath}).graphs.find(x=>x.name==='_GSTS_PT_hero').nodeCount>0);
  // A probed copy is not probed again.
  await assert.rejects(()=>addPlaytestProbe({mapPath:probe.mapPath,trackEverySeconds:1},service),e=>e.code==='ALREADY_PROBED');

  // Reading a run. The level clock ran 5.3 s ahead: the sync press of play second 1 printed at 6.3.
  const p=(t,text,graphId='7')=>({t,graphId,text});
  const prints=[p(0,'BK_READY','1'),p(6.3,'PT_KEY'),p(6.3,'0'),p(6.3,'PT_POS'),p(6.3,'0'),p(6.3,'0.5'),p(6.3,'-1.25'),p(6.8,'PT_POS'),p(6.8,'2.6'),p(6.8,'0.5'),p(6.8,'-1.25'),
    p(7,'BK_COIN','1'),p(15.3,'PT_TP'),p(15.3,'0'),p(15.3,'1'),p(15.8,'PT_POS'),p(15.8,'13'),p(15.8,'0.5'),p(15.8,'-2'),p(15.8,'PT_TP'),p(15.8,'1'),p(15.8,'2'),p(15.8,'PT_AT'),p(15.8,'13'),p(15.8,'0.5'),p(15.8,'-2'),
    p(20.3,'PT_TP'),p(20.3,'2'),p(20.3,'3')];
  const read=readProbe(prints);
  assert.deepEqual(read.keys,[{t:6.3,step:0}]);
  // The first teleport was seen at its place half a second later; the second fired and the look after it never came.
  assert.deepEqual(read.teleports,[{index:0,t:15.3,at:[13,0.5,-2]},{index:1,t:20.3,at:undefined}]);
  assert.deepEqual(read.track.map(s=>[s.t,...s.at]),[[6.3,0,0.5,-1.25],[6.8,2.6,0.5,-1.25],[15.8,13,0.5,-2]]);
  assert.deepEqual(read.rest.map(x=>x.text),['BK_READY','BK_COIN']);
  // A print that only looks like the probe's (no numbers after it) is left alone.
  assert.equal(readProbe([p(1,'PT_POS'),p(1,'hello'),p(1,'1'),p(1,'2')]).rest.length,4);
  // The arguments as playtest_start takes them.
  const start=toolRegistry(service).find(d=>d.name==='playtest_start').schema;
  assert.ok(start.safeParse({mapPath:'x.gil',trackPlayer:0.5,inputs:[{at:3,teleport:[13,0.5,-2],yaw:90},{at:5,key:'f'}]}).success);
  assert.ok(!start.safeParse({mapPath:'x.gil',inputs:[{at:1,teleport:[13,0.5,-2]}]}).success,'a teleport before 2.5 s is refused');
  assert.ok(!start.safeParse({mapPath:'x.gil',inputs:[{at:3,teleport:[13,0.5,-2],key:'f'}]}).success,'one thing per input');
  // Start values of one run: the type is taken from the variable that is there; an unknown variable without a type is refused.
  assert.ok(start.safeParse({mapPath:'x.gil',startValues:[{prefab:'player',variables:[{name:'wave',value:5}]}]}).success);
  assert.ok(!start.safeParse({mapPath:'x.gil',startValues:[{variables:[{name:'wave',value:5}]}]}).success,'prefab or entity');
  await assert.rejects(async()=>toolRegistry(service).find(d=>d.name==='playtest_start').method({mapPath,inputs:[],startValues:[{prefab:'player',variables:[{name:'nothing_there',value:1}]}]}),e=>e.code==='VARIABLE_NOT_FOUND');
  // Two teleports half a second apart are refused before anything is built.
  await assert.rejects(async()=>toolRegistry(service).find(d=>d.name==='playtest_start').method({mapPath,inputs:[{at:3,teleport:[1,0,1]},{at:3.5,teleport:[2,0,2]}]}),e=>e.code==='TELEPORTS_TOO_CLOSE');
  // The clock: presses at play seconds 1, 31, 61, 91; the level heard them at 6, 36, 67 and 99 (it fell behind), and
  // lost none. With the press of 61 lost, the one of 91 is still tied to 91.
  assert.deepEqual(clockAnchors([{t:6,step:0},{t:36,step:1},{t:67,step:2},{t:99,step:3}],[1,31,61,91]),[{t:6,s:1},{t:36,s:31},{t:67,s:61},{t:99,s:91}]);
  assert.deepEqual(clockAnchors([{t:6,step:0},{t:36,step:1},{t:99,step:2}],[1,31,61,91]),[{t:6,s:1},{t:36,s:31},{t:99,s:91}]);
  assert.deepEqual(clockAnchors([{t:9,step:1}],[1,31]),[],'without the first press there is no clock');
  // The eight screenshots a status returns are spread over the run, the first and the last among them.
  assert.deepEqual(spread([1,2,3],8),[1,2,3]);
  const eight=spread(Array.from({length:30},(_,i)=>i),8);assert.equal(eight.length,8);assert.equal(eight[0],0);assert.equal(eight[7],29);assert.equal(new Set(eight).size,8);
  // A live run of another workspace is seen (and would be refused); a finished one, or one of this workspace, is not.
  const note=path.join(root,'desk.json'),other=path.join(root,'other'),otherRun=path.join(other,'playtests','r1'),now=Date.now();
  process.env.MILIASTRA_DESKTOP_NOTE=note;
  assert.equal(otherDesktopRun(path.join(root,'workspace')),null,'no note, nobody');
  fs.mkdirSync(otherRun,{recursive:true});
  const status=state=>fs.writeFileSync(path.join(otherRun,'status.json'),JSON.stringify({state,startedAt:now/1000-40,updatedAt:now/1000-3,steps:[],screenshots:[]}));
  fs.writeFileSync(note,JSON.stringify({runDir:otherRun,workspace:other,startedAt:now-40000,expectedSeconds:150}));
  status('running');
  const seen=otherDesktopRun(path.join(root,'workspace'),now);
  assert.equal(seen.expectedSeconds,150);assert.equal(seen.startedSecondsAgo,40);assert.equal(seen.runId,'r1');
  assert.equal(otherDesktopRun(other,now),null,'a run of this workspace is not another');
  status('succeeded');assert.equal(otherDesktopRun(path.join(root,'workspace'),now),null,'a finished run does not hold the desktop');
  status('running');assert.equal(otherDesktopRun(path.join(root,'workspace'),now+300000),null,'a run not heard from for minutes is gone');
  delete process.env.MILIASTRA_DESKTOP_NOTE;
  console.log('playtest-probe: ok');
}finally{fs.rmSync(root,{recursive:true,force:true});}
