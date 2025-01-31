const CACHE_NAME = "pwa-cache-v1";
const FILES_TO_CACHE = [
    "/index.html",
    "/manifest.json",
    "/icon.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Keširam datoteke...");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log("Brišem stari cache:", cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        }).catch(() => {
            return caches.match("/index.html");
        })
    );
});

self.addEventListener('sync', event => {
    if (event.tag === 'sync-tasks') {
        event.waitUntil(syncTasks());
    }
});

async function syncTasks() {
    console.log("Sinkroniziram offline zadatke...");
    self.registration.showNotification("To-Do Sync", {
        body: "Vaši zadaci su uspješno sinkronizirani!",
        icon: "/icon.png"
    });
}

self.addEventListener("push", function (event) {
    const options = {
        body: "Dodali ste novi zadatak!",
        icon: "/icon.png",
        vibrate: [100, 50, 100]
    };
    event.waitUntil(
        self.registration.showNotification("To-Do Lista", options)
    );
});

