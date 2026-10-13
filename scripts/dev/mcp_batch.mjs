// Run a list of MCP tool calls against a fresh server and save what comes back.
// Usage: node scripts/dev/mcp_batch.mjs <calls.json> <outDir>   calls.json: [{"tool":"...","args":{...},"wait":true}]
// wait:true polls playtest_status with the returned runId until the run ends (import, open map, playtest).
// Image blocks are written to <outDir>/<n>_<k>.jpg; everything else goes to <outDir>/results.json.
// Env: MILIASTRA_WORKSPACE picks the workspace (default <repo>/workspace/batch).
import fs from 'node:fs';
import path from 'node:path';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
const root=process.cwd(),[callsFile,outDir]=process.argv.slice(2);
const calls=JSON.parse(fs.readFileSync(callsFile,'utf8'));fs.mkdirSync(outDir,{recursive:true});
const workspace=process.env.MILIASTRA_WORKSPACE||path.join(root,'workspace','batch');
const client=new Client({name:'mcp-batch',version:'1'});
const results=[],save=()=>fs.writeFileSync(path.join(outDir,'results.json'),JSON.stringify(results,null,1));
try{
 await client.connect(new StdioClientTransport({command:process.execPath,args:[path.join(root,'src/server.mjs')],cwd:root,env:{...process.env,MILIASTRA_WORKSPACE:workspace},stderr:'pipe'}));
 for(const [n,c] of calls.entries()){
  // "$prev" as mapPath: the mapPath the call before gave back.
  const given=JSON.parse(JSON.stringify(c.args||{}).replaceAll('"$prev"',JSON.stringify(results.at(-1)?.result?.mapPath??null)));
  const t=Date.now(),r=await client.callTool({name:c.tool,arguments:given},undefined,{timeout:300000});
  const images=[];
  (r.content||[]).filter(b=>b.type==='image').forEach((b,k)=>{const f=path.join(outDir,`${n}_${k}.jpg`);fs.writeFileSync(f,Buffer.from(b.data,'base64'));images.push(f);});
  const entry={tool:c.tool,seconds:(Date.now()-t)/1000,isError:!!r.isError,result:r.structuredContent??(r.content||[]).filter(b=>b.type==='text').map(b=>b.text),images};
  results.push(entry);save();
  if(r.isError)break;
  if(c.wait&&r.structuredContent?.runId){
   for(;;){
    await new Promise(d=>setTimeout(d,5000));
    const s=(await client.callTool({name:'playtest_status',arguments:{runId:r.structuredContent.runId,includeScreenshots:false,maxPrints:c.maxPrints??200}})).structuredContent;
    if(s.state!=='running'&&s.state!=='starting'){entry.final=s;save();break;}
   }
   if(entry.final.state!=='succeeded')break;
  }
 }
}catch(e){results.push({error:String(e?.stack||e)});save();}
finally{await client.close();}
console.log(JSON.stringify({calls:results.length,ok:results.every(r=>!r.isError&&!r.error&&(!r.final||r.final.state==='succeeded'))}));
