import { useJson } from '../hooks/useJson'
import { Link } from 'react-router-dom'
import { toHkt } from '../hooks/hkTime'
import { useLang } from '../hooks/LangProvider'
import { useRef } from 'react'

interface BracketMatch {
  matchId: number; round: string; date: string
  team1Id: string; team2Id: string
  team1Original?: string; team2Original?: string
  team1Resolved?: boolean; team2Resolved?: boolean
  score1?: number; score2?: number; timeUtc?: string
}

interface BracketData { rounds: Record<string, BracketMatch[]> }

const ROUND_LABELS: Record<string, string> = {
  r32: 'Round of 32', r16: 'Round of 16', qf: 'Quarter-final',
  sf: 'Semi-final', third: 'Third place', final: 'Final',
}
const KNOCKOUT_ROUNDS = ['r32', 'r16', 'qf', 'sf', 'final']
const TREE_ROWS: Record<string, number> = { r32: 16, r16: 8, qf: 4, sf: 2, final: 1 }
const GAP_PX = 14

function teamDisplay(m: BracketMatch, side: 1|2, teamMap: Map<string,any>, groupsComplete: Record<string,boolean>) {
  const id = side === 1 ? m.team1Id : m.team2Id
  const orig = side === 1 ? (m.team1Original ?? id) : (m.team2Original ?? id)
  const resolved = side === 1 ? m.team1Resolved : m.team2Resolved
  const t = teamMap.get(id)
  if (/^[1-3][A-L]/.test(orig)) {
    const grp = orig.match(/^[1-3]([A-L])/)?.[1]
    if (grp && (groupsComplete[grp] || resolved))
      return { name: t?.name ?? id, flag: t?.flag ?? '', faded: false }
    return { name: orig, flag: '', faded: true }
  }
  return { name: t?.name ?? id, flag: t?.flag ?? '', faded: false }
}

export function BracketPage() {
  const { t } = useLang()
  const { data: bracket } = useJson<BracketData>('/data/bracket.json')
  const { data: teamData } = useJson<{ teams: { id: string; name: string; flag: string }[] }>('/data/teams.json')
  const { data: matches } = useJson<{ group?: string; score1?: number; stage: string }[]>('/data/matches.json')
  const { data: viutvData } = useJson<{ matchId: number }[]>('/data/viutv.json')
  const viutvIds = new Set((viutvData ?? []).map((v: any) => v.matchId))
  const teamMap = new Map(teamData?.teams.map(t => [t.id, t]) ?? [])
  const scrollRef = useRef<HTMLDivElement>(null)

  const groupsComplete: Record<string, boolean> = {}
  if (matches) {
    for (const letter of 'ABCDEFGHIJKL') {
      const gms = matches.filter(m => m.group === letter && m.stage === 'group')
      groupsComplete[letter] = gms.length > 0 && gms.every(m => m.score1 !== undefined)
    }
  }

  const rounds = bracket?.rounds ?? {}

  // Build slot arrays: each round has TREE_ROWS[phase] slots, matches placed every N slots
  function buildSlots(phase: string, all: BracketMatch[]) {
    const total = TREE_ROWS[phase] || 0
    const out: (BracketMatch|null)[] = new Array(total).fill(null)
    const step = all.length > 0 ? total / all.length : 1
    for (let i = 0; i < all.length; i++) out[Math.round(i * step)] = all[i]
    return out
  }

  const slots: Record<string, (BracketMatch|null)[]> = {}
  for (const ph of KNOCKOUT_ROUNDS) {
    const ms = rounds[ph] ?? []
    slots[ph] = buildSlots(ph, [...ms].sort((a, b) => a.matchId - b.matchId))
  }

  return (
    <div>
      <style>{`
        .btr-slot{position:relative}
        .btr-slot::after{content:'';position:absolute;z-index:1;right:-${GAP_PX}px;top:50%;width:${GAP_PX}px;height:2px;background:var(--border);pointer-events:none}
        .btr-slot.even::before{content:'';position:absolute;z-index:1;right:-${GAP_PX}px;bottom:50%;width:${GAP_PX}px;height:calc(50% + 1px);border-right:2px solid var(--border);border-top:2px solid var(--border);border-radius:0 3px 0 0;background:transparent;pointer-events:none}
        .btr-slot.odd::before{content:'';position:absolute;z-index:1;right:-${GAP_PX}px;top:50%;width:${GAP_PX}px;height:calc(50% + 1px);border-right:2px solid var(--border);border-bottom:2px solid var(--border);border-radius:0 0 3px 0;background:transparent;pointer-events:none}
        .btr-slot.last::after,.btr-slot.last::before{display:none}
      `}</style>

      <div style={{ position: 'sticky', top: '48px', zIndex: 50, background: 'var(--bg)', padding: 'var(--space-lg) 0 12px', marginTop: 'calc(-1 * var(--space-lg))' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'var(--weight-display)', marginBottom: '4px' }}>{t.bracket.title}</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          {t.bracket.desc}
        </p>
      </div>

      {/* ─── Tree ─── */}
      <div ref={scrollRef} style={{
        overflowX: 'auto', overflowY: 'hidden',
        paddingBottom: '10px',
        WebkitOverflowScrolling: 'touch',
      }}>
        <div style={{
          display: 'flex', gap: `${GAP_PX}px`,
          minWidth: '1200px',
        }}>
          {KNOCKOUT_ROUNDS.map((phase, ci) => {
            const s = slots[phase] || []
            const rows = TREE_ROWS[phase] || 1
            const isLast = ci === KNOCKOUT_ROUNDS.length - 1

            return (
              <div key={phase} style={{
                display: 'flex', flexDirection: 'column',
                flex: 1, minWidth: '200px',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 600,
                  letterSpacing: '0.4px', textTransform: 'uppercase',
                  color: 'var(--accent)', textAlign: 'center',
                  padding: '6px 0', borderBottom: '1px solid var(--border)',
                  marginBottom: '4px',
                }}>
                  {(t.round as any)[phase] || ROUND_LABELS[phase]}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateRows: `repeat(${rows}, 1fr)`,
                  flex: 1, gap: '2px', alignItems: 'center',
                }}>
                  {s.map((m, ri) => {
                    if (!m) return <div key={ri} style={{ minHeight: '38px' }} />

                    const t1d = teamDisplay(m, 1, teamMap, groupsComplete)
                    const t2d = teamDisplay(m, 2, teamMap, groupsComplete)
                    const hasScore = m.score1 !== undefined
                    const faded = t1d.faded || t2d.faded
                    // Connector class: even-indexed matches are tops of pairs, odd are bottoms
                    const isSecondOfPair = ri % 2 === 1

                    return (
                      <Link
                        key={m.matchId}
                        to={`/match/${m.matchId}`}
                        className={`btr-slot${isLast ? ' last' : ''}${isSecondOfPair ? ' odd' : ' even'}`}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '3px',
                          padding: '4px 6px', borderRadius: 'var(--radius-sm)',
                          background: 'var(--surface)', border: '1px solid var(--border)',
                          textDecoration: 'none', color: 'inherit', fontSize: '10px',
                          opacity: faded ? 0.5 : 1,
                          minHeight: '36px',
                          transition: 'border-color .15s',
                        }}
                      >
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: '7px',
                          color: 'var(--text-muted)', minWidth: '30px',
                          whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '1px', position: 'relative',
                        }}>
                          <span>{(() => { const h = toHkt(m.date, m.timeUtc); return `${h.date.slice(5)}` })()}</span>
                          {viutvIds.has(m.matchId) && <span title="ViuTV 免費直播" style={{ position: 'absolute', right: '-12px', top: '50%', transform: 'translateY(-50%)', lineHeight: 1, fontSize: '8px' }}>📺</span>}
                        </span>
                        <span style={{ flex: 1, textAlign: 'right', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '12px' }}>{t1d.flag}</span>
                          <span style={{ marginLeft: '1px', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px', display: 'inline-block', verticalAlign: 'middle' }}>{t1d.name}</span>
                        </span>
                        <span style={{
                          fontWeight: 700, fontSize: '11px', minWidth: '18px', textAlign: 'center',
                          color: hasScore ? 'var(--text)' : 'var(--text-muted)',
                        }}>
                          {hasScore ? `${m.score1}–${m.score2}` : 'v'}
                        </span>
                        <span style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70px', display: 'inline-block', verticalAlign: 'middle' }}>{t2d.name}</span>
                          <span style={{ marginLeft: '1px', fontSize: '12px' }}>{t2d.flag}</span>
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── Third place ─── */}
      {rounds.third && rounds.third.length > 0 && (() => {
        const m = rounds.third[0]
        const t1d = teamDisplay(m, 1, teamMap, groupsComplete)
        const t2d = teamDisplay(m, 2, teamMap, groupsComplete)
        const hasScore = m.score1 !== undefined
        return (
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 600,
              letterSpacing: '0.4px', textTransform: 'uppercase',
              color: 'var(--accent)', marginBottom: '6px',
            }}>
              {t.round.third}
            </div>
            <Link to={`/match/${m.matchId}`} style={{
              display: 'flex', alignItems: 'center', gap: '3px',
              padding: '4px 6px', borderRadius: 'var(--radius-sm)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              textDecoration: 'none', color: 'inherit', fontSize: '10px',
              minHeight: '36px', maxWidth: '300px',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '7px',
                color: 'var(--text-muted)', minWidth: '30px',
                whiteSpace: 'nowrap',
              }}>
                {(() => { const h = toHkt(m.date, m.timeUtc); return `${h.date.slice(5)}` })()}
              </span>
              <span style={{ flex: 1, textAlign: 'right', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: '12px' }}>{t1d.flag}</span>
                <span style={{ marginLeft: '1px', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px', display: 'inline-block', verticalAlign: 'middle' }}>{t1d.name}</span>
              </span>
              <span style={{
                fontWeight: 700, fontSize: '11px', minWidth: '18px', textAlign: 'center',
                color: hasScore ? 'var(--text)' : 'var(--text-muted)',
              }}>
                {hasScore ? `${m.score1}–${m.score2}` : 'vs'}
              </span>
              <span style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px', display: 'inline-block', verticalAlign: 'middle' }}>{t2d.name}</span>
                <span style={{ marginLeft: '1px', fontSize: '12px' }}>{t2d.flag}</span>
              </span>
            </Link>
          </div>
        )
      })()}

      {/* Footnote */}
      <div style={{
        padding: '10px 14px', borderRadius: 'var(--radius-sm)',
        background: 'var(--surface)', border: '1px solid var(--border)',
        fontSize: '11px', color: 'var(--text-muted)', marginTop: '16px',
      }}>
        {t.bracket.dimmed.split('{ex}')[0]}<code style={{ fontSize: '10px' }}>2A</code>{t.bracket.dimmed.split('{ex}')[1]}
      </div>
    </div>
  )
}
