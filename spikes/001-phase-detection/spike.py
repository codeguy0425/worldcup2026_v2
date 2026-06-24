#!/usr/bin/env python3
"""
Spike 001: Phase Detection

Reads sample-data.json, determines current tournament phase by
checking which phases have all matches completed.

Usage: python spikes/001-phase-detection/spike.py
"""

import json
import sys
from pathlib import Path

# Phase order (chronological)
PHASE_ORDER = ['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final']

def load_data(path: str) -> dict:
    with open(path, encoding='utf-8') as f:
        return json.load(f)

def has_score(match: dict) -> bool:
    """A match is 'played' if both score1 and score2 are present (even 0)."""
    return 'score1' in match and 'score2' in match

def detect_phase(matches: list) -> dict:
    """Walk phases in order, return current phase info."""
    # Group matches by stage
    by_stage: dict[str, list] = {}
    for m in matches:
        by_stage.setdefault(m['stage'], []).append(m)

    result = {
        'phase': 'pre-tournament',
        'phaseComplete': False,
        'phaseProgress': {},
        'allComplete': False,
    }

    current_phase_idx = -1

    for i, phase in enumerate(PHASE_ORDER):
        phase_matches = by_stage.get(phase, [])
        if not phase_matches:
            continue  # skip phases with no matches

        played = sum(1 for m in phase_matches if has_score(m))
        total = len(phase_matches)
        all_done = played == total

        result['phaseProgress'][phase] = {
            'total': total,
            'played': played,
            'complete': all_done,
        }

        if all_done:
            # This phase is fully done, move to next
            current_phase_idx = i
            continue
        else:
            # This phase is active (some or no matches played)
            result['phase'] = phase
            result['phaseComplete'] = False
            current_phase_idx = i
            break
    else:
        # All phases fully completed
        result['phase'] = 'ended'
        result['phaseComplete'] = True
        result['allComplete'] = True

    # Also compute which phases are complete for downstream use
    result['groupComplete'] = result['phaseProgress'].get('group', {}).get('complete', False) if result['phase'] != 'pre-tournament' else False
    result['groupsAllPlayed'] = result['groupComplete']

    return result


def print_report(data: dict, phase_info: dict):
    """Pretty-print the phase detection results."""
    print("=" * 60)
    print("  WC2026 Phase Detection")
    print("=" * 60)
    print(f"\n  Tournament: {data['tournament']['name']}")
    print(f"  Total matches: {len(data['matches'])}")
    print(f"\n  ── Phase Progress ──")

    for phase, info in phase_info['phaseProgress'].items():
        label = phase.upper()
        pct = (info['played'] / info['total'] * 100) if info['total'] > 0 else 0
        bar_len = 20
        filled = int(bar_len * info['played'] / info['total']) if info['total'] > 0 else 0
        bar = '█' * filled + '░' * (bar_len - filled)
        status = '✅ DONE' if info['complete'] else f'⏳ {info["played"]}/{info["total"]}'
        print(f"    {label:6s} [{bar}] {status}")

    print(f"\n  ── Result ──")
    print(f"    Current phase:    {phase_info['phase']}")
    print(f"    Phase complete:   {phase_info['phaseComplete']}")
    print(f"    Group complete:   {phase_info.get('groupComplete', False)}")
    print(f"    All complete:     {phase_info['allComplete']}")
    print("=" * 60)


def main():
    # Resolve sample-data.json path relative to project root
    spike_dir = Path(__file__).resolve().parent
    project_root = spike_dir.parent.parent
    data_path = project_root / 'sample-data.json'

    if not data_path.exists():
        print(f"❌ Cannot find {data_path}")
        sys.exit(1)

    data = load_data(str(data_path))
    phase_info = detect_phase(data['matches'])
    print_report(data, phase_info)

    # Output machine-readable summary
    print(f"\n  Machine-readable:")
    print(f"  {json.dumps({'phase': phase_info['phase'], 'groupComplete': phase_info['groupComplete'], 'allComplete': phase_info['allComplete']})}")


if __name__ == '__main__':
    main()
