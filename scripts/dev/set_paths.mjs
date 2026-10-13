// Move waypoints of paths that already exist in a save.
// Usage: node set_paths.mjs <source.gil> <output.gil> '{"<pathId>":{"<waypointId>":[x,y,z]}}'
import fs from 'node:fs';
import {inspectLevelPaths,prepareLevelPathPatch} from '../../src/scene/level-paths.mjs';
const [source,output,spec]=process.argv.slice(2);
let bytes=fs.readFileSync(source);
for(const [pathId,points] of Object.entries(JSON.parse(fs.readFileSync(spec,'utf8')))){
  const state=inspectLevelPaths(bytes),record=state.paths.find(p=>p.pathId===Number(pathId));
  const waypointEdits=record.waypoints.filter(w=>points[w.waypointId]).map(w=>({waypointId:w.waypointId,position:points[w.waypointId]}));
  bytes=prepareLevelPathPatch(bytes,{expectedSourceHash:state.sourceHash,pathId:Number(pathId),expectedRecordHash:record.recordHash,waypointEdits}).bytes;
}
fs.writeFileSync(output,bytes);
console.log(JSON.stringify(inspectLevelPaths(bytes).paths.map(p=>({pathId:p.pathId,points:p.waypoints.map(w=>[w.waypointId,...w.position.map(n=>Math.round(n*100)/100)])}))));
