import { test } from 'node:test'
import assert from 'node:assert/strict'
import { nextOccurrence, normalizeRecurrence, recurrenceLabel, recurrencePhrase } from '../server/utils/recurrence.ts'
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

test('custom repeat values normalize to a canonical form', () => {
    assert.equal(normalizeRecurrence('Weekdays'), 'weekdays')
    assert.equal(normalizeRecurrence('days:fri,mon,wed'), 'days:mon,wed,fri')
    assert.equal(normalizeRecurrence('days: Monday, Tuesday, Wednesday, Thursday, Friday'), 'weekdays')
    assert.equal(normalizeRecurrence('days:sat,sun'), 'weekends')
    assert.equal(normalizeRecurrence('days:sun,mon,tue,wed,thu,fri,sat'), 'daily')
    assert.equal(normalizeRecurrence('every:3h'), 'every:3h')
    assert.equal(normalizeRecurrence('every 2 days'), 'every:2d')
    assert.equal(normalizeRecurrence('every:1d'), 'daily')
    assert.equal(normalizeRecurrence('every:1w'), 'weekly')
    assert.equal(normalizeRecurrence('every:0h'), null)
    assert.equal(normalizeRecurrence('every:24h'), null)
    assert.equal(normalizeRecurrence('days:funday'), null)
    assert.equal(normalizeRecurrence('none'), null)
})

test('nextOccurrence for weekdays, picked days and every N', () => {
    const tz = 'Asia/Kolkata'
    // Fri 2026-11-20 09:00 IST, weekdays -> Mon 23rd 09:00 IST
    const fri = new Date('2026-11-20T03:30:00Z')
    assert.equal(nextOccurrence(fri, 'weekdays', tz, fri)?.toISOString(), '2026-11-23T03:30:00.000Z')
    // weekends from Fri -> Sat
    assert.equal(nextOccurrence(fri, 'weekends', tz, fri)?.toISOString(), '2026-11-21T03:30:00.000Z')
    // Mon/Wed/Fri from Mon 23rd -> Wed 25th
    const mon = new Date('2026-11-23T03:30:00Z')
    assert.equal(nextOccurrence(mon, 'days:mon,wed,fri', tz, mon)?.toISOString(), '2026-11-25T03:30:00.000Z')
    // missed for a long time -> next matching day after now, keeping the time
    assert.equal(nextOccurrence(new Date('2025-01-06T03:30:00Z'), 'days:mon,wed,fri', tz, new Date('2026-11-24T12:00:00Z'))?.toISOString(), '2026-11-25T03:30:00.000Z')
    // every 3 hours
    assert.equal(nextOccurrence(mon, 'every:3h', tz, mon)?.toISOString(), '2026-11-23T06:30:00.000Z')
    assert.equal(nextOccurrence(mon, 'every:3h', tz, new Date('2026-11-24T00:00:00Z'))?.toISOString(), '2026-11-24T00:30:00.000Z')
    // every 2 days / 2 weeks
    assert.equal(nextOccurrence(mon, 'every:2d', tz, mon)?.toISOString(), '2026-11-25T03:30:00.000Z')
    assert.equal(nextOccurrence(mon, 'every:2w', tz, mon)?.toISOString(), '2026-12-07T03:30:00.000Z')
    assert.equal(nextOccurrence(new Date('2026-01-01T03:30:00Z'), 'every:2d', tz, new Date('2026-11-24T12:00:00Z'))?.toISOString(), '2026-11-25T03:30:00.000Z')
    // DST: weekdays 9am New York keeps 9am local after Nov 1
    assert.equal(nextOccurrence(new Date('2026-10-30T13:00:00Z'), 'weekdays', 'America/New_York', new Date('2026-10-30T13:00:00Z'))?.toISOString(), '2026-11-02T14:00:00.000Z')
})

test('labels and phrases', () => {
    assert.equal(recurrenceLabel('daily'), 'Daily')
    assert.equal(recurrenceLabel('weekdays'), 'Weekdays')
    assert.equal(recurrenceLabel('days:mon,wed,fri'), 'Mon, Wed, Fri')
    assert.equal(recurrenceLabel('every:3h'), 'Every 3 hours')
    assert.equal(recurrenceLabel('every:2w'), 'Every 2 weeks')
    assert.equal(recurrenceLabel(null), '')
    assert.equal(recurrencePhrase('daily'), 'daily')
    assert.equal(recurrencePhrase('weekdays'), 'on weekdays')
    assert.equal(recurrencePhrase('days:mon,wed,fri'), 'every Mon, Wed, Fri')
    assert.equal(recurrencePhrase('every:3h'), 'every 3 hours')
})
