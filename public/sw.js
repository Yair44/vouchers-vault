
// Service Worker for PWA functionality
const CACHE_NAME = 'vouchervault-v1';

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Only cache the root and manifest
        return cache.addAll([
          '/',
          '/manifest.json'
        ]);
      })
      .catch((error) => {
        console.error('Failed to cache during install:', error);
      })
  );
});

// Fetch event - implement runtime caching strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network and cache for future
        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response before caching
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(() => {
        // Return offline fallback if available
        return caches.match('/');
      })
  );
});

// Background sync for webhook notifications
// TODO: Implement background sync for expiry notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-expiry') {
    event.waitUntil(checkExpiryDates());
  }
});

async function checkExpiryDates() {
  // TODO: Check voucher expiry dates and send webhook notifications
  console.log('Checking expiry dates in background...');
}
