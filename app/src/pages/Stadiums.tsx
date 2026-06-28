import { useJson } from '../hooks/useJson'
import { useLang } from '../hooks/LangProvider'
import { Link } from 'react-router-dom'
import { toHkt, hktDateLabel } from '../hooks/hkTime'
import { fmtScore } from '../pages/index'

interface Stadium {
  id: string; name: string; city: string; country: string; capacity: number
}

interface Match {
  id: number; team1Id: string; team2Id: string; score1?: number; score2?: number
  groundId: string; date: string; timeUtc?: string
  stage: string; group?: string
}

export function StadiumsPage() {
  const { t } = useLang()
  const { data, loading } = useJson<{ stadiums: Stadium[] }>('/data/stadiums.json')
  const { data: matchData } = useJson<Match[]>('/data/matches.json')
  const { data: teamData } = useJson<{ teams: { id: string; name: string; flag: string }[] }>('/data/teams.json')
  const stadiums = data?.stadiums ?? []
  const matches = matchData ?? []
  const teamMap = new Map<string, { name: string; flag: string }>()
  teamData?.teams.forEach(tm => teamMap.set(tm.id, tm))

  // Group matches by stadium
  const matchMap: Record<string, Match[]> = {}
  for (const m of matches) {
    if (!m.groundId) continue
    if (!matchMap[m.groundId]) matchMap[m.groundId] = []
    matchMap[m.groundId].push(m)
  }

  const countryFlags: Record<string, string> = {
    'Mexico': '🇲🇽', 'Canada': '🇨🇦', 'USA': '🇺🇸',
  }

  return (
    <div>
      <div style={{ position: 'sticky', top: '48px', zIndex: 50, background: 'var(--bg)', padding: 'var(--space-lg) 0 12px', marginTop: 'calc(-1 * var(--space-lg))' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'var(--weight-display)', marginBottom: '4px' }}>
          {t.stadiums.title}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {t.stadiums.desc}
        </p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {stadiums.map(s => {
            const stadiumMatches = matchMap[s.id] || []
            return (
            <div key={s.id} style={{
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '14px 16px',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-alt)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', flexShrink: 0,
                }}>
                  🏟️
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>{s.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {countryFlags[s.country] || ''} {s.city}, {s.country}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--accent)' }}>
                    {s.capacity.toLocaleString()}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {t.stadiums.capacity}
                  </div>
                </div>
              </div>
              {stadiumMatches.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '8px 12px', fontSize: '11px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    {stadiumMatches.length} match{stadiumMatches.length > 1 ? 'es' : ''}
                  </div>
                  {stadiumMatches.sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id).map(m => {
                    const t1 = teamMap.get(m.team1Id)
                    const t2 = teamMap.get(m.team2Id)
                    const lang = t.lang === 'En' ? 'zh' : 'en'
                    return (
                      <Link key={m.id} to={`/match/${m.id}`} style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0',
                        textDecoration: 'none', color: 'inherit',
                      }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', minWidth: '42px' }}>
                          {(() => { const h = toHkt(m.date, m.timeUtc); return `${hktDateLabel(m.date, m.timeUtc, lang)} ${h.time}` })()}
                        </span>
                        <span style={{ flex: 1, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t1?.flag} {t1?.name || m.team1Id}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '11px', minWidth: '16px', textAlign: 'center' }}>
                          {m.score1 !== undefined ? fmtScore(m) : 'vs'}
                        </span>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t2?.name || m.team2Id} {t2?.flag}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)', minWidth: '20px', textAlign: 'right' }}>
                          {m.stage === 'group' ? m.group || '' : ({r32:'R32',r16:'R16',qf:'QF',sf:'SF',third:'3rd',final:'Final'})[m.stage] || ''}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )})}
        </div>
      )}
    </div>
  )
}
