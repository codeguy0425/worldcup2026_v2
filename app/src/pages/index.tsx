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
import { toHkt } from '../hooks/hkTime'
import { useLang } from '../hooks/LangProvider'

// ─── Shared helpers ───

function trRound(r: string, t: any): string {
  const md = r.match(/^Matchday (\d+)$/)
  if (md) return t.round.md(parseInt(md[1]))
  const m: Record<string, string> = { 'Round of 32': t.round.r32, 'Round of 16': t.round.r16, 'Quarter-final': t.round.qf, 'Semi-final': t.round.sf, 'Match for third place': t.round.third, 'Final': t.round.final }
  return m[r] || r
}

// Compute last N results for a team
function computeForm(teamId: string, allMatches: Match[]): ('W'|'D'|'L')[] {
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
}

interface GoalEvent {
  minute: number; scorer: string; teamId: string
  ownGoal?: boolean; penalty?: boolean; stoppageTime?: number
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
                      <span>{(() => { const h = toHkt(m.date, m.timeUtc); return `${h.date} ${h.time}` })()}</span>
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
                      {hasScore ? `${m.score1}–${m.score2}` : 'vs'}
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
  const { data: matches, loading } = useJson<Match[]>('/data/matches.json')
  const { data: teamData } = useJson<{ teams: Team[] }>('/data/teams.json')
  const { data: stadiumData } = useJson<{ stadiums: StadiumInfo[] }>('/data/stadiums.json')
  const { data: bracketData } = useJson<BracketData>('/data/bracket.json')
  const { data: viutvData } = useJson<{ matchId: number }[]>('/data/viutv.json')
  const viutvIds = new Set((viutvData ?? []).map((v: any) => v.matchId))

  const allMatches = matches ?? []
  const teamMap = new Map<string, Team>()
  teamData?.teams.forEach(t => teamMap.set(t.id, t))
  const stadiumMap = new Map<string, StadiumInfo>()
  stadiumData?.stadiums.forEach(s => stadiumMap.set(s.id, s))

  const bracketStages = new Set(['r32', 'r16', 'qf', 'sf', 'third', 'final'])

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
  const m = allMatches.find(m => m.id === Number(id))
  if (!m) return <p style={{ color: 'var(--text-muted)' }}>Match not found</p>

  const t1 = teamMap.get(m.team1Id)
  const t2 = teamMap.get(m.team2Id)
  const stadium = m.groundId ? stadiumMap.get(m.groundId) : null
  const hasScore = m.score1 !== undefined
  const isBracketMatch = bracketStages.has(m.stage)

  // ─── 1. Team form ───
  const form1 = hasScore && teamMap.has(m.team1Id) ? computeForm(m.team1Id, allMatches) : []
  const form2 = hasScore && teamMap.has(m.team2Id) ? computeForm(m.team2Id, allMatches) : []
  const formColor = { 'W': '#34d399', 'D': '#fbbf24', 'L': '#fb7185' } as Record<string, string>

  // ─── 3. Bracket path context ───
  const nextRoundInfo = (() => {
    if (!isBracketMatch || m.stage === 'third' || m.stage === 'final' || !bracketData) return null
    const nextRoundOrder = ['r32', 'r16', 'qf', 'sf']
    const idx = nextRoundOrder.indexOf(m.stage)
    if (idx < 0 || idx >= nextRoundOrder.length - 1) return null
    const nextRn = nextRoundOrder[idx + 1]
    const nextMs = bracketData.rounds[nextRn] || []
    const wId = `W${m.id}`
    const nm = nextMs.find((n: BracketMatch) => n.team1Id === wId || n.team2Id === wId)
    if (!nm) return null
    const isT1 = nm.team1Id === wId
    const oppId = isT1 ? nm.team2Id : nm.team1Id
    const oppTeam = teamMap.get(oppId)
    const oppName = oppTeam?.name || oppId
    const oppFlag = oppTeam?.flag || ''
    const roundLabel: Record<string, string> = { r16: 'R16', qf: 'QF', sf: 'SF' }
    return { round: roundLabel[nextRn] || nextRn.toUpperCase(), label: nextRn, opp: `${oppFlag} ${oppName}` }
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
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', position: 'relative', display: 'inline-block' }}>
          {trRound(m.round, t)} {viutvIds.has(Number(id)) && <span title="ViuTV 免費直播" style={{ position: 'absolute', right: '-18px', top: '50%', transform: 'translateY(-50%)', lineHeight: 1 }}>📺</span>}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          {(() => { const h = toHkt(m.date, m.timeUtc); return `${h.date} · ${h.time} HKT` })()}{m.group ? ` · Group ${m.group}` : ''}
        </p>

        {/* Team vs Team + score */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
          <div style={{ textAlign: 'right' }}>
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
            {hasScore ? `${m.score1}–${m.score2}` : 'vs'}
          </div>
          <div style={{ textAlign: 'left' }}>
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

        {/* Bracket path context */}
        {nextRoundInfo && (
          <div style={{ marginTop: '14px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 600 }}>Winner → {nextRoundInfo.round}</span>
            <span style={{ marginLeft: '6px' }}>vs {nextRoundInfo.opp}</span>
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
                    background: g.teamId === m.team1Id ? '#22d3ee' : '#f472b6',
                    border: '2px solid rgba(15,23,42,.6)',
                    zIndex: 2,
                  }} title={`${g.scorer} ${g.minute}'`} />
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
                {m.goals!.filter(g => g.teamId === m.team1Id).map((g, i) => (
                  <div key={i} style={{ marginBottom: '3px' }}>
                    <span style={{ color: '#22d3ee', fontWeight: 600 }}>{g.minute}'{g.stoppageTime ? `+${g.stoppageTime}` : ''}</span>
                    <span style={{ color: 'var(--text)' }}> {g.scorer}</span>
                    {g.ownGoal && <span style={{ color: 'var(--text-muted)' }}> (og)</span>}
                    {g.penalty && <span style={{ color: 'var(--text-muted)' }}> (P)</span>}
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'right' }}>
                {m.goals!.filter(g => g.teamId === m.team2Id).map((g, i) => (
                  <div key={i} style={{ marginBottom: '3px' }}>
                    <span style={{ color: 'var(--text)' }}>{g.scorer} </span>
                    {g.ownGoal && <span style={{ color: 'var(--text-muted)' }}>(og) </span>}
                    {g.penalty && <span style={{ color: 'var(--text-muted)' }}>(P) </span>}
                    <span style={{ color: '#f472b6', fontWeight: 600 }}>{g.minute}'{g.stoppageTime ? `+${g.stoppageTime}` : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {stadium && (
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)' }}>
            🏟️ <Link to="/stadiums" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{stadium.name}</Link>
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
