const CACHE_NAME = 'fit-timer-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/assets/styles/styles.css',
    '/scripts/script.js',
    '/images/icon-192x192.png',  // Adicione outros ícones ou imagens usadas no site
    '/images/icon-512x512.png'
];

// Instala o Service Worker e adiciona os arquivos ao cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Abrindo o cache...');
                return cache.addAll(urlsToCache);
            })
    );
});

// Ativa o Service Worker e limpa caches antigos
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);  // Deleta caches antigos
                    }
                })
            );
        })
    );
});

// Intercepta as requisições e serve do cache ou da rede
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Se a resposta estiver no cache, retorna do cache
                if (cachedResponse) {
                    return cachedResponse;
                }
                // Caso contrário, busca da rede e coloca no cache
                return fetch(event.request).then((response) => {
                    // Verifica se a resposta é válida para cache
                    if (event.request.url.startsWith('http')) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, response.clone());
                        });
                    }
                    return response;
                });
            })
    );
});
