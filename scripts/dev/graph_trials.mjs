// Put graph sources into an already built map one after another and try to start a playtest with each: reports the build's
// node count next to what the editor says (it refuses a graph it counts as more than 3000 nodes and names its own count).
// Usage: node scripts/dev/graph_trials.mjs <workspace with the map> <map.gil> <out.json> <source.ts>...
// Needs the game in the editor or lobby, and runs in the desktop session (it drives the game window).
// TRIAL_GRAPH_ID / TRIAL_GRAPH_NAME name the graph in the map that each source replaces; TRIAL_SECONDS is how long each is
// played (5 only checks that the editor accepts it; longer shows whether the server lets the level run: levelEndedAt, serverMessage).
import fs from 'node:fs';
import path from 'node:path';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
process.env.MILIASTRA_STEP_TOOLS='1'; // this script takes the steps of writing a graph one by one (create_project ... apply_build)
const root=process.cwd(),[workspace,mapPath,out,...sources]=process.argv.slice(2);
const client=new Client({name:'graph-trials',version:'1'});
const graphId=Number(process.env.TRIAL_GRAPH_ID||1073741908),graphName=process.env.TRIAL_GRAPH_NAME||'_GSTS_KingdomEconomy',seconds=Number(process.env.TRIAL_SECONDS||5);
const report=[],save=()=>fs.writeFileSync(out,JSON.stringify(report,null,1));
const call=async(name,a)=>{const r=await client.callTool({name,arguments:a},undefined,{timeout:240000});if(r.isError)throw new Error(name+' '+(JSON.stringify(r.structuredContent??r.content)||'').slice(-900));return r.structuredContent;};
try{
 await client.connect(new StdioClientTransport({command:process.execPath,args:[path.join(root,'src/server.mjs')],cwd:root,env:{...process.env,MILIASTRA_WORKSPACE:workspace},stderr:'pipe'}));
 for(const [n,file] of sources.entries()){
  const row={source:path.basename(file)};report.push(row);save();
  try{
   const projectId='trial'+Date.now();
   await call('create_project',{projectId,mapPath,targetGraphId:graphId});
   await call('update_logic',{projectId,code:fs.readFileSync(file,'utf8')});
   const build=await call('build_project',{projectId});row.nodeCount=build.graph.nodeCount;row.build=build;save();
   const preview=await call('preview_changes',{projectId,buildId:build.buildId,destination:'copy'});
   const applied=await call('apply_build',{projectId,buildId:build.buildId,destination:'copy',expectedSha256:preview.expectedSha256});
   const run=await call('playtest_start',{mapPath:applied.target,graphName,durationSeconds:seconds,screenshotsAt:[],inputs:[]});
   for(;;){
    await new Promise(r=>setTimeout(r,5000));
    const s=(await client.callTool({name:'playtest_status',arguments:{runId:run.runId,includeScreenshots:false,maxPrints:60}})).structuredContent;
    if(s.state!=='running'&&s.state!=='starting'){row.state=s.state;row.error=s.error;row.validation=s.validation;row.seconds=s.elapsedSeconds;row.levelEndedAt=s.levelEndedAt;row.serverMessage=s.serverMessage;row.prints=(s.log?.prints||[]).map(x=>x.t+' '+x.text);delete row.build;save();break;}
   }
  }catch(e){row.failed=String(e?.message||e).slice(-900);save();}
 }
}finally{await client.close();}
