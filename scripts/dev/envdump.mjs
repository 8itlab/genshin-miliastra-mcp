// The settings of every environment configuration of a save, as a tree: node scripts/dev/envdump.mjs <save>
import fs from 'node:fs';
import {container,fields} from '../../src/scene/wire.mjs';
function tree(buf,depth=0){
  let out;try{out=fields(buf);}catch{return null;}
  if(!out.length||depth>6)return null;
  return out.map(f=>{
    if(f.wire===0)return [f.id,Number(f.value)];
    if(f.wire===5)return [f.id,Math.round(f.data.readFloatLE(0)*1000)/1000+'f'];
    if(f.wire===2){const t=f.data.length?tree(f.data,depth+1):null;return [f.id,t??('hex:'+Buffer.from(f.data).toString('hex').slice(0,60))];}
    return [f.id,'w'+f.wire];
  });
}
const one=(b,id)=>fields(b).find(f=>f.id===id&&f.wire===2).data;
for(const s of fields(container(fs.readFileSync(process.argv[2]))).filter(f=>f.id===15&&f.wire===2))for(const r of fields(s.data).filter(f=>f.id===1&&f.wire===2)){
  const kind=fields(r.data).find(f=>f.id===2&&f.wire===0);if(!kind||Number(kind.value)!==26)continue;
  const parts=fields(r.data).filter(x=>x.id===4&&x.wire===2),body=one(one(parts.find(x=>Number(fields(x.data).find(f=>f.id===1).value)===70).data,75),1);
  console.log('== environment',Number(fields(r.data).find(f=>f.id===1).value));
  for(const row of tree(one(body,1)))console.log(JSON.stringify(row).slice(0,Number(process.argv[3]||700)));
}
