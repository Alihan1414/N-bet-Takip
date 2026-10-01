const CACHE_NAME = 'nobet-v2.2.0';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css?v=2.2.0',
  '/app.js?v=2.2.0',
  '/version.json',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon.svg'
];

self.addEventListener('install', (e) => {
  // Yeni sürüm geldiğinde hemen aktif ol
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
});

self.addEventListener('activate', (e) => {
  // Eski tüm önbellekleri anında temizle
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Eski önbellek temizlendi:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Network first: Her zaman önce güncel ağdan al, sadece internet yoksa önbelleğe bak
  e.respondWith(
    fetch(e.request, { cache: 'no-store' })
      .then((networkResponse) => {
        // Ağdan başarılı yanıt geldiğinde önbelleği de güncelle
        if (networkResponse && networkResponse.status === 200 && e.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone).catch(() => {});
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // İnternet kesilirse önbellekten sun
        return caches.match(e.request);
      })
  );
});

// Anında güncelleme mesajı dinleyicisi
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
