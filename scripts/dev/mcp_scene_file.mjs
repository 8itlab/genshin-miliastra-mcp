// Drives the real MCP server: optional asset searches, build a pack from a JSON list of pieces, import it.
import fs from 'node:fs';
import path from 'node:path';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
const out=process.env.PT_OUT,root=process.cwd(),spec=JSON.parse(fs.readFileSync(process.env.PT_SPEC,'utf8'));
const client=new Client({name:'scene-file',version:'1'});
const transport=new StdioClientTransport({command:process.execPath,args:[path.join(root,'src/server.mjs')],cwd:root,env:{...process.env,MILIASTRA_WORKSPACE:path.join(root,'workspace',process.env.PT_WS||'claude-scene2')},stderr:'pipe'});
const report={};const save=()=>fs.writeFileSync(out,JSON.stringify(report,null,1));
try{
  await client.connect(transport);
  report.sceneTools=(await client.listTools()).tools.map(t=>t.name).filter(t=>t.startsWith('scene_'));
  report.searches={};
  for(const query of spec.searches||[]){const r=(await client.callTool({name:'scene_search_assets',arguments:{query,limit:5}})).structuredContent;report.searches[query]={total:r.total,first:r.assets?.slice(0,3)};}
  report.built=(await client.callTool({name:'scene_build_blocks',arguments:{name:spec.name,blocks:spec.blocks,...(spec.entityIdStart?{entityIdStart:spec.entityIdStart}:{})}})).structuredContent;save();
  if(report.built?.installedTo){
    const started=(await client.callTool({name:'scene_import_assets',arguments:{packs:[spec.name]}})).structuredContent;
    report.started=started;save();
    if(started.runId)for(;;){
      await new Promise(r=>setTimeout(r,5000));
      const status=await client.callTool({name:'playtest_status',arguments:{runId:started.runId}});
      report.status=status.structuredContent;report.imageCount=status.content.filter(c=>c.type==='image').length;save();
      if(report.status.state!=='running'&&report.status.state!=='starting')break;
    }
  }
}catch(e){report.error=String(e?.stack||e);save();}
finally{await client.close();}
