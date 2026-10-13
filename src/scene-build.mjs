import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {BLOCK_CATALOG,buildBlockScene} from './scene/blocks.mjs';
import {searchAssets,assetImages} from './scene/assets.mjs';
import {launchRunner} from './playtest.mjs';
import {fail} from './adapter.mjs';

// The editor's “加载外部资产” reads every .gia in this folder; no file dialog is involved.
function exportFolder(){
  const base=path.join(os.homedir(),'AppData','LocalLow','miHoYo');
  return [path.join(base,'原神','BeyondLocal','Beyond_Local_Export'),path.join(base,'Genshin Impact','BeyondLocal','Beyond_Local_Export')].find(p=>fs.existsSync(p))||null;
}
export function blockCatalog(){
  return {blocks:BLOCK_CATALOG.map(b=>({template:b.name,templateId:b.templateId,color:b.color,nativeSizeMetres:b.baseSize})),
    usage:'Every block is a box you can stretch: give its centre position and its size in metres on each axis, so one block can be a whole floor or wall segment. Ground level of a new empty save is y=0. Rotation is in degrees. Colours are approximate averages of the texture; stretching a block also stretches its texture.'};
}
export const searchSceneAssets=args=>searchAssets(args);
export const sceneAssetImages=args=>assetImages(args);
// Packs built by this server never share an ID range, even when two are built within the same second and imported together.
let nextObjectStart=0,nextMonsterStart=0;
export function buildSceneBlocks({name,blocks,offset,entityIdStart,install=true},workspace){
  // offset moves the whole list: the same scene on ground of another height, or a second copy somewhere else.
  if(offset)blocks=blocks.map(b=>({...b,position:b.position.map((n,axis)=>n+offset[axis])}));
  // A fresh ID range per build keeps repeated imports from reusing entity IDs of an earlier pack.
  const now=Math.floor(Date.now()/1000);
  const start=entityIdStart??Math.max(1078000000+now%1900*1000,nextObjectStart);
  const monsterStart=Math.max(1082200000+now%900*1000,nextMonsterStart);
  const built=buildBlockScene({blocks,entityIdStart:start,monsterIdStart:monsterStart});
  nextObjectStart=Math.max(nextObjectStart,start+Math.ceil((built.count+1)/1000)*1000);nextMonsterStart=monsterStart+1000;
  const dir=path.join(workspace,'scenes');fs.mkdirSync(dir,{recursive:true});
  const file=path.join(dir,name+'.gia');fs.writeFileSync(file,built.bytes);
  // The importer has no result API; piece names let scene_import_assets confirm the save really received them.
  fs.writeFileSync(path.join(dir,name+'.json'),JSON.stringify({name,entityIds:built.entityIds,pieces:built.placed.map(p=>p.name)}));
  let installedTo=null;
  if(install){
    const folder=exportFolder();
    if(!folder)fail('EXPORT_FOLDER_NOT_FOUND','The official asset import folder (BeyondLocal/Beyond_Local_Export) does not exist. Open the editor’s 资产导入导出管理 once, or copy the file there yourself.',{file});
    installedTo=path.join(folder,name+'.gia');fs.copyFileSync(file,installedTo);
  }
  return {name,file,installedTo,count:built.count,entityIds:built.entityIds,monsterIds:built.monsterIds||undefined,warnings:built.warnings.length?built.warnings:undefined,bounds:built.bounds,
    next:installedTo?`Open the target save in the editor, then call scene_import_assets with packs ["${name}"]. Importing the same pack twice adds a second copy; use a scratch save while iterating.`:'Not installed. Copy the file into BeyondLocal/Beyond_Local_Export before importing.'};
}
export function startSceneImport({packs,overview=true},workspace){
  const folder=exportFolder();
  for(const pack of packs)if(!folder||!fs.existsSync(path.join(folder,pack+'.gia')))fail('PACK_NOT_INSTALLED','Build the pack with scene_build_blocks (install=true) first.',{pack});
  const expect={};
  for(const pack of packs){
    const manifest=path.join(workspace,'scenes',pack+'.json');
    if(fs.existsSync(manifest)){const names=JSON.parse(fs.readFileSync(manifest,'utf8')).pieces;expect[pack]=names.slice(0,2000);}
  }
  return launchRunner({action:'import_assets',packs,overview,expect},workspace,45,'Do not touch the mouse or keyboard. Call playtest_status with this runId in about 45 seconds; it returns the steps and an overview screenshot of the editor after the import.');
}
