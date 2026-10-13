import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {fixture,populated} from './fixtures.mjs';
import {Transactions,nextRevision,sealRevision} from '../../dist/core/transactions.js';
import {ChangeService} from '../../dist/core/changes.js';

for(const phase of ['prepared','revision','current','committed','indexed'])test('recover exact commit outcome after '+phase,()=>{
 const f=fixture();try{
  f.store.createProject(f.identity,f.revision,[f.source]);const request={intent:'change'},mutationId=randomUUID(),target=nextRevision(f.revision);target.targetProfile.mode='test-mode';sealRevision(target);
  const result={revisionId:target.revisionId};
  const tx=new Transactions(f.store,p=>{if(p===phase)throw new Error('injected interruption');});
  assert.throws(()=>tx.commit('test',f.identity.projectId,mutationId,request,target,result),/injected/);
  const recovered=new Transactions(f.store);recovered.recover();
  if(['current','committed','indexed'].includes(phase)){
   assert.equal(f.store.readProject(f.identity.projectId).revision.revisionId,target.revisionId);
   assert.deepEqual(recovered.lookup('test',f.identity.projectId,mutationId,request),result);
   assert.deepEqual(recovered.commit('test',f.identity.projectId,mutationId,request,target,result),result);
  }else{assert.equal(f.store.readProject(f.identity.projectId).revision.revisionId,f.revision.revisionId);assert.throws(()=>recovered.lookup('test',f.identity.projectId,mutationId,request),e=>e.code==='TRANSACTION_INTERRUPTED');}
  assert.throws(()=>recovered.lookup('test',f.identity.projectId,mutationId,{intent:'other'}),e=>e.code==='IDEMPOTENCY_KEY_REUSED');
  recovered.recover();
 }finally{f.close();}
});
test('recover committed ancestor, reject history tampering',()=>{
 const f=fixture();try{
  f.store.createProject(f.identity,f.revision,[f.source]);const tx=new Transactions(f.store);const a=sealRevision(nextRevision(f.revision));tx.commit('test',f.identity.projectId,randomUUID(),{a:1},a,{revisionId:a.revisionId});const b=sealRevision(nextRevision(a));tx.commit('test',f.identity.projectId,randomUUID(),{b:1},b,{revisionId:b.revisionId});assert.equal(tx.recover().committed,2);
  f.store.replaceRecord(['projects',f.identity.projectId,'CURRENT'],f.revision.revisionId+'\n',true);
  assert.throws(()=>tx.recover(),e=>e.code==='RECOVERY_REQUIRED');
 }finally{f.close();}
});
test('change plans preserve locked fields, scope and original results across stale retries',()=>{
 const f=fixture();try{
  const r=populated(f);r.targetProfile.coordinateProfile='test-coordinate';sealRevision(r);f.store.createProject(f.identity,r,[f.source]);
  const tx=new Transactions(f.store),service=new ChangeService(f.store,tx),objectId=r.objects[0].objectId,contentId=r.contents[0].contentId;
  const input={projectId:r.projectId,expectedRevision:r.revisionId,scope:{contentIds:[contentId],objectIds:[]},operations:[{type:'lock_fields',objectId,paths:['transform']}],mutationId:randomUUID()};
  const p=service.plan(input);assert.deepEqual(service.plan(input),p);assert.equal(f.store.readProject(r.projectId).revision.revisionId,r.revisionId);
  const apply={projectId:r.projectId,changeId:p.changeId,expectedRevision:r.revisionId,mutationId:randomUUID()};const applied=service.apply(apply);assert.deepEqual(service.apply(apply),applied);
  const transform={position:[1,2,3],rotationQuaternion:[0,0,0,1],scale:[1,1,1]};
  const edit={...input,expectedRevision:applied.revisionId,mutationId:randomUUID(),operations:[{type:'set_transform',objectId,transform}]};
  assert.throws(()=>service.plan(edit),e=>e.code==='LOCKED_CONTENT');
  assert.throws(()=>service.plan({...edit,scope:{contentIds:[],objectIds:[]}}),e=>e.code==='SCOPE_VIOLATION');
  const permitted=service.plan({...edit,mutationId:randomUUID(),operations:[{type:'unlock_fields',objectId,paths:['transform']},...edit.operations]});
  service.apply({...apply,changeId:permitted.changeId,expectedRevision:applied.revisionId,mutationId:randomUUID()});
  assert.deepEqual(service.apply(apply),applied,'retry must return original result even after a later revision');
  assert.throws(()=>service.plan({...input,operations:edit.operations}),e=>e.code==='IDEMPOTENCY_KEY_REUSED');
  assert.throws(()=>service.apply({...apply,mutationId:randomUUID()}),e=>e.code==='PROJECT_REVISION_CHANGED');
 }finally{f.close();}
});
