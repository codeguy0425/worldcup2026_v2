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
  // eliminated: 8+ teams are guaranteed to finish ahead
  //   "Guaranteed ahead" — no possible result can change it:
  //     • o.pts > e.pts (even if o loses, their minimum > e's maximum)
  //     • o.pts === e.pts AND o.thirdLocked AND ahead on tiebreakers (frozen)
  //   Teams at same pts but unlocked are NOT guaranteed — they could worsen
  //   their GD/GF on the final matchday and fall behind on tiebreakers.
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

    // Locked: guaranteed ahead = pts > e.pts, or same pts + locked + ahead on TB
    // Unlocked: guaranteed ahead = pts > e.pts + 3 (their minimum > my max)
    const guaranteedAhead = e.thirdLocked
      ? entries.filter(o => {
          if (o === e) return false
          if (o.pts > e.pts) return true
          if (o.pts === e.pts && o.thirdLocked) return isAheadOnTiebreakers(o, e)
          return false
        }).length
      : entries.filter(o => {
          if (o === e) return false
          return o.pts > e.pts + 3
        }).length
    e.eliminated = guaranteedAhead >= 8
  })

  return entries
}
