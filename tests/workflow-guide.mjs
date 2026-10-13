// What a new AI client is told first must match what the server can do: every tool the instructions, the workflow
// resource and get_capabilities name has to be a registered tool, and the workflow has to cover the whole path.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-guide-'));
const client=new Client({name:'workflow-guide-test',version:'1'});
await client.connect(new StdioClientTransport({command:process.execPath,args:[path.join(root,'src/server.mjs')],cwd:root,env:{...process.env,MILIASTRA_WORKSPACE:workspace},stderr:'pipe'}));
try{
 const tools=new Set((await client.listTools()).tools.map(t=>t.name));
 const workflow=(await client.readResource({uri:'miliastra://workflow'})).contents[0].text,instructions=client.getInstructions();
 const named=text=>[...new Set(text.match(/\b(?:scene|playtest|editor|effect|search|list|inspect|create|update|build|preview|apply|get)_[a-z_]+\b/g)||[])];
 for(const name of [...named(workflow),...named(instructions)])assert.ok(tools.has(name),'the guide names a tool that does not exist: '+name);
 for(const name of ['scene_search_assets','scene_asset_images','scene_build_blocks','editor_open_map','scene_import_assets','scene_list_entities','scene_remove_entities','scene_set_camera','scene_add_prefab','scene_update_prefab',
  'scene_set_faction_hostility','scene_set_level_settings','scene_add_graph','scene_add_components','scene_add_progress_bar','scene_add_text_box','scene_add_image',
  'scene_set_spawn','scene_add_preset_point','scene_add_respawn_point','scene_set_player_count','scene_set_revive','scene_set_class','scene_add_signal','scene_add_global_timer','scene_add_timer_display','scene_add_light','scene_add_environment','scene_add_unit_status','scene_add_skill','scene_add_currency','scene_add_item','scene_add_shop','scene_add_button','write_graphs','search_node_docs','effect_catalog','playtest_start','playtest_status','publish_kit'])
  assert.ok(workflow.includes(name),'the workflow leaves out '+name);
 assert.match(instructions,/miliastra:\/\/workflow/);assert.match(instructions,/miliastra:\/\/platform-rules/);
 // One way to write graphs is shown: the step tools and the patrol tools (dead since the game update of 2026-10-09) are not on the list.
 for(const gone of ['create_project','update_logic','build_project','preview_changes','apply_build','restore_backup','get_test_results','validate_project','get_project','scene_set_patrol','scene_list_paths','scene_move_path_points'])assert.ok(!tools.has(gone),gone+' is on the list of tools');
 assert.ok(tools.has('write_graphs')&&tools.has('scene_set_client_script')&&tools.has('scene_add_client_ui'));
 assert.ok(![...tools].some(n=>n.startsWith('creator_'))&&!/creator_/.test(instructions+workflow),'the recipe system (creator_*) is off the tool list since 2026-10-12');
 // Several node searches in one call, each with its own results; what all of them repeat is said once.
 const docs=(await client.callTool({name:'search_node_docs',arguments:{queries:['createPrefab','teleportPlayer','zzzznothing'],limit:2}})).structuredContent;
 assert.equal(docs.searches.length,3);assert.equal(docs.searches[0].results[0].name,'createPrefab');assert.ok(docs.searches[1].results.length>=1&&docs.searches[1].results.length<=2);
 assert.equal(docs.searches[2].total,0);assert.match(docs.searches[2].note,/Nothing matches/);assert.ok(docs.note&&!('note' in docs.searches[0]),'the usage is said once');
 assert.equal((await client.callTool({name:'search_node_docs',arguments:{query:'createPrefab'}})).structuredContent.results[0].name,'createPrefab');
 assert.ok((await client.callTool({name:'search_node_docs',arguments:{}})).isError,'neither query nor queries');
 // A run that does not exist is refused at once, also when asked to wait for it.
 const before=Date.now();assert.ok((await client.callTool({name:'playtest_status',arguments:{runId:'00000000-0000-4000-8000-000000000000',waitSeconds:20}})).isError);assert.ok(Date.now()-before<5000);
 // The picture library: the categories with their ranges of ids, and the sheets of one category as images.
 const library=(await client.callTool({name:'image_catalog',arguments:{}})).structuredContent;
 assert.ok(library.categories.length>=14&&library.total>700,'the picture library is thin: '+library.total);
 for(const c of library.categories){assert.ok(c.lastId>=c.firstId&&c.pictures===c.lastId-c.firstId+1,'the ids of '+c.category+' do not run without gaps');assert.ok(c.pages>=1);}
 const items=await client.callTool({name:'image_catalog',arguments:{category:'item'}});
 assert.equal(items.structuredContent.firstId,111001);assert.ok(items.content.filter(c=>c.type==='image').length>=1&&items.content.filter(c=>c.type==='image').length<=4);
 assert.ok((await client.callTool({name:'image_catalog',arguments:{category:'道具'}})).structuredContent.category==='item','a category answers to its Chinese name too');
 assert.ok((await client.callTool({name:'image_catalog',arguments:{category:'nothing'}})).isError);
 const caps=(await client.callTool({name:'get_capabilities',arguments:{}})).structuredContent;
 for(const name of caps.supported.filter(n=>/^(scene|playtest|editor|effect)_/.test(n)))assert.ok(tools.has(name),'get_capabilities lists a tool that does not exist: '+name);
 assert.match(caps.workflow,/miliastra:\/\/workflow/);
 const rules=(await client.readResource({uri:'miliastra://platform-rules'})).contents[0].text;
 for(const name of [...new Set(rules.match(/`(scene_[a-z_]+|playtest_[a-z_]+|effect_catalog|search_node_docs)`/g)||[])].map(s=>s.slice(1,-1)))assert.ok(tools.has(name),'the platform rules name a tool that does not exist: '+name);
 // The worked examples the workflow names must be readable through the server: a client may have no files at all.
 const examples=[...new Set(workflow.match(/example-[a-z0-9]+/g)||[])];
 assert.ok(examples.length>=2,'the workflow names no worked example');
 for(const id of examples){
  const page=(await client.callTool({name:'read_knowledge',arguments:{id}})).structuredContent;
  assert.ok(page.text.includes('`scene_add_graph`')&&page.text.includes("g.server({id:"),'the walkthrough '+id+' lacks the tool calls or the graph sources');
  for(const name of new Set(page.text.match(/^\d+\. (?:\[UI\] )?`([a-z_]+)`/gm)?.map(l=>l.match(/`([a-z_]+)`/)[1])))assert.ok(tools.has(name),'the walkthrough '+id+' names a tool that does not exist: '+name);
 }
 const found=(await client.callTool({name:'search_knowledge',arguments:{query:'whenTabIsSelected',section:'examples'}})).structuredContent;
 assert.ok(found.results.some(r=>r.id.startsWith('example-')),'search does not reach the examples');
 // Arguments are checked against a tool's schema only on a real call, so the newer forms are sent through the server
 // once: a path motion, a graph on two prefabs, a mechanism prefab with a starting preset status, a currency.
 const gil=path.join(root,'knowledge','samples','gil'),first=path.join(gil,fs.readdirSync(gil).find(f=>f.startsWith('mhg94h90x3oq_')));
 const sent=async(name,args)=>{const r=await client.callTool({name,arguments:args});assert.ok(!r.isError,name+' refused '+JSON.stringify(args)+': '+JSON.stringify(r.structuredContent??r.content));return r.structuredContent;};
 const moved=await sent('scene_add_components',{mapPath:first,prefab:'石板',motions:[{name:'updown',path:[{position:[0,3,0],seconds:2},{rotation:[0,180,0],seconds:1}],loop:'backAndForth',active:true}]});
 const springy=await sent('scene_add_components',{mapPath:moved.mapPath,prefab:'石板',launcher:{areas:[{radius:1.5,offset:[0,0.5,0]}],speed:7}});
 const lever=await sent('scene_add_prefab',{mapPath:springy.mapPath,asset:10005033,name:'guide_lever',presetStatusValue:1});
 assert.equal(lever.presetStatus.statusId,100010330);
 const wider=await sent('scene_update_prefab',{mapPath:lever.mapPath,prefab:'guide_lever',scale:[2,1,1]});
 assert.deepEqual([wider.prefabId,wider.scale],[lever.prefabId,[2,1,1]]);
 const shared=await sent('scene_add_graph',{mapPath:wider.mapPath,name:'guide_shared',attachToPrefab:['石板','guide_lever']});
 assert.equal(shared.templates,2);
 const money=await sent('scene_add_currency',{mapPath:shared.mapPath,name:'guide_coin',startAmount:3});
 assert.equal((await sent('scene_list_currencies',{mapPath:money.mapPath})).currencies.at(-1).name,'guide_coin');
 const skillGraph=await sent('scene_add_graph',{mapPath:money.mapPath,name:'guide_skill',kind:'characterSkill'});
 const skill=await sent('scene_add_skill',{mapPath:skillGraph.mapPath,name:'guide_ping',graphId:skillGraph.graphId});
 assert.equal((await sent('scene_list_skills',{mapPath:skill.mapPath})).skills.at(-1).graphId,skillGraph.graphId);
 const swing=await sent('scene_add_skill',{mapPath:skill.mapPath,name:'guide_swing',graphId:skillGraph.graphId,type:'normal',animation:1001,graphAtMs:250,effect:{asset:10002152,attachPoint:'GI_WeaponR',ms:1833}});
 assert.deepEqual((await sent('scene_list_skills',{mapPath:swing.mapPath})).skills.at(-1).animations,[1001]);
 const apple=await sent('scene_add_item',{mapPath:swing.mapPath,name:'guide_apple',value:{currency:'guide_coin',amount:2}});
 const stall=await sent('scene_add_shop',{mapPath:apple.mapPath,name:'guide_stall',prefab:'guide_lever',sell:[{item:'guide_apple',currency:'guide_coin',price:2}],buy:[{item:apple.itemId,currency:money.currencyId,price:1}]});
 assert.equal((await sent('scene_list_items',{mapPath:stall.mapPath})).shops.at(-1).sell[0].itemId,apple.itemId);
 // Several searches in one call: one list for each query.
 const things=await sent('scene_search_assets',{queries:['围栏','火盆','石地板'],limit:5});
 assert.deepEqual(things.searches.map(s=>s.query),['围栏','火盆','石地板']);assert.ok(things.searches.slice(0,2).every(s=>s.total>0&&s.assets.length>0&&s.assets.length<=5));assert.ok(things.note);
 // A word the catalog does not have comes back with the names that are close to it.
 assert.ok(things.searches[2].total>0||things.searches[2].didYouMean?.length>0,'no hit and no suggestion for 石地板');
 const effects=await sent('effect_catalog',{queries:['受击','烟花'],kind:'timed'});
 assert.ok(effects.searches.length===2&&effects.searches.every(s=>s.rows.length>0)&&effects.usage);
 const sounds=await sent('sound_catalog',{queries:['宝箱','受击']});
 assert.ok(sounds.searches.length===2&&sounds.searches.every(s=>s.rows.length>0)&&sounds.usage);
 // scene_batch: a skill graph, the skill that names it by reference, a prefab and its component, in one call; and a step
 // that fails stops the list and says which.
 const batch=await sent('scene_batch',{mapPath:first,steps:[{tool:'scene_add_graph',args:{name:'batch_skill',kind:'characterSkill'}},{tool:'scene_add_skill',args:{name:'batch_ping',graphId:'$0.graphId'}},
  {tool:'scene_add_prefab',args:{asset:10005009,name:'batch_coin',scale:0.5}},{tool:'scene_add_components',args:{prefab:'batch_coin',collisionTriggers:[{areas:[{radius:1}]}]}},{tool:'scene_set_player_count',args:{max:1}}]});
 assert.equal(batch.done.length,5);assert.equal(batch.failed,undefined);assert.equal(batch.done[1].graphId,batch.done[0].graphId);
 assert.ok((await sent('scene_list_prefabs',{mapPath:batch.mapPath})).prefabs.some(p=>p.name==='batch_coin'));
 const halted=await sent('scene_batch',{mapPath:first,steps:[{tool:'scene_set_player_count',args:{max:2}},{tool:'scene_add_prefab',args:{asset:1,name:'x'}},{tool:'scene_set_player_count',args:{max:3}}]});
 assert.deepEqual([halted.done.length,halted.failed.step,halted.failed.tool],[1,1,'scene_add_prefab']);
 assert.equal((await sent('scene_list_respawn_points',{mapPath:halted.mapPath})).players.max,2);
 const told=await sent('scene_add_signal',{mapPath:stall.mapPath,name:'guide_lever',parameter:'which'});
 assert.equal(told.parameter,'which');
 // write_graphs: two graphs in one call (the stage graph and the one shared by two prefabs), then a graph that does
 // not compile stops the call and says which.
 const stageGraph=await sent('scene_add_graph',{mapPath:told.mapPath,name:'guide_stage'});
 const src=(id,name,word)=>"import { g } from 'genshin-ts/runtime/core'\ng.server({id:"+id+",name:'"+name+"'}).on('whenEntityIsCreated',(evt,f)=>{f.printString('"+word+"');})\n";
 const both=await sent('write_graphs',{mapPath:stageGraph.mapPath,graphs:[{graphId:stageGraph.graphId,code:src(stageGraph.graphId,stageGraph.name,'A')},{graphId:shared.graphId,code:src(shared.graphId,shared.name,'B')}]});
 assert.equal(both.written.length,2);assert.equal(both.failed,undefined);
 // The graphs of one call go through the compiler together and into the save in one pass (one project for all of
 // them); built one by one, each would have a project of its own.
 assert.equal(both.written[0].projectId,both.written[1].projectId,'the graphs of one call were not compiled together');
 const after=(await sent('inspect_map',{mapPath:both.mapPath})).graphs;
 for(const id of [stageGraph.graphId,shared.graphId])assert.ok(after.find(x=>x.id===id).nodeCount>=2,'graph '+id+' was not written');
 const broken=await sent('write_graphs',{mapPath:both.mapPath,graphs:[{graphId:stageGraph.graphId,code:src(stageGraph.graphId,stageGraph.name,'C')},{graphId:shared.graphId,code:'this is not a graph'}]});
 assert.equal(broken.written.length,1);assert.equal(broken.failed.graphId,shared.graphId);assert.equal(broken.failed.position,1);
 assert.match(String(broken.failed.code),/TYPECHECK_FAILED|BUILD_FAILED/);
 // A signal to the client scripts of a player: the graph writes f.sendSignal('client:NAME', player, ...) and the node
 // that goes into the save is the 发送客户端脚本信号 of that signal (its fourth definition), named without the prefix.
 const toScripts=(name,args)=>"import { g } from 'genshin-ts/runtime/core'\ng.server({id:"+stageGraph.graphId+",name:'"+stageGraph.name+"'}).on('whenEntityIsCreated',(evt,f)=>{for(const player of f.getListOfPlayerEntitiesOnTheField())f.sendSignal('client:"+name+"'"+args+");})\n";
 const sentTo=await sent('write_graphs',{mapPath:both.mapPath,graphs:[{graphId:stageGraph.graphId,code:toScripts('guide_lever',",player,'left'")}]});
 assert.equal(sentTo.failed,undefined,JSON.stringify(sentTo.failed));
 const {container:open,fields:parts}=await import('../src/scene/wire.mjs'),{clientScriptSignalHeads}=await import('../src/scene/signal-definitions.mjs');
 const saved=fs.readFileSync(sentTo.mapPath),leverNode=clientScriptSignalHeads(saved).get('guide_lever').nodeId;
 assert.deepEqual(told.definitionIds.at(-1),leverNode);
 const graphOf=parts(open(saved)).filter(f=>f.id===10).flatMap(x=>parts(x.data).filter(f=>f.wire===2)).flatMap(x=>parts(x.data).filter(f=>f.id===1&&f.wire===2)).map(x=>x.data).find(g2=>parts(g2).some(f=>f.id===2&&f.wire===2&&f.data.toString('utf8').endsWith(stageGraph.name)));
 const heads=parts(graphOf).filter(f=>f.id===3&&f.wire===2).map(n=>Number(parts(parts(n.data).find(f=>f.id===2&&f.wire===2).data).find(f=>f.id===5).value));
 assert.ok(heads.includes(leverNode),'the node that sends to client scripts is not in the graph: '+heads.join(','));
 assert.ok(graphOf.includes(Buffer.from('guide_lever'))&&!graphOf.includes(Buffer.from('client:guide_lever')),'the node still carries the prefix');
 const nobody=await sent('write_graphs',{mapPath:both.mapPath,graphs:[{graphId:stageGraph.graphId,code:toScripts('guide_nobody',",player")}]});
 assert.equal(nobody.failed?.code,'SIGNAL_NOT_FOR_CLIENT_SCRIPTS');
 const unaddressed=await sent('write_graphs',{mapPath:both.mapPath,graphs:[{graphId:stageGraph.graphId,code:toScripts('guide_lever',"")}]});
 assert.equal(unaddressed.failed?.code,'SIGNAL_WITHOUT_PLAYER');
 // A project of the simulator outside the game, brought into a save in one call: scripts, a template, the interface
 // with a script on its root, signals, a variable, and its server rules as a compiled graph.
 const sim=await sent('scene_import_simulator',{mapPath:path.join(root,'tests','fixtures','editor-2026-10-13-handui.gil'),save:path.join(root,'tests','fixtures','simulator-sample.save.json')});
 assert.deepEqual([sim.written.signals,sim.written.variables,sim.written.scripts,sim.written.templates.map(t=>t.name),sim.written.interface.controls,sim.written.graph.written],[['pick','picked'],['score'],['main'],['Lua实例化面板'],12,true],JSON.stringify(sim.written).slice(0,600));
 assert.equal(sim.templateNumbersChangedInLua,1);assert.equal(sim.check.errors,0,JSON.stringify(sim.check.problems));
 assert.ok(sim.notes.some(t=>/states\.normal/.test(t))&&sim.notes.some(t=>/fill/.test(t)));
 const simScripts=(await sent('scene_list_client_scripts',{mapPath:sim.mapPath,includeSource:true})).scripts.find(x=>x.name==='main');
 assert.ok(simScripts.source.includes('local PANEL = '+sim.written.templates[0].templateIndex)&&simScripts.source.includes('-- 1073742100 stays in a comment'),'only the number of the Lua itself is put to the new index');
 assert.deepEqual(simScripts.on,['容器节点']);
 const simFace=(await sent('scene_list_interface',{mapPath:sim.mapPath})).clientInterfaces.at(-1);
 assert.deepEqual(simFace.root.children.map(c=>c.kind),['text','cursorArea','reference','grid','presetButton','textWindow','keyHint','image','animation','fullscreenAnimation']);
 const chests=(await sent('scene_search_assets',{query:'宝箱',group:'交互机关'})).assets;
 assert.ok(chests.some(a=>a.presetStatus?.statusId===100010060),'asset search does not show the preset status of the chest');
}finally{await client.close();fs.rmSync(workspace,{recursive:true,force:true});}
console.log(JSON.stringify({ok:true}));
