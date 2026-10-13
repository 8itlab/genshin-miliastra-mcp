// Summarise every entity of a save: guid, asset id, name, property kinds (f5) and component kinds (f6).
import fs from 'node:fs';
import {container,fields,one} from '../../src/scene/wire.mjs';
const [file,filter='']=process.argv.slice(2);
const root=container(fs.readFileSync(file));
const list=fields(one(root,5)).filter(f=>f.id===1&&f.wire===2);
console.log('entities',list.length);
for(const e of list){
  const r=fields(e.data);const num=id=>{const f=r.find(x=>x.id===id&&x.wire===0);return f?Number(f.value):null;};
  let name='';const props=[],comps=[];
  for(const f of r){
    if(f.wire!==2||(f.id!==5&&f.id!==6))continue;
    const inner=fields(f.data),kind=Number(inner.find(x=>x.id===1&&x.wire===0)?.value??0);
    (f.id===5?props:comps).push(kind);
    if(f.id===5&&kind===1){try{name=one(one(f.data,11),1).toString('utf8');}catch{}}
  }
  const tpl=r.find(x=>x.id===2&&x.wire===2);const asset=tpl?Number(fields(tpl.data).find(x=>x.id===1)?.value??0):null;
  const line=`${num(1)} asset=${asset} f8=${num(8)} bytes=${e.data.length} name=${name} props=[${props}] comps=[${comps}] other=[${[...new Set(r.filter(x=>![1,2,5,6,8].includes(x.id)).map(x=>'f'+x.id))]}]`;
  if(!filter||line.includes(filter))console.log(line);
}
