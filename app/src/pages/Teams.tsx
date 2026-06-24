import { useJson } from '../hooks/useJson'
import { Link } from 'react-router-dom'

interface Team {
  id: string; name: string; nameZh: string
  group: string; ranking: number; continent: string; flag: string
}

export function TeamsPage() {
  const { data, loading } = useJson<{ teams: Team[] }>('/data/teams.json')

  const teams = data?.teams ?? []
  const groups = ['A','B','C','D','E','F','G','H','I','J','K','L']

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'var(--weight-display)', marginBottom: '4px' }}>
        Teams
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        48 teams · 12 groups · 6 confederations
      </p>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : (
        groups.map(g => {
          const groupTeams = teams.filter(t => t.group === g)
          return (
            <div key={g} style={{ marginBottom: '20px' }}>
              <h3 style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase',
                color: 'var(--accent)', marginBottom: '8px'
              }}>
                Group {g}
              </h3>
              <div className="grid-teams">
                {groupTeams.map(t => (
                  <Link key={t.id} to={`/team/${t.id}`} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    fontSize: '13px', textDecoration: 'none', color: 'inherit',
                  }}>
                    <span style={{ fontSize: '22px', lineHeight: 1 }}>{t.flag}</span>
                    <div>
                      <div style={{ fontWeight: 500 }}>{t.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {t.nameZh} · {t.continent}
                      </div>
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)' }}>
                      #{t.ranking}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
