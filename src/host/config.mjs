import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { ROOT, DEFAULT_WORKSPACE } from '../core.mjs';
export const PROTOCOL='miliastra-core/1';
function implementationHash() {
  const digest=createHash('sha256');
  function visit(dir) { for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))) {
    const file=path.join(dir,entry.name);
    if(entry.isDirectory()&&entry.name!=='__pycache__')visit(file);
    else if(entry.isFile()&&/\.(mjs|js|ts|py)$/.test(entry.name)){digest.update(path.relative(ROOT,file));digest.update(fs.readFileSync(file));}
  }}
  visit(path.join(ROOT,'src'));visit(path.join(ROOT,'dist'));
  digest.update(fs.readFileSync(path.join(ROOT,'package.json')));
  return digest.digest('hex');
}
export function hostConfig() {
  const workspace=path.resolve(process.env.MILIASTRA_WORKSPACE||DEFAULT_WORKSPACE);
  fs.mkdirSync(workspace,{recursive:true});
  const roots=process.env.MILIASTRA_SAVE_ROOTS?JSON.parse(process.env.MILIASTRA_SAVE_ROOTS):[
    path.join(os.homedir(),'AppData','LocalLow','miHoYo','原神','BeyondLocal'),
    path.join(os.homedir(),'AppData','LocalLow','miHoYo','Genshin Impact','BeyondLocal')];
  if(!Array.isArray(roots)||roots.some(x=>typeof x!=='string'))throw new Error('Invalid MILIASTRA_SAVE_ROOTS');
  const config={workspace:fs.realpathSync(workspace),saveRoots:roots.filter(p=>fs.existsSync(p)).map(p=>fs.realpathSync(p)).sort(),allowLive:process.env.MILIASTRA_ALLOW_LIVE_WRITE==='1',python:process.env.MILIASTRA_PYTHON||'python',installation:ROOT,node:process.execPath,implementationHash:implementationHash()};
  const hash=x=>createHash('sha256').update(x).digest('hex');
  const key=hash(process.platform==='win32'?config.workspace.toLowerCase():config.workspace);
  const runtime=path.join(process.env.LOCALAPPDATA||path.join(os.homedir(),'.local','state'),'MiliastraMCP','runtime',key);
  fs.mkdirSync(runtime,{recursive:true,mode:0o700});
  if(fs.lstatSync(runtime).isSymbolicLink())throw new Error('Runtime directory cannot be a link');
  return {config,configHash:hash(JSON.stringify(config)),runtime,discovery:path.join(runtime,'core.json')};
}
export function hostError(code,message) { return Object.assign(new Error(message),{code}); }
