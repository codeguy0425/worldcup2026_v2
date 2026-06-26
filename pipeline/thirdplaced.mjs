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

  // Sort: Pts → GD → GF → Fair Play (higher better) → drawing of lots (use teamId for deterministic order only, never group letter)
  entries.sort((a, b) => {
    const cmp = b.pts - a.pts || b.gd - a.gd || b.gf - a.gf
    if (cmp !== 0) return cmp
    const fpA = fairPlayScores[a.teamId] ?? 0
    const fpB = fairPlayScores[b.teamId] ?? 0
    if (fpA !== fpB) return fpB - fpA
    // Pts, GD, GF, Fair Play all equal — would be drawing of lots per FIFA regs
    // Use teamId for deterministic sorting (not group letter — no alphabetical bias)
    if (fpA === 0 && fpB === 0) {
      console.warn(`⚠️  Fair play tiebreaker needed: ${a.group}(${a.team}) and ${b.group}(${b.team}) 3rd-placed are tied on all criteria — add card data to data/fairplay.json`)
    }
    return a.teamId < b.teamId ? -1 : 1
  })

  // Helper: returns true if 'a' beats 'b' on the full FIFA third-placed tiebreaker chain
  // (Pts → GD → GF → Fair Play → drawing of lots / teamId)
  function isAheadOnTiebreakers(a, b) {
    const cmp = b.pts - a.pts || b.gd - a.gd || b.gf - a.gf
    if (cmp !== 0) return cmp < 0
    const fpA = fairPlayScores[a.teamId] ?? 0
    const fpB = fairPlayScores[b.teamId] ?? 0
    if (fpA !== fpB) return fpA > fpB
    return a.teamId < b.teamId
  }

  // Assign ranks and determine mathematical qualification / elimination
  // qualified: ≤ 7 other teams can still reach >= my pts (can't be pushed out)
  //   Uses tiebreakers for locked teams — a team tied on pts but behind on
  //   GD/GF (with no remaining matches) can never surpass, so not a threat.
  // eliminated for locked teams (rank > 8): the third-placed threshold can
  //   only get tougher, never easier, because:
  //   (a) Locked teams ahead are frozen — can't be displaced
  //   (b) Unlocked teams ahead, even if replaced by 1st/2nd/4th, are replaced
  //       by someone with ≥ pts (inner-group rank guarantees it)
  //   (c) Teams behind can only push this team further down
  //   So a locked team at rank > 8 can never reach top 8.
  // eliminated for unlocked teams: 8+ teams whose current pts already exceed
  //   this team's max possible pts (their worst > my best)
  entries.forEach((e, i) => {
    e.overall_rank = i + 1
    const threats = entries.filter(o => {
      if (o === e) return false
      const maxPts = o.pts + (o.thirdLocked ? 0 : 3)
      if (maxPts > e.pts) return true
      if (maxPts < e.pts) return false
      // Same max pts — can this opponent actually beat 'e' on tiebreakers?
      if (o.thirdLocked) {
        // Locked: use actual tiebreakers (GD/GF/FP are final)
        return isAheadOnTiebreakers(o, e)
      }
      // Not locked: could improve GD/GF in remaining match → conservative: count as threat
      return true
    }).length
    e.qualified = threats < 8

    // Locked teams: rank > 8 → eliminated (threshold only gets tougher)
    if (e.thirdLocked) {
      e.eliminated = e.overall_rank > 8
    } else {
      const myMax = e.pts + 3
      const definitivelyAhead = entries.filter(o => {
        if (o === e) return false
        return o.pts > myMax
      }).length
      e.eliminated = definitivelyAhead >= 8
    }
  })

  return entries
}
