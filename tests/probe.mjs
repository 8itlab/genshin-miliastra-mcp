import fs from 'node:fs';
import { parseMessage, readUint32BE } from 'genshin-ts/injector/binary';
import { buildNodeGraphFieldIndex } from 'genshin-ts/injector/node_graph';
import { loadGiaProto } from 'genshin-ts/injector/proto';
const file=process.argv[2];
const bytes=fs.readFileSync(file);
const payload=bytes.subarray(20,-4),fields=[];
parseMessage(payload,0,payload.length,0,0,0,0,0,0,0,fields);
const index=buildNodeGraphFieldIndex(payload,fields);
const {nodeGraphMessage}=loadGiaProto();
console.log(JSON.stringify({bytes:bytes.length,schema:readUint32BE(bytes,4),fields:fields.length,graphs:[...index].map(([id,matches])=>({id,graphs:matches.map(m=>nodeGraphMessage.toObject(nodeGraphMessage.decode(payload.subarray(m.field.dataStart,m.field.dataEnd)),{longs:Number}))}))},null,2));

