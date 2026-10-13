// 列出存档第 10 段里每张节点图的头部（类别、类型、种类、编号、名字、节点数）以及资源库里登记它们的页签。
import fs from 'node:fs';
import {container,fields} from '../../src/scene/wire.mjs';
const file=process.argv[2],root=container(fs.readFileSync(file));
const num=(b,id)=>{const f=fields(b).find(x=>x.id===id&&x.wire===0);return f?Number(f.value):null;};
for(const s of fields(root).filter(f=>f.id===10&&f.wire===2))for(const [gi,group] of fields(s.data).filter(f=>f.wire===2).entries()){
  const graphs=fields(group.data).filter(f=>f.id===1&&f.wire===2);
  console.log(`group ${gi} field ${group.id}: ${graphs.length} graphs; other fields: ${fields(group.data).filter(f=>!(f.id===1&&f.wire===2)).map(f=>'f'+f.id+(f.wire===0?'='+f.value:'')).join(' ')}`);
  for(const g of graphs){const head=fields(g.data).find(f=>f.id===1&&f.wire===2),name=fields(g.data).find(f=>f.id===2&&f.wire===2);
    console.log('   ',head?fields(head.data).map(f=>f.id+'='+(f.wire===0?f.value:'..')).join(' '):'no head','|',name?name.data.toString('utf8'):'','| nodes',fields(g.data).filter(f=>f.id===3&&f.wire===2).length,'| fields',[...new Set(fields(g.data).map(f=>f.id))].join(','));}
}
for(const t of fields(fields(root).find(f=>f.id===6).data).filter(f=>f.id===1&&f.wire===2)){
  const items=fields(t.data).filter(f=>f.id===3&&f.wire===2).flatMap(f=>fields(f.data).filter(x=>x.id===5&&x.wire===2)).map(x=>num(x.data,1)+':'+num(x.data,2));
  if(items.some(i=>/:(1082|1073)/.test(i)))console.log('library tab kind',num(t.data,1),items.join(' '));
}
