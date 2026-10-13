import fs from 'node:fs';import path from 'node:path';
import {container,fields} from '../../src/scene/wire.mjs';
const tryF=x=>{try{const r=fields(x);return r.length&&r.every(f=>f.id<3000&&f.id>0)?r:null;}catch{return null;}};
const printable=x=>{const s=x.toString('utf8');return x.length>0&&x.length<120&&Buffer.from(s,'utf8').equals(x)&&/[\u4e00-\u9fa5A-Za-z]/.test(s)&&!/[\u0000-\u0008\ufffd]/.test(s);};
function dump(x,depth=8){if(printable(x))return JSON.stringify(x.toString('utf8'));const r=tryF(x);if(!r||depth<0)return 'hex:'+x.toString('hex').slice(0,40);
  return r.map(f=>f.wire===0?`${f.id}=${f.value}`:f.wire===5?`${f.id}=${+f.data.readFloatLE(0).toFixed(3)}f`:f.wire===1?`${f.id}=x64`:`${f.id}{${f.data.length?dump(f.data,depth-1):''}}`).join(' ');}
const dir='knowledge/samples/gil';
for(const file of fs.readdirSync(dir)){
  const tag=file.split('_').slice(1).join('_').replace('.gil','');if(!process.argv.slice(2).some(w=>tag.includes(w)))continue;
  const sec=fields(container(fs.readFileSync(path.join(dir,file)))).find(f=>f.id===11&&f.wire===2);
  console.log('==',tag);for(const f of fields(sec.data))if(![2,5].includes(f.id))console.log('  ',f.id,f.wire===0?String(f.value):dump(f.data).slice(0,300));
}
