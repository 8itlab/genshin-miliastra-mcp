// The playtest probe: what a scripted playtest needs to know where the player is and to be where it wants to be.
// A script presses keys by the clock; a walk of so many seconds ends a metre off, and the level's own clock starts a
// few seconds before the play does (a different few every run). The probe is three graphs and one skill added to a
// copy of the candidate, never to the creator's save:
//   PT_key    a client skill graph on skill slot 4 that tells the server "PT_key". On a PC that slot is the Z key
//             (the guide says T; the button in play is labelled Z, 2026-10-12)
//   PT_hero   on the character template. The one press is the runner's own, a second into the play: its print gives
//             the level-clock time of a known play second, so every print can be dated in play seconds. It starts the
//             timer that prints the character's position. Every press (the runner presses again each half minute)
//             starts a timer whose sequence holds the teleports of the script up to the next press and, half a second
//             after each, a look at where the player then is (PT_AT). The teleports used to be one press each: a press
//             that was lost (the character down, a screen open) moved every later teleport to the place before its
//             own (seen in a blind test, 2026-10-13). A place in a timer sequence cannot be mistaken for another.
//   PT_stage  on the stage entity: hands the skill to the characters a second and a half into the level.
// The press counter is the player's custom variable PT_step, the place in the timer's sequence PT_tp, the second of the
// first press PT_t0 and the last half minute whose timer was started PT_turn. A level that has a skill of its own on
// slot 4 cannot be probed.
import {addGraph,addSkill,addComponents} from './scene-save.mjs';
import {fail} from './adapter.mjs';

const HEAD=`/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
import { CharacterSkillSlot, TopOfStackSkillDestructionType } from 'genshin-ts/definitions/enum'
`;
const num=v=>Number(v).toFixed(3).replace(/\.?0+$/,'')||'0';
// Seconds between a teleport and the look at where the player is, and the least time between two teleports.
export const ARRIVAL_AFTER=0.5,TELEPORT_GAP=1,TELEPORT_MOST=200;
// A timer of the platform runs slow: a moment set at 50 s came at 52 (fifty-two teleports measured at 60 frames a
// second, 2026-10-13: 1.046 to 1.055 times the time asked for). The moments of the probe are set that much earlier.
export const TIMER_RUNS_SLOW=1.045;
export function probeSources({keyId,heroId,stageId,skillId,trackEverySeconds,teleports,trackOn='hero',syncAt=1,syncs=[syncAt],slow=TIMER_RUNS_SLOW}){
  const str=v=>`f.dataTypeConversion(${v},'str')`;
  // (No bare blocks: the compiler takes a block only as the body of something.)
  const where=(who,v='at')=>`const ${v}=f.split3dVector(f.getEntityLocationAndRotation(${who}).location);f.printString('PT_POS');f.printString(${str(v+'.xComponent')});f.printString(${str(v+'.yComponent')});f.printString(${str(v+'.zComponent')});`;
  // The sequence of the timer: every teleport at its second after the sync press, each followed by the look.
  const jumps=teleports.map((t,i)=>`  if(n===${2*i}n){f.teleportPlayer(player,[${t.position.map(num).join(',')}],[0,${num(t.yaw??0)},0]);return;}`).join('\n');
  // The runner presses the key of the probe at second 1 and every half minute after (syncs). Each press starts the
  // timer of the teleports that fall before the next press, PT_TP0, PT_TP1, ...: counted from a press that close, a
  // timer cannot drift far, and no timer holds more than the hundred moments a sequence may have (with 102 the graph
  // did not compile, as a blind test found out). A teleport within a second and a half after a press stays with the
  // timer before it (a press is heard a moment late, and the teleport would come late with it). A place of a sequence is known by its number (they count from 0), so nothing is counted by hand.
  const windowOf=t=>{let k=0;for(let i=1;i<syncs.length;i++)if(t.at-syncs[i]>=1.5)k=i;return k;};
  const timers=syncs.map((start,k)=>{const mine=teleports.map((t,i)=>({t,i})).filter(x=>windowOf(x.t)===k);
    return {k,first:mine.length?mine[0].i:0,count:mine.length,sequence:mine.flatMap(x=>[num((x.t.at-start)/slow),num((x.t.at-start+ARRIVAL_AFTER)/slow)]).join(',')};}).filter(w=>w.count);
  const tracked=trackOn==='hero'&&trackEverySeconds,every=syncs.length>1?syncs[1]-syncs[0]:30;
  const key=HEAD+`g.characterSkill({id:${keyId},name:'_GSTS_PT_key',prefix:false})
.on('start',(evt,f)=>{
  f.notifyServerNodeGraph('PT_key','','');
})
`;
  const hero=HEAD+`g.server({id:${heroId},name:'_GSTS_PT_hero'})
.on('whenSkillNodeIsCalled',(evt,f)=>{
  if(evt.parameter1!=='PT_key')return;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.callerEntity as any);
  const step=f.getCustomVariable(player,'PT_step').asType('int');
  f.setCustomVariable(player,'PT_step',step+1n,true);
  f.printString('PT_KEY');f.printString(${str('step')});
${timers.length?`  // Which press this is, by the clock of the world and not by counting: a press that was lost (the character was in the
  // middle of another skill) must not make the next one start the timer of the one before. The runner presses twice,
  // 0.7 s apart; the second of a pair finds its turn already taken.
  const now=f.queryTimestampUtc0();
  if(step===0n)f.setCustomVariable(player,'PT_t0',now,true);
  const turn=(now-f.getCustomVariable(player,'PT_t0').asType('int')+10n)/${Math.round(every)}n;
  if(turn>f.getCustomVariable(player,'PT_turn').asType('int')){
    f.setCustomVariable(player,'PT_turn',turn,true);
${timers.map(w=>`    if(turn===${w.k}n)f.startTimer(evt.callerEntity,'PT_TP${w.k}',false,[${w.sequence}]);`).join('\n')}
  }
`:''}  if(step!==0n)return;
${tracked?`  f.startTimer(evt.callerEntity,'PT_TRACK',true,[${num(trackEverySeconds)}]);\n  ${where('evt.callerEntity')}\n`:''}})
${tracked||teleports.length?`.on('whenTimerIsTriggered',(evt,f)=>{
${tracked?`  if(evt.timerName==='PT_TRACK'){${where('evt.eventSourceEntity')}return;}\n`:''}${teleports.length?`  if(${timers.map(w=>`evt.timerName!=='PT_TP${w.k}'`).join('&&')})return;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.eventSourceEntity as any);
${timers.map(w=>`  if(evt.timerName==='PT_TP${w.k}')f.setCustomVariable(player,'PT_tp',evt.timerSequenceId+${2*w.first}n,true);`).join('\n')}
  const n=f.getCustomVariable(player,'PT_tp').asType('int');
  f.printString('PT_TP');f.printString(${str('n')});f.printString(${str('evt.timerSequenceId')});
${jumps}
  const now=f.split3dVector(f.getEntityLocationAndRotation(evt.eventSourceEntity).location);
  f.printString('PT_AT');f.printString(${str('now.xComponent')});f.printString(${str('now.yComponent')});f.printString(${str('now.zComponent')});
`:''}})
`:''}`;
  const stage=HEAD+`g.server({id:${stageId},name:'_GSTS_PT_stage'})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'PT_GIVE',false,[1.5]);
${trackOn==='stage'&&trackEverySeconds?`  f.startTimer(evt.eventSourceEntity,'PT_TRACK',true,[${num(trackEverySeconds)}]);\n`:''}})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='PT_GIVE'&&evt.timerName!=='PT_TRACK')return;
  const players=f.getListOfPlayerEntitiesOnTheField();
  // Nobody there yet (the level runs before the player has loaded): try again in two seconds.
  if(evt.timerName==='PT_GIVE'&&players.length===0){f.startTimer(evt.eventSourceEntity,'PT_GIVE',false,[2]);return;}
  if(evt.timerName==='PT_GIVE'){f.printString('PT_GIVE');f.printString(f.dataTypeConversion(players.length,'str'));}
  for(const player of players){
    for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(player)){
      if(evt.timerName==='PT_GIVE'){f.addCharacterSkill(hero as any,${skillId},CharacterSkillSlot.Skill4T,TopOfStackSkillDestructionType.Destroy);}
      else{${where('hero')}}
    }
  }
})
`;
  return {key,hero,stage};
}
// Adds the probe to a copy of the save and returns the copy with the names of the graphs whose prints the log needs.
export async function addPlaytestProbe({mapPath,trackEverySeconds,teleports=[],syncAt=1,syncs=[syncAt]},service){
  const workspace=service.workspace,trackOn=process.env.MILIASTRA_PROBE_TRACK_ON==='stage'?'stage':'hero';
  let at;
  try{at=addComponents({mapPath,prefab:'player',variables:[{name:'PT_step',type:'integer',value:0},{name:'PT_tp',type:'integer',value:0},{name:'PT_t0',type:'integer',value:0},{name:'PT_turn',type:'integer',value:-1}],outputName:'probe-var'},workspace).mapPath;}
  catch(e){fail('PROBE_NOT_ADDED','The probe keeps its step counter in a custom variable of the player template, and this save would not take one.',{cause:e.code,message:e.message});}
  let key,skill,hero,stage;
  try{
    key=addGraph({mapPath:at,name:'PT_key',kind:'characterSkill',outputName:'probe-key'},workspace);
    skill=addSkill({mapPath:key.mapPath,name:'PT_key',graphId:key.graphId,type:'instant',outputName:'probe-skill'},workspace);
    hero=addGraph({mapPath:skill.mapPath,name:'PT_hero',attachToPrefab:'character',outputName:'probe-hero'},workspace);
    stage=addGraph({mapPath:hero.mapPath,name:'PT_stage',outputName:'probe-stage'},workspace);
  }catch(e){
    if(e.code==='DUPLICATE_GRAPH_NAME'||e.code==='DUPLICATE_SKILL_NAME')fail('ALREADY_PROBED','This save already carries a playtest probe (it is a copy made by an earlier playtest_start with trackPlayer or teleports). Give the save the probe was added to, not the copy.',{mapPath});
    throw e;
  }
  const sources=probeSources({keyId:key.graphId,heroId:hero.graphId,stageId:stage.graphId,skillId:skill.skillId,trackEverySeconds,teleports,trackOn,syncAt,syncs});
  const graphs=[{graphId:key.graphId,code:sources.key},{graphId:hero.graphId,code:sources.hero},{graphId:stage.graphId,code:sources.stage}];
  const gias=await service.compileTogether(graphs);
  if(!gias)fail('PROBE_NOT_COMPILED','The graphs of the playtest probe did not compile. This is a fault of the tool, not of the level.',{sources});
  const all=service.writeTogether({projectId:'probe'+Date.now().toString(36),mapPath:stage.mapPath,graphs,gias});
  if(all.failed)fail('PROBE_NOT_WRITTEN','A graph of the playtest probe could not be written into the copy.',all.failed);
  return {mapPath:all.mapPath,graphNames:['_GSTS_PT_hero','_GSTS_PT_stage'],graphIds:{key:key.graphId,hero:hero.graphId,stage:stage.graphId},skillId:skill.skillId};
}
// What the probe printed, read out of the prints of a run: the level-clock second at which the play began, the path of
// the player in play seconds, and the prints that were not the probe's.
export function readProbe(prints){
  const isNumber=s=>/^-?\d+(\.\d+)?(e-?\d+)?$/i.test(String(s).trim());
  const own=new Set(),keys=[],track=[],fired=[],looks=[];let given=null;
  for(let i=0;i<prints.length;i++){
    const p=prints[i];
    if(p.text==='PT_KEY'&&prints[i+1]&&prints[i+1].graphId===p.graphId&&isNumber(prints[i+1].text)){keys.push({t:p.t,step:Number(prints[i+1].text)});own.add(i).add(i+1);i+=1;}
    else if(p.text==='PT_GIVE'&&prints[i+1]&&prints[i+1].graphId===p.graphId&&isNumber(prints[i+1].text)){given={t:p.t,players:Number(prints[i+1].text)};own.add(i).add(i+1);i+=1;}
    else if(p.text==='PT_TP'&&[1,2].every(k=>prints[i+k]&&prints[i+k].graphId===p.graphId&&isNumber(prints[i+k].text))){fired.push({t:p.t,n:Number(prints[i+1].text),sequenceId:Number(prints[i+2].text)});[0,1,2].forEach(k=>own.add(i+k));i+=2;}
    else if(p.text==='PT_AT'&&[1,2,3].every(k=>prints[i+k]&&prints[i+k].graphId===p.graphId&&isNumber(prints[i+k].text))){looks.push({t:p.t,n:fired.at(-1)?.n,at:[1,2,3].map(k=>Math.round(Number(prints[i+k].text)*100)/100)});[0,1,2,3].forEach(k=>own.add(i+k));i+=3;}
    else if(p.text==='PT_POS'&&[1,2,3].every(k=>prints[i+k]&&prints[i+k].graphId===p.graphId&&isNumber(prints[i+k].text))){track.push({t:p.t,at:[1,2,3].map(k=>Math.round(Number(prints[i+k].text)*100)/100)});[0,1,2,3].forEach(k=>own.add(i+k));i+=3;}
  }
  // Teleport i is place 2i of the sequence and the look after it place 2i + 1.
  const teleports=fired.filter(x=>x.n%2===0).map(x=>({index:x.n/2,t:x.t,at:looks.find(l=>l.n===x.n+1)?.at}));
  return {keys,track,given,teleports,fired,rest:prints.filter((_,i)=>!own.has(i))};
}
