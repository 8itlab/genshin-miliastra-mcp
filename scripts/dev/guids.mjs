// Print {name: guid} for every entity whose name starts with the given prefix.
import fs from 'node:fs';
import {container,fields,one} from '../../src/scene/wire.mjs';
const [file,prefix]=process.argv.slice(2);const out={};
for(const e of fields(one(container(fs.readFileSync(file)),5)).filter(f=>f.id===1&&f.wire===2)){
  const r=fields(e.data);
  for(const f of r)if(f.id===5&&f.wire===2){const i=fields(f.data);if(Number(i.find(x=>x.id===1)?.value)===1){try{const name=one(one(f.data,11),1).toString('utf8');if(name.startsWith(prefix))out[name]=Number(r.find(x=>x.id===1).value);}catch{}}}
}
console.log(JSON.stringify(out));
