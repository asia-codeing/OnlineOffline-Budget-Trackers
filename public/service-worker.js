const FILES_TO_CACHE = [
  "/", 
  "/index.js",  
  "/styles.css",
  "/db.js", 
  "/manifest.json",
  "/icons/icon-192x192.png", 
  "/icons/icon-512x512.png"
];
const CACHE_NAME = "my-site-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

//Install
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Your files were pre-cached successfully!");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

//Fetch
self.addEventListener("fetch", (event) => {
  if(event.request.url.includes("/api/")) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME)
      .then(cache => {
       return fetch(event.request)
       .then(response => {
         if(response.status === 200) {
           cache.put(event.request.url, response.clone());
         }
        return response 
       })
      .catch(err => {
        return cache.match(event.request);
      });
    }).catch(err => console.log(err))
  );
  return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((response) => {
        if(response) {
          return response;
        }else if (event.request.headers.get("accept").includes("text/html")) {
          return caches.match("/");
        }
      });
    })
  );
});