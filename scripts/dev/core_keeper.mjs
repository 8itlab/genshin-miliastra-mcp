// Keeps the core daemon of one workspace alive in the session this is started in, so that MCP servers started elsewhere
// (over SSH, say) connect to it and the tools that drive the game run in the desktop session. Start it from the
// desktop (Win+R) with the same MILIASTRA_WORKSPACE and MILIASTRA_PYTHON the servers will use (the core's identity
// is made of them); MILIASTRA_PLAYTEST_PYTHON is passed on to the daemon it launches. Stops on Ctrl+C or when the
// file <workspace>/keeper.stop appears.
import fs from 'node:fs';
import path from 'node:path';
import {connectCore} from '../../src/host/core-client.mjs';
const core=await connectCore(),workspace=process.env.MILIASTRA_WORKSPACE,stop=path.join(workspace,'keeper.stop');
fs.writeFileSync(path.join(workspace,'keeper.json'),JSON.stringify({pid:process.pid,corePid:core.identity.pid,since:new Date().toISOString()}));
console.log('keeping core',core.identity.pid,'of',workspace);
const timer=setInterval(()=>{if(fs.existsSync(stop)){fs.rmSync(stop);clearInterval(timer);core.close().then(()=>process.exit(0));}},2000);
process.once('SIGINT',()=>{clearInterval(timer);core.close().then(()=>process.exit(0));});
