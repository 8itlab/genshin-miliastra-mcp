// Where does an entity ID occur in the save? Lists every root field (and one level below) containing its varint.
import fs from 'node:fs';
import {container,fields,varint} from '../../src/scene/wire.mjs';
const [file,...ids]=process.argv.slice(2);
const root=container(fs.readFileSync(file));
const tryF=b=>{try{return fields(b);}catch{return null;}};
for(const id of ids){
  const needle=varint(BigInt(id));const hits=[];
  for(const f of fields(root)){
    if(f.wire!==2)continue;
    let n=0,i=-1;while((i=f.data.indexOf(needle,i+1))>=0)n++;
    if(!n)continue;
    const inner=tryF(f.data);let detail='';
    if(inner){const sub={};for(const x of inner){if(x.wire===2&&x.data.indexOf(needle)>=0)sub['f'+x.id]=(sub['f'+x.id]||0)+1;}detail=JSON.stringify(sub);}
    hits.push(`root.f${f.id} x${n} (${f.data.length}B) ${detail}`);
  }
  console.log(id,'->',hits.join(' | '));
}
