// Structural numbers of compiled graphs, for looking into what the editor's memory check counts.
// Usage: node scripts/dev/graph_stats.mjs <workspace dir or build.json or .gia>...   (a dir: every build.json below it)
import fs from 'node:fs';
import path from 'node:path';
import {loadGiaGraph} from 'genshin-ts/injector/node_graph';
import {loadGiaProto} from 'genshin-ts/injector/proto';
const proto=loadGiaProto();
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(e.name==='node_modules'?[]:walk(path.join(d,e.name))):e.name==='build.json'?[path.join(d,e.name)]:[]);
const files=process.argv.slice(2).flatMap(a=>fs.statSync(a).isDirectory()?walk(a):[a]);
const seen=new Set();
for(const file of files){
  const gia=file.endsWith('.json')?JSON.parse(fs.readFileSync(file,'utf8')).giaPath:file;
  if(!gia||!fs.existsSync(gia))continue;
  const bytes=fs.readFileSync(gia);
  const graph=proto.nodeGraphMessage.toObject(loadGiaGraph(bytes,proto.rootMessage,proto.nodeGraphMessage),{defaults:false,longs:String,enums:String});
  const nodes=graph.nodes??[];
  const key=nodes.length+':'+bytes.length;if(seen.has(key))continue;seen.add(key);
  let pins=0,links=0,valued=0,flow=0;const kinds={},types={};
  for(const n of nodes){
    const t=n.genericId?.nodeId??n.concreteId?.nodeId??0;types[t]=(types[t]||0)+1;
    for(const p of n.pins??[]){pins++;links+=(p.connects??[]).length;const k=p.i1?.kind??0;kinds[k]=(kinds[k]||0)+1;if(p.value!==undefined)valued++;}
  }
  const top=Object.entries(types).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([t,c])=>t+'x'+c).join(' ');
  console.log(JSON.stringify({nodes:nodes.length,pins,links,valued,pinKinds:kinds,distinctTypes:Object.keys(types).length,giaBytes:bytes.length,graphKeys:Object.keys(graph).join(','),top}));
}
