// Preserve GUID text exactly; controller identity is not actor identity.
const schemas={
  ENEMY:['phase','guid','x','y','z','hp','template','path','waypoint','targetPresent','targetGuid','targetX','targetY','targetZ'],
  ARCHER:['phase','guid','x','y','z','hp','targetGuid']
};
const numeric=new Set(['phase','x','y','z','hp','template','path','waypoint','targetPresent','targetX','targetY','targetZ']);
const decimal=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
export function patrolReport(prints,graphId='1073741909'){
  // Retain foreign prints: filtering them first could join interleaved frames.
  const rows=prints;
  const observations=[],malformed=[],events=[];
  let phase=null;
  for(let i=0;i<rows.length;i++){
    const p=rows[i];
    if(String(p.graphId)!==String(graphId))continue;
    if(p.text==='PATROL_DIAG_CASE_BEGIN')phase=Number(rows[i+1]?.text);
    const role=Object.keys(schemas).find(role=>p.text===`PATROL_DIAG_${role}_BEGIN`);
    if(!role){
      if(p.text?.startsWith('PATROL_DIAG_')&&!Object.keys(schemas).some(role=>p.text===`PATROL_DIAG_${role}_END`))events.push({elapsedSeconds:p.elapsedSeconds,phase,text:p.text});
      continue;
    }
    const names=schemas[role],frame=rows.slice(i+1,i+names.length+2);
    const sameOrigin=frame.length===names.length+1&&frame.every(r=>r.graphId===p.graphId&&r.entityId===p.entityId&&r.elapsedSeconds===p.elapsedSeconds&&r.sessionLabel===p.sessionLabel);
    const valueRows=frame.slice(0,names.length);
    const valid=sameOrigin&&frame.at(-1).text===`PATROL_DIAG_${role}_END`&&valueRows.every((r,j)=>{
      if(numeric.has(names[j]))return typeof r.text==='string'&&decimal.test(r.text)&&Number.isFinite(Number(r.text));
      return typeof r.text==='string'&&r.text!==''&&!r.text.includes('[object Object]');
    });
    if(!valid){malformed.push({elapsedSeconds:p.elapsedSeconds,role,recordIndex:p.recordIndex});continue;}
    const values=Object.fromEntries(names.map((name,j)=>[name,numeric.has(name)?Number(valueRows[j].text):valueRows[j].text]));
    observations.push({elapsedSeconds:Number(p.elapsedSeconds),sessionLabel:p.sessionLabel,controllerEntityId:p.entityId,role,...values});i+=names.length+1;
  }
  const actors=[];
  const actorKey=o=>JSON.stringify([o.sessionLabel,o.controllerEntityId,o.phase,o.role,o.guid]);
  for(const key of new Set(observations.map(actorKey))){
    const selected=observations.filter(o=>actorKey(o)===key),first=selected[0];
    actors.push({sessionLabel:first.sessionLabel,controllerEntityId:first.controllerEntityId,phase:first.phase,role:first.role,guid:first.guid,
      identityStatus:first.guid==='0'?'guid-unavailable; aggregate only within this isolated case':'reported-guid; not independently authenticated',samples:selected.length,
      x:[Math.min(...selected.map(o=>o.x)),Math.max(...selected.map(o=>o.x))],
      hp:[Math.min(...selected.map(o=>o.hp)),Math.max(...selected.map(o=>o.hp))],
      targets:[...new Set(selected.map(o=>o.targetGuid))],templates:[...new Set(selected.map(o=>o.template).filter(v=>v!==undefined))],last:selected.at(-1)});
  }
  return {graphId,observations,malformed,events,actors,
    scope:'Explicit diagnostic prints for isolated cases. GUID 0 cannot identify a dynamic actor or target; those rows are case aggregates only. No complete game, natural defeat, restart or inference from missing samples.'};
}
