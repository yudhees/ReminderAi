importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js'
)

const { clientsClaim } = workbox.core

const {
  cleanupOutdatedCaches
} = workbox.precaching

const {
  registerRoute
} = workbox.routing

cleanupOutdatedCaches()

self.skipWaiting()
clientsClaim()


// Push notification
self.addEventListener('push', (event) => {
  let data = {}

  try {
    data = event.data ? event.data.json() : {}
  } catch (error) {
    console.error('Failed to parse push data:', error)
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Notification',
      {
        body: data.body || '',
        tag: 'Reminder',
        requireInteraction: true,
        vibrate: [200, 100, 200],
        renotify: true,
        icon: '/icons/web-app-manifest-192x192.png',
        badge: '/icons/favicon.png'
      }
    )
  )
})


// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((windowClients) => {

      for (const client of windowClients) {
        if ('focus' in client) {
          return client.focus()
        }
      }

      return clients.openWindow('/')
    })
  )
})