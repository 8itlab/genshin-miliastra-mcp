"""client_api_extract.py: reads the official page of the client Lua API (knowledge/official/guide/mhtakr07vej4.md) and
writes src/scene/client-api.json: the functions of game, the methods and fields of script, every method and field a
control or another object of the API has, and the values of every Enum. scene_check_client uses it to point out a name
the API does not have. Run again when the page is fetched anew."""
import json, re, sys
src = open('knowledge/official/guide/mhtakr07vej4.md', encoding='utf8').read()
api = {'source': '附录/客户端控件API文档 (mhtakr07vej4)', 'game': set(), 'script': set(), 'methods': set(), 'fields': set(), 'enums': {}, 'globals': set()}
section = ''
for line in src.split('\n'):
    h = re.match(r'#+\s*(.*)', line)
    if h: section = h.group(1); continue
    cells = [c.strip() for c in line.split('|')]
    if not cells or not cells[0].startswith('`'): continue
    for code in re.findall(r'`\s*([^`]+?)\s*`', cells[0]):
        m = re.match(r'Enum\.(\w+)$', code)
        if m and len(cells) > 1:
            v = re.match(r'`\s*(\w+)\s*`', cells[1])
            if v: api['enums'].setdefault(m.group(1), []).append(v.group(1))
            continue
        m = re.match(r'game\.(\w+)', code)
        if m: api['game'].add(m.group(1)); continue
        m = re.match(r'script[:.](\w+)', code)
        if m: api['script'].add(m.group(1)); continue
        m = re.match(r'(?:(\w+)[:.])?(\w+)\s*\(', code)
        if m:
            (api['globals'] if not m.group(1) and section.startswith(('3.', '(1)类型', '(2)日志', '4.Color', '(1)构造')) else api['methods']).add(m.group(2)); continue
        for name in re.split(r'\s*,\s*', code):
            if re.match(r'^\w+$', name): api['fields'].add(name)
out = {k: (sorted(v) if isinstance(v, set) else v) for k, v in api.items()}
json.dump(out, open('src/scene/client-api.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print({k: (len(v) if not isinstance(v, str) else v) for k, v in out.items()})
