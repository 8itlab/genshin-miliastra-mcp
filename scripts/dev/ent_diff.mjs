// Field-by-field size comparison of two entities, plus a dump of fields only one of them has.
import fs from 'node:fs';
import {container,fields,one} from '../../src/scene/wire.mjs';
const [file,a,b]=process.argv.slice(2);
const list=fields(one(container(fs.readFileSync(file)),5)).filter(f=>f.id===1&&f.wire===2).map(f=>f.data);
const find=id=>list.find(e=>Number(fields(e).find(x=>x.id===1)?.value)===Number(id));
const key=f=>{if(f.wire!==2)return 'f'+f.id;if(f.id===5||f.id===6){const k=fields(f.data).find(x=>x.id===1&&x.wire===0);return `f${f.id}#${k?k.value:'?'}`;}return 'f'+f.id;};
const A=fields(find(a)),B=fields(find(b));
const map=r=>{const m=new Map();for(const f of r)m.set(key(f),f);return m;};
const ma=map(A),mb=map(B);
const tryF=x=>{try{const r=fields(x);return r.length&&r.every(f=>f.id<700)?r:null;}catch{return null;}};
function dump(x,ind,depth=5){const r=tryF(x);if(!r||depth<0)return ind+`bytes(${x.length}) ${x.subarray(0,40).toString('hex')} ${x.length<80?JSON.stringify(x.toString('utf8')):''}\n`;let s='';for(const f of r){if(f.wire===0)s+=ind+`f${f.id}=${f.value}\n`;else if(f.wire===5)s+=ind+`f${f.id}=float ${f.data.readFloatLE(0).toFixed(3)}\n`;else if(f.wire===1)s+=ind+`f${f.id}=fixed64\n`;else s+=ind+`f${f.id}{${f.data.length}}\n`+dump(f.data,ind+'  ',depth-1);}return s;}
for(const k of new Set([...ma.keys(),...mb.keys()])){
  const fa=ma.get(k),fb=mb.get(k);
  const same=fa&&fb&&fa.raw.equals(fb.raw);
  console.log(k.padEnd(8),'A',fa?fa.raw.length:'-','B',fb?fb.raw.length:'-',same?'same':'DIFF');
  if(!same&&k!=='f1'&&k!=='f5#1'){ if(fa&&fa.wire===2&&(!fb||fa.raw.length!==fb.raw.length)){console.log('  A:');process.stdout.write(dump(fa.data,'    ').slice(0,1700));} if(fb&&fb.wire===2&&(!fa||fa.raw.length!==fb.raw.length)){console.log('  B:');process.stdout.write(dump(fb.data,'    ').slice(0,900));} }
}
