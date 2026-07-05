import json
import re
from html.parser import HTMLParser

with open('/home/z/my-project/scripts/keevanstore_home.json', 'r') as f:
    data = json.load(f)

# Print top-level keys
print("=== TOP-LEVEL KEYS ===")
print(list(data.keys()))
print()

# The actual page data is under data
page = data.get('data', data)
print("=== PAGE KEYS ===")
print(list(page.keys()))
print()

print("=== TITLE ===")
print(page.get('title', 'NO TITLE'))
print()

print("=== URL ===")
print(page.get('url', 'NO URL'))
print()

print("=== METADATA ===")
print(json.dumps(page.get('metadata', {}), indent=2))
print()

# Extract text from HTML
html = page.get('html', '')
print(f"=== HTML LENGTH: {len(html)} chars ===")
print()

# Strip tags for plain text
class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.skip = False
        self.in_script = False
        self.in_style = False
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.skip = True
    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.skip = False
        if tag in ('p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'li', 'br'):
            self.parts.append('\n')
    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)

extractor = TextExtractor()
extractor.feed(html)
text = ''.join(extractor.parts)
text = re.sub(r'\n\s*\n+', '\n\n', text)
text = re.sub(r'[ \t]+', ' ', text).strip()

print("=== PLAIN TEXT (first 5000 chars) ===")
print(text[:5000])
print()
print("=== PLAIN TEXT (last 3000 chars) ===")
print(text[-3000:])

# Save plain text for later use
with open('/home/z/my-project/scripts/keevanstore_text.txt', 'w') as f:
    f.write(text)
print()
print("=== Saved plain text to keevanstore_text.txt ===")
print(f"Total chars: {len(text)}")
