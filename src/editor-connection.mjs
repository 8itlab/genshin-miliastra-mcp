import fs from 'node:fs';

export function summarizeConnectionLog(text){
 const events=[];
 for(const line of text.split(/\r?\n/)){
  const match=line.match(/^(\d{4}\/\d{1,2}\/\d{1,2} \d{1,2}:\d{2}:\d{2}): .*?\[0\] (tcp client connected|tcp client disconnected|Tcp Connector fail)(?:\s|$)/);
  if(match)events.push({atLocal:match[1],state:match[2]==='tcp client connected'?'connected':match[2]==='tcp client disconnected'?'disconnected':'connection_failed'});
 }
 return {lastEvent:events.at(-1)??null,eventCounts:{connected:events.filter(e=>e.state==='connected').length,disconnected:events.filter(e=>e.state==='disconnected').length,connection_failed:events.filter(e=>e.state==='connection_failed').length}};
}

// Operator-configured file only; never return arbitrary log lines or probe network endpoints.
export function inspectEditorConnection(logPath=process.env.MILIASTRA_EDITOR_LOG){
 const scope='Historical official editor connection messages only; not a live connection or gameplay test';
 if(!logPath)return {status:'not_configured',scope,configuration:'Set MILIASTRA_EDITOR_LOG to the official BeyondAssistEditor/Log/log.txt'};
 let fd;
 try{
  fd=fs.openSync(logPath,'r');const stat=fs.fstatSync(fd);
  if(!stat.isFile())return {status:'unavailable',reason:'not_a_file',scope};
  const start=Math.max(0,stat.size-1024*1024),buffer=Buffer.alloc(stat.size-start);
  const n=fs.readSync(fd,buffer,0,buffer.length,start);
  let text=buffer.subarray(0,n).toString('utf8');if(start>0)text=text.slice(text.indexOf('\n')+1);
  return {status:'observed',scope,logModifiedAt:stat.mtime.toISOString(),observedAt:new Date().toISOString(),tailTruncated:start>0,...summarizeConnectionLog(text)};
 }catch(e){return {status:'unavailable',reason:e.code??'read_failed',scope};}
 finally{if(fd!==undefined)fs.closeSync(fd);}
}
