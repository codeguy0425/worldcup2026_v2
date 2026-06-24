/**
 * Bracket resolver — map placeholders (1A, 2B, 3A/B/C/D, W73, L101) to real teams.
 * Only resolves group positions (1A, 2B) when the group has no remaining matches.
 */
import { computeStandings } from './standings.mjs'
import { computeThirdPlaced } from './thirdplaced.mjs'
import { resolveThirdPlaced } from './thirdmatrix.mjs'

const teamIdRe = /^[A-Z]{3}$/

/** Only resolve a group placeholder if the group position is locked */
function resolveOne(id, standingsResults, thirdEntries, teamsMap, allGroupsComplete, thirdPlacedOverride) {
  // Real team ID → keep as-is
  if (teamsMap[id]) return id

  // 1A = group winner — only if confirmed first OR group complete
  const w = id.match(/^1([A-L])$/)
  if (w) {
    const grp = standingsResults[w[1]]
    if (!grp || !grp.standings.length) return id
    const top = grp.standings[0]
    if (top.confirmedFirst || grp.remaining === 0) return top.teamId
    return id
  }

  // 2B = runner-up — only if group complete
  const r = id.match(/^2([A-L])$/)
  if (r) {
    const grp = standingsResults[r[1]]
    if (grp && grp.standings.length > 1 && grp.remaining === 0) return grp.standings[1].teamId
    return id
  }

  // 3A/B/C/D = best third from listed groups — only if all groups complete
  const t = id.match(/^3([A-L](?:\/[A-L])*)$/)
  if (t) {
    if (!allGroupsComplete) return id
    // Use combination matrix override if available (FIFA Annex C)
    if (thirdPlacedOverride) return thirdPlacedOverride
    // Fallback: greedy "pick best-ranked from candidates"
    const candidates = new Set(t[1].split('/'))
    const eligible = thirdEntries.filter(e => candidates.has(e.group) && e.qualified)
    if (eligible.length) return eligible[0].teamId
  }

  return id
}

export function computeBracket(matches, teamsMap, groupLabels, fairPlayScores = {}) {
  // Store full results (standings + remaining count)
  const standingsResults = {}
  for (const gl of groupLabels) {
    standingsResults[gl] = computeStandings(gl, matches, teamsMap)
  }
  const thirdEntries = computeThirdPlaced(matches, teamsMap, groupLabels, fairPlayScores)
  const allGroupsComplete = groupLabels.every(gl => (standingsResults[gl]?.remaining ?? 1) === 0)

  // Compute FIFA combination matrix assignment when all groups are complete
  let thirdPlacedMap = {}
  if (allGroupsComplete) {
    const qualifiedGroups = thirdEntries.filter(e => e.qualified).map(e => e.group).sort()
    thirdPlacedMap = resolveThirdPlaced(qualifiedGroups, thirdEntries, teamsMap)
  }

  const phases = ['r32', 'r16', 'qf', 'sf', 'third', 'final']
  const rounds = {}
  const resolvedWinners = {}, resolvedLosers = {}

  for (const phase of phases) {
    const ms = matches.filter(m => m.stage === phase).sort((a, b) => a.id - b.id)
    rounds[phase] = ms.map(m => {
      // Pass combination matrix override for third-placed slots
      const thirdOverride = thirdPlacedMap[m.id] || null
      const t1 = resolveOne(m.team1Id, standingsResults, thirdEntries, teamsMap, allGroupsComplete, null)
      const t2 = resolveOne(m.team2Id, standingsResults, thirdEntries, teamsMap, allGroupsComplete, thirdOverride)
      const hasRes = m.score1 !== undefined

      // W/L ref resolution for already-played matches
      let resolvedT1 = t1, resolvedT2 = t2
      const wm1 = m.team1Id.match(/^W(\d+)$/)
      if (wm1 && resolvedWinners[wm1[1]]) resolvedT1 = resolvedWinners[wm1[1]]
      const wm2 = m.team2Id.match(/^W(\d+)$/)
      if (wm2 && resolvedWinners[wm2[1]]) resolvedT2 = resolvedWinners[wm2[1]]
      const lm1 = m.team1Id.match(/^L(\d+)$/)
      if (lm1 && resolvedLosers[lm1[1]]) resolvedT1 = resolvedLosers[lm1[1]]
      const lm2 = m.team2Id.match(/^L(\d+)$/)
      if (lm2 && resolvedLosers[lm2[1]]) resolvedT2 = resolvedLosers[lm2[1]]

      if (hasRes) {
        if (m.score1 > m.score2) { resolvedWinners[m.id] = resolvedT1; resolvedLosers[m.id] = resolvedT2 }
        else { resolvedWinners[m.id] = resolvedT2; resolvedLosers[m.id] = resolvedT1 }
      }

      return {
        matchId: m.id, round: m.round, date: m.date, timeUtc: m.timeUtc,
        team1Id: resolvedT1, team2Id: resolvedT2,
        team1Original: m.team1Id, team2Original: m.team2Id,
        team1Resolved: t1 !== m.team1Id, team2Resolved: t2 !== m.team2Id,
        score1: m.score1, score2: m.score2, groundId: m.groundId,
      }
    })
  }

  return { rounds }
}
