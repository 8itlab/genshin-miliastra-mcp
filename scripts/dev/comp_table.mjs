// 统计存档元件模板里的通用组件记录（第 4 段每个条目的 f8）：种类码、内容字段号、里面的字符串标签。
import fs from 'node:fs';
import path from 'node:path';
import {container,fields} from '../../src/scene/wire.mjs';
const msgs=(x,id)=>fields(x).filter(f=>f.id===id&&f.wire===2).map(f=>f.data);
const tryF=x=>{try{const r=fields(x);return r.length&&r.every(f=>f.id<700)?r:null;}catch{return null;}};
function strings(x,depth=8,out=[]){const r=tryF(x);if(!r||depth<0){if(x.length>1&&x.length<60){const s=x.toString('utf8');if(/^[\u4e00-\u9fa5A-Za-z0-9_ :：\-\.()（）/]+$/.test(s))out.push(s);}return out;}for(const f of r)if(f.wire===2)strings(f.data,depth-1,out);return out;}
const table={};
for(const file of process.argv.slice(2)){
  const payload=container(fs.readFileSync(file)),tag=path.basename(file,'.gil').split('_').slice(1).join('_');
  for(const entry of msgs(payload,4).flatMap(s=>msgs(s,1))){
    const id=Number(fields(entry).find(f=>f.id===1&&f.wire===0)?.value);
    const names=msgs(entry,6).filter(m=>Number(fields(m).find(f=>f.id===1&&f.wire===0)?.value)===1).flatMap(m=>msgs(m,11)).flatMap(m=>msgs(m,1));
    const name=names.length?names[0].toString('utf8'):'';
    for(const rec of msgs(entry,8)){
      const kind=Number(fields(rec).find(f=>f.id===1&&f.wire===0)?.value);
      const payloadIds=fields(rec).filter(f=>f.wire===2).map(f=>f.id);
      const t=table[kind]??={count:0,payloadFields:new Set(),labels:new Set(),where:new Set()};
      t.count++;payloadIds.forEach(i=>t.payloadFields.add(i));
      for(const s of strings(rec).slice(0,6))t.labels.add(s);
      if(t.where.size<8)t.where.add(`${tag}/${name}`);
    }
  }
}
for(const [k,t] of Object.entries(table).sort((a,b)=>a[0]-b[0]))console.log(`kind ${k}: ${t.count} 条, 内容字段 f${[...t.payloadFields].join(',f')}\n   标签: ${[...t.labels].slice(0,12).join(' | ')}\n   出处: ${[...t.where].join('; ')}`);
