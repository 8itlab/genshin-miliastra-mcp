// Additive catalog maintenance. Dry run by default; never targets a running installation.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=new URL('../../',import.meta.url);
const [input,...flags]=process.argv.slice(2);
if(!input)throw Error('Usage: node scripts/dev/update-assets.mjs capture.json [--apply]');
if(flags.some(x=>x!=='--apply'))throw Error('Unknown flag');
const raw=fs.readFileSync(input), capture=JSON.parse(raw);
if(!/^7\.[12]\.\d+$/.test(capture.version)||!capture.source||!capture.license||!capture.evidence?.length)
 throw Error('Require official version, source, license and local evidence paths');
const hash=b=>createHash('sha256').update(b).digest('hex');
const evidence=capture.evidence.map(path=>({path,sha256:hash(fs.readFileSync(path))}));
const target=new URL('src/scene/asset-catalog.json',root);
const before=fs.readFileSync(target), catalog=JSON.parse(before);
const byId=new Map(catalog.assets.map(a=>[a.id,a])), added=[], seen=new Set();
if(!Array.isArray(capture.assets)||!capture.assets.length)throw Error('Empty capture');
for(const a of capture.assets){
 if(!Number.isSafeInteger(a.id)||a.id<=0||!a.name?.trim()||!a.group?.trim()||typeof a.icon!=='string')throw Error('Invalid asset');
 if(a.size&&(!Array.isArray(a.size)||a.size.length!==3||a.size.some(n=>!Number.isFinite(n)||n<0)))throw Error('Invalid dimensions');
 if(seen.has(a.id))throw Error(`Duplicate capture ID ${a.id}`);seen.add(a.id);
 const old=byId.get(a.id);
 if(old){for(const k of ['name','group','icon','size'])if(JSON.stringify(old[k])!==JSON.stringify(a[k]))throw Error(`Conflicting existing asset ${a.id}: ${k}`);continue;}
 // Identity collection alone never establishes a working creature seed.
 if(a.group.startsWith('怪物'))a.catalogOnly=true;
 added.push(a);
}
const report={version:capture.version,source:capture.source,license:capture.license,evidence,inputSha256:hash(raw),baseSha256:hash(before),added:added.map(a=>a.id),unchanged:capture.assets.length-added.length,officialCreationVerified:false};
console.log(JSON.stringify(report,null,2));
if(flags.includes('--apply')){
 const ledger=new URL('src/scene/asset-updates/',root);fs.mkdirSync(ledger,{recursive:true});
 const record=new URL(report.inputSha256+'.json',ledger);
 const previous=fs.existsSync(record)?JSON.parse(fs.readFileSync(record,'utf8')):null;
 if(previous?.phase==='applied')process.exit(0);
 if(!previous)fs.writeFileSync(record,JSON.stringify({...report,phase:'prepared'},null,2)+'\n',{flag:'wx'});
 catalog.assets.push(...added);
 catalog.source='Base: hang-ZYM/qianxing-format-docs (CC BY 4.0). Additions: official CN editor observations; see src/scene/asset-updates for per-capture version, source and evidence. Game assets remain property of HoYoverse.';
 const temporary=new URL('asset-catalog.json.pending',target);
 // A leftover pending file belongs to an interrupted run and is never treated as committed.
 fs.writeFileSync(temporary,JSON.stringify(catalog)+'\n');
 fs.renameSync(temporary,target);
 const ledgerTemporary=new URL(report.inputSha256+'.pending',ledger);
 fs.writeFileSync(ledgerTemporary,JSON.stringify({...previous??report,phase:'applied'},null,2)+'\n');
 fs.renameSync(ledgerTemporary,record);
 console.error(`Updated ${fileURLToPath(target)}. Restart only the isolated MCP to validate.`);
}
