// 把存档某一段压成紧凑的一行式结构打印。用法：node sec_line.mjs <gil> <段号> [最大宽度]
import fs from 'node:fs';
import {container,fields} from '../../src/scene/wire.mjs';
const [file,sec,width='4000']=process.argv.slice(2);
const tryF=x=>{try{const r=fields(x);return r.length&&r.every(f=>f.id<3000&&f.id>0)?r:null;}catch{return null;}};
const printable=x=>{const s=x.toString('utf8');return x.length>0&&x.length<200&&Buffer.from(s,'utf8').equals(x)&&/[\u4e00-\u9fa5A-Za-z]/.test(s)&&!/[\u0000-\u0008\ufffd]/.test(s);};
function dump(x,depth=14){
  if(printable(x))return JSON.stringify(x.toString('utf8'));
  const r=tryF(x);if(!r||depth<0)return 'hex:'+x.toString('hex').slice(0,64);
  return r.map(f=>f.wire===0?`${f.id}=${f.value}`:f.wire===5?`${f.id}=${+f.data.readFloatLE(0).toFixed(3)}f`:f.wire===1?`${f.id}=x64`:`${f.id}{${f.data.length?dump(f.data,depth-1):''}}`).join(' ');
}
for(const s of fields(container(fs.readFileSync(file))).filter(f=>f.id===Number(sec)))
  for(const f of (s.wire===2?fields(s.data):[]))console.log((`#${f.id} `+(f.wire===2?dump(f.data):f.wire===0?'='+f.value:'w'+f.wire)).slice(0,Number(width)));
