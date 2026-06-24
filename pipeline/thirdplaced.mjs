/**
 * Third-placed — collect 3rd from all groups, sort, mark top 8.
 */
import { computeStandings } from './standings.mjs'

export function computeThirdPlaced(allMatches, teamsMap, groupLabels) {
  const entries = []

  for (const gl of groupLabels) {
    const result = computeStandings(gl, allMatches, teamsMap)
    if (result.standings.length < 3) continue
    const third = result.standings[2]
    const allPlayed = result.standings.every(s => s.played === 3)
    entries.push({
      overall_rank: 0,
      group: gl,
      teamId: third.teamId,
      team: third.team,
      flag: third.flag || '',
      played: third.played, won: third.won, drawn: third.drawn, lost: third.lost,
      gf: third.gf, ga: third.ga, gd: third.gd, pts: third.pts,
      qualified: false,
      thirdLocked: third.status !== null || allPlayed,
    })
  }

  entries.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
  entries.forEach((e, i) => { e.overall_rank = i + 1; e.qualified = i < 8 })

  return entries
}
