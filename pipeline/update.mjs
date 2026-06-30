#!/usr/bin/env node
/**
 * WC2026 Pipeline — reads sample-data.json, computes everything, writes app/public/data/
 *
 * Usage: node pipeline/update.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, statSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

import { detectPhase } from './phase.mjs'
import { computeStandings } from './standings.mjs'
import { computeTopScorers } from './topscorers.mjs'
import { computeThirdPlaced } from './thirdplaced.mjs'
import { computeBracket } from './bracket.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const DATA_DIR = resolve(ROOT, 'app', 'public', 'data')

function loadJSON(path) {
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function writeJSON(path, data) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8')
}

function main() {
  const t0 = Date.now()
  console.log('📦 WC2026 Pipeline')

  // Load source data
  const source = loadJSON(resolve(ROOT, 'sample-data.json'))
  const teamsMap = {}
  for (const t of source.teams) teamsMap[t.id] = t
  const groupLabels = source.tournament.groupLabels
  const matches = source.matches

  console.log(`   Read ${source.teams.length} teams, ${matches.length} matches`)

  // 1. Phase
  const phase = detectPhase(matches)
  writeJSON(resolve(DATA_DIR, 'phase.json'), {
    phase: phase.phase,
    groupComplete: phase.groupComplete,
    allComplete: phase.allComplete,
    generatedAt: new Date().toISOString().slice(0, 10),
  })
  console.log(`   ✅ phase.json — ${phase.phase}`)

  // 2. Standings per group
  for (const gl of groupLabels) {
    const result = computeStandings(gl, matches, teamsMap)
    writeJSON(resolve(DATA_DIR, 'groups', `${gl}.json`), result)
  }
  console.log(`   ✅ groups/ (A–L) — ${groupLabels.length} files`)

  // 3. Matches (pass-through with clean format, resolved later with bracket data)
  const cleanMatches = matches.map(m => {
    const entry = { id: m.id, round: m.round, date: m.date, time: m.time, timeUtc: m.timeUtc, team1Id: m.team1Id, team2Id: m.team2Id, group: m.group || '', groundId: m.groundId, num: m.num, stage: m.stage }
    if (m.score1 !== undefined) { entry.score1 = m.score1; entry.score2 = m.score2 }
    if (m.penalty1 !== undefined) { entry.penalty1 = m.penalty1; entry.penalty2 = m.penalty2 }
    if (m.penaltySequence) entry.penaltySequence = m.penaltySequence
    if (m.penaltyShootout) entry.penaltyShootout = m.penaltyShootout
    if (m.goals) entry.goals = m.goals
    return entry
  })
  console.log(`   ⏳ matches.json (${cleanMatches.length} matches raw)`)

  // 4. Top scorers
  const scorers = computeTopScorers(matches, teamsMap)
  writeJSON(resolve(DATA_DIR, 'top-scorers.json'), scorers)
  const top = scorers[0]
  console.log(`   ✅ top-scorers.json — ${scorers.length} players (top: ${top ? top.scorer + ' ' + top.goals + 'g' : 'none'})`)

  // 5. Third-placed
  const fairPlayScores = loadJSON(resolve(ROOT, 'data', 'fairplay.json')).scores || {}
  const thirdEntries = computeThirdPlaced(matches, teamsMap, groupLabels, fairPlayScores)
  writeJSON(resolve(DATA_DIR, 'third-placed.json'), { rankings: thirdEntries, qualifyingCount: 8, totalGroups: 12 })
  console.log(`   ✅ third-placed.json — ${thirdEntries.length} entries`)

  // 5b. Patch rank 3 status back into group files from third-placed results
  for (const entry of thirdEntries) {
    const gp = resolve(DATA_DIR, 'groups', `${entry.group}.json`)
    const groupData = loadJSON(gp)
    const rank3 = groupData.standings.find(s => s.rank === 3 && s.teamId === entry.teamId)
    if (rank3) {
      if (entry.qualified) rank3.status = 'advanced'
      else if (entry.eliminated) rank3.status = 'eliminated'
      writeJSON(gp, groupData)
    }
  }
  console.log(`   ✅ groups/ (A–L) — rank 3 status patched from third-placed`)

  // 6. Bracket
  const bracket = computeBracket(matches, teamsMap, groupLabels, fairPlayScores)
  writeJSON(resolve(DATA_DIR, 'bracket.json'), bracket)
  const totalBracket = Object.values(bracket.rounds).reduce((s, m) => s + m.length, 0)
  console.log(`   ✅ bracket.json — ${totalBracket} matches across ${Object.keys(bracket.rounds).length} rounds`)

  // ── 6b. Build per-match team resolution map for goal teamId resolution ──
  // Maps original placeholders (e.g. "2B", "W73") → resolved team IDs (e.g. "CAN")
  const teamResolveMap = {}
  for (const ms of Object.values(bracket.rounds)) {
    for (const bm of ms) {
      const map = {}
      map[bm.team1Original] = bm.team1Id
      map[bm.team2Original] = bm.team2Id
      teamResolveMap[bm.matchId] = map
    }
  }

  // 7. Apply bracket resolution back to matches (so Schedule/MatchPage show real names)
  const resolvedMap = {}
  for (const ms of Object.values(bracket.rounds)) {
    for (const bm of ms) {
      resolvedMap[bm.matchId] = { team1Id: bm.team1Id, team2Id: bm.team2Id }
    }
  }
  let resolved = 0
  for (const cm of cleanMatches) {
    const r = resolvedMap[cm.id]
    if (r && (r.team1Id !== cm.team1Id || r.team2Id !== cm.team2Id)) {
      cm.team1Original = cm.team1Id
      cm.team2Original = cm.team2Id
      cm.team1Id = r.team1Id
      cm.team2Id = r.team2Id
      resolved++
    }
    // Resolve goal teamIds using bracket resolution map
    if (cm.goals) {
      const tMap = teamResolveMap[cm.id] || {}
      for (const g of cm.goals) {
        if (tMap[g.teamId] && tMap[g.teamId] !== g.teamId) {
          g.teamId = tMap[g.teamId]
        }
      }
    }
  }
  writeJSON(resolve(DATA_DIR, 'matches.json'), cleanMatches)
  console.log(`   ✅ matches.json — ${cleanMatches.length} matches (${resolved} placeholders resolved)`)

  // 8. Teams + Stadiums (pass-through from source)
  writeJSON(resolve(DATA_DIR, 'teams.json'), { teams: source.teams })
  writeJSON(resolve(DATA_DIR, 'stadiums.json'), { stadiums: source.stadiums })

  const t1 = Date.now()
  console.log(`\n   ✨ Done in ${(t1 - t0)}ms — ${getSize(DATA_DIR)}`)
}

function getSize(dir) {
  let total = 0
  function walk(d) {
    for (const f of readdirSync(d)) {
      const p = resolve(d, f)
      if (statSync(p).isDirectory()) walk(p)
      else total += statSync(p).size
    }
  }
  walk(dir)
  return `${(total / 1024).toFixed(1)} KB`
}

main()
