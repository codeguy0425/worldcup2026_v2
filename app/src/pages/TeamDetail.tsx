import { useParams, Link } from 'react-router-dom'
import { useJson } from '../hooks/useJson'
import { shortHkt } from '../hooks/hkTime'
import { useLang } from '../hooks/LangProvider'

interface Team { id: string; name: string; nameZh: string; group: string; ranking: number; continent: string; flag: string }

interface Match {
  id: number; round: string; date: string; time: string; stage: string
  team1Id: string; team2Id: string; score1?: number; score2?: number; group?: string
  goals?: { minute: number; scorer: string; teamId: string }[]; timeUtc?: string
}

interface StandingRow {
  rank: number; teamId: string; team: string; flag: string
  played: number; won: number; drawn: number; lost: number
  gf: number; ga: number; gd: number; pts: number
  status?: string
}

interface GroupData { group: string; standings: StandingRow[] }

interface BracketMatch {
  matchId: number; round: string; date: string; timeUtc?: string
  team1Id: string; team2Id: string; team1Original: string; team2Original: string
  team1Resolved: boolean; team2Resolved: boolean; groundId?: string
  score1?: number; score2?: number
}

interface BracketData { rounds: Record<string, BracketMatch[]> }

const roundLabels: Record<string, { short: string, full: string }> = {
  r32: { short: 'R32', full: 'Round of 32' },
  r16: { short: 'R16', full: 'Round of 16' },
  qf: { short: 'QF', full: 'Quarter-final' },
  sf: { short: 'SF', full: 'Semi-final' },
  third: { short: '3rd', full: 'Third place' },
  final: { short: 'Final', full: 'Final' },
}

export function TeamPage() {
  const { id } = useParams()
  const { t } = useLang()
  const { data: teamData } = useJson<{ teams: Team[] }>('/data/teams.json')
  const { data: matches, loading } = useJson<Match[]>('/data/matches.json')

  const team = teamData?.teams.find(t => t.id === id)
  const teamMap = new Map(teamData?.teams.map(t => [t.id, t]) ?? [])
  const teamMatches = (matches ?? [])
    .filter(m => m.team1Id === id || m.team2Id === id)
    .sort((a, b) => a.id - b.id)

  const groupPath = team?.group ? `/data/groups/${team.group}.json` : ''
  const { data: groupData } = useJson<GroupData>(groupPath)
  const { data: bracketData } = useJson<BracketData>('/data/bracket.json')

  // ─── Tournament path ───
  interface PathStep { round: string; label: string; oppId: string; oppName: string; oppFlag: string; score: string; won: boolean | null; detail?: string }
  const pathSteps: PathStep[] = []

  if (team && groupData && bracketData) {
    const st = groupData.standings.find(s => s.teamId === team.id)
    if (st) {
      // Group result step (show for ALL teams)
      pathSteps.push({
        round: 'group',
        label: st.rank === 1 ? `Group ${team.group} 1st` :
                st.rank === 2 ? `Group ${team.group} 2nd` :
                st.rank === 3 ? `Group ${team.group} 3rd` : `Group ${team.group} 4th`,
        oppId: '', oppName: '', oppFlag: '', score: '', won: null,
        detail: `${st.pts}pts · ${st.won}W ${st.drawn}D ${st.lost}L`,
      })
    }

    const isEliminated = st?.status === 'eliminated'
    if (st && isEliminated) {
      // Eliminated — show "Not qualified" and stop
      pathSteps.push({
        round: 'r32',
        label: 'R32',
        oppId: '', oppName: '', oppFlag: '', score: '', won: false,
        detail: 'Not qualified',
      })
    } else if (st) {
      // Trace bracket path for teams that advanced
      let currentId = team.id
      let currentOriginal = `1${team.group}`
      if (st.rank === 2) currentOriginal = `2${team.group}`
      else if (st.rank === 3) currentOriginal = `3${team.group}`

      const roundOrder: (keyof typeof roundLabels)[] = ['r32', 'r16', 'qf', 'sf', 'third', 'final']
      for (const rn of roundOrder) {
        const matches = bracketData.rounds[rn] || []
        // Find match where this team appears (via currentId or currentOriginal)
        const bm = matches.find(m =>
          m.team1Id === currentId || m.team2Id === currentId ||
          m.team1Original === currentOriginal || m.team2Original === currentOriginal
        )
        if (!bm) break

        const isT1 = bm.team1Id === currentId || bm.team1Original === currentOriginal
        const oppId = isT1 ? bm.team2Id : bm.team1Id
        const oppTeam = teamMap.get(oppId)
        const hasScore = bm.score1 !== undefined
        const teamScore = isT1 ? bm.score1 : bm.score2
        const oppScore = isT1 ? bm.score2 : bm.score1
        const won = hasScore ? (teamScore! > oppScore!) : null

        pathSteps.push({
          round: rn,
          label: roundLabels[rn]?.short || rn.toUpperCase(),
          oppId: oppId,
          oppName: oppTeam?.name || oppId,
          oppFlag: oppTeam?.flag || '',
          score: hasScore ? `${teamScore}–${oppScore}` : '?–?',
          won,
        })

        // If lost or no result yet, stop
        if (won === false) break

        // Advance to next round: winner becomes W{matchId}
        currentId = `W${bm.matchId}`
        currentOriginal = ''
      }
    }
  }

  // Aggregate goal scorers for this team
  const scorers: Record<string, number> = {}
  teamMatches.forEach(m => {
    if (!m.goals) return
    m.goals.forEach(g => {
      if (g.teamId === id) {
        scorers[g.scorer] = (scorers[g.scorer] || 0) + 1
      }
    })
  })
  const scorerList = Object.entries(scorers)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, goals]) => ({ name, goals }))

  const stadTh: React.CSSProperties = { textAlign: 'left', padding: '4px 6px', borderBottom: '1px solid var(--border)', color: '#64748b', fontWeight: 500, fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.3px', fontFamily: 'var(--font-mono)' }
  const stadTd: React.CSSProperties = { padding: '4px 6px', borderBottom: '1px solid rgba(30,41,59,.5)', color: '#cbd5e1', fontSize: '11px', fontFamily: 'var(--font-mono)' }

  return (
    <div>
      <Link to="/teams" style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '16px', display: 'inline-block' }}>
        {t.teams.backAll}
      </Link>

      {!team ? (
        <p style={{ color: 'var(--text-muted)' }}>{t.teams.notFound}</p>
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
          </div>

          {/* Tournament path */}
          {pathSteps.length > 0 && (
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '14px',
              marginBottom: '20px',
            }}>
              {pathSteps.map((step, i) => (
                <span key={step.round} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Connector line between steps */}
                  {i > 0 && (
                    <span style={{
                      width: '2px', height: '14px',
                      background: step.won === false ? 'rgba(251,113,133,.4)' : 'rgba(34,211,238,.4)',
                      display: 'block',
                    }} />
                  )}

                  {/* Step card */}
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 14px', borderRadius: '8px', fontSize: '12px', width: '100%',
                    boxSizing: 'border-box',
                    background: step.won === false ? 'rgba(251,113,133,.08)' :
                                step.round === 'group' ? 'rgba(34,211,238,.06)' :
                                step.won === true ? 'rgba(52,211,153,.06)' :
                                'rgba(30,41,59,.3)',
                    border: `1px solid ${step.won === false ? 'rgba(251,113,133,.25)' :
                                          step.round === 'group' ? 'rgba(34,211,238,.15)' :
                                          step.won === true ? 'rgba(52,211,153,.2)' :
                                          'rgba(30,41,59,.4)'}`,
                  }}>
                    {/* Round badge */}
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700,
                      letterSpacing: '0.5px', textTransform: 'uppercase',
                      padding: '2px 6px', borderRadius: '4px', minWidth: '28px',
                      textAlign: 'center', whiteSpace: 'nowrap',
                      background: step.round === 'group' ? 'rgba(34,211,238,.15)' :
                                  step.won === false ? 'rgba(251,113,133,.15)' :
                                  step.won === true ? 'rgba(52,211,153,.15)' :
                                  'rgba(100,116,139,.15)',
                      color: step.round === 'group' ? '#22d3ee' :
                             step.won === false ? '#fb7185' :
                             step.won === true ? '#34d399' :
                             '#94a3b8',
                    }}>
                      {step.label}
                    </span>

                    {step.round === 'group' ? (
                      /* Group step: show record */
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                        {step.detail}
                      </span>
                    ) : step.detail === 'Not qualified' ? (
                      <span style={{ color: '#fb7185', fontSize: '11px', fontWeight: 600 }}>
                        Not qualified
                      </span>
                    ) : (
                      /* Bracket step: opponent + score */
                      <>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            {step.oppFlag && <span style={{ fontSize: '13px' }}>{step.oppFlag}</span>}
                            <span style={{
                              color: step.won === false ? '#fb7185' : 'var(--text)',
                              fontWeight: step.won === true ? 600 : 400,
                              fontSize: '12px',
                            }}>
                              {step.oppName}
                            </span>
                          </span>
                        </span>
                        <span style={{
                          fontWeight: 700, fontSize: '13px', fontFamily: 'var(--font-mono)',
                          color: step.won === true ? '#34d399' :
                                 step.won === false ? '#fb7185' : 'var(--text-muted)',
                        }}>
                          {step.score}
                        </span>
                      </>
                    )}
                  </span>
                </span>
              ))}
            </div>
          )}

          {/* Group standings */}
          {groupData && (
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: '20px',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600,
                letterSpacing: '0.4px', textTransform: 'uppercase',
                color: 'var(--accent)', marginBottom: '8px',
              }}>
                <Link to={`/groups/${groupData.group}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                  Group {groupData.group} ↗
                </Link>
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={stadTh}>#</th>
                    <th style={{...stadTh, textAlign:'left'}}>Team</th>
                    <th style={stadTh}>P</th>
                    <th style={stadTh}>W</th>
                    <th style={stadTh}>D</th>
                    <th style={stadTh}>L</th>
                    <th style={stadTh}>GF</th>
                    <th style={stadTh}>GA</th>
                    <th style={stadTh}>GD</th>
                    <th style={stadTh}>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {groupData.standings.map(s => (
                    <tr key={s.teamId} style={{
                      background: s.teamId === team?.id ? 'rgba(34,211,238,.08)' : undefined,
                      fontWeight: s.teamId === team?.id ? 600 : 400,
                    }}>
                      <td style={stadTd}>{s.rank}</td>
                      <td style={{...stadTd, textAlign:'left'}}>
                        <Link to={`/team/${s.teamId}`} style={{
                          color: s.teamId === team?.id ? 'var(--accent)' : 'var(--text)',
                          textDecoration: 'none', fontWeight: s.teamId === team?.id ? 600 : 400,
                        }}>
                          {s.flag} {s.team}
                        </Link>
                      </td>
                      <td style={stadTd}>{s.played}</td>
                      <td style={stadTd}>{s.won}</td>
                      <td style={stadTd}>{s.drawn}</td>
                      <td style={stadTd}>{s.lost}</td>
                      <td style={stadTd}>{s.gf}</td>
                      <td style={stadTd}>{s.ga}</td>
                      <td style={stadTd}>{s.gd > 0 ? '+' : ''}{s.gd}</td>
                      <td style={{...stadTd, color: s.teamId === team?.id ? 'var(--accent)' : 'var(--text)', fontWeight: s.teamId === team?.id ? 700 : 500}}>{s.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Goal scorers */}
          {scorerList.length > 0 && (
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: '20px',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600,
                letterSpacing: '0.4px', textTransform: 'uppercase',
                color: 'var(--accent)', marginBottom: '8px',
              }}>
                ⚽ {team.flag} Goalscorers
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={stadTh}>#</th>
                    <th style={{...stadTh, textAlign:'left'}}>Player</th>
                    <th style={stadTh}>Goals</th>
                  </tr>
                </thead>
                <tbody>
                  {scorerList.map((s, i) => (
                    <tr key={s.name}>
                      <td style={stadTd}>{i + 1}</td>
                      <td style={{...stadTd, textAlign:'left'}}>{s.name}</td>
                      <td style={{...stadTd, fontWeight: 600, color: 'var(--accent)'}}>{s.goals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
                      <span>{team?.flag || ''}</span><b>{team?.name}</b>
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '14px', minWidth: '28px', textAlign: 'center' }}>
                      {hasScore ? `${teamScore}–${oppScore}` : 'vs'}
                    </span>
                    <span style={{ flex: 1 }}>
                      {opponent?.name || oppId} <span>{opponent?.flag || ''}</span>
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
