import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

test('position grid attempts four cases once, observes each three times and cleans up',()=>{
 const events={},state={},actors=[],logs=[];let stopped=0;
 const chain={on(name,callback){events[name]=callback;return this;}};
 const source=fs.readFileSync(new URL('../../examples/kingdom/diagnostics/spawn-grid-probe.ts',import.meta.url),'utf8').replace(/^import .*\r?\n/gm,'');
 vm.runInNewContext(ts.transpile(source,{target:ts.ScriptTarget.ES2022}),{list:(_,items)=>items,g:{server(c){Object.assign(state,c.variables);return chain;}}});
 const f={get:key=>state[key],set:(key,value)=>{state[key]=value;},startTimer(){},stopTimer(){stopped++;},printString:s=>logs.push(s),getListOfPlayerEntitiesOnTheField:()=>[1],getAllCharacterEntitiesOfSpecifiedPlayer:()=>[2],createPrefab:(id,pos)=>{assert.ok(actors.every(a=>!a.present));const actor={pos:[...pos],present:pos[1]===8};actors.push(actor);return actor;},queryIfEntityIsOnTheField:a=>!!a?.present,destroyEntity:a=>{a.present=false;}};
 events.whenEntityIsCreated({eventSourceEntity:3},f);
 for(let i=0;i<30;i++)events.whenTimerIsTriggered({eventSourceEntity:3,timerName:'KINGDOM_SPAWN_GRID'},f);
 assert.deepEqual(actors.map(a=>a.pos),[[10,8,0],[10,6,0],[65,8,0],[65,6,0]]);
 assert.equal(stopped,1);assert.ok(actors.every(a=>!a.present));
 assert.equal(logs.length,22);assert.equal(logs.at(-1),'SPAWN_GRID_FINISHED');
 for(let i=0;i<4;i++){
  assert.ok(logs[1+i*5].startsWith('SPAWN_GRID_CASE_'));
  assert.equal(logs[2+i*5],'SPAWN_GRID_IMMEDIATE_'+(i%2===0?'PRESENT':'ABSENT'));
  assert.deepEqual(logs.slice(3+i*5,6+i*5),Array(3).fill('SPAWN_GRID_LATER_'+(i%2===0?'PRESENT':'ABSENT')));
 }
});
