// Every character-disturbance device (角色扰动装置) of a save, as a tree: node scripts/dev/devices.mjs <save>
import fs from 'node:fs';
import {container,fields} from '../../src/scene/wire.mjs';
function tree(buf,depth=0){
  let out;try{out=fields(buf);}catch{return null;}
  if(!out.length||depth>8)return null;
  return out.map(f=>{
    if(f.wire===0){const v=BigInt(f.value);return [f.id,v>2n**63n?Number(v-2n**64n):Number(v)];}
    if(f.wire===5)return [f.id,Math.round(f.data.readFloatLE(0)*1000)/1000+'f'];
    if(f.wire===2){const s=f.data.toString('utf8'),text=/^[\x20-\x7e\u4e00-\u9fff]{2,}$/.test(s);const t=!text&&f.data.length?tree(f.data,depth+1):null;return [f.id,text?s:(t??('hex:'+f.data.toString('hex').slice(0,40)))];}
    return [f.id,'w'+f.wire];
  });
}
const seen=new Set();
function walk(buf,depth){
  let out;try{out=fields(buf);}catch{return;}
  if(depth>12)return;
  for(const f of out){
    if(f.wire!==2||!f.data.length)continue;
    let d;try{d=fields(f.data);}catch{d=[];}
    const type=d.find(x=>x.id===3&&x.wire===0);
    if(type&&Number(type.value)>=1800&&Number(type.value)<=1809&&d.some(x=>x.id===504)){const key=f.data.toString('hex');if(!seen.has(key)){seen.add(key);console.log(JSON.stringify(tree(f.data)));}continue;}
    walk(f.data,depth+1);
  }
}
walk(container(fs.readFileSync(process.argv[2])),0);
