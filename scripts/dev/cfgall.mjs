// node scripts/dev/cfgall.mjs <kind> [name filter]: cfgdump.mjs over every official sample save.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
const dir='knowledge/samples/gil',files=fs.readdirSync(dir).filter(f=>f.endsWith('.gil')&&(!process.argv[3]||f.includes(process.argv[3]))).map(f=>path.join(dir,f));
const r=spawnSync(process.execPath,['scripts/dev/cfgdump.mjs',process.argv[2],...files],{encoding:'utf8',maxBuffer:1<<26});
process.stdout.write(r.stdout+r.stderr);
