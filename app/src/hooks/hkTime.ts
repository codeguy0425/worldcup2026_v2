/** Convert UTC date+time to HKT (UTC+8) */
export function toHkt(date: string, timeUtc?: string): { date: string; time: string } {
  if (!timeUtc) return { date, time: '' }

  const parts = timeUtc.split(':')
  if (parts.length !== 2) return { date, time: timeUtc }

  let h = parseInt(parts[0]) + 8
  const m = parts[1]
  let d = date

  if (h >= 24) {
    h -= 24
    // Advance to next day
    const dt = new Date(date + 'T12:00:00Z')
    dt.setUTCDate(dt.getUTCDate() + 1)
    d = dt.toISOString().slice(0, 10)
  }

  return { date: d, time: `${h.toString().padStart(2, '0')}:${m}` }
}

/** Format a short HKT date for display (MM-DD) */
export function shortHkt(date: string, timeUtc?: string): string {
  return toHkt(date, timeUtc).date.slice(5)
}
