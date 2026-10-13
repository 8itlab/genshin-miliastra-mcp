// Offline check of the complex-creature tools against the official sample 复杂造物, the only sample that has one.
// The skill record of its 丘丘霜铠王 (普通攻击) and the copy in section 16 are rebuilt byte for byte; so are the three
// property blocks that make a creature complex: the decision graph, the skill list, the autonomous-logic template.
// Then, through a real MCP connection on a copy of the sample: a new skill graph, a new skill, a new decision graph
// bound to the creature, and the three kinds of creature graph compiled from source and written into the save.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {container,fields} from '../src/scene/wire.mjs';
import {creatureSkillRecord,creatureSkillCopy,creatureDecisionBlock,creatureSkillsBlock,creatureLogicBlock,listCreatureSkills} from '../src/scene-save.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dir=path.join(root,'knowledge','samples','gil'),workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-creature-'));
const sample=path.join(dir,fs.readdirSync(dir).find(f=>f.endsWith('_复杂造物.gil')));
const number=(b,id)=>Number(fields(b).find(f=>f.id===id&&f.wire===0)?.value),msg=(b,id)=>fields(b).find(f=>f.id===id&&f.wire===2).data,float=(b,id)=>fields(b).find(f=>f.id===id&&f.wire===5).data.readFloatLE(0);
const section=(file,id)=>{const s=fields(container(fs.readFileSync(file))).find(f=>f.id===id&&f.wire===2);return s?fields(s.data).filter(f=>f.id===1&&f.wire===2).map(f=>f.data):[];};
const blocks=(record,fieldId)=>fields(record).filter(f=>f.id===fieldId&&f.wire===2).map(f=>f.data),block=(record,fieldId,kind)=>blocks(record,fieldId).find(b=>number(b,1)===kind);
const library=(file,kind)=>{const tab=fields(fields(container(fs.readFileSync(file))).find(f=>f.id===6).data).map(f=>f.data).find(t=>number(t,1)===kind);return tab?fields(msg(tab,3)).filter(f=>f.id===5).map(f=>number(f.data,2)):null;};
const client=new Client({name:'scene-creature-test',version:'1'});
try{
  // ---- the skill, byte for byte. The moments on its timeline are read from the official record so that the floats match.
  const official=section(sample,15).find(r=>number(r,2)===28),timeline=msg(msg(block(official,4,35),45),1),event=msg(timeline,6),state=msg(timeline,7);
  const spec={id:1191182338,name:'普通攻击',modelId:10006002,graphId:1082130435,animation:6002003,graphAtMs:float(event,4),effect:{asset:10001270,attachPoint:'GI_WeaponR',startMs:float(state,3),ms:float(state,4)}};
  assert.ok(Math.abs(spec.graphAtMs-993.65)<0.01&&Math.abs(spec.effect.ms-2088.76)<0.01);
  assert.ok(creatureSkillRecord(spec).equals(official),'the creature skill record differs from the official one');
  assert.ok(creatureSkillCopy(spec).equals(section(sample,16).find(r=>number(r,1)===1191182338)),'the copy in section 16 differs from the official one');
  assert.deepEqual(listCreatureSkills({mapPath:sample}).skills,[{skillId:1191182338,name:'普通攻击',creatureAssetId:30006002,creature:'丘丘霜铠王',graphId:1082130435,animations:[6002003],graphAtMs:993.65}]);
  assert.deepEqual(library(sample,61),[1191182338]);

  // ---- what makes a creature complex: the three property blocks of the two official creatures.
  const prefabs=section(sample,4),king=prefabs.find(p=>number(p,1)===1082130433),brute=prefabs.find(p=>number(p,1)===1082130434);
  assert.equal(number(king,2),30006002);assert.equal(number(brute,2),30007001);
  assert.ok(creatureDecisionBlock(1082130434).equals(block(king,6,80)),'the decision graph block differs');
  assert.ok(creatureSkillsBlock([1191182338],1).equals(block(king,6,81)),'the skill list block differs');
  assert.ok(creatureLogicBlock().equals(block(king,6,82)),'the autonomous logic block differs');
  assert.ok(creatureDecisionBlock(1082130437).equals(block(brute,6,80)));
  assert.ok(creatureSkillsBlock([],1).equals(block(brute,6,81)),'the empty skill list differs');
  assert.ok(creatureLogicBlock().equals(block(brute,6,82)));

  // ---- what the sample does not show, against records the editor wrote after the settings were made in it by hand:
  // a skill of several animations with its two switches, a cooldown, a logic template with every number changed.
  const edited=JSON.parse(fs.readFileSync(path.join(root,'tests','fixtures','creature-edited.json'),'utf8')),hex=b=>b.toString('hex');
  const sevenClips={id:1191182337,name:'BR_work',modelId:10006009,graphId:1082130440,animations:[6009001,6009004,6009005,6009007,6009008,6009006,6009009],faceTarget:true,interrupts:true};
  assert.equal(hex(creatureSkillRecord(sevenClips)),edited.skill,'a skill of seven animations differs from the one the editor saved');
  assert.equal(hex(creatureSkillCopy(sevenClips)),edited.copy);
  assert.equal(hex(creatureSkillsBlock([{id:1191182337,cooldown:[1.5,2.5],firstCooldown:[0.5,0.75]}],1)),edited.skills,'the cooldown differs from the one the editor saved');
  assert.equal(hex(creatureLogicBlock({noticeRadius:16,sightDistance:12,chainRadius:7,leaveCombatDistance:22,leaveCombatDelaySeconds:4,territoryRadius:33})),edited.logic,'the logic template differs from the one the editor saved');

  // ---- through the server, on a copy of the sample.
  await client.connect(new StdioClientTransport({command:process.execPath,args:[path.join(root,'src/server.mjs')],cwd:root,env:{...process.env,MILIASTRA_WORKSPACE:workspace},stderr:'pipe'}));
  const call=async(name,args)=>{const r=await client.callTool({name,arguments:args});return {error:r.isError?(r.structuredContent??JSON.parse(r.content[0].text)):null,...(r.structuredContent??{})};};
  const ok=async(name,args)=>{const r=await call(name,args);assert.ok(!r.error,name+' refused: '+JSON.stringify(r.error));return r;};
  let made=await ok('scene_add_graph',{mapPath:sample,name:'CcSwing',kind:'creatureSkill'});const swing=made.graphId;
  made=await ok('scene_add_graph',{mapPath:made.mapPath,name:'CcWork',kind:'creatureStatus'});const work=made.graphId;
  made=await ok('scene_add_graph',{mapPath:made.mapPath,name:'CcRest',kind:'creatureStatus'});const rest=made.graphId;
  made=await ok('scene_add_graph',{mapPath:made.mapPath,name:'CcMind',kind:'creatureDecision'});const mind=made.graphId;
  // A skill belongs to one creature: its animations are that model's.
  let refused=await call('scene_add_creature_skill',{mapPath:made.mapPath,name:'swing',creature:30006002,graphId:swing,animation:7001001});
  assert.equal(refused.error?.error?.code??refused.error?.code,'INVALID_ANIMATION');
  refused=await call('scene_add_creature_skill',{mapPath:made.mapPath,name:'swing',creature:30003004,graphId:swing,animation:3004001});
  assert.equal(refused.error?.error?.code??refused.error?.code,'NOT_A_COMPLEX_CREATURE');
  refused=await call('scene_add_creature_skill',{mapPath:made.mapPath,name:'swing',creature:30006002,graphId:mind,animation:6002001});
  assert.equal(refused.error?.error?.code??refused.error?.code,'NOT_A_CREATURE_SKILL_GRAPH');
  refused=await call('scene_add_creature_skill',{mapPath:made.mapPath,name:'swing',creature:30006002,graphId:swing});
  assert.equal(refused.error?.error?.code??refused.error?.code,'INVALID_ANIMATION');
  // A creature whose animations were read from the editor takes them by name, and refuses an id it does not have.
  refused=await call('scene_add_creature_skill',{mapPath:made.mapPath,name:'dig',creature:30006009,graphId:swing,animation:'跳舞'});
  assert.equal(refused.error?.error?.code??refused.error?.code,'INVALID_ANIMATION');
  const dig=await ok('scene_add_creature_skill',{mapPath:made.mapPath,name:'dig',creature:30006009,graphId:swing,animations:['挖矿01','盗宝团·斥候_挖矿01_循环'],faceTarget:true});
  assert.deepEqual(dig.animations.map(a=>[a.id,a.name]),[[6009007,'挖矿01'],[6009008,'挖矿01_循环']]);
  assert.deepEqual((await ok('scene_list_creature_skills',{mapPath:dig.mapPath})).skills.find(s=>s.name==='dig'),{skillId:1191182339,name:'dig',creatureAssetId:30006009,creature:'盗宝团·斥候',graphId:swing,animations:[6009007,6009008],graphAtMs:1,faceTarget:true});
  const listed=await ok('creature_animations',{creature:30006009,query:'攻击'});
  assert.deepEqual(listed.animations.map(a=>a.id),[6009004,6009005]);
  // What was seen in play comes with the list: what the creature has in its hands, and the moment of an attack that counts.
  assert.match(listed.inItsHands,/thrown knife/);assert.match(listed.hands,/empty hands/);
  assert.equal(listed.animations[1].atMs,2050);assert.match(listed.animations[1].what,/10006069/);
  // The skill tool says so when the graph runs far from that moment, and repeats the effect it was given.
  const thrown=await ok('scene_add_creature_skill',{mapPath:made.mapPath,name:'throw',creature:30006009,graphId:swing,animation:'远程攻击_01',animationPortion:0.62,effect:{asset:10006069,attachPoint:'GI_WeaponR',ms:2000}});
  assert.match(thrown.hint,/2050 ms/);assert.equal(thrown.animationPortion,0.62);assert.deepEqual(thrown.effect,{asset:10006069,attachPoint:'GI_WeaponR',ms:2000});
  assert.equal((await ok('scene_add_creature_skill',{mapPath:made.mapPath,name:'throw2',creature:30006009,graphId:swing,animation:'远程攻击_01',graphAtMs:2050})).hint,undefined);
  assert.ok((await ok('creature_animations',{query:'挖矿'})).creatures.some(c=>c.creature===30006009));
  // Several moments in one skill: the graph runs at each (the three strokes of a triple stroke), and the list reads them back.
  const triple=await ok('scene_add_creature_skill',{mapPath:made.mapPath,name:'triple',creature:30007001,graphId:swing,animation:'单手武器_三连击',graphAtMs:[350,900,1700]});
  assert.deepEqual(triple.graphAtMs,[350,900,1700]);
  assert.deepEqual((await ok('scene_list_creature_skills',{mapPath:triple.mapPath})).skills.find(s=>s.name==='triple').graphAtMs,[350,900,1700]);
  // Where a stroke leaves the creature was looked at too: a stroke that carries it forward, a hop that takes it back.
  assert.match((await ok('creature_animations',{creature:30007001,query:'闪避'})).animations[0].what,/backwards/);
  assert.match((await ok('creature_animations',{creature:30007001,query:'攻击'})).animations.find(a=>a.id===7001002).what,/1\.3 m/);
  // A list that stops at the last id tried says so, and an id after it is taken; an id inside it that is missing is not.
  assert.ok((await ok('creature_animations',{creature:30008001})).mayHaveMore);
  refused=await call('scene_add_creature_skill',{mapPath:made.mapPath,name:'far',creature:30006009,graphId:swing,animation:6009021});
  assert.equal(refused.error?.error?.code??refused.error?.code,'INVALID_ANIMATION');
  refused=await call('creature_animations',{creature:30006013});
  assert.equal(refused.error?.error?.code??refused.error?.code,'NO_ANIMATION_LIST');
  const skill=await ok('scene_add_creature_skill',{mapPath:made.mapPath,name:'swing',creature:30006002,graphId:swing,animation:6002003,graphAtMs:900});
  assert.equal(skill.skillId,1191182339);assert.equal(skill.creature,'丘丘霜铠王');
  assert.deepEqual(library(skill.mapPath,61),[1191182338,1191182339]);
  assert.deepEqual((await ok('scene_list_creature_skills',{mapPath:skill.mapPath})).skills.map(s=>[s.skillId,s.name,s.graphId]),[[1191182338,'普通攻击',1082130435],[1191182339,'swing',swing]]);
  assert.equal(section(skill.mapPath,16).filter(r=>number(r,1)===1191182339).length,1);
  // The creature gets the new decision graph and both skills, in the order given.
  refused=await call('scene_set_creature_logic',{mapPath:skill.mapPath,prefab:'打手丘丘人',decisionGraphId:mind,skills:[{skill:'swing'}]});
  assert.equal(refused.error?.error?.code??refused.error?.code,'SKILL_OF_ANOTHER_CREATURE');
  refused=await call('scene_set_creature_logic',{mapPath:skill.mapPath,prefab:'丘丘霜铠王',decisionGraphId:work});
  assert.equal(refused.error?.error?.code??refused.error?.code,'NOT_A_DECISION_GRAPH');
  const bound=await ok('scene_set_creature_logic',{mapPath:skill.mapPath,prefab:'丘丘霜铠王',decisionGraphId:mind,skills:[{skill:'swing'},{skill:1191182338}],sharedCooldownSeconds:0.5});
  // (The sample has no copy of this creature placed in its scene, only the prefab.)
  assert.equal(bound.templates,1);assert.equal(bound.placed,0);
  assert.deepEqual(bound.skills,[{number:1,skillId:1191182339,name:'swing',cooldownSeconds:[0,3]},{number:2,skillId:1191182338,name:'普通攻击',cooldownSeconds:[0,3]}]);
  const after=section(bound.mapPath,4).find(p=>number(p,1)===1082130433);
  assert.ok(creatureDecisionBlock(mind).equals(block(after,6,80)));
  assert.ok(creatureSkillsBlock([1191182339,1191182338],0.5).equals(block(after,6,81)));
  assert.ok(block(after,6,82).equals(block(king,6,82)),'the creature keeps its logic template');
  assert.deepEqual(blocks(after,6).map(b=>number(b,1)),blocks(king,6).map(b=>number(b,1)),'the property blocks keep their order');
  // Cooldowns and a logic template of its own: the creature notices enemies 14 m around it and lets go at 20 m.
  const tuned=await ok('scene_set_creature_logic',{mapPath:skill.mapPath,prefab:'丘丘霜铠王',decisionGraphId:mind,skills:[{skill:'swing',cooldownSeconds:2,firstCooldownSeconds:[0,1]}],logic:{noticeRadius:14}});
  assert.deepEqual(tuned.skills,[{number:1,skillId:1191182339,name:'swing',cooldownSeconds:[2,2],firstCooldownSeconds:[0,1]}]);
  assert.equal(tuned.logic.leaveCombatDistance,20);
  const tunedKing=section(tuned.mapPath,4).find(p=>number(p,1)===1082130433);
  assert.ok(creatureSkillsBlock([{id:1191182339,cooldown:[2,2],firstCooldown:[0,1]}],1).equals(block(tunedKing,6,81)));
  assert.ok(creatureLogicBlock({noticeRadius:14,leaveCombatDistance:20}).equals(block(tunedKing,6,82)));
  refused=await call('scene_set_creature_logic',{mapPath:skill.mapPath,prefab:'丘丘霜铠王',decisionGraphId:mind,logic:{noticeRadius:14,leaveCombatDistance:8}});
  assert.equal(refused.error?.error?.code??refused.error?.code,'INVALID_LOGIC');
  // The other creature was left alone. Given the graph too, its placed copy changes with its prefab.
  assert.ok(block(section(bound.mapPath,4).find(p=>number(p,1)===1082130434),6,80).equals(block(brute,6,80)));
  const both=await ok('scene_set_creature_logic',{mapPath:bound.mapPath,prefab:'打手丘丘人',decisionGraphId:mind});
  assert.equal(both.templates,1);assert.equal(both.placed,1);
  const placed=section(both.mapPath,5).find(e=>number(e,1)===1082130441);
  assert.ok(creatureDecisionBlock(mind).equals(block(placed,5,80)));
  assert.ok(creatureSkillsBlock([],1).equals(block(placed,5,81)));

  // ---- the three kinds of creature graph compile from source and are written into the save in one call.
  const head="/// <reference types=\"genshin-ts\" />\nimport { g } from 'genshin-ts/runtime/core'\nimport { TacticSpeed, TargetEntity } from 'genshin-ts/definitions/client_enums'\n";
  const written=await ok('write_graphs',{mapPath:both.mapPath,graphs:[
    {graphId:swing,code:head+`g.creationSkill({id:${swing},name:'_GSTS_CcSwing',prefix:false}).on('start',(evt,f)=>{f.notifyServerNodeGraph('swing','','');})`},
    {graphId:work,code:head+`g.creationStatus({id:${work},name:'_GSTS_CcWork',prefix:false}).on('start1',(evt,f)=>{
  f.tacticMoveToTheTargetPosition(f.getCustomVariable(TargetEntity.StageEntity,'night').asType('bool'),[10,0,0],1.5,TacticSpeed.Walk,360,'go',false);
  f.executeSkill(true,1n);
})`},
    {graphId:rest,code:head+`g.creationStatus({id:${rest},name:'_GSTS_CcRest',prefix:false}).on('start1',(evt,f)=>{
  f.tacticGroundIdleRoaming(true,TacticSpeed.Walk,4,2,5,1,3,'stroll',false);
  f.tacticStandStill(true,'idle',false);
})`},
    {graphId:mind,code:head+`g.creationStatusDecision({id:${mind},name:'_GSTS_CcMind',prefix:false}).on('start1',(evt,f)=>{
  // A creature graph reads variables of three things only, named by a literal: itself, its aggro target, the stage.
  if(f.getCustomVariable(TargetEntity.Self,'duty').asType('int')===1n){f.switchToSelfExecutionStatus(true,${work},1n);}
  else{f.switchToSelfExecutionStatus(true,${rest},1n);}
})`}]});
  assert.deepEqual(written.written.map(w=>w.graphId),[swing,work,rest,mind],'a creature graph did not compile: '+JSON.stringify(written.failed??null).slice(0,1500));
  console.log(JSON.stringify({ok:true,skillId:skill.skillId,graphs:written.written.map(w=>[w.graphId,w.nodeCount])}));
}finally{await client.close().catch(()=>{});fs.rmSync(workspace,{recursive:true,force:true});}
