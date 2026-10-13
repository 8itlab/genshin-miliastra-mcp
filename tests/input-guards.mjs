// No real input: tests protocol validation and capture capability consumption.
import assert from 'node:assert/strict';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {ROOT} from '../src/core.mjs';
const client=new Client({name:'input-guard-test',version:'0.1.0'});
try {
  const transport=new StdioClientTransport({command:process.execPath,args:[path.join(ROOT,'src','server.mjs')],cwd:ROOT,env:{...process.env,MILIASTRA_WORKSPACE:process.env.MILIASTRA_WORKSPACE??path.join(ROOT,'workspace','test-runs','input-guards-'+randomUUID())},stderr:'pipe'});
  transport.stderr.on('data',b=>process.stderr.write(b));
  await client.connect(transport);
  const stale=await client.callTool({name:'editor_input',arguments:{captureId:randomUUID(),kind:'key',key:'Enter'}});
  assert.equal(stale.structuredContent.error.code,'STALE_CAPTURE');
  const missing=await client.callTool({name:'editor_input',arguments:{captureId:randomUUID(),kind:'key'}});
  assert.equal(missing.structuredContent.error.code,'INVALID_INPUT');
  const newline=await client.callTool({name:'editor_input',arguments:{captureId:randomUUID(),kind:'text',text:'x\n'}});
  assert.equal(newline.structuredContent.error.code,'INVALID_INPUT');
  if(process.argv.includes('--offline')) {
    console.log('PASS: offline protocol guards. Screenshot bounds and consumed-capture guards NOT RUN (require an editor window).');
    await client.close();
    process.exit(0);
  }
  const listed=await client.callTool({name:'list_editor_windows',arguments:{}});
  const target=listed.structuredContent.windows.find(w=>!w.minimized&&w.title==='千星沙箱');
  assert.ok(target,'Open the editor for capture guard validation.');
  const shot=await client.callTool({name:'capture_editor_window',arguments:{windowId:target.windowId}});
  const id=shot.structuredContent.captureId;assert.ok(id);
  const out=await client.callTool({name:'editor_input',arguments:{captureId:id,kind:'click',x:-1,y:0}});
  assert.equal(out.structuredContent.error.code,'POINT_OUTSIDE_IMAGE');
  const reuse=await client.callTool({name:'editor_input',arguments:{captureId:id,kind:'click',x:0,y:0}});
  assert.equal(reuse.structuredContent.error.code,'STALE_CAPTURE');
  console.log('PASS: unknown/consumed capture rejected, input fields checked, control text rejected, out-of-image coordinates rejected. No input sent.');
}finally{await client.close();}
