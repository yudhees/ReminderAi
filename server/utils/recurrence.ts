import moment from 'moment-timezone'

export const RECURRENCE_OPTIONS = ['none', 'daily', 'weekly', 'monthly', 'yearly'] as const
export type Recurrence = (typeof RECURRENCE_OPTIONS)[number]

const RECURRENCE_UNITS: Record<Exclude<Recurrence, 'none'>, 'days' | 'weeks' | 'months' | 'years'> = {
    daily: 'days',
    weekly: 'weeks',
    monthly: 'months',
    yearly: 'years',
}

/** Returns a stored recurrence value ('daily' | 'weekly' | 'monthly' | 'yearly') or null for one-time reminders. */
export function normalizeRecurrence(value: unknown): Exclude<Recurrence, 'none'> | null {
    if (typeof value !== 'string') return null
    const v = value.trim().toLowerCase()
    if (v === 'none' || !(RECURRENCE_OPTIONS as readonly string[]).includes(v)) return null
    return v as Exclude<Recurrence, 'none'>
}

/**
 * Next occurrence of a recurring reminder strictly after `now`.
 * Steps are counted from `anchor` in the user's timezone, so "monthly on the 31st"
 * and daylight-saving changes keep the original wall-clock time.
 */
export function nextOccurrence(anchor: Date, recurrence: unknown, timezone?: string | null, now: Date = new Date()): Date | null {
    const r = normalizeRecurrence(recurrence)
    if (!r || !anchor || isNaN(new Date(anchor).getTime())) return null
    const tz = timezone && moment.tz.zone(timezone) ? timezone : 'UTC'
    const base = moment.tz(anchor, tz)
    const unit = RECURRENCE_UNITS[r]
    for (let step = 1; step <= 100000; step++) {
        const next = base.clone().add(step, unit)
        if (next.isAfter(now)) return next.toDate()
    }
    return null
}

export function recurrenceLabel(recurrence: unknown): string {
    const r = normalizeRecurrence(recurrence)
    return r ? r.charAt(0).toUpperCase() + r.slice(1) : ''
}
