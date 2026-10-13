// A command-line MCP client for one call at a time: what an AI client sees, as text.
//   node scripts/dev/mcp_cli.mjs tools                 every tool: name, description, input schema
//   node scripts/dev/mcp_cli.mjs resources            the resources, and the server's instructions
//   node scripts/dev/mcp_cli.mjs read <uri>           one resource
//   node scripts/dev/mcp_cli.mjs call <tool> <args.json> [outDir]   one tool call; images are saved into outDir
// Prints JSON (UTF-8). Env: MILIASTRA_WORKSPACE picks the workspace (default <repo>/workspace/cli).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..'),[cmd,a,b,c]=process.argv.slice(2);
const workspace=process.env.MILIASTRA_WORKSPACE||path.join(root,'workspace','cli');
const client=new Client({name:'mcp-cli',version:'1'});
const out=v=>process.stdout.write(JSON.stringify(v,null,1)+'\n');
try{
  await client.connect(new StdioClientTransport({command:process.execPath,args:[path.join(root,'src/server.mjs')],cwd:root,env:{...process.env,MILIASTRA_WORKSPACE:workspace},stderr:'pipe'}));
  if(cmd==='tools')out((await client.listTools()).tools.map(t=>({name:t.name,description:t.description,inputSchema:t.inputSchema})));
  else if(cmd==='resources')out({instructions:client.getInstructions(),resources:(await client.listResources()).resources});
  else if(cmd==='read')out((await client.readResource({uri:a})).contents.map(x=>x.text??x));
  else if(cmd==='call'){
    const args=a&&b?JSON.parse(fs.readFileSync(b,'utf8')):{},outDir=c||path.join(workspace,'cli-out');fs.mkdirSync(outDir,{recursive:true});
    const r=await client.callTool({name:a,arguments:args},undefined,{timeout:1200000});
    const images=[];(r.content||[]).filter(x=>x.type==='image').forEach((x,k)=>{const f=path.join(outDir,Date.now().toString(36)+'_'+k+'.jpg');fs.writeFileSync(f,Buffer.from(x.data,'base64'));images.push(f);});
    const texts=(r.content||[]).filter(x=>x.type==='text').map(x=>x.text);
    out({isError:!!r.isError,result:r.structuredContent??(texts.length===1?safe(texts[0]):texts),images});
  }else{console.error('usage: tools | resources | read <uri> | call <tool> <args.json> [outDir]');process.exitCode=2;}
}finally{await client.close();}
function safe(t){try{return JSON.parse(t);}catch{return t;}}
