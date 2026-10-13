import fs from 'node:fs';
import http from 'node:http';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {ProjectStore} from '../../dist/core/project-store.js';
import {Transactions} from '../../dist/core/transactions.js';
import {randomBytes,randomUUID,timingSafeEqual} from 'node:crypto';
import {Service} from '../core.mjs';
import {toolRegistry,invokeTool} from '../tool-registry.mjs';
import {acquireWorkspace} from './acquire-workspace.mjs';
import {hostConfig,PROTOCOL} from './config.mjs';

const host=hostConfig();
const lease=await acquireWorkspace(host.config.workspace,host.config.python);
let store,transactions,recovery;
try {
 if(process.platform==='win32')execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-File',fileURLToPath(new URL('./private-runtime.ps1',import.meta.url)),host.runtime],{windowsHide:true,stdio:'pipe',timeout:15000});
 store=new ProjectStore(lease);transactions=new Transactions(store);recovery=transactions.recover();
}catch(e){lease.close();throw e;}
const service=new Service(host.config);
const baseCapabilities=service.capabilities.bind(service);
service.capabilities=()=>({...baseCapabilities(),core:{protocol:PROTOCOL,pid:process.pid,ownerNonce:lease.ownerNonce,sharedWorkspace:true,crashRecovery:process.platform==='win32'?'process_identity_and_revision_journal':'manual_lease',journalTransactions:true,recovery}});
const definitions=new Map(toolRegistry(service).map(d=>[d.name,d]));
const token=randomBytes(32).toString('hex');
const sessions=new Map();
let queue=Promise.resolve(),pending=0,closing=false,lastActive=Date.now();
const reply=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
const server=http.createServer(async(req,res)=>{
  const address=server.address();
  const origin=`http://127.0.0.1:${address.port}`;
  const supplied=Buffer.from(req.headers.authorization||'');const expected=Buffer.from('Bearer '+token);
  if(req.headers.host!==`127.0.0.1:${address.port}`||(req.headers.origin&&req.headers.origin!==origin))return reply(res,403,{error:'ORIGIN_REJECTED'});
  if(supplied.length!==expected.length||!timingSafeEqual(supplied,expected))return reply(res,401,{error:'UNAUTHORIZED'});
  if(req.method!=='POST'||req.url!=='/rpc'||req.headers['content-type']!=='application/json')return reply(res,400,{error:'INVALID_REQUEST'});
  let body;
  try {
    let bytes=0;const chunks=[];
    for await(const chunk of req){bytes+=chunk.length;if(bytes>1024*1024){reply(res,413,{error:'BODY_TOO_LARGE'});return;}chunks.push(chunk);}
    body=JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if(!body||typeof body!=='object'||Array.isArray(body))throw new Error();
  }catch{return reply(res,400,{error:'INVALID_JSON'});}
  if(body.protocol!==PROTOCOL||body.configHash!==host.configHash)return reply(res,409,{error:'CORE_CONFIG_MISMATCH'});
  if(closing)return reply(res,503,{error:'CORE_CLOSING'});
  lastActive=Date.now();
  if(body.op==='connect') {const session=randomUUID();sessions.set(session,Date.now());return reply(res,200,{session,pid:process.pid,ownerNonce:lease.ownerNonce,protocol:PROTOCOL,configHash:host.configHash,workspace:host.config.workspace});}
  if(!sessions.has(body.session))return reply(res,401,{error:'SESSION_EXPIRED'});
  sessions.set(body.session,Date.now());
  if(body.op==='heartbeat')return reply(res,200,{ok:true});
  if(body.op==='disconnect'){sessions.delete(body.session);return reply(res,200,{ok:true});}
  if(body.op!=='tool')return reply(res,400,{error:'UNKNOWN_OPERATION'});
  pending++;
  const operation=queue.then(async()=>{lease.assertOwned();return invokeTool(definitions.get(body.name),body.arguments);});
  queue=operation.catch(()=>{});
  // A call that keeps this process busy for long lets no heartbeat through: the session is as alive as its call.
  try {reply(res,200,await operation);}catch{reply(res,503,{error:'CORE_OWNERSHIP_LOST'});}finally{pending--;lastActive=Date.now();if(sessions.has(body.session))sessions.set(body.session,Date.now());}
});
server.requestTimeout=10000;
server.headersTimeout=10000;
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const descriptor={protocol:PROTOCOL,configHash:host.configHash,workspace:host.config.workspace,pid:process.pid,ownerNonce:lease.ownerNonce,port:server.address().port,token};
const temp=host.discovery+'.'+randomUUID()+'.tmp';
fs.writeFileSync(temp,JSON.stringify(descriptor),{flag:'wx',mode:0o600});fs.renameSync(temp,host.discovery);
async function shutdown(){
  if(closing)return;closing=true;clearInterval(timer);
  await queue;
  await new Promise(resolve=>{server.close(resolve);server.closeIdleConnections();});
  try{const saved=JSON.parse(fs.readFileSync(host.discovery,'utf8'));if(saved.ownerNonce===lease.ownerNonce)fs.unlinkSync(host.discovery);}catch{}
  lease.close();
}
const timer=setInterval(()=>{
  // No session is given up while a call is being worked on: its heartbeats may be waiting behind that call.
  if(!pending)for(const [id,lastSeen] of sessions)if(Date.now()-lastSeen>20000)sessions.delete(id);
  if(!sessions.size&&!pending&&Date.now()-lastActive>4000)void shutdown();
},1000);
process.once('SIGTERM',()=>void shutdown());process.once('SIGINT',()=>void shutdown());
console.error(`Miliastra core ready (PID ${process.pid}); loopback only`);
