import fs from 'node:fs';
import {container,fields} from '../../src/scene/wire.mjs';
const [file,...ids]=process.argv.slice(2);
const payload=container(fs.readFileSync(file));
const msgs=(x,id)=>fields(x).filter(f=>f.id===id&&f.wire===2).map(f=>f.data);
const tryF=x=>{try{const r=fields(x);return r.length&&r.every(f=>f.id<700&&f.id>0)?r:null;}catch{return null;}};
function dump(x,depth=8){const r=tryF(x);if(!r||depth<0)return `hex:${x.toString('hex').slice(0,40)}`;return r.map(f=>f.wire===0?`f${f.id}=${f.value}`:f.wire===2?`f${f.id}{${f.data.length?dump(f.data,depth-1):''}}`:`f${f.id}=w${f.wire}`).join(' ');}
for(const [sec,recId,label] of [[4,7,'prefab'],[5,6,'entity']])
  for(const e of msgs(payload,sec).flatMap(s=>msgs(s,1))){
    const id=String(fields(e).find(f=>f.id===1&&f.wire===0)?.value);
    if(!ids.includes(id))continue;
    for(const rec of msgs(e,recId)){const k=Number(fields(rec).find(f=>f.id===1&&f.wire===0)?.value);if(k===3)console.log(label,id,dump(rec));}
    console.log(label,id,'top fields:',fields(e).map(f=>'f'+f.id+(f.wire===0?'='+f.value:'')).join(' ').slice(0,300));
  }
