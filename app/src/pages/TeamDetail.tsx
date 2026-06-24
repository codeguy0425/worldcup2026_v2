import { useParams, Link } from 'react-router-dom'
import { useJson } from '../hooks/useJson'
import { shortHkt } from '../hooks/hkTime'

interface Team { id: string; name: string; nameZh: string; group: string; ranking: number; continent: string; flag: string }

interface Match {
  id: number; round: string; date: string; time: string; stage: string
  team1Id: string; team2Id: string; score1?: number; score2?: number; group?: string
  goals?: { minute: number; scorer: string; teamId: string }[]; timeUtc?: string
}

export function TeamPage() {
  const { id } = useParams()
  const { data: teamData } = useJson<{ teams: Team[] }>('/data/teams.json')
  const { data: matches, loading } = useJson<Match[]>('/data/matches.json')

  const team = teamData?.teams.find(t => t.id === id)
  const teamMap = new Map(teamData?.teams.map(t => [t.id, t]) ?? [])
  const teamMatches = (matches ?? [])
    .filter(m => m.team1Id === id || m.team2Id === id)
    .sort((a, b) => a.id - b.id)

  const goalsFor = teamMatches.reduce((sum, m) => {
    if (m.score1 === undefined) return sum
    return sum + (m.team1Id === id ? (m.score1 ?? 0) : (m.score2 ?? 0))
  }, 0)
  const goalsAgainst = teamMatches.reduce((sum, m) => {
    if (m.score1 === undefined) return sum
    return sum + (m.team1Id === id ? (m.score2 ?? 0) : (m.score1 ?? 0))
  }, 0)

  return (
    <div>
      <Link to="/teams" style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '16px', display: 'inline-block' }}>
        ← All teams
      </Link>

      {!team ? (
        <p style={{ color: 'var(--text-muted)' }}>Team not found</p>
      ) : (
        <>
          {/* Team header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            padding: '20px', borderRadius: 'var(--radius-md)',
            background: 'var(--surface)', border: '1px solid var(--border)',
            marginBottom: '20px',
          }}>
            <span style={{ fontSize: '48px', lineHeight: 1 }}>{team.flag}</span>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 'var(--weight-display)', marginBottom: '2px' }}>
                {team.name}
              </h1>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {team.nameZh} · Group {team.group} · {team.continent} · FIFA #{team.ranking}
              </div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: '20px', color: 'var(--accent)' }}>
                {goalsFor - goalsAgainst > 0 ? '+' : ''}{goalsFor - goalsAgainst}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {goalsFor} GF · {goalsAgainst} GA
              </div>
            </div>
          </div>

          {/* Matches */}
          <h3 style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500,
            letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text-muted)',
            marginBottom: '8px',
          }}>
            Matches ({teamMatches.length})
          </h3>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {teamMatches.map(m => {
                const isHome = m.team1Id === id
                const oppId = isHome ? m.team2Id : m.team1Id
                const opponent = teamMap.get(oppId)
                const hasScore = m.score1 !== undefined
                const teamScore = isHome ? m.score1 : m.score2
                const oppScore = isHome ? m.score2 : m.score1
                const won = hasScore && teamScore! > oppScore!
                const drew = hasScore && teamScore === oppScore

                return (
                  <Link key={m.id} to={`/match/${m.id}`} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    textDecoration: 'none', color: 'inherit', fontSize: '13px',
                  }}>
                    <span style={{
                      width: '4px', height: '28px', borderRadius: '2px', flexShrink: 0,
                      background: !hasScore ? 'var(--border)' : won ? 'var(--success)' : drew ? 'var(--text-muted)' : 'var(--danger)',
                    }} />
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', minWidth: '36px' }}>
                      {shortHkt(m.date, m.timeUtc)}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', minWidth: '28px' }}>
                      {m.stage === 'group' ? `G${m.group}` : ({r32:'R32',r16:'R16',qf:'QF',sf:'SF',third:'3rd',final:'Final'})[m.stage] || m.stage.toUpperCase()}
                    </span>
                    <span style={{ flex: 1, textAlign: 'right' }}>
                      {isHome ? <b>{team?.name}</b> : (opponent?.name || oppId)}
                      {!isHome && <span style={{ marginLeft: '4px' }}>{opponent?.flag || ''}</span>}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '14px', minWidth: '28px', textAlign: 'center' }}>
                      {hasScore ? `${teamScore}–${oppScore}` : 'vs'}
                    </span>
                    <span style={{ flex: 1 }}>
                      {isHome ? <>{opponent?.flag || ''} {opponent?.name || oppId}</> : <b>{team?.name}</b>}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
