// 打印某个元件模板里某一种“属性块”（f6）或“基础组件块”（f7）的原始内容，浮点带 f。用法：node propdump.mjs <gil> <元件名> <6|7> <种类码>
import fs from 'node:fs';
import {container,fields} from '../../src/scene/wire.mjs';
const [file,name,fid,kind]=process.argv.slice(2),root=container(fs.readFileSync(file));
const msgs=(x,id)=>fields(x).filter(f=>f.id===id&&f.wire===2).map(f=>f.data),num=(b,id)=>{const f=fields(b).find(x=>x.id===id&&x.wire===0);return f?Number(f.value):null;};
const tryF=x=>{try{const r=fields(x);return r.length&&r.every(f=>f.id<3000&&f.id>0)?r:null;}catch{return null;}};
const printable=x=>{const s=x.toString('utf8');return x.length>0&&x.length<120&&Buffer.from(s,'utf8').equals(x)&&/[\u4e00-\u9fa5A-Za-z]/.test(s)&&!/[\u0000-\u0008\ufffd]/.test(s);};
function dump(x,depth=14){if(printable(x))return JSON.stringify(x.toString('utf8'));const r=tryF(x);if(!r||depth<0)return 'hex:'+x.toString('hex').slice(0,40);
  return r.map(f=>f.wire===0?`${f.id}=${f.value}`:f.wire===5?`${f.id}=${+f.data.readFloatLE(0).toFixed(3)}f`:f.wire===1?`${f.id}=x64`:`${f.id}{${f.data.length?dump(f.data,depth-1):''}}`).join(' ');}
for(const e of msgs(root,4).flatMap(s=>msgs(s,1))){
  const label=msgs(e,6).filter(m=>num(m,1)===1).flatMap(m=>msgs(m,11)).flatMap(m=>msgs(m,1))[0]?.toString('utf8');
  if(label!==name)continue;
  for(const b of msgs(e,Number(fid)))if(num(b,1)===Number(kind))console.log(name,`f${fid}#${kind} (${b.length} bytes):`,dump(b).slice(0,2600));
}
