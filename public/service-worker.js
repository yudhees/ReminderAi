self.addEventListener('push', event => {
    const data = event.data?.json() ?? {
        title: 'Notification',
        body: 'You have a new notification'
    };

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/icon.png',
            badge: '/badge.png'
        })
    );
});

