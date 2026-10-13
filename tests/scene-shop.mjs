// Offline check of scene_add_item / scene_add_shop / scene_list_items against the official samples: the item record, the
// shop template record and the shop component these tools write are byte for byte the ones in the official sample
// 货币与商店 (and the shop template of 掉落物、道具、背包, whose line has no price); on a save with nothing, a currency, an
// item, a stall and its shop are added and listed.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {container,fields} from '../src/scene/wire.mjs';
import {itemRecord,shopTemplateRecord,shopComponent,lootComponent,addItem,addShop,listItems,addCurrency,addPrefab,addComponents,listPrefabs,addGraph} from '../src/scene-save.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dir=path.join(root,'knowledge','samples','gil'),workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-shop-'));
const pick=prefix=>path.join(dir,fs.readdirSync(dir).find(f=>f.startsWith(prefix)));
const number=(b,id)=>Number(fields(b).find(f=>f.id===id&&f.wire===0)?.value),msg=(b,id)=>fields(b).find(f=>f.id===id&&f.wire===2).data;
const configs=(file,kind)=>fields(fields(container(fs.readFileSync(file))).find(f=>f.id===15).data).filter(f=>f.id===1).map(f=>f.data).filter(r=>number(r,2)===kind);
// General component records of one kind on the prefabs of a save (section 4, field 8).
const parts=(file,kind)=>fields(fields(container(fs.readFileSync(file))).find(f=>f.id===4).data).filter(f=>f.id===1&&f.wire===2).flatMap(e=>fields(e.data).filter(f=>f.id===8&&f.wire===2).map(f=>f.data)).filter(r=>number(r,1)===kind);
const library=(file,kind)=>{const tab=fields(fields(container(fs.readFileSync(file))).find(f=>f.id===6).data).map(f=>f.data).find(t=>number(t,1)===kind);return tab?fields(msg(tab,3)).filter(f=>f.id===5).map(f=>number(f.data,2)):null;};
try{
  const shop=pick('mh53tyir62xo_'),drops=pick('mh1t3z9s7hne_'),plain=pick('mhumsn9uap96_');
  assert.ok(itemRecord({id:1107296257,name:'苹果',icon:90001,value:{currencyId:1115684867,amount:5}}).equals(configs(shop,9)[0]),'the item record differs from the official one');
  const line={itemId:1107296257,currencyId:1115684867};
  // The lesson: the shop sells one apple for 10 and buys apples for 5.
  assert.ok(shopTemplateRecord({id:1136656386,name:'商店模板01',sell:[{...line,price:10,stock:1}],buy:[{...line,price:5}]}).equals(configs(shop,17)[0]),'the shop template record differs from the official one');
  assert.ok(shopTemplateRecord({id:1136656385,name:'自定义模板',buy:[{itemId:1107296257,currencyId:1115684865,price:0}]}).equals(configs(drops,17)[0]),'the shop template without a price differs from the official one');
  assert.equal(parts(shop,35).length,1);
  assert.ok(shopComponent({templateId:1136656386,name:'新建商店(1)'}).equals(parts(shop,35)[0]),'the shop component differs from the official one');
  // A consumable with an item graph, a description and its drop: the fowl meat of 掉落物、道具、背包.
  assert.ok(itemRecord({id:1107296257,name:'禽肉',icon:90015,category:'consumable',useGraphId:1073741827,description:'只是一只普通的禽肉',dropPrefabId:1077936130,useCooldownSeconds:3}).equals(configs(drops,9)[0]),'the consumable record differs from the official one');
  const official=listItems({mapPath:shop});
  assert.deepEqual(official.items,[{itemId:1107296257,name:'苹果',icon:90001,value:{currencyId:1115684867,amount:5}}]);
  assert.deepEqual(official.shops,[{shopTemplateId:1136656386,name:'商店模板01',sell:[{...line,price:10,stock:1}],buy:[{...line,price:5}]}]);

  // A save with nothing: an item needs a backpack to be held in, so the currency comes first.
  assert.throws(()=>addItem({mapPath:plain,name:'apple'},workspace),e=>e.code==='NO_BACKPACK');
  const before=fs.readFileSync(plain),money=addCurrency({mapPath:plain,name:'coin',startAmount:20},workspace);
  const apple=addItem({mapPath:money.mapPath,name:'apple',value:{currency:'coin',amount:5}},workspace),pear=addItem({mapPath:apple.mapPath,name:'pear',icon:90015},workspace);
  assert.ok(before.equals(fs.readFileSync(plain)),'the source save is not touched');
  assert.deepEqual([apple.itemId,pear.itemId],[1107296257,1107296258]);
  assert.ok(configs(pear.mapPath,9)[0].equals(itemRecord({id:1107296257,name:'apple',value:{currencyId:money.currencyId,amount:5}})));
  assert.deepEqual(library(pear.mapPath,19),[1107296257,1107296258]);
  assert.throws(()=>addItem({mapPath:pear.mapPath,name:'apple'},workspace),e=>e.code==='DUPLICATE_ITEM_NAME');
  assert.throws(()=>addItem({mapPath:pear.mapPath,name:'plum',value:{currency:'gem',amount:1}},workspace),e=>e.code==='NOT_FOUND');
  // An item graph and the consumable that names it.
  const eat=addGraph({mapPath:pear.mapPath,name:'eat',kind:'item'},workspace);
  assert.equal(eat.kind,'item');assert.deepEqual(library(eat.mapPath,20),[eat.graphId]);
  const plum=addItem({mapPath:eat.mapPath,name:'plum',category:'consumable',useGraphId:eat.graphId,description:'eat me'},workspace);
  assert.ok(configs(plum.mapPath,9).at(-1).equals(itemRecord({id:plum.itemId,name:'plum',category:'consumable',useGraphId:eat.graphId,description:'eat me'})));
  assert.throws(()=>addItem({mapPath:eat.mapPath,name:'x',useGraphId:eat.graphId},workspace),e=>e.code==='NOT_USABLE');
  assert.throws(()=>addItem({mapPath:eat.mapPath,name:'x',category:'consumable',useGraphId:5},workspace),e=>e.code==='NOT_AN_ITEM_GRAPH');
  assert.throws(()=>addGraph({mapPath:pear.mapPath,name:'eat2',kind:'item',attachToPrefab:'player'},workspace),e=>e.code==='INVALID_TARGET');
  // The stall and its shop: sells apples and pears, buys apples back.
  const stall=addPrefab({mapPath:pear.mapPath,asset:10005008,name:'stall'},workspace);
  const made=addShop({mapPath:stall.mapPath,name:'fruit',prefab:'stall',sell:[{item:'apple',currency:'coin',price:5,stock:4},{item:pear.itemId,currency:money.currencyId,price:8}],buy:[{item:'apple',currency:'coin',price:3}]},workspace);
  assert.equal(made.shopTemplateId,1136656385);assert.equal(made.templates,1);
  assert.deepEqual(listItems({mapPath:made.mapPath}).shops,[{shopTemplateId:1136656385,name:'fruit',sell:[{itemId:1107296257,currencyId:money.currencyId,price:5,stock:4},{itemId:1107296258,currencyId:money.currencyId,price:8,stock:1}],buy:[{itemId:1107296257,currencyId:money.currencyId,price:3}]}]);
  assert.ok(parts(made.mapPath,35)[0].equals(shopComponent({templateId:1136656385,name:'fruit'})));
  assert.deepEqual(library(made.mapPath,28),[1136656385]);
  assert.throws(()=>addShop({mapPath:made.mapPath,name:'fruit',prefab:'stall',sell:[{item:'apple',currency:'coin',price:5}]},workspace),e=>e.code==='DUPLICATE_SHOP_NAME');
  assert.throws(()=>addShop({mapPath:made.mapPath,name:'empty',prefab:'stall'},workspace),e=>e.code==='EMPTY_SHOP');
  assert.throws(()=>addShop({mapPath:made.mapPath,name:'twice',prefab:'stall',sell:[{item:'apple',currency:'coin',price:5},{item:'apple',currency:'coin',price:6}]},workspace),e=>e.code==='DUPLICATE_LINE');
  assert.throws(()=>addShop({mapPath:made.mapPath,name:'nowhere',prefab:'nothing',sell:[{item:'apple',currency:'coin',price:5}]},workspace),e=>e.code==='PREFAB_NOT_FOUND');
  // Drops and loot. The loot component is byte for byte the one on the bird ball of the official sample; the drop
  // component is the one on its fowl meat (the rest of that prefab is from an older editor, so only the component is compared).
  assert.ok(lootComponent({dropPrefabId:1077936130,items:[{itemId:1107296257,amount:3}]}).equals(parts(drops,37)[0]),'the loot component differs from the official one');
  const fallen=addPrefab({mapPath:made.mapPath,asset:20001554,name:'apple on the ground',drop:{item:'apple',amount:2}},workspace);
  assert.equal(fallen.kind,'drop');assert.deepEqual(fallen.gives,{itemId:1107296257,amount:2});
  const officialDrop=parts(drops,36).find(r=>r.includes(Buffer.from([0x10,0x81,0x80,0x80,0x90,0x04])));
  const mineDrop=parts(fallen.mapPath,36)[0];
  // Same bytes but for the amount (the official one gives 1, this one 2).
  // (Two calls from the same save write the same output file unless outputName tells them apart.)
  assert.ok(parts(addPrefab({mapPath:made.mapPath,asset:20001554,name:'one apple',drop:{item:'apple'},outputName:'one-apple'},workspace).mapPath,36)[0].equals(officialDrop),'the drop component differs from the official one');
  assert.equal(mineDrop.length,officialDrop.length);
  assert.deepEqual(library(fallen.mapPath,21),[fallen.prefabId]);
  assert.ok(!library(fallen.mapPath,6).includes(fallen.prefabId),'a drop is not listed with the ordinary object prefabs');
  const entry=fields(fields(container(fs.readFileSync(fallen.mapPath))).find(f=>f.id===4).data).filter(f=>f.id===1&&f.wire===2).map(f=>f.data).find(e=>number(e,1)===fallen.prefabId);
  assert.equal(number(entry,9),2);
  assert.ok(listPrefabs({mapPath:fallen.mapPath}).prefabs.some(p=>p.prefabId===fallen.prefabId));
  const crate=addPrefab({mapPath:fallen.mapPath,asset:10005008,name:'crate'},workspace);
  const looted=addComponents({mapPath:crate.mapPath,prefab:'crate',loot:{dropPrefab:'apple on the ground',items:[{item:'apple',amount:3}]}},workspace);
  assert.ok(parts(looted.mapPath,37)[0].equals(lootComponent({dropPrefabId:fallen.prefabId,items:[{itemId:1107296257,amount:3}]})));
  assert.throws(()=>addComponents({mapPath:crate.mapPath,prefab:'crate',loot:{dropPrefab:'nothing',items:[{item:'apple'}]}},workspace),e=>e.code==='PREFAB_NOT_FOUND');
  assert.throws(()=>addPrefab({mapPath:made.mapPath,asset:20001554,name:'x',drop:{item:'plum'}},workspace),e=>e.code==='NOT_FOUND');
  console.log(JSON.stringify({ok:true}));
}finally{fs.rmSync(workspace,{recursive:true,force:true});}
