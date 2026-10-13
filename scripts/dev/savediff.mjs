// node scripts/dev/savediff.mjs <before.gil> <after.gil> [section...]: the records that differ between two saves, both
// sides dumped field by field (floats with f), aligned so that the changed fields stand out. For reading back what a
// setting changed after it was toggled by hand in the editor.
import fs from 'node:fs';
import {container,fields} from '../../src/scene/wire.mjs';
const [a,b,...only]=process.argv.slice(2);
const tryF=x=>{try{const r=fields(x);return r.length&&r.every(f=>f.id<3000&&f.id>0)?r:null;}catch{return null;}};
const printable=x=>{const s=x.toString('utf8');return x.length>0&&x.length<200&&Buffer.from(s,'utf8').equals(x)&&/[\u4e00-\u9fa5A-Za-z]/.test(s)&&!/[\u0000-\u0008\ufffd]/.test(s);};
function lines(x,ind='',depth=14,out=[]){
  if(printable(x)){out.push(ind+JSON.stringify(x.toString('utf8')));return out;}
  const r=tryF(x);if(!r||depth<0){out.push(ind+'hex:'+x.toString('hex').slice(0,80));return out;}
  for(const f of r){
    if(f.wire===0)out.push(ind+f.id+'='+f.value);
    else if(f.wire===5)out.push(ind+f.id+'='+(+f.data.readFloatLE(0).toFixed(4))+'f');
    else if(f.wire===1)out.push(ind+f.id+'=x64:'+f.data.toString('hex'));
    else if(!f.data.length)out.push(ind+f.id+'{}');
    else{out.push(ind+f.id+'{');lines(f.data,ind+'  ',depth-1,out);out.push(ind+'}');}
  }
  return out;
}
const num=(x,id)=>{try{const f=fields(x).find(y=>y.id===id&&y.wire===0);return f?Number(f.value):null;}catch{return null;}};
// A key for every record of a section: its id fields where it has them, else its place.
function records(root,section){
  const out=new Map();let n=0;
  for(const s of fields(root).filter(f=>f.id===section&&f.wire===2))for(const f of fields(s.data)){
    const id=f.wire===2?(num(f.data,1)??num(f.data,501)):null,kind=f.wire===2?num(f.data,2):null;
    let key='f'+f.id+(id!==null?'#'+id:'')+(kind!==null&&section===15?'/kind'+kind:'');
    while(out.has(key))key+="'";
    out.set(key,f.wire===2?f.data:Buffer.from(String(f.value)));n++;
  }
  return out;
}
const ra=container(fs.readFileSync(a)),rb=container(fs.readFileSync(b));
const sections=[...new Set([...fields(ra),...fields(rb)].filter(f=>f.wire===2).map(f=>f.id))].sort((x,y)=>x-y).filter(s=>!only.length||only.includes(String(s)));
for(const s of sections){
  const A=records(ra,s),B=records(rb,s);
  for(const key of new Set([...A.keys(),...B.keys()])){
    const x=A.get(key),y=B.get(key);
    if(x&&y&&x.equals(y))continue;
    console.log('\n=== section '+s+' '+key+(x?'':'  (new)')+(y?'':'  (gone)'));
    const la=x?lines(x):[],lb=y?lines(y):[];
    if(!x||!y){console.log((x?la:lb).join('\n').slice(0,6000));continue;}
    // A plain line diff by longest common subsequence on small inputs, else both sides.
    if(la.length*lb.length>4e6){console.log('--- before\n'+la.join('\n').slice(0,3000)+'\n--- after\n'+lb.join('\n').slice(0,3000));continue;}
    const m=la.length,n=lb.length,t=Array.from({length:m+1},()=>new Uint16Array(n+1));
    for(let i=m-1;i>=0;i--)for(let j=n-1;j>=0;j--)t[i][j]=la[i]===lb[j]?t[i+1][j+1]+1:Math.max(t[i+1][j],t[i][j+1]);
    let i=0,j=0;const show=[];
    while(i<m||j<n){
      if(i<m&&j<n&&la[i]===lb[j]){show.push('  '+la[i]);i++;j++;}
      else if(j<n&&(i>=m||t[i][j+1]>=t[i+1][j])){show.push('+ '+lb[j]);j++;}
      else{show.push('- '+la[i]);i++;}
    }
    // Only the changed lines and three lines around them.
    const keep=new Set();show.forEach((l,k)=>{if(l[0]!==' ')for(let d=-3;d<=3;d++)keep.add(k+d);});
    let last=-2;for(let k=0;k<show.length;k++)if(keep.has(k)){if(k!==last+1)console.log('  ...');console.log(show[k]);last=k;}
  }
}
