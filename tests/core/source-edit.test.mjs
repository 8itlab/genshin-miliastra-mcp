import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {fixture,populated} from './fixtures.mjs';
import {Transactions,sealRevision} from '../../dist/core/transactions.js';
import {ChangeService} from '../../dist/core/changes.js';

test('source edits require explicit detach and respect source locks',()=>{
 const f=fixture();try{
  const r=populated(f),c=r.contents[0],objectId=c.managedObjectIds[0];
  c.sourceRefs=[f.store.putBlob(Buffer.from('old source'))];sealRevision(r);f.store.createProject(f.identity,r,[f.source]);
  const service=new ChangeService(f.store,new Transactions(f.store));
  const input={projectId:r.projectId,expectedRevision:r.revisionId,scope:{contentIds:[c.contentId],objectIds:[]},mutationId:randomUUID(),operations:[{type:'set_source_text',contentId:c.contentId,code:'new source'}]};
  assert.throws(()=>service.plan(input),e=>e.code==='AUTHORING_MODE_CONFLICT');
  const detach={type:'detach_from_recipe',contentId:c.contentId,sourceRefs:c.sourceRefs};
  assert.throws(()=>service.plan({...input,operations:[{type:'lock_fields',objectId,paths:['sourceRef']},detach,...input.operations]}),e=>e.code==='LOCKED_CONTENT');
  const p=service.plan({...input,operations:[detach,...input.operations]});
  assert.equal(f.store.readProject(r.projectId).revision.contents[0].authoringMode,'recipe');
  service.apply({projectId:r.projectId,expectedRevision:r.revisionId,changeId:p.changeId,mutationId:randomUUID()});
  const next=f.store.readProject(r.projectId).revision.contents[0];
  assert.equal(next.authoringMode,'custom-source');assert.equal(next.recipe,null);
  assert.equal(f.store.readBlob(next.sourceRefs[0]).toString(),'new source');
 }finally{f.close();}
});
