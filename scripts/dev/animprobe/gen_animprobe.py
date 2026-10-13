"""Animation probe (a development aid, not an example): a save with creature skills that hold every animation id of
every complex creature, four to a skill, so that the editor's skill timeline shows their names (scripts/dev/animscrape.py
reads them). Usage: python gen_animprobe.py <guids.json> <out.ts> <ignored x3> <graph>"""
import json
import sys

guids = json.load(open(sys.argv[1], encoding='utf-8'))
which = sys.argv[-1]
HEAD = """/// <reference types="genshin-ts" />
import { g } from 'genshin-ts/runtime/core'
"""
if which == 'stage':
    body = f"g.server({{id:{guids['graph:id']},name:'{guids['graph:name']}'}}).on('whenEntityIsCreated',(evt,f)=>{{f.printString('AP_READY');}})"
else:
    body = f"g.creationSkill({{id:{guids['graph:id']},name:'{guids['graph:name']}',prefix:false}}).on('start',(evt,f)=>{{f.notifyServerNodeGraph('ap','','');}})"
open(sys.argv[2], 'w', encoding='utf-8').write(HEAD + body + '\n')
