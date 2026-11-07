// Additive effect capture import. Publish pack -> index -> catalog, so interruptions
// can leave unused bytes/index entries, but never expose an effect without its image.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../../',import.meta.url));
const [input,...flags]=process.argv.slice(2);
if(!input||flags.some(f=>f!=='--apply'))throw Error('Usage: update-effects.mjs capture.json [--apply]');
const apply=flags.includes('--apply'),media=path.join(root,'src/scene/media');
const lock=path.join(media,'effect-update.lock');let owned=false;
const hash=b=>createHash('sha256').update(b).digest('hex');
const atomic=(file,bytes)=>{fs.writeFileSync(file+'.pending',bytes);fs.renameSync(file+'.pending',file);};
try{
 if(apply){const fd=fs.openSync(lock,'wx');owned=true;try{fs.writeFileSync(fd,JSON.stringify({pid:process.pid,startedAt:new Date().toISOString(),capture:path.resolve(input)})+'\n');}finally{fs.closeSync(fd);}}
 const raw=fs.readFileSync(input),capture=JSON.parse(raw);
 if(!/^7\.[12]\.\d+$/.test(capture.version)||!capture.source||!capture.license||!['timed','looping'].includes(capture.kind)||!Array.isArray(capture.rows)||!capture.rows.length)throw Error('Invalid capture metadata');
 const effectsFile=path.join(media,'effects.json'),indexFile=path.join(media,'fx-thumbs.json'),packFile=path.join(media,'fx-thumbs.bin');
 const effects=JSON.parse(fs.readFileSync(effectsFile)),index=JSON.parse(fs.readFileSync(indexFile));
 let pack=fs.readFileSync(packFile);const table=effects[capture.kind],other=effects[capture.kind==='timed'?'looping':'timed'];
 const existing=new Map(table.map(r=>[r[0],r])),seen=new Set(),added=[],evidence=[];
 for(const row of capture.rows){
  if(!Number.isSafeInteger(row.id)||row.id<=0||typeof row.name!=='string'||!row.name.trim()||!Number.isInteger(row.seen)||row.seen<2||seen.has(row.id))throw Error('Invalid/duplicate/weak capture row');
  seen.add(row.id);
  if(capture.kind==='timed'&&(!Number.isFinite(row.seconds)||row.seconds<0))throw Error('Invalid duration');
  if(other.some(r=>r[0]===row.id))throw Error('Conflicting effect kind '+row.id);
  const desired=capture.kind==='timed'?[row.id,row.name,row.seconds]:[row.id,row.name];
  if(existing.has(row.id)&&JSON.stringify(existing.get(row.id))!==JSON.stringify(desired))throw Error('Conflicting existing effect '+row.id);
  const proof=fs.readFileSync(path.resolve(root,row.evidence)),thumb=fs.readFileSync(path.resolve(root,row.thumbnail));
  if(thumb.subarray(0,3).toString('hex')!=='ffd8ff')throw Error('Thumbnail must be JPEG');
  evidence.push({id:row.id,displayName:row.name,nameTruncated:!!row.nameTruncated,seen:row.seen,evidence:row.evidence,sha256:hash(proof),thumbnail:row.thumbnail,thumbnailSha256:hash(thumb)});
  if(index[row.id]){
   const [start,length]=index[row.id];if(!pack.subarray(start,start+length).equals(thumb))throw Error('Conflicting thumbnail '+row.id);
  }else{index[row.id]=[pack.length,thumb.length];pack=Buffer.concat([pack,thumb]);}
  if(!existing.has(row.id)){table.push(desired);added.push(row.id);}
 }
 const report={version:capture.version,source:capture.source,license:capture.license,inputSha256:hash(raw),complete:!!capture.completed,kind:capture.kind,added,observed:evidence,officialPlaybackVerified:false};
 console.log(JSON.stringify({added:added.length,observed:evidence.length,complete:report.complete,ids:added}));
 if(apply){
  const recordDir=path.join(media,'effect-updates');fs.mkdirSync(recordDir,{recursive:true});
  // Old slices remain byte-identical; catalog is exposed only after pack and index.
  atomic(packFile,pack);atomic(indexFile,JSON.stringify(index)+'\n');
  if(added.length)effects.source+=' Additions: '+capture.source+'; see effect-updates/'+report.inputSha256+'.json.';
  atomic(effectsFile,JSON.stringify(effects)+'\n');
  const record=path.join(recordDir,report.inputSha256+'.json');
  if(!fs.existsSync(record))atomic(record,JSON.stringify(report,null,2)+'\n');
 }
}finally{if(owned)fs.unlinkSync(lock);}
