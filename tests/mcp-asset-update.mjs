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
  assert.equal(result.structuredContent.assets[0].placementStatus,a.id===30008015?'candidate-only':'unverified');
 }
 const blocked=await client.callTool({name:'scene_build_blocks',arguments:{name:'UnverifiedMustFail',blocks:[{template:30006019,position:[0,0,0]}],install:false}});
 assert.ok(blocked.isError);
 const built=await client.callTool({name:'scene_build_blocks',arguments:{name:'ObservedSeedCandidate',blocks:[{template:30008015,position:[9,0,0]}],install:false}});
 assert.ok(!built.isError);assert.equal(built.structuredContent.count,1);assert.ok(!built.structuredContent.warnings?.length);
 const old=await client.callTool({name:'creature_animations',arguments:{creature:30005001}});assert.ok(!old.isError);
 const motion=await client.callTool({name:'creature_animations',arguments:{creature:30008015}});
 assert.deepEqual(motion.structuredContent.animations.map(a=>[a.id,a.seconds]),[[8015003,1.66],[8015004,1.76],[8015006,6.08],[8015016,3.96]]);
 assert.ok(motion.structuredContent.mayHaveMore);
 console.log(JSON.stringify({viaMcp:true,newIdentities:added.length,unsafePlacementRejected:true,existingAnimations:true}));
}finally{await client.close();}
