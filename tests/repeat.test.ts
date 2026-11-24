import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseRepeat, buildRepeat, repeatLabel } from '../app/utils/repeat.ts'
import { normalizeRecurrence, recurrenceLabel } from '../server/utils/recurrence.ts'

test('repeat picker values round-trip and match the server format', () => {
    const values = ['none', 'daily', 'weekly', 'monthly', 'yearly', 'weekdays', 'weekends', 'days:mon,wed,fri', 'every:3h', 'every:2d', 'every:2w']
    for (const v of values) {
        const built = buildRepeat(parseRepeat(v))
        assert.equal(built, v)
        assert.equal(normalizeRecurrence(built), v === 'none' ? null : v)
        assert.equal(repeatLabel(v), recurrenceLabel(v))
    }
})

test('picker state edge cases', () => {
    assert.equal(buildRepeat({ mode: 'days', days: [], everyN: 2, everyUnit: 'h' }), null)
    assert.equal(buildRepeat({ mode: 'days', days: [5, 1, 1, 3], everyN: 2, everyUnit: 'h' }), 'days:mon,wed,fri')
    assert.equal(buildRepeat({ mode: 'days', days: [0, 1, 2, 3, 4, 5, 6], everyN: 2, everyUnit: 'h' }), 'daily')
    assert.equal(buildRepeat({ mode: 'every', days: [], everyN: 0, everyUnit: 'h' }), null)
    assert.equal(buildRepeat({ mode: 'every', days: [], everyN: 24, everyUnit: 'h' }), null)
    assert.equal(buildRepeat({ mode: 'every', days: [], everyN: 1, everyUnit: 'd' }), 'daily')
    assert.deepEqual(parseRepeat('none', 3).days, [3])
    assert.equal(repeatLabel(null), '')
})
