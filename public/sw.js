// Service worker de Fútbol App
// Estrategia: network-first para navegación (con fallback offline),
// cache-first para estáticos de Next.js e iconos.
// Deliberadamente NO cachea llamadas a Supabase: los datos de partidos,
// jugadores y goles siempre deben pedirse en vivo cuando hay conexión.

const CACHE_NAME = "futbol-app-v1";
const OFFLINE_URL = "/offline";
const PRECACHE_URLS = [OFFLINE_URL, "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Navegación entre páginas: intenta red, si falla muestra /offline
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  const url = new URL(request.url);
  const isStatic = url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/icons");

  if (isStatic) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
      )
    );
  }
  // El resto de peticiones (API de Supabase, imágenes de avatares, etc.)
  // se dejan pasar directamente a la red sin interceptar.
});
