# WC2026 Redesign

Compute-on-update, serve-only World Cup 2026 static site.

## Structure

| Path | Purpose |
|------|---------|
| `data/` | Static source data (committed) |
| `spikes/` | **Disposable** — validate logic before build |
| `pipeline/` | Core engine — reads data → computes → writes JSON |
| `app/` | React/Vite frontend (comes later) |
| `app/public/data/` | **Generated** by pipeline — what React reads |
| `scripts/` | Utilities |

## How it works

```
data/sample-data.json
        │
        ▼
pipeline/update.mjs  ← reads data → detects phase → computes standings
        │               → resolves bracket → writes JSON
        ▼
app/public/data/     ← pre-computed JSON files
        │
        ▼
app/                 ← React just renders JSON
```

## Tournament config

`data/tournament.json` contains format parameters (group count, qualifying rules, tiebreakers). Swap for 2030 → update data → rebuild. No code changes needed.

## Phases

The pipeline outputs `phase.json` which controls what the app shows:

| Phase | Files generated |
|-------|----------------|
| Group | groups/, third-placed.json, top-scorers.json |
| R32+ | bracket.json, top-scorers.json |
| Ended | bracket.json (final), top-scorers.json, full-results.json |
