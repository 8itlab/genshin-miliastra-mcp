import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {findAsset,searchAssets} from '../src/scene/assets.mjs';
import {blockTemplate} from '../src/scene/blocks.mjs';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'catalog-update-'));
try{
 fs.mkdirSync(path.join(dir,'scripts/dev'),{recursive:true});fs.mkdirSync(path.join(dir,'src/scene'),{recursive:true});
 fs.copyFileSync(new URL('../scripts/dev/update-assets.mjs',import.meta.url),path.join(dir,'scripts/dev/update-assets.mjs'));
 const target=path.join(dir,'src/scene/asset-catalog.json');
 const base={source:'fixture',assets:[{id:1,name:'existing',group:'fixture',icon:''}]};
 fs.writeFileSync(target,JSON.stringify(base));fs.writeFileSync(path.join(dir,'evidence'),'observed fixture');
 const input={version:'7.2.0',source:'test fixture only',license:'test',evidence:['evidence'],assets:[{id:2,name:'new',group:'fixture',icon:''}]};
 const run=(apply=false)=>{fs.writeFileSync(path.join(dir,'capture.json'),JSON.stringify(input));return spawnSync(process.execPath,['scripts/dev/update-assets.mjs','capture.json',...(apply?['--apply']:[])],{cwd:dir,encoding:'utf8'});};
 assert.equal(run().status,0);assert.deepEqual(JSON.parse(fs.readFileSync(target)),base);
 assert.equal(run(true).status,0);assert.equal(JSON.parse(fs.readFileSync(target)).assets.length,2);
 const ledger=path.join(dir,'src/scene/asset-updates');
 const record=path.join(ledger,fs.readdirSync(ledger).find(f=>f.endsWith('.json')));
 const prepared=JSON.parse(fs.readFileSync(record));prepared.phase='prepared';fs.writeFileSync(record,JSON.stringify(prepared));
 fs.writeFileSync(path.join(dir,'src/scene/asset-catalog.json.pending'),'interrupted');
 assert.equal(run(true).status,0);assert.equal(JSON.parse(fs.readFileSync(record)).phase,'applied');
 assert.equal(JSON.parse(fs.readFileSync(target)).assets.length,2);
 assert.equal(run(true).status,0);assert.equal(JSON.parse(fs.readFileSync(target)).assets.length,2);
 input.assets[0].name='conflict';assert.notEqual(run(true).status,0);
 input.assets[0].id=3;input.evidence=['absent'];assert.notEqual(run(true).status,0);
 for(const id of [30008015,30006019]){assert.ok(findAsset(id));assert.equal(searchAssets({query:String(id)}).assets[0].placementStatus,'unverified');assert.throws(()=>blockTemplate(id),{code:'UNVERIFIED_ASSET'});}
 console.log('incremental update: dry run, apply, replay, conflict, missing evidence, placement guards passed');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
