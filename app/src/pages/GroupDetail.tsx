import { useParams, Link } from 'react-router-dom'
import { useJson } from '../hooks/useJson'

interface Standing {
  rank: number; teamId: string; team: string; teamZh: string
  flag?: string; played: number; won: number; drawn: number; lost: number
  gf: number; ga: number; gd: number; pts: number; form?: string
  status?: 'advanced' | 'eliminated'
}
interface GroupData { group: string; standings: Standing[] }
interface Match { id: number; date: string; stage: string; group?: string; team1Id: string; team2Id: string; score1?: number; score2?: number }
interface Team { id: string; name: string; flag: string }

const groupNames: Record<string, string> = {
  A:'Group A',B:'Group B',C:'Group C',D:'Group D',E:'Group E',F:'Group F',
  G:'Group G',H:'Group H',I:'Group I',J:'Group J',K:'Group K',L:'Group L',
}

export function GroupPage() {
  const { id } = useParams<{ id: string }>()
  const g = id?.toUpperCase() || ''

  const { data: groupData } = useJson<GroupData>(`/data/groups/${g}.json`)
  const { data: matchData } = useJson<Match[]>('/data/matches.json')
  const { data: teamData } = useJson<{ teams: Team[] }>('/data/teams.json')

  const teamMap = new Map(teamData?.teams.map(t => [t.id, t]) ?? [])

  if (!groupData || !matchData) return <p style={{ color: 'var(--text-muted)' }}>Loading...</p>

  const standings = groupData.standings
  const groupMatches = matchData.filter(m => m.group === g).sort((a, b) => a.id - b.id)

  return (
    <div>
      <Link to="/groups" style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '16px', display: 'inline-block' }}>← All groups</Link>

      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}>
        {groupNames[g] || `Group ${g}`}
      </h1>

      {/* Standings */}
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '20px' }}>
        <div className="table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['RK','','Team','P','W','D','L','GF','GA','GD','Pts'].map(h => (
                  <th key={h} style={{ padding: '8px 6px', textAlign: h === 'Team' ? 'left' : 'center', fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 500, letterSpacing: '0.3px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {standings.map(s => (
                <tr key={s.teamId} style={{ borderBottom: '1px solid var(--border)', background: s.status === 'eliminated' ? 'rgba(211,47,47,0.04)' : undefined }}>
                  <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 500 }}>{s.rank}</td>
                  <td style={{ padding: '8px 6px', textAlign: 'center', fontSize: '16px' }}>{s.flag || ''}</td>
                  <td style={{ padding: '8px 6px' }}>
                    <Link to={`/team/${s.teamId}`} style={{ fontWeight: 500, color: 'inherit', textDecoration: 'none' }}>{s.team}</Link>
                    {s.status === 'advanced' && <span style={{ marginLeft: '4px', fontSize: '8px', padding: '1px 4px', borderRadius: '2px', background: 'var(--badge-advance)', color: '#fff', fontWeight: 600 }}>A</span>}
                    {s.status === 'eliminated' && <span style={{ marginLeft: '4px', fontSize: '8px', padding: '1px 4px', borderRadius: '2px', background: 'var(--badge-eliminate)', color: '#fff', fontWeight: 600 }}>E</span>}
                  </td>
                  <td style={{ padding: '8px 6px', textAlign: 'center' }}>{s.played}</td>
                  <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-muted)' }}>{s.won}</td>
                  <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-muted)' }}>{s.drawn}</td>
                  <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-muted)' }}>{s.lost}</td>
                  <td style={{ padding: '8px 6px', textAlign: 'center' }}>{s.gf}</td>
                  <td style={{ padding: '8px 6px', textAlign: 'center' }}>{s.ga}</td>
                  <td style={{ padding: '8px 6px', textAlign: 'center', color: s.gd > 0 ? 'var(--success)' : s.gd < 0 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: s.gd !== 0 ? 600 : 400 }}>{s.gd > 0 ? '+' : ''}{s.gd}</td>
                  <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700 }}>{s.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All group matches */}
      <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
        Matches ({groupMatches.filter(m => m.score1 !== undefined).length}/{groupMatches.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {groupMatches.map(m => {
          const t1 = teamMap.get(m.team1Id)
          const t2 = teamMap.get(m.team2Id)
          const hasScore = m.score1 !== undefined
          return (
            <Link key={m.id} to={`/match/${m.id}`} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px',
              borderRadius: 'var(--radius-sm)', background: 'var(--surface)', border: '1px solid var(--border)',
              textDecoration: 'none', color: 'inherit', fontSize: '12px',
            }}>
              <span style={{ color: 'var(--text-muted)', minWidth: '24px', fontSize: '9px' }}>{m.date.slice(5)}</span>
              <span style={{ flex: 1, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t1?.flag || ''} {t1?.name || m.team1Id}
              </span>
              <span style={{ fontWeight: 700, fontSize: '12px', minWidth: '22px', textAlign: 'center', color: hasScore ? 'var(--text)' : 'var(--text-muted)' }}>
                {hasScore ? `${m.score1}–${m.score2}` : 'vs'}
              </span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t2?.flag || ''} {t2?.name || m.team2Id}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
