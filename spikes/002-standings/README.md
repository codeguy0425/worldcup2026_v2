# Spike 002: Standings + A/E

## Question

Given group match data (some played, some remaining), compute group standings with proper tiebreakers (H2H first) and determine which teams are mathematically advanced (A) or eliminated (E) via full 3ⁿ scenario simulation.

## Why

This is the core logic of the group stage. The current project has a `computeStandings()` but the final sort doesn't use H2H tiebreakers properly. The spike validates the correct algorithm before building the pipeline.

## Approach

- Read `sample-data.json`, filter matches for one group
- Compute base standings from played matches
- Enumerate all 3ⁿ possible outcomes for remaining matches
- For each team across all scenarios:
  - **Advanced (A)**: cannot be caught for top 2 in ANY scenario (fewer than 2 teams ≥ their points in every scenario)
  - **Eliminated (E)**: cannot reach top 2 in ANY scenario (max pts < 2nd place in every scenario)
- Sort final standings with H2H-first tiebreakers per 2026 rules

## Verdict: VALIDATED

### What worked
- 3ⁿ scenario simulation correctly determines (A) and (E) for all 12 groups
- H2H-first tiebreakers work properly in both sorting and scenario simulation
- Handles edge cases: 2-team ties, groups with uneven matches played (Group K: 3 remaining matches → 27 scenarios)

### Verified teams
- **Advanced (A)**: MEX, USA, GER, FRA, NOR, ARG — all mathematically guaranteed top 2
- **Eliminated (E)**: HAI, TUR, TUN, JOR — all mathematically cannot reach top 3
- **Still in contention**: all other 38 teams — have at least one path to top 2

### Key findings
- H2H tiebreaker is critical — Mexico is (A) over South Korea partly because they beat them H2H, not just on GD
- The `maxPts` column is useful at-a-glance info for understanding why a team is (A) or (E)
- Groups with 3 remaining matches (27 scenarios) are still fast — Python handles it instantly

### Recommendation for the real build
- Move this to Node.js for the pipeline (matches the rest of the stack)
- Add the standings data to `phase.json` or a per-group JSON file
- Keep the H2H-first sort — the current project sorts by pts→GD→GF which misses proper H2H ranking
