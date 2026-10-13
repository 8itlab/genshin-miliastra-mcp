// 把所有样例里某一种通用组件记录展开打印（去重），看字段有哪些变化。用法：node comp_dump.mjs <种类码> <gil...>
import fs from 'node:fs';
import path from 'node:path';
import {container,fields} from '../../src/scene/wire.mjs';
const [kindArg,...files]=process.argv.slice(2);const want=Number(kindArg);
const msgs=(x,id)=>fields(x).filter(f=>f.id===id&&f.wire===2).map(f=>f.data);
const tryF=x=>{try{const r=fields(x);return r.length&&r.every(f=>f.id<700&&f.id>0)?r:null;}catch{return null;}};
const printable=x=>{const s=x.toString('utf8');return x.length>0&&x.length<80&&!/[\u0000-\u0008\ufffd]/.test(s)&&/[\u4e00-\u9fa5A-Za-z]/.test(s)&&Buffer.from(s,'utf8').equals(x);};
function dump(x,ind,depth=9){if(printable(x))return ind+JSON.stringify(x.toString('utf8'))+'\n';const r=tryF(x);if(!r||depth<0)return ind+`hex ${x.toString('hex').slice(0,60)}\n`;let s='';for(const f of r){if(f.wire===0)s+=ind+`f${f.id}=${f.value}\n`;else if(f.wire===5)s+=ind+`f${f.id}=float ${+f.data.readFloatLE(0).toFixed(3)}\n`;else if(f.wire===1)s+=ind+`f${f.id}=fixed64 ${f.data.toString('hex')}\n`;else if(!f.data.length)s+=ind+`f${f.id}{}\n`;else s+=ind+`f${f.id}{\n`+dump(f.data,ind+'  ',depth-1)+ind+'}\n';}return s;}
const seen=new Map();
for(const file of files){
  const payload=container(fs.readFileSync(file)),tag=path.basename(file,'.gil').split('_').slice(1).join('_');
  const scan=(entry,recId,where)=>{
    const names=msgs(entry,where==='prefab'?6:5).filter(m=>Number(fields(m).find(f=>f.id===1&&f.wire===0)?.value)===1).flatMap(m=>msgs(m,11)).flatMap(m=>msgs(m,1));
    const name=names.length?names[0].toString('utf8'):'';
    for(const rec of msgs(entry,recId)){
      if(Number(fields(rec).find(f=>f.id===1&&f.wire===0)?.value)!==want)continue;
      const text=dump(rec,'  ');const e=seen.get(text)??{count:0,where:[]};e.count++;if(e.where.length<4)e.where.push(`${where}:${tag}/${name}`);seen.set(text,e);
    }
  };
  for(const entry of msgs(payload,4).flatMap(s=>msgs(s,1)))scan(entry,8,'prefab');
  for(const entry of msgs(payload,5).flatMap(s=>msgs(s,1)))scan(entry,7,'entity');
}
let i=0;for(const [text,e] of seen){console.log(`--- 变体 ${++i}（${e.count} 处）${e.where.join('; ')}`);process.stdout.write(text);}
