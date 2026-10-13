// playtest_frames through a real MCP connection: the screenshots of a run come back as one picture, cut and labelled.
// The run is made up here (a few pictures and a status.json in the workspace): no game is needed.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-frames-'));
const python=process.env.MILIASTRA_PLAYTEST_PYTHON||process.env.MILIASTRA_PYTHON||'python';
const runId=randomUUID(),runDir=path.join(workspace,'playtests',runId);fs.mkdirSync(runDir,{recursive:true});
// Seven pictures of 320 x 180, each one colour, at 5.0, 5.5 ... 8.0 seconds.
const made=spawnSync(python,['-c',`
import sys
from PIL import Image
for k in range(7):
    Image.new('RGB',(320,180),(30*k,90,200-20*k)).save(sys.argv[1]+'/%02d-t%03d.jpg'%(k+1,5+k//2))
`,runDir],{encoding:'utf8'});
assert.equal(made.status,0,'Pillow is needed for this test: '+made.stderr);
const shots=[...Array(7).keys()].map(k=>({file:path.join(runDir,String(k+1).padStart(2,'0')+'-t'+String(5+Math.floor(k/2)).padStart(3,'0')+'.jpg'),label:'t'+String(5+Math.floor(k/2)).padStart(3,'0'),wallTime:1000+k,playSeconds:5+k/2}));
const write=(state,more=[])=>fs.writeFileSync(path.join(runDir,'status.json'),JSON.stringify({state,startedAt:1000,updatedAt:1010,steps:[],screenshots:[{file:path.join(runDir,'00-log.jpg'),label:'log-subscribed',wallTime:999},...shots,...more],result:{burstFramesDropped:1}}));
// Four frames of a burst, an eighth of a second apart from second 9 on (the files are copies of the first picture).
const burst=[9,9.12,9.25,9.37].map((t,k)=>({file:path.join(runDir,'1'+k+'-b009.jpg'),label:'b009',wallTime:1020+t,playSeconds:t,burst:true}));
write('succeeded');
const client=new Client({name:'playtest-frames-test',version:'1'});
await client.connect(new StdioClientTransport({command:process.execPath,args:[path.join(root,'src/server.mjs')],cwd:root,env:{...process.env,MILIASTRA_WORKSPACE:workspace},stderr:'pipe'}));
const call=async(name,args)=>{const r=await client.callTool({name,arguments:args});return r.isError?{error:r.structuredContent??JSON.parse(r.content[0].text)}:r;};
const jpeg=c=>c.type==='image'&&c.mimeType==='image/jpeg'&&Buffer.from(c.data,'base64').subarray(0,2).equals(Buffer.from([0xff,0xd8]));
const code=r=>r.error?.error?.code??r.error?.code;
try{
  // All seven, four to a row: 2000 wide, two rows of 500 x 281.
  let r=await call('playtest_frames',{runId}),d=r.structuredContent;
  assert.equal(r.content.filter(jpeg).length,1);
  assert.deepEqual(d.frames.map(f=>f.playSeconds),[5,5.5,6,6.5,7,7.5,8]);
  assert.equal(d.columns,4);assert.deepEqual(d.size,[2000,562]);assert.deepEqual(d.cell,[500,281]);
  assert.ok(fs.existsSync(d.sheet));
  // A span, every second frame, the left half of the picture, two columns of 300.
  d=(await call('playtest_frames',{runId,fromSeconds:5.5,toSeconds:7.5,every:2,crop:[0,0,0.5,1],columns:2,width:600})).structuredContent;
  assert.deepEqual(d.frames.map(f=>f.playSeconds),[5.5,6.5,7.5]);
  assert.deepEqual(d.cell,[300,338]);assert.deepEqual(d.size,[600,676]);
  // More frames than asked for: the first ones, and it says so.
  d=(await call('playtest_frames',{runId,maxFrames:3})).structuredContent;
  assert.equal(d.frames.length,3);assert.equal(d.skipped,4);assert.match(d.note,/every/);
  // Nothing in the span, a crop that is no rectangle, a run that is not there, a run that is not over.
  assert.equal(code(await call('playtest_frames',{runId,fromSeconds:20})),'NO_FRAMES');
  assert.equal(code(await call('playtest_frames',{runId,crop:[0.5,0,0.5,1]})),'INVALID_CROP');
  assert.equal(code(await call('playtest_frames',{runId:randomUUID()})),'PLAYTEST_NOT_FOUND');
  // Bursts: the frames come into a sheet like the others, with their play second to a hundredth; the status counts them
  // instead of listing them.
  for(const f of burst)fs.copyFileSync(shots[0].file,f.file);
  write('succeeded',burst);
  d=(await call('playtest_frames',{runId,fromSeconds:8.9,toSeconds:9.3})).structuredContent;
  assert.deepEqual(d.frames.map(f=>f.playSeconds),[9,9.12,9.25]);
  const told=(await call('playtest_status',{runId,includeScreenshots:false})).structuredContent;
  assert.equal(told.screenshots.length,8);assert.ok(told.screenshots.every(x=>x.label!=='b009'));
  assert.equal(told.burstFrames.count,4);assert.equal(told.burstFrames.fromSeconds,9);assert.equal(told.burstFrames.toSeconds,9.37);
  assert.ok(Math.abs(told.burstFrames.medianGapMs-125)<=10);assert.equal(told.burstFrames.dropped,1);
  write('running');
  assert.equal(code(await call('playtest_frames',{runId})),'PLAYTEST_RUNNING');
  console.log(JSON.stringify({ok:true}));
}finally{await client.close();fs.rmSync(workspace,{recursive:true,force:true});}
