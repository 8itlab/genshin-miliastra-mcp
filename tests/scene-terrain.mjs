// Offline check of scene_get_terrain and scene_set_terrain against two saves the editor wrote on 2026-11-18
// (tests/fixtures/editor-2026-11-18-terrain-*.gil): a new map, and the same map with three cells painted by hand —
// water at cell [108, 112], sand two layers high with the slope 17 at [110, 108], a path at [110, 111]. The tool, given
// the same three cells, must write the terrain section of the hand-painted save byte for byte; reading a save and
// writing it back must not change a byte, also when every cell is encoded afresh.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {container,fields,one} from '../src/scene/wire.mjs';
import {getTerrain,setTerrain,encodeTerrain} from '../src/scene-save.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-terrain-'));
const base=path.join(root,'tests','fixtures','editor-2026-11-18-terrain-base.gil'),hand=path.join(root,'tests','fixtures','editor-2026-11-18-terrain-sample.gil');
const section=file=>one(container(fs.readFileSync(file)),7);
const code=async p=>{try{await p();}catch(e){return e.code;}assert.fail('expected a failure');};
try{
  // A new map: one terrain, 20 × 20 cells, all plain.
  const fresh=getTerrain({mapPath:base}).terrain;
  assert.equal(fresh.name,'地形01');assert.deepEqual(fresh.origin,[-547.5,-2.5,-547.5]);
  assert.deepEqual(fresh.grid,{x:[100,119],z:[100,119]});assert.equal(fresh.cellCount,400);assert.equal(fresh.cells.length,0);
  assert.deepEqual(fresh.worldExtent,{x:[-50,50],z:[-50,50]});

  // The hand-painted cells, read back.
  const painted=getTerrain({mapPath:hand}).terrain.cells;
  assert.deepEqual(painted,[
    {cell:[108,112],centre:[-7.5,12.5],top:-2.5,layers:0,water:1},
    {cell:[110,108],centre:[2.5,-7.5],top:2.5,layers:2,material:'sand',slope:17},
    {cell:[110,111],centre:[2.5,7.5],top:0,layers:1,path:true}]);

  // The same cells through the tool, by index and by world position: the terrain section equals the editor's.
  const made=setTerrain({mapPath:base,outputName:'t_terrain',cells:[
    {cell:[108,112],layers:0,water:1},{at:[2.5,-7.5],layers:2,material:'sand',slope:17},{cell:[110,111],path:true}]},workspace);
  assert.equal(made.cellsSet,3);
  assert.deepEqual(section(made.mapPath),section(hand),'terrain section byte for byte');
  // Nothing else in the save moved.
  const others=file=>fields(container(fs.readFileSync(file))).filter(f=>f.id!==7).map(f=>f.raw.toString('hex'));
  assert.deepEqual(others(made.mapPath),others(base));

  // Every cell encoded afresh from what was read gives the same bytes; so does a reset of the painted cells to plain.
  for(const file of [base,hand]){
    const entry=fields(section(file)).find(f=>f.id===1).data,t={parts:fields(entry),cells:new Map()};
    for(const f of t.parts)if(f.id===4){const c={extra:[],changed:true};for(const x of fields(f.data))c[x.id]=Number(x.value);t.cells.set(c[1],c);}
    assert.deepEqual(encodeTerrain(t),entry,'fresh encoding of '+path.basename(file));
  }
  const reset=setTerrain({mapPath:hand,outputName:'t_terrain_reset',cells:[{cell:[108,108],to:[110,112],reset:true}]},workspace);
  assert.equal(reset.cellsSet,15);assert.deepEqual(section(reset.mapPath),section(base),'reset to plain');

  // A rectangle, a merge that keeps what it does not name, and the limits.
  const area=setTerrain({mapPath:hand,outputName:'t_terrain_area',cells:[{at:[-50,-50],toAt:[-41,-41],layers:3,material:'stoneWall'},{cell:[110,108],layers:4}]},workspace);
  const cells=area.terrain.cells;
  assert.equal(cells.filter(c=>c.layers===3&&c.material==='stoneWall').length,4);
  assert.deepEqual(cells.find(c=>c.cell[0]===110&&c.cell[1]===108),{cell:[110,108],centre:[2.5,-7.5],top:7.5,layers:4,material:'sand',slope:17});
  assert.equal(await code(()=>setTerrain({mapPath:base,cells:[{cell:[120,100],layers:2}]},workspace)),'CELL_OUTSIDE_TERRAIN');
  assert.equal(await code(()=>setTerrain({mapPath:base,cells:[{cell:[100,100]}]},workspace)),'NOTHING_TO_CHANGE');
  assert.equal(await code(()=>setTerrain({mapPath:base,cells:[{cell:[100,100],at:[0,0],layers:2}]},workspace)),'INVALID_CELL');
  assert.equal(await code(()=>getTerrain({mapPath:base,terrain:'地形02'})),'TERRAIN_NOT_FOUND');
  console.log('scene terrain OK');
}finally{fs.rmSync(workspace,{recursive:true,force:true});}
