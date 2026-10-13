import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {inputDigest} from '../../dist/core/canonical.js';
import {revisionInput} from '../../dist/core/schemas.js';
import {ProjectStore} from '../../dist/core/project-store.js';
import {WorkspaceLease} from '../../dist/host/workspace-lease.js';
const key=p=>p+'_'+randomUUID();
export function fixture(){
  const workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-core-'));
  const lease=new WorkspaceLease(workspace),store=new ProjectStore(lease);
  const projectId=key('prj'),revisionId=key('rev'),sourceId=key('src');
  const blobHash=store.putBlob(Buffer.from('synthetic fixture; not a game asset'));
  const identity={schemaVersion:'1.0',projectId,displayName:'测试工程',createdAt:new Date().toISOString(),initialSourceIds:[sourceId]};
  const source={schemaVersion:'1.0',sourceId,projectId,localPath:path.join(workspace,'sample.gil'),format:'gil',blobHash,registeredAt:new Date().toISOString(),purpose:'reference',provenance:{origin:'synthetic-binary',licenseNote:'test-only',gameBuild:null,gameBuildSource:'unknown'}};
  const revision={schemaVersion:'1.0',projectId,revisionId,parentRevisionId:null,transactionId:key('txn'),createdAt:new Date().toISOString(),targetProfile:{gameBuild:null,editorBuild:null,mode:null,locale:null,coordinateProfile:null,gameBuildSource:'unknown'},contents:[],objects:[],resourceRefs:[],inputDigestVersion:'1',inputManifestHash:''};
  revision.inputManifestHash=inputDigest(revisionInput(revision));
  return {workspace,lease,store,identity,revision,source,close(){lease.close();}};
}
export function populated(f){
  const r=structuredClone(f.revision),contentId=key('cnt'),objectId=key('obj');
  const lock=f.store.putBlob(Buffer.from('{"backend":"test-only"}'));
  r.resourceRefs=[{resourceRef:'res_fixture',namespace:'test-only',gameId:'9007199254740993',name:'Synthetic model',resourceType:'platform',entityClass:'test',targetProfile:r.targetProfile,source:{sourceId:f.source.sourceId,artifactHash:f.source.blobHash},collisionEvidenceRefs:[],supportedComponents:[],verifiedEvidenceRefs:[]}];
  r.objects=[{objectId,contentId,roleKey:'start',objectKind:'platform',templateRef:'res_fixture',componentRefs:[],ownership:'generated',provenance:{sourceId:f.source.sourceId,artifactHash:f.source.blobHash,notes:'synthetic test only'}}];
  r.contents=[{schemaVersion:'1.0',contentId,displayName:'Example',kind:'test-only',authoringMode:'recipe',recipe:{id:'test-only',version:'1'},parameters:{},backend:{adapterId:'test-only',versionLockRef:lock},managedObjectIds:[objectId],lockedFields:[],sourceRefs:[],dependencies:[],requiredCapabilities:[],externalBindings:[],ownership:{mode:'generated',originRevisionId:r.revisionId}}];
  r.inputManifestHash=inputDigest(revisionInput(r));return r;
}

