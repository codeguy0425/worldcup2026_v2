import { useJson } from '../hooks/useJson'

interface Stadium {
  id: string; name: string; city: string; country: string; capacity: number
}

export function StadiumsPage() {
  const { data, loading } = useJson<{ stadiums: Stadium[] }>('/data/stadiums.json')
  const stadiums = data?.stadiums ?? []

  const countryFlags: Record<string, string> = {
    'Mexico': '🇲🇽', 'Canada': '🇨🇦', 'USA': '🇺🇸',
  }

  return (
    <div>
      <div style={{ position: 'sticky', top: '48px', zIndex: 50, background: 'var(--bg)', padding: 'var(--space-lg) 0 12px', marginTop: 'calc(-1 * var(--space-lg))' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'var(--weight-display)', marginBottom: '4px' }}>
          Stadiums
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          16 venues across 3 host countries
        </p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {stadiums.map(s => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '14px 16px', borderRadius: 'var(--radius-sm)',
              background: 'var(--surface)', border: '1px solid var(--border)',
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
                  Capacity
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
