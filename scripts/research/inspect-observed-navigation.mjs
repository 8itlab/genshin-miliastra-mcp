// Read-only research for the observed CN 7.0 version-18 tile layout.
// LZ4 specifications: https://github.com/lz4/lz4/tree/dev/doc
// The tile magic matches Detour; its version/header differs from upstream v7.
// This is not a generic navigation decoder or a writer.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {container,one} from '../../src/scene/wire.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const check=(v,message)=>{if(!v)throw new Error(message);};
const [input,output]=process.argv.slice(2);
check(input&&output,'Usage: node scripts/research/inspect-observed-navigation.mjs INPUT.gil OUTPUT.json');
const source=fs.readFileSync(input),compressed=one(one(container(source),37),2);
// Only the observed profiles: content size, 64 KiB blocks, no dictionary or
// block/content checksum. FLG bit 5 selects independent versus linked blocks.
check(compressed.length>=23&&compressed.subarray(0,8).equals(Buffer.from('4c5a344604224d18','hex'))&&
 [0x48,0x68].includes(compressed[8])&&compressed[9]===0x40,'Unrecognized frame profile');
const independentBlocks=!!(compressed[8]&0x20);
const expected=Number(compressed.readBigUInt64LE(10));
check(expected>0&&expected<=16*1024*1024,'Unexpected decoded length');
const decoded=Buffer.alloc(expected);let at=19,written=0,blocks=0;
while(true){
 check(at+4<=compressed.length,'Missing frame terminator');
 const size=compressed.readUInt32LE(at);at+=4;if(size===0)break;
 const raw=!!(size&0x80000000),length=size&0x7fffffff,start=written;
 check(length<=65536&&at+length<=compressed.length,'Invalid block length');
 const block=compressed.subarray(at,at+length);at+=length;blocks++;
 if(raw){check(written+length<=expected,'Output overflow');block.copy(decoded,written);written+=length;continue;}
 let pos=0;
 const extended=base=>{if(base===15){let next;do{check(pos<block.length,'Truncated length');next=block[pos++];base+=next;}while(next===255);}return base;};
 while(pos<block.length){
  const token=block[pos++],literals=extended(token>>>4);
  check(pos+literals<=block.length&&written+literals<=expected,'Invalid literals');
  block.copy(decoded,written,pos,pos+literals);written+=literals;pos+=literals;
  if(pos===block.length)break;
  check(pos+2<=block.length,'Truncated offset');
  const offset=block.readUInt16LE(pos);pos+=2;
  check(offset>0&&offset<=(independentBlocks?written-start:written),'Invalid LZ4 history offset');
  const match=extended(token&15)+4;check(written+match<=expected,'Match overflow');
  for(let i=0;i<match;i++){decoded[written]=decoded[written-offset];written++;}
 }
 check(written-start<=65536,'Decoded block too large');
}
check(written===expected&&at===compressed.length,'Incomplete or trailing frame');
const data=one(one(decoded,1),2);check(data.length>=8,'Truncated tile wrapper');
const wrapperWord=data.readUInt32LE(0);
// Observed to change across official saves without changing the tile layout.
// Preserve this word as opaque metadata; it is not a verified format version.
const count=data.readUInt32LE(4);check(count>0&&count<10000,'Unexpected tile count');
let cursor=8;const tiles=[],all=[];
for(let i=0;i<count;i++){
 check(cursor+4<=data.length,'Missing tile length');const size=data.readUInt32LE(cursor);cursor+=4;
 check(size>=72&&cursor+size+16<=data.length,'Invalid tile extent');
 const tile=data.subarray(cursor,cursor+size);cursor+=size+16; // observed opaque 16-byte suffix
 check(tile.readUInt32LE(0)===0x444e4156&&tile.readUInt32LE(4)===18,'Unsupported tile header');
 const vertexCount=tile.readUInt32LE(24);check(72+12*vertexCount<=size,'Invalid vertex span');
 const vector=offset=>[0,1,2].map(axis=>tile.readFloatLE(offset+axis*4));
 const bounds={min:vector(44),max:vector(56)},vertices=Array.from({length:vertexCount},(_,j)=>vector(72+12*j));
 check([...bounds.min,...bounds.max,...vertices.flat()].every(Number.isFinite),'Nonfinite tile geometry');
 check(vertices.every(v=>v.every((x,k)=>x>=bounds.min[k]-0.001&&x<=bounds.max[k]+0.001)),'Vertices exceed observed header bounds');
 tiles.push({index:i,byteLength:size,grid:[tile.readInt32LE(8),tile.readInt32LE(12)],vertexCount,bounds,vertices});all.push(...vertices);
}
const extents={min:[0,1,2].map(k=>Math.min(...all.map(v=>v[k]))),max:[0,1,2].map(k=>Math.max(...all.map(v=>v[k])))};
const report={sourcePath:path.resolve(input),sourceHash:hash(source),compressedHash:hash(compressed),decodedHash:hash(decoded),
 compressedBytes:compressed.length,decodedBytes:decoded.length,blocks,independentBlocks,headerChecksumVerified:false,
 wrapperWord,wrapperWordMeaning:'opaque-unverified',observedTileVersion:18,tileCount:count,vertexCount:all.length,vertexExtents:extents,
 samples:[[10,6,0],[65,6,0],[-40,8,0]].map(position=>({position,outsideHorizontalVertexExtents:[0,2].some(k=>position[k]<extents.min[k]||position[k]>extents.max[k])})),
 undecodedTail:{byteLength:data.length-cursor,hash:hash(data.subarray(cursor))},tiles,
 scope:'Observed-format research only. Header checksum and tile suffixes not verified. Vertices/header extents inferred and internally checked; polygon topology, connected paths, runtime activation and creation failure causality are not proven. Inside extents does not prove walkability. No save modification.'};
fs.mkdirSync(path.dirname(path.resolve(output)),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2),{flag:'wx'});
console.log(JSON.stringify({sourceHash:report.sourceHash,tileCount:count,vertexCount:all.length,vertexExtents:extents,samples:report.samples}));
