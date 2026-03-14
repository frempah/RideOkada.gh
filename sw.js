const CACHE = "okadaRide-v1";
const ASSETS = [
  "/OakdaRide2.gh/",
  "/OakdaRide2.gh/index.html",
  "/OakdaRide2.gh/driver.html",
  "/OakdaRide2.gh/admin.html",
  "/OakdaRide2.gh/demo.html",
  "/OakdaRide2.gh/manifest.json",
  "/OakdaRide2.gh/okada-icon.svg"
];

// Install — cache all assets
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate — clear old caches
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — serve from cache first, fallback to network
self.addEventListener("fetch", e => {
  // Skip Firebase and external requests — always fetch live
  if (e.request.url.includes("firebase") ||
      e.request.url.includes("googleapis") ||
      e.request.url.includes("wa.me") ||
      e.request.url.includes("fonts.g")) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match("/OakdaRide2.gh/index.html"));
    })
  );
});
