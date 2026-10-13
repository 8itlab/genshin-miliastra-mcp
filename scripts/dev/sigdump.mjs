// 打印存档第 10 段里和信号有关的部分：节点定义组（字段 2）每条的头和参数，以及信号登记（字段 5）。
import fs from 'node:fs';
import {container,fields} from '../../src/scene/wire.mjs';
const file=process.argv[2],root=container(fs.readFileSync(file));
const tryF=x=>{try{const r=fields(x);return r.length&&r.every(f=>f.id<3000&&f.id>0)?r:null;}catch{return null;}};
const printable=x=>{const s=x.toString('utf8');return x.length>0&&x.length<120&&Buffer.from(s,'utf8').equals(x)&&/[\u4e00-\u9fa5A-Za-z]/.test(s)&&!/[\u0000-\u0008\ufffd]/.test(s);};
function dump(x,depth=12){if(printable(x))return JSON.stringify(x.toString('utf8'));const r=tryF(x);if(!r||depth<0)return 'hex:'+x.toString('hex').slice(0,40);
  return r.map(f=>f.wire===0?`${f.id}=${f.value}`:f.wire===5?`${f.id}=${+f.data.readFloatLE(0).toFixed(3)}f`:f.wire===1?`${f.id}=x64`:`${f.id}{${f.data.length?dump(f.data,depth-1):''}}`).join(' ');}
for(const s of fields(root).filter(f=>f.id===10&&f.wire===2))for(const g of fields(s.data)){
  if(g.id===1)continue;
  console.log(`#${g.id}`,g.wire===2?dump(g.data).slice(0,Number(process.argv[3]||2200)):'='+g.value);
}
