// 把一份 {name, blocks} 清单生成资产包并放进编辑器导入目录。用法：node thumbs_build.mjs <清单.json>
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','..');
const {buildSceneBlocks}=await import(pathToFileURL(path.join(root,'src','scene-build.mjs')).href);
const spec=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const built=buildSceneBlocks({name:spec.name,blocks:spec.blocks},path.join(root,'workspace','thumbs'));
process.stdout.write(JSON.stringify({name:built.name,count:built.count,installedTo:built.installedTo,warnings:built.warnings||[]}));
