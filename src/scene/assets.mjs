import fs from 'node:fs';

// Every placeable entity of the official asset panel: ID, name, panel group, icon
// name and, for most, the model's size in metres at scale 1 (x, y, z).
// Data: hang-ZYM/qianxing-format-docs, CC BY 4.0 (see THIRD_PARTY_NOTICES.md).
const catalog=JSON.parse(fs.readFileSync(new URL('./asset-catalog.json',import.meta.url),'utf8'));
export const ASSETS=catalog.assets;
const byId=new Map(ASSETS.map(a=>[a.id,a]));
// Mechanism assets (chests, levers, doors) come with a preset status, a built-in animation a graph switches with
// f.setPresetStatus(entity, statusId, value). The ids are those the official sample saves register and use (preset-status.json).
const PRESET_STATUS=JSON.parse(fs.readFileSync(new URL('./preset-status.json',import.meta.url),'utf8')).assets;
export const presetStatusOf=id=>PRESET_STATUS[String(id)]||null;
// Where a character stands on a piece, in metres above the position the piece was given, read from the track of a
// playtest. The height the catalogue lists is that of the model and has been off by a quarter of a metre: a stone floor
// listed 0.5 m thick carries the character 0.25 m above its position (2026-10-13, two levels).
const STANDS_AT={20002055:0.25,20002056:0.25,10005015:0.47};
const standsAt=id=>id in STANDS_AT?{standsAt:STANDS_AT[id]}:{};
// One photo per asset, taken in the editor on flat grass with the asset scaled to roughly the same size (scripts/dev/thumbs_*).
const thumbFile=id=>new URL(`./thumbs/${id}.jpg`,import.meta.url);
const hasThumb=id=>fs.existsSync(thumbFile(id));
const nameCount=new Map();
for(const a of ASSETS)nameCount.set(a.name,(nameCount.get(a.name)||0)+1);
export function findAsset(key){
 if(typeof key==='number')return byId.get(key)||null;
 if(/^\d+$/.test(key))return byId.get(Number(key))||null;
 // Many assets share a name (72 different “乔木”), so a name only identifies one when it is unique.
 return nameCount.get(key)===1?ASSETS.find(a=>a.name===key):null;
}
export function searchAssets({query='',group,minSize,maxSize,limit=30,offset=0}={}){
 const terms=query.toLowerCase().split(/\s+/).filter(Boolean);
 const longest=a=>a.size?Math.max(...a.size):null;
 const hits=ASSETS.filter(a=>{
  if(group&&a.group!==group)return false;
  const text=(a.name+' '+a.icon+' '+a.id).toLowerCase();
  if(!terms.every(t=>text.includes(t)))return false;
  if(minSize!==undefined&&!(longest(a)>=minSize))return false;
  if(maxSize!==undefined&&!(longest(a)<=maxSize))return false;
  return true;
 });
 // Nothing found: the names that share most of the query's characters, so that the next search can use a word the
 // catalog has (石地板 finds nothing; the catalog says 石质地板).
 let didYouMean;
 if(!hits.length&&terms.length){
  const chars=[...new Set(terms.join(''))],need=Math.max(2,Math.ceil(chars.length*0.6)),scored=new Map();
  for(const a of ASSETS){if(group&&a.group!==group)continue;const name=a.name.toLowerCase(),n=chars.filter(c=>name.includes(c)).length;if(n>=need&&n>(scored.get(a.name)??0))scored.set(a.name,n);}
  didYouMean=[...scored].sort((x,y)=>y[1]-x[1]||x[0].length-y[0].length).slice(0,10).map(([name])=>name);
 }
 return {total:hits.length,...(didYouMean?.length?{didYouMean}:{}),offset,assets:hits.slice(offset,offset+limit).map(a=>({id:a.id,name:a.name,group:a.group,icon:a.icon,sizeMetres:a.size||null,...standsAt(a.id),hasImage:hasThumb(a.id),...(presetStatusOf(a.id)?{presetStatus:presetStatusOf(a.id)}:{})})),
  groups:[...new Set(ASSETS.map(a=>a.group))],
  note:'sizeMetres is [x, y, z] of the model at scale 1; null means unmeasured (mostly monsters). It is the size of the model, not of what a character stands on: where standsAt is given, a character stands that many metres above the position of the piece (measured in play); for a floor without it, lay one piece and read the height from a playtest with trackPlayer before placing things on it. Names repeat, so always place by id. hasImage says whether scene_asset_images has a photo of it: look at the candidates there before choosing between assets that share a name. presetStatus, where given, is the asset\'s built-in animation: a prefab made of it with scene_add_prefab can be switched by a graph with f.setPresetStatus(entity, statusId, value) (used lists the values the official samples set).',
  source:catalog.source};
}
// Photos for up to 12 assets: a text line (id, name, group, size) followed by the image, in the order asked.
// The photos are 192 px JPEGs shot from above at 45 degrees with every asset scaled to a similar size, so they show the look, not the scale.
export function assetImages({ids}){
 const content=[],assets=[];
 for(const id of ids){
  const a=byId.get(id);
  if(!a){assets.push({id,found:false,hasImage:false});content.push({type:'text',text:`${id}: no such asset id in the catalog`});continue;}
  const has=hasThumb(id);
  assets.push({id,found:true,name:a.name,group:a.group,icon:a.icon,sizeMetres:a.size||null,...standsAt(a.id),hasImage:has});
  const size=a.size?`${a.size.join(' x ')} m (x, y, z at scale 1)`:'size unmeasured';
  content.push({type:'text',text:`${id} ${a.name} | ${a.group} | ${size}${has?'':' | NO IMAGE for this asset (it could not be photographed); do not guess its look'}`});
  if(has)content.push({type:'image',mimeType:'image/jpeg',data:fs.readFileSync(thumbFile(id)).toString('base64')});
 }
 const data={assets,note:'Each photo shows the asset alone on grass, scaled so its longest side fills the frame: compare shapes and colours, and read the real size from sizeMetres.'};
 return {content:[...content,{type:'text',text:JSON.stringify(data)}],structuredContent:data};
}
