const CACHE_NAME = "convertsign-v1";
const SHELL_ASSETS = ["/", "/dashboard", "/manifest.json"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

// Network-first strategy
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  // Skip chrome-extension and non-http requests
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful page navigations
        if (response.ok && event.request.mode === "navigate") {
          const clone = response.clone();
          caches
            .open(CACHE_NAME)
            .then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request)),
  );
});
