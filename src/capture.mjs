import path from 'node:path';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { ROOT } from './core.mjs';
import { fail } from './adapter.mjs';

export function callCaptureWorker(request) {
  if(process.platform!=='win32') fail('UNSUPPORTED_PLATFORM','Editor capture requires Windows.');
  return new Promise((resolve,reject)=>{
    const worker=spawn(process.env.MILIASTRA_PYTHON||'python',[path.join(ROOT,'src','win_capture.py')],{windowsHide:true,shell:false,stdio:['pipe','pipe','pipe'],env:{...process.env,PYTHONIOENCODING:'utf-8'}});
    worker.stdout.setEncoding('utf8');worker.stderr.setEncoding('utf8');
    let stdout='',stderr='',aborted=false;
    const timeout=setTimeout(()=>{aborted=true;worker.kill();},15000);
    worker.stdout.on('data',chunk=>{
      stdout+=chunk.toString('utf8');
      if(Buffer.byteLength(stdout)>16*1024*1024){aborted=true;worker.kill();}
    });
    worker.stderr.on('data',chunk=>{stderr=(stderr+chunk.toString('utf8')).slice(-4000);});
    worker.on('error',error=>{clearTimeout(timeout);reject(Object.assign(error,{code:'CAPTURE_WORKER_UNAVAILABLE'}));});
    worker.on('close',code=>{
      clearTimeout(timeout);
      if(aborted)return reject(Object.assign(new Error('Capture worker timed out or exceeded output limit.'),{code:'CAPTURE_WORKER_LIMIT'}));
      try {
        const result=JSON.parse(stdout);
        if(result.error) return reject(Object.assign(new Error(result.error.message),{code:result.error.code,details:result.error.details||{}}));
        if(code!==0) throw new Error(stderr||`Capture worker exited ${code}`);
        resolve(result);
      } catch(error) {reject(Object.assign(error,{code:error.code||'CAPTURE_WORKER_FAILED'}));}
    });
    worker.stdin.on('error',()=>{});
    worker.stdin.end(JSON.stringify(request));
  });
}
export function listEditorWindows() {return callCaptureWorker({action:'list'});}
const observations=new Map();
export async function captureEditorWindow({windowId,method='window',maxWidth=1600,maxHeight=1200},workspace) {
  const result=await callCaptureWorker({action:'capture',windowId,method,maxWidth,maxHeight,
    outputPath:path.join(workspace,'captures',randomUUID()+'.png')});
  const {imageBase64,...metadata}=result;
  const captureId=randomUUID();metadata.captureId=captureId;
  for(const [id,observation] of observations)if(Date.now()-observation.created>120000)observations.delete(id);
  observations.set(captureId,{created:Date.now(),metadata});
  if(observations.size>100)observations.delete(observations.keys().next().value);
  return {content:[{type:'text',text:JSON.stringify(metadata)},{type:'image',mimeType:'image/png',data:imageBase64}],structuredContent:metadata};
}
export async function focusEditorWindow({windowId},workspace) {
  observations.clear();
  await callCaptureWorker({action:'focus',windowId});
  return captureEditorWindow({windowId},workspace);
}
export async function editorInput(args,workspace) {
  if(args.holdMs!==undefined&&(args.kind!=='key'||!Number.isInteger(args.holdMs)||args.holdMs<20||args.holdMs>2000))fail('INVALID_INPUT','holdMs applies only to key actions and must be 20–2000 ms.');
  if(args.kind==='key'&&typeof args.key!=='string')fail('INVALID_INPUT','key is required for a key action.');
  if(args.kind==='text'&&(typeof args.text!=='string'||/[\u0000-\u001f]/.test(args.text)))fail('INVALID_INPUT','text is required and cannot contain control characters.');
  if(args.kind==='scroll'&&(!Number.isInteger(args.delta)||args.delta===0))fail('INVALID_INPUT','A nonzero integer delta is required for scroll.');
  const observed=observations.get(args.captureId);
  if(!observed||Date.now()-observed.created>120000)fail('STALE_CAPTURE','Capture is missing, consumed or older than 120 seconds. Capture again.');
  observations.clear();
  const meta=observed.metadata;
  if(meta.suspectBlank)fail('BLANK_CAPTURE','Cannot act on a suspect blank screenshot. Obtain a usable capture.');
  const request={...args,action:'input',windowId:meta.window.windowId,expectedRect:meta.window.rect,expectedTitle:meta.window.title};
  if(['click','scroll','drag'].includes(args.kind)) {
    for(const [key,limit,scale,offset] of [['x',meta.previewWidth,meta.previewToImageScale.x,meta.imageOffsetInWindow.x],['y',meta.previewHeight,meta.previewToImageScale.y,meta.imageOffsetInWindow.y],...(args.kind==='drag'?[['toX',meta.previewWidth,meta.previewToImageScale.x,meta.imageOffsetInWindow.x],['toY',meta.previewHeight,meta.previewToImageScale.y,meta.imageOffsetInWindow.y]]:[])]) {
      if(!Number.isFinite(args[key])||args[key]<0||args[key]>=limit)fail('POINT_OUTSIDE_IMAGE',`${key} must be inside the returned preview image.`);
      request[key]=Math.round(args[key]*scale+offset);
    }
  }
  const action=await callCaptureWorker(request);
  try {
    const captured=await captureEditorWindow({windowId:meta.window.windowId,method:meta.backend==='pillow-screen'?'screen':'window',maxWidth:meta.previewWidth,maxHeight:meta.previewHeight},workspace);
    captured.structuredContent.action=action;
    captured.content[0].text=JSON.stringify(captured.structuredContent);
    return captured;
  } catch(error) {
    if(error.code==='WINDOW_NOT_FOUND') {
      const listed=await listEditorWindows();
      const next=listed.windows.find(w=>w.pid===meta.window.pid&&w.foreground);
      if(next) {
        try {
          const captured=await captureEditorWindow({windowId:next.windowId},workspace);
          captured.structuredContent.action=action;
          captured.structuredContent.closedInputWindowId=meta.window.windowId;
          captured.content[0].text=JSON.stringify(captured.structuredContent);
          return captured;
        } catch { /* Preserve the original action evidence below. */ }
      }
    }
    fail('POST_INPUT_CAPTURE_FAILED','Input was sent, but refresh failed; do not repeat blindly.',{action,captureError:error.message});
  }
}
