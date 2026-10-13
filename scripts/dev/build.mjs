import fs from 'node:fs';
import path from 'node:path';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
process.env.MILIASTRA_STEP_TOOLS='1'; // this script takes the steps of writing a graph one by one (create_project ... apply_build)
const [name,baseRel,graphId,change]=[process.env.B_NAME,process.env.B_BASE,Number(process.env.B_GRAPH),process.env.B_CHANGE];
const root=process.cwd(),out=path.join(root,'workspace/construction',name),base=path.join(root,baseRel);
const client=new Client({name:name+'-builder',version:'1'});
const transport=new StdioClientTransport({command:process.execPath,args:[path.join(root,'src/server.mjs')],cwd:root,env:{...process.env,MILIASTRA_WORKSPACE:path.join(out,'workspace'),MILIASTRA_SAVE_ROOTS:JSON.stringify([path.dirname(base)])},stderr:'pipe'});
transport.stderr?.on('data',b=>process.stderr.write(b));
async function call(n,args){const r=await client.callTool({name:n,arguments:args},undefined,{timeout:180000});if(r.isError)throw Error(n+' '+JSON.stringify(r.structuredContent));fs.appendFileSync(path.join(out,'mcp-trace.jsonl'),JSON.stringify({at:new Date().toISOString(),name:n,response:r.structuredContent})+'\n');return r.structuredContent;}
try{
 await client.connect(transport);
 const p=await call('create_project',{projectId:name,mapPath:base,targetGraphId:graphId});
 await call('update_logic',{projectId:p.projectId,code:fs.readFileSync(path.join(out,'probe.ts'),'utf8')});
 const b=await call('build_project',{projectId:p.projectId});
 const v=await call('preview_changes',{projectId:p.projectId,buildId:b.buildId,destination:'copy'});
 const a=await call('apply_build',{projectId:p.projectId,buildId:b.buildId,destination:'copy',expectedSha256:v.expectedSha256});
 fs.copyFileSync(a.target,path.join(out,'candidate.gil'),fs.constants.COPYFILE_EXCL);
 fs.writeFileSync(path.join(out,'build-report.json'),JSON.stringify({base:p.sourceSha256,sourceSha256:b.sourceSha256,graph:b.graph,candidateSha256:a.afterSha256,change,builtBy:'Claude'},null,2),{flag:'wx'});
 console.log(JSON.stringify({candidate:path.join(out,'candidate.gil'),sha256:a.afterSha256,graphId:b.graph.id,nodeCount:b.graph.nodeCount,connections:b.graph.topology?.connectionCount}));
}finally{await client.close();}
