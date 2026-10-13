// What a level is published with, put together from playtests: a cover and four more pictures (16:9, 1600 x 900), the
// title, the description and the tags, and a list of what to look at before it goes out. The numbers are the official
// guide's (the video lesson on publishing material, knowledge page mhv9m60wv7ew): a title of at most ten Chinese
// characters (twenty Latin ones), pictures of 16:9 with 1600 x 900 recommended, a cover whose left side may be hidden
// by a tag on the home page, a video of ten to thirty seconds. Publishing itself is done by the creator in the game
// (我的奇域 > the save > 上传存档 > 预览信息): it goes out under their name, so no tool presses that button.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {ROOT} from './core.mjs';
import {fail} from './adapter.mjs';
import {listRespawnPoints} from './scene-save.mjs';

const readStatus=dir=>{try{return JSON.parse(fs.readFileSync(path.join(dir,'status.json'),'utf8'));}catch{return null;}};
// A title counts as the editor counts it: a Chinese character is one, two Latin letters or digits are one.
export const titleLength=title=>[...title].reduce((n,c)=>n+(/[\u0000-ÿ]/.test(c)?0.5:1),0);
function shotOf({runId,playSeconds},workspace){
  const runDir=path.join(workspace,'playtests',runId),status=readStatus(runDir);
  if(!status)fail('PLAYTEST_NOT_FOUND','No playtest with this runId in this workspace.',{runId});
  const shots=(status.screenshots||[]).filter(s=>s.playSeconds!==undefined&&fs.existsSync(s.file));
  if(!shots.length)fail('NO_SCREENSHOTS','This playtest has no screenshots. Take them with playtest_start screenshotsAt.',{runId});
  const best=shots.reduce((a,b)=>Math.abs(b.playSeconds-playSeconds)<Math.abs(a.playSeconds-playSeconds)?b:a);
  if(Math.abs(best.playSeconds-playSeconds)>1.5)fail('NO_SCREENSHOT_THERE','No screenshot of this playtest lies within a second and a half of that moment.',{runId,playSeconds,taken:shots.filter(s=>!s.burst).map(s=>s.playSeconds)});
  return best;
}
export function publishKit({name,title,description,tags=[],cover,images,mapPath,video},workspace){
  if(!/^[A-Za-z0-9_-]{1,40}$/.test(name))fail('INVALID_NAME','name is the folder of the kit: letters, digits, - and _.',{name});
  if(images.length!==4)fail('FOUR_PICTURES','A level is shown with a cover and four more pictures: give four in images.',{given:images.length});
  const dir=path.join(workspace,'publish',name);fs.mkdirSync(dir,{recursive:true});
  const picked=[cover,...images].map(p=>shotOf(p,workspace)),files=['cover.jpg','picture-1.jpg','picture-2.jpg','picture-3.jpg','picture-4.jpg'].map(f=>path.join(dir,f));
  const request=path.join(dir,'request.json');
  fs.writeFileSync(request,JSON.stringify({images:picked.map((s,i)=>({file:s.file,out:files[i]})),size:[1600,900]}));
  const python=process.env.MILIASTRA_PLAYTEST_PYTHON||process.env.MILIASTRA_PYTHON||'python';
  const ran=spawnSync(python,[path.join(ROOT,'src','publish_kit.py'),request],{encoding:'utf8',windowsHide:true,env:{...process.env,PYTHONIOENCODING:'utf-8'}});
  fs.rmSync(request,{force:true});
  let made;try{made=JSON.parse((ran.stdout||'').trim().split('\n').pop());}catch{made=null;}
  if(!made)fail('KIT_FAILED','The pictures could not be made. It needs Python with Pillow (pip install -r requirements-capture.txt); set MILIASTRA_PLAYTEST_PYTHON to that interpreter.',{output:((ran.stderr||'')+(ran.error?.message||'')).slice(-600)});
  let videoFile=null;
  if(video){
    if(!fs.existsSync(video))fail('VIDEO_NOT_FOUND','video is the path of a recording that exists.',{video});
    videoFile=path.join(dir,'video'+path.extname(video));fs.copyFileSync(video,videoFile);
  }
  const level=mapPath?listRespawnPoints({mapPath}):null,length=titleLength(title),same=new Set(picked.map(s=>s.file)).size<picked.length;
  const check=(item,ok,note)=>({item,ok,note});
  const checklist=[
    check('title',length<=10,length<=10?'Says the kind of game and what is special about it?':'The title is '+length+' long (a Chinese character counts 1, a Latin letter or digit a half): the official limit is 10.'),
    check('description',description.length>=20&&description.length<=300,description.length<20?'Too short to tell a stranger what the game is: what you do, what is special, one hint.':description.length>300?'Long: the official advice is a short one (what you do, what is special, one hint).':'What you do, what is special, one hint: all three there?'),
    check('tags',tags.length>=1,tags.length?'Tags are chosen from the game\'s own list when publishing; these are what to look for there.':'Give the tags to look for when publishing (kind of game, solo or co-op, camera).'),
    check('pictures',!same&&!made.images.some(i=>i.cropped),same?'The same screenshot is used twice: five different moments tell more.':made.images.some(i=>i.cropped)?'A screenshot was not 16:9 and lost its edges: look at the pictures.':'Five different moments, 1600 x 900. LOOK at them: the cover\'s left side may be hidden by a tag on the home page, so what matters belongs in the middle or on the right.'),
    check('video',Boolean(videoFile),videoFile?'Ten to thirty seconds of the best moment.':'No video. The official advice is ten to thirty seconds of the best moment; a level can be published without one.'),
    ...(level?[check('players',true,level.players?'The level takes '+level.players.min+' to '+level.players.max+' players (scene_set_player_count). A game made for one player should say 1 to 1.':'This save has no player group to read.'),
      check('respawn',level.respawnPoints.length>0,level.respawnPoints.length?level.respawnPoints.length+' respawn point(s).':'No respawn point: a character that goes down has nowhere to come back to (scene_add_respawn_point), unless the game ends there on purpose.')]:[])];
  const listing=['# '+title,'',description,'','标签：'+tags.join('、'),'','## 文件','',...files.map(f=>'- '+path.basename(f)),...(videoFile?['- '+path.basename(videoFile)]:[]),'',
    '## 发布前看一眼','',...checklist.map(c=>'- ['+(c.ok?'x':' ')+'] '+c.item+'：'+c.note),'',
    '## 怎么发布（创作者自己在游戏里做）','','1. 我的奇域 → 选这份存档 → 上传存档 → 预览信息。','2. 填标题、描述，选标签，上传封面和四张图（以及视频）。','3. 第一次发布可以勾“先行体验”，先让少量玩家试玩再转正式版。',''].join('\n');
  fs.writeFileSync(path.join(dir,'listing.md'),listing);
  const summary={kit:dir,cover:files[0],pictures:files.slice(1),video:videoFile,listing:path.join(dir,'listing.md'),title,titleLength:length,checklist,
    from:picked.map(s=>({file:s.file,playSeconds:s.playSeconds})),
    next:'Look at the cover (returned here) and the four pictures. Publishing is done by the creator in the game: 我的奇域 > the save > 上传存档 > 预览信息, with the title, description, tags and files of this folder. This tool does not publish.'};
  return {content:[{type:'text',text:JSON.stringify(summary)},{type:'image',mimeType:'image/jpeg',data:fs.readFileSync(files[0]).toString('base64')}],structuredContent:summary};
}
