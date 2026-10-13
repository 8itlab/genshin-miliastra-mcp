// Offline check of the client controls and client scripts (scene_set_client_script, scene_add_client_ui) against the
// official sample save 客户端脚本: every record this tool writes is byte for byte the one the editor saved, and the
// sample with its client interface taken out and put back by the tools has the interface and script sections it had.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {container,fields,field,replace,wrap,varint} from '../src/scene/wire.mjs';
import {clientContainerRecord,clientControlRecord,clientScriptRecord,setClientScript,addClientUi,addClientTemplate,listClientScripts,listInterface} from '../src/scene-save.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dir=path.join(root,'knowledge','samples','gil'),workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-clientui-'));
const official=path.join(dir,fs.readdirSync(dir).find(f=>f.startsWith('mh47p30a87qo_'))),blank=path.join(root,'tests','fixtures','editor-2026-10-13-handui.gil');
const number=(b,id)=>Number(fields(b).find(f=>f.id===id&&f.wire===0)?.value);
const section=(file,id)=>fields(container(fs.readFileSync(file))).find(f=>f.id===id).data;
const ids=b=>{const out=[];let p=0;while(p<b.length){let n=0,shift=0;for(;;){const v=b[p++];n+=(v&127)*2**shift;shift+=7;if(!(v&128))break;}out.push(n);}return out;};
try{
  const saved=new Map(fields(section(official,9)).filter(f=>f.id===502).map(f=>[number(f.data,501),f.data]));
  // Two controls of the sample were dragged by hand: their rectangles hold these exact single-precision values.
  const bits=hex=>{const b=Buffer.alloc(4);b.writeUInt32BE(hex);return b.readFloatBE(0);};
  const back={position:[bits(0x39700000),0],size:[bits(0x44c7ffff),bits(0x4460fffe)]},words={position:[0,bits(0x43aefffe)],size:[218,bits(0x4287fff4)]};
  const C=1073741845,R=C+1,script=fields(section(official,50)).find(f=>f.id===1).data,source=fields(script).find(f=>f.id===5).data.toString('utf8');
  assert.ok(clientContainerRecord({id:C,name:'收集圆圈',parent:1073741825,root:R}).equals(saved.get(C)),'the container differs from the official one');
  assert.ok(clientControlRecord({id:R,name:'容器节点',kind:'container',children:[R+3,R+2,R+1],rect:null,script:1073741826}).equals(saved.get(R)),'the root differs');
  assert.ok(clientControlRecord({id:R+3,name:'背景',kind:'image',parent:R,rect:back}).equals(saved.get(R+3)),'the image differs');
  assert.ok(clientControlRecord({id:R+2,name:'分数文本',kind:'text',parent:R,rect:words}).equals(saved.get(R+2)),'the text box differs');
  assert.ok(clientControlRecord({id:R+1,name:'圆圈容器',kind:'container',parent:R,children:[R+5,R+4],rect:{position:[0,0],size:[150,150]}}).equals(saved.get(R+1)),'the inner container differs');
  assert.ok(clientControlRecord({id:R+5,name:'圆圈图片',kind:'image',parent:R+1,rect:{position:[0,0],size:[80,80]}}).equals(saved.get(R+5)),'the second image differs');
  assert.ok(clientControlRecord({id:R+4,name:'圆圈点击区域',kind:'cursorArea',parent:R+1,rect:{position:[0,0],size:[150,50]}}).equals(saved.get(R+4)),'the cursor area differs');
  assert.ok(clientScriptRecord({id:1073741826,name:'收集圆圈',file:'main.lua',source}).equals(script),'the script record differs');

  // The sample without its client interface: the records, the root, the layout's mention of the container, the script.
  const bytes=fs.readFileSync(official),whole=container(bytes);
  const nine=fields(section(official,9)).flatMap(f=>{
    if(f.id===501)return [field(501,2,Buffer.concat(ids(f.data).filter(i=>i!==R).map(varint)))];
    if(f.id!==502)return [f.raw];
    const id=number(f.data,501);if(id>=C)return [];
    if(id!==1073741825)return [f.raw];
    return [field(502,2,Buffer.concat(fields(f.data).map(x=>x.id===503&&x.wire===2?field(503,2,Buffer.concat(ids(x.data).filter(i=>i!==C).map(varint))):x.raw)))];});
  const fifty=Buffer.concat(fields(section(official,50)).filter(f=>f.id!==1).map(f=>f.raw));
  const bare=path.join(workspace,'bare.gil');fs.writeFileSync(bare,wrap(bytes,replace(replace(whole,9,2,Buffer.concat(nine)),50,2,fifty)));
  assert.deepEqual(listInterface({mapPath:bare}).clientInterfaces,[]);assert.deepEqual(listClientScripts({mapPath:bare}).scripts,[]);
  const scripted=setClientScript({mapPath:bare,name:'收集圆圈',source,file:'main.lua'},workspace);
  assert.equal(scripted.scriptId,1073741826);assert.deepEqual(scripted.callbacks,['OnStart','OnUpdate','OnDestroy']);
  const made=addClientUi({mapPath:scripted.mapPath,name:'收集圆圈',script:'收集圆圈',ids:{'收集圆圈':C,'容器节点':R,'背景':R+3,'分数文本':R+2,'圆圈容器':R+1,'圆圈图片':R+5,'圆圈点击区域':R+4},controls:[
    {name:'背景',kind:'image',states:[back,back,back,back]},{name:'分数文本',kind:'text',states:[words,words,words,words]},
    {name:'圆圈容器',kind:'container',size:[150,150],children:[{name:'圆圈图片',kind:'image',size:[80,80]},{name:'圆圈点击区域',kind:'cursorArea',size:[150,50]}]}]},workspace);
  assert.ok(section(made.mapPath,50).equals(section(official,50)),'the script section differs from the official save');
  assert.ok(section(made.mapPath,9).equals(section(official,9)),'the interface section differs from the official save');
  assert.ok(fs.readFileSync(made.mapPath).equals(bytes),'the rebuilt save differs from the official one');

  // On a save of our own: a second script, a replaced one, what the listing says.
  const one=setClientScript({mapPath:blank,name:'hud',source:'function OnStart()\n  print("HUD")\nend\n'},workspace);
  assert.equal(one.file,'hud.lua');assert.equal(one.replaced,false);
  const two=setClientScript({mapPath:one.mapPath,name:'菜单',source:'print("menu")\n'},workspace);
  assert.equal(two.scriptId,one.scriptId+1);assert.equal(two.file,'script_2.lua');assert.ok(two.warning);
  const again=setClientScript({mapPath:two.mapPath,name:'hud',source:'function OnUpdate(dt)\nend\n'},workspace);
  assert.equal(again.replaced,true);assert.equal(again.scriptId,one.scriptId);
  assert.deepEqual(setClientScript({mapPath:blank,name:'t',source:'function OnStart()\n  game.Tween(a, {x = 1}, 1)\n  game.Tween(a, {x = 1}, 1):Play()\nend\n'},workspace).tweensNotPlayed.lines,[2]);
  assert.deepEqual(listClientScripts({mapPath:again.mapPath,includeSource:true}).scripts.map(s=>[s.name,s.file,s.source.length]),[['hud','hud.lua',26],['菜单','script_2.lua',14]]);
  const ui=addClientUi({mapPath:again.mapPath,name:'HUD',script:'hud',controls:[{name:'panel',kind:'image',position:[-600,380],size:[300,80]},{name:'row',kind:'container',position:[-600,300],size:[300,60],children:[{name:'a',kind:'image',size:[40,40]},{name:'hit',kind:'cursorArea',size:[40,40]}]}]},workspace);
  const listed=listInterface({mapPath:ui.mapPath});
  assert.deepEqual(listed.clientInterfaces,[{containerId:ui.containerId,name:'HUD',root:{controlId:ui.rootId,name:'容器节点',kind:'container',scripts:['hud'],children:[
    {controlId:ui.rootId+1,name:'panel',kind:'image'},{controlId:ui.rootId+2,name:'row',kind:'container',children:[{controlId:ui.rootId+3,name:'a',kind:'image'},{controlId:ui.rootId+4,name:'hit',kind:'cursorArea'}]}]}}]);
  assert.equal(listed.layouts[0].controls.find(c=>c.id===ui.containerId).kind,'clientContainer');
  assert.deepEqual(listClientScripts({mapPath:ui.mapPath}).scripts[0].on,['容器节点']);
  assert.deepEqual(ui.controls.map(c=>c.path),['panel','row','row/a','row/hit']);
  for(const [bad,code] of [[{name:'x',source:'local c = coroutine.create(f)'},'LUA_NOT_AVAILABLE'],[{name:'x',source:'io.write("a")'},'LUA_NOT_AVAILABLE'],[{name:'x',source:'  '},'INVALID_SCRIPT'],[{name:'x'},'INVALID_SCRIPT']])
    assert.throws(()=>setClientScript({mapPath:blank,...bad},workspace),e=>e.code===code,JSON.stringify(bad));
  // A word in a comment or a string is not a call.
  setClientScript({mapPath:blank,name:'x',source:'-- no io.write here\nprint("coroutine.wrap")\n'},workspace);
  assert.throws(()=>addClientUi({mapPath:again.mapPath,name:'HUD',script:'none'},workspace),e=>e.code==='SCRIPT_NOT_FOUND');
  assert.throws(()=>addClientUi({mapPath:again.mapPath,name:'HUD',controls:[{name:'a',kind:'image'},{name:'a',kind:'image'}]},workspace),e=>e.code==='DUPLICATE_CONTROL_NAME');
  assert.throws(()=>addClientUi({mapPath:again.mapPath,name:'HUD',controls:[{name:'a',kind:'image',children:[{name:'b',kind:'image'}]}]},workspace),e=>e.code==='INVALID_CONTROL');
  // The other kinds and the templates, each against the control the editor made (a save with one of each added by hand).
  const kinds=path.join(root,'tests','fixtures','editor-2026-10-13-clientkinds.gil'),made7=new Map(fields(section(kinds,9)).filter(f=>f.id===502).map(f=>[number(f.data,501),f.data]));
  const B=1073741824,top=B+22,box=(w,h,y=0)=>({position:[0,y],size:[w,h]});
  for(const spec of [{id:B+34,name:'文本视窗',kind:'textWindow',parent:top,rect:box(100,40)},{id:B+35,name:'界面动效',kind:'animation',parent:top,rect:box(100,100)},
    {id:B+36,name:'全屏界面动效',kind:'fullscreenAnimation',parent:top},{id:B+37,name:'预设按钮',kind:'presetButton',parent:top,rect:box(150,50)},
    {id:B+38,name:'按键提示',kind:'keyHint',parent:top,rect:box(40,40)},{id:B+39,name:'网格视窗',kind:'grid',parent:top,rect:box(80,80),itemTemplate:B+41},
    {id:B+40,name:'模板引用控件',kind:'reference',parent:top,rect:box(80,80),template:B+41},
    {id:B+41,name:'basket',kind:'image',rect:box(110,36,-260),slot:1,isTemplate:true},
    {id:B+44,name:'容器节点',kind:'container',children:[B+45],rect:box(150,150),slot:2,isTemplate:true},{id:B+45,name:'图片',kind:'image',parent:B+44,rect:box(80,80),slot:3}])
    assert.ok(clientControlRecord(spec).equals(made7.get(spec.id)),'the '+spec.kind+' "'+spec.name+'" differs from the one the editor made');
  // A picture chosen in the editor is one more number in the image's block.
  assert.ok(clientControlRecord({id:B+32,name:'coin',kind:'image',parent:top,rect:{position:[0,330],size:[56,56]},image:100138}).equals(made7.get(B+32)),'the image with a picture differs');
  // A template of our own, a grid and a reference that name it, and what the listing says of them.
  const card=addClientTemplate({mapPath:blank,name:'card',children:[{name:'face',kind:'image',image:100138,colour:'#ffd040'},{name:'hit',kind:'cursorArea'}]},workspace);
  assert.deepEqual(card.controls.map(c=>[c.path,c.kind]),[['card','container'],['card/face','image'],['card/hit','cursorArea']]);
  const dot=addClientTemplate({mapPath:card.mapPath,name:'dot',kind:'image',size:[24,24]},workspace);
  assert.equal(dot.templateIndex,card.templateIndex+3);
  const shelf=addClientUi({mapPath:dot.mapPath,name:'shelf',controls:[{name:'list',kind:'grid',size:[400,300],itemTemplate:'card'},{name:'one',kind:'reference',template:'dot'},{name:'ok',kind:'presetButton'},{name:'key',kind:'keyHint'}]},workspace);
  const seen=listInterface({mapPath:shelf.mapPath});
  assert.deepEqual(seen.clientTemplates,[{templateIndex:card.templateIndex,name:'card'},{templateIndex:dot.templateIndex,name:'dot'}]);
  assert.deepEqual(seen.clientInterfaces[0].root.children.map(c=>c.kind),['grid','reference','presetButton','keyHint']);
  const rootIds=ids(fields(section(shelf.mapPath,9)).find(f=>f.id===501).data),layoutAt=rootIds.indexOf(1073741825);
  assert.deepEqual(rootIds.slice(layoutAt-2,layoutAt),[card.templateIndex,dot.templateIndex],'the templates stand before the layout, in the order they were made');assert.equal(rootIds.at(-1),shelf.rootId);
  assert.throws(()=>addClientUi({mapPath:dot.mapPath,name:'x',controls:[{name:'g',kind:'grid',itemTemplate:'none'}]},workspace),e=>e.code==='TEMPLATE_NOT_FOUND');
  assert.throws(()=>addClientUi({mapPath:dot.mapPath,name:'x',controls:[{name:'g',kind:'image',template:'dot'}]},workspace),e=>e.code==='INVALID_CONTROL');
  assert.throws(()=>addClientTemplate({mapPath:dot.mapPath,name:'dot',kind:'image'},workspace),e=>e.code==='DUPLICATE_TEMPLATE_NAME');
  // The debug log of a play: what a graph prints is field 22 of a record, what a client script prints field 23.
  const record=(seconds,body)=>field(1,2,Buffer.concat([field(1,0,382),field(3,0,seconds),body]));
  const logBody=Buffer.concat([record(9,Buffer.concat([field(7,2,Buffer.concat([field(1,0,1),field(2,0,1073741825)])),field(22,2,Buffer.concat([field(1,0,382),field(2,2,Buffer.from('CU_CLICK'))]))])),
    record(9,Buffer.concat([field(7,2,field(1,0,1)),field(11,2,field(1,0,1)),field(23,2,field(2,2,Buffer.from('CU_LUA 分数 1')))]))]);
  const head=Buffer.alloc(8);head.writeUInt32BE(logBody.length+4,0);head.writeUInt32BE(logBody.length,4);
  const {inspectDebugLog}=await import('../src/debug-log.mjs');
  assert.deepEqual(inspectDebugLog(Buffer.concat([head,logBody])).prints.map(p=>[p.elapsedSeconds,p.graphId,p.text,p.clientScript??false]),[['9','1073741825','CU_CLICK',false],['9',null,'CU_LUA 分数 1',true]]);
  console.log(JSON.stringify({ok:true,scriptBytes:script.length}));
}finally{fs.rmSync(workspace,{recursive:true,force:true});}
