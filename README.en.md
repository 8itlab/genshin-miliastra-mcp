# genshin-miliastra-mcp — MCP server for Genshin Impact's Miliastra Wonderland

**Let an AI assistant build Miliastra Wonderland levels for you.** [中文说明](README.md)

An unofficial [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server for **Miliastra Wonderland** (千星奇域), the user-generated-content mode of **Genshin Impact**. You keep the Miliastra editor (Miliastra Sandbox) open on your own Windows PC; an MCP client such as Claude Code, Claude Desktop, Cursor or Codex CLI connects to this server and builds the level: it searches the official prop catalogue and places a scene, configures the level, writes node graphs in TypeScript (compiled with **Genshin-TS 0.2.2**), then plays the level by itself and reads back the log and screenshots.

| | | |
|---|---|---|
| ![Arena game built by an AI with the Miliastra Wonderland MCP server](docs/images/arena.jpg) | ![Trap escape game built by an AI with the Miliastra Wonderland MCP server](docs/images/escape.jpg) | ![Dodge-and-survive game built by an AI with the Miliastra Wonderland MCP server](docs/images/dodge.jpg) |

These three games were each made from a blank map by an AI that had never seen this repository and was given nothing but the MCP tools, and each was played through to the game's own win and lose screens by script ([record, in Chinese](docs/BLIND_TEST_2026-10-13.zh-CN.md)).

> **Language note.** The tool descriptions, the built-in workflow guide, the knowledge base and most documentation are in Chinese, and automatic playtesting finds buttons by reading the Chinese game interface. Everything has been tested with the Chinese (mainland) client only. A capable model works with the Chinese tool descriptions without trouble, but the English client is untested.

## What it can do

- **Scenes**: a catalogue of 2,468 official props, searchable by name with thumbnails; import a hundred objects in one go; locked camera views, spawn and respawn points, time of day, lights.
- **Mechanisms and creatures**: prefabs, collision triggers, press-F interactions, moving platforms, bounce pads, force fields, invisible walls, projectiles with hit detection, creatures that find and fight enemies on their own, skills, items, shops, currencies.
- **Interface**: progress bars (horizontal, vertical, ring), image controls (about 1,600 built-in pictures), timers, buttons.
- **Rules**: node graphs written in TypeScript; dozens of graphs compiled and written into the save in one call; bundled node documentation and Chinese-named catalogues of effects (3,195), sounds (1,997) and music (188).
- **Automatic playtests**: scripted key presses and clicks, teleporting the player, screenshots, bursts, audio and video recording, and the level's log — this is how the AI finds out whether what it built actually works in the game.
- **Publishing kit**: cover, screenshots, title and description. Publishing itself stays a click you make in the game.
- **Offline knowledge base**: the official guide and tutorials, a breakdown of 48 official teaching saves, and a page of platform rules measured in the game.

## Bundled catalogues: thumbnails and ids

Props, effects, sounds and pictures are referred to by numeric id in Miliastra saves and node graphs. The editor shows those ids, but there is no table of them in the local data. This repository collects them into catalogues, most of them read out of the editor one by one and photographed there, so an AI can find an id by its Chinese name and look at the thing before choosing it:

![Miliastra Wonderland prop catalogue: thumbnails with ids and names](docs/images/prop-catalogue.jpg)

| Catalogue | Size | What it holds | Files |
|---|---|---|---|
| Props | 2,468, of which 2,398 have a thumbnail | id, name, group, size (list and sizes from [qianxing-format-docs](https://github.com/hang-ZYM/qianxing-format-docs), CC BY 4.0); each thumbnail was photographed in the editor | `src/scene/asset-catalog.json`, `src/scene/thumbs/<id>.jpg` |
| Effects | 3,195 (1,986 timed, 1,209 looping) | id, name, the small picture from the asset library; 87 looping effects also photographed on a character | `src/scene/media/effects.json`, `fx-thumbs.*`, `src/scene/fx/` |
| Sounds | 1,997 | id, name, category; 73 recorded and measured for length and loudness | `src/scene/media/sounds.json` |
| Music | 188 | id, name, category | `src/scene/media/music.json` |
| Interface pictures | 1,590 in 15 categories | icons, plates, dividers, skills, items, creature portraits; photographs of the picture library with the id under each picture | `src/scene/image-library/` |
| Creature animations | 296 of 18 creatures | name, id, length, looping or not; for the ones watched frame by frame, what is in its hands and the millisecond the blow lands | `src/scene/media/creature-animations.json` |
| Preset states of mechanisms | 45 mechanisms | ids and values of states such as a chest opening, a lever, a trapdoor | `src/scene/preset-status.json` |
| Official teaching saves | 48 | each taken apart into JSON, with notes on how they are built | `knowledge/samples/` |

These are plain JSON and JPG files and can be used without the MCP server, for instance to look up ids when writing Genshin-TS by hand. Names are in Chinese, as in the Chinese client.

## Requirements

- Windows 10 or 11 with Genshin Impact installed and an account that can open the Miliastra Wonderland editor.
- Node.js **22.12 or later**.
- Python 3.10 or later; `pip install -r requirements-capture.txt` (Pillow, rapidocr-onnxruntime) for playtests and screenshots.
- Any MCP client that speaks stdio. The server calls no model itself and needs no API key.
- For playtests: a monitor that is switched on, the game in 16:9 full screen, and nobody else using the mouse and keyboard meanwhile.

## Install

```powershell
git clone https://github.com/8itlab/genshin-miliastra-mcp.git
cd genshin-miliastra-mcp
npm ci
npm run build:core
pip install -r requirements-capture.txt
npm run doctor
```

## Connect an MCP client

```json
{
  "mcpServers": {
    "miliastra": {
      "command": "node",
      "args": ["C:/path/to/genshin-miliastra-mcp/src/server.mjs"],
      "env": {
        "MILIASTRA_WORKSPACE": "C:/path/to/genshin-miliastra-mcp/workspace",
        "MILIASTRA_ALLOW_LIVE_WRITE": "0"
      }
    }
  }
}
```

With Claude Code:

```powershell
claude mcp add miliastra -e MILIASTRA_WORKSPACE=C:/path/to/genshin-miliastra-mcp/workspace -e MILIASTRA_ALLOW_LIVE_WRITE=0 -- node C:/path/to/genshin-miliastra-mcp/src/server.mjs
```

- `MILIASTRA_WORKSPACE`: where the server keeps project copies, screenshots and logs.
- `MILIASTRA_ALLOW_LIVE_WRITE`: with `0` the server only writes copies of a save (a playtest imports the copy as a new save) and never touches your own saves.
- `MILIASTRA_PYTHON` / `MILIASTRA_PLAYTEST_PYTHON`: path of the Python interpreter when it is not on PATH.
- `MILIASTRA_SAVE_ROOTS`: a JSON array of absolute paths when your saves are not in the default place.

## First run

1. In the game, create a new blank save in Miliastra Wonderland, open it in the editor and save it once.
2. Tell your AI something like:

> Use the miliastra MCP server. Read the resources `miliastra://workflow` and `miliastra://platform-rules` first. On my blank save "XXX", build a one-minute game: collect five coins to win, lose when the countdown ends. Then use `playtest_start` to play it by script once to a win and once to a loss, and show me the screenshots of both result screens. Tell me separately what merely compiled and what was verified in the game.

The AI's work goes into a copy of the save; a playtest imports that copy as a new save and opens it. Publishing is yours to do in the game.

## Tools, in the order a level is made

1. **Look at the map**: `list_maps`, `inspect_map`, `scene_list_*`, `scene_get_level_settings`.
2. **Scene**: `scene_search_assets`, `scene_asset_images`, `scene_build_blocks`, `editor_open_map`, `scene_import_assets`, `scene_remove_entities`.
3. **Settings**: `scene_set_camera` (with a locked view), `scene_set_spawn`, `scene_add_preset_point`, `scene_set_class`, `scene_set_faction_hostility`, `scene_set_level_settings`, `scene_add_respawn_point`, `scene_set_revive`, `scene_set_player_count`.
4. **Things and what they can do**: `scene_add_prefab`, `scene_update_prefab`, `scene_add_components`, `scene_add_graph`.
5. **Platform systems**: `scene_add_signal`, `scene_add_global_timer`, `scene_add_skill`, `scene_add_creature_skill`, `scene_set_creature_logic`, `scene_add_currency`, `scene_add_item`, `scene_add_shop`, `scene_add_unit_status`, `scene_add_environment`, `scene_add_light`.
6. **On screen**: `scene_add_progress_bar`, `scene_add_image`, `image_catalog`, `scene_add_timer_display`, `scene_add_button`.
7. **Rules**: `search_node_docs`, `create_project`, `update_logic`, `build_project`, `preview_changes`, `apply_build`, and `write_graphs` for many graphs at once; `scene_batch` for many settings in one call.
8. **Feedback**: `effect_catalog`, `sound_catalog`, `music_catalog`.
9. **Playtest**: `playtest_start`, `playtest_status`, `playtest_frames`.
10. **Before publishing**: `publish_kit`.

The full table with what each tool does is in the [Chinese README](README.md#工具); the server's own resource `miliastra://workflow` tells the AI which tool to use at each step.

## Limits

- Windows only, Chinese client only, 16:9 full screen. A game update can change the save format or the interface and break tools until they are updated.
- A low-level creator account (奇匠 Lv.1) cannot show custom text on screen; the tools offer pictures, bars, icons and marker effects instead.
- Playtest scripts run on time, not on conditions: the level's log is only written when the play ends.
- All examples are single-player.
- This is a local, trusted development tool, not a sandbox for untrusted code. Do not expose it to the internet.
- More in [docs/STATUS.zh-CN.md](docs/STATUS.zh-CN.md) and [docs/PLATFORM_RULES.zh-CN.md](docs/PLATFORM_RULES.zh-CN.md) (Chinese).

## Related projects

The community has built a number of Miliastra Wonderland tools with different aims. This project's place among them: an AI builds and verifies a whole level in the **real editor and game** — scene, level settings, node graphs and playtests in one set of MCP tools.

| Project | What it is for | Relation |
|---|---|---|
| [Genshin-TS](https://github.com/josStorer/genshin-ts) | Write node graphs in TypeScript, compile and inject them | This project compiles node graphs with it. If you want to write code yourself and need no AI operating the editor, use it directly |
| [Miliastra node editor pack](https://github.com/Wu-Yijun/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack) | Reading and writing graph files, code/graph conversion, node data | Included in Genshin-TS, so used here indirectly |
| [Ayaya_Miliastra_Editor](https://github.com/AyayaXiaowang/Ayaya_Miliastra_Editor) | Node graphs as Python code with offline validation, auto layout and a preview UI | Choose it for a Python workflow and a graph preview; this project has no UI for people |
| [Miliastra-toolbox](https://github.com/1475505/Miliastra-toolbox) | Knowledge-base Q&A over official docs and community posts, with a hosted MCP | Complementary: it answers "how", this project does the work |
| [miliastra-beyond-simulator](https://github.com/1475505/miliastra-beyond-simulator) | A simulator outside the game for 2D + Lua client-script games, seconds per round | Choose it for 2D interface games and fast iteration; this project covers node graphs only and verifies in the real game |
| [WebMiliastraNodesEditor](https://github.com/Columbina-Dev/WebMiliastraNodesEditor) | A web node-graph editor that needs no game | For prototyping graphs |
| [qianxing-format-docs](https://github.com/hang-ZYM/qianxing-format-docs) | Documentation of the file formats | The prop list and sizes in this repository come from it (CC BY 4.0) |

Not found elsewhere: id catalogues with thumbnails, automatic playtests in the real game, scenes and 3D gameplay. Missing here: client Lua scripts and client controls (new in game version 7.1), a UI for people, platforms other than Windows. This table follows each project's own README; please open an issue if something is inaccurate.

## FAQ

**Can an AI make Miliastra Wonderland maps automatically?** Yes, that is what this server is for; see the blind tests above. Whether a game is fun still needs a human.

**Can Miliastra node graphs be written as code?** Yes. Graphs are written in TypeScript and compiled with [Genshin-TS](https://www.npmjs.com/package/genshin-ts); this project adds writing them into the save, attaching them to entities and prefabs, and compiling many at once.

**Will it damage my saves?** By default it only writes copies. Writing to a live save has to be switched on explicitly and is guarded by a hash check and a backup.

**Is it safe for my account?** The server reads and writes local Miliastra save files and operates the editor window you opened, the way a person would. It does not modify the game, read its memory or intercept its network traffic. Whether that fits the game's terms of service and the Miliastra creation rules is for you to check.

## Licence and credits

Code is under the [MIT licence](LICENSE). Third-party software is listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

This is a fan-made, unofficial project, not affiliated with or endorsed by miHoYo / HoYoverse. Genshin Impact, Miliastra Wonderland, and the game screenshots, prop and icon thumbnails, official guide text and teaching saves found in this repository belong to miHoYo / HoYoverse; they are included only so the tools can look up what the platform provides by name and so the tests have samples to compare against. If you are the rights holder and want something removed, please open an issue.
