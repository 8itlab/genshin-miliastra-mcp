// Several rounds one after the other, with a line about each: the regression to run after the playtest runner or a
// writer of records was changed. Each round is scripts/dev/mcp_round.mjs on one test json of examples/.
// Usage (from the repository, in the desktop session the game runs in):
//   node scripts/dev/regress_rounds.mjs <list file> [summary.jsonl]
// The list has one test per line, relative to examples/ (kingdom4/kg_test.json); empty lines and lines that begin
// with # are left out. ROUND_DRY=1 rehearses every round without the game. A round takes five to nine minutes.
//
// What a line says: done and error as the round reported them; expectations when the test json has expect (passed,
// met, of); markers, the last distinct prints that look like one (XX_WORD ...), which is where a round without expect
// shows how far it came (HP_VICTORY, KG_CROWN_LOST); late, how many keys came more than 0.3 s late (a scripted walk
// that ends in the wrong place usually has some); levelEndedAt when the result screen was seen.
// The verdict at the end is PASS (expectations met), FAIL (an error, or expectations not met) or RAN (no expectations
// in the test: read the markers against the about text of the test json). Two rounds of 2026-10-14 are why RAN is not
// PASS: examples/kingdom4 "ran" with its walk a station short, and only its markers said so.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd(),[listFile,outFile=path.join(root,'workspace','regress-'+Date.now()+'.jsonl')]=process.argv.slice(2);
if(!listFile){console.error('usage: node scripts/dev/regress_rounds.mjs <list file> [summary.jsonl]');process.exit(2);}
const tests=fs.readFileSync(listFile,'utf8').split(/\r?\n/).map(l=>l.trim()).filter(l=>l&&!l.startsWith('#'));
fs.mkdirSync(path.dirname(outFile),{recursive:true});
const lines=[];
for(const test of tests){
  const file=path.join(root,'examples',test),report=path.join(root,'workspace','regress-round.json'),began=Date.now();
  let line={test};
  if(!fs.existsSync(file)){line={test,verdict:'FAIL',error:'no such test json'};}
  else{
    fs.rmSync(report,{force:true});
    spawnSync(process.execPath,[path.join('scripts','dev','mcp_round.mjs')],{cwd:root,env:{...process.env,ROUND_ARGS:file,ROUND_OUT:report},stdio:'ignore',timeout:25*60*1000});
    let r={};try{r=JSON.parse(fs.readFileSync(report,'utf8'));}catch{}
    const texts=(r.prints??[]).map(p=>String(p.text)),distinct=[...new Set(texts)],asked=r.expectations;
    line={test,done:r.done===true,error:String(r.error??'').slice(0,300),seconds:Math.round((Date.now()-began)/1000),
      ...(asked?{expectations:{passed:asked.passed,met:asked.met,of:asked.of,missing:(asked.results??[]).filter(x=>!x.met).map(x=>x.expect).slice(0,6)}}:{}),
      prints:texts.length,markers:distinct.filter(t=>/^[A-Z]{2,}_[A-Za-z]/.test(t)).slice(-12),late:(r.inputsLate??[]).length,
      ...(r.levelEndedAt!=null?{levelEndedAt:r.levelEndedAt}:{}),...(r.dry?{dry:true}:{})};
    line.verdict=!line.done||line.error||asked?.passed===false?'FAIL':asked?'PASS':'RAN';
  }
  lines.push(line);fs.appendFileSync(outFile,JSON.stringify(line)+'\n');
  console.log(line.verdict.padEnd(4),test,line.error?'error: '+line.error.slice(0,120):(line.markers??[]).slice(-3).join(' | '));
}
const count=v=>lines.filter(l=>l.verdict===v).length;
console.log(`${lines.length} rounds: ${count('PASS')} PASS, ${count('RAN')} RAN (read their markers), ${count('FAIL')} FAIL. Summary: ${outFile}`);
process.exit(count('FAIL')?1:0);
