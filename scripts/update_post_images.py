"""Update the 5 existing posts' coverImage fields with real images."""
import json
import sqlite3
import os

with open('/home/z/my-project/scripts/image_urls.json') as f:
    urls = json.load(f)

db_path = '/home/z/my-project/db/custom.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

updated = 0
for slug, url in urls.items():
    cur.execute('UPDATE Post SET coverImage = ?, coverAlt = ? WHERE slug = ?', (url, slug.replace('-', ' ').title(), slug))
    if cur.rowcount > 0:
        updated += 1
        print(f"✓ {slug} → {url}")
    else:
        print(f"✗ {slug} — not found in DB")

conn.commit()
conn.close()
print(f"\nUpdated {updated}/{len(urls)} posts")
