import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {hostConfig,hostError,PROTOCOL} from './config.mjs';

// How long a tool call may take. A call that compiles many graphs takes long (five to ten seconds a graph): fifteen
// seconds a graph on top of the usual three minutes. (Thirty-six graphs took longer than three minutes on 2026-10-12
// and the call was given up as "connection lost".)
const patience=(name,args)=>180000+(name==='write_graphs'?15000*(args?.graphs?.length??0):0);

export async function connectCore() {
  const host=hostConfig();let descriptor,session,identity;
  async function request(body,timeout=180000) {
    let response;
    try {response=await fetch(`http://127.0.0.1:${descriptor.port}/rpc`,{method:'POST',headers:{authorization:'Bearer '+descriptor.token,'Content-Type':'application/json'},body:JSON.stringify({protocol:PROTOCOL,configHash:host.configHash,session,...body}),signal:AbortSignal.timeout(timeout)});}
    catch(e) {throw hostError('CORE_UNAVAILABLE',e?.name==='TimeoutError'?'The core did not answer within '+Math.round(timeout/1000)+' s. It may still be working: inspect state before retrying.':'Core connection lost. Mutation outcome may be unknown; inspect state before retrying.');}
    const result=await response.json();
    if(!response.ok)throw hostError(result.error||'CORE_UNAVAILABLE','Core rejected request: '+result.error);
    return result;
  }
  let launched=false,lastError;
  for(let attempt=0;attempt<100;attempt++) {
    try {
      descriptor=JSON.parse(fs.readFileSync(host.discovery,'utf8'));
      if(descriptor.workspace!==host.config.workspace)throw hostError('CORE_CONFIG_MISMATCH','Another core configuration owns this workspace. Close its clients before switching configuration.');
      if(!Number.isInteger(descriptor.port)||descriptor.port<1||descriptor.port>65535||!/^\w{64}$/.test(descriptor.token))throw hostError('INVALID_DISCOVERY','Invalid core discovery record');
      identity=await request({op:'connect'},1500);
      if(identity.pid!==descriptor.pid||identity.ownerNonce!==descriptor.ownerNonce||identity.protocol!==PROTOCOL||identity.workspace!==host.config.workspace||identity.configHash!==host.configHash)throw hostError('CORE_IDENTITY_MISMATCH','Discovery identity did not match responding core');
      session=identity.session;break;
    }catch(e){lastError=e;if(['CORE_CONFIG_MISMATCH','INVALID_DISCOVERY','CORE_IDENTITY_MISMATCH'].includes(e.code))throw e;}
    if(!launched){
      launched=true;
      const log=fs.openSync(path.join(host.runtime,'startup.log'),'a',0o600);
      try{const child=spawn(process.execPath,[fileURLToPath(new URL('./daemon.mjs',import.meta.url))],{detached:true,windowsHide:true,shell:false,stdio:['ignore',log,log],env:process.env});child.on('error',e=>{lastError=e;});child.unref();}finally{fs.closeSync(log);}
    }
    await new Promise(r=>setTimeout(r,100));
  }
  if(!session)throw hostError('CORE_START_FAILED',`Core unavailable; writer lock is never reclaimed on timeout. Inspect ${path.join(host.runtime,'startup.log')}. ${lastError?.code||''}`);
  let closed=false;
  const heartbeat=setInterval(()=>{void request({op:'heartbeat'},3000).catch(()=>{});},5000);heartbeat.unref();
  return {identity,call:(name,args)=>{if(closed)throw hostError('CORE_UNAVAILABLE','Proxy closed');return request({op:'tool',name,arguments:args},patience(name,args));},close:async()=>{if(closed)return;closed=true;clearInterval(heartbeat);try{await request({op:'disconnect'},1500);}catch{}}};
}
