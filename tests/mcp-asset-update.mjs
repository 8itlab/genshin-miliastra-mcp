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
  assert.equal(result.structuredContent.assets[0].placementStatus,'candidate-only');
 }
 const blocked=await client.callTool({name:'scene_build_blocks',arguments:{name:'UnknownMustFail',blocks:[{template:39999999,position:[0,0,0]}],install:false}});
 assert.ok(blocked.isError);
 const built=await client.callTool({name:'scene_build_blocks',arguments:{name:'ObservedSeedCandidate',blocks:[{template:30008015,position:[9,0,0]}],install:false}});
 assert.ok(!built.isError);assert.equal(built.structuredContent.count,1);assert.ok(!built.structuredContent.warnings?.length);
 const batch=await client.callTool({name:'scene_build_blocks',arguments:{name:'Round3SeedCandidates',blocks:added.filter(a=>a.id!==30008015).map((a,i)=>({template:a.id,position:[12+i*3,0,0]})),install:false}});
 assert.ok(!batch.isError);assert.equal(batch.structuredContent.count,10);assert.ok(!batch.structuredContent.warnings?.length);
 const old=await client.callTool({name:'creature_animations',arguments:{creature:30005001}});assert.ok(!old.isError);
 const motion=await client.callTool({name:'creature_animations',arguments:{creature:30008015}});
 assert.deepEqual(motion.structuredContent.animations.map(a=>[a.id,a.seconds]),[[8015003,1.66],[8015004,1.76],[8015006,6.08],[8015016,3.96]]);
 assert.ok(motion.structuredContent.mayHaveMore);
 const capture=JSON.parse(fs.readFileSync(new URL('../docs/evidence/7.2/secret-fx-capture.json',import.meta.url)));
 const effects=await client.callTool({name:'effect_catalog',arguments:{query:'秘源机兵',kind:'timed',limit:200,pictures:3}});
 assert.ok(!effects.isError);assert.equal(effects.structuredContent.total,26);
 assert.deepEqual(effects.structuredContent.rows.map(r=>r.id).sort((a,b)=>a-b),capture.rows.map(r=>r.id).sort((a,b)=>a-b));
 assert.equal(effects.content.filter(c=>c.type==='image').length,3);
 const images=await client.callTool({name:'effect_catalog',arguments:{ids:[10019173,10019209]}});
 assert.equal(images.content.filter(c=>c.type==='image').length,2);
 for(const [i,item] of images.content.filter(c=>c.type==='image').entries())assert.deepEqual(Buffer.from(item.data,'base64'),fs.readFileSync(new URL('../docs/evidence/7.2/fx/'+[10019173,10019209][i]+'.thumb.jpg',import.meta.url)));
 console.log(JSON.stringify({viaMcp:true,newIdentities:added.length,candidateSeedCount:11,unknownPlacementRejected:true,existingAnimations:true,newTimedEffects:26,packedImagesVerified:true}));
}finally{await client.close();}
