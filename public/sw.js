// Service Worker for 세종대 융합창업연계전공 PWA
const CACHE_NAME = 'sejong-startup-v1';
const urlsToCache = [
  '/',
  '/announcements',
  '/calendar',
  '/curriculum',
  '/offline.html'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: event.data.text(),
        body: '',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png'
      };
    }
  }

  const title = data.title || '세종대 융합창업연계전공';
  const options = {
    body: data.body || '새로운 알림이 있습니다.',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-72x72.png',
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      {
        action: 'open',
        title: '열기'
      },
      {
        action: 'close',
        title: '닫기'
      }
    ],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || Math.random()
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.');

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const url = event.notification.data.url;
  event.waitUntil(
    clients.openWindow(url)
  );
});

// Background sync (for when app is offline)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  return new Promise((resolve) => {
    // Implement background sync logic here
    console.log('Background sync triggered');
    resolve();
  });
}