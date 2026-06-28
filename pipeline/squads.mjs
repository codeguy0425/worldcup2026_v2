/**
 * Squad scraper — fetch player squads from Wikipedia for all 48 teams.
 * Output: app/public/data/squads.json (Map<teamId, Player[]>)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const DATA_DIR = resolve(ROOT, 'app/public/data')
const WIKI_URL = 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_squads'

// Map Wikipedia team names → our team IDs
const TEAM_NAMES = {
  'Mexico': 'MEX', 'South Africa': 'RSA', 'South Korea': 'KOR',
  'Czech Republic': 'CZE', 'Canada': 'CAN',
  'Qatar': 'QAT', 'Switzerland': 'SUI', 'Brazil': 'BRA',
  'Morocco': 'MAR', 'Haiti': 'HAI', 'Scotland': 'SCO',
  'United States': 'USA', 'Paraguay': 'PAR', 'Australia': 'AUS',
  'Turkey': 'TUR', 'Germany': 'GER',
  'Ivory Coast': 'CIV', 'Ecuador': 'ECU', 'France': 'FRA',
  'Sweden': 'SWE', 'Tunisia': 'TUN', 'Japan': 'JPN',
  'Norway': 'NOR', 'Netherlands': 'NED', 'Ghana': 'GHA',
  'New Zealand': 'NZL', 'Saudi Arabia': 'KSA', 'Spain': 'ESP',
  'Uruguay': 'URU', 'Iraq': 'IRQ',
  'Iran': 'IRN', 'Egypt': 'EGY', 'Algeria': 'ALG',
  'Argentina': 'ARG', 'Austria': 'AUT', 'Jordan': 'JOR',
  'DR Congo': 'COD', 'Portugal': 'POR', 'Uzbekistan': 'UZB',
  'England': 'ENG', 'Belgium': 'BEL', 'Senegal': 'SEN',
  'Panama': 'PAN', 'Croatia': 'CRO', 'Colombia': 'COL',
  'Cape Verde': 'CPV',
}
// Reverse: our ID → Wikipedia name
const ID_TO_WIKI = {}
for (const [k, v] of Object.entries(TEAM_NAMES)) ID_TO_WIKI[v] = k

function parseSquad(html, teamName) {
  // Find the table right after a heading like "<h3><span id="Mexico">"
  const escaped = teamName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(
    `<h[23][^>]*>\\s*(?:<span[^>]*id="[^"]*"[^>]*>)?\\s*${escaped}\\s*(?:</span>)?\\s*</h[23]>.*?` +
    `(<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>.*?</table>)`,
    's'
  )
  const m = html.match(pattern)
  if (!m) return null

  const table = m[1]
  const rows = [...table.matchAll(/<tr[^>]*>(.*?)<\/tr>/gs)]
  const players = []

  for (const row of rows) {
    const cells = [...row[1].matchAll(/<t[dh][^>]*>(.*?)<\/t[dh]>/gs)]
    if (cells.length < 7) continue
    // cells: No., Pos., Player, DOB, Caps, Goals, Club
    const no = parseInt(cells[0][1].replace(/<[^>]+>/g, '').trim())
    const pos = cells[1][1].replace(/<[^>]+>/g, '').trim()
    const name = cells[2][1].replace(/<[^>]+>/g, '').trim().replace(/\s*\(captain\)\s*$/, '').replace(/\s*\(captain\)/g, '').trim()
    const club = cells[6][1].replace(/<[^>]+>/g, '').trim().replace(/\[[^\]]*\]/g, '').trim()
    if (isNaN(no) || !pos || !name) continue
    players.push({ no, pos, name, club })
  }

  return players.length > 0 ? players : null
}

async function main() {
  console.log('📋 Fetching squads from Wikipedia...')
  const resp = await fetch(WIKI_URL)
  const html = await resp.text()
  console.log(`   Downloaded ${html.length} bytes`)

  const result = {}
  let found = 0

  for (const [wikiName, teamId] of Object.entries(TEAM_NAMES)) {
    const players = parseSquad(html, wikiName)
    if (players) {
      result[teamId] = players
      found++
      console.log(`   ✅ ${wikiName} (${teamId}) — ${players.length} players`)
    } else {
      console.log(`   ❌ ${wikiName} (${teamId}) — not found`)
    }
  }

  const outPath = resolve(DATA_DIR, 'squads.json')
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8')
  console.log(`\n✅ squads.json — ${found}/${Object.keys(TEAM_NAMES).length} teams, ${Object.values(result).reduce((a,b) => a+b.length, 0)} players total`)
}

main().catch(err => { console.error(err); process.exit(1) })
