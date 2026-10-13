// Offline check of scene_add_environment / scene_list_environments against the official samples: starting from another
// sample's default environment, the night configuration this tool builds is byte for byte the one in the official
// sample 环境配置, and a new configuration is added to section 15 and to the library tab.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {container,fields} from '../src/scene/wire.mjs';
import {environmentRecord,curveAt,addEnvironment,listEnvironments,lightRecord,addLight} from '../src/scene-save.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dir=path.join(root,'knowledge','samples','gil'),workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-environment-'));
const pick=prefix=>path.join(dir,fs.readdirSync(dir).find(f=>f.startsWith(prefix)));
const number=(b,id)=>Number(fields(b).find(f=>f.id===id&&f.wire===0)?.value),msg=(b,id)=>fields(b).find(f=>f.id===id&&f.wire===2).data;
const environments=file=>fields(fields(container(fs.readFileSync(file))).find(f=>f.id===15).data).filter(f=>f.id===1).map(f=>f.data).filter(r=>number(r,2)===26);
const settings=record=>msg(msg(msg(fields(record).filter(f=>f.id===4).map(f=>f.data).find(b=>number(b,1)===70),75),1),1);
try{
  const official=environments(pick('mhw64cr51fue_')),plain=pick('mhumsn9uap96_'),base=settings(environments(plain)[0]);
  const night=environmentRecord(base,{id:1186988033,name:'环境配置',hour:0,stars:{density:100,intensity:0.5},milkyWay:0.5,clouds:true,appliesAtStart:true,lights:[1182793730]});
  assert.ok(night.equals(official[0]),'the night configuration differs from the official one');
  // A map of the current version keeps 34 curves over the day (fields 24 to 57). The editor fixed a copy of such a sky
  // at 10:00 (2026-10-13): from the copy that still followed the clock, this tool writes the same settings, byte for byte.
  const fixtures=path.join(root,'tests','fixtures'),follow=environments(path.join(fixtures,'editor-2026-10-13-env-follow.gil')),editors=environments(path.join(fixtures,'editor-2026-10-13-env-fixed.gil'));
  assert.equal(number(follow[1],1),1186988034);assert.equal(number(editors[1],1),1186988034);
  const mine=environmentRecord(settings(follow[1]),{id:1186988034,name:'环境配置_1',hour:10,stars:null,milkyWay:false,clouds:false});
  const shown=r=>fields(settings(r)).map(f=>f.id+':'+f.raw.toString('hex')).filter((x,i)=>x!==fields(settings(editors[1])).map(f=>f.id+':'+f.raw.toString('hex'))[i]).slice(0,3);
  // (The settings, that is: around them the editor of this version keeps two small fields of its own that this tool does not write.)
  assert.ok(settings(mine).equals(settings(editors[1])),'a sky fixed at 10:00 differs from the one the editor fixed: '+shown(mine).join(' | '));
  const fixed=fields(settings(mine));
  assert.ok(!fixed.some(f=>f.id===3),'a fixed sky must not follow the clock');assert.equal(Number(fixed.find(f=>f.id===58).value),10);
  assert.equal(fixed.filter(f=>f.id>=24&&f.id<=57).length,34,'every curve is kept');
  // The value of a curve at an hour: numbers by a smooth step, colours straight and rounded down, zero left out.
  const curve=id=>fields(settings(follow[1])).find(f=>f.id===id).data,valueAt=(id,minute)=>{const v=fields(curveAt(curve(id),minute)).find(f=>f.id===2);return !v?0:v.wire===5?Math.round(v.data.readFloatLE(0)*1000)/1000:Number(v.value).toString(16);};
  assert.equal(valueAt(24,600),1.557);assert.equal(valueAt(29,600),0.253);assert.equal(valueAt(38,600),9.41);assert.equal(valueAt(26,600),'fffff0c3');assert.equal(valueAt(49,600),0);
  // Midnight: the sky is dim (the horizon glow of curve 29 is zero, the sun of curve 38 is down).
  assert.equal(valueAt(24,0),1.2);assert.equal(valueAt(38,0),0);assert.equal(valueAt(29,0),0);
  assert.deepEqual(listEnvironments({mapPath:path.join(fixtures,'editor-2026-10-13-env-fixed.gil')}).environments.map(e=>[e.name,e.hour,e.followsClock]),[['环境配置',10,true],['环境配置_1',10,false]]);
  assert.deepEqual(listEnvironments({mapPath:pick('mhw64cr51fue_')}).environments.map(e=>[e.name,e.hour,e.stars,e.followsClock,e.appliesAtStartToSlots,e.lights]),[['环境配置',0,true,false,8,1],['环境配置2',12,false,false,0,0]]);

  const before=fs.readFileSync(plain),made=addEnvironment({mapPath:plain,name:'night'},workspace);
  assert.equal(made.environmentId,1186988034);assert.equal(made.defaultEnvironmentId,1186988033);
  const listed=listEnvironments({mapPath:made.mapPath}).environments;
  assert.deepEqual(listed.map(e=>e.name),['环境配置','night']);
  assert.deepEqual({...listed[1],environmentId:0,name:''},{environmentId:0,name:'',followsClock:false,hour:0,stars:true,milkyWay:true,clouds:true,appliesAtStartToSlots:0,lights:0});
  assert.equal(listed[0].followsClock,true,'the map\'s own configuration is left as it was');
  const library=fields(fields(container(fs.readFileSync(made.mapPath))).find(f=>f.id===6).data).map(f=>f.data).find(t=>number(t,1)===56);
  assert.equal(fields(msg(library,3)).filter(f=>f.id===5).length,2,'both configurations are listed in the library');
  const noon=addEnvironment({mapPath:made.mapPath,name:'noon',hour:12,stars:false,milkyWay:false},workspace);
  assert.deepEqual(listEnvironments({mapPath:noon.mapPath}).environments.at(-1),{environmentId:1186988035,name:'noon',followsClock:false,hour:12,stars:false,milkyWay:false,clouds:true,appliesAtStartToSlots:0,lights:0});
  assert.throws(()=>addEnvironment({mapPath:made.mapPath,name:'night'},workspace),e=>e.code==='DUPLICATE_ENVIRONMENT_NAME');
  // Lights: the point light of the official sample, rebuilt from its own numbers, and a new lamp on the night sky.
  const lights=fields(fields(container(fs.readFileSync(pick('mhw64cr51fue_')))).find(f=>f.id===15).data).filter(f=>f.id===1).map(f=>f.data).filter(r=>number(r,2)===27);
  const point=msg(msg(msg(fields(lights[0]).filter(f=>f.id===4).map(f=>f.data).find(b=>number(b,1)===69),74),1),1),at=fields(msg(point,3)),f=(list,id)=>list.find(x=>x.id===id&&x.wire===5)?.data.readFloatLE(0)??0;
  const rebuilt=lightRecord({id:1182793730,name:'光源',position:[f(at,1),f(at,2),f(at,3)],radius:10,intensity:3,range:100});
  assert.ok(rebuilt.equals(lights[0]),'the light record differs from the official one');
  const lamp=addLight({mapPath:made.mapPath,name:'lamp',environment:'night',position:[4,3,0]},workspace);
  assert.equal(lamp.lightId,1182793729);assert.equal(lamp.environmentId,made.environmentId);
  assert.deepEqual(listEnvironments({mapPath:lamp.mapPath}).environments.map(e=>e.lights),[0,1]);
  const second=addLight({mapPath:lamp.mapPath,name:'lamp2',environment:made.environmentId,position:[9,3,0],radius:6},workspace);
  assert.equal(second.lightId,1182793730);assert.deepEqual(listEnvironments({mapPath:second.mapPath}).environments.map(e=>e.lights),[0,2]);
  assert.throws(()=>addLight({mapPath:made.mapPath,name:'x',environment:'nowhere',position:[0,0,0]},workspace),e=>e.code==='ENVIRONMENT_NOT_FOUND');
  assert.ok(fs.readFileSync(plain).equals(before),'the source save was changed');
  console.log(JSON.stringify({ok:true}));
}finally{fs.rmSync(workspace,{recursive:true,force:true});}
