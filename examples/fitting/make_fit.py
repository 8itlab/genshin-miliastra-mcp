"""Writes fit_scene.json and fit_test.json (the round's arguments) from fit_spec.py. Usage: python make_fit.py"""
import json
import os

from fit_spec import KEYS, MOMENTS, USED, place, plan, skills

here = os.path.dirname(os.path.abspath(__file__))
steps, end = plan()
play = int(end * 1.06) + 4                      # the stage's clock runs a little slow, and the level starts before the play does
scene = {'name': 'Fitting', 'blocks': [{'template': KEYS[key], 'name': f"FT_{key}_src", 'position': [-12 + 3 * i, 0, -31], 'createAtStart': False}
                                       for i, key in enumerate(USED)]}
test = {
    'about': ("The fitting room: complex creatures stand in front of the camera, as their models come and with tools in the hand, and play one animation each, booth after booth "
              "(fit_spec.py says which). It is how an attack is made to match its animation before it goes into a game: what the model holds, what a mounted weapon looks like in the "
              "hand, at which millisecond the stroke lands, how far it carries the creature. The whole play is photographed eight times a second (bursts): playtest_frames {runId, "
              "fromSeconds, toSeconds, crop} puts a booth's frames side by side, each labelled with its play second to a hundredth. Prints: FT <booth> when a booth opens (the log's "
              "clock runs five to six seconds ahead of the play seconds of the frames), FT_S every time a skill's graph runs: at the moment given as graphAtMs, and once for every "
              "moment when a list was given (a triple stroke with three moments prints three times each time it plays). To look at other creatures or animations, change SHOWS and "
              "MOMENTS in fit_spec.py and run make_fit.py; creature_animations lists the animations of a creature and what was already seen of them."),
    'dir': 'fitting', 'namePrefix': 'FT_', 'baseName': '未分类页签_存档_3', 'day': 0, 'night': 0, 'coins': 0,
    'durationSeconds': play, 'screenshotsAt': [4, play - 2], 'inputs': [],
    # Everything from the first booth's opening to the end, a frame every eighth of a second (or as often as 580 frames allow).
    'bursts': [{'from': 1, 'to': play - 1, 'everyMs': max(125, int((play - 2) * 1000 / 580) + 1)}], 'burstWidth': 1600,
    'scenes': ['fit_scene.json'], 'camera': {'distance': 3.5}, 'generator': 'gen_fitting.py', 'batch': True,
    'spawn': {'position': [place(0)[0], 0.4, place(0)[1]], 'rotation': [0, 0, 0]},
    'prefabs': [{'fromEntity': f"FT_{key}_src", 'name': f"FT_{key}"} for key in USED],
    'graphs': [{'key': 'stage', 'name': 'FtStage'},
               {'key': 'unit', 'name': 'FtUnit', 'attachToPrefab': [f"FT_{key}" for key in USED]},
               {'key': 'skill', 'name': 'FtSkill', 'kind': 'creatureSkill'},
               {'key': 'mind', 'name': 'FtMind', 'kind': 'creatureDecision'},
               {'key': 'show', 'name': 'FtShow', 'kind': 'creatureStatus'}],
    'creatureSkills': [{'name': f"FT_{key}_{n + 1}", 'creature': KEYS[key], 'graph': 'skill', 'animation': name, 'graphAtMs': MOMENTS.get((key, name), 1)}
                       for key in USED for n, name in enumerate(skills(key))],
    'creatureLogic': [{'prefab': f"FT_{key}", 'decisionGraph': 'mind',
                       'skills': [{'skill': f"FT_{key}_{n + 1}", 'cooldownSeconds': [0.6, 0.6]} for n in range(len(skills(key)))]}
                      for key in USED],
    'components': [{'entity': '关卡实体', 'variables': [{'name': 'booth', 'type': 'integer', 'value': -1}, {'name': 't', 'type': 'integer', 'value': 0}]}]
                  + [{'prefab': f"FT_{key}", 'variables': [{'name': 'k', 'type': 'integer', 'value': -2}, {'name': 's', 'type': 'integer', 'value': 0}]} for key in USED],
}
json.dump(scene, open(os.path.join(here, 'fit_scene.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(test, open(os.path.join(here, 'fit_test.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for at, b, key, name, tools, layout in steps:
    print(at, b, key, name, len(tools), layout)
print('ends', end, 'play', play, 'frames', int((play - 2) * 1000 / test['bursts'][0]['everyMs']))
