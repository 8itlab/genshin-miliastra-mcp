// Offline check of scene_add_signal / scene_list_signals against the official sample 信号: the three definitions and the
// register entry this tool writes for a signal without parameters are byte for byte those of the official signal 开门, and
// a signal added to a save without any gets its definitions, its register and serial numbers that continue the save's own.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {container,fields} from '../src/scene/wire.mjs';
import {signalRecords,addSignal,listSignals} from '../src/scene-save.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dir=path.join(root,'knowledge','samples','gil'),workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-signal-'));
const pick=prefix=>path.join(dir,fs.readdirSync(dir).find(f=>f.startsWith(prefix)));
const section=file=>fields(fields(container(fs.readFileSync(file))).find(f=>f.id===10).data);
const definitions=file=>section(file).filter(f=>f.id===2&&f.wire===2).map(f=>fields(f.data).find(x=>x.id===1).data);
try{
  const official=pick('mh3id60oxiqw_信号.'),saved=definitions(official),made=signalRecords({send:1610612740,listen:1610612741,client:1610612742,name:'开门',serial:16});
  assert.equal(saved.length,6);
  for(const [i,label] of ['send','listen','client'].entries())assert.ok(made.definitions[i].equals(saved[3+i]),'the '+label+' definition differs from the official one');
  const entries=fields(section(official).find(f=>f.id===5).data).filter(f=>f.id===3).map(f=>f.data);
  assert.ok(made.register.equals(entries[1]),'the register entry differs from the official one');
  // The other signal of the sample, 平台, carries one string, 状态: all three definitions and the register entry match.
  const carrying=signalRecords({send:1610612737,listen:1610612738,client:1610612739,name:'平台',serial:1,parameter:'状态'});
  for(const [i,label] of ['send','listen','client'].entries())assert.ok(carrying.definitions[i].equals(saved[i]),'the '+label+' definition with a parameter differs from the official one');
  assert.ok(carrying.register.equals(entries[0]),'the register entry with a parameter differs from the official one');assert.equal(carrying.pins,15);
  assert.deepEqual(listSignals({mapPath:official}).signals,['平台','开门']);

  const plain=pick('mhumsn9uap96_'),before=fs.readFileSync(plain);
  assert.deepEqual(listSignals({mapPath:plain}).signals,[]);
  const first=addSignal({mapPath:plain,name:'night'},workspace),second=addSignal({mapPath:first.mapPath,name:'dawn'},workspace);
  assert.deepEqual(first.definitionIds,[1610612737,1610612738,1610612739]);assert.deepEqual(second.definitionIds,[1610612740,1610612741,1610612742]);
  assert.deepEqual(listSignals({mapPath:second.mapPath}).signals,['night','dawn']);
  // The second signal on that save is exactly the official 开门 but for its name: same ids, serials continuing at 13.
  const mine=definitions(second.mapPath);assert.equal(mine.length,6);
  assert.ok(mine[3].equals(signalRecords({send:1610612740,listen:1610612741,client:1610612742,name:'dawn',serial:13}).definitions[0]),'serial numbers continue after the first signal');
  const order=section(second.mapPath).map(f=>f.id);
  assert.deepEqual([...new Set(order)],[...new Set(order)].sort((a,b)=>a-b),'the section keeps its field order: '+order.join(','));
  const added=addSignal({mapPath:official,name:'third'},workspace);
  assert.deepEqual(added.definitionIds,[1610612743,1610612744,1610612745]);assert.deepEqual(listSignals({mapPath:added.mapPath}).signals,['平台','开门','third']);
  // A signal with a parameter on a save: its pins are numbered on, and the next signal continues after all fifteen.
  const told=addSignal({mapPath:second.mapPath,name:'lever',parameter:'which'},workspace),after=addSignal({mapPath:told.mapPath,name:'last'},workspace);
  const all=definitions(after.mapPath);assert.equal(all.length,12);
  assert.ok(all[6].equals(signalRecords({send:1610612743,listen:1610612744,client:1610612745,name:'lever',serial:25,parameter:'which'}).definitions[0]));
  assert.ok(all[9].equals(signalRecords({send:1610612746,listen:1610612747,client:1610612748,name:'last',serial:40}).definitions[0]),'serial numbers continue after the parameter pins');
  assert.throws(()=>addSignal({mapPath:second.mapPath,name:'night'},workspace),e=>e.code==='DUPLICATE_SIGNAL_NAME');
  assert.ok(fs.readFileSync(plain).equals(before),'the source save was changed');
  console.log(JSON.stringify({ok:true}));
}finally{fs.rmSync(workspace,{recursive:true,force:true});}
