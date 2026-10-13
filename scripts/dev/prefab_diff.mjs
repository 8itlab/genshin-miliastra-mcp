// 比较存档里两个元件模板（第 4 段）的逐字段差异；用法 node prefab_diff.mjs <gil> <元件A编号> <元件B编号> [只看 f7 组件]
import fs from 'node:fs';
import {container,fields} from '../../src/scene/wire.mjs';
const [file,a,b,only]=process.argv.slice(2);
const payload=container(fs.readFileSync(file));
const msgs=(x,id)=>fields(x).filter(f=>f.id===id&&f.wire===2).map(f=>f.data);
const list=msgs(payload,4).flatMap(s=>msgs(s,1));
const find=id=>list.find(e=>Number(fields(e).find(x=>x.id===1&&x.wire===0)?.value)===Number(id));
const key=f=>{if(f.wire!==2)return 'f'+f.id;if([5,6,7].includes(f.id)){const k=fields(f.data).find(x=>x.id===1&&x.wire===0);return `f${f.id}#${k?k.value:'?'}`;}return 'f'+f.id;};
const A=fields(find(a)),B=fields(find(b));
const map=r=>{const m=new Map();for(const f of r)m.set(key(f),f);return m;};
const ma=map(A),mb=map(B);
const tryF=x=>{try{const r=fields(x);return r.length&&r.every(f=>f.id<700)?r:null;}catch{return null;}};
function dump(x,ind,depth=7){const r=tryF(x);if(!r||depth<0)return ind+`bytes(${x.length}) ${x.subarray(0,40).toString('hex')} ${x.length<80?JSON.stringify(x.toString('utf8')):''}\n`;let s='';for(const f of r){if(f.wire===0)s+=ind+`f${f.id}=${f.value}\n`;else if(f.wire===5)s+=ind+`f${f.id}=float ${f.data.readFloatLE(0).toFixed(3)}\n`;else if(f.wire===1)s+=ind+`f${f.id}=fixed64\n`;else s+=ind+`f${f.id}{${f.data.length}}\n`+dump(f.data,ind+'  ',depth-1);}return s;}
for(const k of new Set([...ma.keys(),...mb.keys()])){
  if(only&&!k.startsWith(only))continue;
  const fa=ma.get(k),fb=mb.get(k);
  const same=fa&&fb&&fa.raw.equals(fb.raw);
  console.log(k.padEnd(8),'A',fa?fa.raw.length:'-','B',fb?fb.raw.length:'-',same?'same':'DIFF');
  if(!same){ if(fa&&fa.wire===2){console.log('  A:');process.stdout.write(dump(fa.data,'    ').slice(0,2500));} if(fb&&fb.wire===2){console.log('  B:');process.stdout.write(dump(fb.data,'    ').slice(0,1200));} }
}
