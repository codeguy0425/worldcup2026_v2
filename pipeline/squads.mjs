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
const WIKI_ZH_URL = 'https://zh.wikipedia.org/wiki/2026%E5%B9%B4%E5%9C%8B%E9%9A%9B%E8%B6%B3%E5%8D%94%E4%B8%96%E7%95%8C%E7%9B%83%E5%8F%82%E8%B5%9B%E7%90%83%E5%91%98%E5%90%8D%E5%96%AE'

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
    const posClean = ({'1':'GK','2':'DF','3':'MF','4':'FW'})[pos[0]] || pos.replace(/^\d+/,'')
    players.push({ no, pos: posClean, name, club })
  }

  return players.length > 0 ? players : null
}

function parseSquadByPosition(html, teamOrder) {
  const tables = [...html.matchAll(/<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>.*?<\/table>/gs)]
  const teamIds = Object.values(TEAM_NAMES)
  const result = {}
  let ti = 0
  for (const t of tables) {
    const rows = [...t[0].matchAll(/<tr[^>]*>(.*?)<\/tr>/gs)]
    if (rows.length < 2) continue
    const cells = [...rows[1][1].matchAll(/<t[dh][^>]*>(.*?)<\/t[dh]>/gs)]
    if (cells.length < 7) continue
    const firstNo = parseInt(cells[0][1].replace(/<[^>]+>/g, '').trim())
    if (isNaN(firstNo)) continue
    const players = []
    for (const row of rows) {
      const c = [...row[1].matchAll(/<t[dh][^>]*>(.*?)<\/t[dh]>/gs)]
      if (c.length < 7) continue
      const no = parseInt(c[0][1].replace(/<[^>]+>/g, '').trim())
      const pos = c[1][1].replace(/<[^>]+>/g, '').trim()
      const name = c[2][1].replace(/<[^>]+>/g, '').trim().replace(/\s*\(captain\)\s*$/i, '').replace(/\s*\(captain\)/gi, '').trim()
      const club = c[6][1].replace(/<[^>]+>/g, '').trim().replace(/\[[^\]]*\]/g, '').trim()
      if (isNaN(no) || !pos || !name) continue
      const posClean2 = ({'1':'GK','2':'DF','3':'MF','4':'FW'})[pos[0]] || pos.replace(/^\d+/,'')
      players.push({ no, pos: posClean2, name, club })
    }
    if (players.length > 0 && ti < teamIds.length) {
      result[teamIds[ti++]] = players
    }
  }
  return result
}

async function main() {
  console.log('📋 Fetching EN squads from Wikipedia...')
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
    }
  }

  const outPath = resolve(DATA_DIR, 'squads.json')
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8')
  console.log(`✅ squads.json — ${found}/${Object.keys(TEAM_NAMES).length} teams, ${Object.values(result).reduce((a,b) => a+b.length, 0)} players total`)

  console.log('\n📋 Fetching ZH squads from Wikipedia...')
  try {
    const resp2 = await fetch(WIKI_ZH_URL)
    const html2 = await resp2.text()
    console.log(`   Downloaded ${html2.length} bytes`)
    const resultZh = parseSquadByPosition(html2, TEAM_NAMES)
    const foundZh = Object.keys(resultZh).length
    const outZhPath = resolve(DATA_DIR, 'squads-zh.json')
    writeFileSync(outZhPath, JSON.stringify(resultZh, null, 2), 'utf-8')
    console.log(`✅ squads-zh.json — ${foundZh}/${Object.keys(TEAM_NAMES).length} teams, ${Object.values(resultZh).reduce((a,b) => a+b.length, 0)} players total`)
  } catch(e) {
    console.log('   ❌ Failed:', e.message)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
