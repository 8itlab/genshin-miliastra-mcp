// Offline check of scene_add_unit_status / scene_list_unit_statuses against the official samples: the outline, see-through
// and maximum-health statuses this tool writes are byte for byte the ones the editor saved, and a new status is added to
// section 16 and to the library tab of a save that had none.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {container,fields} from '../src/scene/wire.mjs';
import {statusRecord,statusDefinition,addUnitStatus,listUnitStatuses} from '../src/scene-save.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dir=path.join(root,'knowledge','samples','gil'),workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-status-'));
const pick=prefix=>path.join(dir,fs.readdirSync(dir).find(f=>f.startsWith(prefix)));
const saved=file=>fields(fields(container(fs.readFileSync(file))).find(f=>f.id===16).data).filter(f=>f.id===1).map(f=>f.data);
try{
  const outlines=saved(pick('mhhe9ji9ysn8_')),health=saved(pick('mhtbbb9hr32y_'));
  assert.ok(statusRecord({id:1077936129,name:'描边',effects:[{outline:6}]}).equals(outlines[0]),'the outline status differs from the official one');
  assert.ok(statusRecord({id:1077936130,effects:[{seeThrough:14}]}).equals(outlines[1]),'the see-through status differs from the official one');
  assert.ok(statusRecord({id:1077936129,stackLimit:5,effects:[{maxHealth:1000}]}).equals(health[0]),'the maximum-health status differs from the official one');
  // The definition in section 15 (records of kind 1): without it the game does not know the status.
  const defined=file=>fields(fields(container(fs.readFileSync(file))).find(f=>f.id===15&&f.wire===2).data).filter(f=>f.id===1&&f.wire===2).map(f=>f.data).filter(r=>Number(fields(r).find(x=>x.id===2&&x.wire===0)?.value)===1);
  const official=defined(pick('mhhe9ji9ysn8_'));
  assert.equal(official.length,2);
  assert.ok(statusDefinition({id:1077936129,name:'描边',effects:[{outline:6}]}).equals(official[0]),'the outline definition differs from the official one');
  // The definition always carries the name; the copy in section 16 of this status, made by a newer editor, leaves it out.
  assert.ok(statusDefinition({id:1077936130,name:'透视',effects:[{seeThrough:14}]}).equals(official[1]),'the see-through definition differs from the official one');
  assert.deepEqual(listUnitStatuses({mapPath:pick('mhhe9ji9ysn8_')}).statuses,[{statusId:1077936129,name:'描边',effects:['outline']},{statusId:1077936130,name:'',effects:['seeThrough']}]);

  const plain=pick('mhumsn9uap96_'),before=fs.readFileSync(plain);
  assert.deepEqual(listUnitStatuses({mapPath:plain}).statuses,[]);
  const first=addUnitStatus({mapPath:plain,name:'can_use',outline:'green'},workspace),second=addUnitStatus({mapPath:first.mapPath,name:'seen',seeThrough:'white'},workspace);
  assert.ok(defined(second.mapPath).some(r=>r.equals(statusDefinition({id:first.statusId,name:'can_use',effects:[{outline:6}]}))),'the definition of the new status is missing from section 15');
  assert.equal(defined(second.mapPath).length,defined(plain).length+2);
  assert.equal(first.statusId,1077936129);assert.equal(second.statusId,1077936130);
  assert.deepEqual(listUnitStatuses({mapPath:second.mapPath}).statuses.map(s=>s.name),['can_use','seen']);
  const library=fields(fields(container(fs.readFileSync(second.mapPath))).find(f=>f.id===6).data).map(f=>f.data).find(t=>Number(fields(t).find(f=>f.id===1&&f.wire===0)?.value)===11);
  assert.equal(fields(fields(library).find(f=>f.id===3).data).filter(f=>f.id===5).length,2,'both statuses are listed in the library');
  assert.throws(()=>addUnitStatus({mapPath:second.mapPath,name:'seen',outline:'green'},workspace),e=>e.code==='DUPLICATE_STATUS_NAME');
  assert.throws(()=>addUnitStatus({mapPath:plain,name:'x',outline:'green',maxHealth:5},workspace),e=>e.code==='INVALID_STATUS');
  assert.throws(()=>addUnitStatus({mapPath:plain,name:'x',outline:'purple'},workspace),e=>e.code==='INVALID_STATUS');
  assert.ok(fs.readFileSync(plain).equals(before),'the source save was changed');
  console.log(JSON.stringify({ok:true}));
}finally{fs.rmSync(workspace,{recursive:true,force:true});}
