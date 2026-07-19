import { useJson } from '../hooks/useJson'
import { Link } from 'react-router-dom'
import { toHkt, hktDateLabel } from '../hooks/hkTime'
import { fmtScore } from '../pages/index'
import { useLang } from '../hooks/LangProvider'

interface Match {
  id: number; round: string; date: string; stage: string
  team1Id: string; team2Id: string; group?: string
  score1?: number; score2?: number; timeUtc?: string; time?: string
  penalty1?: number; penalty2?: number
}
interface Team { id: string; name: string; nameZh: string; flag: string }

interface TopScorer {
  scorer: string; teamId: string; teamName: string; flag: string
  goals: number; penalties: number; rank: number; scorerNo: number
}

function getWinner(m: { score1?: number; score2?: number; team1Id: string; team2Id: string; penalty1?: number; penalty2?: number }): string | null {
  if (m.score1 === undefined || m.score2 === undefined) return null
  if (m.score1 > m.score2) return m.team1Id
  if (m.score2 > m.score1) return m.team2Id
  if (m.penalty1 !== undefined && m.penalty2 !== undefined) return m.penalty1 > m.penalty2 ? m.team1Id : m.team2Id
  return null
}
function getLoser(m: Parameters<typeof getWinner>[0]): string | null {
  const w = getWinner(m)
  if (!w) return null
  return w === m.team1Id ? m.team2Id : m.team1Id
}

export function HomePage() {
  const { t } = useLang()
  const { data: matches } = useJson<Match[]>('/data/matches.json')
  const { data: teamData } = useJson<{ teams: Team[] }>('/data/teams.json')
  const { data: phase } = useJson<{ phase: string; groupComplete: boolean }>('/data/phase.json')
  const { data: topScorers } = useJson<TopScorer[]>('/data/top-scorers.json')
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

  // === Tournament ended → show summary ===
  if (phase?.phase === 'ended') {
    const finalMatch = matches.find(m => m.stage === 'final')
    const thirdMatch = matches.find(m => m.stage === 'third')
    const champion = finalMatch ? getWinner(finalMatch) : null
    const runnerUp = finalMatch ? getLoser(finalMatch) : null
    const thirdPlace = thirdMatch ? getWinner(thirdMatch) : null
    const fourthPlace = thirdMatch ? getLoser(thirdMatch) : null
    const topScorer = topScorers?.[0]

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
          <span>{t.home.tournamentEnded}</span>
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

        {/* Summary cards stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Final Standings */}
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--accent)' }}>
              🏆 {t.home.finalStandings}
            </div>
            <div style={{ padding: '10px 14px', fontSize: '13px', lineHeight: '2' }}>
              <div>🥇 <strong>{t.round.champion}</strong>  {champion ? `${teamMap.get(champion)?.flag || ''} ${t.lang === 'zh' ? teamMap.get(champion)?.nameZh || teamMap.get(champion)?.name : teamMap.get(champion)?.name || champion}` : '—'}</div>
              <div>🥈 <strong>{t.round.runnerUp}</strong>  {runnerUp ? `${teamMap.get(runnerUp)?.flag || ''} ${t.lang === 'zh' ? teamMap.get(runnerUp)?.nameZh || teamMap.get(runnerUp)?.name : teamMap.get(runnerUp)?.name || runnerUp}` : '—'}</div>
              <div>🥉 <strong>{t.round.thirdPlace}</strong>  {thirdPlace ? `${teamMap.get(thirdPlace)?.flag || ''} ${t.lang === 'zh' ? teamMap.get(thirdPlace)?.nameZh || teamMap.get(thirdPlace)?.name : teamMap.get(thirdPlace)?.name || thirdPlace}` : '—'}</div>
              <div style={{ opacity: 0.6 }}>  <strong>{t.round.fourthPlace}</strong>  {fourthPlace ? `${teamMap.get(fourthPlace)?.flag || ''} ${t.lang === 'zh' ? teamMap.get(fourthPlace)?.nameZh || teamMap.get(fourthPlace)?.name : teamMap.get(fourthPlace)?.name || fourthPlace}` : '—'}</div>
            </div>
          </div>

          {/* Golden Boot */}
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--accent)' }}>
              ⚽ {t.home.goldenBoot}
            </div>
            <div style={{ padding: '10px 14px', fontSize: '13px' }}>
              {topScorer ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{topScorer.flag}</span>
                  <span style={{ fontWeight: 600 }}>{topScorer.scorer}</span>
                  {topScorer.scorerNo !== undefined && <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>#{topScorer.scorerNo}</span>}
                  <span style={{ color: 'var(--text-muted)' }}>—</span>
                  <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--accent)' }}>{topScorer.goals} {t.home.goals}</span>
                </div>
              ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
            </div>
          </div>

          {/* Latest Results — Final + 3rd */}
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--accent)' }}>
              📋 {t.home.latest}
            </div>
            {[finalMatch, thirdMatch].filter(Boolean).map(m => {
              if (!m) return null
              const t1 = teamMap.get(m.team1Id)
              const t2 = teamMap.get(m.team2Id)
              return (
                <Link key={m.id} to={`/match/${m.id}`} style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px',
                  borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit', fontSize: '11px',
                }}>
                  <span style={{ color: 'var(--text-muted)', minWidth: '42px', fontSize: '9px', display: 'flex', alignItems: 'center', gap: '2px', position: 'relative' }}>
                    <span>{(() => { const lang = t.lang === 'En' ? 'zh' : 'en'; const h = toHkt(m.date, m.timeUtc); return `${hktDateLabel(m.date, m.timeUtc, lang)} ${h.time}` })()}</span>
                    {viutvIds.has(m.id) && <span>📺</span>}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: 'var(--text-muted)', fontWeight: 600, minWidth: '18px', textAlign: 'center', letterSpacing: '0.2px' }}>
                    {m.stage === 'group' ? m.group : ({r32:t.round.r32,r16:t.round.r16,qf:t.round.qf,sf:t.round.sf,third:t.round.third,final:t.round.final})[m.stage] || ''}
                  </span>
                  <span style={{ flex: 1, textAlign: 'right' }}>{t1?.flag || ''} {t.lang === 'zh' ? t1?.nameZh || t1?.name : t1?.name || m.team1Id}</span>
                  <span style={{ fontWeight: 700, fontSize: '12px', minWidth: '22px', textAlign: 'center' }}>{fmtScore(m)}</span>
                  <span style={{ flex: 1 }}>{t.lang === 'zh' ? t2?.nameZh || t2?.name : t2?.name || m.team2Id} {t2?.flag || ''}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

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
