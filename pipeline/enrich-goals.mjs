/**
 * Enrich match goals with shirt numbers from squad data.
 * Run after squads.mjs: node pipeline/enrich-goals.mjs
 * Then rebuild and deploy.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const DATA_DIR = resolve(ROOT, 'app/public/data')

const matches = JSON.parse(readFileSync(resolve(DATA_DIR, 'matches.json'), 'utf-8'))
const squads = JSON.parse(readFileSync(resolve(DATA_DIR, 'squads.json'), 'utf-8'))

// Build map: teamId → lowercased_name → shirtNo
const squadMap = {}
for (const [teamId, players] of Object.entries(squads)) {
  squadMap[teamId] = {}
  for (const p of players) {
    squadMap[teamId][p.name.toLowerCase()] = p.no
  }
}

let enriched = 0, notFound = 0
for (const m of matches) {
  if (!m.goals) continue
  for (const g of m.goals) {
    const teamNoMap = squadMap[g.teamId]
    if (teamNoMap) {
      const no = teamNoMap[g.scorer.toLowerCase()]
      if (no !== undefined) {
        g.scorerNo = no
        enriched++
      } else {
        notFound++
      }
    }
  }
}

const outPath = resolve(DATA_DIR, 'matches.json')
writeFileSync(outPath, JSON.stringify(matches, null, 2), 'utf-8')
console.log(`✅ Goals enriched: ${enriched} matched, ${notFound} not found in squad data`)
