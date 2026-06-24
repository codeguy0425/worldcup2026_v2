# Spike 001: Phase Detection

## Question

Given raw match data (with `score1`/`score2` present for played matches, absent for unplayed), determine the current tournament phase.

## Why

Phase detection is the **gatekeeper** for the entire pipeline. 002–005 all need to know whether they should run group-stage logic, bracket resolution, or nothing at all.

## Approach

- Read `sample-data.json`
- Walk phases in order: `group → r32 → r16 → qf → sf → third → final`
- For each phase, check if ALL its matches have scores
- If yes → phase is complete, check the next
- If no → this is the current active phase
- Also report whether the phase is complete or in-progress

## Verdict: VALIDATED

### What worked
- Phase detection by walking stage order and checking `score1`/`score2` presence is reliable
- Handles all states: pre-tournament → group ongoing → group complete → each KO round → ended
- Zero dependencies — pure Python stdlib, reads JSON, prints readable output

### Edge cases handled
- **Pre-tournament**: 0/72 group matches played → correctly reports `group`
- **Group complete**: all 72 group matches scored, no KO touched → correctly reports `r32`
- **Progressive completion**: each round flips to the next when fully played
- **Tournament end**: all 104 matches scored → correctly reports `ended`

### Recommendation for the real build
- Keep the logic as-is — walk phase order, check completion per phase
- Add a `phase.json` writer that outputs `{"phase":"...", "groupComplete":true/false}`
