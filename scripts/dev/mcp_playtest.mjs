// Drives the real MCP server over stdio: start a playtest, poll, save the outcome.
import fs from 'node:fs';
import path from 'node:path';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
const args=JSON.parse(fs.readFileSync(process.env.PT_ARGS,'utf8')),out=process.env.PT_OUT;
const root=process.cwd();
const client=new Client({name:'playtest-check',version:'1'});
const transport=new StdioClientTransport({command:process.execPath,args:[path.join(root,'src/server.mjs')],cwd:root,env:{...process.env,MILIASTRA_WORKSPACE:path.join(root,'workspace','claude')},stderr:'pipe'});
const report={};
try{
  await client.connect(transport);
  const tools=(await client.listTools()).tools.map(t=>t.name);
  report.toolCount=tools.length;report.hasPlaytest=tools.includes('playtest_start')&&tools.includes('playtest_status');
  report.rulesChars=(await client.readResource({uri:'miliastra://platform-rules'})).contents[0].text.length;
  const started=(await client.callTool({name:'playtest_start',arguments:args})).structuredContent;
  report.started=started;fs.writeFileSync(out,JSON.stringify(report,null,1));
  if(started.runId)for(;;){
    await new Promise(r=>setTimeout(r,8000));
    const status=await client.callTool({name:'playtest_status',arguments:{runId:started.runId,maxPrints:2000}});
    report.status=status.structuredContent;report.imageCount=status.content.filter(c=>c.type==='image').length;
    fs.writeFileSync(out,JSON.stringify(report,null,1));
    if(report.status.state!=='running'&&report.status.state!=='starting')break;
  }
}catch(e){report.error=String(e?.stack||e);fs.writeFileSync(out,JSON.stringify(report,null,1));}
finally{await client.close();}
