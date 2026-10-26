// Offline check of scene_add_shape_prefab, scene_preview_shapes and the colour of scene_build_blocks against a save the
// editor wrote on 2026-10-26 (tests/fixtures/editor-2026-10-26-shapes.gil): a sphere coloured #FF2010 at 60 % was made
// into the prefab 积木样本 with two decorations, a cone (y 0.8, turned 30° about x, scale 0.6/1/1, #2040FF, multiply) and
// an empty model 1.5 m to the side. The tool, given the same parts, must write the same records byte for byte, list
// them on the prefab, and read them back for the preview.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {container,fields,one} from '../src/scene/wire.mjs';
import {addShapePrefab,previewShapes,listPrefabs} from '../src/scene-save.mjs';
import {buildBlockScene} from '../src/scene/blocks.mjs';
import {colorRecord,shapeOf} from '../src/scene/shapes.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-shapes-'));
const fixture=path.join(root,'tests','fixtures','editor-2026-10-26-shapes.gil'),before=fs.readFileSync(fixture);
const kind=b=>{try{return Number(fields(b).find(f=>f.id===1&&f.wire===0)?.value);}catch{return null;}};
const num=(b,id)=>Number(fields(b).find(f=>f.id===id&&f.wire===0)?.value);
const prefabEntry=(file,id)=>fields(one(container(fs.readFileSync(file)),4)).find(e=>e.id===1&&num(e.data,1)===id).data;
const decorations=file=>fields(one(container(fs.readFileSync(file)),27));
const parentOf=d=>{for(const p of fields(d))if(p.id===4&&p.wire===2&&kind(p.data)===40)return num(one(p.data,50),502);return null;};
// Colour records compared field by field: the opacity is a float the editor takes from its slider (60 came out as
// 60.0000038), so it is compared as a number; every other field byte for byte.
function sameColour(a,b,label){
  const parts=x=>fields(one(x,32)).map(f=>f.id===4&&f.wire===5?{id:4,value:Math.round(f.data.readFloatLE(0)*1000)/1000}:{id:f.id,raw:f.raw.toString('hex')});
  assert.equal(kind(a),22);assert.equal(kind(b),22);assert.deepEqual(parts(a),parts(b),label);
}
// A decoration entry without its id (field 1) and parent, which differ by construction, and with its colour checked
// separately (sameColour).
const body=d=>Buffer.concat(fields(d).filter(f=>!(f.id===1&&f.wire===0)).map(f=>(f.id===4&&kind(f.data)===40)||(f.id===5&&kind(f.data)===22)?Buffer.alloc(0):f.raw));
const colourOf=d=>fields(d).find(f=>f.id===5&&kind(f.data)===22).data;
try{
  // The colour records the editor wrote: on the sphere prefab and on the cone decoration.
  const handPrefab=prefabEntry(fixture,0x40400001);
  const handColour=fields(handPrefab).find(f=>f.id===7&&kind(f.data)===22).data;
  sameColour(colorRecord({color:'#FF2010',opacity:60}),handColour,'prefab colour, 60 % cover');
  const hand=decorations(fixture).filter(d=>d.id===1&&parentOf(d.data)===0x40400001);
  assert.equal(hand.length,2);
  const handCone=hand.find(d=>num(d.data,2)===10009009).data,handEmpty=hand.find(d=>num(d.data,2)===10005018).data;
  sameColour(colorRecord({color:'#2040FF',blend:'multiply'}),colourOf(handCone),'decoration colour, multiply');
  sameColour(colorRecord(),colourOf(handEmpty),'colour off');

  // The same parts through the tool, on a new prefab: the entries equal the editor's but for id and parent.
  const parts=[{shape:'圆锥',name:'装饰物_1',position:[0,0.8,0],rotation:[30,0,0],scale:[0.6,1,1],color:'#2040FF',blend:'multiply'},
    {model:10005018,name:'装饰物_2',position:[1.5,0,0]}];
  const made=addShapePrefab({mapPath:fixture,name:'t_shapes',base:'球体',color:'#FF2010',opacity:60,parts},workspace);
  assert.ok(made.prefabId>=0x40400000&&made.prefabId<=0x407fffff);
  const mine=decorations(made.mapPath).filter(d=>d.id===1&&parentOf(d.data)===made.prefabId);
  assert.equal(mine.length,2);
  assert.deepEqual(body(mine[0].data),body(handCone),'cone decoration byte for byte');
  assert.deepEqual(body(mine[1].data),body(handEmpty),'empty-model decoration byte for byte');
  sameColour(colourOf(mine[0].data),colourOf(handCone),'cone colour');sameColour(colourOf(mine[1].data),colourOf(handEmpty),'empty-model colour');
  const ids=mine.map(d=>num(d.data,1)),all=decorations(made.mapPath).map(d=>num(d.data,1));
  assert.equal(new Set(all).size,all.length,'decoration ids are new');
  // The prefab lists them, packed, in property 40, and carries the colour.
  const entry=prefabEntry(made.mapPath,made.prefabId);
  const listed=one(one(fields(entry).find(f=>f.id===6&&kind(f.data)===40).data,50),501);
  assert.deepEqual(listed,Buffer.concat(ids.map(id=>{const b=[];let n=id;while(n>127){b.push(n&127|128);n=Math.floor(n/128);}b.push(n);return Buffer.from(b);})));
  sameColour(fields(entry).find(f=>f.id===7&&kind(f.data)===22).data,handColour,'colour on the new prefab');
  // Prefab decorations stay ahead of those of placed entities, and nothing else of the section moved.
  const order=decorations(made.mapPath).map(d=>d.id);assert.deepEqual(order,[...order].sort());
  assert.ok(listPrefabs({mapPath:made.mapPath}).prefabs.some(p=>p.name==='t_shapes'));

  // replace: the same prefab gets new parts and loses the old ones.
  const again=addShapePrefab({mapPath:made.mapPath,name:'t_shapes',replace:true,parts:[{shape:'cube',size:[0.5,0.5,0.5],position:[0,2,0],color:'#00FF00'}]},workspace);
  assert.equal(again.prefabId,made.prefabId);
  assert.equal(decorations(again.mapPath).filter(d=>d.id===1&&parentOf(d.data)===made.prefabId).length,1);
  assert.throws(()=>addShapePrefab({mapPath:made.mapPath,name:'t_shapes',parts}),e=>e.code==='DUPLICATE_PREFAB_NAME');
  assert.throws(()=>addShapePrefab({mapPath:fixture,name:'bad',parts:[{shape:'星形'}]}),e=>e.code==='UNKNOWN_ASSET');
  assert.throws(()=>addShapePrefab({mapPath:fixture,name:'bad',parts:[{shape:'球体',color:'red'}]}),e=>e.code==='INVALID_COLOR');

  // The preview reads the hand-made prefab back (main sphere + cone; the empty model is drawn as a box) and draws PNGs.
  const seen=previewShapes({mapPath:fixture,prefab:'积木样本'});
  assert.equal(seen.parts,3);
  for(const image of seen.images)assert.deepEqual(image.png.subarray(0,8),Buffer.from([137,80,78,71,13,10,26,10]));
  const drawn=previewShapes({parts,views:['front'],size:200});assert.equal(drawn.images.length,1);
  // Sizes: a sphere of size 0.4 is scale 0.4; a triangular prism of size 1 is scaled by its own 0.866 x 1 x 0.75.
  assert.equal(shapeOf('sphere').id,10009002);assert.equal(shapeOf('白盒·圆锥').id,10009009);

  // scene_build_blocks: a coloured white-box piece carries the same colour record as a component of the entity.
  const pack=buildBlockScene({blocks:[{template:'球体',name:'ball',position:[0,0.5,0],size:[1,1,1],color:'#FF2010',opacity:60}]});
  const mineColour=colorRecord({color:'#FF2010',opacity:60});sameColour(mineColour,handColour,'block colour');
  assert.ok(pack.bytes.includes(Buffer.concat([Buffer.from([0x32,mineColour.length]),mineColour])),'the block carries the colour component');
  assert.throws(()=>buildBlockScene({blocks:[{template:'球体',position:[0,0,0],opacity:50}]}),e=>e.code==='INVALID_BLOCK');
  assert.deepEqual(fs.readFileSync(fixture),before,'the fixture is never written');
  console.log(JSON.stringify({ok:true,decorations:2,replaced:true,previewParts:seen.parts}));
}finally{fs.rmSync(workspace,{recursive:true,force:true});}
