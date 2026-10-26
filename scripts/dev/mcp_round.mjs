// A whole round through MCP tools only: a level built on a blank save from a test json of examples/, then played.
// The one non-MCP step is generating the graph source from the GUIDs, which stands in for the AI writing code.
// Env: ROUND_OUT (progress json), ROUND_ARGS (json: day, night, coins, durationSeconds, screenshotsAt, screenshotWidth, inputs, scenes = piece-list files in examples/kingdom, generator = graph generator script there, generatorArgs = more arguments for it, prefabs = scene_add_prefab arguments (their ids reach the generator as 'prefab:<name>'), hostilePairs = scene_set_faction_hostility pairs, dir = folder under examples (default kingdom), namePrefix = prefix of the pieces whose GUIDs the generator gets (default KV_), baseName = name of the save to start from, sceneOffset = scene_build_blocks offset, addGraph = scene_add_graph arguments, generatorData = extra entries for the generator's guids.json, level = scene_set_level_settings arguments, patrolTemplates = scene_set_patrol templates instead of kv_patrol.json, camera = scene_set_camera arguments, components = scene_add_components arguments, bars = scene_add_progress_bar arguments, statuses = scene_add_unit_status arguments, environments = scene_add_environment arguments, lights = scene_add_light arguments, classes = scene_set_class arguments, signals = signal names for scene_add_signal, spawn = scene_set_spawn arguments, points = scene_add_preset_point arguments, timers = scene_add_global_timer arguments, clocks = scene_add_timer_display arguments, graphs = several graphs {key, name, attachTo | attachToPrefab} instead of addGraph)
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
const root=process.cwd(),out=process.env.ROUND_OUT,args=JSON.parse(fs.readFileSync(process.env.ROUND_ARGS,'utf8'));
const kingdom=path.join(root,'examples',args.dir||'kingdom'),read=f=>JSON.parse(fs.readFileSync(path.join(kingdom,f),'utf8'));
const workspace=path.join(root,'workspace','round-'+Date.now());
const client=new Client({name:'kingdom-round',version:'1'});
if(args.batch===false)process.env.MILIASTRA_STEP_TOOLS='1';
const transport=new StdioClientTransport({command:process.execPath,args:[path.join(root,'src/server.mjs')],cwd:root,env:{...process.env,MILIASTRA_WORKSPACE:workspace},stderr:'pipe'});
const report={workspace,calls:[]};const save=()=>fs.writeFileSync(out,JSON.stringify(report,null,1));
async function call(name,a){
  const t=Date.now(),r=await client.callTool({name,arguments:a},undefined,{timeout:240000});
  // The arguments and the ids each call returned are kept: scripts/dev/write_walkthrough.mjs turns a report into the
  // walkthrough of an example (examples/<dir>/WALKTHROUGH.md), which read_knowledge serves to a client that has no files.
  const got=r.structuredContent||{},returned=Object.fromEntries(['graphId','name','prefabId','statusId','environmentId','defaultEnvironmentId','pointId','signalId','controlId','currencyId','backpackTemplateId','skillId','itemId','shopTemplateId','controlGroupIndex','projectId','total'].filter(k=>got[k]!==undefined).map(k=>[k,got[k]]));
  // Arguments the schema rejects come back as text only.
  const error=r.isError?(r.structuredContent??{text:(r.content||[]).map(c=>c.text).join(' ').slice(0,600)}):undefined;
  report.calls.push({name,seconds:Math.round((Date.now()-t)/100)/10,arguments:a,returned,error});save();
  if(r.isError)throw new Error(name+' '+JSON.stringify(error));
  return r.structuredContent;
}
async function finish(runId){
  for(;;){
    await new Promise(r=>setTimeout(r,5000));
    const s=(await client.callTool({name:'playtest_status',arguments:{runId,includeScreenshots:false,maxPrints:2000}})).structuredContent;
    if(s.state!=='running'&&s.state!=='starting'){report.calls.push({name:'playtest_status',state:s.state,elapsed:s.elapsedSeconds,error:s.error});save();if(s.state!=='succeeded')throw new Error('run failed: '+s.error);return s;}
  }
}
try{
  await client.connect(transport);
  // What playtest_start would refuse is checked before anything is built: a round spends minutes on the scene and the
  // graphs before it gets there.
  {
    const loggedGraphs=(args.graphs||[]).filter(g=>g.log!==false&&(!g.kind||g.kind==='server')),longHolds=(args.inputs||[]).filter(i=>(i.holdMs||0)>60000);
    if(loggedGraphs.length>10)throw new Error('more than 10 graphs to log; mark the ones that print nothing with log: false ('+loggedGraphs.map(g=>g.name).join(', ')+')');
    if(longHolds.length)throw new Error('holdMs above 60000 in the inputs at '+longHolds.map(i=>i.at).join(', ')+': split the hold in two');
    if((args.screenshotsAt||[]).length>120)throw new Error('more than 120 screenshots');
    if((args.durationSeconds||0)>900)throw new Error('durationSeconds above 900');
  }
  // ROUND_REUSE=<report of an earlier round>: when everything but the graphs and the play is as it was in that round
  // (same scenes, prefabs, components, skills, bars...), go on from the save that round played: only the graphs whose
  // source changed are written, and neither the base map is opened nor the scene imported again. That is four minutes
  // of a round, and most rounds change one graph. What "the play" is: PLAY_ONLY below, and which graphs are logged.
  const PLAY_ONLY=['about','inputs','durationSeconds','screenshotsAt','screenshotWidth','bursts','burstWidth','readTextAt','recordAudio','expect','day','night','coins','generatorArgs','generatorData'];
  const setupHash=createHash('sha256').update(JSON.stringify(Object.entries(args).filter(([k])=>!PLAY_ONLY.includes(k)).map(([k,v])=>[k,k==='graphs'?v.map(({log,...g})=>g):k==='scenes'?v.map(f=>fs.readFileSync(path.join(kingdom,f),'utf8')):v]))).digest('hex');
  let prior=null;try{if(process.env.ROUND_REUSE)prior=JSON.parse(fs.readFileSync(process.env.ROUND_REUSE,'utf8'));}catch{}
  const dry=process.env.ROUND_DRY==='1',reusable=!dry&&prior?.setup?.hash===setupHash&&prior.candidate&&fs.existsSync(prior.candidate);
  if(process.env.ROUND_REUSE&&!reusable)(report.warnings??=[]).push('ROUND_REUSE: the setup differs from that round (or its save is gone); building everything.');
  const setUp=async()=>{
  // The base map: a save of the creator's, picked by its name in the save list (args.baseName, e.g. a brand-new blank
  // map), or the map the first Kingdom was built on, which carries hand-made prefabs, a graph and paths.
  let base;
  if(args.baseName){
    const found=(await call('list_maps',{})).maps.filter(m=>m.name===args.baseName);
    if(!found.length)throw new Error('baseName matches no save: '+args.baseName);
    // A round that failed between importing and saving leaves a copy that still carries the base's name: the base is
    // the one written longest ago.
    found.sort((a,b)=>String(a.modifiedAt).localeCompare(String(b.modifiedAt)));
    if(found.length>1)(report.warnings??=[]).push('baseName matches '+found.length+' saves; using the oldest, '+found[0].path);
    base={mapPath:found[0].path};
  }else throw new Error('the test json needs baseName: the name of a blank save made in the game (我的奇域 > 新建存档) and saved once');
  if(args.camera)base.mapPath=(await call('scene_set_camera',{mapPath:base.mapPath,...args.camera,outputName:'kingdom-base-camera'})).mapPath;
  // ROUND_DRY=1 rehearses everything that does not touch the game window: no editor, no scene import, no playtest. The
  // scene pieces are then missing from the save, which is fine for graphs that only use prefabs.
  if(!dry)await finish((await call('editor_open_map',{mapPath:base.mapPath})).runId);
  const scenes=(args.scenes||['kingdom_v2_scene.json']).map(read);report.warnings??=[];report.ranges=[];
  for(const scene of scenes){const built=await call('scene_build_blocks',{name:scene.name,blocks:scene.blocks,...(args.sceneOffset?{offset:args.sceneOffset}:{})});report.warnings.push(...(built.warnings||[]));report.ranges.push(built.entityIds);}
  // (A level with nothing to place, a check of the screen alone, has no pack to import.)
  if(!dry&&scenes.length){const imported=await finish((await call('scene_import_assets',{packs:scenes.map(s=>s.name)})).runId);report.dropped=imported.droppedPieces;}
  const listed=await call('scene_list_entities',dry?{mapPath:base.mapPath,namePrefix:args.namePrefix||'KV_'}:{namePrefix:args.namePrefix||'KV_'});report.entities=listed.total;report.save=listed.mapPath;
  // Things the graph creates at run time at a chosen size: one prefab each (args.prefabs = scene_add_prefab arguments).
  let mapPath=listed.mapPath;const extra=[];
  // Rehearsing, the scene was not imported, so a prefab made from a placed creature (fromEntity) is stood in for by an
  // object (dryAsset, or a coin): the graphs and components still go through every tool, only the creature is missing.
  for(const [i,{dryAsset,...prefab}] of (args.prefabs||[]).entries()){
    const use=dry&&prefab.fromEntity!==undefined?{asset:dryAsset??10005009,name:prefab.name}:prefab;
    const made=await call('scene_add_prefab',{mapPath,...use,outputName:'kingdom-prefab-'+i});mapPath=made.mapPath;
    // A mechanism asset's built-in animation: its status id reaches the generator as 'presetStatus:<prefab name>'.
    if(made.presetStatus)extra.push(['presetStatus:'+made.name,made.presetStatus.statusId]);
  }
  // Things made of shapes (scene_add_shape_prefab): args.shapePrefabs = its arguments, with partsFile (a json list of
  // parts in the example's folder) in place of parts when the list is long. Ids reach the generator as 'prefab:<name>'.
  for(const [i,{partsFile,...shaped}] of (args.shapePrefabs||[]).entries()){
    const parts=partsFile?read(partsFile):shaped.parts;
    const made=await call('scene_add_shape_prefab',{mapPath,...shaped,parts,outputName:'kingdom-shapes-'+i});mapPath=made.mapPath;
  }
  if(args.hostilePairs)mapPath=(await call('scene_set_faction_hostility',{mapPath,hostilePairs:args.hostilePairs,outputName:'kingdom-factions'})).mapPath;
  if(args.level)mapPath=(await call('scene_set_level_settings',{mapPath,...args.level,outputName:'kingdom-level'})).mapPath;
  // Unit statuses and skies the graphs use: args.statuses / args.environments = lists of scene_add_unit_status /
  // scene_add_environment arguments. Their ids reach the generator as 'status:<name>' and 'environment:<name>'.
  for(const [i,status] of (args.statuses||[]).entries()){const made=await call('scene_add_unit_status',{mapPath,...status,outputName:'kingdom-status-'+i});mapPath=made.mapPath;extra.push(['status:'+made.name,made.statusId]);}
  for(const [i,sky] of (args.environments||[]).entries()){const made=await call('scene_add_environment',{mapPath,...sky,outputName:'kingdom-sky-'+i});mapPath=made.mapPath;extra.push(['environment:'+made.name,made.environmentId],['environment:default',made.defaultEnvironmentId]);}
  // Money: args.currencies = a list of scene_add_currency arguments (their ids reach the generator as 'currency:<name>').
  for(const [i,currency] of (args.currencies||[]).entries()){const made=await call('scene_add_currency',{mapPath,...currency,outputName:'kingdom-currency-'+i});mapPath=made.mapPath;extra.push(['currency:'+made.name,made.currencyId]);}
  // Where players start and named places the graphs read: args.spawn = scene_set_spawn arguments, args.points = a list of
  // scene_add_preset_point arguments (their ids reach the generator as 'point:<name>').
  if(args.spawn)mapPath=(await call('scene_set_spawn',{mapPath,...args.spawn,outputName:'kingdom-spawn'})).mapPath;
  for(const [i,point] of (args.points||[]).entries()){const made=await call('scene_add_preset_point',{mapPath,...point,outputName:'kingdom-point-'+i});mapPath=made.mapPath;extra.push(['point:'+made.name,made.pointId]);}
  // Level-wide broadcasts the graphs send and hear: args.signals = a list of signal names (scene_add_signal).
  // An entry is a name, or {name, parameter} for a signal that carries one string.
  for(const [i,signal] of (args.signals||[]).entries())mapPath=(await call('scene_add_signal',{mapPath,...(typeof signal==='string'?{name:signal}:signal),outputName:'kingdom-signal-'+i})).mapPath;
  // What the player's class may do and which camera it uses: args.classes = a list of scene_set_class arguments.
  for(const [i,one] of (args.classes||[]).entries())mapPath=(await call('scene_set_class',{mapPath,...one,outputName:'kingdom-class-'+i})).mapPath;
  // Lamps: args.lights = a list of scene_add_light arguments (environment names one of the skies above).
  for(const [i,light] of (args.lights||[]).entries())mapPath=(await call('scene_add_light',{mapPath,...light,outputName:'kingdom-light-'+i})).mapPath;
  // A new map has no node graph: scene_add_graph makes the one the rules go into (args.addGraph = its arguments).
  // args.graphs = several graphs, each {key, name, kind, attachTo | attachToPrefab}: the generator is run once per graph
  // with its key as last argument, and each graph is one project applied on the save the one before returned. The graphs
  // are added before the components so that an option can name a filter graph by its key (filterGraph: "<key>").
  const graphs=[];
  if(args.graphs){
    for(const [i,{key,log,...one}] of args.graphs.entries()){const made=await call('scene_add_graph',{mapPath,...one,outputName:'kingdom-graph-'+i});mapPath=made.mapPath;graphs.push({key,graphId:made.graphId,name:made.name,client:Boolean(one.kind&&one.kind!=='server'),log:log!==false});}
  }else{
    const graph=args.addGraph?await call('scene_add_graph',{mapPath,...args.addGraph,outputName:'kingdom-graph'}):{graphId:1073741908,name:'_GSTS_KingdomEconomy'};
    if(graph.mapPath)mapPath=graph.mapPath;
    graphs.push({key:null,graphId:graph.graphId,name:graph.name});
  }
  // Components the platform provides (collision triggers, option tabs, custom variables, motions...): args.components = a
  // list of scene_add_components arguments.
  const byKey=key=>{const found=graphs.find(g=>g.key===key);if(!found)throw new Error('filterGraph names no graph: '+key);return found.graphId;};
  // Skills: args.skills = a list of {name, graph: "<key of a characterSkill graph>"} (scene_add_skill; ids reach the
  // generator as 'skill:<name>').
  // Items and shops: args.items = scene_add_item arguments (ids reach the generator as 'item:<name>'; useGraph is the key
  // of an item graph, for a consumable), args.shops =
  // scene_add_shop arguments.
  for(const [i,{useGraph,...item}] of (args.items||[]).entries()){const made=await call('scene_add_item',{mapPath,...item,...(useGraph?{useGraphId:byKey(useGraph)}:{}),outputName:'kingdom-item-'+i});mapPath=made.mapPath;extra.push(['item:'+made.name,made.itemId]);}
  // Drops: args.drops = scene_add_prefab arguments with drop {item, amount}; made after the items they give (ids reach
  // the generator as 'prefab:<name>', like the other prefabs).
  for(const [i,drop] of (args.drops||[]).entries()){const made=await call('scene_add_prefab',{mapPath,...drop,outputName:'kingdom-drop-'+i});mapPath=made.mapPath;}
  for(const [i,shop] of (args.shops||[]).entries()){const made=await call('scene_add_shop',{mapPath,...shop,outputName:'kingdom-shop-'+i});mapPath=made.mapPath;extra.push(['shop:'+made.name,made.shopTemplateId]);}
  for(const [i,{graph,...skill}] of (args.skills||[]).entries()){const made=await call('scene_add_skill',{mapPath,...skill,graphId:byKey(graph),outputName:'kingdom-skill-'+i});mapPath=made.mapPath;extra.push(['skill:'+made.name,made.skillId]);}
  // Complex creatures: args.creatureSkills = scene_add_creature_skill arguments with graph: "<key of a creatureSkill
  // graph>" (ids reach the generator as 'creatureSkill:<name>'); args.creatureLogic = scene_set_creature_logic arguments
  // with decisionGraph: "<key of a creatureDecision graph>".
  for(const [i,{graph,...skill}] of (args.creatureSkills||[]).entries()){const made=await call('scene_add_creature_skill',{mapPath,...skill,graphId:byKey(graph),outputName:'kingdom-cskill-'+i});mapPath=made.mapPath;extra.push(['creatureSkill:'+made.name,made.skillId]);}
  for(const [i,{decisionGraph,...logic}] of (args.creatureLogic||[]).entries()){
    // In a rehearsal the prefabs made from placed creatures are stand-ins (nothing was imported), which this tool
    // rightly refuses: the step is left out there.
    try{mapPath=(await call('scene_set_creature_logic',{mapPath,...logic,decisionGraphId:byKey(decisionGraph),outputName:'kingdom-clogic-'+i})).mapPath;}
    catch(e){if(!(dry&&/NOT_A_COMPLEX_CREATURE/.test(String(e))))throw e;}
  }
  for(const [i,component] of (args.components||[]).entries()){
    const resolved=component.optionTab?{...component,optionTab:{...component.optionTab,options:component.optionTab.options.map(({filterGraph,...o})=>filterGraph?{...o,filterGraphId:byKey(filterGraph)}:o)}}:component;
    mapPath=(await call('scene_add_components',{mapPath,...resolved,outputName:'kingdom-components-'+i})).mapPath;
  }
  // Global timers and the clocks that show them: args.timers = scene_add_global_timer arguments, args.clocks =
  // scene_add_timer_display arguments.
  for(const [i,timer] of (args.timers||[]).entries())mapPath=(await call('scene_add_global_timer',{mapPath,...timer,outputName:'kingdom-timer-'+i})).mapPath;
  for(const [i,clock] of (args.clocks||[]).entries()){const made=await call('scene_add_timer_display',{mapPath,...clock,outputName:'kingdom-clock-'+i});mapPath=made.mapPath;extra.push(['clock:'+made.name,made.controlId]);}
  // Bars on the screen that follow a player variable: args.bars = a list of scene_add_progress_bar arguments.
  // Card selectors: args.cardSelectors = a list of scene_add_card_selector arguments (ids reach the generator as 'cards:<name>').
  for(const [i,cards] of (args.cardSelectors||[]).entries()){const made=await call('scene_add_card_selector',{mapPath,...cards,outputName:'kingdom-cards-'+i});mapPath=made.mapPath;extra.push(['cards:'+made.name,made.selectorId]);}
  // Text boxes of the ordinary interface: args.textBoxes = a list of scene_add_text_box arguments (shown on accounts of 奇匠 level 2 and up).
  for(const [i,box] of (args.textBoxes||[]).entries()){const made=await call('scene_add_text_box',{mapPath,...box,outputName:'kingdom-text-'+i});mapPath=made.mapPath;extra.push(['text:'+made.name,made.controlId]);}
  // Pictures and coloured rectangles on the screen: args.images = a list of scene_add_image arguments (before the bars, so that a panel lies under them).
  for(const [i,image] of (args.images||[]).entries()){const made=await call('scene_add_image',{mapPath,...image,outputName:'kingdom-image-'+i});mapPath=made.mapPath;extra.push(['image:'+made.name,made.controlId]);}
  for(const [i,bar] of (args.bars||[]).entries()){const made=await call('scene_add_progress_bar',{mapPath,...bar,outputName:'kingdom-bar-'+i});mapPath=made.mapPath;extra.push(['bar:'+made.name,made.controlId]);}
  // Client scripts and the client controls they run on: args.clientScripts = [{name, file}] (a .lua beside the test),
  // args.clientUis = a list of scene_add_client_ui arguments.
  for(const [i,script] of (args.clientScripts||[]).entries())mapPath=(await call('scene_set_client_script',{mapPath,name:script.name,sourceFile:path.join(kingdom,script.file),...(script.variables?{variables:script.variables}:{}),outputName:'kingdom-script-'+i})).mapPath;
  // Templates of client controls (args.clientTemplates = scene_add_client_template arguments) come before the interfaces that name them.
  for(const [i,template] of (args.clientTemplates||[]).entries())mapPath=(await call('scene_add_client_template',{mapPath,template,outputName:'kingdom-clienttemplate-'+i})).mapPath;
  for(const [i,ui] of (args.clientUis||[]).entries()){const made=await call('scene_add_client_ui',{mapPath,...ui,outputName:'kingdom-clientui-'+i});mapPath=made.mapPath;extra.push(['clientui:'+made.name,made.containerId]);}
  // Buttons on the screen: args.buttons = scene_add_button arguments (the index each reports reaches the generator as 'button:<name>').
  for(const [i,button] of (args.buttons||[]).entries()){const made=await call('scene_add_button',{mapPath,...button,outputName:'kingdom-button-'+i});mapPath=made.mapPath;extra.push(['button:'+made.name,made.controlGroupIndex]);}
  // Prefabs changed after they were made (scale, asset, health): args.prefabUpdates = scene_update_prefab arguments.
  for(const [i,update] of (args.prefabUpdates||[]).entries())mapPath=(await call('scene_update_prefab',{mapPath,...update,outputName:'kingdom-prefab-update-'+i})).mapPath;
  // Respawn points and the number of players: args.respawnPoints = scene_add_respawn_point arguments (the number each
  // gets reaches the generator as 'respawn:<name>'), args.playerCount = scene_set_player_count arguments.
  for(const [i,point] of (args.respawnPoints||[]).entries()){const made=await call('scene_add_respawn_point',{mapPath,...point,outputName:'kingdom-respawn-'+i});mapPath=made.mapPath;extra.push(['respawn:'+made.name,made.respawnId]);}
  if(args.playerCount)mapPath=(await call('scene_set_player_count',{mapPath,...args.playerCount,outputName:'kingdom-players'})).mapPath;
  // How a character comes back: args.revive = scene_set_revive arguments.
  if(args.revive)mapPath=(await call('scene_set_revive',{mapPath,...args.revive,outputName:'kingdom-revive'})).mapPath;
  const prefabs=(await call('scene_list_prefabs',{mapPath})).prefabs;
  return {mapPath,graphs,prefabs,extra,entities:listed.entities};
  };
  const logOf=key=>(args.graphs||[]).find(g=>g.key===key)?.log!==false;
  // The save of the earlier round lies in that round's workspace, and the tools read only saves of their own: a copy.
  const carried=path.join(workspace,'carried-over.gil');if(reusable)fs.copyFileSync(prior.candidate,carried);
  const state=reusable?{...prior.setup.state,mapPath:carried,graphs:prior.setup.state.graphs.map(g=>({...g,log:logOf(g.key)}))}:await setUp();
  let {mapPath}=state;const {graphs,prefabs,extra}=state,listed={entities:state.entities},before=reusable?(prior.sources||{}):{};
  if(reusable)report.reused=process.env.ROUND_REUSE;
  report.setup={hash:setupHash,state:{...state,mapPath:undefined}};report.sources={};
  report.limits=[];const batch=[];
  for(const graph of graphs){
    const tag=graph.key||'kingdom',guids=path.join(workspace,'guids-'+tag+'.json'),source=path.join(workspace,tag+'.ts');
    fs.writeFileSync(guids,JSON.stringify(Object.fromEntries([...listed.entities.map(e=>[e.name,e.guid]),...prefabs.map(p=>['prefab:'+p.name,p.prefabId]),['graph:id',graph.graphId],['graph:name',graph.name],...graphs.filter(g=>g.key).map(g=>['graph:'+g.key,g.graphId]),...extra,...Object.entries(args.generatorData||{})])));
    execFileSync(process.env.MILIASTRA_PYTHON||'python',[path.join(kingdom,args.generator||'gen_kingdom_v2.py'),guids,source,String(args.day),String(args.night),String(args.coins),...(args.generatorArgs||[]).map(String),...(graph.key?[graph.key]:[])]);
    // All graphs go in one write_graphs call after the loop; batch: false takes the five steps for each instead.
    if(args.batch!==false){const code=fs.readFileSync(source,'utf8');report.sources[graph.graphId]=code;if(before[graph.graphId]!==code)batch.push({graphId:graph.graphId,code});continue;}
    const project=await call('create_project',{projectId:tag.toLowerCase(),mapPath,targetGraphId:graph.graphId});
    await call('update_logic',{projectId:project.projectId,code:fs.readFileSync(source,'utf8')});
    const build=await call('build_project',{projectId:project.projectId});
    report.limits.push({graph:graph.name,...build.limits,counting:undefined,runtime:undefined});
    const preview=await call('preview_changes',{projectId:project.projectId,buildId:build.buildId,destination:'copy'});
    const applied=await call('apply_build',{projectId:project.projectId,buildId:build.buildId,destination:'copy',expectedSha256:preview.expectedSha256});
    mapPath=applied.target;
  }
  // All in one call (write_graphs compiles the graphs of a call together). In a round that goes on from an earlier one,
  // these are only the graphs whose source changed.
  report.graphsWritten=batch.length;
  for(let i=0,per=Number(process.env.ROUND_GRAPH_BATCH||60);i<batch.length;i+=per){const all=await call('write_graphs',{mapPath,graphs:batch.slice(i,i+per)});if(all.failed)throw new Error('write_graphs '+JSON.stringify(all.failed).slice(0,900));mapPath=all.mapPath;report.limits.push(...all.written.map(w=>({graph:graphs.find(g=>g.graphId===w.graphId)?.name,...w.limits,counting:undefined,runtime:undefined})));}
  report.candidate=mapPath;
  if(dry){report.components=(await call('scene_list_components',{mapPath,prefab:(args.components||[{}])[0].prefab||'player'})).found;report.interface=(await call('inspect_map',{mapPath})).graphs.map(g=>({id:g.id,name:g.name,type:g.type,nodeCount:g.nodeCount}));report.done=true;report.dry=true;save();await client.close();process.exit(0);}
  // The log window lets at most 10 graphs be ticked: a graph entry with log: false is left out (one that prints nothing).
  const logged=graphs.filter(g=>!g.client&&g.log!==false);
  if(logged.length>10)throw new Error('more than 10 graphs to log; mark the ones that print nothing with log: false ('+logged.map(g=>g.name).join(', ')+')');
  const started=await call('playtest_start',{mapPath,...(logged.length>1?{graphNames:logged.map(g=>g.name)}:logged.length?{graphName:logged[0].name}:{}),durationSeconds:args.durationSeconds,screenshotsAt:args.screenshotsAt,...(args.screenshotWidth?{screenshotWidth:args.screenshotWidth}:{}),...(args.bursts?{bursts:args.bursts}:{}),...(args.expect?{expect:args.expect}:{}),...(args.burstWidth?{burstWidth:args.burstWidth}:{}),inputs:args.inputs||[],readTextAt:args.readTextAt||[],recordAudio:!!args.recordAudio,bakeNavigation:!!args.bakeNavigation,...(args.trackPlayer?{trackPlayer:args.trackPlayer}:{}),...(args.recordVideo?{recordVideo:args.recordVideo}:{}),...(args.replaceSave?{replaceSave:true}:{})});
  const played=await finish(started.runId);
  report.runDir=played.runDir;report.serverMessage=played.serverMessage;report.levelEndedAt=played.levelEndedAt;report.warning=played.warning;report.shots=played.screenshots;report.expectations=played.expectations;report.clientCheck=started?.clientCheck;report.prints=played.log?.prints;report.screenTexts=played.screenTexts;report.inputsMissed=played.inputsMissed;report.inputsLate=played.inputsLate;report.audio=played.audio;report.probe=played.probe;report.playerTrack=played.playerTrack;report.video=played.video;report.done=true;save();
}catch(e){report.error=String(e?.stack||e);save();}
finally{await client.close();}
