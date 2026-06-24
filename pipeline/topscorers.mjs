/**
 * Top scorers — aggregate goals from all matches, sorted with tie cutoff.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataPath = resolve(__dirname, '..', 'sample-data.json')

export function computeTopScorers(matches, teamsMap) {
  const goals = {}

  for (const m of matches) {
    if (!m.goals) continue
    for (const g of m.goals) {
      if (g.ownGoal) continue
      const key = `${g.scorer}|${g.teamId}`
      if (!goals[key]) {
        const t = teamsMap[g.teamId] || {}
        goals[key] = { scorer: g.scorer, teamId: g.teamId, teamName: t.name || g.teamId, flag: t.flag || '', goals: 0, penalties: 0 }
      }
      goals[key].goals++
      if (g.penalty) goals[key].penalties++
    }
  }

  const sorted = Object.values(goals).sort((a, b) => b.goals - a.goals || a.scorer.localeCompare(b.scorer))
  sorted.forEach((s, i) => s.rank = i + 1)
  return sorted
}
