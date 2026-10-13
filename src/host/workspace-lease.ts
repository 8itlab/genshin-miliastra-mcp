import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { CoreError } from '../core/errors.js';

// Conservative first lease: never reclaim an unknown/stale owner automatically.
// Process-instance verification and daemon discovery belong to W-08.
export class WorkspaceLease {
  readonly workspace: string;
  readonly ownerNonce = randomUUID();
  private readonly lockPath: string;
  private readonly descriptor: number;
  private closed = false;

  constructor(workspace: string, processIdentity?: string) {
    fs.mkdirSync(workspace,{recursive:true});
    this.workspace=fs.realpathSync(workspace);
    const v1=path.join(this.workspace,'v1');
    if(fs.existsSync(v1) && fs.lstatSync(v1).isSymbolicLink())throw new CoreError('PATH_OUTSIDE_PROJECT','v1 cannot be a link');
    fs.mkdirSync(v1,{recursive:true});
    this.lockPath=path.join(v1,'WRITER.lock');
    try { this.descriptor=fs.openSync(this.lockPath,'wx',0o600); }
    catch(error) {
      if((error as NodeJS.ErrnoException).code==='EEXIST')throw new CoreError('WORKSPACE_IN_USE','Workspace already has a writer record; no automatic stale-lock takeover');
      throw error;
    }
    try {
      fs.writeFileSync(this.descriptor,JSON.stringify({pid:process.pid,processIdentity:processIdentity??null,ownerNonce:this.ownerNonce,processStartedAt:new Date(Date.now()-process.uptime()*1000).toISOString(),acquiredAt:new Date().toISOString()}));
      fs.fsyncSync(this.descriptor);
    }catch(error){fs.closeSync(this.descriptor);fs.unlinkSync(this.lockPath);throw error;}
  }

  assertOwned(): void {
    if(this.closed)throw new CoreError('CORE_UNAVAILABLE','Workspace lease is closed');
    if(fs.lstatSync(this.lockPath).isSymbolicLink())throw new CoreError('WORKSPACE_IN_USE','Writer record replaced');
    const owner=JSON.parse(fs.readFileSync(this.lockPath,'utf8'));
    if(owner.ownerNonce!==this.ownerNonce || owner.pid!==process.pid)throw new CoreError('WORKSPACE_IN_USE','Writer ownership changed');
  }

  close(): void {
    if(this.closed)return;
    try {this.assertOwned();fs.unlinkSync(this.lockPath);}
    finally {this.closed=true;fs.closeSync(this.descriptor);}
  }
}
