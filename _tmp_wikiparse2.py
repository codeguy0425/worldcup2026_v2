#!/usr/bin/env python3
"""Fetch the rest of the wikitext after the Details section."""
import urllib.request, json, re, html

HEADERS = {"User-Agent": "WC2026-Research/1.0 (research bot; personal project)"}

def urlopen(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=30)

url = "https://en.wikipedia.org/w/api.php?action=parse&page=Tunisia+v+Japan+(2026+FIFA+World+Cup)&prop=wikitext&format=json"
data = json.loads(urlopen(url).read())
wikitext = data.get("parse", {}).get("wikitext", {}).get("*", "")

# Print from "Details" onwards  
details_idx = wikitext.find("===Details===")
print(f"=== DETAILS SECTION (char {details_idx}) ===")
print(wikitext[details_idx:details_idx+12000])
