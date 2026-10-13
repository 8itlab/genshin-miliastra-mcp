import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {field,wrap,one,container} from '../../src/scene/wire.mjs';
import {inspectPrefabs,extractPrefabAsset} from '../../src/scene/prefabs.mjs';
import {inspectBytes} from '../../src/adapter.mjs';
const entry=(id,base,name)=>Buffer.concat([field(1,0,id),field(2,0,base),field(6,2,Buffer.concat([field(1,0,1),field(11,2,field(1,2,Buffer.from(name)))])),field(7,2,field(1,0,3))]);
const payload=entries=>field(4,2,Buffer.concat(entries.map(e=>field(1,2,e))));
test('prefab catalog distinguishes saved ID from base model and excludes player/profession',()=>{
 const values=inspectPrefabs(payload([entry(1086324737,1000000,'player'),entry(1090519041,1000001,'profession'),entry(1073742000,20001220,'工人原型')]));
 assert.equal(values.length,1);assert.equal(values[0].gameId,'1073742000');assert.equal(values[0].baseTemplateId,20001220);assert.equal(values[0].name,'工人原型');assert.equal(values[0].spawnability,'not_verified');assert.deepEqual(values[0].componentTypeCodes,[3]);
});
test('duplicate template IDs remain visible and unknown bytes affect fingerprints',()=>{
 const first=entry(1073742000,20001220,'unit'),extra=Buffer.concat([first,field(990,0,123)]);
 const values=inspectPrefabs(payload([first,extra]));assert.equal(values.length,2);assert.ok(values.every(v=>v.duplicateIdentity));assert.notEqual(values[0].rawEntryHash,values[1].rawEntryHash);
});
test('official kingdom baseline contains no user prefabs; battle configurations are preserved',()=>{
 const info=inspectBytes(fs.readFileSync(new URL('../../workspace/construction/build-043/after-integer-import.gil',import.meta.url)));
 assert.deepEqual(info.prefabTemplates,[]);assert.ok(info.battleConfigurations.some(c=>c.resourceType==='profession'));
});
test('prefab extraction preserves opaque bytes and rejects duplicate or battle templates',()=>{
 const seed=fs.readFileSync(new URL('../../workspace/fixtures/local/platform-01/platform.gia',import.meta.url));
 const raw=Buffer.concat([entry(1073742000,20001220,'unit'),field(999,0,123)]);
 const gil=wrap(seed,payload([raw]));
 const result=extractPrefabAsset(gil,seed,1073742000);
 assert.deepEqual(one(one(one(container(result.bytes),1),11),1),raw);
 assert.throws(()=>extractPrefabAsset(wrap(seed,payload([raw,raw])),seed,1073742000),/exactly one/);
 assert.throws(()=>extractPrefabAsset(wrap(seed,payload([entry(1090519041,1000001,'profession')])),seed,1090519041),/not supported/);
});
