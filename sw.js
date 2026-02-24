// 서비스워커 - 캐시 완전 비활성화
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // 캐시 전혀 사용 안 함 - 항상 네트워크에서 직접 가져옴
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
  );
});
