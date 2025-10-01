// Service Worker pour Magazine A SAVOIR - Version Ultra-Légère
const CACHE_NAME = 'a-savoir-magazine-v1';
const OFFLINE_URL = '/magazine-leger.html';

// Ressources à mettre en cache
const urlsToCache = [
  '/magazine-leger.html',
  '/manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('📰 A SAVOIR SW: Installation en cours...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📰 A SAVOIR SW: Cache ouvert');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('📰 A SAVOIR SW: Ressources mises en cache');
        return self.skipWaiting();
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('📰 A SAVOIR SW: Activation');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('📰 A SAVOIR SW: Suppression ancien cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Stratégie Cache First pour les ressources statiques
self.addEventListener('fetch', event => {
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Ignorer les requêtes externes
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retourner la réponse du cache
        if (response) {
          console.log('📰 A SAVOIR SW: Servi depuis le cache', event.request.url);
          return response;
        }
        
        // Cache miss - récupérer depuis le réseau
        return fetch(event.request)
          .then(response => {
            // Vérifier si la réponse est valide
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Cloner la réponse car elle ne peut être consommée qu'une fois
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
                console.log('📰 A SAVOIR SW: Ajouté au cache', event.request.url);
              });
            
            return response;
          })
          .catch(() => {
            // Erreur réseau - servir la page offline si disponible
            console.log('📰 A SAVOIR SW: Erreur réseau, tentative cache offline');
            return caches.match(OFFLINE_URL);
          });
      })
  );
});

// Gestion des messages depuis l'application
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notification de mise à jour disponible
self.addEventListener('updatefound', () => {
  console.log('📰 A SAVOIR SW: Mise à jour trouvée');
  
  // Notifier l'application qu'une mise à jour est disponible
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'UPDATE_AVAILABLE',
        message: 'Nouvelle version du magazine disponible !'
      });
    });
  });
});

// Nettoyage périodique du cache
self.addEventListener('periodicsync', event => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        const now = Date.now();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 jours
        
        return Promise.all(
          cacheNames.map(async cacheName => {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            
            return Promise.all(
              keys.map(async request => {
                const response = await cache.match(request);
                const dateHeader = response.headers.get('date');
                const cacheDate = new Date(dateHeader).getTime();
                
                if (now - cacheDate > maxAge) {
                  console.log('📰 A SAVOIR SW: Suppression cache expiré', request.url);
                  return cache.delete(request);
                }
              })
            );
          })
        );
      })
    );
  }
});