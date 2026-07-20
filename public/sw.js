const SHELL_CACHE_NAME = "rimedi-online-gated-v2";
const CATALOG_CACHE_NAME = "rimedi-catalog-v1";
const BASE_URL = new URL("./", self.location.href);
const ROOT_URL = BASE_URL.href;
const INDEX_URL = new URL("index.html", BASE_URL).href;
const AVAILABILITY_PATH = new URL("availability.json", BASE_URL).pathname;
const CATALOG_MANIFEST_PATH = new URL("catalog/rpl-catalog-manifest.json", BASE_URL).pathname;
const CATALOG_DIRECTORY_PATH = new URL("catalog/", BASE_URL).pathname;
const CORE_URLS = [
  new URL("manifest.webmanifest", BASE_URL).href,
  new URL("icons/icon.svg", BASE_URL).href
];

async function cacheApplicationShell() {
  const cache = await caches.open(SHELL_CACHE_NAME);
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
            .filter(
              (key) =>
                key.startsWith("rimedi-") &&
                !key.startsWith("rimedi-catalog-") &&
                key !== SHELL_CACHE_NAME
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "RIMEDI_CATALOG_READY" || typeof event.data.catalogUrl !== "string") {
    return;
  }

  event.waitUntil(
    (async () => {
      const currentCatalogUrl = new URL(event.data.catalogUrl);

      if (
        currentCatalogUrl.origin !== self.location.origin ||
        !currentCatalogUrl.pathname.startsWith(CATALOG_DIRECTORY_PATH)
      ) {
        return;
      }

      const cache = await caches.open(CATALOG_CACHE_NAME);
      const requests = await cache.keys();

      await Promise.all(
        requests
          .filter((request) => {
            const url = new URL(request.url);
            return (
              url.pathname.startsWith(CATALOG_DIRECTORY_PATH) &&
              /^rpl-drugs\.[a-f0-9]+\.json$/.test(url.pathname.split("/").pop() ?? "") &&
              url.href !== currentCatalogUrl.href
            );
          })
          .map((request) => cache.delete(request))
      );
    })()
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

  if (
    requestUrl.pathname === AVAILABILITY_PATH ||
    requestUrl.pathname === CATALOG_MANIFEST_PATH
  ) {
    event.respondWith(fetch(event.request, { cache: "no-store" }));
    return;
  }

  if (
    requestUrl.pathname.startsWith(CATALOG_DIRECTORY_PATH) &&
    /^rpl-drugs\.[a-f0-9]+\.json$/.test(requestUrl.pathname.split("/").pop() ?? "")
  ) {
    event.respondWith(
      caches.open(CATALOG_CACHE_NAME).then(async (cache) => {
        if (event.request.cache !== "reload") {
          const cached = await cache.match(event.request);

          if (cached) {
            return cached;
          }
        }

        const response = await fetch(event.request);

        if (response.ok) {
          await cache.put(event.request, response.clone());
        }

        return response;
      })
    );
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(SHELL_CACHE_NAME).then((cache) => cache.put(ROOT_URL, copy));
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
            caches.open(SHELL_CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
    )
  );
});
