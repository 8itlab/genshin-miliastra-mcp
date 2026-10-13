import fs from 'node:fs';
import {container,fields} from '../../src/scene/wire.mjs';
const tryF=x=>{try{const r=fields(x);return r.length&&r.every(f=>f.id<3000&&f.id>0)?r:null;}catch{return null;}};
function dump(x,depth=8){const r=tryF(x);if(!r||depth<0)return 'hex:'+x.toString('hex').slice(0,60)+(x.length<60?' '+JSON.stringify(x.toString('utf8')):'');return r.map(f=>f.wire===0?`${f.id}=${f.value}`:f.wire===5?`${f.id}=${+f.data.readFloatLE(0).toFixed(3)}f`:`${f.id}{${f.data.length?dump(f.data,depth-1):''}}`).join(' ');}
for(const file of process.argv.slice(2)){
  const root=container(fs.readFileSync(file));
  for(const s of fields(root).filter(f=>f.id===10&&f.wire===2))for(const group of fields(s.data).filter(f=>f.wire===2)){
    for(const g of fields(group.data).filter(f=>f.id===1&&f.wire===2)){
      const name=fields(g.data).find(f=>f.id===2&&f.wire===2)?.data.toString('utf8'),nodes=fields(g.data).filter(f=>f.id===3&&f.wire===2).length;
      for(const f of fields(g.data).filter(x=>x.id===100))console.log(name,'| nodes',nodes,'| f100 =',f.wire===0?String(f.value):dump(f.data).slice(0,300));
      if(!nodes)console.log(name,'| EMPTY graph raw:',dump(g.data).slice(0,300));
    }
    if(group.id!==1)console.log('non-graph group field',group.id,':',dump(group.data).slice(0,300));
  }
}
