// List, for every entity (and prefab) carrying f7 records, which f7 kinds it has and whether its name property marks it static.
import fs from 'node:fs';
import {container,fields,one} from '../../src/scene/wire.mjs';
const [file]=process.argv.slice(2);
const root=container(fs.readFileSync(file));
for(const sec of [4,5]){
  let list=[];try{list=fields(one(root,sec)).filter(f=>f.id===1&&f.wire===2);}catch{continue;}
  console.log('section',sec,'count',list.length);
  for(const e of list){
    const r=fields(e.data);const g=Number(r.find(x=>x.id===1&&x.wire===0)?.value);
    let name='',nameHex='';
    for(const f of r)if(f.id===5&&f.wire===2){const i=fields(f.data);if(Number(i.find(x=>x.id===1)?.value)===1){nameHex=one(f.data,11).toString('hex');try{name=one(one(f.data,11),1).toString('utf8');}catch{}}}
    const kinds=r.filter(x=>x.id===7&&x.wire===2).map(x=>Number(fields(x.data).find(y=>y.id===1)?.value));
    const tpl=r.find(x=>x.id===2&&x.wire===2);const asset=tpl?Number(fields(tpl.data).find(x=>x.id===1)?.value??0):null;
    const tail=nameHex.slice(-8);
    console.log(g,'asset',asset,'f8',Number(r.find(x=>x.id===8&&x.wire===0)?.value),'f7kinds',JSON.stringify(kinds),'nameTail',tail,name);
  }
}
