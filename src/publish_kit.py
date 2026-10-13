"""Cuts screenshots to the pictures a level is published with: 16:9, 1600 x 900 (what the official guide to
publishing asks for), the middle of the screenshot kept when it has another shape.

Usage: python publish_kit.py <request.json>
Request: {images: [{file, out}], size: [width, height]}
Prints one JSON line: {images: [{out, from: [w, h], size: [w, h], cropped}]}."""
import json
import sys

from PIL import Image

req = json.load(open(sys.argv[1], encoding='utf-8'))
width, height = req.get('size') or [1600, 900]
made = []
for item in req['images']:
    image = Image.open(item['file']).convert('RGB')
    w, h = image.size
    cropped = False
    if abs(w / h - width / height) > 0.005:
        cropped = True
        if w / h > width / height:
            keep = round(h * width / height)
            image = image.crop(((w - keep) // 2, 0, (w - keep) // 2 + keep, h))
        else:
            keep = round(w * height / width)
            image = image.crop((0, (h - keep) // 2, w, (h - keep) // 2 + keep))
    if image.size != (width, height):
        image = image.resize((width, height), Image.LANCZOS)
    image.save(item['out'], quality=92)
    made.append({'out': item['out'], 'from': [w, h], 'size': [width, height], 'cropped': cropped})
print(json.dumps({'images': made}))
