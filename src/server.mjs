#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { toolRegistry, toolError } from './tool-registry.mjs';
import { connectCore } from './host/core-client.mjs';
import fs from 'node:fs';

const WORKFLOW=`Building a level with these tools. This is the path the worked examples at the end were built by.
Every tool that changes a save writes a copy and returns its mapPath: pass that mapPath to the next call. Tools marked [UI]
drive the game window (mouse and keyboard) and need the game in the Miliastra lobby or editor; they return a runId, and
playtest_status gives the outcome.

0. Read miliastra://platform-rules. It lists what the engine does and does not do, each item measured in a playtest.
   Then read miliastra://knowledge: how the platform itself builds a game (components, systems, how official samples
   organise their graphs). search_knowledge / read_knowledge give the full official guide and course offline. Before
   writing a mechanic by hand, search for it: collision triggers, option tabs, timers, currency, shops and UI text
   already exist as components, and official games are many small event-driven graphs on the entities concerned,
   not one big graph polling the scene.

1. Look at what is there.
   list_maps, inspect_map (node graphs and their ids), scene_list_entities, scene_list_prefabs, scene_list_factions,
   scene_get_level_settings, scene_list_cameras.
   A brand-new map works too (verified on a blank map, scripts/dev/fresh_map_round.mjs): the creator makes the save
   in the game (我的奇域 → 新建存档), changes anything and saves once so that the file is written.

2. Scene.
   Before placing anything read_knowledge {id:"scene-dressing.zh-CN"}: a scene is made for the camera (set the camera
   first), in layers from near to far, in groups with open ground between them, on more than one kind of ground. A
   flat lawn with things in a row behind it is what comes out otherwise.
   scene_search_assets and scene_asset_images: choose assets by looking at them (many share a name). Ask for all the
   kinds of thing the scene needs in one call (queries: ["围栏", "火盆", "石地板", ...]); effect_catalog and
   sound_catalog take queries the same way.
   scene_build_blocks: a list of pieces becomes an asset pack. A piece that should appear later gets createAtStart false.
     A character walks over low things by itself: with jumping allowed it went over a stone fence of 1.56 m without
     a key being pressed. What keeps a player in is a wall of at least 2.4 m and a class that may not climb
     (scene_set_class); walk into it in a playtest (trackPlayer shows where the walk stopped) before a game relies on it.
     Rails and low walls of about a metre are walked onto even with jumping and climbing off. Where a high wall
     would hide the view (a side-on level), put an invisible wall there: a prefab of the empty model with extraCollision
     (scene_add_components). The sizes in the catalogue are not always those in play: lay one floor piece, run a
     playtest with trackPlayer and read how high the character stands before placing the rest by that height.
   [UI] editor_open_map: open a copy of the base map in the editor.
   [UI] scene_import_assets: import the packs and save. Its overview picture is taken in the editor, from above and in
     the light of the editor. To see the scene as the player will (the camera of the level, the sky of the level, how
     high the character stands), play it for a few seconds right away: playtest_start {mapPath, durationSeconds: 4,
     screenshotsAt: [3]} with no graph names skips the log window and is the quickest playtest there is; with
     trackPlayer: 0.5 it also says how high the character stands (that reads the log: half a minute more). Do it
     before building rules on a scene: a floor that is thinner than the catalogue says, a sky that is too bright or
     a camera that looks at a wall cost one short playtest now and a whole round later.
   scene_list_entities: the GUIDs the editor gave the pieces (new on every import; a graph must use these).
   scene_remove_entities takes placed pieces out of a copy again (by names or by a name prefix): importing can only
     add, so this is how a piece laid in the wrong place goes without starting over from the base map.

3. Settings, each on the mapPath returned by the step before.
   scene_batch runs a whole list of these steps (settings, prefabs, components, graphs, skills, bars) in one call, each
   on the save of the one before: write the list once, send it, and correct the step it stops at.
   scene_set_camera: distance and field of view, and the view itself. A side-view or a top-down game needs its view
   LOCKED, or the first movement of the mouse turns the camera and the level stops being what it was built as:
   fixedView {yaw: 0, pitch: 22} is a side view from the -z side (A and D walk along x), {yaw: 0, pitch: 55} looks
   down on an arena. The player cannot turn it, and it does not jump at walls that come between it and the character.
   Without fixedView the camera is free and starts behind the character: with the start facing +z
     (scene_set_spawn rotation [0,0,0], the default) it looks from the -z side and A and D walk along x, which is the
     side-on view the examples use. A start turned another way turns the camera with it, and D no longer walks along x.
   scene_add_prefab: one prefab for each thing the graph will create while the game runs (coins, a wall that is bought,
     markers), at the size you want. Created by its bare asset id a thing always has its natural size.
     scene_update_prefab changes one that exists (its scale, its model, its health) and keeps its id, components and
     graphs: how a thing is put right after it was seen in a playtest, without making and wiring it again.
     Chests, levers and doors exist ready-made (scene_search_assets group "交互机关"): a prefab of one comes with a
     preset status, its built-in animation, and a graph plays it with f.setPresetStatus(entity, statusId, 1n). Use
     these before building a door out of a block and a motion. read_knowledge {id:"preset-status.zh-CN"} lists them.
     A creature prefab is made from a creature placed in the scene (fromEntity). health gives a thing more than the
     one hit an object takes by default; drop makes the prefab something that lies on the ground and is picked up.
   scene_set_faction_hostility: usually [[1,3]], players and creatures fight and objects are left alone. With the default
     relations the player's allies attack every object a graph creates.
   scene_set_level_settings {aggroMode:"custom"}: needed when the graph decides whom creatures go for
     (f.setTheAggroValueOfSpecifiedEntity). This is how enemies are sent to a far target: left to themselves
     creatures notice a player only within a few metres. The target has to be their enemy, and the order has to
     come a moment after the creature appears. The player's own creatures (archers, soldiers) need the same order
     in this mode: one that was given no target stands where it is.
   scene_set_spawn: where players start and which way they face (no teleport at the start is needed);
     scene_add_preset_point: named places a graph reads with f.queryPresetPointPositionRotation(pointId).
   scene_add_respawn_point: where a character that went down comes back. Dying and coming back are built into the
     platform (the revive screen, lives with f.setPlayerRemainingRevives, checkpoints with f.activateRevivePoint): a
     level in which the player can die or fall needs at least one, or there is nowhere to come back to.
   scene_set_revive: how the character comes back (the wait, by itself or by a button, how many lives).
   scene_set_player_count: how many players the published level takes. A new map says 1 to 8; a game made for one
     player says {min: 1, max: 1}.
   scene_set_class (scene_list_classes): what the player's character may do (jump, sprint, climb, glide), which
     camera template it uses, and its base health, attack and defence (10000, 500 and 500 on a new map: a game in
     which the player can lose a fight sets a health its enemies can wear down). A side-scroller switches jumping off here; with climbing on, a character pushed against
     a wall two and a half metres high climbs over it.
   These three are verified in play, all four class switches included.

4. Components and graphs: build it the platform's way (verified end to end, examples/events).
   A level is many small graphs, each on the thing it is about, started by events. Do not poll positions on a timer.
   scene_add_components: give a prefab a collision trigger (walking in or out raises whenEnteringCollisionTrigger /
     whenExitingCollisionTrigger), an option tab (the native "press F" prompt; whenTabIsSelected), custom variables
     (state kept on the entity; on prefab "player" it is per-player state such as score or coins).
   scene_add_graph: one empty graph per thing. attachToPrefab puts it on a prefab so that every copy runs its own
     instance and hears its own events; "player" and "character" are the built-in templates; without it the graph goes
     on the stage entity, which is for level-wide things and is the only place that hears whenEntityIsDestroyed.
     attachToPrefab may be a list: one graph on several prefabs that behave alike (a wooden and a stone wall).
   scene_add_components also gives a prefab: motions (a gate that rises once; a platform that goes there and back for
     ever; a thing that spins), follow (a pickup that flies to the player), minimapMarker (an icon on the minimap),
     hurtBox (so that the piece can be hit), abilityUnits (ready-made attacks and heals a graph launches by name),
     launcher (the piece flings the characters that touch it: a bounce pad, a bumper, a gust; no graph needed),
     extraCollision (shapes that stop a character whatever the model looks like: on a prefab of the empty model,
     asset 10005018, a wall nobody sees; the empty model has a collision block of its own, about a metre, so give it
     solid false when it only carries a trigger or a marker),
     loot (what it leaves behind when destroyed), and projectile with hitDetection (a bullet: it flies from the moment
     f.createProjectile makes it and strikes what it touches; examples/shoot).
   scene_list_components shows what a prefab carries.
   scene_add_signal: a level-wide broadcast, f.sendSignal('name') in one graph and .onSignal('name', ...) in any
     number of others: dawn, "the wall fell", "round over". Use it instead of one graph reaching into many entities.
   scene_add_global_timer: a countdown the stage or the player holds (f.startGlobalTimer; whenGlobalTimerIsTriggered
     when it ends); scene_add_timer_display puts it on the screen as a clock. For plain delays inside one graph
     f.startTimer needs no tool.
   scene_add_light: a lamp that belongs to one sky, so lamps for the night are lit only at night.
   The lines above are verified in play.
   scene_add_unit_status also makes what pickups and hazards do to a character: faster or slower (speedPercent),
   invincible, a higher jump (superJump), held in place (rooted), for some seconds or until a graph takes it off (examples/hazards).
   scene_add_unit_status: an outline (or see-through) that a graph puts on an entity and takes off: the way to say
     "you can interact with this" without text. scene_add_environment: a second sky (night); a graph switches to it
     with f.modifyEnvironmentSettings(environmentId, players, false, 0n). Day and night are two skies made with this tool
     (hour 0, and hour 11 without stars) that the graph switches between. Verified in play.
     A sky made by the tool is written the way the editor fixes one at an hour (every brightness and colour of the
     map's own sky taken at that hour): a day sky looks like the sky of the map at that hour, a night sky is dark
     (examples/hazards/hazards_sky.json, seen in play 2026-10-13; before that day the day sky came out far too bright).
   A skill gets its cooldown from a graph: f.setCharacterSkillCd(character, CharacterSkillSlot.Skill1E, seconds, false)
   when it has been used; a press during the wait is refused (examples/skills/skills_cd_test.json).
   scene_add_skill: a key the player presses (E, Q, the attack button). The skill runs a small client graph that tells
     the server, and a graph on the character template hears whenSkillNodeIsCalled: this is how a player does anything
     beyond walking and the F prompt (throw, build here, use the tool in hand). type "normal" also plays a character
     animation (a sword swing, raking, reaching out) and runs the graph at a chosen moment of it. Verified in play.
     A skill hits when its client graph triggers a hit box; what it hits needs a hurt box (creatures have one, objects
     get one from scene_add_components {hurtBox}). examples/strike is the working sword attack.
   scene_add_currency: the platform's own money, held in a backpack on the character; graphs read and change it with
     f.getInventoryCurrencyQuantity / f.modifyInventoryCurrencyQuantity. Verified in play (examples/farm keeps its
     fruit this way; the other examples keep a purse in a player variable, which a progress bar can show).
   scene_add_item, scene_add_shop: things held in the backpack in numbers, and the platform's own shop screen on a
     stall that sells and buys them for currency (f.openShop(player, stall, 1)); no graph is needed for the buying
     and selling themselves. Verified in play (examples/shop). A drop (scene_add_prefab {drop}) lies on the ground
     and gives an item when picked up; loot (scene_add_components {loot}) is what a destroyed thing leaves behind.
     Verified in play (examples/drops). A consumable item runs an item graph when the player uses it from the
     backpack (scene_add_graph {kind:"item"}, scene_add_item {category:"consumable", useGraphId}; examples/potion).
   scene_add_button: a button on the screen the player presses with a number key, anywhere and at any time; the
     graph on the player template hears whenUiControlGroupIsTriggered. Verified in play (examples/buttons).
   scene_add_progress_bar: a bar on the screen that follows a player variable (purse, countdown, health of the thing
     to defend). On an account of 奇匠 level 1 text boxes do not show in play; bars do. scene_list_interface lists the screen.

   Units that act by themselves: complex creatures. An ordinary creature only does what its asset was built to do
   (notice an enemy, chase, hit); it cannot be told to walk somewhere, work or wait. A complex creature (an asset of
   the group "怪物(AI版)", 48 of them: scene_search_assets {group:"怪物(AI版)"}) does what its graphs say. Place one
   with createAtStart false, import, scene_add_prefab {fromEntity}; then
     scene_add_graph {kind:"creatureStatus"}: one graph per behaviour, a short list of tactics each with a condition
       (walk to a point, walk to an entity, wander, pursue, flee, patrol, turn, stand still) and f.executeSkill;
     scene_add_graph {kind:"creatureDecision"}: runs all the time and switches to the status graph that fits;
     scene_add_creature_skill: an animation of the creature (creature_animations lists them by name) and a
       creatureSkill graph that runs at a moment of it (a hit box, a call to the server);
     scene_set_creature_logic: gives the prefab its decision graph, its skills with their cooldowns, and logic:
       how far it notices enemies by itself (noticeRadius), how far it follows them, how big its territory is.
   These graphs read custom variables of the creature itself, of its aggro target and of the stage entity only, so a
   server graph steers a unit by writing variables on it (where to go, what its job is) and on the stage (night).
   A skill's call (f.notifyServerNodeGraph) is heard by a server graph attached to that same creature.
   Tactics that choose their own points (wandering, pursuit) need the level's navigation mesh:
   playtest_start {bakeNavigation:true}.
   Fighting is the platform's own, do not fake it with effects and counters, and every attack has to be the one the
   creature's animation shows. The models come with empty hands: creature_animations {creature} says what a creature
   can hold (inItsHands), what an attack animation is (what) and the millisecond of it that counts (atMs = the
   graphAtMs of the skill). What is held is a looping effect that is a model (effect_catalog: 单手剑, 飞刀, 镐; there
   is no crossbow, gun, shield, axe or club) on GI_WeaponR / GI_WeaponL: mounted for good by a server graph, or shown
   by the skill while its animation holds it (scene_add_creature_skill {effect}). A stroke is a hit box the skill
   graph triggers (f.triggerSectorHitboxAtSpecificLocation with TargetType.HostileFaction), which takes health off
   enemies that have a hurt box; a shot or a throw is a projectile prefab (scene_add_components projectile type
   "tracking", hitDetection factions "hostile" with an ability unit) launched with f.createProjectile at the
   creature's aggro target. Health, health bars, damage numbers and deaths are the platform's; whenAttackHits,
   whenAttacked and whenEntityIsDestroyed tell.
   read_knowledge {id:"complex-creatures.zh-CN"} has the forms of the three graphs and what was measured;
   examples/brain is the small working one, examples/skirmish the one with units that work, guard and fight,
   examples/kingdom6 a whole game made of them.
   Verified in play; look at a fight from close up (a recording, frame by frame), not only at its prints.

5. Rules (server node graphs written in Genshin-TS).
   search_node_docs: what a graph can call and listen to, with every parameter explained; ask for everything a graph
   needs in one call (queries: ["createPrefab", "teleportPlayer", "when timer", ...]). effect_catalog: special effects.
   write_graphs {mapPath: the last save so far, graphs: [{graphId: the id scene_add_graph returned, code}...]}
   type-checks, compiles and writes every graph of the call and returns the save to play, with the size of each
   graph; a graph with an error is named with its errors and the ones before it are written.
   It compiles the graphs of a call together (a level of forty graphs in a third of a minute): send them all in one
   call, and after a change only the graphs that changed, on the save that has the others.
   The target graph must exist in the map: an empty server graph, or one whose name starts with _GSTS.
   Source rules: bigint for integers (1n), number for floats; no async, promises or recursion; no bare { } block (a
   block is only the body of an if, a loop or a handler: the compiler says "block is not supported"); one graph per project.
   whenCustomVariableChanges is typed: read evt.postChangeValue.asType(...) as the variable's real type, or it never fires.
   An event is heard only where the platform sends it, and a listener in the wrong place fails silently: destroyed
   things report to the stage entity, buttons to the player, skills to the character, the events of an item to the
   item's own item graph. read_knowledge {id:"event-receivers.zh-CN"} has the table; check it before writing a listener.
   Keep graphs small: the editor refuses a graph above 3000 by its own count, in which each read or write of a graph
   variable is 4, each loop over a list 20 and each counting loop 15 (write_graphs returns that count as limits.editorCount and warns).
   A graph has at most 100 variables.
   Keep the work per second small too: the server ends a level when, each second, nodes run plus about 20 for every
   round of a loop go above roughly 1400 (measured). Event-driven graphs stay far below this; a looping timer that
   walks long lists several times a second does not.

6. Feedback: what the player hears and sees.
   A level whose rules work but in which nothing answers the player reads as a prototype (a person who played our
   first games said so). Go through the moments the player lives through and give each a sound and a sight: picked
   up, bought, refused, "this can be used now", what it costs, danger coming, the situation changed, hit, destroyed,
   robbed, won, lost. read_knowledge {id:"feedback.zh-CN"} lists them, with how the official lessons do it and what
   examples/kingdom5 uses for each.
   effect_catalog {query, kind}: the platform's effects by their Chinese names, with pictures. kind "timed" plays once
     (f.playTimedEffects: a flash, dust, a hit, fireworks), "looping" stays until cleared (f.mountLoopingSpecialEffect:
     among them markers, arrows and question marks to point things out, and an arrow to fly at a target).
   sound_catalog {query, category}: sounds; f.playerPlaysOneShot2dSoundEffect(player, id, volume, speed) plays one,
     no component needed.  music_catalog {category}: background music; f.modifyPlayerBackgroundMusic changes it at
     any moment (one piece for the day, another for the night).
   scene_add_text_box puts words and numbers that follow variables on the screen, for accounts of 奇匠 level 2 and up.
   scene_add_image puts a picture or a coloured rectangle on the screen (a dark panel behind the bars, an icon
   beside a bar): a way to say something without words. image_catalog shows the pictures there are, by category,
   each with its id (hearts, keys, swords, stars, coins, potions, frames, portraits of creatures).
   A screen that moves, answers the mouse or any key, a menu, a whole 2D game: a client interface (game 7.1).
   scene_set_client_script puts a Lua script into the save, scene_add_client_ui a tree of client controls with the
   script on its root (pictures, mouse areas, grids, buttons), scene_add_client_template a control the script makes
   copies of at run time; the script draws the controls and changes them every frame if it wants. A graph tells it
   something that lasts by setting a custom variable (the script hears the change) and something of the moment by
   a signal to the player's scripts (f.sendSignal('client:NAME', player), heard with
   script:RegisterServerSignalHandler); it tells a graph by a signal (game.ServerSignal(name):SendSignal(), heard
   with .onSignal). One script serves several controls when its variables are public and each control gives its
   own values (script: {name, values}). The canvas is 1600 x 900 on a computer and 1280 x 720 on a phone: hang
   what belongs at an edge on that edge with anchor, or give the control devices {mobile: {...}}. playtest_start returns what the script prints
   with the prints of the graphs, a fault in the script among them with its line. scene_remove_client takes an
   interface, a template or a script out again. Read read_knowledge {id:"client-lua.zh-CN"} before writing one:
   Names are checked before the game is asked: scene_set_client_script refuses a script that does not compile and
   lists what it names that the API or the save does not have; scene_check_client does the same for the whole save
   once the graphs are in. A round that changes only Lua is about a minute (playtest_start writes the scripts beside
   the open save instead of importing), and expect {prints} makes the playtest answer passed or what was missing.
   OnUpdate runs only after script:EnableUpdate(true), a tween does nothing until :Play(), a preset button needs
   a hover state, the script starts seconds before the play does, Color takes 0 to 255, the fill of an image (a
   bar, a cooldown ring) shows only on an image with its mask on.
   On an account of 奇匠 level 1 no custom text shows, not even the text of an option (only its icon). Say a price
   with a row of things over the station, "possible now" with a marker over it, a refusal with a question mark, a
   quantity with a bar whose maximum is 10 (the bar prints a percentage).
   A value read from an entity is fetched when the node that uses it runs, not where the line stands: use what you
   read from a thing before you remove the thing (f.removeEntity), or you read nothing.
   Verified in play (examples/kingdom5).

7. Play.
   [UI] playtest_start {mapPath: the save write_graphs returned, graphNames: every graph whose prints you want
   (only ticked graphs show in the log, ten at most), durationSeconds, screenshotsAt, inputs}. An input is a key, a
   mouse click or a click on a word on the screen (for the shop and the backpack); readTextAt returns the text on the
   screen at chosen seconds. recordAudio records the sound of the playtest (nobody is listening to it): playtest_status
   then says how loud each second was and when sounds began. A script that walks by holding a key for a set time lands within a metre, not on the
   spot. When the place matters, put the player there: an input {at, teleport: [x, y, z]} stands the player on that
   spot at that second of the play, and trackPlayer: 0.5 records where the player is twice a second (playerTrack in
   playtest_status), which also dates every print in play seconds, the clock of the screenshots and the inputs (the
   level clock of the prints starts a few seconds earlier, a different few every run). Walk with held keys where the
   walk itself is what is being tested.
   playtest_status {runId, waitSeconds: 45} answers when the run has ended or 45 seconds have passed: repeat it while
   state is "running" instead of asking every few seconds.
   playtest_status: read the prints (f.printString in the graph) and look at the screenshots. "succeeded" only means the
   level was played; whether the game is right is for you to judge from what you see. If the level ended before the
   planned time, levelEndedAt is the second it did, and serverMessage is the reason when the server gave one.
   playtest_frames: motion is judged frame by frame. Prints said every blow landed while a thrower held a bow and threw
   a knife, and the knife left a quarter second before the hand opened: only pictures show that. Photograph the
   seconds of an attack with a burst (playtest_start bursts: [{from, to}], about seven frames a second), then
   playtest_frames {runId, fromSeconds, toSeconds, crop} puts them side by side, cut to the place and labelled with
   their second. Before an attack goes into a game, look at its animation by itself: the fitting room
   (read_knowledge {id:"example-fitting"}) stands a creature before the camera and plays one animation after another,
   from the front for what is in its hands and from the side for how far a stroke carries it. The computer's monitor has to be on for any of this: with no display nothing the game draws is shown.

8. Go round again. Only the rules or the feedback changed: steps 5 to 7. The scene changed: from step 2.

9. Publish. Before a level goes out: scene_set_player_count (a game for one player says 1 to 1), a respawn point if the
   player can go down, and publish_kit: a cover and four pictures from your playtests, the title, the description and
   the tags in one folder, with a checklist of what the official guide asks for. Publishing itself is the creator's
   step in the game; no tool does it.

Worked examples, readable through the server: read_knowledge {id:"example-events"}, {id:"example-kingdom4"},
{id:"example-hop"}, {id:"example-farm"}, {id:"example-checks"}, {id:"example-skills"}, {id:"example-shop"},
{id:"example-drops"}, {id:"example-buttons"}, {id:"example-strike"}, {id:"example-raid"}, {id:"example-potion"},
{id:"example-shoot"}, {id:"example-kingdom5"}, {id:"example-brain"}, {id:"example-skirmish"}, {id:"example-kingdom6"},
{id:"example-fitting"}, {id:"example-hazards"}, {id:"example-walls"}, {id:"example-doors"}, {id:"example-images"}, {id:"example-clientui"}, {id:"example-clientgame"}, {id:"example-clientlist"}, {id:"example-clientmenu"}, {id:"example-clientcheck"}, {id:"example-clientvars"}, {id:"example-clientsignal"}, {id:"example-clientapi"}, {id:"example-clienttext"}, {id:"example-pairs"} give every
tool call in order with its arguments and the source of every graph, recorded from a real run. All of them have been played in the game.
examples/doors is a gate that opens and closes again with two motion devices; examples/images is a screen that speaks without
words (a row of lives made of image controls that a graph switches off and on, bars that show a value, a ring, a picture that starts hidden).
examples/hazards is what pickups and hazards do to a character (a status that speeds up, one that holds in place, a bumper that
throws back, a wall nobody sees, coming back by itself after going down); examples/walls is what stops a character and a pad that flings one. examples/events is the small one to copy: a
pick-up-and-pay loop in four event-driven graphs. examples/kingdom4 is a whole game (stations with option tabs, coins that
fly to the player, creatures sent at a wall, a bow shop that shoots, night and day as two skies, signals; won and lost
through the official settlement screen): ten graphs, about 600 nodes. examples/kingdom5 is the same game taken further,
to what a person needs in order to play it: a sound and an effect for every action, music for day and night, a marker
over what can be bought now and a question mark over what refuses, prices as rows of coins, five nights of growing
waves, farmers that pay back and archers whose arrows fly, a crown that is grabbed over seconds (thirteen graphs, about
1740 nodes; its numbers are in one file and were tried offline first). examples/kingdom6 is that game with its people
alive: every villager and every enemy is a complex creature that walks, works and fights by its own graphs, and the
fighting is the platform's (a wall with health that is beaten down and hammered whole again, soldiers whose leap is
a hit box, knife throwers whose knives are projectiles, enemies that carry blades and keep to a line before the wall
because their decision graph goes by where they stand, deaths the stage hears of): thirty-seven graphs, most of them
a few nodes. Its short round, its way to lose and the full five nights were played. examples/hop is a second kind of game built with
the same tools, a platform course (a moving platform that carries the player, a lever that raises a gate, lava that
sends back, a blink skill on E, a chest, a countdown): nine graphs, 157 nodes. examples/farm is a third kind, a
grow-and-sell loop after the official farming sample (tools taken from a rack, a use skill, plots that each keep their
own stage and grow on their own timer, a signal carrying the tool in hand, fruit as currency, a stall): nine graphs, 202
nodes; it passed on its first run in the game. examples/raid is a fourth kind, fight-loot-trade (a sword skill with a
hit box, a crate with health and a hurt box, a creature, loot and drops, a shop that buys the loot and sells a key, a gate
that takes the key): eight graphs, 141 nodes. examples/checks uses each newer tool once
and prints what happened. examples/kingdom (the same game as kingdom4 as one graph of about 1500 nodes) is older and was written before the
component tools existed: it polls positions from one big graph on the stage entity, which works but is heavy and is not
how the platform is meant to be used; kingdom4 to kingdom6 still take their scenery from it.
scripts/dev/mcp_round.mjs runs a whole example through MCP calls only.`;
const core=await connectCore();
const server=new McpServer({name:'miliastra-mcp',version:'0.1.0'}, {instructions:
  'Tools for building a Miliastra Wonderland (原神·千星奇域) level end to end: scene, level settings, node-graph rules, and an automatic playtest that returns log prints and screenshots. Read miliastra://workflow first (the order of the steps and which tool does each) and miliastra://platform-rules before designing anything (what the engine really does, measured in playtests). Every tool that changes a save writes a copy and returns its mapPath; the creator\'s own save is never modified. Compiling is not testing: after write_graphs run playtest_start and judge the prints and the screenshots yourself. Use real ids from inspect_map, scene_list_entities, scene_list_prefabs and scene_search_assets; never invent them. Local trusted source code only; the compiler is not a security sandbox.'});
for(const def of toolRegistry(null)) {
  server.registerTool(def.name,{description:def.description,inputSchema:def.shape,annotations:{readOnlyHint:def.readOnly,destructiveHint:!def.readOnly,openWorldHint:false}},async args=>{try{return await core.call(def.name,args);}catch(e){return toolError(e);}});
}
server.registerResource('workflow','miliastra://workflow',{mimeType:'text/plain'},async uri=>({contents:[{uri:uri.href,text:WORKFLOW}]}));
server.registerResource('knowledge','miliastra://knowledge',{mimeType:'text/markdown'},async uri=>({contents:[{uri:uri.href,text:fs.readFileSync(new URL('../docs/HOW_MILIASTRA_BUILDS_GAMES.zh-CN.md',import.meta.url),'utf8')+'\n\n---\n\n'+fs.readFileSync(new URL('../knowledge/README.zh-CN.md',import.meta.url),'utf8')}]}));
server.registerResource('platform-rules','miliastra://platform-rules',{mimeType:'text/markdown'},async uri=>({contents:[{uri:uri.href,text:fs.readFileSync(new URL('../docs/PLATFORM_RULES.zh-CN.md',import.meta.url),'utf8')}]}));
const transport=new StdioServerTransport();
server.server.onclose=()=>core.close();
process.stdin.once('end',()=>void core.close());
process.once('SIGTERM',async()=>{await core.close();process.exit(0);});
process.once('SIGINT',async()=>{await core.close();process.exit(0);});
await server.connect(transport);
