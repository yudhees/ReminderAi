import { precacheAndRoute } from 'workbox-precaching'

precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('install', () => {
    console.log('[SW] INSTALL')
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    console.log('[SW] ACTIVATE')
    event.waitUntil(self.clients.claim())
})

// Long buzz pattern so a reminder feels like an alarm, not a message.
const ALARM_VIBRATION = [800, 300, 800, 300, 800, 300, 1500]

const windowClients = () => self.clients.matchAll({ type: 'window', includeUncontrolled: true })

const postToClients = async (message) => {
    const clients = await windowClients()
    clients.forEach(client => client.postMessage(message))
    return clients
}

// Tell the server to stop re-alerting this reminder. Cookies are sent, so the user stays authenticated.
const acknowledge = (reminderId) => {
    if (!reminderId || reminderId === 'reminder') return Promise.resolve()
    return fetch('/api/push/ack', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminderId }),
    }).catch(error => console.error('[SW] ack failed', error))
}

const snooze = (reminderId, minutes) => fetch('/api/chat/snooze', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId: reminderId, minutes }),
}).catch(error => console.error('[SW] snooze failed', error))

const showReminder = async (event) => {
    let data = {}
    try {
        if (event.data) data = event.data.json()
    } catch (error) {
        console.error('[SW] JSON parse error:', error)
        data = { title: 'Reminza', body: event.data?.text() || '' }
    }
    console.log('[SW] DATA:', data)

    const reminderId = data.reminderId || 'reminder'
    await self.registration.showNotification(data.title || 'Reminder', {
        body: data.body || 'You have a reminder',
        icon: data.icon || '/icons/web-app-manifest-192x192.png',
        badge: '/icons/favicon.png',
        // Same tag + renotify: each re-alert replaces the old notification but sounds and vibrates again.
        tag: reminderId,
        renotify: true,
        requireInteraction: true,
        silent: false,
        vibrate: ALARM_VIBRATION,
        timestamp: Date.now(),
        actions: [
            { action: 'snooze', title: '💤 Snooze 10 min' },
            { action: 'stop', title: '✋ Stop' },
        ],
        data: {
            reminderId,
            url: data.url || '/',
            sound: data.sound || 'alarm.mp3',
        },
    })

    // If the app is open, it plays the chosen alarm sound in a loop until stopped.
    await postToClients({
        type: 'playNotificationSound',
        sound: data.sound || 'alarm.mp3',
        reminderId,
        title: data.title || 'Reminder',
        body: data.body || '',
        ring: Boolean(data.ring),
    })
}

self.addEventListener('push', (event) => {
    console.log('[SW] PUSH RECEIVED')
    event.waitUntil(showReminder(event))
})

self.addEventListener('notificationclick', (event) => {
    const notification = event.notification
    const { reminderId, url } = notification.data || {}
    notification.close()

    if (event.action === 'snooze') {
        event.waitUntil(Promise.all([
            snooze(reminderId, 10),
            postToClients({ type: 'stopNotificationSound', reminderId }),
        ]))
        return
    }
    if (event.action === 'stop') {
        event.waitUntil(Promise.all([
            acknowledge(reminderId),
            postToClients({ type: 'stopNotificationSound', reminderId }),
        ]))
        return
    }

    // Tapping the notification itself: stop ringing and open the reminder.
    event.waitUntil((async () => {
        await acknowledge(reminderId)
        const target = new URL(url || '/', self.location.origin).href
        const clients = await windowClients()
        for (const client of clients) {
            if (client.url.startsWith(self.location.origin)) {
                client.postMessage({ type: 'stopNotificationSound', reminderId })
                if ('navigate' in client && client.url !== target) {
                    try { await client.navigate(target) } catch (e) { /* cross-origin or uncontrolled */ }
                }
                return client.focus()
            }
        }
        return self.clients.openWindow(target)
    })())
})

// Swiping the notification away also counts as "I've seen it".
self.addEventListener('notificationclose', (event) => {
    const { reminderId } = event.notification.data || {}
    event.waitUntil(acknowledge(reminderId))
})
