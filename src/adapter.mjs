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
import {signalDefinitionFingerprints,clientScriptSignalHeads} from './scene/signal-definitions.mjs';
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
// A signal to the client scripts (Lua) of one player. The compiler has no node for it (发送客户端脚本信号, new in game
// 7.1), but the node is the send node of the signal in all but the definition it names: the name of the signal, then
// the player as its first data pin and the parameters after (read from a node placed and wired by hand, 2026-10-13).
// So a graph writes f.sendSignal('client:NAME', player, ...parameters), and here, before the graph goes into the save,
// such a node is given the definition 发送客户端脚本信号 of NAME in that save and the name without the prefix.
const CLIENT_SIGNAL=/^client:/;
function textOf(value){return typeof value?.bString?.val==='string'?value.bString:value?.bConcreteValue?.value?textOf(value.bConcreteValue.value):null;}
export function toClientScriptSignals(gilBytes,giaBytes){
  const {rootMessage}=loadGiaProto(),root=rootMessage.decode(giaBytes.subarray(20,giaBytes.length-4)),graph=root?.graph?.graph?.inner?.graph;
  const named=(graph?.nodes??[]).filter(n=>n.genericId?.nodeId===300000).map(n=>({node:n,text:(n.pins??[]).filter(p=>p?.i1?.kind===5).map(p=>textOf(p.value)).find(Boolean)})).filter(x=>x.text&&CLIENT_SIGNAL.test(x.text.val));
  if(!named.length)return giaBytes;
  const heads=clientScriptSignalHeads(gilBytes);
  for(const {node,text} of named){
    const name=text.val.replace(CLIENT_SIGNAL,''),head=heads.get(name);
    if(!head)fail('SIGNAL_NOT_FOR_CLIENT_SCRIPTS',heads.size||listedSignals(gilBytes).includes(name)?'The save has no definition 发送客户端脚本信号 for this signal: the signal was defined before game 7.1. Open the save in the editor and save it once (the editor adds the definition), or define the signal with scene_add_signal on a copy.':'The save has no signal of this name: scene_add_signal defines it.',{signal:name,sentAs:text.val,signals:[...heads.keys()]});
    // The player is the first data pin: without it the node sends to nobody.
    if(!(node.pins??[]).some(p=>p?.i1?.kind===3&&!(p.i1.index>0)))fail('SIGNAL_WITHOUT_PLAYER','A signal to client scripts names the player it goes to: f.sendSignal(\'client:'+name+'\', player, ...).',{signal:name});
    for(const id of [node.genericId,node.concreteId])if(id)Object.assign(id,head);
    text.val=name;
  }
  const payload=Buffer.from(rootMessage.encode(root).finish()),header=Buffer.from(giaBytes.subarray(0,20));
  header.writeUInt32BE(payload.length+20,0);header.writeUInt32BE(payload.length,16);
  return Buffer.concat([header,payload,giaBytes.subarray(-4)]);
}
function listedSignals(gilBytes){const payload=gilBytes.subarray(20,-4),found=[];parseMessage(payload,0,payload.length,0,0,0,0,0,0,0,found);return [...buildSignalNodeIdMapFromFields(payload,found).keys()];}
export function inject(bytes, giaBytes, targetId) {
  // Keep upstream non-empty target checks enabled; never patch arbitrary binary fields.
  const result=createInjector({lang:'en-US'}).injectBytes({gilBytes:bytes,giaBytes:toClientScriptSignals(bytes,giaBytes),targetId});
  inspectBytes(result.bytes);
  return Buffer.from(result.bytes);
}
