import {field} from './wire.mjs';

// The white-box shapes of the platform (白盒物件, 预制 → 动态单位 → 其他 in the editor): plain geometry made to be scaled,
// coloured and put together. Native sizes in metres at scale 1 (x, y, z), from the mesh bounds of qianxing-format-docs
// (CC BY 4.0, data/beyd_mesh_bounds.json); the pivot is the centre of the shape (a sphere of scale 1 placed on the ground
// by the editor stands at y 0.5, seen 2026-10-26). The plane is flat: it is given a thickness of 0 and scaled, not sized.
export const SHAPES=[
 {id:10009001,name:'长方体',en:'cube',size:[1,1,1]},
 {id:10009002,name:'球体',en:'sphere',size:[1,1,1]},
 {id:10009003,name:'平面',en:'plane',size:[1,0,1]},
 {id:10009004,name:'三棱柱',en:'triangular prism',size:[0.866,1,0.75]},
 {id:10009005,name:'五棱柱',en:'pentagonal prism',size:[0.951,1,0.905]},
 {id:10009006,name:'三棱锥',en:'triangular pyramid',size:[0.866,1,0.75]},
 {id:10009007,name:'五棱锥',en:'pentagonal pyramid',size:[0.951,1,0.905]},
 {id:10009008,name:'圆柱',en:'cylinder',size:[1,1,1]},
 {id:10009009,name:'圆锥',en:'cone',size:[1,1,1]},
 {id:10009010,name:'线框长方体',en:'wireframe cube',size:[1,1,1]},
 {id:10009011,name:'线框圆柱',en:'wireframe cylinder',size:[1,1,1]},
];
// The empty model (空模型): nothing to see. The official guide recommends it as the main model of a thing made of
// decorations. (As a decoration of a placed entity it carries one more property, kind 20; on a prefab it does not.)
export const EMPTY_MODEL=10005018;
const byKey=new Map(SHAPES.flatMap(s=>[[s.id,s],[s.name,s],[s.en,s]]));
export function shapeOf(key){
 if(typeof key!=='string')return byKey.get(key)??null;
 const s=key.trim().replace(/^白盒[·・]?/,'');
 return byKey.get(s)??byKey.get(s.toLowerCase())??null;
}

// Custom colour (颜色与材质 → 启用自定义颜色) is the component of kind 22, {32: {...}}, the same on a placed entity, a
// prefab and a decoration. Read from saves the editor wrote on 2026-10-26: 1 = on; 2 = 覆盖装饰物颜色 (the main model's
// colour is also laid over every decoration); 3 = the colour as AARRGGBB, its alpha the opacity of the colour layer
// (100% 0xFF, 60% 0x99), not a transparency of the object; 4 = the opacity in percent as a float; 5 = RRGGBB; 6 = how it
// is laid on: 6700 covers the model's own colour (覆盖), 6701 multiplies with it (正片叠底). With the colour off the
// editor still writes {3: 0xFFFFFFFF, 4: 100, 5: 0xFFFFFF, 6: 6700}.
export const BLENDS={cover:6700,multiply:6701};
export function parseColor(value,label='color'){
 const m=typeof value==='string'&&/^#?([0-9a-fA-F]{6})$/.exec(value.trim());
 if(m)return parseInt(m[1],16);
 if(Number.isInteger(value)&&value>=0&&value<=0xffffff)return value;
 throw Object.assign(new Error(label+' is "#RRGGBB" (or the colour code of the editor, an integer up to 16777215)'),{code:'INVALID_COLOR'});
}
const f32=n=>{const b=Buffer.alloc(4);b.writeFloatLE(n);return b;};
export function colorRecord({color,opacity=100,blend='cover',overrideParts=false}={}){
 if(color===undefined||color===null)return Buffer.concat([field(1,0,22),field(32,2,Buffer.concat([field(3,0,0xffffffff),field(4,5,f32(100)),field(5,0,0xffffff),field(6,0,6700)]))]);
 const rgb=parseColor(color);
 if(!(Number.isFinite(opacity)&&opacity>=0&&opacity<=100))throw Object.assign(new Error('opacity is 0 to 100 (percent of the colour laid over the model)'),{code:'INVALID_COLOR'});
 if(!(blend in BLENDS))throw Object.assign(new Error('blend is "cover" or "multiply"'),{code:'INVALID_COLOR'});
 const alpha=Math.round(opacity*2.55),argb=(alpha*0x1000000+rgb);
 return Buffer.concat([field(1,0,22),field(32,2,Buffer.concat([field(1,0,1),...(overrideParts?[field(2,0,1)]:[]),field(3,0,argb),field(4,5,f32(Math.floor(opacity))),...(rgb?[field(5,0,rgb)]:[]),field(6,0,BLENDS[blend])]))]);
}
