#!/usr/bin/env python3
"""
Spike 002: Standings + A/E (Advancement / Elimination)

Reads sample-data.json, computes group standings with H2H-first tiebreakers,
and runs 3ⁿ scenario simulation to mark teams as (A) advanced or (E) eliminated.

Usage: python spikes/002-standings/spike.py [group_id]
       Default: runs all groups
       python spikes/002-standings/spike.py A  → only Group A
"""

import json
import sys
from pathlib import Path
from itertools import product

PHASE_ORDER = ['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final']

def load_data(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)

def has_score(m):
    return 'score1' in m and 'score2' in m

# ─── Standings computation ───

def compute_standings(group_letter, all_matches, teams_map):
    """Compute standings for one group. Returns list of standing dicts."""
    group_matches = [
        m for m in all_matches
        if m['stage'] == 'group' and m['group'] == group_letter
    ]
    played = [m for m in group_matches if has_score(m)]
    remaining = [m for m in group_matches if not has_score(m)]

    # Collect team IDs
    team_ids = set()
    for m in group_matches:
        team_ids.add(m['team1Id'])
        team_ids.add(m['team2Id'])
    team_ids = sorted(team_ids)

    # Init standings map
    standing = {}
    for tid in team_ids:
        t = teams_map.get(tid, {})
        standing[tid] = {
            'teamId': tid,
            'team': t.get('name', tid),
            'teamZh': t.get('nameZh', tid),
            'flag': t.get('flag', ''),
            'played': 0,
            'won': 0,
            'drawn': 0,
            'lost': 0,
            'gf': 0,
            'ga': 0,
            'gd': 0,
            'pts': 0,
            'form': [],
        }

    # Played matches
    for m in played:
        s1 = standing[m['team1Id']]
        s2 = standing[m['team2Id']]
        g1, g2 = m['score1'], m['score2']

        s1['played'] += 1
        s2['played'] += 1
        s1['gf'] += g1
        s1['ga'] += g2
        s2['gf'] += g2
        s2['ga'] += g1

        if g1 > g2:
            s1['won'] += 1; s2['lost'] += 1
            s1['pts'] += 3
            s1['form'].append('W'); s2['form'].append('L')
        elif g1 < g2:
            s2['won'] += 1; s1['lost'] += 1
            s2['pts'] += 3
            s1['form'].append('L'); s2['form'].append('W')
        else:
            s1['drawn'] += 1; s2['drawn'] += 1
            s1['pts'] += 1; s2['pts'] += 1
            s1['form'].append('D'); s2['form'].append('D')

    # GDs
    for tid in team_ids:
        s = standing[tid]
        s['gd'] = s['gf'] - s['ga']

    # H2H results between tied teams (from played matches)
    h2h_pts = {tid: {} for tid in team_ids}  # h2h_pts[tid][opponent] = points from H2H
    h2h_gd = {tid: {} for tid in team_ids}
    h2h_gf = {tid: {} for tid in team_ids}

    for m in played:
        t1, t2 = m['team1Id'], m['team2Id']
        g1, g2 = m['score1'], m['score2']
        h2h_pts[t1][t2] = h2h_pts[t1].get(t2, 0) + (3 if g1 > g2 else 1 if g1 == g2 else 0)
        h2h_pts[t2][t1] = h2h_pts[t2].get(t1, 0) + (3 if g2 > g1 else 1 if g1 == g2 else 0)
        h2h_gd[t1][t2] = h2h_gd[t1].get(t2, 0) + (g1 - g2)
        h2h_gd[t2][t1] = h2h_gd[t2].get(t1, 0) + (g2 - g1)
        h2h_gf[t1][t2] = h2h_gf[t1].get(t2, 0) + g1
        h2h_gf[t2][t1] = h2h_gf[t2].get(t1, 0) + g2

    def sort_key(item):
        tid, s = item
        # 1. Points (desc)
        # 2. H2H points between tied teams (desc)
        # 3. H2H GD
        # 4. H2H GF
        # 5. Group GD (desc)
        # 6. Group GF (desc)
        tied = [tid2 for tid2 in team_ids if tid2 != tid and standing[tid2]['pts'] == s['pts']]
        if tied:
            h2h_total_pts = sum(h2h_pts[tid].get(o, 0) for o in tied)
            h2h_total_gd = sum(h2h_gd[tid].get(o, 0) for o in tied)
            h2h_total_gf = sum(h2h_gf[tid].get(o, 0) for o in tied)
        else:
            h2h_total_pts = 0
            h2h_total_gd = 0
            h2h_total_gf = 0
        return (-s['pts'], -h2h_total_pts, -h2h_total_gd, -h2h_total_gf, -s['gd'], -s['gf'])

    # ─── 3ⁿ Scenario Simulation ───
    advanced = set()
    eliminated = set()
    confirmed_first = set()

    n = len(remaining)
    all_results = list(product([0, 1, 2], repeat=n))  # 0=home win, 1=draw, 2=away win

    for tid in team_ids:
        can_finish_top3 = False      # can this team reach 3rd or better?
        can_finish_outside_top2 = False  # can this team fall to 3rd or worse?

        base_pts = standing[tid]['pts']

        for results in all_results:
            # Simulate final points for all teams
            final_pts = {t: standing[t]['pts'] for t in team_ids}
            for i, m in enumerate(remaining):
                r = results[i]
                if r == 0:
                    final_pts[m['team1Id']] += 3
                elif r == 2:
                    final_pts[m['team2Id']] += 3
                else:
                    final_pts[m['team1Id']] += 1
                    final_pts[m['team2Id']] += 1

            team_final = final_pts[tid]

            # Count teams definitely ahead (more pts, or tied but ahead on H2H)
            definitely_ahead = 0
            for other_tid in team_ids:
                if other_tid == tid:
                    continue
                op = final_pts[other_tid]
                if op > team_final:
                    definitely_ahead += 1
                elif op == team_final:
                    # H2H tiebreaker
                    h2h_p = h2h_pts[tid].get(other_tid, 0)
                    h2h_p_op = h2h_pts[other_tid].get(tid, 0)
                    if h2h_p_op > h2h_p:
                        definitely_ahead += 1

            # Count teams not behind (team is ≥ their pts)
            not_behind = sum(1 for p in final_pts.values() if p >= team_final)

            if definitely_ahead < 3:
                can_finish_top3 = True
            if not_behind > 2:
                can_finish_outside_top2 = True

        if not can_finish_top3:
            eliminated.add(tid)
        if not can_finish_outside_top2:
            advanced.add(tid)
            # Check if also confirmed first
            not_behind_first = all(
                tid2 == tid or final_pts[tid] >= final_pts[tid2]
                for tid2 in team_ids
            )
            # Simpler: if advanced and only 1 other team could tie
            # (We'll handle confirmed first in the main detection below)

    # Re-check confirmed first: can NO ONE catch them?
    for tid in team_ids:
        base = standing[tid]['pts']
        max_others = []
        for other_tid in team_ids:
            if other_tid == tid:
                continue
            obase = standing[other_tid]['pts']
            o_remaining = []
            for m in remaining:
                if m['team1Id'] == other_tid or m['team2Id'] == other_tid:
                    o_remaining.append(m)
            o_max = obase + len(o_remaining) * 3
            max_others.append(o_max)
        max_others.sort(reverse=True)
        if len(max_others) >= 1 and base > max_others[0]:
            confirmed_first.add(tid)

    # Build sorted list
    sorted_items = sorted(standing.items(), key=sort_key)
    result = []
    rank = 0
    prev_key = None
    for idx, (tid, s) in enumerate(sorted_items):
        current_key = sort_key((tid, s))
        if current_key != prev_key:
            rank = idx + 1
            prev_key = current_key

        status = None
        if tid in advanced:
            status = 'advanced'
        elif tid in eliminated:
            status = 'eliminated'

        result.append({
            'rank': rank,
            'teamId': tid,
            'team': s['team'],
            'teamZh': s['teamZh'],
            'flag': s.get('flag', ''),
            'played': s['played'],
            'won': s['won'],
            'drawn': s['drawn'],
            'lost': s['lost'],
            'gf': s['gf'],
            'ga': s['ga'],
            'gd': s['gd'],
            'pts': s['pts'],
            'form': ''.join(s['form']),
            'status': status,
            'maxPts': s['pts'] + sum(1 for m in remaining if m['team1Id'] == tid or m['team2Id'] == tid) * 3,
        })

    confirmed_first_id = next(iter(confirmed_first)) if confirmed_first else None

    return {
        'group': group_letter,
        'standings': result,
        'remaining': len(remaining),
        'scenarios': len(all_results),
        'confirmedFirstId': confirmed_first_id,
    }


def print_standings(result, teams_map):
    """Pretty-print group standings."""
    g = result['group']
    print(f"\n{'='*60}")
    print(f"  Group {g}")
    print(f"  Remaining matches: {result['remaining']} | Scenarios: {result['scenarios']}")
    print(f"{'='*60}")
    print(f"  {'RK':>3} {'FL':2} {'Team':18} {'P':3} {'W':3} {'D':3} {'L':3} {'GF':3} {'GA':3} {'GD':4} {'Pts':4} {'Max':4} {'Status':12}")
    print(f"  {'─'*60}")
    for s in result['standings']:
        status_str = ''
        if s['status'] == 'advanced':
            status_str = '(A)'
        elif s['status'] == 'eliminated':
            status_str = '(E)'
        print(f"  {s['rank']:>3} {s.get('flag', ' '):2} {s['team']:18} {s['played']:3} {s['won']:3} {s['drawn']:3} {s['lost']:3} {s['gf']:3} {s['ga']:3} {s['gd']:4} {s['pts']:4} {s['maxPts']:4} {status_str:12}")
    print()


def main():
    spike_dir = Path(__file__).resolve().parent
    project_root = spike_dir.parent.parent
    data_path = project_root / 'sample-data.json'

    if not data_path.exists():
        print(f"❌ Cannot find {data_path}")
        sys.exit(1)

    data = load_data(str(data_path))
    teams_map = {t['id']: t for t in data['teams']}

    target_group = sys.argv[1].upper() if len(sys.argv) > 1 else None
    group_labels = data['tournament']['groupLabels']

    for gl in group_labels:
        if target_group and gl != target_group:
            continue
        result = compute_standings(gl, data['matches'], teams_map)
        print_standings(result, teams_map)

    print(f"  Groups computed: {len(group_labels) if not target_group else 1}")
    print()


if __name__ == '__main__':
    main()
