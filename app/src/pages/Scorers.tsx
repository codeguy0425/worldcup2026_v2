import { useJson } from '../hooks/useJson'
import { useLang } from '../hooks/LangProvider'
import { Link } from 'react-router-dom'
import { useState } from 'react'

interface Scorer {
  rank: number; scorer: string; teamId: string
  teamName: string; flag: string; goals: number; penalties: number; scorerNo?: number
}

export function ScorersPage() {
  const { t } = useLang()
  const { data: scorersRaw, loading } = useJson<Scorer[]>('/data/top-scorers.json')
  const { data: squadData } = useJson<any>('/data/squads.json?v=2')
  const { data: squadZhData } = useJson<any>('/data/squads-zh.json?v=2')
  const { data: overrideData } = useJson<any>('/data/scorer-no-override.json')
  const { data: teamsData } = useJson<{ teams: { id: string; name: string; flag: string }[] }>('/data/teams.json')
  const teamMap = new Map<string, { name: string; flag: string }>()
  teamsData?.teams.forEach(t => teamMap.set(t.id, { name: t.name, flag: t.flag }))
  const scorers = scorersRaw ?? []

  // Build name map: teamId + scorerNo → Chinese name
  const nameMap = new Map<string, string>()
  if (squadData && squadZhData) {
    for (const [teamId, enPlayers] of Object.entries(squadData) as [string, any[]][]) {
      const zhPlayers = (squadZhData as any)[teamId] as any[] | undefined
      if (!zhPlayers) continue
      const zhByNo: Record<number, any> = {}
      zhPlayers.forEach(p => zhByNo[p.no] = p)
      for (const ep of enPlayers) {
        const zhP = zhByNo[ep.no]
        if (zhP) {
          nameMap.set(teamId + ':' + ep.no, zhP.name)
          nameMap.set(teamId + ':' + ep.name.toLowerCase(), zhP.name)
        }
      }
    }
  }
  const overrideMap = new Map<string, number>()
  if (overrideData) {
    for (const [key, no] of Object.entries(overrideData) as [string, any][]) {
      if (no !== null) overrideMap.set(key.toLowerCase(), no as number)
    }
  }

  const lang = t.lang === 'En' ? 'zh' : 'en'
  const [teamFilter, setTeamFilter] = useState('')
  const teamList = [...new Set(scorers.map(s => s.teamId))].sort()
  const filtered = teamFilter ? scorers.filter(s => s.teamId === teamFilter) : scorers

  return (
    <div>
      <div style={{ position: 'sticky', top: '48px', zIndex: 50, background: 'var(--bg)', padding: 'var(--space-lg) 0 12px', marginTop: 'calc(-1 * var(--space-lg))' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'var(--weight-display)', marginBottom: '4px' }}>
          {t.scorers.title}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {t.scorers.desc.replace('{n}', String(scorers.length))}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
          <button onClick={() => setTeamFilter('')} style={{ fontSize: '10px', padding: '2px 8px', background: !teamFilter ? 'var(--accent)' : 'transparent', color: !teamFilter ? '#fff' : 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}>{t.scorers.all || 'All'}</button>
          {teamList.map(tid => (
            <button key={tid} onClick={() => setTeamFilter(tid)} style={{ fontSize: '10px', padding: '2px 8px', background: teamFilter === tid ? 'var(--accent)' : 'transparent', color: teamFilter === tid ? '#fff' : 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}>{(() => { const tm = teamMap.get(tid); return tm ? tm.flag + ' ' + tm.name : tid; })()}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      ) : scorers.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No goals scored yet</p>
      ) : (
        <div className="table-wrap" style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['RK','Player','Team','Goals','Pen'].map(h => (
                  <th key={h} style={{
                    padding: '8px 8px', textAlign: h === 'Player' || h === 'Team' ? 'left' : 'center',
                    fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 500,
                    letterSpacing: '0.3px', textTransform: 'uppercase', color: 'var(--text-muted)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const medal = s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : s.rank === 3 ? '🥉' : ''
                const zhName = lang === 'zh' ? (nameMap.get(s.teamId + ':' + s.scorerNo) || nameMap.get(s.teamId + ':' + (overrideMap.get(s.teamId.toLowerCase() + ':' + s.scorer.toLowerCase()) || s.scorer.toLowerCase()))) : null
                return (
                  <tr key={`${s.scorer}-${s.teamId}`} style={{
                    borderBottom: i < scorers.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <td style={{
                      padding: '5px 8px', textAlign: 'center',
                      fontWeight: s.rank <= 3 ? 700 : 400,
                      fontSize: s.rank <= 3 ? '13px' : '11px',
                    }}>
                      {medal || s.rank}
                    </td>
                    <td style={{ padding: '5px 8px', fontWeight: s.goals >= 3 ? 600 : 400 }}>
                      {(() => { const overrideNo = overrideMap.get(s.teamId.toLowerCase() + ':' + s.scorer.toLowerCase()); const no = s.scorerNo !== undefined ? s.scorerNo : overrideNo; return <>{zhName ? <><span lang="zh">{zhName}</span><br /><span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{s.scorer}</span></> : s.scorer}{no !== undefined ? <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginLeft: '4px' }}>#{no}</span> : ''}</>; })()}
                    </td>
                    <td style={{ padding: '5px 8px', color: 'var(--text-muted)', fontSize: '11px' }}>
                      <Link to={`/team/${s.teamId}`} style={{ textDecoration: 'none', color: 'inherit' }}><span style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>{s.flag}</span>{s.teamName}</Link>
                    </td>
                    <td style={{
                      padding: '5px 8px', textAlign: 'center',
                      fontWeight: 700, fontSize: '14px',
                      color: s.goals >= 4 ? 'var(--accent)' : 'var(--text)',
                    }}>
                      {s.goals}
                    </td>
                    <td style={{ padding: '5px 8px', textAlign: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>
                      {s.penalties > 0 ? `${s.penalties}` : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
