import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {ROOT} from '../../src/core.mjs';

test('Windows doctor rejects missing core Python but accepts a Python environment without optional Pillow',{skip:process.platform!=='win32'},()=>{
  const run=python=>{
    const result=spawnSync(process.execPath,[path.join(ROOT,'scripts/doctor.mjs')],{cwd:ROOT,env:{...process.env,MILIASTRA_PYTHON:python},encoding:'utf8',windowsHide:true,timeout:30000});
    return {exit:result.status,report:JSON.parse(result.stdout)};
  };
  const dir=path.join(ROOT,'workspace/test-runs/doctor-'+randomUUID());fs.mkdirSync(dir,{recursive:true});
  const missing=run(path.join(dir,'missing-python.exe'));
  assert.equal(missing.exit,1);assert.equal(missing.report.passed,false);
  assert.equal(missing.report.checks.find(c=>c.id==='core-python').status,'failed');
  const venv=path.join(dir,'venv');
  const created=spawnSync(process.env.MILIASTRA_PYTHON||'python',['-m','venv','--without-pip',venv],{encoding:'utf8',windowsHide:true,timeout:30000});
  assert.equal(created.status,0,created.stderr);
  const bare=run(path.join(venv,'Scripts/python.exe'));
  assert.equal(bare.exit,0);assert.equal(bare.report.passed,true);
  assert.equal(bare.report.checks.find(c=>c.id==='core-python').status,'passed');
  assert.equal(bare.report.checks.find(c=>c.id==='capture-pillow').status,'optional-unavailable');
});
