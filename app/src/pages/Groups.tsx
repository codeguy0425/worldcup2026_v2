import { useJson } from '../hooks/useJson'
import { Link } from 'react-router-dom'
import { useLang } from '../hooks/LangProvider'

interface Standing {
  rank: number; teamId: string; team: string
  flag?: string; played: number; won: number; drawn: number; lost: number
  gf: number; ga: number; gd: number; pts: number; status?: string
}

const groupLabels = ['A','B','C','D','E','F','G','H','I','J','K','L']

function GroupTable({ group }: { group: string }) {
  const { t } = useLang()
  const { data } = useJson<{ standings: Standing[]; remaining: number }>(`/data/groups/${group}.json`)
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
        <Link to={`/groups/${group}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>{t.table.group} {group}</Link>
      </div>
      <div className="table-wrap">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['RK','','Team','P','W','D','L','GD','Pts'].map((h, i) => (
                <th key={h} style={{
                  padding: '5px 4px', textAlign: h === 'Team' ? 'left' : 'center',
                  fontFamily: 'var(--font-mono)', fontSize: '8px', fontWeight: 500,
                  letterSpacing: '0.2px', textTransform: 'uppercase', color: 'var(--text-muted)',
                  width: i === 2 ? 'auto' : i === 1 ? '20px' : '24px',
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
  const { t } = useLang()
  return (
    <div>
      <div style={{ position: 'sticky', top: '48px', zIndex: 50, background: 'var(--bg)', padding: 'var(--space-lg) 0 12px', marginTop: 'calc(-1 * var(--space-lg))' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '2px' }}>{t.groups.title}</h1>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {t.groups.desc}
        </p>
      </div>
      <div className="grid-groups" style={{ gap: '8px' }}>
        {groupLabels.map(g => <GroupTable key={g} group={g} />)}
      </div>
    </div>
  )
}
