/**
 * Third-placed — collect 3rd from all groups, sort, mark top 8.
 *
 * @param {Object}   fairPlayScores  - Optional { teamId: <fairPlayPoints> }, higher = better conduct
 */
import { computeStandings } from './standings.mjs'

export function computeThirdPlaced(allMatches, teamsMap, groupLabels, fairPlayScores = {}) {
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
      eliminated: false,
      thirdLocked: third.status != null || allPlayed,
    })
  }

  // Sort: Pts → GD → GF → GA → Fair Play (higher better) → group letter (deterministic)
  entries.sort((a, b) => {
    const cmp = b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.ga - b.ga
    if (cmp !== 0) return cmp
    const fpA = fairPlayScores[a.teamId] ?? 0
    const fpB = fairPlayScores[b.teamId] ?? 0
    if (fpA !== fpB) return fpB - fpA
    // Pts, GD, GF, GA, Fair Play all equal
    if (fpA === 0 && fpB === 0) {
      console.warn(`⚠️  Fair play tiebreaker needed: ${a.group}(${a.team}) and ${b.group}(${b.team}) 3rd-placed are tied on all criteria — add card data to data/fairplay.json`)
    }
    return a.group.localeCompare(b.group)
  })

  // Assign ranks and determine mathematical qualification / elimination
  // A team is mathematically qualified when at most 7 other teams can still reach >= its pts
  // A team is mathematically eliminated when 8+ other teams can still reach > its pts
  entries.forEach((e, i) => {
    e.overall_rank = i + 1
    const threats = entries.filter(o => {
      if (o === e) return false
      const maxPts = o.pts + (o.thirdLocked ? 0 : 3)
      return maxPts >= e.pts
    }).length
    e.qualified = threats < 8

    const myMax = e.pts + (e.thirdLocked ? 0 : 3)
    const canBeat = entries.filter(o => {
      if (o === e) return false
      const maxPts = o.pts + (o.thirdLocked ? 0 : 3)
      return maxPts > myMax
    }).length
    e.eliminated = canBeat >= 8
  })

  return entries
}
