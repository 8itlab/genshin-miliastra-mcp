// node secdump.mjs <map.gil> <sectionId> [maxLines]
import fs from 'node:fs';
import {container,fields} from '../../src/scene/wire.mjs';
const out=[];
const show=(buf,depth=0)=>{for(const f of fields(buf)){const pad=' '.repeat(depth*2);
 if(f.wire===5)out.push(pad+f.id+' f32 '+(+f.data.readFloatLE(0).toFixed(4)));
 else if(f.wire===0)out.push(pad+f.id+' varint '+String(f.value));
 else if(f.wire===1)out.push(pad+f.id+' f64');
 else if(f.wire===2){let nested=false;try{const inner=fields(f.data);nested=inner.length>0&&f.data.length>1&&depth<9&&inner.every(x=>x.id>0&&x.id<3000);}catch{}
  const text=f.data.toString('utf8');if(f.data.length>1&&/^[\x20-\x7e\u4e00-\u9fff（）·]+$/.test(text)){out.push(pad+f.id+' str '+JSON.stringify(text));}
  else if(nested){out.push(pad+f.id+' {');show(f.data,depth+1);out.push(pad+'}');}else out.push(pad+f.id+' bytes '+f.data.length+' '+f.data.toString('hex').slice(0,60));}
}};
const root=container(fs.readFileSync(process.argv[2]));
console.log('top-level sections:',fields(root).map(f=>f.id+':'+(f.wire===2?f.data.length:'v'+f.value)).join(' '));
for(const id of process.argv[3].split(',').map(Number))for(const s of fields(root).filter(f=>f.id===id&&f.wire===2)){out.push('=== section '+id+' ('+s.data.length+' bytes)');try{show(s.data,0);}catch{out.push('  raw '+s.data.toString('hex').slice(0,120)+' | '+JSON.stringify(s.data.toString('utf8').slice(0,60)));}}
console.log(out.slice(0,Number(process.argv[4]||200)).join('\n'));
