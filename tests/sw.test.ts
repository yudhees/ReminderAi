import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

// Loads app/public/sw.js into a fake service-worker global and records what it does.
const source = readFileSync(new URL('../app/public/sw.js', import.meta.url), 'utf8')
    .replace(/^import .*workbox-precaching.*$/m, '')
    .replace(/^precacheAndRoute\(.*\)$/m, '')

type Recorder = {
    listeners: Record<string, (event: any) => void>
    shown: { title: string, options: any }[]
    fetches: { url: string, body: any }[]
    posted: any[]
    opened: string[]
    focused: number
    navigated: string[]
}
let rec: Recorder
let windowClientList: any[]
let failNotifications = false

const loadWorker = () => {
    rec = { listeners: {}, shown: [], fetches: [], posted: [], opened: [], focused: 0, navigated: [] }
    const self: any = {
        location: { origin: 'https://reminza.test' },
        addEventListener: (type: string, fn: any) => { rec.listeners[type] = fn },
        skipWaiting: () => {},
        registration: {
            showNotification: async (title: string, options: any) => {
                if (failNotifications) throw new TypeError('No notification permission has been granted for this origin.')
                rec.shown.push({ title, options })
            },
        },
        clients: {
            claim: async () => {},
            matchAll: async () => windowClientList,
            openWindow: async (url: string) => { rec.opened.push(url) },
        },
    }
    const context = vm.createContext({
        self,
        console: { log() {}, error() {} },
        URL,
        JSON,
        Promise,
        Date,
        fetch: async (url: string, init: any) => { rec.fetches.push({ url, body: JSON.parse(init.body) }); return { ok: true } },
    })
    vm.runInContext(source, context)
}

// Runs a handler and waits for everything it passed to event.waitUntil.
const fire = async (type: string, event: any) => {
    const pending: Promise<any>[] = []
    rec.listeners[type]({ ...event, waitUntil: (p: Promise<any>) => pending.push(p) })
    await Promise.all(pending)
}

const pushEvent = (payload: any) => ({ data: { json: () => payload, text: () => JSON.stringify(payload) } })

const notificationEvent = (action = '', data = { reminderId: 'abc123', url: '/chat/abc123', sound: 'alarm.mp3' }) => {
    let closed = false
    return { action, notification: { data, close: () => { closed = true }, get closed() { return closed } } }
}

const makeClient = (url = 'https://reminza.test/dashboard') => ({
    url,
    messages: [] as any[],
    postMessage(m: any) { this.messages.push(m) },
    focus: async () => { rec.focused++ },
    navigate: async (u: string) => { rec.navigated.push(u) },
})

beforeEach(() => {
    windowClientList = []
    loadWorker()
})

test('push shows an alarm-style notification', async () => {
    await fire('push', pushEvent({ title: 'Reminder', body: 'Call mom', reminderId: 'abc123', sound: 'urgent_alert.mp3', url: '/chat/abc123', ring: true }))
    assert.equal(rec.shown.length, 1)
    const { title, options } = rec.shown[0]
    assert.equal(title, 'Reminder')
    assert.equal(options.body, 'Call mom')
    assert.equal(options.tag, 'abc123')
    assert.equal(options.renotify, true, 're-alerts must sound again')
    assert.equal(options.requireInteraction, true)
    assert.equal(options.silent, false)
    assert.ok(Array.isArray(options.vibrate) && options.vibrate.length >= 3, 'has a vibration pattern')
    assert.deepEqual([...options.actions.map((a: any) => a.action)], ['snooze', 'stop'])
    assert.deepEqual({ ...options.data }, { reminderId: 'abc123', url: '/chat/abc123', sound: 'urgent_alert.mp3' })
})

test('push tells an open app to play the chosen sound', async () => {
    const client = makeClient()
    windowClientList = [client]
    await fire('push', pushEvent({ title: 'Reminder', body: 'Call mom', reminderId: 'abc123', sound: 'urgent_alert.mp3', ring: true }))
    assert.equal(client.messages.length, 1)
    assert.equal(client.messages[0].type, 'playNotificationSound')
    assert.equal(client.messages[0].sound, 'urgent_alert.mp3')
    assert.equal(client.messages[0].reminderId, 'abc123')
    assert.equal(client.messages[0].body, 'Call mom')
})

test('push with a broken payload still shows a notification', async () => {
    await fire('push', { data: { json: () => { throw new Error('bad') }, text: () => 'plain text' } })
    assert.equal(rec.shown.length, 1)
    assert.equal(rec.shown[0].options.body, 'plain text')
})

test('Snooze button snoozes 10 minutes and silences the app', async () => {
    const client = makeClient()
    windowClientList = [client]
    const event = notificationEvent('snooze')
    await fire('notificationclick', event)
    assert.equal(event.notification.closed, true)
    assert.deepEqual(rec.fetches, [{ url: '/api/chat/snooze', body: { chatId: 'abc123', minutes: 10 } }])
    assert.equal(client.messages[0].type, 'stopNotificationSound')
    assert.equal(rec.opened.length, 0, 'does not open the app')
})

test('Stop button acknowledges so the server stops re-alerting', async () => {
    const event = notificationEvent('stop')
    await fire('notificationclick', event)
    assert.equal(event.notification.closed, true)
    assert.deepEqual(rec.fetches, [{ url: '/api/push/ack', body: { reminderId: 'abc123' } }])
    assert.equal(rec.opened.length, 0)
})

test('tapping the notification acknowledges and opens the reminder when the app is closed', async () => {
    await fire('notificationclick', notificationEvent(''))
    assert.deepEqual(rec.fetches, [{ url: '/api/push/ack', body: { reminderId: 'abc123' } }])
    assert.deepEqual(rec.opened, ['https://reminza.test/chat/abc123'])
})

test('tapping the notification focuses an open app and moves it to the reminder', async () => {
    const client = makeClient('https://reminza.test/dashboard')
    windowClientList = [client]
    await fire('notificationclick', notificationEvent(''))
    assert.equal(rec.focused, 1)
    assert.deepEqual(rec.navigated, ['https://reminza.test/chat/abc123'])
    assert.equal(client.messages[0].type, 'stopNotificationSound')
    assert.equal(rec.opened.length, 0)
})

test('swiping the notification away acknowledges it', async () => {
    await fire('notificationclose', notificationEvent(''))
    assert.deepEqual(rec.fetches, [{ url: '/api/push/ack', body: { reminderId: 'abc123' } }])
})

test('a notification without a reminder id does not call the server', async () => {
    await fire('notificationclose', notificationEvent('', { reminderId: 'reminder', url: '/', sound: 'alarm.mp3' }))
    assert.equal(rec.fetches.length, 0)
})

test('the open app still rings if the system notification fails', async () => {
    const client = makeClient()
    windowClientList = [client]
    // showNotification fails like it does when notification permission is missing
    await assert.rejects(async () => {
        failNotifications = true
        await fire('push', pushEvent({ title: 'Reminder', body: 'Call mom', reminderId: 'abc123' }))
    })
    failNotifications = false
    assert.equal(client.messages[0]?.type, 'playNotificationSound')
})
