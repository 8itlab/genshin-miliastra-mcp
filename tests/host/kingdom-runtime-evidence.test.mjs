import test from 'node:test';
import assert from 'node:assert/strict';
import {kingdomEnemyObservations} from '../../examples/kingdom/runtime-evidence.mjs';
const row=text=>({graphId:'1073741900',entityId:'controller',recordIndex:4,elapsedSeconds:'66',sessionLabel:'session',text});
test('framed conversion records require complete same-tick same-controller values',()=>{
 const frame=['KINGDOM_ENEMY_SAMPLE_BEGIN','65','6','0','20','KINGDOM_ENEMY_SAMPLE_END'].map((text,i)=>({...row(text),recordIndex:i}));
 const result=kingdomEnemyObservations(frame);assert.equal(result.samples[0].position.x,65);assert.equal(result.samples[0].hp,20);assert.equal(result.malformed.length,0);
 for(const broken of [frame.slice(0,4),frame.map((r,i)=>i===2?{...r,entityId:'other'}:r),frame.map((r,i)=>i===2?{...r,elapsedSeconds:'67'}:r),frame.map((r,i)=>i===2?{...r,text:'[object Object]'}:r)]){
  const invalid=kingdomEnemyObservations(broken);assert.equal(invalid.samples.length,0);assert.equal(invalid.malformed.length,1);
 }
});
test('runtime sampling retains evidence provenance and numeric coordinates without inventing enemy identity',()=>{
 const result=kingdomEnemyObservations([row('KINGDOM_ENEMY_SAMPLE x=65 y=-.5 z=2e-3 hp=20.0')]);
 assert.equal(result.evidence,'observations-present');
 assert.deepEqual(result.samples[0].position,{x:65,y:-0.5,z:0.002});
 assert.equal(result.samples[0].hp,20);assert.equal(result.samples[0].controllerEntityId,'controller');
 assert.equal(result.samples[0].recordIndex,4);assert.equal(result.samples[0].enemyId,undefined);
});
test('no sampling evidence is distinct from explicit empty or missing observations',()=>{
 assert.equal(kingdomEnemyObservations([row('KINGDOM_ENEMY_SPAWN')]).evidence,'no-sample-evidence');
 const result=kingdomEnemyObservations([row('KINGDOM_ENEMY_SAMPLE_NONE'),row('KINGDOM_ENEMY_SAMPLE_MISSING')]);
 assert.deepEqual(result.samples.map(s=>s.status),['no-owned-enemies','sampled-entity-not-on-field']);
});
test('foreign graphs and malformed or nonfinite telemetry never become position evidence',()=>{
 const result=kingdomEnemyObservations([{...row('KINGDOM_ENEMY_SAMPLE_NONE'),graphId:'1'},row('KINGDOM_ENEMY_SAMPLE x=NaN y=0 z=0 hp=20'),row('KINGDOM_ENEMY_SAMPLE x=1e999 y=0 z=0 hp=20'),row('KINGDOM_ENEMY_SAMPLE x=1 y=0 z=0 hp=20 suffix')]);
 assert.equal(result.samples.length,0);assert.equal(result.malformed.length,3);assert.equal(result.evidence,'no-sample-evidence');
});
