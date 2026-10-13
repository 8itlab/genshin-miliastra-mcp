import fs from 'node:fs';import path from 'node:path';
import {container,fields} from '../../src/scene/wire.mjs';
const tryF=x=>{try{const r=fields(x);return r.length&&r.every(f=>f.id<3000&&f.id>0)?r:null;}catch{return null;}};
const printable=x=>{const s=x.toString('utf8');return x.length>0&&x.length<120&&Buffer.from(s,'utf8').equals(x)&&/[\u4e00-\u9fa5A-Za-z]/.test(s)&&!/[\u0000-\u0008\ufffd]/.test(s);};
function dump(x,depth=10){if(printable(x))return JSON.stringify(x.toString('utf8'));const r=tryF(x);if(!r||depth<0)return 'hex:'+x.toString('hex').slice(0,60);
  return r.map(f=>f.wire===0?`${f.id}=${f.value}`:f.wire===5?`${f.id}=${+f.data.readFloatLE(0).toFixed(3)}f`:f.wire===1?`${f.id}=x64`:`${f.id}{${f.data.length?dump(f.data,depth-1):''}}`).join(' ');}
const v=(b,id)=>{const f=fields(b).find(x=>x.id===id&&x.wire===0);return f?Number(f.value):null;};
const dir='knowledge/samples/gil',asset=Number(process.argv[2]),seen={};
for(const file of fs.readdirSync(dir)){
  const tag=file.split('_').slice(1).join('_').replace('.gil','');
  const root=container(fs.readFileSync(path.join(dir,file)));
  for(const s of fields(root).filter(f=>f.id===4&&f.wire===2))for(const e of fields(s.data).filter(f=>f.id===1&&f.wire===2)){
    if(v(e.data,2)!==asset)continue;
    for(const p of fields(e.data)){
      const key=p.wire===0?`${p.id}=${p.value}`:`${p.id}/${v(p.data,1)} `+dump(p.data).slice(0,900);
      (seen[key]??=[]).push(tag);
    }
  }
}
const keys=Object.keys(seen).sort();
for(const k of keys){ if(/^1=/.test(k))continue; console.log(k,'  <<',seen[k].length,seen[k].slice(0,4).join(','));}
