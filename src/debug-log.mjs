import {createHash} from 'node:crypto';
import {fields,one} from './scene/wire.mjs';

// Observed official debug-log envelope, not the ordinary GIL/GIA asset format.
// Read only print records at 1.22.2; graph traces also contain string literals
// and must never be counted as executed prints.
export function inspectDebugLog(bytes,{prefix='',offset=0,limit=100}={}){
 const b=Buffer.from(bytes);
 if(b.length<8||b.length>64*1024*1024||b.readUInt32BE(0)!==b.length-4||b.readUInt32BE(4)!==b.length-8)throw new Error('Unsupported debug log envelope');
 const root=fields(b.subarray(8)),prints=[];let ignoredRecords=0;
 const utf8=b=>new TextDecoder('utf-8',{fatal:true}).decode(b);
 const optional=(rows,id,wire,fallback)=>{const hits=rows.filter(f=>f.id===id);if(!hits.length)return fallback;if(hits.length!==1||hits[0].wire!==wire)throw new Error('Ambiguous debug log field '+id);return wire===0?hits[0].value:hits[0].data;};
 for(let i=0;i<root.length;i++){
  const r=root[i];if(r.id!==1||r.wire!==2){ignoredRecords++;continue;}
  const rows=fields(r.data),print=optional(rows,22,2,null);
  if(!print){ignoredRecords++;continue;}
  const text=utf8(one(print,2));
  const stamp=optional(rows,4,2,null),graph=optional(rows,7,2,null);
  prints.push({recordIndex:i,elapsedSeconds:optional(rows,3,0,0n).toString(),
   sessionLabel:stamp?utf8(stamp):null,graphId:graph?one(graph,2,0).toString():null,
   entityId:optional(rows,9,0,null)?.toString()??null,text});
 }
 const matching=prints.filter(p=>p.text.startsWith(prefix));
 return {sourceHash:createHash('sha256').update(b).digest('hex'),bytes:b.length,recordCount:root.length,printCount:prints.length,ignoredRecords,
  matchedPrints:matching.length,prints:matching.slice(offset,offset+limit),nextOffset:offset+limit<matching.length?offset+limit:null,
  scope:'Experimental observed local debug-log format. Only explicit print records are decoded, not graph trace literals. Missing prints do not prove code did not execute; logging subscription can omit events. File authenticity and candidate association must be established independently.',gameplay:'partial-log-evidence'};
}
