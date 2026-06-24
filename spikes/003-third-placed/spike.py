#!/usr/bin/env python3
"""
Spike 003: Third-Placed Top 8

Collects the 3rd-placed team from all 12 groups, sorts by performance,
and determines which 8 advance to the Round of 32.

Usage: python spikes/003-third-placed/spike.py
"""

import json
import sys
from pathlib import Path

# Import standings logic from Spike 002
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / '002-standings'))
import importlib.util
spec = importlib.util.spec_from_file_location("spike002", str(
    Path(__file__).resolve().parent.parent / '002-standings' / 'spike.py'
))
spike002 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(spike002)


def load_data(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def compute_third_placed(data):
    """Compute the third-placed table across all groups."""
    teams_map = {t['id']: t for t in data['teams']}
    group_labels = data['tournament']['groupLabels']

    third_placed = []

    for gl in group_labels:
        result = spike002.compute_standings(gl, data['matches'], teams_map)
        standings = result['standings']

        if len(standings) < 3:
            continue

        third = standings[2]

        # Check if this group's 3rd place is locked
        all_played = all(s['played'] == 3 for s in standings)
        third_locked = third['status'] is not None or all_played

        third_placed.append({
            'group': gl,
            'rank': third['rank'],
            'teamId': third['teamId'],
            'team': third['team'],
            'teamZh': third['teamZh'],
            'flag': third.get('flag', ''),
            'played': third['played'],
            'won': third['won'],
            'drawn': third['drawn'],
            'lost': third['lost'],
            'gf': third['gf'],
            'ga': third['ga'],
            'gd': third['gd'],
            'pts': third['pts'],
            'form': third.get('form', ''),
            'status': third.get('status'),
            'maxPts': third.get('maxPts', third['pts']),
            'thirdLocked': third_locked,
        })

    # Sort: Pts desc → GD desc → GF desc
    third_placed.sort(key=lambda t: (-t['pts'], -t['gd'], -t['gf']))

    # Assign rank and determine qualification
    for i, t in enumerate(third_placed):
        t['overall_rank'] = i + 1
        t['qualified'] = i < 8

    return third_placed


def print_table(third_placed):
    """Pretty-print the third-placed table."""
    print("=" * 80)
    print("  Best Third-Placed Teams — Top 8 Advance to R32  (snapshot — groups still ongoing)")
    print("=" * 80)
    print(f"  {'RK':>3} {'GR':3} {'FL':2} {'Team':18} {'P':3} {'W':3} {'D':3} {'L':3} {'GF':3} {'GA':3} {'GD':4} {'Pts':4} {'3rd?':8} {'R32?':6}")
    print("  " + "─" * 80)
    for t in third_placed:
        third_status = "🔒 locked" if t['thirdLocked'] else "⏳ open "
        r32 = "🏆 YES" if t['qualified'] else "   —"
        print(f"  {t['overall_rank']:>3} {t['group']:3} {t.get('flag',' '):2} {t['team']:18} {t['played']:3} {t['won']:3} {t['drawn']:3} {t['lost']:3} {t['gf']:3} {t['ga']:3} {t['gd']:4} {t['pts']:4} {third_status:8} {r32:6}")

    print("  " + "─" * 80)
    print(f"\n  🔒 = 3rd place confirmed (group complete or team mathematically locked)")
    print(f"  ⏳ = 3rd place may change — a different team could take this spot")
    print(f"\n  Current margin: #{8} ({third_placed[7]['team']}) vs #{9} ({third_placed[8]['team']}) = {abs(third_placed[7]['pts'] - third_placed[8]['pts'])}pts")


def print_third_place_per_group(data):
    """Show each group's full table so we can see the context."""
    teams_map = {t['id']: t for t in data['teams']}
    group_labels = data['tournament']['groupLabels']

    print("\n" + "=" * 75)
    print("  Group Standings (for context)")
    print("=" * 75)

    for gl in group_labels:
        result = spike002.compute_standings(gl, data['matches'], teams_map)
        standings = result['standings']
        third = standings[2]
        gd_str = f"{third['gd']:+d}"
        print(f"\n  Group {gl} — 3rd: {third.get('flag','')} {third['team']} ({third['pts']}pts, GD {gd_str})")
        for s in standings:
            marker = ' ➡️' if s['rank'] == 3 else ''
            print(f"    {s['rank']}. {s.get('flag',' ')} {s['team']:18} {s['pts']:2}pts  +{s['gd']:2d}  {s['status'] or ''}{marker}")


def main():
    spike_dir = Path(__file__).resolve().parent
    project_root = spike_dir.parent.parent
    data_path = project_root / 'sample-data.json'

    if not data_path.exists():
        print(f"❌ Cannot find {data_path}")
        sys.exit(1)

    data = load_data(str(data_path))

    # Show context per group
    print_third_place_per_group(data)

    # Compute third-placed table
    third_placed = compute_third_placed(data)
    print_table(third_placed)


if __name__ == '__main__':
    main()
