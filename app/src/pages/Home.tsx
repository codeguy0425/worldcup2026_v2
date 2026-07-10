import { useJson } from '../hooks/useJson'
import { Link } from 'react-router-dom'
import { toHkt, hktDateLabel } from '../hooks/hkTime'
import { fmtScore } from '../pages/index'
import { useLang } from '../hooks/LangProvider'

interface Match {
  id: number; round: string; date: string; stage: string
  team1Id: string; team2Id: string; group?: string
  score1?: number; score2?: number; timeUtc?: string; time?: string
}
interface Team { id: string; name: string; flag: string }

export function HomePage() {
  const { t } = useLang()
  const { data: matches } = useJson<Match[]>('/data/matches.json')
  const { data: teamData } = useJson<{ teams: Team[] }>('/data/teams.json')
  const { data: phase } = useJson<{ phase: string; groupComplete: boolean }>('/data/phase.json')
  const { data: viutvData } = useJson<{ matchId: number }[]>('/data/viutv.json')
  const viutvIds = new Set((viutvData ?? []).map((v: any) => v.matchId))

  const teamMap = new Map(teamData?.teams.map(t => [t.id, t]) ?? [])

  if (!matches) return <p style={{ color: 'var(--text-muted)' }}>Loading...</p>

  const groupMatches = matches.filter(m => m.stage === 'group')
  const played = groupMatches.filter(m => m.score1 !== undefined)
  const total = groupMatches.length

  // Today's HKT date
  const todayHkt = new Date().toISOString().slice(0, 10)

  // Latest results (last 5 played, sorted by date descending)
  const latest = [...matches].filter(m => m.score1 !== undefined)
    .sort((a, b) => {
      const da = a.date + 'T' + (a.timeUtc || a.time || '00:00') + ':00Z'
      const db = b.date + 'T' + (b.timeUtc || b.time || '00:00') + ':00Z'
      return db.localeCompare(da)
    })
    .slice(0, 5)

  // Upcoming & today's matches (next 6 unplayed or today's date)
  const upcoming = matches
    .filter(m => {
      if (m.score1 !== undefined) return false
      const hktDate = toHkt(m.date, m.timeUtc).date
      return hktDate >= todayHkt
    })
    .sort((a, b) => {
      const da = a.date + 'T' + (a.timeUtc || a.time || '00:00') + ':00Z'
      const db = b.date + 'T' + (b.timeUtc || b.time || '00:00') + ':00Z'
      return da.localeCompare(db)
    })
    .slice(0, 6)

  const bannerVer = 3 // bump to bust cache

  return (
    <div>
      {/* Banner */}
      <img src={`/worldcup2026_v2/banner.png?v=${bannerVer}`} alt="World Cup 2026" style={{
        width: '100%', maxWidth: '500px', height: 'auto',
        display: 'block', margin: '0 auto 16px auto',
        borderRadius: 'var(--radius-md)',
      }} />

      {/* Phase banner */}
      <div style={{
        background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius-md)',
        padding: '10px 14px', marginBottom: '20px', fontSize: '13px', fontWeight: 500,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px',
      }}>
        <span>
          {phase?.phase === 'ended' ? '🏆 Tournament ended' :
           phase?.phase === 'group' ? `⚽ ${t.home.phaseGroup.replace('{played}', String(played.length)).replace('{total}', String(total))}` :
           t.home.phaseKnockout((t.round as any)[phase?.phase || ''] || (phase?.phase || '').toUpperCase())}
        </span>
      </div>

      {/* Quick links */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {[
          { to: '/schedule', label: t.nav.schedule, icon: '📅' },
          { to: '/teams', label: t.nav.teams, icon: '👥' },
          { to: '/groups', label: t.nav.groups, icon: '🏆' },
          { to: '/third-placed', label: t.nav.thirdPlace, icon: '📋' },
          { to: '/scorers', label: t.nav.scorers, icon: '⚽' },
          { to: '/bracket', label: t.nav.bracket, icon: '🏁' },
          { to: '/stadiums', label: t.nav.stadiums, icon: '🏟️' },
        ].map(link => (
          <Link key={link.to} to={link.to} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: 'var(--radius-sm)',
            background: 'var(--surface)', border: '1px solid var(--border)',
            textDecoration: 'none', color: 'inherit', fontSize: '12px', fontWeight: 500,
            flex: '1 1 0', minWidth: '100px',
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
            📋 {t.home.latest}
          </div>
          {latest.map(m => {
            const t1 = teamMap.get(m.team1Id)
            const t2 = teamMap.get(m.team2Id)
            return (
              <Link key={m.id} to={`/match/${m.id}`} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px',
                borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit', fontSize: '11px',
              }}>
                <span style={{ color: 'var(--text-muted)', minWidth: '42px', fontSize: '9px', display: 'flex', alignItems: 'center', gap: '2px', position: 'relative' }}><span>{(() => { const lang = t.lang === 'En' ? 'zh' : 'en'; const h = toHkt(m.date, m.timeUtc); return `${hktDateLabel(m.date, m.timeUtc, lang)} ${h.time}` })()}</span>{viutvIds.has(m.id) && <span>📺</span>}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: 'var(--text-muted)', fontWeight: 600, minWidth: '18px', textAlign: 'center', letterSpacing: '0.2px' }}>{m.stage === 'group' ? m.group : ({r32:'R32',r16:'R16',qf:'QF',sf:'SF',third:'3rd',final:'Final'})[m.stage] || ''}</span>
                <span style={{ flex: 1, textAlign: 'right' }}>{t1?.flag || ''} {t1?.name || m.team1Id}</span>
                <span style={{ fontWeight: 700, fontSize: '12px', minWidth: '22px', textAlign: 'center' }}>{fmtScore(m)}</span>
                <span style={{ flex: 1 }}>{t2?.name || m.team2Id} {t2?.flag || ''}</span>
              </Link>
            )
          })}
          {latest.length === 0 && <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>No matches played yet</div>}
        </div>

        {/* Upcoming */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--accent)' }}>
            🔜 {t.home.upcoming}
          </div>
          {upcoming.map(m => {
            const t1 = teamMap.get(m.team1Id)
            const t2 = teamMap.get(m.team2Id)
            return (
              <Link key={m.id} to={`/match/${m.id}`} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px',
                borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit', fontSize: '11px',
              }}>
                <span style={{ color: 'var(--text-muted)', minWidth: '42px', fontSize: '9px', display: 'flex', alignItems: 'center', gap: '2px', position: 'relative' }}><span>{(() => { const lang = t.lang === 'En' ? 'zh' : 'en'; const h = toHkt(m.date, m.timeUtc); return `${hktDateLabel(m.date, m.timeUtc, lang)} ${h.time}` })()}</span>{viutvIds.has(m.id) && <span>📺</span>}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: 'var(--text-muted)', fontWeight: 600, minWidth: '18px', textAlign: 'center', letterSpacing: '0.2px' }}>{m.stage === 'group' ? m.group : ({r32:'R32',r16:'R16',qf:'QF',sf:'SF',third:'3rd',final:'Final'})[m.stage] || ''}</span>
                <span style={{ flex: 1, textAlign: 'right' }}>{t1?.flag || ''} {t1?.name || m.team1Id}</span>
                <span style={{ fontWeight: 400, fontSize: '10px', minWidth: '22px', textAlign: 'center', color: 'var(--text-muted)' }}>vs</span>
                <span style={{ flex: 1 }}>{t2?.name || m.team2Id} {t2?.flag || ''}</span>
              </Link>
            )
          })}
          {upcoming.length === 0 && <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>All matches completed</div>}
        </div>
      </div>
    </div>
  )
}
