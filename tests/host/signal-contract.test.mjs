import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {inspectBytes} from '../../src/adapter.mjs';
import {inspectSignalContract} from '../../src/scene/signal-contract.mjs';
const saved=inspectBytes(fs.readFileSync(new URL('../../workspace/construction/build-041/after-integer-signal.gil',import.meta.url)));
const typed=saved.signals.find(s=>s.name==='_GSTS_ParamProbe_041');
test('official integer signal maps user input to listener output without treating event metadata as parameters',()=>{
 const c=typed.parameterContract;
 assert.equal(c.status,'observed-consistent');assert.equal(c.generation,'not_verified');
 assert.deepEqual(c.parameters,[{name:'参数_1',type:{class:'IntBase',type1:'Integer',type2:'Integer'},ordinal:0,pins:{send:{index:0,pinIndex:16},sendServer:{index:0,pinIndex:27},monitor:{index:3,pinIndex:22}}}]);
 assert.equal(c.eventMetadata.length,3);
 assert.equal(saved.signals.find(s=>s.name==='_GSTS_CompileProbe').parameterContract.parameters.length,0);
});
test('missing, ambiguous, mismatched or unrecognized descriptors never produce a usable parameter contract',()=>{
 for(const mutate of [s=>delete s.definitionFingerprints.sendServer,s=>s.definitionFingerprints.send.status='ambiguous']){
  const s=structuredClone(typed);mutate(s);const c=inspectSignalContract(s);assert.equal(c.status,'unavailable');assert.equal(c.parameters,undefined);
 }
 for(const mutate of [
  s=>s.definitionFingerprints.sendServer.descriptor.inputs[0].type.type1='String',
  s=>s.definitionFingerprints.monitor.descriptor.outputs.pop(),
  s=>s.definitionFingerprints.monitor.descriptor.outputs[0].name='unknown engine field',
  s=>s.definitionFingerprints.send.descriptor.inputs[0].index.index=2,
  s=>s.definitionFingerprints.monitor.descriptor.outputs[3].pinIndex=19,
 ]){const s=structuredClone(typed);mutate(s);const c=inspectSignalContract(s);assert.equal(c.status,'inconsistent');assert.equal(c.parameters,undefined);assert.ok(c.issues.length);}
});
