// Offline check of scene_add_progress_bar / scene_list_interface against the official progress-bar sample save: the three
// records this tool writes for a custom control (template, library copy, layout copy) are byte for byte the ones the
// editor saved, and adding a bar to another save registers it in the layout, the library and the root list and gives the
// player the variables the bar reads.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {container,fields} from '../src/scene/wire.mjs';
import {barRecord,addProgressBar,listInterface,listComponents,timerRecord,addGlobalTimer,listGlobalTimers,addTimerDisplay,addButton,addTextBox,addImage,cardSelectorRecords,addCardSelector} from '../src/scene-save.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dir=path.join(root,'knowledge','samples','gil'),workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-interface-'));
const pick=prefix=>path.join(dir,fs.readdirSync(dir).find(f=>f.startsWith(prefix)));
const official=pick('mhfbsz9agu62_制作我的第一个奇域组件_-_进度条'),other=pick('mhumsn9uap96_');
const number=(b,id)=>Number(fields(b).find(f=>f.id===id&&f.wire===0)?.value);
const records=file=>{const section=fields(container(fs.readFileSync(file))).find(f=>f.id===9).data;return {section,byId:new Map(fields(section).filter(f=>f.id===502).map(f=>[number(f.data,501),f.data]))};};
try{
  const saved=records(official).byId;
  // The official bar was dragged by hand: its first rectangle holds these exact single-precision values.
  const bits=hex=>{const b=Buffer.alloc(4);b.writeUInt32BE(hex);return b.readFloatBE(0);};
  const states=[{position:[bits(0x403fff41),337.5],size:[bits(0x43480028),bits(0x42480010)]},{position:[0,0],size:[200,50]},{position:[0,0],size:[200,8]},{position:[0,0],size:[200,8]}];
  const common={name:'进度条',slot:2,states,current:'当前进度',min:'最小值',max:'最大值'};
  assert.ok(barRecord({...common,id:1073741842,copies:[1073741841,1073741844]}).equals(saved.get(1073741842)),'the template record differs from the official one');
  assert.ok(barRecord({...common,id:1073741841,templateId:1073741842,parent:1073741837}).equals(saved.get(1073741841)),'the library copy differs from the official one');
  assert.ok(barRecord({...common,id:1073741844,templateId:1073741842,parent:1073741825}).equals(saved.get(1073741844)),'the layout copy differs from the official one');

  const before=fs.readFileSync(other),had=listInterface({mapPath:other}).layouts[0].controls.length;
  const made=addProgressBar({mapPath:other,name:'purse',variable:'coins',max:12,position:[-600,380],size:[240,40]},workspace);
  assert.deepEqual(made.playerVariables,['purse_min','purse_max','coins']);
  const listed=listInterface({mapPath:made.mapPath}).layouts[0].controls;
  assert.equal(listed.length,had+1);assert.deepEqual(listed.at(-1),{id:made.controlId,name:'purse',kind:'progressBar'});
  const after=records(made.mapPath),ids=b=>{const out=[];let p=0;while(p<b.length){let n=0,shift=0;for(;;){const v=b[p++];n+=(v&127)*2**shift;shift+=7;if(!(v&128))break;}out.push(n);}return out;};
  assert.equal(ids(fields(after.section).find(f=>f.id===501).data)[0],made.controlId-2,'the template is first in the root list');
  const library=[...after.byId.values()].find(r=>fields(r).some(f=>f.id===502&&f.wire===2&&number(f.data,502)===14));
  assert.deepEqual(ids(fields(library).find(f=>f.id===503).data).at(-1),made.controlId-1,'the library lists its copy');
  const variables=listComponents({mapPath:made.mapPath,prefab:'player'}).found;
  assert.ok(variables.every(p=>['coins','purse_min','purse_max','是否有钥匙'].every(n=>p.variables.some(v=>v.name===n))),'the template and every player slot hold the variables');
  const second=addProgressBar({mapPath:made.mapPath,name:'clock',variable:'coins',max:60},workspace);
  assert.equal(second.controlId,made.controlId+3);assert.deepEqual(second.playerVariables,['clock_min','clock_max']);
  assert.throws(()=>addProgressBar({mapPath:made.mapPath,name:'purse',variable:'coins',max:5},workspace),e=>e.code==='DUPLICATE_CONTROL_NAME');
  assert.throws(()=>addProgressBar({mapPath:other,name:'x',variable:'coins',min:5,max:5},workspace),e=>e.code==='INVALID_RANGE');
  assert.throws(()=>addProgressBar({mapPath:other,name:'x',variable:'是否有钥匙',max:5},workspace),e=>e.code==='INVALID_VARIABLE');
  // Global timers: the definitions of the official sample 全局计时器, and a clock control like 游戏时间 of 玩法流程.
  const timed=pick('mhujr59z1756_全局计时器.'),defs=fields(fields(container(fs.readFileSync(timed))).find(f=>f.id===12).data).filter(f=>f.id===1).map(f=>f.data);
  assert.ok(timerRecord({name:'倒计时',seconds:5,countdown:true,place:1}).equals(defs[0]),'the countdown definition differs from the official one');
  assert.ok(timerRecord({name:'闯关时间',seconds:5,countdown:false,place:2}).equals(defs[1]),'the stopwatch definition differs from the official one');
  assert.deepEqual(listGlobalTimers({mapPath:timed}).timers.map(t=>[t.name,t.countdown]),[['倒计时',true],['闯关时间',false],['真实时间',false]]);
  const farm=records(pick('mhqdyt95smtm_')).byId,clock={name:'游戏时间',slot:6,timer:'全局计时器1',states:[{position:[bits(0x41200028),330],size:[156,40]},{position:[0,0],size:[156,40]},{position:[0,0],size:[156,40]},{position:[0,0],size:[156,40]}]};
  assert.ok(barRecord({...clock,id:1073741855,copies:[1073741854,1073741856]}).equals(farm.get(1073741855)),'the timer template differs from the official one');
  assert.ok(barRecord({...clock,id:1073741854,templateId:1073741855,parent:1073741837}).equals(farm.get(1073741854)),'the timer library copy differs from the official one');
  assert.ok(barRecord({...clock,id:1073741856,templateId:1073741855,parent:1073741825}).equals(farm.get(1073741856)),'the timer layout copy differs from the official one');
  // An interaction button: the three records of 功能示例-2 添加积分按钮 in the official sample 界面控件, whose first two
  // rectangles were dragged by hand (their exact single-precision values are read from the record).
  const ui=records(pick('mhr6jorjp77a_')).byId,template=ui.get(1073741858);
  const floats=[];(function walk(b,depth){if(depth>12)return;let parts;try{parts=fields(b);}catch{return;}for(const f of parts){if(f.wire===5)floats.push(f.data.readFloatLE(0));else if(f.wire===2&&f.data.length)walk(f.data,depth+1);}})(fields(template).filter(f=>f.id===505).map(f=>f.data).find(b=>number(b,502)===12),0);
  // Each rectangle holds 1,1,1, .5,.5, .5,.5, [x,y], w,h, .5,.5: the first two have a position.
  const press={name:'功能示例-2 添加积分按钮',slot:3,button:true,states:[{position:[floats[7],floats[8]],size:[100,100]},{position:[floats[20],floats[21]],size:[100,100]},{position:[0,0],size:[100,100]},{position:[0,0],size:[100,100]}]};
  assert.ok(Math.abs(press.states[0].position[1]+180)<0.01&&Math.abs(press.states[1].position[0]-10)<0.01,'the positions were not read where expected: '+floats.slice(0,24).join(','));
  assert.ok(barRecord({...press,id:1073741858,copies:[1073741857,1073741861]}).equals(template),'the button template differs from the official one');
  assert.ok(barRecord({...press,id:1073741857,templateId:1073741858,parent:1073741837}).equals(ui.get(1073741857)),'the button library copy differs from the official one');
  assert.ok(barRecord({...press,id:1073741861,templateId:1073741858,parent:1073741825}).equals(ui.get(1073741861)),'the button layout copy differs from the official one');
  assert.deepEqual(listInterface({mapPath:pick('mhr6jorjp77a_')}).layouts[0].controls.filter(c=>c.kind==='button').map(c=>c.name),['功能示例-2 添加积分按钮']);
  const pressed=addButton({mapPath:second.mapPath,name:'jump',position:[500,-250],outputName:'with-button'},workspace);
  assert.deepEqual(listInterface({mapPath:pressed.mapPath}).layouts[0].controls.at(-1),{id:pressed.controlId,name:'jump',kind:'button'});
  assert.equal(pressed.controlId,second.controlId+3);
  assert.throws(()=>addButton({mapPath:pressed.mapPath,name:'jump'},workspace),e=>e.code==='DUPLICATE_CONTROL_NAME');
  const round=addGlobalTimer({mapPath:second.mapPath,name:'round',seconds:90},workspace);
  assert.deepEqual(listGlobalTimers({mapPath:round.mapPath}).timers,[{name:'round',seconds:90,countdown:true}]);
  assert.equal(round.heldBy.templates,1);assert.equal(round.heldBy.placed,9,'every player slot holds the timer');
  const shown=addTimerDisplay({mapPath:round.mapPath,name:'round_clock',timer:'round'},workspace);
  assert.deepEqual(listInterface({mapPath:shown.mapPath}).layouts[0].controls.at(-1),{id:shown.controlId,name:'round_clock',kind:'timer'});
  assert.equal(shown.controlId,second.controlId+3);
  const level=addGlobalTimer({mapPath:shown.mapPath,name:'day',seconds:60,holder:'关卡物件'},workspace);
  assert.equal(level.heldBy.placed,1);assert.deepEqual(listGlobalTimers({mapPath:level.mapPath}).timers.map(t=>t.name),['round','day']);
  assert.throws(()=>addTimerDisplay({mapPath:other,name:'x',timer:'nothing'},workspace),e=>e.code==='TIMER_NOT_FOUND');
  assert.throws(()=>addGlobalTimer({mapPath:round.mapPath,name:'round',seconds:5},workspace),e=>e.code==='DUPLICATE_TIMER_NAME');
  assert.ok(fs.readFileSync(other).equals(before),'the source save was changed');
  // The text box of the official sample 界面控件 (功能示例-1 积分值): the template and both copies, byte for byte. Its
  // rectangles were dragged by hand, so their numbers are read from the official record.
  {
    const uiSample=path.join(dir,fs.readdirSync(dir).find(f=>f.endsWith('_界面控件.gil'))),kept=records(uiSample).byId,template=kept.get(1073741842);
    const msg=(b,id)=>fields(b).find(f=>f.id===id&&f.wire===2)?.data,fl=(b,id)=>{const f=b&&fields(b).find(x=>x.id===id&&x.wire===5);return f?f.data.readFloatLE(0):0;};
    const rect=fields(template).filter(f=>f.id===505).map(f=>f.data).find(b=>number(b,502)===12),inner=msg(msg(msg(rect,503),13),12);
    const states=fields(inner).filter(f=>f.id===501).map(f=>{const body=msg(f.data,502);return {position:[fl(msg(body,504),501),fl(msg(body,504),502)],size:[fl(msg(body,505),501),fl(msg(body,505),502)]};});
    assert.equal(states.length,4);
    const common={name:'功能示例-1 积分值',slot:2,states,words:{text:'积分值：{1:ps.积分值}',fontSize:30}};
    assert.ok(barRecord({...common,id:1073741842,copies:[1073741841,1073741859]}).equals(template),'the text box template differs from the official one');
    for(const id of [1073741841,1073741859])assert.ok(barRecord({...common,id,templateId:1073741842,parent:number(kept.get(id),504)}).equals(kept.get(id)),'a copy of the text box differs from the official one: '+id);
    const said=addTextBox({mapPath:other,name:'keys',text:'钥匙：{1:ps.是否有钥匙}',position:[-600,330]},workspace);
    assert.deepEqual(listInterface({mapPath:said.mapPath}).layouts[0].controls.at(-1),{id:said.controlId,name:'keys',kind:'textBox'});
    assert.deepEqual(said.variables,[{where:'ps',name:'是否有钥匙'}]);
    assert.throws(()=>addTextBox({mapPath:other,name:'coins',text:'{1:ps.nothing}'},workspace),e=>e.code==='VARIABLE_NOT_FOUND');
  }
  // An image: its content is the one the image controls of the official sample 界面手柄适配 carry (126 of them), in
  // the three records of the other controls.
  {
    const pad=path.join(dir,fs.readdirSync(dir).find(f=>f.endsWith('_界面手柄适配.gil'))),msg=(b,id)=>fields(b).find(f=>f.id===id&&f.wire===2)?.data;
    const official=[...records(pad).byId.values()].map(r=>fields(r).filter(f=>f.id===505).map(f=>f.data).find(b=>number(b,502)===38)).filter(Boolean);
    assert.equal(official.length,126);
    const panel=addImage({mapPath:other,name:'panel',colour:'#000000',opacity:127/255,position:[-600,330],size:[300,120]},workspace);
    const icon=addImage({mapPath:panel.mapPath,name:'icon',image:107045,position:[-700,330],size:[60,60]},workspace);
    assert.deepEqual(listInterface({mapPath:icon.mapPath}).layouts[0].controls.slice(-2).map(c=>[c.name,c.kind]),[['panel','image'],['icon','image']]);
    const mine=id=>msg(msg(fields(records(icon.mapPath).byId.get(id)).filter(f=>f.id===505).map(f=>f.data).find(b=>number(b,502)===38),503),31);
    // The dark panel of the sample (picture 100001, colour 0x7f000000) and one of its icons (107045, white).
    const sameAs=(a,want)=>official.some(b=>{const inner=msg(msg(b,503),31);return number(inner,2)===want[0]&&number(inner,4)===want[1]&&inner.equals(a);});
    assert.ok(sameAs(mine(panel.controlId),[100001,0x7f000000]),'the panel is not written as the sample has it');
    assert.ok(sameAs(mine(icon.controlId),[107045,0xffffffff]),'the icon is not written as the sample has it');
    assert.equal(icon.known,true);assert.equal(icon.inLibrary,true);assert.equal(addImage({mapPath:other,name:'odd',image:199999},workspace).inLibrary,false);assert.equal(icon.shows,'a dark purple pentagon with rounded corners (a badge behind an icon)');
    const known=listInterface({mapPath:icon.mapPath}).knownImages;assert.equal(known.length,22);assert.equal(new Set(known.map(k=>k.id)).size,22);assert.ok(known.every(k=>k.shows));
    assert.throws(()=>addImage({mapPath:icon.mapPath,name:'icon'},workspace),e=>e.code==='DUPLICATE_CONTROL_NAME');
    assert.throws(()=>addImage({mapPath:other,name:'far',position:[900,0]},workspace),e=>e.code==='INVALID_RECT');
  }
  // Bars restyled by hand in the editor (2026-10-13): a red one that shows its value, a ring that says nothing, an
  // upright one that shows the ratio on blue. The tool writes the same content, byte for byte; an image switched off
  // at the start carries the same mark as one switched off by hand.
  {
    const fixtures=path.join(root,'tests','fixtures'),edited=records(path.join(fixtures,'editor-2026-10-13-handui-2.gil')).byId,msg=(b,id)=>fields(b).find(f=>f.id===id&&f.wire===2)?.data;
    const content=(rec,type,wrap)=>msg(msg(fields(rec).filter(f=>f.id===505).map(f=>f.data).find(b=>number(b,502)===type),503),wrap);
    const blank=path.join(fixtures,'editor-2026-10-13-handcfg.gil');
    const a=addProgressBar({mapPath:blank,name:'HU_bar_a',variable:'HU_a',max:10,shows:'value',colour:'#E03030'},workspace);
    const b=addProgressBar({mapPath:a.mapPath,name:'HU_bar_b',variable:'HU_b',max:10,shape:'ring',shows:'nothing'},workspace);
    const c=addProgressBar({mapPath:b.mapPath,name:'HU_bar_c',variable:'HU_c',max:10,shape:'vertical',shows:'ratio',backColour:'#2040C0'},workspace);
    const hid=addImage({mapPath:c.mapPath,name:'HU_image',image:105163,hidden:true},workspace),mine=records(hid.mapPath).byId;
    for(const [my,theirs,letter] of [[a.controlId,1073741847,'a'],[b.controlId,1073741850,'b'],[c.controlId,1073741853,'c']])
      assert.ok(content(mine.get(my),26,20).equals(content(edited.get(theirs),26,20)),'bar '+letter+' is not styled as the editor styled it: '+content(mine.get(my),26,20).toString('hex')+' / '+content(edited.get(theirs),26,20).toString('hex'));
    assert.ok(content(mine.get(hid.controlId),23,14).equals(content(edited.get(1073741856),23,14)),'the hidden image is not marked as the editor marks it');
    assert.ok(!content(mine.get(a.controlId),23,14).equals(content(mine.get(hid.controlId),23,14)));
    // A bar with no style asked for is still the bar of the official sample (checked above against the sample itself).
    assert.ok(!fields(content(records(addProgressBar({mapPath:blank,name:'plain',variable:'p',max:10},workspace).mapPath).byId.get(a.controlId),26,20)).some(f=>f.id>=509));
  }
  // The card selector: the four records of each of the two selectors of the official sample 卡牌选择器, byte for byte.
  {
    const cardSample=path.join(root,'knowledge','samples','gil',fs.readdirSync(path.join(root,'knowledge','samples','gil')).find(f=>f.startsWith('mhfpf0rhlaeu_')));
    const section9=fields(fields(container(fs.readFileSync(cardSample))).find(f=>f.id===9&&f.wire===2).data),B=1073741824;
    const theirs=id=>section9.filter(f=>f.id===502&&f.wire===2).find(r=>Number(fields(r.data).find(f=>f.id===501&&f.wire===0)?.value)===id).data;
    const three=cardSelectorRecords({templateId:B+22,panelTemplateId:B+23,libraryId:B+20,panelLibraryId:B+21,slot:4,library:B+13,name:'3选1',title:'请在以下3项中选择1项',seconds:30,
      cards:[{title:'单手剑',description:'选择后可获得单手剑',icon:91001,label:'装备单手剑'},{title:'长柄武器',description:'选择后可获得长柄武器',icon:91011,label:'装备长柄武器'},{title:'法器',description:'选择后可获得法器',icon:91016,label:'装备法器'}]});
    [B+22,B+23,B+20,B+21].forEach((id,i)=>assert.ok(three[i].equals(theirs(id)),'record '+i+' of the selector 3选1 differs from the official one'));
    const four=cardSelectorRecords({templateId:B+16,panelTemplateId:B+17,libraryId:B+14,panelLibraryId:B+15,slot:1,library:B+13,name:'4选2',title:'请在以下4项中选择2项',seconds:30,warnSeconds:10,closing:false,reveal:true,
      cards:[{title:'食物A',description:'选择后，吃下食物A，获得火护盾',icon:92001,label:'选择食物A'},{title:'食物B',description:'选择后，吃下食物B，获得水环环绕',icon:92002,label:'选择食物B'},{title:'食物C',description:'选择后，吃下食物C，获得风魔法',icon:92003,label:'选择食物C'},{unknown:true,label:'选择未知奖励'}]});
    [B+16,B+17,B+14,B+15].forEach((id,i)=>assert.ok(four[i].equals(theirs(id)),'record '+i+' of the selector 4选2 differs from the official one'));
    assert.deepEqual(listInterface({mapPath:cardSample}).cardSelectors,[{selectorId:B+16,name:'4选2'},{selectorId:B+22,name:'3选1'}]);
    // Added to a save: the template is in the root list, the copy among the library's children, and it is listed.
    const dealt=addCardSelector({mapPath:made.mapPath,name:'升级',title:'选一项升级',cards:[{title:'力量',description:'攻击 +10'},{title:'敏捷',description:'移速 +10%'},{unknown:true,label:'碰运气'}]},workspace);
    assert.deepEqual(listInterface({mapPath:dealt.mapPath}).cardSelectors,[{selectorId:dealt.selectorId,name:'升级'}]);
    assert.match(dealt.next,/invokeDeckSelector\(player, \d+n, 30, \[1n, 2n, 3n\], \[1n, 2n, 3n\], 1n, 1n, DecisionRefreshMode\.CannotRefresh/);
    const after9=fields(fields(container(fs.readFileSync(dealt.mapPath))).find(f=>f.id===9&&f.wire===2).data),ids=after9.filter(f=>f.id===502&&f.wire===2).map(r=>Number(fields(r.data).find(f=>f.id===501&&f.wire===0).value));
    assert.equal(new Set(ids).size,ids.length);assert.ok([0,1,2,3].every(k=>ids.includes(dealt.selectorId+k)));
    // The four switches of the window (each switched off by hand in the editor and the save read): 516 the time shown,
    // 518 the pause, 519 folding, 520 giving up.
    const windowOf=recs=>{const blk=fields(recs[1]).filter(f=>f.id===505&&f.wire===2).map(f=>fields(f.data)).find(l=>Number(l.find(x=>x.id===502&&x.wire===0)?.value)===30);
      return fields(fields(blk.find(x=>x.id===503).data).find(x=>x.id===23).data).filter(f=>f.wire===0).map(f=>f.id);};
    const base={templateId:B+1,panelTemplateId:B+2,libraryId:B+3,panelLibraryId:B+4,slot:1,library:B,name:'n',title:'t',cards:[{title:'a'}]};
    assert.deepEqual(windowOf(cardSelectorRecords(base)).filter(id=>id>=516),[516,518,519,520]);
    assert.deepEqual(windowOf(cardSelectorRecords({...base,closing:false,collapsible:false,pause:false,showTime:false})).filter(id=>id>=516),[]);
    assert.deepEqual(windowOf(cardSelectorRecords({...base,closing:false})).filter(id=>id>=516),[516,518,519]);
    assert.throws(()=>addCardSelector({mapPath:dealt.mapPath,name:'升级',cards:[{title:'a'}]},workspace),e=>e.code==='DUPLICATE_CONTROL_NAME');
    assert.throws(()=>addCardSelector({mapPath:dealt.mapPath,name:'空',cards:[{description:'no title'}]},workspace),e=>e.code==='INVALID_CARDS');
  }
  console.log(JSON.stringify({ok:true,controlId:made.controlId}));
}finally{fs.rmSync(workspace,{recursive:true,force:true});}
