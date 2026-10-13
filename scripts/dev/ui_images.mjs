// Statistics of the image controls (content type 38) in the sample saves: node scripts/dev/ui_images.mjs
import fs from 'node:fs';import path from 'node:path';
import {container,fields} from '../../src/scene/wire.mjs';
const dir='knowledge/samples/gil';
const v=(b,id)=>{const f=fields(b).find(x=>x.id===id&&x.wire===0);return f?f.value:null;};
const sub=(b,id)=>fields(b).find(x=>x.id===id&&x.wire===2)?.data;
const tally={},add=(k,x)=>{(tally[k]??={})[x]=((tally[k]??={})[x]||0)+1;};
for(const file of fs.readdirSync(dir)){
  const sec=fields(container(fs.readFileSync(path.join(dir,file)))).find(f=>f.id===9&&f.wire===2);if(!sec)continue;
  const recs=fields(sec.data).filter(f=>f.id===502&&f.wire===2).map(f=>f.data);
  const byId=new Map(recs.map(r=>[Number(v(r,501)),r]));
  for(const r of recs){
    const blocks=fields(r).filter(b=>b.id===505&&b.wire===2).map(b=>b.data),img=blocks.find(b=>Number(v(b,502))===38);if(!img)continue;
    const inner=sub(sub(img,503),31),name=sub(sub(blocks.find(b=>Number(v(b,502))===15),12),501)?.toString('utf8');
    add('structure',fields(r).filter(b=>b.id===502&&b.wire===2).map(b=>Number(v(b.data,502))).join(','));
    add('content',blocks.map(b=>Number(v(b,502))).join(','));
    add('outer31',Buffer.from(sub(img,31)).toString('hex')||'empty');
    add('innerKeys',fields(inner).map(f=>f.id+':'+f.wire).join(' '));
    add('image',String(v(inner,2)));add('colour',Number(v(inner,4)).toString(16));
    add('f3',Buffer.from(sub(inner,3)??[]).toString('hex'));add('f6',Buffer.from(sub(inner,6)??[]).toString('hex')||'empty');add('f10',Buffer.from(sub(inner,10)??[]).toString('hex')||'empty');
    const rectBlock=blocks.find(b=>Number(v(b,502))===12),rect=sub(sub(sub(rectBlock,503),13),12);
    add('rectTail',fields(rect).filter(f=>f.wire===0).map(f=>f.id+'='+f.value).join(' '));
    add('inner504',fields(sub(img,503)).filter(f=>f.id===504).map(f=>fields(f.data).map(x=>x.id+'='+(x.wire===0?x.value:'..')).join(' ')).join('|')||'none');
    const parent=byId.get(Number(v(r,504)));
    add('parentStructure',parent?fields(parent).filter(b=>b.id===502&&b.wire===2).map(b=>Number(v(b.data,502))).join(','):'none');
    add('file',file.slice(13,40));
    if(process.argv[2]==='names')console.log(Number(v(inner,2)),Number(v(inner,4)).toString(16),name);
  }
}
if(process.argv[2]!=='names')for(const [k,t] of Object.entries(tally))console.log(k,JSON.stringify(Object.entries(t).sort((a,b)=>b[1]-a[1]).slice(0,40)));
