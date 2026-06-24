import { useJson } from '../hooks/useJson'
import { Link } from 'react-router-dom'
import { toHkt } from '../hooks/hkTime'

interface Match {
  id: number; round: string; date: string; stage: string
  team1Id: string; team2Id: string; group?: string
  score1?: number; score2?: number; timeUtc?: string; time?: string
}
interface Team { id: string; name: string; flag: string }

export function HomePage() {
  const { data: matches } = useJson<Match[]>('/data/matches.json')
  const { data: teamData } = useJson<{ teams: Team[] }>('/data/teams.json')
  const { data: phase } = useJson<{ phase: string; groupComplete: boolean }>('/data/phase.json')

  const teamMap = new Map(teamData?.teams.map(t => [t.id, t]) ?? [])

  if (!matches) return <p style={{ color: 'var(--text-muted)' }}>Loading...</p>

  const groupMatches = matches.filter(m => m.stage === 'group')
  const played = groupMatches.filter(m => m.score1 !== undefined)
  const total = groupMatches.length

  // Latest results (last 5 played, sorted by date descending)
  const latest = [...matches].filter(m => m.score1 !== undefined)
    .sort((a, b) => {
      const da = a.date + 'T' + (a.timeUtc || a.time || '00:00') + ':00Z'
      const db = b.date + 'T' + (b.timeUtc || b.time || '00:00') + ':00Z'
      return db.localeCompare(da)
    })
    .slice(0, 5)

  // Today's fixtures (next 5 unplayed, sorted by id)
  const upcoming = matches.filter(m => m.score1 === undefined).sort((a, b) => a.id - b.id).slice(0, 5)

  return (
    <div>
      {/* Phase banner */}
      <div style={{
        background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius-md)',
        padding: '10px 14px', marginBottom: '20px', fontSize: '13px', fontWeight: 500,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px',
      }}>
        <span>
          {phase?.phase === 'ended' ? '🏆 Tournament ended' :
           phase?.phase === 'group' ? `⚽ Group stage — ${played.length}/${total} played` :
           `🏁 ${(phase?.phase || '').toUpperCase()} underway`}
        </span>
      </div>

      {/* Quick links */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {[
          { to: '/schedule', label: 'Schedule', icon: '📅' },
          { to: '/groups', label: 'Groups', icon: '🏆' },
          { to: '/third-placed', label: '3rd Place', icon: '📋' },
          { to: '/scorers', label: 'Scorers', icon: '⚽' },
          { to: '/bracket', label: 'Bracket', icon: '🏁' },
          { to: '/teams', label: 'Teams', icon: '👥' },
          { to: '/stadiums', label: 'Stadiums', icon: '🏟️' },
        ].map(link => (
          <Link key={link.to} to={link.to} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: 'var(--radius-sm)',
            background: 'var(--surface)', border: '1px solid var(--border)',
            textDecoration: 'none', color: 'inherit', fontSize: '12px', fontWeight: 500,
          }}>
            {link.icon} {link.label}
          </Link>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid-two" style={{ gap: '12px' }}>
        {/* Latest results */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--accent)' }}>
            📋 Latest Results
          </div>
          {latest.map(m => {
            const t1 = teamMap.get(m.team1Id)
            const t2 = teamMap.get(m.team2Id)
            return (
              <Link key={m.id} to={`/match/${m.id}`} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px',
                borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit', fontSize: '11px',
              }}>
                <span style={{ color: 'var(--text-muted)', minWidth: '42px', fontSize: '9px' }}>{(() => { const h = toHkt(m.date, m.timeUtc); return `${h.date.slice(5)} ${h.time}` })()}</span>
                <span style={{ flex: 1, textAlign: 'right' }}>{t1?.flag || ''} {t1?.name || m.team1Id}</span>
                <span style={{ fontWeight: 700, fontSize: '12px', minWidth: '22px', textAlign: 'center' }}>{m.score1}–{m.score2}</span>
                <span style={{ flex: 1 }}>{t2?.flag || ''} {t2?.name || m.team2Id}</span>
              </Link>
            )
          })}
          {latest.length === 0 && <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>No matches played yet</div>}
        </div>

        {/* Upcoming fixtures */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--accent)' }}>
            🔜 Upcoming
          </div>
          {upcoming.map(m => {
            const t1 = teamMap.get(m.team1Id)
            const t2 = teamMap.get(m.team2Id)
            return (
              <Link key={m.id} to={`/match/${m.id}`} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px',
                borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit', fontSize: '11px',
              }}>
                <span style={{ color: 'var(--text-muted)', minWidth: '42px', fontSize: '9px' }}>{(() => { const h = toHkt(m.date, m.timeUtc); return `${h.date.slice(5)} ${h.time}` })()}</span>
                <span style={{ flex: 1, textAlign: 'right' }}>{t1?.flag || ''} {t1?.name || m.team1Id}</span>
                <span style={{ fontWeight: 400, fontSize: '10px', minWidth: '22px', textAlign: 'center', color: 'var(--text-muted)' }}>vs</span>
                <span style={{ flex: 1 }}>{t2?.flag || ''} {t2?.name || m.team2Id}</span>
              </Link>
            )
          })}
          {upcoming.length === 0 && <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>All matches completed</div>}
        </div>
      </div>
    </div>
  )
}
