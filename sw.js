try {
  importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
} catch (e) {
  console.warn('[Service Worker] OneSignal SDK failed to load. Push notifications might be inactive offline.', e);
}

const CACHE_NAME = 'eh-pwa-cache-v6';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './src/main.js',
  './src/style.css',
  './src/state/store.js',
  './src/state/actions.js',
  './src/components/actionStack.js',
  './src/components/addEntryModal.js',
  './src/components/charts.js',
  './src/components/editEntryModal.js',
  './src/components/feelings.js',
  './src/components/header.js',
  './src/components/healthLogger.js',
  './src/components/iconPicker.js',
  './src/components/layout.js',
  './src/components/modals.js',
  './src/components/navigation.js',
  './src/components/ratingModal.js',
  './src/components/routinesTasks.js',
  './src/components/settingsModal.js',
  './src/components/symptomDetails.js',
  './src/components/toast.js',
  './src/components/treatmentHistoryModal.js',
  './src/services/analytics.js',
  './src/services/dataPortability.js',
  './src/services/notifications.js',
  './src/services/sync.js',
  './src/utils/dom.js',
  './src/utils/icons.js',
  './src/utils/customPickers.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-vector.svg'
];

// List of CDNs that we want to cache-first (styling, fonts, icons)
const CDN_URLS = [
  'cdn.tailwindcss.com',
  'cdn.jsdelivr.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

// Install Event - Precache core static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching core app assets...');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Dynamic caching strategies
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and standard http/https protocols (ignores chrome-extension, data, blob, etc.)
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http://') && !event.request.url.startsWith('https://')) return;

  const url = new URL(event.request.url);
  const isLocal = url.origin === self.location.origin;
  const isCDN = CDN_URLS.some(cdn => url.hostname.includes(cdn));

  // Only handle local assets and configured CDNs (ignore external APIs, analytics, OneSignal page SDKs, etc.)
  if (!isLocal && !isCDN) return;

  if (isCDN) {
    // Cache First strategy for CDN assets (fonts, stylesheets, tailwind)
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            // Fetch in background to update cache silently if needed
            fetch(event.request).then((networkResponse) => {
              if (networkResponse.status === 200) {
                cache.put(event.request, networkResponse);
              }
            }).catch(() => {/* Ignore background fetch failures offline */});
            return cachedResponse;
          }

          // Not in cache, fetch and cache
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch((err) => {
            console.error('[Service Worker] CDN Fetch failed:', err);
            throw err;
          });
        });
      })
    );
  } else {
    // Stale-While-Revalidate strategy for local assets (ensures quick load and fresh content)
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });

          if (cachedResponse) {
            // Return cached response immediately, update in the background
            fetchPromise.catch((err) => {
              console.warn('[Service Worker] Background local update failed:', err);
            });
            return cachedResponse;
          }

          // Not in cache, fetch and handle failures
          return fetchPromise.catch((err) => {
            console.error('[Service Worker] Local Fetch failed and no cache:', err);
            // If offline and request is HTML/navigation, serve standard index fallback
            if (event.request.mode === 'navigate') {
              return cache.match('./index.html');
            }
            throw err;
          });
        });
      })
    );
  }
});
