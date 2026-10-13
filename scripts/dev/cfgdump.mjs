// 打印存档第 15 段里某一类配置记录的原始字段（浮点带 f 后缀），以及资源库里登记它们的页签。用法：node cfgdump.mjs <类型号> <gil...>
import fs from 'node:fs';import path from 'node:path';
import {container,fields} from '../../src/scene/wire.mjs';
const [kindArg,...files]=process.argv.slice(2),want=Number(kindArg);
const tryF=x=>{try{const r=fields(x);return r.length&&r.every(f=>f.id<3000&&f.id>0)?r:null;}catch{return null;}};
const printable=x=>{const s=x.toString('utf8');return x.length>0&&x.length<120&&Buffer.from(s,'utf8').equals(x)&&/[\u4e00-\u9fa5A-Za-z]/.test(s)&&!/[\u0000-\u0008\ufffd]/.test(s);};
function dump(x,depth=12){if(printable(x))return JSON.stringify(x.toString('utf8'));const r=tryF(x);if(!r||depth<0)return 'hex:'+x.toString('hex').slice(0,48);
  return r.map(f=>f.wire===0?`${f.id}=${f.value}`:f.wire===5?`${f.id}=${+f.data.readFloatLE(0).toFixed(3)}f`:f.wire===1?`${f.id}=x64`:`${f.id}{${f.data.length?dump(f.data,depth-1):''}}`).join(' ');}
const num=(b,id)=>{const f=fields(b).find(x=>x.id===id&&x.wire===0);return f?Number(f.value):null;};
for(const file of files){
  const root=container(fs.readFileSync(file)),tag=path.basename(file,'.gil').split('_').slice(1).join('_');
  for(const s of fields(root).filter(f=>f.id===15&&f.wire===2))for(const r of fields(s.data).filter(f=>f.id===1&&f.wire===2))if(num(r.data,2)===want)console.log(tag,'|',dump(r.data).slice(0,1500));
}
