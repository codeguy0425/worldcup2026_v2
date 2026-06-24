# Spike 004: Bracket Resolution

## Question

Given group standings (from Spike 002) and bracket mapping (from `sample-data.json`), resolve all R32 placeholders like `1F`, `2C`, `3A/B/C/D/F` into real team IDs.

## Why

The bracket is the final bridge between group stage and knockout phase. Once group results are in, the pipeline needs to map placeholders to actual teams so the app can display a real bracket.

## Approach

- Reuse Spike 002 standings for group winners (1A–1L) and runners-up (2A–2L)
- Reuse Spike 003 third-placed rankings for the best-X-of-groups placeholders (3A/B/C/D/F etc.)
- Use real team IDs directly for pre-qualified host slots (GER, MEX, USA)
- For later rounds (R16+), match winners/losers reference previous match IDs (W73, L101) — these get resolved as scores come in

## Verdict: VALIDATED

### What worked
- All R32 placeholders resolved correctly:
  - **Group winners (1A–1L)**: correctly pull 1st from standings ✅
  - **Runners-up (2A–2L)**: correctly pull 2nd from standings ✅
  - **Third-placed slots (3X/Y/Z)**: correctly find best-ranked third from candidate groups ✅
  - **Host slots (GER, MEX, USA)**: pass through as real team IDs ✅
- Reuses standings from Spike 002 and third-placed from Spike 003 — no duplicate logic

### How the third-placed resolver works
- `3A/B/C/D/F` → look at third-placed ranking, filter to groups {A,B,C,D,F}, pick highest-ranked that currently qualifies (top 8)
- If none of the candidate groups currently have a qualifying 3rd place, picks the best among them anyway (snapshot fallback)

### R16+ resolution
- Placeholder format changes to `W73` (winner of match 73) and `L101` (loser of match 101)
- These can only be resolved AFTER the preceding matches have scores
- Correct behaviour: the pipeline writes `W73` etc. as-is to JSON; the React app can display "TBD"

### Recommendation for the real build
- Group winners + runners-up can be resolved the moment the group phase ends
- Third-placed slot allocation needs to be careful: the bracket layout is FIXED (each 3rd slot maps to a specific combo of groups), so the resolver must respect which group combo each slot is tied to
- R16+ slots stay as W/L references until knockout matches complete
- For the JSON output, keep both `originalPlaceholder` and `resolvedTeamId` so the app can show context
