// A brand-new blank map, MCP tools only: add a graph, set factions / aggro mode / camera, write a small graph that
// prints where the player is and creates a coin next to them, and playtest it. Shows what a creator's new map needs.
// Usage: node scripts/dev/fresh_map_round.mjs <workspace> <blank map.gil> <out.json> [seconds] [screenshot times, comma separated]
// Runs in the desktop session (it drives the game window).
import fs from 'node:fs';
import path from 'node:path';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
const root=process.cwd(),[workspace,blank,out,seconds='16',shots='6,10,14']=process.argv.slice(2);
const client=new Client({name:'fresh-map-round',version:'1'}),report={calls:[]},save=()=>fs.writeFileSync(out,JSON.stringify(report,null,1));
const call=async(name,a)=>{const r=await client.callTool({name,arguments:a},undefined,{timeout:240000});report.calls.push(name+(r.isError?' FAILED':''));save();
  if(r.isError)throw new Error(name+' '+(JSON.stringify(r.structuredContent??r.content)||'').slice(-900));return r.structuredContent;};
try{
 await client.connect(new StdioClientTransport({command:process.execPath,args:[path.join(root,'src/server.mjs')],cwd:root,env:{...process.env,MILIASTRA_WORKSPACE:workspace},stderr:'pipe'}));
 const graph=await call('scene_add_graph',{mapPath:blank,name:'Fresh',outputName:'fresh-1-graph'});report.graph=graph;
 let mapPath=graph.mapPath;
 mapPath=(await call('scene_set_faction_hostility',{mapPath,hostilePairs:[[1,3]],outputName:'fresh-2-factions'})).mapPath;
 mapPath=(await call('scene_set_level_settings',{mapPath,aggroMode:'custom',outputName:'fresh-3-level'})).mapPath;
 mapPath=(await call('scene_set_camera',{mapPath,distance:10,outputName:'fresh-4-camera'})).mapPath;
 mapPath=(await call('scene_add_prefab',{mapPath,asset:10005009,name:'small_coin',scale:0.5,outputName:'fresh-5-prefab'})).mapPath;
 const coin=(await call('scene_list_prefabs',{mapPath})).prefabs.find(p=>p.name==='small_coin').prefabId;
 const code=`/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
process.env.MILIASTRA_STEP_TOOLS='1'; // this script takes the steps of writing a graph one by one (create_project ... apply_build)
g.server({id:${graph.graphId},name:'${graph.name}',variables:{lastTick:-1n}})
.on('whenEntityIsCreated',(evt,f)=>{
  f.startTimer(evt.eventSourceEntity,'FRESH_CLOCK',true,[1]);
  f.printString('FR_READY');
})
.on('whenTimerIsTriggered',(evt,f)=>{
  if(evt.timerName!=='FRESH_CLOCK')return;
  const t=f.queryGameTimeElapsed();
  if(t===f.get('lastTick'))return;
  f.set('lastTick',t);
  const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;
  const characters=f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0]);
  if(characters.length!==1)return;
  const p=f.split3dVector(f.getEntityLocationAndRotation(characters[0]).location);
  if(t%3n===0n){
    f.printString('FR_AT');
    f.printString(f.dataTypeConversion(p.xComponent,'str'));f.printString(f.dataTypeConversion(p.yComponent,'str'));f.printString(f.dataTypeConversion(p.zComponent,'str'));
    f.printString(f.dataTypeConversion(f.getEntitiesWithSpecifiedPrefabOnTheField(${coin}).length,'str'));
  }
  if(t===4n)f.createPrefab(${coin},f.create3dVector(p.xComponent+1.5,p.yComponent+1.2,p.zComponent),[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
  if(t===6n)f.createPrefab(${coin},f.create3dVector(p.xComponent-1.5,p.yComponent+1.2,p.zComponent),[0,0,0],evt.eventSourceEntity,false,1,[] as bigint[]);
})
`;
 const projectId='fresh'+Date.now();
 await call('create_project',{projectId,mapPath,targetGraphId:graph.graphId});
 await call('update_logic',{projectId,code});
 const build=await call('build_project',{projectId});report.nodeCount=build.graph.nodeCount;
 const preview=await call('preview_changes',{projectId,buildId:build.buildId,destination:'copy'});
 const applied=await call('apply_build',{projectId,buildId:build.buildId,destination:'copy',expectedSha256:preview.expectedSha256});report.candidate=applied.target;
 const run=await call('playtest_start',{mapPath:applied.target,graphName:graph.name,durationSeconds:Number(seconds),screenshotsAt:shots.split(',').map(Number),inputs:[]});
 for(;;){
  await new Promise(r=>setTimeout(r,5000));
  const s=(await client.callTool({name:'playtest_status',arguments:{runId:run.runId,includeScreenshots:false,maxPrints:200}})).structuredContent;
  if(s.state!=='running'&&s.state!=='starting'){report.state=s.state;report.error=s.error;report.validation=s.validation;report.prints=s.log?.prints;report.shots=s.screenshots;report.steps=s.steps;save();break;}
 }
}catch(e){report.failed=String(e?.message||e).slice(-900);save();}
finally{report.done=true;save();await client.close();}
