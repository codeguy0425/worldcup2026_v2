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

// Load override file
let overrideMap = {}
try {
  overrideMap = JSON.parse(readFileSync(resolve(DATA_DIR, 'scorer-no-override.json'), 'utf-8'))
} catch {}

function lookupNo(teamId, scorerName) {
  const key = (teamId + ':' + scorerName).toLowerCase()
  const fromSquad = squadMap[teamId]?.[scorerName.toLowerCase()]
  if (fromSquad !== undefined) return fromSquad
  const ov = overrideMap[key]
  if (ov !== undefined && ov !== null) return ov
  return undefined
}

let enriched = 0, notFound = 0
for (const m of matches) {
  if (!m.goals) continue
  for (const g of m.goals) {
    const no = lookupNo(g.teamId, g.scorer)
    if (no !== undefined) {
      g.scorerNo = no
      enriched++
    } else {
      notFound++
    }
  }
}

const outPath = resolve(DATA_DIR, 'matches.json')
writeFileSync(outPath, JSON.stringify(matches, null, 2), 'utf-8')
console.log(`✅ matches.json — ${enriched} goals with shirt numbers, ${notFound} still missing`)

// Also patch top-scorers.json
const topScorers = JSON.parse(readFileSync(resolve(DATA_DIR, 'top-scorers.json'), 'utf-8'))
let tsPatched = 0
for (const s of topScorers) {
  if (s.scorerNo !== undefined) continue
  const no = lookupNo(s.teamId, s.scorer)
  if (no !== undefined) {
    s.scorerNo = no
    tsPatched++
  }
}
writeFileSync(resolve(DATA_DIR, 'top-scorers.json'), JSON.stringify(topScorers, null, 2), 'utf-8')
console.log(`✅ top-scorers.json — ${tsPatched} entries patched with shirt numbers`)
