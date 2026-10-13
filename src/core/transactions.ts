import {randomUUID} from 'node:crypto';
import fs from 'node:fs';
import {z} from 'zod';
import {ProjectStore} from './project-store.js';
import {CoreError} from './errors.js';
import {canonicalJson,inputDigest} from './canonical.js';
import {id,Hash,JsonValue,ProjectRevision,revisionInput} from './schemas.js';

const Result=z.record(JsonValue);
const Journal=z.object({schemaVersion:z.literal('1.0'),transactionId:id('txn'),command:z.string(),projectId:id('prj'),mutationId:z.string().uuid(),requestDigest:Hash,baseRevision:id('rev').nullable(),intendedRevision:id('rev'),createdAt:z.string().datetime(),state:z.enum(['prepared','committed','aborted']),result:Result}).strict();
type Journal=z.infer<typeof Journal>;
export class Transactions {
  constructor(readonly store:ProjectStore,private readonly fault?:(phase:string)=>void) {}
  private index(command:string,projectId:string,mutationId:string){return ['idempotency',inputDigest({command,projectId,mutationId})+'.json'];}
  lookup(command:string,projectId:string,mutationId:string,request:unknown):Record<string,any>|null {
    z.string().uuid().parse(mutationId);id('prj').parse(projectId);
    const parts=this.index(command,projectId,mutationId);
    if(!this.store.hasRecord(parts))return null;
    const j=Journal.parse(this.store.readRecord(parts));
    if(j.requestDigest!==inputDigest(request))throw new CoreError('IDEMPOTENCY_KEY_REUSED','Mutation ID belongs to a different request');
    if(j.state==='aborted')throw new CoreError('TRANSACTION_INTERRUPTED','Previous attempt did not commit; use a new mutation ID after inspecting state');
    if(j.state!=='committed')throw new CoreError('RECOVERY_REQUIRED','Pending transaction requires recovery');
    return j.result;
  }
  commit(command:string,projectId:string,mutationId:string,request:unknown,target:ProjectRevision,result:Record<string,any>):Record<string,any> {
    const cached=this.lookup(command,projectId,mutationId,request);if(cached)return cached;
    const current=this.store.readProject(projectId).revision;
    if(target.parentRevisionId!==current.revisionId)throw new CoreError('PROJECT_REVISION_CHANGED','Plan base no longer current');
    ProjectRevision.parse(target);
    const j:Journal={schemaVersion:'1.0',transactionId:target.transactionId,command,projectId,mutationId,requestDigest:inputDigest(request),baseRevision:current.revisionId,intendedRevision:target.revisionId,createdAt:new Date().toISOString(),state:'prepared',result};
    Journal.parse(j);
    const parts=['projects',projectId,'journal',j.transactionId+'.json'];
    this.store.writeRecord(parts,j);this.fault?.('prepared');
    this.store.stageRevision(target);this.fault?.('revision');
    this.store.switchRevision(projectId,current.revisionId,target.revisionId);this.fault?.('current');
    this.store.replaceRecord(parts,{...j,state:'committed'});this.fault?.('committed');
    this.store.writeRecord(this.index(command,projectId,mutationId),{...j,state:'committed'});this.fault?.('indexed');
    return result;
  }
  recover():{committed:number,aborted:number} {
    const report={committed:0,aborted:0};
    for(const projectId of this.store.listProjects()) {
      // Verify every current source and referenced blob before enabling any mutations.
      let current=this.store.readProject(projectId).revision;
      const history=new Map<string,ProjectRevision>(),seen=new Set<string>();
      for(;;){
        if(seen.has(current.revisionId))throw new CoreError('RECOVERY_REQUIRED','Revision history contains a cycle');
        seen.add(current.revisionId);history.set(current.revisionId,current);
        if(!current.parentRevisionId)break;
        current=this.store.readProject(projectId,current.parentRevisionId).revision;
      }
      const dir=this.store.checked('projects',projectId,'journal');if(!fs.existsSync(dir))continue;
      for(const name of fs.readdirSync(dir).filter(n=>n.endsWith('.json'))){
        const parts=['projects',projectId,'journal',name],j=Journal.parse(this.store.readRecord(parts));
        if(j.projectId!==projectId||name!==j.transactionId+'.json')throw new CoreError('RECOVERY_REQUIRED','Journal identity mismatch');
        const committed=history.get(j.intendedRevision);
        let state:'committed'|'aborted';
        if(committed){if(committed.transactionId!==j.transactionId||committed.parentRevisionId!==j.baseRevision)throw new CoreError('RECOVERY_REQUIRED','Journal does not match committed history');state='committed';}
        else if(j.state==='committed')throw new CoreError('RECOVERY_REQUIRED','Committed transaction is absent from history');
        else if(history.has(j.baseRevision!))state='aborted';
        else throw new CoreError('RECOVERY_REQUIRED','Cannot explain journal ancestry');
        // All writes happen after integrity validation for this project; aborted staging stays as evidence.
        const recovered={...j,state};this.store.replaceRecord(parts,recovered);
        const index=this.index(j.command,j.projectId,j.mutationId);
        if(this.store.hasRecord(index)&&canonicalJson(this.store.readRecord(index))!==canonicalJson(recovered))throw new CoreError('RECOVERY_REQUIRED','Idempotency record disagrees with journal');
        if(!this.store.hasRecord(index))this.store.writeRecord(index,recovered);
        report[state]++;
      }
    }
    return report;
  }
}
export function nextRevision(base:ProjectRevision):ProjectRevision {
  const r=structuredClone(base);r.revisionId='rev_'+randomUUID();r.parentRevisionId=base.revisionId;r.transactionId='txn_'+randomUUID();r.createdAt=new Date().toISOString();return r;
}
export function sealRevision(r:ProjectRevision):ProjectRevision {r.inputManifestHash=inputDigest(revisionInput(r));return ProjectRevision.parse(r);}
