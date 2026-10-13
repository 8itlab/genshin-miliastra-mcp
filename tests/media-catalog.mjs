// effect_catalog, sound_catalog and music_catalog through a real MCP connection: an AI that only has this server
// must be able to find the effect, the sound and the piece of music for a moment of its level by name.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-media-'));
const client=new Client({name:'media-catalog-test',version:'1'});
await client.connect(new StdioClientTransport({command:process.execPath,args:[path.join(root,'src/server.mjs')],cwd:root,env:{...process.env,MILIASTRA_WORKSPACE:workspace},stderr:'pipe'}));
const call=async(name,args)=>{const r=await client.callTool({name,arguments:args});assert.ok(!r.isError,JSON.stringify(r.content).slice(0,300));return r;};
const data=r=>r.structuredContent??JSON.parse(r.content.find(c=>c.type==='text').text);
const jpeg=c=>c.type==='image'&&c.mimeType==='image/jpeg'&&Buffer.from(c.data,'base64').subarray(0,2).equals(Buffer.from([0xff,0xd8]));
try{
 // Effects: both lists, found by words of the name, with the editor's thumbnails.
 let r=await call('effect_catalog',{query:'烟花'}),d=data(r);
 assert.ok(d.counts.timed>1900&&d.counts.looping>1100);
 assert.ok(d.rows.some(e=>e.id===10004163&&e.name==='橙色烟花'&&e.kind==='timed'&&e.seconds>5));
 assert.equal(r.content.filter(jpeg).length,d.picturesOf.length);
 assert.ok(d.picturesOf.length>0&&d.picturesOf.length<=12);
 assert.match(d.usage,/playTimedEffects/);assert.match(d.usage,/mountLoopingSpecialEffect/);
 d=data(await call('effect_catalog',{query:'提示',kind:'looping',pictures:0}));
 assert.ok(d.rows.every(e=>e.kind==='looping'&&e.name.includes('提示')));
 assert.ok(d.rows.some(e=>e.id===138));
 d=data(await call('effect_catalog',{query:'受击 火',kind:'timed',limit:200}));
 assert.ok(d.total>0&&d.rows.every(e=>e.name.includes('受击')&&e.name.includes('火')));
 // The ids found on 2026-10-09 by trying every number are exactly the looping effects below 1000.
 d=data(await call('effect_catalog',{kind:'looping',limit:200,pictures:0}));
 assert.deepEqual(d.rows.filter(e=>e.id<1000).map(e=>e.id).slice(0,6),[4,6,8,10,11,12]);
 r=await call('effect_catalog',{ids:[10002057,4,999999]});d=data(r);
 assert.equal(d.effects[0].name,'角色拾取特效');assert.equal(d.effects[1].kind,'looping');assert.equal(d.effects[2].found,false);
 assert.equal(r.content.filter(jpeg).length,2);
 r=await call('effect_catalog',{page:0});
 assert.ok(jpeg(r.content[0]));assert.ok(data(r).idsOnThisPage.includes(4));
 // Sounds.
 d=data(await call('sound_catalog',{}));
 assert.ok(d.count>500);assert.ok(d.categories.includes('界面音效'));
 assert.match(d.usage,/playerPlaysOneShot2dSoundEffect/);
 d=data(await call('sound_catalog',{query:'弓箭',limit:100}));
 assert.ok(d.total>3&&d.rows.every(s=>s.name.includes('弓箭')&&s.id>=10000));
 d=data(await call('sound_catalog',{category:'界面',limit:300}));
 assert.ok(d.total>10&&d.rows.every(s=>s.category==='界面音效'));
 // Music.
 d=data(await call('music_catalog',{category:'战斗'}));
 assert.equal(d.count,188);assert.ok(d.total>50&&d.rows.every(m=>m.category==='战斗音乐'&&m.seconds>30));
 d=data(await call('music_catalog',{query:'壶中洞天'}));
 assert.deepEqual(d.rows.map(m=>[m.id,m.seconds,m.category]),[[10012,194,'探索音乐']]);
 assert.match(d.usage,/modifyPlayerBackgroundMusic/);
 console.log('media catalog ok');
}finally{await client.close();fs.rmSync(workspace,{recursive:true,force:true});}
