// Compare how the official editor stores a hand-placed monster with one imported from our pack.
import fs from 'node:fs';
import {container,fields} from '../../src/scene/wire.mjs';
const [file,...ids]=process.argv.slice(2);
const root=container(fs.readFileSync(file));
const top=fields(root);
const count={};for(const f of top)count[f.id]=(count[f.id]||0)+1;
console.log('root fields',JSON.stringify(count));
const tryFields=b=>{try{const r=fields(b);return r.length&&r.every(f=>f.id<600)?r:null;}catch{return null;}};
function show(b,depth,indent){
  const r=tryFields(b);if(!r||depth<0)return indent+`bytes(${b.length}) ${b.subarray(0,24).toString('hex')}${/^[\x20-\x7e\u4e00-\u9fff]+$/.test(b.toString('utf8'))&&b.length<60?' "'+b.toString('utf8')+'"':''}\n`;
  let s='';
  for(const f of r){
    if(f.wire===0)s+=indent+`f${f.id}=${f.value}\n`;
    else if(f.wire===5)s+=indent+`f${f.id}=float ${f.data.readFloatLE(0).toFixed(3)}\n`;
    else if(f.wire===1)s+=indent+`f${f.id}=fixed64 ${f.data.toString('hex')}\n`;
    else{const inner=tryFields(f.data);s+=indent+`f${f.id}{${f.data.length}}\n`+(inner&&depth>0?show(f.data,depth-1,indent+'  '):indent+'  '+show(f.data,-1,'').trim()+'\n');}
  }
  return s;
}
for(const id of ids.map(Number)){
  console.log('\n======== guid',id);
  for(const f of top){
    if(f.wire!==2)continue;
    const inner=tryFields(f.data);if(!inner)continue;
    // entities may sit directly in a repeated root field or one level down
    const candidates=[[f.data,'root.f'+f.id],...inner.filter(x=>x.wire===2).map(x=>[x.data,'root.f'+f.id+'.f'+x.id])];
    for(const [bytes,where] of candidates){
      const r=tryFields(bytes);if(!r)continue;
      const g=r.find(x=>x.id===1&&x.wire===0);
      if(g&&Number(g.value)===id){console.log('-- found in',where,'bytes',bytes.length);console.log(show(bytes,4,'  ').slice(0,3800));}
    }
  }
}
