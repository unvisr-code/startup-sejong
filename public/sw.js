// Service Worker for 세종대 융합창업연계전공 PWA
const CACHE_NAME = 'sejong-startup-v4-tracking-2024-08-21';
const SW_VERSION = 'v4.0.0-tracking-fixed';

console.log(`🚀 Service Worker ${SW_VERSION} initializing...`);
const urlsToCache = [
  '/',
  '/announcements',
  '/calendar',
  '/curriculum',
  '/offline.html'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log(`📦 Service Worker ${SW_VERSION} installing...`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Failed to cache resources:', error);
        // Continue installation even if caching fails
        return Promise.resolve();
      })
  );
  
  // Force immediate activation - critical for updates
  self.skipWaiting();
  console.log(`⚡ Service Worker ${SW_VERSION} will activate immediately`);
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and cross-origin requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip caching for admin APIs - always fetch from network
  if (event.request.url.includes('/api/push/') || 
      event.request.url.includes('/admin/') ||
      event.request.url.includes('_next/static/webpack') ||
      event.request.url.includes('calculate-open-rates')) {
    event.respondWith(
      fetch(event.request)
        .catch((error) => {
          console.error('Network fetch failed for admin API:', error);
          throw error;
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }
        
        // Fetch from network with error handling
        return fetch(event.request)
          .then((networkResponse) => {
            // Cache successful responses
            if (networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone);
                })
                .catch((error) => {
                  console.warn('Failed to cache response:', error);
                });
            }
            return networkResponse;
          })
          .catch((error) => {
            console.error('Fetch failed:', error);
            // Return offline page if available
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            throw error;
          });
      })
      .catch((error) => {
        console.error('Cache match failed:', error);
        return fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('Service Worker activated');
      // Take control of all pages immediately
      return self.clients.claim();
    })
    .catch((error) => {
      console.error('Service Worker activation failed:', error);
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
      console.log('Push data:', data);
    } catch (e) {
      console.warn('Failed to parse push data as JSON, using text:', e);
      data = {
        title: event.data.text() || '세종대 융합창업연계전공',
        body: '',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png'
      };
    }
  } else {
    console.log('No push data received');
  }

  const title = data.title || '세종대 융합창업연계전공';
  
  // 미리보기와 동일한 형식으로 body 구성
  let bodyText = data.body || '새로운 알림이 있습니다.';
  
  const options = {
    body: bodyText,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-72x72.png',
    tag: data.tag || `notification-${Date.now()}`, // 각 알림이 고유하도록
    requireInteraction: data.requireInteraction || false,
    vibrate: data.vibrate || [200, 100, 200],
    silent: false, // 소리 재생
    renotify: true, // 같은 태그여도 다시 알림
    timestamp: Date.now(), // 알림 시간 표시
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
      .then(() => {
        console.log('Notification shown successfully');
      })
      .catch((error) => {
        console.error('Failed to show notification:', error);
      })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification click received');
  console.log('📋 Full notification data:', event.notification);
  console.log('📋 Notification.data:', event.notification.data);

  event.notification.close();

  if (event.action === 'close') {
    console.log('👋 User chose to close notification');
    return;
  }

  const url = event.notification.data?.url || '/';
  const notificationId = event.notification.data?.primaryKey;
  const subscriptionId = event.notification.data?.subscriptionId;

  console.log('📱 Extracted data:', { 
    notificationId, 
    subscriptionId, 
    url,
    hasNotificationId: !!notificationId,
    hasSubscriptionId: !!subscriptionId
  });

  // If we don't have required tracking data, still open the URL but log the issue
  if (!notificationId || !subscriptionId) {
    console.warn('⚠️ Missing tracking data:', { 
      notificationId: notificationId || 'MISSING', 
      subscriptionId: subscriptionId || 'MISSING' 
    });
  }

  event.waitUntil(
    Promise.all([
      // Always open the page
      clients.openWindow(url).then(() => {
        console.log('✅ Successfully opened URL:', url);
      }).catch(error => {
        console.error('❌ Failed to open URL:', error);
      }),
      
      // Track the notification open only if we have the required data
      (notificationId && subscriptionId) ? 
        // Use the origin from the service worker's location
        fetch(self.location.origin + '/api/push/track-open', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            notificationId: notificationId,
            subscriptionId: subscriptionId
          })
        })
        .then(response => {
          console.log('📊 Track-open API response status:', response.status);
          return response.json();
        })
        .then(data => {
          console.log('📊 Track-open API response data:', data);
          if (data.success) {
            console.log('✅ Successfully tracked notification open');
          } else {
            console.warn('⚠️ Track-open API returned success: false', data);
          }
        })
        .catch(error => {
          console.error('❌ Error tracking notification open:', error);
          // Don't block the user experience if tracking fails
        })
        : Promise.resolve().then(() => {
          console.warn('⚠️ Skipping tracking due to missing data');
        })
    ])
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