// Print every f7 record of the given entities (hex and decoded).
import fs from 'node:fs';
import {container,fields,one} from '../../src/scene/wire.mjs';
const [file,...ids]=process.argv.slice(2);
const f5=fields(one(container(fs.readFileSync(file)),5));
const tryF=x=>{try{const r=fields(x);return r.length&&r.every(f=>f.id<700)?r:null;}catch{return null;}};
function dump(x,ind,depth=6){const r=tryF(x);if(!r||depth<0)return ind+`bytes(${x.length}) ${x.toString('hex')}\n`;let s='';for(const f of r){if(f.wire===0)s+=ind+`f${f.id}=${f.value}\n`;else if(f.wire===5)s+=ind+`f${f.id}=float ${f.data.readFloatLE(0).toFixed(3)}\n`;else s+=ind+`f${f.id}{${f.data.length}}\n`+dump(f.data,ind+'  ',depth-1);}return s;}
for(const id of ids){
  const e=f5.find(f=>f.wire===2&&Number(fields(f.data).find(x=>x.id===1)?.value)===Number(id));
  console.log('=== ',id);
  for(const x of fields(e.data).filter(x=>x.id===7)){console.log('f7 hex',x.data.toString('hex'));process.stdout.write(dump(x.data,'   '));}
}
