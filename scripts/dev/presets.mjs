// 汇总官方样例里的预设状态：每个元件/实体的模型组件里登记的状态编号和初始值，以及节点图里【设置预设状态】(66)、
// 【获取预设状态】实际填的编号和值。用法：node presets.mjs <gil...>
import fs from 'node:fs';import path from 'node:path';
import {container,fields} from '../../src/scene/wire.mjs';
const num=(b,id)=>{const f=fields(b).find(x=>x.id===id&&x.wire===0);return f?Number(f.value):null;};
const sub=(b,id)=>fields(b).find(x=>x.id===id&&x.wire===2)?.data;
const all=(b,id)=>fields(b).filter(x=>x.id===id&&x.wire===2).map(x=>x.data);
const tryF=x=>{try{const r=fields(x);return r.length&&r.every(f=>f.id<3000&&f.id>0)?r:null;}catch{return null;}};
function dump(x,depth=8){const r=tryF(x);if(!r||depth<0)return 'hex:'+x.toString('hex').slice(0,24);
  return r.map(f=>f.wire===0?`${f.id}=${f.value}`:f.wire===5?`${f.id}=${+f.data.readFloatLE(0).toFixed(2)}f`:f.wire===1?`${f.id}=x64`:`${f.id}{${f.data.length?dump(f.data,depth-1):''}}`).join(' ');}
const models={},uses={};
for(const file of process.argv.slice(2)){
  const root=container(fs.readFileSync(file)),tag=path.basename(file,'.gil').split('_').slice(1).join('_');
  for(const [sec,comps,props,assetField] of [[4,7,6,2],[5,6,5,8]])for(const s of all(root,sec))for(const e of all(s,1)){
    const model=all(e,comps).find(c=>num(c,1)===2);if(!model)continue;
    const body=sub(model,12);if(!body||!body.length)continue;
    let name='';try{name=sub(sub(all(e,props).find(p=>num(p,1)===1),11),1).toString('utf8');}catch{}
    const asset=sec===4?(()=>{const f=fields(e).find(x=>x.id===2);return f?(f.wire===0?Number(f.value):num(f.data,1)):null;})():num(e,8);
    const key=dump(body);
    ((models[key]??={places:new Set(),raw:key}).places).add((sec===4?'元件 ':'实体 ')+name+' 资产'+asset+' @'+tag);
  }
  for(const s of all(root,10))for(const grp of all(s,1))for(const g of all(grp,1)){
    const gname=sub(g,2)?.toString('utf8')??'';
    for(const n of all(g,3)){
      const type=num(sub(n,2)??Buffer.alloc(0),5);
      if(![66].includes(type))continue;
      const pins=all(n,4).map(p=>{const where=sub(p,1),lit=sub(p,3);return {kind:where?num(where,1):null,index:where?num(where,2)??0:null,value:lit?(()=>{const v=sub(lit,102)??sub(lit,101)??sub(lit,103);return v?(num(v,1)??0):null;})():null};}).filter(p=>p.kind===3);
      const id=pins.find(p=>p.index===1)?.value,value=pins.find(p=>p.index===2)?.value;
      ((uses[id]??={values:new Set(),places:new Set()}).values).add(value);uses[id].places.add(gname+' @'+tag);
    }
  }
}
console.log('#### 模型组件里的预设状态（原始内容 → 出现在哪些元件/实体上）');
for(const m of Object.values(models))console.log(m.raw,'|',[...m.places].slice(0,4).join('; '),m.places.size>4?'… 共'+m.places.size+'处':'');
console.log('#### 图里设置过的状态编号 → 值 → 图');
for(const [id,u] of Object.entries(uses))console.log(id,'| 值',[...u.values].join(','),'|',[...u.places].join('; '));
