import { useJson } from '../hooks/useJson'
import { Link } from 'react-router-dom'

interface BracketMatch {
  matchId: number; round: string; date: string
  team1Id: string; team2Id: string
  team1Original?: string; team2Original?: string
  team1Resolved?: boolean; team2Resolved?: boolean
  score1?: number; score2?: number
}

interface BracketData { rounds: Record<string, BracketMatch[]> }
interface Match { group?: string; score1?: number; stage: string }

const stageLabels: Record<string, string> = {
  r32: 'Round of 32', r16: 'Round of 16', qf: 'Quarter-finals',
  sf: 'Semi-finals', third: 'Third Place', final: 'Final',
}
const stageOrder = ['r32', 'r16', 'qf', 'sf', 'third', 'final']

function isGroupPlaceholder(id: string): boolean {
  return /^[1-3][A-L]/.test(id)
}
function placeholderGroup(id: string): string | null {
  const m = id.match(/^[1-3]([A-L])/)
  return m ? m[1] : null
}

export function BracketPage() {
  const { data: bracket } = useJson<BracketData>('/data/bracket.json')
  const { data: teamData } = useJson<{ teams: { id: string; name: string; flag: string }[] }>('/data/teams.json')
  const { data: matches } = useJson<Match[]>('/data/matches.json')

  const teamMap = new Map(teamData?.teams.map(t => [t.id, t]) ?? [])

  // Determine which groups are complete (all group matches have scores)
  const groupsComplete: Record<string, boolean> = {}
  if (matches) {
    for (const letter of 'ABCDEFGHIJKL') {
      const groupMatches = matches.filter(m => m.group === letter && m.stage === 'group')
      groupsComplete[letter] = groupMatches.length > 0 && groupMatches.every(m => m.score1 !== undefined)
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'var(--weight-display)', marginBottom: '4px' }}>Bracket</h1>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
        Knockout stage — placeholders shown until groups complete
      </p>

      {stageOrder.map(stage => {
        const stageMatches = bracket?.rounds?.[stage]
        if (!stageMatches?.length) return null

        return (
          <div key={stage} style={{ marginBottom: '28px' }}>
            <h3 style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500,
              letterSpacing: '0.5px', textTransform: 'uppercase',
              color: 'var(--accent)', marginBottom: '8px',
            }}>
              {stageLabels[stage]}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {stageMatches.map(m => {
                const t1 = teamMap.get(m.team1Id)
                const t2 = teamMap.get(m.team2Id)
                const hasScore = m.score1 !== undefined

                // Decide what to display
                const showTeam1 = (() => {
                  const orig = m.team1Original ?? m.team1Id
                  // If it's a group placeholder (1A, 2B, etc), check if the group is done
                  if (isGroupPlaceholder(orig)) {
                    const grp = placeholderGroup(orig)
                    if (grp && groupsComplete[grp]) return m.team1Resolved ? (t1?.name || m.team1Id) : orig
                    return orig
                  }
                  // If it was resolved (e.g. host team), show the team name
                  return t1?.name || m.team1Id
                })()

                const showFlag1 = (() => {
                  const orig = m.team1Original ?? m.team1Id
                  if (isGroupPlaceholder(orig)) {
                    const grp = placeholderGroup(orig)
                    if (grp && groupsComplete[grp]) return t1?.flag || ''
                    return ''
                  }
                  return t1?.flag || ''
                })()

                const isFaded1 = isGroupPlaceholder(m.team1Original ?? m.team1Id)

                const showTeam2 = (() => {
                  const orig = m.team2Original ?? m.team2Id
                  if (isGroupPlaceholder(orig)) {
                    const grp = placeholderGroup(orig)
                    if (grp && groupsComplete[grp]) return m.team2Resolved ? (t2?.name || m.team2Id) : orig
                    return orig
                  }
                  return t2?.name || m.team2Id
                })()

                const showFlag2 = (() => {
                  const orig = m.team2Original ?? m.team2Id
                  if (isGroupPlaceholder(orig)) {
                    const grp = placeholderGroup(orig)
                    if (grp && groupsComplete[grp]) return t2?.flag || ''
                    return ''
                  }
                  return t2?.flag || ''
                })()

                const isFaded2 = isGroupPlaceholder(m.team2Original ?? m.team2Id)

                return (
                  <Link key={m.matchId} to={`/match/${m.matchId}`} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    textDecoration: 'none', color: 'inherit', fontSize: '12px',
                    opacity: (isFaded1 || isFaded2) ? 0.55 : 1,
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)', minWidth: '20px' }}>
                      #{m.matchId}
                    </span>
                    <span style={{ flex: 1, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {showFlag1} {showTeam1}
                    </span>
                    <span style={{
                      fontWeight: 700, fontSize: '12px', minWidth: '24px', textAlign: 'center',
                      color: hasScore ? 'var(--text)' : 'var(--text-muted)',
                    }}>
                      {hasScore ? `${m.score1}–${m.score2}` : 'vs'}
                    </span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {showFlag2} {showTeam2}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}

      <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--surface)', border: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
        ⚡ Dimmed = group not yet complete. Placeholders like <code style={{ fontSize: '10px' }}>2A</code> will resolve once the group finishes.
      </div>
    </div>
  )
}
