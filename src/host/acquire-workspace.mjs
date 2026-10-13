import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {fileURLToPath} from 'node:url';
import {WorkspaceLease} from '../../dist/host/workspace-lease.js';
import {hostError} from './config.mjs';

export async function acquireWorkspace(workspace,python='python') {
  if(process.platform!=='win32')return new WorkspaceLease(workspace);
  const helper=spawn(python,['-X','utf8',fileURLToPath(new URL('./win_mutex.py',import.meta.url)),workspace,String(process.pid)],{windowsHide:true,shell:false,stdio:['pipe','pipe','pipe']});
  const lines=createInterface({input:helper.stdout});const buffered=[];const waiters=[];let alive=true;
  const failed=e=>{alive=false;while(waiters.length)waiters.shift().reject(e);};
  helper.on('error',failed);helper.on('exit',()=>failed(hostError('CORE_OWNERSHIP_LOST','Kernel guard exited')));
  helper.stderr.resume();helper.stdin.on('error',()=>{});
  lines.on('line',line=>{try{const v=JSON.parse(line);const w=waiters.shift();if(w)w.resolve(v);else buffered.push(v);}catch{failed(hostError('CORE_OWNERSHIP_LOST','Invalid kernel guard response'));}});
  const read=()=>buffered.length?Promise.resolve(buffered.shift()):new Promise((resolve,reject)=>{if(!alive)return reject(hostError('CORE_OWNERSHIP_LOST','Kernel guard not running'));const timer=setTimeout(()=>{reject(hostError('CORE_START_FAILED','Kernel guard timeout'));helper.kill();},5000);waiters.push({resolve:v=>{clearTimeout(timer);resolve(v);},reject:e=>{clearTimeout(timer);reject(e);}});});
  try {
    const ready=await read();if(ready.error)throw hostError(ready.error,'Workspace kernel guard unavailable');
    const v1=path.join(workspace,'v1'),lock=path.join(v1,'WRITER.lock');
    if(fs.existsSync(v1)&&fs.lstatSync(v1).isSymbolicLink())throw hostError('PATH_OUTSIDE_PROJECT','Linked v1');
    if(fs.existsSync(lock)){
      if(fs.lstatSync(lock).isSymbolicLink())throw hostError('PATH_OUTSIDE_PROJECT','Linked lock');
      const bytes=fs.readFileSync(lock);let owner;
      try{owner=JSON.parse(bytes);}catch{throw hostError('RECOVERY_REQUIRED','Malformed writer record; preserve for diagnosis');}
      if(!Number.isInteger(owner.pid)||owner.pid<1)throw hostError('RECOVERY_REQUIRED','Invalid writer identity');
      helper.stdin.write(JSON.stringify({op:'inspect',pid:owner.pid})+'\n');const current=await read();
      if(current.error)throw hostError(current.error,'Cannot verify previous owner');
      if(current.processIdentity!==null && (!owner.processIdentity || current.processIdentity===owner.processIdentity))throw hostError('WORKSPACE_IN_USE','Previous writer process is still alive');
      // Kernel mutex serializes reclaimers. Byte compare protects evidence against non-core changes.
      if(!fs.readFileSync(lock).equals(bytes))throw hostError('WORKSPACE_IN_USE','Writer record changed');
      const archive=path.join(v1,'recovery');fs.mkdirSync(archive,{recursive:true});
      if(fs.lstatSync(archive).isSymbolicLink())throw hostError('PATH_OUTSIDE_PROJECT','Linked recovery directory');
      fs.writeFileSync(path.join(archive,'writer-'+Date.now()+'-'+process.pid+'.json'),bytes,{flag:'wx',mode:0o600});
      fs.unlinkSync(lock);
    }
    const lease=new WorkspaceLease(workspace,ready.processIdentity);
    const assert=lease.assertOwned.bind(lease),close=lease.close.bind(lease);
    lease.assertOwned=()=>{if(!alive)throw hostError('CORE_OWNERSHIP_LOST','Kernel guard is no longer held');assert();};
    lease.close=()=>{try{close();}finally{helper.stdin.end();}};
    return lease;
  }catch(e){helper.stdin.end();throw e;}
}
