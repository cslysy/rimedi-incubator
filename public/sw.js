const CACHE_NAME = "rimedi-online-gated-v1";
const BASE_URL = new URL("./", self.location.href);
const ROOT_URL = BASE_URL.href;
const INDEX_URL = new URL("index.html", BASE_URL).href;
const AVAILABILITY_PATH = new URL("availability.json", BASE_URL).pathname;
const CORE_URLS = [
  new URL("manifest.webmanifest", BASE_URL).href,
  new URL("icons/icon.svg", BASE_URL).href
];

async function cacheApplicationShell() {
  const cache = await caches.open(CACHE_NAME);
  const indexResponse = await fetch(INDEX_URL, { cache: "no-store" });

  if (!indexResponse.ok) {
    throw new Error("Nie udało się pobrać powłoki aplikacji.");
  }

  await Promise.all([
    cache.put(ROOT_URL, indexResponse.clone()),
    cache.put(INDEX_URL, indexResponse.clone())
  ]);

  const html = await indexResponse.text();
  const referencedUrls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => new URL(match[1], INDEX_URL))
    .filter((url) => url.origin === self.location.origin)
    .map((url) => url.href);

  await cache.addAll([...new Set([...CORE_URLS, ...referencedUrls])]);
}

self.addEventListener("install", (event) => {
  event.waitUntil(cacheApplicationShell());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("rimedi-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (requestUrl.pathname === AVAILABILITY_PATH) {
    event.respondWith(fetch(event.request, { cache: "no-store" }));
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(ROOT_URL, copy));
          }
          return response;
        })
        .catch(() => caches.match(ROOT_URL))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ??
        fetch(event.request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
    )
  );
});
