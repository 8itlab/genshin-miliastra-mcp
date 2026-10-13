import test from 'node:test';import assert from 'node:assert/strict';
import {patrolReport} from '../../examples/kingdom/diagnostics/patrol-report.mjs';
const frame=(values)=>['PATROL_DIAG_ENEMY_BEGIN',...values,'PATROL_DIAG_ENEMY_END'].map((text,i)=>({text,recordIndex:i,elapsedSeconds:'8',entityId:'controller',graphId:'1073741909',sessionLabel:'case'}));
const values=['0','18446744073709551615','53','7.5','3','26.256','2','1073741826','3','1','18446744073709551614','50','7.5','3'];
test('patrol report preserves actor and target GUID precision and separates identity from controller',()=>{
  const report=patrolReport(frame(values));assert.equal(report.malformed.length,0);
  assert.equal(report.observations[0].guid,values[1]);assert.equal(report.observations[0].targetGuid,values[10]);
  assert.equal(report.actors[0].last.template,2);assert.equal(report.actors[0].guid,values[1]);
});
test('interleaved origin, truncated frame and nonnumeric position cannot become observations',()=>{
  const wrong=frame(values);wrong[3].elapsedSeconds='9';
  for(const rows of [wrong,frame(values).slice(0,-1),frame(values.map((v,i)=>i===2?'[object Object]':v))]){
    const report=patrolReport(rows);assert.equal(report.observations.length,0);assert.equal(report.malformed.length,1);
  }
});

test('foreign graph interleaving is rejected and repeated actor IDs in different sessions stay separate',()=>{
  const interleaved=frame(values);interleaved.splice(3,0,{...interleaved[2],graphId:'1073741908'});
  assert.equal(patrolReport(interleaved).malformed.length,1);
  assert.equal(patrolReport(interleaved).observations.length,0);
  const replay=frame(values).map(r=>({...r,sessionLabel:'replay'}));
  const report=patrolReport([...frame(values),...replay]);
  assert.equal(report.actors.length,2);assert.equal(report.actors[1].sessionLabel,'replay');
  const hexadecimal=frame(values.map((v,i)=>i===2?'0x35':v));
  assert.equal(patrolReport(hexadecimal).observations.length,0);
});

test('zero GUID remains unavailable and case cleanup events are retained',()=>{
  const rows=frame(values.map((v,i)=>i===1?'0':v));
  rows.push({...rows[0],text:'PATROL_DIAG_CASE_END',elapsedSeconds:'64'});
  const report=patrolReport(rows);
  assert.match(report.actors[0].identityStatus,/guid-unavailable/);
  assert.ok(report.events.some(e=>e.text==='PATROL_DIAG_CASE_END'));
  assert.equal(report.events.some(e=>e.text==='PATROL_DIAG_ENEMY_END'),false);
});
