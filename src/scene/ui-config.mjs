import {fields} from './wire.mjs';
import {createHash} from 'node:crypto';
import {inspectUIRect,inspectUIVisibility} from './ui-rect.mjs';
const messages=(b,id)=>fields(b).filter(f=>f.id===id&&f.wire===2).map(f=>f.data);
const integer=(b,id)=>{const a=fields(b).filter(f=>f.id===id);return a.length===1&&a[0].wire===0&&a[0].value<=BigInt(Number.MAX_SAFE_INTEGER)?Number(a[0].value):null;};
const descend=(b,...ids)=>ids.reduce((items,id)=>items.flatMap(v=>messages(v,id)),[b]);
const text=b=>{const value=b.toString('utf8');return Buffer.from(value).equals(b)?value:null;};

// Read-only CN 7.0 paths established by official text-control save samples.
// No inference of account permissions, variable bindings or runtime visibility.
export function inspectUIConfigurations(payload){
 return descend(payload,9,502).flatMap(record=>{
  const gameId=integer(record,501);
  if(gameId===null)return [];
  const components=messages(record,505);
  const settings=components.filter(c=>integer(c,502)===25).flatMap(c=>messages(c,503))
   .filter(c=>integer(c,502)===25&&messages(c,504).some(ref=>integer(ref,4)===gameId))
   .flatMap(c=>messages(c,19));
  if(settings.length!==1)return [];
  const s=settings[0],names=components.flatMap(c=>descend(c,12,501));
  const strings=descend(s,505,501).map(text);
  return [{resourceType:'ui-text-control',gameId,name:names.length===1?text(names[0])??'':'',layoutId:integer(record,504),
   textEntries:strings,fontSize:integer(s,502),textColorRaw:integer(s,510),backgroundColorRaw:integer(s,511),
   recordHash:createHash('sha256').update(record).digest('hex'),...inspectUIRect(record),...inspectUIVisibility(record),inspection:'observed-cn-7.0-text-control-paths',
   scope:'Saved text entries, font size, raw color integers and layout reference only; bindings, transforms, permission and rendering are not certified',
   gameplay:'not_run'}];
 });
}
