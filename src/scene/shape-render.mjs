import zlib from 'node:zlib';
import {shapeOf} from './shapes.mjs';

// A picture of a thing made of shapes, drawn here without the game: every white-box shape is plain geometry of known
// size, so the parts of scene_add_shape_prefab can be looked at from four sides in a fraction of a second, before
// anything is written or played. It is a sketch: flat colours with simple light, orthographic, no textures; models that
// are not white-box shapes are drawn as grey boxes of their measured size. Rotation follows Unity (the engine): degrees
// about z, then x, then y. The front of the thing is the side that faces +z, the way a prefab created with rotation 0
// looks; the shapes' own orientation (where a prism's edge points) follows the editor's gizmo as seen on 2026-10-26.

const V=(x,y,z)=>[x,y,z],sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>{const l=Math.hypot(...a)||1;return a.map(n=>n/l);},dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
// Triangles of a unit shape centred on the origin, as [[a, b, c], ...].
function prism(sides,height=1,top=1,radius=0.5,turn=0){
  const ring=y=>Array.from({length:sides},(_,i)=>{const t=turn+i*2*Math.PI/sides;return V(Math.sin(t)*radius,y,Math.cos(t)*radius);});
  const lo=ring(-height/2),hi=ring(height/2).map(p=>V(p[0]*top,p[1],p[2]*top)),c0=V(0,-height/2,0),c1=V(0,height/2,0),tris=[];
  for(let i=0;i<sides;i++){const j=(i+1)%sides;tris.push([lo[i],lo[j],hi[j]]);if(top>0)tris.push([lo[i],hi[j],hi[i]]);tris.push([c0,lo[j],lo[i]]);if(top>0)tris.push([c1,hi[i],hi[j]]);}
  return tris;
}
function box(){const p=[-0.5,0.5],c=[];for(const x of p)for(const y of p)for(const z of p)c.push(V(x,y,z));
  const q=(a,b,d,e)=>[[c[a],c[b],c[d]],[c[a],c[d],c[e]]];
  return [...q(0,1,3,2),...q(4,6,7,5),...q(0,4,5,1),...q(2,3,7,6),...q(0,2,6,4),...q(1,5,7,3)];}
function sphere(){const tris=[],n=14,m=24,pt=(i,j)=>{const a=Math.PI*i/n,b=2*Math.PI*j/m;return V(Math.sin(a)*Math.cos(b)*0.5,Math.cos(a)*0.5,Math.sin(a)*Math.sin(b)*0.5);};
  for(let i=0;i<n;i++)for(let j=0;j<m;j++){const a=pt(i,j),b=pt(i+1,j),c=pt(i+1,j+1),d=pt(i,j+1);tris.push([a,b,c],[a,c,d]);}return tris;}
const MESHES={
  10009001:box(),10009010:box(),
  10009002:sphere(),
  10009003:[[V(-0.5,0,-0.5),V(0.5,0,-0.5),V(0.5,0,0.5)],[V(-0.5,0,-0.5),V(0.5,0,0.5),V(-0.5,0,0.5)]],
  // Prisms and pyramids: a triangle 0.866 wide and 0.75 deep, a pentagon 0.951 by 0.905, a point toward +z.
  10009004:prism(3,1,1,0.5),10009005:prism(5,1,1,0.5),10009006:prism(3,1,0,0.5),10009007:prism(5,1,0,0.5),
  10009008:prism(28),10009011:prism(28),10009009:prism(28,1,0),
};
// The prisms' bounds are centred like the editor's (their pivot is the middle of the bounding box, not the centroid).
for(const id of [10009004,10009005,10009006,10009007]){const zs=MESHES[id].flat().map(p=>p[2]),mid=(Math.max(...zs)+Math.min(...zs))/2;MESHES[id]=MESHES[id].map(t=>t.map(p=>V(p[0],p[1],p[2]-mid)));}
const rad=d=>d*Math.PI/180;
function rotate(p,[rx,ry,rz]){
  let [x,y,z]=p;
  if(rz){const c=Math.cos(rad(rz)),s=Math.sin(rad(rz));[x,y]=[x*c-y*s,x*s+y*c];}
  if(rx){const c=Math.cos(rad(rx)),s=Math.sin(rad(rx));[y,z]=[y*c-z*s,y*s+z*c];}
  if(ry){const c=Math.cos(rad(ry)),s=Math.sin(rad(ry));[x,z]=[x*c+z*s,-x*s+z*c];}
  return [x,y,z];
}
const WHITE=0xd9d9d6;
// parts: [{model, position, rotation, scale, color (RRGGBB integer or null), opacity, size?}] as scene-save reads them.
export function triangles(parts){
  const out=[];
  for(const p of parts){
    const shape=shapeOf(p.model),mesh=MESHES[p.model]??box();
    const unit=shape?[1,1,1]:p.natural?p.natural:[1,1,1];
    const base=p.color==null?WHITE:p.color,strength=p.color==null?0:(p.opacity??100)/100;
    const rgb=[16,8,0].map(s=>{const own=(WHITE>>s)&255,col=(base>>s)&255;return Math.round(own*(1-strength)+col*strength);});
    const wire=p.model===10009010||p.model===10009011;
    for(const t of mesh){
      const w=t.map(q=>{const s=[q[0]*unit[0]*p.scale[0],q[1]*unit[1]*p.scale[1],q[2]*unit[2]*p.scale[2]];const r=rotate(s,p.rotation);return [r[0]+p.position[0],r[1]+p.position[1],r[2]+p.position[2]];});
      out.push({w,rgb,wire});
    }
  }
  return out;
}
// Views: where the eye is, looking at the middle. front looks from +z, side from +x, top from above, angle from front-right-above.
const VIEWS={front:[0,0,1],side:[1,0,0],back:[0,0,-1],top:[0,1,0.0001],angle:[0.7,0.45,0.9]};
export function render(parts,{views=['front','side','top','angle'],size=360}={}){
  const tris=triangles(parts);
  if(!tris.length)throw Object.assign(new Error('Nothing to draw.'),{code:'INVALID_PARTS'});
  const all=tris.flatMap(t=>t.w),lo=[0,1,2].map(a=>Math.min(...all.map(p=>p[a]))),hi=[0,1,2].map(a=>Math.max(...all.map(p=>p[a])));
  const mid=lo.map((n,a)=>(n+hi[a])/2),span=Math.max(...hi.map((n,a)=>n-lo[a]))*1.25||1;
  const light=norm([0.4,0.9,0.6]);
  return views.map(view=>{
    const fwd=norm(VIEWS[view]??VIEWS.front).map(n=>-n),upHint=Math.abs(fwd[1])>0.99?[0,0,-1]:[0,1,0];
    // Unity is left-handed: the eye's right is up × forward, and up is forward × right.
    const right=norm(cross(upHint,fwd)),up=cross(fwd,right);
    const W=size,H=size,img=Buffer.alloc(W*H*3),depth=new Float32Array(W*H).fill(Infinity);
    for(let i=0;i<W*H;i++){const g=Math.round(44+18*Math.floor(i/W)/H);img[i*3]=g;img[i*3+1]=g+4;img[i*3+2]=g+12;}
    const scale=W/span,proj=p=>{const d=sub(p,mid);return [W/2+dot(d,right)*scale,H/2-dot(d,up)*scale,dot(d,fwd)];};
    for(const t of tris){
      const n=norm(cross(sub(t.w[1],t.w[0]),sub(t.w[2],t.w[0])));
      const lit=0.42+0.58*Math.abs(dot(n,light)),col=t.rgb.map(c=>Math.min(255,Math.round(c*lit)));
      const [a,b,c]=t.w.map(proj);
      if(t.wire){for(const [s,e] of [[a,b],[b,c]]){const steps=Math.ceil(Math.hypot(e[0]-s[0],e[1]-s[1]))+1;for(let k=0;k<=steps;k++){const x=Math.round(s[0]+(e[0]-s[0])*k/steps),y=Math.round(s[1]+(e[1]-s[1])*k/steps),z=s[2]+(e[2]-s[2])*k/steps-0.01;if(x>=0&&y>=0&&x<W&&y<H&&z<depth[y*W+x]){depth[y*W+x]=z;img.set(col,(y*W+x)*3);}}}continue;}
      const x0=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),x1=Math.min(W-1,Math.ceil(Math.max(a[0],b[0],c[0])));
      const y0=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),y1=Math.min(H-1,Math.ceil(Math.max(a[1],b[1],c[1])));
      const area=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);if(Math.abs(area)<1e-9)continue;
      for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
        const px=x+0.5,py=y+0.5;
        const w0=((b[0]-px)*(c[1]-py)-(c[0]-px)*(b[1]-py))/area,w1=((c[0]-px)*(a[1]-py)-(a[0]-px)*(c[1]-py))/area,w2=1-w0-w1;
        if(w0<0||w1<0||w2<0)continue;
        const z=w0*a[2]+w1*b[2]+w2*c[2],k=y*W+x;
        if(z<depth[k]){depth[k]=z;img.set(col,k*3);}
      }
    }
    return {view,png:png(W,H,img)};
  });
}
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
const crc32=b=>{let c=0xffffffff;for(const x of b)c=CRC[(c^x)&255]^(c>>>8);return (c^0xffffffff)>>>0;};
function png(w,h,rgb){
  const rows=Buffer.alloc((w*3+1)*h);for(let y=0;y<h;y++){rows[y*(w*3+1)]=0;rgb.copy(rows,y*(w*3+1)+1,y*w*3,(y+1)*w*3);}
  const chunk=(type,data)=>{const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const body=Buffer.concat([Buffer.from(type),data]);const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(body));return Buffer.concat([len,body,crc]);};
  const head=Buffer.alloc(13);head.writeUInt32BE(w,0);head.writeUInt32BE(h,4);head[8]=8;head[9]=2;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',head),chunk('IDAT',zlib.deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);
}
