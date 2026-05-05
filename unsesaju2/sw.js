const CACHE = 'unsesaju-v1';
const ASSETS = [
  '/', '/index.html',
  '/css/style.css',
  '/js/main.js', '/js/lunar.js', '/js/premium.js',
  '/pages/fortune.html', '/pages/input.html', '/pages/today.html',
  '/pages/premium.html', '/pages/faq.html', '/pages/chart2026.html'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('googleapis.com') || e.request.url.includes('generativelanguage')) return;
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
    if (res.ok) { const clone = res.clone(); caches.open(CACHE).then(c => c.put(e.request, clone)); }
    return res;
  }).catch(() => cached)));
});
