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

  // 3. Matches (pass-through with clean format)
  const cleanMatches = matches.map(m => {
    const entry = { id: m.id, round: m.round, date: m.date, time: m.time, timeUtc: m.timeUtc, team1Id: m.team1Id, team2Id: m.team2Id, group: m.group || '', groundId: m.groundId, num: m.num, stage: m.stage }
    if (m.score1 !== undefined) { entry.score1 = m.score1; entry.score2 = m.score2 }
    if (m.goals) entry.goals = m.goals
    return entry
  })
  writeJSON(resolve(DATA_DIR, 'matches.json'), cleanMatches)
  console.log(`   ✅ matches.json — ${cleanMatches.length} matches`)

  // 4. Top scorers
  const scorers = computeTopScorers(matches, teamsMap)
  writeJSON(resolve(DATA_DIR, 'top-scorers.json'), scorers)
  const top = scorers[0]
  console.log(`   ✅ top-scorers.json — ${scorers.length} players (top: ${top ? top.scorer + ' ' + top.goals + 'g' : 'none'})`)

  // 5. Third-placed
  const thirdEntries = computeThirdPlaced(matches, teamsMap, groupLabels)
  writeJSON(resolve(DATA_DIR, 'third-placed.json'), { rankings: thirdEntries, qualifyingCount: 8, totalGroups: 12 })
  console.log(`   ✅ third-placed.json — ${thirdEntries.length} entries`)

  // 6. Bracket
  const bracket = computeBracket(matches, teamsMap, groupLabels)
  writeJSON(resolve(DATA_DIR, 'bracket.json'), bracket)
  const totalBracket = Object.values(bracket.rounds).reduce((s, m) => s + m.length, 0)
  console.log(`   ✅ bracket.json — ${totalBracket} matches across ${Object.keys(bracket.rounds).length} rounds`)

  // 7. Teams + Stadiums (pass-through from source)
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
