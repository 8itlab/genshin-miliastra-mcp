// node scripts/dev/node_dump.mjs <build.json|.gia> <typeId> [count]  — print nodes of one type from a compiled graph
import fs from 'node:fs';
import {loadGiaGraph} from 'genshin-ts/injector/node_graph';
import {loadGiaProto} from 'genshin-ts/injector/proto';
const proto=loadGiaProto();
const file=process.argv[2],gia=file.endsWith('.json')?JSON.parse(fs.readFileSync(file,'utf8')).giaPath:file;
const graph=proto.nodeGraphMessage.toObject(loadGiaGraph(fs.readFileSync(gia),proto.rootMessage,proto.nodeGraphMessage),{defaults:false,longs:String,enums:String});
const hits=(graph.nodes??[]).filter(n=>String(n.genericId?.nodeId??n.concreteId?.nodeId)===process.argv[3]);
console.log('nodes of type',process.argv[3],':',hits.length,'of',graph.nodes.length);
for(const n of hits.slice(0,Number(process.argv[4]||1))){
  const pins=n.pins??[];
  console.log(JSON.stringify({...n,pins:undefined}).slice(0,400));
  console.log('pins',pins.length,'first:',JSON.stringify(pins.slice(0,4)).slice(0,1500));
  console.log('last:',JSON.stringify(pins.slice(-2)).slice(0,600));
}
