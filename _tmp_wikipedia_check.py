#!/usr/bin/env python3
"""Check Wikipedia match report page for Tunisia v Japan (2026 WC)."""
import urllib.request, json, sys, re, html

HEADERS = {"User-Agent": "WC2026-Research/1.0 (research bot for personal project; andy@example.com)"}

def urlopen(url):
    req = urllib.request.Request(url, headers=HEADERS)
    return urllib.request.urlopen(req, timeout=30)

print("1. Checking if page exists...")
url = "https://en.wikipedia.org/w/api.php?action=query&titles=Tunisia+v+Japan+(2026+FIFA+World+Cup)&format=json"
data = json.loads(urlopen(url).read())
pages = data.get("query", {}).get("pages", {})
for page_id, p in pages.items():
    if page_id == "-1":
        print("   ❌ PAGE DOES NOT EXIST (missing)")
    else:
        print(f"   ✅ PAGE EXISTS: {p.get('title', '?')}  (id={page_id})")

print("\n2. Fetching sections...")
url = "https://en.wikipedia.org/w/api.php?action=parse&page=Tunisia+v+Japan+(2026+FIFA+World+Cup)&prop=sections&format=json"
data = json.loads(urlopen(url).read())
sections = data.get("parse", {}).get("sections", [])
print(f"   Total sections: {len(sections)}")
for s in sections:
    print(f"   idx={s['index']:>3}  toclevel={s.get('toclevel','?')}  {s['line']}  [{s['anchor']}]")

print("\n3. Fetching wikitext (first 8000 chars)...")
url = "https://en.wikipedia.org/w/api.php?action=parse&page=Tunisia+v+Japan+(2026+FIFA+World+Cup)&prop=wikitext&format=json"
data = json.loads(urlopen(url).read())
wikitext = data.get("parse", {}).get("wikitext", {}).get("*", "")
print(f"   Total: {len(wikitext)} bytes")
print(wikitext[:8000])
