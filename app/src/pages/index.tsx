// Re-export from separate page files
export { TeamsPage } from './Teams'
export { GroupsPage } from './Groups'
export { ScorersPage } from './Scorers'
export { ThirdPlacedPage } from './ThirdPlaced'
export { BracketPage } from './Bracket'
export { StadiumsPage } from './Stadiums'
export { TeamPage } from './TeamDetail'
export { GroupPage } from './GroupDetail'

import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { useJson } from '../hooks/useJson'
import { toHkt, hktDateLabel } from '../hooks/hkTime'
import { useLang } from '../hooks/LangProvider'

// ─── Shared helpers ───

function trRound(r: string, t: any): string {
  const md = r.match(/^Matchday (\d+)$/)
  if (md) return t.round.md(parseInt(md[1]))
  const m: Record<string, string> = { 'Round of 32': t.round.r32, 'Round of 16': t.round.r16, 'Quarter-final': t.round.qf, 'Semi-final': t.round.sf, 'Match for third place': t.round.third, 'Final': t.round.final }
  return m[r] || r
}

/** Format score with penalty shootout if applicable */
export function fmtScore(m: { score1?: number; score2?: number; penalty1?: number; penalty2?: number }): string {
  if (m.score1 === undefined) return 'vs'
  const s = `${m.score1}–${m.score2}`
  if (m.penalty1 !== undefined) return `(${m.penalty1}) ${s} (${m.penalty2})`
  return s
}

// Compute last N results for a team
export function computeForm(teamId: string, allMatches: Match[]): ('W'|'D'|'L')[] {
  const played = allMatches
    .filter(m => (m.team1Id === teamId || m.team2Id === teamId) && m.score1 !== undefined && m.stage !== 'third')
    .sort((a, b) => {
      const da = a.date + 'T' + (a.timeUtc || a.time || '00:00') + ':00Z'
      const db = b.date + 'T' + (b.timeUtc || b.time || '00:00') + ':00Z'
      return db.localeCompare(da) // newest first
    })
    .slice(0, 5)
    .reverse() // chronological for display
  return played.map(m => {
    if (m.team1Id === teamId) {
      if (m.score1! > m.score2!) return 'W'
      if (m.score1! < m.score2!) return 'L'
      return 'D'
    }
    if (m.score2! > m.score1!) return 'W'
    if (m.score2! < m.score1!) return 'L'
    return 'D'
  })
}

interface Match {
  id: number; round: string; date: string; time: string
  team1Id: string; team2Id: string; group?: string
  score1?: number; score2?: number; stage: string; groundId?: string
  goals?: GoalEvent[]; timeUtc?: string
  team1Original?: string; team2Original?: string
  penaltySequence?: Record<string, string>
}

interface GoalEvent {
  minute: number; scorer: string; teamId: string; scorerNo?: number
  ownGoal?: boolean; penalty?: boolean; stoppageTime?: number
}

// ─── Match Detail (override) types ───

interface LineupSlot {
  no: number; pos?: 'GK'|'DF'|'MF'|'FW'; name?: string; captain?: boolean
}

interface TeamDetail {
  teamId: string; formation: string; coach: string
  startingXI: LineupSlot[]; substitutes: LineupSlot[]
}

interface SubstitutionEvent {
  minute: number; stoppageTime?: number; teamId: string
  off: { no: number; name: string }; on: { no: number; name: string }
}

interface CardEvent {
  minute: number; stoppageTime?: number; teamId: string
  player: { no: number; name: string }; card: 'yellow'|'red'
}

interface MatchDetail {
  team1: TeamDetail; team2: TeamDetail
  substitutions?: SubstitutionEvent[]; cards?: CardEvent[]
}

interface Team { id: string; name: string; flag: string }
interface StadiumInfo { id: string; name: string; city: string; country: string }

interface BracketData { rounds: Record<string, BracketMatch[]> }
interface BracketMatch {
  matchId: number; round: string; date: string
  team1Id: string; team2Id: string
  team1Original?: string; team2Original?: string
  team1Resolved?: boolean; team2Resolved?: boolean
  groundId?: string; score1?: number; score2?: number
}

// ─── Schedule Page ───

export function SchedulePage() {
  const { t } = useLang()
  const { data: matchData, loading } = useJson<Match[]>('/data/matches.json')
  const { data: teamData } = useJson<{ teams: Team[] }>('/data/teams.json')

  const teamMap = new Map<string, Team>()
  teamData?.teams.forEach(t => teamMap.set(t.id, t))

  const matches = matchData ?? []
  const roundOrder = ['Matchday 1','Matchday 2','Matchday 3','Matchday 4','Matchday 5','Matchday 6','Matchday 7','Matchday 8','Matchday 9','Matchday 10','Matchday 11','Matchday 12','Matchday 13','Matchday 14','Matchday 15','Matchday 16','Matchday 17','Round of 32','Round of 16','Quarter-final','Semi-final','Match for third place','Final']

  const [filter, setFilter] = useState<string>('all')
  const { data: viutvData } = useJson<{ matchId: number }[]>('/data/viutv.json')
  const viutvIds = new Set((viutvData ?? []).map((v: any) => v.matchId))

  const stageFilters = [
    { key: 'all', label: 'All' },
    { key: 'group', label: 'Group' },
    { key: 'r32', label: 'R32' },
    { key: 'r16', label: 'R16' },
    { key: 'qf', label: 'QF' },
    { key: 'sf', label: 'SF' },
    { key: 'third', label: '3rd' },
    { key: 'final', label: 'Final' },
    { key: 'viutv', label: '📺 ViuTV' },
  ]

  const filtered = filter === 'all'
    ? matches
    : filter === 'viutv'
    ? matches.filter(m => viutvIds.has(m.id))
    : matches.filter(m => m.stage === filter || (filter === 'group' && m.stage === 'group'))

  const grouped: Record<string, Match[]> = {}
  for (const r of roundOrder) {
    const ms = filtered.filter(m => m.round === r)
    if (ms.length) {
      ms.sort((a, b) => {
        const da = a.date + 'T' + (a.timeUtc || a.time || '00:00') + ':00Z'
        const db = b.date + 'T' + (b.timeUtc || b.time || '00:00') + ':00Z'
        return da.localeCompare(db)
      })
      grouped[r] = ms
    }
  }

  return (
    <div>
      <div style={{ position: 'sticky', top: '48px', zIndex: 50, background: 'var(--bg)', padding: 'var(--space-lg) 0 12px', marginTop: 'calc(-1 * var(--space-lg))' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'var(--weight-display)', marginBottom: '4px' }}>{t.schedule.title}</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>{t.schedule.desc.replace('{n}', String(matches.length))}</p>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: 0, flexWrap: 'wrap' }}>
        {stageFilters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500,
            letterSpacing: '0.3px', textTransform: 'uppercase',
            padding: '4px 10px', borderRadius: 'var(--radius-sm)',
            border: `1px solid ${filter === f.key ? 'var(--accent)' : 'var(--border)'}`,
            background: filter === f.key ? 'var(--accent)' : 'var(--surface)',
            color: filter === f.key ? '#fff' : 'var(--text-muted)',
            cursor: 'pointer',
          }}>
            {f.label}
          </button>
        ))}
      </div>
      </div>

      {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading...</p> : (
        Object.entries(grouped).map(([round, ms]) => (
          <div key={round} style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500,
              letterSpacing: '0.5px', textTransform: 'uppercase',
              color: 'var(--accent)', marginBottom: '8px'
            }}>
              {trRound(round, t)}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {ms.map(m => {
                const t1 = teamMap.get(m.team1Id)
                const t2 = teamMap.get(m.team2Id)
                const hasScore = m.score1 !== undefined
                return (
                  <Link key={m.id} to={`/match/${m.id}`} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    textDecoration: 'none', color: 'inherit', fontSize: '13px',
                  }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', minWidth: '52px', display: 'flex', alignItems: 'center', gap: '2px', position: 'relative' }}>
                      <span>{(() => { const lang = t.lang === 'En' ? 'zh' : 'en'; const h = toHkt(m.date, m.timeUtc); return `${hktDateLabel(m.date, m.timeUtc, lang)} ${h.time}` })()}</span>
                      {viutvIds.has(m.id) && <span title="ViuTV 免費直播" style={{ position: 'absolute', right: '-16px', top: '50%', transform: 'translateY(-50%)', lineHeight: 1 }}>📺</span>}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'flex-end', minWidth: 0 }}>
                      <span>{t1?.flag || ''}</span>
                      <span style={{ fontWeight: 500, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>{t1?.name || m.team1Id}</span>
                    </span>
                    <span style={{
                      fontWeight: 700, fontSize: '14px', minWidth: '32px', textAlign: 'center',
                      color: hasScore ? 'var(--text)' : 'var(--text-muted)',
                    }}>
                      {hasScore ? fmtScore(m) : 'vs'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 500, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>{t2?.name || m.team2Id}</span>
                      <span>{t2?.flag || ''}</span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

// ─── Match Page ───

export function MatchPage() {
  const { t } = useLang()
  const { id } = useParams()
  const { data: matches, loading } = useJson<Match[]>('/data/matches.json?v=2')
  const { data: teamData } = useJson<{ teams: Team[] }>('/data/teams.json')
  const { data: stadiumData } = useJson<{ stadiums: StadiumInfo[] }>('/data/stadiums.json')
  const { data: bracketData } = useJson<BracketData>('/data/bracket.json')
  const { data: viutvData } = useJson<{ matchId: number }[]>('/data/viutv.json')
  // Match detail override (lineup / subs / cards) — per-match file
  const detailPath = id ? `/data/match-detail/${id}.json` : ''
  const { data: detail } = useJson<MatchDetail | null>(detailPath)
  const curMatch = (matches ?? []).find(m => m.id === Number(id))
  const gpPath = curMatch?.group ? `/data/groups/${curMatch.group}.json` : ''
  const { data: groupData } = useJson<any>(gpPath)
  const viutvIds = new Set((viutvData ?? []).map((v: any) => v.matchId))

  const allMatches = matches ?? []
  const teamMap = new Map<string, Team>()
  teamData?.teams.forEach(t => teamMap.set(t.id, t))
  const stadiumMap = new Map<string, StadiumInfo>()
  stadiumData?.stadiums.forEach(s => stadiumMap.set(s.id, s))

  // Load squad data per-team for lineup display (only 2 teams needed)
  const enPath1 = curMatch ? `/data/squads/${curMatch.team1Id}.json` : ''
  const enPath2 = curMatch ? `/data/squads/${curMatch.team2Id}.json` : ''
  const zhPath1 = curMatch ? `/data/squads/${curMatch.team1Id}-zh.json` : ''
  const zhPath2 = curMatch ? `/data/squads/${curMatch.team2Id}-zh.json` : ''
  const enMap1 = useJson<any[]>(enPath1)
  const enMap2 = useJson<any[]>(enPath2)
  const zhMap1 = useJson<any[]>(zhPath1)
  const zhMap2 = useJson<any[]>(zhPath2)
  const { data: scorerNameData } = useJson<Record<string, string>>('/data/scorer-names.json')
  const scorerNameMap = new Map(Object.entries(scorerNameData ?? {}))
  const { data: overrideData } = useJson<any>('/data/scorer-no-override.json')
  const overrideMap = new Map<string, number>()
  if (overrideData) {
    for (const [key, no] of Object.entries(overrideData) as [string, any][]) {
      if (no !== null) overrideMap.set(key.toLowerCase(), no as number)
    }
  }

  const bracketStages = new Set(['r32', 'r16', 'qf', 'sf', 'third', 'final'])

  // Player name lookup by shirt number from per-team squad data (for lineup display)
  const enPlayerMap = new Map<string, string>()
  const zhPlayerMap = new Map<string, string>()
  const team1En = enMap1.data
  const team2En = enMap2.data
  const team1Zh = zhMap1.data
  const team2Zh = zhMap2.data
  if (curMatch) {
    if (team1En) for (const p of team1En) enPlayerMap.set(curMatch.team1Id + ':' + p.no, p.name)
    if (team2En) for (const p of team2En) enPlayerMap.set(curMatch.team2Id + ':' + p.no, p.name)
    if (team1Zh) for (const p of team1Zh) zhPlayerMap.set(curMatch.team1Id + ':' + p.no, p.name)
    if (team2Zh) for (const p of team2Zh) zhPlayerMap.set(curMatch.team2Id + ':' + p.no, p.name)
  }

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
  const m = allMatches.find(m => m.id === Number(id))
  if (!m) return <p style={{ color: 'var(--text-muted)' }}>Match not found</p>

  const t1 = teamMap.get(m.team1Id)
  const t2 = teamMap.get(m.team2Id)
  const stadium = m.groundId ? stadiumMap.get(m.groundId) : null
  const hasScore = m.score1 !== undefined
  const isBracketMatch = bracketStages.has(m.stage)

  // ─── Parent matches (for knockout, show the matches that led here) ───
  const parentMatches = (() => {
    if (!isBracketMatch || m.stage === 'r32' || !allMatches.length) return null
    const p1 = m.team1Id.match(/^([WL])(\d+)$/) || m.team1Original?.match(/^([WL])(\d+)$/)
    const p2 = m.team2Id.match(/^([WL])(\d+)$/) || m.team2Original?.match(/^([WL])(\d+)$/)
    if (!p1 && !p2) return null
    const src1 = p1 ? allMatches.find(x => x.id === Number(p1[2])) : null
    const src2 = p2 ? allMatches.find(x => x.id === Number(p2[2])) : null
    return { src1, src2 }
  })()

  // ─── 1. Team form ───
  const form1 = teamMap.has(m.team1Id) ? computeForm(m.team1Id, allMatches) : []
  const form2 = teamMap.has(m.team2Id) ? computeForm(m.team2Id, allMatches) : []
  const formColor = { 'W': '#34d399', 'D': '#fbbf24', 'L': '#fb7185' } as Record<string, string>

  // ─── 3. Bracket path context ───
  const nextRoundInfo = (() => {
    if (!isBracketMatch || m.stage === 'third' || m.stage === 'final' || !bracketData) return null
    const wId = `W${m.id}`
    const lId = `L${m.id}`

    // SF → Final (winner) + Third place (loser)
    if (m.stage === 'sf') {
      const finalMs = bracketData.rounds['final'] || []
      const finalMatch = finalMs.find((n: BracketMatch) => n.team1Id === wId || n.team2Id === wId)
      const thirdMs = bracketData.rounds['third'] || []
      const thirdMatch = thirdMs.find((n: BracketMatch) => n.team1Id === lId || n.team2Id === lId)
      const fOpp = finalMatch ? (() => {
        const isT1 = finalMatch.team1Id === wId
        const oppId = isT1 ? finalMatch.team2Id : finalMatch.team1Id
        const o = teamMap.get(oppId)
        return o ? `${o.flag} ${o.name}` : null
      })() : null
      const tOpp = thirdMatch ? (() => {
        const isT1 = thirdMatch.team1Id === lId
        const oppId = isT1 ? thirdMatch.team2Id : thirdMatch.team1Id
        const o = teamMap.get(oppId)
        return o ? `${o.flag} ${o.name}` : null
      })() : null
      return {
        type: 'sf',
        winnerRound: t.round.final,
        winnerOpp: fOpp,
        loserRound: t.round.third,
        loserOpp: tOpp,
      }
    }

    // R32 / R16 / QF → next round
    const nextRoundOrder = ['r32', 'r16', 'qf', 'sf']
    const idx = nextRoundOrder.indexOf(m.stage)
    if (idx < 0) return null
    const nextRn = nextRoundOrder[idx + 1]
    const nextMs = bracketData.rounds[nextRn] || []
    const nm = nextMs.find((n: BracketMatch) => n.team1Original === wId || n.team2Original === wId)
    if (!nm) return null
    const isT1 = nm.team1Original === wId
    const oppId = isT1 ? nm.team2Id : nm.team1Id
    const oppTeam = teamMap.get(oppId)
    const oppName = oppTeam?.name || oppId
    const oppFlag = oppTeam?.flag || ''
    const roundLabel: Record<string, string> = { r16: 'R16', qf: 'QF' }
    return { type: 'single', round: (t.round as any)[nextRn] || roundLabel[nextRn] || nextRn.toUpperCase(), opp: `${oppFlag} ${oppName}` }
  })()

  // ─── 4. Goal timeline ───
  const hasGoals = hasScore && m.goals && m.goals.length > 0
  const lastMinute = hasGoals ? Math.max(...m.goals!.map(g => g.minute + (g.stoppageTime || 0)), 90) : 90

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <Link to="/schedule" style={{ fontSize: '12px', color: 'var(--accent)' }}>{t.match.back}</Link>
        {isBracketMatch && <Link to="/bracket" style={{ fontSize: '12px', color: 'var(--accent)' }}>{t.match.backBracket}</Link>}
      </div>

      {/* Parent matches that produced this knockout match */}
      {parentMatches && (parentMatches.src1 || parentMatches.src2) && (
        <div style={{ marginBottom: '12px', fontSize: '11px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            {(t.round as any)[({r16:'r32',qf:'r16',sf:'qf',third:'sf',final:'sf'})[m.stage] || 'r32'] || 'Previous'} → {trRound(m.round, t)}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {([parentMatches.src1, parentMatches.src2].filter((x): x is Match => !!x)).map(sm => {
              const st1 = teamMap.get(sm.team1Id)
              const st2 = teamMap.get(sm.team2Id)
              const sh = sm.score1 !== undefined
              return (
                <Link key={sm.id} to={`/match/${sm.id}`} style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '5px 10px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  textDecoration: 'none', color: 'inherit', fontSize: '11px', flex: '1 1 180px',
                }}>
                  <span style={{ fontSize: '7px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', minWidth: '22px' }}>
                    {(() => { const lang2 = t.lang === 'En' ? 'zh' : 'en'; return `${hktDateLabel(sm.date, sm.timeUtc, lang2)} ${toHkt(sm.date, sm.timeUtc).time}` })()}
                  </span>
                  <span style={{ textAlign: 'right', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {st1?.flag} {st1?.name || sm.team1Id}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '11px', minWidth: '18px', textAlign: 'center', color: sh ? 'var(--text)' : 'var(--text-muted)' }}>
                    {sh ? fmtScore(sm) : 'vs'}
                  </span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {st2?.name || sm.team2Id} {st2?.flag}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', position: 'relative', display: 'inline-block' }}>
          {trRound(m.round, t)} {viutvIds.has(Number(id)) && <span title="ViuTV 免費直播" style={{ position: 'absolute', right: '-18px', top: '50%', transform: 'translateY(-50%)', lineHeight: 1 }}>📺</span>}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          {(() => { const lang = t.lang === 'En' ? 'zh' : 'en'; const h = toHkt(m.date, m.timeUtc); return `${hktDateLabel(m.date, m.timeUtc, lang)} ${h.time} HKT` })()}{m.group ? ` · Group ${m.group}` : ''}
        </p>

        {/* Team vs Team + score */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
          <div style={{ textAlign: 'right', flex: 1 }}>
            {!teamMap.has(m.team1Id) ? (
              <span style={{ fontSize: '36px', lineHeight: 1.2 }}>{t1?.flag || ''}</span>
            ) : (
              <Link to={`/team/${m.team1Id}`} style={{ fontSize: '36px', lineHeight: 1.2, textDecoration: 'none' }}>{t1?.flag || ''}</Link>
            )}
            <br />
            {!teamMap.has(m.team1Id) ? (
              <span style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-muted)' }}>{t1?.name || m.team1Id}</span>
            ) : (
              <Link to={`/team/${m.team1Id}`} style={{ fontWeight: 600, fontSize: '16px', color: 'inherit', textDecoration: 'none' }}>{t1?.name || m.team1Id}</Link>
            )}
            {/* Form bar */}
            {form1.length > 0 && (
              <div style={{ display: 'flex', gap: '3px', justifyContent: 'flex-end', marginTop: '6px' }}>
                {form1.map((r, i) => (
                  <span key={i} style={{
                    display: 'inline-block', width: '16px', height: '16px', lineHeight: '16px',
                    borderRadius: '3px', fontSize: '9px', fontWeight: 700, textAlign: 'center',
                    background: formColor[r], color: '#0f172a',
                  }}>{r}</span>
                ))}
              </div>
            )}
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, minWidth: '80px' }}>
            {hasScore ? fmtScore(m) : 'vs'}
          </div>
          <div style={{ textAlign: 'left', flex: 1 }}>
            {!teamMap.has(m.team2Id) ? (
              <span style={{ fontSize: '36px', lineHeight: 1.2 }}>{t2?.flag || ''}</span>
            ) : (
              <Link to={`/team/${m.team2Id}`} style={{ fontSize: '36px', lineHeight: 1.2, textDecoration: 'none' }}>{t2?.flag || ''}</Link>
            )}
            <br />
            {!teamMap.has(m.team2Id) ? (
              <span style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-muted)' }}>{t2?.name || m.team2Id}</span>
            ) : (
              <Link to={`/team/${m.team2Id}`} style={{ fontWeight: 600, fontSize: '16px', color: 'inherit', textDecoration: 'none' }}>{t2?.name || m.team2Id}</Link>
            )}
            {/* Form bar */}
            {form2.length > 0 && (
              <div style={{ display: 'flex', gap: '3px', justifyContent: 'flex-start', marginTop: '6px' }}>
                {form2.map((r, i) => (
                  <span key={i} style={{
                    display: 'inline-block', width: '16px', height: '16px', lineHeight: '16px',
                    borderRadius: '3px', fontSize: '9px', fontWeight: 700, textAlign: 'center',
                    background: formColor[r], color: '#0f172a',
                  }}>{r}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Penalty shootout */}
        {(m as any).penalty1 !== undefined && (
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>Penalty Shootout</h4>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <table style={{ borderCollapse: 'collapse', fontSize: '12px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '4px 10px', textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>{t1?.flag} {t1?.name || m.team1Id}</td>
                    <td style={{ padding: '4px 6px', letterSpacing: '3px' }}>
                      {((m.penaltySequence?.[m.team1Id] || '').split('').map((c: string, i: number) => (
                        <span key={i} style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%', background: c === 'Y' ? '#34d399' : '#fb7185', marginRight: '2px', verticalAlign: 'middle' }} />
                      )))}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 10px', textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>{t2?.flag} {t2?.name || m.team2Id}</td>
                    <td style={{ padding: '4px 6px', letterSpacing: '3px' }}>
                      {((m.penaltySequence?.[m.team2Id] || '').split('').map((c: string, i: number) => (
                        <span key={i} style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%', background: c === 'Y' ? '#34d399' : '#fb7185', marginRight: '2px', verticalAlign: 'middle' }} />
                      )))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bracket path context */}
        {nextRoundInfo && nextRoundInfo.type === 'single' && (() => {
          const wId = `W${m.id}`
          const nextRn: string = ({r32:'r16',r16:'qf',qf:'sf',sf:'final'})[m.stage] || ''
          const nextMs = bracketData?.rounds[nextRn] || []
          const nm = nextMs.find((n: BracketMatch) => n.team1Original === wId || n.team2Original === wId)
          const isT1 = nm?.team1Original === wId
          const oppId = nm ? (isT1 ? nm.team2Id : nm.team1Id) : ''
          const oppTeam = oppId ? teamMap.get(oppId) : null
          const hm = nm ? allMatches.find(x => x.id === nm.matchId) : null
          return (
            <div style={{ marginTop: '14px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <div style={{ fontWeight: 600, color: '#34d399', marginBottom: '6px' }}>{t.match.winner} → {nextRoundInfo.round}</div>
              {nm && (
                <Link to={`/match/${nm.matchId}`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '5px 10px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  textDecoration: 'none', color: 'inherit', fontSize: '11px',
                }}>
                  {hm && <span style={{ fontSize: '7px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', minWidth: '22px' }}>{(() => { const lang2 = t.lang === 'En' ? 'zh' : 'en'; return `${hktDateLabel(hm.date, hm.timeUtc, lang2)} ${toHkt(hm.date, hm.timeUtc).time}` })()}</span>}
                  <span style={{ fontWeight: 600, fontSize: '10px' }}>{t.match.winner}</span>
                  <span>vs</span>
                  <span>{oppTeam ? `${oppTeam.flag} ${oppTeam.name}` : oppId}</span>
                </Link>
              )}
            </div>
          )
        })()}
        {nextRoundInfo && nextRoundInfo.type === 'sf' && bracketData && (() => {
          const wId = `W${m.id}`, lId = `L${m.id}`
          const finalMs = bracketData.rounds['final'] || []
          const thirdMs = bracketData.rounds['third'] || []
          const fm = finalMs.find((n: BracketMatch) => n.team1Original === wId || n.team2Original === wId)
          const tm = thirdMs.find((n: BracketMatch) => n.team1Original === lId || n.team2Original === lId)
          const fOpp = fm ? (() => { const isT1 = fm.team1Original === wId; const o = teamMap.get(isT1 ? fm.team2Id : fm.team1Id); return o ? `${o.flag} ${o.name}` : (isT1 ? fm.team2Id : fm.team1Id) })() : null
          const tOpp = tm ? (() => { const isT1 = tm.team1Original === lId; const o = teamMap.get(isT1 ? tm.team2Id : tm.team1Id); return o ? `${o.flag} ${o.name}` : (isT1 ? tm.team2Id : tm.team1Id) })() : null
          const hfm = allMatches.find(x => x.id === fm?.matchId)
          const htm = allMatches.find(x => x.id === tm?.matchId)
          return (
            <div style={{ marginTop: '14px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <div><span style={{ fontWeight: 600, color: '#34d399' }}>{t.match.winner}</span> → {nextRoundInfo.winnerRound}{nextRoundInfo.winnerOpp ? ` vs ${nextRoundInfo.winnerOpp}` : ''}</div>
              {fm && (
                <Link to={`/match/${fm.matchId}`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '5px 10px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  textDecoration: 'none', color: 'inherit', fontSize: '11px', marginBottom: '4px',
                }}>
                  {hfm && <span style={{ fontSize: '7px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', minWidth: '22px' }}>{(() => { const lang2 = t.lang === 'En' ? 'zh' : 'en'; return `${hktDateLabel(hfm.date, hfm.timeUtc, lang2)} ${toHkt(hfm.date, hfm.timeUtc).time}` })()}</span>}
                  <span style={{ fontWeight: 600, fontSize: '10px', color: '#34d399' }}>{t.match.winner}</span>
                  <span>vs</span>
                  <span>{fOpp || 'TBD'}</span>
                </Link>
              )}
              <div><span style={{ fontWeight: 600, color: '#fb7185' }}>{t.match.loser}</span> → {nextRoundInfo.loserRound}{nextRoundInfo.loserOpp ? ` vs ${nextRoundInfo.loserOpp}` : ''}</div>
              {tm && (
                <Link to={`/match/${tm.matchId}`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '5px 10px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  textDecoration: 'none', color: 'inherit', fontSize: '11px',
                }}>
                  {htm && <span style={{ fontSize: '7px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', minWidth: '22px' }}>{(() => { const lang2 = t.lang === 'En' ? 'zh' : 'en'; return `${hktDateLabel(htm.date, htm.timeUtc, lang2)} ${toHkt(htm.date, htm.timeUtc).time}` })()}</span>}
                  <span style={{ fontWeight: 600, fontSize: '10px', color: '#fb7185' }}>{t.match.loser}</span>
                  <span>vs</span>
                  <span>{tOpp || 'TBD'}</span>
                </Link>
              )}
            </div>
          )
        })()}

        {/* 2. Group standings mini-table */}
        {m.group && groupData && (
          <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
            <Link to={`/groups/${m.group}`} style={{
              fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 600,
              letterSpacing: '0.4px', textTransform: 'uppercase',
              color: 'var(--accent)', textDecoration: 'none', marginBottom: '8px', display: 'inline-block',
            }}>Group {m.group} · Standings</Link>
            <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr 28px 28px 28px', gap: '2px 6px', fontSize: '11px', fontFamily: 'var(--font-mono)', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '9px' }}>RK</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '9px', textAlign: 'left' }}>{t.table.team}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '9px', textAlign: 'center' }}>{t.table.p}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '9px', textAlign: 'center' }}>{t.table.gd}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '9px', textAlign: 'center' }}>{t.table.pts}</span>
              {(groupData.standings || []).map((s: any) => {
                const isT1 = s.teamId === m.team1Id
                const isT2 = s.teamId === m.team2Id
                return (<span key={s.teamId} style={{ display: 'contents' }}>
                  <span style={{ color: isT1 || isT2 ? (isT1 ? '#22d3ee' : '#f472b6') : 'var(--text-muted)', fontWeight: isT1 || isT2 ? 700 : 400 }}>{s.rank}</span>
                    <span style={{
                      textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      color: isT1 || isT2 ? (isT1 ? '#22d3ee' : '#f472b6') : 'var(--text)',
                      fontWeight: isT1 || isT2 ? 700 : 400,
                      background: isT1 || isT2 ? (isT1 ? 'rgba(34,211,238,.08)' : 'rgba(244,114,182,.08)') : 'transparent',
                      borderRadius: '2px', padding: '1px 3px',
                    }}>
                      {s.flag} {s.team}
                    </span>
                    <span style={{ textAlign: 'center', color: isT1 || isT2 ? 'var(--text)' : 'var(--text-muted)' }}>{s.played}</span>
                    <span style={{ textAlign: 'center', color: isT1 || isT2 ? 'var(--text)' : 'var(--text-muted)' }}>{s.gd > 0 ? `+${s.gd}` : s.gd}</span>
                    <span style={{ textAlign: 'center', fontWeight: 700, color: isT1 || isT2 ? 'var(--text)' : 'var(--text-muted)' }}>{s.pts}</span>
                  </span>)
              })}
            </div>
          </div>
        )}

        {/* Goal timeline */}
        {hasGoals && (
          <div style={{ marginTop: '20px', padding: '0 4px' }}>
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>{t.table.goals}</h4>
            {/* Timeline bar */}
            <div style={{ position: 'relative', height: '32px', background: 'rgba(30,41,59,.3)', borderRadius: '4px', marginBottom: '8px', overflow: 'visible' }}>
              {/* HT marker */}
              <div style={{ position: 'absolute', left: '50%', top: '-2px', bottom: '-2px', width: '1px', background: 'rgba(148,163,184,.3)' }} />
              {/* Goal dots */}
              {m.goals!.map((g, i) => {
                const pct = Math.min((g.minute + (g.stoppageTime || 0)) / lastMinute * 100, 98)
                return (
                  <span key={i} style={{
                    position: 'absolute', left: `${pct}%`, top: '50%', transform: 'translate(-50%, -50%)',
                    width: '12px', height: '12px', borderRadius: '50%',
                    background: g.ownGoal ? (g.teamId !== m.team1Id ? '#22d3ee' : '#f472b6') : (g.teamId === m.team1Id ? '#22d3ee' : '#f472b6'),
                    border: '2px solid rgba(15,23,42,.6)',
                    zIndex: 2,
                  }} title={`${(() => { const lang2 = t.lang === 'En' ? 'zh' : 'en'; if (lang2 === 'zh') { const n = g.scorerNo !== undefined ? scorerNameMap.get((g.ownGoal ? (g.teamId === m.team1Id ? m.team2Id : m.team1Id) : g.teamId) + ':' + g.scorerNo) : scorerNameMap.get((g.ownGoal ? (g.teamId === m.team1Id ? m.team2Id : m.team1Id) : g.teamId) + ':' + (overrideMap.get((g.ownGoal ? (g.teamId === m.team1Id ? m.team2Id : m.team1Id) : g.teamId).toLowerCase() + ':' + g.scorer.toLowerCase()) || g.scorer.toLowerCase())); if (n) return n; } return g.scorer; })()} ${g.minute}'`} />
                )
              })}
              {/* Minute labels */}
              {[0, 15, 30, 45, 60, 75, 90].map(mn => (
                <span key={mn} style={{
                  position: 'absolute', left: `${(mn / lastMinute) * 100}%`, bottom: '-16px',
                  transform: 'translateX(-50%)', fontSize: '8px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
                }}>{mn}'</span>
              ))}
              <span style={{ position: 'absolute', left: '50%', bottom: '-16px', transform: 'translateX(-50%)', fontSize: '8px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>HT</span>
            </div>
            {/* Goal list below timeline */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '20px' }}>
              <div style={{ textAlign: 'left' }}>
                {m.goals!.filter(g => (g.ownGoal ? g.teamId === m.team2Id : g.teamId === m.team1Id)).map((g, i) => (
                  <div key={i} style={{ marginBottom: '3px' }}>
                    <span style={{ color: '#22d3ee', fontWeight: 600 }}>{g.minute}'{g.stoppageTime ? `+${g.stoppageTime}` : ''}</span>
                    <span style={{ color: 'var(--text)' }}> {(() => { const lang = t.lang === 'En' ? 'zh' : 'en'; if (lang === 'zh') { const n = g.scorerNo !== undefined ? scorerNameMap.get((g.ownGoal ? (g.teamId === m.team1Id ? m.team2Id : m.team1Id) : g.teamId) + ':' + g.scorerNo) : scorerNameMap.get((g.ownGoal ? (g.teamId === m.team1Id ? m.team2Id : m.team1Id) : g.teamId) + ':' + (overrideMap.get((g.ownGoal ? (g.teamId === m.team1Id ? m.team2Id : m.team1Id) : g.teamId).toLowerCase() + ':' + g.scorer.toLowerCase()) || g.scorer.toLowerCase())); if (n) return n; } return g.scorer; })()}{g.scorerNo !== undefined ? <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}> #{g.scorerNo}</span> : ''}</span>
                    {g.ownGoal && <span style={{ color: 'var(--text-muted)' }}> (og)</span>}
                    {g.penalty && <span style={{ color: 'var(--text-muted)' }}> (P)</span>}
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'right' }}>
                {m.goals!.filter(g => (g.ownGoal ? g.teamId === m.team1Id : g.teamId === m.team2Id)).map((g, i) => (
                  <div key={i} style={{ marginBottom: '3px' }}>
                    <span style={{ color: 'var(--text)' }}>{(() => { const lang = t.lang === 'En' ? 'zh' : 'en'; if (lang === 'zh') { const n = g.scorerNo !== undefined ? scorerNameMap.get((g.ownGoal ? (g.teamId === m.team1Id ? m.team2Id : m.team1Id) : g.teamId) + ':' + g.scorerNo) : scorerNameMap.get((g.ownGoal ? (g.teamId === m.team1Id ? m.team2Id : m.team1Id) : g.teamId) + ':' + (overrideMap.get((g.ownGoal ? (g.teamId === m.team1Id ? m.team2Id : m.team1Id) : g.teamId).toLowerCase() + ':' + g.scorer.toLowerCase()) || g.scorer.toLowerCase())); if (n) return n + ' '; } return g.scorer + ' '; })()}{g.scorerNo !== undefined ? <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>#{g.scorerNo} </span> : ''}</span>
                    {g.ownGoal && <span style={{ color: 'var(--text-muted)' }}>(og) </span>}
                    {g.penalty && <span style={{ color: 'var(--text-muted)' }}>(P) </span>}
                    <span style={{ color: '#f472b6', fontWeight: 600 }}>{g.minute}'{g.stoppageTime ? `+${g.stoppageTime}` : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Lineup / Subs / Cards (from match-detail override) ─── */}
        {detail && (() => {
          const posLabel: Record<string, string> = { GK: 'GK', DF: 'DF', MF: 'MF', FW: 'FW' }
          const posOrder = ['GK', 'DF', 'MF', 'FW']
          // Look up player name by shirt number from squad data
          const pn = (teamId: string, no: number): string => {
            const isEn = t.lang === 'En'
            const name = isEn
              ? (zhPlayerMap.get(teamId + ':' + no) || enPlayerMap.get(teamId + ':' + no))
              : enPlayerMap.get(teamId + ':' + no)
            return name || `#${no}`
          }
          // Map substitution time per player number so we can annotate bench
          const subOnMap = new Map<string, string>()
          if (detail.substitutions) {
            for (const s of detail.substitutions) {
              const key = s.teamId + ':' + s.on.no
              const label = s.stoppageTime ? `${s.minute}+${s.stoppageTime}'` : `${s.minute}'`
              subOnMap.set(key, label)
            }
          }
          const cardIcon: Record<string, string> = { yellow: '🟡', red: '🔴' }

          function renderTeamSide(td: TeamDetail, side: 'left'|'right') {
            const isLeft = side === 'left'
            return (
              <div key={td.teamId} style={{ fontSize: '11px', lineHeight: 1.7 }}>
                <div style={{ fontWeight: 600, marginBottom: '4px', textAlign: isLeft ? 'left' : 'right' }}>
                  {isLeft && (teamMap.get(td.teamId)?.flag || '')} {teamMap.get(td.teamId)?.name || td.teamId}{!isLeft && ' ' + (teamMap.get(td.teamId)?.flag || '')}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '8px', textAlign: isLeft ? 'left' : 'right' }}>
                  {td.formation}
                </div>
                {posOrder.map(pos => {
                  const ps = td.startingXI.filter(p => p.pos === pos)
                  if (!ps.length) return null
                  return (
                    <div key={pos} style={{ marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)', letterSpacing: '0.3px' }}>{posLabel[pos]}</span>
                      {ps.map(p => (
                        <div key={p.no} style={{ textAlign: isLeft ? 'left' : 'right' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>{p.no}</span>
                          {' '}{pn(td.teamId, p.no)}{p.captain ? <span style={{ fontSize: '9px', color: 'var(--accent)' }}> (C)</span> : ''}
                        </div>
                      ))}
                    </div>
                  )
                })}
                {td.substitutes.length > 0 && (
                  <>
                    <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3px', textAlign: isLeft ? 'left' : 'right' }}>
                      {td.substitutes.length} {t.match.subsBench}
                    </div>
                    <div style={{ textAlign: isLeft ? 'left' : 'right' }}>
                      {td.substitutes.map(p => {
                        const t = subOnMap.get(td.teamId + ':' + p.no)
                        return (
                          <div key={p.no}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>{p.no}</span>
                            {' '}{pn(td.teamId, p.no)}
                            {t && <span style={{ color: '#34d399', fontSize: '9px' }}> ↑{t}</span>}
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
                <div style={{ marginTop: '6px', fontSize: '10px', color: 'var(--text-muted)', textAlign: isLeft ? 'left' : 'right' }}>
                  {t.match.coach}: {td.coach}
                </div>
              </div>
            )
          }

          return (
            <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>{t.match.lineup}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {renderTeamSide(detail.team1, 'left')}
                {renderTeamSide(detail.team2, 'right')}
              </div>

              {/* Substitution timeline */}
              {detail.substitutions && detail.substitutions.length > 0 && (
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border)', fontSize: '11px' }}>
                  <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>{t.match.subs}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {detail.substitutions.map((s, i) => {
                      const t = s.stoppageTime ? `${s.minute}+${s.stoppageTime}` : `${s.minute}`
                      const team = teamMap.get(s.teamId)
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent)', minWidth: '36px' }}>{t}'</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '9px' }}>↓{pn(s.teamId, s.off.no)}</span>
                          <span style={{ color: 'var(--text-muted)' }}>→</span>
                          <span style={{ fontWeight: 500 }}>{pn(s.teamId, s.on.no)}</span>
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{team?.flag || ''} {team?.name || s.teamId}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Cards */}
              {detail.cards && detail.cards.length > 0 && (
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border)', fontSize: '11px' }}>
                  <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>{t.match.cards}</h4>
                  {detail.cards.map((c, i) => {
                    const t = c.stoppageTime ? `${c.minute}+${c.stoppageTime}` : `${c.minute}`
                    const team = teamMap.get(c.teamId)
                    return (
                      <div key={i} style={{ marginBottom: '3px' }}>
                        <span>{cardIcon[c.card] || '🟨'}</span>
                        {' '}<span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent)' }}>{t}'</span>
                        {' '}<span style={{ fontWeight: 500 }}>{pn(c.teamId, c.player.no)}</span>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}> #{c.player.no}</span>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}> {team?.flag || ''} {team?.name || c.teamId}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })()}

        {stadium && (
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)' }}>
            🏟️ <Link to={`/stadiums#${stadium.id}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{stadium.name}</Link>
            <span style={{ marginLeft: '8px' }}>{stadium.city}, {stadium.country}</span>
          </div>
        )}

      </div>
    </div>
  )
}

// ─── Placeholder pages ───

export function NotFoundPage() {
  return <Placeholder title="404" subtitle="Page not found" />
}

function Placeholder({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ padding: '40px 0' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'var(--weight-display)', marginBottom: '4px' }}>{title}</h1>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{subtitle}</p>
    </div>
  )
}
