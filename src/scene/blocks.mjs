import {field,fields,one,varint} from './wire.mjs';
import fs from 'node:fs';
import {findAsset} from './assets.mjs';
import {shapeOf,colorRecord} from './shapes.mjs';

// Monsters need more than a transform: the importer leaves their perception and native-AI
// parameters empty, and such a monster stands still forever. These bodies restore the official values.
const MONSTER_SEEDS=JSON.parse(fs.readFileSync(new URL('./monster-seeds.json',import.meta.url),'utf8')).monsters;
// Entity IDs are typed by range: objects live in 0x404xxxxx, monsters in 0x408xxxxx. The importer
// silently drops an entity whose ID is in the wrong range.
const MONSTER_ID_MIN=0x40800000,MONSTER_ID_MAX=0x408fffff;

// Scene pieces as official GIA entity assets. The asset layout and the block
// measurements come from UGC-File-Generate-Utils (Apache-2.0, see
// THIRD_PARTY_NOTICES.md); official import was verified on CN 7.1.
// baseSize is the edge length in metres at baseScale, so a block of `size`
// metres needs scale = baseScale / baseSize * size on each axis.
export const BLOCK_CATALOG=[
 {"templateId":20001224,"name":"木质箱子","color":[135,114,100],"baseSize":1.0,"baseScale":[1.0,1.0,1.0]},
 {"templateId":20001034,"name":"石质元素立方体","color":[149,160,145],"baseSize":5.0,"baseScale":[1.0,1.0,1.0]},
 {"templateId":20001237,"name":"木质箱子（绿）","color":[164,175,134],"baseSize":1.5,"baseScale":[1.0,1.0,1.0]},
 {"templateId":20001238,"name":"木质箱子（蓝）","color":[159,178,182],"baseSize":1.5,"baseScale":[1.0,1.0,1.0]},
 {"templateId":20001239,"name":"木质箱子（紫）","color":[179,149,183],"baseSize":1.5,"baseScale":[1.0,1.0,1.0]},
 {"templateId":20001869,"name":"石质墙体（黄）","color":[242,183,81],"baseSize":3.0,"baseScale":[1.0,1.3,1.0]},
 {"templateId":20001870,"name":"石质墙体（红）","color":[248,132,68],"baseSize":3.0,"baseScale":[1.0,1.3,1.0]},
 {"templateId":20001872,"name":"石质墙体（灰）","color":[189,199,212],"baseSize":3.0,"baseScale":[1.0,1.3,1.0]},
 {"templateId":20001874,"name":"水质立方体","color":[16,127,255],"baseSize":1.0,"baseScale":[1.0,1.0,1.0]},
 {"templateId":20001875,"name":"通常立方体（奶黄）","color":[225,208,161],"baseSize":1.0,"baseScale":[1.0,1.0,1.0]},
 {"templateId":20001876,"name":"坚固立方体（暗蓝）","color":[105,171,204],"baseSize":1.0,"baseScale":[1.0,1.0,1.0]},
 {"templateId":20001877,"name":"冰质立方体","color":[146,246,255],"baseSize":1.0,"baseScale":[1.0,1.0,1.0]},
 {"templateId":20001878,"name":"火质立方体","color":[255,129,57],"baseSize":1.0,"baseScale":[1.0,1.0,1.0]},
 {"templateId":20001879,"name":"雷质立方体","color":[182,111,255],"baseSize":1.0,"baseScale":[1.0,1.0,1.0]},
 {"templateId":20001082,"name":"矩形木质矮柜","color":[95,87,92],"baseSize":1.0,"baseScale":[1.0,1.25,1.0]},
 {"templateId":20001096,"name":"积木立方体（木色）","color":[182,168,148],"baseSize":6.0,"baseScale":[1.0,1.0,1.0]},
 {"templateId":20001097,"name":"积木立方体（深色）","color":[151,140,130],"baseSize":6.0,"baseScale":[1.0,1.0,1.0]},
 {"templateId":20001100,"name":"积木立方体（浅色）","color":[189,197,195],"baseSize":6.0,"baseScale":[1.0,1.0,1.0]},
 {"templateId":20002146,"name":"石质天花板（白）","color":[194,189,183],"baseSize":5.0,"baseScale":[1.0,41.7,1.0]},
 {"templateId":20002121,"name":"木质天花板（黑）","color":[85,102,128],"baseSize":5.0,"baseScale":[1.0,41.7,1.0]},
 {"templateId":10005014,"name":"积木平台（绿）","color":[77,175,116],"baseSize":5.0,"baseScale":[1.0,10.1,1.0]}
];
const byId=new Map(BLOCK_CATALOG.map(b=>[b.templateId,b])),byName=new Map(BLOCK_CATALOG.map(b=>[b.name,b]));
// Resolves a block name/ID first (measurements verified by import), then any asset of the full catalog.
// Returns {templateId, name, unit}: unit is the scale that makes the model one metre on each axis, or null if unmeasured.
export function blockTemplate(key){
 const block=typeof key==='number'?byId.get(key):byName.get(key);
 if(block)return {templateId:block.templateId,name:block.name,unit:block.baseScale.map(base=>base/block.baseSize)};
 // A white-box shape (球体, 圆锥 ...): about a metre at scale 1, pivot in its centre. A flat plane is sized on x and z.
 const shape=shapeOf(key);
 if(shape)return {templateId:shape.id,name:shape.name,unit:shape.size.map(n=>n>0?1/n:1),natural:shape.size,shape:true};
 const asset=findAsset(key);
 if(!asset)throw Object.assign(new Error('Unknown block or asset: '+key+'. Use an ID from scene_search_assets, a block name from scene_block_catalog, or an asset name that is unique.'),{code:'UNKNOWN_BLOCK_TEMPLATE'});
 return {templateId:asset.id,name:asset.name,unit:asset.size&&asset.size.every(n=>n>0)?asset.size.map(n=>1/n):null,natural:asset.size||null,
  monster:asset.group.startsWith('怪物'),seed:MONSTER_SEEDS[asset.id]||null};
}
const text=s=>Buffer.from(s,'utf8');
const message=(...parts)=>Buffer.concat(parts);
// proto3 leaves out zero scalars; the official importer accepts the same omission.
const number=(id,n)=>n?field(id,0,n):Buffer.alloc(0);
const float=(id,n)=>{if(!n)return Buffer.alloc(0);const b=Buffer.alloc(4);b.writeFloatLE(n);return field(id,5,b);};
const vector=v=>message(float(1,v[0]),float(2,v[1]),float(3,v[2]));
// Runtime records the editor gives a hand-placed dynamic object (kinds 18, 1, 3, 19, 6, 14).
// Dormant pieces carry the same set so they match what the editor itself writes.
const dynamicObjectTail=()=>Buffer.concat(['08121001e2015e4a25180120012a0032003d0000803f420052005801ba1f0ce58f97e587bbe789b9e69588d81f0d5228180120012a0032003d0000803f420052005801ba1f0fe8a2abe587bbe58092e789b9e69588d81f0d5a0b47495f526f6f744e6f6465',
 '080110015a00','080310016a00','08131001ea0100','08061001820100','080e1001c20100'].map(h=>field(7,2,Buffer.from(h,'hex'))));
// A patrol makes a creature walk a saved path while it has no target. The settings are the ones the editor wrote for a
// hand-made patrol: behaviour block 30 with out-of-combat mode 5 (patrol), territory block 34 without a shape, and block 65
// listing the templates. Template 1 is the one active at the start; a node graph switches with switchCreationPatrolTemplate.
// Behaviour mode ids as the editor saved them for these monsters; the importer fills this in by itself only when the
// pack leaves the behaviour block out, and a patrol has to write that block.
const BEHAVIOUR_MODES={30002002:10002001,30002003:10002002,30002007:10002007,30003002:10003002,30003003:10003003,30004001:10004001};
// Block 65: the list of patrol templates. The official importer empties this block, so after importing a pack the
// templates have to be written into the save again (scripts/dev/patch_patrol.mjs does that with this same function).
export function patrolBlock(list){
 const waypoint=id=>field(2,2,message(number(1,id),number(2,3601),number(3,3700),float(4,0.5),field(6,2,Buffer.alloc(0))));
 const templates=list.map((t,i)=>field(2,2,message(number(1,i+1),field(2,2,text('模板_'+(i+1))),
  field(3,2,i?message(number(2,3800),number(4,1)):message(number(1,1),number(2,3800),number(3,1),number(4,1))),
  field(4,2,message(number(1,t.pathId),...t.waypointIds.map(waypoint))))));
 return message(number(1,65),field(70,2,field(1,2,message(...templates))));
}
function patrolProps(props,patrol,templateId){
 const mode=BEHAVIOUR_MODES[templateId];
 if(!mode)throw Object.assign(new Error('Patrol is not available for this monster yet (its behaviour mode id is unknown). Known: '+Object.keys(BEHAVIOUR_MODES).join(', ')),{code:'INVALID_BLOCK'});
 const kindOf=b=>Number(fields(b).find(f=>f.id===1&&f.wire===0)?.value);
 return [message(number(1,30),field(40,2,field(1,2,message(number(1,mode),number(2,5))))),
  ...props.map(h=>Buffer.from(h,'hex')).filter(b=>![30,34,65].includes(kindOf(b))),
  message(number(1,34),field(44,2,field(1,2,message(float(2,40),float(6,5))))),
  patrolBlock(patrol.templates)];
}
function asset({entityId,templateId,name,position,rotation,scale,seed,createAtStart,patrol,solid,color}){
 const seedProps=seed?(patrol?patrolProps(seed.props,patrol,templateId):seed.props.map(h=>Buffer.from(h,'hex'))):[];
 const transform=message(field(1,2,vector(position)),field(2,2,vector(rotation)),field(3,2,vector(scale)),field(501,0,4294967295));
 const component=message(number(1,1),field(11,2,transform));
 // The name property also says whether this is a static unit. Static units are scenery: a monster marked
 // static shows in the editor but never spawns in play, so creatures leave the flag out (as the editor does).
 // A static unit is also always present: it ignores “初始创建”, so a piece that waits to be created must be dynamic too.
 const property=message(number(1,1),field(11,2,message(field(1,2,text(name)),number(2,seed||createAtStart===false?0:1))));
 const hex=h=>Buffer.from(h,'hex');
 const data=message(number(1,entityId),field(2,2,message(number(1,templateId),number(2,1))),field(5,2,property),...seedProps.map(p=>field(5,2,p)),
  field(6,2,component),...(seed?seed.comps.map(c=>field(6,2,hex(c))):[]),
  // Component 4 is the editor's “初始创建” switch: an empty body means the entity waits for a createEntity(guid) node.
  ...(createAtStart===false?[field(6,2,message(number(1,4),field(14,2,Buffer.alloc(0))))]:[]),
  // Component 5 is the native collision (原生碰撞): {15: {1: 1, 2: 1}} when it is on, {15: {}} when characters walk through.
  // Left out, the importer decides, and for many decorations (a stone fence, seen in play 2026-10-12) that is "off".
  ...(solid!==undefined?[field(6,2,message(number(1,5),field(15,2,solid?message(number(1,1),number(2,1)):Buffer.alloc(0))))]:[]),
  // Component 22 is the custom colour (颜色与材质), the same record the editor writes on a placed entity (see shapes.mjs).
  ...(color?[field(6,2,color)]:[]),
  // Component 7 holds the combat stats. A dynamic object must have them filled in, otherwise the playtest
  // check refuses the map with “实体的属性设置错误，属性类型：7”. These are the editor's defaults for a new dynamic object.
  ...(!seed&&createAtStart===false?[field(6,2,message(number(1,7),field(17,2,message(float(1,10),float(2,1),float(3,500),number(5,1),
   field(6,2,number(2,10200002)),...[8,9,10,11,12,13,14,15].map(id=>float(id,0.1))))))]:[]),seed?hex(seed.tail):createAtStart===false?dynamicObjectTail():Buffer.alloc(0),number(8,templateId));
 const entity=message(field(1,2,data),number(4,templateId));
 const meta=message(number(2,1),number(3,2),number(4,entityId));
 return message(field(1,2,meta),field(3,2,text(name)),number(5,3),field(12,2,entity));
}
function container(payload){
 const header=Buffer.alloc(20);
 header.writeUInt32BE(payload.length+20,0);header.writeUInt32BE(1,4);header.writeUInt32BE(0x326,8);header.writeUInt32BE(3,12);header.writeUInt32BE(payload.length,16);
 const footer=Buffer.alloc(4);footer.writeUInt32BE(0x679);
 return Buffer.concat([header,payload,footer]);
}
const triple=(value,fallback,label)=>{
 const v=value??fallback;
 if(!Array.isArray(v)||v.length!==3||!v.every(n=>Number.isFinite(n)&&Math.abs(n)<=100000))throw Object.assign(new Error(label+' needs three finite numbers'),{code:'INVALID_BLOCK'});
 return v;
};
// Each piece: {template, name?, position:[x,y,z] metres, rotation:[x,y,z] degrees} plus either size:[x,y,z] metres
// (stretch to exactly that) or scale (number or [x,y,z], 1 = the model's own size). Blocks default to size 1,1,1;
// other assets default to scale 1.
export function buildBlockScene({blocks,entityIdStart=1078000000,monsterIdStart=1082200000}){
 if(!Array.isArray(blocks)||!blocks.length)throw Object.assign(new Error('Provide at least one block'),{code:'INVALID_BLOCK'});
 if(!Number.isInteger(entityIdStart)||entityIdStart<1078000000||entityIdStart+blocks.length>=MONSTER_ID_MIN)throw Object.assign(new Error('entityIdStart must be in 1078000000..1082130431 with room for every piece'),{code:'INVALID_ENTITY_ID'});
 if(!Number.isInteger(monsterIdStart)||monsterIdStart<MONSTER_ID_MIN||monsterIdStart+blocks.length>MONSTER_ID_MAX)throw Object.assign(new Error('monsterIdStart must be in the monster range 0x40800000..0x408fffff'),{code:'INVALID_ENTITY_ID'});
 let nextObject=entityIdStart,nextMonster=monsterIdStart;const warnings=[];
 const names=new Set(),placed=[];let min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 const assets=blocks.map((block,index)=>{
  const template=blockTemplate(block.template),position=triple(block.position,null,'position'),rotation=triple(block.rotation,[0,0,0],'rotation');
  const name=block.name||`Block_${index}`;
  if(names.has(name))throw Object.assign(new Error('Duplicate block name: '+name),{code:'INVALID_BLOCK'});names.add(name);
  if(block.size&&block.scale!==undefined)throw Object.assign(new Error(name+': give size or scale, not both'),{code:'INVALID_BLOCK'});
  let scale,size;
  if(block.scale!==undefined||(!block.size&&template.natural!==undefined)){
   scale=typeof block.scale==='number'?[block.scale,block.scale,block.scale]:triple(block.scale,[1,1,1],'scale');
   size=template.natural?template.natural.map((n,axis)=>n*scale[axis]):template.unit?template.unit.map((u,axis)=>scale[axis]/u):[1,1,1];
  }else{
   size=triple(block.size,[1,1,1],'size');
   if(!template.unit)throw Object.assign(new Error(name+': this asset has no measured size, so it cannot be stretched to metres; use scale instead'),{code:'INVALID_BLOCK'});
   scale=template.unit.map((unit,axis)=>unit*size[axis]);
  }
  // A flat asset measures 0 on one axis; that is fine as long as the caller scales it rather than asking for metres.
  if(scale.some(n=>!(n>0))||size.some(n=>n<0)||(block.size&&size.some(n=>n<=0)))throw Object.assign(new Error('size and scale must be positive'),{code:'INVALID_BLOCK'});
  // Bounds ignore rotation; they are a rough footprint for camera placement and overlap checks.
  position.forEach((p,axis)=>{min[axis]=Math.min(min[axis],p-size[axis]/2);max[axis]=Math.max(max[axis],p+size[axis]/2);});
  const entityId=template.monster?nextMonster++:nextObject++;
  if(template.monster&&!template.seed)warnings.push(`${name}: no AI parameters are known for ${template.name}; it will be imported but will not notice players`);
  if(block.patrol!==undefined){
   const templates=block.patrol?.templates;
   if(!template.seed)throw Object.assign(new Error(name+': patrol is only for monsters with known AI parameters'),{code:'INVALID_BLOCK'});
   if(!Array.isArray(templates)||!templates.length||!templates.every(t=>Number.isInteger(t?.pathId)&&t.pathId>0&&Array.isArray(t.waypointIds)&&t.waypointIds.length&&t.waypointIds.every(w=>Number.isInteger(w)&&w>0)))
    throw Object.assign(new Error(name+': patrol needs templates:[{pathId,waypointIds:[...]}] with ids of a path saved in the map'),{code:'INVALID_BLOCK'});
  }
  let color=null;
  if(block.color!==undefined){
   if(template.monster)throw Object.assign(new Error(name+': color is for objects, not creatures'),{code:'INVALID_BLOCK'});
   try{color=colorRecord({color:block.color,opacity:block.opacity??100,blend:block.blend??'cover'});}catch(e){throw Object.assign(new Error(name+': '+e.message),{code:'INVALID_BLOCK'});}
  }else if(block.opacity!==undefined||block.blend!==undefined)throw Object.assign(new Error(name+': opacity and blend go with color'),{code:'INVALID_BLOCK'});
  placed.push({entityId,name,template:template.name,...(block.color!==undefined?{color:block.color}:{})});
  return asset({entityId,templateId:template.templateId,name,position,rotation,scale,seed:template.seed,createAtStart:block.createAtStart,patrol:block.patrol,solid:block.solid,color});
 });
 return {bytes:container(Buffer.concat(assets.map(a=>field(1,2,a)))),count:blocks.length,entityIds:[entityIdStart,Math.max(entityIdStart,nextObject-1)],
  monsterIds:nextMonster>monsterIdStart?[monsterIdStart,nextMonster-1]:null,bounds:{min,max},placed,warnings};
}
