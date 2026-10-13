// 在存档各段里找某个字符串出现在哪一段，并打印包含它的那条顶层记录。用法：node findstr.mjs <gil> <字符串> [宽度]
import fs from 'node:fs';
import {container,fields} from '../../src/scene/wire.mjs';
const [file,needle,width='900']=process.argv.slice(2),root=container(fs.readFileSync(file)),key=Buffer.from(needle,'utf8');
const tryF=x=>{try{const r=fields(x);return r.length&&r.every(f=>f.id<3000&&f.id>0)?r:null;}catch{return null;}};
const printable=x=>{const s=x.toString('utf8');return x.length>0&&x.length<120&&Buffer.from(s,'utf8').equals(x)&&/[\u4e00-\u9fa5A-Za-z]/.test(s)&&!/[\u0000-\u0008\ufffd]/.test(s);};
function dump(x,depth=12){if(printable(x))return JSON.stringify(x.toString('utf8'));const r=tryF(x);if(!r||depth<0)return 'hex:'+x.toString('hex').slice(0,40);
  return r.map(f=>f.wire===0?`${f.id}=${f.value}`:f.wire===5?`${f.id}=${+f.data.readFloatLE(0).toFixed(3)}f`:f.wire===1?`${f.id}=x64`:`${f.id}{${f.data.length?dump(f.data,depth-1):''}}`).join(' ');}
for(const s of fields(root)){
  if(s.wire!==2||!s.data.includes(key))continue;
  const subs=tryF(s.data)??[];const hits=subs.filter(f=>f.wire===2&&f.data.includes(key));
  console.log(`section ${s.id}: ${s.data.length} bytes, ${hits.length} sub-records contain it`);
  for(const h of hits.slice(0,3))console.log(`   f${h.id}: `+dump(h.data).slice(0,Number(width)));
}
