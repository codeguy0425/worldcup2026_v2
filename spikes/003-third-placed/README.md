# Spike 003: Third-Placed Top 8

## Question

Given all 12 group standings, collect the 3rd-placed team from each group, sort by performance, and determine which 8 advance to R32.

## Why

The 2026 format has 12 groups × 4 teams. Top 2 from each group (24) + best 8 third-placed (8) = 32 teams for R32. This sorting logic is the bridge between the group phase and bracket resolution (Spike 004).

## Approach

- Run standings for all 12 groups (reusing Spike 002 logic)
- Extract the 3rd-placed team from each group's sorted standings
- Sort all 12 third-placed teams by: Pts → GD → GF
- Top 8 advance, bottom 4 eliminated
- Handle ongoing groups — use current 3rd place as a snapshot

## Verdict: VALIDATED

### What worked
- Extracting 3rd place from all 12 groups and sorting by Pts → GD → GF works correctly
- Snapshot works during ongoing group stage — uses current 3rd place
- Imports cleanly from Spike 002's standings logic (no code duplication)

### Results (current snapshot — 46/72 group matches played)
| Rank | Group | Team | Pts | GD |
|------|-------|------|:---:|:--:|
| 1 | F | Sweden | 3 | 0 |
| 2 | C | Scotland | 3 | 0 |
| 3 | D | Paraguay | 3 | -2 |
| 4 | J | Algeria | 3 | -2 |
| 5 | H | Cape Verde | 2 | 0 |
| 6 | G | Belgium | 2 | 0 |
| 7 | K | DR Congo | 1 | 0 |
| 8 | A | Czech Republic | 1 | -1 |
| 9 | E | Ecuador | 1 | -1 |
| 10 | B | Bosnia | 1 | -3 |
| 11 | L | Panama | 0 | -1 |
| 12 | I | Senegal | 0 | -3 |

### Recommendation for the real build
- Tiebreaker for equal Pts/GD/GF across different groups: use goals scored, then drawing of lots (per FIFA rules) — but these cases are extremely rare
- The JSON output should include the 3rd-placed list with qualification status for the bracket resolver (Spike 004)
