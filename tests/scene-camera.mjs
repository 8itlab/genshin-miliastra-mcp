// Offline check of scene_list_cameras / scene_set_camera on a minimal synthetic save: only the chosen numbers change,
// the copy is written to the workspace and the source file is left alone.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {field} from '../src/scene/wire.mjs';
import {listCameras,setCamera} from '../src/scene-save.mjs';

const f32=n=>{const b=Buffer.alloc(4);b.writeFloatLE(n);return b;};
const settings=Buffer.concat([field(1,2,Buffer.from('侧视镜头')),field(2,5,f32(6)),field(3,5,f32(45)),field(5,5,f32(1)),field(6,5,f32(6)),field(15,5,f32(-180)),field(16,5,f32(180)),field(17,5,f32(-89)),field(18,5,f32(89)),field(37,0,1)]);
const payload=Buffer.concat([field(3,2,Buffer.from('other section')),field(18,2,field(1,2,Buffer.concat([field(1,0,1073741825),field(2,2,settings)])))]);
const header=Buffer.alloc(20);header.writeUInt32BE(payload.length+20,0);header.writeUInt32BE(1,4);header.writeUInt32BE(0x326,8);header.writeUInt32BE(3,12);header.writeUInt32BE(payload.length,16);
const tail=Buffer.alloc(4);tail.writeUInt32BE(0x679);
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-camera-')),source=path.join(dir,'source.gil'),bytes=Buffer.concat([header,payload,tail]);
fs.writeFileSync(source,bytes);
try{
 assert.deepEqual(listCameras({mapPath:source}).cameras,[{cameraId:1073741825,name:'侧视镜头',distance:6,fieldOfView:45,yawRange:[-180,180],pitchRange:[-89,89]}]);
 const out=setCamera({mapPath:source,distance:14,outputName:'wide'},dir);
 assert.deepEqual(out.cameras,[{cameraId:1073741825,name:'侧视镜头',distance:14,fieldOfView:45,yawRange:[-180,180],pitchRange:[-89,89]}]);
 assert.deepEqual(out.before,{distance:6,fieldOfView:45,yawRange:[-180,180],pitchRange:[-89,89]});
 assert.notEqual(path.resolve(out.mapPath),path.resolve(source));
 assert.ok(fs.readFileSync(source).equals(bytes),'the source save must not change');
 const written=fs.readFileSync(out.mapPath);
 assert.equal(written.length,bytes.length,'same-size numbers: nothing else may move');
 assert.ok(written.includes(Buffer.from('other section')));
 assert.deepEqual(setCamera({mapPath:out.mapPath,name:'侧视镜头',fieldOfView:30,outputName:'narrow'},dir).cameras[0],{cameraId:1073741825,name:'侧视镜头',distance:14,fieldOfView:30,yawRange:[-180,180],pitchRange:[-89,89]});
 const locked=setCamera({mapPath:source,yawRange:[0,0],pitchRange:[10,20],outputName:'locked'},dir).cameras[0];
 assert.deepEqual([locked.yawRange,locked.pitchRange,locked.distance],[[0,0],[10,20],6]);
 assert.throws(()=>setCamera({mapPath:source,yawRange:[10,0]},dir),{code:'INVALID_RANGE'});
 assert.throws(()=>setCamera({mapPath:source,name:'没有这个',distance:10},dir),{code:'CAMERA_NOT_FOUND'});
 assert.throws(()=>setCamera({mapPath:source},dir),{code:'NOTHING_TO_CHANGE'});
}finally{fs.rmSync(dir,{recursive:true,force:true});}
// The view locked (2.5D镜头): from the template of a save as the editor made it, the tool writes the template the editor
// wrote when that mode was chosen by hand with a horizontal angle of 30 and a pitch of 45 (2026-10-13). The editor left
// the nearest zoom at 10 m; the tool holds the zoom at the distance, so that one field is set aside in the comparison.
{
  const {container,fields}=await import('../src/scene/wire.mjs');
  const here=path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1')),fixtures=path.join(here,'fixtures'),work=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-camera-fixed-'));
  try{
    const settingsOf=file=>{const s=fields(container(fs.readFileSync(file))).find(f=>f.id===18).data,rec=fields(s).find(f=>f.id===1).data;return fields(fields(rec).find(f=>f.id===2&&f.wire===2).data);};
    const made=setCamera({mapPath:path.join(fixtures,'editor-2026-10-13-camera.gil'),distance:15,fixedView:{yaw:30,pitch:45}},work);
    const mine=settingsOf(made.mapPath),theirs=settingsOf(path.join(fixtures,'editor-2026-10-13-camera-fixed.gil'));
    const shown=list=>list.filter(f=>f.id!==5).map(f=>f.id+':'+f.raw.toString('hex'));
    assert.deepEqual(shown(mine),shown(theirs),'the fixed view is not written as the editor wrote it');
    assert.equal(mine.find(f=>f.id===5).data.readFloatLE(0),15,'the zoom is held at the distance');
    assert.deepEqual(made.cameras[0].fixedView,{yaw:30,pitch:45,ignoreCollision:true});
    // Straight ahead (yaw 0) leaves the angle out, as the editor does; a camera that should stop at walls says so.
    const plain=settingsOf(setCamera({mapPath:path.join(fixtures,'editor-2026-10-13-camera.gil'),fixedView:{pitch:55,ignoreCollision:false}},work).mapPath);
    assert.ok(!plain.some(f=>f.id===20)&&!plain.some(f=>f.id===19)&&plain.some(f=>f.id===12&&Number(f.value)===2));
    assert.throws(()=>setCamera({mapPath:path.join(fixtures,'editor-2026-10-13-camera.gil'),fixedView:{yaw:0,pitch:45},yawRange:[-10,10]},work),e=>e.code==='INVALID_RANGE');
    assert.equal(listCameras({mapPath:path.join(fixtures,'editor-2026-10-13-camera.gil')}).cameras[0].fixedView,undefined);
  }finally{fs.rmSync(work,{recursive:true,force:true});}
}
console.log(JSON.stringify({ok:true}));
