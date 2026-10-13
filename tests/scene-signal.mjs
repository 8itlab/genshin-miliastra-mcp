// Offline check of scene_add_signal / scene_list_signals against the official sample 信号: the three definitions and the
// register entry this tool writes for a signal without parameters are byte for byte those of the official signal 开门, and
// a signal added to a save without any gets its definitions, its register and serial numbers that continue the save's own.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {container,fields} from '../src/scene/wire.mjs';
import {signalRecords,addSignal,listSignals,clientScriptSignalHeads} from '../src/scene-save.mjs';

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

  // Since game 7.1 a signal has a fourth definition, the node that sends it to client scripts. Two saves the editor
  // stored after adding it (to signals this tool had written with three): all four definitions match, without and with
  // a parameter, and the definition is found by the name of its signal.
  const fixture=n=>path.join(root,'tests','fixtures',n),B=1610612737;
  const withWord=definitions(fixture('editor-2026-10-13-signal4.gil')),madeWord=signalRecords({send:B,listen:B+1,client:B+2,script:B+3,name:'CC_say',serial:1,parameter:'word'});
  assert.equal(withWord.length,4);for(const [i,label] of ['send','listen','client','client script'].entries())assert.ok(madeWord.definitions[i].equals(withWord[i]),'the '+label+' definition of a 7.1 signal with a parameter differs');
  assert.equal(madeWord.pins,22);
  const bare=definitions(fixture('editor-2026-10-13-signal4plain.gil')),madeBare=signalRecords({send:B,listen:B+1,client:B+2,script:B+3,name:'CM_buy',serial:1});
  assert.equal(bare.length,4);for(const [i,label] of ['send','listen','client','client script'].entries())assert.ok(madeBare.definitions[i].equals(bare[i]),'the '+label+' definition of a 7.1 signal differs');
  assert.equal(madeBare.pins,17);
  assert.deepEqual([...clientScriptSignalHeads(fs.readFileSync(fixture('editor-2026-10-13-signal4.gil')))],[['CC_say',{class:10001,type:20000,kind:22001,nodeId:B+3}]]);
  assert.equal(clientScriptSignalHeads(fs.readFileSync(official)).size,0,'a save from before 7.1 has no such definition');

  const plain=pick('mhumsn9uap96_'),before=fs.readFileSync(plain);
  assert.deepEqual(listSignals({mapPath:plain}).signals,[]);
  const first=addSignal({mapPath:plain,name:'night'},workspace),second=addSignal({mapPath:first.mapPath,name:'dawn'},workspace);
  assert.deepEqual(first.definitionIds,[B,B+1,B+2,B+3]);assert.deepEqual(second.definitionIds,[B+4,B+5,B+6,B+7]);
  assert.deepEqual(listSignals({mapPath:second.mapPath}).signals,['night','dawn']);
  // Four definitions to a signal, ids and serials running on: the first takes 17 pins, the second starts at 18.
  const mine=definitions(second.mapPath);assert.equal(mine.length,8);
  const dawn=signalRecords({send:B+4,listen:B+5,client:B+6,script:B+7,name:'dawn',serial:18}).definitions;
  for(const i of [0,1,2,3])assert.ok(mine[4+i].equals(dawn[i]),'serial numbers continue after the first signal ('+i+')');
  assert.deepEqual([...clientScriptSignalHeads(fs.readFileSync(second.mapPath)).entries()].map(([n,h])=>[n,h.nodeId]),[['night',B+3],['dawn',B+7]]);
  const order=section(second.mapPath).map(f=>f.id);
  assert.deepEqual([...new Set(order)],[...new Set(order)].sort((a,b)=>a-b),'the section keeps its field order: '+order.join(','));
  const added=addSignal({mapPath:official,name:'third'},workspace);
  assert.deepEqual(added.definitionIds,[1610612743,1610612744,1610612745,1610612746]);assert.deepEqual(listSignals({mapPath:added.mapPath}).signals,['平台','开门','third']);
  // A signal with a parameter on a save: its pins are numbered on (22 of them), and the next signal continues after.
  const told=addSignal({mapPath:second.mapPath,name:'lever',parameter:'which'},workspace),after=addSignal({mapPath:told.mapPath,name:'last'},workspace);
  const all=definitions(after.mapPath);assert.equal(all.length,16);
  assert.ok(all[8].equals(signalRecords({send:B+8,listen:B+9,client:B+10,script:B+11,name:'lever',serial:35,parameter:'which'}).definitions[0]));
  assert.ok(all[15].equals(signalRecords({send:B+12,listen:B+13,client:B+14,script:B+15,name:'last',serial:57}).definitions[3]),'serial numbers continue after the parameter pins');
  // On a save the editor stored (its fourth definitions are there): a new signal takes the ids and serials after them.
  const onStored=addSignal({mapPath:fixture('editor-2026-10-13-signal4.gil'),name:'more'},workspace);
  assert.deepEqual(onStored.definitionIds,[B+4,B+5,B+6,B+7]);
  assert.ok(definitions(onStored.mapPath)[4].equals(signalRecords({send:B+4,listen:B+5,client:B+6,script:B+7,name:'more',serial:23}).definitions[0]));
  assert.throws(()=>addSignal({mapPath:plain,name:'client:x'},workspace),e=>e.code==='INVALID_SIGNAL_NAME');
  assert.throws(()=>addSignal({mapPath:second.mapPath,name:'night'},workspace),e=>e.code==='DUPLICATE_SIGNAL_NAME');
  assert.ok(fs.readFileSync(plain).equals(before),'the source save was changed');
  console.log(JSON.stringify({ok:true}));
}finally{fs.rmSync(workspace,{recursive:true,force:true});}
