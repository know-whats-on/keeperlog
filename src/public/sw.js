const CACHE_NAME = 'keeperlog-v1';
const OFFLINE_URL = '/';

// Install event - skip waiting to activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.claim().then(() => {
      // Clear old caches
      return caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      });
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests (except maybe fonts/images if needed, but keeping it simple)
  // Also skip chrome-extension requests
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  // Strategy: Stale-While-Revalidate for resources, Network First for navigation (or Cache First for SPA structure)
  
  // For an SPA, we want to serve the index.html for navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL)
            .then((response) => {
              if (response) return response;
              // If we don't have the offline page in cache yet (rare if we visited it), try to match the request in cache
              return caches.match(event.request);
            });
        })
    );
    return;
  }

  // For other resources (JS, CSS, Images)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if found
      if (cachedResponse) {
        // Update cache in background (Stale-while-revalidate)
        fetch(event.request).then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
        }).catch(() => {}); // Eat errors on background update
        
        return cachedResponse;
      }

      // Otherwise fetch from network
      return fetch(event.request).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Cache the new resource
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      });
    })
  );
});
