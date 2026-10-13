import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {inspectEditorConnection,summarizeConnectionLog} from '../../src/editor-connection.mjs';
test('connection diagnostics distinguish reconnection, missing evidence and historical messages without leaking raw lines',()=>{
 const lines=['2026/9/15 11:00:01: [Log] [None] [2026-09-15 11:00:01.000] [0] tcp client connected','2026/9/15 11:00:02: [Log] [None] [x] [0] Tcp Connector fail private-details','2026/9/15 11:00:03: [Log] [None] [x] [0] tcp client disconnected'];
 const failed=summarizeConnectionLog(lines.join('\n'));assert.equal(failed.lastEvent.state,'disconnected');assert.equal(failed.eventCounts.connection_failed,1);assert.ok(!JSON.stringify(failed).includes('private-details'));
 assert.equal(summarizeConnectionLog('unrelated').lastEvent,null);
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'miliastra-connection-')),file=path.join(dir,'log.txt');
 try{fs.writeFileSync(file,lines.join('\n'));assert.equal(inspectEditorConnection(file).lastEvent.state,'disconnected');fs.appendFileSync(file,'\n'+lines[0].replace('11:00:01:','11:00:04:'));assert.equal(inspectEditorConnection(file).lastEvent.state,'connected');assert.equal(inspectEditorConnection(path.join(dir,'missing')).status,'unavailable');assert.equal(inspectEditorConnection(dir).status,'unavailable');assert.equal(inspectEditorConnection('').status,'not_configured');}finally{fs.unlinkSync(file);fs.rmdirSync(dir);}
});
