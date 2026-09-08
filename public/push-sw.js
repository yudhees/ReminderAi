// Push notification service worker
// This service worker is separate from the main PWA service worker
// It handles push notifications while the main SW handles caching

self.addEventListener("push", (event) => {
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      tag: "Reminder",
      requireInteraction: true,
      vibrate: [200, 100, 200],
      renotify: true,
      icon: '/icons/web-app-manifest-192x192.png',
      badge: '/icons/favicon.png'
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("/")
  );
});
