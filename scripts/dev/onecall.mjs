// 通过 MCP 发一次工具调用并打印原始结果（包括校验错误的文字）。用法：node onecall.mjs <工具名> <参数 json 文件>
import fs from 'node:fs';import path from 'node:path';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
const root=process.cwd(),[name,file]=process.argv.slice(2);
const client=new Client({name:'onecall',version:'1'});
await client.connect(new StdioClientTransport({command:process.execPath,args:[path.join(root,'src/server.mjs')],cwd:root,env:{...process.env,MILIASTRA_WORKSPACE:path.join(root,'workspace','onecall')},stderr:'pipe'}));
try{const r=await client.callTool({name,arguments:JSON.parse(fs.readFileSync(file,'utf8'))});console.log(JSON.stringify({isError:r.isError,structured:r.structuredContent,text:r.content?.map(c=>c.text).join(' ').slice(0,900)}).slice(0,1600));}
catch(e){console.log('THROWN',String(e).slice(0,900));}
finally{await client.close();}
