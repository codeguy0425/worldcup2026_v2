#!/usr/bin/env python3
"""Extract penalty shootout info from Wikipedia 2026 FIFA World Cup page."""
import re
import json

with open('/tmp/wc2026.html', 'r', encoding='utf-8', errors='replace') as f:
    html = f.read()

# ── 1. Find the knockout bracket table ──
# It's included via {{#lst:2026 FIFA World Cup knockout stage|Bracket}}
# and has id="mwCFc" in the containing element
bracket_start = html.find('id="mwCFc"')
if bracket_start < 0:
    print("ERROR: Bracket section not found")
    exit(1)

bracket_end = html.find('</tbody>', bracket_start)
bracket_html = html[bracket_start:bracket_end+8]

# ── 2. Find the actual match detail tables (Round of 32, Round of 16, etc.) ──
# Each round has its own subsection with match tables (wikitable class)
# Let's find ALL penalty-related content in the page

print("=" * 60)
print("PART 1: Penalty shootouts in bracket view")
print("=" * 60)

# Extract bracket rows with penalty indicators
# The bracket format has cells like:
# "Germany 1 (3)"  and "Paraguay 1 (4) (p)"

rows = re.findall(r'<tr>(.*?)</tr>', bracket_html, re.DOTALL)
for row in rows:
    text = re.sub(r'<[^>]+>', ' ', row)
    text = re.sub(r'\s+', ' ', text).strip()
    if 'penalt' in text.lower() or '(p)' in text or re.search(r'\d\s*\(\d+\)\s*\)', text):
        # Extract team names and scores
        teams = re.findall(r'([A-Za-z\s]+?)\s+(\d+)\s*\((\d+)\)', text)
        if teams:
            print(f"Match: {' vs '.join(t[0].strip() for t in teams)}")
            for t in teams:
                print(f"  {t[0].strip()}: {t[1]} (penalty shootout: {t[2]})")
            print()

print()
print("=" * 60)
print("PART 2: Match detail tables with penalties/a.e.t.")
print("=" * 60)

# Find all h3 sections that contain match results
# The match tables are wikitable class tables under each round heading
sections = re.split(r'<h3[^>]*>', html)
for sec in sections:
    if 'Round_of_32' in sec or 'Round_of_16' in sec or 'Quarterfinal' in sec or 'Semifinal' in sec or 'Third' in sec or 'Final' in sec:
        heading = re.sub(r'<[^>]+>', '', sec[:200]).strip()
        print(f"\n--- Section: {heading[:80]} ---")

        # Find wikitable match tables in this section
        tables = re.findall(r'<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>(.*?)</table>', sec, re.DOTALL)
        for ti, table in enumerate(tables):
            rows = re.findall(r'<tr[^>]*>(.*?)</tr>', table, re.DOTALL)
            for row in rows:
                cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.DOTALL)
                if len(cells) >= 4:
                    cell_texts = [re.sub(r'<[^>]+>', '', c).strip() for c in cells]
                    combined = ' '.join(cell_texts)
                    if 'a.e.t' in combined.lower() or 'pen' in combined.lower():
                        print(f"  Match row: {' | '.join(cell_texts[:8])}")
                        print()

print()
print("=" * 60)
print("PART 3: Detailed penalty data in the bracket")
print("=" * 60)

# Extract ALL matches (not just penalty) from the bracket to see what we're working with
# Let's parse the bracket table properly
all_rows = re.findall(r'<tr>(.*?)</tr>', bracket_html, re.DOTALL)
for row in all_rows:
    # Find cells with flagicon + team name + score
    matches_in_row = re.findall(
        r'flagicon[^>]*>.*?</span>\s*</span>\s*<span[^>]*>\s*</span>\s*</span><a[^>]*>([^<]+)</a>\s*</b>\s*<span[^>]*>\([^)]*\)</span>\s*</b>\s*</td>\s*<td[^>]*>\s*(\d+(?:\s*\([^)]*\))?)',
        row
    )
    if matches_in_row:
        for team, score in matches_in_row:
            print(f"  {team.strip()} -> {score.strip()}")
        print()

print()
print("=" * 60)
print("PART 4: Looking for penalty shootout details (order of kicks)")
print("=" * 60)

# The bracket only shows final scores. The detailed penalty info 
# (who scored/missed, order) might be on the individual match pages
# or in the round of 32 subpage. Let's check for detailed tables.
for m in re.finditer(r'Penalty[^<]{0,100}(?:scored|missed)[^<]*', html):
    print(m.group(0)[:200])
