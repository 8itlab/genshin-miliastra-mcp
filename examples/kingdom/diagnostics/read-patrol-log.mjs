// Reference client for the isolated probe. Explicit paths prevent picking a
// different session merely because its file was modified most recently.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {patrolReport} from './patrol-report.mjs';

const [saveArg,logArg,outArg,graphId='1073741909']=process.argv.slice(2);
if(!saveArg||!logArg||!outArg||!/^\d+$/.test(graphId))
  throw new Error('Usage: node examples/kingdom/diagnostics/read-patrol-log.mjs <official-save.gil> <session-log.gia> <new-output-dir> [graphId]');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const save=fs.realpathSync(saveArg),logfile=fs.realpathSync(logArg),out=path.resolve(outArg);
fs.mkdirSync(out,{recursive:false});
const client=new Client({name:'patrol-diagnostic-reader',version:'1'});
const transport=new StdioClientTransport({command:process.execPath,args:[path.join(root,'src/server.mjs')],cwd:root,
  env:{...process.env,MILIASTRA_WORKSPACE:path.join(out,'inspection'),MILIASTRA_SAVE_ROOTS:JSON.stringify([...new Set([path.dirname(save),path.dirname(logfile)])])},stderr:'pipe'});
transport.stderr?.on('data',b=>process.stderr.write(b));
async function call(name,args){
  const response=(await client.callTool({name:'creator_'+name,arguments:args})).structuredContent;
  fs.appendFileSync(path.join(out,'mcp-trace.jsonl'),JSON.stringify({name,args,response})+'\n');
  assert.equal(response?.status,'ok',JSON.stringify(response));return response.data;
}
try{
  await client.connect(transport);
  const opened=await call('open_project',{displayName:'原生巡逻与战斗隔离诊断',sourcePath:save,origin:'real-editor-save',mutationId:randomUUID()});
  const prints=[];let offset=0,sourceHash,artifactId;
  for(;;){
    const page=await call('inspect_debug_log',{projectId:opened.projectId,sourcePath:logfile,prefix:'',offset,limit:200,...(sourceHash?{expectedSourceHash:sourceHash}:{})});
    sourceHash??=page.sourceHash;artifactId??=page.artifactId;prints.push(...page.prints);
    if(page.nextOffset===null)break;
    assert.ok(page.nextOffset>offset,'pagination must advance');offset=page.nextOffset;
  }
  const report=patrolReport(prints,graphId);
  assert.ok(report.events.length||report.observations.length||report.malformed.length,'No explicit probe prints; verify graph subscription and session identity');
  const evidence={sourceHash,artifactId,logfile,registeredSave:{path:save,sourceHash:opened.sourceSha256,
    association:'Caller-supplied official save snapshot; this does not prove the runtime loaded its exact bytes.'},...report};
  fs.writeFileSync(path.join(out,'patrol-report.json'),JSON.stringify(evidence,null,2),{flag:'wx'});
  // Keep complete prints on disk, emit only bounded evidence to the AI.
  fs.writeFileSync(path.join(out,'prints.json'),JSON.stringify(prints,null,2),{flag:'wx'});
  console.log(JSON.stringify({sourceHash,reportPath:path.join(out,'patrol-report.json'),malformed:report.malformed.length,
    actors:report.actors,events:report.events.filter(e=>!e.text.endsWith('_ABSENT'))}));
}finally{await client.close();}
