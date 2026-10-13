// A project of the 千星沙箱模拟器 (github.com/1475505/miliastra-beyond-simulator, the simulator outside the game for
// 2D + Lua levels) turned into what the tools of this server take: its scripts, its templates of client controls, its
// interface, and the server rules it simulates as the source of a node graph. The simulator ends where the game
// begins ("模拟器通过 ≠ 真机通过"): its own way into the game is a GIA the creator imports by hand, scripts mounted by
// hand and template indices calibrated by hand. Here the project goes into a save in one call and is played.
//
// Only the format of its save is read (a JSON file, format "qxqy-simulator-save", version 4, as its source of
// 2026-10-13 writes it): {assets: {server: project, client: project, scripts: [...]}, serverLogic: {rules}}. A
// project is {root: node}; a node is {id, kind, name, guid, active, visible, canControllerFocus, transformByPlatform:
// {KEYBOARD, TOUCHSCREEN, CONTROLLER_CONSOLE, CONTROLLER_MOBILE: {scale, rotation, anchorMin, anchorMax, offset, size,
// pivot}}, scriptMappingIds, children, and what belongs to its kind}. None of the simulator's code is used.
import fs from 'node:fs';
import path from 'node:path';
import luaparse from 'luaparse';
import {fail} from './adapter.mjs';

const KINDS={container:'container',textbox:'text',image:'image',button:'presetButton',cursor:'cursorArea',grid:'grid',reference:'reference',textwindow:'textWindow',keyhint:'keyHint',animation:'animation',fullscreen:'fullscreenAnimation'};
const DEVICES=[['mobile','TOUCHSCREEN'],['console','CONTROLLER_CONSOLE'],['mobileGamepad','CONTROLLER_MOBILE']];
// 0xAARRGGBB as the tools take a colour: "#rrggbb" and how solid it is.
const hue=n=>'#'+(Number(n)&0xffffff).toString(16).padStart(6,'0'),solid=n=>Math.round(((Number(n)>>>24)&255)/255*1000)/1000;
const pair=v=>[Number(v?.x??0),Number(v?.y??0)];
function rectOf(t){
  const out={position:pair(t.offset),size:pair(t.size)};
  const scale=pair(t.scale??{x:1,y:1}),min=pair(t.anchorMin??{x:0.5,y:0.5}),max=pair(t.anchorMax??{x:0.5,y:0.5}),pivot=pair(t.pivot??{x:0.5,y:0.5}),turn=Number(t.rotation?.z??0);
  if(scale[0]!==1||scale[1]!==1)out.scale=scale;
  if(turn)out.rotation=turn;
  if(pivot[0]!==0.5||pivot[1]!==0.5)out.pivot=pivot;
  if(min.some(v=>v!==0.5)||max.some(v=>v!==0.5))out.anchor={min,max};
  return out;
}
// Every whole number a script writes that is the index of a template, put to the index the template has in the save.
// The simulator changes these by text ("可能错误地替换非索引内容"); here only numbers of the Lua itself are touched,
// never one inside a string or a comment.
export function remapLuaNumbers(source,map){
  if(!map.size)return {source,changed:0};
  const spots=[];
  const walk=n=>{if(!n||typeof n!=='object')return;if(Array.isArray(n)){n.forEach(walk);return;}
    if(n.type==='NumericLiteral'&&map.has(n.value)&&/^\d+$/.test(n.raw))spots.push(n.range);
    for(const k of Object.keys(n))if(k!=='range'&&k!=='loc')walk(n[k]);};
  try{walk(luaparse.parse(source,{luaVersion:'5.3',ranges:true,comments:false}).body);}catch{return {source,changed:0,unparsed:true};}
  let out=source;
  for(const [from,to] of spots.sort((a,b)=>b[0]-a[0]))out=out.slice(0,from)+map.get(Number(out.slice(from,to)))+out.slice(to);
  return {source:out,changed:spots.length};
}
// Reads the save and says what to build: scripts, templates, the interface, signals, variables, the server graph.
export function readSimulatorSave(file){
  let data;try{data=JSON.parse(fs.readFileSync(file,'utf8').replace(/^﻿/,''));}catch(e){fail('INVALID_SIMULATOR_SAVE','The file is not JSON.',{file,error:String(e.message).slice(0,200)});}
  if(data?.format!=='qxqy-simulator-save'||!data.assets)fail('INVALID_SIMULATOR_SAVE','This is not a save of the 千星沙箱模拟器 (format "qxqy-simulator-save"). In the simulator: 导出 → 完整存档, the .json file.',{file,format:data?.format});
  if(!(data.version>=1&&data.version<=4))fail('INVALID_SIMULATOR_SAVE','A save of version 1 to 4 is read; this one is version '+data.version+'.',{file});
  const notes=[],home=path.dirname(file);
  const say=text=>{if(!notes.includes(text))notes.push(text);};
  // Scripts: the text in the save, or the file it names beside the save.
  const used=new Set(),scripts=(data.assets.scripts??[]).map((s,i)=>{
    let source=typeof s.source==='string'&&s.source.trim()?s.source:null;
    if(!source&&s.path){const at=path.resolve(home,s.path);if(at.startsWith(path.resolve(home))&&fs.existsSync(at))source=fs.readFileSync(at,'utf8').replace(/^﻿/,'');}
    if(!source){say('The script "'+(s.path||s.id)+'" has no text in the save and its file was not found beside it: left out.');return null;}
    let name=path.basename(String(s.path||s.id||'script'+(i+1))).replace(/\.lua$/i,'').replace(/\s+/g,'_').slice(0,40)||'script'+(i+1);
    while(used.has(name))name=name.slice(0,36)+'_'+(i+1);used.add(name);
    return {name,guid:Number(s.guid)||0,id:s.id,source,on:s.controlId||null,onAsset:s.controlAsset||null,path:s.path||null};
  }).filter(Boolean);
  const scriptsOn=node=>[...new Set([...(node.scriptMappingIds??[]).map(g=>scripts.find(s=>s.guid&&s.guid===Number(g))?.name),...scripts.filter(s=>s.on===node.id).map(s=>s.name)].filter(Boolean))];
  // Templates: the children of the root of the client project; each is known to Lua by its guid.
  const templates=(data.assets.client?.root?.children??[]),templateName=new Map(templates.map(t=>[Number(t.guid),t.name]));
  const control=(node,isTemplateRoot=false)=>{
    const kind=KINDS[node.kind];
    if(!kind){say('A control of the kind "'+node.kind+'" ("'+node.name+'") is not one the game has: left out.');return null;}
    const platforms=node.transformByPlatform??{},base=platforms.KEYBOARD??Object.values(platforms)[0];
    const out={name:String(node.name).slice(0,30),kind};
    if(kind!=='fullscreenAnimation'&&base){
      Object.assign(out,rectOf(base));
      const other=Object.fromEntries(DEVICES.filter(([,p])=>platforms[p]&&JSON.stringify(platforms[p])!==JSON.stringify(base)).map(([d,p])=>[d,rectOf(platforms[p])]));
      if(Object.keys(other).length)out.devices=other;
    }
    if(isTemplateRoot)delete out.position;
    if(node.active===false)out.active=false;
    if(node.visible===false)out.visible=false;
    if(node.canControllerFocus)out.focusable=true;
    const carried=scriptsOn(node);if(carried.length)out.scripts=carried;
    if(kind==='container')for(const [mine,theirs] of [['isolateNavigation','isolateNavigation'],['blockKeys','disableKeyEventPassthrough'],['blockCursor','disableCursorEventPassthrough'],['showCursor','showCursor']])if(node[theirs])out[mine]=true;
    if(kind==='text'||kind==='textWindow'){
      out.text={content:String(node.text??''),fontSize:node.fontSize??20,colour:hue(node.fontColor??0xffffffff),opacity:solid(node.fontColor??0xffffffff),background:hue(node.bgColor??0xffffff),backgroundOpacity:solid(node.bgColor??0xffffff),
        outline:node.enableOutline!==false,outlineColour:hue(node.outlineColor??0x33333333),outlineOpacity:solid(node.outlineColor??0x33333333),align:{Left:'left',Middle:'centre',Right:'right'}[node.horizontalAlignment]??'left',
        ...(node.adaptiveFontSize?{autoSize:true,minFontSize:node.minimumFontSize??20}:{})};
      if(!out.text.content)delete out.text.content;
      if(kind==='text')out.text.valign={Top:'top',Middle:'middle',Bottom:'bottom'}[node.verticalAlignment]??'top';
      else{if(node.interactable===false)out.text.scrollable=false;if(node.showScrollBar===false)out.text.scrollbar=false;}
    }
    if(kind==='image'){
      if((node.imageSource??'StaticReference')!=='StaticReference')say('The image "'+node.name+'" takes its picture from '+node.imageSource+', which a save cannot be given here: the script has to set it (control:SetImage).');
      else if(Number.isInteger(node.imageId)&&node.imageId>=100000)out.image=node.imageId;
      const tint=node.imageColor??0xffffffff;if((tint>>>0)!==0xffffffff){out.colour=hue(tint);out.opacity=solid(tint);}
      // The mask and what it does: a fill, a soft edge, the mask turned inside out (in the game these work only under
      // a mask that is on, so any of them switches it on).
      if(node.enableMask||node.enableFill)out.mask=true;
      if(node.enableFill){const low=v=>typeof v==='string'?v[0].toLowerCase()+v.slice(1):undefined,shape=low(node.fillType)??'horizontal';
        const from=low({horizontal:node.fillHorizontalType,vertical:node.fillVerticalType,radial90:node.fillRadial90Type}[shape]??node.fillRadialType);
        out.fill={shape,...(from?{from}:{}),amount:Math.max(0,Math.min(1,Number(node.fillAmount??1))),...(node.fillClockwise===false?{clockwise:false}:{})};delete out.mask;}
      if(node.enableSoftEdge&&(node.enableMask||node.enableFill)){out.feather=node.softEdgeMode==='Percentage'?{percent:[node.horizontalSoftRange??85,node.verticalSoftRange??85]}:{pixels:[node.softEdgeWidthX??8,node.softEdgeWidthY??8]};delete out.mask;}
      if(node.reverseMaskArea&&(node.enableMask||node.enableFill)){out.invertMask=true;delete out.mask;}
    }
    if(kind==='presetButton'){
      // The simulator calls the four state slots 不可用, 悬停, 按下, 选中; in the editor they are 默认, 悬停, 按下, 不可用
      // (the panel of a button, 2026-10-13). What its author meant is kept: its 不可用 is the tool's disabled, and the
      // look of the button left alone is given a state of its own when a hover or a pressed look is there.
      const named=id=>id?(node.children??[]).find(c=>c.id===id)?.name:undefined,states={hover:named(node.hoverChildId),pressed:named(node.pressedChildId),disabled:named(node.unavailableChildId)};
      for(const k of Object.keys(states))if(!states[k])delete states[k];
      if(Object.keys(states).length){out.states=states;
        say('The button "'+node.name+'" has looks for some states and none for the state left alone (the simulator has no such slot; the game does, 默认状态): give states.normal the child it shows then, or the button may show nothing until the cursor is on it.');}
      if(node.selectedChildId)say('The button "'+node.name+'" has a look for 选中, a state the game does not have: left out.');
      if(node.interactable===false)out.enabled=false;
      if(Number.isInteger(node.clickAudioId)&&node.clickAudioId!==50888)out.sound=node.clickAudioId;
    }
    if(kind==='grid'){
      const item=templateName.get(Number(node.itemPrefabId));
      if(item)out.itemTemplate=item;else if(node.itemPrefabId)say('The grid "'+node.name+'" names a template ('+node.itemPrefabId+') the save does not hold: left without one.');
      const across=node.scrollDirection==='Horizontal',fixed=node.layoutConstraint&&node.layoutConstraint!=='AutoWrap'&&node.layoutConstraintFixedCount?Number(node.layoutConstraintFixedCount):null;
      out.grid={itemSize:[node.cellSizeX??50,node.cellSizeY??50],spacing:[node.spacingX??8,node.spacingY??8],padding:[node.padding1X??20,node.padding1Y??20,node.padding2X??20,node.padding2Y??20],
        ...(fixed?(across?{rows:fixed}:{columns:fixed}):across?{horizontal:true}:{}),...(node.showScrollBar===false?{scrollbar:false}:{}),...(Number.isInteger(node.previewCount)?{preview:node.previewCount}:{})};
    }
    if(kind==='reference'){const shown=templateName.get(Number(node.referencedPrefabId));
      if(shown)out.template=shown;else if(node.referencedPrefabId)say('The reference "'+node.name+'" names a template ('+node.referencedPrefabId+') the save does not hold: left without one.');}
    if(kind==='keyHint'){
      if(Number.isInteger(node.keyboardKeyCode)&&node.keyboardKeyCode>=1&&node.keyboardKeyCode<=41)out.key=node.keyboardKeyCode;
      if(Number.isInteger(node.controllerKeyCode)&&node.controllerKeyCode>=1&&node.controllerKeyCode<=14)out.padKey=node.controllerKeyCode;
    }
    if(kind==='animation'||kind==='fullscreenAnimation'){
      const id=Number(node.animationId);if(Number.isInteger(id)&&id>0)out.effect=id;
      if(node.playSoundEffect)out.effectSound=true;
      if(node.layer==='BelowAllControls')out.below=true;
    }
    const kids=(node.children??[]).map(c=>control(c)).filter(Boolean);
    if(kids.length){if(kind==='container'||kind==='presetButton')out.children=kids;else say('"'+node.name+'" ('+node.kind+') holds controls, which only a container and a button can: they are left out.');}
    return out;
  };
  const madeTemplates=templates.map(t=>({guid:Number(t.guid),spec:control(t,true)})).filter(t=>t.spec);
  // The interface: the server project is a client control container with one root; its controls are the root's.
  const holder=data.assets.server?.root,rootNode=(holder?.children??[]).find(c=>c.kind==='container')??null;
  const ui=rootNode?{name:String(holder.name||data.meta?.name||'interface').slice(0,30),scripts:scriptsOn(rootNode),controls:(rootNode.children??[]).map(c=>control(c)).filter(Boolean),
    ...(rootNode.showCursor?{showCursor:true}:{}),...(rootNode.disableKeyEventPassthrough?{blockKeys:true}:{}),...(rootNode.disableCursorEventPassthrough?{blockCursor:true}:{}),...(rootNode.isolateNavigation?{isolateNavigation:true}:{}),
    ...(holder.visible===false||holder.active===false?{hidden:true}:{})}:null;
  if(!ui)say('The save has no interface (no container under the client control container of its server project).');
  // The server it simulates: rules of the form "when signal S comes from a script, set variables and send signals to
  // scripts". That is a node graph of the level entity; signals and variables have to be there for it. A signal
  // carries values of set types in the game: what a script adds to a signal before sending it (AddInt, AddString ...)
  // says the types of the one it sends, and what a rule sends back says the types of that one.
  const rules=data.serverLogic?.rules??[],signals=new Map(),variables=new Map(),lines=[];
  const ADDS=Object.fromEntries(Object.entries({Int:'integer',Float:'float',String:'string',Bool:'boolean',Vector3:'vector3',Entity:'entity',Guid:'guid',PrefabId:'prefabId',ConfigId:'configId'}).flatMap(([k,t])=>[['Add'+k,t],['Add'+k+'List',t+'List']]));
  const TS={integer:'int',float:'float',string:'str',boolean:'bool',vector3:'vec3',entity:'entity',guid:'guid',prefabId:'prefab_id',configId:'config_id'};
  const sentUp=new Map();
  for(const sc of scripts){let ast;try{ast=luaparse.parse(sc.source,{luaVersion:'5.3',comments:false});}catch{continue;}
    const held=new Map(),made=n=>(n?.type==='CallExpression'||n?.type==='StringCallExpression')&&n.base?.type==='MemberExpression'&&n.base.base?.name==='game'&&n.base.identifier?.name==='ServerSignal'?String((n.arguments?.[0]??n.argument)?.raw??'').replace(/^["']|["']$/g,''):null;
    const walk=n=>{if(!n||typeof n!=='object')return;if(Array.isArray(n)){n.forEach(walk);return;}
      if(n.type==='LocalStatement'||n.type==='AssignmentStatement')n.variables.forEach((v,k)=>{const name=made(n.init?.[k]);if(v.type==='Identifier'&&name)held.set(v.name,{name,types:[]});});
      if(n.type==='CallExpression'&&n.base?.type==='MemberExpression'&&n.base.indexer===':'&&n.base.base?.type==='Identifier'&&held.has(n.base.base.name)){const h=held.get(n.base.base.name),m=n.base.identifier.name;
        if(ADDS[m])h.types.push(ADDS[m]);else if(m==='SendSignal'){if(!sentUp.has(h.name)||sentUp.get(h.name).length<h.types.length)sentUp.set(h.name,h.types);held.delete(n.base.base.name);}}
      if(n.type==='CallExpression'&&n.base?.type==='MemberExpression'&&n.base.identifier?.name==='SendSignal'&&made(n.base.base)&&!sentUp.has(made(n.base.base)))sentUp.set(made(n.base.base),[]);
      for(const k of Object.keys(n))if(k!=='loc'&&k!=='type')walk(n[k]);};
    walk(ast.body);}
  const typeOf=v=>typeof v==='string'?'string':typeof v==='boolean'?'boolean':Number.isInteger(v)?'integer':'float';
  const want=(name,types)=>{const had=signals.get(name);if(!had||had.length<types.length)signals.set(name,types);};
  const written=(v,type)=>type==='string'?JSON.stringify(String(v)):type==='boolean'?String(!!v):type==='integer'?Math.round(Number(v))+'n':String(Number(v));
  for(const rule of rules){
    const uses=rule.actions.flatMap(a=>[a.value,...(a.params??[])]).filter(v=>v&&typeof v==='object'&&Number.isInteger(v.fromSignalParam)).map(v=>v.fromSignalParam);
    const needed=uses.length?Math.max(...uses)+1:0,fromLua=sentUp.get(rule.signalName)??[],heard=[...fromLua];
    // A parameter a rule reads and no script was seen to add travels as a string, as the simulator's own values do.
    while(heard.length<needed)heard.push('string');
    if(needed>fromLua.length)say('The rule of "'+rule.signalName+'" reads '+needed+' parameter(s) of the signal and the scripts were seen to add '+fromLua.length+': the missing ones are taken to be strings. Make the script add them (AddString and its kind) in that order.');
    want(rule.signalName,heard);
    const body=[];
    for(const action of rule.actions){
      const fromSignal=v=>v&&typeof v==='object'&&Number.isInteger(v.fromSignalParam);
      if(action.kind==='setCustomVariable'){
        const level=action.entityType==='Level';
        const type={Int:'integer',Float:'float',String:'string',Bool:'boolean'}[action.variableType]??(fromSignal(action.value)?heard[action.value.fromSignalParam]:typeOf(action.value));
        const v=fromSignal(action.value)?'evt.params.p'+(action.value.fromSignalParam+1):written(action.value,type);
        if(fromSignal(action.value)&&heard[action.value.fromSignalParam]!==type)say('The rule of "'+rule.signalName+'" puts parameter '+(action.value.fromSignalParam+1)+' ('+heard[action.value.fromSignalParam]+') into the variable "'+action.name+'" ('+type+'): the graph needs a conversion there (f.dataTypeConversion), or the script has to add a value of that type.');
        if(!level)variables.set(action.name,type);else say('The rule of "'+rule.signalName+'" sets the level variable "'+action.name+'": it must exist on the level entity (the editor: 关卡变量管理), which no tool here adds.');
        body.push(level?"    f.setCustomVariable(f.getSelfEntity(),"+JSON.stringify(action.name)+","+v+",true);":"    for(const player of f.getListOfPlayerEntitiesOnTheField())f.setCustomVariable(player,"+JSON.stringify(action.name)+","+v+",true);");
      }else if(action.kind==='sendClientScriptSignal'){
        const params=action.params??[],types=params.map(v=>fromSignal(v)?heard[v.fromSignalParam]:typeOf(v));
        want(action.signalName,types);
        const sent=params.map((v,k)=>fromSignal(v)?'evt.params.p'+(v.fromSignalParam+1):written(v,types[k]));
        body.push({send:action.signalName,values:sent});
      }
    }
    lines.push({signal:rule.signalName,body});
  }
  const named=types=>types.map((type,k)=>({name:'p'+(k+1),type}));
  return {name:data.meta?.name??path.basename(file),version:data.version,scripts,templates:madeTemplates,ui,signals:[...signals].map(([name,types])=>({name,...(types.length?{parameters:named(types)}:{})})),
    variables:[...variables].map(([name,type])=>({name,type})),rules:lines,notes,signalTypes:Object.fromEntries([...signals].map(([name,types])=>[name,types.map(t=>t.endsWith('List')?TS[t.slice(0,-4)]+'_list':TS[t])]))};
}
// The source of the graph that does what the simulator's server rules do, for the level entity.
export function serverGraphSource(plan,graphId,graphName){
  // A signal that carries values is declared once with their types; the one that goes to client scripts has the name
  // client:NAME and the player before the values.
  const types=plan.signalTypes??{},heard=new Map(),toScripts=new Map(),entries=list=>list.map((t,k)=>"['p"+(k+1)+"','"+t+"']").join(',');
  for(const rule of plan.rules){if(types[rule.signal]?.length&&!heard.has(rule.signal))heard.set(rule.signal,'S'+heard.size);
    for(const l of rule.body)if(typeof l==='object'&&types[l.send]?.length&&!toScripts.has(l.send))toScripts.set(l.send,'C'+toScripts.size);}
  const typed=heard.size+toScripts.size,lines=["/// <reference types=\"genshin-ts\" />","import { g"+(typed?", defineSignal":"")+" } from 'genshin-ts/runtime/core'","",
    "// From the server rules of the simulator save \""+plan.name+"\": each rule hears a signal a client script sends","// and sets variables or sends signals back to the scripts."];
  for(const [name,id] of heard)lines.push("const "+id+"=defineSignal("+JSON.stringify(name)+",["+entries(types[name])+"] as const)");
  for(const [name,id] of toScripts)lines.push("const "+id+"=defineSignal("+JSON.stringify('client:'+name)+",[['player','entity'],"+entries(types[name])+"] as const)");
  lines.push("g.server({id:"+graphId+",name:'"+graphName+"'})",".on('whenEntityIsCreated',(evt,f)=>{","  f.printString('SIM_SERVER_READY');","})");
  for(const rule of plan.rules){
    const body=rule.body.map(l=>typeof l==='string'?l.slice(2):"  for(const player of f.getListOfPlayerEntitiesOnTheField())f.sendSignal("+(toScripts.get(l.send)??JSON.stringify('client:'+l.send))+",player"+l.values.slice(0,types[l.send]?.length??0).map(v=>','+v).join('')+");");
    lines.push(".onSignal("+(heard.get(rule.signal)??JSON.stringify(rule.signal))+",(evt,f)=>{",...body,"})");}
  return lines.join('\n')+'\n';
}
