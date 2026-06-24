#!/usr/bin/env python3
"""
Spike 004: Bracket Resolution

Reads group standings and third-placed rankings, then resolves all R32
placeholders (1F, 2C, 3A/B/C/D/F, etc.) into real team IDs.

Usage: python spikes/004-bracket/spike.py
"""

import json
import sys
import re
from pathlib import Path

# Import Spike 002
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / '002-standings'))
import importlib.util
spec = importlib.util.spec_from_file_location("spike002", str(
    Path(__file__).resolve().parent.parent / '002-standings' / 'spike.py'
))
spike002 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(spike002)

# Import Spike 003
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / '003-third-placed'))
spec3 = importlib.util.spec_from_file_location("spike003", str(
    Path(__file__).resolve().parent.parent / '003-third-placed' / 'spike.py'
))
spike003 = importlib.util.module_from_spec(spec3)
spec3.loader.exec_module(spike003)


def load_data(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def is_real_team_id(tid, teams_map):
    return tid in teams_map


def resolve_placeholder(tid, standings_map, third_placed, teams_map):
    """Resolve a placeholder team ID to a real team ID."""
    if is_real_team_id(tid, teams_map):
        return tid  # Already a real team (hosts like GER, MEX, USA)

    # Group winner: "1A" → Group A 1st place
    m = re.match(r'^1([A-L])$', tid)
    if m:
        g = m.group(1)
        if g in standings_map and len(standings_map[g]) > 0:
            return standings_map[g][0]['teamId']
        return tid

    # Group runner-up: "2B" → Group B 2nd place
    m = re.match(r'^2([A-L])$', tid)
    if m:
        g = m.group(1)
        if g in standings_map and len(standings_map[g]) > 1:
            return standings_map[g][1]['teamId']
        return tid

    # Third-placed slots: "3A/B/C/D/F" → best qualified third from listed groups
    m = re.match(r'^3([A-L](?:/[A-L])*)$', tid)
    if m:
        candidate_groups = set(m.group(1).split('/'))
        # Filter third-placed teams to only those from candidate groups that qualified
        eligible = [t for t in third_placed if t['group'] in candidate_groups and t['qualified']]
        if eligible:
            # They're already sorted by Pts→GD→GF from Spike 003
            return eligible[0]['teamId']
        # If none qualified yet (snapshot), return the best among candidates regardless
        eligible = [t for t in third_placed if t['group'] in candidate_groups]
        if eligible:
            return eligible[0]['teamId']
        return tid

    return tid  # Fallback: return as-is


def compute_bracket(data):
    """Compute the resolved bracket for all rounds."""
    teams_map = {t['id']: t for t in data['teams']}
    group_labels = data['tournament']['groupLabels']

    # Get standings for all groups
    standings_map = {}
    for gl in group_labels:
        result = spike002.compute_standings(gl, data['matches'], teams_map)
        standings_map[gl] = result['standings']

    # Get third-placed ranking
    third_placed = spike003.compute_third_placed(data)

    # Build matches lookup
    matches_by_id = {m['id']: m for m in data['matches']}

    # Resolve bracket round by round
    # We need to resolve placeholders. For R32, we use standings + third_placed.
    # For later rounds (W73, L101, etc.), we'd need match results — but those
    # are only resolvable after the matches are played.

    bracket = {'rounds': {}}
    phase_order = ['r32', 'r16', 'qf', 'sf', 'third', 'final']

    # Track resolved match winners/losers for knockout tree resolution
    resolved_winners = {}
    resolved_losers = {}

    for phase in phase_order:
        phase_matches = [m for m in data['matches'] if m['stage'] == phase]
        phase_matches.sort(key=lambda m: m['id'])

        resolved = []
        for m in phase_matches:
            t1 = resolve_placeholder(m['team1Id'], standings_map, third_placed, teams_map)
            t2 = resolve_placeholder(m['team2Id'], standings_map, third_placed, teams_map)

            has_res = 'score1' in m and 'score2' in m

            entry = {
                'matchId': m['id'],
                'team1Id': t1,
                'team2Id': t2,
                'team1Name': teams_map.get(t1, {}).get('name', t1) if t1 != m['team1Id'] else m['team1Id'],
                'team2Name': teams_map.get(t2, {}).get('name', t2) if t2 != m['team2Id'] else m['team2Id'],
                'team1Original': m['team1Id'],
                'team2Original': m['team2Id'],
                'team1Resolved': t1 != m['team1Id'],
                'team2Resolved': t2 != m['team2Id'],
                'hasResult': has_res,
                'date': m.get('date', ''),
                'time': m.get('time', ''),
                'groundId': m.get('groundId', ''),
            }

            if has_res:
                entry['score1'] = m['score1']
                entry['score2'] = m['score2']
                if m['score1'] > m['score2']:
                    resolved_winners[m['id']] = t1
                    resolved_losers[m['id']] = t2
                elif m['score2'] > m['score1']:
                    resolved_winners[m['id']] = t2
                    resolved_losers[m['id']] = t1
                else:
                    # Draw in knockout = penalties (placeholder for now)
                    resolved_winners[m['id']] = t1  # Assume home wins on pens
                    resolved_losers[m['id']] = t2

            resolved.append(entry)

        bracket['rounds'][phase] = resolved

    bracket['standings'] = standings_map
    bracket['thirdPlaced'] = third_placed

    return bracket


def print_bracket(bracket, phase_to_show=None):
    """Pretty-print the resolved bracket."""
    phase_labels = {
        'r32': 'Round of 32',
        'r16': 'Round of 16',
        'qf': 'Quarter-finals',
        'sf': 'Semi-finals',
        'third': 'Third Place',
        'final': 'Final',
    }

    for phase, label in phase_labels.items():
        if phase_to_show and phase != phase_to_show:
            continue
        matches = bracket['rounds'].get(phase, [])
        if not matches:
            continue

        print(f"\n{'=' * 65}")
        print(f"  {label}")
        print(f"{'=' * 65}")

        for m in matches:
            t1 = m['team1Name']
            t2 = m['team2Name']
            t1_flag = ''
            t2_flag = ''
            if is_real_team_id(m['team1Id'], {}):
                # Look up team
                pass
            # Show original placeholder if resolved
            if m['team1Resolved']:
                t1_display = f"{t1} ({m['team1Original']})"
            else:
                t1_display = t1
            if m['team2Resolved']:
                t2_display = f"{t2} ({m['team2Original']})"
            else:
                t2_display = t2

            if m['hasResult']:
                scoreline = f"{m['score1']}–{m['score2']}"
            else:
                scoreline = "vs"

            print(f"  {m['matchId']:>3}. {t1_display:30} {scoreline:6} {t2_display:30}")


def main():
    spike_dir = Path(__file__).resolve().parent
    project_root = spike_dir.parent.parent
    data_path = project_root / 'sample-data.json'

    if not data_path.exists():
        print(f"❌ Cannot find {data_path}")
        sys.exit(1)

    data = load_data(str(data_path))

    # Show R32 bracket resolution
    bracket = compute_bracket(data)

    print("=" * 65)
    print("  BRACKET RESOLUTION")
    print("  Placeholders → Real Teams")
    print("=" * 65)

    print_bracket(bracket)

    # Summary
    total_resolved = 0
    for phase, matches in bracket['rounds'].items():
        for m in matches:
            if m['team1Resolved']:
                total_resolved += 1
            if m['team2Resolved']:
                total_resolved += 1

    print(f"\n{'=' * 65}")
    print(f"  Placeholders resolved: {total_resolved}/80 bracket slots")
    print(f"  Remaining as real teams: 80 - {total_resolved} = {80 - total_resolved}")
    print(f"  (Later rounds show W/L refs — resolve after matches played)")


if __name__ == '__main__':
    main()
