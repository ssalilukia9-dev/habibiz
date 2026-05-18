/* eslint-disable no-restricted-globals */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'New Alert', body: 'You have a new notification from Sanctuary.' };
  
  const options = {
    body: data.body,
    icon: 'https://api.dicebear.com/7.x/shapes/svg?seed=Sanctuary&backgroundColor=A855F7',
    badge: 'https://api.dicebear.com/7.x/shapes/svg?seed=Sanctuary&backgroundColor=A855F7',
    vibrate: [200, 100, 200],
    data: {
      actionUrl: data.actionUrl || '/'
    },
    actions: [
      { action: 'open', title: 'Open Sanctuary' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;

  notification.close();

  if (action === 'close') return;

  const urlToOpen = notification.data.actionUrl || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
