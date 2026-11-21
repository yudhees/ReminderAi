import { test } from 'node:test'
import assert from 'node:assert/strict'
import { nextOccurrence, normalizeRecurrence } from '../server/utils/recurrence.ts'
test('nextOccurrence and normalizeRecurrence', () => {
    const now = new Date('2026-11-21T14:30:00Z')
    // one-time
    assert.equal(nextOccurrence(new Date('2026-11-21T14:00:00Z'), 'none', 'Asia/Kolkata', now), null)
    assert.equal(nextOccurrence(new Date('2026-11-21T14:00:00Z'), null, 'Asia/Kolkata', now), null)
    // daily, fired just now -> tomorrow same time
    assert.equal(nextOccurrence(new Date('2026-11-21T14:30:00Z'), 'daily', 'Asia/Kolkata', now)?.toISOString(), '2026-11-22T14:30:00.000Z')
    // daily, missed for 3 days -> next future one, not in the past
    assert.equal(nextOccurrence(new Date('2026-11-18T09:00:00Z'), 'daily', 'Asia/Kolkata', now)?.toISOString(), '2026-11-22T09:00:00.000Z')
    // weekly
    assert.equal(nextOccurrence(new Date('2026-11-20T03:30:00Z'), 'weekly', 'Asia/Kolkata', now)?.toISOString(), '2026-11-27T03:30:00.000Z')
    // monthly from Jan 31 keeps end of month and returns to 31st
    assert.equal(nextOccurrence(new Date('2026-01-31T10:00:00Z'), 'monthly', 'UTC', new Date('2026-02-01T00:00:00Z'))?.toISOString(), '2026-02-28T10:00:00.000Z')
    assert.equal(nextOccurrence(new Date('2026-01-31T10:00:00Z'), 'monthly', 'UTC', new Date('2026-03-01T00:00:00Z'))?.toISOString(), '2026-03-31T10:00:00.000Z')
    // yearly birthday
    assert.equal(nextOccurrence(new Date('2026-10-31T05:41:00Z'), 'yearly', 'Asia/Kolkata', now)?.toISOString(), '2027-10-31T05:41:00.000Z')
    // DST: 9am New York daily across Nov 1 2026 DST end keeps 9am local
    assert.equal(nextOccurrence(new Date('2026-10-31T13:00:00Z'), 'daily', 'America/New_York', new Date('2026-10-31T13:00:00Z'))?.toISOString(), '2026-11-01T14:00:00.000Z')
    // bad timezone falls back to UTC
    assert.equal(nextOccurrence(new Date('2026-11-21T14:30:00Z'), 'daily', 'Not/AZone', now)?.toISOString(), '2026-11-22T14:30:00.000Z')
    assert.equal(normalizeRecurrence('Weekly'), 'weekly'); assert.equal(normalizeRecurrence('hourly'), null)
})
