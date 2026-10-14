// The check to run before a release to npm: is the package usable the way npx installs it? It packs this checkout,
// installs the archive into an empty folder (dependencies then sit beside the package, not inside it), starts the
// installed server as an MCP client would and compiles a graph through it.
// Usage (from the repository; needs the npm registry for the install):  node scripts/dev/pack_install_check.mjs
// What it holds the package to, each of which a first try on 2026-10-14 failed or would have:
//   - the tools are listed and the pictures of the catalogues come along (effect_catalog answers with images);
//   - a graph type-checks and builds (the compiler finds typescript and genshin-ts where npm put them);
//   - working files go to the home folder, not into the installed package, which npx wipes with its cache;
//   - "miliastra-mcp doctor" runs.
// The home folder is a temporary one for the run, so nothing is left on the machine but the temporary folder it names.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
const root=process.cwd(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-pack-')),inst=path.join(tmp,'inst'),home=path.join(tmp,'home');
const run=(cmd,cwd)=>{const r=spawnSync(cmd,{cwd,shell:true,encoding:'utf8'});assert.equal(r.status,0,cmd+'\n'+r.stdout+r.stderr);return r.stdout;};
fs.mkdirSync(inst);fs.mkdirSync(home);
const packed=JSON.parse(run('npm pack --json --pack-destination "'+tmp+'"',root))[0];
assert.ok(!packed.files.some(f=>/__pycache__|^workspace\/|^tests\//.test(f.path)),'caches, working files and tests stay out of the package');
fs.writeFileSync(path.join(inst,'package.json'),'{"name":"pack-install-check","private":true}');
run('npm install "'+path.join(tmp,packed.filename)+'" --no-audit --no-fund',inst);
const pkg=path.join(inst,'node_modules','miliastra-mcp'),fixtures=path.join(root,'tests','fixtures');
assert.ok(!fs.existsSync(path.join(pkg,'node_modules','typescript')),'the install this check is about has its dependencies beside the package');
const env={...process.env,HOME:home,USERPROFILE:home,MILIASTRA_STEP_TOOLS:'1',MILIASTRA_SAVE_ROOTS:JSON.stringify([fixtures])};
delete env.MILIASTRA_WORKSPACE;
const client=new Client({name:'pack-install-check',version:'0'});
await client.connect(new StdioClientTransport({command:process.execPath,args:[path.join(pkg,'src','server.mjs')],env}));
const call=async(name,args)=>{const r=await client.callTool({name,arguments:args});assert.ok(!r.isError,name+': '+JSON.stringify(r.content).slice(0,400));return r;};
const json=r=>JSON.parse(r.content.find(c=>c.type==='text').text);
const tools=(await client.listTools()).tools.length;assert.ok(tools>=80,'tools listed: '+tools);
assert.ok((await call('effect_catalog',{query:'烟花'})).content.some(c=>c.type==='image'),'the catalogue pictures are in the package');
const workspace=json(await call('get_capabilities',{})).workspace;
assert.ok(!workspace.split(path.sep).includes('node_modules')&&workspace.startsWith(fs.realpathSync(home)),'working folder outside the package: '+workspace);
await call('create_project',{projectId:'packcheck',mapPath:path.join(fixtures,'editor-2026-10-13-camera.gil')});
await call('update_logic',{projectId:'packcheck',code:"import { g } from 'genshin-ts/runtime/core'\ng.server({id:1073741825}).on('whenEntityIsCreated',(_evt,f)=>{f.printString('PACK_OK')})\n"});
assert.equal(json(await call('validate_project',{projectId:'packcheck'})).typecheckPassed,true,'a graph type-checks in the installed package');
assert.ok(fs.existsSync(json(await call('build_project',{projectId:'packcheck'})).giaPath),'and builds');
await client.close();
const doctor=spawnSync(process.execPath,[path.join(pkg,'src','server.mjs'),'doctor'],{env,encoding:'utf8'});
assert.ok(Array.isArray(JSON.parse(doctor.stdout).checks),'doctor reports');
console.log(`PASS: ${packed.filename}, ${(packed.size/1e6).toFixed(1)} MB, ${packed.files.length} files, ${tools} tools; installed and compiled in ${tmp}`);
