# Third-party components

This project uses **genshin-ts 0.2.2**, by josStorer, under the MIT license.
Source: https://github.com/josStorer/genshin-ts

The compiler is used as a dependency, not reimplemented: TypeScript → generated GS TypeScript → node graph JSON → GIA. The adapter uses its GIL parser, protobuf schema, graph index and injector. These modules are version-pinned because their behavior and file-format assumptions may change.

Genshin-TS includes work from **Wu-Yijun/Genshin-Impact-Miliastra-Wonderland-Code-Node-Editor-Pack**, identified by upstream as MIT-licensed. Its bundled schema and notices remain in the dependency. The installed upstream MIT license is at `node_modules/genshin-ts/LICENSE`.

**@modelcontextprotocol/sdk 1.30.0**, **TypeScript 5.9.3** and **Zod 3.25.76** are used under their respective distributed licenses. See each package for its full license text.

The new internal core also uses **zod-to-json-schema 3.25.2** (ISC) and the development-only **@types/node 26.4.1** (MIT). Their distributed license files remain in their installed packages.

**AyayaXiaowang/Ayaya_Miliastra_Editor**, commit `189cb6aa6f5a060ce5791bc77412f0073cbcc51f` (GPL-3.0), is checked out only under the ignored local `workspace/` for isolated CLI research. No Ayaya source or official/user game asset is bundled into this project's npm distribution. Research checkout and generated sample reports do not constitute a licensed distribution package or a validated gameplay backend.

Optional screenshot worker: **Pillow 12.0.0**, https://github.com/python-pillow/Pillow, under Pillow's HPND license. Uses its Windows HWND capture and screen capture APIs; installed separately through `requirements-capture.txt`.

The experimental Columbina-Dev/WebMiliastraNodesEditor-MCPServer was examined as a design reference. No source code from that GPL-3.0 project is included here.

This is an unofficial community integration; no endorsement by miHoYo/HoYoverse is claimed.

## UGC-File-Generate-Utils

- Source: https://github.com/luern0313/UGC-File-Generate-Utils (commit fba7c26) and its proto submodule UGC-Gia-Gil-ProtoBuf (commit c56862b)
- License: Apache License 2.0
- Used for: the GIA entity asset layout and the block template measurements in `src/scene/blocks.mjs`, re-implemented in JavaScript. No upstream code is bundled.

## qianxing-format-docs

- Source: https://github.com/hang-ZYM/qianxing-format-docs (docs/08_实体大全.md and data/prefab_sizes_full.json, snapshot of 2026-10-05)
- License: Creative Commons Attribution 4.0 International (CC BY 4.0)
- Used for: `src/scene/asset-catalog.json`, the list of official placeable assets with names, panel groups, icon names and model sizes. The data was reformatted; sizes are stored as [x, y, z] metres.
