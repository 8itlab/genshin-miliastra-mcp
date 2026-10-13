// Dump the behaviour (30), territory (34) and patrol (65) blocks of a prefab record and of a placed entity.
import fs from 'node:fs';
import {container,fields,one} from '../../src/scene/wire.mjs';
const [file,prefabId,entityId]=process.argv.slice(2);const root=container(fs.readFileSync(file));
const tryF=x=>{try{const r=fields(x);return r.length&&r.every(f=>f.id<700&&f.id>0)?r:null;}catch{return null;}};
function dump(x,ind,depth=7){const r=tryF(x);if(!r||depth<0)return ind+`bytes(${x.length}) ${x.toString('hex')} ${JSON.stringify(x.toString('utf8'))}\n`;let s='';for(const f of r){if(f.wire===0)s+=ind+`f${f.id}=${f.value}\n`;else if(f.wire===5)s+=ind+`f${f.id}=float ${f.data.readFloatLE(0).toFixed(3)}\n`;else if(f.wire===1)s+=ind+`f${f.id}=fixed64\n`;else s+=ind+`f${f.id}{${f.data.length}}\n`+dump(f.data,ind+'  ',depth-1);}return s;}
const show=(label,rec,fid)=>{for(const f of fields(rec).filter(x=>x.id===fid&&x.wire===2)){const k=Number(fields(f.data).find(x=>x.id===1&&x.wire===0)?.value);if([30,34,65].includes(k)){console.log(`--- ${label} f${fid} kind ${k} hex ${f.data.toString('hex')}`);process.stdout.write(dump(f.data,'   '));}}};
const pre=fields(one(root,4)).filter(f=>f.id===1&&f.wire===2).map(f=>f.data).find(e=>Number(fields(e).find(x=>x.id===1)?.value)===Number(prefabId));
show('prefab '+prefabId,pre,6);
const ent=fields(one(root,5)).filter(f=>f.id===1&&f.wire===2).map(f=>f.data).find(e=>Number(fields(e).find(x=>x.id===1)?.value)===Number(entityId));
show('entity '+entityId,ent,5);
