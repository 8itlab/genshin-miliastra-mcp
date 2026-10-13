// The library tabs of a save (section 6): kind of each tab, its sub-tabs and what they list. node scripts/dev/tabs.mjs <save>
import fs from 'node:fs';
import {container,fields} from '../../src/scene/wire.mjs';
const v=(b,id)=>{const f=fields(b).find(x=>x.id===id&&x.wire===0);return f?Number(f.value):null;};
for(const tab of fields(fields(container(fs.readFileSync(process.argv[2]))).find(f=>f.id===6).data).filter(f=>f.id===1&&f.wire===2)){
  for(const part of fields(tab.data).filter(f=>f.id===3&&f.wire===2)){
    const inner=fields(part.data),name=inner.find(f=>f.id===1&&f.wire===2)?.data.toString('utf8'),list=inner.filter(f=>f.id===5&&f.wire===2).map(f=>v(f.data,1)+':'+v(f.data,2));
    console.log('tab kind',v(tab.data,1),JSON.stringify(name),list.length,list.slice(0,14).join(' '));
  }
}
