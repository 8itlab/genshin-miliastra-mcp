// publish_kit through a real MCP connection: five screenshots of a made-up run become a cover and four pictures of
// 1600 x 900, with a listing and a checklist. No game is needed.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {titleLength} from '../src/publish.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-kit-'));
const python=process.env.MILIASTRA_PLAYTEST_PYTHON||process.env.MILIASTRA_PYTHON||'python';
const runId=randomUUID(),runDir=path.join(workspace,'playtests',runId);fs.mkdirSync(runDir,{recursive:true});
// Six pictures at 10, 20 ... 60 seconds: five of 16:9 and the last one of 4:3.
const made=spawnSync(python,['-c',`
import sys
from PIL import Image
for k in range(6):
    Image.new('RGB',(800,600) if k==5 else (1280,720),(40*k,90,200-30*k)).save(sys.argv[1]+'/%02d.jpg'%k)
`,runDir],{encoding:'utf8'});
assert.equal(made.status,0,'Pillow is needed for this test: '+made.stderr);
fs.writeFileSync(path.join(runDir,'status.json'),JSON.stringify({state:'succeeded',startedAt:1000,updatedAt:1100,steps:[],
  screenshots:[...Array(6).keys()].map(k=>({file:path.join(runDir,String(k).padStart(2,'0')+'.jpg'),label:'t',wallTime:1000+k,playSeconds:10*(k+1)}))}));
assert.deepEqual([titleLength('竞技场清怪'),titleLength('Arena 3'),titleLength('守夜人：三夜不眠的营地')],[5,3.5,11]);
const client=new Client({name:'publish-kit-test',version:'1'});
await client.connect(new StdioClientTransport({command:process.execPath,args:[path.join(root,'src/server.mjs')],cwd:root,env:{...process.env,MILIASTRA_WORKSPACE:workspace},stderr:'pipe'}));
try{
  const at=s=>({runId,playSeconds:s});
  const plain=path.join(root,'knowledge','samples','gil',fs.readdirSync(path.join(root,'knowledge','samples','gil')).find(f=>f.endsWith('_环境配置.gil')));
  const r=await client.callTool({name:'publish_kit',arguments:{name:'arena',title:'竞技场清怪',description:'三波怪从场边冲进来，挥剑清场。打完最后一波获胜，血空了就输。波间记得捡回血的果子。',tags:['动作','单人'],cover:at(30.4),images:[at(10),at(20),at(40),at(50)],mapPath:plain}});
  assert.ok(!r.isError,JSON.stringify(r.structuredContent??r.content));
  const kit=r.structuredContent;
  assert.deepEqual(kit.from.map(f=>f.playSeconds),[30,10,20,40,50]);
  for(const file of [kit.cover,...kit.pictures])assert.ok(fs.statSync(file).size>1000,file+' was not written');
  const size=spawnSync(python,['-c','import sys\nfrom PIL import Image\nprint(Image.open(sys.argv[1]).size)',kit.cover],{encoding:'utf8'}).stdout.trim();
  assert.equal(size,'(1600, 900)');
  const by=item=>kit.checklist.find(c=>c.item===item);
  assert.deepEqual(['title','description','tags','pictures','video','players','respawn'].map(i=>by(i).ok),[true,true,true,true,false,true,false]);
  assert.match(by('players').note,/1 to 8/);
  assert.equal(r.content[1].type,'image');
  assert.match(fs.readFileSync(kit.listing,'utf8'),/^# 竞技场清怪/);
  // A long title, a picture that is not 16:9, the same moment twice.
  const bad=(await client.callTool({name:'publish_kit',arguments:{name:'arena2',title:'守夜人：三夜不眠的营地',description:'短',cover:at(60),images:[at(10),at(10),at(20),at(30)]}})).structuredContent;
  assert.deepEqual(['title','description','tags','pictures'].map(i=>bad.checklist.find(c=>c.item===i).ok),[false,false,false,false]);
  const none=await client.callTool({name:'publish_kit',arguments:{name:'arena3',title:'x',description:'this is long enough to count',cover:at(200),images:[at(10),at(20),at(30),at(40)]}});
  assert.ok(none.isError&&JSON.stringify(none.structuredContent).includes('NO_SCREENSHOT_THERE'));
  console.log(JSON.stringify({ok:true}));
}finally{await client.close();fs.rmSync(workspace,{recursive:true,force:true});}
