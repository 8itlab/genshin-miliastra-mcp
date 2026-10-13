// The platform's own effect, sound and music assets: the names and ids the editor shows in its pickers, read off the
// screen on 2026-10-11 (scripts/dev/listscrape.py, listparse.py). A graph refers to all three by number; before this
// list the numbers could only be found by trying them one by one.
import fs from 'node:fs';
const at=name=>new URL(`./media/${name}`,import.meta.url);
const tables={};
const table=name=>tables[name]??=JSON.parse(fs.readFileSync(at(name+'.json'),'utf8'));
const jpeg=bytes=>({type:'image',mimeType:'image/jpeg',data:bytes.toString('base64')});
// Two kinds of pictures. A photo shows the effect on a character in play (the first 84 looping effects, ./fx/<id>.jpg).
// A thumbnail is the small picture the editor shows in its list; all of them are packed in one file with an index.
let pack;
const photo=id=>{const url=new URL(`./fx/${id}.jpg`,import.meta.url);return fs.existsSync(url)?jpeg(fs.readFileSync(url)):null;};
const thumb=id=>{const place=table('fx-thumbs')[id];if(!place)return null;pack??=fs.readFileSync(at('fx-thumbs.bin'));return jpeg(pack.subarray(place[0],place[0]+place[1]));};
// Every word of the query has to be in the name or the category; an empty query matches all.
const matcher=query=>{const words=String(query??'').trim().split(/\s+/).filter(Boolean);return text=>words.every(w=>text.includes(w));};
const slice=(rows,offset,limit)=>({total:rows.length,offset,rows:rows.slice(offset,offset+limit)});

const EFFECT_USAGE=`A one-off effect (限时特效, kind "timed") plays once on an entity and is gone: a flash when something is bought, dust where something appears, a hit, fireworks:
  f.playTimedEffects(<id>,entity,'GI_RootNode',true,false,[0,0,0],[0,0,0],1,true);   // follow the entity, do not turn with it, offset, rotation, scale, also play the effect's own sound
A looping effect (循环特效, kind "looping") stays until it is cleared: a glow on what can be used now, an aura, a fire:
  const fx=f.mountLoopingSpecialEffect(<id>,entity,'GI_RootNode',true,true,[0,0,0],[0,0,0],1,false);   // returns an instance id
  f.clearLoopingSpecialEffect(fx,entity);   // or f.clearSpecialEffectsBasedOnSpecialEffectAssets(entity,<id>)
The two kinds are different assets: a timed id does nothing in the looping node and the other way round. The entity can be a character, a creature or an object; 'GI_RootNode' is the attachment point all of them have. seconds is how long a timed effect lasts.
Names that start with a creature's name (火史莱姆_..., 丘丘岩盔王_...) are the effects of that creature's own moves; the plain names (黄色闪光, 出现烟尘, 箭矢命中小, 橙色烟花) are the general ones.`;
// query: words of the Chinese name. kind: "timed" or "looping". ids: look at those effects (a line and a picture each).
// page: the contact sheets of the first 84 looping effects photographed on a character. pictures: how many of the
// rows found come with their thumbnail.
export function effectCatalog({query,kind,ids,page,limit=40,offset=0,pictures=12}={}){
  const data=table('effects'),rows=[...data.timed.map(([id,name,seconds])=>({id,name,kind:'timed',seconds})),...data.looping.map(([id,name])=>({id,name,kind:'looping'}))];
  if(ids?.length){
    const byId=new Map(rows.map(r=>[r.id,r])),content=[],shown=[];
    for(const id of ids){
      const row=byId.get(id);shown.push(row??{id,found:false});
      content.push({type:'text',text:row?`${id} ${row.name} (${row.kind}${row.seconds?`, ${row.seconds} s`:''})`:`${id}: not in the editor's effect lists`});
      const picture=row&&(photo(id)??thumb(id));
      if(picture)content.push(picture);
    }
    const out={effects:shown,usage:EFFECT_USAGE};
    return {content:[...content,{type:'text',text:JSON.stringify(out)}],structuredContent:out};
  }
  if(page!==undefined){
    const sheets=JSON.parse(fs.readFileSync(new URL('./effect-catalog.json',import.meta.url),'utf8')),sheet=sheets.pages[page];
    if(!sheet)throw Object.assign(new Error('No such page'),{code:'INVALID_PAGE',details:{pages:sheets.pages.length}});
    const out={page,pages:sheets.pages.length,idsOnThisPage:sheet.ids,note:'Each picture shows a looping effect on a character about 1.6 m tall, a second after it started. Only the first 84 looping effects were photographed this way; search the full lists with query.',usage:EFFECT_USAGE};
    return {content:[jpeg(fs.readFileSync(new URL(`./fx/${sheet.file}`,import.meta.url))),{type:'text',text:JSON.stringify(out)}],structuredContent:out};
  }
  const hit=matcher(query),found=rows.filter(r=>(!kind||r.kind===kind)&&hit(r.name));
  const part=slice(found,offset,limit),shown=part.rows.slice(0,pictures).filter(r=>table('fx-thumbs')[r.id]);
  const out={counts:{timed:data.timed.length,looping:data.looping.length},...part,picturesOf:shown.map(r=>r.id),usage:EFFECT_USAGE,
    hint:'Words that find the general effects: 出现 消失 烟尘 闪光 光环 光柱 受击 命中 爆炸 破碎 预警 提示 符号 烟花 拾取 恢复 护盾 屏障 箭矢 投射物 尾迹, and 火 冰 雷 水 草 风 岩. The pictures after this text are the thumbnails of picturesOf, in that order; pass ids for others.',source:data.source};
  return {content:[{type:'text',text:JSON.stringify(out)},...shown.map(r=>thumb(r.id))],structuredContent:out};
}

const SOUND_USAGE=`A sound for one player, not tied to a place (a coin, a purchase, a refusal, a horn):
  f.playerPlaysOneShot2dSoundEffect(player,<id>n,100n,1);   // player entity, sound id, volume 0-100, speed
A sound that comes from an entity and can loop (a fire crackling, a machine) is a sound player added to it:
  const n=f.addSoundEffectPlayer(entity,<id>n,100n,1,true,0,true,20,SoundAttenuationMode.<...>,'GI_RootNode',[0,0,0]);   // loop, pause between loops, 3D, range in metres; returns the player's number
  f.closeSpecifiedSoundEffectPlayer(entity,n);
The names say what a sound is for (界面音效 has clicks, confirmations, errors and prompts; 场景物件_机关交互_宝箱 the sounds of a chest; 战斗_受击_命中 hits), not how it sounds: pick by name, play the level with playtest_start {recordAudio:true} and read in playtest_status when and how loud it was. While the game is paused, interface sounds keep playing and the others pause.`;
export function soundCatalog({query,category,limit=40,offset=0}={}){
  const data=table('sounds'),hit=matcher(query);
  // A few dozen sounds were played and recorded (examples/listen): those rows also say how long and how bright they are.
  const found=data.rows.map(([id,name,cat])=>{const m=data.measured?.[id];return {id,name,category:data.categories[cat],...(m?{seconds:m[0],brightHz:m[2]}:{})};})
    .filter(r=>(!category||r.category.includes(category))&&hit(r.name+' '+r.category));
  // The groups of names in each category, so that a caller sees what there is before it searches.
  const groups={};
  for(const [,name,cat] of data.rows){const key=name.split('_').slice(0,3).join('_').replace(/_\d+$|…$/,'');((groups[data.categories[cat]]??={})[key]??=0);groups[data.categories[cat]][key]++;}
  const out={count:data.rows.length,categories:data.categories,...slice(found,offset,limit),...(query||category?{}:{groups}),usage:SOUND_USAGE,measured:data.measuredNote,source:data.source};
  return {content:[{type:'text',text:JSON.stringify(out)}],structuredContent:out};
}

const MUSIC_USAGE=`Background music is per player and a graph changes it at any moment (day and night, a fight, the ending):
  f.modifyPlayerBackgroundMusic(player,<id>n,0,<seconds>,80n,true,0,1,true);   // from second, to second (the length of the piece plays all of it), volume 0-100, loop, pause between loops, speed, fade in and out
  f.adjustPlayerBackgroundMusicVolume(player,40n);   f.startPausePlayerBackgroundMusic(player,false);
The level can also start with a piece set in the editor's 背景音乐管理; a graph that sets one when the level starts does the same.`;
export function musicCatalog({query,category,limit=60,offset=0}={}){
  const data=table('music'),hit=matcher(query);
  const found=data.rows.map(([id,name,seconds,cat])=>({id,name,seconds,category:data.categories[cat]})).filter(r=>(!category||r.category.includes(category))&&hit(r.name+' '+r.category));
  const out={count:data.rows.length,categories:data.categories,...slice(found,offset,limit),usage:MUSIC_USAGE,
    note:'The names are the titles of the pieces (Genshin soundtrack); the category is the only hint of the mood: 探索音乐 calm, 战斗音乐 tense, 任务音乐 story, 其他需求 events.',source:data.source};
  return {content:[{type:'text',text:JSON.stringify(out)}],structuredContent:out};
}

// The animations of the complex creatures (怪物(AI版)): what a creature skill (scene_add_creature_skill) can play. Ids
// and names were read from the editor's skill timeline on 2026-10-11 (scripts/dev/animscrape.py).
// "seen" holds what was looked at in play: what a creature has in its hands, and for a few animations the moment that
// counts (atMs) and what happens in them.
const animationRows=creature=>{const data=table('creature-animations'),seen=data.seen?.animations??{};return data.creatures[creature]?.map(([id,name,seconds,loop])=>({id,name,seconds,...(loop?{loop:true}:{}),...(seen[id]??{})}))??null;};
export const animationsOf=animationRows;
// Some lists stop at the last id that was tried, not at the creature's last animation.
export const animationsMayGoOn=creature=>table('creature-animations').incomplete.includes(String(creature));
const ANIMATION_USAGE=`A creature skill plays one animation or several one after another, and its graph runs at a chosen millisecond of it:
  scene_add_creature_skill {creature, name, graphId, animation: <id or name>, graphAtMs}   // or animations: [..]
seconds is the length of the clip, so a hit that lands in the middle of a 2.33 s swing is graphAtMs around 1000. An animation marked loop repeats while the skill lasts; the others play once. What each looks like is only seen in the game or in the editor (战斗预设 > 技能 > 动画编辑): the names say what it is for (近战攻击 a melee swing, 远程攻击 a shot, 未入战待机 standing at ease, 警觉 noticing something); the ones that were looked at in play carry atMs (the moment that counts: use it as graphAtMs) and what (what happens in them). A creature walks, runs and turns by itself (the tactics of a status graph); skills are everything else it does.`;
export function creatureAnimations({creature,query}={}){
  const data=table('creature-animations'),hit=matcher(query);
  if(creature===undefined){
    const out={creatures:Object.entries(data.creatures).map(([id,rows])=>({creature:Number(id),name:data.names[id],animations:rows.length,...(data.incomplete.includes(id)?{mayHaveMore:true}:{}),...(query?{matching:rows.filter(r=>hit(r[1])).map(r=>r[0]+' '+r[1])}:{})})).filter(c=>!query||c.matching.length),
      note:'The other complex creatures were not read: their animations are numbered <last four digits of the asset id>001 and up, and scene_add_creature_skill takes such an id as it is (an id the creature does not have plays nothing).',hands:data.seen?.general,usage:ANIMATION_USAGE,source:data.source};
    return {content:[{type:'text',text:JSON.stringify(out)}],structuredContent:out};
  }
  const rows=animationRows(creature);
  if(!rows)throw Object.assign(new Error('The animations of this creature were not read from the editor'),{code:'NO_ANIMATION_LIST',details:{creature,known:Object.keys(data.creatures).map(Number)}});
  const out={creature,name:data.names[creature],...(data.seen?.creatures?.[creature]?{inItsHands:data.seen.creatures[creature]}:{}),animations:rows.filter(r=>hit(r.name)),...(data.incomplete.includes(String(creature))?{mayHaveMore:'The list was read up to id '+rows.at(-1).id+'; the creature may have animations after it, which scene_add_creature_skill takes by id.'}:{}),hands:data.seen?.general,usage:ANIMATION_USAGE,source:data.source};
  return {content:[{type:'text',text:JSON.stringify(out)}],structuredContent:out};
}
