import moment from 'moment-timezone'

/**
 * Stored repeat values (ChatSession.recurrence):
 *   'daily' | 'weekly' | 'monthly' | 'yearly'   simple repeats
 *   'weekdays' | 'weekends'                     Mon-Fri / Sat-Sun
 *   'days:mon,wed,fri'                          picked days of the week
 *   'every:3h' | 'every:2d' | 'every:2w'        every N hours / days / weeks
 * null (or 'none') means a one-time reminder.
 */
export const RECURRENCE_OPTIONS = ['none', 'daily', 'weekly', 'monthly', 'yearly'] as const
export type Recurrence = (typeof RECURRENCE_OPTIONS)[number]

export const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAYS = [1, 2, 3, 4, 5]
const WEEKENDS = [0, 6]
const SIMPLE_UNITS = { daily: 'days', weekly: 'weeks', monthly: 'months', yearly: 'years' } as const
const EVERY_UNITS = { h: 'hours', d: 'days', w: 'weeks' } as const
const EVERY_MAX = { h: 23, d: 365, w: 52 } as const

type Every = { n: number, unit: keyof typeof EVERY_UNITS }
type Parsed =
    | { kind: 'simple', value: keyof typeof SIMPLE_UNITS }
    | { kind: 'days', days: number[] }
    | { kind: 'every', every: Every }

const dayIndex = (token: string): number => {
    const t = token.trim().toLowerCase().slice(0, 3)
    return (WEEKDAY_KEYS as readonly string[]).indexOf(t)
}

function parse(value: unknown): Parsed | null {
    if (typeof value !== 'string') return null
    const v = value.trim().toLowerCase()
    if (!v || v === 'none') return null
    if (v in SIMPLE_UNITS) return { kind: 'simple', value: v as keyof typeof SIMPLE_UNITS }
    if (v === 'weekdays') return { kind: 'days', days: WEEKDAYS }
    if (v === 'weekends') return { kind: 'days', days: WEEKENDS }
    const daysMatch = v.match(/^days?\s*[:=]\s*(.+)$/)
    if (daysMatch) {
        const days = [...new Set(daysMatch[1].split(/[\s,]+/).filter(Boolean).map(dayIndex))]
        if (!days.length || days.includes(-1)) return null
        return { kind: 'days', days: days.sort((a, b) => a - b) }
    }
    const everyMatch = v.match(/^every\s*[:=]?\s*(\d{1,3})\s*(h|hours?|d|days?|w|weeks?)$/)
    if (everyMatch) {
        const n = Number(everyMatch[1])
        const unit = everyMatch[2][0] as Every['unit']
        if (n < 1 || n > EVERY_MAX[unit]) return null
        return { kind: 'every', every: { n, unit } }
    }
    return null
}

function serialize(p: Parsed): string {
    if (p.kind === 'simple') return p.value
    if (p.kind === 'every') {
        if (p.every.n === 1 && p.every.unit === 'd') return 'daily'
        if (p.every.n === 1 && p.every.unit === 'w') return 'weekly'
        return `every:${p.every.n}${p.every.unit}`
    }
    const key = p.days.join(',')
    if (p.days.length === 7) return 'daily'
    if (key === WEEKDAYS.join(',')) return 'weekdays'
    if (key === WEEKENDS.join(',')) return 'weekends'
    return `days:${p.days.map(d => WEEKDAY_KEYS[d]).join(',')}`
}

/** Canonical stored repeat value, or null for one-time reminders and anything unrecognised. */
export function normalizeRecurrence(value: unknown): string | null {
    const p = parse(value)
    return p ? serialize(p) : null
}

/**
 * Next occurrence of a repeating reminder strictly after `now`.
 * Day-based repeats are counted from `anchor` in the user's timezone, so "monthly on the 31st"
 * and daylight-saving changes keep the original wall-clock time. Hourly repeats step in real time.
 */
export function nextOccurrence(anchor: Date, recurrence: unknown, timezone?: string | null, now: Date = new Date()): Date | null {
    const p = parse(recurrence)
    if (!p || !anchor || isNaN(new Date(anchor).getTime())) return null
    const tz = timezone && moment.tz.zone(timezone) ? timezone : 'UTC'
    const base = moment.tz(anchor, tz)
    const nowM = moment.tz(now, tz)

    // Skip ahead close to `now` so long-missed reminders don't loop for years.
    const daysBehind = Math.max(0, nowM.clone().startOf('day').diff(base.clone().startOf('day'), 'days') - 1)

    if (p.kind === 'days') {
        for (let step = Math.max(1, daysBehind); step <= daysBehind + 8; step++) {
            const next = base.clone().add(step, 'days')
            if (p.days.includes(next.day()) && next.isAfter(now)) return next.toDate()
        }
        return null
    }

    let unit: moment.unitOfTime.DurationConstructor
    let size = 1
    let start = 1
    if (p.kind === 'simple') {
        unit = SIMPLE_UNITS[p.value]
        if (unit === 'days') start = Math.max(1, daysBehind)
    } else {
        unit = EVERY_UNITS[p.every.unit]
        size = p.every.n
        const stepMs = moment.duration(size, unit).asMilliseconds()
        start = Math.max(1, Math.floor((now.getTime() - base.valueOf()) / stepMs) - 1)
    }
    for (let step = start; step <= start + 100000; step++) {
        const next = base.clone().add(step * size, unit)
        if (next.isAfter(now)) return next.toDate()
    }
    return null
}

/** Short label for lists: "Daily", "Weekdays", "Mon, Wed, Fri", "Every 3 hours". */
export function recurrenceLabel(recurrence: unknown): string {
    const p = parse(recurrence)
    if (!p) return ''
    const canonical = serialize(p)
    if (canonical === 'weekdays') return 'Weekdays'
    if (canonical === 'weekends') return 'Weekends'
    if (p.kind === 'simple' || canonical === 'daily' || canonical === 'weekly') {
        return canonical.charAt(0).toUpperCase() + canonical.slice(1)
    }
    if (p.kind === 'days') return p.days.map(d => WEEKDAY_NAMES[d]).join(', ')
    const word = EVERY_UNITS[p.every.unit].slice(0, -1)
    return `Every ${p.every.n} ${word}${p.every.n === 1 ? '' : 's'}`
}

/** Phrase for sentences: "Repeats " + "daily" / "on weekdays" / "every Mon, Wed" / "every 3 hours". */
export function recurrencePhrase(recurrence: unknown): string {
    const label = recurrenceLabel(recurrence)
    if (!label) return ''
    if (label === 'Weekdays' || label === 'Weekends') return `on ${label.toLowerCase()}`
    if (/^[A-Z][a-z]{2}(, |$)/.test(label) && !/^(Daily|Weekly|Monthly|Yearly)$/.test(label)) return `every ${label}`
    return label.startsWith('Every') ? label.charAt(0).toLowerCase() + label.slice(1) : label.toLowerCase()
}
