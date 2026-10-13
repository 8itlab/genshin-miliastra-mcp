import ts from 'typescript';
import {loadGiaProto} from 'genshin-ts/injector/proto';
import {loadGiaGraph} from 'genshin-ts/injector/node_graph';

// The pinned backend can successfully compile JS interpolation of runtime
// handles into a constant '[object Object]'. Inspect the output, not just TS.
export function inspectCompiledText(graph,source){
 const authored=new Set(),templates=[];
 const file=ts.createSourceFile('main.ts',source,ts.ScriptTarget.Latest,true);
 function visit(node){
  if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node))authored.add(node.text);
  if(ts.isTemplateExpression(node)){
   const p=file.getLineAndCharacterOfPosition(node.getStart(file));
   templates.push({line:p.line+1,column:p.character+1});
  }
  ts.forEachChild(node,visit);
 }
 visit(file);
 const diagnostics=[];
 function inspect(value,nodeIndex){
  if(!value||typeof value!=='object')return;
  const text=value.bString?.val;
  if(typeof text==='string'&&text.includes('[object Object]')&&!authored.has(text))
   diagnostics.push({nodeIndex,value:text,possibleTemplateLocations:templates});
  for(const [key,child] of Object.entries(value))if(key!=='bString'){
   if(Array.isArray(child))for(const item of child)inspect(item,nodeIndex);
   else inspect(child,nodeIndex);
  }
 }
 for(const node of graph.nodes??[])for(const pin of node.pins??[])inspect(pin.value,node.nodeIndex);
 return diagnostics;
}

export function inspectCompiledAssetText(bytes,source){
 const proto=loadGiaProto();
 return inspectCompiledText(loadGiaGraph(bytes,proto.rootMessage,proto.nodeGraphMessage),source);
}
