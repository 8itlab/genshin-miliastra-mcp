import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import {randomUUID} from 'node:crypto';
import {Service,ROOT} from '../../src/core.mjs';

test('map discovery finds flat and CN 7.1 numbered saves, excludes backups, temp and unrelated children',()=>{
  const root=path.join(ROOT,'workspace/test-runs/discovery-'+randomUUID());
  const saves=path.join(root,'saves/123/Beyond_Local_Save_Level');
  const write=(relative)=>{const p=path.join(saves,relative);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,'discovery fixture only');};
  write('1073741825.gil');write('1073741847/1073741847.gil');
  write('1073741847/other.gil');write('1073741848/mismatched.gil');write('UpgradeBackup/1073741847.gil');write('arbitrary/other.gil');
  const temp=path.join(root,'saves/123/Temp');fs.mkdirSync(temp,{recursive:true});fs.writeFileSync(path.join(temp,'1073741849.gil'),'temporary');
  const service=new Service({workspace:path.join(root,'workspace'),saveRoots:[path.join(root,'saves')]});
  const maps=service.listMaps().maps;
  assert.deepEqual(maps.map(m=>m.mapId).sort(),['1073741825','1073741847']);
  assert.equal(maps.find(m=>m.mapId==='1073741847').path,path.join(saves,'1073741847/1073741847.gil'));
});
