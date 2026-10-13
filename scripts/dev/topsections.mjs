// The top-level sections of saves, side by side: node scripts/dev/topsections.mjs <save> [<save> ...]
import fs from 'node:fs';
import {container,fields} from '../../src/scene/wire.mjs';
const rows={};const files=process.argv.slice(2);
files.forEach((file,i)=>{for(const f of fields(container(fs.readFileSync(file)))){(rows[f.id]??=files.map(()=>''))[i]=f.wire===2?String(f.data.length):'v'+f.value;}});
for(const id of Object.keys(rows).sort((a,b)=>a-b))console.log(id.padStart(4),rows[id].map(x=>x.padStart(9)).join(' '));
