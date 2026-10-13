// 把存档第 9 段（界面）压成每条记录一行：记录编号、名字、各组件的种类和内容。用法：node ui_dump.mjs <gil> [最大行宽]
import fs from 'node:fs';
import {container,fields} from '../../src/scene/wire.mjs';
const [file,width='1500']=process.argv.slice(2);
const payload=container(fs.readFileSync(file));
const tryF=x=>{try{const r=fields(x);return r.length&&r.every(f=>f.id<700&&f.id>0)?r:null;}catch{return null;}};
const printable=x=>{const s=x.toString('utf8');return x.length>0&&x.length<200&&Buffer.from(s,'utf8').equals(x)&&/[\u4e00-\u9fa5A-Za-z{]/.test(s)&&!/[\u0000-\u0008\ufffd]/.test(s);};
const packed=b=>{const out=[];let p=0;try{while(p<b.length){let n=0,shift=0;for(;;){const v=b[p++];if(v===undefined)return null;n+=(v&127)*2**shift;shift+=7;if(!(v&128))break;}out.push(n);}}catch{return null;}return out;};
function dump(x,depth=12){
  if(printable(x))return JSON.stringify(x.toString('utf8'));
  const r=tryF(x);
  if(!r||depth<0){const p=packed(x);return p&&p.length<=12&&p.every(n=>n>1000)?'ids['+p.join(',')+']':'hex:'+x.toString('hex').slice(0,48);}
  return r.map(f=>f.wire===0?`${f.id}=${f.value}`:f.wire===5?`${f.id}=${+f.data.readFloatLE(0).toFixed(3)}f`:f.wire===1?`${f.id}=x64`:`${f.id}{${f.data.length?dump(f.data,depth-1):''}}`).join(' ');
}
const sec=fields(payload).find(f=>f.id===9&&f.wire===2);
for(const f of fields(sec.data)){
  if(f.wire!==2){console.log(`#${f.id}=${f.value}`);continue;}
  console.log((`#${f.id} `+dump(f.data)).slice(0,Number(width)));
}
