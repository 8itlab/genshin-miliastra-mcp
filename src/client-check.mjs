// What a client script (Lua) names, checked against what there is, before the game is asked.
// On this platform a name that does not match is not an error: the control is not found, the signal is not heard, the
// variable reads nil, and nothing says so. A simulator outside the game can run the script; only the save knows the
// controls, the signals, the variables, the templates, and only the catalogues know the pictures and the sounds. Here
// the script is parsed (Lua 5.3) and every name it writes down as a literal is looked up:
// - its syntax;
// - the functions of game, the methods of script, the Enum values (the official API page, src/scene/client-api.json);
// - the methods it calls on anything, against every method the API has and what the script defines itself;
// - the controls it asks for by name (GetChild, FindChild), against the controls under the ones that carry it;
// - the signals it sends and hears, against the signals of the save, and against the graphs that hear and send them;
// - the custom variables it reads, against the variables of the player and the character templates;
// - its own variables (GetParam), the templates it makes copies of, pictures and sounds by their ids.
// Only literals are checked: a name put together while the script runs is not seen.
import fs from 'node:fs';
import luaparse from 'luaparse';
import {container,fields} from './scene/wire.mjs';
import {clientScriptSignalHeads} from './scene/signal-definitions.mjs';
import {imageIdKnown} from './scene/images.mjs';

const API=JSON.parse(fs.readFileSync(new URL('./scene/client-api.json',import.meta.url),'utf8'));
const SOUNDS=new Set(JSON.parse(fs.readFileSync(new URL('./scene/media/sounds.json',import.meta.url),'utf8')).rows.map(r=>r[0]));
const SCRIPT_FIELDS=['alive','scriptMappingId','object','path','enabled'];
// Methods of Lua's own strings and of what a script commonly builds for itself are not the API's to know.
const LUA_METHODS=new Set(['sub','gsub','gmatch','match','find','format','len','rep','byte','char','lower','upper','reverse','pack','unpack']);
const num=(b,id)=>{const f=fields(b).find(x=>x.id===id&&x.wire===0);return f?Number(f.value):null;};

// The nearest of the names there are, when one is near enough to be what was meant.
function nearest(name,known){
  let best=null,bestD=Infinity;
  for(const k of known){
    const a=name.toLowerCase(),b=String(k).toLowerCase();if(Math.abs(a.length-b.length)>3)continue;
    const row=Array.from({length:b.length+1},(_,i)=>i);
    for(let i=1;i<=a.length;i++){let prev=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const t=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));prev=t;}}
    if(row[b.length]<bestD){bestD=row[b.length];best=k;}
  }
  return best!==null&&bestD<=Math.max(1,Math.floor(name.length/3))?best:null;
}
const literal=n=>n?.type==='StringLiteral'?n.raw.replace(/^\[=*\[|\]=*\]$/g,'').replace(/^["']|["']$/g,''):n?.type==='NumericLiteral'?n.value:undefined;
const chain=n=>n?.type==='Identifier'?[n.name]:n?.type==='MemberExpression'?[...(chain(n.base)??[null]),n.identifier.name]:null;

// The syntax of a script: nothing, or {line, column, message}.
export function luaSyntaxError(source){
  try{luaparse.parse(source,{luaVersion:'5.3',locations:true,comments:false});return null;}
  catch(e){return {line:e.line??null,column:e.column??null,message:String(e.message).replace(/^\[\d+:\d+\]\s*/,'')};}
}
// What a script names: every call with the literals it is given, every Enum value, what it defines itself.
function facts(source){
  const ast=luaparse.parse(source,{luaVersion:'5.3',locations:true,comments:false});
  const calls=[],enums=[],own=new Set(),members=[];
  const walk=n=>{
    if(!n||typeof n!=='object')return;
    if(Array.isArray(n)){n.forEach(walk);return;}
    if(n.type==='CallExpression'||n.type==='StringCallExpression'||n.type==='TableCallExpression'){
      const args=n.type==='CallExpression'?n.arguments:[n.argument],base=n.base;
      if(base?.type==='MemberExpression')calls.push({line:n.loc.start.line,on:chain(base.base),indexer:base.indexer,name:base.identifier.name,args});
      else if(base?.type==='Identifier')calls.push({line:n.loc.start.line,on:null,indexer:null,name:base.name,args});
    }
    if(n.type==='MemberExpression'){
      const c=chain(n);
      if(c&&c[0]==='Enum'&&c.length===3)enums.push({line:n.loc.start.line,type:c[1],value:c[2]});
      if(c&&c.length===2&&(c[0]==='game'||c[0]==='script'))members.push({line:n.loc.start.line,on:c[0],name:c[1]});
    }
    // What the script defines: functions by name, members it assigns, keys of the tables it builds.
    if(n.type==='FunctionDeclaration'&&n.identifier){const c=chain(n.identifier);if(c)own.add(c.at(-1));}
    if(n.type==='AssignmentStatement')for(const v of n.variables)if(v.type==='MemberExpression')own.add(v.identifier.name);
    if(n.type==='TableKeyString'&&n.key?.name)own.add(n.key.name);
    for(const k of Object.keys(n))if(k!=='loc'&&k!=='type')walk(n[k]);
  };
  walk(ast.body);
  return {calls,enums,own,members};
}
// The ids of the node definitions every graph of the save uses (a signal's send, listen and client-script nodes among them).
function graphNodeIds(root){
  const used=new Set();
  for(const s of fields(root).filter(f=>f.id===10&&f.wire===2))for(const group of fields(s.data).filter(f=>f.wire===2&&f.id!==2&&f.id!==5))
    for(const g of fields(group.data).filter(f=>f.id===1&&f.wire===2))for(const n of fields(g.data).filter(f=>f.id===3&&f.wire===2)){
      try{const head=fields(n.data).find(f=>f.id===2&&f.wire===2);if(head)used.add(num(head.data,5));}catch{}}
  return used;
}
// The signals of a save: name → the ids of its send, listen and client-script definitions.
function signalsOf(root,bytes){
  const out=new Map(),scriptHeads=clientScriptSignalHeads(bytes);
  for(const s of fields(root).filter(f=>f.id===10&&f.wire===2)){
    const register=fields(s.data).find(f=>f.id===5&&f.wire===2);if(!register)continue;
    for(const e of fields(register.data).filter(f=>f.id===3&&f.wire===2)){
      const sub=id=>fields(e.data).find(f=>f.id===id&&f.wire===2)?.data,name=sub(3)?.toString('utf8');
      if(name)out.set(name,{send:num(sub(1),5),listen:num(sub(2),5),toScripts:scriptHeads.get(name)?.nodeId??null,parameters:fields(e.data).filter(f=>f.id===4&&f.wire===2).length});
    }
  }
  return out;
}

// Checks every client script of a save (or the ones named). read: the functions of scene-save this needs, handed in
// by the caller (listClientScripts, listInterface, listComponents), so that this module does not load that one.
export function checkClient({mapPath,scripts:only},read){
  const bytes=fs.readFileSync(mapPath),root=container(bytes);
  const listed=read.listClientScripts({mapPath,includeSource:true}).scripts.filter(s=>!only||only.includes(s.name));
  const face=read.listInterface({mapPath}),signals=signalsOf(root,bytes),used=graphNodeIds(root);
  const held=prefab=>{try{return new Set(read.listComponents({mapPath,prefab}).found.flatMap(f=>(f.variables??[]).map(v=>v.name)));}catch{return null;}};
  const playerVars=held('player'),avatarVars=held('character');
  const templates=face.clientTemplates??[],templateIds=new Set(templates.map(t=>t.templateIndex));
  // The controls under each control that carries a script, and all the controls there are (a script may be handed any).
  const trees=[...(face.clientInterfaces??[]).map(i=>i.root).filter(Boolean),...(face.clientTemplateTrees??[])];
  const under=new Map(),everyName=new Set();
  const visit=(node,hosts)=>{everyName.add(node.name);
    const mine=[...hosts];for(const h of mine)h.names.add(node.name);
    const here=(node.scripts??[]).map(name=>{const h={script:name,host:node.name,names:new Set(),paths:new Set()};if(!under.has(name))under.set(name,[]);under.get(name).push(h);return h;});
    for(const kid of node.children??[]){
      const paths=(n,prefix)=>{const p=prefix?prefix+'/'+n.name:n.name;for(const h of here)h.paths.add(p);for(const k of n.children??[])paths(k,p);};paths(kid,'');
      visit(kid,[...mine,...here]);}
  };
  for(const t of trees)visit(t,[]);
  const problems=[],heard=new Set(),sentUp=new Set();
  const say=(script,line,severity,kind,message,more={})=>problems.push({script,line,severity,kind,message,...more});
  for(const s of listed){
    const bad=luaSyntaxError(s.source);
    if(bad){say(s.name,bad.line,'error','LUA_SYNTAX',bad.message+' (the playtest would refuse the save with 脚本编译报错).',{column:bad.column});continue;}
    const f=facts(s.source),hosts=under.get(s.name)??[],declared=new Set((s.variables??[]).map(v=>v.name));
    if(!hosts.length)say(s.name,null,'warning','SCRIPT_NOT_MOUNTED','No control carries this script: it never runs. scene_add_client_ui {script} puts it on the root of an interface, a control\'s own script on that control.');
    for(const m of f.members){
      if(m.on==='game'&&!API.game.includes(m.name)){const n=nearest(m.name,API.game);say(s.name,m.line,'error','UNKNOWN_API','game.'+m.name+' is not a function of the client API.',n?{didYouMean:'game.'+n}:{});}
      if(m.on==='script'&&!API.script.includes(m.name)&&!SCRIPT_FIELDS.includes(m.name)){const n=nearest(m.name,[...API.script,...SCRIPT_FIELDS]);say(s.name,m.line,'error','UNKNOWN_API','script has no '+m.name+'.',n?{didYouMean:'script:'+n}:{});}
    }
    for(const e of f.enums){
      if(!API.enums[e.type]){const n=nearest(e.type,Object.keys(API.enums));say(s.name,e.line,'error','UNKNOWN_ENUM','There is no Enum.'+e.type+'.',n?{didYouMean:'Enum.'+n}:{});}
      else if(!API.enums[e.type].includes(e.value)){const n=nearest(e.value,API.enums[e.type]);say(s.name,e.line,'error','UNKNOWN_ENUM','Enum.'+e.type+' has no '+e.value+'.',n?{didYouMean:'Enum.'+e.type+'.'+n}:{values:API.enums[e.type].slice(0,40)});}
    }
    for(const c of f.calls){
      const first=literal(c.args[0]),second=literal(c.args[1]),on=c.on?.join('.');
      if(c.indexer===':'&&on!=='script'&&!API.methods.includes(c.name)&&!API.script.includes(c.name)&&!LUA_METHODS.has(c.name)&&!f.own.has(c.name)){
        const n=nearest(c.name,API.methods);say(s.name,c.line,'warning','UNKNOWN_METHOD',':'+c.name+'() is not a method of anything in the client API, nor defined in this script.',n?{didYouMean:':'+n+'()'}:{});}
      // A control asked for by name: one of the controls under a control that carries this script (GetChild looks one
      // level down, FindChild along a path; which control it is called on is not known here, so any level counts).
      if((c.name==='GetChild'||c.name==='FindChild')&&typeof first==='string'&&hosts.length){
        const wanted=first.split('/').at(-1),reach=hosts.some(h=>c.name==='FindChild'&&first.includes('/')?h.paths.has(first)||[...h.paths].some(p=>p.endsWith('/'+first)):h.names.has(wanted));
        const inTemplate=templates.length&&everyName.has(wanted);
        if(!reach&&!inTemplate){const all=[...new Set(hosts.flatMap(h=>[...h.names]))],n=nearest(wanted,all);
          say(s.name,c.line,'error','CONTROL_NOT_FOUND','No control named "'+first+'" stands under '+[...new Set(hosts.map(h=>'"'+h.host+'"'))].join(' or ')+', which carr'+(hosts.length>1?'y':'ies')+' this script: the call gives nil.',{...(n?{didYouMean:n}:{}),controls:all.slice(0,40)});}
      }
      if(on==='game'&&c.name==='ServerSignal'&&typeof first==='string'){sentUp.add(first);
        if(!signals.has(first)){const n=nearest(first,[...signals.keys()]);say(s.name,c.line,'error','SIGNAL_NOT_DEFINED','The save has no signal "'+first+'": nothing hears it. scene_add_signal defines it.',{...(n?{didYouMean:n}:{}),signals:[...signals.keys()]});}
        else if(!used.has(signals.get(first).listen))say(s.name,c.line,'warning','SIGNAL_NOT_HEARD','No graph of this save listens for "'+first+'" yet (.onSignal(\''+first+'\', ...)).');
      }
      if(on==='script'&&c.name==='RegisterServerSignalHandler'&&typeof first==='string'){heard.add(first);
        if(!signals.has(first)){const n=nearest(first,[...signals.keys()]);say(s.name,c.line,'error','SIGNAL_NOT_DEFINED','The save has no signal "'+first+'": the handler is never called. scene_add_signal defines it.',{...(n?{didYouMean:n}:{}),signals:[...signals.keys()]});}
        else if(!signals.get(first).toScripts)say(s.name,c.line,'error','SIGNAL_NOT_FOR_CLIENT_SCRIPTS','The signal "'+first+'" was defined before game 7.1 and has no node that sends it to client scripts: open the save in the editor and save it once, or define the signal anew.');
        else if(!used.has(signals.get(first).toScripts))say(s.name,c.line,'warning','SIGNAL_NOT_SENT','No graph of this save sends "'+first+'" to client scripts yet (f.sendSignal(\'client:'+first+'\', player)).');
      }
      if((c.name==='GetGlobalCustomVariableValue'||c.name==='RegisterCustomVariableChangedHandler'||c.name==='UnregisterCustomVariableChangedHandler')&&typeof second==='string'){
        const where=chain(c.args[0])?.join('.'),set=where==='Enum.CustomVariableEntityType.PlayerSelf'?playerVars:where==='Enum.CustomVariableEntityType.AvatarSelf'?avatarVars:null;
        if(set&&!set.has(second)){const n=nearest(second,[...set]),holder=where.endsWith('PlayerSelf')?'player':'character';
          say(s.name,c.line,'error','VARIABLE_NOT_FOUND','The '+holder+' template has no custom variable "'+second+'": the script reads nil and hears no change. scene_add_components {prefab: "'+holder+'", variables: [...]} adds it.',{...(n?{didYouMean:n}:{}),variables:[...set].slice(0,40)});}
      }
      if(on==='script'&&c.name==='GetParam'&&typeof first==='string'&&!declared.has(first)){const n=nearest(first,[...declared]);
        say(s.name,c.line,'error','SCRIPT_VARIABLE_NOT_FOUND','The script has no variable "'+first+'" (scene_set_client_script {variables}): GetParam gives nil.',{...(n?{didYouMean:n}:{}),variables:[...declared]});}
      if(on==='game'&&c.name==='InstantiateClientUIControl'&&typeof first==='number'&&!templateIds.has(first))
        say(s.name,c.line,'error','TEMPLATE_NOT_FOUND','The save has no client control template with the index '+first+'.',{templates});
      if(c.name==='SetImage'&&typeof second==='number'&&chain(c.args[0])?.join('.')==='Enum.ImageSource.StaticReference'&&!imageIdKnown(second))
        say(s.name,c.line,'error','IMAGE_NOT_FOUND','The picture library has no picture '+second+' (image_catalog shows the ids there are).');
      if(on==='game'&&c.name==='PlayAudio2D'&&typeof first==='number'&&!SOUNDS.has(first))
        say(s.name,c.line,'error','SOUND_NOT_FOUND','The sound catalogue has no sound '+first+' (sound_catalog lists them).');
    }
  }
  // What the graphs send to client scripts and no script hears.
  if(!only)for(const [name,ids] of signals)if(ids.toScripts&&used.has(ids.toScripts)&&!heard.has(name))
    say(null,null,'warning','SIGNAL_NOT_HEARD','A graph sends "'+name+'" to client scripts and no script registers a handler for it (script:RegisterServerSignalHandler("'+name+'", ...)).');
  // In the order of the scripts, and of the lines of each.
  const place=new Map(listed.map((x,i)=>[x.name,i]));problems.sort((a,b)=>(place.get(a.script)??1e9)-(place.get(b.script)??1e9)||(a.line??0)-(b.line??0));
  const errors=problems.filter(p=>p.severity==='error').length;
  return {mapPath,checked:listed.map(s=>s.name),ok:errors===0,errors,warnings:problems.length-errors,problems,
    note:problems.length?'Each problem names the script and the line. An error is something the game will not complain about and that will not work; a warning may be on purpose. Only names written as literals are checked.':'Every name the scripts write down was found. Names put together while a script runs are not checked, and neither is what the script does.'};
}
