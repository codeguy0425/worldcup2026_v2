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

/** Get day of week (0=Sun..6=Sat) for a YYYY-MM-DD date */
function dayOfWeek(date: string): number {
  return new Date(date + 'T12:00:00Z').getUTCDay()
}

const DAY_NAMES_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const DAY_NAMES_ZH = ['日','一','二','三','四','五','六']

/** Format short HKT date with weekday label (e.g. "Mon 06-28" or "一 06-28") */
export function shortHktLabel(date: string, timeUtc: string | undefined, lang: 'en'|'zh'): string {
  const h = toHkt(date, timeUtc)
  const names = lang === 'zh' ? DAY_NAMES_ZH : DAY_NAMES_EN
  return `${names[dayOfWeek(h.date)]} ${h.date.slice(5)}`
}

const MONTH_NAMES_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

/** Format date for home/match page: English "Sun 28 June", Chinese "6月28日(日)" */
export function hktDateLabel(date: string, timeUtc: string | undefined, lang: 'en'|'zh'): string {
  const h = toHkt(date, timeUtc)
  const m = parseInt(h.date.slice(5, 7))
  const d = parseInt(h.date.slice(8))
  const wd = dayOfWeek(h.date)
  if (lang === 'zh') return `${m}月${d}日(${DAY_NAMES_ZH[wd]})`
  return `${DAY_NAMES_EN[wd]} ${d} ${MONTH_NAMES_EN[m - 1]}`
}

/** Format a short HKT date for display (MM-DD) */
export function shortHkt(date: string, timeUtc?: string): string {
  return toHkt(date, timeUtc).date.slice(5)
}
