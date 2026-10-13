// 拆解一份 .gil：实体（名字、物件号、属性种类、组件种类、挂的图）+ 每张节点图的节点名和连线。
// 用法：node kb_dump.mjs <输出目录> <gil...>
import fs from 'node:fs';
import path from 'node:path';
import {parseMessage} from 'genshin-ts/injector/binary';
import {buildNodeGraphFieldIndex} from 'genshin-ts/injector/node_graph';
import {loadGiaProto} from 'genshin-ts/injector/proto';
import {NODE_PIN_RECORDS} from './node_modules/genshin-ts/dist/src/thirdparty/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack/node_data/node_pin_records.js';
import {inspectEntities} from './src/scene/inspect.mjs';
import {container,fields,one} from './src/scene/wire.mjs';

const byId=new Map(),concrete=new Map();
for(const r of NODE_PIN_RECORDS){byId.set(r.id,r);for(const [cid,spec] of r.reflectMap??[])concrete.set(cid,{name:r.name,spec});}
const nodeName=n=>{const g=Number(n.genericId?.nodeId??0),c=Number(n.concreteId?.nodeId??0);
  const r=byId.get(g)||byId.get(c);const cc=concrete.get(c);
  return (r?.name??cc?.name??('#'+g))+(cc&&cc.spec?' '+cc.spec:'');};

const [outDir,...files]=process.argv.slice(2);
fs.mkdirSync(outDir,{recursive:true});
const {nodeGraphMessage}=loadGiaProto();
for(const file of files){
  try{
    const bytes=fs.readFileSync(file),payload=container(bytes),flds=[];
    parseMessage(payload,0,payload.length,0,0,0,0,0,0,0,flds);
    const graphs=[...buildNodeGraphFieldIndex(payload,flds)].flatMap(([id,matches])=>matches.map(m=>{
      const obj=nodeGraphMessage.toObject(nodeGraphMessage.decode(payload.subarray(m.field.dataStart,m.field.dataEnd)),{defaults:true,longs:Number,enums:Number});
      const nodes=(obj.nodes??[]).map(n=>{
        const lits=[];for(const p of n.pins??[]){const v=p.value??p.literal??null;if(v&&typeof v==='object'){const s=JSON.stringify(v);if(s.length<80&&s!=='{}')lits.push(s);}}
        return {i:n.nodeIndex,g:Number(n.genericId?.nodeId??0),c:Number(n.concreteId?.nodeId??0),name:nodeName(n),pins:(n.pins??[]).length};
      });
      const edges=(obj.nodes??[]).flatMap(n=>(n.pins??[]).flatMap(p=>(p.connects??[]).map(c=>[n.nodeIndex,p.i1?.kind??0,p.i1?.index??0,c.id,c.connect?.kind??0,c.connect?.index??0])));
      const vars=(obj.variables??obj.graphVariables??[]).map(v=>({name:v.name,type:v.type??v.valueType}));
      return {id,name:obj.name||'',type:m.type,nodeCount:nodes.length,nodes,edges,vars,rawKeys:Object.keys(obj)};
    }));
    const ents=inspectEntities(payload);
    // 属性/组件种类（ent_summary 的办法）
    const list=fields(one(payload,5)).filter(f=>f.id===1&&f.wire===2);
    const kinds=new Map();
    for(const e of list){const r=fields(e.data);const g=Number(r.find(x=>x.id===1&&x.wire===0)?.value);const props=[],comps=[];
      for(const f of r){if(f.wire!==2||(f.id!==5&&f.id!==6))continue;const k=Number(fields(f.data).find(x=>x.id===1&&x.wire===0)?.value??0);(f.id===5?props:comps).push(k);}
      const tpl=r.find(x=>x.id===2&&x.wire===2);kinds.set(g,{props,comps,asset:tpl?Number(fields(tpl.data).find(x=>x.id===1)?.value??0):null,bytes:e.data.length});}
    const entities=ents.map(e=>({...e,...(kinds.get(e.id)??{})}));
    const out={file:path.basename(file),bytes:bytes.length,entities,graphs};
    fs.writeFileSync(path.join(outDir,path.basename(file).replace(/\.gil$/,'')+'.json'),JSON.stringify(out));
    console.log(path.basename(file),'entities',entities.length,'graphs',graphs.length,'nodes',graphs.reduce((a,g)=>a+g.nodeCount,0));
  }catch(err){console.log(path.basename(file),'FAILED',err.message);}
}
