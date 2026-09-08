self.addEventListener("push", (event) => {
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      tag: "Reminder",
      requireInteraction: true,
      vibrate: [200, 100, 200],
      renotify: true,
    })
  );
});