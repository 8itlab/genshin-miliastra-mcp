// Offline check of scene_add_currency / scene_list_currencies against the official samples: the currency record, the
// backpack template record and the character's backpack component this tool writes are byte for byte the ones in the
// official sample 货币与商店, and on a save without currency all three are added and listed in the library.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {container,fields} from '../src/scene/wire.mjs';
import {currencyRecord,backpackTemplateRecord,backpackRecord,addCurrency,listCurrencies} from '../src/scene-save.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dir=path.join(root,'knowledge','samples','gil'),workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-currency-'));
const pick=prefix=>path.join(dir,fs.readdirSync(dir).find(f=>f.startsWith(prefix)));
const number=(b,id)=>Number(fields(b).find(f=>f.id===id&&f.wire===0)?.value),msg=(b,id)=>fields(b).find(f=>f.id===id&&f.wire===2).data;
const configs=(file,kind)=>fields(fields(container(fs.readFileSync(file))).find(f=>f.id===15).data).filter(f=>f.id===1).map(f=>f.data).filter(r=>number(r,2)===kind);
// The backpack component (general component 33) of the character template: the prefab entry whose base asset is 1000001.
const base=e=>{const f=fields(e).find(x=>x.id===2);return f?(f.wire===0?Number(f.value):number(f.data,1)):null;};
const backpacks=file=>fields(fields(container(fs.readFileSync(file))).find(f=>f.id===4).data).filter(f=>f.id===1&&f.wire===2).map(f=>f.data)
  .filter(e=>base(e)===1000001).flatMap(e=>fields(e).filter(f=>f.id===8&&f.wire===2).map(f=>f.data)).filter(r=>number(r,1)===33);
const library=(file,kind)=>{const tab=fields(fields(container(fs.readFileSync(file))).find(f=>f.id===6).data).map(f=>f.data).find(t=>number(t,1)===kind);return tab?fields(msg(tab,3)).filter(f=>f.id===5).map(f=>number(f.data,2)):null;};
try{
  const shop=pick('mh53tyir62xo_'),plain=pick('mhumsn9uap96_');
  assert.ok(currencyRecord({id:1115684867,name:'摩拉',icon:100007}).equals(configs(shop,11)[0]),'the currency record differs from the official one');
  assert.ok(backpackTemplateRecord({id:1119879169}).equals(configs(shop,12)[0]),'the backpack template record differs from the official one');
  const official=backpacks(shop);
  assert.equal(official.length,1,'the official sample has one backpack component on its character template');
  assert.ok(backpackRecord({templateId:1119879169,holdings:[{configId:1115684867,amount:1}]}).equals(official[0]),'the backpack component differs from the official one');
  assert.deepEqual(listCurrencies({mapPath:shop}),{...listCurrencies({mapPath:shop}),currencies:[{currencyId:1115684867,name:'摩拉',icon:100007}],backpackTemplates:[{backpackTemplateId:1119879169,name:'背包模板',capacity:10}],characterBackpack:{templateId:1119879169,holdings:[{configId:1115684867,amount:1}]}});

  // A save with no currency and no backpack: everything is added.
  assert.deepEqual(listCurrencies({mapPath:plain}).currencies,[]);
  const hadTemplate=configs(plain,12).length;
  const before=fs.readFileSync(plain),made=addCurrency({mapPath:plain,name:'coin',startAmount:7},workspace);
  assert.ok(before.equals(fs.readFileSync(plain)),'the source save is not touched');
  assert.equal(made.currencyId,1115684865);assert.equal(made.createdBackpackTemplate,!hadTemplate);assert.equal(made.characterTemplates,1);
  const listed=listCurrencies({mapPath:made.mapPath});
  assert.deepEqual(listed.currencies,[{currencyId:1115684865,name:'coin',icon:100001}]);
  assert.deepEqual(listed.characterBackpack,{templateId:made.backpackTemplateId,holdings:[{configId:1115684865,amount:7}]});
  assert.ok(library(made.mapPath,23).includes(made.currencyId),'the currency is listed in the library');
  assert.ok(library(made.mapPath,22).includes(made.backpackTemplateId),'the backpack template is listed in the library');
  assert.ok(backpacks(made.mapPath)[0].equals(backpackRecord({templateId:made.backpackTemplateId,holdings:[{configId:1115684865,amount:7}]})));
  // A second currency joins the same backpack; one with no starting amount is defined but not held.
  const second=addCurrency({mapPath:made.mapPath,name:'gem',icon:100007,startAmount:2},workspace),third=addCurrency({mapPath:second.mapPath,name:'dust'},workspace);
  assert.equal(second.currencyId,1115684866);assert.equal(second.createdBackpackTemplate,false);assert.equal(third.currencyId,1115684867);
  assert.deepEqual(listCurrencies({mapPath:third.mapPath}).characterBackpack.holdings,[{configId:1115684865,amount:7},{configId:1115684866,amount:2}]);
  assert.equal(listCurrencies({mapPath:third.mapPath}).backpackTemplates.length,Math.max(1,hadTemplate));
  assert.throws(()=>addCurrency({mapPath:made.mapPath,name:'coin'},workspace),e=>e.code==='DUPLICATE_CURRENCY_NAME');
  assert.throws(()=>addCurrency({mapPath:plain,name:'x',startAmount:-1},workspace),e=>e.code==='INVALID_AMOUNT');
  // On the official sample, which already has a backpack with 摩拉 in it, a new currency is added next to it.
  const onShop=addCurrency({mapPath:shop,name:'coin',startAmount:3},workspace);
  assert.equal(onShop.currencyId,1115684868);
  assert.deepEqual(listCurrencies({mapPath:onShop.mapPath}).characterBackpack,{templateId:1119879169,holdings:[{configId:1115684867,amount:1},{configId:1115684868,amount:3}]});
  console.log(JSON.stringify({ok:true,createdBackpackTemplate:made.createdBackpackTemplate}));
}finally{fs.rmSync(workspace,{recursive:true,force:true});}
