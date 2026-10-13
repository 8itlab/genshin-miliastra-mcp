// Offline check of scene_list_prefabs / scene_add_prefab, scene_list_factions / scene_set_faction_hostility and
// scene_get_level_settings / scene_set_level_settings on a
// minimal synthetic save: the new prefab is written with the asset, name and scale asked for and is listed in the
// editor's library tab; hostility is rewritten as asked; everything else and the source file stay as they were.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {field,fields,container} from '../src/scene/wire.mjs';
import {listPrefabs,addPrefab,listFactions,setFactionHostility,getLevelSettings,setLevelSettings,addGraph,updatePrefab} from '../src/scene-save.mjs';

const seed=Buffer.from(JSON.parse(fs.readFileSync(new URL('../src/scene/object-prefab-seed.json',import.meta.url),'utf8')).entry,'hex');
const text=s=>Buffer.from(s,'utf8'),msg=(...p)=>Buffer.concat(p),f32=n=>{const b=Buffer.alloc(4);b.writeFloatLE(n);return b;};
const tab=(kind,...items)=>field(1,2,msg(field(1,0,kind),field(2,2,msg(field(1,2,text('root')),field(3,0,1))),field(3,2,msg(field(1,2,text('未分类页签')),field(3,0,2),...items))));
const faction=(name,id,hostile)=>field(1,2,msg(field(1,2,text(name)),field(2,0,id),field(3,2,text('icon')),field(13,2,Buffer.from(hostile))));
const payload=msg(field(3,2,text('other section')),field(4,2,field(1,2,seed)),
 field(6,2,msg(tab(6,field(5,2,msg(field(1,0,100),field(2,0,1077936136)))),tab(18))),
 field(11,2,msg(field(1,2,msg(field(6,0,1),field(12,0,1),field(14,5,f32(1.2)),field(15,0,2),field(17,0,10),field(18,5,f32(24)))),field(2,2,msg(faction('初始玩家阵营',1,[2,3]),faction('初始物件阵营',2,[1,3]),faction('初始造物阵营',3,[1,2]))),field(7,2,field(1,0,1)))));
const header=Buffer.alloc(20);header.writeUInt32BE(payload.length+20,0);header.writeUInt32BE(1,4);header.writeUInt32BE(0x326,8);header.writeUInt32BE(3,12);header.writeUInt32BE(payload.length,16);
const tail=Buffer.alloc(4);tail.writeUInt32BE(0x679);
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-prefab-')),source=path.join(dir,'source.gil'),bytes=Buffer.concat([header,payload,tail]);
fs.writeFileSync(source,bytes);
try{
 assert.deepEqual(listPrefabs({mapPath:source}).prefabs,[{prefabId:1077936136,name:'木质柱子',assetId:20002129,assetName:'木质柱子',kind:'object',scale:[1,1,1]}]);
 const made=addPrefab({mapPath:source,asset:10005009,name:'small coin',scale:0.5,outputName:'with-coin'},dir);
 assert.equal(made.prefabId,1077936137);assert.deepEqual(made.scale,[0.5,0.5,0.5]);assert.equal(made.assetName,'冒险币');
 assert.deepEqual(made.size,[0.453,0.453,0.11]);
 assert.ok(fs.readFileSync(source).equals(bytes),'the source save must not change');
 assert.deepEqual(listPrefabs({mapPath:made.mapPath}).prefabs[1],{prefabId:1077936137,name:'small coin',assetId:10005009,assetName:'冒险币',kind:'object',scale:[0.5,0.5,0.5]});
 const root=container(fs.readFileSync(made.mapPath)),library=fields(fields(root).find(f=>f.id===6).data);
 const listed=t=>fields(fields(t.data).find(f=>f.id===3).data).filter(f=>f.id===5).map(f=>Number(fields(f.data).find(x=>x.id===2).value));
 assert.deepEqual(listed(library[0]),[1077936136,1077936137],'the new prefab is in the object tab of the library');
 assert.deepEqual(listed(library[1]),[],'other tabs are untouched');
 assert.ok(fs.readFileSync(made.mapPath).includes(text('other section')));
 const wall=addPrefab({mapPath:made.mapPath,asset:20003092,scale:[0.5,1,1],outputName:'with-wall'},dir);
 assert.equal(wall.prefabId,1077936138);assert.equal(wall.name,'木质围栏_0.5x1x1');
 assert.throws(()=>addPrefab({mapPath:made.mapPath,asset:10005009,name:'small coin'},dir),{code:'DUPLICATE_PREFAB_NAME'});
 assert.throws(()=>addPrefab({mapPath:source,asset:99},dir),{code:'UNKNOWN_ASSET'});
 assert.throws(()=>addPrefab({mapPath:source,asset:30002002},dir),{code:'NOT_AN_OBJECT'});
 assert.throws(()=>addPrefab({mapPath:source,asset:10005009,scale:[1,0,1]},dir),{code:'INVALID_SCALE'});
 assert.throws(()=>addPrefab({mapPath:source},dir),{code:'INVALID_PREFAB_SOURCE'});
 assert.throws(()=>addPrefab({mapPath:source,asset:10005009,fromEntity:'x'},dir),{code:'INVALID_PREFAB_SOURCE'});

 // Mechanism assets carry their preset status in the model component (base component 2). What this tool writes is byte
 // for byte what the official samples hold: the chest of 碰撞与交互 and the lever of 信号, which starts at value 1.
 const samples=new URL('../knowledge/samples/gil/',import.meta.url),sample=suffix=>new URL(fs.readdirSync(samples).find(f=>f.endsWith(suffix)),samples);
 const baseOf=e=>{const f=fields(e).find(x=>x.id===2);return f.wire===0?Number(f.value):Number(fields(f.data).find(x=>x.id===1).value);};
 const models=(file,pick)=>fields(fields(container(fs.readFileSync(file))).find(f=>f.id===4).data).filter(f=>f.id===1&&f.wire===2).map(f=>f.data).filter(pick)
  .map(e=>fields(e).filter(f=>f.id===7&&f.wire===2).map(f=>f.data).find(c=>Number(fields(c).find(x=>x.id===1).value)===2));
 const idOf=e=>Number(fields(e).find(x=>x.id===1).value);
 const chest=addPrefab({mapPath:source,asset:10005006,name:'chest',outputName:'with-chest'},dir);
 assert.deepEqual(chest.presetStatus,{statusId:100010060,startsAt:0,used:{1:'打开'},note:'珍贵的宝箱'});assert.match(chest.next,/setPresetStatus\(entity, 100010060n, 1n\)/);
 const officialChest=models(sample('_碰撞与交互.gil'),e=>baseOf(e)===10005006)[0];
 assert.ok(models(chest.mapPath,e=>idOf(e)===chest.prefabId)[0].equals(officialChest),'the chest model component differs from the official one');
 const lever=addPrefab({mapPath:source,asset:10005033,name:'lever',presetStatusValue:1,outputName:'with-lever'},dir);
 assert.ok(models(lever.mapPath,e=>idOf(e)===lever.prefabId)[0].equals(models(sample('_信号.gil'),e=>baseOf(e)===10005033)[0]),'the lever model component differs from the official one');
 assert.equal(wall.presetStatus,undefined);assert.equal(models(wall.mapPath,e=>idOf(e)===wall.prefabId)[0].length,4,'an asset without a preset status keeps the empty model component');
 assert.throws(()=>addPrefab({mapPath:source,asset:20003092,presetStatusValue:1},dir),{code:'INVALID_PRESET_STATUS'});

 // A prefab made from a placed entity: the entity's blocks move up one field number, the instance-only properties 19
 // and 52 are left out, and a creature goes to the creature tab with an id of the creature range.
 const prop=(kind,body)=>field(5,2,msg(field(1,0,kind),body)),comp=(kind,body)=>field(6,2,msg(field(1,0,kind),body));
 const placed=msg(field(1,0,1082130440),field(2,2,msg(field(1,0,30002003),field(2,0,1))),prop(1,field(11,2,field(1,2,text('guard')))),prop(30,field(40,2,text('ai'))),prop(19,field(28,2,Buffer.alloc(0))),prop(52,field(60,2,Buffer.alloc(0))),
  comp(1,field(11,2,msg(field(1,2,field(1,5,f32(29))),field(3,2,msg(field(1,5,f32(1.1)),field(2,5,f32(1.1)),field(3,5,f32(1.1)))),field(501,0,4294967295)))),comp(4,field(14,2,Buffer.alloc(0))),comp(7,field(17,2,text('stats'))),
  field(7,2,msg(field(1,0,18),field(2,0,1))),field(8,0,30002003));
 const scene=msg(payload,field(5,2,field(1,2,placed))),sceneFile=path.join(dir,'scene.gil'),sceneHeader=Buffer.from(header);
 sceneHeader.writeUInt32BE(scene.length+20,0);sceneHeader.writeUInt32BE(scene.length,16);fs.writeFileSync(sceneFile,Buffer.concat([sceneHeader,scene,tail]));
 const guard=addPrefab({mapPath:sceneFile,fromEntity:'guard',name:'recruit',outputName:'with-guard'},dir);
 assert.deepEqual([guard.kind,guard.assetId,guard.scale,guard.prefabId>=0x40800000],['creature',30002003,[1.1,1.1,1.1],true]);
 assert.notEqual(guard.prefabId,1082130440,'the id of the placed entity is not reused');
 const guardRoot=container(fs.readFileSync(guard.mapPath)),made2=fields(fields(guardRoot).find(f=>f.id===4).data).map(f=>fields(f.data)).find(p=>Number(p[0].value)===guard.prefabId);
 const kinds=id=>made2.filter(f=>f.id===id).map(f=>Number(fields(f.data)[0].value));
 assert.deepEqual([kinds(6),kinds(7),kinds(8)],[[1,30],[1,4,7],[18]]);
 assert.ok(made2.find(f=>f.id===7&&Number(fields(f.data)[0].value)===4).data.equals(Buffer.from('080472020801','hex')),'the prefab is written as created at start');
 assert.deepEqual(listed(fields(fields(guardRoot).find(f=>f.id===6).data)[1]),[guard.prefabId],'a creature prefab is listed in the creature tab');
 assert.throws(()=>addPrefab({mapPath:sceneFile,fromEntity:'nobody'},dir),{code:'ENTITY_NOT_FOUND'});

 assert.deepEqual(listFactions({mapPath:source}).factions.map(f=>[f.factionId,f.name,f.hostileTo]),[[1,'初始玩家阵营',[2,3]],[2,'初始物件阵营',[1,3]],[3,'初始造物阵营',[1,2]]]);
 const calm=setFactionHostility({mapPath:source,hostilePairs:[[3,1]],outputName:'calm'},dir);
 assert.deepEqual(calm.factions.map(f=>[f.hostileTo,f.friendlyTo]),[[[3],[2]],[[],[1,3]],[[1],[2]]]);
 assert.deepEqual(calm.before.map(f=>f.hostileTo),[[2,3],[1,3],[1,2]]);
 assert.deepEqual(listPrefabs({mapPath:calm.mapPath}).prefabs.length,1,'prefabs survive a faction change');
 assert.deepEqual(setFactionHostility({mapPath:calm.mapPath,hostilePairs:[[1,2],[1,3],[2,3]],outputName:'back'},dir).factions.map(f=>f.hostileTo),[[2,3],[1,3],[1,2]]);
 // A new map writes no list at all, which the editor shows as hostile to every other faction.
 const bare=msg(field(3,2,text('other section')),field(11,2,msg(field(1,2,field(6,0,1)),field(2,2,msg(...[['初始玩家阵营',1],['初始物件阵营',2],['初始造物阵营',3]].map(([n,id])=>field(1,2,msg(field(1,2,text(n)),field(2,0,id)))))))));
 const bareFile=path.join(dir,'bare.gil'),bareHeader=Buffer.from(header);bareHeader.writeUInt32BE(bare.length+20,0);bareHeader.writeUInt32BE(bare.length,16);fs.writeFileSync(bareFile,Buffer.concat([bareHeader,bare,tail]));
 assert.deepEqual(listFactions({mapPath:bareFile}).factions.map(f=>[f.hostileTo,f.friendlyTo]),[[[2,3],[]],[[1,3],[]],[[1,2],[]]]);
 assert.deepEqual(setFactionHostility({mapPath:bareFile,hostilePairs:[[1,3]],outputName:'bare-calm'},dir).factions.map(f=>[f.hostileTo,f.friendlyTo]),[[[3],[2]],[[],[1,3]],[[1],[2]]]);
 assert.throws(()=>setFactionHostility({mapPath:source,hostilePairs:[[1,9]]},dir),{code:'UNKNOWN_FACTION'});
 assert.throws(()=>setFactionHostility({mapPath:source,hostilePairs:[[2,2]]},dir),{code:'UNKNOWN_FACTION'});

 const level=getLevelSettings({mapPath:source});
 assert.deepEqual([level.aggroMode,level.aggroTransferMultiplier,level.loadTier,level.startHour,level.minutesPerSecond],['default',1.2,'low',10,24]);
 const custom=setLevelSettings({mapPath:source,aggroMode:'custom',outputName:'custom'},dir);
 assert.equal(custom.aggroMode,'custom');assert.equal(custom.before.aggroMode,'default');
 const basics=fields(fields(fields(container(fs.readFileSync(custom.mapPath))).find(f=>f.id===11).data).find(f=>f.id===1).data).map(f=>f.id);
 assert.deepEqual(basics,[6,12,13,14,15,17,18],'the new field sits in numeric order, as the editor writes it');
 assert.deepEqual(listFactions({mapPath:custom.mapPath}).factions.map(f=>f.hostileTo),[[2,3],[1,3],[1,2]],'factions survive a level settings change');
 const plain=setLevelSettings({mapPath:custom.mapPath,aggroMode:'default',outputName:'plain'},dir);
 assert.equal(plain.aggroMode,'default');
 assert.ok(fs.readFileSync(plain.mapPath).equals(bytes),'switching back gives the original bytes');
 assert.throws(()=>setLevelSettings({mapPath:source},dir),{code:'NOTHING_TO_CHANGE'});
 const heavy=setLevelSettings({mapPath:source,loadTier:'high',outputName:'heavy'},dir);
 assert.deepEqual([heavy.loadTier,heavy.aggroMode,heavy.before.loadTier],['high','default','low']);
 assert.ok(fs.readFileSync(setLevelSettings({mapPath:heavy.mapPath,loadTier:'low',outputName:'light'},dir).mapPath).equals(bytes),'back to low gives the original bytes');

 // A new map has no node graph: scene_add_graph writes an empty server graph, lists it in the library and attaches it
 // to the stage entity, whose graph component is empty until then.
 const stage=msg(field(1,0,1094713345),field(2,2,msg(field(1,0,10003004),field(2,0,1))),field(5,2,msg(field(1,0,1),field(11,2,field(1,2,text('关卡实体'))))),
  field(6,2,msg(field(1,0,1),field(11,2,field(501,0,4294967295)))),field(6,2,msg(field(1,0,3),field(13,2,Buffer.alloc(0)))),field(8,0,10003004));
 const blank=msg(field(5,2,field(1,2,stage)),field(6,2,msg(tab(6),tab(4))),field(10,2,field(7,0,1)),field(11,2,msg(field(1,2,field(6,0,1)),field(2,2,faction('初始玩家阵营',1,[2,3])))));
 const blankFile=path.join(dir,'blank.gil'),blankHeader=Buffer.from(header);
 blankHeader.writeUInt32BE(blank.length+20,0);blankHeader.writeUInt32BE(blank.length,16);fs.writeFileSync(blankFile,Buffer.concat([blankHeader,blank,tail]));
 const added=addGraph({mapPath:blankFile,name:'Main',outputName:'with-graph'},dir);
 assert.deepEqual([added.graphId,added.name,added.attachedTo],[1073741825,'_GSTS_Main','关卡实体']);
 const withGraph=container(fs.readFileSync(added.mapPath)),section=id=>fields(withGraph).find(f=>f.id===id).data;
 const group=fields(section(10));
 assert.deepEqual(group.map(f=>f.id),[1,7],'the graph group comes before the other fields of the section');
 const graphRecord=fields(fields(group[0].data)[0].data);
 assert.equal(fields(graphRecord[0].data).map(f=>Number(f.value)).join(','),'10000,20000,21001,1073741825');
 assert.equal(graphRecord[1].data.toString('utf8'),'_GSTS_Main');
 assert.deepEqual(listed(fields(section(6))[1]),[1073741825],'the graph is listed in the server graph tab');
 const stageComps=fields(fields(section(5))[0].data).filter(f=>f.id===6);
 // {1: 3, 13: {1: {1: {1: 1, 2: graph id, 501: 20000}}}}, as the editor writes it for a graph attached by hand.
 assert.equal(stageComps[1].data.toString('hex'),'08036a110a0f0a0d0801108180808004a81fa09c01','the stage entity names the graph in its component 3');
 assert.throws(()=>addGraph({mapPath:added.mapPath,name:'Main'},dir),{code:'DUPLICATE_GRAPH_NAME'});
 // An entity can run several graphs (official saves carry up to six on one): the second is listed after the first.
 const second=addGraph({mapPath:added.mapPath,name:'Second'},dir);
 const twice=fields(fields(fields(fields(container(fs.readFileSync(second.mapPath))).find(f=>f.id===5).data)[0].data).filter(f=>f.id===6)[1].data).find(f=>f.id===13);
 assert.equal(fields(twice.data).length,2,'both graphs are named in component 3');
 assert.throws(()=>addGraph({mapPath:blankFile,attachTo:'nobody'},dir),{code:'ENTITY_NOT_FOUND'});
 const stub=path.join(dir,'stub.gil');fs.writeFileSync(stub,Buffer.alloc(89));
 assert.throws(()=>listPrefabs({mapPath:stub}),{code:'SAVE_NOT_WRITTEN'});
}finally{fs.rmSync(dir,{recursive:true,force:true});}
// health: the combat attributes of the target dummy 坏坏法师靶 in the official sample 命中与受击 (300), byte for byte.
 {
  const hitFile=path.join(path.dirname(fileURLToPath(import.meta.url)),'..','knowledge','samples','gil'),hit=path.join(hitFile,fs.readdirSync(hitFile).find(f=>f.startsWith('mhsdgyi53pz0_')));
  const entriesOf=file=>fields(fields(container(fs.readFileSync(file))).find(f=>f.id===4).data).filter(f=>f.id===1&&f.wire===2).map(f=>f.data);
  const numberOf=(b,id)=>Number(fields(b).find(f=>f.id===id&&f.wire===0)?.value),attributes=e=>fields(e).filter(f=>f.id===7&&f.wire===2).map(f=>f.data).find(b=>numberOf(b,1)===7);
  const dummy=entriesOf(hit).find(e=>numberOf(e,2)===20001266);
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-health-'));
  try{
   const tough=addPrefab({mapPath:hit,asset:20001266,name:'dummy of 300',health:300,outputName:'with-dummy'},tmp);
   assert.equal(tough.health,300);
   assert.ok(attributes(entriesOf(tough.mapPath).find(e=>numberOf(e,1)===tough.prefabId)).equals(attributes(dummy)),'the combat attributes differ from the official target dummy');
   assert.throws(()=>addPrefab({mapPath:hit,asset:20001266,name:'x',health:5,drop:{item:'none'}},tmp),e=>e.code==='INVALID_DROP');
  }finally{fs.rmSync(tmp,{recursive:true,force:true});}
 }
// scene_update_prefab: a prefab changed in place is, byte for byte, the prefab that would have been made that way.
 {
  const sampleDir=path.join(path.dirname(fileURLToPath(import.meta.url)),'..','knowledge','samples','gil'),hit=path.join(sampleDir,fs.readdirSync(sampleDir).find(f=>f.startsWith('mhsdgyi53pz0_')));
  const entriesOf=file=>fields(fields(container(fs.readFileSync(file))).find(f=>f.id===4).data).filter(f=>f.id===1&&f.wire===2).map(f=>f.data);
  const numberOf=(b,id)=>Number(fields(b).find(f=>f.id===id&&f.wire===0)?.value),entry=(made)=>entriesOf(made.mapPath).find(e=>numberOf(e,1)===made.prefabId);
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-update-'));
  try{
   const plain=addPrefab({mapPath:hit,asset:20001266,name:'post',scale:1,outputName:'plain'},tmp);
   const wanted=addPrefab({mapPath:hit,asset:20001266,name:'post',scale:[2,3,0.5],health:300,outputName:'wanted'},tmp);
   const changed=updatePrefab({mapPath:plain.mapPath,prefab:'post',scale:[2,3,0.5],health:300,outputName:'changed'},tmp);
   assert.equal(changed.prefabId,plain.prefabId);
   assert.deepEqual([changed.before.scale,changed.scale],[[1,1,1],[2,3,0.5]]);
   assert.ok(entry(changed).equals(entry(wanted)),'a rescaled prefab differs from one made at that scale');
   assert.equal(fs.readFileSync(changed.mapPath).length,fs.readFileSync(wanted.mapPath).length);
   const stall=addPrefab({mapPath:hit,asset:20001125,name:'post',scale:1,outputName:'stall'},tmp);
   const swapped=updatePrefab({mapPath:plain.mapPath,prefab:plain.prefabId,asset:20001125,outputName:'swapped'},tmp);
   assert.deepEqual([swapped.before.assetId,swapped.assetId],[20001266,20001125]);
   assert.ok(entry(swapped).equals(entry(stall)),'a prefab given another asset differs from one made of that asset');
   assert.throws(()=>updatePrefab({mapPath:plain.mapPath,prefab:'nobody',scale:2},tmp),e=>e.code==='PREFAB_NOT_FOUND');
   assert.throws(()=>updatePrefab({mapPath:plain.mapPath,prefab:'post'},tmp),e=>e.code==='NOTHING_TO_CHANGE');
   assert.throws(()=>updatePrefab({mapPath:plain.mapPath,prefab:'post',asset:30002003},tmp),e=>e.code==='NOT_AN_OBJECT');
  }finally{fs.rmSync(tmp,{recursive:true,force:true});}
 }
 console.log(JSON.stringify({ok:true}));
