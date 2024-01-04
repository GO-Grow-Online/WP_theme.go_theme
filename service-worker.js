const CACHE_NAME = 'cache-v1';
const urlsToCache = [
  '/',
  '/wp-content/themes/WP_theme.les_chanterelles/style.css',
  '/wp-content/themes/WP_theme.les_chanterelles/js/app.js',
  '/wp-content/themes/WP_theme.les_chanterelles/static/',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
