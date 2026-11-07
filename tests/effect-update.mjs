import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'effect-update-'));
try{
 fs.mkdirSync(path.join(dir,'scripts/dev'),{recursive:true});
 const media=path.join(dir,'src/scene/media');fs.mkdirSync(media,{recursive:true});
 fs.copyFileSync(new URL('../scripts/dev/update-effects.mjs',import.meta.url),path.join(dir,'scripts/dev/update-effects.mjs'));
 const thumb=fs.readFileSync(new URL('../docs/evidence/7.2/fx/10019173.thumb.jpg',import.meta.url));
 fs.writeFileSync(path.join(dir,'proof.jpg'),thumb);
 const base={source:'fixture',timed:[[1,'old',1]],looping:[]};
 fs.writeFileSync(path.join(media,'effects.json'),JSON.stringify(base));
 fs.writeFileSync(path.join(media,'fx-thumbs.json'),JSON.stringify({1:[0,thumb.length]}));
 fs.writeFileSync(path.join(media,'fx-thumbs.bin'),thumb);
 const input={version:'7.2.0',kind:'timed',source:'fixture',license:'fixture',completed:false,rows:[{id:2,name:'new…',seconds:2,seen:2,evidence:'proof.jpg',thumbnail:'proof.jpg',nameTruncated:true}]};
 const run=(apply=false)=>{fs.writeFileSync(path.join(dir,'capture.json'),JSON.stringify(input));return spawnSync(process.execPath,['scripts/dev/update-effects.mjs','capture.json',...(apply?['--apply']:[])],{cwd:dir,encoding:'utf8'});};
 const readPack=()=>fs.readFileSync(path.join(media,'fx-thumbs.bin'));
 assert.equal(run().status,0);assert.deepEqual(readPack(),thumb);
 assert.equal(run(true).status,0);const after=readPack();assert.deepEqual(after.subarray(0,thumb.length),thumb);
 assert.deepEqual(JSON.parse(fs.readFileSync(path.join(media,'fx-thumbs.json')))[1],[0,thumb.length]);
 assert.equal(JSON.parse(fs.readFileSync(path.join(media,'effects.json'))).timed.length,2);
 assert.equal(run(true).status,0);assert.deepEqual(readPack(),after);
 // Interrupted between index publication and catalog publication: reuse the bytes.
 fs.writeFileSync(path.join(media,'effects.json'),JSON.stringify(base));
 assert.equal(run(true).status,0);assert.deepEqual(readPack(),after);
 assert.equal(JSON.parse(fs.readFileSync(path.join(media,'effects.json'))).timed.length,2);
 input.rows[0].name='conflict';assert.notEqual(run(true).status,0);assert.deepEqual(readPack(),after);
 input.rows[0].seen=1;assert.notEqual(run(true).status,0);
 fs.writeFileSync(path.join(media,'effect-update.lock'),'another writer');
 assert.notEqual(run(true).status,0);assert.equal(fs.readFileSync(path.join(media,'effect-update.lock'),'utf8'),'another writer');
 console.log('effect update: dry run, old bytes/index, replay, interrupted publication, conflicts, weak evidence and writer lock passed');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
