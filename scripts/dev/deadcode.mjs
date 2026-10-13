// Which source files nothing reaches from the server, the daemon, the tests and the scripts.
import fs from 'node:fs';import path from 'node:path';
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(['node_modules','thumbs','fx','media'].includes(e.name)?[]:walk(path.join(d,e.name))):[path.join(d,e.name)]);
const all=walk('src').filter(f=>/\.(mjs|ts|py)$/.test(f)).map(f=>f.replace(/\\/g,'/'));
const roots=['src/server.mjs','src/host/daemon.mjs',...walk('tests').filter(f=>f.endsWith('.mjs')),...walk('scripts').filter(f=>f.endsWith('.mjs'))].map(f=>f.replace(/\\/g,'/'));
const seen=new Set(),todo=[...roots];
while(todo.length){
  const f=todo.pop();if(seen.has(f)||!fs.existsSync(f))continue;seen.add(f);
  const text=fs.readFileSync(f,'utf8');
  for(const m of text.matchAll(/(?:from\s+|import\s*\(\s*|import\s+)['"](\.{1,2}\/[^'"]+)['"]/g)){
    let t=path.posix.normalize(path.posix.join(path.posix.dirname(f),m[1]));
    for(const cand of [t,t+'.mjs',t+'.ts',t.replace(/\.js$/,'.ts')])if(fs.existsSync(cand)){todo.push(cand);break;}
  }
  for(const m of text.matchAll(/['"]([\w./-]+\.py)['"]/g)){const c='src/'+path.posix.basename(m[1]);if(fs.existsSync(c))seen.add(c);}
  for(const m of text.matchAll(/new URL\(['"](\.{1,2}\/[^'"]+)['"]/g)){const t=path.posix.normalize(path.posix.join(path.posix.dirname(f),m[1]));if(fs.existsSync(t))seen.add(t);}
}
const reachableFromServer=new Set();{const t=['src/server.mjs','src/host/daemon.mjs'];while(t.length){const f=t.pop();if(reachableFromServer.has(f)||!fs.existsSync(f))continue;reachableFromServer.add(f);const text=fs.readFileSync(f,'utf8');for(const m of text.matchAll(/(?:from\s+|import\s*\(\s*|import\s+)['"](\.{1,2}\/[^'"]+)['"]/g)){let x=path.posix.normalize(path.posix.join(path.posix.dirname(f),m[1]));for(const c of [x,x+'.mjs',x+'.ts',x.replace(/\.js$/,'.ts')])if(fs.existsSync(c)){t.push(c);break;}}}}
console.log('NOT REACHED BY ANYTHING:');for(const f of all)if(!seen.has(f))console.log('  ',f,fs.statSync(f).size);
console.log('REACHED ONLY BY TESTS/SCRIPTS (not by the server):');for(const f of all)if(seen.has(f)&&!reachableFromServer.has(f)&&!f.endsWith('.py'))console.log('  ',f,fs.statSync(f).size);
