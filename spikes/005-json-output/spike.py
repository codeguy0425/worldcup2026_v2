#!/usr/bin/env python3
"""
Spike 005: JSON Output — Full Pipeline Output

Generates all pre-computed JSON files that the React app would consume:
  phase.json, matches.json, top-scorers.json, groups/*.json,
  third-placed.json, bracket.json

Usage: python spikes/005-json-output/spike.py [output_dir]
       Default: writes to app/public/data/
"""

import json
import sys
import os
from pathlib import Path

# Import all spike modules
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / '001-phase-detection'))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / '002-standings'))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / '003-third-placed'))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / '004-bracket'))

import importlib.util

def load_spike(rel_path):
    p = Path(__file__).resolve().parent.parent / rel_path
    name = p.stem
    spec = importlib.util.spec_from_file_location(name, str(p))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

spike001 = load_spike('001-phase-detection/spike.py')
spike002 = load_spike('002-standings/spike.py')
spike003 = load_spike('003-third-placed/spike.py')

# For bracket, we need the functions directly
import re


def load_data(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def compute_top_scorers(matches, teams_map, limit=5):
    """Aggregate goals across all matches. Include all players tied at the cutoff."""
    goals_by_player = {}

    for m in matches:
        if 'goals' not in m or not m['goals']:
            continue
        for g in m['goals']:
            # Skip own goals
            if g.get('ownGoal'):
                continue
            scorer = g['scorer']
            team_id = g['teamId']
            # Use (scorer, teamId) as key to handle same-name players on different teams
            key = (scorer, team_id)

            if key not in goals_by_player:
                team = teams_map.get(team_id, {})
                goals_by_player[key] = {
                    'scorer': scorer,
                    'teamId': team_id,
                    'teamName': team.get('name', team_id),
                    'flag': team.get('flag', ''),
                    'goals': 0,
                    'penalties': 0,
                }
            goals_by_player[key]['goals'] += 1
            if g.get('penalty'):
                goals_by_player[key]['penalties'] += 1

    # Sort by goals desc, then name
    sorted_scorers = sorted(goals_by_player.values(), key=lambda x: (-x['goals'], x['scorer']))

    # Find the cutoff: the 5th distinct goal count
    if len(sorted_scorers) <= limit:
        cutoff = sorted_scorers[-1]['goals'] if sorted_scorers else 0
    else:
        cutoff = sorted_scorers[limit - 1]['goals']

    # Include all players with >= cutoff goals
    result = [s for s in sorted_scorers if s['goals'] >= cutoff]

    # Add rank
    for i, s in enumerate(result):
        s['rank'] = i + 1

    return result


def generate_all(data, output_dir):
    """Generate all JSON output files."""
    teams_map = {t['id']: t for t in data['teams']}
    group_labels = data['tournament']['groupLabels']
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(os.path.join(output_dir, 'groups'), exist_ok=True)

    # 1. phase.json
    phase_info = spike001.detect_phase(data['matches'])
    phase_json = {
        'phase': phase_info['phase'],
        'groupComplete': phase_info.get('groupComplete', False),
        'allComplete': phase_info.get('allComplete', False),
        'generatedAt': data.get('generated_at', ''),
    }
    with open(os.path.join(output_dir, 'phase.json'), 'w', encoding='utf-8') as f:
        json.dump(phase_json, f, ensure_ascii=False, indent=2)
    print(f"  ✅ phase.json — phase={phase_json['phase']}")

    # 2. matches.json
    matches_json = []
    for m in data['matches']:
        entry = {
            'id': m['id'],
            'round': m.get('round', ''),
            'date': m.get('date', ''),
            'time': m.get('time', ''),
            'timeUtc': m.get('timeUtc', ''),
            'team1Id': m['team1Id'],
            'team2Id': m['team2Id'],
            'group': m.get('group', ''),
            'groundId': m.get('groundId', ''),
            'num': m.get('num'),
            'stage': m['stage'],
        }
        if 'score1' in m:
            entry['score1'] = m['score1']
            entry['score2'] = m['score2']
        if 'goals' in m:
            entry['goals'] = m['goals']
        matches_json.append(entry)

    with open(os.path.join(output_dir, 'matches.json'), 'w', encoding='utf-8') as f:
        json.dump(matches_json, f, ensure_ascii=False, indent=2)
    print(f"  ✅ matches.json — {len(matches_json)} matches")

    # 3. top-scorers.json
    top_scorers = compute_top_scorers(data['matches'], teams_map)
    with open(os.path.join(output_dir, 'top-scorers.json'), 'w', encoding='utf-8') as f:
        json.dump(top_scorers, f, ensure_ascii=False, indent=2)
    print(f"  ✅ top-scorers.json — {len(top_scorers)} players (cutoff: {top_scorers[-1]['goals']} goals)" if top_scorers else "  ✅ top-scorers.json — 0 players")

    # 4. groups/{A-L}.json
    for gl in group_labels:
        result = spike002.compute_standings(gl, data['matches'], teams_map)
        group_json = {
            'group': gl,
            'standings': result['standings'],
            'remaining': result['remaining'],
            'scenarios': result['scenarios'],
        }
        with open(os.path.join(output_dir, 'groups', f'{gl}.json'), 'w', encoding='utf-8') as f:
            json.dump(group_json, f, ensure_ascii=False, indent=2)
    print(f"  ✅ groups/ (A–L) — {len(group_labels)} group files")

    # 5. third-placed.json
    third_placed = spike003.compute_third_placed(data)
    third_json = {
        'rankings': third_placed,
        'qualifyingCount': 8,
        'totalGroups': 12,
    }
    with open(os.path.join(output_dir, 'third-placed.json'), 'w', encoding='utf-8') as f:
        json.dump(third_json, f, ensure_ascii=False, indent=2)
    print(f"  ✅ third-placed.json — {len(third_placed)} teams")

    # 6. bracket.json — full resolved bracket tree
    bracket = compute_full_bracket(data, teams_map, third_placed)
    with open(os.path.join(output_dir, 'bracket.json'), 'w', encoding='utf-8') as f:
        json.dump(bracket, f, ensure_ascii=False, indent=2)
    print(f"  ✅ bracket.json — {sum(len(v) for v in bracket['rounds'].values())} matches across {len(bracket['rounds'])} rounds")

    return phase_json


def is_real_team_id(tid, teams_map):
    return tid in teams_map


def resolve_placeholder(tid, standings_map, third_placed, teams_map):
    """Resolve a placeholder team ID to a real team ID."""
    if is_real_team_id(tid, teams_map):
        return tid
    m = re.match(r'^1([A-L])$', tid)
    if m:
        g = m.group(1)
        if g in standings_map and len(standings_map[g]) > 0:
            return standings_map[g][0]['teamId']
        return tid
    m = re.match(r'^2([A-L])$', tid)
    if m:
        g = m.group(1)
        if g in standings_map and len(standings_map[g]) > 1:
            return standings_map[g][1]['teamId']
        return tid
    m = re.match(r'^3([A-L](?:/[A-L])*)$', tid)
    if m:
        candidate_groups = set(m.group(1).split('/'))
        # Prefer qualified, fallback to best overall
        eligible = [t for t in third_placed if t['group'] in candidate_groups and t['qualified']]
        if not eligible:
            eligible = [t for t in third_placed if t['group'] in candidate_groups]
        if eligible:
            return eligible[0]['teamId']
        return tid
    return tid


def compute_full_bracket(data, teams_map, third_placed):
    """Compute the full resolved bracket."""
    group_labels = data['tournament']['groupLabels']

    # Get all group standings
    standings_map = {}
    for gl in group_labels:
        result = spike002.compute_standings(gl, data['matches'], teams_map)
        standings_map[gl] = result['standings']

    phase_order = ['r32', 'r16', 'qf', 'sf', 'third', 'final']
    bracket = {'rounds': {}}
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
                'round': m.get('round', ''),
                'date': m.get('date', ''),
                'time': m.get('time', ''),
                'timeUtc': m.get('timeUtc', ''),
                'groundId': m.get('groundId', ''),
                'team1Id': t1,
                'team2Id': t2,
                'team1Original': m['team1Id'],
                'team2Original': m['team2Id'],
                'team1Resolved': t1 != m['team1Id'],
                'team2Resolved': t2 != m['team2Id'],
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
                # Not yet played — resolve W/L refs if possible
                wm = re.match(r'^W(\d+)$', m['team1Id'])
                if wm and int(wm.group(1)) in resolved_winners:
                    entry['team1Id'] = resolved_winners[int(wm.group(1))]
                wm2 = re.match(r'^W(\d+)$', m['team2Id'])
                if wm2 and int(wm2.group(1)) in resolved_winners:
                    entry['team2Id'] = resolved_winners[int(wm2.group(1))]
                lm = re.match(r'^L(\d+)$', m['team1Id'])
                if lm and int(lm.group(1)) in resolved_losers:
                    entry['team1Id'] = resolved_losers[int(lm.group(1))]
                lm2 = re.match(r'^L(\d+)$', m['team2Id'])
                if lm2 and int(lm2.group(1)) in resolved_losers:
                    entry['team2Id'] = resolved_losers[int(lm2.group(1))]

            resolved.append(entry)

        bracket['rounds'][phase] = resolved

    return bracket


def print_summary(output_dir, phase_info, top_scorers):
    """Print a summary of what was generated."""
    print(f"\n{'=' * 55}")
    print("  OUTPUT SUMMARY")
    print(f"{'=' * 55}")

    # File sizes
    total_size = 0
    for root, dirs, files in os.walk(output_dir):
        for f in files:
            fp = os.path.join(root, f)
            sz = os.path.getsize(fp)
            rel = os.path.relpath(fp, output_dir)
            print(f"  {rel:30} {sz:>6,} bytes")
            total_size += sz

    print(f"  {'─' * 38}")
    print(f"  {'Total':30} {total_size:>6,} bytes")

    # Top scorers preview
    if top_scorers:
        print(f"\n  Top scorers (cutoff: {top_scorers[-1]['goals']} goals):")
        for s in top_scorers[:10]:
            pen = f" ({s['penalties']}P)" if s['penalties'] else ""
            print(f"    {s['rank']:>2}. {s['flag']} {s['scorer']:22} {s['goals']} goals{pen}")
        if len(top_scorers) > 10:
            print(f"    ... and {len(top_scorers) - 10} more")


def main():
    spike_dir = Path(__file__).resolve().parent
    project_root = spike_dir.parent.parent

    # Output directory
    output_dir = sys.argv[1] if len(sys.argv) > 1 else str(project_root / 'app' / 'public' / 'data')

    data_path = project_root / 'sample-data.json'
    if not data_path.exists():
        print(f"❌ Cannot find {data_path}")
        sys.exit(1)

    data = load_data(str(data_path))

    print("=" * 55)
    print("  GENERATING JSON OUTPUT")
    print(f"  → {output_dir}")
    print("=" * 55)

    phase_info = generate_all(data, output_dir)

    # Show top scorers
    teams_map = {t['id']: t for t in data['teams']}
    top_scorers = compute_top_scorers(data['matches'], teams_map)

    print_summary(output_dir, phase_info, top_scorers)


if __name__ == '__main__':
    main()
