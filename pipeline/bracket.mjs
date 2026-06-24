/**
 * Bracket resolver — map placeholders (1A, 2B, 3A/B/C/D, W73, L101) to real teams.
 */
import { computeStandings } from './standings.mjs'
import { computeThirdPlaced } from './thirdplaced.mjs'

const teamIdRe = /^[A-Z]{3}$/

function isPlaceholder(id) { return !teamIdRe.test(id) || id.includes('/') }

function resolveOne(id, standingsMap, thirdEntries, teamsMap) {
  if (teamsMap[id]) return id  // Real team

  const w = id.match(/^1([A-L])$/)
  if (w && standingsMap[w[1]] && standingsMap[w[1]].length > 0) return standingsMap[w[1]][0].teamId

  const r = id.match(/^2([A-L])$/)
  if (r && standingsMap[r[1]] && standingsMap[r[1]].length > 1) return standingsMap[r[1]][1].teamId

  const t = id.match(/^3([A-L](?:\/[A-L])*)$/)
  if (t) {
    const candidates = new Set(t[1].split('/'))
    const eligible = thirdEntries.filter(e => candidates.has(e.group) && e.qualified)
    if (eligible.length) return eligible[0].teamId
    const fallback = thirdEntries.filter(e => candidates.has(e.group))
    if (fallback.length) return fallback[0].teamId
  }

  return id
}

export function computeBracket(matches, teamsMap, groupLabels) {
  const standingsMap = {}
  for (const gl of groupLabels) {
    standingsMap[gl] = computeStandings(gl, matches, teamsMap).standings
  }
  const thirdEntries = computeThirdPlaced(matches, teamsMap, groupLabels)

  const phases = ['r32', 'r16', 'qf', 'sf', 'third', 'final']
  const rounds = {}
  const resolvedWinners = {}, resolvedLosers = {}

  for (const phase of phases) {
    const ms = matches.filter(m => m.stage === phase).sort((a, b) => a.id - b.id)
    rounds[phase] = ms.map(m => {
      const t1 = resolveOne(m.team1Id, standingsMap, thirdEntries, teamsMap)
      const t2 = resolveOne(m.team2Id, standingsMap, thirdEntries, teamsMap)
      const hasRes = m.score1 !== undefined

      // Try W/L ref resolution for already-played matches
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
