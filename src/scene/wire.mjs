// A shallow protobuf reader. Opaque fields retain their exact bytes and order.
const invalid=()=>{throw new Error('Malformed or unsupported protobuf field');};
export function varint(n){n=BigInt(n);if(n<0n||n>0xffffffffffffffffn)invalid();const a=[];do{let b=Number(n&127n);n>>=7n;a.push(b|(n?128:0));}while(n);return Buffer.from(a);}
export function fields(input){
 const b=Buffer.from(input),out=[];let p=0;
 function read(){let n=0n;for(let i=0;i<10;i++){if(p>=b.length)invalid();const v=b[p++];if(i===9&&v>1)invalid();n|=BigInt(v&127)<<BigInt(i*7);if(!(v&128))return n;}invalid();}
 while(p<b.length){const start=p,key=read(),id=Number(key>>3n),wire=Number(key&7n);if(id<1||id>0x1fffffff)invalid();let value,data;
  if(wire===0)value=read();
  else if(wire===2){const len=read();if(len>BigInt(b.length-p))invalid();data=b.subarray(p,p+Number(len));p+=Number(len);}
  else if(wire===1||wire===5){const len=wire===1?8:4;if(p+len>b.length)invalid();data=b.subarray(p,p+len);p+=len;}
  else invalid();
  out.push({id,wire,value,data,raw:b.subarray(start,p)});
 }return out;
}
export function field(id,wire,data){const key=varint(BigInt(id)*8n+BigInt(wire));return wire===0?Buffer.concat([key,varint(data)]):wire===2?Buffer.concat([key,varint(data.length),data]):Buffer.concat([key,data]);}
export function one(b,id,wire=2){const a=fields(b).filter(f=>f.id===id);if(a.length!==1||a[0].wire!==wire)throw new Error('Expected one field '+id);return wire===0?a[0].value:a[0].data;}
export function replace(b,id,wire,data){one(b,id,wire);return Buffer.concat(fields(b).map(f=>f.id===id?field(id,wire,data):f.raw));}
export function mapFields(b,id,fn){return Buffer.concat(fields(b).map(f=>f.id===id?field(id,f.wire,fn(f.data)):f.raw));}
export function container(b){b=Buffer.from(b);if(b.length<24||b.readUInt32BE(0)!==b.length-4||b.readUInt32BE(8)!==0x326||b.readUInt32BE(16)!==b.length-24||b.readUInt32BE(b.length-4)!==0x679)throw new Error('Invalid asset container');fields(b.subarray(20,-4));return b.subarray(20,-4);}
export function wrap(seed,payload){container(seed);const header=Buffer.from(seed.subarray(0,20));header.writeUInt32BE(payload.length+20,0);header.writeUInt32BE(payload.length,16);return Buffer.concat([header,payload,seed.subarray(-4)]);}
