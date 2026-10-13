import test from 'node:test';
import assert from 'node:assert/strict';
import {field} from '../../src/scene/wire.mjs';
import {inspectDebugLog} from '../../src/debug-log.mjs';
const msg=(...parts)=>Buffer.concat(parts),str=(id,s)=>field(id,2,Buffer.from(s));
const envelope=p=>{const h=Buffer.alloc(8);h.writeUInt32BE(p.length+4,0);h.writeUInt32BE(p.length,4);return msg(h,p);};
const record=(time,text)=>field(1,2,msg(field(3,0,time),str(4,'session'),field(7,2,field(2,0,1073741900)),field(9,0,10),field(22,2,str(2,text))));
test('count executed print records once, not strings within node traces; preserve pagination and identity',()=>{
 const data=envelope(msg(record(0,'PROBE_START'),field(1,2,field(21,2,str(2,'PROBE_START'))),record(1,'PROBE_OK'),record(2,'OTHER')));
 const r=inspectDebugLog(data,{prefix:'PROBE_',limit:1});assert.equal(r.printCount,3);assert.equal(r.matchedPrints,2);assert.equal(r.ignoredRecords,1);assert.equal(r.prints[0].graphId,'1073741900');assert.equal(r.prints[0].elapsedSeconds,'0');assert.equal(r.nextOffset,1);
 const last=inspectDebugLog(data,{prefix:'PROBE_',offset:1,limit:1});assert.equal(last.prints[0].text,'PROBE_OK');assert.equal(last.nextOffset,null);assert.equal(last.sourceHash,r.sourceHash);
});
test('reject truncated envelope and duplicate print text rather than silently inventing evidence',()=>{
 const b=envelope(record(1,'ok'));assert.throws(()=>inspectDebugLog(b.subarray(0,-1)),/envelope/);
 assert.throws(()=>inspectDebugLog(envelope(field(1,2,field(22,2,msg(str(2,'one'),str(2,'two')))))));
 assert.throws(()=>inspectDebugLog(envelope(field(1,2,field(22,2,field(2,2,Buffer.from([0xff])))))));
});
