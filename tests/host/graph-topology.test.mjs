import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {inspectBytes,graphTopology,graphNodePayloadHash} from '../../src/adapter.mjs';
import {parseMessage} from 'genshin-ts/injector/binary';
import {buildNodeGraphFieldIndex} from 'genshin-ts/injector/node_graph';
import {loadGiaProto} from 'genshin-ts/injector/proto';

const fixture=name=>fs.readFileSync(new URL('../../workspace/construction/build-016/'+name,import.meta.url));
function decode(bytes){
 const payload=bytes.subarray(20,-4),fields=[];
 parseMessage(payload,0,payload.length,0,0,0,0,0,0,0,fields);
 const m=buildNodeGraphFieldIndex(payload,fields).get(1073741834)[0];
 return loadGiaProto().nodeGraphMessage.decode(payload.subarray(m.field.dataStart,m.field.dataEnd));
}
test('official hand edit preserves topology while payload remains different',()=>{
 const before=inspectBytes(fixture('after-import.gil')).graphs.find(g=>g.id===1073741834);
 const after=inspectBytes(fixture('after-hand-edit-game-save.gil')).graphs.find(g=>g.id===1073741834);
 assert.notEqual(before.nodePayloadHash,after.nodePayloadHash);
 assert.deepEqual(before.topology,after.topology);
 assert.equal(after.topology.nodeCount,344);
 assert.equal(after.topology.connectionCount,496);
});
test('topology distinguishes rewiring, lost connections and changed node kinds but does not certify values',()=>{
 const bytes=fixture('after-import.gil'),original=decode(bytes),expected=graphTopology(original);
 const reorder=decode(bytes);reorder.nodes.reverse();for(const n of reorder.nodes)n.pins.reverse();
 assert.deepEqual(graphTopology(reorder),expected);
 const rewired=decode(bytes);rewired.nodes.flatMap(n=>n.pins).find(p=>p.connects.length).connects[0].id+=1;
 assert.notEqual(graphTopology(rewired).hash,expected.hash);
 const removed=decode(bytes);removed.nodes.flatMap(n=>n.pins).find(p=>p.connects.length).connects.pop();
 assert.notEqual(graphTopology(removed).hash,expected.hash);
 const changed=decode(bytes);changed.nodes[0].genericId.nodeId+=1;
 assert.notEqual(graphTopology(changed).hash,expected.hash);
 const literal=decode(bytes),p=literal.nodes.flatMap(n=>n.pins).find(p=>p.value?.bString);
 assert.ok(p);p.value.bString.val='changed literal';
 assert.equal(graphTopology(literal).hash,expected.hash);
 assert.notEqual(graphNodePayloadHash(literal),graphNodePayloadHash(original));
});
