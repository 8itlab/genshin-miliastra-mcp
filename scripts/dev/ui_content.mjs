// The content block of every control of one type in the sample saves, without the rectangle: node scripts/dev/ui_content.mjs <type>
import fs from 'node:fs';import path from 'node:path';
import {container,fields} from '../../src/scene/wire.mjs';
const dir='knowledge/samples/gil',want=Number(process.argv[2]),seen=new Map();
const v=(b,id)=>{const f=fields(b).find(x=>x.id===id&&x.wire===0);return f?Number(f.value):null;};
function tree(buf,depth=0){
  let out;try{out=fields(buf);}catch{return null;}
  if(!out.length||depth>7)return null;
  return out.map(f=>{
    if(f.wire===0){const n=BigInt(f.value);return [f.id,n>2n**63n?Number(n-2n**64n):Number(n)];}
    if(f.wire===5)return [f.id,Math.round(f.data.readFloatLE(0)*1000)/1000+'f'];
    if(f.wire===2){const s=f.data.toString('utf8'),text=/^[\x20-\x7e\u4e00-\u9fff\uff00-\uffef{}.:]{2,}$/.test(s);const t=!text&&f.data.length?tree(f.data,depth+1):null;return [f.id,text?s:(t??('hex:'+f.data.toString('hex').slice(0,30)))];}
    return [f.id,'w'+f.wire];
  });
}
for(const file of fs.readdirSync(dir)){
  const sec=fields(container(fs.readFileSync(path.join(dir,file)))).find(f=>f.id===9&&f.wire===2);if(!sec)continue;
  for(const r of fields(sec.data).filter(f=>f.id===502&&f.wire===2)){
    const blocks=fields(r.data).filter(b=>b.id===505&&b.wire===2).map(b=>b.data),hit=blocks.find(b=>v(b,502)===want);if(!hit)continue;
    const named=blocks.find(b=>v(b,502)===15);let name='';try{name=fields(fields(named).find(f=>f.id===12).data).find(f=>f.id===501).data.toString('utf8');}catch{}
    const inner=fields(hit).find(f=>f.id===503&&f.wire===2),key=JSON.stringify(tree(inner?inner.data:hit));
    if(!seen.has(key))seen.set(key,[]);seen.get(key).push(file.split('_').slice(1).join('_').replace('.gil','')+':'+name);
  }
}
for(const [k,where] of seen)console.log(where.length,[...new Set(where)].slice(0,3).join(' | '),'\n  ',k.slice(0,Number(process.argv[3]||500)));
