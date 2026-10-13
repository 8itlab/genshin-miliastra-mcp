import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url);
const checks=[];
const check=(id,passed,details)=>checks.push({id,status:passed?'passed':'failed',details});
const [major,minor]=process.versions.node.split('.').map(Number);
check('node',major>22||major===22&&minor>=12,{version:process.version,executable:process.execPath});
check('compiled-core',fs.existsSync(path.join(ROOT,'dist/core/project-store.js')),{command:'npm run build:core'});
for(const name of ['zod','@modelcontextprotocol/sdk/server/mcp.js','typescript','genshin-ts/package.json']){
 try{require.resolve(name);check(name,true,{});}catch{check(name,false,{remedy:'Run npm ci in a source checkout, or reinstall the release package.'});}
}
const pythonExecutable=process.env.MILIASTRA_PYTHON||'python';
const runPython=code=>spawnSync(pythonExecutable,['-c',code],{windowsHide:true,shell:false,encoding:'utf8',timeout:15000});
const python=runPython("import sys,json,ctypes; print(json.dumps({'python':sys.version.split()[0],'executable':sys.executable,'version':list(sys.version_info[:2]),'winMutex':hasattr(ctypes,'WinDLL')}))");
let versions;try{versions=JSON.parse(python.stdout);}catch{}
const pythonAvailable=python.status===0&&Array.isArray(versions?.version)&&versions.version[0]===3&&versions.version[1]>=10;
const coreRequired=process.platform==='win32';
const coreAvailable=pythonAvailable&&(!coreRequired||versions.winMutex===true);
checks.push({id:'core-python',status:coreAvailable?'passed':coreRequired?'failed':'optional-unavailable',details:{required:coreRequired,executable:versions?.executable||pythonExecutable,python:versions?.python,error:python.error?.code,remedy:'Windows core requires Python 3.10+ for the workspace mutex helper; set MILIASTRA_PYTHON or add Python to PATH.'}});
const pillow=pythonAvailable?runPython("import json,PIL; print(json.dumps({'pillow':PIL.__version__}))"):null;
let captureVersion;try{captureVersion=JSON.parse(pillow?.stdout);}catch{}
checks.push({id:'capture-pillow',status:pillow?.status===0&&typeof captureVersion?.pillow==='string'?'passed':'optional-unavailable',details:{...captureVersion,required:false,remedy:'Optional game/editor screenshots: install requirements-capture.txt into the configured Python environment.'}});
const report={at:new Date().toISOString(),passed:checks.every(x=>x.status!=='failed'),checks,scope:'Local prerequisites only; this does not certify game import, scene generation or gameplay.',optionalBackends:{ayaya:'research-only; not bundled or required by the graph workflow'}};
console.log(JSON.stringify(report,null,2));process.exitCode=report.passed?0:1;
