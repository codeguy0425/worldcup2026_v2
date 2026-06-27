/**
 * Group Standings with 3ⁿ scenario simulation + H2H tiebreakers.
 */

function hasScore(m) { return m.score1 !== undefined && m.score2 !== undefined }

/**
 * Full tiebreaker comparison between two teams tied on points.
 * Returns true if team a finishes ahead of team b.
 * Chain: H2H pts → H2H GD → H2H GF → overall GD → overall GF → alphabetical (deterministic)
 */
function isAheadOnTiebreakers(a, b, h2hPts, h2hGd, h2hGf, standing) {
  const hPts = (h2hPts[a][b] || 0) - (h2hPts[b][a] || 0)
  if (hPts !== 0) return hPts > 0
  const hGd = (h2hGd[a][b] || 0) - (h2hGd[b][a] || 0)
  if (hGd !== 0) return hGd > 0
  const hGf = (h2hGf[a][b] || 0) - (h2hGf[b][a] || 0)
  if (hGf !== 0) return hGf > 0
  const gd = (standing[a].gd || 0) - (standing[b].gd || 0)
  if (gd !== 0) return gd > 0
  const gf = (standing[a].gf || 0) - (standing[b].gf || 0)
  if (gf !== 0) return gf > 0
  return a < b // deterministic: group letter / teamId
}

export function computeStandings(groupLetter, allMatches, teamsMap) {
  const groupMatches = allMatches.filter(m => m.stage === 'group' && m.group === groupLetter)
  const played = groupMatches.filter(hasScore)
  const remaining = groupMatches.filter(m => !hasScore(m))

  const teamIds = [...new Set(groupMatches.flatMap(m => [m.team1Id, m.team2Id]))].sort()

  // Init standings
  const standing = {}
  for (const tid of teamIds) {
    const t = teamsMap[tid] || {}
    standing[tid] = { teamId: tid, team: t.name || tid, teamZh: t.nameZh || tid, flag: t.flag || '', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: [] }
  }

  // Process played matches
  for (const m of played) {
    const s1 = standing[m.team1Id], s2 = standing[m.team2Id]
    const g1 = m.score1, g2 = m.score2
    s1.played++; s2.played++
    s1.gf += g1; s1.ga += g2
    s2.gf += g2; s2.ga += g1
    if (g1 > g2) { s1.won++; s2.lost++; s1.pts += 3; s1.form.push('W'); s2.form.push('L') }
    else if (g1 < g2) { s2.won++; s1.lost++; s2.pts += 3; s1.form.push('L'); s2.form.push('W') }
    else { s1.drawn++; s2.drawn++; s1.pts += 1; s2.pts += 1; s1.form.push('D'); s2.form.push('D') }
  }

  for (const tid of teamIds) standing[tid].gd = standing[tid].gf - standing[tid].ga

  // H2H tracking
  const h2hPts = {}, h2hGd = {}, h2hGf = {}
  for (const tid of teamIds) { h2hPts[tid] = {}; h2hGd[tid] = {}; h2hGf[tid] = {} }
  for (const m of played) {
    const t1 = m.team1Id, t2 = m.team2Id, g1 = m.score1, g2 = m.score2
    h2hPts[t1][t2] = (h2hPts[t1][t2] || 0) + (g1 > g2 ? 3 : g1 === g2 ? 1 : 0)
    h2hPts[t2][t1] = (h2hPts[t2][t1] || 0) + (g2 > g1 ? 3 : g1 === g2 ? 1 : 0)
    h2hGd[t1][t2] = (h2hGd[t1][t2] || 0) + (g1 - g2)
    h2hGd[t2][t1] = (h2hGd[t2][t1] || 0) + (g2 - g1)
    h2hGf[t1][t2] = (h2hGf[t1][t2] || 0) + g1
    h2hGf[t2][t1] = (h2hGf[t2][t1] || 0) + g2
  }

  // Sort key: pts desc → H2H pts → H2H GD → H2H GF → GD desc → GF desc
  function sortKey(tid) {
    const s = standing[tid]
    const tied = teamIds.filter(o => o !== tid && standing[o].pts === s.pts)
    const h2hP = tied.reduce((sum, o) => sum + (h2hPts[tid][o] || 0), 0)
    const h2hD = tied.reduce((sum, o) => sum + (h2hGd[tid][o] || 0), 0)
    const h2hF = tied.reduce((sum, o) => sum + (h2hGf[tid][o] || 0), 0)
    return [-s.pts, -h2hP, -h2hD, -h2hF, -s.gd, -s.gf]
  }

  const sorted = teamIds.sort((a, b) => {
    const ka = sortKey(a), kb = sortKey(b)
    for (let i = 0; i < ka.length; i++) {
      if (ka[i] !== kb[i]) return ka[i] - kb[i]
    }
    return 0
  })

  const n = remaining.length
  let scenarios
  const advanced = new Set(), eliminated = new Set(), confirmedFirst = new Set(), confirmedSecond = new Set()

  if (n === 0) {
    // Group complete — use final sorted standings directly (no simulation needed)
    sorted.forEach((tid, idx) => {
      if (idx < 2) advanced.add(tid)
      if (idx >= 3) eliminated.add(tid)
    })
    confirmedFirst.add(sorted[0])
    if (sorted.length >= 2) confirmedSecond.add(sorted[1])
    scenarios = 1
  } else {
    // 3ⁿ simulation for incomplete groups
    const allResults = []
    function genResults(idx, cur) {
      if (idx === n) { allResults.push([...cur]); return }
      for (const r of [0, 1, 2]) { cur.push(r); genResults(idx + 1, cur); cur.pop() }
    }
    genResults(0, [])
    scenarios = allResults.length

    for (const tid of teamIds) {
      let canFinishTop3 = false, canFinishOutsideTop2 = false
      let alwaysFirst = true

      for (const results of allResults) {
        const fp = {}; for (const t of teamIds) fp[t] = standing[t].pts
        for (let i = 0; i < n; i++) {
          const m = remaining[i], r = results[i]
          if (r === 0) fp[m.team1Id] += 3
          else if (r === 2) fp[m.team2Id] += 3
          else { fp[m.team1Id] += 1; fp[m.team2Id] += 1 }
        }

        const tp = fp[tid]
        // Count teams potentially ahead using tiebreakers
        // H2H is definitive (already played). Overall GD/GF can still change
        // on the final matchday, so when H2H is perfectly tied, either team
        // could finish ahead — count the opponent as potentially ahead.
        const aheadd = teamIds.filter(o => {
          if (o === tid) return false
          if (fp[o] > tp) return true
          if (fp[o] === tp) {
            const hPts = (h2hPts[o][tid] || 0) - (h2hPts[tid][o] || 0)
            if (hPts !== 0) return hPts > 0
            const hGd = (h2hGd[o][tid] || 0) - (h2hGd[tid][o] || 0)
            if (hGd !== 0) return hGd > 0
            const hGf = (h2hGf[o][tid] || 0) - (h2hGf[tid][o] || 0)
            if (hGf !== 0) return hGf > 0
            // H2H fully tied — GD/GF could change in remaining matches
            // Conservative: count as potentially ahead
            return true
          }
          return false
        }).length

        if (aheadd < 3) canFinishTop3 = true
        if (aheadd >= 2) canFinishOutsideTop2 = true
        if (aheadd > 0) alwaysFirst = false
      }

      if (!canFinishTop3) eliminated.add(tid)
      if (!canFinishOutsideTop2) advanced.add(tid)
      if (alwaysFirst) confirmedFirst.add(tid)
    }
  }

  const standings = sorted.map((tid, idx) => {
    const s = standing[tid]
    let status
    if (advanced.has(tid)) status = 'advanced'
    else if (eliminated.has(tid)) status = 'eliminated'
    const maxPts = s.pts + remaining.filter(m => m.team1Id === tid || m.team2Id === tid).length * 3
    return { rank: idx + 1, teamId: tid, team: s.team, teamZh: s.teamZh, flag: s.flag, played: s.played, won: s.won, drawn: s.drawn, lost: s.lost, gf: s.gf, ga: s.ga, gd: s.gd, pts: s.pts, form: s.form.join(''), status, maxPts, confirmedFirst: confirmedFirst.has(tid) || false, confirmedSecond: confirmedSecond.has(tid) || false }
  })

  return { group: groupLetter, standings, remaining: remaining.length, scenarios }
}
