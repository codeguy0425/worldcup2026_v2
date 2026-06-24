#!/usr/bin/env node
/**
 * Fetch FIFA World Ranking for all 48 participating teams.
 * Uses the live ranking API (static during World Cup period).
 * 
 * Usage: node scripts/fetch-fifa-ranking.mjs
 * Output: data/fifa-ranking.json — { teamId: rank, ... }
 * 
 * The ranking at tournament start is the final tiebreaker
 * for third-placed team ranking per FIFA regulations.
 */

const API_URL = 'https://api.fifa.com/api/v3/fifarankings/rankings/live?gender=1&sportType=0&language=en'

// All 48 teams in the 2026 World Cup (teamId from sample-data.json)
const TEAM_IDS = [
  'MEX', 'RSA', 'KOR', 'CZE', // A
  'SUI', 'CAN', 'BIH', 'QAT', // B
  'BRA', 'MAR', 'HAI', 'SCO', // C
  'USA', 'AUS', 'TUR', 'PAR', // D
  'GER', 'CUW', 'CIV', 'ECU', // E
  'NED', 'JPN', 'SWE', 'TUN', // F
  'BEL', 'EGY', 'IRN', 'NZL', // G
  'ESP', 'CPV', 'KSA', 'URU', // H
  'FRA', 'SEN', 'IRQ', 'NOR', // I
  'ARG', 'AUT', 'JOR', 'POR', // J
  'COL', 'ENG', 'CRO', 'GHA', // K
  'PAN', 'COD', 'UZB', 'ALG', // L
]

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUTPUT = resolve(ROOT, 'data', 'fifa-ranking.json')

async function main() {
  console.log('🌐 Fetching FIFA World Ranking...')

  const res = await fetch(API_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WC2026-Pipeline)' }
  })

  if (!res.ok) {
    throw new Error(`API returned ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  const allTeams = data.Results || []

  if (!allTeams.length) {
    throw new Error('No ranking data received')
  }

  console.log(`   ${allTeams.length} teams in global ranking`)

  // Extract ranking for our 48 teams
  const ranking = {}
  const teamIdToCountry = {}
  
  for (const t of allTeams) {
    teamIdToCountry[t.IdCountry] = t.IdCountry
  }

  let found = 0
  let missing = []

  for (const tid of TEAM_IDS) {
    const entry = allTeams.find(t => t.IdCountry === tid)
    if (entry) {
      ranking[tid] = {
        rank: entry.Rank,
        points: Math.round(entry.TotalPoints * 100) / 100,
        prevRank: entry.PrevRank,
      }
      found++
    } else {
      missing.push(tid)
    }
  }

  // Log results
  console.log(`   ${found}/${TEAM_IDS.length} teams found in ranking`)
  if (missing.length) {
    console.log(`   ⚠️  Missing teams: ${missing.join(', ')}`)
  }

  // Sort by rank and display
  const sorted = Object.entries(ranking)
    .sort(([, a], [, b]) => a.rank - b.rank)

  console.log('\n📊 FIFA Rankings for WC2026 participants:')
  console.log('   Rank  Team        Pts     (prev)')
  for (const [tid, r] of sorted) {
    const change = r.prevRank && r.prevRank !== r.rank
      ? ` (${r.prevRank > r.rank ? '+' : ''}${r.prevRank - r.rank})`
      : ''
    console.log(`   #${String(r.rank).padEnd(4)} ${tid.padEnd(4)} ${String(r.points).padEnd(8)}${change}`)
  }

  // Write output
  writeFileSync(OUTPUT, JSON.stringify(ranking, null, 2) + '\n')
  console.log(`\n✅ Written to ${OUTPUT}`)
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
