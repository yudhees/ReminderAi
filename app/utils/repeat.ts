// Repeat values as stored on a reminder (same format as server/utils/recurrence.ts):
// 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | 'weekends' | 'days:mon,wed,fri' | 'every:3h' | 'every:2d' | 'every:2w'
// 'none' / null means it does not repeat.

export const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export type EveryUnit = 'h' | 'd' | 'w'
export const EVERY_UNITS: { value: EveryUnit, label: string, max: number }[] = [
    { value: 'h', label: 'hours', max: 23 },
    { value: 'd', label: 'days', max: 365 },
    { value: 'w', label: 'weeks', max: 52 },
]

export type RepeatMode = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'yearly' | 'days' | 'every'
export interface RepeatState { mode: RepeatMode, days: number[], everyN: number, everyUnit: EveryUnit }

export const REPEAT_PRESETS: { mode: RepeatMode, label: string }[] = [
    { mode: 'none', label: 'Does not repeat' },
    { mode: 'daily', label: 'Every day' },
    { mode: 'weekdays', label: 'Weekdays (Mon–Fri)' },
    { mode: 'weekly', label: 'Every week' },
    { mode: 'monthly', label: 'Every month' },
    { mode: 'yearly', label: 'Every year' },
    { mode: 'days', label: 'Pick days' },
    { mode: 'every', label: 'Every few hours / days' },
]

/** Reads a stored value into picker state. `fallbackDay` preselects the reminder's own weekday for "Pick days". */
export function parseRepeat(value: unknown, fallbackDay = new Date().getDay()): RepeatState {
    const state: RepeatState = { mode: 'none', days: [fallbackDay], everyN: 2, everyUnit: 'h' }
    const v = typeof value === 'string' ? value.trim().toLowerCase() : ''
    if (['daily', 'weekdays', 'weekly', 'monthly', 'yearly'].includes(v)) state.mode = v as RepeatMode
    else if (v === 'weekends') { state.mode = 'days'; state.days = [0, 6] }
    else if (v.startsWith('days:')) {
        const days = v.slice(5).split(',').map(d => (DAY_KEYS as readonly string[]).indexOf(d)).filter(d => d >= 0)
        if (days.length) { state.mode = 'days'; state.days = days }
    } else {
        const m = v.match(/^every:(\d+)([hdw])$/)
        if (m) { state.mode = 'every'; state.everyN = Number(m[1]); state.everyUnit = m[2] as EveryUnit }
    }
    return state
}

/** Turns picker state into the value sent to the server, or null when it is incomplete. */
export function buildRepeat(state: RepeatState): string | null {
    switch (state.mode) {
        case 'days': {
            const days = [...new Set(state.days)].sort((a, b) => a - b)
            if (!days.length) return null
            if (days.length === 7) return 'daily'
            if (days.join() === '1,2,3,4,5') return 'weekdays'
            if (days.join() === '0,6') return 'weekends'
            return `days:${days.map(d => DAY_KEYS[d]).join(',')}`
        }
        case 'every': {
            const unit = EVERY_UNITS.find(u => u.value === state.everyUnit)
            const n = Math.floor(Number(state.everyN))
            if (!unit || !n || n < 1 || n > unit.max) return null
            if (n === 1 && unit.value === 'd') return 'daily'
            if (n === 1 && unit.value === 'w') return 'weekly'
            return `every:${n}${unit.value}`
        }
        default:
            return state.mode
    }
}

/** Short label: "Daily", "Weekdays", "Mon, Wed, Fri", "Every 3 hours". Empty when it does not repeat. */
export function repeatLabel(value: unknown): string {
    const v = typeof value === 'string' ? value.trim().toLowerCase() : ''
    if (!v || v === 'none') return ''
    if (['daily', 'weekly', 'monthly', 'yearly', 'weekdays', 'weekends'].includes(v)) return v.charAt(0).toUpperCase() + v.slice(1)
    const state = parseRepeat(v)
    if (state.mode === 'days') return [...state.days].sort((a, b) => a - b).map(d => DAY_SHORT[d]).join(', ')
    if (state.mode === 'every') {
        const word = EVERY_UNITS.find(u => u.value === state.everyUnit)!.label.slice(0, -1)
        return `Every ${state.everyN} ${word}${state.everyN === 1 ? '' : 's'}`
    }
    return ''
}
