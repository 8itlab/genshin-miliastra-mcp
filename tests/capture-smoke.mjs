import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ROOT } from '../src/core.mjs';
const client=new Client({name:'miliastra-capture-test',version:'0.1.0'});
const transport=new StdioClientTransport({command:process.execPath,args:[path.join(ROOT,'src','server.mjs')],cwd:ROOT,stderr:'pipe',env:Object.fromEntries(Object.entries(process.env).filter(([,v])=>typeof v==='string'))});
const report={transport:'MCP stdio',captured:[],checks:[],visualVerification:'pending'};
try {
  await client.connect(transport);
  const tools=await client.listTools();assert.ok(tools.tools.some(t=>t.name==='capture_editor_window'));
  const listed=await client.callTool({name:'list_editor_windows',arguments:{}});
  assert.ok(!listed.isError,JSON.stringify(listed));
  const {windows}=listed.structuredContent;
  assert.ok(windows.length,'Open the game/editor before running the capture smoke test.');
  console.log('WINDOWS',JSON.stringify(windows.map(w=>({windowId:w.windowId,title:w.title,foreground:w.foreground}))));
  const stale=await client.callTool({name:'capture_editor_window',arguments:{windowId:'1:1'}});
  assert.equal(stale.structuredContent.error.code,'WINDOW_NOT_FOUND');report.checks.push('stale/unauthorized window rejected');
  for(const window of windows.filter(w=>!w.minimized)) {
    const capture=await client.callTool({name:'capture_editor_window',arguments:{windowId:window.windowId,method:'window'}},undefined,{timeout:25000});
    assert.ok(!capture.isError,JSON.stringify(capture));
    const image=capture.content.find(c=>c.type==='image');assert.equal(image?.mimeType,'image/png');
    const png=Buffer.from(image.data,'base64');assert.equal(png.subarray(1,4).toString(),'PNG');
    const meta=capture.structuredContent;
    assert.equal(png.readUInt32BE(16),meta.previewWidth);assert.equal(png.readUInt32BE(20),meta.previewHeight);
    const full=fs.readFileSync(meta.path);assert.equal(full.readUInt32BE(16),meta.width);assert.equal(full.readUInt32BE(20),meta.height);
    assert.ok(meta.width>100&&meta.height>100);
    assert.equal(meta.previewToImageScale.x,meta.width/meta.previewWidth);
    assert.equal(meta.backend,'pillow-printwindow');
    report.captured.push(meta);console.log('CAPTURE',JSON.stringify(meta));
  }
  const background=windows.find(w=>!w.foreground&&!w.minimized);
  if(background) {
    const screen=await client.callTool({name:'capture_editor_window',arguments:{windowId:background.windowId,method:'screen'}});
    // The user can change focus while the test runs; accept actual image or a specific refusal.
    if(screen.isError)assert.ok(['WINDOW_NOT_FOREGROUND','WINDOW_OCCLUDED','FOCUS_CHANGED','WINDOW_CHANGED'].includes(screen.structuredContent.error.code));
    report.checks.push(screen.isError?'screen mode refused unsuitable target':'screen mode captured target after focus changed');
  }
  report.passed=true;report.checks.push('inline PNG format/dimensions', 'full resolution file', 'preview coordinate scaling');
  fs.writeFileSync(path.join(ROOT,'workspace','capture-smoke-report.json'),JSON.stringify(report,null,2));
  console.log('PASS: actual MCP image results. Inspect saved PNGs to verify visual content.');
} finally {await client.close();}
