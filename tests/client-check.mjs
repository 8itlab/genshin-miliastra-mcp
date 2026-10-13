// Offline check of scene_check_client: a script with one of each mistake on a save that has an interface, a template,
// a signal and player variables; every mistake is found with its line and the nearest name, and a clean script passes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {setClientScript,addClientUi,addClientTemplate,addSignal,addComponents,checkClientScripts} from '../src/scene-save.mjs';
import {luaSyntaxError} from '../src/client-check.mjs';
import {luaOf,judge} from '../src/playtest.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-check-'));
const blank=path.join(root,'tests','fixtures','editor-2026-10-13-handui.gil');
try{
  assert.equal(luaSyntaxError('function f()\n  local a = 7 // 2\n  return a & 3\nend\n'),null,'Lua 5.3 operators are syntax');
  assert.deepEqual([luaSyntaxError('function f(\n  print(1)\nend').line],[2]);
  assert.throws(()=>setClientScript({mapPath:blank,name:'bad',source:'function OnStart()\n  print("a"\nend\n'},workspace),e=>e.code==='LUA_SYNTAX'&&e.details.line===3);
  let map=addSignal({mapPath:blank,name:'pick'},workspace).mapPath;
  map=addComponents({mapPath:map,prefab:'player',variables:[{name:'lives',type:'integer',value:3}]},workspace).mapPath;
  const good=['local root = script.object','local PLAYER = Enum.CustomVariableEntityType.PlayerSelf','function OnStart()','  local bar = root:GetChild("bar")',
    '  local dot = root:FindChild("row/dot")','  print(game.GetGlobalCustomVariableValue(PLAYER, "lives"))','  script:RegisterCustomVariableChangedHandler(Enum.CustomVariableEntityType.PlayerSelf, "lives", function() end)',
    '  game.ServerSignal("pick"):SendSignal()','  script:RegisterServerSignalHandler("pick", function(name, params) end)','  bar:SetImage(Enum.ImageSource.StaticReference, 100001)',
    '  game.PlayAudio2D(50888)','  print(script:GetParam("speed"), ("x"):rep(3))','  local t = { Step = function(self) end }','  t:Step()','end',''].join('\n');
  const wrong=['local root = script.object','function OnStart()','  local bar = root:GetChild("bat")','  local dot = root:FindChild("row/dott")',
    '  print(game.GetGlobalCustomVariableValue(Enum.CustomVariableEntityType.PlayerSelf, "live"))','  game.ServerSignal("pik"):SendSignal()','  script:RegisterServerSignalHandler("nobody", function() end)',
    '  bar:SetImage(Enum.ImageSource.StaticReference, 7)','  game.PlayAudio2D(3)','  print(script:GetParam("sped"))','  game.PlayAudio(1)','  script:EnableUpdates(true)',
    '  print(Enum.Device.Keyboard, Enum.Devices.Mobile)','  bar:SetFillHorizontl(Enum.ImageFillHorizontalType.Left, 1)','  game.InstantiateClientUIControl(5, root)','  local deep = root:GetChild("dot")','end',''].join('\n');
  const made=setClientScript({mapPath:map,name:'ok',source:good,variables:[{name:'speed',type:'float',value:1}]},workspace);
  assert.equal(made.problems,undefined,'a clean script is given no problems: '+JSON.stringify(made.problems));
  const other=setClientScript({mapPath:made.mapPath,name:'off',source:wrong,variables:[{name:'speed',type:'float',value:1}]},workspace);
  // At this point only what needs no interface is said: the names of the API, the signals, the variables, the ids.
  assert.deepEqual(other.problems.map(p=>[p.line,p.kind]),[[5,'VARIABLE_NOT_FOUND'],[6,'SIGNAL_NOT_DEFINED'],[7,'SIGNAL_NOT_DEFINED'],[8,'IMAGE_NOT_FOUND'],[9,'SOUND_NOT_FOUND'],[10,'SCRIPT_VARIABLE_NOT_FOUND'],
    [11,'UNKNOWN_API'],[12,'UNKNOWN_API'],[13,'UNKNOWN_ENUM'],[13,'UNKNOWN_ENUM'],[14,'UNKNOWN_METHOD'],[15,'TEMPLATE_NOT_FOUND']].sort((a,b)=>a[0]-b[0]),JSON.stringify(other.problems.map(p=>[p.line,p.kind])));
  const said=k=>other.problems.find(p=>p.kind===k||p.line===k);
  assert.equal(said(5).didYouMean,'lives');assert.equal(said(6).didYouMean,'pick');assert.equal(said(10).didYouMean,'speed');assert.equal(said(11).didYouMean,'game.PlayAudio2D');
  assert.equal(said(12).didYouMean,'script:EnableUpdate');assert.equal(said(14).didYouMean,':SetFillHorizontal()');
  const controls=[{name:'bar',kind:'image'},{name:'row',kind:'container',children:[{name:'dot',kind:'image'}]}];
  const face=addClientUi({mapPath:other.mapPath,name:'one',script:'ok',controls},workspace);
  assert.equal(face.problems,undefined,JSON.stringify(face.problems));
  const face2=addClientUi({mapPath:face.mapPath,name:'two',script:'off',controls},workspace);
  // Now that controls carry the script, the two names it gets wrong are found, each with the one that was meant.
  assert.deepEqual(face2.problems.filter(p=>p.kind==='CONTROL_NOT_FOUND').map(p=>[p.line,p.didYouMean]),[[3,'bar'],[4,'dot']]);
  // A control further down is not found by GetChild on the control the script is on: said, with the path to use.
  assert.deepEqual(face2.problems.filter(p=>p.kind==='CONTROL_NOT_A_CHILD').map(p=>[p.line,p.didYouMean]),[[16,':FindChild("row/dot")']]);
  const all=checkClientScripts({mapPath:face2.mapPath});
  assert.deepEqual(all.checked,['ok','off']);assert.equal(all.ok,false);
  // The whole save: the signal the clean script sends is defined, and no graph listens for it yet (a warning).
  assert.deepEqual(all.problems.filter(p=>p.script==='ok').map(p=>[p.severity,p.kind]),[['warning','SIGNAL_NOT_HEARD'],['warning','SIGNAL_NOT_SENT']]);
  assert.equal(checkClientScripts({mapPath:face2.mapPath,scripts:['ok']}).errors,0);
  // A template's controls count for a script that makes copies of it, and a script nothing carries is pointed out.
  const lone=setClientScript({mapPath:face2.mapPath,name:'lone',source:'function OnStart()\n  print(1)\nend\n'},workspace);
  assert.ok(checkClientScripts({mapPath:lone.mapPath,scripts:['lone']}).problems.some(p=>p.kind==='SCRIPT_NOT_MOUNTED'));
  const card=addClientTemplate({mapPath:lone.mapPath,name:'card',script:'lone',children:[{name:'face',kind:'image'}]},workspace);
  assert.equal(checkClientScripts({mapPath:card.mapPath,scripts:['lone']}).problems.length,0);
  // require is part of this Lua (seen in play, 2026-10-13): the name is the file of another script, letter for letter.
  const usesModule=setClientScript({mapPath:lone.mapPath,name:'main2',source:'local util = require("lone")\nlocal other = require("Lone")\nfunction OnStart()\n  print(util)\nend\n',outputName:'req'},workspace);
  assert.deepEqual(usesModule.problems.map(p=>[p.line,p.kind,p.didYouMean]),[[2,'MODULE_NOT_FOUND','lone']]);
  assert.ok(!checkClientScripts({mapPath:usesModule.mapPath,scripts:['lone']}).problems.some(p=>p.kind==='SCRIPT_NOT_MOUNTED'),'a script that is required needs no control');
  for(const source of ['local f = load("return 1")\n','dofile("x.lua")\n','print(package.path)\n','local c = coroutine.create(print)\n'])
    assert.throws(()=>setClientScript({mapPath:blank,name:'no',source},workspace),e=>e.code==='LUA_NOT_AVAILABLE',source);
  setClientScript({mapPath:blank,name:'yes',source:'local t = {}\nfunction t.load(x) return x end\nprint(t.load(1), t:load())\n'},workspace);
  // The official sample sends a signal its save does not define: found.
  const dir=path.join(root,'knowledge','samples','gil'),official=path.join(dir,fs.readdirSync(dir).find(f=>f.startsWith('mh47p30a87qo_')));
  assert.deepEqual(checkClientScripts({mapPath:official}).problems.map(p=>[p.kind,p.line]),[['SIGNAL_NOT_DEFINED',99]]);
  // The short way of a playtest: two candidates that differ only in the text of their Lua have one key (the save that
  // is open is played again with the new files); another script, another variable or another control is another key.
  const v1=setClientScript({mapPath:face.mapPath,name:'ok',source:good.replace('"x"','"y"'),outputName:'v1'},workspace),v2=setClientScript({mapPath:face.mapPath,name:'ok',source:good,outputName:'v2'},workspace);
  const k0=luaOf(face.mapPath),k1=luaOf(v1.mapPath),k2=luaOf(v2.mapPath);
  assert.equal(k0.key,k1.key);assert.equal(k1.key,k2.key);assert.notEqual(k1.files[0].source,k2.files[0].source);assert.deepEqual(k1.files.map(x=>x.file),['ok.lua','off.lua']);
  assert.notEqual(luaOf(lone.mapPath).key,k0.key,'one script more is another level');
  assert.notEqual(luaOf(setClientScript({mapPath:face.mapPath,name:'ok',source:good,variables:[{name:'speed',type:'float',value:2}],outputName:'v3'},workspace).mapPath).key,k0.key,'another value of a variable is another level');
  assert.equal(luaOf(blank),null,'a save without scripts has no short way');
  // The values a script adds to a signal, against what the signal carries: they travel by place.
  const carrying=addSignal({mapPath:map,name:'score',parameters:[{name:'points',type:'integer'},{name:'label',type:'string'},{name:'at',type:'vector3'}]},workspace).mapPath;
  const sending=['function OnStart()','  local a = game.ServerSignal("score")','  a:AddInt(3)','  a:AddString("x")','  a:AddVector3({x=1,y=2,z=3})','  a:SendSignal()',
    '  local b = game.ServerSignal("score")','  b:AddString("x")','  b:AddInt(3)','  b:SendSignal()','  game.ServerSignal("score"):SendSignal()',
    '  local c = game.ServerSignal("pick")','  c:AddInt(1)','  c:SendSignal()','  game.ServerSignal("pick"):SendSignal()',
    '  local d = game.ServerSignal("score")','  d:AddParam(Enum.ParamType.Int, 3)','  d:SendSignal()','end',''].join('\n');
  const sent=setClientScript({mapPath:carrying,name:'sender',source:sending},workspace).problems.filter(p=>p.kind==='SIGNAL_PARAMETERS_DIFFER');
  assert.deepEqual(sent.map(p=>p.line),[10,11,14],JSON.stringify(sent));
  assert.equal(sent[0].expected,'local s = game.ServerSignal("score") s:AddInt(points) s:AddString(label) s:AddVector3(at) s:SendSignal()');
  assert.equal(sent[2].expected,'game.ServerSignal("pick"):SendSignal()');
  // What a run was expected to print: in order, with the first that is missing and what stood there instead.
  const printed=[{t:1,text:'A_READY'},{t:2,text:'A_GO 3'},{t:5,text:'x:13: attempt to index a nil value (local n)',clientScript:true},{t:9,text:'A_WIN'}];
  const verdict=judge({prints:['A_READY','A_WIN','A_GO'],absent:['A_LOSE']},printed,{state:'succeeded'});
  assert.equal(verdict.passed,false);assert.deepEqual(verdict.results.map(r=>r.met),[true,true,false,true,false]);
  assert.match(verdict.results[2].found,/before the one expected ahead of it/);assert.match(verdict.results[4].found,/attempt to index/);
  assert.equal(judge({prints:['A_READY','A_GO','A_WIN'],noScriptErrors:false},printed,{state:'succeeded'}).passed,true);
  assert.equal(judge({prints:['A_READY']},printed.slice(0,1),{state:'failed',error:'试玩校验失败'}).passed,false);
  console.log(JSON.stringify({ok:true}));
}finally{fs.rmSync(workspace,{recursive:true,force:true});}
