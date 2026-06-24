# Spike 005: JSON Output

## Question

Generate the complete set of pre-computed JSON files that the React app would read — phase, matches, standings, top scorers, third-placed, and bracket.

## Why

This is the end-to-end validation of the entire pipeline. All logic from Spikes 001–004 feeds into this one output. The JSON files produced here are exactly what the React app would consume.

## Approach

- Reuse logic from Spikes 001–004
- Write to an output directory simulating `app/public/data/`
- Files: `phase.json`, `matches.json`, `top-scorers.json`, `groups/{A-L}.json`, `third-placed.json`, `bracket.json`
- Include top scorers with tie handling (all players at the cutoff)

## Verdict: VALIDATED

### What worked
- **All 6 JSON file types** generated correctly in `app/public/data/`
- **Top scorers** aggregated from all match goal data, with tie handling (cutoff at 3 goals, 5 players included)
- **81 KB total** for the complete output — trivial to serve
- Each file is a clean, valid JSON that a React app can read directly
- Pipeline is fully end-to-end: `sample-data.json` → all computed files

### Generated files

| File | Size | Contents |
|------|-----:|---------|
| `phase.json` | 108 B | Current phase, completion flags |
| `matches.json` | 45 KB | All 104 matches with scores & goals |
| `top-scorers.json` | 857 B | 5 players (Messi 5, Haaland 4, Mbappé 4, Undav 3, David 3) |
| `groups/{A-L}.json` | ~1.5 KB ea | Per-group standings with (A)/(E) markers |
| `third-placed.json` | 5.5 KB | All 12 third-placed teams sorted |
| `bracket.json` | 12 KB | Full bracket with resolved R32, W/L refs for later rounds |

### Top scorers (current snapshot)
1. 🇦🇷 Lionel Messi — 5 goals
2. 🇳🇴 Erling Haaland — 4 goals
3. 🇫🇷 Kylian Mbappé — 4 goals
4. 🇩🇪 Deniz Undav — 3 goals
5. 🇨🇦 Jonathan David — 3 goals

### Recommendation for the real build
- The pipeline script in `pipeline/update.mjs` should follow this same flow
- Add `top-scorers.json` to the navigation when present
- The tie cutoff check (include all players at 5th-place goal count) is critical — the user cross-references this
