self.addEventListener('install', () => {
    console.log('[SW] INSTALL')
})

self.addEventListener('activate', () => {
    console.log('[SW] ACTIVATE')
})

self.addEventListener('push', (event) => {
    console.log('[SW] PUSH RECEIVED')

    event.waitUntil(
        (async () => {
            let data = {}

            try {
                if (event.data) {
                    data = event.data.json()
                }
            } catch (error) {
                console.error('[SW] JSON parse error:', error)

                data = {
                    title: 'Reminza',
                    body: event.data?.text() || 'You have a reminder'
                }
            }

            console.log('[SW] DATA:', data)

            try {
                await self.registration.showNotification(
                    data.title || 'Reminder',
                    {
                        body: data.body || 'You have a reminder',
                        icon: data.icon || '/icons/web-app-manifest-192x192.png',
                        badge: '/icons/favicon.png',
                        tag: data.reminderId || 'reminder',
                        requireInteraction: true,
                    }
                )

                console.log('[SW] NOTIFICATION SUCCESS')
            } catch (error) {
                console.error('[SW] NOTIFICATION FAILED:', error)
                throw error
            }
        })()
    )
})


self.addEventListener('notificationclick', (event) => {
    event.notification.close()

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((windowClients) => {
            for (const client of windowClients) {
                if (client.url.startsWith(self.location.origin)) {
                    return client.focus()
                }
            }

            return clients.openWindow('/')
        })
    )
})