/**
 * Phase Detection
 * Walks phases in order (group → r32 → r16 → qf → sf → third → final),
 * checks if ALL matches in each phase have scores.
 * Returns the current active phase and completion flags.
 */
export function detectPhase(matches) {
  const phases = ['group', 'r32', 'r16', 'qf', 'sf', 'third', 'final']
  const progress = {}

  for (const phase of phases) {
    const ms = matches.filter(m => m.stage === phase)
    if (!ms.length) continue
    const played = ms.filter(m => m.score1 !== undefined).length
    const total = ms.length
    const complete = played === total
    progress[phase] = { total, played, complete }

    if (!complete) {
      return { phase, phaseComplete: false, progress, groupComplete: progress.group?.complete ?? false, allComplete: false }
    }
  }

  return { phase: 'ended', phaseComplete: true, progress, groupComplete: true, allComplete: true }
}
