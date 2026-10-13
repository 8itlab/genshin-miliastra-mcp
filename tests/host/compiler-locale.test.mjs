import test from 'node:test';
import assert from 'node:assert/strict';
import {runNode,ROOT} from '../../src/core.mjs';
test('POSIX locale inherited by host does not break the pinned compiler diagnostic formatter',async()=>{
 const previous=process.env.LANG;
 try{
  process.env.LANG='C';
  const result=await runNode(['--input-type=module','-e',"import {detectLang} from './node_modules/genshin-ts/dist/src/i18n/index.js'; console.log(detectLang());"],ROOT);
  assert.equal(result.exitCode,0,result.output);assert.match(result.output,/en-US/);assert.equal(process.env.LANG,'C');
 }finally{if(previous===undefined)delete process.env.LANG;else process.env.LANG=previous;}
});
