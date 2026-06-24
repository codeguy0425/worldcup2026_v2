import { useJson } from '../hooks/useJson'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { toHkt } from '../hooks/hkTime'
import { useLang } from '../hooks/LangProvider'

interface BracketMatch {
  matchId: number; round: string; date: string
  team1Id: string; team2Id: string
  team1Original?: string; team2Original?: string
  team1Resolved?: boolean; team2Resolved?: boolean
  score1?: number; score2?: number; timeUtc?: string
}

interface BracketData { rounds: Record<string, BracketMatch[]> }
interface Match { group?: string; score1?: number; stage: string }

const stageOrder = ['r32', 'r16', 'qf', 'sf', 'third', 'final']

function trStage(stage: string, t: any): string {
  const m: Record<string, string> = { r32: t.round.r32, r16: t.round.r16, qf: t.round.qf, sf: t.round.sf, third: t.round.third, final: t.round.final }
  return m[stage] || stage
}

function isGroupPlaceholder(id: string): boolean {
  return /^[1-3][A-L]/.test(id)
}
function placeholderGroup(id: string): string | null {
  const m = id.match(/^[1-3]([A-L])/)
  return m ? m[1] : null
}

export function BracketPage() {
  const { t } = useLang()
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

  const [filter, setFilter] = useState<string>('all')

  const stageFilters = [
    { key: 'all', label: 'All' },
    { key: 'r32', label: 'R32' },
    { key: 'r16', label: 'R16' },
    { key: 'qf', label: 'QF' },
    { key: 'sf', label: 'SF' },
    { key: 'final', label: 'Final' },
  ]

  return (
    <div>
      <div style={{ position: 'sticky', top: '48px', zIndex: 50, background: 'var(--bg)', padding: 'var(--space-lg) 0 12px', marginTop: 'calc(-1 * var(--space-lg))' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'var(--weight-display)', marginBottom: '4px' }}>{t.bracket.title}</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          {t.bracket.desc}
        </p>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {stageFilters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500,
            letterSpacing: '0.3px', textTransform: 'uppercase',
            padding: '4px 10px', borderRadius: 'var(--radius-sm)',
            border: `1px solid ${filter === f.key ? 'var(--accent)' : 'var(--border)'}`,
            background: filter === f.key ? 'var(--accent)' : 'var(--surface)',
            color: filter === f.key ? '#fff' : 'var(--text-muted)',
            cursor: 'pointer',
          }}>
            {f.label}
          </button>
        ))}
      </div>
      </div>

      {stageOrder.map(stage => {
        if (filter !== 'all' && stage !== filter) return null
        let stageMatches = bracket?.rounds?.[stage]
        if (!stageMatches?.length) return null

        // Sort within stage by date+time
        stageMatches = [...stageMatches].sort((a, b) => {
          const da = a.date + 'T' + (a.timeUtc || '00:00') + ':00Z'
          const db = b.date + 'T' + (b.timeUtc || '00:00') + ':00Z'
          return da.localeCompare(db)
        })

        return (
          <div key={stage} style={{ marginBottom: '28px' }}>
            <h3 style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500,
              letterSpacing: '0.5px', textTransform: 'uppercase',
              color: 'var(--accent)', marginBottom: '8px',
            }}>
              {trStage(stage, t)}
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
                    if (grp && (groupsComplete[grp] || m.team1Resolved)) return t1?.name || m.team1Id
                    return orig
                  }
                  // If it was resolved (e.g. host team), show the team name
                  return t1?.name || m.team1Id
                })()

                const showFlag1 = (() => {
                  const orig = m.team1Original ?? m.team1Id
                  if (isGroupPlaceholder(orig)) {
                    const grp = placeholderGroup(orig)
                    if (grp && (groupsComplete[grp] || m.team1Resolved)) return t1?.flag || ''
                    return ''
                  }
                  return t1?.flag || ''
                })()

                const isFaded1 = isGroupPlaceholder(m.team1Original ?? m.team1Id) && !m.team1Resolved

                const showTeam2 = (() => {
                  const orig = m.team2Original ?? m.team2Id
                  if (isGroupPlaceholder(orig)) {
                    const grp = placeholderGroup(orig)
                    if (grp && (groupsComplete[grp] || m.team2Resolved)) return t2?.name || m.team2Id
                    return orig
                  }
                  return t2?.name || m.team2Id
                })()

                const showFlag2 = (() => {
                  const orig = m.team2Original ?? m.team2Id
                  if (isGroupPlaceholder(orig)) {
                    const grp = placeholderGroup(orig)
                    if (grp && (groupsComplete[grp] || m.team2Resolved)) return t2?.flag || ''
                    return ''
                  }
                  return t2?.flag || ''
                })()

                const isFaded2 = isGroupPlaceholder(m.team2Original ?? m.team2Id) && !m.team2Resolved

                return (
                  <Link key={m.matchId} to={`/match/${m.matchId}`} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    textDecoration: 'none', color: 'inherit', fontSize: '12px',
                    opacity: (isFaded1 || isFaded2) ? 0.55 : 1,
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)', minWidth: '54px' }}>
                      {(() => { const h = toHkt(m.date, m.timeUtc); return `${h.date.slice(5)} ${h.time}` })()}
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
        {t.bracket.dimmed.split('{ex}')[0]}<code style={{ fontSize: '10px' }}>2A</code>{t.bracket.dimmed.split('{ex}')[1]}
      </div>
    </div>
  )
}
