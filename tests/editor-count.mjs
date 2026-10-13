// build_project reports the editor's size count next to the node count: a graph variable read or write counts 4, a loop
// over a list 20, everything else 1 (measured in the editor, see docs/PLATFORM_RULES.zh-CN.md). Offline: compiles a small
// graph against a synthetic map and checks the sum and the warning. No in-game claims.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {buildFile,encodeVarint} from 'genshin-ts/injector/binary';
import {loadGiaProto} from 'genshin-ts/injector/proto';
import {Service} from '../src/core.mjs';
import {EDITOR_NODE_WEIGHTS} from '../src/adapter.mjs';
const field=(id,b)=>Buffer.concat([Buffer.from(encodeVarint(id*8+2)),Buffer.from(encodeVarint(b.length)),b]);
const {nodeGraphMessage}=loadGiaProto();
const graph=Buffer.from(nodeGraphMessage.encode({id:{class:10000,type:20000,kind:21001,id:1073741825},name:'_GSTS_Count'}).finish());
const bytes=buildFile(field(10,field(1,field(1,graph))),{schema:1,headTag:0x326,fileType:2,tailTag:0x679});
const root=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-count-')),mapDir=path.join(root,'saves','1','Beyond_Local_Save_Level');
fs.mkdirSync(mapDir,{recursive:true});const mapPath=path.join(mapDir,'1073741825.gil');fs.writeFileSync(mapPath,bytes);
const service=new Service({workspace:path.join(root,'workspace'),saveRoots:[path.join(root,'saves')]});
const source=body=>`/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
g.server({id:1073741825,name:'_GSTS_Count',variables:{tick:0n,sum:0}})
.on('whenEntityIsCreated',(evt,f)=>{
  ${body}
})
`;
const build=async(id,body)=>{service.createProject({projectId:id,mapPath,targetGraphId:1073741825});service.updateLogic({projectId:id,code:source(body)});return service.buildProject({projectId:id});};
// Two reads and one write of graph variables, one loop over a list, and a local that costs nothing extra.
const small=await build('count-small',"const now=f.get('tick');let total=f.get('sum');for(const one of [1n,2n,3n]){total=total+Number(one);}f.set('sum',total);f.printString('done');if(now>3n)f.printString('late');");
const sized=small.graph.editorCount;
assert.deepEqual([sized.variableReads,sized.variableWrites,sized.listLoops],[2,1,1]);
assert.equal(sized.total,small.graph.nodeCount+3*(EDITOR_NODE_WEIGHTS[323]-1)+(EDITOR_NODE_WEIGHTS[509]-1));
assert.equal(small.limits.editorCount,sized.total);assert.equal(small.limits.nodeCount,small.graph.nodeCount);
assert.deepEqual(small.warnings,[]);
// A counting loop is 15.
const counted=await build('count-finite',"f.finiteLoop(0n,5n,(n)=>{f.printString('round');});");
assert.equal(counted.graph.editorCount.countingLoops,1);assert.equal(counted.limits.editorCount,counted.graph.nodeCount+14);
// Under 3000 nodes but over by the editor's count: the build still succeeds and says what the editor will say.
const big=await build('count-big',Array.from({length:380},(_,i)=>`f.set('tick',f.get('tick')+${i+1}n);`).join(''));
assert.ok(big.graph.nodeCount<3000&&big.limits.editorCount>3000,JSON.stringify(big.limits));
assert.equal(big.limits.editorCount,big.graph.nodeCount+3*760);
assert.match(big.warnings[0],/服务器内存消耗过高/);assert.match(big.warnings[0],/380 graph variable reads and 380 writes/);
// The same count is on every graph that inspect_map lists.
assert.equal(service.inspectMap({mapPath}).graphs[0].editorCount,0);
fs.rmSync(root,{recursive:true,force:true});
console.log(JSON.stringify({ok:true,small:{nodes:small.graph.nodeCount,editorCount:sized.total},big:{nodes:big.graph.nodeCount,editorCount:big.limits.editorCount}}));
