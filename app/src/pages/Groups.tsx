import { useJson } from '../hooks/useJson'
import { Link } from 'react-router-dom'

interface Standing {
  rank: number; teamId: string; team: string
  flag?: string; played: number; won: number; drawn: number; lost: number
  gf: number; ga: number; gd: number; pts: number
  status?: 'advanced' | 'eliminated'
}

interface GroupData { group: string; standings: Standing[] }

const groupLabels = ['A','B','C','D','E','F','G','H','I','J','K','L']

function GroupTable({ group }: { group: string }) {
  const { data } = useJson<GroupData>(`/data/groups/${group}.json`)
  if (!data) return null

  const { standings } = data

  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border)', overflow: 'hidden',
    }}>
      <div style={{
        padding: '8px 10px', borderBottom: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600,
        letterSpacing: '0.4px', textTransform: 'uppercase',
      }}>
        <Link to={`/groups/${group}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>Group {group}</Link>
      </div>
      <div className="table-wrap">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['RK','','Team','P','W','D','L','GD','Pts'].map(h => (
                <th key={h} style={{
                  padding: '5px 4px', textAlign: h === 'Team' ? 'left' : 'center',
                  fontFamily: 'var(--font-mono)', fontSize: '8px', fontWeight: 500,
                  letterSpacing: '0.2px', textTransform: 'uppercase', color: 'var(--text-muted)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standings.map(s => (
              <tr key={s.teamId} style={{
                background: s.status === 'eliminated' ? 'rgba(211,47,47,0.04)' : undefined,
                borderBottom: '1px solid var(--border)',
              }}>
                <td style={{ padding: '5px 4px', textAlign: 'center', fontWeight: 500 }}>{s.rank}</td>
                <td style={{ padding: '5px 4px', textAlign: 'center', fontSize: '13px' }}>{s.flag || ''}</td>
                <td style={{ padding: '5px 4px' }}>
                  <Link to={`/team/${s.teamId}`} style={{ fontWeight: 500, color: 'inherit', textDecoration: 'none' }}>
                    {s.team}
                  </Link>
                  {s.status === 'advanced' && (
                    <span style={{ marginLeft: '3px', fontSize: '7px', padding: '1px 3px', borderRadius: '2px', background: 'var(--badge-advance)', color: '#fff', fontWeight: 600 }}>A</span>
                  )}
                  {s.status === 'eliminated' && (
                    <span style={{ marginLeft: '3px', fontSize: '7px', padding: '1px 3px', borderRadius: '2px', background: 'var(--badge-eliminate)', color: '#fff', fontWeight: 600 }}>E</span>
                  )}
                </td>
                <td style={{ padding: '5px 4px', textAlign: 'center' }}>{s.played}</td>
                <td style={{ padding: '5px 4px', textAlign: 'center', color: 'var(--text-muted)' }}>{s.won}</td>
                <td style={{ padding: '5px 4px', textAlign: 'center', color: 'var(--text-muted)' }}>{s.drawn}</td>
                <td style={{ padding: '5px 4px', textAlign: 'center', color: 'var(--text-muted)' }}>{s.lost}</td>
                <td style={{
                  padding: '5px 4px', textAlign: 'center',
                  color: s.gd > 0 ? 'var(--success)' : s.gd < 0 ? 'var(--danger)' : 'var(--text-muted)',
                  fontWeight: s.gd !== 0 ? 600 : 400,
                }}>{s.gd > 0 ? '+' : ''}{s.gd}</td>
                <td style={{ padding: '5px 4px', textAlign: 'center', fontWeight: 700 }}>{s.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function GroupsPage() {
  return (
    <div>
      <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '2px' }}>Groups</h1>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        12 groups · top 2 + best 8 third advance
      </p>
      <div className="grid-groups" style={{ gap: '8px' }}>
        {groupLabels.map(g => <GroupTable key={g} group={g} />)}
      </div>
    </div>
  )
}
