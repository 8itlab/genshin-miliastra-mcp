// Turn the report of a round (scripts/dev/mcp_round.mjs, usually a rehearsal with ROUND_DRY=1) into the walkthrough of
// an example: every tool call in order with its arguments and the ids it returned, then the source of every graph.
// read_knowledge serves it as "example-<dir>", so a client that has only the MCP server can read how a level was built.
// Usage: node scripts/dev/write_walkthrough.mjs <report.json> <examples dir name> <test json name>
import fs from 'node:fs';
import path from 'node:path';
const [reportFile,dir,testName]=process.argv.slice(2),root=process.cwd();
const report=JSON.parse(fs.readFileSync(reportFile,'utf8')),test=JSON.parse(fs.readFileSync(path.join(root,'examples',dir,testName),'utf8'));
if(!report.done)throw new Error('the round did not finish: '+report.error);
const PER_GRAPH=['create_project','update_logic','build_project','preview_changes','apply_build'];
const trim=(name,a)=>{
  const {mapPath,outputName,expectedSha256,...rest}=a||{};
  if(name==='scene_build_blocks'&&rest.blocks?.length>4)return {...rest,blocks:[...rest.blocks.slice(0,3),'… '+(rest.blocks.length-3)+' more pieces of the same form']};
  return rest;
};
const out=[];
out.push('# 样例 '+dir+'：只用 MCP 工具从空白地图搭出来的全过程','');
out.push('这一页由一次真实的整轮运行记录生成（`scripts/dev/mcp_round.mjs`），不是手写的：下面每一步都是实际发出的工具调用和它返回的编号。','');
out.push('- 每个会改存档的工具都返回新的 `mapPath`，下一步把它传进去；下面为了好读把 `mapPath` 和 `outputName` 省掉了。');
out.push('- 编号（元件、节点图、环境配置、单位状态、预设点）每张地图都不一样，用你自己那次调用返回的，不要照抄这里的数字。');
out.push('- 标了 [UI] 的三步要游戏窗口：`editor_open_map`、`scene_import_assets`、`playtest_start`。'+(report.dry?'这份记录是离线演练，跳过了这三步，它们的位置在下面标出。':''),'');
out.push('## 这个样例是什么','',test.about,'');
out.push('## 一、工具调用顺序','');
let n=0,graphIndex=0;const sources=[];
const calls=report.calls.filter(c=>c.name!=='playtest_status');
for(let i=0;i<calls.length;i++){
  const c=calls[i];
  if(c.name==='create_project'){
    const group=calls.slice(i,i+PER_GRAPH.length);
    if(group.map(g=>g.name).join()!==PER_GRAPH.join())throw new Error('unexpected order of calls at '+i);
    const limit=report.limits[graphIndex++];
    sources.push({graph:limit.graph,nodes:limit.nodeCount,code:group[1].arguments.code,target:group[0].arguments.targetGraphId});
    if(graphIndex===1){
      out.push((++n)+'. 每张节点图各做一遍这五步（上一张 `apply_build` 返回的存档给下一张的 `create_project`）：');
      out.push('   - `create_project` `'+JSON.stringify({projectId:group[0].arguments.projectId,targetGraphId:'<scene_add_graph 返回的 graphId>'})+'`');
      out.push('   - `update_logic` `{projectId, code: <源码，见第二节>}`');
      out.push('   - `build_project` `{projectId}`：返回 buildId 和节点数、编辑器计数');
      out.push('   - `preview_changes` `{projectId, buildId, destination:"copy"}`：返回 expectedSha256');
      out.push('   - `apply_build` `{projectId, buildId, destination:"copy", expectedSha256}`：返回可以试玩的存档');
      out.push('   源码都写好以后，这五步可以换成一次 `write_graphs` `{mapPath, graphs:[{graphId, code}, ...]}`：它对每张图依次做同样的事，返回全部写好的存档。');
    }
    i+=PER_GRAPH.length-1;continue;
  }
  if(c.name==='write_graphs'){
    // All the graphs in one call (a round with batch: true): the sources go to the second part, as with the five steps.
    for(const g of c.arguments.graphs){const limit=report.limits[graphIndex++];sources.push({graph:limit.graph,nodes:limit.nodeCount,code:g.code,target:g.graphId});}
    out.push((++n)+'. `write_graphs` `{graphs:[{graphId: <scene_add_graph 返回的 graphId>, code: <源码，见第二节>}, … 共 '+c.arguments.graphs.length+' 张]}`：对每张图依次编译并写进存档，返回全部写好、可以试玩的存档。');
    out.push('   一张图一张图调的时候，是对每张图做这五步：`create_project` `{projectId, mapPath, targetGraphId}` → `update_logic` `{projectId, code}` → `build_project` `{projectId}` → `preview_changes` `{projectId, buildId, destination:"copy"}` → `apply_build` `{projectId, buildId, destination:"copy", expectedSha256}`。');
    continue;
  }
  if(report.dry&&c.name==='scene_build_blocks'&&calls[i-1]?.name!=='scene_build_blocks')out.push((++n)+'. [UI] `editor_open_map` `{mapPath}`：在编辑器里打开底图的副本（演练时跳过）');
  if(report.dry&&c.name==='scene_list_entities')out.push((++n)+'. [UI] `scene_import_assets` `'+JSON.stringify({packs:calls.filter(x=>x.name==='scene_build_blocks').map(x=>x.arguments.name)})+'`：把上面的场景包导入并保存（演练时跳过）');
  // In a rehearsal a prefab made from a placed creature was stood in for by an object (mcp_round.mjs): the page shows
  // the call of a real run, which is what a reader copies.
  const real=report.dry&&c.name==='scene_add_prefab'&&(test.prefabs||[]).find(p=>p.fromEntity!==undefined&&p.name===c.arguments.name);
  if(real){const {dryAsset,...shown}=real;out.push((++n)+'. `scene_add_prefab` `'+JSON.stringify(shown)+'` → `'+JSON.stringify(c.returned)+'`（从摆在场景里的造物做元件；演练时场景没导入，这一步用一个物件顶替）');continue;}
  const returned=Object.keys(c.returned||{}).length?' → `'+JSON.stringify(c.returned)+'`':'';
  out.push((++n)+'. `'+c.name+'` `'+JSON.stringify(trim(c.name,c.arguments))+'`'+returned);
}
if(report.dry)out.push((++n)+'. [UI] `playtest_start` `'+JSON.stringify({graphNames:sources.map(s=>s.graph),durationSeconds:test.durationSeconds,screenshotsAt:test.screenshotsAt,inputs:test.inputs})+'`，然后 `playtest_status` 读打印和截图（演练时跳过）');
out.push('','## 二、各张节点图的源码','');
out.push('一共 '+sources.length+' 张，合计 '+sources.reduce((a,s)=>a+s.nodes,0)+' 个节点。挂在哪个实体上见第一节里对应的 `scene_add_graph`。','');
for(const s of sources)out.push('### '+s.graph+'（'+s.nodes+' 个节点）','','```ts',s.code.trim(),'```','');
const file=path.join(root,'examples',dir,'WALKTHROUGH.md');
fs.writeFileSync(file,out.join('\n'));
console.log('written',file,out.join('\n').length,'chars',n,'steps',sources.length,'graphs');
