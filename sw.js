const CACHE_NAME = 'fimee-hinchada-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './data.js',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@700;800;900&display=swap'
];

// Instalar e inicializar el cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activar y limpiar caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia Cache First, falling back to Network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Devuelve del cache si existe
        if (response) {
          return response;
        }
        // Si no, hace la petición a la red
        return fetch(event.request);
      })
  );
});
