// The camera templates of a save (section 18), every field: node scripts/dev/camdump.mjs <save> [<save> ...]
import fs from 'node:fs';
import {container,fields} from '../../src/scene/wire.mjs';
function tree(buf,depth=0){
  let out;try{out=fields(buf);}catch{return null;}
  if(!out.length||depth>5)return null;
  return out.map(f=>{
    if(f.wire===0){const n=BigInt(f.value);return [f.id,n>2n**63n?Number(n-2n**64n):Number(n)];}
    if(f.wire===5)return [f.id,Math.round(f.data.readFloatLE(0)*1000)/1000+'f'];
    if(f.wire===2){const s=f.data.toString('utf8'),text=/^[\x20-\x7e\u4e00-\u9fff]{2,}$/.test(s);const t=!text&&f.data.length?tree(f.data,depth+1):null;return [f.id,text?s:(t??('hex:'+f.data.toString('hex').slice(0,30)))];}
    return [f.id,'w'+f.wire];
  });
}
for(const file of process.argv.slice(2)){
  console.log('==',file);
  for(const s of fields(container(fs.readFileSync(file))).filter(f=>f.id===18&&f.wire===2))for(const r of fields(s.data))console.log(JSON.stringify(r.wire===2?[r.id,tree(r.data)]:[r.id,Number(r.value)]));
}
