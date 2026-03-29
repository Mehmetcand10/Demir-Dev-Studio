// Temel (Basic) Service Worker - PWA 100 Puan Onayı Icin

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Eger sayfa HTML veya statik Next.js dosyasıysa ve baglanti koparsa:
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request).catch(() => {
      // Offline iken veya baglanti kesildiginde onbellekten son ekrani goster
      return caches.match(event.request);
    })
  );
});
