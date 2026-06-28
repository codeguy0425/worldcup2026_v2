#!/usr/bin/env python3
"""Fetch and parse Details + Statistics sections from the Wikipedia match page."""
import urllib.request, json, re, html

HEADERS = {"User-Agent": "WC2026-Research/1.0 (research bot; personal project)"}

def urlopen(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=30)

# Get full wikitext
print("=== Fetching full wikitext (29902 bytes)... ===")
url = "https://en.wikipedia.org/w/api.php?action=parse&page=Tunisia+v+Japan+(2026+FIFA+World+Cup)&prop=wikitext&format=json"
data = json.loads(urlopen(url).read())
wikitext = data.get("parse", {}).get("wikitext", {}).get("*", "")

# Print from the Details section onwards (search for "== Details ==")
details_idx = wikitext.find("== Details ==")
if details_idx >= 0:
    print(f"\n=== DETAILS SECTION (starting at char {details_idx}) ===")
    # Print a good chunk after Details
    print(wikitext[details_idx:details_idx+8000])
else:
    print("'== Details ==' not found, searching for '==The match=='...")
    match_idx = wikitext.find("==The match==")
    if match_idx >= 0:
        print(wikitext[match_idx:match_idx+8000])

stats_idx = wikitext.find("== Statistics ==")
if stats_idx >= 0:
    print(f"\n\n=== STATISTICS SECTION (starting at char {stats_idx}) ===")
    print(wikitext[stats_idx:stats_idx+6000])

# Also look for report links in the "Reports" section
reports_idx = wikitext.find("== Reports ==")
if reports_idx >= 0:
    print(f"\n\n=== REPORTS SECTION (starting at char {reports_idx}) ===")
    print(wikitext[reports_idx:reports_idx+2000])
