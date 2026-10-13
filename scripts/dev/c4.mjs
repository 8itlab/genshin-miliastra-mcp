import fs from 'node:fs';
import {container,fields,one} from '../../src/scene/wire.mjs';
const [file,filter]=process.argv.slice(2);
for(const e of fields(one(container(fs.readFileSync(file)),5)).filter(f=>f.id===1&&f.wire===2)){
  const r=fields(e.data);let name='';
  for(const f of r)if(f.id===5&&f.wire===2){const i=fields(f.data);if(Number(i.find(x=>x.id===1)?.value)===1){try{name=one(one(f.data,11),1).toString('utf8');}catch{}}}
  if(!name.includes(filter))continue;
  const c4=r.find(f=>f.id===6&&f.wire===2&&Number(fields(f.data).find(x=>x.id===1)?.value)===4);
  console.log(Number(r.find(x=>x.id===1).value),name,'comp4',c4?c4.data.toString('hex'):'absent');
}
