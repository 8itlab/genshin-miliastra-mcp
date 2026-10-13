import fs from 'node:fs';
import {createHash} from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import {container,fields,field,one,replace,wrap,varint} from './scene/wire.mjs';
import {findAsset,presetStatusOf} from './scene/assets.mjs';
import {animationsOf,animationsMayGoOn} from './scene/media.mjs';
import {fail} from './adapter.mjs';
import {checkClient,luaSyntaxError} from './client-check.mjs';
import {imageIdKnown} from './scene/images.mjs';

// Reading and patching saves between “import the scene” and “build the graph”. Nothing here touches the
// official save in place: every change is written to a new file under <workspace>/scenes/saves, which
// write_graphs and playtest_start accept as mapPath.

// The save the editor wrote most recently. After scene_import_assets (it presses Ctrl+S) this is the open save.
export function newestOfficialSave(){
  const base=path.join(os.homedir(),'AppData','LocalLow','miHoYo');let best=null;
  for(const game of ['原神','Genshin Impact']){
    const local=path.join(base,game,'BeyondLocal');if(!fs.existsSync(local))continue;
    for(const account of fs.readdirSync(local)){
      const levels=path.join(local,account,'Beyond_Local_Save_Level');if(!fs.existsSync(levels))continue;
      for(const id of fs.readdirSync(levels)){
        const file=path.join(levels,id,id+'.gil');if(!fs.existsSync(file))continue;
        const at=fs.statSync(file).mtimeMs;if(!best||at>best.at)best={file,at};
      }
    }
  }
  return best?.file||null;
}
function resolve(mapPath){
  const file=mapPath||newestOfficialSave();
  if(!file)fail('SAVE_NOT_FOUND','No official save was found. Give mapPath.');
  if(path.extname(file).toLowerCase()!=='.gil'||!fs.existsSync(file))fail('INVALID_MAP_PATH','mapPath must be an existing .gil save.',{mapPath:file});
  // A save that was just created in the game is a stub of under a hundred bytes until the editor writes it.
  if(fs.statSync(file).size<100)fail('SAVE_NOT_WRITTEN','This save has not been written by the editor yet: a newly created save stays an empty stub until something in it is changed and saved. Open it in the editor, change any setting and press Ctrl+S.',{mapPath:file,bytes:fs.statSync(file).size});
  return file;
}
const kindOf=b=>Number(fields(b).find(f=>f.id===1&&f.wire===0)?.value);
// A creature is known by its behaviour block (30) or, a complex creature (复杂造物), by its decision-graph block (80),
// which it has instead.
const isCreature=props=>props.includes(30)||props.includes(80);
const entries=root=>fields(one(root,5)).filter(f=>f.id===1&&f.wire===2);
const float=(b,id)=>{const f=fields(b).find(x=>x.id===id&&x.wire===5);return f?Math.round(f.data.readFloatLE(0)*1000)/1000:0;};
function describe(data){
  const parts=fields(data),out={guid:Number(parts.find(f=>f.id===1&&f.wire===0)?.value),name:'',assetId:null,position:null,createdAtStart:true,staticUnit:false,props:[]};
  const template=parts.find(f=>f.id===2&&f.wire===2);if(template)out.assetId=Number(fields(template.data).find(f=>f.id===1)?.value??0)||null;
  for(const f of parts){
    if(f.wire!==2)continue;
    const kind=f.id===5||f.id===6?kindOf(f.data):null;
    if(f.id===5){
      out.props.push(kind);
      if(kind===1){try{const body=one(f.data,11);out.name=one(body,1).toString('utf8');out.staticUnit=fields(body).some(x=>x.id===2&&x.wire===0&&Number(x.value)===1);}catch{}}
    }
    if(f.id===6&&kind===1){try{const at=one(one(f.data,11),1);out.position=[float(at,1),float(at,2),float(at,3)];}catch{}}
    if(f.id===6&&kind===4){try{out.createdAtStart=one(f.data,14).length>0;}catch{}}
  }
  return out;
}
// Entities placed in the scene, by name. The importer assigns new GUIDs, so graphs must use the GUIDs read here.
export function listSceneEntities({mapPath,namePrefix='',limit=500}){
  const file=resolve(mapPath),all=entries(container(fs.readFileSync(file))).map(e=>describe(e.data)).filter(e=>e.name.startsWith(namePrefix));
  return {mapPath:file,total:all.length,truncated:all.length>limit||undefined,
    entities:all.slice(0,limit).map(e=>({name:e.name,guid:e.guid,assetId:e.assetId,position:e.position,createdAtStart:e.createdAtStart,kind:isCreature(e.props)?'creature':e.staticUnit?'static':'dynamic'})),
    note:'In a node graph: f.queryEntityByGuid(new guid(GUID)), and f.createEntity(new guid(GUID), [] as bigint[]) for pieces with createdAtStart false. Use this file (or a patched copy) as mapPath for write_graphs so the graph is built on the save that holds these entities.'};
}
// Takes placed entities out of a save: their records in section 5 and the line each has in the library (section 6: a
// tab lists what belongs to it as {1: code, 2: id}; placed things are in the tab of kind 3 under code 200). A save
// names the GUID of a placed thing in these two places and nowhere else (checked on saves written by the editor). The entities every map has by itself (the stage entity, the
// player slots, the character) are never touched. A graph that looks one of the removed things up by its GUID finds
// nothing afterwards: that is for the caller to mend.
const BUILT_IN_FROM=1086324737;
export function removeEntities({mapPath,names,namePrefix,outputName},workspace){
  if((names===undefined)===(namePrefix===undefined))fail('INVALID_TARGET','Give names (a list of entity names, each exactly) or namePrefix, one of the two.');
  if(namePrefix!==undefined&&namePrefix.length<2)fail('INVALID_TARGET','namePrefix has to be at least two characters, so that not everything goes by mistake.',{namePrefix});
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  const wanted=e=>names?names.includes(e.name):e.name.startsWith(namePrefix),all=entries(root).map(e=>describe(e.data));
  const kept=all.filter(e=>wanted(e)&&e.guid>=BUILT_IN_FROM),gone=all.filter(e=>wanted(e)&&e.guid<BUILT_IN_FROM);
  if(kept.length)fail('BUILT_IN_ENTITY','These entities belong to every map (the stage entity, the player slots, the character) and cannot be removed.',{names:[...new Set(kept.map(e=>e.name))]});
  const missing=(names||[]).filter(n=>!gone.some(e=>e.name===n));
  if(!gone.length||missing.length)fail('ENTITY_NOT_FOUND','Nothing placed in the save has this name. Names are listed by scene_list_entities.',names?{missing}:{namePrefix});
  const guids=new Set(gone.map(e=>e.guid));
  root=replace(root,5,2,Buffer.concat(fields(one(root,5)).filter(f=>!(f.id===1&&f.wire===2&&guids.has(describe(f.data).guid))).map(f=>f.raw)));
  let unlisted=0;
  // Placed entities are listed as {1: 200, 2: guid} in the tab of kind 3. Other tabs list other things under numbers
  // that can be the same (the first unit status of a save has the id the first placed thing has as its GUID).
  const listed=f=>f.id===5&&f.wire===2&&varintOf(f.data,1)===200&&guids.has(varintOf(f.data,2));
  root=replace(root,6,2,Buffer.concat(fields(one(root,6)).map(tab=>tab.id!==1||tab.wire!==2||kindOf(tab.data)!==3?tab.raw:field(1,2,Buffer.concat(fields(tab.data).map(part=>{
    if(part.id!==3||part.wire!==2)return part.raw;
    const inner=fields(part.data);unlisted+=inner.filter(listed).length;
    return field(3,2,Buffer.concat(inner.filter(f=>!listed(f)).map(f=>f.raw)));
  }))))));
  const out=output(workspace,file,outputName,'-removed');fs.writeFileSync(out,wrap(bytes,root));
  return {mapPath:out,source:file,removed:gone.length,names:[...new Set(gone.map(e=>e.name))].slice(0,60),unlisted,left:entries(root).length,
    next:'Use mapPath in later calls. The things are gone from this copy; the official save they were imported into still has them, so go on from this copy and do not import the scene again. A graph that names one of them by its GUID finds nothing now.'};
}
// Without an outputName the new save is named after the one it was made from plus what was done to it. A chain of
// thirty steps made names so long that Windows refused the path (seen in a blind test, 2026-10-12): past sixty
// characters the name is cut to its beginning and a short hash of the whole.
function output(workspace,file,outputName,suffix){
  const dir=path.join(workspace,'scenes','saves');fs.mkdirSync(dir,{recursive:true});
  let name=outputName||path.basename(file,'.gil')+suffix;
  if(!outputName&&name.length>60)name=name.slice(0,24)+'-'+createHash('sha1').update(name).digest('hex').slice(0,8)+suffix;
  return path.join(dir,name+'.gil');
}
// Camera templates (主镜头管理) are records in section 18: {1: id, 2: {1: name, 2: distance, 3: field of view in degrees, 6: distance again, ...}}.
// Fields 2 and 6 hold the same number in every save seen so far, so both are written. Fields 15..18 are the limits of the
// player's own camera turning: yaw min, yaw max, pitch min, pitch max, in degrees (-180, 180, -89, 89 in a new template).
// Other fields are left as they are.
// The mode of a template is field 12: none is the classic camera (the player turns it with the mouse), 2 the 2.5D camera
// (2.5D镜头), whose view cannot be turned: it looks from one horizontal angle, field 20 (left out at 0), at the pitch
// in 17 and 18 (the same number twice), with 5 and 6 the nearest and the farthest the player may zoom, 13: 1 (视点跟随旋转),
// 14: 0.8 and 19: 1 when the camera ignores what stands between it and the character (忽略镜头碰撞). Read from a template
// switched to that mode by hand on 2026-10-13 (tests/fixtures/editor-2026-10-13-camera.gil and -camera-fixed.gil).
const f32=n=>{const b=Buffer.alloc(4);b.writeFloatLE(n);return b;};
function cameraRecords(root){
  const sections=fields(root).filter(f=>f.id===18&&f.wire===2);
  if(sections.length!==1)fail('NO_CAMERA_TEMPLATE','The save has no camera template. Create one in the editor (主镜头管理) first.');
  return fields(sections[0].data).filter(f=>f.id===1&&f.wire===2).map(f=>{
    const settings=one(f.data,2),num=id=>{const x=fields(settings).find(y=>y.id===id&&y.wire===5);return x?Math.round(x.data.readFloatLE(0)*1000)/1000:null;};
    const mode=fields(settings).find(y=>y.id===12&&y.wire===0),fixed=mode&&Number(mode.value)===2;
    return {raw:f,settings,cameraId:Number(one(f.data,1,0)),name:one(settings,1).toString('utf8'),distance:num(2),fieldOfView:num(3),yawRange:[num(15),num(16)],pitchRange:[num(17),num(18)],
      fixedView:fixed?{yaw:num(20)??0,pitch:num(17)??0,ignoreCollision:fields(settings).some(y=>y.id===19&&y.wire===0&&Number(y.value)===1)}:undefined};
  });
}
export function listCameras({mapPath}){
  const file=resolve(mapPath);
  return {mapPath:file,cameras:cameraRecords(container(fs.readFileSync(file))).map(({cameraId,name,distance,fieldOfView,yawRange,pitchRange,fixedView})=>({cameraId,name,distance,fieldOfView,yawRange,pitchRange,...(fixedView?{fixedView}:{})})),
    note:'distance is metres from the character; fieldOfView is the vertical angle in degrees. The picture shows about 2*distance*tan(fieldOfView/2) metres of height at the character. yawRange and pitchRange are the limits, in degrees, within which the player can turn the camera.'};
}
export function setCamera({mapPath,name,distance,fieldOfView,yawRange,pitchRange,fixedView,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file),root=container(bytes),records=cameraRecords(root);
  const wanted=name?records.filter(r=>r.name===name):records;
  if(wanted.length!==1)fail('CAMERA_NOT_FOUND',name?'No camera template with that name.':'The save has several camera templates; give name.',{known:records.map(r=>r.name)});
  if(distance===undefined&&fieldOfView===undefined&&!yawRange&&!pitchRange&&!fixedView)fail('NOTHING_TO_CHANGE','Give distance, fieldOfView, yawRange, pitchRange and/or fixedView.');
  if(fixedView&&(yawRange||pitchRange))fail('INVALID_RANGE','A fixed view has one yaw and one pitch: leave yawRange and pitchRange out.');
  for(const [range,label] of [[yawRange,'yawRange'],[pitchRange,'pitchRange']])if(range&&!(range[0]<=range[1]))fail('INVALID_RANGE',label+' must be [min, max] with min <= max.');
  const target=wanted[0];let settings=target.settings;
  if(distance!==undefined)for(const id of [2,6])settings=replace(settings,id,5,f32(distance));
  if(fieldOfView!==undefined)settings=replace(settings,3,5,f32(fieldOfView));
  if(yawRange){settings=replace(settings,15,5,f32(yawRange[0]));settings=replace(settings,16,5,f32(yawRange[1]));}
  if(pitchRange){settings=replace(settings,17,5,f32(pitchRange[0]));settings=replace(settings,18,5,f32(pitchRange[1]));}
  if(fixedView){
    // The 2.5D camera as the editor writes it, in the order of its fields; the zoom is held at the distance.
    const at=distance??target.distance,{yaw=0,pitch=45,ignoreCollision=true}=fixedView;
    const kept=fields(settings).filter(f=>![2,5,6,12,13,14,15,16,17,18,19,20].includes(f.id)).map(f=>({id:f.id,raw:f.raw}));
    const made=[[2,5,f32(at)],[5,5,f32(at)],[6,5,f32(at)],[12,0,2],[13,0,1],[14,5,f32(0.8)],[17,5,f32(pitch)],[18,5,f32(pitch)],...(ignoreCollision?[[19,0,1]]:[]),...(yaw?[[20,5,f32(yaw)]]:[])].map(([id,wire,value])=>({id,raw:field(id,wire,value)}));
    // (A stable sort: fields that repeat or share a number keep the order they had.)
    settings=Buffer.concat([...kept,...made].map((f,i)=>({...f,i})).sort((a,b)=>a.id-b.id||a.i-b.i).map(f=>f.raw));
  }
  const record=replace(target.raw.data,2,2,settings);
  const section=Buffer.concat(fields(one(root,18)).map(f=>f.id===1&&f.wire===2&&Number(one(f.data,1,0))===target.cameraId?field(1,2,record):f.raw));
  const out=output(workspace,file,outputName,'-camera');fs.writeFileSync(out,wrap(bytes,replace(root,18,2,section)));
  return {...listCameras({mapPath:out}),source:file,before:{distance:target.distance,fieldOfView:target.fieldOfView,yawRange:target.yawRange,pitchRange:target.pitchRange,...(target.fixedView?{fixedView:target.fixedView}:{})},
    next:'Use mapPath in later calls (write_graphs, editor_open_map, playtest_start). The official save was not changed. Look at a playtest screenshot to judge the framing.'};
}

// Prefabs (元件) are the entries of section 4: {1: prefab id, 2: asset id, 6: properties (kind 1 holds the name), 7: components
// (kind 1 is the transform: position, rotation, scale), 8: runtime records}. Section 6 is the editor's library, one record
// per tab kind: object prefabs are listed under kind 6 as {1: 100, 2: prefab id}, creature prefabs under kind 18.
// A node graph creates a prefab anywhere with f.createPrefab(prefabId, ...), and the entity comes out at the prefab's scale.
// A new object prefab is written from the entry the editor saved for a hand-made one (scene/object-prefab-seed.json).
const OBJECT_PREFAB_SEED=Buffer.from(JSON.parse(fs.readFileSync(new URL('./scene/object-prefab-seed.json',import.meta.url),'utf8')).entry,'hex');
const OBJECT_ID_MIN=0x40400000,OBJECT_ID_MAX=0x407fffff,CREATURE_ID_MIN=0x40800000,CREATURE_ID_MAX=0x408fffff;
const varintOf=(b,id)=>{const f=fields(b).find(x=>x.id===id&&x.wire===0);return f?Number(f.value):null;};
function prefabRecords(root){
  return fields(root).filter(f=>f.id===4&&f.wire===2).flatMap(s=>fields(s.data).filter(f=>f.id===1&&f.wire===2)).flatMap(f=>{
    const prefabId=varintOf(f.data,1),assetId=varintOf(f.data,2);
    if(!prefabId||assetId===null)return [];
    let name='',scale=null;
    for(const part of fields(f.data)){
      if(part.wire!==2)continue;
      try{
        if(part.id===6&&kindOf(part.data)===1)name=one(one(part.data,11),1).toString('utf8');
        if(part.id===7&&kindOf(part.data)===1){const body=fields(one(part.data,11)).find(x=>x.id===3&&x.wire===2);scale=body?[float(body.data,1),float(body.data,2),float(body.data,3)]:null;}
      }catch{}
    }
    const kind=prefabId>=OBJECT_ID_MIN&&prefabId<=OBJECT_ID_MAX?'object':prefabId>=CREATURE_ID_MIN&&prefabId<=CREATURE_ID_MAX?'creature':'other';
    return [{prefabId,name,assetId,assetName:findAsset(assetId)?.name??null,kind,scale}];
  });
}
export function listPrefabs({mapPath}){
  const file=resolve(mapPath);
  return {mapPath:file,prefabs:prefabRecords(container(fs.readFileSync(file))).filter(p=>p.kind!=='other'),
    note:'A node graph creates one anywhere with f.createPrefab(prefabId, position, rotation, ownerEntity, false, 1, [] as bigint[]) and finds them with f.getEntitiesWithSpecifiedPrefabOnTheField(prefabId). The entity has the prefab\'s scale. scene_add_prefab makes an object prefab of any asset at any scale.'};
}
// A drop (掉落物) is an object prefab of its own kind: what lies on the ground and is picked up into the backpack. Read
// from the official sample 掉落物、道具、背包 (禽肉): the entry has {9: 2}, property 38 is {48: {1: 1.0}}, component 7 has
// {1: 1000.0, 4: 1} and no field 2, there is no record of kind 6, and the drop component (general component 36) says
// what it gives: {47: {1: 1, 3: {501: 20000}, 4: 1, 7: {1: {1: {1: 1, 2: item id}, 2: amount}}, 8: {11: {1: {},
// 2: {1: 1.0, 2: 1.0, 3: 1.0}, 3: {}}, 502: "区域1", 503: 1}}}. The library lists drops in the tab of kind 21 as
// {1: 3300, 2: prefab id}. The other blocks of the sample are those of an older editor, so this is not byte for byte.
const dropComponent=({itemId,amount,pickupSize=[1,1,1]})=>record(36,Buffer.concat([field(1,0,1),field(3,2,field(501,0,20000)),field(4,0,1),field(7,2,field(1,2,Buffer.concat([field(1,2,Buffer.concat([field(1,0,1),field(2,0,itemId)])),field(2,0,amount)]))),
  field(8,2,Buffer.concat([field(11,2,Buffer.concat([field(1,2,Buffer.alloc(0)),field(2,2,Buffer.concat(pickupSize.map((n,i)=>field(i+1,5,f32(n))))),field(3,2,Buffer.alloc(0))])),field(502,2,Buffer.from('区域1','utf8')),field(503,0,1)]))]));
// Combat attributes are component 7, {17: {1: base health, 2: base attack, 3: 500, 4: 1 on things that cannot be hurt
// (levers, tools, drops), 5: level, ...}}: an object prefab has health 10 (one hit of the official sword attack breaks it),
// the character 10000, the target dummy of the official sample 命中与受击 300.
const withHealth=(component,health)=>Buffer.concat([field(1,0,7),field(17,2,Buffer.concat(fields(one(component,17)).map(x=>x.id===1&&x.wire===5?field(1,5,f32(health)):x.raw)))]);
export function addPrefab({mapPath,asset,fromEntity,name,scale,presetStatusValue,presetStatusId,drop,health,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  if((asset===undefined)===(fromEntity===undefined))fail('INVALID_PREFAB_SOURCE','Give either asset (an object asset) or fromEntity (the name of something placed in the save).');
  const existing=prefabRecords(root),sections=fields(root),library=sections.filter(f=>f.id===6&&f.wire===2);
  if(sections.filter(f=>f.id===4&&f.wire===2).length!==1||library.length!==1)fail('UNSUPPORTED_SAVE','The save does not have the prefab sections this tool knows.');
  const vec=v=>Buffer.concat(v.map((n,i)=>n?field(i+1,5,f32(n)):Buffer.alloc(0)));
  const triple=v=>{const t=typeof v==='number'?[v,v,v]:v;if(!Array.isArray(t)||t.length!==3||!t.every(n=>Number.isFinite(n)&&n>0&&n<=100))fail('INVALID_SCALE','scale is a positive number or [x, y, z].',{scale:v});return t;};
  const transform=size=>Buffer.concat([field(1,0,1),field(11,2,Buffer.concat([field(1,2,Buffer.alloc(0)),field(2,2,Buffer.alloc(0)),field(3,2,vec(size)),field(501,0,4294967295)]))]);
  const nameProp=label=>Buffer.concat([field(1,0,1),field(11,2,field(1,2,Buffer.from(label,'utf8')))]);
  let assetId,assetName,size,creature=false,complex=false,body,preset=null,dropped=null;
  if(fromEntity!==undefined){
    if(presetStatusValue!==undefined||presetStatusId!==undefined)fail('INVALID_PRESET_STATUS','presetStatusValue and presetStatusId go with asset; a prefab made from a placed entity keeps what that entity has.',{fromEntity});
    if(drop)fail('INVALID_DROP','drop goes with asset: a drop is made from an object asset.',{fromEntity});
    // A placed entity and a prefab hold the same blocks one field number apart (entity: 5 properties, 6 components,
    // 7 records; prefab: 6, 7, 8). An entity that went through the editor carries every block the editor wants, which is
    // why this works for creatures too. Properties 19 and 52 exist only on placed entities.
    const matches=entries(root).filter(e=>describe(e.data).name===fromEntity);
    if(matches.length!==1)fail('ENTITY_NOT_FOUND',matches.length?'Several placed entities have this name.':'Nothing placed in the save has this name. Names are listed by scene_list_entities.',{fromEntity});
    const entity=matches[0].data,info=describe(entity);
    if(info.staticUnit)fail('STATIC_ENTITY','A static piece cannot be made into a prefab: place it with createAtStart false (a dynamic piece) or give asset instead.',{fromEntity});
    assetId=info.assetId;creature=isCreature(info.props);complex=info.props.includes(80);
    let own=[1,1,1];
    for(const f of fields(entity))if(f.id===6&&f.wire===2&&kindOf(f.data)===1){try{const b=fields(one(f.data,11)).find(x=>x.id===3&&x.wire===2);if(b)own=[float(b.data,1),float(b.data,2),float(b.data,3)];}catch{}}
    size=scale===undefined?own:triple(scale);
    body=label=>Buffer.concat(fields(entity).flatMap(f=>{
      if(f.wire!==2||![5,6,7].includes(f.id))return [];
      const kind=kindOf(f.data);
      if(f.id===5)return [19,52].includes(kind)?[]:[field(6,2,kind===1?nameProp(label):f.data)];
      // Component 4 is “初始创建”; a prefab is written as created, like the ones the editor saves.
      if(f.id===6)return [field(7,2,kind===1?transform(size):kind===4?Buffer.concat([field(1,0,4),field(14,2,field(1,0,1))]):kind===7&&health!==undefined?withHealth(f.data,health):f.data)];
      return [field(8,2,f.data)];
    }));
  }else{
    const found=findAsset(asset);
    if(!found)fail('UNKNOWN_ASSET','No asset with that id or unique name. Use an id from scene_search_assets.',{asset});
    if(found.group.startsWith('怪物'))fail('NOT_AN_OBJECT','A creature prefab is made from a placed creature: put one in the scene (scene_build_blocks, createAtStart false), import it, then call this with fromEntity.',{asset:found.id,name:found.name});
    assetId=found.id;size=triple(scale??1);
    // Mechanism assets carry their preset status in the model component, {1: 2, 12: {2: {1: status id, 2: starting value}}}
    // (the editor writes it on every prefab of such an asset; read from the official samples, e.g. the chests of 碰撞与交互).
    preset=presetStatusOf(assetId);
    // presetStatusId registers a status id that is not in the table: for finding out which ids an asset really has.
    if(presetStatusId!==undefined)preset={statusId:presetStatusId,note:preset&&preset.statusId===presetStatusId?preset.note:'given by the caller, not from the table of verified ids'};
    if(presetStatusValue!==undefined&&!preset)fail('INVALID_PRESET_STATUS','No preset status is known for this asset. scene_search_assets shows presetStatus on the assets that have one.',{asset:assetId});
    const model=preset&&Buffer.concat([field(1,0,2),field(12,2,field(2,2,Buffer.concat([field(1,0,preset.statusId),presetStatusValue?field(2,0,presetStatusValue):Buffer.alloc(0)])))]);
    if(drop&&health!==undefined)fail('INVALID_DROP','A drop cannot be hurt; health does not go with drop.',{drop,health});
    const given=drop&&{itemId:configIdOf(root,9,'item',drop.item),amount:drop.amount??1,...(drop.pickupSize!==undefined?{pickupSize:typeof drop.pickupSize==='number'?[drop.pickupSize,drop.pickupSize,drop.pickupSize]:drop.pickupSize}:{})};
    if(drop)dropped=given;
    body=label=>Buffer.concat([...fields(OBJECT_PREFAB_SEED).flatMap(f=>{
      if(f.wire===0)return [];
      if(f.id===6&&kindOf(f.data)===1)return [field(6,2,nameProp(label))];
      if(f.id===7&&kindOf(f.data)===1)return [field(7,2,transform(size))];
      if(f.id===7&&kindOf(f.data)===2&&model)return [field(7,2,model)];
      if(f.id===7&&kindOf(f.data)===7&&health!==undefined)return [field(7,2,withHealth(f.data,health))];
      if(given){
        if(f.id===6&&kindOf(f.data)===38)return [field(6,2,Buffer.concat([field(1,0,38),field(48,2,field(1,5,f32(1)))]))];
        if(f.id===7&&kindOf(f.data)===7)return [field(7,2,Buffer.concat([field(1,0,7),field(17,2,Buffer.concat(fields(one(f.data,17)).flatMap(x=>x.id===1?[field(1,5,f32(1000))]:x.id===2?[]:x.id===5?[field(4,0,1),x.raw]:[x.raw])))]))];
        if(f.id===8&&kindOf(f.data)===6)return [];
      }
      return [f.raw];
    }),...(given?[field(8,2,dropComponent(given))]:[])]);
  }
  const found=findAsset(assetId);assetName=found?.name??null;
  const label=name||(fromEntity??assetName)+'_'+size.join('x');
  if(existing.some(p=>p.name===label))fail('DUPLICATE_PREFAB_NAME','The save already has a prefab with this name.',{name:label,prefabId:existing.find(p=>p.name===label).prefabId});
  const tabKind=creature?18:6,tabs=fields(library[0].data),tab=tabs.filter(t=>t.id===1&&t.wire===2&&kindOf(t.data)===tabKind);
  if(!dropped&&tab.length!==1)fail('UNSUPPORTED_SAVE','The save has no library tab for this kind of prefab.');
  // A new id in the range of its kind that occurs nowhere in the save, neither as a prefab nor as an entity.
  const [low,high]=creature?[CREATURE_ID_MIN,CREATURE_ID_MAX]:[OBJECT_ID_MIN,OBJECT_ID_MAX];
  let prefabId=Math.max(low,...existing.filter(p=>p.prefabId>=low&&p.prefabId<=high).map(p=>p.prefabId))+1;
  while(root.includes(varint(prefabId)))prefabId++;
  if(prefabId>high)fail('NO_FREE_ID','No free prefab id.');
  // {9: 2} marks a drop and {9: 4} a complex creature (复杂造物): without it the editor shows the prefab as a basic
  // creature and refuses the playtest (元件设置错误).
  const entry=Buffer.concat([field(1,0,prefabId),field(2,0,assetId),body(label),...(dropped?[field(9,0,2)]:complex?[field(9,0,4)]:[]),field(10,0,1)]);
  root=replace(root,4,2,Buffer.concat([one(root,4),field(1,2,entry)]));
  if(dropped)root=listInLibrary(root,21,3300,prefabId);
  else{
    const listed=field(5,2,Buffer.concat([field(1,0,creature?2700:100),field(2,0,prefabId)]));
    const newTab=Buffer.concat(fields(tab[0].data).map(f=>f.id===3&&f.wire===2?field(3,2,Buffer.concat([f.data,listed])):f.raw));
    root=replace(root,6,2,Buffer.concat(tabs.map(t=>t===tab[0]?field(1,2,newTab):t.raw)));
  }
  const out=output(workspace,file,outputName,'-prefab');fs.writeFileSync(out,wrap(bytes,root));
  return {mapPath:out,source:file,prefabId,name:label,kind:creature?'creature':dropped?'drop':'object',assetId,assetName,scale:size,...(dropped?{gives:dropped}:{}),...(health!==undefined?{health}:{}),
    size:found?.size?found.size.map((n,i)=>Math.round(n*size[i]*1000)/1000):null,
    ...(preset?{presetStatus:{statusId:preset.statusId,startsAt:presetStatusValue??0,used:preset.used??null,note:preset.note}}:{}),
    next:'Use mapPath in later calls. In the graph: f.createPrefab('+prefabId+', position, rotation, ownerEntity, false, 1, [] as bigint[])'+(creature?'; a created creature is in the creature faction until f.modifyEntityFaction puts it in another.':'.')+(preset?' This asset has a built-in animation: f.setPresetStatus(entity, '+preset.statusId+'n, 1n) plays it (0n puts it back where the samples do that), and whenPresetStatusChanges fires on the entity.':'')+' Several prefabs: call this again with the returned mapPath.'};
}

// Changing a prefab that exists: its scale, the asset it shows, its health. Everything else of the entry stays as it is
// (components, the graphs attached, the library listing, the id a graph creates it by), which is the point: a wall that
// turned out too thin is made thicker, or given another model, without making the prefab again and hanging its graphs
// and components on the new one. The fields are the ones scene_add_prefab writes: {2: asset id}, the scale in the
// transform component (kind 1, {11: {3: {1: x, 2: y, 3: z}}}), the base health in the combat attributes (kind 7).
export function updatePrefab({mapPath,prefab,scale,asset,health,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  if(scale===undefined&&asset===undefined&&health===undefined)fail('NOTHING_TO_CHANGE','Give scale, asset or health.');
  const all=prefabRecords(root).filter(p=>p.kind!=='other'),hits=all.filter(p=>typeof prefab==='number'?p.prefabId===prefab:p.name===prefab);
  if(hits.length!==1)fail('PREFAB_NOT_FOUND',hits.length?'Several prefabs have this name; give the prefab id.':'No prefab with this name or id. scene_list_prefabs lists them.',{prefab,prefabs:all.map(p=>p.name)});
  const target=hits[0];
  if(fields(root).filter(f=>f.id===4&&f.wire===2).length!==1)fail('UNSUPPORTED_SAVE','The save does not have the prefab sections this tool knows.');
  const triple=v=>{const t=typeof v==='number'?[v,v,v]:v;if(!Array.isArray(t)||t.length!==3||!t.every(n=>Number.isFinite(n)&&n>0&&n<=100))fail('INVALID_SCALE','scale is a positive number or [x, y, z].',{scale:v});return t;};
  const size=scale===undefined?null:triple(scale),vec=v=>Buffer.concat(v.map((n,i)=>n?field(i+1,5,f32(n)):Buffer.alloc(0)));
  let found=null;
  if(asset!==undefined){
    found=findAsset(asset);
    if(!found)fail('UNKNOWN_ASSET','No asset with that id or unique name. Use an id from scene_search_assets.',{asset});
    if(target.kind!=='object'||found.group.startsWith('怪物'))fail('NOT_AN_OBJECT','Only an object prefab can be given another asset, and only an object asset: a creature prefab carries the behaviour and animations of its own creature.',{prefab:target.name,kind:target.kind,asset:found.id});
    // A mechanism asset names its preset status in the model component; swapping to or from one would leave the wrong
    // status (or none) there, which the editor refuses before a playtest.
    if(presetStatusOf(found.id)||presetStatusOf(target.assetId))fail('PRESET_STATUS_ASSET','A mechanism asset (a chest, a lever, a door: one with a preset status) is not swapped in or out this way: make that prefab with scene_add_prefab.',{from:target.assetId,to:found.id});
  }
  let changed=0;
  const section=Buffer.concat(fields(one(root,4)).map(entry=>{
    if(!(entry.id===1&&entry.wire===2&&varintOf(entry.data,1)===target.prefabId))return entry.raw;
    changed++;
    let hadHealth=false;
    const next=Buffer.concat(fields(entry.data).map(part=>{
      if(part.id===2&&part.wire===0&&found)return field(2,0,found.id);
      if(part.id===7&&part.wire===2&&kindOf(part.data)===1&&size){
        const inner=fields(one(part.data,11)),at=inner.findIndex(x=>x.id===3&&x.wire===2);
        const body=at>=0?inner.map((x,i)=>i===at?field(3,2,vec(size)):x.raw):inner.flatMap(x=>x.id===501?[field(3,2,vec(size)),x.raw]:[x.raw]);
        return field(7,2,Buffer.concat(fields(part.data).map(x=>x.id===11&&x.wire===2?field(11,2,Buffer.concat(body)):x.raw)));
      }
      if(part.id===7&&part.wire===2&&kindOf(part.data)===7&&health!==undefined){hadHealth=true;return field(7,2,withHealth(part.data,health));}
      return part.raw;
    }));
    if(health!==undefined&&!hadHealth)fail('NO_COMBAT_ATTRIBUTES','This prefab has no combat attributes to hold a health.',{prefab:target.name});
    return field(1,2,next);
  }));
  if(changed!==1)fail('PREFAB_NOT_FOUND','The prefab entry could not be found in the save.',{prefab});
  root=replace(root,4,2,section);
  const out=output(workspace,file,outputName,'-prefab');fs.writeFileSync(out,wrap(bytes,root));
  const now=prefabRecords(container(fs.readFileSync(out))).find(p=>p.prefabId===target.prefabId),shown=findAsset(now.assetId);
  return {mapPath:out,source:file,prefabId:target.prefabId,name:target.name,kind:target.kind,
    before:{assetId:target.assetId,assetName:target.assetName,scale:target.scale},assetId:now.assetId,assetName:now.assetName,scale:now.scale,...(health!==undefined?{health}:{}),
    size:shown?.size&&now.scale?shown.size.map((n,i)=>Math.round(n*now.scale[i]*1000)/1000):null,
    next:'Use mapPath in later calls. The prefab id, its components and its graphs are the same, so graphs that create it need no change. Areas of its triggers and option tabs were given in metres of the prefab at scale 1 and grow with the scale: look at them again (scene_list_components) after a change of scale.'};
}

// Factions (阵营) are part of the level settings, section 11 field 2: one record per faction {1: name, 2: faction id,
// 3: icon, 4: the player slots that start in it, 12: the ids of the factions it is friendly to, 13: the ids of the
// factions it is hostile to (both packed)}. Towards every other faction a faction is either 友善 or 敌对. A new map has
// three factions, 初始玩家阵营 1, 初始物件阵营 2, 初始造物阵营 3, and writes neither list: that means hostile to all
// (the editor shows 敌对 everywhere). The editor writes the lists for every faction once any relation is changed
// (compared saves, CN 7.1, 2026-10-10). Creatures attack whatever their faction is hostile to and has combat
// attributes, which includes objects created at run time.
function packed(b){const out=[];let p=0;while(p<b.length){let n=0,shift=0;for(;;){const v=b[p++];n+=(v&127)*2**shift;shift+=7;if(!(v&128))break;}out.push(n);}return out;}
function factionRecords(root){
  const settings=fields(root).filter(f=>f.id===11&&f.wire===2);
  if(settings.length!==1)fail('UNSUPPORTED_SAVE','The save has no level settings section.');
  const lists=fields(settings[0].data).filter(f=>f.id===2&&f.wire===2);
  if(lists.length!==1)fail('UNSUPPORTED_SAVE','The save has no faction list.');
  const state={settings:settings[0].data,list:lists[0].data,records:fields(lists[0].data).filter(f=>f.id===1&&f.wire===2).map(f=>{
    const parts=fields(f.data),bytes=id=>parts.find(x=>x.id===id&&x.wire===2)?.data;
    return {raw:f,factionId:varintOf(f.data,2),name:bytes(1)?.toString('utf8')??'',written:Boolean(bytes(12)||bytes(13)),hostileTo:bytes(13)?packed(bytes(13)):[],friendlyTo:bytes(12)?packed(bytes(12)):[],playerSlots:bytes(4)?packed(bytes(4)):[]};
  })};
  // No list at all is the state of a new map: hostile to every other faction.
  for(const r of state.records)if(!r.written)r.hostileTo=state.records.map(o=>o.factionId).filter(id=>id!==r.factionId);
  return state;
}
const factionNote='Creatures attack entities of a faction hostile to their own that have combat attributes: players, other creatures, and also objects (anything a graph creates with createPrefab or createEntity is in the object faction unless its faction is changed). A graph reads a faction with f.queryEntityFaction(entity) and puts an entity into one with f.modifyEntityFaction(entity, faction).';
export function listFactions({mapPath}){
  const file=resolve(mapPath);
  return {mapPath:file,factions:factionRecords(container(fs.readFileSync(file))).records.map(({factionId,name,hostileTo,friendlyTo,playerSlots})=>({factionId,name,hostileTo,friendlyTo,playerSlots})),note:factionNote};
}
export function setFactionHostility({mapPath,hostilePairs,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file),root=container(bytes),state=factionRecords(root),ids=state.records.map(r=>r.factionId);
  for(const pair of hostilePairs)if(pair[0]===pair[1]||!pair.every(id=>ids.includes(id)))fail('UNKNOWN_FACTION','Each pair names two different factions of this save.',{pair,known:state.records.map(r=>({factionId:r.factionId,name:r.name}))});
  const wanted=id=>[...new Set(hostilePairs.filter(p=>p.includes(id)).map(p=>p[0]===id?p[1]:p[0]))].sort((a,b)=>a-b);
  const list=Buffer.concat(fields(state.list).map(f=>{
    if(f.id!==1||f.wire!==2)return f.raw;
    // Both lists are written, friendly (12) before hostile (13), as the editor does; an empty list is left out.
    const own=varintOf(f.data,2),hostile=wanted(own),friendly=ids.filter(id=>id!==own&&!hostile.includes(id)).sort((a,b)=>a-b);
    const list=(id,members)=>members.length?[{id,raw:field(id,2,Buffer.concat(members.map(varint)))}]:[];
    const parts=[...fields(f.data).filter(x=>x.id!==12&&x.id!==13),...list(12,friendly),...list(13,hostile)];
    return field(1,2,Buffer.concat(parts.map((x,i)=>({x,i})).sort((a,b)=>a.x.id-b.x.id||a.i-b.i).map(e=>e.x.raw)));
  }));
  const out=output(workspace,file,outputName,'-factions');
  fs.writeFileSync(out,wrap(bytes,replace(root,11,2,replace(state.settings,2,2,list))));
  return {...listFactions({mapPath:out}),source:file,before:state.records.map(({factionId,name,hostileTo,friendlyTo})=>({factionId,name,hostileTo,friendlyTo})),
    next:'Use mapPath in later calls. Every pair not listed is now friendly (友善): neither side attacks the other.'};
}

// Level settings (关卡设置 → 基础) are section 11 field 1. Fields read from the editor by changing one setting and
// comparing saves (CN 7.1, 2026-10-10): 13 = 仇恨类型 (absent = 默认, 1 = 自定义), 14 = 仇恨转移倍率, 15 = 负载需求档位
// (2 = 低, the state of a new map; absent = 高; 中 was not saved and compared), 17 = the hour the level starts at
// (关卡初始时间点), 18 = 每秒流逝时间(分钟).
function levelBasics(root){
  const settings=fields(root).filter(f=>f.id===11&&f.wire===2);
  if(settings.length!==1)fail('UNSUPPORTED_SAVE','The save has no level settings section.');
  const basics=fields(settings[0].data).filter(f=>f.id===1&&f.wire===2);
  if(basics.length!==1)fail('UNSUPPORTED_SAVE','The save has no basic level settings.');
  return {settings:settings[0].data,basics:basics[0].data};
}
const describeLevel=b=>({aggroMode:varintOf(b,13)===1?'custom':'default',aggroTransferMultiplier:float(b,14),loadTier:({2:'low',0:'high'})[varintOf(b,15)??0]??'other',startHour:varintOf(b,17)??0,minutesPerSecond:float(b,18)});
const levelNote='aggroMode "default": creatures pick their own targets among hostile factions (scene_list_factions) within their notice range, and the aggro nodes do nothing. aggroMode "custom": a graph decides with f.setTheAggroValueOfSpecifiedEntity(target, owner, value), f.tauntTarget(taunter, target), f.removeTargetEntityFromAggroList(target, owner) and f.clearSpecifiedTargetSAggroList(owner).';
export function getLevelSettings({mapPath}){
  const file=resolve(mapPath);
  return {mapPath:file,...describeLevel(levelBasics(container(fs.readFileSync(file))).basics),note:levelNote};
}
export function setLevelSettings({mapPath,aggroMode,loadTier,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file),root=container(bytes),state=levelBasics(root);
  if(aggroMode===undefined&&loadTier===undefined)fail('NOTHING_TO_CHANGE','Give aggroMode and/or loadTier.');
  // Fields stay in numeric order, as the editor writes them.
  let parts=fields(state.basics);
  if(aggroMode!==undefined){parts=parts.filter(f=>f.id!==13);if(aggroMode==='custom')parts.push({id:13,raw:field(13,0,1)});}
  if(loadTier!==undefined){parts=parts.filter(f=>f.id!==15);if(loadTier==='low')parts.push({id:15,raw:field(15,0,2)});}
  const basics=Buffer.concat(parts.map((f,i)=>({f,i})).sort((a,b)=>a.f.id-b.f.id||a.i-b.i).map(x=>x.f.raw));
  const out=output(workspace,file,outputName,'-level');
  fs.writeFileSync(out,wrap(bytes,replace(root,11,2,replace(state.settings,1,2,basics))));
  return {...getLevelSettings({mapPath:out}),source:file,before:describeLevel(state.basics),next:'Use mapPath in later calls. The official save was not changed.'};
}

// Node graphs live in section 10 as groups {1: graph}, a graph being {1: {1: 10000, 2: 20000, 3: 21001, 5: graph id},
// 2: name, 3: nodes...} for a server entity graph. The editor's library lists it in the tab of kind 4 as
// {1: 800, 2: graph id}, and it runs on the entity whose component 3 names it:
// {1: 3, 13: {1: {1: {1: 1, 2: graph id, 501: 20000}}}}. A new map has no graph at all; its 关卡实体 (the stage entity)
// has an empty component 3 (read from a new save and from one with a graph made in the editor, CN 7.1, 2026-10-10).
function graphRecords(root){
  return fields(root).filter(f=>f.id===10&&f.wire===2).flatMap(s=>fields(s.data).filter(f=>f.id===1&&f.wire===2)).flatMap(g=>fields(g.data).filter(f=>f.id===1&&f.wire===2)).flatMap(g=>{
    try{const id=one(g.data,1),name=fields(g.data).find(f=>f.id===2&&f.wire===2);return [{graphId:varintOf(id,5),kind:varintOf(id,3),type:varintOf(id,2),name:name?name.data.toString('utf8'):'',nodeCount:fields(g.data).filter(f=>f.id===3&&f.wire===2).length}];}catch{return [];}
  });
}
// Where a component or a graph goes. A prefab means its template (section 4) and every copy of it placed in the scene
// (section 5): both hold the same blocks, one field number apart (template 6 properties / 7 components / 8 records,
// placed entity 5 / 6 / 7), and the editor keeps them in step. The player template (base 1000000, one entity per player
// slot) and the character template (base 1000001) are stored the same way (read from the official sample saves).
const PLAYER_BASE=1000000,CHARACTER_BASE=1000001;
const TEMPLATE={properties:6,components:7,records:8},PLACED={properties:5,components:6,records:7};
function rewriteTargets(root,{prefab,entity},edit){
  if((prefab===undefined)===(entity===undefined))fail('INVALID_TARGET','Give either prefab (a prefab name or id, or "player" / "character" for the two built-in templates) or entity (the name of something placed in the save).');
  let templates=0,placed=0,prefabIds=[];
  if(prefab!==undefined){
    const all=prefabRecords(root);
    const picked=prefab==='player'?all.filter(p=>p.assetId===PLAYER_BASE):prefab==='character'?all.filter(p=>p.assetId===CHARACTER_BASE):all.filter(p=>typeof prefab==='number'?p.prefabId===prefab:p.name===prefab);
    if(!picked.length)fail('PREFAB_NOT_FOUND','No prefab with this name or id in the save. Prefabs are listed by scene_list_prefabs.',{prefab});
    if(typeof prefab==='string'&&!['player','character'].includes(prefab)&&picked.length>1)fail('PREFAB_NOT_FOUND','Several prefabs have this name; give the prefab id.',{prefab,prefabIds:picked.map(p=>p.prefabId)});
    prefabIds=picked.map(p=>p.prefabId);
    root=replace(root,4,2,Buffer.concat(fields(one(root,4)).map(f=>{
      if(f.id!==1||f.wire!==2||!prefabIds.includes(varintOf(f.data,1)))return f.raw;
      templates++;return field(1,2,edit(f.data,TEMPLATE));
    })));
  }
  root=replace(root,5,2,Buffer.concat(fields(one(root,5)).map(f=>{
    if(f.id!==1||f.wire!==2)return f.raw;
    const info=describe(f.data);
    if(prefab!==undefined?!prefabIds.includes(info.assetId):info.name!==entity)return f.raw;
    placed++;return field(1,2,edit(f.data,PLACED));
  })));
  if(!templates&&!placed)fail('ENTITY_NOT_FOUND','Nothing placed in the save has this name. Names are listed by scene_list_entities.',{entity});
  return {root,templates,placed,prefabIds};
}
// Replace the block of one kind among the repeated fields `id` of an entry, or add it after the last of them.
function setBlock(data,id,kind,build){
  const parts=fields(data),at=parts.findIndex(f=>f.id===id&&f.wire===2&&kindOf(f.data)===kind);
  if(at>=0)return Buffer.concat(parts.map((f,i)=>i===at?field(id,2,build(f.data)):f.raw));
  let last=-1;parts.forEach((f,i)=>{if(f.wire===2&&f.id<=id)last=i;});
  return Buffer.concat(parts.flatMap((f,i)=>i===last?[f.raw,field(id,2,build(null))]:[f.raw]));
}
// The kinds of graph a save holds, by the type in the graph's header {1: 10000, 2: type, 3: 21001, 5: id}, with the kind
// of the library tab that lists it and the tag of its entry there. Server graphs are numbered from 1073741825; client
// graphs share one numbering from 1082130433 and carry {100: 1}. Read from the official samples 技能设置, 过滤节点图 and
// 复杂造物 (CN 7.1).
// An item graph (道具节点图, type 20005) is a server graph numbered with the others, listed in the tab of kind 20 as
// {1: 4300, 2: id}; it is not attached to an entity: an item names it (the official sample 掉落物、道具、背包).
const GRAPH_KINDS={server:{type:20000,tab:4,tag:800},item:{type:20005,tab:20,tag:4300},boolFilter:{type:20001,tab:13,tag:2100},characterSkill:{type:20002,tab:14,tag:2200},
  creatureDecision:{type:20007,tab:58,tag:6600},creatureSkill:{type:20008,tab:59,tag:6700},creatureStatus:{type:20009,tab:60,tag:6800}};
const CLIENT_GRAPH_BASE=1082130432,SERVER_GRAPH_BASE=1073741824;
const GRAPH_ENTRY={item:"g.server({id, name, type:'item'}).on('whenItemsInTheInventoryAreUsed',(evt,f)=>{...})",boolFilter:"g.boolFilter({id, name, prefix:false}).on('start',(evt,f)=>condition)",characterSkill:"g.characterSkill({id, name, prefix:false}).on('start',(evt,f)=>{...})",
  creatureSkill:"g.creationSkill({id, name, prefix:false}).on('start',(evt,f)=>{...})",creatureStatus:"g.creationStatus({id, name, prefix:false}).on('start1',(evt,f)=>{...})",creatureDecision:"g.creationStatusDecision({id, name, prefix:false}).on('start1',(evt,f)=>{...})"};
export function addGraph({mapPath,name='_GSTS_Main',kind='server',attachTo,attachToPrefab,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  const spec=GRAPH_KINDS[kind];
  if(!spec)fail('INVALID_GRAPH_KIND','kind is one of '+Object.keys(GRAPH_KINDS).join(', ')+'.',{kind});
  const client=kind!=='server'&&kind!=='item',loose=client||kind==='item',label=name.startsWith('_GSTS')?name:'_GSTS_'+name,existing=graphRecords(root);
  if(existing.some(g=>g.name===label))fail('DUPLICATE_GRAPH_NAME','The save already has a graph with this name; use it as targetGraphId.',{name:label,graphId:existing.find(g=>g.name===label).graphId});
  const sections=fields(root);
  if(sections.filter(f=>f.id===10&&f.wire===2).length!==1||sections.filter(f=>f.id===6&&f.wire===2).length!==1)fail('UNSUPPORTED_SAVE','The save does not have the node graph sections this tool knows.');
  if(attachTo!==undefined&&attachToPrefab!==undefined)fail('INVALID_TARGET','Give attachTo (a placed entity) or attachToPrefab, not both.');
  if(loose&&(attachTo!==undefined||attachToPrefab!==undefined))fail('INVALID_TARGET','A client graph is not attached to an entity: a filter is named by an option (scene_add_components optionTab.options[].filterGraphId), a skill graph by a skill, a creature graph by a creature, an item graph by an item (scene_add_item useGraphId).',{kind});
  // One graph can sit on several prefabs (a wooden wall and a stone wall that behave alike): attachToPrefab may be a list.
  const prefabList=attachToPrefab===undefined?[]:Array.isArray(attachToPrefab)?attachToPrefab:[attachToPrefab];
  if(new Set(prefabList).size!==prefabList.length)fail('INVALID_TARGET','attachToPrefab names the same prefab twice.',{attachToPrefab});
  const targets=loose?[]:prefabList.length?prefabList.map(prefab=>({prefab})):[{entity:attachTo??'关卡实体'}];
  const ofSort=existing.filter(g=>client?g.graphId>CLIENT_GRAPH_BASE:g.graphId<=CLIENT_GRAPH_BASE).map(g=>g.graphId);
  let graphId=Math.max(client?CLIENT_GRAPH_BASE:SERVER_GRAPH_BASE,...ofSort)+1;
  const graph=Buffer.concat([field(1,2,Buffer.concat([field(1,0,10000),field(2,0,spec.type),field(3,0,21001),field(5,0,graphId)])),field(2,2,Buffer.from(label,'utf8')),client?field(100,0,1):Buffer.alloc(0)]);
  // The new group goes after the groups already there and before the section's other fields.
  const parts=fields(one(root,10)),groups=parts.filter(f=>f.id===1),rest=parts.filter(f=>f.id!==1);
  root=replace(root,10,2,Buffer.concat([...groups.map(f=>f.raw),field(1,2,field(1,2,graph)),...rest.map(f=>f.raw)]));
  const tabs=fields(one(root,6)),tab=tabs.filter(t=>t.id===1&&t.wire===2&&kindOf(t.data)===spec.tab);
  if(kind==='item')root=listInLibrary(root,spec.tab,spec.tag,graphId);
  else{
    if(tab.length!==1)fail('UNSUPPORTED_SAVE','The save has no library tab for this kind of node graph.',{kind});
    const listed=field(5,2,Buffer.concat([field(1,0,spec.tag),field(2,0,graphId)]));
    const newTab=Buffer.concat(fields(tab[0].data).map(f=>f.id===3&&f.wire===2?field(3,2,Buffer.concat([f.data,listed])):f.raw));
    root=replace(root,6,2,Buffer.concat(tabs.map(t=>t===tab[0]?field(1,2,newTab):t.raw)));
  }
  if(kind==='item'){
    const out=output(workspace,file,outputName,'-graph');fs.writeFileSync(out,wrap(bytes,root));
    return {mapPath:out,source:file,graphId,name:label,kind,
      next:'write_graphs {mapPath: this mapPath, graphs: [{graphId: '+graphId+', code}]}; the source is '+GRAPH_ENTRY.item+' with id '+graphId+' and name \''+label+'\'. Then name it in the item: scene_add_item {useGraphId: '+graphId+', category: "consumable"}.'};
  }
  if(client){
    const out=output(workspace,file,outputName,'-graph');fs.writeFileSync(out,wrap(bytes,root));
    return {mapPath:out,source:file,graphId,name:label,kind,
      next:'write_graphs {mapPath: this mapPath, graphs: [{graphId: '+graphId+', code}]}; the source is '+GRAPH_ENTRY[kind]+' with id '+graphId+' and name \''+label+'\'. search_node_docs with scope "raw" finds what a client graph can call. '+(kind==='boolFilter'?'Then name it in an option: scene_add_components optionTab.options[].filterGraphId '+graphId+' (the option shows only while the filter is true).':'Wiring this graph to a skill or a creature has no tool yet.')+' Client graphs written this way have compiled but have not been run in the game.'};
  }
  // An entity runs every graph named in its component 3, one {1: {1: locator}} per graph (official saves carry up to six).
  const mount=field(1,2,field(1,2,Buffer.concat([field(1,0,1),field(2,0,graphId),field(501,0,20000)])));
  const done={prefabIds:[],templates:0,placed:0};
  for(const target of targets){
    const one=rewriteTargets(root,target,(data,layout)=>{
      if(!fields(data).some(f=>f.id===layout.components&&f.wire===2&&kindOf(f.data)===3))fail('UNSUPPORTED_ENTITY','This entity cannot carry a node graph (static pieces cannot).',target);
      return setBlock(data,layout.components,3,old=>Buffer.concat([field(1,0,3),field(13,2,Buffer.concat([fields(old).find(f=>f.id===13&&f.wire===2)?.data??Buffer.alloc(0),mount]))]));
    });
    root=one.root;done.prefabIds.push(...one.prefabIds);done.templates+=one.templates;done.placed+=one.placed;
    if(target.entity!==undefined&&one.placed!==1)fail('ENTITY_NOT_FOUND','Several placed entities have this name; attach to their prefab (attachToPrefab) or rename them.',target);
  }
  const out=output(workspace,file,outputName,'-graph');fs.writeFileSync(out,wrap(bytes,root));
  const where=prefabList.length?{attachedToPrefab:attachToPrefab,prefabIds:done.prefabIds,templates:done.templates,placedCopies:done.placed}:{attachedTo:targets[0].entity};
  return {mapPath:out,source:file,graphId,name:label,...where,
    next:'write_graphs {mapPath: this mapPath, graphs: [{graphId: '+graphId+', code}]}; the graph source starts with g.server({id:'+graphId+', name:\''+label+'\', ...}). Add every graph the level needs first, then write all their sources in one write_graphs call. In the graph, events are those of the entity it is attached to (evt.eventSourceEntity is that entity; on a prefab, each created copy runs its own instance), and whenEntityIsCreated fires when that entity appears (for the stage entity: when the level starts).'};
}

// General components (通用组件) are the records of an entry: {1: kind, 2: 1, content field: content} (see contentField). Read from the fifty official
// sample saves (knowledge/notes/component-codes.zh-CN.md), CN 7.1:
// 5 collision trigger: {1: {1: trigger id, 2: 1 when active from the start, 3: target kinds left out (packed),
//   4: area..., 502: label, 503: target kinds (packed; 0 character, 1 object, 2 creature)}...}
//   area box {11: {1: centre, 2: size, 3: rotation}, 502: label, 503: number}, sphere {1: 1, 12: {1: centre, 2: radius}, ...}
// 17 option tab: {1: area..., 2: {1: option id, 2: text, 3: 1 when active from the start, 4: icon, 5: 1,
//   6: {} or {1: 1, 2: filter graph id}, 503: label, 504: 13}...}
// 1 custom variables: {1: {2: name, 3: type, 4: {1: type, 2: {1: type, 2: {}}, 10+type: {1: value}}, 5: 1, 6: {1: type, 2: {}}}...}
//   types 3 integer, 4 boolean, 5 float, 6 string.
const TARGET_KINDS={character:0,object:1,creature:2};
const xyz=v=>Buffer.concat(v.map((n,i)=>n?field(i+1,5,f32(n)):Buffer.alloc(0)));
function areaBlock(a,i,code){
  const label=[field(502,2,Buffer.from('区域'+(i+1),'utf8')),field(503,0,i+1)],centre=a.offset??[0,0,0];
  if(!Array.isArray(centre)||centre.length!==3||!centre.every(Number.isFinite))fail(code,'offset is [x, y, z] from the centre of the entity.',{area:a});
  if(a.radius!==undefined){
    if(a.size!==undefined||!(a.radius>0&&a.radius<=500))fail(code,'An area has either size [x, y, z] (a box) or radius (a sphere), up to 500.',{area:a});
    return Buffer.concat([field(1,0,1),field(12,2,Buffer.concat([field(1,2,xyz(centre)),field(2,5,f32(a.radius))])),...label]);
  }
  const size=typeof a.size==='number'?[a.size,a.size,a.size]:a.size;
  if(!Array.isArray(size)||size.length!==3||!size.every(n=>n>0&&n<=500))fail(code,'An area has either size [x, y, z] (a box) or radius (a sphere), up to 500.',{area:a});
  return Buffer.concat([field(11,2,Buffer.concat([field(1,2,xyz(centre)),field(2,2,xyz(size)),field(3,2,Buffer.alloc(0))])),...label]);
}
function triggerContent(triggers){
  return Buffer.concat(triggers.map((t,i)=>{
    const wanted=[...new Set(t.targets??['character'])].map(k=>TARGET_KINDS[k]).sort(),left=[0,1,2].filter(k=>!wanted.includes(k));
    if(!wanted.length||wanted.includes(undefined))fail('INVALID_TRIGGER','targets is a list of character, object, creature.',{trigger:t});
    if(!Array.isArray(t.areas)||!t.areas.length)fail('INVALID_TRIGGER','A trigger needs at least one area.',{trigger:t});
    return field(1,2,Buffer.concat([field(1,0,i+1),t.active===false?Buffer.alloc(0):field(2,0,1),left.length?field(3,2,Buffer.from(left)):Buffer.alloc(0),
      ...t.areas.map((a,n)=>field(4,2,areaBlock(a,n,'INVALID_TRIGGER'))),field(502,2,Buffer.from('触发器 序号:'+(i+1),'utf8')),field(503,2,Buffer.from(wanted))]));
  }));
}
function tabContent({areas,options}){
  if(!Array.isArray(areas)||!areas.length||!Array.isArray(options)||!options.length)fail('INVALID_OPTION_TAB','An option tab needs at least one area and one option.');
  return Buffer.concat([...areas.map((a,n)=>field(1,2,areaBlock(a,n,'INVALID_OPTION_TAB'))),...options.map((o,i)=>{
    if(typeof o.text!=='string'||!o.text||o.text.length>40)fail('INVALID_OPTION_TAB','Every option needs a text of at most 40 characters.',{option:o});
    return field(2,2,Buffer.concat([field(1,0,i+1),field(2,2,Buffer.from(o.text,'utf8')),o.active===false?Buffer.alloc(0):field(3,0,1),field(4,0,o.icon??1),field(5,0,1),
      field(6,2,o.filterGraphId?Buffer.concat([field(1,0,1),field(2,0,o.filterGraphId)]):Buffer.alloc(0)),field(503,2,Buffer.from(o.text+'  序号: '+(i+1),'utf8')),field(504,0,13)]));
  })]);
}
const VARIABLE_TYPES={integer:3,boolean:4,float:5,string:6};
function variableBlock(v){
  const type=VARIABLE_TYPES[v.type];
  if(!type||typeof v.name!=='string'||!v.name||v.name.length>40)fail('INVALID_VARIABLE','A variable is {name, type: integer | boolean | float | string, value}.',{variable:v});
  let value=Buffer.alloc(0);const given=v.value;
  if(type===3&&given!==undefined){if(!Number.isInteger(given)||Math.abs(given)>2147483647)fail('INVALID_VARIABLE','An integer variable takes a whole number within ±2147483647.',{variable:v});if(given)value=field(1,0,BigInt.asUintN(64,BigInt(given)));}
  else if(type===4&&given!==undefined){if(typeof given!=='boolean')fail('INVALID_VARIABLE','A boolean variable takes true or false.',{variable:v});if(given)value=field(1,0,1);}
  else if(type===5&&given!==undefined){if(!Number.isFinite(given))fail('INVALID_VARIABLE','A float variable takes a number.',{variable:v});if(given)value=field(1,5,f32(given));}
  else if(type===6&&given!==undefined){if(typeof given!=='string'||given.length>40)fail('INVALID_VARIABLE','A string variable takes a text of at most 40 characters.',{variable:v});if(given)value=field(1,2,Buffer.from(given,'utf8'));}
  const tag=Buffer.concat([field(1,0,type),field(2,2,Buffer.alloc(0))]);
  return Buffer.concat([field(2,2,Buffer.from(v.name,'utf8')),field(3,0,type),field(4,2,Buffer.concat([field(1,0,type),field(2,2,tag),field(10+type,2,value)])),field(5,0,1),field(6,2,tag)]);
}
// 4 basic motion device (基础运动器): {3: device..., 505: 1}, a device being {1: name, 2: 1 when it runs from the start,
//   501: device id, 511: {11: {1: seconds, 2: velocity, 501: displacement}, 502: {2: 1000, 502: {}}}, 512 and 513: two
//   blocks the editor writes unchanged for a straight move}. Velocity is displacement over seconds.
// 9 follow motion device (跟随运动器): {2: attach point, 3: {1: 1, 3: 1}, 4: {}, 5: 1200, 6: 1100, 7: tracking, 502: label};
//   tracking {11: {}} sticks to the target, {1: 2, 13: {...}} chases it at a speed.
const EMPTY=Buffer.alloc(0);
const MOTION_TAIL=Buffer.concat([
  field(512,2,Buffer.concat([field(1,0,4),field(15,2,Buffer.concat([field(1,2,Buffer.concat([field(1,5,f32(1)),field(3,5,f32(1))])),field(2,2,EMPTY),field(3,0,5501),field(4,5,f32(1)),field(6,0,5600),field(7,5,f32(1))])),field(502,2,Buffer.concat([field(2,0,1000),field(502,2,EMPTY)]))])),
  field(513,2,Buffer.concat([field(1,0,2),field(13,2,EMPTY),field(502,2,Buffer.concat([field(2,0,1000),field(502,2,EMPTY),field(503,0,1)]))]))]);
const MOTION_LOOPS={once:1000,backAndForth:1001,restart:1002};
function motionContent(motions){
  const names=motions.map(m=>m.name);
  if(new Set(names).size!==names.length)fail('INVALID_MOTION','Motion names must differ: a graph starts one by its name.',{names});
  return Buffer.concat([...motions.map((m,i)=>{
    let main;
    if(m.path!==undefined){
      // A path motion (路径运动器): {1: 2, 13: {}, 502: {2: loop type, 501: waypoint..., 502: {}}}, a waypoint being
      // {2: position relative to the entity, 3: rotation, 4: seconds from the point before, 5: 900, 7: {}, 8: {}}.
      // Loop types: 1000 once, 1001 there and back for ever, 1002 jump back to the start and go again. Read from the
      // official samples: the platforms of 建成我的第一个奇域 and 信号 (one waypoint, 1001, active from the start) and the
      // spinning tools of 操作提示与反馈 (waypoints that only turn, 180 then 360 degrees, 1002).
      const steps=m.path,loop=MOTION_LOOPS[m.loop??'once'];
      const vec=v=>v===undefined||(Array.isArray(v)&&v.length===3&&v.every(Number.isFinite));
      if(m.move!==undefined||!Array.isArray(steps)||!steps.length||steps.length>20||loop===undefined||!steps.every(p=>vec(p.position)&&vec(p.rotation)&&p.seconds>0&&p.seconds<=600))
        fail('INVALID_MOTION','A path motion is {name, path: [{position: [x, y, z] relative to the entity, rotation: [x, y, z] degrees, seconds}...], loop: once | backAndForth | restart}; position and rotation may be left out.',{motion:m});
      main=Buffer.concat([field(1,0,2),field(13,2,EMPTY),field(502,2,Buffer.concat([field(2,0,loop),
        ...steps.map(p=>field(501,2,Buffer.concat([field(2,2,xyz(p.position??[0,0,0])),field(3,2,xyz(p.rotation??[0,0,0])),field(4,5,f32(p.seconds)),field(5,0,900),field(7,2,EMPTY),field(8,2,EMPTY)]))),field(502,2,EMPTY)]))]);
    }else{
      if(!Array.isArray(m.move)||m.move.length!==3||!m.move.every(Number.isFinite)||!m.move.some(n=>n)||!(m.seconds>0&&m.seconds<=600))fail('INVALID_MOTION','A motion is {name, move: [x, y, z] in metres, seconds}, or {name, path, loop} for a path.',{motion:m});
      const straight=Buffer.concat([field(1,5,f32(m.seconds)),field(2,2,xyz(m.move.map(n=>n/m.seconds))),field(501,2,xyz(m.move))]);
      main=Buffer.concat([field(11,2,straight),field(502,2,Buffer.concat([field(2,0,1000),field(502,2,EMPTY)]))]);
    }
    return field(3,2,Buffer.concat([field(1,2,Buffer.from(m.name,'utf8')),m.active?field(2,0,1):EMPTY,field(501,0,i+1),field(511,2,main),MOTION_TAIL]));
  }),field(505,0,1)]);
}
function followContent(mode){
  const tracking=mode==='attach'?field(11,2,EMPTY):Buffer.concat([field(1,0,2),field(13,2,Buffer.concat([field(1,5,f32(5)),field(2,5,f32(1)),field(3,5,f32(10)),field(4,0,1),field(501,5,f32(5)),field(502,0,1)]))]);
  return Buffer.concat([field(2,2,Buffer.from('default','utf8')),field(3,2,Buffer.concat([field(1,5,f32(1)),field(3,5,f32(1))])),field(4,2,EMPTY),field(5,0,1200),field(6,0,1100),field(7,2,tracking),field(502,2,Buffer.from('完全跟随','utf8'))]);
}
// 32 minimap marker (小地图标识): {501: {501: marker id, 502: 1, 503: {}, 504: name, 505: 1 to show the height difference,
//   506: 1, 507: 1, 509: {501: icon, 503: 101}, 510 to 513: {502: 101}, 514: 1, 515: 1, 516: description, 517: "标记"}}.
function markerContent({name,description='',icon=12046}){
  if(typeof name!=='string'||!name||name.length>30||description.length>60)fail('INVALID_MARKER','A minimap marker is {name, description, icon}; the name has at most 30 characters.',{name});
  const text=v=>Buffer.from(v,'utf8'),plain=field(502,0,101);
  const about=description?Buffer.concat([field(501,2,text(description)),field(502,2,Buffer.concat([field(12,2,EMPTY),field(501,0,1),field(502,2,text(description))]))]):EMPTY;
  return field(501,2,Buffer.concat([field(501,0,1),field(502,0,1),field(503,2,EMPTY),field(504,2,text(name)),field(505,0,1),field(506,0,1),field(507,0,1),
    field(509,2,Buffer.concat([field(501,0,icon),field(503,0,101)])),field(510,2,plain),field(511,2,plain),field(512,2,plain),field(513,2,plain),field(514,0,1),field(515,0,1),field(516,2,about),field(517,2,text('标记'))]));
}
// 19 hurt box (受击盒): {1: {1: box id, 2: 1, 3: area..., 502: label}}; the area is written like a trigger's. Creatures and
//   characters have one of their own; an object can only be attacked once it has one.
function hurtBoxContent(areas){
  if(!Array.isArray(areas)||!areas.length)fail('INVALID_HURT_BOX','A hurt box needs at least one area.');
  return field(1,2,Buffer.concat([field(1,0,1),field(2,0,1),...areas.map((a,n)=>field(3,2,areaBlock(a,n,'INVALID_HURT_BOX'))),field(502,2,Buffer.from('受击盒1','utf8'))]));
}
// Projectile motion (投射运动器, general component 11) makes a thing fly from the moment it is created:
//   straight {21: {1: {1: 1, 11: {1: velocity, 2: acceleration, 3: seconds of acceleration}, 502: "直线投射"}, 501: 1}},
//   parabola {21: {1: {1: 2, 12: {1: velocity, 2: gravity}, 502: "抛物线投射"}, 501: 2}},
//   tracking {21: {1: {1: 3, 13: {1: velocity, 2: acceleration, 3: seconds of acceleration, 5: degrees a second it can
//     turn, 8: the attachment point of the target it flies at, 9: metres from the target at which it snaps to it, 10: the
//     seconds the snap takes, 11: 2 (吸附追踪), 1002: 1}, 502: "追踪投射"}, 501: 3}}. Velocity is in the thing's own
//   axes: z forward, y up.
// Hit detection (命中检测, general component 12) tells when it touches something: {22: {1: area..., 3: 2101 once /
//   2102 once per entity, 4: seconds before it starts to detect, 5: name of the ability unit it launches at what it hits,
//   6: {}, 7: continuous detection, {} or {1: 1, 3: the speed above which it is used, 5: its radius}, 8: 2005 (every
//   faction) or 2002 (hostile ones only), 9: packed [1405, 1404, 1402] (the kinds of entity), 13: packed [2601, 2602,
//   2605] (hurt boxes, the scene, an object's own collision), 501: 1, 503: 13, 1002: 1}}.
// Read from the official sample 投射运动器 (the bullets of its cannons and the sword wave); a graph creates the thing
// with f.createProjectile. The tracking kind, the hostile filter and continuous detection are as the editor saved them
// on 2026-10-11 after they were set by hand (tests/fixtures/projectile-edited.json).
function projectileContent(p){
  const velocity=p.velocity;
  if(!Array.isArray(velocity)||velocity.length!==3||!velocity.every(Number.isFinite))fail('INVALID_PROJECTILE','velocity is [x, y, z] in metres a second, in the thing\'s own axes (z forward, y up).',{projectile:p});
  if(p.type==='parabola')return Buffer.concat([field(1,2,Buffer.concat([field(1,0,2),field(12,2,Buffer.concat([field(1,2,xyz(velocity)),field(2,5,f32(p.gravity??9.8))])),field(502,2,Buffer.from('抛物线投射','utf8'))])),field(501,0,2)]);
  const speedUp=p.acceleration!==undefined?[field(2,5,f32(p.acceleration)),field(3,5,f32(p.accelerationSeconds??1))]:[];
  if(p.type==='tracking')return Buffer.concat([field(1,2,Buffer.concat([field(1,0,3),field(13,2,Buffer.concat([field(1,2,xyz(velocity)),...speedUp,field(5,5,f32(p.turnDegreesPerSecond??9999)),
    field(8,2,Buffer.from(p.targetAttachPoint??'GI_RootNode','utf8')),field(9,5,f32(p.snapRange??1)),field(10,5,f32(p.snapSeconds??1)),field(11,0,2),field(1002,0,1)])),field(502,2,Buffer.from('追踪投射','utf8'))])),field(501,0,3)]);
  if(p.type!=='straight')fail('INVALID_PROJECTILE','type is "straight", "parabola" or "tracking".',{projectile:p});
  return Buffer.concat([field(1,2,Buffer.concat([field(1,0,1),field(11,2,Buffer.concat([field(1,2,xyz(velocity)),...speedUp])),field(502,2,Buffer.from('直线投射','utf8'))])),field(501,0,1)]);
}
function hitDetectionContent(h){
  if(!Array.isArray(h.areas)||!h.areas.length)fail('INVALID_HIT_DETECTION','Hit detection needs at least one area.',{hitDetection:h});
  const kind={once:2101,oncePerEntity:2102}[h.trigger??'oncePerEntity'];
  if(!kind)fail('INVALID_HIT_DETECTION','trigger is "once" or "oncePerEntity".',{hitDetection:h});
  const LAYERS={hurtBox:2601,scene:2602,objectCollision:2605},layers=(h.layers??['hurtBox','scene','objectCollision']).map(l=>LAYERS[l]);
  if(!layers.length||layers.includes(undefined))fail('INVALID_HIT_DETECTION','layers is a list of hurtBox, scene, objectCollision.',{hitDetection:h});
  const faction={all:2005,hostile:2002}[h.factions??'all'];
  if(!faction)fail('INVALID_HIT_DETECTION','factions is "all" or "hostile".',{hitDetection:h});
  const fast=h.continuous?Buffer.concat([field(1,0,1),field(3,5,f32(h.continuous.speedAbove??0)),field(5,5,f32(h.continuous.radius))]):Buffer.alloc(0);
  return Buffer.concat([...h.areas.map((a,n)=>field(1,2,areaBlock(a,n,'INVALID_HIT_DETECTION'))),field(3,0,kind),...(h.delaySeconds?[field(4,5,f32(h.delaySeconds))]:[]),
    ...(h.abilityUnit?[field(5,2,Buffer.from(h.abilityUnit,'utf8'))]:[]),field(6,2,Buffer.alloc(0)),field(7,2,fast),field(8,0,faction),field(9,2,Buffer.concat([1405,1404,1402].map(varint))),
    field(13,2,Buffer.concat(layers.map(varint))),field(501,0,1),field(503,0,13),field(1002,0,1)]);
}
// Ability units (能力单元) are in the property block of kind 14: {23: {1: {1: unit..., 3: "能力单元"}}}, a unit being
//   {2: type, 4: name, type block}. A direct attack is type 2 with block 12 (4: {2: damage coefficient, 3: damage added,
//   ...}), a heal is type 24 with block 18 ({1: amount, ...}); the rest of each block is as the official sample 能力单元 has
//   it. A graph uses one by its name.
function abilityContent(units){
  const names=units.map(u=>u.name);
  if(new Set(names).size!==names.length)fail('INVALID_ABILITY_UNIT','Ability unit names must differ: a graph uses one by its name.',{names});
  const text=v=>Buffer.from(v,'utf8'),scale=Buffer.concat([field(1,5,f32(1)),field(3,0,3200)]);
  return field(1,2,Buffer.concat([...units.map(u=>{
    const kinds=[u.attack,u.heal].filter(v=>v!==undefined).length;
    if(typeof u.name!=='string'||!u.name||u.name.length>30||kinds!==1)fail('INVALID_ABILITY_UNIT','An ability unit is {name, attack: {coefficient, added}} or {name, heal: amount}.',{unit:u});
    if(u.heal!==undefined){
      if(!(u.heal>0))fail('INVALID_ABILITY_UNIT','heal is the amount of health restored.',{unit:u});
      return field(1,2,Buffer.concat([field(2,0,24),field(4,2,text(u.name)),field(18,2,Buffer.concat([field(1,5,f32(u.heal)),field(3,0,1),field(7,2,scale)]))]));
    }
    const coefficient=u.attack.coefficient??1,addedDamage=u.attack.added??0;
    const damage=Buffer.concat([field(2,5,f32(coefficient)),...(addedDamage?[field(3,5,f32(addedDamage))]:[]),field(4,0,1300),field(6,0,2201),field(7,0,2303)]);
    const hit=Buffer.concat([field(1,0,191),field(3,0,2501),field(5,5,f32(1)),field(6,2,EMPTY),field(7,2,EMPTY),field(10,0,2)]);
    return field(1,2,Buffer.concat([field(2,0,2),field(4,2,text(u.name)),field(12,2,Buffer.concat([field(1,2,text('GI_RootNode')),field(2,2,EMPTY),field(3,2,EMPTY),field(4,2,damage),field(5,2,hit),field(6,0,3000),field(7,2,scale)]))]));
  }),field(3,2,text('能力单元'))]));
}
// The content of a record sits in field kind + 10 up to kind 20 and in field kind + 11 from kind 21 on (19 is in 29, 21 in 32,
// 32 in 43: counted over every kind in the official samples).
const contentField=kind=>kind+(kind<=20?10:11);
const record=(kind,content)=>Buffer.concat([field(1,0,kind),field(2,0,1),field(contentField(kind),2,content)]);
function componentSummary(data,layout){
  const out={collisionTriggers:0,options:[],variables:[],motions:[],follow:false,minimapMarker:false,hurtBox:false,launcher:false,extraCollision:false,abilityUnits:[],graphs:[]};
  for(const f of fields(data)){
    if(f.wire!==2)continue;
    try{
      if(f.id===layout.records){
        const kind=kindOf(f.data),body=fields(f.data).find(x=>x.id===contentField(kind)&&x.wire===2)?.data;if(!body)continue;
        if(kind===5)out.collisionTriggers=fields(body).filter(x=>x.id===1&&x.wire===2).length;
        if(kind===4)out.motions=fields(body).filter(x=>(x.id===1||x.id===3)&&x.wire===2).map(m=>fields(m.data).find(x=>x.id===1&&x.wire===2)?.data.toString('utf8')??'');
        if(kind===9)out.follow=true;
        if(kind===32)out.minimapMarker=fields(body).some(x=>x.id===501&&x.wire===2);
        if(kind===19)out.hurtBox=fields(body).some(x=>x.id===1&&x.wire===2);
        if(kind===15)out.launcher=fields(body).some(x=>x.id===1&&x.wire===2);
        if(kind===8)out.extraCollision=fields(body).some(x=>x.id===1&&x.wire===2);
        if(kind===17)out.options=fields(body).filter(x=>x.id===2&&x.wire===2).map(o=>({id:varintOf(o.data,1),text:fields(o.data).find(x=>x.id===2&&x.wire===2)?.data.toString('utf8')??''}));
        if(kind===1)out.variables=fields(body).filter(x=>x.id===1&&x.wire===2).map(v=>({name:fields(v.data).find(x=>x.id===2&&x.wire===2)?.data.toString('utf8')??'',type:Object.keys(VARIABLE_TYPES).find(k=>VARIABLE_TYPES[k]===varintOf(v.data,3))??'other'}));
      }
      if(f.id===layout.properties&&kindOf(f.data)===14){const list=one(one(f.data,23),1);out.abilityUnits=fields(list).filter(x=>x.id===1&&x.wire===2).map(u=>fields(u.data).find(x=>x.id===4&&x.wire===2)?.data.toString('utf8')??'');}
      if(f.id===layout.components&&kindOf(f.data)===3){
        const list=fields(f.data).find(x=>x.id===13&&x.wire===2);
        if(list)out.graphs=fields(list.data).filter(x=>x.id===1&&x.wire===2).flatMap(e=>fields(e.data).filter(x=>x.id===1&&x.wire===2)).map(l=>varintOf(l.data,2));
      }
    }catch{}
  }
  return out;
}
// What a prefab or the placed entities of one name carry: triggers, options, variables and the graphs they run.
export function listComponents({mapPath,prefab,entity}){
  const file=resolve(mapPath),found=[];
  rewriteTargets(container(fs.readFileSync(file)),{prefab,entity},(data,layout)=>{found.push({where:layout===TEMPLATE?'prefab':'placed',...(layout===TEMPLATE?{prefabId:varintOf(data,1)}:{guid:describe(data).guid,name:describe(data).name}),...componentSummary(data,layout)});return data;});
  return {mapPath:file,found};
}
// Loot (战利品, general component 37): what a thing leaves behind when it is destroyed, {48: {1: 1, 3: {1: 1, 2: the drop
// prefab}, 4: {1: {1: {1: 1, 2: item id}, 2: amount}...}, 5: 4350}} (the official sample 掉落物、道具、背包: a bird ball
// that leaves three pieces of fowl meat).
export const lootComponent=({dropPrefabId,items})=>record(37,Buffer.concat([field(1,0,1),field(3,2,Buffer.concat([field(1,0,1),field(2,0,dropPrefabId)])),
  field(4,2,Buffer.concat(items.map(i=>field(1,2,Buffer.concat([field(1,2,Buffer.concat([field(1,0,1),field(2,0,i.itemId)])),field(2,0,i.amount)]))))),field(5,0,4350)]));
// The character disturbance device (角色扰动装置, general component 15): an object that pushes the characters touching it.
// Of its three kinds the launcher (弹射器, 1802) is written: a character that enters the area gets extra speed in a set
// direction. Read from the official sample 角色扰动装置 (the bounce mushroom 弹弹菇): {1: {1: 1, 2: area, 3: 1802, 5: {} (no
// filter), 13: {1: 1811 (a set direction), 2: speed in m/s, 4: the direction, 6: 0.25, 7: 1, 8: 1, 501: speed, 502: 1,
// 503: 1, 507: 1811}, 502: 1 (active from the start), 503: 1, 504: its name}, 2: 1}. The sample has one area and one
// device; the durations it stores (6: 0.25) are written as they are, since nothing shows which of the two the guide
// names (稳定阶段时长, 衰减阶段时长) that number is.
// (Read from a device configured by hand on 2026-10-13: 6 is the time the push holds, 稳定阶段时长, and 5 the time
// it fades over, 衰减阶段时长, left out when 0; a push "away from the piece", 关联角色扰动方向 with 实体至角色连线方向, is
// 1810 in fields 1 and 507 with the direction vector at the editor's default {3: 1.0}.)
export const launcherContent=({areas,speed,direction,holdSeconds=0.25,fadeSeconds=0})=>Buffer.concat([field(1,2,Buffer.concat([field(1,0,1),...areas.map((a,n)=>field(2,2,areaBlock(a,n,'INVALID_LAUNCHER'))),field(3,0,1802),field(5,2,Buffer.alloc(0)),
  field(13,2,Buffer.concat([field(1,0,typeof direction==='string'?1810:1811),field(2,5,f32(direction==='toward'?-speed:speed)),field(4,2,typeof direction==='string'?xyz([0,0,1]):xyz(direction)),...(fadeSeconds?[field(5,5,f32(fadeSeconds))]:[]),field(6,5,f32(holdSeconds)),field(7,0,1),field(8,0,1),field(501,5,f32(speed)),
    // "Towards the piece" (角色至实体连线方向) is the same record with the speed negative and -1 in 502 and 503.
    ...(direction==='toward'?[field(502,0,0xffffffffffffffffn),field(503,0,0xffffffffffffffffn)]:[field(502,0,1),field(503,0,1)]),field(507,0,typeof direction==='string'?1810:1811)])),
  field(502,0,1),field(503,0,1),field(504,2,Buffer.from('角色扰动装置 序号：1','utf8'))])),field(2,0,1)]);
// Extra collision (额外碰撞, general component 8): shapes that stop characters and creatures, whatever the model looks
// like. Read from one configured by hand on 2026-10-13 (the fixture above): {18: {1: {1: 1, 2: 1 (active from the
// start), 4: area..., 502: its name}}}; the areas are written like those of a trigger.
export const extraCollisionContent=areas=>field(1,2,Buffer.concat([field(1,0,1),field(2,0,1),...areas.map((a,n)=>field(4,2,areaBlock(a,n,'INVALID_COLLISION'))),field(502,2,Buffer.from('额外碰撞  序号 : 1','utf8'))]));
// The force field kind (力场器, 1801) of the same component pushes for as long as a character is inside: a wind, a
// current, a conveyor. Read from one configured by hand on 2026-10-13 (tests/fixtures/editor-2026-10-13-handcfg-2.gil):
// its rule is field 12, {1: offset of the sphere, 2: 1811 (a set direction), 3: the direction, 5: outer radius,
// 6: inner radius, 7: speed beyond the outer radius, 8: speed inside the inner one, 501 to 504: 1, 505 and 506: the two
// speeds again, 507: 1811}.
export const forceFieldContent=({areas,direction,innerRadius,outerRadius,innerSpeed,outerSpeed})=>Buffer.concat([field(1,2,Buffer.concat([field(1,0,1),...areas.map((a,n)=>field(2,2,areaBlock(a,n,'INVALID_FORCE_FIELD'))),field(3,0,1801),field(5,2,Buffer.alloc(0)),
  field(12,2,Buffer.concat([field(1,2,Buffer.alloc(0)),field(2,0,1811),field(3,2,xyz(direction)),field(5,5,f32(outerRadius)),field(6,5,f32(innerRadius)),field(7,5,f32(outerSpeed)),field(8,5,f32(innerSpeed)),field(501,0,1),field(502,0,1),field(503,0,1),field(504,0,1),field(505,5,f32(outerSpeed)),field(506,5,f32(innerSpeed)),field(507,0,1811)])),
  field(502,0,1),field(503,0,1),field(504,2,Buffer.from('角色扰动装置 序号：1','utf8'))])),field(2,0,1)]);
export function addComponents({mapPath,prefab,entity,collisionTriggers,optionTab,variables,motions,follow,minimapMarker,hurtBox,abilityUnits,loot,projectile,hitDetection,launcher,forceField,extraCollision,solid,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);
  if(collisionTriggers===undefined&&optionTab===undefined&&variables===undefined&&motions===undefined&&follow===undefined&&minimapMarker===undefined&&hurtBox===undefined&&abilityUnits===undefined&&loot===undefined&&projectile===undefined&&hitDetection===undefined&&launcher===undefined&&forceField===undefined&&extraCollision===undefined&&solid===undefined)fail('NOTHING_TO_ADD','Give collisionTriggers, optionTab, variables, motions, follow, minimapMarker, hurtBox, abilityUnits, launcher, forceField, extraCollision or solid.');
  if(variables){const names=variables.map(v=>v.name);if(new Set(names).size!==names.length)fail('INVALID_VARIABLE','Variable names must differ.',{names});}
  const triggers=collisionTriggers&&record(5,triggerContent(collisionTriggers)),tab=optionTab&&record(17,tabContent(optionTab)),added=variables?.map(variableBlock);
  const moving=motions&&record(4,motionContent(motions)),following=follow&&record(9,followContent(follow));
  const marked=minimapMarker&&record(32,markerContent(minimapMarker));
  const struck=hurtBox&&record(19,hurtBoxContent(hurtBox.areas));
  const walled=extraCollision&&record(8,extraCollisionContent(extraCollision.areas));
  let flinging=null;
  if(launcher){
    const away=typeof launcher.direction==='string',d=away?[0,0,1]:launcher.direction??[0,1,0],length=Math.hypot(...d);
    if(!Array.isArray(launcher.areas)||!launcher.areas.length)fail('INVALID_LAUNCHER','A launcher needs at least one area.',{launcher});
    if(!(launcher.speed>0&&launcher.speed<=200)||!(length>0))fail('INVALID_LAUNCHER','speed is in metres a second (up to 200) and direction a vector that is not zero, or "away".',{launcher});
    // A direction of length 1, as the sample stores it; a part of exactly 0 is left out of the record, as everywhere.
    flinging=record(15,launcherContent({areas:launcher.areas,speed:launcher.speed,direction:away?launcher.direction:d.map(n=>Math.round(n/length*1e6)/1e6),holdSeconds:launcher.holdSeconds??0.25,fadeSeconds:launcher.fadeSeconds??0}));
  }
  if(forceField){
    if(launcher)fail('INVALID_FORCE_FIELD','A piece carries one disturbance device: give launcher or forceField, not both.');
    const d=forceField.direction,length=Array.isArray(d)?Math.hypot(...d):0,inner=forceField.innerRadius??1,outer=forceField.outerRadius??2;
    if(!Array.isArray(forceField.areas)||!forceField.areas.length||!(length>0)||!(outer>=inner&&inner>0))fail('INVALID_FORCE_FIELD','A force field needs an area, a direction that is not zero and radii with 0 < innerRadius <= outerRadius.',{forceField});
    flinging=record(15,forceFieldContent({areas:forceField.areas,direction:d.map(n=>Math.round(n/length*1e6)/1e6),innerRadius:inner,outerRadius:outer,innerSpeed:forceField.innerSpeed??forceField.speed??1,outerSpeed:forceField.outerSpeed??forceField.speed??1}));
  }
  const able=abilityUnits&&Buffer.concat([field(1,0,14),field(23,2,abilityContent(abilityUnits))]);
  const flying=projectile&&record(11,projectileContent(projectile)),touching=hitDetection&&record(12,hitDetectionContent(hitDetection));
  let left=null;
  if(loot){
    const whole=container(bytes),drops=prefabRecords(whole).filter(p=>typeof loot.dropPrefab==='number'?p.prefabId===loot.dropPrefab:p.name===loot.dropPrefab);
    if(drops.length!==1)fail('PREFAB_NOT_FOUND','loot.dropPrefab is the name or id of a drop prefab: scene_add_prefab {asset, drop: {item}}.',{dropPrefab:loot.dropPrefab});
    left=lootComponent({dropPrefabId:drops[0].prefabId,items:loot.items.map(i=>({itemId:configIdOf(whole,9,'item',i.item),amount:i.amount??1}))});
  }
  const done=rewriteTargets(container(bytes),{prefab,entity},(data,layout)=>{
    if(!fields(data).some(f=>f.id===layout.components&&f.wire===2&&kindOf(f.data)===3))fail('UNSUPPORTED_ENTITY','A static piece carries no components. Make it dynamic: a prefab from scene_add_prefab, or a piece placed with createAtStart false.',{prefab,entity});
    let next=data;
    if(triggers)next=setBlock(next,layout.records,5,()=>triggers);
    if(tab)next=setBlock(next,layout.records,17,()=>tab);
    if(moving)next=setBlock(next,layout.records,4,()=>moving);
    if(following)next=setBlock(next,layout.records,9,()=>following);
    if(marked)next=setBlock(next,layout.records,32,()=>marked);
    if(struck)next=setBlock(next,layout.records,19,()=>struck);
    if(flinging)next=setBlock(next,layout.records,15,()=>flinging);
    if(walled)next=setBlock(next,layout.records,8,()=>walled);
    if(left)next=setBlock(next,layout.records,37,()=>left);
    if(flying)next=setBlock(next,layout.records,11,()=>flying);
    if(touching)next=setBlock(next,layout.records,12,()=>touching);
    if(able)next=setBlock(next,layout.properties,14,()=>able);
    if(added)next=setBlock(next,layout.records,1,old=>{
      // Variables already there stay unless one of the new ones has the same name.
      const body=old&&fields(old).find(f=>f.id===11&&f.wire===2)?.data,kept=body?fields(body).filter(f=>f.id===1&&f.wire===2&&!variables.some(v=>v.name===fields(f.data).find(x=>x.id===2&&x.wire===2)?.data.toString('utf8'))).map(f=>f.raw):[];
      return record(1,Buffer.concat([...kept,...added.map(b=>field(1,2,b))]));
    });
    // Component 5 is the native collision: {1: 1, 2: 1} on a solid piece, empty on one that characters walk through
    // (official pickups such as coins have it empty).
    if(solid!==undefined)next=setBlock(next,layout.components,5,()=>Buffer.concat([field(1,0,5),field(15,2,solid?Buffer.concat([field(1,0,1),field(2,0,1)]):Buffer.alloc(0))]));
    return next;
  });
  const out=output(workspace,file,outputName,'-components');fs.writeFileSync(out,wrap(bytes,done.root));
  const events=[];
  if(triggers)events.push('whenEnteringCollisionTrigger / whenExitingCollisionTrigger fire in a graph attached to this same prefab or entity (trigger ids start at 1); f.activateDisableCollisionTrigger(entity, triggerId, bool) switches one');
  if(tab)events.push('whenTabIsSelected fires in a graph attached to this same prefab or entity, with the option id (from 1); f.activateDisableTab(entity, optionId, bool) shows or hides an option');
  if(moving)events.push('f.activateBasicMotionDevice(entity, name) starts a motion by its name (search_node_docs has the exact arguments, and the nodes that stop one); a motion with active true runs as soon as the entity exists');
  if(following)events.push('the follow device has no target until a graph gives it one: search_node_docs "follow motion device" (a character is followed through the GUID of its player)');
  if(marked)events.push('the marker shows on every player\'s minimap from the start; search_node_docs "minimap" has the nodes that change who sees or tracks it');
  if(flying)events.push('the thing flies from the moment it exists: a graph launches one with f.createProjectile(prefabId, position, rotation, ownerEntity, targetEntity, false, 1n, [] as bigint[]) (rotation decides where forward is; the fifth argument is the target a tracking projectile would follow)');
  if(touching)events.push('whenOnHitDetectionIsTriggered fires in a graph on this prefab (evt.onHitEntity, evt.onHitLocation, evt.onHitHurtbox); with abilityUnit, what it hits is attacked with that unit at once');
  if(left)events.push('when this thing is destroyed (f.destroyEntity, or its health running out) the drop prefab appears where it was, holding the items; a character that picks it up gets them in its backpack');
  if(able)events.push('a graph on this prefab uses an ability unit by its name: search_node_docs "ability unit" has the attack and heal nodes and their arguments');
  if(added)events.push('f.getCustomVariable / f.setCustomVariable read and write by name on any entity; whenCustomVariableChanges fires in a graph attached to the entity that holds the variable');
  return {mapPath:out,source:file,prefabIds:done.prefabIds.length?done.prefabIds:undefined,templates:done.templates,placedCopies:done.placed,
    next:'Use mapPath in later calls. '+events.join('. ')+(events.length?'. ':'')+'Attach the graph with scene_add_graph {attachToPrefab} or {attachTo}.'};
}

// Interface controls live in section 9: field 501 is the packed list of root records, each field 502 one record
// {501: id, 502: structure blocks..., 503: packed child ids, 504: parent id, 505: content blocks...}. A block is
// {N: {...}, 501: slot, 502: type}. The layout 默认布局 has a structure block of type 7 and lists the controls on screen;
// the control library root has one of type 14. The editor makes a custom control as three records, and so does this
// tool: a template {block type 4 listing its two copies}, the copy in the library (parent: library root) and the copy in
// the layout (parent: layout), the copies naming the template in a block of type 3. Content block type 23 marks a custom
// control, 12 is its rectangle on the four platforms (anchor at the screen centre of a 1600 x 900 canvas, y up), 26 is a
// progress bar whose current, minimum and maximum are player custom variables {501: 100, 502: name}.
// Read from the official sample saves; a bar written this way is byte for byte the one in the official progress-bar sample.
const packIds=ids=>Buffer.concat(ids.map(varint));
const uiBlock=(wrapId,inner,slot,type,more=[])=>Buffer.concat([field(wrapId,2,inner),field(501,0,slot),field(502,0,type),...more]);
const pair=(a,b)=>Buffer.concat([a?field(501,5,f32(a)):Buffer.alloc(0),b?field(502,5,f32(b)):Buffer.alloc(0)]);
function uiRecords(root){
  const section=fields(root).filter(f=>f.id===9&&f.wire===2);
  if(section.length!==1)fail('UNSUPPORTED_SAVE','The save has no interface section.');
  return fields(section[0].data).filter(f=>f.id===502&&f.wire===2).map(f=>{
    const parts=fields(f.data),blocks=id=>parts.filter(x=>x.id===id&&x.wire===2).map(x=>x.data),named=blocks(505).find(b=>varintOf(b,502)===15);
    let name='';try{name=one(one(named,12),501).toString('utf8');}catch{}
    return {raw:f,id:varintOf(f.data,501),parent:varintOf(f.data,504),name,structure:blocks(502).map(b=>varintOf(b,502)),content:blocks(505).map(b=>varintOf(b,502)),
      slot:blocks(502).filter(b=>varintOf(b,502)===6).map(b=>varintOf(one(b,12),501))[0]??0};
  });
}
export function barRecord({id,name,slot,templateId,copies,parent,states,current,min,max,timer,button,words,image,style,hidden}){
  const text=s=>Buffer.from(s,'utf8'),custom=Buffer.concat([field(15,2,Buffer.alloc(0)),field(501,0,5)]);
  // A control that is not shown until a graph switches it on (初始可见性 off) has {502: 1} in the inner of its two
  // visibility blocks (read from a control switched off by hand, tests/fixtures/editor-2026-10-13-handui-2.gil).
  const shown=hidden?Buffer.concat([custom,field(502,0,1)]):custom;
  const state=(s,i)=>field(501,2,Buffer.concat([i?field(501,0,i):Buffer.alloc(0),field(502,2,Buffer.concat([
    field(501,2,Buffer.concat([field(1,5,f32(1)),field(2,5,f32(1)),field(3,5,f32(1))])),field(502,2,pair(0.5,0.5)),field(503,2,pair(0.5,0.5)),
    field(504,2,pair(s.position[0],s.position[1])),field(505,2,pair(s.size[0],s.size[1])),field(506,2,pair(0.5,0.5))]))]));
  // The rectangle block ends with 4 on a progress bar and 5 on a timer (as the official records have it).
  // (3 on a text box, 9 on an image.)
  const rect=Buffer.concat([...states.map(state),field(502,0,image?9:button?1:timer?5:words?3:4)]);
  const bound=(fieldId,variable)=>field(fieldId,2,Buffer.concat([field(501,0,100),field(502,2,text(variable))]));
  return Buffer.concat([field(501,0,id),
    field(502,2,uiBlock(11,field(501,0,id),1,5)),field(502,2,uiBlock(12,field(501,0,slot),2,6)),
    copies?field(502,2,uiBlock(14,field(501,2,packIds(copies)),4,4)):field(502,2,uiBlock(13,field(501,0,templateId),3,3)),
    parent?field(504,0,parent):Buffer.alloc(0),
    field(505,2,uiBlock(12,field(501,2,text(name)),2,15)),
    field(505,2,uiBlock(14,custom,4,23,[field(503,2,uiBlock(14,shown,5,23,[field(503,0,1)]))])),
    field(505,2,uiBlock(11,Buffer.concat([field(12,2,Buffer.alloc(0)),field(501,0,2)]),1,12,[field(503,2,uiBlock(13,Buffer.concat([field(12,2,rect),field(501,0,2)]),4,12,[field(503,0,1)]))])),
    // Content: a progress bar (type 26) bound to three player variables, or a timer (type 27) that shows a global timer by name.
    // An interaction button (type 22) with the editor's default settings: pressing it raises whenUiControlGroupIsTriggered.
    // A text box (type 25): {502: font size, 504: 1, 505: {501: the text}}; a custom variable is written into the text as
    // {1:ps.name} (the player's own), {1:lv.name} (the stage entity's) or {1:p1.name} (player 1 to 8).
    // An image (type 38): {2: the picture, 3: {501: -1}, 4: its colour as 0xAARRGGBB, 6: {}, 10: {}}; picture 100001 is a
    // plain rectangle, which with a colour is a panel (the sample 界面手柄适配 has 0x7f000000 as 底板).
    image?field(505,2,uiBlock(31,Buffer.alloc(0),21,38,[field(503,2,uiBlock(31,Buffer.concat([field(2,0,image.id),field(3,2,field(501,0,0xffffffffffffffffn)),field(4,0,image.colour),field(6,2,Buffer.alloc(0)),field(10,2,Buffer.alloc(0))]),22,38,[field(503,0,1)]))]))
    :words?field(505,2,uiBlock(19,Buffer.alloc(0),9,25,[field(503,2,uiBlock(19,Buffer.concat([field(502,0,words.fontSize),field(504,0,1),field(505,2,field(501,2,text(words.text)))]),10,25,[field(503,0,1)]))]))
    :button?field(505,2,uiBlock(17,Buffer.alloc(0),7,22,[field(503,2,uiBlock(16,Buffer.concat([field(501,0,button.key??1),field(502,0,1),field(503,0,2),field(509,2,field(501,0,0xffffffffffffffffn))]),7,22,[field(503,0,1)]))]))
    :timer?field(505,2,uiBlock(21,Buffer.alloc(0),11,27,[field(503,2,uiBlock(21,field(503,2,text(timer)),12,27,[field(503,0,1)]))]))
      // style: how the bar looks, as the editor of this version writes it (read from three bars restyled by hand,
      // tests/fixtures/editor-2026-10-13-handui.gil and -handui-2.gil): 501 the shape (none across, 1 upright, 2 a ring),
      // 502 what it says (none a percentage, 1 nothing, 2 the value, 3 the ratio), then the three variables, 509 the angle
      // of a ring (360), 510 the fill shown in the editor (85), 511 the colour behind and 512 the colour of the fill
      // (0xAARRGGBB), 513 the direction (none left to right, 2 top to bottom, 4 clockwise), 514 and 516 the size of
      // the letters (14), 517 their colour, 518 the picture of the preset look (260326). The two colours alone, without the rest, changed nothing in play: the
      // editor takes a bar without 509 to 517 for one of the old form and gives it its defaults.
      :field(505,2,uiBlock(20,Buffer.alloc(0),10,26,[field(503,2,uiBlock(20,Buffer.concat([...(style?[...(style.shape?[field(501,0,style.shape)]:[]),...(style.says?[field(502,0,style.says)]:[])]:[]),bound(504,current),bound(505,min),bound(506,max),
        ...(style?[field(509,5,f32(360)),field(510,5,f32(85)),field(511,0,style.back),field(512,0,style.fill),...(style.shape?[field(513,0,style.shape===2?4:2)]:[]),field(514,0,style.fontSize),field(516,0,style.fontSize),field(517,0,style.text),field(518,0,260326)]:[])]),11,26,[field(503,0,1)]))]))]);
}
export function listInterface({mapPath}){
  const file=resolve(mapPath),root=container(fs.readFileSync(file)),records=uiRecords(root);
  const layouts=records.filter(r=>r.structure.includes(7));
  return {mapPath:file,layouts:layouts.map(l=>({layoutId:l.id,name:l.name,controls:records.filter(r=>r.parent===l.id).map(r=>({id:r.id,name:r.name,kind:r.content.includes(82)?'clientContainer':r.content.includes(26)?'progressBar':r.content.includes(38)?'image':r.content.includes(25)?'textBox':r.content.includes(27)?'timer':r.content.includes(28)?'scoreboard':r.content.includes(22)?'button':r.content.includes(23)?'custom':'builtIn'}))})),
    clientInterfaces:clientTrees(root,records),clientTemplates:clientTemplates(records).map(t=>({templateIndex:t.id,name:t.name})),
    knownImages:IMAGE_CATALOGUE.map(([id,shows])=>({id,shows})),
    note:'scene_add_progress_bar puts a bar on the screen that follows a player custom variable. On an account whose 奇匠 level is 1, text boxes show nothing in play (measured), bars do. scene_add_image puts a picture or a coloured rectangle on the screen; knownImages are the picture ids the official samples use. clientInterfaces are the trees of client controls (scene_add_client_ui) and the Lua script each carries.'};
}
// Adds a custom control to the screen: its template, the copy in the control library and the copy in the layout, and
// registers them (root list, the library's children, the layout's children).
function placeControl(root,records,layout,library,spec){
  const next=Math.max(...records.map(r=>r.id))+1,templateId=next,libraryId=next+1,controlId=next+2,slot=Math.max(0,...records.map(r=>r.slot))+1,common={...spec,slot};
  const fresh=[barRecord({...common,id:templateId,copies:[libraryId,controlId]}),barRecord({...common,id:libraryId,templateId,parent:library.id}),barRecord({...common,id:controlId,templateId,parent:layout.id})];
  // A record lists its children in field 503, after its structure blocks.
  const adopt=(data,child)=>{
    const parts=fields(data),list=parts.find(f=>f.id===503&&f.wire===2);
    if(list)return Buffer.concat(parts.map(f=>f===list?field(503,2,Buffer.concat([f.data,varint(child)])):f.raw));
    let last=-1;parts.forEach((f,i)=>{if(f.id===502&&f.wire===2)last=i;});
    return Buffer.concat(parts.flatMap((f,i)=>i===last?[f.raw,field(503,2,varint(child))]:[f.raw]));
  };
  const section=fields(one(root,9));
  const rebuilt=section.flatMap(f=>{
    if(f.id===501&&f.wire===2)return [field(501,2,Buffer.concat([varint(templateId),f.data]))];
    if(f.id!==502||f.wire!==2)return [f.raw];
    const id=varintOf(f.data,501),body=id===layout.id?adopt(f.data,controlId):id===library.id?adopt(f.data,libraryId):null;
    return [body?field(502,2,body):f.raw];
  });
  // The new records go after the last record, before whatever follows the records.
  let lastRecord=-1;section.forEach((f,i)=>{if(f.id===502&&f.wire===2)lastRecord=i;});
  rebuilt.splice(lastRecord+1,0,...fresh.map(b=>field(502,2,b)));
  return {root:replace(root,9,2,Buffer.concat(rebuilt)),controlId};
}
const BAR_SHAPES={horizontal:0,vertical:1,ring:2},BAR_SAYS={percent:0,nothing:1,value:2,ratio:3};
export function addProgressBar({mapPath,name,variable,min=0,max,position=[0,330],size=[200,50],shape,shows,colour,backColour,backOpacity=0.5,textColour,fontSize,hidden=false,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  const records=uiRecords(root),layout=records.find(r=>r.structure.includes(7)),library=records.find(r=>r.structure.includes(14));
  if(!layout||!library)fail('UNSUPPORTED_SAVE','The save has no default layout or no control library to add to.');
  if(records.some(r=>r.name===name))fail('DUPLICATE_CONTROL_NAME','The interface already has a control with this name.',{name});
  if(!(max>min))fail('INVALID_RANGE','max must be greater than min.',{min,max});
  if(Math.abs(position[0])>800||Math.abs(position[1])>450||!(size[0]>0&&size[0]<=1600&&size[1]>0&&size[1]<=900))fail('INVALID_RECT','position is [x, y] from the screen centre on a 1600 x 900 canvas, y up; size is [width, height].',{position,size});
  // The bar reads three integer variables of the player; the bounds get variables of their own.
  const lower=name+'_min',upper=name+'_max';
  const held=listComponents({mapPath:file,prefab:'player'}).found[0].variables;
  const wanted=[{name:lower,type:'integer',value:min},{name:upper,type:'integer',value:max},...(held.some(v=>v.name===variable)?[]:[{name:variable,type:'integer',value:min}])];
  if(held.some(v=>v.name===variable&&v.type!=='integer'))fail('INVALID_VARIABLE','The bar needs an integer variable of the player.',{variable});
  const added=wanted.map(variableBlock);
  root=rewriteTargets(root,{prefab:'player'},(data,layout)=>setBlock(data,layout.records,1,old=>{
    const body=old&&fields(old).find(f=>f.id===11&&f.wire===2)?.data,kept=body?fields(body).filter(f=>f.id===1&&f.wire===2&&!wanted.some(v=>v.name===fields(f.data).find(x=>x.id===2&&x.wire===2)?.data.toString('utf8'))).map(f=>f.raw):[];
    return record(1,Buffer.concat([...kept,...added.map(b=>field(1,2,b))]));
  })).root;
  // A bar with none of the style options is written as the official sample has it (and looks as the editor's default).
  const argb=(c,alpha)=>Math.round(alpha*255)*2**24+parseInt(c.slice(1),16);
  const style=[shape,shows,colour,backColour,textColour,fontSize].some(v=>v!==undefined)?{shape:BAR_SHAPES[shape??'horizontal'],says:BAR_SAYS[shows??'percent'],fill:argb(colour??'#99d720',1),back:argb(backColour??'#111111',backOpacity),text:argb(textColour??'#ffffff',1),fontSize:fontSize??14}:undefined;
  const placed=placeControl(root,records,layout,library,{name,states:[0,1,2,3].map(()=>({position,size})),current:variable,min:lower,max:upper,style,hidden});
  root=placed.root;const controlId=placed.controlId;
  const out=output(workspace,file,outputName,'-bar');fs.writeFileSync(out,wrap(bytes,root));
  return {mapPath:out,source:file,controlId,name,variable,min,max,position,size,playerVariables:wanted.map(v=>v.name),
    next:'Use mapPath in later calls. The bar follows the player custom variable "'+variable+'" between '+min+' and '+max+': a graph changes it with f.setCustomVariable(player, "'+variable+'", value, true), player being f.getPlayerEntityToWhichTheCharacterBelongs(character) or one of f.getListOfPlayerEntitiesOnTheField(). It shows the fill and a percentage.'};
}

// Unit statuses (单位状态) are the records of section 16: {1: id, 2: id, 3: {1: 1, 11: {1: name}},
// 3: {1: 6, 21: {1: {1: {1: 1.0, 2: {501: 20003}, 4: 1 when it lasts for ever, 5: stack limit, 6: 1, 9: 1.0},
// 2: {1: 1, 3: 1, 4: 1}, 3: {1: effect..., 2: packed [1404, 1405, 1402]}, 4: {}, 5: {}, 6: 30001}}}}.
// An effect is {1: effect id, 2: parameter...}: outline 710002 with a colour parameter {1: 3, 4: colour, 10 12 13: {}},
// see-through 760002 with an empty filter parameter {1: 10, ...} and a colour, maximum health 150001 with a number
// {1: 4, 5: float, 10: {}}. The editor's library lists a status in the tab of kind 11 as {1: 1900, 2: id}. Ids start at
// 1077936129 in a numbering of their own. Read from the official samples 描边与透视 and 单位状态 (CN 7.1); the three
// statuses in them are reproduced byte for byte.
const STATUS_COLOURS={green:6,white:14},STATUS_FIRST_ID=1077936129;
const blank=Buffer.alloc(0);
// More effects, read from a status configured by hand in the editor on 2026-10-13 (tests/fixtures/editor-2026-10-13-handcfg.gil):
// movement speed 20001 with a whole percentage {1: 3, 4: percent, 10 12 13: {}}; invincible 410001 and "the character
// cannot move" 2230001 without a parameter; super jump 510001 with two numbers (the horizontal and the vertical
// multiplier, each {1: 4, 5: float, 10 12 13: {}}). The packed list that closes the effects names the kinds of unit all
// of the effects work on: 1404 characters, 1405 creatures, 1402 objects (speed: characters and creatures; super jump
// and "cannot move": characters only). The head's first number is the seconds a status lasts when {4: 1} (for ever)
// is left out: the editor shows it as 初始运行时长 1.00 on a status that lasts for ever; a timed one was not read back.
const STATUS_UNITS={character:1404,creature:1405,object:1402};
export function statusRecord({id,name='',stackLimit=1,effects,seconds}){
  const colour=code=>Buffer.concat([field(1,0,3),field(4,0,code),field(10,2,blank),field(12,2,blank),field(13,2,blank)]);
  const number=v=>Buffer.concat([field(1,0,4),field(5,5,f32(v)),field(10,2,blank),field(12,2,blank),field(13,2,blank)]);
  let units=['character','creature','object'];const only=list=>{units=units.filter(u=>list.includes(u));};
  const listed=effects.map(e=>{
    if(e.outline!==undefined)return Buffer.concat([field(1,0,710002),field(2,2,colour(e.outline))]);
    if(e.seeThrough!==undefined)return Buffer.concat([field(1,0,760002),field(2,2,Buffer.concat([field(1,0,10),field(10,2,blank),field(12,2,blank),field(13,2,blank)])),field(2,2,colour(e.seeThrough))]);
    if(e.speedPercent!==undefined){only(['character','creature']);return Buffer.concat([field(1,0,20001),field(2,2,Buffer.concat([field(1,0,3),field(4,0,BigInt.asUintN(64,BigInt(e.speedPercent))),field(10,2,blank),field(12,2,blank),field(13,2,blank)]))]);}
    if(e.invincible)return field(1,0,410001);
    if(e.superJump){only(['character']);return Buffer.concat([field(1,0,510001),field(2,2,number(e.superJump[0])),field(2,2,number(e.superJump[1]))]);}
    if(e.rooted){only(['character']);return field(1,0,2230001);}
    return Buffer.concat([field(1,0,150001),field(2,2,Buffer.concat([field(1,0,4),field(5,5,f32(e.maxHealth)),field(10,2,blank)]))]);
  });
  const head=Buffer.concat([field(1,5,f32(seconds??1)),field(2,2,field(501,0,20003)),...(seconds===undefined?[field(4,0,1)]:[]),field(5,0,stackLimit),field(6,0,1),field(9,5,f32(1))]);
  const body=Buffer.concat([field(1,2,head),field(2,2,Buffer.concat([field(1,0,1),field(3,0,1),field(4,0,1)])),
    field(3,2,Buffer.concat([...listed.map(b=>field(1,2,b)),field(2,2,Buffer.concat(units.map(u=>varint(STATUS_UNITS[u]))))])),field(4,2,blank),field(5,2,blank),field(6,0,30001)]);
  return Buffer.concat([field(1,0,id),field(2,0,id),field(3,2,Buffer.concat([field(1,0,1),field(11,2,name?field(1,2,Buffer.from(name,'utf8')):blank)])),
    field(3,2,Buffer.concat([field(1,0,6),field(21,2,field(1,2,body))]))]);
}
// A unit status is stored twice, like a skill: the definition in section 15, {1: id, 2: 1, 4: block...}, and a copy in
// section 16 with the same blocks, {1: id, 2: id, 3: block...}. With only the copy the game does not know the status:
// f.addUnitStatus ran and nothing was there afterwards (seen in play, 2026-10-10). Read from the official sample 描边与透视.
export function statusDefinition(spec){
  return Buffer.concat([field(1,0,spec.id),field(2,0,1),...fields(statusRecord(spec)).filter(f=>f.id===3&&f.wire===2).map(f=>field(4,2,f.data))]);
}
function statusRecords(root){
  // Section 16 also holds a copy of every skill (ids from 1098907649): only the entries numbered as unit statuses count here.
  return fields(root).filter(f=>f.id===16&&f.wire===2).flatMap(s=>fields(s.data).filter(f=>f.id===1&&f.wire===2)).filter(f=>{const id=varintOf(f.data,1);return id>=STATUS_FIRST_ID&&id<SKILL_BASE;}).map(f=>{
    let name='';const effects=[];
    for(const part of fields(f.data).filter(x=>x.id===3&&x.wire===2)){
      try{
        if(kindOf(part.data)===1){const n=fields(one(part.data,11)).find(x=>x.id===1&&x.wire===2);name=n?n.data.toString('utf8'):'';}
        if(kindOf(part.data)===6)for(const e of fields(one(one(one(part.data,21),1),3)).filter(x=>x.id===1&&x.wire===2))effects.push(({710002:'outline',760002:'seeThrough',150001:'maxHealth',20001:'speedPercent',410001:'invincible',510001:'superJump',2230001:'rooted'})[varintOf(e.data,1)]??('effect '+varintOf(e.data,1)));
      }catch{}
    }
    return {statusId:varintOf(f.data,1),name,effects};
  });
}
export function listUnitStatuses({mapPath}){
  const file=resolve(mapPath);
  return {mapPath:file,statuses:statusRecords(container(fs.readFileSync(file))),
    note:'A graph gives one to an entity with f.addUnitStatus(applier, target, statusId, 1n, dictionary) and takes it away with f.removeUnitStatus(target, statusId, method, remover); search_node_docs has both.'};
}
export function addUnitStatus({mapPath,name,outline,seeThrough,maxHealth,speedPercent,invincible,superJump,rooted,seconds,stackLimit=1,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  const chosen=[outline,seeThrough,maxHealth].filter(v=>v!==undefined).length,more=[speedPercent!==undefined&&{speedPercent},invincible&&{invincible:true},superJump&&{superJump},rooted&&{rooted:true}].filter(Boolean);
  if(chosen>1||chosen+more.length<1)fail('INVALID_STATUS','Give at most one of outline (a colour), seeThrough (a colour) and maxHealth (a number), and any of speedPercent, invincible, superJump and rooted.');
  if(speedPercent!==undefined&&(!Number.isInteger(speedPercent)||speedPercent<-100||speedPercent>40))fail('INVALID_STATUS','speedPercent is a whole number from -100 to 40 (the editor takes no more than +40).',{speedPercent});
  if(superJump&&!(Array.isArray(superJump)&&superJump.length===2&&superJump.every(n=>n>0&&n<=10)))fail('INVALID_STATUS','superJump is [horizontal, vertical], the two multipliers of a jump (1 is a normal jump).',{superJump});
  const code=c=>{const n=typeof c==='number'?c:STATUS_COLOURS[c];if(!Number.isInteger(n)||n<0||n>200)fail('INVALID_STATUS','The colour is green or white, or a colour code of the editor as a number (6 and 14 are those two; other codes have not been mapped).',{colour:c});return n;};
  const effect=outline!==undefined?{outline:code(outline)}:seeThrough!==undefined?{seeThrough:code(seeThrough)}:maxHealth!==undefined?{maxHealth}:null;
  const all=[...(effect?[effect]:[]),...more];
  const existing=statusRecords(root);
  if(existing.some(s=>s.name===name))fail('DUPLICATE_STATUS_NAME','The save already has a unit status with this name.',{name,statusId:existing.find(s=>s.name===name).statusId});
  const statusId=Math.max(STATUS_FIRST_ID-1,...existing.map(s=>s.statusId))+1,added=field(1,2,statusRecord({id:statusId,name,stackLimit,effects:all,seconds}));
  root=replace(root,15,2,Buffer.concat([one(root,15),field(1,2,statusDefinition({id:statusId,name,stackLimit,effects:all,seconds}))]));
  // Section 16 is present but empty in a new map; a save without it gets it in the place its number gives.
  const top=fields(root);
  if(top.some(f=>f.id===16&&f.wire===2))root=replace(root,16,2,Buffer.concat([one(root,16),added]));
  else{let at=top.findIndex(f=>f.id>16);if(at<0)at=top.length;root=Buffer.concat([...top.slice(0,at).map(f=>f.raw),field(16,2,added),...top.slice(at).map(f=>f.raw)]);}
  const tabs=fields(one(root,6)),tab=tabs.filter(t=>t.id===1&&t.wire===2&&kindOf(t.data)===11);
  if(tab.length!==1)fail('UNSUPPORTED_SAVE','The save has no library tab for unit statuses.');
  const listed=field(5,2,Buffer.concat([field(1,0,1900),field(2,0,statusId)]));
  const newTab=Buffer.concat(fields(tab[0].data).map(f=>f.id===3&&f.wire===2?field(3,2,Buffer.concat([f.data,listed])):f.raw));
  root=replace(root,6,2,Buffer.concat(tabs.map(t=>t===tab[0]?field(1,2,newTab):t.raw)));
  const out=output(workspace,file,outputName,'-status');fs.writeFileSync(out,wrap(bytes,root));
  return {mapPath:out,source:file,statusId,name,effect:Object.keys(all[0])[0],effects:all.map(e=>Object.keys(e)[0]),...(seconds!==undefined?{seconds}:{}),stackLimit,
    next:'Use mapPath in later calls. In a graph: f.addUnitStatus(entity, entity, '+statusId+', 1n, dictionary) puts it on an entity and f.removeUnitStatus(entity, '+statusId+', method, entity) takes it off (search_node_docs gives the exact arguments). The usual pattern for "you can interact with this": the thing has a collision trigger and its own graph adds the outline on whenEnteringCollisionTrigger and removes it on whenExitingCollisionTrigger.'};
}

// Environment configurations (环境配置) are records of kind 26 in section 15 (the section of configuration records: 4 class,
// 5 growth curve, 12 backpack template, 26 environment, 27 light): {1: id, 2: 26, 4: {1: 1, 11: {1: name}},
// 4: {1: 70, 75: {1: {1: settings, 2: lights, 3: {1: 1} when it applies from the start}}}}. Settings: 1 (repeated) the
// player slots it applies to at the start ({} is slot 0, then {2: n}), 2 background (1 normal), 3 = 1 while the sky follows
// the level clock, 6 the fixed hour, 13 stars on, 14 their density, 15 their intensity, 16 milky way on, 17 its intensity,
// 19 clouds on, 20 their intensity, 8 a direction that is emptied when the hour is fixed. Every map has one, 1186988033; the library lists them in the tab of kind 56 as
// {1: 5400, 2: id}. A new one is a copy of the map's own default with these fields changed, so that whatever else the
// game version keeps in the record stays as that version wrote it. A graph switches with
// f.modifyEnvironmentSettings(id, players, false, 0n): the "index" is this id (read from the official sample 环境配置,
// whose night configuration is reproduced byte for byte from another sample's default).
function environmentRecords(root){
  return fields(root).filter(f=>f.id===15&&f.wire===2).flatMap(s=>fields(s.data).filter(f=>f.id===1&&f.wire===2)).filter(f=>varintOf(f.data,2)===26).map(f=>{
    const parts=fields(f.data).filter(x=>x.id===4&&x.wire===2);let name='',settings=null;
    try{name=one(one(parts.find(x=>kindOf(x.data)===1).data,11),1).toString('utf8');}catch{}
    let lights=0;
    try{const body=one(one(parts.find(x=>kindOf(x.data)===70).data,75),1);settings=one(body,1);lights=fields(fields(body).find(x=>x.id===2&&x.wire===2)?.data??Buffer.alloc(0)).filter(x=>x.id===1&&x.wire===2).length;}catch{}
    return {raw:f,environmentId:varintOf(f.data,1),name,settings,lights};
  });
}
const describeEnvironment=e=>{const s=e.settings?fields(e.settings):[],n=id=>{const f=s.find(x=>x.id===id&&x.wire===0);return f?Number(f.value):0;};
  return {environmentId:e.environmentId,name:e.name,followsClock:n(3)===1,hour:n(6)||n(58),stars:n(13)===1,milkyWay:n(16)===1,clouds:n(19)===1,appliesAtStartToSlots:s.filter(x=>x.id===1&&x.wire===2).length,lights:e.lights};};
// A map of the current version keeps the brightness and the colours of its sky as 34 curves over the day (fields 24 to
// 57: {1: 1 while the curve is read, 2: the value, 3 (repeated): a key {1: value, 2: {1: hour, 2: minute}}}). When the
// editor fixes such a sky at an hour it keeps every curve, takes away its 1 and writes into 2 the value of the curve at
// that hour: a number is blended between the two keys around it with a smooth step (t*t*(3-2t)), a colour straight and
// rounded down, channel by channel; a value of zero is left out. All 34 values of a sky the editor fixed at 10:00 come
// out exactly this way (tests/fixtures/editor-2026-10-13-env-follow.gil and -env-fixed.gil).
export function curveAt(curve,minute){
  const parts=fields(curve),old=parts.find(f=>f.id===2);
  const keys=parts.filter(f=>f.id===3&&f.wire===2).map(f=>{
    const k=fields(f.data),v=k.find(x=>x.id===1),t=k.find(x=>x.id===2&&x.wire===2),at=t?fields(t.data):[],n=i=>Number(at.find(x=>x.id===i&&x.wire===0)?.value??0);
    return {minute:n(1)*60+n(2),value:!v?0:v.wire===5?v.data.readFloatLE(0):Number(v.value),colour:!!v&&v.wire===0};
  });
  if(!keys.length)return old?old.raw:blank;
  const colour=keys.some(k=>k.colour)||(!!old&&old.wire===0);
  let from=[...keys].reverse().find(k=>k.minute<=minute),to=keys.find(k=>k.minute>minute);
  if(!from)from={...keys.at(-1),minute:keys.at(-1).minute-1440};
  if(!to)to={...keys[0],minute:keys[0].minute+1440};
  const t=to.minute===from.minute?0:(minute-from.minute)/(to.minute-from.minute);
  if(colour){
    const channel=(v,i)=>Math.floor(v/2**(i*8))%256,mixed=[3,2,1,0].reduce((sum,i)=>sum*256+Math.floor(channel(from.value,i)+(channel(to.value,i)-channel(from.value,i))*t),0);
    return mixed?field(2,0,mixed):blank;
  }
  // In single precision, step by step, as the editor does it (in double precision one of the 34 was a last bit off).
  const r=Math.fround,ts=r(t),step=r(r(ts*ts)*r(3-r(2*ts))),value=r(from.value+r(r(to.value-from.value)*step));
  return Math.fround(value)?field(2,5,f32(value)):blank;
}
export function environmentRecord(base,{id,name,hour=0,stars,milkyWay,clouds=true,appliesAtStart=false,lights=[]}){
  // A save of the first versions has no curves: a sky fixed at one hour holds plain numbers (9 and 10, and 20 for the
  // strength of the clouds) and the hour in field 6, as in the official sample 环境配置. A save of the current version
  // has the curves (see curveAt) and the hour in field 58. Until 2026-10-13 this tool dropped the curves there and
  // wrote the two numbers: the other 32 values then fell back to defaults made for no hour in particular, and a sky
  // fixed in the daytime came out several times too bright (a blind test lost half an hour to it).
  const all=fields(base),curved=all.some(f=>f.id>=24&&f.id<=57&&f.wire===2),num=(fid,v)=>({id:fid,raw:field(fid,0,v)}),flt=(fid,v)=>({id:fid,raw:field(fid,5,f32(v))});
  const curveDefault=(id,fallback)=>{const c=all.find(f=>f.id===id&&f.wire===2),v=c&&fields(c.data).find(x=>x.id===2&&x.wire===5);return v?v.data.readFloatLE(0):fallback;};
  const kept=all.filter(f=>!(f.id===1&&f.wire===2)&&![3,6,13,14,15,16,17,19].includes(f.id)&&(curved?f.id!==58:f.id<24));
  const has=id=>kept.some(f=>f.id===id),numbers=curved?[]:[...(has(9)?[]:[flt(9,curveDefault(24,1.8))]),...(has(10)?[]:[flt(10,curveDefault(25,0.3))])];
  // Without curves, field 8 holds a direction while the sky follows the clock and the official fixed skies have it empty;
  // with curves the editor leaves it as it is.
  const fix=f=>curved&&f.id>=24&&f.id<=57&&f.wire===2?field(f.id,2,Buffer.concat([curveAt(f.data,hour*60),...fields(f.data).filter(x=>x.id===3).map(x=>x.raw)]))
    :!curved&&f.id===8&&f.wire===2?field(8,2,blank):f.raw;
  const set=[...kept.map(f=>({id:f.id,raw:fix(f)})),...numbers,...(clouds&&!has(20)?[flt(20,1)]:[]),...(hour?[num(curved?58:6,hour)]:[]),
    ...(stars?[num(13,1),flt(14,stars.density??100),flt(15,stars.intensity??0.5)]:[]),...(milkyWay?[num(16,1),flt(17,milkyWay===true?0.5:milkyWay)]:[]),...(clouds?[num(19,1)]:[])];
  set.sort((a,b)=>a.id-b.id);
  const slots=appliesAtStart?[0,1,2,3,4,5,6,7].map(n=>field(1,2,n?field(2,0,n):blank)):[];
  const body=Buffer.concat([field(1,2,Buffer.concat([...slots,...set.map(x=>x.raw)])),field(2,2,Buffer.concat(lights.map((light,i)=>field(1,2,Buffer.concat([field(1,0,i+1),field(2,0,light)]))))),field(3,2,appliesAtStart?field(1,0,1):blank)]);
  return Buffer.concat([field(1,0,id),field(2,0,26),field(4,2,Buffer.concat([field(1,0,1),field(11,2,field(1,2,Buffer.from(name,'utf8')))])),field(4,2,Buffer.concat([field(1,0,70),field(75,2,field(1,2,body))]))]);
}
export function listEnvironments({mapPath}){
  const file=resolve(mapPath);
  return {mapPath:file,environments:environmentRecords(container(fs.readFileSync(file))).map(describeEnvironment),
    note:'A graph switches the sky for a list of players with f.modifyEnvironmentSettings(environmentId, players, false, 0n).'};
}
export function addEnvironment({mapPath,name,hour=0,stars=true,milkyWay=true,clouds=true,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  const existing=environmentRecords(root),base=existing.find(e=>e.settings);
  if(!base)fail('UNSUPPORTED_SAVE','The save has no environment configuration to start from.');
  if(existing.some(e=>e.name===name))fail('DUPLICATE_ENVIRONMENT_NAME','The save already has an environment configuration with this name.',{name,environmentId:existing.find(e=>e.name===name).environmentId});
  if(!Number.isInteger(hour)||hour<0||hour>23)fail('INVALID_HOUR','hour is a whole number from 0 to 23.',{hour});
  const environmentId=Math.max(...existing.map(e=>e.environmentId))+1;
  const added=field(1,2,environmentRecord(base.settings,{id:environmentId,name,hour,stars:stars?{}:null,milkyWay,clouds}));
  root=replace(root,15,2,Buffer.concat([one(root,15),added]));
  const tabs=fields(one(root,6)),tab=tabs.filter(t=>t.id===1&&t.wire===2&&kindOf(t.data)===56);
  if(tab.length!==1)fail('UNSUPPORTED_SAVE','The save has no library tab for environment configurations.');
  const listed=field(5,2,Buffer.concat([field(1,0,5400),field(2,0,environmentId)]));
  const newTab=Buffer.concat(fields(tab[0].data).map(f=>f.id===3&&f.wire===2?field(3,2,Buffer.concat([f.data,listed])):f.raw));
  root=replace(root,6,2,Buffer.concat(tabs.map(t=>t===tab[0]?field(1,2,newTab):t.raw)));
  const out=output(workspace,file,outputName,'-environment');fs.writeFileSync(out,wrap(bytes,root));
  return {mapPath:out,source:file,environmentId,name,hour,stars,milkyWay,clouds,defaultEnvironmentId:base.environmentId,
    next:'Use mapPath in later calls. This sky is fixed at '+hour+':00 and applies to nobody at the start. A graph switches to it with f.modifyEnvironmentSettings('+environmentId+', f.getListOfPlayerEntitiesOnTheField(), false, 0n) and back to the map\'s own sky with '+base.environmentId+' in its place. on a save of the current version.'};
}

// Lights are records of kind 27 in the same section: {1: id, 2: 27, 4: {1: 1, 11: {1: name}},
// 4: {1: 69, 74: {1: {1: {2: range it is drawn from, 3: position, 4: {}, 51: {1: 3, 2: radius, 3: intensity}}, 2: 1}}}} for a
// point light (a spotlight has {1: 1} and block 52 instead). A light shines only under the environment configuration that
// lists it ({1: place in the list, 2: light id} in that record's second block); the library lists lights in the tab of kind
// 55 as {1: 5300, 2: id}. Ids start at 1182793729. Read from the official samples 环境配置 and 定时器.
const LIGHT_FIRST_ID=1182793729;
const lightRecords=root=>fields(root).filter(f=>f.id===15&&f.wire===2).flatMap(s=>fields(s.data).filter(f=>f.id===1&&f.wire===2)).filter(f=>varintOf(f.data,2)===27);
export function lightRecord({id,name,position,radius,intensity,range}){
  const point=Buffer.concat([field(2,5,f32(range)),field(3,2,xyz(position)),field(4,2,blank),field(51,2,Buffer.concat([field(1,0,3),field(2,5,f32(radius)),field(3,5,f32(intensity))]))]);
  return Buffer.concat([field(1,0,id),field(2,0,27),field(4,2,Buffer.concat([field(1,0,1),field(11,2,field(1,2,Buffer.from(name,'utf8')))])),
    field(4,2,Buffer.concat([field(1,0,69),field(74,2,field(1,2,Buffer.concat([field(1,2,point),field(2,0,1)])))]))]);
}
export function addLight({mapPath,name,environment,position,radius=10,intensity=3,range=100,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  const skies=environmentRecords(root),sky=skies.find(e=>typeof environment==='number'?e.environmentId===environment:e.name===environment);
  if(!sky)fail('ENVIRONMENT_NOT_FOUND','No environment configuration with this name or id. They are listed by scene_list_environments.',{environment});
  if(!Array.isArray(position)||position.length!==3||!position.every(Number.isFinite))fail('INVALID_LIGHT','position is [x, y, z].',{position});
  const existing=lightRecords(root).map(f=>varintOf(f.data,1)),lightId=Math.max(LIGHT_FIRST_ID-1,...existing)+1;
  const added=field(1,2,lightRecord({id:lightId,name,position,radius,intensity,range}));
  // The environment's record gets the light in its list; every other record of the section stays as it is.
  const adopt=data=>Buffer.concat(fields(data).map(part=>{
    if(part.id!==4||part.wire!==2||kindOf(part.data)!==70)return part.raw;
    const body=one(one(part.data,75),1),held=fields(body).find(x=>x.id===2&&x.wire===2)?.data??blank,place=fields(held).filter(x=>x.id===1&&x.wire===2).length+1;
    const entry=field(1,2,Buffer.concat([field(1,0,place),field(2,0,lightId)]));
    const next=Buffer.concat(fields(body).map(x=>x.id===2&&x.wire===2?field(2,2,Buffer.concat([x.data,entry])):x.raw));
    return field(4,2,Buffer.concat([field(1,0,70),field(75,2,field(1,2,next))]));
  }));
  root=replace(root,15,2,Buffer.concat([...fields(one(root,15)).map(f=>f.id===1&&f.wire===2&&varintOf(f.data,2)===26&&varintOf(f.data,1)===sky.environmentId?field(1,2,adopt(f.data)):f.raw),added]));
  // The library has no tab for lights until the first light is made: the editor then writes one of kind 55 right after
  // the tab of the environment configurations ({1: 55, 2: {1: "root", 3: 1}, 3: {1: "未分类页签", 3: 2, 5: entries}}).
  const tabs=fields(one(root,6)),tab=tabs.filter(t=>t.id===1&&t.wire===2&&kindOf(t.data)===55);
  const listed=field(5,2,Buffer.concat([field(1,0,5300),field(2,0,lightId)]));
  if(tab.length>1)fail('UNSUPPORTED_SAVE','The save has several library tabs for lights.');
  if(tab.length){
    const newTab=Buffer.concat(fields(tab[0].data).map(f=>f.id===3&&f.wire===2?field(3,2,Buffer.concat([f.data,listed])):f.raw));
    root=replace(root,6,2,Buffer.concat(tabs.map(t=>t===tab[0]?field(1,2,newTab):t.raw)));
  }else{
    const fresh=field(1,2,Buffer.concat([field(1,0,55),field(2,2,Buffer.concat([field(1,2,Buffer.from('root','utf8')),field(3,0,1)])),field(3,2,Buffer.concat([field(1,2,Buffer.from('未分类页签','utf8')),field(3,0,2),listed]))]));
    const after=tabs.findIndex(t=>t.id===1&&t.wire===2&&kindOf(t.data)===56);
    root=replace(root,6,2,Buffer.concat(after<0?[...tabs.map(t=>t.raw),fresh]:tabs.flatMap((t,i)=>i===after?[t.raw,fresh]:[t.raw])));
  }
  const out=output(workspace,file,outputName,'-light');fs.writeFileSync(out,wrap(bytes,root));
  return {mapPath:out,source:file,lightId,name,environmentId:sky.environmentId,position,radius,intensity,range,
    next:'Use mapPath in later calls. The light shines only while a player is under environment configuration '+sky.environmentId+'; under any other it is off.'};
}

// Classes (职业) are records of kind 4 in section 15. Block 8 of a class is {16: {1: {1: camera template id, 2: screen
// layout id, 3 4 5 6: 1 for each movement the class may use}}}. Every official sample has all four set; that they are, in
// this order, jump, sprint, climb and glide is taken from the order of the editor's panel and has not been measured.
const CLASS_MOVES=['allowJump','allowSprint','allowClimb','allowGlide'];
function classRecords(root){
  return fields(root).filter(f=>f.id===15&&f.wire===2).flatMap(s=>fields(s.data).filter(f=>f.id===1&&f.wire===2)).filter(f=>varintOf(f.data,2)===4).map(f=>{
    const parts=fields(f.data).filter(x=>x.id===4&&x.wire===2);let name='',basics=null;
    try{name=one(one(parts.find(x=>kindOf(x.data)===1).data,11),1).toString('utf8');}catch{}
    try{basics=one(one(parts.find(x=>kindOf(x.data)===8).data,16),1);}catch{}
    // Block 9 is the level ({17: {1: {1: the level a player starts this class at, 2: the highest, 6: experience per
    // level}}}), block 10 the combat attributes ({18: {1: {1: base health, 2: base attack, 3: base defence, 4 and 501:
    // the growth curve, 5: stamina}}}). Read from the official samples 角色设置 (classes of level 5 and 10, health 10000
    // and 1) and 建成我的第一个奇域 (a swordsman of health 100); the order health, attack, defence is the guide's.
    let levels=null,combat=null;
    try{levels=one(one(parts.find(x=>kindOf(x.data)===9).data,17),1);}catch{}
    try{combat=one(one(parts.find(x=>kindOf(x.data)===10).data,18),1);}catch{}
    return {raw:f,classId:varintOf(f.data,1),name,basics,levels,combat};
  });
}
const floatOf=(b,id)=>{const f=b&&fields(b).find(x=>x.id===id&&x.wire===5);return f?Math.round(f.data.readFloatLE(0)*1000)/1000:null;};
const describeClass=c=>({classId:c.classId,name:c.name,cameraTemplateId:c.basics?varintOf(c.basics,1):null,layoutId:c.basics?varintOf(c.basics,2):null,
  ...Object.fromEntries(CLASS_MOVES.map((key,i)=>[key,c.basics?varintOf(c.basics,3+i)===1:null])),
  level:c.levels?varintOf(c.levels,1):null,maxLevel:c.levels?varintOf(c.levels,2):null,health:floatOf(c.combat,1),attack:floatOf(c.combat,2),defence:floatOf(c.combat,3),stamina:floatOf(c.combat,5)});
export function listClasses({mapPath}){
  const file=resolve(mapPath);
  return {mapPath:file,classes:classRecords(container(fs.readFileSync(file))).map(describeClass),
    note:'A class decides what the player\'s character may do and which camera template and screen layout it uses. scene_set_class changes these.'};
}
export function setClass({mapPath,name,allowJump,allowSprint,allowClimb,allowGlide,cameraTemplateId,level,health,attack,defence,stamina,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  const all=classRecords(root),picked=name===undefined?all:all.filter(c=>c.name===name);
  if(picked.length!==1)fail('CLASS_NOT_FOUND',name===undefined?'The save has several classes; give name.':'No class with this name. They are listed by scene_list_classes.',{name,classes:all.map(c=>c.name)});
  const wanted={allowJump,allowSprint,allowClimb,allowGlide};
  const numbers={health,attack,defence,stamina},anyNumber=Object.values(numbers).some(v=>v!==undefined);
  if(Object.values(wanted).every(v=>v===undefined)&&cameraTemplateId===undefined&&level===undefined&&!anyNumber)fail('NOTHING_TO_SET','Give allowJump, allowSprint, allowClimb, allowGlide, cameraTemplateId, level, health, attack, defence or stamina.');
  if(anyNumber&&!picked[0].combat)fail('UNSUPPORTED_SAVE','This class has no combat attributes block.');
  if(level!==undefined){
    if(!picked[0].levels)fail('UNSUPPORTED_SAVE','This class has no level block.');
    const top=varintOf(picked[0].levels,2)??200;
    if(!Number.isInteger(level)||level<1||level>top)fail('INVALID_LEVEL','level is a whole number from 1 to the highest level of the class.',{level,maxLevel:top});
  }
  if(!picked[0].basics)fail('UNSUPPORTED_SAVE','This class has no basic settings block.');
  if(cameraTemplateId!==undefined&&!cameraRecords(root).some(c=>c.cameraId===cameraTemplateId))fail('CAMERA_NOT_FOUND','No camera template with this id. They are listed by scene_list_cameras.',{cameraTemplateId});
  const before=describeClass(picked[0]),kept=fields(picked[0].basics).filter(f=>!(f.wire===0&&f.id>=3&&f.id<=6)&&!(cameraTemplateId!==undefined&&f.id===1));
  const set=[...kept.map(f=>({id:f.id,raw:f.raw})),...(cameraTemplateId!==undefined?[{id:1,raw:field(1,0,cameraTemplateId)}]:[]),
    ...CLASS_MOVES.flatMap((key,i)=>(wanted[key]??before[key])?[{id:3+i,raw:field(3+i,0,1)}]:[])];
  set.sort((a,b)=>a.id-b.id);
  const basics=Buffer.concat(set.map(x=>x.raw));
  // A number that is given replaces the field of that number or is put in at its place; the rest of the block stays.
  const withField=(block,id,raw)=>{const parts=fields(block),at=parts.findIndex(f=>f.id===id);if(at>=0)return Buffer.concat(parts.map((f,i)=>i===at?raw:f.raw));
    let last=-1;parts.forEach((f,i)=>{if(f.id<id)last=i;});return Buffer.concat([...parts.slice(0,last+1).map(f=>f.raw),raw,...parts.slice(last+1).map(f=>f.raw)]);};
  let combat=picked[0].combat,levels=picked[0].levels;
  for(const [key,id] of [['health',1],['attack',2],['defence',3],['stamina',5]])if(numbers[key]!==undefined)combat=withField(combat,id,field(id,5,f32(numbers[key])));
  if(level!==undefined)levels=withField(levels,1,field(1,0,level));
  const rebuilt=Buffer.concat(fields(picked[0].raw.data).map(part=>{
    if(part.id!==4||part.wire!==2)return part.raw;
    const kind=kindOf(part.data);
    if(kind===8)return field(4,2,Buffer.concat([field(1,0,8),field(16,2,field(1,2,basics))]));
    if(kind===9&&level!==undefined)return field(4,2,Buffer.concat([field(1,0,9),field(17,2,field(1,2,levels))]));
    if(kind===10&&anyNumber)return field(4,2,Buffer.concat([field(1,0,10),field(18,2,field(1,2,combat))]));
    return part.raw;
  }));
  root=replace(root,15,2,Buffer.concat(fields(one(root,15)).map(f=>f.id===1&&f.wire===2&&varintOf(f.data,2)===4&&varintOf(f.data,1)===picked[0].classId?field(1,2,rebuilt):f.raw)));
  const out=output(workspace,file,outputName,'-class');fs.writeFileSync(out,wrap(bytes,root));
  return {mapPath:out,source:file,before,after:describeClass(classRecords(container(fs.readFileSync(out))).find(c=>c.classId===picked[0].classId)),
    next:'Use mapPath in later calls.'+(anyNumber||level!==undefined?' health, attack and defence are the base values of the class: with the growth curve the class has, the character\'s real numbers are these times the multiplier of its level (the health bar of a playtest shows the real ones). A game in which the player is meant to be in danger wants a health the enemies can wear down: the default 10000 makes the character all but unkillable.':'')};
}

// Signals (信号) are defined in section 10 next to the graphs. A signal is three node definitions, each wrapped as
// {2: {1: definition}}: the server node that sends it, the server node that hears it and the client node that sends it to
// the server. A definition is {4: head, pins..., 107: links to its two siblings by name, 200: title, 203: 1 send / 2 listen,
// 204: 8}; every pin carries a serial number (field 8) that runs through the whole save. Field 5 of the section is the
// register: the heads of all definitions ({2: head}...) and then one {3: {1: send, 2: listen, 3: name, 6: 1, 7: client}}
// per signal. Ids start at 1610612737. Only signals without parameters are written here; the three definitions and the
// register entry of the official sample 信号 are reproduced byte for byte.
// Since game 7.1 a signal has a fourth definition, 发送客户端脚本信号: the server node that sends the signal to the
// client scripts (Lua) of one player. The editor adds it to every signal of a save it opens (seen 2026-10-13 on four
// saves of ours: tests/fixtures/editor-2026-10-13-signal4.gil and -signal4plain.gil): a definition with an input pin
// 目标玩家 before the parameter, the name of the signal as the value of its name pin, links to its three siblings
// under 1006/108, its own id as a fourth link in each of the three, and one more than they have in field 5. It is not
// in the register. Its pins take the serial numbers after the three definitions': in, out, the name, then (one
// number left out without a parameter, two with one) the player and the parameter.
const SIGNAL_BASE=1610612736;
const signalHead=(id,client)=>Buffer.concat([field(1,0,10001),field(2,0,client?20002:20000),field(3,0,22001),field(5,0,id)]);
export function signalRecords({send,listen,client,script,name,serial,parameter}){
  // parameter: the name of one string the signal carries. In the official sample 信号 the signal 平台 has one, 状态: a
  // pin more in each of the three definitions (numbered after the twelve fixed pins), {4: {1: name, 2: 6, 3: 1, 4 5 6:
  // those pin numbers}} in the register entry, and 2 instead of 1 in field 5 of each definition and field 6 of the entry.
  // Other types and a second parameter are not written: no sample of the current format shows them on all three sides.
  const has=parameter!==undefined,revision=has?2:1;
  const text=v=>Buffer.from(v,'utf8'),own=(id,isClient,count=revision)=>field(4,2,Buffer.concat([field(1,2,signalHead(id,isClient)),
    field(2,2,isClient?Buffer.concat([field(1,0,10001),field(2,0,20002),field(3,0,22000),field(5,0,2000)]):signalHead(id,false)),field(4,2,blank),field(5,0,count)]));
  const stringType=n=>Buffer.concat([field(1,0,5),field(3,0,n),field(4,0,n)]);
  const input=(type,n)=>has?[field(102,2,Buffer.concat([field(1,2,text(parameter)),field(2,0,1),field(3,2,field(1,0,3)),field(4,2,type),field(8,0,n)]))]:[];
  const flow=(fid,kind,n)=>field(fid,2,Buffer.concat([field(2,0,1),field(3,2,field(1,0,kind)),field(4,2,blank),field(8,0,n)]));
  const nameTypeBody=Buffer.concat([field(1,0,5),field(7,2,field(1,0,4))]),nameDefault=Buffer.concat([field(1,0,6),field(2,0,1)]);
  const namePin=n=>field(106,2,Buffer.concat([field(1,2,text('信号名')),field(4,2,nameTypeBody),field(5,2,nameDefault),field(8,0,n)]));
  const out=(label,place,type,n)=>field(103,2,Buffer.concat([field(1,2,text(label)),field(2,0,1),field(3,2,Buffer.concat([field(1,0,4),...(place?[field(2,0,place)]:[])])),field(4,2,type),field(8,0,n)]));
  const entity=Buffer.concat([field(3,0,1),field(4,0,1)]),guidType=Buffer.concat([field(1,0,1),field(3,0,2),field(4,0,2)]);
  const fourth=script?signalHead(script,false):null;
  const link=(code,slot,a,b,c=fourth)=>field(107,2,Buffer.concat([field(1,0,code),field(slot,2,Buffer.concat([field(1,2,text(name)),field(2,2,a),field(3,2,b),...(c?[field(4,2,c)]:[])]))]));
  const tail=(title,side)=>[field(200,2,text(title)),field(203,0,side),field(204,0,8)];
  const sendDef=Buffer.concat([own(send,false),flow(100,1,serial),flow(101,2,serial+1),...input(stringType(6),serial+12),namePin(serial+2),link(1001,101,signalHead(listen,false),signalHead(client,true)),...tail('发送信号',1)]);
  const listenDef=Buffer.concat([own(listen,false),flow(101,2,serial+3),out('事件源实体',0,entity,serial+5),out('事件源GUID',1,guidType,serial+6),out('信号来源实体',2,entity,serial+7),...(has?[out(parameter,3,stringType(6),serial+13)]:[]),namePin(serial+4),
    link(1002,102,signalHead(send,false),signalHead(client,true)),...tail('监听信号',2)]);
  const clientDef=Buffer.concat([own(client,true),flow(100,1,serial+8),flow(101,2,serial+9),...input(stringType(9),serial+14),
    field(106,2,Buffer.concat([field(2,0,1),field(3,2,field(1,0,5)),field(4,2,Buffer.concat([field(1,0,2),field(4,0,3)])),field(5,2,Buffer.concat([field(1,0,5),field(2,0,1),field(100,2,field(1,0,200124))])),field(8,0,serial+10)])),
    field(106,2,Buffer.concat([field(1,2,text('信号名')),field(2,0,1),field(3,2,Buffer.concat([field(1,0,5),field(2,0,1)])),field(4,2,Buffer.concat([field(1,0,5),field(4,0,9),field(7,2,field(1,0,4))])),field(5,2,nameDefault),field(8,0,serial+11)])),
    link(1001,101,signalHead(listen,false),signalHead(send,false)),...tail('向服务器节点图发送信号',1)]);
  const carried=has?[field(4,2,Buffer.concat([field(1,2,text(parameter)),field(2,0,6),field(3,0,1),field(4,0,serial+12),field(5,0,serial+13),field(6,0,serial+14)]))]:[];
  const register=Buffer.concat([field(1,2,signalHead(send,false)),field(2,2,signalHead(listen,false)),field(3,2,text(name)),...carried,field(6,0,revision),field(7,2,signalHead(client,true))]);
  const at=serial+(has?15:12);
  const scriptDef=script?Buffer.concat([own(script,false,revision+1),flow(100,1,at),flow(101,2,at+1),
    field(102,2,Buffer.concat([field(1,2,text('目标玩家')),field(2,0,1),field(3,2,field(1,0,3)),field(4,2,entity),field(8,0,at+(has?5:4))])),
    ...(has?[field(102,2,Buffer.concat([field(1,2,text(parameter)),field(2,0,1),field(3,2,Buffer.concat([field(1,0,3),field(2,0,1)])),field(4,2,stringType(6)),field(8,0,at+6)]))]:[]),
    field(106,2,Buffer.concat([field(1,2,text('信号名')),field(4,2,Buffer.concat([field(1,0,5),field(2,2,Buffer.concat([field(1,0,5),field(2,0,1),field(4,2,Buffer.concat([field(1,0,1),field(100,2,blank)])),field(105,2,field(1,2,text(name)))])),field(6,0,1),field(7,2,field(1,0,4))])),field(5,2,nameDefault),field(8,0,at+2)])),
    link(1006,108,signalHead(send,false),signalHead(client,true),signalHead(listen,false)),...tail('发送客户端脚本信号',1)]):null;
  return {definitions:[sendDef,listenDef,clientDef,...(scriptDef?[scriptDef]:[])],heads:[signalHead(send,false),signalHead(listen,false),signalHead(client,true)],register,pins:(has?15:12)+(scriptDef?(has?7:5):0)};
}
export {clientScriptSignalHeads} from './scene/signal-definitions.mjs';
function signalState(root){
  const parts=fields(one(root,10)),definitions=parts.filter(f=>f.id===2&&f.wire===2).flatMap(f=>fields(f.data).filter(x=>x.id===1&&x.wire===2).map(x=>x.data));
  const ids=definitions.map(d=>{try{return varintOf(one(one(d,4),1),5);}catch{return 0;}});
  // The highest pin serial in use: field 8 of every pin block of every definition.
  let serial=0;for(const d of definitions)for(const pin of fields(d).filter(f=>f.wire===2&&f.id>=100&&f.id<=106)){const n=varintOf(pin.data,8);if(n>serial)serial=n;}
  const register=parts.find(f=>f.id===5&&f.wire===2),names=register?fields(register.data).filter(f=>f.id===3&&f.wire===2).map(f=>fields(f.data).find(x=>x.id===3&&x.wire===2)?.data.toString('utf8')??''):[];
  return {parts,ids,serial,register,names};
}
export function listSignals({mapPath}){
  const file=resolve(mapPath);
  return {mapPath:file,signals:signalState(container(fs.readFileSync(file))).names,
    note:'A server graph sends one with f.sendSignal(\'name\') and hears it with .onSignal(\'name\', (evt, f) => {...}) on any entity; every graph that listens runs.'};
}
export function addSignal({mapPath,name,parameter,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  if(fields(root).filter(f=>f.id===10&&f.wire===2).length!==1)fail('UNSUPPORTED_SAVE','The save does not have the node graph section this tool knows.');
  const state=signalState(root);
  if(state.names.includes(name))fail('DUPLICATE_SIGNAL_NAME','The save already has a signal with this name.',{name});
  if(/^client:/.test(name))fail('INVALID_SIGNAL_NAME','A signal name cannot begin with "client:": in a graph that prefix says the signal goes to the client scripts (f.sendSignal(\'client:name\', player)).',{name});
  const first=Math.max(SIGNAL_BASE,...state.ids)+1,made=signalRecords({send:first,listen:first+1,client:first+2,script:first+3,name,serial:state.serial+1,parameter});
  const heads=made.heads.map(h=>field(2,2,h)),entry=field(3,2,made.register);
  const register=state.register?(()=>{const items=fields(state.register.data);let last=-1;items.forEach((f,i)=>{if(f.id===2&&f.wire===2)last=i;});
    return Buffer.concat([...items.slice(0,last+1).map(f=>f.raw),...heads,...items.slice(last+1).map(f=>f.raw),entry]);})():Buffer.concat([...heads,entry]);
  // Order of the section: graphs (1), definitions (2), what else there is (3), the register (5), the closing field (7).
  const before=state.parts.filter(f=>f.id<=2),after=state.parts.filter(f=>f.id>2&&f.id!==5),low=after.filter(f=>f.id<5),high=after.filter(f=>f.id>5);
  root=replace(root,10,2,Buffer.concat([...before.map(f=>f.raw),...made.definitions.map(d=>field(2,2,field(1,2,d))),...low.map(f=>f.raw),field(5,2,register),...high.map(f=>f.raw)]));
  const out=output(workspace,file,outputName,'-signal');fs.writeFileSync(out,wrap(bytes,root));
  return {mapPath:out,source:file,name,...(parameter!==undefined?{parameter}:{}),definitionIds:[first,first+1,first+2,first+3],
    next:'Use mapPath in later calls. A graph sends it with f.sendSignal(\''+name+'\''+(parameter!==undefined?', <a string>':'')+') and any graph hears it with .onSignal(\''+name+'\', (evt, f) => {...})'+(parameter!==undefined?'; the string it carries is the parameter "'+parameter+'" of the event (a number travels as text: f.dataTypeConversion(n, \'str\'))':'')+'. This is how one thing tells many: the sender does not know who listens. To the client scripts (Lua) of one player a graph sends it with f.sendSignal(\'client:'+name+'\', player'+(parameter!==undefined?', <a string>':'')+'), and a script hears it with script:RegisterServerSignalHandler("'+name+'", function(name, params) ... end).'};
}

// Global timers (全局计时器) are defined in section 12: {1: name, 2: seconds, 3: 1 for a countdown, 501: place in the list}.
// The entity that holds one names it in its component record of kind 16 ({1: name}...); only the player and the stage
// entity can hold them. A graph starts it with f.startGlobalTimer(holder, name) and the holder's graph hears
// whenGlobalTimerIsTriggered when a countdown reaches zero. Read from the official samples 全局计时器 and 玩法流程.
function timerRecords(root){
  return fields(root).filter(f=>f.id===12&&f.wire===2).flatMap(s=>fields(s.data).filter(f=>f.id===1&&f.wire===2)).map(f=>{
    const parts=fields(f.data),seconds=parts.find(x=>x.id===2&&x.wire===5);
    return {name:parts.find(x=>x.id===1&&x.wire===2)?.data.toString('utf8')??'',seconds:seconds?Math.round(seconds.data.readFloatLE(0)*1000)/1000:0,countdown:varintOf(f.data,3)===1};
  });
}
export const timerRecord=({name,seconds,countdown,place})=>Buffer.concat([field(1,2,Buffer.from(name,'utf8')),field(2,5,f32(seconds)),countdown?field(3,0,1):blank,field(501,0,place)]);
export function listGlobalTimers({mapPath}){
  const file=resolve(mapPath);
  return {mapPath:file,timers:timerRecords(container(fs.readFileSync(file))),
    note:'f.startGlobalTimer(holder, name) starts one; the holder is the player entity or the stage entity it was added to.'};
}
export function addGlobalTimer({mapPath,name,seconds,countdown=true,holder='player',outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  const existing=timerRecords(root);
  if(existing.some(t=>t.name===name))fail('DUPLICATE_TIMER_NAME','The save already has a global timer with this name.',{name});
  if(!(seconds>0&&seconds<=86400))fail('INVALID_TIMER','seconds is the length of the timer, up to a day.',{seconds});
  const added=field(1,2,timerRecord({name,seconds,countdown,place:existing.length+1})),top=fields(root);
  if(top.some(f=>f.id===12&&f.wire===2))root=replace(root,12,2,Buffer.concat([one(root,12),added]));
  else{let at=top.findIndex(f=>f.id>12);if(at<0)at=top.length;root=Buffer.concat([...top.slice(0,at).map(f=>f.raw),field(12,2,added),...top.slice(at).map(f=>f.raw)]);}
  // The holder names the timer in its component record of kind 16.
  const target=holder==='player'?{prefab:'player'}:{entity:holder==='stage'?'关卡实体':holder};
  const done=rewriteTargets(root,target,(data,layout)=>setBlock(data,layout.records,16,old=>{
    const body=old&&fields(old).find(f=>f.id===26&&f.wire===2)?.data;
    return record(16,Buffer.concat([body??blank,field(1,2,Buffer.from(name,'utf8'))]));
  }));
  root=done.root;
  const out=output(workspace,file,outputName,'-timer');fs.writeFileSync(out,wrap(bytes,root));
  return {mapPath:out,source:file,name,seconds,countdown,holder,heldBy:{templates:done.templates,placed:done.placed},
    next:'Use mapPath in later calls. A graph starts it with f.startGlobalTimer('+(holder==='player'?'player':'the stage entity')+', \''+name+'\'); pauseGlobalTimer, recoverGlobalTimer, stopGlobalTimer and modifyGlobalTimer (add or take seconds) take the same two arguments. When a countdown ends, a graph attached to the holder hears whenGlobalTimerIsTriggered. scene_add_timer_display shows it on the screen.'};
}
export function addTimerDisplay({mapPath,name,timer,position=[0,380],size=[156,40],outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  const records=uiRecords(root),layout=records.find(r=>r.structure.includes(7)),library=records.find(r=>r.structure.includes(14));
  if(!layout||!library)fail('UNSUPPORTED_SAVE','The save has no default layout or no control library to add to.');
  if(records.some(r=>r.name===name))fail('DUPLICATE_CONTROL_NAME','The interface already has a control with this name.',{name});
  if(!timerRecords(root).some(t=>t.name===timer))fail('TIMER_NOT_FOUND','No global timer with this name. Make it with scene_add_global_timer.',{timer});
  if(Math.abs(position[0])>800||Math.abs(position[1])>450||!(size[0]>0&&size[0]<=1600&&size[1]>0&&size[1]<=900))fail('INVALID_RECT','position is [x, y] from the screen centre on a 1600 x 900 canvas, y up; size is [width, height].',{position,size});
  const placed=placeControl(root,records,layout,library,{name,states:[0,1,2,3].map(()=>({position,size})),timer});
  const out=output(workspace,file,outputName,'-clock');fs.writeFileSync(out,wrap(bytes,placed.root));
  return {mapPath:out,source:file,controlId:placed.controlId,name,timer,position,size,
    next:'Use mapPath in later calls. The control shows the global timer "'+timer+'" as running time once a graph has started it.'};
}

// A text box (文本框): the same three records, with text as content. Read from the official sample 界面控件 (功能示例-1
// 积分值), reproduced byte for byte. On an account whose 奇匠 level is 1 a text box shows nothing in play (measured
// 2026-10-10 with the official sample itself): this is for accounts of level 2 and up.
export function addTextBox({mapPath,name,text,fontSize=30,position=[0,300],size=[400,60],outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);const root=container(bytes);
  const records=uiRecords(root),layout=records.find(r=>r.structure.includes(7)),library=records.find(r=>r.structure.includes(14));
  if(!layout||!library)fail('UNSUPPORTED_SAVE','The save has no default layout or no control library to add to.');
  if(records.some(r=>r.name===name))fail('DUPLICATE_CONTROL_NAME','The interface already has a control with this name.',{name});
  if(Math.abs(position[0])>800||Math.abs(position[1])>450||!(size[0]>0&&size[0]<=1600&&size[1]>0&&size[1]<=900))fail('INVALID_RECT','position is [x, y] from the screen centre on a 1600 x 900 canvas, y up; size is [width, height].',{position,size});
  // The variables a text names have to exist where it says: the player's own are checked here.
  const named=[...text.matchAll(/\{1:(ps|lv|p[1-8])\.([^}]+)\}/g)].map(m=>({where:m[1],name:m[2]}));
  const held=listComponents({mapPath:file,prefab:'player'}).found[0].variables.map(v=>v.name),missing=named.filter(v=>v.where!=='lv'&&!held.includes(v.name)).map(v=>v.name);
  if(missing.length)fail('VARIABLE_NOT_FOUND','The text names custom variables the player template does not have. Add them first: scene_add_components {prefab: "player", variables: [...]}.',{missing});
  const placed=placeControl(root,records,layout,library,{name,states:[0,1,2,3].map(()=>({position,size})),words:{text,fontSize}});
  const out=output(workspace,file,outputName,'-text');fs.writeFileSync(out,wrap(bytes,placed.root));
  return {mapPath:out,source:file,controlId:placed.controlId,name,text,fontSize,position,size,variables:named,
    next:'Use mapPath in later calls. The text follows the variables it names as a graph changes them. On an account of 奇匠 level 1 the box shows nothing in play (custom text needs level 2): check with a playtest screenshot before a game relies on it.'};
}

// An image (图片): a picture of the platform or a plain rectangle in a colour, which is how a screen says something
// without words (a panel behind the bars, an icon beside a bar). The content is the one of the image controls in the
// official sample 界面手柄适配 (126 of them); the three records around it are those of the other controls.
// Seen in play on 2026-10-13: the panel, all 22 pictures and two coloured rectangles show, at the place and size asked for.
// Pictures seen in that sample (the catalogue of the editor is not readable from outside), and what each shows: all 22
// were put on the screen of a playtest and looked at (2026-10-13, examples/images; an account of 奇匠 level 1 shows them).
export const IMAGE_CATALOGUE=[[100001,'a plain rectangle: with a colour and an opacity, a panel or a mark'],[106025,'a plain disc (a round mark, a dot of a row of lives)'],[106029,'a plain disc, slightly softer at the edge'],
  [107045,'a dark purple pentagon with rounded corners (a badge behind an icon)'],[107171,'a blue scroll lying on its side (the base of a bar)'],[105163,'a blue arrow pointing right'],
  [101075,'a question mark, gold on blue'],[101077,'a note of paper with lines, gold on blue (a task)'],[102029,'a sword across a shield, pale'],[109069,'the letter B of a rank, purple'],
  [105068,'a yellow fruit'],[105069,'a green fruit'],[111119,'a plate of food'],[105312,'a burning chest with a face, red'],[105313,'a green gift box with a face'],[105314,'a blue gift box with a face'],
  [105142,'a round orange bird'],[105143,'a round red bird'],[105144,'a round green monkey'],[105145,'a round grey bird'],[105167,'a chick in a speech bubble, calm'],[105168,'a chick in a speech bubble, angry']];
export const KNOWN_IMAGES=IMAGE_CATALOGUE.map(x=>x[0]);
export function addImage({mapPath,name,image=100001,colour='#ffffff',opacity=1,position=[0,300],size=[100,100],hidden=false,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);const root=container(bytes);
  const records=uiRecords(root),layout=records.find(r=>r.structure.includes(7)),library=records.find(r=>r.structure.includes(14));
  if(!layout||!library)fail('UNSUPPORTED_SAVE','The save has no default layout or no control library to add to.');
  if(records.some(r=>r.name===name))fail('DUPLICATE_CONTROL_NAME','The interface already has a control with this name.',{name});
  if(Math.abs(position[0])>800||Math.abs(position[1])>450||!(size[0]>0&&size[0]<=1600&&size[1]>0&&size[1]<=900))fail('INVALID_RECT','position is [x, y] from the screen centre on a 1600 x 900 canvas, y up; size is [width, height].',{position,size});
  if(!/^#[0-9a-fA-F]{6}$/.test(colour))fail('INVALID_COLOUR','colour is "#rrggbb".',{colour});
  const packed=(BigInt(Math.round(opacity*255))<<24n)|BigInt(parseInt(colour.slice(1),16));
  const placed=placeControl(root,records,layout,library,{name,states:[0,1,2,3].map(()=>({position,size})),image:{id:image,colour:packed},hidden});
  const out=output(workspace,file,outputName,'-image');fs.writeFileSync(out,wrap(bytes,placed.root));
  return {mapPath:out,source:file,controlId:placed.controlId,name,image,colour,opacity,position,size,known:KNOWN_IMAGES.includes(image),
    shows:IMAGE_CATALOGUE.find(x=>x[0]===image)?.[1],inLibrary:imageIdKnown(image),
    next:'Use mapPath in later calls. Controls are drawn in the order they were added: a panel first, then what lies on it.'+(imageIdKnown(image)?'':' This id is not in the picture library (image_catalog lists the ranges of ids there are): it may show nothing.')};
}

// An interaction button (交互按钮): the same three records as a bar, with the button as content. Read from the official
// sample 界面控件 (功能示例-2 添加积分按钮), which keeps the editor's default settings. The first number of the content
// ({501: 1}) is the key: with 2 the button showed and answered to the 2 key (seen in play, 2026-10-11).
export function addButton({mapPath,name,position=[0,-180],size=[100,100],key=1,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  const records=uiRecords(root),layout=records.find(r=>r.structure.includes(7)),library=records.find(r=>r.structure.includes(14));
  if(!layout||!library)fail('UNSUPPORTED_SAVE','The save has no default layout or no control library to add to.');
  if(records.some(r=>r.name===name))fail('DUPLICATE_CONTROL_NAME','The interface already has a control with this name.',{name});
  if(Math.abs(position[0])>800||Math.abs(position[1])>450||!(size[0]>0&&size[0]<=1600&&size[1]>0&&size[1]<=900))fail('INVALID_RECT','position is [x, y] from the screen centre on a 1600 x 900 canvas, y up; size is [width, height].',{position,size});
  const placed=placeControl(root,records,layout,library,{name,states:[0,1,2,3].map(()=>({position,size})),button:{key}});
  const out=output(workspace,file,outputName,'-button');fs.writeFileSync(out,wrap(bytes,placed.root));
  return {mapPath:out,source:file,controlId:placed.controlId,name,controlGroupIndex:placed.controlId,position,size,key,
    next:'Use mapPath in later calls. The button shows as a round icon with its key under it; the player presses that key ('+key+'). That raises whenUiControlGroupIsTriggered in a graph on the player template (scene_add_graph attachToPrefab "player"; only the player that pressed hears it): evt.eventSourceEntity is the player, and evt.uiControlGroupIndex is '+placed.controlId+' for this button (if(evt.uiControlGroupIndex==='+placed.controlId+'n){...}).'};
}

// Preset points (预设点) are in the level settings, section 11 field 5: {1: {1: id, 2: position, 3: rotation, 501: name,
// 502: 1}...}, ids from 1073741825. Field 3 of the section holds the spawn points: {1: 1, 2: {1: 1, 2: preset point id,
// 501: name, 502: player templates (packed)}}. Every map has the point 1073741825 and a spawn point that names it, so the
// place and the facing a player starts with are that point's. A graph reads a point with
// f.queryPresetPointPositionRotation(id): official graphs pass the id (read from the samples 玩法流程 and 全局计时器).
const POINT_FIRST_ID=1073741825;
function levelParts(root){
  const section=fields(root).filter(f=>f.id===11&&f.wire===2);
  if(section.length!==1)fail('UNSUPPORTED_SAVE','The save has no level settings section.');
  return fields(section[0].data);
}
const vec3Of=b=>{const p=b?fields(b):[],n=id=>{const f=p.find(x=>x.id===id&&x.wire===5);return f?f.data.readFloatLE(0):0;};return [n(1),n(2),n(3)];};
const round3=v=>v.map(n=>Math.round(n*1000)/1000);
function presetPoints(root){
  const list=levelParts(root).find(f=>f.id===5&&f.wire===2);
  return list?fields(list.data).filter(f=>f.id===1&&f.wire===2).map(f=>{const p=fields(f.data),part=id=>p.find(x=>x.id===id&&x.wire===2)?.data;
    return {pointId:varintOf(f.data,1),name:part(501)?.toString('utf8')??'',position:vec3Of(part(2)),rotation:vec3Of(part(3))};}):[];
}
function spawnPoints(root){
  const list=levelParts(root).find(f=>f.id===3&&f.wire===2);
  return list?fields(list.data).filter(f=>f.id===2&&f.wire===2).map(f=>({pointId:varintOf(f.data,2),name:fields(f.data).find(x=>x.id===501&&x.wire===2)?.data.toString('utf8')??''})):[];
}
export const presetPointRecord=({id,name,position,rotation})=>Buffer.concat([field(1,0,id),field(2,2,xyz(position)),field(3,2,xyz(rotation)),field(501,2,Buffer.from(name,'utf8')),field(502,0,1)]);
const rewriteLevelField=(root,id,build)=>replace(root,11,2,Buffer.concat(levelParts(root).map(f=>f.id===id&&f.wire===2?field(id,2,build(f.data)):f.raw)));
export function listPresetPoints({mapPath}){
  const file=resolve(mapPath),root=container(fs.readFileSync(file)),spawns=spawnPoints(root);
  return {mapPath:file,points:presetPoints(root).map(p=>({...p,position:round3(p.position),rotation:round3(p.rotation),spawn:spawns.some(s=>s.pointId===p.pointId)})),
    note:'A player starts at the point marked spawn, facing its rotation (degrees about y). A graph reads any point with f.queryPresetPointPositionRotation(pointId).'};
}
export function addPresetPoint({mapPath,name,position,rotation=[0,0,0],outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  const existing=presetPoints(root);
  if(existing.some(p=>p.name===name))fail('DUPLICATE_POINT_NAME','The save already has a preset point with this name.',{name,pointId:existing.find(p=>p.name===name).pointId});
  if(![position,rotation].every(v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite)))fail('INVALID_POINT','position and rotation are [x, y, z].',{position,rotation});
  if(!levelParts(root).some(f=>f.id===5&&f.wire===2))fail('UNSUPPORTED_SAVE','The save has no list of preset points.');
  const pointId=Math.max(POINT_FIRST_ID-1,...existing.map(p=>p.pointId))+1;
  root=rewriteLevelField(root,5,data=>Buffer.concat([data,field(1,2,presetPointRecord({id:pointId,name,position,rotation}))]));
  const out=output(workspace,file,outputName,'-point');fs.writeFileSync(out,wrap(bytes,root));
  return {mapPath:out,source:file,pointId,name,position,rotation,
    next:'Use mapPath in later calls. In a graph: const at=f.queryPresetPointPositionRotation('+pointId+'n) gives the position and rotation of this point, for teleporting players or creating things there without writing coordinates into the graph.'};
}
export function setSpawn({mapPath,position,rotation,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  const spawns=spawnPoints(root),points=presetPoints(root);
  if(spawns.length!==1)fail('UNSUPPORTED_SAVE','This tool handles a save with exactly one spawn point.',{spawnPoints:spawns.length});
  const point=points.find(p=>p.pointId===spawns[0].pointId);
  if(!point)fail('UNSUPPORTED_SAVE','The spawn point names a preset point that is not in the save.',{pointId:spawns[0].pointId});
  if(position===undefined&&rotation===undefined)fail('NOTHING_TO_SET','Give position, rotation or both.');
  if(![position??[0,0,0],rotation??[0,0,0]].every(v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite)))fail('INVALID_POINT','position and rotation are [x, y, z].',{position,rotation});
  const next={id:point.pointId,name:point.name,position:position??point.position,rotation:rotation??point.rotation};
  root=rewriteLevelField(root,5,data=>Buffer.concat(fields(data).map(f=>f.id===1&&f.wire===2&&varintOf(f.data,1)===point.pointId?field(1,2,presetPointRecord(next)):f.raw)));
  const out=output(workspace,file,outputName,'-spawn');fs.writeFileSync(out,wrap(bytes,root));
  return {mapPath:out,source:file,pointId:point.pointId,before:{position:round3(point.position),rotation:round3(point.rotation)},after:{position:round3(next.position),rotation:round3(next.rotation)},
    next:'Use mapPath in later calls. Players now start here, facing this rotation; a graph no longer has to teleport them at the start. The camera starts behind the character, so the facing also decides the first view.'};
}

// Respawn points (复苏点) and how many may play (人数设置). Read from the official samples 角色设置, 基础运动, 镜头设置,
// 界面控件 and 建成我的第一个奇域 (respawn) and from every sample of CN 7.1 (player count).
// A respawn point is an entry of the level settings, section 11 field 4: {1: {1: number, 2: preset point id, 501: name}}.
// A player revives only at points of its own list, which is in the revive settings of the player template (property 5,
// {14: {..., 10: the numbers of its respawn points, packed}}); a graph adds and removes points of that list while the
// game runs with f.activateRevivePoint(player, number) and f.deactivateRevivePoint(player, number).
// The groups of players are field 6 of the level settings: {1: {1: 1, 3: 1, 4: the player slots (packed, 1 to max),
// 501: least, 502: most}}; a new map has one group of 1 to 8.
function respawnPoints(root){
  const list=levelParts(root).find(f=>f.id===4&&f.wire===2);
  return list?fields(list.data).filter(f=>f.id===1&&f.wire===2).map(f=>({respawnId:varintOf(f.data,1),pointId:varintOf(f.data,2),name:fields(f.data).find(x=>x.id===501&&x.wire===2)?.data.toString('utf8')??''})):[];
}
export const respawnRecord=({id,pointId,name})=>Buffer.concat([field(1,0,id),field(2,0,pointId),field(501,2,Buffer.from(name,'utf8'))]);
export function listRespawnPoints({mapPath}){
  const file=resolve(mapPath),root=container(fs.readFileSync(file)),points=presetPoints(root);
  const group=levelParts(root).find(f=>f.id===6&&f.wire===2),first=group&&fields(group.data).find(f=>f.id===1&&f.wire===2);
  return {mapPath:file,respawnPoints:respawnPoints(root).map(r=>({...r,position:round3(points.find(p=>p.pointId===r.pointId)?.position??[0,0,0])})),
    players:first?{min:varintOf(first.data,501),max:varintOf(first.data,502)}:null,revive:reviveSettings(root),
    note:'A character that is down (health at 0, or fallen out of the world) revives at a respawn point of its player. f.activateRevivePoint(player, respawnId) and f.deactivateRevivePoint(player, respawnId) change which points a player may use while the game runs (a checkpoint: activate the one just reached and deactivate the one before).'};
}
export function addRespawnPoint({mapPath,point,position,rotation=[0,0,0],name,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  if((point===undefined)===(position===undefined))fail('INVALID_POINT','Give point (the id or name of a preset point that exists) or position (a preset point is made there).',{point,position});
  const existing=respawnPoints(root),points=presetPoints(root),respawnId=Math.max(0,...existing.map(r=>r.respawnId))+1,label=name??'复苏点'+respawnId;
  if(!levelParts(root).some(f=>f.id===4&&f.wire===2))fail('UNSUPPORTED_SAVE','The save has no list of respawn points in its level settings.');
  if(existing.some(r=>r.name===label))fail('DUPLICATE_POINT_NAME','The save already has a respawn point with this name.',{name:label});
  let pointId;
  if(point!==undefined){
    const hits=points.filter(p=>typeof point==='number'?p.pointId===point:p.name===point);
    if(hits.length!==1)fail('POINT_NOT_FOUND',hits.length?'Several preset points have this name; give the id.':'No preset point with this id or name. scene_list_preset_points lists them.',{point});
    pointId=hits[0].pointId;
  }else{
    if(![position,rotation].every(v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite)))fail('INVALID_POINT','position and rotation are [x, y, z].',{position,rotation});
    if(points.some(p=>p.name===label))fail('DUPLICATE_POINT_NAME','The save already has a preset point with this name.',{name:label});
    pointId=Math.max(POINT_FIRST_ID-1,...points.map(p=>p.pointId))+1;
    root=rewriteLevelField(root,5,data=>Buffer.concat([data,field(1,2,presetPointRecord({id:pointId,name:label,position,rotation}))]));
  }
  if(existing.some(r=>r.pointId===pointId))fail('ALREADY_A_RESPAWN_POINT','This preset point is a respawn point already.',{pointId});
  root=rewriteLevelField(root,4,data=>Buffer.concat([data,field(1,2,respawnRecord({id:respawnId,pointId,name:label}))]));
  // The player template lists the points its players may use.
  let listed=0;
  root=rewriteTargets(root,{prefab:'player'},(data,layout)=>setBlock(data,layout.properties,5,old=>{
    if(!old)fail('UNSUPPORTED_SAVE','The player template has no revive settings to list the point in.');
    const settings=fields(one(old,14)),at=settings.findIndex(f=>f.id===10&&f.wire===2);listed++;
    const body=at>=0?settings.map((f,i)=>i===at?field(10,2,Buffer.concat([f.data,varint(respawnId)])):f.raw):[...settings.map(f=>f.raw),field(10,2,varint(respawnId))];
    return Buffer.concat([field(1,0,5),field(14,2,Buffer.concat(body))]);
  })).root;
  const out=output(workspace,file,outputName,'-respawn');fs.writeFileSync(out,wrap(bytes,root));
  return {mapPath:out,source:file,respawnId,pointId,name:label,position:round3(position??points.find(p=>p.pointId===pointId).position),
    next:'Use mapPath in later calls. A character that goes down (health at 0) gets the platform\'s revive screen and comes back at a respawn point of its player; one that falls out of the world is put back at once and loses part of its health. From a graph: f.reviveCharacter(character) revives without waiting, f.setPlayerRemainingRevives(player, n) gives a number of lives, f.setPlayerReviveTime(player, seconds), f.allowForbidPlayerToRevive(player, false) ends them; f.activateRevivePoint(player, '+respawnId+'n) and f.deactivateRevivePoint(player, '+respawnId+'n) make this point usable or not (checkpoints). Events: whenTheCharacterIsDown, whenCharacterRevives, whenAllPlayerSCharactersAreDown, whenPlayerIsAbnormallyDownedAndRevives (the fall out of the world). Written as the official samples have it; not yet tried in play by this tool\'s authors.'};
}
// The revive settings of the player template (property 5, {14: {...}}), read by changing them by hand on 2026-10-13:
// 2 the share of the greatest health lost by a fall out of the world (%), 3 the health a revived character has (%),
// 6 how many times a player may revive, 7 the seconds before it may, 8: 1 when it revives by itself, 9: 1 when the
// revive screen is shown, 10 the respawn points; 1 is how the point is chosen (1601 the nearest), and 4 and 5 are
// "may revive" and "the number of revives is limited", both on in every save seen (which is which was not read).
const REVIVE_NUMBERS={fallLossPercent:[2,5],healthPercent:[3,5],lives:[6,0],seconds:[7,0]},REVIVE_FLAGS={auto:8,showScreen:9};
function reviveSettings(root){
  const player=prefabRecords(root).find(p=>p.assetId===PLAYER_BASE);if(!player)return null;
  let found=null;
  for(const s of fields(root).filter(f=>f.id===4&&f.wire===2))for(const e of fields(s.data).filter(f=>f.id===1&&f.wire===2))if(varintOf(e.data,1)===player.prefabId)
    for(const p of fields(e.data).filter(f=>f.id===6&&f.wire===2))if(kindOf(p.data)===5)try{found=one(p.data,14);}catch{}
  if(!found)return null;
  const num=id=>{const f=fields(found).find(x=>x.id===id);return !f?null:f.wire===5?Math.round(f.data.readFloatLE(0)*1000)/1000:Number(f.value);};
  return {seconds:num(7),auto:num(8)===1,showScreen:num(9)===1,lives:num(6),healthPercent:num(3),fallLossPercent:num(2)};
}
export function setRevive({mapPath,seconds,auto,showScreen,lives,healthPercent,fallLossPercent,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  const wanted={seconds,auto,showScreen,lives,healthPercent,fallLossPercent};
  if(Object.values(wanted).every(v=>v===undefined))fail('NOTHING_TO_SET','Give seconds, auto, showScreen, lives, healthPercent or fallLossPercent.');
  const before=reviveSettings(root);
  if(!before)fail('UNSUPPORTED_SAVE','The player template has no revive settings.');
  root=rewriteTargets(root,{prefab:'player'},(data,layout)=>setBlock(data,layout.properties,5,old=>{
    let parts=fields(one(old,14)).map(f=>({id:f.id,raw:f.raw}));
    const put=(id,raw)=>{parts=parts.filter(p=>p.id!==id);if(raw)parts.push({id,raw});};
    for(const [key,[id,wire]] of Object.entries(REVIVE_NUMBERS))if(wanted[key]!==undefined)put(id,wire===5?field(id,5,f32(wanted[key])):field(id,0,wanted[key]));
    for(const [key,id] of Object.entries(REVIVE_FLAGS))if(wanted[key]!==undefined)put(id,wanted[key]?field(id,0,1):null);
    parts.sort((a,b)=>a.id-b.id);
    return Buffer.concat([field(1,0,5),field(14,2,Buffer.concat(parts.map(p=>p.raw)))]);
  })).root;
  const out=output(workspace,file,outputName,'-revive');fs.writeFileSync(out,wrap(bytes,root));
  return {mapPath:out,source:file,before,revive:reviveSettings(container(fs.readFileSync(out))),
    next:'Use mapPath in later calls. A character whose health reaches 0 comes back at a respawn point of its player (scene_add_respawn_point) after seconds; with auto true and showScreen false it does so by itself, with no screen in between. lives is how many times; when they are used up the player stays down, and a graph hears whenAllPlayerSCharactersAreDown (settle the stage as lost there). A game in which going down ends the round sets lives 0 or settles in whenTheCharacterIsDown.'};
}
export const playerGroupRecord=({min,max})=>Buffer.concat([field(1,0,1),field(3,0,1),field(4,2,Buffer.concat(Array.from({length:max},(_,i)=>varint(i+1)))),field(501,0,min),field(502,0,max)]);
export function setPlayerCount({mapPath,min=1,max,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  if(!Number.isInteger(min)||!Number.isInteger(max)||min<1||max<min||max>8)fail('INVALID_PLAYER_COUNT','min and max are whole numbers, 1 <= min <= max <= 8.',{min,max});
  const group=levelParts(root).find(f=>f.id===6&&f.wire===2);
  if(!group)fail('UNSUPPORTED_SAVE','The save has no player groups in its level settings (a save of an older editor): open and save it in the editor once.');
  const groups=fields(group.data).filter(f=>f.id===1&&f.wire===2);
  if(groups.length!==1)fail('UNSUPPORTED_SAVE','This tool handles a save with exactly one group of players.',{groups:groups.length});
  const before={min:varintOf(groups[0].data,501),max:varintOf(groups[0].data,502)};
  root=rewriteLevelField(root,6,data=>Buffer.concat(fields(data).map(f=>f.id===1&&f.wire===2?field(1,2,playerGroupRecord({min,max})):f.raw)));
  // The player template names the player slots it is for (property 3, {12: {4: slots from 0, packed}}); the editor
  // cuts that list to the number of players when it saves (seen 2026-10-13), so it is written that way here.
  root=rewriteTargets(root,{prefab:'player'},(data,layout)=>{
    const at=fields(data).find(f=>f.id===layout.properties&&f.wire===2&&kindOf(f.data)===3);
    if(!at)return data;
    return setBlock(data,layout.properties,3,old=>Buffer.concat([field(1,0,3),field(12,2,Buffer.concat(fields(one(old,12)).map(f=>f.id===4&&f.wire===2?field(4,2,Buffer.from(Array.from({length:max},(_,i)=>i))):f.raw)))]));
  }).root;
  const out=output(workspace,file,outputName,'-players');fs.writeFileSync(out,wrap(bytes,root));
  return {mapPath:out,source:file,before,players:{min,max},
    next:'Use mapPath in later calls. This is what the lobby and matchmaking go by when the level is published: a single-player game says {min: 1, max: 1}, or strangers are matched into it together. A playtest from the editor is one player whatever this says.'};
}

// Currency (货币) and the backpack that holds it. Read from the official samples 货币与商店, 掉落物、道具、背包 and 装备 (CN 7.1):
// a currency is a record of kind 11 in section 15, {1: id, 2: 11, 4: {1: 1, 11: {1: name}}, 4: {1: 41, 54: {1: {1: icon,
// 2: 1, 4: {3: 4350, 4: {}}}}}}, ids from 1115684865, listed in the library tab of kind 23 as {1: 3700, 2: id}. Whoever is
// to hold currency or items needs the backpack component (general component 33): {1: {1: 1, 2: backpack template id},
// 3: {1: {1: {1: 1, 2: currency or item id}, 2: amount}...}}; the samples put it on the character template. The backpack
// template is a record of kind 12, {1: id, 2: 12, 4: {1: 1, 11: {1: name}}, 4: {1: 42, 55: {1: {1: capacity, 3: {3: 4350,
// 4: {}}}}}}, ids from 1119879169, listed in the tab of kind 22 as {1: 3800, 2: id}.
const CURRENCY_BASE=1115684864,BACKPACK_BASE=1119879168;
const configRecords=(root,kind)=>fields(root).filter(f=>f.id===15&&f.wire===2).flatMap(s=>fields(s.data).filter(f=>f.id===1&&f.wire===2)).filter(f=>varintOf(f.data,2)===kind);
const configBlock=(data,kind)=>fields(data).filter(x=>x.id===4&&x.wire===2).find(x=>kindOf(x.data)===kind)?.data;
const configName=data=>{try{return one(one(configBlock(data,1),11),1).toString('utf8');}catch{return '';}};
const configNamed=name=>field(4,2,Buffer.concat([field(1,0,1),field(11,2,field(1,2,Buffer.from(name,'utf8')))]));
const DROP_DEFAULT=Buffer.concat([field(3,0,4350),field(4,2,blank)]);
export function currencyRecord({id,name,icon=100001}){
  return Buffer.concat([field(1,0,id),field(2,0,11),configNamed(name),field(4,2,Buffer.concat([field(1,0,41),field(54,2,field(1,2,Buffer.concat([field(1,0,icon),field(2,0,1),field(4,2,DROP_DEFAULT)])))]))]);
}
export function backpackTemplateRecord({id,name='背包模板',capacity=10}){
  return Buffer.concat([field(1,0,id),field(2,0,12),configNamed(name),field(4,2,Buffer.concat([field(1,0,42),field(55,2,field(1,2,Buffer.concat([field(1,0,capacity),field(3,2,DROP_DEFAULT)])))]))]);
}
const holding=(configId,amount)=>field(1,2,Buffer.concat([field(1,2,Buffer.concat([field(1,0,1),field(2,0,configId)])),field(2,0,amount)]));
export function backpackRecord({templateId,holdings=[]}){
  return record(33,Buffer.concat([field(1,2,Buffer.concat([field(1,0,1),field(2,0,templateId)])),field(3,2,Buffer.concat(holdings.map(h=>holding(h.configId,h.amount))))]));
}
// Append {1: tag, 2: id} to the library tab of one kind; a save that has no such tab gets one at the end.
function listInLibrary(root,tabKind,tag,id){
  const tabs=fields(one(root,6)),tab=tabs.filter(t=>t.id===1&&t.wire===2&&kindOf(t.data)===tabKind),listed=field(5,2,Buffer.concat([field(1,0,tag),field(2,0,id)]));
  if(tab.length>1)fail('UNSUPPORTED_SAVE','The save has several library tabs of kind '+tabKind+'.');
  if(!tab.length){
    const fresh=field(1,2,Buffer.concat([field(1,0,tabKind),field(2,2,Buffer.concat([field(1,2,Buffer.from('root','utf8')),field(3,0,1)])),field(3,2,Buffer.concat([field(1,2,Buffer.from('未分类页签','utf8')),field(3,0,2),listed]))]));
    return replace(root,6,2,Buffer.concat([...tabs.map(t=>t.raw),fresh]));
  }
  const newTab=Buffer.concat(fields(tab[0].data).map(f=>f.id===3&&f.wire===2?field(3,2,Buffer.concat([f.data,listed])):f.raw));
  return replace(root,6,2,Buffer.concat(tabs.map(t=>t===tab[0]?field(1,2,newTab):t.raw)));
}
function backpackOf(data,layout){
  const found=fields(data).find(f=>f.id===layout.records&&f.wire===2&&kindOf(f.data)===33);
  if(!found)return null;
  const body=fields(found.data).find(f=>f.id===44&&f.wire===2)?.data??blank,ref=fields(body).find(f=>f.id===1&&f.wire===2);
  const held=fields(fields(body).find(f=>f.id===3&&f.wire===2)?.data??blank).filter(f=>f.id===1&&f.wire===2).map(f=>({configId:varintOf(one(f.data,1),2),amount:varintOf(f.data,2)??0}));
  return {templateId:ref?varintOf(ref.data,2):null,holdings:held};
}
export function listCurrencies({mapPath}){
  const file=resolve(mapPath),root=container(fs.readFileSync(file));
  const currencies=configRecords(root,11).map(f=>{let icon=null;try{icon=varintOf(one(one(configBlock(f.data,41),54),1),1);}catch{}return {currencyId:varintOf(f.data,1),name:configName(f.data),icon};});
  const templates=configRecords(root,12).map(f=>{let capacity=null;try{capacity=varintOf(one(one(configBlock(f.data,42),55),1),1);}catch{}return {backpackTemplateId:varintOf(f.data,1),name:configName(f.data),capacity};});
  let character=null;
  for(const f of fields(one(root,4)))if(f.id===1&&f.wire===2&&prefabRecords(root).some(p=>p.assetId===CHARACTER_BASE&&p.prefabId===varintOf(f.data,1)))character=backpackOf(f.data,TEMPLATE);
  return {mapPath:file,currencies,backpackTemplates:templates,characterBackpack:character,
    note:'A graph reads and changes what an entity holds with f.getInventoryCurrencyQuantity(holder, currencyId) and f.modifyInventoryCurrencyQuantity(holder, currencyId, change); whenTheQuantityOfInventoryCurrencyChanges fires on the holder. The holder is the entity that carries the backpack component: the character (not the player entity) when it was put on the character template.'};
}
export function addCurrency({mapPath,name,icon=100001,startAmount=0,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  const existing=configRecords(root,11);
  if(existing.some(f=>configName(f.data)===name))fail('DUPLICATE_CURRENCY_NAME','The save already has a currency with this name.',{name,currencyId:varintOf(existing.find(f=>configName(f.data)===name).data,1)});
  if(!Number.isInteger(startAmount)||startAmount<0)fail('INVALID_AMOUNT','startAmount is a whole number, 0 or more.',{startAmount});
  const currencyId=Math.max(CURRENCY_BASE,...existing.map(f=>varintOf(f.data,1)))+1,added=[field(1,2,currencyRecord({id:currencyId,name,icon}))];
  root=listInLibrary(root,23,3700,currencyId);
  // The character needs a backpack to hold anything: the map's first backpack template, or a new one of ten slots.
  const packs=configRecords(root,12);let backpackTemplateId=packs.length?varintOf(packs[0].data,1):null,createdBackpackTemplate=false;
  if(backpackTemplateId===null){
    backpackTemplateId=BACKPACK_BASE+1;createdBackpackTemplate=true;
    added.push(field(1,2,backpackTemplateRecord({id:backpackTemplateId})));
    root=listInLibrary(root,22,3800,backpackTemplateId);
  }
  root=replace(root,15,2,Buffer.concat([one(root,15),...added]));
  const done=rewriteTargets(root,{prefab:'character'},(data,layout)=>setBlock(data,layout.records,33,old=>{
    // A backpack that is already there keeps its template and what it holds; the new currency is added to it.
    const body=old?fields(old).find(f=>f.id===44&&f.wire===2)?.data??blank:blank,parts=fields(body);
    const ref=parts.find(f=>f.id===1&&f.wire===2)?.raw??field(1,2,Buffer.concat([field(1,0,1),field(2,0,backpackTemplateId)]));
    const held=parts.find(f=>f.id===3&&f.wire===2)?.data??blank,others=parts.filter(f=>!((f.id===1||f.id===3)&&f.wire===2)).map(f=>f.raw);
    return record(33,Buffer.concat([ref,field(3,2,Buffer.concat([held,startAmount>0?holding(currencyId,startAmount):blank])),...others]));
  }));
  const out=output(workspace,file,outputName,'-currency');fs.writeFileSync(out,wrap(bytes,done.root));
  return {mapPath:out,source:file,currencyId,name,icon,startAmount,backpackTemplateId,createdBackpackTemplate,characterTemplates:done.templates,placedCharacters:done.placed,
    next:'Use mapPath in later calls. Every character now carries a backpack'+(startAmount?' holding '+startAmount+' of this currency':'')+'. In a graph the holder is the character entity: f.getInventoryCurrencyQuantity(character, '+currencyId+'), f.modifyInventoryCurrencyQuantity(character, '+currencyId+', change); whenTheQuantityOfInventoryCurrencyChanges fires on the character (attach the graph with attachToPrefab "character").'};
}

// Items (道具) and shops (商店), read from the official samples 货币与商店 and 掉落物、道具、背包 (CN 7.1). An item is a
// record of kind 9 in section 15 with block 39: {49: {1: {1: {1: stack limit, 2: {1: {1: 1, 2: currency id}, 2: value},
// 3: 1, 4: 4201, 5: 4301, 6: {501: 20005}, 502: 1}, 2: {1: {3: 4350, 4: {}}}, 3: {...}, 4: icon, 11: {1: 1, 2: 1}}}}; ids
// from 1107296257, library tab of kind 19 as {1: 3100, 2: id}. A shop template is a record of kind 17 with block 48:
// {58: {1: {1: 1, 4: 1, 5: {what it sells}, 6: {what it buys}, 7: {}, 10: 1, 11: 1}}}; ids from 1136656385, tab of kind
// 28 as {1: 4000, 2: id}. The thing that is the shop carries general component 35: {1: {1: 1, 2: {1: 1, 2: template id},
// 3: name, 501: name}}. The samples have one line in each list; with several, the lines of the selling list are numbered
// from 1 here (not checked against a sample).
const ITEM_BASE=1107296256,SHOP_BASE=1136656384;
const configRef=id=>Buffer.concat([field(1,0,1),field(2,0,id)]);
const priced=(currencyId,amount)=>Buffer.concat([field(1,2,configRef(currencyId)),...(amount?[field(2,0,amount)]:[])]);
// A consumable (消耗品, {5: 4302}; a material is 4301) can be used from the backpack: the item names an item graph,
// {6: {1: 1, 2: graph id, 501: 20005}}, which hears whenItemsInTheInventoryAreUsed. {501: text} is the description, and
// {2: {1: {3: 4350, 4: {1: 1, 2: drop prefab}}}} the drop it turns into on the ground. The two numbers at the end of
// block 3 are 10 on the apple of 货币与商店 and 3 on the fowl meat of 掉落物、道具、背包: with 10, a used item showed
// "9秒" in the backpack a moment later (seen in play), so they are the seconds before it can be used again.
export function itemRecord({id,name,icon=90001,value,stackLimit=9999,category='material',useGraphId,description,dropPrefabId,useCooldownSeconds=10}){
  const basics=Buffer.concat([field(1,0,stackLimit),...(value?[field(2,2,priced(value.currencyId,value.amount))]:[]),field(3,0,1),field(4,0,4201),field(5,0,category==='consumable'?4302:4301),
    field(6,2,Buffer.concat([...(useGraphId?[field(1,0,1),field(2,0,useGraphId)]:[]),field(501,0,20005)])),...(description?[field(501,2,Buffer.from(description,'utf8'))]:[]),field(502,0,1)]);
  const dropped=dropPrefabId?Buffer.concat([field(3,0,4350),field(4,2,Buffer.concat([field(1,0,1),field(2,0,dropPrefabId)]))]):DROP_DEFAULT;
  const body=Buffer.concat([field(1,2,basics),field(2,2,field(1,2,dropped)),field(3,2,Buffer.concat([field(1,0,1),field(2,0,1),field(3,0,1),field(4,0,1),field(6,5,f32(useCooldownSeconds)),field(7,5,f32(useCooldownSeconds))])),field(4,0,icon),field(11,2,Buffer.concat([field(1,0,1),field(2,0,1)]))]);
  return Buffer.concat([field(1,0,id),field(2,0,9),configNamed(name),field(4,2,Buffer.concat([field(1,0,39),field(49,2,field(1,2,body))]))]);
}
export function shopTemplateRecord({id,name,sell=[],buy=[]}){
  // Field 6 is what the shop sells (the lesson's 出售设置, a list of its own: {1: line number, 2: item, 5: price, 8: how
  // many it has}; which field is the stock was found in play, by giving 3, 4, 7 and 8 other numbers one at a time and
  // reading the number on the shelf); field 5 is the table of prices at which it buys from the player (收购价格表).
  const selling=sell.map((line,i)=>field(1,2,Buffer.concat([field(1,0,i+1),field(2,2,configRef(line.itemId)),field(3,0,1),field(4,0,1),field(5,2,priced(line.currencyId,line.price)),field(7,0,1),field(8,0,line.stock??1)])));
  const buying=buy.map(line=>field(1,2,Buffer.concat([field(1,2,configRef(line.itemId)),field(2,0,1),field(3,0,1),field(4,2,priced(line.currencyId,line.price))])));
  const body=Buffer.concat([field(1,0,1),field(4,0,1),field(5,2,Buffer.concat(buying)),field(6,2,Buffer.concat(selling)),field(7,2,blank),field(10,0,1),field(11,0,1)]);
  return Buffer.concat([field(1,0,id),field(2,0,17),configNamed(name),field(4,2,Buffer.concat([field(1,0,48),field(58,2,field(1,2,body))]))]);
}
export const shopComponent=({templateId,name})=>record(35,field(1,2,Buffer.concat([field(1,0,1),field(2,2,configRef(templateId)),field(3,2,Buffer.from(name,'utf8')),field(501,2,Buffer.from(name,'utf8'))])));
const itemsOf=root=>configRecords(root,9).map(f=>{
  let icon=null,value=null;
  try{const body=one(one(configBlock(f.data,39),49),1);icon=varintOf(body,4);const price=fields(one(body,1)).find(x=>x.id===2&&x.wire===2);if(price)value={currencyId:varintOf(one(price.data,1),2),amount:varintOf(price.data,2)??0};}catch{}
  return {itemId:varintOf(f.data,1),name:configName(f.data),icon,value};
});
const shopsOf=root=>configRecords(root,17).map(f=>{
  const lines=(id,at,cost,stock)=>{try{return fields(one(one(one(configBlock(f.data,48),58),1),id)).filter(x=>x.id===1&&x.wire===2).map(x=>({itemId:varintOf(one(x.data,at),2),currencyId:varintOf(one(one(x.data,cost),1),2),price:varintOf(one(x.data,cost),2)??0,...(stock?{stock:varintOf(x.data,stock)??0}:{})}));}catch{return [];}};
  return {shopTemplateId:varintOf(f.data,1),name:configName(f.data),sell:lines(6,2,5,8),buy:lines(5,1,4)};
});
export function listItems({mapPath}){
  const file=resolve(mapPath),root=container(fs.readFileSync(file));
  return {mapPath:file,items:itemsOf(root),shops:shopsOf(root),
    note:'Items are held in the backpack of a character, like currency: f.getInventoryItemQuantity(character, itemId), f.modifyInventoryItemQuantity(character, itemId, change). The events about an item (added, lost, quantity changed, used) arrive only in the item graph the item names (scene_add_item useGraphId), not on the character. A shop is opened for a player with f.openShop(player, the entity that carries the shop, 1) and closed with f.closeShop(player).'};
}
// The id of a currency or an item given by its id or its name.
function configIdOf(root,kind,what,given){
  const all=configRecords(root,kind),found=all.find(f=>typeof given==='number'?varintOf(f.data,1)===given:configName(f.data)===given);
  if(!found)fail('NOT_FOUND','The save has no '+what+' "'+given+'".',{known:all.map(f=>({id:varintOf(f.data,1),name:configName(f.data)}))});
  return varintOf(found.data,1);
}
export function addItem({mapPath,name,icon=90001,value,stackLimit=9999,category='material',useGraphId,description,useCooldownSeconds=10,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  const existing=configRecords(root,9);
  if(existing.some(f=>configName(f.data)===name))fail('DUPLICATE_ITEM_NAME','The save already has an item with this name.',{name,itemId:varintOf(existing.find(f=>configName(f.data)===name).data,1)});
  if(!configRecords(root,12).length)fail('NO_BACKPACK','Nobody in this save can hold an item yet. Define a currency first (scene_add_currency): that gives every character a backpack, and shops price items in a currency.');
  const worth=value&&{currencyId:configIdOf(root,11,'currency',value.currency),amount:value.amount};
  if(useGraphId!==undefined){
    const graph=graphRecords(root).find(g=>g.graphId===useGraphId);
    if(!graph||graph.type!==20005)fail('NOT_AN_ITEM_GRAPH','useGraphId is an item graph made with scene_add_graph {kind: "item"}.',{useGraphId});
    if(category!=='consumable')fail('NOT_USABLE','Only a consumable is used from the backpack: give category "consumable" with useGraphId.',{category});
  }
  const itemId=Math.max(ITEM_BASE,...existing.map(f=>varintOf(f.data,1)))+1;
  root=replace(root,15,2,Buffer.concat([one(root,15),field(1,2,itemRecord({id:itemId,name,icon,value:worth,stackLimit,category,useGraphId,description,useCooldownSeconds}))]));
  root=listInLibrary(root,19,3100,itemId);
  const out=output(workspace,file,outputName,'-item');fs.writeFileSync(out,wrap(bytes,root));
  return {mapPath:out,source:file,itemId,name,icon,value:worth,category,useGraphId,
    next:'Use mapPath in later calls. A graph gives and takes the item with f.modifyInventoryItemQuantity(character, '+itemId+', change) and reads f.getInventoryItemQuantity(character, '+itemId+'); the holder is the character entity, as with currency. To sell or buy it for currency, put it in a shop: scene_add_shop.'};
}
export function addShop({mapPath,name,prefab,sell=[],buy=[],outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  if(!sell.length&&!buy.length)fail('EMPTY_SHOP','Give sell (what the shop sells to the player) or buy (what it buys from the player).');
  const existing=configRecords(root,17);
  if(existing.some(f=>configName(f.data)===name))fail('DUPLICATE_SHOP_NAME','The save already has a shop template with this name.',{name});
  const line=l=>({itemId:configIdOf(root,9,'item',l.item),currencyId:configIdOf(root,11,'currency',l.currency),price:l.price,...(l.stock!==undefined?{stock:l.stock}:{})});
  const selling=sell.map(line),buying=buy.map(line);
  for(const list of [selling,buying])if(new Set(list.map(l=>l.itemId)).size!==list.length)fail('DUPLICATE_LINE','An item appears twice in one list of the shop.');
  const shopTemplateId=Math.max(SHOP_BASE,...existing.map(f=>varintOf(f.data,1)))+1;
  root=replace(root,15,2,Buffer.concat([one(root,15),field(1,2,shopTemplateRecord({id:shopTemplateId,name,sell:selling,buy:buying}))]));
  root=listInLibrary(root,28,4000,shopTemplateId);
  const part=shopComponent({templateId:shopTemplateId,name});
  const done=rewriteTargets(root,{prefab},(data,layout)=>{
    if(!fields(data).some(f=>f.id===layout.components&&f.wire===2&&kindOf(f.data)===3))fail('UNSUPPORTED_ENTITY','A static piece carries no components. The shop goes on a prefab from scene_add_prefab.',{prefab});
    return setBlock(data,layout.records,35,()=>part);
  });
  const out=output(workspace,file,outputName,'-shop');fs.writeFileSync(out,wrap(bytes,done.root));
  return {mapPath:out,source:file,shopTemplateId,name,sell:selling,buy:buying,prefabIds:done.prefabIds.length?done.prefabIds:undefined,templates:done.templates,placedCopies:done.placed,
    next:'Use mapPath in later calls. A graph opens the shop for a player: f.openShop(player, the entity of this prefab, 1) (the official lesson does it when a character enters the collision trigger of the stall: f.getPlayerEntityToWhichTheCharacterBelongs(evt.enteringEntity)), and f.closeShop(player) closes it. Buying and selling move the items and the currency in the character\'s backpack by themselves; whenCustomShopItemIsSold (the shop sold a line of its list; evt.purchaseQuantity) and whenSellingItemsToTheShop (the player sold to the shop) fire in a graph on the stall.'};
}

// Skills (技能) are how a player acts beyond walking and the option prompt: a key press runs a client skill graph, which
// may notify the server. Read from the official samples 耕种-采集流程, 技能设置 and 角色扰动装置 (CN 7.1): a skill is a
// record of kind 6 in section 15, {1: id, 2: 6, 4: block...}, with blocks 1 (name), 21 (settings: type, numbers, and for an
// instant skill {5: {1: client skill graph id, 2: 1073741825}}), 35 (the animation timeline: two tracks and, for an instant
// skill, nothing on them; {2: 2} marks the instant type) and 36; section 16 holds a copy {1: id, 2: id, 3: block...}; the
// library lists skills in the tab of kind 12 as {1: 2800, 2: id}. Ids start at 1098907649. Only the instant type (瞬发技能:
// no animation, the graph runs the moment the key is pressed) is written here, byte for byte the sample's 放下工具.
const SKILL_BASE=1098907648;
// A normal skill (普通技能) plays one character animation and runs its graph at the start of it or some milliseconds in:
// in block 21 the type field {4: 2} is added and the graph reference {5: ...} left out; in block 35 the two tracks get ids
// ({6: 805306369} and {6: 805306376}), the clip is {3: {2: animation id, 3: the portion of it that is played, 6: 268435457}},
// the graph is a start event {4: {1: graph, 3: 1073741825, 4: 268435457}} or an event on the graph track
// {6: {1: graph, 3: "节点图事件轨道", 4: milliseconds, 5: 1073741825, 6: 268435457, 7: 805306369}}, an effect shown on the
// character meanwhile (the sword of the official attack skills) is an entry on the state track {7: {...}}, and the
// closing {2: 21} marks the type. Byte for byte the official 耙子-开垦 (耕种-采集流程) and 普攻 (命中与受击).
function skillBlocks({name,graphId,type='instant',animation,animationPortion=1,graphAtMs,effect}){
  const normal=type==='normal';
  const track=(label,n,id)=>field(2,2,Buffer.concat([field(1,2,Buffer.from(label,'utf8')),field(2,0,n),field(3,0,1),field(4,0,1),...(normal?[field(6,0,id)]:[])])),pair=id=>field(id,2,Buffer.concat([field(1,0,1),field(2,0,1)]));
  // (The summon skill of the official sample 技能设置 has {1: 4.0, 3: 1000} in these settings. Written that way a skill
  // still had no cooldown in play, 2026-10-11: no sample shows where a cooldown is stored, so none is written.)
  const numbers=Buffer.concat([field(2,0,1),field(3,0,2),field(5,0,1),field(9,0,2),field(10,2,Buffer.concat([field(1,5,f32(1)),field(2,5,f32(1)),field(3,5,f32(1))])),field(11,5,f32(1)),field(12,5,f32(1)),field(13,5,f32(120)),field(15,5,f32(1)),field(16,5,f32(1))]);
  const timeline=[track('节点图事件轨道',1,805306369),track('状态轨道',2,805306376)];
  if(normal){
    timeline.push(field(3,2,Buffer.concat([field(2,0,animation),field(3,5,f32(animationPortion)),field(6,0,268435457)])));
    if(graphAtMs===undefined)timeline.push(field(4,2,Buffer.concat([field(1,0,graphId),field(3,0,1073741825),field(4,0,268435457)])));
    else timeline.push(field(6,2,Buffer.concat([field(1,0,graphId),field(3,2,Buffer.from('节点图事件轨道','utf8')),field(4,5,f32(graphAtMs)),field(5,0,1073741825),field(6,0,268435457),field(7,0,805306369)])));
    if(effect)timeline.push(field(7,2,Buffer.concat([field(2,2,Buffer.from('状态轨道','utf8')),...(effect.startMs?[field(3,5,f32(effect.startMs))]:[]),field(4,5,f32(effect.ms)),field(5,0,1),field(6,0,1073741832),field(7,0,268435457),field(8,0,805306376),
      field(21,2,Buffer.concat([field(1,0,1),field(11,2,Buffer.concat([field(1,0,effect.asset),field(2,2,Buffer.from(effect.attachPoint,'utf8')),field(3,2,blank),field(4,2,blank),field(5,5,f32(1)),field(6,0,1),field(7,0,1)]))]))])));
  }
  timeline.push(pair(9),pair(10));
  return [
    Buffer.concat([field(1,0,1),field(11,2,field(1,2,Buffer.from(name,'utf8')))]),
    Buffer.concat([field(1,0,21),field(30,2,field(1,2,Buffer.concat([field(1,2,normal?Buffer.concat([field(4,0,2),field(7,0,20001)]):field(7,0,20001)),field(2,2,blank),field(3,2,numbers),field(4,2,field(2,0,1)),...(normal?[]:[field(5,2,Buffer.concat([field(1,0,graphId),field(2,0,1073741825)]))]),field(6,2,blank),field(7,2,blank)])))]),
    Buffer.concat([field(1,0,35),field(45,2,Buffer.concat([field(1,2,Buffer.concat(timeline)),field(2,0,normal?21:2),field(3,0,250422)]))]),
    Buffer.concat([field(1,0,36),field(46,2,blank)])];
}
export const skillRecord=({id,...spec})=>Buffer.concat([field(1,0,id),field(2,0,6),...skillBlocks(spec).map(b=>field(4,2,b))]);
// The copy in section 16 leaves the name out (the current editor writes {1: 1, 11: {}} there; older saves repeated the name).
export const skillCopy=({id,...spec})=>Buffer.concat([field(1,0,id),field(2,0,id),...skillBlocks(spec).map((b,i)=>field(3,2,i===0?Buffer.concat([field(1,0,1),field(11,2,blank)]):b))]);
export function listSkills({mapPath}){
  const file=resolve(mapPath),root=container(fs.readFileSync(file));
  const skills=configRecords(root,6).map(f=>{
    let graphId=null,instant=null,animations;
    try{graphId=varintOf(one(one(one(configBlock(f.data,21),30),1),5),1);}catch{}
    try{
      const timeline=one(configBlock(f.data,35),45);instant=varintOf(timeline,2)===2;
      const entries=fields(one(timeline,1));
      // An animated skill: its clips, and the graph its start event or its graph track runs.
      const clips=entries.filter(e=>e.id===3&&e.wire===2).map(e=>varintOf(e.data,2));if(clips.length)animations=clips;
      const event=entries.find(e=>(e.id===4||e.id===6)&&e.wire===2);if(event&&graphId===null)graphId=varintOf(event.data,1);
    }catch{}
    return {skillId:varintOf(f.data,1),name:configName(f.data),type:instant?'instant':'animated',graphId,animations};
  });
  return {mapPath:file,skills,
    note:'A graph gives a character a skill with f.addCharacterSkill(character, skillId, CharacterSkillSlot.Skill1E, TopOfStackSkillDestructionType.Destroy) and takes it away with f.deleteCharacterSkillBySlot(character, slot). Slots: NormalAttack, Skill1E, Skill2Q, Skill3R, Skill4T, CustomSkillSlot1 to 15.'};
}
// Character animations the official samples use in their skills.
const SKILL_ANIMATIONS={1001:'one-handed sword attack (技能设置, 命中与受击, 投射运动器)',1004:'first clip of the attack in 建成我的第一个奇域',1005:'second clip of that attack',1006:'raking the ground (耕种: 耙子-开垦)',1023:'watering (耕种: 水壶-浇水)',1025:'reaching out a hand (耕种: 种子-种植; the summon and the buff of 技能设置 and 单位状态)'};
export function addSkill({mapPath,name,graphId,type='instant',animation,animationPortion=1,graphAtMs,effect,outputName},workspace){
  const spec={name,graphId,type,animation,animationPortion,graphAtMs,effect};
  if(type==='normal'&&animation===undefined)fail('ANIMATION_REQUIRED','A normal skill plays a character animation: give animation, one of the ids the official samples use.',{known:SKILL_ANIMATIONS});
  if(type!=='normal'&&(animation!==undefined||graphAtMs!==undefined||effect))fail('INSTANT_HAS_NO_ANIMATION','animation, graphAtMs and effect belong to type "normal"; an instant skill has no animation.',{type});
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  const graph=graphRecords(root).find(g=>g.graphId===graphId);
  if(!graph)fail('GRAPH_NOT_FOUND','No node graph with this id in the save. Make the skill graph first: scene_add_graph {kind: "characterSkill"}.',{graphId});
  if(graph.graphId<=CLIENT_GRAPH_BASE)fail('NOT_A_SKILL_GRAPH','The graph of a skill is a client graph made with scene_add_graph {kind: "characterSkill"}; this id is a server graph.',{graphId,name:graph.name});
  const existing=configRecords(root,6);
  if(existing.some(f=>configName(f.data)===name))fail('DUPLICATE_SKILL_NAME','The save already has a skill with this name.',{name,skillId:varintOf(existing.find(f=>configName(f.data)===name).data,1)});
  const skillId=Math.max(SKILL_BASE,...existing.map(f=>varintOf(f.data,1)))+1;
  root=replace(root,15,2,Buffer.concat([one(root,15),field(1,2,skillRecord({id:skillId,...spec}))]));
  const copy=field(1,2,skillCopy({id:skillId,...spec})),top=fields(root);
  if(top.some(f=>f.id===16&&f.wire===2))root=replace(root,16,2,Buffer.concat([one(root,16),copy]));
  else{let at=top.findIndex(f=>f.id>16);if(at<0)at=top.length;root=Buffer.concat([...top.slice(0,at).map(f=>f.raw),field(16,2,copy),...top.slice(at).map(f=>f.raw)]);}
  root=listInLibrary(root,12,2800,skillId);
  const out=output(workspace,file,outputName,'-skill');fs.writeFileSync(out,wrap(bytes,root));
  return {mapPath:out,source:file,skillId,name,type,graphId,animation,animationNote:type==='normal'?(SKILL_ANIMATIONS[animation]??'not one of the animations seen in the official samples'):undefined,
    next:'Use mapPath in later calls. Three pieces make a key press reach the rules. (1) The skill graph '+graphId+' (written with write_graphs, as graphId): g.characterSkill({id:'+graphId+', name, prefix:false}).on(\'start\',(evt,f)=>{f.notifyServerNodeGraph(\'<word>\',\'\',\'\');}) : a client graph cannot create or change things itself. (2) A server graph gives the skill to the character, for instance two seconds into the level: f.addCharacterSkill(character, '+skillId+', CharacterSkillSlot.Skill1E, TopOfStackSkillDestructionType.Destroy) (the E key; NormalAttack is the attack button). (3) A server graph on the character template (scene_add_graph attachToPrefab "character") hears .on(\'whenSkillNodeIsCalled\',(evt,f)=>{...}) with evt.callerEntity and evt.parameter1 = <word>.'};
}

// ---- Complex creatures (复杂造物): creatures whose behaviour is written as node graphs ----
// Read from the official sample 复杂造物 (CN 7.1, the only sample that has one). A complex creature is one of the
// "怪物(AI版)" assets. Where an ordinary creature has a behaviour block (property 30) chosen in the editor, its template
// has four property blocks:
//   80 {79: {1: {1: 1, 2: decision graph id, 501: 20007}}}                        造物状态决策节点图
//   81 {80: {1: {1: skill..., 2: {1: shared cooldown seconds}}}}                   造物技能管理
//        skill = {1: number, 2: {1: 1, 2: skill id}, 3: {4: 3.0, 6: 1}, 12: "技能_<number>"}; the number is what a
//        status graph passes to f.executeSkill. {3} holds the cooldown settings as the editor writes them for a new
//        entry; no second sample shows what its fields mean, so they are written as they are.
//   65 {70: {1: {}}}                                                               巡逻设置, here without a template
//   82 {81: {1: {1: template...}}}                                                 自主逻辑参数设置
//        template = {1: number, 2: starts active, 3: name, 4: entering combat, 5: leaving combat, 6: territory}, written
//        with the values of a new template in the editor.
// A creature skill (造物技能) is a config record of kind 28 with ids from 1191182337, listed in library tab 61 with tag
// 6900 and copied in section 16, like a character skill (kind 6). Its blocks: 1 the name; 73 {78: {1: {1: {1: 20001,
// 2: 2}, 2: {1: model id}, 3: {4: 1, 5: 1}}}}: a normal skill, the model whose animations it plays, the general
// settings of a new skill; 35 the timeline, as in a character skill but without the track labels on its entries and
// closed with {2: 51}; 36 empty. The model id is the asset id minus 20000000 (asset 30006002, model 10006002), and the
// animations of a model are numbered <last four digits of the model>001 and up (6002003 is 丘丘霜铠王_近战攻击_01).
const CREATURE_SKILL_BASE=1191182336,CREATURE_SKILL_KIND=28;
const isComplexCreature=assetId=>{const found=findAsset(assetId);return found?found.group==='怪物(AI版)':false;};
// A skill of several animations played one after another (animations) is written the way the editor of 2026-10 saves
// one (read from a skill edited there on 2026-10-11): the tracks and clips carry a few more numbers, the clips after the
// first are numbered, the timeline says how many there are. A skill of one animation stays byte for byte the sample's.
// The general settings {3}: 1 可打断其他技能, 2 自动面向目标, 4 目标可达时施放技能, 5 目标不可达时施放技能 (each switched in
// the editor and read back).
function creatureSkillBlocks({name,modelId,graphId,animation,animations,animationPortion=1,graphAtMs=1,effect,faceTarget=false,interrupts=false}){
  const clips=animations?.length?animations:[animation],many=clips.length>1,more=many?[field(9,5,f32(1000)),field(11,0,1)]:[];
  const track=(label,n,id)=>field(2,2,Buffer.concat([field(1,2,Buffer.from(label,'utf8')),field(2,0,n),field(3,0,1),field(4,0,1),field(6,0,id),...more])),pair=id=>field(id,2,Buffer.concat([field(1,0,1),field(2,0,1)]));
  const timeline=[track('节点图事件轨道',1,805306369),track('状态轨道',2,805306376),
    ...clips.map((id,i)=>field(3,2,Buffer.concat([...(i?[field(1,0,i)]:[]),field(2,0,id),field(3,5,f32(animationPortion)),field(6,0,268435457+7*i),...(many?[field(8,5,f32(1)),...(i?[field(9,0,1)]:[])]:[])]))),
    // One entry on the graph track for every moment the graph runs. The first is the sample's; the ones after it take
    // the next free numbers of the timeline (they go up by seven; 1073741839 is the effect's). No official sample has
    // a skill with several, so this was written by that rule and tried: a triple stroke with moments at 350, 900 and
    // 1700 ms ran its graph three times each time it played (scripts/dev/fitting, 2026-10-12).
    ...[graphAtMs].flat().map((ms,k)=>field(6,2,Buffer.concat([field(1,0,graphId),field(4,5,f32(ms)),field(5,0,k?1073741839+7*k:1073741832),field(6,0,268435457),field(7,0,805306369)])))];
  if(effect)timeline.push(field(7,2,Buffer.concat([...(effect.startMs?[field(3,5,f32(effect.startMs))]:[]),field(4,5,f32(effect.ms)),field(5,0,1),field(6,0,1073741839),field(7,0,268435457),field(8,0,805306376),
    field(21,2,Buffer.concat([field(1,0,1),field(11,2,Buffer.concat([field(1,0,effect.asset),field(2,2,Buffer.from(effect.attachPoint,'utf8')),field(3,2,blank),field(4,2,blank),field(5,5,f32(1)),field(6,0,1),field(7,0,1),field(8,2,blank),field(9,0,1)]))]))])));
  timeline.push(pair(9),pair(10));
  if(many)timeline.push(field(16,0,clips.length));
  return [
    Buffer.concat([field(1,0,1),field(11,2,field(1,2,Buffer.from(name,'utf8')))]),
    Buffer.concat([field(1,0,73),field(78,2,field(1,2,Buffer.concat([field(1,2,Buffer.concat([field(1,0,20001),field(2,0,2)])),field(2,2,field(1,0,modelId)),field(3,2,Buffer.concat([...(interrupts?[field(1,0,1)]:[]),...(faceTarget?[field(2,0,1)]:[]),field(4,0,1),field(5,0,1)]))])))]),
    Buffer.concat([field(1,0,35),field(45,2,Buffer.concat([field(1,2,Buffer.concat(timeline)),field(2,0,51),field(3,0,many?260128:250422)]))]),
    Buffer.concat([field(1,0,36),field(46,2,blank)])];
}
export const creatureSkillRecord=({id,...spec})=>Buffer.concat([field(1,0,id),field(2,0,CREATURE_SKILL_KIND),...creatureSkillBlocks(spec).map(b=>field(4,2,b))]);
export const creatureSkillCopy=({id,...spec})=>Buffer.concat([field(1,0,id),field(2,0,id),...creatureSkillBlocks(spec).map((b,i)=>field(3,2,i===0?Buffer.concat([field(1,0,1),field(11,2,blank)]):b))]);
const creatureSkillInfo=f=>{
  let modelId=null,graphId=null,animations=[],faceTarget=false,interrupts=false,moments=[];
  try{const basics=one(one(configBlock(f.data,73),78),1);modelId=varintOf(one(basics,2),1);const general=fields(one(basics,3));interrupts=general.some(g=>g.id===1&&Number(g.value)===1);faceTarget=general.some(g=>g.id===2&&Number(g.value)===1);}catch{}
  try{const entries=fields(one(one(configBlock(f.data,35),45),1));animations=entries.filter(e=>e.id===3&&e.wire===2).map(e=>varintOf(e.data,2));const events=entries.filter(e=>(e.id===4||e.id===6)&&e.wire===2);if(events.length)graphId=varintOf(events[0].data,1);
    // The moments of the skill at which its graph runs, in milliseconds.
    moments=events.filter(e=>e.id===6).map(e=>fields(e.data).find(x=>x.id===4&&x.wire===5)).filter(Boolean).map(x=>Math.round(x.data.readFloatLE(0)*1000)/1000);}catch{}
  return {skillId:varintOf(f.data,1),name:configName(f.data),creatureAssetId:modelId===null?null:modelId+20000000,creature:modelId===null?null:findAsset(modelId+20000000)?.name??null,graphId,animations,...(moments.length?{graphAtMs:moments.length===1?moments[0]:moments}:{}),...(faceTarget?{faceTarget}:{}),...(interrupts?{interrupts}:{})};
};
export function listCreatureSkills({mapPath}){
  const file=resolve(mapPath),root=container(fs.readFileSync(file));
  return {mapPath:file,skills:configRecords(root,CREATURE_SKILL_KIND).map(creatureSkillInfo),
    note:'A creature skill belongs to one creature model. A complex creature gets its skills from scene_set_creature_logic, numbered from 1 in the order given; a status graph plays one with f.executeSkill(condition, number).'};
}
// An animation is named by its id or by its name in the editor ("近战攻击_01", with or without the creature's name in
// front). The names come from creature_animations; a creature whose animations were not read there takes ids only.
function animationId(asset,wanted){
  const known=animationsOf(asset.id),first=((asset.id-20000000)%10000)*1000;
  if(typeof wanted==='number'){
    if(known&&!known.some(a=>a.id===wanted)&&!(animationsMayGoOn(asset.id)&&wanted>known.at(-1).id))fail('INVALID_ANIMATION','This creature has no animation with this id: creature_animations {creature: '+asset.id+'} lists them.',{animation:wanted,creature:asset.name,animations:known.map(a=>a.id+' '+a.name)});
    if(wanted<=first||wanted>first+999)fail('INVALID_ANIMATION','The animations of this creature are numbered from '+(first+1)+'.',{animation:wanted,creature:asset.name});
    return wanted;
  }
  const found=(known??[]).filter(a=>a.name===wanted||asset.name+'_'+a.name===wanted);
  if(found.length!==1)fail('INVALID_ANIMATION',known?'This creature has no animation of this name: creature_animations {creature: '+asset.id+'} lists them.':'The animation names of this creature were not read from the editor: give the id.',{animation:wanted,creature:asset.name,animations:known?.map(a=>a.id+' '+a.name)??null});
  return found[0].id;
}
export function addCreatureSkill({mapPath,name,creature,graphId,animation,animations,animationPortion=1,graphAtMs=1,effect,faceTarget=false,interrupts=false,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  const asset=findAsset(creature);
  if(!asset||!isComplexCreature(creature))fail('NOT_A_COMPLEX_CREATURE','creature is the asset id of a complex creature: scene_search_assets {group: "怪物(AI版)"}.',{creature,found:asset?.name??null,group:asset?.group??null});
  if((animation===undefined)===(animations===undefined))fail('INVALID_ANIMATION','Give animation (one) or animations (several, played one after another), one of them.');
  const modelId=creature-20000000,clips=(animations??[animation]).map(a=>animationId(asset,a));
  const graph=graphRecords(root).find(g=>g.graphId===graphId);
  if(!graph)fail('GRAPH_NOT_FOUND','No node graph with this id in the save. Make the skill graph first: scene_add_graph {kind: "creatureSkill"}.',{graphId});
  if(graph.type!==GRAPH_KINDS.creatureSkill.type)fail('NOT_A_CREATURE_SKILL_GRAPH','The graph of a creature skill is made with scene_add_graph {kind: "creatureSkill"}.',{graphId,name:graph.name});
  const existing=configRecords(root,CREATURE_SKILL_KIND);
  if(existing.some(f=>configName(f.data)===name))fail('DUPLICATE_SKILL_NAME','The save already has a creature skill with this name.',{name,skillId:varintOf(existing.find(f=>configName(f.data)===name).data,1)});
  const skillId=Math.max(CREATURE_SKILL_BASE,...existing.map(f=>varintOf(f.data,1)))+1,spec={id:skillId,name,modelId,graphId,animation:clips[0],animations:clips,animationPortion,graphAtMs,effect,faceTarget,interrupts};
  root=replace(root,15,2,Buffer.concat([one(root,15),field(1,2,creatureSkillRecord(spec))]));
  const copy=field(1,2,creatureSkillCopy(spec)),top=fields(root);
  if(top.some(f=>f.id===16&&f.wire===2))root=replace(root,16,2,Buffer.concat([one(root,16),copy]));
  else{let at=top.findIndex(f=>f.id>16);if(at<0)at=top.length;root=Buffer.concat([...top.slice(0,at).map(f=>f.raw),field(16,2,copy),...top.slice(at).map(f=>f.raw)]);}
  root=listInLibrary(root,61,6900,skillId);
  const out=output(workspace,file,outputName,'-creature-skill');fs.writeFileSync(out,wrap(bytes,root));
  const known=animationsOf(creature),named=clips.map(id=>({id,...(known?.find(a=>a.id===id)??{})}));
  // Where the moment of the animation is known from play, say so when the graph runs far from it.
  const moments=[graphAtMs].flat(),moment=clips.length===1?named[0].atMs:undefined,hint=moment!==undefined&&moments.every(ms=>Math.abs(ms-moment)>300)?{hint:'Seen in play: the moment of '+named[0].name+' that counts (the blade lands, the hand opens) is at about '+moment+' ms; graphAtMs is '+moments.join(', ')+'.'}:{};
  return {mapPath:out,source:file,skillId,name,creature:asset.name,creatureAssetId:creature,graphId,animations:named,graphAtMs,...(animationPortion!==1?{animationPortion}:{}),...(effect?{effect}:{}),faceTarget,interrupts,...hint,
    next:'Use mapPath in later calls. The skill plays '+(clips.length>1?'animations '+clips.join(', ')+' one after another':'animation '+clips[0])+' of '+asset.name+' and runs graph '+graphId+' '+moments.join(', ')+' ms into it: g.creationSkill({id:'+graphId+', name, prefix:false}).on(\'start\',(evt,f)=>{...}) is where the skill does something (a hit box, a projectile, f.notifyServerNodeGraph to tell a server graph). Give the skill to a creature of this model with scene_set_creature_logic {skills:[{skill:"'+name+'"}]}; its status graph plays it with f.executeSkill(condition, number).'};
}
// An autonomous-logic template (自主逻辑参数模板): how the creature comes to fight and stops. Each number was changed
// in the editor on 2026-10-11 and read back. {4} entering combat: 1 the ways it notices enemies (0 范围感知, a sphere
// around it; 1 视野检测, what it sees), 2 范围感知距离, 3 视野类型 (1 视锥), 4 视锥距离, 5 连锁入战距离; {5} leaving
// combat: 1 脱战距离, 2 寻路失败脱战, 3 its delay; {6} territory: 1 the shape (1 球体), 2 半径, 6 the delay of leaving
// combat when the target leaves it. Without arguments: the values of a new template in the editor.
const logicTemplate=({noticeRadius,sightDistance=10,chainRadius=0.01,leaveCombatDistance=5,leaveCombatDelaySeconds=3,territoryRadius=50}={})=>Buffer.concat([field(1,0,1),field(2,0,1),field(3,2,Buffer.from('模板_1','utf8')),
  field(4,2,Buffer.concat([field(1,2,Buffer.from(noticeRadius===undefined?[1]:[0,1])),field(2,5,f32(noticeRadius??5)),field(3,0,1),field(4,5,f32(sightDistance)),field(5,5,f32(chainRadius)),field(7,0,1),field(10,0,1),field(11,0,1),field(13,0,1)])),
  field(5,2,Buffer.concat([field(1,5,f32(leaveCombatDistance)),field(2,0,1),field(3,5,f32(leaveCombatDelaySeconds))])),
  field(6,2,Buffer.concat([field(1,0,1),field(2,5,f32(territoryRadius)),field(3,5,f32(10)),field(6,5,f32(0.01))]))]);
export const creatureDecisionBlock=graphId=>Buffer.concat([field(1,0,80),field(79,2,field(1,2,Buffer.concat([field(1,0,1),field(2,0,graphId),field(501,0,GRAPH_KINDS.creatureDecision.type)])))]);
// A skill of the list: its number, the skill, its cooldown {1, 2: the wait before its first use, from - to; 3, 4: the
// wait between uses, from - to; 6: counted from the end of the skill}. The editor gives a new entry 0 - 3 seconds and
// leaves out the numbers that are 0. An entry is a skill id or {id, cooldown: [from, to], firstCooldown: [from, to]}.
const cooldownFields=(ids,[from,to])=>[...(from?[field(ids[0],5,f32(from))]:[]),...(to?[field(ids[1],5,f32(to))]:[])];
export const creatureSkillsBlock=(skills,sharedCooldownSeconds=1)=>Buffer.concat([field(1,0,81),field(80,2,field(1,2,Buffer.concat([
  ...skills.map((s,i)=>{const {id,cooldown=[0,3],firstCooldown=[0,0]}=typeof s==='number'?{id:s}:s;
    return field(1,2,Buffer.concat([field(1,0,i+1),field(2,2,Buffer.concat([field(1,0,1),field(2,0,id)])),field(3,2,Buffer.concat([...cooldownFields([1,2],firstCooldown),...cooldownFields([3,4],cooldown),field(6,0,1)])),field(12,2,Buffer.from('技能_'+(i+1),'utf8'))]));}),
  field(2,2,field(1,5,f32(sharedCooldownSeconds)))])))]);
export const creatureLogicBlock=logic=>Buffer.concat([field(1,0,82),field(81,2,field(1,2,field(1,2,logicTemplate(logic))))]);
// Gives a complex creature its decision graph and its skills: a prefab (and every placed copy of it) or the placed
// creatures of one name.
export function setCreatureLogic({mapPath,prefab,entity,decisionGraphId,skills=[],sharedCooldownSeconds=1,logic,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file),whole=container(bytes);
  if((prefab===undefined)===(entity===undefined))fail('INVALID_TARGET','Give prefab (the name or id of a creature prefab) or entity (the name of placed creatures), one of them.');
  const graph=graphRecords(whole).find(g=>g.graphId===decisionGraphId);
  if(!graph)fail('GRAPH_NOT_FOUND','No node graph with this id in the save. Make the decision graph first: scene_add_graph {kind: "creatureDecision"}.',{decisionGraphId});
  if(graph.type!==GRAPH_KINDS.creatureDecision.type)fail('NOT_A_DECISION_GRAPH','decisionGraphId is a graph made with scene_add_graph {kind: "creatureDecision"}; a status graph is named inside it, with f.switchToSelfExecutionStatus.',{decisionGraphId,name:graph.name});
  const known=configRecords(whole,CREATURE_SKILL_KIND).map(creatureSkillInfo),wanted=skills.map(s=>{
    const found=known.filter(k=>typeof s.skill==='number'?k.skillId===s.skill:k.name===s.skill);
    if(found.length!==1)fail('SKILL_NOT_FOUND','skills[].skill is the name or id of a creature skill: scene_add_creature_skill makes one.',{skill:s.skill,known:known.map(k=>({skillId:k.skillId,name:k.name}))});
    const range=v=>v===undefined?undefined:typeof v==='number'?[v,v]:v;
    for(const r of [range(s.cooldownSeconds),range(s.firstCooldownSeconds)])if(r&&r[0]>r[1])fail('INVALID_COOLDOWN','A cooldown is one number of seconds or [from, to] with from not above to.',{skill:s.skill,cooldown:r});
    return {...found[0],cooldown:range(s.cooldownSeconds),firstCooldown:range(s.firstCooldownSeconds)};
  });
  // Perception without a matching distance of leaving combat makes a creature notice a target and drop it at once.
  let template=logic;
  if(logic){
    const far=Math.max(logic.noticeRadius??0,logic.sightDistance??10);
    template={...logic,leaveCombatDistance:logic.leaveCombatDistance??Math.max(5,far+6)};
    if(template.leaveCombatDistance<far)fail('INVALID_LOGIC','leaveCombatDistance is below the distance at which the creature notices enemies: it would take a target and drop it at once.',{leaveCombatDistance:template.leaveCombatDistance,notices:far});
  }
  // A placed copy of a prefab names the prefab, not the asset: the asset is the prefab's.
  const assetOfPrefab=new Map(prefabRecords(whole).map(p=>[p.prefabId,p.assetId]));
  const done=rewriteTargets(whole,{prefab,entity},(data,layout)=>{
    const named=layout===TEMPLATE?varintOf(data,2):describe(data).assetId,assetId=assetOfPrefab.get(named)??named;
    if(!isComplexCreature(assetId))fail('NOT_A_COMPLEX_CREATURE','Only a complex creature (an asset of the group "怪物(AI版)") runs a decision graph; an ordinary creature keeps the behaviour its asset came with.',{prefab,entity,assetId,asset:findAsset(assetId)?.name??null});
    for(const s of wanted)if(s.creatureAssetId!==assetId)fail('SKILL_OF_ANOTHER_CREATURE','A creature skill plays the animations of one creature model and can only be given to that creature.',{skill:s.name,skillOf:s.creature,creature:findAsset(assetId)?.name??null});
    let next=setBlock(data,layout.properties,80,()=>creatureDecisionBlock(decisionGraphId));
    next=setBlock(next,layout.properties,81,()=>creatureSkillsBlock(wanted.map(s=>({id:s.skillId,...(s.cooldown?{cooldown:s.cooldown}:{}),...(s.firstCooldown?{firstCooldown:s.firstCooldown}:{})})),sharedCooldownSeconds));
    // Without logic the templates of the autonomous logic stay as they are, and a creature that has none gets the one the
    // editor makes; with logic, template 1 is written from it:
    // a creature that was just imported has the block with an empty list, and a decision graph switches to a status
    // "with template 1".
    const hasTemplate=old=>{try{return fields(one(one(old,81),1)).some(f=>f.id===1&&f.wire===2);}catch{return false;}};
    return setBlock(next,layout.properties,82,old=>!template&&old&&hasTemplate(old)?old:creatureLogicBlock(template));
  });
  const out=output(workspace,file,outputName,'-creature-logic');fs.writeFileSync(out,wrap(bytes,done.root));
  return {mapPath:out,source:file,prefabIds:done.prefabIds,templates:done.templates,placed:done.placed,decisionGraphId,
    skills:wanted.map((s,i)=>({number:i+1,skillId:s.skillId,name:s.name,cooldownSeconds:s.cooldown??[0,3],...(s.firstCooldown?{firstCooldownSeconds:s.firstCooldown}:{})})),sharedCooldownSeconds,...(template?{logic:template}:{}),
    next:'Use mapPath in later calls. The creature now runs decision graph '+decisionGraphId+' all the time: g.creationStatusDecision({id, name, prefix:false}).on(\'start1\',(evt,f)=>{ if(...) f.switchToSelfExecutionStatus(true, <status graph id>, 1); else f.switchToSelfExecutionStatus(true, <another>, 1); }) picks the status graph to run; a status graph (scene_add_graph {kind:"creatureStatus"}) is a list of tactics and skills, each with its own condition, tried in order: f.tacticMoveToTheTargetPosition, f.tacticMoveToTheTargetEntity, f.tacticGroundIdleRoaming, f.tacticGroundPursuit, f.tacticStandStill, f.executeSkill(condition, number) and so on (search_node_docs "tactic" with scope "raw"). The graphs read custom variables (f.getCustomVariable), so a server graph steers a creature by writing its variables.'};
}

// Client controls and client scripts (客户端控件和客户端脚本, game version 7.1): an interface drawn and run on the
// player's own machine by Lua 5.3, for menus, moving HUDs and whole 2D games. Read from the official sample 客户端脚本.
// A script is one record of section 50: {1: id, 2: name, 3: file name, 5: the Lua source}. The source travels in the
// save; on import the editor writes it to external_lua_file\<file name> beside the save (seen 2026-10-13).
// On the screen stands a client control container (客户端控件容器), an ordinary control of the layout whose content
// (type 82) names the root of a tree of client controls. A client control is a record of section 9 like the others, with
// these content blocks: its name (15), a marker (86), its rectangle (12, ending in the kind: 25 a container node, 23 an
// image, 31 a text box, 33 a cursor area), its scripts (83), what belongs to its kind, and a last one all of them have
// (90). The root is listed among the roots of the section; a child names its parent and stands in its parent's list.
// Every inner block of these records ends with {2: 1, 3: 8, 4: the record's id}.
// The other kinds were each added once in the editor and read back (tests/fixtures/editor-2026-10-13-clientkinds.gil):
// 32 a text window (文本视窗), 29 an interface effect (界面动效), 30 one that fills the screen (全屏界面动效), 28 a
// preset button (预设按钮), 34 a key hint (按键提示), 26 a grid (网格视窗), 27 a reference to a template (模板引用控件).
// A template (客户端控件模板) is such a control standing by itself among the roots, with a slot of its own and the
// mark of a template in its structure; what it holds are records with a slot too, naming it as parent.
const CLIENT_KINDS={container:25,image:23,text:31,cursorArea:33,textWindow:32,animation:29,fullscreenAnimation:30,presetButton:28,keyHint:34,grid:26,reference:27};
// The size the editor gives a new control of each kind.
const CLIENT_SIZES={container:[150,150],image:[80,80],text:[200,60],cursorArea:[150,50],textWindow:[100,40],animation:[100,100],presetButton:[150,50],keyHint:[40,40],grid:[80,80],reference:[80,80]};
const ownedBy=id=>field(504,2,Buffer.concat([field(2,0,1),field(3,0,8),field(4,0,id)]));
// A content block of the client kind: each type has its wrapping field and its slot, the inner block the next field
// and the slot two on.
const CLIENT_BLOCKS={82:[72,62],83:[73,63],84:[74,64],85:[75,65],89:[76,66],90:[77,67],91:[78,68],92:[79,69],93:[80,70],94:[81,71],95:[82,72],96:[83,73],97:[84,74],98:[85,75],99:[86,76]};
// (The inner block of a text window is the one of a text box, field 75 in slot 66: the two share their text settings.)
const clientBlock=(type,inner,id)=>{const [wrapId,slot]=CLIENT_BLOCKS[type],[innerId,innerSlot]=type===94?[75,66]:[wrapId+1,slot+2];return field(505,2,uiBlock(wrapId,Buffer.alloc(0),slot,type,[field(503,2,uiBlock(innerId,inner,innerSlot,type,[field(503,0,1),ownedBy(id)]))]));};
// One of the four platform states of a rectangle: scale, the two anchors, the position, the size, the pivot, the turn.
// With both anchors at the centre the size is the size and the position counts from the centre of the holder; with
// anchors apart the control stretches with its holder and "size" is what it is larger than the stretch (as in Unity).
const clientState=(s,i)=>field(501,2,Buffer.concat([i?field(501,0,i):Buffer.alloc(0),field(502,2,Buffer.concat([
  field(501,2,Buffer.concat([field(1,5,f32(s?.scale?.[0]??1)),field(2,5,f32(s?.scale?.[1]??1)),field(3,5,f32(1))])),
  field(502,2,s?pair(...(s.anchorMin??[0.5,0.5])):Buffer.alloc(0)),field(503,2,s?pair(...(s.anchorMax??[0.5,0.5])):pair(1,1)),
  field(504,2,s?pair(s.position[0],s.position[1]):Buffer.alloc(0)),
  field(505,2,s?pair(s.size[0],s.size[1]):Buffer.alloc(0)),field(506,2,pair(...(s?.pivot??[0.5,0.5]))),field(508,2,s?.rotation?field(3,5,f32(s.rotation)):Buffer.alloc(0))]))]));
// rect: {position, size, scale, pivot, rotation, anchorMin, anchorMax} from the centre of what holds it (or {states}:
// one for each of the four devices, in the order of the editor's four buttons: a computer, a phone, a console, a
// phone with a gamepad), or nothing for one that fills what holds it. The last number (504) says the four are kept
// the same (同步信息至所有设备); a control given its own rectangle on some device has it not (unsynced). Each device
// has a canvas of its own size, seen in the editor 2026-10-13: 1600 x 900, 1280 x 720, 1920 x 1080, 1280 x 720.
const clientRect=(id,rect,kind)=>field(505,2,uiBlock(11,Buffer.concat([field(12,2,Buffer.alloc(0)),field(501,0,2)]),1,12,[field(503,2,uiBlock(13,Buffer.concat([
  field(12,2,Buffer.concat([...[0,1,2,3].map(i=>clientState(rect?.states?rect.states[i]:rect,i)),field(502,0,kind),rect?.unsynced?Buffer.alloc(0):field(504,0,1)])),field(501,0,2)]),4,12,[field(503,0,1),ownedBy(id)]))]));
// slot: the number a record of a template carries; template: the record is the template itself.
const clientHead=(id,name,children,parent,slot,template)=>Buffer.concat([field(501,0,id),field(502,2,uiBlock(11,field(501,0,id),1,5)),
  slot?field(502,2,uiBlock(12,field(501,0,slot),2,6)):Buffer.alloc(0),template?field(502,2,uiBlock(14,Buffer.alloc(0),4,4)):Buffer.alloc(0),
  children?.length?field(503,2,packIds(children)):Buffer.alloc(0),parent?field(504,0,parent):Buffer.alloc(0),field(505,2,uiBlock(12,field(501,2,Buffer.from(name,'utf8')),2,15))]);
// The container on the screen: it fills the screen, and its content names the root of the client controls.
export function clientContainerRecord({id,name,parent,root,hidden}){
  const marker=Buffer.concat([field(15,2,Buffer.alloc(0)),field(501,0,5)]);
  // Not shown until a graph switches it on: as with the other controls of the layout, {502: 1} in the inner block
  // (the same bytes as a container switched off by hand, tests/fixtures/editor-2026-10-13-clientsettings.gil).
  return Buffer.concat([clientHead(id,name,null,parent),
    field(505,2,uiBlock(14,marker,4,23,[field(503,2,uiBlock(14,hidden?Buffer.concat([marker,field(502,0,1)]):marker,5,23,[field(503,0,1),ownedBy(id)]))])),
    clientRect(id,null,24),clientBlock(82,field(501,0,root),id)]);
}
const flag=(id,on)=>on?field(id,0,1):Buffer.alloc(0);
// One client control. Left alone, every setting is the one the editor gives a new control; what can be said here was
// each changed once by hand in the editor and read back (tests/fixtures/editor-2026-10-13-clientsettings.gil):
// - any control: active false (初始激活 off), visible false (初始可见性 off), focusable (可被手柄摇杆导航选中), scripts
//   (the ids of the client scripts on it; rootForm: the form the root of the official sample has, {501: 1} before them);
// - a container: isolateNavigation, blockKeys (屏蔽按键事件穿透), blockCursor (屏蔽区域内光标事件穿透), showCursor (显示常驻光标);
// - an image: image (the picture), colour (0xAARRGGBB), mask (开启遮罩);
// - a text box and a text window: text {content, fontSize, colour, background, outline, outlineColour, align, valign, autoSize};
// - a grid: grid {itemTemplate, horizontal, itemSize, spacing, padding: [top, bottom, left, right], scrollbar, fixed, preview};
// - a preset button: button {normal, hover, pressed, disabled: ids of controls it holds, enabled, sound};
// - a key hint: keys {keyboard, pad}; an interface effect: effect {id, sound, below}; a reference: template.
// Read from a second save configured by hand (tests/fixtures/editor-2026-10-13-clientmore.gil):
// - a script on a control is its id, or {id, values: [{name, type, value}]} when the control gives public variables
//   of the script values of its own (the order they were given in);
// - navigation {left, right, up, down}: where the stick of a gamepad goes from this control, the id of a control or
//   "none" (left out: the nearest one, as the editor has it);
// - a text window: text.scrollable and text.scrollbar (both on unless false), and text.align.
export function clientControlRecord({id,name,kind,parent,children,rect,script,scripts,rootForm,image,colour,mask,itemTemplate,template,slot,isTemplate,active,visible,focusable,
    isolateNavigation,blockKeys,blockCursor,showCursor,text,grid,button,keys,effect,navigation}){
  const marker=Buffer.concat([field(17,2,Buffer.alloc(0)),field(501,0,7)]);
  const shown=Buffer.concat([field(17,2,flag(503,visible===false)),field(501,0,7),flag(502,active===false)]);
  const carried=scripts??(script?[script]:[]),isRoot=rootForm??(!parent&&!isTemplate&&!slot);
  const align={left:0,centre:1,center:1,right:2},valign={top:0,middle:1,bottom:2};
  // The settings of a text: 501 the least size when the size adapts, 502 that it adapts, 504 the colour of the letters,
  // 505 the colour behind them, 506 that they have no outline, 507 the colour of the outline, 508 and 509 where the
  // text stands across and up (none: left, top), 510 the text, 512 the size of the letters.
  // A text window has two switches more (62: 502 that it scrolls, 503 that its bar shows) and stands its text left
  // unless told otherwise; it has no place up and down.
  const words=(window)=>{const t=text??{},across=align[t.align??(window?'left':'centre')],up=valign[t.valign??'middle'];
    return Buffer.concat([window?field(62,2,Buffer.concat([flag(502,t.scrollable!==false),flag(503,t.scrollbar!==false)])):Buffer.alloc(0),field(501,0,t.minFontSize??20),flag(502,t.autoSize),field(503,0,12),field(504,0,t.colour??0xffffffff),field(505,0,t.background??0xffffff),
      flag(506,t.outline===false),field(507,0,t.outlineColour??0x33333333),across?field(508,0,across):Buffer.alloc(0),...(window?[]:[up?field(509,0,up):Buffer.alloc(0)]),
      field(510,2,t.content?field(501,2,Buffer.from(t.content,'utf8')):Buffer.alloc(0)),window?field(511,0,1):Buffer.alloc(0),field(512,0,t.fontSize??20),field(513,0,20)]);};
  const g=grid??{},b=button??{},e=effect??{};
  const own={
    container:[clientBlock(91,Buffer.concat([flag(501,isolateNavigation),flag(502,blockKeys),flag(503,blockCursor),flag(504,showCursor)]),id)],
    image:[clientBlock(96,Buffer.concat([field(502,0,colour??0xffffffff),image?field(503,0,image):Buffer.alloc(0)]),id),
      clientBlock(97,Buffer.concat([flag(501,mask),field(502,0,1),field(504,0,1),field(505,0,1),field(507,0,2),field(508,0,100),field(510,0,1),field(511,2,pair(8,8)),field(512,5,f32(85)),field(513,5,f32(85)),field(515,0,1)]),id)],
    text:[clientBlock(84,words(false),id)],
    cursorArea:[clientBlock(85,field(501,0,1),id)],
    textWindow:[clientBlock(94,words(true),id)],
    // An interface effect: 501 the effect, 502 that its sound plays, 503 that it lies under the other controls.
    animation:[clientBlock(98,Buffer.concat([e.id?field(501,0,e.id):Buffer.alloc(0),flag(502,e.sound),flag(503,e.below)]),id)],
    fullscreenAnimation:[clientBlock(99,Buffer.concat([e.id?field(501,0,e.id):Buffer.alloc(0),flag(502,e.sound),flag(503,e.below)]),id)],
    // A preset button: 501 to 504 the controls it shows when idle, hovered over, pressed and switched off (controls it
    // holds), 505 that it can be clicked, 506 the sound of a click, 507 that the cursor finds it.
    presetButton:[clientBlock(93,Buffer.concat([b.normal?field(501,0,b.normal):Buffer.alloc(0),b.hover?field(502,0,b.hover):Buffer.alloc(0),b.pressed?field(503,0,b.pressed):Buffer.alloc(0),b.disabled?field(504,0,b.disabled):Buffer.alloc(0),
      flag(505,b.enabled!==false),field(506,0,b.sound??50888),field(507,0,1)]),id)],
    // A key hint: 501 the key of a keyboard, 502 the one of a gamepad (the numbers of the 奇匠按键).
    keyHint:[clientBlock(95,Buffer.concat([field(501,0,keys?.keyboard??1),field(502,0,keys?.pad??1)]),id)],
    // A grid: 501 that it scrolls up and down (none: sideways), 502 the size of an item, 503 the gaps, 504 the margins
    // above and below, 505 left and right, 506 the template of an item, 507 that the bar shows, 509 how many rows or
    // columns when 510 says the number is fixed, 511 how many items the editor shows.
    grid:[clientBlock(92,Buffer.concat([flag(501,!g.horizontal),field(502,2,pair(...(g.itemSize??[50,50]))),field(503,2,pair(...(g.spacing??[8,8]))),field(504,2,pair((g.padding??[20,20,20,20])[0],(g.padding??[20,20,20,20])[1])),field(505,2,pair((g.padding??[20,20,20,20])[2],(g.padding??[20,20,20,20])[3])),
      (g.itemTemplate??itemTemplate)?field(506,0,g.itemTemplate??itemTemplate):Buffer.alloc(0),flag(507,g.scrollbar!==false),field(508,0,1),field(509,0,g.fixed??1),flag(510,g.fixed!==undefined),field(511,0,g.preview??5),field(512,0,1)]),id)],
    reference:[clientBlock(89,template?field(501,0,template):Buffer.alloc(0),id)]}[kind];
  // Where the stick goes: 501 left, 502 right, 503 up, 504 down, each the id of a control or all bits set for nowhere.
  const towards=(at,to)=>to===undefined?Buffer.alloc(0):field(at,0,to==='none'?0xffffffffffffffffn:to);
  return Buffer.concat([clientHead(id,name,children,parent,slot,isTemplate),
    field(505,2,uiBlock(14,marker,4,86,[field(503,2,uiBlock(14,shown,5,86,[field(503,0,1),ownedBy(id)]))])),
    clientRect(id,kind==='fullscreenAnimation'?null:rect,CLIENT_KINDS[kind]),
    clientBlock(83,carried.length?Buffer.concat([flag(501,isRoot),...carried.map(s=>field(502,2,Buffer.concat([field(1,2,field(1,0,s.id??s)),...(s.values??[]).map(v=>field(3,2,controlValue(v)))])))]):Buffer.alloc(0),id),
    ...own,clientBlock(90,Buffer.concat([towards(501,navigation?.left),towards(502,navigation?.right),towards(503,navigation?.up),towards(504,navigation?.down),flag(505,focusable)]),id)]);
}
// The types a variable of a script can have (脚本变量, the twenty the editor offers). type: the number of the type
// as the node graphs have it; kind: how its value is held (a value of kind k stands in field 100 + k, a list in 109);
// code: the number the client gives the type (field 10 of the variable, and what a control names it by); as: what a
// control holds a value of it as, when that is not the type itself (a control id is held as an integer); of: what a
// list holds. Each was added once in the editor and read back (tests/fixtures/editor-2026-10-13-clientvars.gil and
// -clientmore.gil).
const SCRIPT_TYPES={
  integer:{type:3,kind:2,code:3},float:{type:5,kind:4,code:7},boolean:{type:4,kind:6,code:5},string:{type:6,kind:5,code:9},vector3:{type:12,kind:7,code:11},
  entity:{type:1,kind:1,code:1},guid:{type:2,kind:1,code:14},configId:{type:20,kind:1,code:18},prefabId:{type:21,kind:1,code:19},controlId:{type:3,kind:2,code:22,as:3},
  integerList:{type:8,of:'integer',code:4},floatList:{type:10,of:'float',code:8},booleanList:{type:9,of:'boolean',code:6},stringList:{type:11,of:'string',code:10},vector3List:{type:15,of:'vector3',code:12},
  entityList:{type:13,of:'entity',code:2},guidList:{type:7,of:'guid',code:15},configIdList:{type:22,of:'configId',code:20},prefabIdList:{type:23,of:'prefabId',code:21},controlIdList:{type:8,of:'integer',code:23,as:4}};
// A value as given, checked against its type: what is wrong with it, or nothing.
function scriptValueFault(type,value){
  const t=SCRIPT_TYPES[type];
  if(t.of)return Array.isArray(value)&&value.length<=100?value.map(v=>t.of==='entity'?(v===null?null:'an entity of a list has no value to give beforehand (null)'):scriptValueFault(t.of,v)).find(Boolean)??null:'a list takes an array (up to 100)';
  if(type==='entity')return 'an entity has no value to give beforehand: a script is handed one while the game runs';
  if(type==='float')return Number.isFinite(value)?null:'a float takes a number';
  if(type==='boolean')return typeof value==='boolean'?null:'a boolean takes true or false';
  if(type==='string')return typeof value==='string'&&value.length<=200?null:'a string takes a text (up to 200 characters)';
  if(type==='vector3')return Array.isArray(value)&&value.length===3&&value.every(Number.isFinite)?null:'a vector3 takes [x, y, z]';
  if(type==='integer')return Number.isInteger(value)&&Math.abs(value)<=2147483647?null:'an integer takes a whole number';
  return Number.isInteger(value)&&value>=0&&value<=0xffffffff?null:'an id takes a whole number, 0 or more';
}
const vector3=v=>Buffer.concat([1,2,3].map(i=>v[i-1]?field(i,5,f32(v[i-1])):Buffer.alloc(0)));
// A value as the node graphs write one: {1: kind, 2: 1 when it holds something, 4: its type, 100 + kind: what it holds}.
// One the editor made and nobody filled (an integer, a string, an entity, a list) has neither the 2 nor anything held.
function scriptValue(type,value){
  const t=SCRIPT_TYPES[type];
  const held=t.of?Buffer.concat((value??[]).map(v=>field(1,2,scriptValue(t.of,v??undefined)))):
    t.kind===2?(value?field(1,0,BigInt.asUintN(64,BigInt(value))):Buffer.alloc(0)):t.kind===4?(value?field(1,5,f32(value)):Buffer.alloc(0)):t.kind===5?(value?field(1,2,Buffer.from(value,'utf8')):Buffer.alloc(0)):
    t.kind===6?flag(1,value):t.kind===7?(value?.some(Boolean)?field(1,2,vector3(value)):Buffer.alloc(0)):(value?field(1,0,value):Buffer.alloc(0));
  return Buffer.concat([field(1,0,t.of?10002:t.kind),flag(2,held.length),field(4,2,Buffer.concat([field(1,0,1),field(100,2,field(1,0,t.type))])),field(t.of?109:100+t.kind,2,held)]);
}
// A variable of a script (read with script:GetParam(name)): {2: name, 3: type, 4: its value, 5: 1 when a control may
// set its own value (公开), 7 and 8: 6, 10: the code of the type}.
function scriptVariable(v){
  if(typeof v.name!=='string'||!/^[^\s]{1,40}$/.test(v.name)||!SCRIPT_TYPES[v.type])fail('INVALID_VARIABLE','A script variable is {name, type, value, public}; type is one of '+Object.keys(SCRIPT_TYPES).join(', ')+'.',{variable:v});
  const fault=v.value===undefined?null:scriptValueFault(v.type,v.value);
  if(fault)fail('INVALID_VARIABLE','The value does not fit the type: '+fault+'.',{variable:v});
  const t=SCRIPT_TYPES[v.type];
  return Buffer.concat([field(2,2,Buffer.from(v.name,'utf8')),field(3,0,t.type),field(4,2,scriptValue(v.type,v.value)),flag(5,v.public),field(7,0,6),field(8,0,6),field(10,0,t.code)]);
}
// The value a control gives a public variable of a script on it: {2: name, 3: {1: code, 2: {1: c, 2: {1: c, 2: {}},
// 10 + c: the value}}, 4: 1, 5: {1: code, 2: {1: c, 2: {}}}}, c being the code of what the value is held as. Numbers
// and switches of a list are packed into one field; texts and vectors stand one after another; an id of a
// configuration or of a prefab is field 2 of what holds it.
function controlValue({name,type,value}){
  const t=SCRIPT_TYPES[type];if(!t||type==='entity'||type==='entityList')fail('INVALID_VARIABLE','A control cannot give a variable of this type a value.',{name,type});
  const c=t.as??t.code,list=Array.isArray(value)?value:[];
  const held={3:()=>value?field(1,0,BigInt.asUintN(64,BigInt(value))):Buffer.alloc(0),7:()=>value?field(1,5,f32(value)):Buffer.alloc(0),5:()=>flag(1,value),9:()=>field(1,2,Buffer.from(value,'utf8')),11:()=>field(1,2,vector3(value)),
    4:()=>list.length?field(1,2,Buffer.concat(list.map(n=>varint(BigInt.asUintN(64,BigInt(n)))))):Buffer.alloc(0),8:()=>list.length?field(1,2,Buffer.concat(list.map(f32))):Buffer.alloc(0),6:()=>list.length?field(1,2,Buffer.from(list.map(Number))):Buffer.alloc(0),
    10:()=>Buffer.concat(list.map(x=>field(1,2,Buffer.from(x,'utf8')))),12:()=>Buffer.concat(list.map(x=>field(1,2,vector3(x)))),
    14:()=>value?field(1,0,value):Buffer.alloc(0),18:()=>value?field(2,0,value):Buffer.alloc(0),19:()=>value?field(2,0,value):Buffer.alloc(0),
    15:()=>list.length?field(1,2,Buffer.concat(list.map(n=>varint(n)))):Buffer.alloc(0),20:()=>Buffer.concat(list.map(n=>field(1,2,field(2,0,n)))),21:()=>Buffer.concat(list.map(n=>field(1,2,field(2,0,n))))}[c]();
  const as=Buffer.concat([field(1,0,c),field(2,2,Buffer.alloc(0))]);
  return Buffer.concat([field(2,2,Buffer.from(name,'utf8')),field(3,2,Buffer.concat([field(1,0,t.code),field(2,2,Buffer.concat([field(1,0,c),field(2,2,as),field(10+c,2,held)]))])),field(4,0,1),
    field(5,2,Buffer.concat([field(1,0,t.code),field(2,2,as)]))]);
}
// The variables stand in the record twice, as fields 7 and as fields 8 (as the editor wrote them once 应用修改 was pressed).
export const clientScriptRecord=({id,name,file,source,variables=[]})=>Buffer.concat([field(1,0,id),field(2,2,Buffer.from(name,'utf8')),field(3,2,Buffer.from(file,'utf8')),field(5,2,Buffer.from(source,'utf8')),
  ...variables.map(v=>field(7,2,scriptVariable(v))),...variables.map(v=>field(8,2,scriptVariable(v)))]);
const FIRST_SCRIPT_ID=1073741826;
// The trees of client controls of a save: each container of a layout, the controls under its root and the scripts on them.
function clientTrees(root,records,templatesToo=false){
  const byId=new Map(records.map(r=>[r.id,r])),scripts=fields(root).some(f=>f.id===50&&f.wire===2)?clientScripts(root):[];
  const block=(r,type)=>fields(r.raw.data).filter(f=>f.id===505&&f.wire===2).map(f=>f.data).find(b=>varintOf(b,502)===type);
  const inner=(r,type)=>{const b=block(r,type);if(!b)return null;const nested=fields(b).find(f=>f.id===503&&f.wire===2);return nested?fields(nested.data).find(f=>f.id===type-9&&f.wire===2)?.data??null:null;};
  const childIds=r=>{const list=fields(r.raw.data).find(f=>f.id===503&&f.wire===2);if(!list)return [];const out=[];let p=0;const b=list.data;while(p<b.length){let n=0,shift=0;for(;;){const v=b[p++];n+=(v&127)*2**shift;shift+=7;if(!(v&128))break;}out.push(n);}return out;};
  const node=r=>{const carried=inner(r,83),ids=carried?fields(carried).filter(f=>f.id===502&&f.wire===2).flatMap(f=>fields(f.data).filter(x=>x.id===1&&x.wire===2).map(x=>varintOf(x.data,1))):[];
    const kids=childIds(r).map(id=>byId.get(id)).filter(Boolean).map(node);
    return {controlId:r.id,name:r.name,kind:[[91,'container'],[96,'image'],[84,'text'],[85,'cursorArea'],[94,'textWindow'],[98,'animation'],[99,'fullscreenAnimation'],[93,'presetButton'],[95,'keyHint'],[92,'grid'],[89,'reference']].find(([type])=>r.content.includes(type))?.[1]??'other',
      ...(ids.length?{scripts:ids.map(id=>scripts.find(s=>s.id===id)?.name??String(id))}:{}),...(kids.length?{children:kids}:{})};};
  if(templatesToo)return clientTemplates(records).map(t=>node(byId.get(t.id)));
  return records.filter(r=>r.content.includes(82)).map(r=>{const at=inner(r,82),rootRecord=at?byId.get(varintOf(at,501)):null;
    return {containerId:r.id,name:r.name,root:rootRecord?node(rootRecord):null};});
}
// What the client scripts of a save name, checked against what the save and the catalogues have (src/client-check.mjs).
export function checkClientScripts({mapPath,scripts}){
  const file=resolve(mapPath);
  return checkClient({mapPath:file,scripts},{listClientScripts,listComponents,
    listInterface:a=>{const face=listInterface(a),root=container(fs.readFileSync(file));return {...face,clientTemplateTrees:clientTrees(root,uiRecords(root),true)};}});
}
// The problems of some scripts of a save, for the result of the call that just wrote them: nothing when there are none.
const clientProblems=(mapPath,scripts,skip=[])=>{try{const found=checkClientScripts({mapPath,scripts}).problems.filter(p=>!skip.includes(p.kind));
  return found.length?{problems:found.slice(0,30),problemsNote:'What the script names and the save or the API does not have (scene_check_client checks the whole save again). An error is something the game does not complain about and that will not work.'}:{};}catch{return {};}};
function clientScripts(root){
  const section=fields(root).find(f=>f.id===50&&f.wire===2);
  if(!section)fail('UNSUPPORTED_SAVE','This save was written by a game version older than 7.1, which has no client scripts. Open it in the editor and save it once.');
  const typeOf=code=>Object.keys(SCRIPT_TYPES).find(n=>SCRIPT_TYPES[n].code===code)??'unknown';
  return fields(section.data).filter(f=>f.id===1&&f.wire===2).map(f=>{const text=id=>fields(f.data).find(x=>x.id===id&&x.wire===2)?.data.toString('utf8')??'';
    const variables=fields(f.data).filter(x=>x.id===7&&x.wire===2).map(x=>({name:fields(x.data).find(y=>y.id===2&&y.wire===2)?.data.toString('utf8')??'',type:typeOf(varintOf(x.data,10)),public:varintOf(x.data,5)===1}));
    return {raw:f,id:varintOf(f.data,1),name:text(2),file:text(3),source:text(5),variables};});
}
export const CLIENT_SCRIPT_TYPES=Object.keys(SCRIPT_TYPES);
// What the Lua of this version cannot have, from the official API page: found here rather than as a silent failure in play.
const LUA_FORBIDDEN=[[/\bcoroutine\s*\./,'coroutine.* is not available'],[/\bio\s*\./,'io.* is not available'],[/\bstring\s*\.\s*dump\b/,'string.dump is not available'],
  [/\bos\s*\.\s*(?!time\b|date\b|clock\b|difftime\b)[A-Za-z_]+/,'of os only time, date, clock and difftime are available'],[/\bdebug\s*\.\s*(?!traceback\b)[A-Za-z_]+/,'of debug only traceback is available'],
  [/\brequire\s*[("']/,'require is not available: a script reaches another one through its script mapping id'],[/\b(?:loadfile|dofile)\s*\(/,'loadfile and dofile are not available']];
export function setClientScript({mapPath,name,source,sourceFile,file:asFile,variables,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);const root=container(bytes);
  if((source===undefined)===(sourceFile===undefined))fail('INVALID_SCRIPT','Give the Lua either as source or as sourceFile (the path of a .lua file).');
  const lua=source??(fs.existsSync(sourceFile)?fs.readFileSync(sourceFile,'utf8').replace(/^﻿/,''):fail('SOURCE_NOT_FOUND','sourceFile does not exist.',{sourceFile}));
  if(!lua.trim())fail('INVALID_SCRIPT','The script is empty.');
  const stripped=lua.replace(/--\[\[[\s\S]*?\]\]/g,'').replace(/--[^\n]*/g,'').replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g,'""');
  const refused=LUA_FORBIDDEN.filter(([re])=>re.test(stripped)).map(x=>x[1]);
  if(refused.length)fail('LUA_NOT_AVAILABLE','The script uses what the client Lua (5.3, sandboxed) does not have.',{refused});
  // A script that does not compile is refused here, in a moment, rather than by the editor when the playtest starts.
  const broken=luaSyntaxError(lua);
  if(broken)fail('LUA_SYNTAX','The script does not compile: line '+broken.line+', column '+broken.column+': '+broken.message,{line:broken.line,column:broken.column,text:lua.split('\n')[broken.line-1]?.slice(0,200)});
  const scripts=clientScripts(root),had=scripts.find(s=>s.name===name);
  const id=had?.id??Math.max(FIRST_SCRIPT_ID-1,...scripts.map(s=>s.id))+1;
  // One file to a script: the editor writes each to external_lua_file under this name.
  if(asFile&&scripts.some(s=>s.file===asFile&&s.name!==name))fail('DUPLICATE_SCRIPT_FILE','Another script of this save already has this file name.',{file:asFile});
  const luaFile=asFile??had?.file??(/^[A-Za-z0-9_-]{1,40}$/.test(name)&&!scripts.some(s=>s.file===name+'.lua')?name+'.lua':'script_'+(id-FIRST_SCRIPT_ID+1)+'.lua');
  if(variables&&new Set(variables.map(v=>v.name)).size!==variables.length)fail('INVALID_VARIABLE','Two variables of the script have the same name.');
  // A script that is replaced keeps the variables it had unless new ones are given.
  const keptVariables=had&&!variables?fields(had.raw.data).filter(f=>(f.id===7||f.id===8)&&f.wire===2).map(f=>f.raw):null;
  const record=field(1,2,keptVariables?Buffer.concat([clientScriptRecord({id,name,file:luaFile,source:lua}),...keptVariables]):clientScriptRecord({id,name,file:luaFile,source:lua,variables:variables??[]}));
  const section=fields(one(root,50));let placed=false;
  const rebuilt=section.flatMap(f=>{
    if(had&&f.id===1&&f.wire===2&&varintOf(f.data,1)===had.id){placed=true;return [record];}
    // A new script goes after the scripts there are, before what ends the section.
    if(!had&&!placed&&!(f.id===1&&f.wire===2)){placed=true;return [record,f.raw];}
    return [f.raw];});
  if(!placed)rebuilt.push(record);
  const out=output(workspace,file,outputName,'-script');fs.writeFileSync(out,wrap(bytes,replace(root,50,2,Buffer.concat(rebuilt))));
  const callbacks=['OnInit','OnStart','OnEnable','OnDisable','OnUpdate','OnLevelUpdate','OnDestroy'].filter(n=>new RegExp('\\bfunction\\s+'+n+'\\s*\\(').test(stripped));
  // OnUpdate is only called once the script asked for it (seen in play, 2026-10-13: without the call, never).
  const idleUpdate=/\bfunction\s+OnUpdate\s*\(/.test(stripped)&&!/EnableUpdate\s*\(/.test(stripped);
  // A tween does nothing until it is played (a basket that never moved, 2026-10-13).
  const idle=stripped.split('\n').map((l,i)=>/^\s*game\s*\.\s*Tween\s*\(/.test(l)&&!/:\s*Play\s*\(/.test(l)?i+1:0).filter(Boolean);
  // Color takes 0 to 255: one written with fractions is black on the screen (a lamp that stayed black, 2026-10-13).
  const fractions=stripped.split('\n').map((l,i)=>[...l.matchAll(/\bColor(?:\s*\.\s*FromRGBA?)?\s*\(([^()]*)\)/g)].some(m=>{const parts=m[1].split(',').map(x=>x.trim());
    return parts.length>=3&&parts.slice(0,3).every(x=>/^\d*\.?\d+$/.test(x)&&Number(x)<=1)&&parts.slice(0,3).some(x=>x.includes('.'));})?i+1:0).filter(Boolean);
  // The fill of an image shows only on an image whose mask is on (seen in play, 2026-10-13: the value reads back, the picture stays whole).
  const fillAlone=/\bSetFill(?:Horizontal|Vertical|Radial\d+)\s*\(|\.\s*fillAmount\s*=|\bfillAmount\s*=/.test(stripped)&&!/enableMask/.test(stripped);
  return {mapPath:out,source:file,scriptId:id,name,file:luaFile,replaced:!!had,lines:lua.split('\n').length,callbacks,...(variables?.length?{variables:variables.map(v=>v.name)}:{}),
    ...(fractions.length?{coloursLookLikeFractions:{lines:fractions,note:'Color(r, g, b, a) takes 0 to 255, not 0 to 1: these colours are next to black on the screen.'}}:{}),
    ...(fillAlone?{fillNeedsMask:'The script fills an image (SetFill..., fillAmount) and never mentions enableMask: the fill shows only on an image whose mask is on. Give the image mask: true in scene_add_client_ui, or set control.enableMask = true before filling it.'}:{}),
    // Names of the API and of the save the script gets wrong (the controls are checked once an interface carries it).
    ...clientProblems(out,[name],['SCRIPT_NOT_MOUNTED','SIGNAL_NOT_HEARD','SIGNAL_NOT_SENT']),
    ...(idleUpdate?{updateNotEnabled:'The script defines OnUpdate but never calls script:EnableUpdate(true): the game does not call OnUpdate until it does (put the call in OnStart).'}:{}),
    ...(idle.length?{tweensNotPlayed:{lines:idle,note:'game.Tween(...) only makes a tween: it moves nothing until :Play() is called on it.'}}:{}),
    ...(callbacks.length?{}:{warning:'The script defines none of the lifecycle functions the game calls by name (OnInit, OnStart, OnEnable, OnUpdate(dt), OnLevelUpdate(dt), OnDisable, OnDestroy): only what stands at the top level runs, once, when the script loads.'}),
    next:had?'Use mapPath in later calls. The controls that carried this script carry the new source.':'Use mapPath in later calls. A script runs only on a client control: scene_add_client_ui {script: "'+name+'"} puts the controls on the screen with this script on their root.'};
}
export function listClientScripts({mapPath,includeSource=false}){
  const file=resolve(mapPath),root=container(fs.readFileSync(file)),records=uiRecords(root);
  const carried=id=>records.filter(r=>r.content.includes(83)&&fields(r.raw.data).some(f=>f.id===505&&f.wire===2&&varintOf(f.data,502)===83&&f.data.includes(Buffer.concat([field(1,0,id)])))).map(r=>r.name);
  return {mapPath:file,scripts:clientScripts(root).map(s=>({scriptId:s.id,name:s.name,file:s.file,lines:s.source.split('\n').length,on:carried(s.id),...(s.variables.length?{variables:s.variables}:{}),...(includeSource?{source:s.source}:{})})),
    note:'A client script is Lua 5.3 that runs on the player\'s machine on a client control (scene_add_client_ui). read_knowledge {id:"client-lua.zh-CN"} says how one is written; the full API is the official page 附录/客户端控件API文档 (search_knowledge "客户端控件API").'};
}
// The templates of client controls a save has: {id, name}. The id is the 控件模板索引 a script gives
// game.InstantiateClientUIControl, and what a grid or a reference names.
function clientTemplates(records){return records.filter(r=>r.structure.includes(4)&&r.content.includes(86)).map(r=>({id:r.id,name:r.name}));}
// "#rrggbb" and an opacity as the number a record holds (0xAARRGGBB).
const tint=(colour,opacity,name)=>{
  if(colour!==undefined&&!/^#[0-9a-fA-F]{6}$/.test(colour))fail('INVALID_COLOUR','A colour is "#rrggbb".',{name,colour});
  return Number((BigInt(Math.round((opacity??1)*255))<<24n)|BigInt(parseInt((colour??'#ffffff').slice(1),16)));};
// Turns the controls asked for into records, a holder before what it holds. take gives each its id; known are the
// templates there are and scripts the scripts, by name. slots: a function giving the next slot, for the records of a template.
function clientRecords(list,parent,take,known,scripts,slots,made,paths,trail=[]){
  const names=new Set();
  return list.map(c=>{
    if(!CLIENT_KINDS[c.kind])fail('INVALID_CONTROL','kind is one of '+Object.keys(CLIENT_KINDS).join(', ')+'.',{name:c.name,kind:c.kind});
    // Controls of one holder must differ in name: a script finds them by it (GetChild).
    if(names.has(c.name))fail('DUPLICATE_CONTROL_NAME','Two controls of one holder have the same name.',{name:c.name});names.add(c.name);
    if(c.children?.length&&c.kind!=='container'&&c.kind!=='presetButton')fail('INVALID_CONTROL','Only a container and a preset button hold other controls.',{name:c.name});
    const size=c.size??CLIENT_SIZES[c.kind]??[100,100],position=c.position??[0,0];
    if(!(Math.abs(size[0])<=3200&&Math.abs(size[1])<=1800)||Math.abs(position[0])>3200||Math.abs(position[1])>1800)fail('INVALID_RECT','position is [x, y] from the centre of the holder on a 1600 x 900 canvas, y up; size is [width, height].',{name:c.name,position,size});
    const only=(keys,kinds,what)=>{for(const key of keys)if(c[key]!==undefined&&!kinds.includes(c.kind))fail('INVALID_CONTROL',key+' goes with '+what+'.',{name:c.name,kind:c.kind});};
    only(['image','colour','opacity','mask'],['image'],'an image');only(['itemTemplate','grid'],['grid'],'a grid');only(['template'],['reference'],'a reference');
    only(['text'],['text','textWindow'],'a text box or a text window');only(['states','enabled','sound'],['presetButton'],'a preset button');only(['key','padKey'],['keyHint'],'a key hint');
    only(['effect','effectSound','below'],['animation','fullscreenAnimation'],'an interface effect');only(['showCursor','blockKeys','blockCursor','isolateNavigation'],['container'],'a container');
    if(c.devices&&c.kind==='fullscreenAnimation')fail('INVALID_CONTROL','An effect that fills the screen has no rectangle to differ by device.',{name:c.name});
    if(c.text&&c.kind!=='textWindow'&&(c.text.scrollable!==undefined||c.text.scrollbar!==undefined))fail('INVALID_CONTROL','scrollable and scrollbar go with a text window.',{name:c.name,kind:c.kind});
    const named=key=>{if(c[key]===undefined)return undefined;const hit=known.find(t=>t.name===c[key]);
      if(!hit)fail('TEMPLATE_NOT_FOUND','The save has no client control template of this name. Add it first: scene_add_client_template.',{name:c.name,[key]:c[key],templates:known.map(t=>t.name)});return hit.id;};
    // A script on the control: its name, or {name, values} when the control gives public variables values of its own.
    const carried=[...(c.script!==undefined?[c.script]:[]),...(c.scripts??[])].map(e=>{const n=typeof e==='string'?e:e?.name,hit=scripts.find(x=>x.name===n);
      if(!hit)fail('SCRIPT_NOT_FOUND','The save has no client script of this name. Add it first: scene_set_client_script.',{name:c.name,script:n,scripts:scripts.map(x=>x.name)});return {id:hit.id,script:hit,given:e?.values};});
    const t=c.text,g=c.grid;
    if(g?.rows!==undefined&&g?.columns!==undefined)fail('INVALID_CONTROL','A grid has a fixed number of rows (it then scrolls sideways) or of columns (it scrolls up and down), not both.',{name:c.name});
    const id=take(c.name);paths.push({name:c.name,kind:c.kind,path:[...trail,c.name].join('/'),controlId:id,...(c.kind==='fullscreenAnimation'?{}:{position,size})});
    // What is said of the control is its rectangle on a computer; devices says where it differs on the other three.
    const base={position,size,scale:c.scale,pivot:c.pivot,rotation:c.rotation,anchorMin:c.anchor?.min,anchorMax:c.anchor?.max};
    const onDevice=d=>{const o=c.devices?.[d];if(!o)return base;
      if(o.position&&(Math.abs(o.position[0])>3200||Math.abs(o.position[1])>1800)||o.size&&!(Math.abs(o.size[0])<=3200&&Math.abs(o.size[1])<=1800))fail('INVALID_RECT','The position or the size given for a device is out of range.',{name:c.name,device:d});
      return {...base,...(o.position?{position:o.position}:{}),...(o.size?{size:o.size}:{}),...(o.scale?{scale:o.scale}:{}),...(o.pivot?{pivot:o.pivot}:{}),...(o.rotation!==undefined?{rotation:o.rotation}:{}),...(o.anchor?{anchorMin:o.anchor.min,anchorMax:o.anchor.max}:{})};};
    const rect=c.rectStates?{states:c.rectStates}:c.devices?{unsynced:true,states:[base,...CLIENT_DEVICES.slice(1).map(onDevice)]}:base;
    // A control the stick is sent from or to has to be one the stick can stand on.
    const record={id,name:c.name,kind:c.kind,parent,rect,slot:slots?.(),rootForm:false,scripts:carried,active:c.active,visible:c.visible,focusable:c.focusable??(c.navigation?true:undefined),towards:c.navigation,
      isolateNavigation:c.isolateNavigation,blockKeys:c.blockKeys,blockCursor:c.blockCursor,showCursor:c.showCursor,
      image:c.image,colour:c.colour!==undefined||c.opacity!==undefined?tint(c.colour,c.opacity,c.name):undefined,mask:c.mask,template:named('template'),
      text:t&&{content:t.content,fontSize:t.fontSize,minFontSize:t.minFontSize,autoSize:t.autoSize,align:t.align,valign:t.valign,outline:t.outline,scrollable:t.scrollable,scrollbar:t.scrollbar,
        colour:t.colour!==undefined||t.opacity!==undefined?tint(t.colour,t.opacity,c.name):undefined,
        background:t.background!==undefined?tint(t.background,t.backgroundOpacity??1,c.name):undefined,
        outlineColour:t.outlineColour!==undefined?tint(t.outlineColour,t.outlineOpacity??1,c.name):undefined},
      // A grid with rows given lies on its side: the editor offers 固定行数 for a grid that scrolls sideways and
      // 固定列数 for one that scrolls up and down.
      grid:(g||c.itemTemplate!==undefined)?{itemTemplate:named('itemTemplate'),horizontal:g?.horizontal??(g?.rows!==undefined),itemSize:g?.itemSize,spacing:g?.spacing,padding:g?.padding,scrollbar:g?.scrollbar,fixed:g?.rows??g?.columns,preview:g?.preview}:undefined,
      keys:(c.key!==undefined||c.padKey!==undefined)?{keyboard:c.key,pad:c.padKey}:undefined,
      effect:(c.effect!==undefined||c.effectSound||c.below)?{id:c.effect,sound:c.effectSound,below:c.below}:undefined};
    made.push(record);
    record.children=clientRecords(c.children??[],id,take,known,scripts,slots,made,paths,[...trail,c.name]);
    if(c.kind==='presetButton'){
      // What the button shows in each of its states are controls it holds, by name.
      const mine=(c.children??[]).map((k,i)=>[k.name,record.children[i]]),state=key=>{const n=c.states?.[key];if(n===undefined)return undefined;const hit=mine.find(m=>m[0]===n);
        if(!hit)fail('INVALID_CONTROL','A state of a preset button names one of the controls it holds (its children).',{name:c.name,state:key,given:n,children:mine.map(m=>m[0])});return hit[1];};
      record.button={normal:state('normal'),hover:state('hover'),pressed:state('pressed'),disabled:state('disabled'),enabled:c.enabled,sound:c.sound};
    }
    return id;});
}
// The four devices a control has a rectangle for, in the order the records hold them, and the canvas of each.
const CLIENT_DEVICES=['pc','mobile','console','mobileGamepad'];
const CLIENT_CANVAS={pc:[1600,900],mobile:[1280,720],console:[1920,1080],mobileGamepad:[1280,720]};
// Once every control of a tree has its id: what names another control (where the stick goes, a variable that holds
// the id of a control) gets the id, and the values a control gives the variables of its scripts are checked against
// the variables the script has.
function settleClientRecords(made,paths){
  const find=(ref,asked)=>{const byPath=paths.filter(p=>p.path===ref),hits=byPath.length?byPath:paths.filter(p=>p.name===ref);
    if(hits.length!==1)fail('CONTROL_NOT_FOUND',hits.length?'Several controls have this name: give the path (holder/name).':'No control of this interface has this name or path.',{...asked,given:ref,controls:paths.map(p=>p.path)});
    return hits[0].controlId;};
  for(const r of made){
    if(r.towards){r.navigation={};
      for(const side of ['left','right','up','down']){const to=r.towards[side];if(to===undefined)continue;
        if(to==='none'){r.navigation[side]='none';continue;}
        const id=find(to,{control:r.name,navigation:side});
        if(!made.find(m=>m.id===id).focusable)fail('NOT_FOCUSABLE','The stick can only be sent to a control it can stand on: give that control focusable: true.',{control:r.name,navigation:side,to});
        r.navigation[side]=id;}}
    r.scripts=(r.scripts??[]).map(s=>{if(typeof s==='number')return s;
      return {id:s.id,values:Object.entries(s.given??{}).map(([name,given])=>{const asked={control:r.name,script:s.script.name,variable:name},v=s.script.variables.find(x=>x.name===name);
        if(!v)fail('VARIABLE_NOT_FOUND','The script has no variable of this name (scene_set_client_script gives a script its variables).',{...asked,variables:s.script.variables.map(x=>x.name)});
        if(!v.public)fail('VARIABLE_NOT_PUBLIC','A control can only give a value to a variable the script declares public.',asked);
        if(v.type==='entity'||v.type==='entityList'||v.type==='unknown')fail('INVALID_VARIABLE','A control cannot give a variable of this type a value.',{...asked,type:v.type});
        // The id of a control, said by its name or its path in this interface.
        const value=v.type==='controlId'&&typeof given==='string'?find(given,asked):v.type==='controlIdList'&&Array.isArray(given)?given.map(x=>typeof x==='string'?find(x,asked):x):given;
        const fault=scriptValueFault(v.type,value);if(fault)fail('INVALID_VARIABLE','The value does not fit the type of the variable ('+v.type+'): '+fault+'.',{...asked,given});
        return {name,type:v.type,value};})};});
  }
}
// Puts a tree of client controls on the screen: the container in the layout, a root that fills the screen and carries
// the script, and the controls under it. ids: for the test that rebuilds the official sample (the editor numbers
// controls as they were made, which is not the order they stand in).
export function addClientUi({mapPath,name,script,scripts:more=[],controls=[],hidden=false,showCursor,blockKeys,blockCursor,isolateNavigation,outputName,ids},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  const records=uiRecords(root),layout=records.find(r=>r.structure.includes(7));
  if(!layout)fail('UNSUPPORTED_SAVE','The save has no default layout to add to.');
  if(!records.some(r=>r.name==='ClientUIRootHierarchyRoot'))fail('UNSUPPORTED_SAVE','This save was written by a game version older than 7.1, which has no client controls. Open it in the editor and save it once.');
  if(records.some(r=>r.name===name))fail('DUPLICATE_CONTROL_NAME','The interface already has a control with this name.',{name});
  const scripts=clientScripts(root),wanted=[...(script!==undefined?[script]:[]),...more],onRoot=wanted.map(e=>{const n=typeof e==='string'?e:e?.name,hit=scripts.find(s=>s.name===n);
    if(!hit)fail('SCRIPT_NOT_FOUND','The save has no client script of this name. Add it first: scene_set_client_script.',{script:n,scripts:scripts.map(s=>s.name)});return {id:hit.id,script:hit,given:e?.values};});
  let next=Math.max(...records.map(r=>r.id))+1;const take=key=>ids?.[key]??next++;
  const containerId=take(name),rootId=take('容器节点'),made=[],paths=[];
  const rootRecord={id:rootId,name:'容器节点',kind:'container',rect:null,scripts:onRoot,rootForm:true,showCursor,blockKeys,blockCursor,isolateNavigation};made.push(rootRecord);
  rootRecord.children=clientRecords(controls,rootId,take,clientTemplates(records),scripts,null,made,paths);
  settleClientRecords(made,paths);
  const fresh=made.map(clientControlRecord);
  const section=fields(one(root,9));let lastOfLayout=-1,lastRecord=-1;
  section.forEach((f,i)=>{if(f.id===502&&f.wire===2){lastRecord=i;if(varintOf(f.data,504)===layout.id)lastOfLayout=i;}});
  const adopt=data=>{const parts=fields(data),list=parts.find(f=>f.id===503&&f.wire===2);
    if(list)return Buffer.concat(parts.map(f=>f===list?field(503,2,Buffer.concat([f.data,varint(containerId)])):f.raw));
    let last=-1;parts.forEach((f,i)=>{if(f.id===502&&f.wire===2)last=i;});
    return Buffer.concat(parts.flatMap((f,i)=>i===last?[f.raw,field(503,2,varint(containerId))]:[f.raw]));};
  const rebuilt=section.flatMap((f,i)=>{
    // The root of the client controls joins the roots of the section, after the ones there are.
    if(f.id===501&&f.wire===2)return [field(501,2,Buffer.concat([f.data,varint(rootId)]))];
    const out=f.id===502&&f.wire===2&&varintOf(f.data,501)===layout.id?[field(502,2,adopt(f.data))]:[f.raw];
    // The container stands after the last control of the layout, the client controls after every record.
    if(i===(lastOfLayout<0?lastRecord:lastOfLayout))out.push(field(502,2,clientContainerRecord({id:containerId,name,parent:layout.id,root:rootId,hidden})));
    if(i===lastRecord)out.push(...fresh.map(b=>field(502,2,b)));
    return out;});
  root=replace(root,9,2,Buffer.concat(rebuilt));
  const out=output(workspace,file,outputName,'-clientui');fs.writeFileSync(out,wrap(bytes,root));
  const mounted=[...new Set(made.flatMap(r=>(r.scripts??[]).map(x=>scripts.find(q=>q.id===(x.id??x))?.name)).filter(Boolean))];
  return {mapPath:out,source:file,containerId,rootId,name,scripts:onRoot.map(s=>({name:s.script.name,scriptId:s.id})),controls:paths,
    ...(mounted.length?clientProblems(out,mounted,['SIGNAL_NOT_HEARD','SIGNAL_NOT_SENT']):{}),
    templates:clientTemplates(uiRecords(root)).map(t=>({templateIndex:t.id,name:t.name})),
    next:'Use mapPath in later calls. In the script, script.object is the root (a container that fills the screen) and '+(paths.length?'script.object:GetChild("'+paths[0].name+'")':'script.object:GetChild(name)')+' finds a control under it by name (a child of a child through its own GetChild). The controls are written as the editor makes them, empty: an image shows nothing until the script gives it a picture (control:SetImage(Enum.ImageSource.StaticReference, id), ids from image_catalog) and a colour (control.imageColor = Color(r, g, b)). Controls stand in the order given, later ones over earlier ones. On an account of 奇匠 level 1 a client text box shows nothing either (seen in play, 2026-10-13): say it with pictures.'};
}
// A template of client controls (客户端控件模板): a control, with what it holds, kept beside the screen for a script to
// make copies of (game.InstantiateClientUIControl(index, parent)), for a grid to make its items from, or for a
// reference to show. Read from two templates saved by hand (tests/fixtures/editor-2026-10-13-clientkinds.gil): the
// template stands among the roots before the layout, its record and those of what it holds before the layout's, each
// with a slot of its own.
export function addClientTemplate({mapPath,name,outputName,...spec},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  const records=uiRecords(root),layout=records.find(r=>r.structure.includes(7));
  if(!layout)fail('UNSUPPORTED_SAVE','The save has no default layout.');
  if(!records.some(r=>r.name==='ClientUIRootHierarchyRoot'))fail('UNSUPPORTED_SAVE','This save was written by a game version older than 7.1, which has no client controls. Open it in the editor and save it once.');
  const known=clientTemplates(records);
  if(known.some(t=>t.name===name))fail('DUPLICATE_TEMPLATE_NAME','The save already has a client control template of this name.',{name});
  let next=Math.max(...records.map(r=>r.id))+1,slot=Math.max(0,...records.map(r=>r.slot));
  const made=[],paths=[];
  clientRecords([{kind:'container',...spec,name,position:[0,0]}],0,()=>next++,known,clientScripts(root),()=>++slot,made,paths);
  made[0].isTemplate=true;made[0].parent=undefined;
  settleClientRecords(made,paths);
  const fresh=made.map(clientControlRecord),templateId=made[0].id;
  const section=fields(one(root,9));let placed=false;
  const idsOf=b=>{const out=[];let p=0;while(p<b.length){let n=0,shift=0;for(;;){const v=b[p++];n+=(v&127)*2**shift;shift+=7;if(!(v&128))break;}out.push(n);}return out;};
  const rebuilt=section.flatMap(f=>{
    // Among the roots the template stands before the layout, after the templates there are.
    if(f.id===501&&f.wire===2)return [field(501,2,packIds(idsOf(f.data).flatMap(id=>id===layout.id?[templateId,id]:[id])))];
    if(!placed&&f.id===502&&f.wire===2&&varintOf(f.data,501)===layout.id){placed=true;return [...fresh.map(b=>field(502,2,b)),f.raw];}
    return [f.raw];});
  root=replace(root,9,2,Buffer.concat(rebuilt));
  const out=output(workspace,file,outputName,'-template');fs.writeFileSync(out,wrap(bytes,root));
  return {mapPath:out,source:file,templateIndex:templateId,name,controls:paths.map(({position,...p})=>p),
    next:'Use mapPath in later calls. A script makes a copy with game.InstantiateClientUIControl('+templateId+', parent) and removes one with game.DestroyClientUIControl(control); a grid of scene_add_client_ui takes it as itemTemplate: "'+name+'", a reference as template: "'+name+'".'};
}
// Takes a client interface, a template or a script out of a copy of a save. Changing one that is there is taking it
// out and adding it again (a script alone is replaced by scene_set_client_script, which keeps its id).
export function removeClient({mapPath,ui,template,script,outputName},workspace){
  const file=resolve(mapPath),bytes=fs.readFileSync(file);let root=container(bytes);
  if([ui,template,script].filter(v=>v!==undefined).length!==1)fail('INVALID_ARGUMENT','Give one of ui, template or script: the name of the one to take out.');
  const idsOf=b=>{const out=[];let p=0;while(p<b.length){let n=0,shift=0;for(;;){const v=b[p++];n+=(v&127)*2**shift;shift+=7;if(!(v&128))break;}out.push(n);}return out;};
  const records=uiRecords(root),byId=new Map(records.map(r=>[r.id,r]));
  const childIds=r=>{const list=fields(r.raw.data).find(f=>f.id===503&&f.wire===2);return list?idsOf(list.data):[];};
  const tree=id=>{const r=byId.get(id);return r?[id,...childIds(r).flatMap(tree)]:[];};
  const blockInner=(r,type,innerId)=>{const b=fields(r.raw.data).filter(f=>f.id===505&&f.wire===2).map(f=>f.data).find(x=>varintOf(x,502)===type);const nested=b&&fields(b).find(f=>f.id===503&&f.wire===2);
    return nested?fields(nested.data).find(f=>f.id===innerId&&f.wire===2)?.data??null:null;};
  if(script!==undefined){
    const scripts=clientScripts(root),hit=scripts.find(s=>s.name===script);
    if(!hit)fail('SCRIPT_NOT_FOUND','The save has no client script of this name.',{script,scripts:scripts.map(s=>s.name)});
    const on=records.filter(r=>{const inner=blockInner(r,83,74);return inner&&fields(inner).some(f=>f.id===502&&f.wire===2&&fields(f.data).some(x=>x.id===1&&x.wire===2&&varintOf(x.data,1)===hit.id));}).map(r=>r.name);
    if(on.length)fail('SCRIPT_IN_USE','Controls carry this script: take the interface or the template they belong to out first.',{script,on});
    const kept=fields(one(root,50)).filter(f=>!(f.id===1&&f.wire===2&&varintOf(f.data,1)===hit.id)).map(f=>f.raw);
    const out=output(workspace,file,outputName,'-removed');fs.writeFileSync(out,wrap(bytes,replace(root,50,2,Buffer.concat(kept))));
    return {mapPath:out,source:file,removed:{script,scriptId:hit.id},next:'Use mapPath in later calls.'};
  }
  let gone,rootIds=[],layoutChild=null,what;
  if(ui!==undefined){
    const box=records.find(r=>r.name===ui&&r.content.includes(82));
    if(!box)fail('CLIENT_UI_NOT_FOUND','The save has no client interface of this name.',{ui,interfaces:records.filter(r=>r.content.includes(82)).map(r=>r.name)});
    const top=varintOf(blockInner(box,82,73),501);gone=new Set([box.id,...tree(top)]);rootIds=[top];layoutChild=box.id;what={ui,containerId:box.id,controls:gone.size-1};
  }else{
    const hit=clientTemplates(records).find(t=>t.name===template);
    if(!hit)fail('TEMPLATE_NOT_FOUND','The save has no client control template of this name.',{template,templates:clientTemplates(records).map(t=>t.name)});
    gone=new Set(tree(hit.id));rootIds=[hit.id];
    const users=records.filter(r=>!gone.has(r.id)&&(varintOf(blockInner(r,92,80)??Buffer.alloc(0),506)===hit.id||varintOf(blockInner(r,89,77)??Buffer.alloc(0),501)===hit.id)).map(r=>r.name);
    if(users.length)fail('TEMPLATE_IN_USE','A grid or a reference names this template: take the interface it belongs to out first.',{template,usedBy:users});
    what={template,templateIndex:hit.id,controls:gone.size};
  }
  const rebuilt=fields(one(root,9)).flatMap(f=>{
    if(f.id===501&&f.wire===2)return [field(501,2,packIds(idsOf(f.data).filter(id=>!rootIds.includes(id))))];
    if(f.id!==502||f.wire!==2)return [f.raw];
    const id=varintOf(f.data,501);if(gone.has(id))return [];
    if(layoutChild===null||!childIds({raw:f}).includes(layoutChild))return [f.raw];
    return [field(502,2,Buffer.concat(fields(f.data).map(x=>x.id===503&&x.wire===2?field(503,2,packIds(idsOf(x.data).filter(i=>i!==layoutChild))):x.raw)))];});
  const out=output(workspace,file,outputName,'-removed');fs.writeFileSync(out,wrap(bytes,replace(root,9,2,Buffer.concat(rebuilt))));
  return {mapPath:out,source:file,removed:what,next:'Use mapPath in later calls. The scripts it carried are still in the save (scene_list_client_scripts): add the interface again with what is to be different, or take the scripts out too.'};
}
