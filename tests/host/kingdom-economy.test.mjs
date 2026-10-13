import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { configId } from 'genshin-ts/runtime/value';
import { SettlementStatus } from 'genshin-ts/definitions/enum';

const UIControlGroupStatus={Hidden:'hidden'};
const populationPrefabs=new Set([1082130439,1082130440,1082130442]);

// Execute authored callbacks to test economic rules. Optional native-patrol modeling
// assumes template 1 ends at x=55, template 2 at x=9 and an ideal speed of 2 units/s.
// These are model checks, not evidence of engine movement, collisions or scheduling.
// Native arrows and AI target selection are not simulated; cases supply observed
// targets and lethal engine damage explicitly.
function game({bootstrap=true,simulatePatrol=false,emptyKingdom=false}={}){
 const events={},state={};let time=0n,x=0;
 const chain={on(name,fn){events[name]=fn;return this;}};
 const source=ts.transpile(fs.readFileSync(new URL('../../examples/kingdom/kingdom.ts',import.meta.url),'utf8').replace(/^import .*\r?\n/gm,''),{target:ts.ScriptTarget.ES2022});
 vm.runInNewContext(source,{EntityType:{Stage:99},SettlementStatus,UIControlGroupStatus,configId,g:{server(config){Object.assign(state,config.variables);return chain;}}});
 const actors=[],spawnCalls=[],patrolSwitches=[],factionChanges=[],targetQueries=[],hostilityQueries=[],nameplates=[];
 // Runtime conversion is a graph node; emulate only its numeric result here.
 const hud=[];
 const f={get:k=>state[k],set:(k,v)=>{state[k]=v;},queryGameTimeElapsed:()=>time,startTimer(){},printString(){},getListOfPlayerEntitiesOnTheField:()=>[1],getAllCharacterEntitiesOfSpecifiedPlayer:()=>[2],getEntityLocationAndRotation:e=>({location:typeof e==='object'?e.position:(state.characterPosition??[x,6,0])}),split3dVector:([x,y,z])=>({xComponent:x,yComponent:y,zComponent:z}),getListOfEntitiesOwnedByTheEntity:()=>actors.filter(a=>!a.destroyed),getEntityListBySpecifiedPrefabId:(list,id)=>list.filter(a=>a.prefab===id),queryIfEntityIsOnTheField:a=>!!a&&!a.destroyed,getCreationAttribute:a=>({currentHp:a.hp}),hpLoss:(a,n)=>{a.hp-=n;},destroyEntity:a=>{a.destroyed=true;},create3dVector:(x,y,z)=>[x,y,z],queryEntityFaction:()=>1,modifyEntityFaction:(a,faction)=>{a.faction=faction;},createPrefab(id,pos,rotation=[0,0,0],owner){spawnCalls.push({id,owner,position:[...pos],rotation:[...rotation]});if(state.failPrefab===id)return null;if(state.failCounts?.[id]>0){state.failCounts[id]--;return null;}const actor={prefab:id,position:[...pos],rotation:[...rotation],hp:20,destroyed:false,owner,patrolTemplateId:id===1082130441?1n:0n};actors.push(actor);return actor;}};
 f.getSpecifiedTypeOfEntitiesOnTheField=()=>state.stageEntities??[99];
 f.queryIfEntityIsOnTheField=a=>!!a&&!a.destroyed&&!a.offField;
 f.queryEntityFaction=a=>typeof a==='object'?(a.faction??0):(state.playerFaction??1);
 f.modifyEntityFaction=(actor,faction)=>{factionChanges.push({actor,faction,coins:state.coins});actor.faction=faction;};
 f.setEntityActiveNameplate=(actor,configIds)=>{
  assert.ok(actor&&!actor.destroyed);
  const literalIds=Array.from(configIds,id=>{
   assert.ok(id instanceof configId);
   const literal=id.toIRLiteral();assert.equal(literal.type,'config_id');
   assert.equal(typeof literal.value,'number');return literal.value;
  });
  nameplates.push({actor,configIds:literalIds,faction:actor.faction,rosterReady:state.rosterReady,
   population:actors.filter(a=>populationPrefabs.has(a.prefab)&&!a.destroyed&&a.hp>0).length});
 };
 f.getCreationSCurrentTarget=actor=>{targetQueries.push({actor,time:Number(time)});return actor.currentTarget??null;};
 f.queryIfFactionIsHostile=(fromFaction,toFaction)=>{
  assert.equal(typeof fromFaction,'number');assert.equal(typeof toFaction,'number');
  hostilityQueries.push({fromFaction,toFaction,time:Number(time)});
  return (state.hostilePairs??[]).some(([from,to])=>from===fromFaction&&to===toFaction);
 };
 f.dataTypeConversion=(value,type)=>{assert.equal(type,'str');return String(value);};
 f.getListOfPlayerEntitiesOnTheField=()=>state.players??[1];
 f.getAllCharacterEntitiesOfSpecifiedPlayer=()=>state.characters??[2];
 f.getCurrentCreationSPatrolTemplate=a=>({patrolTemplateId:a.patrolTemplateId});
 f.switchCreationPatrolTemplate=(a,templateId)=>{assert.equal(templateId,2n);patrolSwitches.push({actor:a,templateId,time:Number(time)});a.patrolTemplateId=templateId;};
 const teleports=[];f.teleportPlayer=(player,location,rotation)=>teleports.push({player,location:[...location],rotation:[...rotation]});
  const camera=[];f.switchMainCameraTemplate=(players,name)=>camera.push({operation:'select',players:[...players],name});f.setPlayerCameraToFollowEntity=(player,entity,name)=>camera.push({operation:'follow',player,entity,name});
 const layouts=[],logs=[],uiStatusChanges=[];f.switchCurrentInterfaceLayout=(player,index)=>layouts.push({player,index});f.getPlayerSCurrentUiLayout=()=>state.activeLayout??1073741825n;f.printString=message=>logs.push(message);
 f.modifyUiControlStatusWithinTheInterfaceLayout=(player,controlId,status)=>uiStatusChanges.push({player,controlId,status});
 f.setCustomVariable=(entity,name,value,trigger)=>hud.push({entity,name,value,trigger});
 const settlements=[];
 f.setPlayerSettlementSuccessStatus=(player,status)=>settlements.push({operation:'status',player,status,time:Number(time)});
 f.settleStage=()=>settlements.push({operation:'settle',time:Number(time)});
 events.whenEntityIsCreated({eventSourceEntity:3},f);
 // Existing isolated transaction/combat cases deliberately start empty with both
 // worktables unlocked. Full startup and progression are covered separately below.
 if(emptyKingdom){state.rosterReady=true;state.keepLevel=2n;}
 const result={state,actors,spawnCalls,patrolSwitches,factionChanges,targetQueries,hostilityQueries,nameplates,hud,teleports,camera,layouts,logs,uiStatusChanges,settlements,add:(id,pos)=>f.createPrefab(id,pos),restartStage(){
  assert.equal(settlements.at(-1)?.operation,'settle');
  // Model the engine unloading the old world and creating its controller again.
  // Keep script variables dirty so only the authored creation callback resets them.
  for(const actor of actors)actor.destroyed=true;
  time=0n;x=0;events.whenEntityIsCreated({eventSourceEntity:3},f);
 },tick(t,pos=x){
  if(simulatePatrol&&t>Number(time))for(const a of actors){
   if(a.destroyed||a.prefab!==1082130441)continue;
   const endpoint=a.patrolTemplateId===1n?55:9;
   a.position[0]=Math.max(endpoint,a.position[0]-2*(t-Number(time)));
  }
  time=BigInt(t);x=pos;events.whenTimerIsTriggered({timerName:'KINGDOM_CLOCK',eventSourceEntity:3},f);
  if(emptyKingdom&&state.state===1n){state.rosterReady=true;state.keepLevel=2n;}
 }};
 if(bootstrap){result.tick(-2);result.tick(0,5);if(!emptyKingdom)result.tick(1,5);}
 return result;
}
function emptyGame(options={}){return game({...options,emptyKingdom:true});}

test('startup creates exactly four civilians, four archers and two workers in the player faction',()=>{
 const g=game();
 assert.equal(g.state.keepLevel,0n);assert.equal(g.state.coins,12n);
 assert.equal(g.state.rosterReady,true);assert.equal(g.state.deadline,61n);
 assert.deepEqual([g.state.idle,g.state.archers,g.state.workers],[4n,4n,2n]);
 assert.equal(g.actors.filter(a=>populationPrefabs.has(a.prefab)).length,10);
 assert.equal(g.actors.length,16);assert.ok(g.actors.every(a=>a.owner===3&&a.faction===1));
 assert.equal(g.actors.filter(a=>a.prefab===1082130439).length,4);
 assert.equal(g.actors.filter(a=>a.prefab===1082130442).length,4);
 assert.equal(g.actors.filter(a=>a.prefab===1082130440).length,2);
 const signs=g.actors.filter(a=>a.prefab===1077936137);assert.equal(signs.length,6);
 assert.deepEqual(signs.map(a=>({position:a.position,rotation:a.rotation})),[0,10,20,30,40,50].map(x=>({position:[x,9,8],rotation:[0,0,0]})));
 assert.deepEqual(g.nameplates.map(n=>({actor:n.actor,configIds:n.configIds})),signs.map((actor,i)=>({actor,configIds:[i+1]})));
 assert.ok(g.nameplates.every(n=>n.population===10&&n.rosterReady===false&&n.faction===1));
 g.tick(1);g.tick(2);g.tick(8);assert.equal(g.actors.length,16);assert.equal(g.nameplates.length,6);
 // A casualty after setup is not automatically replaced.
 g.actors.find(a=>a.prefab===1082130440).hp=0;g.tick(9);
 assert.equal(g.state.workers,1n);assert.equal(g.spawnCalls.length,16);assert.equal(g.nameplates.length,6);
 assert.equal(g.spawnCalls.filter(a=>populationPrefabs.has(a.id)).length,10);
});

test('partial startup retries only missing units and begins a full day after recovery',()=>{
 const g=game({bootstrap:false});g.state.failCounts={[1082130442]:2};
 g.tick(0,5);g.tick(1);g.tick(2);
 assert.deepEqual([g.state.idle,g.state.archers,g.state.workers],[4n,2n,2n]);
 assert.equal(g.state.rosterReady,false);assert.equal(g.spawnCalls.length,10);
 assert.equal(g.spawnCalls.filter(a=>a.id===1077936137).length,0);assert.equal(g.nameplates.length,0);
 g.tick(6);assert.equal(g.spawnCalls.length,10);g.tick(7);
 assert.equal(g.state.rosterReady,true);assert.equal(g.state.rosterAttempts,2n);assert.equal(g.state.deadline,67n);
 assert.equal(g.spawnCalls.filter(a=>populationPrefabs.has(a.id)).length,12);
 assert.equal(g.actors.filter(a=>populationPrefabs.has(a.prefab)).length,10);
 assert.equal(g.spawnCalls.length,18);assert.equal(g.actors.length,16);
 assert.equal(g.nameplates.length,6);assert.ok(g.nameplates.every(n=>n.population===10&&n.rosterReady===false));
 assert.equal(g.logs.filter(x=>x==='KINGDOM_ROSTER_READY').length,1);
 g.tick(66);assert.equal(g.state.night,false);g.tick(67);assert.equal(g.state.night,true);
});

test('persistent startup failure has bounded attempts, honest counts and visible failure without starting enemy waves',()=>{
 const g=game({bootstrap:false});g.state.failPrefab=1082130439;
 g.tick(0,5);g.tick(1);g.tick(2);g.tick(7);g.tick(12);g.tick(13);g.tick(120);
 assert.equal(g.state.rosterReady,false);assert.equal(g.state.rosterAttempts,3n);
 assert.deepEqual([g.state.idle,g.state.archers,g.state.workers],[0n,4n,2n]);
 assert.equal(g.spawnCalls.filter(x=>x.id===1082130439).length,12);
 assert.equal(g.spawnCalls.filter(x=>x.id===1082130442).length,4);
 assert.equal(g.spawnCalls.filter(x=>x.id===1082130440).length,2);
 assert.equal(g.spawnCalls.filter(x=>x.id===1077936137).length,0);assert.equal(g.nameplates.length,0);
 assert.equal(g.state.night,false);assert.equal(g.state.coins,12n);
 assert.equal(g.logs.filter(x=>x==='KINGDOM_ROSTER_FAILED').length,1);
 assert.match(g.hud.filter(x=>x.name==='MCP_HUD').at(-1).value,/初始人口生成失败/);
});

test('failed station signs skip faction and nameplate calls without inflating population or retrying',()=>{
 for(const failed of [2,6]){
  const g=game({bootstrap:false});g.state.playerFaction=7;g.state.failCounts={[1077936137]:failed};
  g.tick(0,5);g.tick(1);g.tick(2);
  assert.equal(g.state.rosterReady,true);assert.equal(g.state.rosterAttempts,1n);assert.equal(g.state.coins,12n);
  assert.deepEqual([g.state.idle,g.state.archers,g.state.workers],[4n,4n,2n]);
  assert.equal(g.actors.filter(a=>populationPrefabs.has(a.prefab)).length,10);
  const signs=g.actors.filter(a=>a.prefab===1077936137);assert.equal(signs.length,6-failed);
  assert.equal(g.spawnCalls.filter(a=>a.id===1077936137).length,6);
  assert.deepEqual(g.factionChanges.filter(n=>n.actor.prefab===1077936137).map(n=>n.actor),signs);
  assert.deepEqual(g.nameplates.map(n=>({actor:n.actor,configIds:n.configIds})),signs.map((actor,i)=>({actor,configIds:[failed+i+1]})));
  assert.ok(g.nameplates.every(n=>n.faction===7&&n.population===10&&n.rosterReady===false));
  g.tick(3);g.tick(4);g.tick(8);
  assert.equal(g.spawnCalls.length,16);assert.equal(g.actors.length,16-failed);assert.equal(g.nameplates.length,6-failed);
  assert.deepEqual([g.state.idle,g.state.archers,g.state.workers],[4n,4n,2n]);
 }
});

test('main building upgrades cost coins once per visit, unlock worktables in order and show progress in the HUD',()=>{
 const g=game();g.state.playerFaction=7;const hud=()=>g.hud.filter(x=>x.name==='MCP_HUD').at(-1).value;
 g.tick(2,20);g.tick(4);g.tick(5,30);g.tick(7);
 assert.equal(g.state.coins,12n);assert.equal(g.state.idle,4n);assert.equal(g.state.workers,2n);assert.equal(g.state.archers,4n);
 assert.match(hud(),/Lv0.*升级4金币/);
 g.tick(8,0);g.tick(9);assert.equal(g.state.keepLevel,0n);g.tick(10);
 assert.equal(g.state.keepLevel,1n);assert.equal(g.state.coins,8n);
 assert.equal(g.actors.filter(a=>a.prefab===1077936136&&!a.destroyed&&a.position[0]<5).length,2);
 assert.deepEqual(g.actors.filter(a=>a.prefab===1077936136&&!a.destroyed).map(a=>({position:a.position,rotation:a.rotation})),[
  {position:[-2,8,-3],rotation:[0,0,0]},{position:[2,8,-3],rotation:[0,0,0]}
 ]);
 assert.ok(g.actors.filter(a=>a.prefab===1077936136).every(a=>a.faction===7));
 assert.deepEqual(g.factionChanges.filter(x=>x.actor.prefab===1077936136).map(x=>x.coins),[12n,12n]);
 g.tick(11);g.tick(12);assert.equal(g.state.keepLevel,1n);assert.equal(g.state.coins,8n);
 assert.match(hud(),/Lv1.*工人台已解锁.*升级6金币/);
 g.tick(13,30);g.tick(15);assert.equal(g.state.archers,4n);assert.equal(g.state.coins,8n);
 g.tick(16,20);g.tick(18);assert.equal(g.state.workers,3n);assert.equal(g.state.idle,3n);assert.equal(g.state.coins,5n);
 g.tick(19,0);g.tick(21);assert.equal(g.state.keepLevel,1n);assert.equal(g.state.coins,5n);
 // Exploration supplies the second upgrade without changing its transaction rules.
 g.tick(22,-20);g.tick(24);assert.equal(g.state.coins,11n);
 g.tick(25,0);g.tick(27);assert.equal(g.state.keepLevel,2n);assert.equal(g.state.coins,5n);
 assert.equal(g.actors.filter(a=>a.prefab===1077936136&&!a.destroyed&&a.position[0]<5).length,4);
 assert.deepEqual(g.actors.filter(a=>a.prefab===1077936136&&!a.destroyed).map(a=>({position:a.position,rotation:a.rotation})),[
  {position:[-2,8,-3],rotation:[0,0,0]},{position:[2,8,-3],rotation:[0,0,0]},
  {position:[-2,10,-3],rotation:[0,0,0]},{position:[2,10,-3],rotation:[0,0,0]}
 ]);
 assert.ok(g.actors.filter(a=>a.prefab===1077936136).every(a=>a.faction===7));
 assert.deepEqual(g.factionChanges.filter(x=>x.actor.prefab===1077936136).map(x=>x.coins),[12n,12n,11n,11n]);
 g.tick(28,30);g.tick(30);assert.equal(g.state.archers,5n);assert.equal(g.state.idle,2n);assert.equal(g.state.coins,1n);
 assert.match(hud(),/Lv2.*工人台、弓手台已解锁/);
 g.state.coins=20n;g.tick(31,0);g.tick(33);assert.equal(g.state.keepLevel,2n);assert.equal(g.state.coins,20n);
});

test('a partial keep build rolls back its visible parts without charging or unlocking',()=>{
 const g=game();g.state.failCounts={[1077936136]:1};g.tick(2,0);g.tick(4);
 assert.equal(g.state.keepLevel,0n);assert.equal(g.state.coins,12n);
 assert.ok(g.actors.filter(a=>a.prefab===1077936136).every(a=>a.destroyed));
 assert.equal(g.factionChanges.filter(x=>x.actor.prefab===1077936136).length,0);
 g.tick(5,5);g.tick(6,0);g.tick(8);
 assert.equal(g.state.keepLevel,1n);assert.equal(g.state.coins,8n);
 assert.ok(g.actors.filter(a=>a.prefab===1077936136&&!a.destroyed).every(a=>a.faction===1));
});

test('official restart recreates the controller, restores the single-player 4/4/2 roster, resources and locked worktables',()=>{
 const g=game();const original=[...g.actors];g.state.keepLevel=2n;g.state.coins=1n;
 g.state.bank=20n;g.state.groveFound=true;g.state.ruinsFound=true;
 const oldSigns=original.filter(a=>a.prefab===1077936137);assert.equal(oldSigns.length,6);
 g.tick(61);g.tick(62);g.tick(67);g.tick(72);
 for(const enemy of g.actors.filter(a=>a.prefab===1082130441))enemy.position=[9,6,0];
 g.tick(73);assert.equal(g.state.state,2n);assert.equal(g.settlements.length,2);
 g.tick(74,5);g.tick(76);assert.equal(g.state.coins,1n);assert.equal(g.state.keepLevel,2n);
 g.restartStage();assert.ok(original.every(a=>a.destroyed));
 assert.equal(g.state.keepLevel,0n);assert.equal(g.state.rosterReady,false);assert.equal(g.state.coins,12n);
 assert.equal(g.state.bank,0n);assert.equal(g.state.crown,3n);assert.equal(g.state.wall,0n);assert.equal(g.state.wallHp,0n);
 assert.equal(g.state.groveFound,false);assert.equal(g.state.ruinsFound,false);assert.equal(g.state.settlementRequested,false);
 assert.equal(g.state.playerReady,false);assert.equal(g.state.lastTick,-1n);assert.equal(g.state.day,1n);assert.equal(g.state.night,false);
 assert.equal(g.state.waveLeft,0n);assert.equal(g.state.nextSpawn,0n);assert.equal(g.state.rosterAttempts,0n);
 g.tick(0);g.tick(1,5);g.tick(2);
 assert.equal(g.state.playerReady,true);assert.equal(g.teleports.length,2);assert.equal(g.camera.length,4);
 assert.equal(g.state.rosterReady,true);assert.equal(g.state.deadline,62n);
 const survivors=g.actors.filter(a=>!a.destroyed);assert.equal(survivors.length,16);
 assert.equal(survivors.filter(a=>populationPrefabs.has(a.prefab)).length,10);
 const newSigns=survivors.filter(a=>a.prefab===1077936137);assert.equal(newSigns.length,6);
 assert.ok(oldSigns.every(a=>a.destroyed&&!newSigns.includes(a)));
 assert.equal(g.nameplates.length,12);
 assert.deepEqual(g.nameplates.slice(6).map(n=>({actor:n.actor,configIds:n.configIds})),newSigns.map((actor,i)=>({actor,configIds:[i+1]})));
 assert.ok(survivors.every(a=>a.owner===3&&a.faction===1));
 assert.deepEqual([g.state.idle,g.state.archers,g.state.workers],[4n,4n,2n]);
 g.tick(3,30);g.tick(5);assert.equal(g.state.coins,12n);assert.equal(g.state.archers,4n);
 assert.equal(g.nameplates.length,12);assert.equal(g.spawnCalls.filter(a=>a.id===1077936137).length,12);
 assert.equal(g.settlements.length,2);
});

test('starting population controls recruitment capacity and dawn income while explicit engine deaths clear the first wave',()=>{
 const g=game({simulatePatrol:true});
 g.tick(2,10);g.tick(4);g.tick(5,5);g.tick(6,10);g.tick(8);
 assert.equal(g.state.idle,6n);assert.equal(g.state.coins,8n);
 g.tick(9,5);g.tick(10,10);g.tick(12);
 assert.equal(g.state.idle,6n);assert.equal(g.state.coins,8n);
 for(let t=13;t<=106;t++){
  const living=g.actors.filter(a=>a.prefab===1082130441&&!a.destroyed&&a.hp>0);
  g.tick(t,5);
  // Let each enemy survive a scripted heartbeat before supplying an engine hit.
  for(const enemy of living){assert.equal(enemy.hp,20);assert.equal(enemy.destroyed,false);enemy.hp=0;}
  if(t>=61&&t<106){assert.equal(g.state.night,true);assert.equal(g.state.day,1n);}
 }
 assert.equal(g.state.day,2n);assert.equal(g.state.bank,4n);assert.equal(g.state.crown,3n);
 assert.equal(g.logs.filter(x=>x==='KINGDOM_ENEMY_SPAWN').length,3);
 assert.equal(g.logs.filter(x=>x==='KINGDOM_ENEMY_DEFEATED').length,3);
 assert.equal(g.actors.filter(a=>a.prefab===1082130441&&!a.destroyed).length,0);
 assert.equal(g.logs.filter(x=>x==='KINGDOM_WAVE_CLEARED').length,1);
 assert.equal(g.logs.filter(x=>x==='KINGDOM_CROWN_HIT').length,0);
});

test('ideal native patrol reaches the wall and holds its endpoint while damaging the wall',()=>{
 const g=emptyGame({simulatePatrol:true});g.tick(60);g.tick(61);
 const enemy=g.actors.find(a=>a.prefab===1082130441&&!a.destroyed);
 assert.ok(enemy);assert.equal(enemy.patrolTemplateId,1n);
 g.state.waveLeft=0n;g.state.wall=1n;g.state.wallHp=15n;
 for(let t=62;t<=65;t++)g.tick(t);
 assert.equal(enemy.position[0],57);assert.equal(g.state.wallHp,15n);
 assert.equal(g.logs.filter(x=>x==='KINGDOM_WALL_HIT').length,0);
 g.tick(66);assert.equal(enemy.position[0],55);assert.equal(g.state.wallHp,14n);
 for(let t=67;t<=70;t++)g.tick(t);
 assert.equal(enemy.position[0],55);assert.equal(g.state.wallHp,10n);
 assert.equal(g.logs.filter(x=>x==='KINGDOM_WALL_HIT').length,5);
 g.tick(70);assert.equal(g.logs.filter(x=>x==='KINGDOM_WALL_HIT').length,5);
 assert.equal(enemy.patrolTemplateId,1n);assert.equal(g.patrolSwitches.length,0);
 assert.equal(g.state.crown,3n);
});

test('wall destruction switches native patrol once and later ticks preserve crownward progress in the ideal model',()=>{
 const g=emptyGame({simulatePatrol:true});g.tick(60);g.tick(61);
 const enemy=g.actors.find(a=>a.prefab===1082130441&&!a.destroyed);
 g.state.waveLeft=0n;g.state.wall=1n;g.state.wallHp=2n;
 for(let t=62;t<=67;t++)g.tick(t);
 assert.equal(g.state.wall,0n);assert.equal(g.state.wallHp,0n);
 assert.equal(enemy.position[0],55);assert.equal(g.patrolSwitches.length,0);
 g.tick(68);g.tick(68);
 assert.equal(enemy.patrolTemplateId,2n);
 assert.deepEqual(g.patrolSwitches,[{actor:enemy,templateId:2n,time:68}]);
 g.tick(69);assert.equal(enemy.position[0],53);
 g.tick(70);assert.equal(enemy.position[0],51);
 g.tick(75);assert.equal(enemy.position[0],41);
 assert.equal(g.patrolSwitches.length,1);
 assert.equal(g.logs.filter(x=>x==='KINGDOM_ENEMY_BREACH').length,1);
 g.tick(91);assert.equal(enemy.position[0],9);assert.equal(enemy.destroyed,true);
 assert.equal(g.state.crown,2n);assert.equal(g.patrolSwitches.length,1);
});
test('enemy diagnostics distinguish no owned enemy and observed stationary position without claiming motion',()=>{
 const g=emptyGame();g.tick(60);g.tick(61);
 assert.ok(g.logs.includes('KINGDOM_ENEMY_SAMPLE_NONE'));
 for(let t=62;t<=71;t++)g.tick(t);
 const starts=g.logs.flatMap((s,i)=>s==='KINGDOM_ENEMY_SAMPLE_BEGIN'?[i]:[]);
 assert.equal(starts.length,2);
 for(const i of starts)assert.deepEqual(g.logs.slice(i+1,i+6),['65','8','0','20','KINGDOM_ENEMY_SAMPLE_END']);
 assert.equal(g.state.crown,3n);
});

test('archer diagnostics sample the first living archer every five seconds and compare wall identity and faction values',()=>{
 const cases=[
  {target:'wall',pairs:[[11,22]],targetLog:'WALL',hostileLog:'TRUE'},
  {target:'keep',pairs:[[11,22]],targetLog:'NOT_WALL',hostileLog:'TRUE'},
  {target:'other',pairs:[[22,11]],targetLog:'NOT_WALL',hostileLog:'FALSE'},
  {target:'wall',pairs:[[11,22]],disabled:'wall'},
  {target:'wall',pairs:[[11,22]],disabled:'archers'}
 ];
 for(const scenario of cases){
  const g=emptyGame();g.state.wall=scenario.disabled==='wall'?0n:1n;g.state.wallHp=15n;
  const dead=g.add(1082130442,[50,6,1]);dead.hp=0;
  const absent=g.add(1082130442,[50,6,2]);absent.offField=true;
  const first=g.add(1082130442,[50,6,3]);first.faction=11;
  const second=g.add(1082130442,[50,6,4]);second.faction=12;
  if(scenario.disabled==='archers'){first.hp=0;second.hp=0;}
  const wall=g.add(1077936136,[55,7.75,-4]);wall.faction=21;
  const wall2=g.add(1077936136,[55,7.75,0]);wall2.faction=22;
  const keep=g.add(1077936136,[-2,8,-3]);keep.faction=31;
  const other=g.add(1082130439,[55,6,0]);other.faction=41;
  const missingWall=g.add(1077936136,[55,7.75,4]);missingWall.offField=true;missingWall.faction=51;
  first.currentTarget={wall,keep,other}[scenario.target];second.currentTarget=wall2;
  g.state.hostilePairs=scenario.pairs;
  const diagnostics=()=>g.logs.filter(x=>x.startsWith('KINGDOM_ARCHER_'));
  g.tick(59);assert.equal(diagnostics().length,0);assert.equal(g.targetQueries.length,0);
  g.tick(60);g.tick(61);
  const expected=scenario.disabled?[]:[`KINGDOM_ARCHER_TARGET_${scenario.targetLog}`,`KINGDOM_ARCHER_WALL_HOSTILE_${scenario.hostileLog}`];
  assert.deepEqual(diagnostics(),expected,JSON.stringify(scenario));
  for(let t=62;t<=65;t++)g.tick(t);
  assert.deepEqual(diagnostics(),expected);
  g.tick(66);g.tick(66);
  assert.deepEqual(diagnostics(),[...expected,...expected]);
  assert.deepEqual(g.targetQueries,scenario.disabled?[]:[{actor:first,time:61},{actor:first,time:66}]);
  assert.deepEqual(g.hostilityQueries,scenario.disabled?[]:[61,66].flatMap(time=>[
   {fromFaction:11,toFaction:21,time},{fromFaction:11,toFaction:22,time}
  ]));
  assert.equal(first.currentTarget,{wall,keep,other}[scenario.target]);
 }
});

test('HUD selection waits for player readiness and reports observed transitions without stalling gameplay',()=>{
 const g=emptyGame({bootstrap:false});g.state.players=[];g.tick(0);assert.equal(g.layouts.length,0);
 assert.equal(g.uiStatusChanges.length,0);
 g.state.players=[1];g.tick(1,50);assert.equal(g.layouts.length,0);
 g.tick(2,5);assert.deepEqual(g.layouts,[{player:1,index:1073741825n}]);
 assert.equal(g.uiStatusChanges.length,0);
 g.state.activeLayout=12n;g.tick(3);g.tick(4);
 assert.equal(g.logs.filter(x=>x==='KINGDOM_HUD_LAYOUT_MISMATCH').length,1);
 assert.equal(g.uiStatusChanges.length,0);
 assert.ok(g.hud.length>0);
 g.tick(62);assert.equal(g.state.night,true);
 assert.equal(g.uiStatusChanges.length,0);
 g.state.activeLayout=1073741825n;g.tick(63);g.tick(64);
 assert.equal(g.logs.filter(x=>x==='KINGDOM_HUD_LAYOUT_ACTIVE').length,1);
 assert.deepEqual(g.uiStatusChanges,[{player:1,controlId:1073741843n,status:UIControlGroupStatus.Hidden}]);
 g.state.activeLayout=12n;g.tick(65);
 assert.equal(g.logs.filter(x=>x==='KINGDOM_HUD_LAYOUT_MISMATCH').length,2);
 assert.equal(g.layouts.length,1);
 assert.equal(g.uiStatusChanges.length,1);
});

test('late single-player readiness starts a full day and positions the player only once',()=>{
 const g=emptyGame({bootstrap:false});g.state.players=[];g.tick(70);assert.equal(g.state.playerReady,false);assert.equal(g.actors.length,0);
 g.state.players=[1,2];g.tick(71);assert.equal(g.teleports.length,0);
 g.state.players=[1];g.state.characters=[];g.tick(72);assert.equal(g.teleports.length,0);
 g.state.characters=[2];g.tick(73);assert.equal(g.state.playerReady,false);assert.equal(g.state.night,false);
 assert.equal(g.camera.length,0);
 assert.deepEqual(g.teleports,[{player:1,location:[5,8,0],rotation:[0,90,0]}]);
 g.tick(73);g.tick(74,5);assert.equal(g.state.playerReady,true);assert.equal(g.state.deadline,134n);
 assert.equal(g.teleports.length,1);g.tick(134);assert.equal(g.state.night,true);
 assert.deepEqual(g.camera,[{operation:'select',players:[1],name:'自定义镜头'},{operation:'follow',player:1,entity:2,name:'自定义镜头'}]);
});
test('unconfirmed arrival pauses gameplay and bounds retry requests; late arrival still recovers',()=>{
 const g=emptyGame({bootstrap:false});g.tick(0,50);g.tick(1);g.tick(4);assert.equal(g.teleports.length,1);
 g.tick(5);g.tick(10);g.tick(90);assert.equal(g.teleports.length,3);assert.equal(g.state.playerReady,false);
 assert.equal(g.state.night,false);assert.equal(g.actors.length,0);assert.equal(g.hud.length,0);
 g.state.characterPosition=[5,1,0];g.tick(91);assert.equal(g.state.playerReady,false);
 g.state.characterPosition=[5,6,20];g.tick(92);assert.equal(g.state.playerReady,false);
 delete g.state.characterPosition;
 g.tick(100,5);assert.equal(g.state.playerReady,true);assert.equal(g.state.deadline,160n);assert.equal(g.teleports.length,3);
});
test('recruit, assign, collect income and build conserve currency; staying does not repeat purchase',()=>{
 const g=emptyGame();g.tick(1,10);g.tick(3);assert.equal(g.state.coins,10n);assert.equal(g.state.idle,1n);
 g.tick(4);assert.equal(g.state.coins,10n);
 g.tick(5,20);g.tick(7);assert.equal(g.state.workers,1n);assert.equal(g.state.idle,0n);assert.equal(g.state.coins,7n);
 g.tick(8,40);g.tick(10);assert.equal(g.state.wall,1n);assert.equal(g.state.coins,3n);
 assert.deepEqual(g.actors.filter(a=>a.prefab===1077936136&&!a.destroyed).map(a=>({position:a.position,rotation:a.rotation})),[
  {position:[55,7.75,-4],rotation:[90,0,0]},{position:[55,7.75,0],rotation:[90,0,0]}
 ]);
 g.tick(60,0);assert.equal(g.state.night,true);
 g.tick(105);assert.equal(g.state.day,2n);assert.equal(g.state.bank,2n);assert.equal(g.state.coins,3n);
 g.tick(106,50);g.tick(108);assert.equal(g.state.bank,0n);assert.equal(g.state.coins,5n);
 g.tick(109,30);g.tick(111);assert.equal(g.state.archers,0n);assert.equal(g.state.coins,5n);
 g.tick(112,10);g.tick(114);g.tick(115,30);g.tick(117);
 assert.equal(g.state.idle,1n);assert.equal(g.state.archers,0n);assert.equal(g.state.coins,3n);
});

test('wall layers require two successful horizontal beams and upgrades increase thickness without raising the wall',()=>{
 const g=emptyGame();g.add(1082130440,[20,8,3]);g.state.coins=30n;g.state.playerFaction=7;
 g.state.failCounts={[1077936136]:1};g.tick(1,40);g.tick(3);
 assert.equal(g.state.wall,0n);assert.equal(g.state.wallHp,0n);assert.equal(g.state.coins,30n);
 assert.equal(g.spawnCalls.filter(a=>a.id===1077936136).length,2);
 assert.ok(g.actors.filter(a=>a.prefab===1077936136).every(a=>a.destroyed));
 assert.equal(g.factionChanges.filter(x=>x.actor.prefab===1077936136).length,0);
 g.tick(4,5);
 for(let level=1;level<=3;level++){
  const entered=5+(level-1)*4;g.tick(entered,40);g.tick(entered+2);
  assert.equal(g.state.wall,BigInt(level));assert.equal(g.state.wallHp,BigInt(level*15));
  assert.equal(g.state.coins,BigInt(30-2*level*(level+1)));
  const beams=g.actors.filter(a=>a.prefab===1077936136&&!a.destroyed);
  assert.equal(beams.length,level*2);
  assert.deepEqual(beams.slice(-2).map(a=>({position:a.position,rotation:a.rotation})),[
   {position:[55+(level-1)*0.35,7.75,-4],rotation:[90,0,0]},
   {position:[55+(level-1)*0.35,7.75,0],rotation:[90,0,0]}
  ]);
  assert.ok(beams.every(a=>a.position[1]===7.75));
  assert.ok(beams.every(a=>a.faction===7));
  assert.deepEqual(g.factionChanges.filter(x=>beams.slice(-2).includes(x.actor)).map(x=>x.coins),
   [BigInt(30-2*(level-1)*level),BigInt(30-2*(level-1)*level)]);
  g.tick(entered+2);assert.equal(g.actors.filter(a=>a.prefab===1077936136&&!a.destroyed).length,level*2);
  g.tick(entered+3,5);
 }
 g.state.coins=100n;g.tick(17,40);g.tick(19);
 assert.equal(g.state.wall,3n);assert.equal(g.state.wallHp,45n);assert.equal(g.state.coins,100n);
 assert.equal(g.actors.filter(a=>a.prefab===1077936136&&!a.destroyed).length,6);
});
test('night wave is bounded and crown defeat settles once without a silent restart at the old retry point',()=>{
 const g=emptyGame();g.tick(60);g.tick(61);assert.equal(g.actors.length,1);g.tick(61);assert.equal(g.actors.length,1);
 g.tick(66);g.tick(71);g.tick(76);assert.equal(g.actors.length,3);
 for(const a of g.actors)a.position=[9,6,0];g.tick(77);assert.equal(g.state.state,2n);assert.equal(g.state.crown,0n);
 assert.deepEqual(g.settlements,[{operation:'status',player:1,status:SettlementStatus.Defeat,time:77},{operation:'settle',time:77}]);
 const before={spawns:g.spawnCalls.length,teleports:g.teleports.length,hud:g.hud.length,coins:g.state.coins,bank:g.state.bank,deadline:g.state.deadline};
 g.tick(77);g.tick(78,5);g.tick(80);g.tick(140,10);g.tick(142);
 assert.equal(g.state.state,2n);assert.equal(g.state.crown,0n);assert.equal(g.state.day,1n);assert.equal(g.state.waveLeft,0n);
 assert.deepEqual({spawns:g.spawnCalls.length,teleports:g.teleports.length,hud:g.hud.length,coins:g.state.coins,bank:g.state.bank,deadline:g.state.deadline},before);
 assert.equal(g.settlements.length,2);assert.equal(g.logs.filter(x=>x==='KINGDOM_DEFEAT').length,1);
 assert.ok(g.actors.every(a=>a.destroyed));
});

test('defeat waits for one player and then settles once even when no character is available',()=>{
 for(const missingPlayers of [[],[1,2]]){
  const g=emptyGame();g.tick(60);g.tick(61);g.tick(66);g.tick(71);
  for(const enemy of g.actors)enemy.position=[9,6,0];
  g.state.players=missingPlayers;g.tick(72);
  assert.equal(g.state.state,2n);assert.equal(g.state.crown,0n);assert.equal(g.state.settlementRequested,false);
  assert.equal(g.settlements.length,0);const before=g.spawnCalls.length;
  g.tick(74,5);g.tick(100);assert.equal(g.state.state,2n);assert.equal(g.spawnCalls.length,before);assert.equal(g.settlements.length,0);
  g.state.players=[7];g.state.characters=[];g.tick(101);g.tick(101);g.tick(105);
  assert.deepEqual(g.settlements,[{operation:'status',player:7,status:SettlementStatus.Defeat,time:101},{operation:'settle',time:101}]);
  assert.equal(g.state.day,1n);assert.equal(g.state.night,true);assert.equal(g.state.bank,0n);
 }
});
test('archer counts do not inflict script damage; explicit engine kills avoid breaches and survivors damage walls',()=>{
 const g=emptyGame();for(let i=0;i<4;i++)g.add(1082130442,[50,6,3+i]);g.tick(60);g.tick(61);
 const keepPost=g.add(1077936136,[-2,6,-3]);
 const enemy=g.actors.find(a=>a.prefab===1082130441);
 g.tick(62);assert.equal(g.state.archers,4n);assert.equal(enemy.hp,20);assert.equal(enemy.destroyed,false);
 // The harness has no arrow simulation. Inject a lethal engine hit at the crown.
 enemy.hp=0;enemy.position=[9,6,0];g.tick(63);
 assert.equal(enemy.destroyed,true);assert.equal(g.state.crown,3n);
 assert.equal(g.logs.filter(x=>x==='KINGDOM_ENEMY_DEFEATED').length,1);
 for(const a of g.actors.filter(a=>a.prefab===1082130442))a.hp=0;
 g.state.wall=1n;g.state.wallHp=1n;const post=g.add(1077936136,[55,6,2]);g.tick(66);g.actors.filter(a=>a.prefab===1082130441)[1].position=[54,6,0];g.tick(67);
 assert.equal(g.state.archers,0n);assert.equal(g.state.wall,0n);assert.equal(g.state.wallHp,0n);assert.equal(post.destroyed,true);
 assert.equal(g.logs.filter(x=>x==='KINGDOM_WALL_HIT').length,1);
 assert.equal(keepPost.destroyed,false);
});
test('failed recruitment and profession spawn do not charge coins or consume an idle unit',()=>{
 const g=emptyGame();g.state.failPrefab=1082130439;g.tick(1,10);g.tick(3);assert.equal(g.state.coins,12n);assert.equal(g.state.idle,0n);
 g.state.failPrefab=0;g.tick(4,0);g.tick(5,10);g.tick(7);assert.equal(g.state.idle,1n);
 const recruit=g.actors.find(a=>a.prefab===1082130439);assert.equal(recruit.faction,1);
 g.state.failPrefab=1082130440;g.tick(8,20);g.tick(10);assert.equal(g.state.coins,10n);assert.equal(g.state.idle,1n);assert.equal(recruit.destroyed,false);
});
test('dead workers no longer yield income at dawn',()=>{
 const g=emptyGame(),worker=g.add(1082130440,[20,6,3]);g.tick(60);assert.equal(g.state.workers,1n);worker.hp=0;g.tick(105);assert.equal(g.state.workers,0n);assert.equal(g.state.bank,0n);assert.equal(worker.destroyed,true);
});
test('duplicate clock events and insufficient dwell do not duplicate transactions',()=>{
 const g=emptyGame();g.tick(1,10);g.tick(2,0);g.tick(3,10);assert.equal(g.state.idle,0n);
 g.tick(5);g.tick(5);assert.equal(g.state.idle,1n);assert.equal(g.state.coins,10n);
});

test('three live breaches after the spawn deadline defeat the crown before dawn, including a delayed clock event',()=>{
 for(const cutoffTick of [105,110]){
  const g=emptyGame();g.tick(60);g.tick(61);g.tick(66);g.tick(71);
  const enemies=g.actors.filter(a=>a.prefab===1082130441);
  assert.equal(enemies.length,3);
  const dead=g.add(1082130441,[9,6,0]);dead.hp=0;
  for(let i=0;i<enemies.length;i++){
   assert.equal(enemies[i].destroyed,false);enemies[i].position=[9,6,0];
   g.tick(cutoffTick+i);g.tick(cutoffTick+i);
   assert.equal(enemies[i].destroyed,true);assert.equal(dead.destroyed,true);
   assert.equal(g.state.crown,BigInt(2-i));assert.equal(g.state.waveLeft,0n);
   assert.equal(g.logs.filter(x=>x==='KINGDOM_CROWN_HIT').length,i+1);
   assert.equal(g.logs.filter(x=>x==='KINGDOM_ENEMY_DEFEATED').length,1);
   assert.equal(g.state.state,i===2?2n:1n);assert.equal(g.state.day,1n);
   assert.equal(g.state.night,true);assert.equal(g.state.bank,0n);
   assert.equal(g.logs.filter(x=>x==='KINGDOM_WAVE_CLEARED').length,0);
   assert.equal(g.logs.filter(x=>x==='KINGDOM_DAWN').length,0);
   assert.deepEqual(g.settlements,i===2?[
    {operation:'status',player:1,status:SettlementStatus.Defeat,time:cutoffTick+i},{operation:'settle',time:cutoffTick+i}
   ]:[]);
  }
  assert.equal(g.logs.filter(x=>x==='KINGDOM_DEFEAT').length,1);
 }
});

test('the spawn deadline preserves live enemies and wall combat until natural deaths clear the wave once',()=>{
 const g=emptyGame();g.tick(60);g.tick(61);
 const enemy=g.actors.find(a=>a.prefab===1082130441);enemy.position=[55,8,0];
 const wall=g.add(1077936136,[55,7.75,-4]),wall2=g.add(1077936136,[55,7.75,0]);
 const keep=g.add(1077936136,[-2,8,-3]),worker=g.add(1082130440,[20,8,3]);
 g.state.wall=1n;g.state.wallHp=2n;
 assert.equal(g.state.waveLeft,2n);assert.equal(g.state.deadline,105n);
 g.tick(105);
 assert.equal(g.state.waveLeft,0n);assert.equal(enemy.destroyed,false);assert.equal(enemy.hp,20);
 assert.equal(g.state.wallHp,1n);assert.equal(g.state.night,true);assert.equal(g.state.day,1n);
 assert.equal(g.state.deadline,105n);assert.equal(g.state.bank,0n);
 assert.equal(g.logs.filter(x=>x==='KINGDOM_WAVE_CLEARED').length,0);
 assert.equal(g.logs.filter(x=>x==='KINGDOM_DAWN').length,0);
 g.tick(106);assert.equal(g.state.wall,0n);assert.equal(g.state.wallHp,0n);
 assert.ok(wall.destroyed&&wall2.destroyed);assert.equal(keep.destroyed,false);
 assert.equal(g.logs.filter(x=>x==='KINGDOM_WALL_HIT').length,2);
 g.tick(107);
 assert.deepEqual(g.patrolSwitches,[{actor:enemy,templateId:2n,time:107}]);
 assert.equal(enemy.destroyed,false);assert.equal(g.state.night,true);assert.equal(g.state.day,1n);
 assert.equal(g.spawnCalls.filter(x=>x.id===1082130441).length,1);
 // Observe a lethal engine hit after the cutoff, even at the crown boundary.
 enemy.position=[9,8,0];enemy.hp=0;g.tick(108);g.tick(108);g.tick(109);
 assert.equal(enemy.destroyed,true);assert.equal(worker.destroyed,false);assert.equal(keep.destroyed,false);
 assert.equal(g.state.state,1n);assert.equal(g.state.crown,3n);assert.equal(g.state.coins,12n);
 assert.equal(g.state.night,false);assert.equal(g.state.day,2n);assert.equal(g.state.deadline,168n);
 assert.equal(g.state.bank,2n);assert.equal(g.state.waveLeft,0n);
 assert.equal(g.spawnCalls.filter(x=>x.id===1082130441).length,1);
 assert.equal(g.logs.filter(x=>x==='KINGDOM_ENEMY_DEFEATED').length,1);
 assert.equal(g.logs.filter(x=>x==='KINGDOM_CROWN_HIT').length,0);
 assert.equal(g.logs.filter(x=>x==='KINGDOM_WAVE_CLEARED').length,1);
 assert.equal(g.logs.filter(x=>x==='KINGDOM_DAWN').length,1);
 assert.equal(g.logs.indexOf('KINGDOM_WAVE_CLEARED')+1,g.logs.indexOf('KINGDOM_DAWN'));
 assert.deepEqual(g.settlements,[]);
});

test('failed wave spawns retain their slot and retry at a bounded cadence',()=>{
 const g=emptyGame();g.state.failPrefab=1082130441;g.tick(60);g.tick(61);
 assert.equal(g.state.waveLeft,3n);assert.equal(g.state.nextSpawn,66n);
 g.state.failPrefab=0;g.tick(62);assert.equal(g.actors.length,0);
 g.tick(66);assert.equal(g.actors.length,1);assert.equal(g.state.waveLeft,2n);
 g.tick(66);assert.equal(g.actors.length,1);
});

test('dead enemies are removed during the night without costing crown health',()=>{
 const g=emptyGame();g.tick(60);g.tick(61);const enemy=g.actors[0];
 enemy.hp=0;enemy.position=[9,6,0];g.tick(62);
 assert.equal(enemy.destroyed,true);assert.equal(g.state.crown,3n);
 assert.equal(g.logs.filter(x=>x==='KINGDOM_CROWN_HIT').length,0);
});

test('HUD publishes state and transactions with no ambiguous stage writes',()=>{
 const latest=name=>g.hud.filter(h=>h.name===name).at(-1)?.value;
 const g=emptyGame();g.tick(1,10);
 assert.equal(latest('KINGDOM_COINS'),12n);assert.equal(latest('KINGDOM_REMAINING'),59n);assert.match(latest('MCP_HUD'),/^白天/);
 assert.ok(g.hud.every(h=>h.entity===99&&h.trigger===false));
 g.tick(3);g.tick(4);assert.equal(latest('KINGDOM_COINS'),10n);assert.equal(latest('KINGDOM_IDLE'),1n);
 const count=g.hud.length;g.tick(4);assert.equal(g.hud.length,count);
 g.tick(60,0);g.tick(61);assert.match(latest('MCP_HUD'),/^夜晚/);assert.equal(latest('KINGDOM_REMAINING'),44n);
 g.tick(62,5);g.tick(64);g.tick(65);assert.equal(latest('KINGDOM_DAY'),1n);assert.equal(latest('KINGDOM_COINS'),10n);
 g.state.stageEntities=[];const before=g.hud.length;g.tick(66);assert.equal(g.hud.length,before);
 g.state.stageEntities=[99,100];g.tick(67);assert.equal(g.hud.length,before);
});

test('exploration rewards require dwell, survive revisits, and reset only with a new run',()=>{
 const g=emptyGame();g.tick(1,-20);g.tick(2,0);assert.equal(g.state.coins,12n);
 g.tick(3,-20);g.tick(5);assert.equal(g.state.coins,18n);assert.equal(g.state.groveFound,true);
 g.tick(6);g.tick(7,0);g.tick(8,-20);g.tick(10);assert.equal(g.state.coins,18n);
 g.tick(11,-40);g.tick(13);assert.equal(g.state.coins,28n);assert.equal(g.state.ruinsFound,true);
 g.tick(60);assert.equal(g.state.night,true);assert.equal(g.state.deadline,105n);
 g.tick(61,5);g.tick(66);g.tick(71);
 for(const enemy of g.actors)enemy.position=[9,6,0];g.tick(72);g.tick(75);
 assert.equal(g.state.groveFound,true);assert.equal(g.state.ruinsFound,true);assert.equal(g.state.coins,28n);
 g.restartStage();assert.equal(g.state.groveFound,false);assert.equal(g.state.ruinsFound,false);assert.equal(g.state.coins,12n);
 g.tick(0,5);g.tick(1);g.tick(2,-40);g.tick(4);assert.equal(g.state.coins,22n);
});

test('fall return requests are throttled and never pause the night or restore economy',()=>{
 const g=emptyGame();g.state.coins=7n;g.state.bank=4n;g.state.characterPosition=[20,-1,0];
 const before=g.teleports.length;g.tick(59);assert.equal(g.teleports.length,before+1);
 g.tick(60);assert.equal(g.state.night,true);assert.equal(g.state.coins,7n);assert.equal(g.state.bank,4n);
 g.tick(61);assert.equal(g.teleports.length,before+1);assert.equal(g.actors.length,1);
 g.tick(64);assert.equal(g.teleports.length,before+2);
 delete g.state.characterPosition;g.tick(65,5);assert.equal(g.teleports.length,before+2);
 assert.equal(g.state.deadline,105n);assert.equal(g.state.groveFound,false);
});

test('off-path height/depth cannot claim caches; ambiguous players cannot be rescued',()=>{
 const g=emptyGame();g.state.characterPosition=[-20,6,15];g.tick(1);g.tick(3);assert.equal(g.state.coins,12n);
 g.state.characterPosition=[-40,-1,0];g.tick(4);g.tick(6);assert.equal(g.state.coins,12n);
 const before=g.teleports.length;g.state.players=[1,2];g.tick(15);assert.equal(g.teleports.length,before);
 g.state.players=[1];g.state.characters=[];g.tick(20);assert.equal(g.teleports.length,before);
 g.state.characters=[2];g.tick(21);assert.equal(g.teleports.length,before+1);
 delete g.state.characterPosition;g.tick(22,5);g.tick(24);assert.equal(g.state.state,1n);assert.deepEqual(g.settlements,[]);
});


test('unopposed first wave can reach the crown before dawn in the ideal native patrol model',()=>{
 const g=emptyGame({simulatePatrol:true});
 for(let t=1;t<=104;t++){g.tick(t,0);if(g.state.state===2n)break;}
 assert.ok(g.logs.includes('KINGDOM_DEFEAT'),'night must permit the unopposed wave to reach the crown');
 assert.equal(g.state.crown,0n);assert.equal(g.state.day,1n);
});


test('a purchased guard is counted while explicit engine deaths clear the first wave in the ideal patrol model',()=>{
 const g=emptyGame({simulatePatrol:true});
 g.tick(1,10);g.tick(3);g.tick(4,30);g.tick(6);
 assert.equal(g.state.archers,1n);assert.equal(g.state.coins,6n);
 for(let t=7;t<=105;t++){
  const living=g.actors.filter(a=>a.prefab===1082130441&&!a.destroyed&&a.hp>0);
  g.tick(t,0);
  for(const enemy of living){assert.equal(enemy.hp,20);assert.equal(enemy.destroyed,false);enemy.hp=0;}
 }
 assert.equal(g.logs.filter(x=>x==='KINGDOM_ENEMY_SPAWN').length,3);
 assert.equal(g.logs.filter(x=>x==='KINGDOM_ENEMY_DEFEATED').length,3);
 assert.equal(g.logs.includes('KINGDOM_DEFEAT'),false);
 assert.equal(g.state.crown,3n);assert.equal(g.state.day,2n);
 assert.equal(g.actors.filter(a=>a.prefab===1082130441&&!a.destroyed).length,0);
 assert.deepEqual(g.settlements,[]);
});
