"""Farm: a grow-and-sell loop, the third kind of game built with these tools (after examples/kingdom4 and examples/hop).

It follows the structure of the official farming sample: state lives on the things themselves, the player's action is a
skill, and the character's graph only passes the action on.

Side on, walking along x. Climbing is off in the class and a wall stands at each end.
  x -1    the seed basket: F takes seeds
  x  3    the rake: F takes the rake; the first tool taken also puts the "use" skill on the E key
  x 10    plot 1, x 15 plot 2 (each knows its own stage and whether a character stands on it)
  x 21    the stall: F sells the fruit in the backpack, one point each

A plot's stages: 0 wild, 1 tilled (use the rake on it), 2 planted (use seeds on it), 3 sprouting (four seconds later),
4 ripe (four more seconds). The ripe crop is a prefab of its own with an option, 收获: the fruit goes into the
character's backpack as currency and the plot is back at tilled.

Graphs (the last argument picks one):
  stage   (关卡实体)             puts everything down; reports where the character is; loses when the clock runs out
  rake    (FM_rake)             option: the player's tool becomes 1, the skill is handed out
  seeds   (FM_seeds)            option: the player's tool becomes 2, the skill is handed out
  plot    (FM_plot)             its trigger keeps "here"; hears the signal FM_use with the tool as a string and acts if
                                somebody is here; its own timer grows the crop; the looks are prefabs it owns
  ripe    (FM_ripe)             option: one fruit into the backpack, its plot back to tilled, itself removed
  stall   (FM_stall)            option: fruit out of the backpack, points onto the player; wins at the goal
  hero    (character template)  hears the skill and sends FM_use with the player's tool
  player  (player template)     prints the score when it changes
  use     (client skill graph)  tells the server the key was pressed

Usage: python gen_farm.py <guids.json> <out.ts> <ignored x3> [points to win] <graph>
Prints: FM_READY, FM_GO, FM_AT x, FM_TOOL n, FM_TILL, FM_PLANT, FM_SPROUT, FM_RIPE, FM_HARVEST, FM_FRUIT n, FM_SOLD,
FM_EMPTY, FM_SCORE n, FM_VICTORY, FM_TIME_UP."""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
GOAL = int(sys.argv[6]) if len(sys.argv) > 7 else 2
P = {n: guids['prefab:FM_' + n] for n in ('rake', 'seeds', 'plot', 'seedling', 'sprout', 'ripe', 'stall')}
FRUIT, USE = guids['currency:FM_fruit'], guids['skill:FM_use']
NO_TAGS = '[] as bigint[]'
HEAD = f"""/// <reference types="genshin-ts" />
import {{ g, defineSignal }} from 'genshin-ts/runtime/core'
import {{ CharacterSkillSlot, SettlementStatus, TopOfStackSkillDestructionType }} from 'genshin-ts/definitions/enum'

// Farm, graph "{which}": see examples/farm/gen_farm.py.
// The signal FM_use carries the tool in hand as a string.
const use=defineSignal('FM_use',[['tool','str']] as const)
"""
SERVER = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}})"
STR = lambda v: f"f.dataTypeConversion({v},'str')"
ONE_PLAYER = """const players=f.getListOfPlayerEntitiesOnTheField();
  if(players.length!==1)return;"""


def create(prefab, x, y, z, owner='stage'):
    return f"f.createPrefab({P[prefab]},[{x},{y},{z}],[0,0,0],{owner},false,1,{NO_TAGS});"


def take(tool):
    """A tool is taken: the player's variable, and the use skill on E (taking it again just replaces it)."""
    return SERVER + f"""
.on('whenTabIsSelected',(evt,f)=>{{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  f.setCustomVariable(player,'tool',{tool}n,true);
  f.addCharacterSkill(evt.selectorEntity as any,{USE},CharacterSkillSlot.Skill1E,TopOfStackSkillDestructionType.Destroy);
  f.printString('FM_TOOL');f.printString('{tool}');
}})
"""


# The crop on a plot is whatever the plot owns: the old look is removed and the new one created at the plot's place.
SHOW = lambda prefab: (f"for(const old of f.getListOfEntitiesOwnedByTheEntity(self))f.removeEntity(old);\n"
                       f"    f.createPrefab({P[prefab]},f.create3dVector(at.xComponent,at.yComponent+0.5,at.zComponent),[0,0,0],self,false,1,{NO_TAGS});")
PLACE = "const at=f.split3dVector(f.getEntityLocationAndRotation(self).location);"

BODY = {
    'stage': SERVER + f"""
.on('whenEntityIsCreated',(evt,f)=>{{
  f.startTimer(evt.eventSourceEntity,'FM_SETUP',false,[2]);
  f.startTimer(evt.eventSourceEntity,'FM_WHERE',true,[2]);
  f.printString('FM_READY');
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  {ONE_PLAYER}
  const stage=evt.eventSourceEntity;
  if(evt.timerName==='FM_WHERE'){{
    for(const hero of f.getAllCharacterEntitiesOfSpecifiedPlayer(players[0])){{f.printString('FM_AT');f.printString({STR('f.split3dVector(f.getEntityLocationAndRotation(hero).location).xComponent')});}}
    return;
  }}
  if(evt.timerName!=='FM_SETUP')return;
  {create('seeds', -1, 0, 2.5)}
  {create('rake', 3, 0, 2.5)}
  {create('plot', 10, 0, 2.5)}
  {create('plot', 15, 0, 2.5)}
  {create('stall', 21, 0, 3.5)}
  f.printString('FM_GO');
}})
.on('whenGlobalTimerIsTriggered',(evt,f)=>{{
  {ONE_PLAYER}
  f.printString('FM_TIME_UP');
  f.setPlayerSettlementSuccessStatus(players[0],SettlementStatus.Defeat);
  f.settleStage();
}})
""",
    'rake': take(1),
    'seeds': take(2),
    'plot': SERVER + f"""
.on('whenEnteringCollisionTrigger',(evt,f)=>{{
  f.setCustomVariable(evt.triggerEntity,'here',true,true);
}})
.on('whenExitingCollisionTrigger',(evt,f)=>{{
  f.setCustomVariable(evt.triggerEntity,'here',false,true);
}})
.onSignal(use,(evt,f)=>{{
  // Every plot hears the signal; only the one somebody stands on acts.
  const self=f.getSelfEntity();
  if(!f.getCustomVariable(self,'here').asType('bool'))return;
  const stage=f.getCustomVariable(self,'stage').asType('int');
  if(stage===0n&&evt.params.tool==='1'){{
    f.setCustomVariable(self,'stage',1n,true);
    f.printString('FM_TILL');
    return;
  }}
  if(stage===1n&&evt.params.tool==='2'){{
    {PLACE}
    {SHOW('seedling')}
    f.setCustomVariable(self,'stage',2n,true);
    f.startTimer(self,'FM_GROW',false,[4,8]);
    f.printString('FM_PLANT');
  }}
}})
.on('whenTimerIsTriggered',(evt,f)=>{{
  if(evt.timerName!=='FM_GROW')return;
  const self=evt.eventSourceEntity;
  {PLACE}
  // The places in a timer's sequence are numbered from 0.
  if(evt.timerSequenceId===0n){{
    {SHOW('sprout')}
    f.setCustomVariable(self,'stage',3n,true);
    f.printString('FM_SPROUT');
    return;
  }}
  {SHOW('ripe')}
  f.setCustomVariable(self,'stage',4n,true);
  f.printString('FM_RIPE');
}})
""",
    'ripe': SERVER + f"""
.on('whenTabIsSelected',(evt,f)=>{{
  // The fruit goes into the backpack of the character that picked it (currency is held by the character).
  f.modifyInventoryCurrencyQuantity(evt.selectorEntity,{FRUIT},1n);
  f.printString('FM_HARVEST');
  f.printString('FM_FRUIT');f.printString({STR(f'f.getInventoryCurrencyQuantity(evt.selectorEntity,{FRUIT})')});
  // The crop belongs to its plot, which is tilled again.
  f.setCustomVariable(f.getOwnerEntity(evt.eventSourceEntity),'stage',1n,true);
  f.removeEntity(evt.eventSourceEntity);
}})
""",
    'stall': SERVER + f"""
.on('whenTabIsSelected',(evt,f)=>{{
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.selectorEntity as any);
  const fruit=f.getInventoryCurrencyQuantity(evt.selectorEntity,{FRUIT});
  if(fruit<1n){{f.printString('FM_EMPTY');return;}}
  f.modifyInventoryCurrencyQuantity(evt.selectorEntity,{FRUIT},0n-fruit);
  const score=f.getCustomVariable(player,'score').asType('int')+fruit;
  f.setCustomVariable(player,'score',score,true);
  f.printString('FM_SOLD');
  if(score<{GOAL}n)return;
  f.printString('FM_VICTORY');
  f.setPlayerSettlementSuccessStatus(player,SettlementStatus.Victory);
  f.settleStage();
}})
""",
    'hero': SERVER + f"""
.on('whenSkillNodeIsCalled',(evt,f)=>{{
  if(evt.parameter1!=='FM_use')return;
  const player=f.getPlayerEntityToWhichTheCharacterBelongs(evt.callerEntity as any);
  f.sendSignal(use,{STR("f.getCustomVariable(player,'tool').asType('int')")});
}})
""",
    'player': SERVER + f"""
.on('whenCustomVariableChanges',(evt,f)=>{{
  if(evt.variableName!=='score')return;
  f.printString('FM_SCORE');
  f.printString({STR("evt.postChangeValue.asType('int')")});
}})
""",
    'use': f"""g.characterSkill({{id:{guids['graph:id']},name:'{guids['graph:name']}',prefix:false}})
.on('start',(evt,f)=>{{
  f.notifyServerNodeGraph('FM_use','','');
}})
""",
}
CLIENT_HEAD = """/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'

"""
open(sys.argv[2], 'w', encoding='utf-8', newline='\n').write((CLIENT_HEAD if which == 'use' else HEAD) + BODY[which])
print('written', sys.argv[2], which)
