// Bar Rank Service Worker
const CACHE_NAME = 'barrank-v1';
const STATIC_ASSETS = [
  '/',
  '/my-points.html',
  '/checkin.html',
  '/lounge.html',
  '/leaderboard.html',
  '/tutorial.html',
  '/css/style.css',
  '/js/config.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install — cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    }).catch(() => {
      // Don't fail install if some assets missing
    })
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fall back to cache
// API calls always go to network — only static assets get cached
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Never cache Supabase API calls
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // For HTML pages and assets — network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline — serve from cache
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // If HTML page not cached, show offline page
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return new Response(`
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <title>Bar Rank — Offline</title>
                <style>
                  * { box-sizing: border-box; margin: 0; padding: 0; }
                  body { background: #111110; color: #f0ede8; font-family: Arial, sans-serif;
                         display: flex; align-items: center; justify-content: center;
                         min-height: 100vh; text-align: center; padding: 2rem; }
                  .logo { font-size: 48px; margin-bottom: 1rem; }
                  h1 { font-size: 28px; color: #f0a500; margin-bottom: 0.75rem; }
                  p { color: #888780; font-size: 15px; line-height: 1.6; }
                </style>
              </head>
              <body>
                <div>
                  <div class="logo">📶</div>
                  <h1>You're offline</h1>
                  <p>Bar Rank needs a connection to load your score and leaderboard.<br>Connect to WiFi or cellular and try again.</p>
                </div>
              </body>
              </html>
            `, { headers: { 'Content-Type': 'text/html' } });
          }
        });
      })
  );
});
