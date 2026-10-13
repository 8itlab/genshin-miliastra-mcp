// Builds the save that is opened in the editor for hand configuration: one of each thing whose fields are to be read
// back after toggling them by hand. node scripts/dev/handcfg_build.mjs <base.gil> <out dir>
import fs from 'node:fs';import path from 'node:path';
import {addGraph,addSkill,addUnitStatus,addPrefab,addComponents,addRespawnPoint,setPlayerCount,setClass} from '../../src/scene-save.mjs';
const [base,out]=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
let at=base;const step=(r)=>{at=r.mapPath;return r;};
const key=step(addGraph({mapPath:at,name:'HC_key',kind:'characterSkill'},out));
const normal=step(addSkill({mapPath:at,name:'HC_normal',graphId:key.graphId,type:'normal',animation:1001},out));
const instant=step(addSkill({mapPath:at,name:'HC_instant',graphId:key.graphId},out));
const status=step(addUnitStatus({mapPath:at,name:'HC_status',maxHealth:100},out));
const pad=step(addPrefab({mapPath:at,asset:20001125,name:'HC_pad',scale:1},out));
step(addComponents({mapPath:at,prefab:'HC_pad',launcher:{areas:[{radius:1.5,offset:[0,0.5,0]}],speed:7},abilityUnits:[{name:'HC_hit',attack:{coefficient:1,added:10}}]},out));
step(addRespawnPoint({mapPath:at,position:[0,0.4,0]},out));
step(setPlayerCount({mapPath:at,max:1},out));
step(setClass({mapPath:at,health:300},out));
const final=path.join(out,'handcfg.gil');fs.copyFileSync(at,final);
console.log(JSON.stringify({final,skills:[normal.skillId,instant.skillId],status:status.statusId??status,pad:pad.prefabId}));
