const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/css/style.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
//Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Your files were pre-cached successfully!");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
       return Promise.all(
         keyList.map(key => {
           if(key !== CACHE_NAME && key !== DATA_CACHE_NAME){
             console.log("Remove old Cache data", key);
             return cache.delete(key);
           }
         })
       );
    })
  );
 self.clients.claim();
});
 
self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then((cache) => {
          return fetch(event.request).then((response) => {
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});
