// Offline checks for the asset catalog tools: search results say whether a photo exists, photos come back as JPEG blocks,
// and a flat asset (one catalog dimension is 0) can still be placed by scale.
import assert from 'node:assert/strict';
import {searchAssets,assetImages,ASSETS} from '../src/scene/assets.mjs';
import {buildBlockScene} from '../src/scene/blocks.mjs';

const hits=searchAssets({query:'乔木',limit:100});
assert.ok(hits.total>10,'expected many assets named 乔木');
assert.ok(hits.assets.every(a=>typeof a.hasImage==='boolean'));
const withImage=ASSETS.filter(a=>searchAssets({query:String(a.name),limit:100}).assets.some(h=>h.id===a.id&&h.hasImage)).length;
assert.ok(withImage>ASSETS.length*0.9,`only ${withImage} of ${ASSETS.length} assets have a photo`);

const shown=hits.assets.find(a=>a.hasImage);
const out=assetImages({ids:[shown.id,999]});
assert.deepEqual(out.structuredContent.assets.map(a=>[a.id,a.found,a.hasImage]),[[shown.id,true,true],[999,false,false]]);
const images=out.content.filter(c=>c.type==='image');
assert.equal(images.length,1);
assert.equal(images[0].mimeType,'image/jpeg');
assert.equal(Buffer.from(images[0].data,'base64').subarray(0,3).toString('hex'),'ffd8ff');
assert.ok(out.content[0].text.startsWith(String(shown.id)),'the text line for an asset comes right before its photo');

const flat=ASSETS.find(a=>a.size&&a.size.some(n=>n===0)&&!a.group.startsWith('怪物'));
if(flat){
 assert.ok(buildBlockScene({blocks:[{template:flat.id,position:[0,0,0],scale:2}]}));
 assert.throws(()=>buildBlockScene({blocks:[{template:flat.id,position:[0,0,0],scale:0}]}),{code:'INVALID_BLOCK'});
}
const solid=ASSETS.find(a=>a.size&&a.size.every(n=>n>0)&&!a.group.startsWith('怪物'));
assert.throws(()=>buildBlockScene({blocks:[{template:solid.id,position:[0,0,0],size:[1,0,1]}]}),{code:'INVALID_BLOCK'});
// Two packs built back to back (same second) must not share entity IDs: they are meant to be imported together.
import {buildSceneBlocks} from '../src/scene-build.mjs';
{
 const dir=(await import('node:fs')).mkdtempSync((await import('node:path')).join((await import('node:os')).tmpdir(),'miliastra-ids-'));
 const one=buildSceneBlocks({name:'IdsA',blocks:[{template:solid.id,position:[0,0,0]}],install:false},dir);
 const two=buildSceneBlocks({name:'IdsB',blocks:[{template:solid.id,position:[2,0,0]}],install:false},dir);
 const moved=buildSceneBlocks({name:'Moved',blocks:[{template:solid.id,position:[2,7.6,0]}],offset:[1,-7.6,3],install:false},dir);
 assert.deepEqual(moved.bounds.min.map((n,axis)=>Math.round((n-two.bounds.min[axis])*10)/10),[1,0,3],'offset moves every piece');
 assert.ok(two.entityIds[0]>one.entityIds[1],'ID ranges overlap: '+one.entityIds+' and '+two.entityIds);
 (await import('node:fs')).rmSync(dir,{recursive:true,force:true});
}

// The same through a real MCP connection: the photo must reach the client as an image block, not as text.
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-assets-'));
const client=new Client({name:'scene-assets-test',version:'1'});
await client.connect(new StdioClientTransport({command:process.execPath,args:[path.join(root,'src/server.mjs')],cwd:root,env:{...process.env,MILIASTRA_WORKSPACE:workspace},stderr:'pipe'}));
try{
 const found=await client.callTool({name:'scene_search_assets',arguments:{query:'乔木',limit:5}});
 const ids=(found.structuredContent?.assets??JSON.parse(found.content.at(-1).text).assets).filter(a=>a.hasImage).map(a=>a.id).slice(0,3);
 assert.ok(ids.length>0);
 const seen=await client.callTool({name:'scene_asset_images',arguments:{ids}});
 assert.ok(!seen.isError);
 const blocks=seen.content.filter(c=>c.type==='image');
 assert.equal(blocks.length,ids.length);
 assert.ok(blocks.every(b=>b.mimeType==='image/jpeg'&&Buffer.from(b.data,'base64').length>1000));
 // Effects: the contact sheets of the first looping effects photographed in play, pictures by id (the photo where there
 // is one), and an honest answer for an id that is not an effect. tests/media-catalog.mjs covers the search by name.
 const sheet=await client.callTool({name:'effect_catalog',arguments:{page:0}});
 assert.ok(!sheet.isError);
 assert.equal(sheet.content.filter(c=>c.type==='image').length,1);
 assert.ok(sheet.structuredContent.pages>=3&&sheet.structuredContent.idsOnThisPage.includes(4));
 assert.match(sheet.structuredContent.usage,/mountLoopingSpecialEffect/);
 const some=await client.callTool({name:'effect_catalog',arguments:{ids:[147,9999]}});
 assert.deepEqual(some.structuredContent.effects,[{id:147,name:'风元素提示尾迹',kind:'looping'},{id:9999,found:false}]);
 assert.equal(some.content.filter(c=>c.type==='image').length,1);
 assert.ok(Buffer.from(some.content.find(c=>c.type==='image').data,'base64').length>5000,'effect 147 comes with its photo, not the small thumbnail');
}finally{await client.close();fs.rmSync(workspace,{recursive:true,force:true});}
console.log(JSON.stringify({ok:true,assets:ASSETS.length,withImage,flatAsset:flat?.id??null,viaMcp:true}));
