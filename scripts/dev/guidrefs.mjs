// Where else does a save mention the GUID of a placed entity? node scripts/dev/guidrefs.mjs <save> <guid>
import fs from 'node:fs';
import {container,fields} from '../../src/scene/wire.mjs';
const root=container(fs.readFileSync(process.argv[2])),guid=BigInt(process.argv[3]);
const varint=n=>{const out=[];while(n>127n){out.push(Number(n&127n)|128);n>>=7n;}out.push(Number(n));return Buffer.from(out);};
const needle=varint(guid);
for(const f of fields(root)){
  if(f.wire!==2)continue;let n=0,at=-1;while((at=f.data.indexOf(needle,at+1))>=0)n++;
  if(n)console.log('section',f.id,'bytes',f.data.length,'mentions',n);
}
const five=fields(root).find(f=>f.id===5&&f.wire===2);
console.log('section 5 fields',[...new Set(fields(five.data).map(f=>f.id+':'+f.wire))].join(' '),'records',fields(five.data).filter(f=>f.id===1).length);
for(const f of fields(five.data).filter(f=>f.id===1&&f.wire===2)){let n=0,at=-1;while((at=f.data.indexOf(needle,at+1))>=0)n++;if(n)console.log('  record of',Number(fields(f.data).find(x=>x.id===1).value),'mentions',n,'len',f.data.length);}
