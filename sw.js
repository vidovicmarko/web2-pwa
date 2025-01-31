const FILES_TO_CACHE = [
    "/index.html",
    "/manifest.json",
    "/styles.css",
    "/icon.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open("pwa-cache-v1").then((cache) => {
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
                    if (cache !== "pwa-cache-v1") {
                        console.log("Brišem stari cache:", cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                return caches.match("/index.html");
            });
        })
    );
});

self.addEventListener('sync', event => {
    if (event.tag === 'sync-tasks') {
        event.waitUntil(syncTasks());
    }
});

async function syncTasks() {
    const db = await openDB();
    const tx = db.transaction("tasks", "readonly");
    const store = tx.objectStore("tasks");
    const tasks = await store.getAll();

    if (tasks.length > 0) {
        for (const task of tasks) {
            await processTask(task);
            const deleteTx = db.transaction("tasks", "readwrite");
            deleteTx.objectStore("tasks").delete(task.id);
            await deleteTx.complete;
        }
    }
}




