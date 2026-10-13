// Read-only source capture; every compiler/write test targets a registered copy.
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { ROOT } from '../src/core.mjs';
import { sha, inspectBytes } from '../src/adapter.mjs';
process.env.MILIASTRA_STEP_TOOLS='1'; // this script takes the steps of writing a graph one by one (create_project ... apply_build)

const workspace=path.join(ROOT,'workspace');
const runDir=path.join(workspace,'baselines',new Date().toISOString().replace(/[:.]/g,'-')+'-'+randomUUID());
fs.mkdirSync(runDir,{recursive:true});
const report={schemaVersion:'1.0',startedAt:new Date().toISOString(),node:process.version,platform:process.platform,arch:process.arch,nodeSha256:sha(fs.readFileSync(process.execPath)),packageLockSha256:sha(fs.readFileSync(path.join(ROOT,'package-lock.json'))),historicalReports:[],tests:[],gameplay:'not_run',capture:'not_run',passed:false};
const save=()=>fs.writeFileSync(path.join(runDir,'report.json'),JSON.stringify(report,null,2)+'\n');
for(const name of ['mcp-smoke-report.json','synthetic-smoke-report.json','capture-smoke-report.json']) {
  const file=path.join(workspace,name);
  if(!fs.existsSync(file))continue;
  const bytes=fs.readFileSync(file);fs.writeFileSync(path.join(runDir,name),bytes,{flag:'wx'});
  report.historicalReports.push({name,sha256:sha(bytes)});
}
async function run(name,args,env={}) {
  const startedAt=new Date().toISOString();
  const outcome=await new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,args,{cwd:ROOT,windowsHide:true,shell:false,env:{...process.env,...env}});
    const chunks=[];
    for(const stream of [child.stdout,child.stderr])stream.on('data',b=>{chunks.push(b);process.stdout.write(b);});
    child.on('error',reject);
    child.on('close',(exitCode,signal)=>resolve({exitCode,signal,output:Buffer.concat(chunks)}));
  });
  fs.writeFileSync(path.join(runDir,name+'.log'),outcome.output);
  report.tests.push({name,command:[process.execPath,...args],startedAt,finishedAt:new Date().toISOString(),exitCode:outcome.exitCode,signal:outcome.signal,status:outcome.exitCode===0?'passed':'failed',logSha256:sha(outcome.output)});save();
  if(outcome.exitCode!==0)throw new Error(`Baseline ${name} failed; inspect ${runDir}`);
}
try {
  // Freeze the explicitly recorded historical source, never whichever map is newest.
  const previous=JSON.parse(fs.readFileSync(path.join(runDir,'mcp-smoke-report.json'),'utf8'));
  const creation=previous.transcript.find(x=>x.tool==='create_project'&&!x.isError);
  if(!creation)throw new Error('Historical source registration missing');
  const source=creation.arguments.mapPath, bytes=fs.readFileSync(source);
  inspectBytes(bytes);
  if(sha(bytes)!==creation.result.sourceSha256)throw new Error('Recorded source has changed; register new provenance explicitly');
  const fixtureRoot=path.join(runDir,'real-fixture'),mapDir=path.join(fixtureRoot,'1','Beyond_Local_Save_Level');
  fs.mkdirSync(mapDir,{recursive:true});const snapshot=path.join(mapDir,path.basename(source));
  fs.writeFileSync(snapshot,bytes,{flag:'wx'});
  report.fixture={origin:'real-editor-save',sourcePath:source,snapshotPath:snapshot,sha256:sha(bytes),gameBuild:null,editorBuild:null,distribution:'local-only'};
  const legacy=creation.arguments.projectId;
  if(!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(legacy))throw new Error('Invalid historical legacy ID');
  fs.cpSync(path.join(previous.workspace||workspace,legacy),path.join(runDir,'legacy-fixture'),{recursive:true,errorOnExist:true,force:false});
  const inventory=[];
  function inventoryTree(dir,relative='') {for(const e of fs.readdirSync(dir,{withFileTypes:true})) {
    const file=path.join(dir,e.name),rel=path.join(relative,e.name);
    if(e.isSymbolicLink())throw new Error('Unexpected symlink in legacy fixture');
    if(e.isDirectory())inventoryTree(file,rel);else inventory.push({path:rel,sha256:sha(fs.readFileSync(file))});
  }}
  inventoryTree(path.join(runDir,'legacy-fixture'));report.legacyFixture={projectId:legacy,files:inventory};save();
  await run('synthetic',['tests/synthetic.mjs']);
  await run('input-offline',['tests/input-guards.mjs','--offline']);
  await run('real-copy',['tests/mcp-smoke.mjs'],{MILIASTRA_SYNTHETIC:'0',MILIASTRA_SAVE_ROOTS:JSON.stringify([fixtureRoot]),MILIASTRA_TEST_MAP:snapshot,MILIASTRA_TEST_SHA256:sha(bytes)});
  report.originalUnchanged=sha(fs.readFileSync(source))===sha(bytes);
  if(!report.originalUnchanged)throw new Error('Source changed during baseline; re-observe before further tests');
  for(const name of ['mcp-smoke-report.json','synthetic-smoke-report.json'])fs.copyFileSync(path.join(workspace,name),path.join(runDir,'current-'+name));
  report.passed=true;
}catch(error){report.error=error.message;process.exitCode=1;}
finally{report.finishedAt=new Date().toISOString();save();console.log('Baseline report:',path.join(runDir,'report.json'));}
