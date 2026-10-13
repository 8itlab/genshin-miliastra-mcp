// Print the saved level paths and the patrol configuration of every prefab that has one.
import fs from 'node:fs';
import {inspectLevelPaths} from '../../src/scene/level-paths.mjs';
import {inspectCreaturePatrol} from '../../src/scene/creature-patrols.mjs';
const [file,...prefabs]=process.argv.slice(2);const bytes=fs.readFileSync(file);
const paths=inspectLevelPaths(bytes);
console.log(JSON.stringify(paths.paths.map(p=>({pathId:p.pathId,name:p.name,points:p.waypoints.map(w=>[w.waypointId,...w.position.map(n=>Math.round(n*100)/100)])}))));
for(const id of prefabs){try{const r=inspectCreaturePatrol(bytes,Number(id));console.log(id,JSON.stringify(r,(k,v)=>Buffer.isBuffer(v)||v?.type==='Buffer'?undefined:v).slice(0,1500));}catch(e){console.log(id,'ERR',e.message);}}
