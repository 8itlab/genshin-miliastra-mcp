// node scripts/dev/compall.mjs <kind>: comp_dump.mjs over every official sample save.
import fs from 'node:fs';import path from 'node:path';import {spawnSync} from 'node:child_process';
const dir='knowledge/samples/gil',files=fs.readdirSync(dir).filter(f=>f.endsWith('.gil')).map(f=>path.join(dir,f));
const r=spawnSync(process.execPath,['scripts/dev/comp_dump.mjs',process.argv[2],...files],{encoding:'utf8',maxBuffer:1<<26});
process.stdout.write(r.stdout+r.stderr);
