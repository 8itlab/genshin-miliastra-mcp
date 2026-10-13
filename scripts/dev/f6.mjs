// Dump the root.f6 record that mentions each entity ID, and the multiplicity of every field in the entity record.
import fs from 'node:fs';
import {container,fields,one,varint} from '../../src/scene/wire.mjs';
const [file,...ids]=process.argv.slice(2);
const root=container(fs.readFileSync(file));
const tryF=x=>{try{const r=fields(x);return r.length&&r.every(f=>f.id<700)?r:null;}catch{return null;}};
function dump(x,ind,depth=6){const r=tryF(x);if(!r||depth<0)return ind+`bytes(${x.length}) ${x.subarray(0,48).toString('hex')}\n`;let s='';for(const f of r){if(f.wire===0)s+=ind+`f${f.id}=${f.value}\n`;else if(f.wire===5)s+=ind+`f${f.id}=float ${f.data.readFloatLE(0).toFixed(3)}\n`;else if(f.wire===1)s+=ind+`f${f.id}=fixed64 ${f.data.toString('hex')}\n`;else s+=ind+`f${f.id}{${f.data.length}}\n`+dump(f.data,ind+'  ',depth-1);}return s;}
const f6=fields(one(root,6)),f5=fields(one(root,5));
console.log('root.f6 field ids',JSON.stringify(f6.reduce((m,f)=>(m[f.id]=(m[f.id]||0)+1,m),{})));
for(const id of ids){
  const needle=varint(BigInt(id));
  console.log('\n=== ',id);
  for(const f of f6)if(f.wire===2&&f.data.indexOf(needle)>=0){console.log('root.f6.f'+f.id,'bytes',f.data.length);process.stdout.write(dump(f.data,'  ').slice(0,1500));}
  const e=f5.find(f=>f.wire===2&&Number(fields(f.data).find(x=>x.id===1)?.value)===Number(id));
  if(e){const m={};for(const x of fields(e.data)){const k=x.wire===2&&(x.id===5||x.id===6)?`f${x.id}#${fields(x.data).find(y=>y.id===1&&y.wire===0)?.value}`:'f'+x.id;m[k]=(m[k]||0)+1;}console.log('entity field multiplicity',JSON.stringify(Object.fromEntries(Object.entries(m).filter(([k,v])=>v>1))),'total fields',fields(e.data).length,'bytes',e.data.length);}
}
