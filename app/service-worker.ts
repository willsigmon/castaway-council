/// <reference lib="webworker" />

const CACHE_NAME = "castaway-council-v1";
const urlsToCache = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener("fetch", (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("push", (event: PushEvent) => {
  const data = event.data?.json();
  const title = data?.title || "Castaway Council";
  const options: NotificationOptions = {
    body: data?.body || "You have a new notification",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: data?.tag,
    data: data?.data,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || "/")
  );
});
