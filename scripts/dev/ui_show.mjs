// Dumps the first few interface controls of one content type from the sample saves: node scripts/dev/ui_show.mjs <type> [count]
import fs from 'node:fs';import path from 'node:path';
import {container,fields} from '../../src/scene/wire.mjs';
const dir='knowledge/samples/gil',want=Number(process.argv[2]),max=Number(process.argv[3]||3);let shown=0;
const v=(b,id)=>{const f=fields(b).find(x=>x.id===id&&x.wire===0);return f?Number(f.value):null;};
function tree(buf,depth=0){
  let out;try{out=fields(buf);}catch{return null;}
  if(!out.length||depth>7)return null;
  return out.map(f=>{
    if(f.wire===0)return [f.id,Number(f.value)];
    if(f.wire===2){const t=f.data.length?tree(f.data,depth+1):null;const s=Buffer.from(f.data).toString('utf8');
      const printable=/^[\x20-\x7e\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+$/.test(s);
      return [f.id,printable&&s.length>1?s:(t??('hex:'+Buffer.from(f.data).toString('hex').slice(0,40)))];}
    if(f.wire===5)return [f.id,'f:'+Buffer.from(f.data??[]).toString('hex')];
    return [f.id,'w'+f.wire];
  });
}
for(const file of fs.readdirSync(dir)){
  const sec=fields(container(fs.readFileSync(path.join(dir,file)))).find(f=>f.id===9&&f.wire===2);if(!sec)continue;
  for(const r of fields(sec.data).filter(f=>f.id===502&&f.wire===2)){
    if(!fields(r.data).some(b=>b.id===505&&b.wire===2&&v(b.data,502)===want))continue;
    if(shown++>=max)process.exit(0);
    console.log('==',file);console.log(JSON.stringify(tree(r.data)));
  }
}
