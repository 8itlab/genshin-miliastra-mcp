// Moves the two scout patrol paths to the 0.6x layout: spawn 39 -> wall 33 -> crown 5.4.
// Usage: node scale_paths.mjs <source.gil> <output.gil>
import fs from 'node:fs';
import {inspectLevelPaths,prepareLevelPathPatch} from '../../src/scene/level-paths.mjs';
const [source,output]=process.argv.slice(2);
const targets={1073741825:{2:39,3:33},1073741826:{2:33,3:5.4}};
let bytes=fs.readFileSync(source);
for(const [pathId,points] of Object.entries(targets)){
  const state=inspectLevelPaths(bytes),record=state.paths.find(p=>p.pathId===Number(pathId));
  const waypointEdits=record.waypoints.map(w=>({waypointId:w.waypointId,position:[points[w.waypointId],w.position[1],w.position[2]]}));
  bytes=prepareLevelPathPatch(bytes,{expectedSourceHash:state.sourceHash,pathId:Number(pathId),expectedRecordHash:record.recordHash,waypointEdits}).bytes;
}
fs.writeFileSync(output,bytes,{flag:'wx'});
console.log(JSON.stringify(inspectLevelPaths(bytes).paths.map(p=>({pathId:p.pathId,points:p.waypoints.map(w=>w.position.map(n=>Math.round(n*100)/100))}))));
