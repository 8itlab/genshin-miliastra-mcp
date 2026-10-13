import fs from 'node:fs';import path from 'node:path';
import {container,fields} from '../../src/scene/wire.mjs';
const dir='knowledge/samples/gil',count={},where={};
const v=(b,id)=>{const f=fields(b).find(x=>x.id===id&&x.wire===0);return f?Number(f.value):null;};
for(const file of fs.readdirSync(dir)){
  const sec=fields(container(fs.readFileSync(path.join(dir,file)))).find(f=>f.id===9&&f.wire===2);if(!sec)continue;
  for(const r of fields(sec.data).filter(f=>f.id===502&&f.wire===2)){
    for(const b of fields(r.data).filter(x=>x.id===505&&x.wire===2)){const t=v(b.data,502);count[t]=(count[t]||0)+1;(where[t]??=new Set()).add(file.split('_').slice(1).join('_').replace('.gil',''));}
  }
}
for(const t of Object.keys(count).sort((a,b)=>a-b))console.log(t,count[t],[...where[t]].slice(0,6).join(' | '));
