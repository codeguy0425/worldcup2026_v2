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
  'Bosnia and Herzegovina': 'BIH', 'Curaçao': 'CUW',
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
  // Try standard format: <h3><span id="Name">Name</span></h3>
  let pattern = new RegExp(
    `<h[23][^>]*>\\s*(?:<span[^>]*id="[^"]*"[^>]*>)?\\s*${escaped}\\s*(?:</span>)?\\s*</h[23]>.*?` +
    `(<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>.*?</table>)`, 's'
  )
  let m = html.match(pattern)
  const coach = extractCoach(m ? m[0] : "")
  if (m) return { players: parseTable(m[1]), order: m[0], coach }
  // Try alternative: <h3 id="Name"><span id="encoded"></span>Name</h3>
  pattern = new RegExp(
    `<h[23][^>]+id="[^"]*"[^>]*>\\s*<span[^>]*id="[^"]*"[^>]*>\\s*</span>\\s*${escaped}\\s*</h[23]>.*?` +
    `(<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>.*?</table>)`, 's'
  )
  m = html.match(pattern)
  if (m) return { players: parseTable(m[1]), order: m[0], coach: extractCoach(m[0]) }
  return null
}

function extractCoach(section) {
  const cm = section.match(/Coach:\s*((?:.(?!<\/p>))*.)/s)
  if (!cm) return null
  return cm[1].replace(/<[^>]+>/g, '').replace(/\s*\(captain\)\s*/i, '').trim() || null
}

function parseTable(table) {
  const rows = [...table.matchAll(/<tr[^>]*>(.*?)<\/tr>/gs)]
  const players = []
  for (const row of rows) {
    const cells = [...row[1].matchAll(/<t[dh][^>]*>(.*?)<\/t[dh]>/gs)]
    if (cells.length < 7) continue
    const no = parseInt(cells[0][1].replace(/<[^>]+>/g, '').trim())
    const pos = cells[1][1].replace(/<[^>]+>/g, '').trim()
    const nameRaw = cells[2][1].replace(/<[^>]+>/g, '').trim()
    const captain = /（隊長）/.test(nameRaw) || /\(captain\)/i.test(nameRaw)
    const viceCaptain = /（副隊長）/.test(nameRaw) || /\(vice.captain\)/i.test(nameRaw)
    const name = nameRaw.replace(/\s*[（(](?:隊長|副隊長|captain|vice.?captain)[）)]\s*/gi, '').trim()
    const club = cells[6][1].replace(/<[^>]+>/g, '').trim().replace(/\[[^\]]*\]/g, '').trim()
    if (isNaN(no) || !pos || !name) continue
    const posClean = ({'1':'GK','2':'DF','3':'MF','4':'FW'})[pos[0]] || pos.replace(/^\d+/,'')
    players.push({ no, pos: posClean, name, club, captain, viceCaptain })
  }
  return players
}
function parseSquadByPosition(html, enOrder, enData) {
  // Extract squad tables from ZH page paired with their <h3> heading
  // Regex: h3 heading followed by wikitable
  const sectionPattern = /<h[23][^>]*>.*?<\/h[23]>[\s\S]*?(?:<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>[\s\S]*?<\/table>)/g
  const sections = [...html.matchAll(sectionPattern)]
  const zhTables = []
  for (const sec of sections) {
    const full = sec[0]
    // Extract heading text from h3 (ZH wiki: <h3 id="墨西哥"><span id="..."></span>墨西哥</h3>)
    const headingMatch = full.match(/<h[23][^>]*>.*?<\/span>\s*([^<>\s][^<>]{0,20}?)\s*<\/h[23]>/)
    const headingText = headingMatch ? headingMatch[1].trim() : ''
    const tableHtml = full.match(/(<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>[\s\S]*?<\/table>)/)
    if (!tableHtml) continue
    const rows = [...tableHtml[1].matchAll(/<tr[^>]*>(.*?)<\/tr>/gs)]
    if (rows.length < 2) continue
    const cells = [...rows[1][1].matchAll(/<t[dh][^>]*>(.*?)<\/t[dh]>/gs)]
    if (cells.length < 7) continue
    if (isNaN(parseInt(cells[0][1].replace(/<[^>]+>/g, '').trim()))) continue
    const players = []
    for (const row of rows) {
      const c = [...row[1].matchAll(/<t[dh][^>]*>(.*?)<\/t[dh]>/gs)]
      if (c.length < 7) continue
      const no = parseInt(c[0][1].replace(/<[^>]+>/g, '').trim())
      const pos = c[1][1].replace(/<[^>]+>/g, '').trim()
      const nameRaw = c[2][1].replace(/<[^>]+>/g, '').trim()
      const captain = /（隊長）/.test(nameRaw) || /\(captain\)/i.test(nameRaw)
      const viceCaptain = /（副隊長）/.test(nameRaw) || /\(vice.captain\)/i.test(nameRaw)
      const name = nameRaw.replace(/\s*[（(](?:隊長|副隊長|captain|vice.?captain)[）)]\s*/gi, '').trim()
      const club = c[6][1].replace(/<[^>]+>/g, '').trim().replace(/\[[^\]]*\]/g, '').trim()
      if (isNaN(no) || !pos || !name) continue
      const posClean = ({'1':'GK','2':'DF','3':'MF','4':'FW'})[pos[0]] || pos.replace(/^\d+/,'').replace(/门将/g,'門將').replace(/后卫/g,'後衛').replace(/守门员/g,'門將')
      players.push({ no, pos: posClean, name, club, captain, viceCaptain })
    }
    if (players.length > 0) zhTables.push({ heading: headingText, players })
  }

  // Map Chinese team headings to EN team IDs
  const HEADING_MAP = {
    '墨西哥': 'MEX', '南非': 'RSA', '韓國': 'KOR', '捷克': 'CZE',
    '加拿大': 'CAN', '波黑': 'BIH', '卡塔爾': 'QAT', '瑞士': 'SUI',
    '巴西': 'BRA', '摩洛哥': 'MAR', '海地': 'HAI', '蘇格蘭': 'SCO',
    '美國': 'USA', '巴拉圭': 'PAR', '澳洲': 'AUS', '土耳其': 'TUR',
    '德國': 'GER', '科特迪瓦': 'CIV', '厄瓜多爾': 'ECU', '庫拉索': 'CUW',
    '荷蘭': 'NED', '日本': 'JPN', '瑞典': 'SWE', '突尼斯': 'TUN',
    '比利時': 'BEL', '埃及': 'EGY', '伊朗': 'IRN', '新西蘭': 'NZL',
    '西班牙': 'ESP', '佛得角': 'CPV', '烏拉圭': 'URU', '沙特阿拉伯': 'KSA',
    '法國': 'FRA', '挪威': 'NOR', '塞內加爾': 'SEN', '伊拉克': 'IRQ',
    '阿根廷': 'ARG', '奧地利': 'AUT', '阿爾及利亞': 'ALG', '約旦': 'JOR',
    '哥倫比亞': 'COL', '葡萄牙': 'POR', '民主剛果': 'COD', '烏茲別克斯坦': 'UZB',
    '英格蘭': 'ENG', '克羅地亞': 'CRO', '加納': 'GHA', '巴拿馬': 'PAN',
  }

  const result = {}
  const usedTeams = new Set()
  const usedHeadings = new Set()

  // First pass: match ZH tables by heading
  for (const zh of zhTables) {
    const teamId = HEADING_MAP[zh.heading]
    if (teamId && !usedTeams.has(teamId)) {
      result[teamId] = zh.players
      usedTeams.add(teamId)
      usedHeadings.add(zh.heading)
    }
  }

  // Second pass: assign remaining ZH tables to unmatched EN teams sequentially
  const unmatched = zhTables.filter(zh => !usedHeadings.has(zh.heading))
  let ui = 0
  for (let ti = 0; ti < enOrder.length; ti++) {
    const teamId = enOrder[ti]
    if (result[teamId]) continue
    const enPlayers = enData[teamId]
    if (!enPlayers) continue
    if (ui >= unmatched.length) break
    result[teamId] = unmatched[ui].players
    ui++
  }
  return result
}

async function main() {
  console.log('📋 Fetching EN squads from Wikipedia...')
  const resp = await fetch(WIKI_URL, { headers: { 'User-Agent': 'WC2026App/1.0' } })
  const html = await resp.text()
  console.log(`   Downloaded ${html.length} bytes`)

  const result = {}
  const coaches = {}
  let found = 0

  for (const [wikiName, teamId] of Object.entries(TEAM_NAMES)) {
    const parsed = parseSquad(html, wikiName)
    if (parsed) {
      result[teamId] = parsed.players
      if (parsed.coach) coaches[teamId] = parsed.coach
      found++
    }
  }

  const enOrder = [
    // ZH page order (group A->L, by standing: 1st, 2nd, 3rd, 4th)
    'MEX','RSA','KOR','CZE',           // Group A
    'SUI','CAN','BIH','QAT',           // Group B
    'BRA','MAR','SCO','HAI',           // Group C
    'USA','AUS','PAR','TUR',           // Group D
    'GER','CIV','ECU','CUW',           // Group E
    'NED','JPN','SWE','TUN',           // Group F
    'BEL','EGY','IRN','NZL',           // Group G
    'ESP','CPV','URU','KSA',           // Group H
    'FRA','NOR','SEN','IRQ',           // Group I
    'ARG','AUT','ALG','JOR',           // Group J
    'COL','POR','COD','UZB',           // Group K
    'ENG','CRO','GHA','PAN',           // Group L
  ]

  const outPath = resolve(DATA_DIR, 'squads.json')
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8')
  writeFileSync(resolve(DATA_DIR, 'coaches.json'), JSON.stringify(coaches, null, 2), 'utf-8')
  console.log(`✅ coaches.json — ${Object.keys(coaches).length} teams`)
  console.log(`✅ squads.json — ${found}/${Object.keys(TEAM_NAMES).length} teams, ${Object.values(result).reduce((a,b) => a+b.length, 0)} players total`)

  console.log('\n📋 Fetching ZH squads from Wikipedia...')
  try {
    const resp2 = await fetch(WIKI_ZH_URL, { headers: { 'Accept-Language': 'zh-HK,zh-Hant-HK;q=0.9,zh-TW;q=0.5' } })
    const html2 = await resp2.text()
    console.log(`   Downloaded ${html2.length} bytes`)
    const resultZh = parseSquadByPosition(html2, enOrder, result)
    const foundZh = Object.keys(resultZh).length
    const outZhPath = resolve(DATA_DIR, 'squads-zh.json')
    writeFileSync(outZhPath, JSON.stringify(resultZh, null, 2), 'utf-8')
    console.log(`✅ squads-zh.json — ${foundZh}/${Object.keys(TEAM_NAMES).length} teams, ${Object.values(resultZh).reduce((a,b) => a+b.length, 0)} players total`)
  } catch(e) {
    console.log('   ❌ Failed:', e.message)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
