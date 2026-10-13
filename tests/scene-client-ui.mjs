// Offline check of the client controls and client scripts (scene_set_client_script, scene_add_client_ui) against the
// official sample save 客户端脚本: every record this tool writes is byte for byte the one the editor saved, and the
// sample with its client interface taken out and put back by the tools has the interface and script sections it had.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {container,fields,field,replace,wrap,varint} from '../src/scene/wire.mjs';
import {clientContainerRecord,clientControlRecord,clientScriptRecord,setClientScript,addClientUi,addClientTemplate,removeClient,listClientScripts,listInterface,getClientUi,maskBlock,maskOf} from '../src/scene-save.mjs';

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
    {name:'背景',kind:'image',rectStates:[back,back,back,back]},{name:'分数文本',kind:'text',rectStates:[words,words,words,words]},
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
  assert.equal(again.replaced,true);assert.equal(again.scriptId,one.scriptId);assert.ok(again.updateNotEnabled,'OnUpdate without EnableUpdate is pointed out');
  assert.ok(!setClientScript({mapPath:blank,name:'u',source:'function OnStart()\n  script:EnableUpdate(true)\nend\nfunction OnUpdate(dt)\nend\n'},workspace).updateNotEnabled);
  assert.deepEqual(setClientScript({mapPath:blank,name:'t',source:'function OnStart()\n  game.Tween(a, {x = 1}, 1)\n  game.Tween(a, {x = 1}, 1):Play()\nend\n'},workspace).tweensNotPlayed.lines,[2]);
  // Two more things a script gets wrong silently: colours written as fractions, and a fill on an image without a mask.
  const dim=setClientScript({mapPath:blank,name:'c',source:'function OnStart()\n  a.imageColor = Color(0.5, 0.5, 0.5)\n  b.imageColor = Color(255, 208, 64)\n  c.imageColor = Color(r, g, b)\n  d.imageColor = Color(1, 0.85, 0.2, 255)\n  e.imageColor = Color(0, 0, 0)\nend\n'},workspace);
  assert.deepEqual(dim.coloursLookLikeFractions.lines,[2,5]);assert.equal(dim.fillNeedsMask,undefined);
  assert.ok(setClientScript({mapPath:blank,name:'f',source:'function OnStart()\n  bar:SetFillHorizontal(Enum.ImageFillHorizontalType.Left, 0.3)\nend\n'},workspace).fillNeedsMask);
  assert.equal(setClientScript({mapPath:blank,name:'f',source:'function OnStart()\n  bar.enableMask = true\n  bar.fillAmount = 0.3\nend\n'},workspace).fillNeedsMask,undefined);
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
  // Every setting that was changed by hand in the editor, against the record the editor saved with it
  // (tests/fixtures/editor-2026-10-13-clientsettings.gil): a hidden container, two scripts on the root and one on a
  // child, flags of containers, a tinted masked image, a text with all its settings, a turned and scaled container
  // with anchors apart, a grid, a button with its states, a key hint, an effect, a script with variables.
  const set=path.join(root,'tests','fixtures','editor-2026-10-13-clientsettings.gil'),setRoot=container(fs.readFileSync(set));
  const hand=new Map(fields(section(set,9)).filter(f=>f.id===502).map(f=>[number(f.data,501),f.data]));
  const sub=(b,id)=>fields(b).find(x=>x.id===id&&x.wire===2)?.data,fl=(b,id)=>{const x=b&&fields(b).find(y=>y.id===id&&y.wire===5);return x?x.data.readFloatLE(0):0;};
  const statesOf=r=>{const rect=fields(r).filter(x=>x.id===505).map(x=>x.data).find(b=>number(b,502)===12);
    return fields(sub(sub(sub(rect,503),13),12)).filter(x=>x.id===501).map(x=>{const st=sub(x.data,502),p=id=>[fl(sub(st,id),501),fl(sub(st,id),502)];
      return {scale:[fl(sub(st,501),1),fl(sub(st,501),2)],anchorMin:p(502),anchorMax:p(503),position:p(504),size:p(505),pivot:p(506),rotation:fl(sub(st,508),3)};});};
  const K=B+42,as=id=>({states:statesOf(hand.get(id))});
  assert.ok(clientContainerRecord({id:B+41,name:'KS_ui',parent:B+1,root:K,hidden:true}).equals(hand.get(B+41)),'the hidden container differs');
  for(const spec of [
    {id:K,name:'容器节点',kind:'container',children:[43,44,45,46,47,49,50,51,52,53,54].map(n=>B+n),rect:null,scripts:[B+2,B+3],showCursor:true,blockKeys:true},
    {id:B+43,name:'img',kind:'image',parent:K,rect:as(B+43),image:100138,colour:0xB212AB34,mask:true,visible:false},
    {id:B+44,name:'txt',kind:'text',parent:K,rect:as(B+44),text:{content:'hello',fontSize:37,colour:0xCCFF0000,background:0x7F00FF00,outline:false,outlineColour:0x990000FF,align:'left',valign:'top',autoSize:true}},
    {id:B+47,name:'box',kind:'container',parent:K,children:[B+48],rect:as(B+47),scripts:[B+3],active:false,focusable:true,isolateNavigation:true,blockCursor:true},
    {id:B+49,name:'grid',kind:'grid',parent:K,rect:as(B+49),grid:{itemTemplate:B+39,horizontal:true,itemSize:[61,73],spacing:[9,11],padding:[21,22,23,24],scrollbar:false,fixed:3,preview:7}},
    {id:B+51,name:'btn',kind:'presetButton',parent:K,children:[B+56,B+55],rect:as(B+51),button:{normal:B+55,pressed:B+56,enabled:false}},
    {id:B+52,name:'hint',kind:'keyHint',parent:K,rect:as(B+52),keys:{keyboard:8,pad:3}},
    {id:B+53,name:'fx',kind:'animation',parent:K,rect:as(B+53),effect:{id:10001002,sound:true,below:true}},
    {id:B+55,name:'图片',kind:'image',parent:B+51,rect:as(B+55)}])
    assert.ok(clientControlRecord(spec).equals(hand.get(spec.id)),'the '+spec.kind+' "'+spec.name+'" with its settings differs from the one configured in the editor');
  const handScript=fields(fields(setRoot).find(x=>x.id===50).data).filter(x=>x.id===1)[0].data;
  assert.ok(clientScriptRecord({id:B+2,name:'KS_a',file:'KS_a.lua',source:sub(handScript,5).toString('utf8'),variables:[{name:'greet',type:'string',value:'abc',public:true},{name:'count',type:'integer',value:42}]}).equals(handScript),'the script with variables differs');
  // The same through the tools: the settings arrive in the records, names become ids.
  const v=setClientScript({mapPath:dot.mapPath,name:'menu',source:'function OnStart()\n  print(script:GetParam("title"))\nend\n',variables:[{name:'title',type:'string',value:'Shop',public:true},{name:'rows',type:'integer',value:3}]},workspace);
  assert.deepEqual(v.variables,['title','rows']);
  const kept=setClientScript({mapPath:v.mapPath,name:'menu',source:'function OnStart()\nend\n'},workspace);
  assert.equal(fields(fields(fields(container(fs.readFileSync(kept.mapPath))).find(x=>x.id===50).data).filter(x=>x.id===1).find(x=>number(x.data,1)===kept.scriptId).data).filter(x=>x.id===7).length,2,'a replaced script keeps its variables');
  const row=setClientScript({mapPath:kept.mapPath,name:'row',source:'function OnStart()\nend\n'},workspace);
  const full=addClientUi({mapPath:row.mapPath,name:'menu',scripts:['menu'],showCursor:true,blockKeys:true,hidden:true,controls:[
    {name:'title',kind:'text',position:[0,300],size:[400,60],text:{content:'Shop',fontSize:36,colour:'#ffd040',align:'left',outline:false}},
    {name:'list',kind:'grid',size:[500,300],itemTemplate:'card',grid:{columns:4,itemSize:[100,100],spacing:[12,12],scrollbar:false}},
    {name:'buy',kind:'presetButton',position:[0,-250],size:[160,60],states:{normal:'up',pressed:'down'},children:[{name:'up',kind:'image',image:100001,colour:'#40a0ff',size:[160,60]},{name:'down',kind:'image',image:100001,colour:'#2060a0',size:[160,60],visible:false}]},
    {name:'spin',kind:'container',position:[300,0],rotation:45,scale:[1.5,1.5],pivot:[0.5,0.5],script:'row',active:false,children:[{name:'dot',kind:'image'}]},
    {name:'edge',kind:'image',image:100001,anchor:{min:[0,0],max:[1,0]},position:[0,20],size:[0,40]},
    {name:'key',kind:'keyHint',key:8},{name:'fx',kind:'animation',effect:10001002,effectSound:true}]},workspace);
  const built=new Map(fields(section(full.mapPath,9)).filter(f=>f.id===502).map(f=>[number(f.data,501),f.data])),idOf=n=>full.controls.find(c=>c.path===n).controlId;
  assert.ok(clientControlRecord({id:idOf('buy'),name:'buy',kind:'presetButton',parent:full.rootId,children:[idOf('buy/up'),idOf('buy/down')],rect:{position:[0,-250],size:[160,60]},button:{normal:idOf('buy/up'),pressed:idOf('buy/down')}}).equals(built.get(idOf('buy'))),'the button names its states by the ids of its children');
  assert.ok(clientControlRecord({id:idOf('spin'),name:'spin',kind:'container',parent:full.rootId,children:[idOf('spin/dot')],rect:{position:[300,0],size:[150,150],rotation:45,scale:[1.5,1.5],pivot:[0.5,0.5]},scripts:[row.scriptId],active:false}).equals(built.get(idOf('spin'))));
  assert.ok(clientControlRecord({id:idOf('list'),name:'list',kind:'grid',parent:full.rootId,rect:{position:[0,0],size:[500,300]},grid:{itemTemplate:card.templateIndex,horizontal:false,itemSize:[100,100],spacing:[12,12],scrollbar:false,fixed:4}}).equals(built.get(idOf('list'))));
  const menu=listInterface({mapPath:full.mapPath}).clientInterfaces.find(c=>c.name==='menu');
  assert.deepEqual(menu.root.scripts,['menu']);assert.deepEqual(menu.root.children.find(c=>c.name==='spin').scripts,['row']);
  assert.deepEqual(listClientScripts({mapPath:full.mapPath}).scripts.find(x=>x.name==='row').on,['spin']);
  assert.throws(()=>addClientUi({mapPath:row.mapPath,name:'x',controls:[{name:'b',kind:'presetButton',states:{normal:'nobody'}}]},workspace),e=>e.code==='INVALID_CONTROL');
  assert.throws(()=>addClientUi({mapPath:row.mapPath,name:'x',controls:[{name:'b',kind:'image',text:{content:'a'}}]},workspace),e=>e.code==='INVALID_CONTROL');
  // Taking things out again: a script in use and a template in use are refused; an interface goes with all it holds.
  assert.throws(()=>removeClient({mapPath:full.mapPath,script:'row'},workspace),e=>e.code==='SCRIPT_IN_USE');
  assert.throws(()=>removeClient({mapPath:full.mapPath,template:'card'},workspace),e=>e.code==='TEMPLATE_IN_USE');
  const less=removeClient({mapPath:full.mapPath,ui:'menu'},workspace);
  assert.equal(less.removed.controls,full.controls.length+1);
  assert.ok(section(less.mapPath,9).equals(section(row.mapPath,9)),'taking the interface out leaves the interface section as it was before it was added');
  const noRow=removeClient({mapPath:less.mapPath,script:'row'},workspace),noCard=removeClient({mapPath:noRow.mapPath,template:'card'},workspace);
  assert.deepEqual(listClientScripts({mapPath:noCard.mapPath}).scripts.map(x=>x.name),['menu']);
  assert.deepEqual(listInterface({mapPath:noCard.mapPath}).clientTemplates.map(t=>t.name),['dot']);
  assert.throws(()=>removeClient({mapPath:noCard.mapPath,ui:'menu'},workspace),e=>e.code==='CLIENT_UI_NOT_FOUND');
  // What was configured by hand in a second pass (tests/fixtures/editor-2026-10-13-clientmore.gil): values a control
  // gives the public variables of its scripts (every type), a rectangle of its own on each of the four devices, where
  // the stick of a gamepad goes from a control, the settings of a text window.
  const more=path.join(root,'tests','fixtures','editor-2026-10-13-clientmore.gil'),moreRoot=container(fs.readFileSync(more));
  const hand2=new Map(fields(section(more,9)).filter(f=>f.id===502).map(f=>[number(f.data,501),f.data])),as2=id=>({states:statesOf(hand2.get(id))}),K2=B+42;
  for(const spec of [
    {id:K2,name:'容器节点',kind:'container',children:[43,44,45,47].map(n=>B+n),rect:null,scripts:[{id:B+2,values:[{name:'greet',type:'string',value:'hi'},{name:'count',type:'integer',value:99}]}]},
    {id:B+43,name:'img',kind:'image',parent:K2,rect:{...as2(B+43),unsynced:true},image:100138},
    {id:B+44,name:'win',kind:'textWindow',parent:K2,rect:as2(B+44),text:{content:'hello',align:'right',scrollbar:false}},
    {id:B+45,name:'box',kind:'container',parent:K2,children:[B+46],rect:as2(B+45),focusable:true,navigation:{right:B+47,up:B+45,down:'none'}},
    {id:B+47,name:'box2',kind:'container',parent:K2,rect:as2(B+47),focusable:true,navigation:{left:B+45},scripts:[{id:B+3,values:[
      {name:'变量_4',type:'integerList',value:[7,8]},{name:'变量_1',type:'float',value:2.25},{name:'变量_3',type:'vector3',value:[7,2,3]},{name:'变量_5',type:'stringList',value:['y']},
      {name:'变量_6',type:'controlId',value:B+45},{name:'变量_7',type:'floatList',value:[3.5]},{name:'变量_9',type:'vector3List',value:[[9,5,6]]},{name:'变量_14',type:'guid',value:124},
      {name:'变量_16',type:'configId',value:457},{name:'变量_2',type:'boolean',value:false},{name:'变量_8',type:'booleanList',value:[false]},{name:'变量_15',type:'guidList',value:[55]},
      {name:'变量_17',type:'configIdList',value:[66]},{name:'变量_18',type:'prefabId',value:790},{name:'变量_19',type:'prefabIdList',value:[77]},{name:'变量_20',type:'controlIdList',value:[B+45]}]}]}])
    assert.ok(clientControlRecord(spec).equals(hand2.get(spec.id)),'the '+spec.kind+' "'+spec.name+'" of the second pass differs from the one configured in the editor');
  // The four rectangles of the image: the same control stands 245 left of the middle on a computer, 307 on a phone,
  // 849 on a console and 418 on a phone with a gamepad (typed in the editor as x = 555, 333, 111 and 222: the four
  // canvases are 1600, 1280, 1920 and 1280 wide).
  assert.deepEqual(statesOf(hand2.get(B+43)).map(st=>Math.round(st.position[0])),[-245,-307,-849,-418]);
  // The variables of a script, every type the editor offers: one script with a value in each kind of list, the other
  // with the ids, lists of ids and what the editor makes of a variable nobody filled.
  const scriptOf=(file,n)=>fields(section(file,50)).filter(x=>x.id===1)[n].data,vars=path.join(root,'tests','fixtures','editor-2026-10-13-clientvars.gil');
  const everyType=[{name:'变量_1',type:'float',value:1.5,public:true},{name:'变量_2',type:'boolean',value:true,public:true},{name:'变量_3',type:'vector3',value:[1,2,3],public:true},
    {name:'变量_4',type:'integerList',value:[7,9],public:true},{name:'变量_5',type:'stringList',value:['x'],public:true},{name:'变量_6',type:'controlId',value:B+43,public:true},
    {name:'变量_7',type:'floatList',value:[2.5],public:true},{name:'变量_8',type:'booleanList',value:[true],public:true},{name:'变量_9',type:'vector3List',value:[[4,5,6]],public:true},
    {name:'变量_10',type:'vector3List'},{name:'变量_11',type:'vector3List'},{name:'变量_12',type:'entity',public:true},{name:'变量_13',type:'entityList'},{name:'变量_14',type:'guid',value:123,public:true},
    {name:'变量_15',type:'guidList'},{name:'变量_16',type:'configId',value:456,public:true},{name:'变量_17',type:'configIdList'},{name:'变量_18',type:'prefabId',value:789},{name:'变量_19',type:'prefabIdList'},{name:'变量_20',type:'controlIdList'}];
  const first=scriptOf(vars,1);
  assert.ok(clientScriptRecord({id:B+3,name:'KS_b',file:'KS_b.lua',source:sub(first,5).toString('utf8'),variables:everyType}).equals(first),'the script with a variable of every type differs');
  const second=scriptOf(more,1);
  assert.ok(clientScriptRecord({id:B+3,name:'KS_b',file:'KS_b.lua',source:sub(second,5).toString('utf8'),variables:[
    {name:'变量_1',type:'float',value:1.5,public:true},{name:'变量_2',type:'boolean',value:true,public:true},{name:'变量_3',type:'vector3',value:[1,2,3],public:true},{name:'变量_6',type:'controlId',value:B+43,public:true},
    {name:'变量_10',type:'integer',public:true},{name:'变量_11',type:'string',public:true},{name:'变量_12',type:'entity',public:true},{name:'变量_13',type:'entityList',value:[null]},{name:'变量_14',type:'guid',value:123,public:true},
    {name:'变量_15',type:'guidList',value:[5],public:true},{name:'变量_16',type:'configId',value:456,public:true},{name:'变量_17',type:'configIdList',value:[6],public:true},{name:'变量_18',type:'prefabId',value:789,public:true},
    {name:'变量_19',type:'prefabIdList',value:[7],public:true},{name:'变量_20',type:'controlIdList',value:[B+47],public:true}]}).equals(second),'the script with ids, lists of ids and unfilled variables differs');
  assert.deepEqual(listClientScripts({mapPath:more}).scripts[1].variables.slice(0,5),[{name:'变量_1',type:'float',public:true},{name:'变量_2',type:'boolean',public:true},{name:'变量_3',type:'vector3',public:true},{name:'变量_6',type:'controlId',public:true},{name:'变量_10',type:'integer',public:true}]);
  // The same through the tools: values by the name of the variable, controls by their names, devices by theirs.
  const tuned=setClientScript({mapPath:dot.mapPath,name:'tune',source:'function OnStart()\n  print(script:GetParam("speed"))\nend\n',variables:[{name:'speed',type:'float',value:1.5,public:true},{name:'target',type:'controlId',public:true},
    {name:'others',type:'controlIdList',public:true},{name:'tags',type:'stringList',value:['a'],public:true},{name:'secret',type:'integer',value:1}]},workspace);
  const pad=addClientUi({mapPath:tuned.mapPath,name:'pad',script:{name:'tune',values:{speed:3}},controls:[
    {name:'a',kind:'container',position:[-200,0],focusable:true,navigation:{right:'b',left:'none'},script:{name:'tune',values:{speed:2.25,target:'b',others:['b','row/c'],tags:['x','y']}}},
    {name:'b',kind:'container',position:[200,0],focusable:true,navigation:{left:'a'},devices:{mobile:{position:[150,0],size:[120,120]},console:{position:[260,0]}}},
    {name:'row',kind:'container',children:[{name:'c',kind:'image',navigation:{up:'a'}}]},
    {name:'log',kind:'textWindow',size:[300,200],text:{content:'hello',align:'right',scrollbar:false}}]},workspace);
  const padMade=new Map(fields(section(pad.mapPath,9)).filter(f=>f.id===502).map(f=>[number(f.data,501),f.data])),at=n=>pad.controls.find(c=>c.path===n).controlId;
  assert.ok(clientControlRecord({id:at('a'),name:'a',kind:'container',parent:pad.rootId,rect:{position:[-200,0],size:[150,150]},focusable:true,navigation:{right:at('b'),left:'none'},
    scripts:[{id:tuned.scriptId,values:[{name:'speed',type:'float',value:2.25},{name:'target',type:'controlId',value:at('b')},{name:'others',type:'controlIdList',value:[at('b'),at('row/c')]},{name:'tags',type:'stringList',value:['x','y']}]}]}).equals(padMade.get(at('a'))),'names of controls become ids in what a control gives a script and in where the stick goes');
  const plain={position:[200,0],size:[150,150]};
  assert.ok(clientControlRecord({id:at('b'),name:'b',kind:'container',parent:pad.rootId,focusable:true,navigation:{left:at('a')},rect:{unsynced:true,states:[plain,{position:[150,0],size:[120,120]},{position:[260,0],size:[150,150]},plain]}}).equals(padMade.get(at('b'))),'a control with a rectangle of its own on two devices');
  assert.ok(clientControlRecord({id:at('row/c'),name:'c',kind:'image',parent:at('row'),rect:{position:[0,0],size:[80,80]},focusable:true,navigation:{up:at('a')}}).equals(padMade.get(at('row/c'))),'a control the stick is sent from is one it can stand on');
  assert.ok(clientControlRecord({id:at('log'),name:'log',kind:'textWindow',parent:pad.rootId,rect:{position:[0,0],size:[300,200]},text:{content:'hello',align:'right',scrollbar:false}}).equals(padMade.get(at('log'))));
  assert.ok(clientControlRecord({id:pad.rootId,name:'容器节点',kind:'container',children:['a','b','row','log'].map(at),rect:null,scripts:[{id:tuned.scriptId,values:[{name:'speed',type:'float',value:3}]}]}).equals(padMade.get(pad.rootId)),'the root gives its script a value');
  for(const [controls,code] of [[[{name:'a',kind:'image',script:{name:'tune',values:{nobody:1}}}],'VARIABLE_NOT_FOUND'],[[{name:'a',kind:'image',script:{name:'tune',values:{secret:2}}}],'VARIABLE_NOT_PUBLIC'],
    [[{name:'a',kind:'image',script:{name:'tune',values:{speed:'fast'}}}],'INVALID_VARIABLE'],[[{name:'a',kind:'image',script:{name:'tune',values:{target:'nobody'}}}],'CONTROL_NOT_FOUND'],
    [[{name:'a',kind:'image',navigation:{left:'b'}},{name:'b',kind:'image'}],'NOT_FOCUSABLE'],[[{name:'a',kind:'image',navigation:{left:'c'}},{name:'r',kind:'container',children:[{name:'c',kind:'image',focusable:true}]},{name:'s',kind:'container',children:[{name:'c',kind:'image',focusable:true}]}],'CONTROL_NOT_FOUND'],
    [[{name:'a',kind:'image',text:{scrollbar:false}}],'INVALID_CONTROL'],[[{name:'a',kind:'text',text:{scrollbar:false}}],'INVALID_CONTROL']])
    assert.throws(()=>addClientUi({mapPath:tuned.mapPath,name:'x',controls},workspace),e=>e.code===code,code);
  for(const bad of [{name:'v',type:'colour'},{name:'v',type:'float',value:'1'},{name:'v',type:'entity',value:1},{name:'v',type:'vector3',value:[1,2]},{name:'v',type:'integerList',value:[1.5]},{name:'v',type:'guid',value:-1}])
    assert.throws(()=>setClientScript({mapPath:blank,name:'s',source:'print(1)\n',variables:[bad]},workspace),e=>e.code==='INVALID_VARIABLE',JSON.stringify(bad));
  // The mask of an image: the bytes of the block as the editor stored it after each setting was changed by hand
  // (2026-10-13, one image, a save read after every change).
  const byHand={plain:'b01f01c01f01c81f01d81f02e01f64f01f01fa1f0cad1f00000041b51f0000004185200000aa428d200000aa42982001',
    whole:'a81f01b01f01c01f01c81f01d81f02e01f64f01f01fa1f0cad1f00000041b51f0000004185200000aa428d200000aa42902001982001',
    fromRight:'a81f01b01f01b81f01c01f01c81f01d81f02e01f1ef01f01fa1f0cad1f00000041b51f0000004185200000aa428d200000aa42902001982001',
    turned:'a81f01b01f01b81f01c81f01d01f02e01f1ee81f01fa1f0cad1f00000041b51f0000004185200000aa428d200000aa42902001982005a02001'};
  assert.equal(maskBlock({}).toString('hex'),byHand.plain);
  assert.equal(maskBlock({fill:{}}).toString('hex'),byHand.whole);
  assert.equal(maskBlock({fill:{shape:'horizontal',from:'right',amount:0.3}}).toString('hex'),byHand.fromRight);
  // The last one carries what was set on the way (from the right, a corner): read, it is a full turn from the bottom.
  assert.deepEqual(maskOf(Buffer.from(byHand.turned,'hex')),{fill:{shape:'radial360',from:'bottom',amount:0.3},feather:{percent:[85,85]},invertMask:true});
  assert.deepEqual(maskOf(Buffer.from(byHand.fromRight,'hex')),{fill:{shape:'horizontal',from:'right',amount:0.3}});
  assert.deepEqual(maskOf(Buffer.from(byHand.plain,'hex')),{});
  for(const look of [{mask:true},{fill:{shape:'vertical',from:'bottom',amount:0.5}},{fill:{shape:'vertical',from:'top',amount:1}},{fill:{shape:'radial90',from:'topRight',amount:0.25,clockwise:false}},
    {fill:{shape:'radial180',from:'left',amount:0.75}},{fill:{shape:'radial360',from:'top',amount:0.1},feather:{pixels:[4,12]},invertMask:true},{feather:{percent:[60,90]}},{invertMask:true}])
    assert.deepEqual(maskOf(maskBlock(look)),look,JSON.stringify(look));
  const ringed=addClientUi({mapPath:blank,name:'ring',controls:[{name:'cool',kind:'image',image:100002,size:[80,80],fill:{shape:'radial360',amount:0.4,clockwise:false},feather:{pixels:[2,2]}}],outputName:'ring'},workspace);
  const cool=getClientUi({mapPath:ringed.mapPath,ui:'ring'}).interface.controls[0];
  assert.deepEqual([cool.name,cool.image,cool.fill,cool.feather,cool.mask,cool.invertMask],['cool',100002,{shape:'radial360',from:'top',amount:0.4,clockwise:false},{pixels:[2,2]},undefined,undefined]);
  assert.throws(()=>addClientUi({mapPath:blank,name:'x',controls:[{name:'a',kind:'image',fill:{shape:'vertical',from:'left'}}]},workspace),e=>e.code==='INVALID_CONTROL');
  assert.throws(()=>addClientUi({mapPath:blank,name:'x',controls:[{name:'a',kind:'text',fill:{}}]},workspace),e=>e.code==='INVALID_CONTROL');
  // What stands near the edge of the computer's canvas is off a phone's: said when the interface is written.
  const wide=addClientUi({mapPath:blank,name:'wide',controls:[{name:'top',kind:'image',position:[0,400],size:[60,60]},{name:'ok',kind:'image',position:[600,300],size:[60,60]},{name:'side',kind:'image',position:[700,0],size:[100,40]},
    {name:'edge',kind:'image',position:[-40,-40],size:[60,60],anchor:{min:[1,1],max:[1,1]}},{name:'fit',kind:'image',position:[700,0],devices:{mobile:{position:[560,0]}}},
    {name:'group',kind:'container',position:[500,0],scale:[2,2],children:[{name:'far',kind:'image',position:[60,0],size:[40,40]}]}],outputName:'wide'},workspace);
  assert.deepEqual(wide.offPhoneCanvas,[{control:'top',beyond:{top:70}},{control:'side',beyond:{right:110}},{control:'group/far',beyond:{right:20}}]);
  assert.equal(pad.offPhoneCanvas,undefined);
  // Reading an interface back: what scene_get_client_ui gives, given to scene_add_client_ui again, writes the records
  // the editor wrote. The official sample and the saves configured by hand, each read, taken out and put back.
  for(const [file,uiName,skip] of [[official,'收集圆圈',[]],[kinds,'CG_ui',[]],[set,'KS_ui',[B+51,B+55,B+56]],[more,'KS_ui',[B+47]]]){
    const names=listInterface({mapPath:file}).clientInterfaces.map(c=>c.name);if(!names.includes(uiName)){assert.fail('no interface '+uiName+' in '+path.basename(file)+': '+names.join(','));}
    const read=getClientUi({mapPath:file,ui:uiName}),gone=removeClient({mapPath:file,ui:uiName,outputName:'rt-gone'},workspace);
    const back=addClientUi({mapPath:gone.mapPath,...read.interface,ids:read.ids,outputName:'rt-back',sameNames:true},workspace);
    const was=new Map(fields(section(file,9)).filter(f=>f.id===502).map(f=>[number(f.data,501),f.data])),now=new Map(fields(section(back.mapPath,9)).filter(f=>f.id===502).map(f=>[number(f.data,501),f.data]));
    assert.equal(now.size,was.size);
    for(const [id,data] of was)if(!skip.includes(id)&&id>=read.containerId)assert.ok(now.get(id)?.equals(data),'the control '+id+' of '+path.basename(file)+' is not written back as it was read');
  }
  // (In the first hand-configured save a button holds two controls of the same name, which cannot both keep their id
  // by path: the button and the two are left out of the comparison.)
  assert.deepEqual(getClientUi({mapPath:set,ui:'KS_ui'}).sameNames,['btn/图片']);
  // (In the second hand-configured save the control box2 holds values for variables that were taken out of the script
  // afterwards: those are not read back, so that one record differs.)
  const readMore=getClientUi({mapPath:more,ui:'KS_ui'}).interface;
  assert.deepEqual(readMore.controls.find(c=>c.name==='box').navigation,{right:'box2',up:'box',down:'none'});
  assert.deepEqual(Object.keys(readMore.controls.find(c=>c.name==='img').devices),['mobile','console','mobileGamepad']);
  assert.deepEqual(readMore.scripts,[{name:'KS_a',values:{greet:'hi',count:99}}]);
  assert.equal(readMore.controls.find(c=>c.name==='box2').scripts[0].values['变量_6'],'box','the id of a control is read back as its name');
  // A template is read back the same way.
  const cardRead=getClientUi({mapPath:shelf.mapPath,template:'card'});
  assert.deepEqual([cardRead.templateIndex,cardRead.template.children.map(c=>c.kind)],[card.templateIndex,['image','cursorArea']]);
  // Replacing in place: the interface comes back under the same container id, controls that keep their names keep
  // their ids, a new one gets a number of its own; a template comes back under the same index though a grid names it.
  const padRead=getClientUi({mapPath:pad.mapPath,ui:'pad'});
  const changed={...padRead.interface,controls:[...padRead.interface.controls.filter(c=>c.name!=='log'),{name:'extra',kind:'image',position:[0,-300]}]};
  changed.controls.find(c=>c.name==='b').position=[250,40];
  const swapped=addClientUi({mapPath:pad.mapPath,...changed,replace:true,outputName:'swapped'},workspace);
  assert.equal(swapped.containerId,pad.containerId);assert.equal(swapped.rootId,pad.rootId);
  const idNow=n=>swapped.controls.find(c=>c.path===n).controlId;
  assert.deepEqual(['a','b','row','row/c'].map(idNow),['a','b','row','row/c'].map(at));assert.ok(!Object.values({a:at('a'),b:at('b'),row:at('row'),c:at('row/c')}).includes(idNow('extra')));
  assert.deepEqual(getClientUi({mapPath:swapped.mapPath,ui:'pad'}).interface.controls.map(c=>[c.name,c.position]),[['a',[-200,0]],['b',[250,40]],['row',[0,0]],['extra',[0,-300]]]);
  assert.equal(swapped.replaced.idsKept,4);
  const recard=addClientTemplate({mapPath:shelf.mapPath,name:'card',children:[{name:'face',kind:'image',image:100002},{name:'hit',kind:'cursorArea'},{name:'star',kind:'image',image:100005}],replace:true,outputName:'recard'},workspace);
  assert.equal(recard.templateIndex,card.templateIndex);
  assert.deepEqual(getClientUi({mapPath:recard.mapPath,template:'card'}).template.children.map(c=>c.name),['face','hit','star']);
  assert.equal(listInterface({mapPath:recard.mapPath}).clientInterfaces[0].root.children[0].kind,'grid');
  assert.equal(getClientUi({mapPath:recard.mapPath,ui:'shelf'}).interface.controls[0].itemTemplate,'card','the grid still names the template');
  // The debug log of a play: what a graph prints is field 22 of a record, what a client script prints field 23.
  const record=(seconds,body)=>field(1,2,Buffer.concat([field(1,0,382),field(3,0,seconds),body]));
  const logBody=Buffer.concat([record(9,Buffer.concat([field(7,2,Buffer.concat([field(1,0,1),field(2,0,1073741825)])),field(22,2,Buffer.concat([field(1,0,382),field(2,2,Buffer.from('CU_CLICK'))]))])),
    record(9,Buffer.concat([field(7,2,field(1,0,1)),field(11,2,field(1,0,1)),field(23,2,field(2,2,Buffer.from('CU_LUA 分数 1')))]))]);
  const head=Buffer.alloc(8);head.writeUInt32BE(logBody.length+4,0);head.writeUInt32BE(logBody.length,4);
  const {inspectDebugLog}=await import('../src/debug-log.mjs');
  assert.deepEqual(inspectDebugLog(Buffer.concat([head,logBody])).prints.map(p=>[p.elapsedSeconds,p.graphId,p.text,p.clientScript??false]),[['9','1073741825','CU_CLICK',false],['9',null,'CU_LUA 分数 1',true]]);
  console.log(JSON.stringify({ok:true,scriptBytes:script.length}));
}finally{fs.rmSync(workspace,{recursive:true,force:true});}
