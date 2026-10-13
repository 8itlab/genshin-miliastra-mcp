// Which interpolation does the editor use when it fixes a sky at an hour? Compares the curves of a sky that follows
// the clock (save A) with the values the editor wrote for the same sky fixed at an hour (save B).
import fs from 'node:fs';
import {container,fields} from '../../src/scene/wire.mjs';
const one=(b,id)=>fields(b).find(f=>f.id===id&&f.wire===2).data;
function settings(file,envId){
  for(const s of fields(container(fs.readFileSync(file))).filter(f=>f.id===15&&f.wire===2))for(const r of fields(s.data).filter(f=>f.id===1&&f.wire===2)){
    const p=fields(r.data);if(Number(p.find(f=>f.id===2&&f.wire===0)?.value)!==26||Number(p.find(f=>f.id===1&&f.wire===0)?.value)!==envId)continue;
    return fields(one(one(one(p.filter(x=>x.id===4&&x.wire===2).find(x=>Number(fields(x.data).find(f=>f.id===1).value)===70).data,75),1),1));
  }
}
const [a,b,id,hour]=[process.argv[2],process.argv[3],Number(process.argv[4]),Number(process.argv[5])],A=settings(a,id),B=settings(b,id),m=hour*60;
const keysOf=data=>fields(data).filter(f=>f.id===3&&f.wire===2).map(f=>{const k=fields(f.data),v=k.find(x=>x.id===1),t=k.find(x=>x.id===2&&x.wire===2),tt=t?fields(t.data):[],n=i=>Number(tt.find(x=>x.id===i&&x.wire===0)?.value??0);
  return {minute:n(1)*60+n(2),v:!v?0:v.wire===5?v.data.readFloatLE(0):Number(v.value),colour:!!v&&v.wire===0};});
const smooth=t=>t*t*(3-2*t),lin=t=>t;
for(const f of A.filter(f=>f.id>=24&&f.id<=57&&f.wire===2)){
  const keys=keysOf(f.data),target=fields(B.find(x=>x.id===f.id).data).find(x=>x.id===2),want=!target?0:target.wire===5?target.data.readFloatLE(0):Number(target.value);
  let k0=[...keys].reverse().find(k=>k.minute<=m),k1=keys.find(k=>k.minute>m);
  if(!k0)k0={...keys.at(-1),minute:keys.at(-1).minute-1440};if(!k1)k1={...keys[0],minute:keys[0].minute+1440};
  const t=(m-k0.minute)/(k1.minute-k0.minute),colour=keys.some(k=>k.colour)||(target&&target.wire===0);
  if(!colour){console.log(f.id,'float want',want.toFixed(4),'smooth',(k0.v+(k1.v-k0.v)*smooth(t)).toFixed(4),'linear',(k0.v+(k1.v-k0.v)*lin(t)).toFixed(4));continue;}
  const ch=(v,i)=>(v>>>(i*8))&255,mix=(fn,rnd)=>[3,2,1,0].map(i=>rnd(ch(k0.v,i)+(ch(k1.v,i)-ch(k0.v,i))*fn(t)).toString(16).padStart(2,'0')).join('');
  console.log(f.id,'colour want',(want>>>0).toString(16).padStart(8,'0'),'smooth/round',mix(smooth,Math.round),'smooth/floor',mix(smooth,Math.floor),'linear/round',mix(lin,Math.round),'linear/floor',mix(lin,Math.floor),'t',t.toFixed(3));
}
console.log('others A',A.filter(f=>f.id<24||f.id>57).map(f=>f.id+':'+(f.wire===0?f.value:'..')).join(' '));
console.log('others B',B.filter(f=>f.id<24||f.id>57).map(f=>f.id+':'+(f.wire===0?f.value:'..')).join(' '));
