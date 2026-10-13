import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {container,fields} from '../../src/scene/wire.mjs';
const [a,b]=process.argv.slice(2).map(f=>fields(container(fs.readFileSync(f))));
const key=f=>f.id+':'+(f.wire===2?f.data.length+':'+createHash('sha1').update(f.data).digest('hex').slice(0,8):'v'+f.value);
const A=new Map(a.map(f=>[f.id,key(f)])),B=new Map(b.map(f=>[f.id,key(f)]));
for(const id of new Set([...A.keys(),...B.keys()]))if(A.get(id)!==B.get(id))console.log('section',id,'A',A.get(id),'B',B.get(id));
