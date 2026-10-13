// Component 5 (native collision) of the placed entities of every sample (and of saves given as arguments), by asset group.
import fs from 'node:fs';import path from 'node:path';
import {container,fields} from '../../src/scene/wire.mjs';
const cat=JSON.parse(fs.readFileSync('src/scene/asset-catalog.json','utf8'));const assets=cat.assets||Object.values(cat).find(Array.isArray);
const group=new Map(assets.map(a=>[a.id,a.group]));
const v=(b,id)=>{const f=fields(b).find(x=>x.id===id&&x.wire===0);return f?Number(f.value):null;};
const dir='knowledge/samples/gil',files=process.argv.length>2?process.argv.slice(2):fs.readdirSync(dir).filter(f=>f.endsWith('.gil')).map(f=>path.join(dir,f));
const seen={};
for(const file of files){
  const root=container(fs.readFileSync(file));
  for(const s of fields(root).filter(f=>f.id===5&&f.wire===2))for(const e of fields(s.data).filter(f=>f.id===1&&f.wire===2)){
    const tpl=fields(e.data).find(f=>f.id===2&&f.wire===2),asset=tpl?v(tpl.data,1):null,g=group.get(asset)||'?';
    const comps=fields(e.data).filter(f=>f.id===6&&f.wire===2),c5=comps.find(f=>v(f.data,1)===5);
    let st=false;for(const p of fields(e.data).filter(f=>f.id===5&&f.wire===2))if(v(p.data,1)===1){try{const body=fields(p.data).find(x=>x.id===11).data;st=fields(body).some(x=>x.id===2&&x.wire===0&&Number(x.value)===1);}catch{}}
    const key=g+' | '+(st?'static':'dynamic')+' | c5='+(c5?c5.data.toString('hex'):'none');
    (seen[key]??={n:0,ex:new Set()}).n++;if(seen[key].ex.size<3)seen[key].ex.add(asset);
  }
}
for(const k of Object.keys(seen).sort())console.log(seen[k].n,k,[...seen[k].ex].join(','));
