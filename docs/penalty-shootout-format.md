# Penalty Shootout Data Format

## matches.json

Penalty shootout data uses a `Record<teamId, array>` format:

```json
{
  "num": 88,
  "score1": 1,
  "score2": 1,
  "penalty1": 2,
  "penalty2": 4,
  "penaltySequence": {
    "AUS": "NYYN",
    "EGY": "YYYY"
  },
  "penaltyShootout": {
    "AUS": [
      {"player": "Harry Souttar", "no": 19, "scored": false},
      {"player": "Jackson Irvine", "no": 22, "scored": true},
      {"player": "Awer Mabil", "no": 11, "scored": true},
      {"player": "Lucas Herrington", "no": 25, "scored": false}
    ],
    "EGY": [
      {"player": "Mahmoud Saber", "no": 21, "scored": true},
      {"player": "Ramy Rabia", "no": 5, "scored": true},
      {"player": "Mohamed Salah", "no": 10, "scored": true},
      {"player": "Hossam Abdelmaguid", "no": 4, "scored": true}
    ]
  }
}
```

## Key rules

- **`penaltyShootout`** must be an **object** keyed by teamId (NOT a flat array)
  - Frontend reads `(m as any).penaltyShootout?.[tid]` (index.tsx line 717)
  - Array format will render nothing
- **`penaltySequence`** — string of Y/N per team, matching the kick order
  - Frontend reads `(m.penaltySequence?.[tid] || '').split('')` for circle display (line 697)
  - 'Y' = green circle (scored), 'N' = red circle (missed)
- **`penalty1`/`penalty2`** — total penalties scored by team1/team2
  - Used for score display: `Pen: 2–4`
  - Also used for bracket winner determination when tied
- **`no`** field inside each kick — shirt number, should be looked up from squad data
  - Frontend can resolve Chinese name via `no` using `zhPlayerMap` / `enPlayerMap`
- All penalty data must be added manually (not from openfootball pipeline)
- Bracket winner for tied matches: check `penalty1`/`penalty2`, the higher score wins
