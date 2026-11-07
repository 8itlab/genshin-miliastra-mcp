import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const workspace=fs.mkdtempSync(path.join(os.tmpdir(),'asset-update-mcp-'));
const client=new Client({name:'asset-update-test',version:'1'});
const added=JSON.parse(fs.readFileSync(new URL('../src/scene/asset-catalog.json',import.meta.url))).assets.filter(a=>a.catalogOnly);
try{
 await client.connect(new StdioClientTransport({command:process.execPath,args:[path.join(root,'src/server.mjs')],cwd:root,env:{...process.env,MILIASTRA_WORKSPACE:workspace,MILIASTRA_ALLOW_LIVE_WRITE:'0'},stderr:'pipe'}));
 for(const a of added){
  const result=await client.callTool({name:'scene_search_assets',arguments:{query:String(a.id)}});
  assert.equal(result.isError,undefined);assert.equal(result.structuredContent.assets[0].name,a.name);
  assert.equal(result.structuredContent.assets[0].placementStatus,'unverified');
 }
 const blocked=await client.callTool({name:'scene_build_blocks',arguments:{name:'UnverifiedMustFail',blocks:[{template:30008015,position:[0,0,0]}],install:false}});
 assert.ok(blocked.isError);
 const old=await client.callTool({name:'creature_animations',arguments:{creature:30005001}});assert.ok(!old.isError);
 console.log(JSON.stringify({viaMcp:true,newIdentities:added.length,unsafePlacementRejected:true,existingAnimations:true}));
}finally{await client.close();}
