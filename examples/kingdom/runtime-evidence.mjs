// Consume explicit print records returned by creator_inspect_debug_log.
// The controller's entityId is NOT the identity of the sampled enemy.
const number='([+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:[eE][+-]?\\d+)?)';
const samplePattern=new RegExp(`^KINGDOM_ENEMY_SAMPLE x=${number} y=${number} z=${number} hp=${number}$`);
export function kingdomEnemyObservations(prints,graphId='1073741900'){
 const samples=[],malformed=[];
 for(let index=0;index<prints.length;index++){
  const p=prints[index];
  if(String(p.graphId)!==String(graphId)||typeof p.text!=='string'||!p.text.startsWith('KINGDOM_ENEMY_SAMPLE'))continue;
  const origin={recordIndex:p.recordIndex,elapsedSeconds:p.elapsedSeconds,sessionLabel:p.sessionLabel,controllerEntityId:p.entityId,rawText:p.text};
  if(p.text==='KINGDOM_ENEMY_SAMPLE_END')continue;
  if(p.text==='KINGDOM_ENEMY_SAMPLE_BEGIN'){
   const frame=prints.slice(index+1,index+6);
   const sameOrigin=frame.length===5&&frame.every(r=>r.graphId===p.graphId&&r.entityId===p.entityId&&r.sessionLabel===p.sessionLabel&&r.elapsedSeconds===p.elapsedSeconds);
   const numeric=new RegExp(`^${number}$`);
   const values=frame.slice(0,4).map(r=>numeric.test(r.text)?Number(r.text):NaN);
   if(!sameOrigin||frame[4].text!=='KINGDOM_ENEMY_SAMPLE_END'||!values.every(Number.isFinite)){malformed.push(origin);continue;}
   const [x,y,z,hp]=values;samples.push({...origin,status:'observed',position:{x,y,z},hp,frameRecords:frame.map(r=>({recordIndex:r.recordIndex,text:r.text}))});
   index+=5;continue;
  }
  if(p.text==='KINGDOM_ENEMY_SAMPLE_NONE'){samples.push({...origin,status:'no-owned-enemies'});continue;}
  if(p.text==='KINGDOM_ENEMY_SAMPLE_MISSING'){samples.push({...origin,status:'sampled-entity-not-on-field'});continue;}
  const match=samplePattern.exec(p.text),values=match?.slice(1).map(Number);
  if(!values||!values.every(Number.isFinite)){malformed.push(origin);continue;}
  const [x,y,z,hp]=values;samples.push({...origin,status:'observed',position:{x,y,z},hp});
 }
 return {samples,malformed,evidence:samples.length?'observations-present':'no-sample-evidence',
  scope:'Each observation samples the first owned enemy at that tick. Enemy identity is not logged: do not infer trajectory, velocity or death from differences between rows. Empty samples do not prove an empty battlefield. These prints do not certify full gameplay.'};
}
