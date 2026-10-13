import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ROOT } from '../src/core.mjs';
import { sha } from '../src/adapter.mjs';
process.env.MILIASTRA_STEP_TOOLS='1'; // this script takes the steps of writing a graph one by one (create_project ... apply_build)

process.env.MILIASTRA_WORKSPACE ||= path.join(ROOT,'workspace','test-runs','protocol-'+Date.now());
const client=new Client({name:'miliastra-ai-protocol-test',version:'0.1.0'});
const transport=new StdioClientTransport({command:process.execPath,args:[path.join(ROOT,'src','server.mjs')],cwd:ROOT,stderr:'pipe',env:Object.fromEntries(Object.entries(process.env).filter(([,v])=>typeof v==='string'))});
const transcript=[];
async function call(name,args={},expectedError) {
  const start=Date.now();
  const result=await client.callTool({name,arguments:args},undefined,{timeout:180000});
  const data=result.structuredContent||JSON.parse(result.content[0].text);
  transcript.push({tool:name,arguments:args,result:data,isError:!!result.isError,elapsedMs:Date.now()-start});
  console.log(name, result.isError?'ERROR '+data.error.code:'OK');
  if(expectedError)assert.equal(data.error?.code,expectedError);else assert.ok(!result.isError,JSON.stringify(data));
  return data;
}
try {
  await client.connect(transport);
  const tools=await client.listTools();
  const legacyNames=['get_capabilities','list_maps','inspect_map','create_project','get_project','update_logic','search_node_docs','validate_project','build_project','preview_changes','apply_build','restore_backup','get_test_results','list_editor_windows','capture_editor_window','focus_editor_window','editor_input'];
  for(const name of legacyNames) assert.ok(tools.tools.some(t=>t.name===name),`Missing legacy tool ${name}`);
  const resources=await client.listResources();for(const uri of ['miliastra://workflow','miliastra://platform-rules'])assert.ok(resources.resources.some(r=>r.uri===uri),`Missing resource ${uri}`);
  await client.readResource({uri:'miliastra://workflow'});
  await call('get_capabilities');
  const {maps}=await call('list_maps');assert.ok(maps.length,'No saved editor maps found');
  assert.ok(process.env.MILIASTRA_TEST_MAP,'Select a fixed fixture with MILIASTRA_TEST_MAP; newest-map fallback is disabled.');
  const selected=fs.realpathSync(process.env.MILIASTRA_TEST_MAP);
  const map=maps.find(m=>fs.realpathSync(m.path)===selected);
  assert.ok(map,'Selected fixture is not inside configured save roots.');
  const originalHash=sha(fs.readFileSync(map.path));
  assert.equal(originalHash,process.env.MILIASTRA_TEST_SHA256,'Fixture changed; register its provenance again before testing.');
  const info=await call('inspect_map',{mapPath:map.path});
  const projectId='protocol-'+Date.now();
  await call('create_project',{projectId,mapPath:map.path});
  await call('get_project',{projectId});
  await call('search_node_docs',{query:'printString',limit:2});
  await call('update_logic',{projectId,code:"import { g } from 'genshin-ts/runtime/core'\ng.server({id:1073741825}).on('whenEntityIsCreated', (_evt,f)=>{ f.printString(123) })"});
  const invalid=await call('validate_project',{projectId});assert.equal(invalid.typecheckPassed,false);
  await call('build_project',{projectId},'TYPECHECK_FAILED');
  const graphId=info.graphs.find(g=>g.writable&&g.type===20000)?.id??1073741825;
  const validCode=`import { g } from 'genshin-ts/runtime/core'\ng.server({ id: ${graphId}, name: '_GSTS_MCP_Test' }).on('whenEntityIsCreated', (_evt, f) => {\n  f.printString('MILIASTRA_MCP_OK')\n})\n`;
  await call('update_logic',{projectId,code:validCode});
  const valid=await call('validate_project',{projectId});assert.equal(valid.typecheckPassed,true);
  const build=await call('build_project',{projectId});assert.ok(build.graph.nodeCount>=2);
  if(info.graphs.some(g=>g.id===graphId)) {
    const preview=await call('preview_changes',{projectId,buildId:build.buildId});
    await call('apply_build',{projectId,buildId:build.buildId,expectedSha256:'0'.repeat(64)},'MAP_CHANGED');
    const applied=await call('apply_build',{projectId,buildId:build.buildId,expectedSha256:preview.expectedSha256});
    const restored=await call('restore_backup',{projectId,backupId:applied.backupId,expectedSha256:applied.afterSha256});
    assert.equal(restored.sha256,originalHash);
  } else await call('preview_changes',{projectId,buildId:build.buildId},'MISSING_GRAPH');
  await call('preview_changes',{projectId,buildId:build.buildId,destination:'live'},'LIVE_WRITE_DISABLED');
  const results=await call('get_test_results',{projectId});assert.equal(results.gameplay.status,'not_run');
  await call('update_logic',{projectId,code:"// edited after build\n"});
  await call('preview_changes',{projectId,buildId:build.buildId},'STALE_BUILD');
  await call('update_logic',{projectId,code:validCode});
  assert.equal(sha(fs.readFileSync(map.path)),originalHash,'Original map must remain unchanged');
  fs.mkdirSync(path.join(ROOT,'workspace'),{recursive:true});
  fs.writeFileSync(path.join(ROOT,'workspace',process.env.MILIASTRA_SYNTHETIC==='1'?'synthetic-smoke-report.json':'mcp-smoke-report.json'),JSON.stringify({passed:true,capturedAt:new Date().toISOString(),transport:'MCP stdio',fixture:process.env.MILIASTRA_SYNTHETIC==='1'?'synthetic GIL, not an editor-validated map':'snapshot of local editor save',fixtureSha256:originalHash,workspace:process.env.MILIASTRA_WORKSPACE,toolContracts:tools.tools.filter(t=>legacyNames.includes(t.name)),projectId,originalUnchanged:true,gameplay:'not_run',transcript},null,2));
  console.log('PASS: real MCP handshake, tools/resources, error-repair-build loop, guards; original map unchanged.');
} finally {await client.close();}
