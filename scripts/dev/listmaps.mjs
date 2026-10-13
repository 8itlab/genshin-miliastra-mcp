import {Service} from '../../src/core.mjs';
const s=new Service({workspace:'workspace/hc'});
const r=s.listMaps();
console.log(JSON.stringify(r.maps.map(m=>[m.mapId,m.name,m.modifiedAt.slice(5,16),m.bytes])));
