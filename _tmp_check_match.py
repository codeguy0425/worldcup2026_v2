#!/usr/bin/env python3
"""Find Tunisia vs Japan match data in matches.json and also check FIFA PDF."""
import json, urllib.request

with open("app/public/data/matches.json", "r", encoding="utf-8") as f:
    matches = json.load(f)

# Find Tunisia vs Japan match
for m in matches:
    if m.get("team1Id") == "TUN" and m.get("team2Id") == "JPN":
        print("=== TUN vs JPN IN matches.json ===")
        print(json.dumps(m, indent=2, ensure_ascii=False))
        break

# Also try to check if the FIFA PDF exists
print("\n=== Checking FIFA Tactical Lineup PDF ===")
url = "https://fdp.fifa.org/assetspublic/ce281/r12483/pdf/TacticalLineup-English.pdf"
try:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    resp = urllib.request.urlopen(req, timeout=15)
    print(f"✅ PDF accessible! Status: {resp.status}, Size: {resp.headers.get('Content-Length','unknown')} bytes")
    # Peek at first 500 bytes to see if it's really a PDF
    data = resp.read(500)
    print(f"First bytes: {data[:50]}")
except Exception as e:
    print(f"❌ PDF error: {e}")

# Also check the full match report PDF
print("\n=== Checking FIFA Full Match Report PDF ===")
url2 = "https://fdp.fifa.org/assetspublic/ce281/r12483/pdf/FullTimeMatchReport-English.pdf"
try:
    req2 = urllib.request.Request(url2, headers={"User-Agent": "Mozilla/5.0"})
    resp2 = urllib.request.urlopen(req2, timeout=15)
    print(f"✅ PDF accessible! Status: {resp2.status}, Size: {resp2.headers.get('Content-Length','unknown')} bytes")
except Exception as e:
    print(f"❌ PDF error: {e}")
