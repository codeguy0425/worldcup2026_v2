import { useJson } from '../hooks/useJson'

interface ThirdEntry {
  overall_rank: number; group: string; teamId: string; team: string
  flag?: string; played: number; won: number; drawn: number; lost: number
  gf: number; ga: number; gd: number; pts: number
  qualified: boolean; thirdLocked?: boolean
}

export function ThirdPlacedPage() {
  const { data, loading } = useJson<{ rankings: ThirdEntry[] }>('/data/third-placed.json')
  const entries = data?.rankings ?? []

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'var(--weight-display)', marginBottom: '4px' }}>
        Third-Placed
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        Best 8 of 12 third-placed teams advance to R32
      </p>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : (
        <div className="table-wrap" style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['RK','GR','','Team','P','W','D','L','GF','GA','GD','Pts'].map(h => (
                  <th key={h} style={{
                    padding: '8px 6px', textAlign: h === 'Team' || h === 'GR' ? 'left' : 'center',
                    fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 500,
                    letterSpacing: '0.3px', textTransform: 'uppercase', color: 'var(--text-muted)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => {
                const isQualified = e.qualified
                return (
                  <tr key={e.group} style={{
                    borderBottom: i < entries.length - 1 ? '1px solid var(--border)' : 'none',
                    background: isQualified ? 'rgba(16,185,129,0.04)' : 'transparent',
                  }}>
                    <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 600 }}>
                      {e.overall_rank}
                    </td>
                    <td style={{ padding: '8px 6px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)' }}>
                      {e.group}
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'center', fontSize: '16px' }}>{e.flag || ''}</td>
                    <td style={{ padding: '8px 6px', fontWeight: 500 }}>{e.team}</td>
                    <td style={{ padding: '8px 6px', textAlign: 'center' }}>{e.played}</td>
                    <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-muted)' }}>{e.won}</td>
                    <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-muted)' }}>{e.drawn}</td>
                    <td style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-muted)' }}>{e.lost}</td>
                    <td style={{ padding: '8px 6px', textAlign: 'center' }}>{e.gf}</td>
                    <td style={{ padding: '8px 6px', textAlign: 'center' }}>{e.ga}</td>
                    <td style={{
                      padding: '8px 6px', textAlign: 'center',
                      color: e.gd > 0 ? 'var(--success)' : e.gd < 0 ? 'var(--danger)' : 'var(--text-muted)',
                      fontWeight: e.gd !== 0 ? 600 : 400,
                    }}>{e.gd > 0 ? '+' : ''}{e.gd}</td>
                    <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700 }}>{e.pts}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span>✅ Top 8 advance</span>
            <span>Sorted by: Pts → GD → GF</span>
          </div>
        </div>
      )}
    </div>
  )
}
