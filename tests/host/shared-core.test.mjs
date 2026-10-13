import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {buildFile,encodeVarint} from 'genshin-ts/injector/binary';
import {loadGiaProto} from 'genshin-ts/injector/proto';
import {ROOT} from '../../src/core.mjs';
import {sha} from '../../src/adapter.mjs';
import {hostConfig,PROTOCOL} from '../../src/host/config.mjs';
import {WorkspaceLease} from '../../dist/host/workspace-lease.js';
const workspace=path.join(ROOT,'workspace','test-runs','host-'+randomUUID());
process.env.MILIASTRA_WORKSPACE=workspace;
process.env.MILIASTRA_SAVE_ROOTS='[]';
const clients=[];const transcript=[];
async function client(){const c=new Client({name:'self-ai-host-check',version:'0.1.0'});const transport=new StdioClientTransport({command:process.execPath,args:[path.join(ROOT,'src/server.mjs')],cwd:ROOT,stderr:'pipe',env:{...process.env}});transport.stderr?.on('data',b=>process.stderr.write(b));await c.connect(transport);clients.push(c);return c;}
async function call(c,name,args={},error){const r=await c.callTool({name,arguments:args},undefined,{timeout:180000});const d=r.structuredContent;transcript.push({name,arguments:args,result:d,isError:!!r.isError});if(error)assert.equal(d.error.code,error);else assert.ok(!r.isError,JSON.stringify(d));return d;}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function gone(file){for(let i=0;i<120&&fs.existsSync(file);i++)await delay(250);assert.ok(!fs.existsSync(file),'Daemon must release discovery and lease after clients close');}
test('two real MCP clients share one owner, reject invalid HTTP, preserve source and stop cleanly',async()=>{
  try {
    const [a,b]=await Promise.all([client(),client()]);
    const [ca,cb]=await Promise.all([call(a,'get_capabilities'),call(b,'get_capabilities')]);
    assert.equal(ca.core.pid,cb.core.pid);assert.equal(ca.core.ownerNonce,cb.core.ownerNonce);
    assert.throws(()=>new WorkspaceLease(workspace),e=>e.code==='WORKSPACE_IN_USE');
    const {nodeGraphMessage}=loadGiaProto();const graph=Buffer.from(nodeGraphMessage.encode({id:{class:10000,type:20000,kind:21001,id:1073741825},name:'_GSTS_MCP_Test'}).finish());
    const field=(id,b)=>Buffer.concat([Buffer.from(encodeVarint(id*8+2)),Buffer.from(encodeVarint(b.length)),b]);
    const bytes=buildFile(field(10,field(1,field(1,graph))),{schema:1,headTag:0x326,fileType:2,tailTag:0x679});
    const mapPath=path.join(workspace,'fixture.gil');fs.writeFileSync(mapPath,bytes);
    await call(a,'create_project',{projectId:'self-ai',mapPath});
    const code="import { g } from 'genshin-ts/runtime/core'\ng.server({ id: 1073741825, name: '_GSTS_MCP_Test' }).on('whenEntityIsCreated', (_evt, f) => { f.printString('AI_SHARED_CORE_VERIFIED') })\n";
    await call(b,'update_logic',{projectId:'self-ai',code});
    assert.equal((await call(a,'get_project',{projectId:'self-ai'})).code,code);
    const build=await call(a,'build_project',{projectId:'self-ai'});
    const preview=await call(b,'preview_changes',{projectId:'self-ai',buildId:build.buildId});
    const args={projectId:'self-ai',buildId:build.buildId,expectedSha256:preview.expectedSha256};
    const applied=await call(a,'apply_build',args);
    await call(b,'apply_build',args,'MAP_CHANGED');
    await call(b,'restore_backup',{projectId:'self-ai',backupId:applied.backupId,expectedSha256:applied.afterSha256});
    assert.equal(sha(fs.readFileSync(mapPath)),sha(bytes));
    const host=hostConfig();const d=JSON.parse(fs.readFileSync(host.discovery));
    const url=`http://127.0.0.1:${d.port}/rpc`;
    const post=(data={},extra={},auth=true)=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...(auth?{authorization:'Bearer '+d.token}:{}),...extra},body:JSON.stringify({protocol:PROTOCOL,configHash:host.configHash,...data})});
    assert.equal((await post({}, {},false)).status,401);
    assert.equal((await post({}, {Origin:'https://attacker.invalid'})).status,403);
    const badHost=await new Promise((resolve,reject)=>{const req=http.request(url,{method:'POST',headers:{Host:'attacker.invalid',authorization:'Bearer '+d.token,'Content-Type':'application/json'}},res=>{res.resume();resolve(res.statusCode);});req.on('error',reject);req.end('{}');});
    assert.equal(badHost,403);
    assert.equal((await post({configHash:'bad'})).status,409);
    assert.equal((await post({op:'tool',session:'fake',name:'list_maps',arguments:{}})).status,401);
    const connected=await (await post({op:'connect'})).json();
    const rpc=async(name,args)=> (await post({op:'tool',session:connected.session,name,arguments:args})).json();
    assert.equal((await rpc('constructor',{})).structuredContent.error.code,'UNKNOWN_TOOL');
    assert.equal((await rpc('create_project',{projectId:'../escape',mapPath})).structuredContent.error.code,'INVALID_ARGUMENT');
    assert.equal((await rpc('get_capabilities',{allowLive:true})).structuredContent.error.code,'INVALID_ARGUMENT');
    await post({op:'disconnect',session:connected.session});
    await a.close();
    assert.equal((await call(b,'get_capabilities')).core.pid,ca.core.pid,'Closing one client must not stop the shared core');
    await b.close();await gone(host.discovery);assert.ok(!fs.existsSync(path.join(workspace,'v1','WRITER.lock')));
    const c=await client();const cc=await call(c,'get_capabilities');assert.notEqual(cc.core.ownerNonce,ca.core.ownerNonce);
    assert.equal((await call(c,'get_project',{projectId:'self-ai'})).code,code);
    await c.close();await gone(host.discovery);
    fs.writeFileSync(path.join(workspace,'report.json'),JSON.stringify({passed:true,at:new Date().toISOString(),transport:'two MCP stdio proxies / one loopback core',fixture:'synthetic, not playable',workspace,gameplay:'not_run',transcript},null,2));
    console.log('Evidence: '+path.join(workspace,'report.json'));
  }finally{await Promise.allSettled(clients.map(c=>c.close()));}
});

test('crashed core recovers verified dead owner without replaying mutations',async()=>{
  const {spawn,spawnSync}=await import('node:child_process');
  const {connectCore}=await import('../../src/host/core-client.mjs');
  process.env.MILIASTRA_WORKSPACE=path.join(ROOT,'workspace','test-runs','host-crash-'+randomUUID());
  const host=hostConfig();
  const daemon=spawn(process.execPath,[path.join(ROOT,'src/host/daemon.mjs')],{cwd:ROOT,env:{...process.env},windowsHide:true,stdio:['ignore','ignore','pipe']});
  let core;
  try {
    for(let i=0;i<100&&!fs.existsSync(host.discovery);i++)await delay(100);
    assert.ok(fs.existsSync(host.discovery));core=await connectCore();assert.equal(core.identity.pid,daemon.pid);
    const exited=new Promise(resolve=>daemon.once('exit',resolve));daemon.kill();await exited;
    await assert.rejects(core.call('update_logic',{projectId:'never-replay',code:'// no write'}),e=>e.code==='CORE_UNAVAILABLE');
    const lock=path.join(host.config.workspace,'v1','WRITER.lock');assert.ok(fs.existsSync(lock));
    const previous=fs.readFileSync(lock);
    await core.close();
    const replacement=await connectCore();
    try {
      assert.notEqual(replacement.identity.pid,daemon.pid);
      assert.notEqual(replacement.identity.ownerNonce,core.identity.ownerNonce);
      assert.ok(!fs.readFileSync(lock).equals(previous));
      assert.ok(!fs.existsSync(path.join(host.config.workspace,'never-replay')));
      assert.ok(fs.readdirSync(path.join(host.config.workspace,'v1','recovery')).length);
      fs.writeFileSync(path.join(host.config.workspace,'report.json'),JSON.stringify({passed:true,at:new Date().toISOString(),crashRecovery:'verified_process_identity',noAutomaticReplay:true,staleLockArchived:true},null,2));
    }finally{await replacement.close();await gone(host.discovery);}
    console.log('Crash evidence: '+path.join(host.config.workspace,'report.json'));
  }finally{await core?.close();if(daemon.exitCode===null&&daemon.signalCode===null)daemon.kill();}
});
