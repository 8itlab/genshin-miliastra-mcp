import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn,spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {ROOT} from './core.mjs';
import {fail} from './adapter.mjs';
import {inspectDebugLog} from './debug-log.mjs';
import {readProbe} from './playtest-probe.mjs';
import {createHash} from 'node:crypto';
import {container,fields,field,replace} from './scene/wire.mjs';
import {checkClientScripts} from './scene-save.mjs';

// One desktop, one playtest. The runner drives the official UI, so a second
// run would fight the first one for the mouse and keyboard.
const readStatus=dir=>{try{return JSON.parse(fs.readFileSync(path.join(dir,'status.json'),'utf8'));}catch{return null;}};
const runRoot=workspace=>path.join(workspace,'playtests');
function activeRun(workspace){
  const root=runRoot(workspace);if(!fs.existsSync(root))return null;
  for(const id of fs.readdirSync(root)){
    const status=readStatus(path.join(root,id));
    // A runner that died without writing a final state stops updating; treat it as gone after two minutes.
    if(status?.state==='running'&&Date.now()/1000-status.updatedAt<120)return id;
  }
  return null;
}
// The game has one window and one mouse: a run of another workspace (a second AI client on the same computer) uses them
// too. Every run leaves a note of itself in the temporary folder; a run that finds a live one of another workspace is
// refused with who it is and how long it has been going, instead of the two clicking into each other (seen in a blind
// test, 2026-10-13: a scene would have been imported into the save the other had just opened).
const deskNote=()=>process.env.MILIASTRA_DESKTOP_NOTE||path.join(os.tmpdir(),'miliastra-desktop.json');
export function otherDesktopRun(workspace,now=Date.now()){
  let note;try{note=JSON.parse(fs.readFileSync(deskNote(),'utf8'));}catch{return null;}
  if(!note?.runDir||path.resolve(note.workspace||'')===path.resolve(workspace))return null;
  const status=readStatus(note.runDir),age=Math.round((now-note.startedAt)/1000);
  // Not yet written its first status (the first seconds), or running and heard from in the last two minutes.
  const alive=status?status.state==='running'&&now/1000-status.updatedAt<120:age<30;
  return alive?{workspace:note.workspace,runId:path.basename(note.runDir),startedSecondsAgo:age,expectedSeconds:note.expectedSeconds}:null;
}
// The Lua of a save, apart from the rest of it. The editor keeps each client script as a file beside the save
// (external_lua_file\<file>), and that file is what the game runs: a candidate that differs from the save that is
// open only in the text of its scripts needs no import, the files are written and the play starts (luaLive). key is
// the digest of the candidate with the text of every script taken out: two candidates with the same key are the same
// level with other Lua.
export function luaOf(mapPath){
  try{
    const root=container(fs.readFileSync(mapPath)),section=fields(root).find(f=>f.id===50&&f.wire===2);
    if(!section)return null;
    const files=[],kept=fields(section.data).map(f=>{
      if(!(f.id===1&&f.wire===2))return f.raw;
      const parts=fields(f.data),text=id=>parts.find(x=>x.id===id&&x.wire===2)?.data.toString('utf8')??'';
      files.push({name:text(2),file:text(3),source:text(5)});
      return field(1,2,Buffer.concat(parts.map(x=>x.id===5&&x.wire===2?field(5,2,Buffer.alloc(0)):x.raw)));});
    if(!files.length||files.some(x=>!/^[A-Za-z0-9_-]{1,60}\.lua$/.test(x.file)))return null;
    return {files,key:createHash('sha256').update(replace(root,50,2,Buffer.concat(kept))).digest('hex')};
  }catch{return null;}
}
export function startPlaytest(args,workspace){
  if(process.platform!=='win32')fail('UNSUPPORTED_PLATFORM','Playtest automation requires Windows with the game and sandbox open.');
  if(args.mapPath&&(path.extname(args.mapPath).toLowerCase()!=='.gil'||!fs.existsSync(args.mapPath)))fail('INVALID_MAP_PATH','mapPath must be an existing .gil candidate.');
  // A level with Lua client scripts (game 7.1): their prints come into the log through a row of their own, ticked
  // without being asked for when the save given holds one.
  if(args.mapPath&&args.clientScriptLog===undefined){
    try{const scripts=fields(container(fs.readFileSync(args.mapPath))).find(f=>f.id===50&&f.wire===2);
      if(scripts&&fields(scripts.data).some(f=>f.id===1&&f.wire===2))args={...args,clientScriptLog:true};}catch{}
  }
  // What the Lua of the save names is checked before the minutes of a playtest are spent: a script that does not
  // compile stops here (the editor would refuse the save after the import), the rest goes into the answer.
  let clientCheck;
  if(args.mapPath&&args.clientScriptLog){
    try{const found=checkClientScripts({mapPath:args.mapPath});
      const broken=found.problems.filter(p=>p.kind==='LUA_SYNTAX');
      if(broken.length)fail('LUA_SYNTAX','A client script of this save does not compile; the editor would refuse to play it. '+broken.map(p=>p.script+' line '+p.line+': '+p.message).join(' | '),{problems:broken});
      if(found.problems.length)clientCheck={errors:found.errors,warnings:found.warnings,problems:found.problems.slice(0,20),note:'What the client scripts name and the save does not have (scene_check_client). The play goes on; an error here usually explains why something on the screen does nothing.'};
    }catch(e){if(e.code==='LUA_SYNTAX')throw e;}
  }
  if(args.mapPath&&args.clientScriptLog&&args.luaLive!==false){
    const lua=luaOf(args.mapPath);
    if(lua)args={...args,luaLive:lua.files.map(({file,source})=>({file,source})),candidateKey:args.candidateKey??lua.key};
  }
  const seconds=Number(args.durationSeconds??60)+(args.mapPath?90:45);
  const started=launchRunner(args,workspace,seconds,`Do not touch the mouse or keyboard. Call playtest_status {runId, waitSeconds: 45}: it answers when the run has ended or 45 seconds have passed; repeat while state is "running" (about ${seconds} seconds in all).`);
  return clientCheck?{...started,clientCheck}:started;
}
// Starts the desktop automation runner for one request and returns at once.
export function launchRunner(args,workspace,seconds,next){
  if(process.platform!=='win32')fail('UNSUPPORTED_PLATFORM','Editor automation requires Windows with the game and sandbox open.');
  const busy=activeRun(workspace);
  if(busy)fail('PLAYTEST_BUSY','Another run is using the desktop. Poll it with playtest_status first.',{runId:busy});
  const other=otherDesktopRun(workspace);
  if(other)fail('DESKTOP_BUSY','A run of another workspace is using the game window (started '+other.startedSecondsAgo+' s ago, expected to take about '+other.expectedSeconds+' s). Try again when it has ended; nothing was started.',other);
  const runId=randomUUID(),runDir=path.join(runRoot(workspace),runId);
  fs.mkdirSync(runDir,{recursive:true});
  const request=path.join(runDir,'request.json');
  fs.writeFileSync(request,JSON.stringify({...args,runDir},null,2));
  try{fs.writeFileSync(deskNote(),JSON.stringify({runDir,workspace:path.resolve(workspace),startedAt:Date.now(),expectedSeconds:seconds}));}catch{}
  const python=process.env.MILIASTRA_PLAYTEST_PYTHON||process.env.MILIASTRA_PYTHON||'python';
  const log=fs.openSync(path.join(runDir,'runner.log'),'a');
  try{
    const child=spawn(python,[path.join(ROOT,'src','playtest_runner.py'),request],{detached:true,windowsHide:true,shell:false,stdio:['ignore',log,log],env:{...process.env,PYTHONIOENCODING:'utf-8'}});
    child.on('error',()=>{});child.unref();
  }finally{fs.closeSync(log);}
  return {runId,runDir,state:'running',expectedSeconds:seconds,next};
}
// Which level-clock second belongs to which play second: the presses of the probe's key that were heard (their level
// seconds, in the order heard) against the play seconds at which the runner pressed. A press that was lost leaves a
// gap, not a shift: each one heard is given the press time nearest to where the first press says it should be.
export function clockAnchors(keys,syncs){
  const first=keys.find(k=>k.step===0);if(!first)return [];
  const anchors=[{t:first.t,s:syncs[0]}];
  for(const k of keys.filter(k=>k.step>0)){
    const guess=syncs[0]+(k.t-first.t),free=syncs.slice(1).filter(s=>!anchors.some(a=>a.s===s));
    const best=free.sort((a,b)=>Math.abs(a-guess)-Math.abs(b-guess))[0];
    if(best!==undefined&&Math.abs(best-guess)<=12)anchors.push({t:k.t,s:best});
  }
  return anchors.sort((a,b)=>a.t-b.t);
}
const reqOf=runDir=>{try{return JSON.parse(fs.readFileSync(path.join(runDir,'request.json'),'utf8'));}catch{return null;}};
// At most n of a list, evenly spread, the first and the last among them.
export function spread(list,n){
  if(list.length<=n)return list;
  return Array.from({length:n},(_,i)=>list[Math.round(i*(list.length-1)/(n-1))]);
}
// The state of a run without reading its log: what playtest_status waits on (waitSeconds).
export function playtestState(runId,workspace){
  const runDir=path.join(runRoot(workspace),runId),status=readStatus(runDir);
  return status?status.state:fs.existsSync(runDir)?'unknown':'missing';
}
export function playtestStatus({runId,prefix='',graphId,maxPrints=200,includeScreenshots=true,screenshotsFrom,screenshotsTo},workspace){
  const runDir=path.join(runRoot(workspace),runId),status=readStatus(runDir);
  if(!status){
    const log=path.join(runDir,'runner.log');
    if(!fs.existsSync(runDir))fail('PLAYTEST_NOT_FOUND',runId);
    const output=fs.existsSync(log)?fs.readFileSync(log,'utf8').slice(-1500):'';
    return json({runId,state:output?'failed':'starting',error:output||undefined,
      hint:output?'The runner could not start. It needs Python >=3.10 with Pillow and rapidocr-onnxruntime (pip install -r requirements-capture.txt); set MILIASTRA_PLAYTEST_PYTHON to that interpreter.':undefined});
  }
  const summary={runId,runDir,state:status.state,elapsedSeconds:Math.round(status.updatedAt-status.startedAt),steps:status.steps,error:status.error||undefined,
    // Frames of bursts are counted, not listed: there are hundreds. playtest_frames puts a stretch of them side by side.
    screenshots:status.screenshots.filter(s=>!s.burst).map(s=>({file:s.file,label:s.label,playSeconds:s.playSeconds,...(s.canvas?{canvas:s.canvas}:{})})),
    canvases:status.result?.canvases,
    burstFrames:burstSummary(status),officialSave:status.result?.officialSave,
    // Pieces the editor refused during an asset import; it reports success even when it drops some.
    droppedPieces:status.result?.droppedPieces&&Object.keys(status.result.droppedPieces).length?status.result.droppedPieces:undefined,
    // What the editor listed when it refused to start the playtest, and what the server said if it ended the level itself.
    validation:status.result?.validation,serverMessage:status.result?.serverMessage,levelEndedAt:status.result?.levelEndedAt,endedEarly:status.result?.endedEarly,
    // What readTextAt read off the screen, and the clickText inputs whose word was not found.
    screenTexts:status.result?.screenTexts,inputsMissed:status.result?.inputsMissed,inputsLate:status.result?.inputsLate,
    // What was heard, when recordAudio was asked for: the .wav, the loudness of every second (dB below full scale) and
    // the moments at which a sound began.
    audio:status.result?.audio,
    // With recordVideo: the .mp4 the Game Bar made of the asked stretch of the play.
    video:status.result?.video,
    // The short way: the save was still open (no import), the Lua was written into its files, the log rows were still ticked.
    shortWay:status.result?.sameSave?{sameSaveStillOpen:true,luaWritten:status.result?.luaLive?.written,luaMissing:status.result?.luaLive?.missing?.length?status.result.luaLive.missing:undefined,logRowsKept:status.result?.logKept||undefined}:undefined,
    // With bakeNavigation: the stamp the editor shows for the bake and how long it took.
    navigationBaked:status.result?.navigationBaked,
    warning:status.result?.serverMessage?'The server ended the level by itself after '+status.result.levelEndedAt+' seconds of play: '+status.result.serverMessage+'. Despite the wording, the cause seen so far is the work the graph does each second: nodes run plus about 20 for every round of a loop must stay under roughly 1400 a second, better under 1000 (table in miliastra://platform-rules). Run the rules less often, loop over fewer things, or widen distance checks instead of checking more often.'
      :status.result?.levelEndedAt!==undefined?'The level reached its result screen after '+status.result.levelEndedAt+' seconds of play, before the planned end. If the graph did not settle the stage itself, the server ended it; the usual cause is too much graph work each second (see the load rule in miliastra://platform-rules).':undefined};
  if(status.state==='running')return json({...summary,next:'Still running. Poll again in 15 seconds.'});
  let everyPrint=[];
  if(status.result?.logFile){
    const bytes=fs.readFileSync(status.result.logFile),parsed=inspectDebugLog(bytes,{prefix,limit:100000});
    let prints=parsed.prints.filter(p=>graphId===undefined||p.clientScript||p.graphId===String(graphId)).map(p=>({t:Number(p.elapsedSeconds),graphId:p.graphId,text:p.text,...(p.clientScript?{clientScript:true}:{})}));
    // A run with the playtest probe: its prints give the level-clock second at which the play began (the first press of
    // the probe's key came at a known play second) and the path of the player; they are taken out of the list.
    let request=null;try{request=JSON.parse(fs.readFileSync(path.join(runDir,'request.json'),'utf8'));}catch{}
    if(request?.probe){
      const all=inspectDebugLog(bytes,{prefix:'',limit:100000}).prints.map(p=>({t:Number(p.elapsedSeconds),graphId:p.graphId,text:p.text,...(p.clientScript?{clientScript:true}:{})}));
      const probe=readProbe(all),sync=probe.keys.find(k=>k.step===0),offset=sync?Math.round((sync.t-request.probe.syncAt)*100)/100:undefined;
      // The runner presses the key of the probe again every half minute. Each press that is heard ties a level-clock
      // second to a play second anew: under load the level clock falls behind (a level of 585 nodes lost two
      // seconds in three minutes, 2026-10-13), and timers, prints and teleports with it.
      const anchors=clockAnchors(probe.keys,request.probe.syncs??[request.probe.syncAt]);
      const play=t=>{if(!anchors.length)return undefined;let a=anchors[0];for(const x of anchors)if(x.t<=t)a=x;return Math.round((a.s+t-a.t)*100)/100;};
      const behind=anchors.length?Math.max(...anchors.map(a=>(a.s-anchors[0].s)-(a.t-anchors[0].t))):0;
      prints=readProbe(prints).rest.map(p=>({...p,playSeconds:play(p.t)}));
      // A teleport is done by a timer of the probe; half a second later the probe says where the player is. Within 3.5 m
      // of the place asked for counts as arrived (a key held from that moment walks 2.7 m in the half second).
      const wanted=request.probe.teleports,far=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2])>3.5||Math.abs(a[1]-b[1])>4;
      const teleports=wanted.map((w,i)=>{
        const done=probe.teleports.find(x=>x.index===i);
        return {at:w.at,to:w.position,playSeconds:done?play(done.t):undefined,wasAt:done?.at,arrived:done&&done.at?!far(done.at,w.position):false};
      });
      const missed=teleports.filter(x=>!x.arrived);
      summary.probe={levelClockAtPlayStart:offset,levelClockFellBehind:behind>=2?behind:undefined,keyGivenTo:probe.given?probe.given.players:undefined,teleportsAsked:wanted.length,teleportsDone:teleports.filter(x=>x.arrived).length,teleports,
        warning:!sync?'The probe did not answer (no PT_KEY print): the key of the probe (Z, skill slot 4) did not reach the level or the log did not tick _GSTS_PT_hero. Positions and play seconds are missing; teleports did not happen.'
          :behind>=2&&!missed.length?'The level clock fell '+behind+' s behind the play (the level was busy): what the level does by its own timers, the teleports of the script among them, came that much later than asked for towards the end. playSeconds of the prints and of probe.teleports are corrected for it.'
          :missed.length?'The player was not at the place asked for half a second after '+missed.length+' of '+wanted.length+' teleports (at play second '+missed.map(x=>x.at).join(', ')+'; wasAt says where it was instead). A teleport does not take while the character is down, and the level may have moved the player itself at that moment. The other teleports are not affected.':undefined};
      if(request.trackPlayer!==undefined)summary.playerTrack={every:request.trackPlayer,columns:['playSeconds','x','y','z'],samples:probe.track.map(s=>[play(s.t)??s.t,...s.at]),
        note:offset===undefined?'Without the sync print the first column is the level clock, not play seconds.':undefined};
    }
    everyPrint=prints;
    // The rows of the log window were left as the run before ticked them, and nothing came: tick them anew next time.
    if(status.result?.logKept&&!parsed.prints.length){try{fs.writeFileSync(path.join(runRoot(workspace),'log-not-kept'),'');}catch{}
      summary.logWarning='This run reused the log selection of the run before and the log came back empty. The next playtest ticks the graphs again; run it once more if prints were expected.';}
    summary.log={file:status.result.logFile,officialLog:status.result.officialLog,printCount:prints.length,truncated:prints.length>maxPrints,
      // t is the level clock. It starts several seconds before the HUD is visible, so it runs ahead of screenshot playSeconds.
      prints:prints.slice(0,maxPrints)};
  }else summary.log={file:null,note:status.result?.logNote||'No log was collected.'};
  if(reqOf(runDir)?.startValues?.length)summary.startValues={used:reqOf(runDir).startValues,note:'This run began with other values in these custom variables: it shows how that part of the level plays. It is not a run of the level as built.'};
  // What the caller said the run should print: checked here, so that a round of work ends in passed or in the one
  // expectation that was not met.
  const asked=reqOf(runDir)?.expect;
  if(asked)summary.expectations=judge(asked,everyPrint,status);
  summary.verification='Read the prints and LOOK at the screenshots. A finished run only means the level was played for the requested time; it does not mean the gameplay is correct.';
  // Eight images at most: spread evenly over the run (or over the span asked for), the first and the last among them.
  // It used to be the last eight, and a reader who looked only at those missed the first half of the run.
  const shown=spread(status.screenshots.filter(s=>!s.burst&&(s.playSeconds!==undefined||s.canvas||status.state==='failed'))
    .filter(s=>s.playSeconds===undefined||((screenshotsFrom===undefined||s.playSeconds>=screenshotsFrom)&&(screenshotsTo===undefined||s.playSeconds<=screenshotsTo))),8);
  summary.imagesShown=shown.map(s=>s.playSeconds??s.label);
  const content=[{type:'text',text:JSON.stringify(summary)}];
  if(includeScreenshots)for(const shot of shown){
    if(fs.existsSync(shot.file))content.push({type:'text',text:`${shot.label}${shot.playSeconds!==undefined?` at ${shot.playSeconds}s`:''}`},{type:'image',mimeType:'image/jpeg',data:fs.readFileSync(shot.file).toString('base64')});
  }
  return {content,structuredContent:summary};
}
const json=data=>({content:[{type:'text',text:JSON.stringify(data)}],structuredContent:data});
// expect {prints: texts that must be printed, in this order (each a part of a print); absent: texts no print may hold;
// noScriptErrors: no client script may have faulted (on unless false)}. Says which were met, and for the first that was
// not, what was printed around the place it should have stood.
export function judge(asked,prints,status){
  const results=[];let from=0;
  if(status.state!=='succeeded')results.push({expect:'the run ends',met:false,found:'state '+status.state+(status.error?': '+String(status.error).slice(0,200):'')});
  for(const text of asked.prints??[]){
    const at=prints.findIndex((p,i)=>i>=from&&p.text.includes(text));
    if(at<0){const anywhere=prints.findIndex(p=>p.text.includes(text));
      results.push({expect:'print "'+text+'"',met:false,found:anywhere>=0?'printed at level second '+prints[anywhere].t+', before the one expected ahead of it':'never printed',
        after:prints.slice(Math.max(0,from-1),from+4).map(p=>p.t+': '+p.text.slice(0,120))});}
    else{results.push({expect:'print "'+text+'"',met:true,t:prints[at].t});from=at+1;}
  }
  for(const text of asked.absent??[]){const hit=prints.find(p=>p.text.includes(text));
    results.push({expect:'no print "'+text+'"',met:!hit,...(hit?{found:hit.t+': '+hit.text.slice(0,160)}:{})});}
  if(asked.noScriptErrors!==false){const fault=prints.find(p=>p.clientScript&&/stack traceback|attempt to (?:index|call|perform|compare|concatenate)/.test(p.text));
    results.push({expect:'no fault in a client script',met:!fault,...(fault?{found:fault.t+': '+fault.text.slice(0,300)}:{})});}
  const failed=results.filter(r=>!r.met);
  return {passed:failed.length===0,met:results.length-failed.length,of:results.length,...(failed.length?{firstNotMet:failed[0]}:{}),results,
    note:failed.length?'Not everything expected was printed. The screenshots still have to be looked at for what a print cannot say.':'Everything expected was printed, in order. That is what the level said of itself: look at the screenshots for what the player sees.'};
}
// What the bursts of a run gave: how many frames, over which seconds of the play, how far apart they really were.
function burstSummary(status){
  const frames=status.screenshots.filter(s=>s.burst);if(!frames.length)return undefined;
  const gaps=frames.slice(1).map((f,i)=>f.playSeconds-frames[i].playSeconds).filter(g=>g<1).sort((a,b)=>a-b);
  return {count:frames.length,fromSeconds:frames[0].playSeconds,toSeconds:frames.at(-1).playSeconds,medianGapMs:gaps.length?Math.round(gaps[gaps.length>>1]*1000):undefined,
    dropped:status.result?.burstFramesDropped,next:'Look at them with playtest_frames {runId, fromSeconds, toSeconds, crop}: up to 64 frames a sheet.'};
}
// The screenshots of a run side by side in one picture (src/playtest_frames.py does the picture): motion is looked at
// frame by frame, and one picture of twenty small frames tells more than twenty pictures.
export function playtestFrames({runId,fromSeconds,toSeconds,every=1,crop,columns,width=2000,maxFrames=48},workspace){
  const runDir=path.join(runRoot(workspace),runId),status=readStatus(runDir);
  if(!status)fail('PLAYTEST_NOT_FOUND',runId);
  if(status.state==='running')fail('PLAYTEST_RUNNING','The playtest is still running: its screenshots are complete when playtest_status says succeeded or failed.',{runId});
  if(crop&&!(crop[0]<crop[2]&&crop[1]<crop[3]))fail('INVALID_CROP','crop is [x0, y0, x1, y1] as fractions of the screen, left and top smaller than right and bottom.',{crop});
  const stamp=Date.now().toString(36),request=path.join(runDir,'frames-'+stamp+'.json'),out=path.join(runDir,'frames-'+stamp+'.jpg');
  fs.writeFileSync(request,JSON.stringify({runDir,out,fromSeconds,toSeconds,every,crop,columns,width,maxFrames}));
  const python=process.env.MILIASTRA_PLAYTEST_PYTHON||process.env.MILIASTRA_PYTHON||'python';
  const ran=spawnSync(python,[path.join(ROOT,'src','playtest_frames.py'),request],{encoding:'utf8',windowsHide:true,env:{...process.env,PYTHONIOENCODING:'utf-8'}});
  fs.rmSync(request,{force:true});
  let made;try{made=JSON.parse((ran.stdout||'').trim().split('\n').pop());}catch{made=null;}
  if(!made)fail('FRAMES_FAILED','The picture could not be made. It needs Python with Pillow (pip install -r requirements-capture.txt); set MILIASTRA_PLAYTEST_PYTHON to that interpreter.',{output:((ran.stderr||'')+(ran.error?.message||'')).slice(-600)});
  if(made.error==='NO_FRAMES'){
    const taken=status.screenshots.filter(s=>s.playSeconds!==undefined).map(s=>s.playSeconds);
    fail('NO_FRAMES','No screenshot of this run lies in that span. Screenshots are taken at the seconds given to playtest_start as screenshotsAt.',{fromSeconds,toSeconds,taken:taken.length,first:taken[0],last:taken.at(-1)});
  }
  const summary={runId,sheet:made.out,size:made.size,cell:made.cell,columns:made.columns,frames:made.frames,
    ...(made.skipped?{skipped:made.skipped,note:'More screenshots lie in the span than maxFrames: the first '+made.frames.length+' are shown. Narrow the span, or take every second or third with every.'}:{}),
    reading:'Left to right, top to bottom; the number on each frame is its play second (the prints of the log run on the level clock, which is some seconds ahead: playtest_status says so).'};
  return {content:[{type:'text',text:JSON.stringify(summary)},{type:'image',mimeType:'image/jpeg',data:fs.readFileSync(made.out).toString('base64')}],structuredContent:summary};
}
