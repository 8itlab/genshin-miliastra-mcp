// 知识库：官方综合指南 / 教程 / 常见问题的镜像、教学存档拆解、视频文字稿，以及我们自己写的总结。
// 全文搜索不依赖任何服务，启动时把 knowledge/ 下的 Markdown 读进内存。
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),'..','knowledge');
const SECTIONS={guide:'综合指南',course:'教程',faq:'常见问题',transcripts:'视频文字稿',samples:'教学存档拆解',notes:'总结',examples:'我们的样例'};
const EXAMPLES=path.join(path.dirname(fileURLToPath(import.meta.url)),'..','examples');
let pages=null;

function load(){
  if(pages)return pages;
  pages=[];
  const dirs=[['official/guide','guide'],['official/course','course'],['official/faq','faq'],['transcripts','transcripts'],['samples','samples'],['notes','notes']];
  for(const [dir,section] of dirs){
    const full=path.join(ROOT,dir);
    if(!fs.existsSync(full))continue;
    for(const file of fs.readdirSync(full)){
      if(!file.endsWith('.md')||file==='INDEX.md')continue;
      const text=fs.readFileSync(path.join(full,file),'utf8');
      const title=(text.match(/^# (.+)$/m)?.[1]??file).trim();
      const headings=[...text.matchAll(/^#{1,3} (.+)$/gm)].map(m=>m[1].replace(/[*_]/g,'').trim());
      pages.push({id:file.replace(/\.md$/,''),section,sectionLabel:SECTIONS[section],title,headings,text,chars:text.length});
    }
  }
  // 我们自己的样例：examples/<名字>/WALKTHROUGH.md 是一次整轮运行的记录（每一步工具调用和每张图的源码），编号 example-<名字>。
  if(fs.existsSync(EXAMPLES))for(const dir of fs.readdirSync(EXAMPLES)){
    const file=path.join(EXAMPLES,dir,'WALKTHROUGH.md');
    if(!fs.existsSync(file))continue;
    const text=fs.readFileSync(file,'utf8');
    const headings=[...text.matchAll(/^#{1,3} (.+)$/gm)].map(m=>m[1].replace(/[*_]/g,'').trim());
    pages.push({id:'example-'+dir,section:'examples',sectionLabel:SECTIONS.examples,title:(text.match(/^# (.+)$/m)?.[1]??dir).trim(),headings,text,chars:text.length});
  }
  return pages;
}
const stripImages=t=>t.replace(/!\[[^\]]*\]\([^)]*\)/g,'').replace(/\n{3,}/g,'\n\n');
const count=(hay,needle)=>{let n=0,i=0;while((i=hay.indexOf(needle,i))!==-1){n++;i+=needle.length;}return n;};

// 查询按空格拆成词，中文词按子串匹配。每个词在标题里算 10 分、小标题 3 分、正文 1 分；所有词都出现的页面加倍。
export function searchKnowledge({query,limit=6,section='all'}){
  const terms=query.toLowerCase().split(/\s+/).filter(Boolean);
  if(!terms.length)throw Object.assign(new Error('query is empty'),{code:'BAD_QUERY'});
  const hits=[];
  for(const p of load()){
    if(section!=='all'&&p.section!==section)continue;
    const body=stripImages(p.text).toLowerCase(),title=p.title.toLowerCase(),heads=p.headings.join('\n').toLowerCase();
    let score=0,present=0;
    for(const t of terms){const c=count(title,t)*10+count(heads,t)*3+count(body,t);if(c)present++;score+=c;}
    if(!score)continue;
    if(present===terms.length)score*=2;
    hits.push({page:p,score,present});
  }
  hits.sort((a,b)=>b.score-a.score);
  const results=hits.slice(0,limit).map(({page,score})=>({id:page.id,section:page.sectionLabel,title:page.title,chars:page.chars,score,snippets:snippetsFor(page,terms)}));
  return {query,total:hits.length,results,otherMatches:hits.slice(limit,limit+30).map(h=>`${h.page.title} [${h.page.id}]`),
    next:'read_knowledge {id} 读整页；section 可限定 guide / course / faq / transcripts / samples / notes / examples'};
}

function snippetsFor(page,terms){
  // 按小标题切段，取包含最多查询词的三段，每段最多 400 字。
  const parts=stripImages(page.text).split(/\n(?=#{1,3} )/);
  const scored=parts.map(part=>{const low=part.toLowerCase();return {part,score:terms.reduce((s,t)=>s+count(low,t),0)};}).filter(x=>x.score>0);
  scored.sort((a,b)=>b.score-a.score);
  return scored.slice(0,3).map(x=>{
    const text=x.part.replace(/\n{2,}/g,'\n').trim();
    if(text.length<=400)return text;
    const low=text.toLowerCase(),i=Math.max(0,Math.min(...terms.map(t=>low.indexOf(t)).filter(i=>i>=0))-120);
    return (i>0?'…':'')+text.slice(i,i+400)+'…';
  });
}

export function readKnowledge({id,heading='',images=false}){
  const page=load().find(p=>p.id===id);
  if(!page)throw Object.assign(new Error('No knowledge page with this id. Use search_knowledge first.'),{code:'NOT_FOUND',details:{id}});
  let text=images?page.text:stripImages(page.text);
  if(heading){
    const parts=text.split(/\n(?=#{1,3} )/),h=heading.toLowerCase();
    const picked=parts.filter(p=>p.split('\n')[0].toLowerCase().includes(h));
    if(!picked.length)throw Object.assign(new Error('No heading on this page contains that text.'),{code:'NOT_FOUND',details:{id,heading,headings:page.headings}});
    text=picked.join('\n');
  }
  return {id:page.id,section:page.sectionLabel,title:page.title,headings:page.headings,chars:text.length,text};
}

export function knowledgeIndex(){
  const by={};
  for(const p of load())(by[p.sectionLabel]??=[]).push(`${p.title} [${p.id}]`);
  return by;
}
