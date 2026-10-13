import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseMessage, readUint32BE } from 'genshin-ts/injector/binary';
import { buildNodeGraphFieldIndex, isNodeGraphEmptyForInjection, loadGiaGraph } from 'genshin-ts/injector/node_graph';
import { loadGiaProto } from 'genshin-ts/injector/proto';
import { createInjector } from 'genshin-ts/injector/index';
import { buildSignalNodeIdMapFromFields } from 'genshin-ts/injector/signal_nodes';
import { inspectEntities } from './scene/inspect.mjs';
import { inspectBattleConfigurations } from './scene/battle-config.mjs';
import { inspectUIConfigurations } from './scene/ui-config.mjs';
import {signalDefinitionFingerprints} from './scene/signal-definitions.mjs';
import {inspectSignalContract} from './scene/signal-contract.mjs';
import {inspectPrefabs} from './scene/prefabs.mjs';

export const packageRoot = path.dirname(fileURLToPath(import.meta.resolve('genshin-ts/package.json')));
export const sha = value => createHash('sha256').update(value).digest('hex');
export function fail(code, message, details={}) { throw Object.assign(new Error(message), {code, details}); }
export function graphNodePayloadHash(graph,nodeGraphMessage=loadGiaProto().nodeGraphMessage) {
  // Official saves omit protobuf scalar defaults. Materialize them before comparing.
  // This covers nodes (including pins, connections and layout), not bindings or gameplay.
  return sha(JSON.stringify(nodeGraphMessage.toObject(graph,{defaults:true,longs:String,enums:String}).nodes));
}
// What the editor's size check adds up for a graph (校验失败：服务器内存消耗过高；节点图中的节点数超标：N). Every node counts
// one, except that reading or writing a graph variable counts 4, a loop over a list 20 and a counting loop (finiteLoop)
// 15. Measured 2026-10-10
// with graphs of one construct each (scripts/dev/gen_count.py: the editor names its number when it refuses a graph), and
// the sum then matched the editor's number exactly on two whole game graphs of 60 node types (2229 nodes -> 3194,
// 2259 -> 3600). Found to count one: print, branch, arithmetic, comparison, type conversion, local variables, list
// literals, list item lookup, entity queries and positions, creating and removing entities, timers, effects, an entity's
// custom variable being set. Keys are generic node ids: 323 sets a graph variable, 337 gets one, 509 loops over a list,
// 5 is finiteLoop.
export const EDITOR_NODE_WEIGHTS={323:4,337:4,509:20,5:15};
export function graphEditorCount(graph) {
  const seen={};let total=0;
  for(const node of graph.nodes??[]){
    const id=Number(String(node.genericId?.nodeId??node.concreteId?.nodeId??0)),weight=EDITOR_NODE_WEIGHTS[id]??1;
    total+=weight;if(weight>1)seen[id]=(seen[id]||0)+1;
  }
  return {total,variableReads:seen[337]||0,variableWrites:seen[323]||0,listLoops:seen[509]||0,countingLoops:seen[5]||0};
}
export function graphTopology(graph,nodeGraphMessage=loadGiaProto().nodeGraphMessage) {
  const obj=nodeGraphMessage.toObject(graph,{defaults:true,longs:String,enums:String});
  const id=x=>[x?.class??0,x?.type??0,x?.kind??0,x?.nodeId??0];
  const pin=x=>[x?.kind??0,x?.index??0];
  const ordered=rows=>rows.map(row=>JSON.stringify(row)).sort();
  const nodes=(obj.nodes??[]).map(n=>[n.nodeIndex,id(n.genericId),id(n.concreteId)]);
  const edges=(obj.nodes??[]).flatMap(n=>(n.pins??[]).flatMap(p=>(p.connects??[]).map(c=>[n.nodeIndex,...pin(p.i1),c.id,...pin(c.connect)])));
  return {version:1,nodeCount:nodes.length,connectionCount:edges.length,hash:sha(JSON.stringify({nodes:ordered(nodes),edges:ordered(edges)})),scope:'Node indices, generic/concrete IDs and directed pin connections only; excludes layout, literal values, pin types, graph variables, bindings and runtime'};
}
export function inspectBytes(bytes) {
  if(bytes.length<24 || readUint32BE(bytes,8)!==0x326 || readUint32BE(bytes,bytes.length-4)!==0x679)
    fail('INVALID_GIL','Invalid GIL header or footer.');
  if(readUint32BE(bytes,16)!==bytes.length-24) fail('INVALID_GIL','GIL payload length mismatch.');
  const payload=bytes.subarray(20,-4), fields=[];
  parseMessage(payload,0,payload.length,0,0,0,0,0,0,0,fields);
  const signals=[...buildSignalNodeIdMapFromFields(payload,fields)].map(([name,nodeIds])=>({name,nodeIds}));
  const definitionFingerprints=signalDefinitionFingerprints(payload,fields,signals);
  for(const signal of signals){signal.definitionFingerprints=definitionFingerprints.get(signal.name);signal.parameterContract=inspectSignalContract(signal);}
  const {nodeGraphMessage}=loadGiaProto();
  const graphs=[...buildNodeGraphFieldIndex(payload,fields)].flatMap(([id,matches])=>matches.map(m=>{
    const obj=nodeGraphMessage.decode(payload.subarray(m.field.dataStart,m.field.dataEnd));
    const signalReferences=(obj.nodes??[]).flatMap(node=>signals.flatMap(signal=>Object.entries(signal.nodeIds).filter(([,target])=>['class','type','kind','nodeId'].every(k=>node.genericId?.[k]===target[k])).map(([role,target])=>({name:signal.name,role,nodeIndex:node.nodeIndex,nodeId:target.nodeId,signalVersion:node.signalVersion??null,resolution:'observed-definition-id-match',gameplay:'not_run'}))));
    return {id,name:obj.name||'',type:m.type,nodeCount:obj.nodes?.length||0,editorCount:graphEditorCount(obj).total,nodePayloadHash:graphNodePayloadHash(obj,nodeGraphMessage),topology:graphTopology(obj,nodeGraphMessage),signalReferences,
      writable:isNodeGraphEmptyForInjection(obj)||(obj.name||'').startsWith('_GSTS')};
  }));
  return {bytes:bytes.length,sha256:sha(bytes),schema:readUint32BE(bytes,4),graphs,signals,prefabTemplates:inspectPrefabs(payload),battleConfigurations:inspectBattleConfigurations(payload),uiConfigurations:inspectUIConfigurations(payload),signalInspection:{scope:'Pinned backend signal definition node IDs and matching graph references; parameter schema and runtime not verified'},entities:inspectEntities(payload),
    warnings:graphs.length?[]:[{code:'MISSING_GRAPH',message:'Create and save a server entity node graph named _GSTS_MCP_Test in the editor, and attach it to the stage entity.'}]};
}
export function inspectFile(file) { return {path:file,modifiedAt:fs.statSync(file).mtime.toISOString(),...inspectBytes(fs.readFileSync(file))}; }
export function inspectGia(bytes) {
  const proto=loadGiaProto();
  const graph=loadGiaGraph(bytes,proto.rootMessage,proto.nodeGraphMessage);
  return {id:Number(graph.id.id),name:graph.name,nodeCount:graph.nodes?.length||0,editorCount:graphEditorCount(graph),type:Number(graph.id.type),kind:Number(graph.id.kind),nodePayloadHash:graphNodePayloadHash(graph,proto.nodeGraphMessage),topology:graphTopology(graph,proto.nodeGraphMessage)};
}
export function inject(bytes, giaBytes, targetId) {
  // Keep upstream non-empty target checks enabled; never patch arbitrary binary fields.
  const result=createInjector({lang:'en-US'}).injectBytes({gilBytes:bytes,giaBytes,targetId});
  inspectBytes(result.bytes);
  return Buffer.from(result.bytes);
}
