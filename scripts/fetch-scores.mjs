/**
 * Fetch latest scores from openfootball and update sample-data.json
 *
 * Usage: node scripts/fetch-scores.mjs
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const OPENFOOTBALL_URL = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json'

const TEAM_IDS = {
  'Mexico': 'MEX', 'South Africa': 'RSA', 'South Korea': 'KOR', 'Czech Republic': 'CZE',
  'Canada': 'CAN', 'Bosnia & Herzegovina': 'BIH', 'Qatar': 'QAT', 'Switzerland': 'SUI',
  'Brazil': 'BRA', 'Morocco': 'MAR', 'Haiti': 'HAI', 'Scotland': 'SCO',
  'USA': 'USA', 'Paraguay': 'PAR', 'Australia': 'AUS', 'Turkey': 'TUR',
  'Germany': 'GER', 'Curaçao': 'CUW', 'Ivory Coast': 'CIV', 'Ecuador': 'ECU',
  'Netherlands': 'NED', 'Japan': 'JPN', 'Sweden': 'SWE', 'Tunisia': 'TUN',
  'Belgium': 'BEL', 'Egypt': 'EGY', 'Iran': 'IRN', 'New Zealand': 'NZL',
  'Spain': 'ESP', 'Cape Verde': 'CPV', 'Saudi Arabia': 'KSA', 'Uruguay': 'URU',
  'France': 'FRA', 'Senegal': 'SEN', 'Iraq': 'IRQ', 'Norway': 'NOR',
  'Argentina': 'ARG', 'Algeria': 'ALG', 'Austria': 'AUT', 'Jordan': 'JOR',
  'Portugal': 'POR', 'DR Congo': 'COD', 'Uzbekistan': 'UZB', 'Colombia': 'COL',
  'England': 'ENG', 'Croatia': 'CRO', 'Ghana': 'GHA', 'Panama': 'PAN',
}

function parseMinute(str) {
  const parts = String(str).split('+')
  return { minute: parseInt(parts[0]), stoppageTime: parts[1] ? parseInt(parts[1]) : undefined }
}

function buildGoals(ofm, team1Id, team2Id) {
  const goals1 = ofm.goals1 || [], goals2 = ofm.goals2 || []
  if (goals1.length === 0 && goals2.length === 0) return []
  const items = []
  for (const g of goals1) {
    const { minute, stoppageTime } = parseMinute(g.minute)
    const entry = { minute, scorer: g.name, teamId: team1Id }
    if (stoppageTime !== undefined) entry.stoppageTime = stoppageTime
    if (g.owngoal) entry.ownGoal = true
    if (g.penalty) entry.penalty = true
    items.push(entry)
  }
  for (const g of goals2) {
    const { minute, stoppageTime } = parseMinute(g.minute)
    const entry = { minute, scorer: g.name, teamId: team2Id }
    if (stoppageTime !== undefined) entry.stoppageTime = stoppageTime
    if (g.owngoal) entry.ownGoal = true
    if (g.penalty) entry.penalty = true
    items.push(entry)
  }
  items.sort((a, b) => (a.minute * 60 + (a.stoppageTime || 0)) - (b.minute * 60 + (b.stoppageTime || 0)))
  return items
}

async function main() {
  console.log('🌐 Fetching openfootball data...')
  const res = await fetch(OPENFOOTBALL_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  const withScores = data.matches.filter(m => m.score?.ft?.length === 2)
  console.log(`   ${data.matches.length} matches in source, ${withScores.length} with scores`)

  // Build lookup by match number and team pairs
  const byNum = new Map()
  for (const m of data.matches) if (m.num) byNum.set(m.num, m)

  // Load sample-data.json
  const sourcePath = resolve(ROOT, 'sample-data.json')
  const source = JSON.parse(readFileSync(sourcePath, 'utf-8'))

  let updated = 0
  for (const match of source.matches) {
    let ofm = byNum.get(match.num)
    if (!ofm) {
      // Fallback: match by team names
      ofm = data.matches.find(m =>
        TEAM_IDS[m.team1] === match.team1Id && TEAM_IDS[m.team2] === match.team2Id
      )
    }
    if (!ofm || !ofm.score?.ft) continue

    // Use ET score if available (decides the winner), otherwise FT
    const scoreToUse = ofm.score.et || ofm.score.ft
    const [s1, s2] = scoreToUse
    let changed = false
    if (match.score1 !== s1 || match.score2 !== s2) {
      match.score1 = s1
      match.score2 = s2
      changed = true
    }
    // Capture penalty shootout data
    if (ofm.score.p) {
      const pen1 = ofm.score.p[0], pen2 = ofm.score.p[1]
      if (match.penalty1 !== pen1 || match.penalty2 !== pen2) {
        match.penalty1 = pen1
        match.penalty2 = pen2
        changed = true
      }
    }
    if (changed) {
      match.goals = buildGoals(ofm, match.team1Id, match.team2Id)
      updated++
    }
  }

  writeFileSync(sourcePath, JSON.stringify(source, null, 2), 'utf-8')
  console.log(`   ✅ ${updated} scores updated in sample-data.json`)
}

main().catch(err => { console.error(err); process.exit(1) })
