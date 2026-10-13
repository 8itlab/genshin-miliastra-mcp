import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

test('position probe changes only the enemy creation position',()=>{
 const near=fs.readFileSync(new URL('../../examples/kingdom/diagnostics/spawn-probe.ts',import.meta.url),'utf8');
 const far=fs.readFileSync(new URL('../../examples/kingdom/diagnostics/spawn-position-probe.ts',import.meta.url),'utf8');
 assert.notEqual(far,near);
 assert.equal(far,near.replace('[10,8,0]','[65,6,0]'));
});

test('probe distinguishes delayed visibility from absence and never retries creation',()=>{
 for(const delayedVisible of [false,true]){
  const events={},state={},actors=[],logs=[];let visible=false;
  const chain={on(name,callback){events[name]=callback;return this;}};
  const source=fs.readFileSync(new URL('../../examples/kingdom/diagnostics/spawn-probe.ts',import.meta.url),'utf8').replace(/^import .*\r?\n/gm,'');
  vm.runInNewContext(ts.transpile(source,{target:ts.ScriptTarget.ES2022}),{list:(_type,items)=>items,g:{server(config){Object.assign(state,config.variables);return chain;}}});
  const f={get:k=>state[k],set:(k,v)=>state[k]=v,startTimer(){},printString:s=>logs.push(s),getListOfPlayerEntitiesOnTheField:()=>[1],getAllCharacterEntitiesOfSpecifiedPlayer:()=>[2],createPrefab(id){const a={id};actors.push(a);return a;},queryIfEntityIsOnTheField:()=>visible,getListOfEntitiesOwnedByTheEntity:()=>visible?actors:[],getEntityListBySpecifiedPrefabId:(list,id)=>list.filter(a=>a.id===id)};
  events.whenEntityIsCreated({eventSourceEntity:3},f);
  const tick=()=>events.whenTimerIsTriggered({timerName:'KINGDOM_SPAWN_PROBE',eventSourceEntity:3},f);
  tick();assert.equal(actors.length,2);assert.ok(logs.includes('SPAWN_PROBE_ENEMY_IMMEDIATE_ABSENT'));
  visible=delayedVisible;for(let i=0;i<100;i++)tick();
  const suffix=delayedVisible?'PRESENT':'ABSENT';
  assert.equal(logs.filter(s=>s==='SPAWN_PROBE_ENEMY_LATER_'+suffix).length,3);
  assert.equal(logs.filter(s=>s==='SPAWN_PROBE_OWNED_PROP_'+suffix).length,3);
  assert.equal(actors.length,2);assert.equal(state.checks,3n);
 }
});
