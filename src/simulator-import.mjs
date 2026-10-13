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
      // A fill shows only on an image whose mask is on (seen in play); the fill itself is the script's to set.
      if(node.enableMask||node.enableFill)out.mask=true;
      if(node.enableFill)say('The image "'+node.name+'" is filled partly in the simulator ('+node.fillType+', '+node.fillAmount+'). A save cannot be given a fill here: its mask is switched on and the script has to set the fill (SetFillHorizontal and its kind).');
      if(node.enableSoftEdge)say('The soft edge of the image "'+node.name+'" is not written.');
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
  // scripts". That is a node graph of the level entity; signals and variables have to be there for it.
  const rules=data.serverLogic?.rules??[],signals=new Map(),variables=new Map(),lines=[];
  const want=(name,params)=>{const had=signals.get(name)??0;signals.set(name,Math.max(had,params));};
  const written=v=>typeof v==='string'?JSON.stringify(v):typeof v==='boolean'?String(v):Number.isInteger(v)?v+'n':String(v);
  for(const rule of rules){
    const uses=rule.actions.flatMap(a=>[a.value,...(a.params??[])]).filter(v=>v&&typeof v==='object'&&Number.isInteger(v.fromSignalParam)).map(v=>v.fromSignalParam);
    want(rule.signalName,uses.length?Math.max(...uses)+1:0);
    const body=[];
    for(const action of rule.actions){
      const value=v=>v&&typeof v==='object'&&Number.isInteger(v.fromSignalParam)?(v.fromSignalParam===0?'evt.params.value':null):written(v);
      if(action.kind==='setCustomVariable'){
        const v=value(action.value),level=action.entityType==='Level';
        if(v===null){say('A rule of "'+rule.signalName+'" uses the second or a later parameter of the signal; signals carry one string here: that action is left out.');continue;}
        const type={Int:'integer',Float:'float',String:'string',Bool:'boolean'}[action.variableType]??(typeof action.value==='string'?'string':typeof action.value==='boolean'?'boolean':Number.isInteger(action.value)?'integer':'float');
        if(!level)variables.set(action.name,type);else say('The rule of "'+rule.signalName+'" sets the level variable "'+action.name+'": it must exist on the level entity (the editor: 关卡变量管理), which no tool here adds.');
        body.push(level?"    f.setCustomVariable(f.getSelfEntity(),"+JSON.stringify(action.name)+","+v+",true);":"    for(const player of f.getListOfPlayerEntitiesOnTheField())f.setCustomVariable(player,"+JSON.stringify(action.name)+","+v+",true);");
      }else if(action.kind==='sendClientScriptSignal'){
        const params=(action.params??[]).map(value);
        if(params.length>1||params.includes(null)){say('The rule of "'+rule.signalName+'" sends "'+action.signalName+'" with more than one parameter; signals carry one string here: only the first is sent.');}
        want(action.signalName,Math.min(1,params.length));
        // A signal carries a string: a number or a switch of the simulator travels as its text.
        const first=action.params?.[0],sent=!params.length||params[0]===null?'':','+(first&&typeof first==='object'?params[0]:JSON.stringify(String(first)));
        body.push("    for(const player of f.getListOfPlayerEntitiesOnTheField())f.sendSignal('client:"+action.signalName+"',player"+sent+");");
      }
    }
    lines.push({signal:rule.signalName,body});
  }
  return {name:data.meta?.name??path.basename(file),version:data.version,scripts,templates:madeTemplates,ui,signals:[...signals].map(([name,params])=>({name,...(params?{parameter:'value'}:{})})),
    variables:[...variables].map(([name,type])=>({name,type})),rules:lines,notes};
}
// The source of the graph that does what the simulator's server rules do, for the level entity.
export function serverGraphSource(plan,graphId,graphName){
  // A signal a rule hears and whose string it uses is declared with its parameter, for evt.params.value.
  const typed=plan.signals.filter(s=>s.parameter&&plan.rules.some(r=>r.signal===s.name&&r.body.some(l=>l.includes('evt.params.value')))),lines=["/// <reference types=\"genshin-ts\" />","import { g"+(typed.length?", defineSignal":"")+" } from 'genshin-ts/runtime/core'","",
    "// From the server rules of the simulator save \""+plan.name+"\": each rule hears a signal a client script sends","// and sets variables or sends signals back to the scripts."];
  const handle=new Map(typed.map((s,i)=>['S'+i,s]));
  for(const [id,s] of handle)lines.push("const "+id+"=defineSignal("+JSON.stringify(s.name)+",[['value','str']] as const)");
  lines.push("g.server({id:"+graphId+",name:'"+graphName+"'})",".on('whenEntityIsCreated',(evt,f)=>{","  f.printString('SIM_SERVER_READY');","})");
  for(const rule of plan.rules){const typedId=[...handle].find(([,s])=>s.name===rule.signal)?.[0];
    lines.push(".onSignal("+(typedId??JSON.stringify(rule.signal))+",(evt,f)=>{",...rule.body.map(l=>l.slice(2)),"})");}
  return lines.join('\n')+'\n';
}
