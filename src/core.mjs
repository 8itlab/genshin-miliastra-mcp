import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sha, fail, packageRoot, inspectBytes, inspectFile, inspectGia, inject } from './adapter.mjs';
import { inspectEditorConnection } from './editor-connection.mjs';
import { inspectCompiledAssetText } from './compiled-text-check.mjs';

export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const readJson=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const writeJson=(file,value)=>fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');
const exists=p=>fs.existsSync(p);
function atomicWrite(file,data) {
  const temp=file+'.'+randomUUID()+'.tmp';
  try { fs.writeFileSync(temp,data,{flag:'wx'}); fs.renameSync(temp,file); }
  finally { if(exists(temp)) fs.unlinkSync(temp); }
}
function files(dir) {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):e.isFile()?[path.join(dir,e.name)]:[]);
}
export function runNode(args,cwd) {
  return new Promise((resolve,reject)=>{
    const proc=spawn(process.execPath,args,{cwd,windowsHide:true,shell:false,
      // Pin worker locale: upstream's lazy diagnostic formatter passes POSIX
      // "C" and LANGUAGE lists to Intl, hiding the real compile error.
      env:{...process.env,PATH:path.dirname(process.execPath)+path.delimiter+process.env.PATH,NO_COLOR:'1',LC_ALL:'en_US.UTF-8',LC_MESSAGES:'en_US.UTF-8',LANG:'en_US.UTF-8',LANGUAGE:'en_US'}});
    let output='',timedOut=false;
    const timer=setTimeout(()=>{timedOut=true;proc.kill();},120000);
    const capture=b=>{output=(output+b.toString()).slice(-40000);};
    proc.stdout.on('data',capture);proc.stderr.on('data',capture);
    proc.on('error',e=>{clearTimeout(timer);reject(e);});
    proc.on('close',code=>{clearTimeout(timer);resolve({exitCode:code,output,timedOut});});
  });
}
const MAX_GRAPH_NODES=3000;
// The name the creator sees in the save list: field 2 of the save, which sits right after the header and the save id.
// Read from the first bytes only, so that listing a hundred saves stays quick.
function saveName(file){
  try{
    const fd=fs.openSync(file,'r'),head=Buffer.alloc(400),n=fs.readSync(fd,head,0,400,0);fs.closeSync(fd);
    let p=20;
    for(let guard=0;guard<6&&p<n;guard++){
      const key=head[p++],wire=key&7,id=key>>3;
      if(wire===0){while(p<n&&head[p++]&128);continue;}
      if(wire!==2)return null;
      let len=0,shift=0;for(;;){const v=head[p++];len+=(v&127)*2**shift;shift+=7;if(!(v&128))break;}
      if(id===2)return p+len<=n?head.subarray(p,p+len).toString('utf8'):null;
      p+=len;
    }
  }catch{}
  return null;
}

export class Service {
  constructor({workspace=process.env.MILIASTRA_WORKSPACE||path.join(ROOT,'workspace'),saveRoots,allowLive=process.env.MILIASTRA_ALLOW_LIVE_WRITE==='1'}={}) {
    this.workspace=path.resolve(workspace);fs.mkdirSync(this.workspace,{recursive:true});
    this.workspace=fs.realpathSync(this.workspace);this.allowLive=allowLive;
    this.saveRoots=(saveRoots|| (process.env.MILIASTRA_SAVE_ROOTS?JSON.parse(process.env.MILIASTRA_SAVE_ROOTS):[
      path.join(os.homedir(),'AppData','LocalLow','miHoYo','原神','BeyondLocal'),
      path.join(os.homedir(),'AppData','LocalLow','miHoYo','Genshin Impact','BeyondLocal')])).filter(exists).map(p=>fs.realpathSync(p));
  }
  project(id) {
    if(!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(id))fail('INVALID_PROJECT_ID','Use 1-64 lowercase letters, digits, underscores or hyphens.');
    const dir=path.join(this.workspace,id);
    if(exists(dir)&&fs.realpathSync(dir)!==dir)fail('PATH_ESCAPE','Project directory must not be a symlink.');
    return dir;
  }
  load(id) {const dir=this.project(id);if(!exists(path.join(dir,'project.json')))fail('PROJECT_NOT_FOUND',id);return {dir,meta:readJson(path.join(dir,'project.json'))};}
  assertRead(file) {
    const real=fs.realpathSync(file);
    if(![this.workspace,...this.saveRoots].some(root=>real.startsWith(root+path.sep)))fail('PATH_OUTSIDE_ROOTS','Map must be inside a configured save root or workspace.');
    if(path.extname(real).toLowerCase()!=='.gil')fail('INVALID_MAP_PATH','Expected a .gil file.');
    return real;
  }
  capabilities() {return {version:'0.1.0',backend:'genshin-ts@0.2.2',transport:'stdio',workspace:this.workspace,saveRoots:this.saveRoots,editorConnection:inspectEditorConnection(),
    liveWriteEnabled:this.allowLive,supported:['discover_maps','inspect_node_graphs','typescript_logic','compile_gia','preview_injection','copy_apply','backup_restore','node_documentation','scene_search_assets','scene_asset_images','effect_catalog','scene_build_blocks','scene_list_entities','scene_list_prefabs','scene_add_prefab','scene_list_factions','scene_set_faction_hostility','scene_get_level_settings','scene_set_level_settings','scene_add_graph','scene_list_cameras','scene_set_camera',...(process.platform==='win32'?['list_editor_windows','capture_editor_window','focus_editor_window','editor_input','editor_open_map','scene_import_assets','playtest_start','playtest_status']:[])],
    capture:{platform:'Windows',python:process.env.MILIASTRA_PYTHON||'python',requires:'Python >=3.10 and Pillow >=11.2.1; use requirements-capture.txt',methods:['window (PrintWindow)','screen (foreground visible pixels)'],wgcRequired:false,inputAutomation:true,inputTools:['focus_editor_window','editor_input'],inputKinds:['click','key','text','scroll','drag'],captureIdLifetimeSeconds:120},
    unsupported:['author_terrain','creature_prefabs','creature_patrol (the game drops patrol templates on import since its update of 2026-10-09)','author_ui','draw_paths','publish'],
    workflow:'Read the resource miliastra://workflow: look at the map, build and import the scene, set camera/prefabs/factions/level settings, write and apply the graph, playtest and judge prints and screenshots.',
    runtimeVerification:process.platform==='win32'?'playtest_start imports a candidate, plays it for a fixed time and returns log prints plus screenshots; judging the gameplay is still up to the caller':'not_available',platformRules:'miliastra://platform-rules',trustBoundary:'Local trusted MCP clients only. Submitted TypeScript is compiled through upstream code execution; this is not an untrusted-code sandbox.'};}
  listMaps() {
    const maps=[];
    for(const root of this.saveRoots) for(const account of fs.readdirSync(root,{withFileTypes:true}).filter(e=>e.isDirectory()&&/^\d+$/.test(e.name))) {
      const dir=path.join(root,account.name,'Beyond_Local_Save_Level');if(!exists(dir))continue;
      // CN 7.1 stores each new save as <mapId>/<mapId>.gil. Only this
      // observed one-level layout is included; backups and arbitrary nested
      // files must not be mistaken for current editor maps.
      const entries=fs.readdirSync(dir,{withFileTypes:true});
      const candidates=entries.flatMap(entry=>{
        if(entry.isFile()&&entry.name.endsWith('.gil'))return [path.join(dir,entry.name)];
        if(entry.isDirectory()&&/^\d+$/.test(entry.name)){
          const file=path.join(dir,entry.name,entry.name+'.gil');
          return exists(file)&&fs.lstatSync(file).isFile()?[file]:[];
        }
        return [];
      });
      for(const file of candidates) {
        const stat=fs.statSync(file);
        maps.push({mapId:path.basename(file,'.gil'),name:saveName(file),path:file,bytes:stat.size,modifiedAt:stat.mtime.toISOString()});
      }
    }
    maps.sort((a,b)=>b.modifiedAt.localeCompare(a.modifiedAt));
    // The game lets two saves carry one name, and a creator names a save, not a number: say so where it happens.
    const named=new Map();for(const m of maps)named.set(m.name,(named.get(m.name)||0)+1);
    for(const m of maps)if(named.get(m.name)>1)m.sameName=named.get(m.name);
    const twice=[...named].filter(([,n])=>n>1).map(([name])=>name);
    return {maps,...(twice.length?{note:'Several saves share a name ('+twice.slice(0,5).join(', ')+'): sameName on each says how many. When a save is meant by its name alone, ask which one, or take the newest and say so.'}:{})};
  }
  inspectMap({mapPath}) {return inspectFile(this.assertRead(mapPath));}
  createProject({projectId,mapPath,targetGraphId}) {
    const dir=this.project(projectId);if(exists(dir))fail('PROJECT_EXISTS','Choose another project ID.');
    const source=this.assertRead(mapPath),bytes=fs.readFileSync(source),info=inspectBytes(bytes);
    fs.mkdirSync(path.join(dir,'src'),{recursive:true});fs.mkdirSync(path.join(dir,'builds'));fs.mkdirSync(path.join(dir,'backups'));
    // Compiler projects may live on another drive. Resolve pinned dependencies
    // from this installation, rather than relying on an ancestor node_modules.
    fs.symlinkSync(path.join(ROOT,'node_modules'),path.join(dir,'node_modules'),process.platform==='win32'?'junction':'dir');
    fs.writeFileSync(path.join(dir,'original.gil'),bytes,{flag:'wx'});fs.writeFileSync(path.join(dir,'working.gil'),bytes,{flag:'wx'});
    const meta={projectId,sourcePath:source,sourceSha256:sha(bytes),targetGraphId:targetGraphId??info.graphs.find(g=>g.writable&&g.type===20000)?.id??null,createdAt:new Date().toISOString()};
    writeJson(path.join(dir,'project.json'),meta);
    fs.writeFileSync(path.join(dir,'src','main.ts'),`import { g } from 'genshin-ts/runtime/core'\ng.server({ id: ${meta.targetGraphId??1073741825}, name: '_GSTS_MCP_Test' }).on('whenEntityIsCreated', (_evt, f) => {\n  f.printString('MILIASTRA_MCP_OK')\n})\n`);
    return {...meta,workingMap:path.join(dir,'working.gil'),warnings:info.warnings,next:meta.targetGraphId?'build_project':'Can compile/export now. Create a target graph in the editor before applying.'};
  }
  getProject({projectId}) {const {dir,meta}=this.load(projectId);return {...meta,code:fs.readFileSync(path.join(dir,'src','main.ts'),'utf8'),workingMap:inspectFile(path.join(dir,'working.gil'))};}
  updateLogic({projectId,code,targetGraphId}) {
    const {dir,meta}=this.load(projectId);
    if(targetGraphId!==undefined)meta.targetGraphId=targetGraphId;
    atomicWrite(path.join(dir,'src','main.ts'),code);writeJson(path.join(dir,'project.json'),meta);
    return {projectId,sourceSha256:sha(code),targetGraphId:meta.targetGraphId};
  }
  async validateProject({projectId}) {
    const {dir,meta}=this.load(projectId);const info=inspectFile(path.join(dir,'working.gil'));
    const tsconfig={extends:path.join(packageRoot,'configs','tsconfig','base.json'),compilerOptions:{noEmit:true},include:['src/**/*.ts']};
    writeJson(path.join(dir,'tsconfig.json'),tsconfig);
    const result=await runNode([path.join(ROOT,'node_modules','typescript','bin','tsc'),'-p',path.join(dir,'tsconfig.json'),'--pretty','false'],dir);
    return {typecheckPassed:result.exitCode===0,diagnostics:result.output,...this.targetCheck(meta,info)};
  }
  // Whether the graph the project is to replace is in its save.
  targetCheck(meta,info) {
    const missing=meta.targetGraphId===null||!info.graphs.some(g=>g.id===meta.targetGraphId);
    return {canApply:!missing,
      missingConfiguration:missing?['The configured target graph is absent from this save. Existing-graph replacement requires a saved target; compiling and exporting a new graph does not. Configure imported graphs according to their graph type.']:[],runtimeTest:'not_run'};
  }
  async buildProject({projectId}) {
    const {dir,meta}=this.load(projectId),code=fs.readFileSync(path.join(dir,'src','main.ts'),'utf8');
    const validation=await this.validateProject({projectId});
    if(!validation.typecheckPassed)fail('TYPECHECK_FAILED','Fix the TypeScript diagnostics and rebuild.',validation);
    const buildId=randomUUID(),buildDir=path.join(dir,'builds',buildId);fs.mkdirSync(path.join(buildDir,'src'),{recursive:true});
    fs.writeFileSync(path.join(buildDir,'src','main.ts'),code);
    writeJson(path.join(buildDir,'tsconfig.json'),{extends:path.join(packageRoot,'configs','tsconfig','base.json'),include:['src/**/*.ts']});
    fs.writeFileSync(path.join(buildDir,'gsts.config.ts'),"export default { compileRoot: '.', entries: ['./src'], outDir: './dist', lang: 'en-US' }\n");
    const result=await runNode([path.join(packageRoot,'bin','gsts.mjs'),'-c',path.join(buildDir,'gsts.config.ts'),'--noinject'],buildDir);
    fs.writeFileSync(path.join(buildDir,'compile.log'),result.output);
    const giaFiles=exists(path.join(buildDir,'dist'))?files(path.join(buildDir,'dist')).filter(p=>p.endsWith('.gia')):[];
    if(result.exitCode!==0||giaFiles.length!==1){
      // The compiler's own words first: the output can be long and the cause sits near its end.
      const errors=String(result.output||'').split('\n').filter(l=>/error TS\d+|Error:|\[error\]/.test(l)).slice(0,8);
      const hint=/Maximum call stack size exceeded/.test(result.output||'')?' The compiler ran out of stack: an event handler has too many statements in one unbroken run (about a thousand). Split the work across handlers or loop over a list.':'';
      fail('BUILD_FAILED','The graph did not compile.'+(errors.length?' '+errors[0].trim():'')+hint,{buildId,errors,...result,giaCount:giaFiles.length});
    }
    return this.finishBuild({dir,meta,code,buildId,buildDir,giaPath:giaFiles[0],validation});
  }
  // What a build is once its graph is compiled: the checks on the compiled graph, its size as the editor counts it, and
  // the record preview_changes and apply_build go by.
  finishBuild({dir,meta,code,buildId,buildDir,giaPath,validation}) {
    const projectId=meta.projectId,gia=fs.readFileSync(giaPath),{graph,sized,warnings,limits}=this.graphReport(gia,code,meta.targetGraphId,buildId);
    const build={buildId,projectId,createdAt:new Date().toISOString(),sourceSha256:sha(code),giaPath,giaSha256:sha(gia),graph,limits,warnings,validation,runtimeTest:'not_run'};
    writeJson(path.join(buildDir,'build.json'),build);writeJson(path.join(dir,'latest-build.json'),{buildId});return build;
  }
  // The checks on a compiled graph and its size as the editor counts it: what a build says about its graph.
  graphReport(gia,code,expectedId,buildId) {
    const graph=inspectGia(gia);
    const textDiagnostics=inspectCompiledAssetText(gia,code);
    if(textDiagnostics.length)fail('COMPILED_TEXT_COERCION','Compiled text contains an object handle instead of a runtime value. Use explicit dataTypeConversion(value, \'str\') nodes and separate print calls; do not interpolate runtime handles with JavaScript templates.',{buildId,diagnostics:textDiagnostics,runtimeTest:'not_run'});
    if(expectedId!==null&&graph.id!==expectedId)fail('GRAPH_ID_MISMATCH','Code graph ID differs from the configured target.',{expected:expectedId,actual:graph.id});
    // The editor refuses to playtest a graph in two cases, both worded 节点图中的节点数超标：N，最大值为3000: more than 3000
    // nodes (N is nodeCount), or more than 3000 by its size count, where a graph variable read or write counts 4 and a
    // loop over a list 20 (N is that count, and the dialog also says 服务器内存消耗过高). See graphEditorCount.
    const sized=graph.editorCount,parts=`${sized.variableReads} graph variable reads and ${sized.variableWrites} writes (4 each), ${sized.listLoops} loops over a list (20 each), ${sized.countingLoops} counting loops (15 each)`;
    const warnings=graph.nodeCount>MAX_GRAPH_NODES?[`This graph has ${graph.nodeCount} nodes; the editor refuses to playtest more than ${MAX_GRAPH_NODES} (校验失败：节点图中的节点数超标). Do the same thing for many items with one loop over a list instead of one copy of the code per item.`]
      :sized.total>MAX_GRAPH_NODES?[`The editor will refuse this graph (校验失败：服务器内存消耗过高；节点图中的节点数超标：${sized.total}): it has ${graph.nodeCount} nodes, but the editor's size count is ${sized.total}, over the limit of ${MAX_GRAPH_NODES}: ${parts}. Read a graph variable once into a const and reuse it, write it once at the end of the handler, and do several jobs in one loop.`]
      :sized.total>MAX_GRAPH_NODES*0.85?[`The editor's size count for this graph is ${sized.total} of the ${MAX_GRAPH_NODES} it allows (${graph.nodeCount} nodes; ${parts}).`]:[];
    return {graph,sized,warnings,limits:{nodeCount:graph.nodeCount,editorCount:sized.total,maxNodes:MAX_GRAPH_NODES,counting:'The editor refuses a graph when nodeCount or editorCount is above maxNodes. editorCount counts each read or write of a graph variable as 4, each loop over a list as 20, each counting loop (finiteLoop) as 15, everything else as 1 (measured; local variables count 1).',runtime:'The server ends a level when, each second, nodes run plus about 20 for every round of a loop go above roughly 1400 (measured; aim for under 1000; see miliastra://platform-rules). playtest_status reports it as serverMessage.'}};
  }
  // Several graphs compiled together: one type check and one compiler run for all of them. Built one by one, every
  // graph starts two processes and takes about seven seconds whatever its size (thirty-seven graphs: four and a half
  // minutes; together: eleven seconds, measured 2026-10-12). Returns the .gia of every source, by position, or null
  // when anything at all went wrong: the caller then builds them one by one, which names the graph at fault and gives
  // its errors as before. The compiler shakes the node positions at random, so two builds of one source never have the
  // same bytes; everything else in them is the same.
  async compileTogether(sources) {
    if(sources.length<2)return null;
    const dir=path.join(this.workspace,'batch-'+Date.now().toString(36)+'-'+randomUUID().slice(0,8)),file=i=>'g'+String(i).padStart(3,'0');
    try{
      fs.mkdirSync(path.join(dir,'src'),{recursive:true});
      fs.symlinkSync(path.join(ROOT,'node_modules'),path.join(dir,'node_modules'),process.platform==='win32'?'junction':'dir');
      sources.forEach((s,i)=>fs.writeFileSync(path.join(dir,'src',file(i)+'.ts'),s.code));
      const base=path.join(packageRoot,'configs','tsconfig','base.json');
      writeJson(path.join(dir,'tsconfig.json'),{extends:base,compilerOptions:{noEmit:true},include:['src/**/*.ts']});
      const checked=await runNode([path.join(ROOT,'node_modules','typescript','bin','tsc'),'-p',path.join(dir,'tsconfig.json'),'--pretty','false'],dir);
      if(checked.exitCode!==0)return null;
      writeJson(path.join(dir,'tsconfig.json'),{extends:base,include:['src/**/*.ts']});
      fs.writeFileSync(path.join(dir,'gsts.config.ts'),"export default { compileRoot: '.', entries: ['./src'], outDir: './dist', lang: 'en-US' }\n");
      const result=await runNode([path.join(packageRoot,'bin','gsts.mjs'),'-c',path.join(dir,'gsts.config.ts'),'--noinject'],dir);
      fs.writeFileSync(path.join(dir,'compile.log'),result.output);
      if(result.exitCode!==0||!exists(path.join(dir,'dist')))return null;
      const made=files(path.join(dir,'dist')).filter(p=>p.endsWith('.gia')),out=sources.map((_,i)=>made.find(p=>path.basename(p)===file(i)+'.gia'));
      return made.length===sources.length&&out.every(Boolean)?out:null;
    }catch{return null;}
  }
  // The graphs compileTogether made, put into one copy of the save in a single pass: one after another in memory, the
  // copy written once. (Through a project each, every graph read, checked and wrote the whole save several times: two
  // and a half seconds a graph on a save of three megabytes.) Stops at a graph that cannot be put in: the copy then
  // holds the graphs before it. The copy is this call's own; the save it was made from is not touched.
  writeTogether({projectId,mapPath,graphs,gias}) {
    const dir=this.project(projectId);if(exists(dir))fail('PROJECT_EXISTS','Choose another project ID.');
    const source=this.assertRead(mapPath),original=fs.readFileSync(source),before=inspectBytes(original);
    fs.mkdirSync(path.join(dir,'builds'),{recursive:true});
    fs.writeFileSync(path.join(dir,'original.gil'),original,{flag:'wx'});
    let bytes=original,failed;const written=[];
    for(const [i,g] of graphs.entries()){
      try{
        const gia=fs.readFileSync(gias[i]),{limits,warnings}=this.graphReport(gia,g.code,g.graphId,projectId+'-'+i);
        const target=before.graphs.find(x=>x.id===g.graphId);
        if(!target)fail('MISSING_GRAPH','Target graph does not exist in the destination. Create/save it in the editor.',{targetGraphId:g.graphId,availableGraphs:before.graphs});
        if(!target.writable)fail('UNSAFE_TARGET','Target is non-empty and not managed by _GSTS.',{graph:target});
        bytes=inject(bytes,gia,g.graphId);
        fs.copyFileSync(gias[i],path.join(dir,'builds',g.graphId+'.gia'));
        written.push({graphId:g.graphId,projectId,limits,warnings});
      }catch(e){failed={graphId:g.graphId,position:i,code:e.code??'ERROR',message:e.message,details:e.details};break;}
    }
    const target=path.join(dir,'working.gil');atomicWrite(target,bytes);
    const after=inspectFile(target);
    if(after.sha256!==sha(bytes))fail('WRITE_VERIFY_FAILED','Re-read hash differs from applied bytes.');
    writeJson(path.join(dir,'project.json'),{projectId,sourcePath:source,sourceSha256:sha(original),targetGraphId:null,graphs:written.map(w=>w.graphId),createdAt:new Date().toISOString()});
    return {mapPath:target,written,failed};
  }
  getBuild(projectId,buildId) {
    const {dir,meta}=this.load(projectId);
    if(!/^[a-f0-9-]{36}$/.test(buildId))fail('INVALID_BUILD_ID','Invalid build ID.');
    const file=path.join(dir,'builds',buildId,'build.json');if(!exists(file))fail('BUILD_NOT_FOUND',buildId);
    const build=readJson(file),gia=fs.readFileSync(build.giaPath);
    if(sha(gia)!==build.giaSha256)fail('ARTIFACT_CHANGED','Build artifact changed after compilation.');
    if(sha(fs.readFileSync(path.join(dir,'src','main.ts')))!==build.sourceSha256)fail('STALE_BUILD','Source changed; build again.');
    if(meta.targetGraphId!==null&&meta.targetGraphId!==build.graph.id)fail('STALE_BUILD','Target graph changed; build again.');
    return {dir,meta,build,gia};
  }
  previewChanges({projectId,buildId,destination='copy'}) {
    const {dir,meta,build,gia}=this.getBuild(projectId,buildId);
    if(destination==='live'&&!this.allowLive)fail('LIVE_WRITE_DISABLED','Enable MILIASTRA_ALLOW_LIVE_WRITE=1 when configuring this local server.');
    const target=destination==='live'?this.assertRead(meta.sourcePath):path.join(dir,'working.gil');
    const bytes=fs.readFileSync(target),before=inspectBytes(bytes);
    const graph=before.graphs.find(g=>g.id===build.graph.id);
    if(!graph)fail('MISSING_GRAPH','Target graph does not exist in the destination. Create/save it in the editor.',{targetGraphId:build.graph.id,availableGraphs:before.graphs});
    if(!graph.writable)fail('UNSAFE_TARGET','Target is non-empty and not managed by _GSTS.',{graph});
    const candidate=inject(bytes,gia,build.graph.id),after=inspectBytes(candidate);
    return {projectId,buildId,destination,target,expectedSha256:before.sha256,resultSha256:after.sha256,bytesBefore:before.bytes,bytesAfter:after.bytes,graphBefore:graph,graphAfter:after.graphs.find(g=>g.id===build.graph.id),runtimeTest:'not_run',reloadRequired:destination==='live'};
  }
  applyBuild(args) {
    const preview=this.previewChanges(args);
    if(preview.expectedSha256!==args.expectedSha256)fail('MAP_CHANGED','Map changed since preview; preview again.');
    const {dir,build,gia}=this.getBuild(args.projectId,args.buildId),bytes=fs.readFileSync(preview.target);
    if(sha(bytes)!==args.expectedSha256)fail('MAP_CHANGED','Map changed before apply.');
    const candidate=inject(bytes,gia,build.graph.id),backupId=randomUUID();
    fs.writeFileSync(path.join(dir,'backups',backupId+'.gil'),bytes,{flag:'wx'});
    const record={backupId,target:preview.target,beforeSha256:sha(bytes),afterSha256:sha(candidate),buildId:args.buildId,createdAt:new Date().toISOString()};
    writeJson(path.join(dir,'backups',backupId+'.json'),record);
    if(sha(fs.readFileSync(preview.target))!==args.expectedSha256)fail('MAP_CHANGED','Map changed immediately before write.');
    atomicWrite(preview.target,candidate);
    const verified=inspectFile(preview.target);
    if(verified.sha256!==record.afterSha256)fail('WRITE_VERIFY_FAILED','Re-read hash differs from applied bytes.');
    writeJson(path.join(dir,'latest-apply.json'),record);
    return {...record,applied:true,runtimeTest:'not_run',next:'Reload the map in the editor before saving. Run it to verify gameplay.'};
  }
  restoreBackup({projectId,backupId,expectedSha256}) {
    const {dir}=this.load(projectId);if(!/^[a-f0-9-]{36}$/.test(backupId))fail('INVALID_BACKUP_ID','Invalid backup ID.');
    const record=readJson(path.join(dir,'backups',backupId+'.json'));
    const target=this.assertRead(record.target);
    if(target!==path.join(dir,'working.gil')&&!this.allowLive)fail('LIVE_WRITE_DISABLED','Live restore is disabled.');
    const current=fs.readFileSync(target);
    if(sha(current)!==expectedSha256)fail('MAP_CHANGED','Map changed since inspection.');
    const backup=fs.readFileSync(path.join(dir,'backups',backupId+'.gil'));inspectBytes(backup);
    if(sha(backup)!==record.beforeSha256)fail('BACKUP_CHANGED','Backup hash mismatch.');
    const undoId=randomUUID();fs.writeFileSync(path.join(dir,'backups',undoId+'.gil'),current,{flag:'wx'});
    writeJson(path.join(dir,'backups',undoId+'.json'),{backupId:undoId,target,beforeSha256:sha(current),afterSha256:sha(backup)});
    atomicWrite(target,backup);return {restored:true,sha256:sha(fs.readFileSync(target)),undoBackupId:undoId,runtimeTest:'not_run'};
  }
  testResults({projectId}) {
    const {dir}=this.load(projectId),latest=exists(path.join(dir,'latest-build.json'))?readJson(path.join(dir,'latest-build.json')):null;
    return {latestBuild:latest?readJson(path.join(dir,'builds',latest.buildId,'build.json')):null,
      latestApply:exists(path.join(dir,'latest-apply.json'))?readJson(path.join(dir,'latest-apply.json')):null,
      gameplay:{status:'not_run',reason:'This version does not control the editor or collect verified game execution results.'}};
  }
  // What a server graph can call (nodes.d.ts) and listen to (events-payload.d.ts), parsed once into plain records.
  docIndex() {
    if(this._docIndex)return this._docIndex;
    const root=path.join(packageRoot,'dist','src','definitions'),cjk=/[\u3400-\u9fff]/,entries=[];
    const docAbove=(lines,i)=>{
      if(!/\*\/\s*$/.test(lines[i-1]||''))return [];
      let j=i-1;while(j>0&&!/\/\*\*/.test(lines[j]))j--;
      return lines.slice(j,i).map(l=>l.replace(/^\s*\/?\*+\/?\s?/,'').trim());
    };
    const describe=doc=>{
      const head=[],params=[];let returns='',current=null;
      for(const line of doc){
        if(!line)continue;
        const p=/^@param\s+(\S+)\s*(.*)$/.exec(line),r=/^@returns?\s*(.*)$/.exec(line);
        if(p){current={name:p[1],en:p[2],zh:''};params.push(current);}
        else if(r){current=null;returns=r[1];}
        else if(current){if(cjk.test(line)){if(!current.zh)current.zh=line;}else current.en=(current.en+' '+line).trim();}
        else if(returns&&!cjk.test(line))returns=(returns+' '+line).trim();
        else head.push(line);
      }
      return {summary:head.filter(l=>!cjk.test(l)).join(' ').slice(0,500),zh:head.filter(l=>cjk.test(l)).join(' ').slice(0,300),params,returns:returns.slice(0,200)};
    };
    const nodes=fs.readFileSync(path.join(root,'nodes.d.ts'),'utf8').split('\n'),seen=new Map();
    for(let i=0;i<nodes.length;i++){
      // Names starting with _ are the compiler's own; generic nodes are written name<T ...>(...).
      const m=/^    ([A-Za-z][A-Za-z0-9_]*)(?:<[^(]*>)?\(/.exec(nodes[i]);if(!m||m[1]==='constructor')continue;
      let signature=nodes[i].trim();
      // A structured return type runs over several lines, with a comment above each field.
      if(/\{\s*$/.test(nodes[i]))for(let k=i+1;k<nodes.length&&k<i+200;k++){
        const t=nodes[k].trim();
        if(nodes[k].startsWith('    }')){signature+=' '+t;break;}
        if(t&&!/^(\/\*\*|\*)/.test(t))signature+=' '+t;
      }
      const earlier=seen.get(m[1]);if(earlier){earlier.overloads++;continue;}
      const entry={kind:'node',name:m[1],signature:signature.replace(/\s+/g,' ').slice(0,700),overloads:1,...describe(docAbove(nodes,i))};
      seen.set(m[1],entry);entries.push(entry);
    }
    const events=fs.readFileSync(path.join(root,'events-payload.d.ts'),'utf8').split('\n');
    for(let i=0;i<events.length;i++){
      const m=/^    (when[A-Za-z0-9]+): \{\s*$/.exec(events[i]);if(!m)continue;
      const fields=[];
      for(let k=i+1;k<events.length&&!events[k].startsWith('    }');k++){
        const f=/^        ([A-Za-z0-9_]+)\??: (.+);\s*$/.exec(events[k]);
        if(f)fields.push({name:f[1],type:f[2],zh:docAbove(events,k).filter(l=>cjk.test(l)).join(' ')});
      }
      const about=describe(docAbove(events,i));
      entries.push({kind:'event',name:m[1],signature:`.on('${m[1]}',(evt,f)=>{...})  evt: { ${fields.map(f=>f.name+': '+f.type).join('; ')} }`.slice(0,700),overloads:1,
        summary:about.summary,zh:about.zh,params:fields.map(f=>({name:'evt.'+f.name,en:f.type,zh:f.zh})),returns:''});
    }
    // Enumerations a node parameter can ask for, with their members (imported from 'genshin-ts/definitions/enum').
    const enums=fs.readFileSync(path.join(root,'enum.d.ts'),'utf8');
    for(const m of enums.matchAll(/class ([A-Za-z0-9_]+) extends enumeration \{([\s\S]*?)\n\}/g)){
      const members=[...m[2].matchAll(/static readonly ([A-Za-z0-9_]+): /g)].map(x=>x[1]);
      entries.push({kind:'enum',name:m[1],signature:`import { ${m[1]} } from 'genshin-ts/definitions/enum'  // ${members.map(x=>m[1]+'.'+x).join(', ')}`.slice(0,900),overloads:1,
        summary:'Enumeration with members '+members.join(', '),zh:'',params:[],returns:''});
    }
    // Some parameter types are other enumerations under a second name (export { MovementMode as FixedPointMotionDeviceMotionType }).
    for(const m of enums.matchAll(/export \{ ([A-Za-z0-9_]+) as ([A-Za-z0-9_]+) \};/g)){
      const real=entries.find(e=>e.kind==='enum'&&e.name===m[1]);
      if(real)entries.push({...real,name:m[2],summary:`Same enumeration as ${m[1]}: import and use ${m[1]}. `+real.summary});
    }
    return this._docIndex=entries;
  }
  searchDocs({query,limit=6,scope='server'}) {
    const source='genshin-ts@0.2.2 bundled definitions',terms=query.toLowerCase().split(/\s+/).filter(Boolean);
    if(scope==='server'){
      const index=this.docIndex();
      if(query.trim()==='*')return {query,source,nodes:index.filter(e=>e.kind==='node').map(e=>e.name),events:index.filter(e=>e.kind==='event').map(e=>e.name),enums:index.filter(e=>e.kind==='enum').map(e=>e.name),
        note:'Every node method, event and enumeration of a server graph. Search a name or a word from it for the signature, parameters or members.'};
      const hits=[];
      for(const e of index){
        const name=e.name.toLowerCase(),zh=e.zh.toLowerCase(),summary=e.summary.toLowerCase();
        const rest=(e.params.map(p=>p.name+' '+p.en+' '+p.zh).join(' ')+' '+e.signature).toLowerCase();
        let score=0,matched=0;
        for(const t of terms){
          const s=name===t?100:name.startsWith(t)?40:name.includes(t)?25:zh.includes(t)?12:summary.includes(t)?6:rest.includes(t)?1:-1;
          if(s>=0){score+=s;matched++;}
        }
        if(matched)hits.push([score,e,matched]);
      }
      // Entries that have every word come first; when none has them all, the ones that have the most words are shown.
      const most=Math.max(0,...hits.map(h=>h[2])),best=hits.filter(h=>h[2]===most);
      best.sort((a,b)=>b[0]-a[0]||a[1].name.length-b[1].name.length);
      const usage='Server graph nodes are called as f.<name>(...) inside an event handler; events are listened to with .on(name, handler). scope "raw" searches every bundled definition file instead (client graphs, enums).';
      return {query,source,total:best.length,results:best.slice(0,limit).map(([,e])=>e),
        otherMatches:best.slice(limit,limit+80).map(([,e])=>e.name),
        note:!best.length?'Nothing matches. Search one word from a node name (English) or from its Chinese name; "*" lists every node, event and enumeration.'
          :most<terms.length?`No entry has all ${terms.length} words; these have ${most} of them. `+usage:usage};
    }
    const root=path.join(packageRoot,'dist','src','definitions'),results=[];
    for(const file of files(root).filter(p=>p.endsWith('.d.ts'))) {
      const lines=fs.readFileSync(file,'utf8').split('\n');
      for(let i=0;i<lines.length;i++)if(terms.every(t=>lines[i].toLowerCase().includes(t))) {
        results.push({file:path.relative(packageRoot,file),line:i+1,text:lines.slice(Math.max(0,i-10),Math.min(lines.length,i+16)).join('\n')});
        if(results.length>=limit)return {query,source,results};
      }
    }
    return {query,source,results};
  }
}
