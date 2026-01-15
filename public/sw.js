const CACHE_NAME = 'neurotrack-v1';
const STATIC_CACHE = 'neurotrack-static-v1';
const DYNAMIC_CACHE = 'neurotrack-dynamic-v1';

// Arquivos para cache offline
const STATIC_ASSETS = [
    '/',
    '/profile',
    '/programs',
    '/session',
    '/behaviors',
    '/reports',
    '/insights',
    '/settings',
    '/manifest.json',
];

// Install event
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[SW] Precaching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
                    .map((key) => {
                        console.log('[SW] Removing old cache:', key);
                        return caches.delete(key);
                    })
            );
        })
    );
    return self.clients.claim();
});

// Fetch event - Network First, fallback to cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith('http')) return;

    // For API requests, always go to network
    if (url.pathname.startsWith('/api')) {
        event.respondWith(
            fetch(request).catch(() => {
                return new Response(
                    JSON.stringify({ error: 'Offline - dados não disponíveis' }),
                    { headers: { 'Content-Type': 'application/json' } }
                );
            })
        );
        return;
    }

    // For page navigations, use Network First strategy
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(request).then((response) => {
                        return response || caches.match('/');
                    });
                })
        );
        return;
    }

    // For other resources, use Cache First strategy
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                // Return cached version, but also update cache in background
                fetch(request).then((response) => {
                    caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(request, response);
                    });
                });
                return cachedResponse;
            }

            return fetch(request).then((response) => {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE).then((cache) => {
                    cache.put(request, responseClone);
                });
                return response;
            });
        })
    );
});

// Background Sync for offline data
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);
    if (event.tag === 'sync-sessions') {
        event.waitUntil(syncSessions());
    }
});

async function syncSessions() {
    // Sync logic for when coming back online
    console.log('[SW] Syncing sessions...');
}

// Push notifications
self.addEventListener('push', (event) => {
    console.log('[SW] Push received:', event);

    const options = {
        body: event.data?.text() || 'Hora de uma sessão de terapia!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
        },
        actions: [
            { action: 'start', title: 'Iniciar Sessão', icon: '/icons/action-start.png' },
            { action: 'later', title: 'Depois', icon: '/icons/action-later.png' },
        ],
    };

    event.waitUntil(
        self.registration.showNotification('NeuroTrack ABA', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification click:', event.action);
    event.notification.close();

    if (event.action === 'start') {
        event.waitUntil(clients.openWindow('/session'));
    } else {
        event.waitUntil(clients.openWindow('/'));
    }
});
