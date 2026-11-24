import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildReminderEmail, escapeHtml, formatReminderTime } from '../server/utils/reminderEmail.ts'

test('escapes the heading in the HTML but keeps it readable in text', () => {
    const { html, text, subject } = buildReminderEmail({ heading: '<script>x</script> & "y"', remindTime: new Date('2026-11-22T13:00:00Z') })
    assert.ok(!html.includes('<script>x</script>'))
    assert.ok(html.includes('&lt;script&gt;x&lt;/script&gt; &amp; &quot;y&quot;'))
    assert.ok(text.includes('<script>x</script> & "y"'))
    assert.equal(subject, '⏰ <script>x</script> & "y"')
})

test('formats the time in the reminder timezone', () => {
    const r = formatReminderTime(new Date('2026-11-22T13:00:00Z'), 'Asia/Kolkata')
    assert.equal(r.time, '6:30 PM')
    assert.equal(r.day, 'Sunday, November 22, 2026')
})

test('falls back to UTC for a missing or invalid timezone', () => {
    assert.equal(formatReminderTime(new Date('2026-11-22T13:00:00Z'), 'Not/AZone').timeZone, 'UTC')
    assert.equal(formatReminderTime(new Date('2026-11-22T13:00:00Z'), null).time, '1:00 PM')
})

test('shows the repeat label and link, and keeps subject on one line', () => {
    const { html, text, subject } = buildReminderEmail({ heading: 'Gym\nnow', remindTime: new Date(), recurrence: 'weekly', url: 'https://reminza.vercel.app/chat/abc' })
    assert.equal(subject, '⏰ Gym now')
    assert.ok(html.includes('Repeats weekly') && text.includes('Repeats weekly'))
    assert.ok(html.includes('href="https://reminza.vercel.app/chat/abc"'))
    assert.ok(!buildReminderEmail({ heading: 'a', remindTime: new Date(), recurrence: 'none' }).html.includes('Repeats'))
    assert.ok(html.includes('src="https://reminza.vercel.app/icons/web-app-manifest-192x192.png"'))
    assert.equal(escapeHtml(undefined), '')
})
