// Write patrol templates into placed creatures of a save (the importer empties them).
// Usage: node patch_patrol.mjs <source.gil> <output.gil> <name prefix> '<templates json file>'
//   templates: [{"pathId":1073741825,"waypointIds":[2,3]}, ...]
import fs from 'node:fs';
import {container,fields,field,one,replace,wrap} from '../../src/scene/wire.mjs';
import {patrolBlock} from '../../src/scene/blocks.mjs';
const [source,output,prefix,spec]=process.argv.slice(2);
const bytes=fs.readFileSync(source),root=container(bytes),block=patrolBlock(JSON.parse(fs.readFileSync(spec,'utf8')));
const kind=b=>Number(fields(b).find(x=>x.id===1&&x.wire===0)?.value);
let changed=0;
const section=Buffer.concat(fields(one(root,5)).map(entry=>{
  if(entry.id!==1||entry.wire!==2)return entry.raw;
  const parts=fields(entry.data);let name='';
  for(const f of parts)if(f.id===5&&f.wire===2&&kind(f.data)===1){try{name=one(one(f.data,11),1).toString('utf8');}catch{}}
  if(!name.startsWith(prefix)||!parts.some(f=>f.id===5&&f.wire===2&&kind(f.data)===65))return entry.raw;
  changed++;
  return field(1,2,Buffer.concat(parts.map(f=>f.id===5&&f.wire===2&&kind(f.data)===65?field(5,2,block):f.raw)));
}));
fs.writeFileSync(output,wrap(bytes,replace(root,5,2,section)));
console.log('patrol written into',changed,'entities');
