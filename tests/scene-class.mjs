// Offline check of scene_list_classes / scene_set_class on official sample saves: the switches and the camera of a class
// are read as the editor saved them, a change rewrites only that class's basic block, and setting everything back gives
// the original bytes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {listClasses,setClass,listCameras} from '../src/scene-save.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dir=path.join(root,'knowledge','samples','gil'),workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-class-'));
const pick=prefix=>path.join(dir,fs.readdirSync(dir).find(f=>f.startsWith(prefix)));
try{
  const plain=pick('mhumsn9uap96_'),before=fs.readFileSync(plain),cameraSample=pick('mhi2dr0pe60g_');
  const classes=listClasses({mapPath:plain}).classes;
  assert.deepEqual(classes.map(c=>c.name),['职业A','职业B']);
  assert.deepEqual({...classes[0],classId:0},{classId:0,name:'职业A',cameraTemplateId:1073741830,layoutId:1073741825,allowJump:true,allowSprint:true,allowClimb:true,allowGlide:true,level:5,maxLevel:200,health:10000,attack:500,defence:500,stamina:null});
  // A class names one of the save's camera templates, by the id scene_list_cameras gives.
  const cameras=listCameras({mapPath:cameraSample}).cameras.map(c=>c.cameraId),used=listClasses({mapPath:cameraSample}).classes.map(c=>c.cameraTemplateId);
  assert.ok(used.every(id=>cameras.includes(id)),'a class names a camera template that scene_list_cameras lists: '+JSON.stringify({cameras,used}));
  const walker=setClass({mapPath:plain,name:'职业A',allowJump:false,allowGlide:false},workspace);
  assert.deepEqual([walker.after.allowJump,walker.after.allowSprint,walker.after.allowClimb,walker.after.allowGlide],[false,true,true,false]);
  assert.equal(walker.after.cameraTemplateId,1073741830);
  assert.deepEqual(listClasses({mapPath:walker.mapPath}).classes[1],classes[1],'the other class is untouched');
  const restored=setClass({mapPath:walker.mapPath,name:'职业A',allowJump:true,allowGlide:true},workspace);
  assert.ok(fs.readFileSync(restored.mapPath).equals(before),'switching back gives the original save');
  const other=cameras.find(id=>id!==used[0]),viewed=setClass({mapPath:cameraSample,name:'职业B',cameraTemplateId:other},workspace);
  assert.equal(viewed.after.cameraTemplateId,other);assert.equal(listClasses({mapPath:viewed.mapPath}).classes[0].cameraTemplateId,used[0]);
  assert.throws(()=>setClass({mapPath:plain,name:'职业A',cameraTemplateId:5},workspace),e=>e.code==='CAMERA_NOT_FOUND');
  assert.throws(()=>setClass({mapPath:plain,name:'nobody',allowJump:false},workspace),e=>e.code==='CLASS_NOT_FOUND');
  // Level and combat attributes: 职业A given the level and the health of 职业B has, in those two blocks, what 职业B has
  // (but for the growth curve, which belongs to each class).
  assert.deepEqual([classes[1].level,classes[1].health],[10,1]);
  const frail=setClass({mapPath:plain,name:'职业A',level:10,health:1},workspace),now=listClasses({mapPath:frail.mapPath}).classes;
  assert.deepEqual([now[0].level,now[0].health,now[0].attack,now[0].defence,now[0].allowJump],[10,1,500,500,true]);
  assert.deepEqual(now[1],classes[1],'the other class is untouched');
  const back=setClass({mapPath:frail.mapPath,name:'职业A',level:5,health:10000},workspace);
  assert.ok(fs.readFileSync(back.mapPath).equals(before),'setting the numbers back gives the original save');
  const tough=setClass({mapPath:plain,name:'职业A',health:300,attack:40,defence:0,stamina:120},workspace).after;
  assert.deepEqual([tough.health,tough.attack,tough.defence,tough.stamina],[300,40,0,120]);
  assert.throws(()=>setClass({mapPath:plain,name:'职业A',level:500},workspace),e=>e.code==='INVALID_LEVEL');
  assert.throws(()=>setClass({mapPath:plain,allowJump:false},workspace),e=>e.code==='CLASS_NOT_FOUND','several classes and no name');
  assert.throws(()=>setClass({mapPath:plain,name:'职业A'},workspace),e=>e.code==='NOTHING_TO_SET');
  assert.ok(fs.readFileSync(plain).equals(before),'the source save was changed');
  console.log(JSON.stringify({ok:true,cameras,used}));
}finally{fs.rmSync(workspace,{recursive:true,force:true});}
