import { useState } from 'react'
import { useJson } from '../hooks/useJson'
import { Link } from 'react-router-dom'

interface Team {
  id: string; name: string; nameZh: string
  group: string; ranking: number; continent: string; flag: string
}

const groups = ['A','B','C','D','E','F','G','H','I','J','K','L']

export function TeamsPage() {
  const { data, loading } = useJson<{ teams: Team[] }>('/data/teams.json')
  const [view, setView] = useState<'group' | 'name' | 'continent'>('group')

  const teams = data?.teams ?? []

  const filters = [
    { key: 'group' as const, label: 'By Group' },
    { key: 'name' as const, label: 'By Name' },
    { key: 'continent' as const, label: 'By Continent' },
  ]

  let sections: { heading: string; items: Team[] }[] = []

  if (view === 'group') {
    sections = groups.map(g => ({
      heading: `Group ${g}`,
      items: teams.filter(t => t.group === g),
    }))
  } else if (view === 'name') {
    const sorted = [...teams].sort((a, b) => a.name.localeCompare(b.name))
    sections = [{ heading: 'All Teams (A–Z)', items: sorted }]
  } else if (view === 'continent') {
    const continents = [...new Set(teams.map(t => t.continent))].sort()
    sections = continents.map(c => ({
      heading: c,
      items: teams.filter(t => t.continent === c),
    }))
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'var(--weight-display)', marginBottom: '4px' }}>Teams</h1>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
        48 teams · 12 groups · 6 confederations
      </p>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f.key} onClick={() => setView(f.key)} style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500,
            letterSpacing: '0.3px', textTransform: 'uppercase',
            padding: '4px 10px', borderRadius: 'var(--radius-sm)',
            border: `1px solid ${view === f.key ? 'var(--accent)' : 'var(--border)'}`,
            background: view === f.key ? 'var(--accent)' : 'var(--surface)',
            color: view === f.key ? '#fff' : 'var(--text-muted)',
            cursor: 'pointer',
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : (
        sections.map(section => (
          <div key={section.heading} style={{ marginBottom: '20px' }}>
            <h3 style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase',
              color: 'var(--accent)', marginBottom: '8px'
            }}>
              {section.heading} ({section.items.length})
            </h3>
            <div className="grid-teams">
              {section.items.map(t => (
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
                      {view === 'group' ? `${t.nameZh} · ${t.continent}` :
                       view === 'name' ? `Group ${t.group} · ${t.continent}` :
                       `Group ${t.group} · ${t.nameZh}`}
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)' }}>
                    #{t.ranking}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
