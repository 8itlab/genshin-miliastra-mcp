// search_node_docs through a real MCP connection: an AI that only has this server must be able to find out
// what a server graph can call, listen to and pass as enumeration values.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),workspace=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-docs-'));
const client=new Client({name:'node-docs-test',version:'1'});
await client.connect(new StdioClientTransport({command:process.execPath,args:[path.join(root,'src/server.mjs')],cwd:root,env:{...process.env,MILIASTRA_WORKSPACE:workspace},stderr:'pipe'}));
const search=async args=>{const r=await client.callTool({name:'search_node_docs',arguments:args});assert.ok(!r.isError);return r.structuredContent??JSON.parse(r.content.at(-1).text);};
try{
 const all=await search({query:'*'});
 for(const name of ['createPrefab','removeEntity','hpLoss','printString'])assert.ok(all.nodes.includes(name),name);
 assert.ok(all.events.includes('whenTimerIsTriggered'));
 assert.ok(all.enums.includes('DamagePopUpType'));
 assert.ok(!all.nodes.some(n=>n.startsWith('_')),'compiler internals must not be listed');
 const effects=await search({query:'特效',limit:10});
 assert.ok(effects.results.some(r=>r.name==='playTimedEffects'&&r.kind==='node'));
 const prefab=(await search({query:'createPrefab',limit:1})).results[0];
 assert.equal(prefab.name,'createPrefab');
 assert.match(prefab.signature,/prefabId: PrefabIdValue/);
 assert.ok(prefab.params.some(p=>p.name==='location'&&/位置/.test(p.zh)));
 const timer=(await search({query:'when timer',limit:1})).results[0];
 assert.equal(timer.kind,'event');
 assert.ok(timer.params.some(p=>p.name==='evt.timerName'));
 const popup=(await search({query:'DamagePopUpType',limit:1})).results[0];
 assert.equal(popup.kind,'enum');
 assert.match(popup.signature,/DamagePopUpType\.NormalPopUp/);
 const alias=(await search({query:'FixedPointMotionDeviceMotionType',limit:1})).results[0];
 assert.match(alias.summary,/MovementMode/);
 const loose=await search({query:'list element index',limit:10});
 assert.ok(loose.results.length&&loose.results.every(r=>r.kind&&r.name),'several words that no entry has together still give structured entries');
 assert.match(loose.note,/No entry has all 3 words/);
 const none=await search({query:'zzqqxx'});
 assert.equal(none.results.length,0);assert.match(none.note,/Nothing matches/);
 assert.ok((await search({query:'printString',limit:2,scope:'raw'})).results[0].file,'raw scope keeps the file and line form');
}finally{await client.close();fs.rmSync(workspace,{recursive:true,force:true});}
console.log(JSON.stringify({ok:true}));
