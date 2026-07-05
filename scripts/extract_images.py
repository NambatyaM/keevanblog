"""Extract image URLs from z-ai image-search CLI output files."""
import json
import re
import os

# Map of post slug → image file
posts = [
    ('how-to-sell-ebooks-online-in-uganda-complete-guide', 'img1.json'),
    ('how-to-market-ebooks-on-whatsapp-uganda', 'img2.json'),
    ('how-to-make-money-selling-ebooks-in-uganda-a-complete-guide', 'img3.json'),
    ('free-tools-to-create-ebooks-in-africa-your-complete-guide', 'img4.json'),
    ('ugandan-authors-making-money-online-in-2025-success-stories', 'img5.json'),
]

# Find JSON object in the file content
def extract_json(text):
    m = re.search(r'\{\s*"success"', text)
    if not m:
        return None
    start = m.start()
    # Find matching closing brace
    depth = 0
    for i in range(start, len(text)):
        if text[i] == '{': depth += 1
        elif text[i] == '}':
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(text[start:i+1])
                except Exception as e:
                    print(f"  parse error: {e}")
                    return None
    return None

results = {}
for slug, fname in posts:
    path = f'/home/z/my-project/scripts/{fname}'
    with open(path) as f:
        text = f.read()
    data = extract_json(text)
    if not data or not data.get('success'):
        print(f"✗ {slug}: no data")
        continue
    imgs = data.get('results', [])
    if not imgs:
        print(f"✗ {slug}: no images")
        continue
    # Pick first result (or filter for landscape if possible)
    # Prefer landscape orientation for blog cover (width > height)
    landscape = [r for r in imgs if r.get('original_width','0px').replace('px','').isdigit() and r.get('original_height','0px').replace('px','').isdigit() and int(r['original_width'].replace('px','')) >= int(r['original_height'].replace('px',''))]
    pick = landscape[0] if landscape else imgs[0]
    url = pick.get('original_url')
    results[slug] = url
    print(f"✓ {slug}")
    print(f"  → {url}  ({pick.get('original_width')} x {pick.get('original_height')})")

# Save to JSON for next step
with open('/home/z/my-project/scripts/image_urls.json', 'w') as f:
    json.dump(results, f, indent=2)
print(f"\nSaved {len(results)} URLs to image_urls.json")
