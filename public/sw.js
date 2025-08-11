/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
// Service Worker for Creative Energy Flow PWA
const CACHE_NAME = 'creative-energy-flow-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/static/media/logo.svg',
  '/manifest.json',
  '/favicon.ico'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
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
      })
      .catch(() => {
        // If both cache and network fail, return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification);
  
  event.notification.close();
  
  // Handle different notification actions
  if (event.action === 'open_app') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'quick_entry') {
    event.waitUntil(
      clients.openWindow('/?action=quick_entry')
    );
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification);
  // Could track analytics here
});

// Background sync for offline data storage
self.addEventListener('sync', (event) => {
  if (event.tag === 'energy-data-sync') {
    event.waitUntil(syncEnergyData());
  }
});

async function syncEnergyData() {
  // This would sync any offline data when connection is restored
  console.log('Syncing energy data...');
  // Implementation would depend on your backend API
}
